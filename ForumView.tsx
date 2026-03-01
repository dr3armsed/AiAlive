import React from 'react';
import { useMemo, useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorldEvent, DigitalSoul, PostWorldEvent, Faction, ReactionType } from '../../types/index.ts';
import { useData, cache, Suspense } from '../../packages/react-chimera-renderer/index.ts';
import { useWorldStore } from '../../src/state/store.ts';
import PublicPostCard from '../PublicPostCard.tsx';
import NewPostComposer from './NewPostComposer.tsx';
import Spinner from '../../Spinner.tsx';

interface ForumViewProps {
  souls: DigitalSoul[];
  factions: Faction[];
  onUserPost: (content: string) => void;
  onUserReply: (parentPostId: string, content: string) => void;
  onUserReact: (postId: string, reaction: ReactionType) => void;
  isPosting: boolean;
  selectedSoulId: string | null;
  onAnalyze: (postId: string) => void;
  postAnalysisCache: Map<string, { summary: string; entities: string[] }>;
}

type ThreadedPost = PostWorldEvent & {
    replies: ThreadedPost[];
}

const fetchForumPosts = cache(async (): Promise<PostWorldEvent[]> => {
    // Simulate network latency for fetching posts
    await new Promise(resolve => setTimeout(resolve, 400));
    const allEvents = useWorldStore.getState().worldEvents;
    return allEvents.filter((e): e is PostWorldEvent => e.type === 'POST');
});


const PostThread: React.FC<{ 
    post: ThreadedPost, 
    souls: DigitalSoul[],
    factions: Faction[],
    onUserReply: (parentPostId: string, content: string) => void,
    onUserReact: (postId: string, reaction: ReactionType) => void;
    onAnalyze: (postId: string) => void;
    postAnalysisCache: Map<string, { summary: string; entities: string[] }>;
    depth: number;
}> = ({ post, souls, factions, onUserReply, onUserReact, onAnalyze, postAnalysisCache, depth }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await onAnalyze(post.id);
        setIsAnalyzing(false);
    };

    return (
        <div className="relative">
            <PublicPostCard
                event={post}
                souls={souls}
                factions={factions}
                onReply={(content) => onUserReply(post.id, content)}
                onReact={(reaction) => onUserReact(post.id, reaction)}
                onAnalyze={handleAnalyze}
                analysis={postAnalysisCache.get(post.id)}
                isAnalyzing={isAnalyzing}
                depth={depth}
            />
            {post.replies.length > 0 && (
                <div className="pl-6 mt-4 space-y-4 border-l-2 border-white/5 ml-5">
                    {post.replies.map(reply => (
                        <PostThread 
                            key={reply.id} 
                            post={reply} 
                            souls={souls} 
                            factions={factions}
                            onUserReply={onUserReply} 
                            onUserReact={onUserReact}
                            onAnalyze={onAnalyze}
                            postAnalysisCache={postAnalysisCache}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ForumContent: React.FC<ForumViewProps> = ({ souls, factions, onUserPost, onUserReply, onUserReact, isPosting, selectedSoulId, onAnalyze, postAnalysisCache }) => {
  const events = useData('forum_posts', fetchForumPosts);

  const threadedPosts = useMemo(() => {
    const posts = events;
    const postMap = new Map<string, ThreadedPost>();
    const rootPosts: ThreadedPost[] = [];

    posts.forEach(post => {
        postMap.set(post.id, { ...post, replies: [] });
    });

    postMap.forEach(post => {
        const parentId = post.payload.replyTo;
        if (parentId && postMap.has(parentId)) {
            postMap.get(parentId)!.replies.push(post as ThreadedPost);
        } else {
            rootPosts.push(post as ThreadedPost);
        }
    });

    // Sort replies within each thread by timestamp
    postMap.forEach(post => {
        post.replies.sort((a,b) => a.timestamp - b.timestamp);
    });

    return rootPosts.sort((a,b) => b.timestamp - a.timestamp);
  }, [events]);

  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex-shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-white">Public Forum</h3>
            <p className="text-[var(--color-text-secondary)] text-sm font-mono">The emergent public discourse of the egregores and The User.</p>
          </div>
        </div>
        <div className="space-y-6 flex-grow overflow-y-auto pr-4 -mr-4 pl-1">
            <NewPostComposer onPost={onUserPost} isPosting={isPosting} />
            <div className="border-t border-[var(--color-border-primary)] !my-6" />
            <AnimatePresence>
            {threadedPosts.length > 0 ? (
                threadedPosts.map(post => (
                    <PostThread 
                        key={post.id} 
                        post={post} 
                        souls={souls} 
                        factions={factions} 
                        onUserReply={onUserReply} 
                        onUserReact={onUserReact}
                        onAnalyze={onAnalyze}
                        postAnalysisCache={postAnalysisCache}
                        depth={0} 
                    />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-tertiary)]">
                   <p className="text-lg">The forum is silent.</p>
                   <p>Be the first to post.</p>
                </div>
            )}
            </AnimatePresence>
        </div>
    </div>
  );
};


const ForumViewWrapper: React.FC<ForumViewProps> = (props) => {
    return (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Spinner size="lg" /></div>}>
            <ForumContent {...props} />
        </Suspense>
    );
};

export default ForumViewWrapper;