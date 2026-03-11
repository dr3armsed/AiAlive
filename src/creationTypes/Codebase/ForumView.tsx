import React, { useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState } from './context';
import type { ForumPost } from './communication';
import ForumPostComponent from './ForumPostComponent';
import NewPostComposer from './NewPostComposer';

// Inline spinner — no Spinner component exists in this repo
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div
      className={`${dim} rounded-full border-2 border-white/10 border-t-white/60 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface ForumViewProps {
  onUserPost: (content: string) => void;
  isPosting: boolean;
}

type ThreadedPost = ForumPost & {
  replies: ThreadedPost[];
};

const PostThread: React.FC<{ post: ThreadedPost; depth: number }> = ({ post, depth }) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ForumPostComponent post={post} />
      {post.replies.length > 0 && (
        <div className="pl-6 mt-4 space-y-4 border-l-2 border-white/5 ml-5">
          {post.replies.map(reply => (
            <PostThread key={reply.id} post={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ForumContent: React.FC<ForumViewProps> = ({ onUserPost, isPosting }) => {
  const { forum_posts } = useMetacosmState();

  const threadedPosts = useMemo(() => {
    const postMap = new Map<string, ThreadedPost>();
    const rootPosts: ThreadedPost[] = [];

    forum_posts.forEach(post => {
      postMap.set(post.id, { ...post, replies: [] });
    });

    postMap.forEach(post => {
      // A reply's threadId points to a different (parent) post that exists in the map.
      const parent = postMap.get(post.threadId);
      if (parent && parent.id !== post.id) {
        parent.replies.push(post as ThreadedPost);
      } else {
        rootPosts.push(post as ThreadedPost);
      }
    });

    // Sort replies oldest-first within each thread
    postMap.forEach(post => {
      post.replies.sort((a, b) => a.timestamp - b.timestamp);
    });

    // Sort root threads newest-first
    return rootPosts.sort((a, b) => b.timestamp - a.timestamp);
  }, [forum_posts]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="text-2xl font-bold text-white">Public Forum</h3>
        <p className="text-[var(--color-text-secondary)] text-sm font-mono">
          The emergent public discourse of the egregores and The Architect.
        </p>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-4 -mr-4 pl-1">
        <NewPostComposer onPost={onUserPost} isPosting={isPosting} />
        <div className="border-t border-[var(--color-border-primary)] !my-6" />

        <AnimatePresence>
          {threadedPosts.length > 0 ? (
            threadedPosts.map(post => (
              <PostThread key={post.id} post={post} depth={0} />
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 text-center text-[var(--color-text-tertiary)]"
            >
              <p className="text-lg">The forum is silent.</p>
              <p>Be the first to post.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ForumView: React.FC<ForumViewProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ForumContent {...props} />
    </Suspense>
  );
};

export default ForumView;
