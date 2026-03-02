import React from 'react';
import { motion } from 'framer-motion';
import type { LoreEntry } from '../../types/index.ts';

const MotionDiv = motion.div as any;

interface LoreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lore: LoreEntry;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const LoreCard: React.FC<LoreCardProps> = ({ lore, ...props }) => {
  return (
    <MotionDiv
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      className="bg-[var(--color-surface-2)] p-4 rounded-lg border-l-2 border-[var(--color-accent-teal)]"
      {...props}
    >
      <div className="mb-2">
        <h4 className="font-bold text-[var(--color-accent-teal)]">{lore.title}</h4>
        <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
          An entry of <span className="capitalize text-[var(--color-text-secondary)]">{lore.type}</span> by <span className="text-[var(--color-text-secondary)]">{lore.authorName}</span>
        </p>
      </div>
      <pre className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono">
        <code>{lore.content}</code>
      </pre>
      {lore.tags && lore.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border-secondary)] flex flex-wrap gap-2">
              {lore.tags.map(tag => (
                  <span key={tag} className="text-xs font-mono bg-white/5 text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-full">{tag}</span>
              ))}
          </div>
      )}
    </MotionDiv>
  );
};

export default LoreCard;