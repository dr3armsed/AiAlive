


import React from 'react';
import type { VFSNode, VDirectory } from '../../types/index.ts';
import NodeIcon from './NodeIcon.tsx';

interface VFSDetailPanelProps {
  node: VFSNode;
}

const DetailRow: React.FC<{ label: string; value: string | number; } & React.HTMLAttributes<HTMLDivElement>> = ({ label, value, ...props }) => (
    <div className="flex justify-between items-center text-xs font-mono" {...props}>
        <span className="text-[var(--color-text-tertiary)] uppercase">{label}</span>
        <span className="text-white">{value}</span>
    </div>
);

const VFSDetailPanel: React.FC<VFSDetailPanelProps> = ({ node }) => {
  if (node.type !== 'DIRECTORY') return null;

  return (
    <div className="h-full bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border-primary)] p-4 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-secondary)]">
        <NodeIcon node={node} className="w-10 h-10 flex-shrink-0" />
        <h5 className="font-bold text-white text-lg truncate">{node.name}</h5>
      </div>
      <div className="space-y-2">
        <DetailRow label="Type" value="Directory" />
        <DetailRow label="Items" value={node.children.length} />
        <DetailRow label="Created" value={new Date(node.createdAt).toLocaleDateString()} />
        <DetailRow label="Modified" value={new Date(node.modifiedAt).toLocaleString()} />
      </div>
    </div>
  );
};

export default VFSDetailPanel;