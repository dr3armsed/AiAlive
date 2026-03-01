
import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import UserIcon from '../icons/UserIcon.tsx';
import Spinner from '../Spinner.tsx';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon.tsx';

const MotionForm = motion.form as any;
const MotionButton = motion.button as any;

interface NewPostComposerProps {
  onPost: (content: string) => void;
  isPosting: boolean;
  asReply?: boolean;
}

const NewPostComposer: React.FC<NewPostComposerProps> = ({ onPost, isPosting, asReply = false }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;
    onPost(content);
    setContent('');
  };

  return (
    <MotionForm
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface-inset)] p-4 rounded-lg flex gap-4 items-start border border-[var(--color-border-secondary)]"
        layout
    >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <UserIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow flex flex-col gap-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={asReply ? "Write your reply..." : "What's on your mind? Post to the public forum..."}
                className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-2 px-3 text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
                rows={asReply ? 2 : 3}
                disabled={isPosting}
            />
            <div className="flex justify-end">
                <MotionButton
                    type="submit"
                    disabled={!content.trim() || isPosting}
                    className="font-semibold py-2 px-5 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    whileHover={{ scale: !content.trim() || isPosting ? 1 : 1.05 }}
                    whileTap={{ scale: !content.trim() || isPosting ? 1 : 0.95 }}
                >
                    {isPosting ? <Spinner size="sm" /> : (asReply ? 'Reply' : 'Post')}
                    {!isPosting && <PaperAirplaneIcon className="w-4 h-4" />}
                </MotionButton>
            </div>
        </div>
    </MotionForm>
  );
};

export default NewPostComposer;