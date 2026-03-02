import React from 'react';
import type { VFSNode } from '../../types/index.ts';
import FolderIcon from '../../icons/FolderIcon.tsx';
import FileTextIcon from '../../icons/FileTextIcon.tsx';
import UsersIcon from '../../icons/UsersIcon.tsx';

interface NodeIconProps {
  node: VFSNode;
  className?: string;
}

const NodeIcon: React.FC<NodeIconProps> = ({ node, className="w-10 h-10" }) => {
  const isShared = node.permissions.size > 1;

  if (node.type === 'DIRECTORY') {
    return (
      <div className="relative">
        <FolderIcon className={`${className} text-blue-400`} />
        {isShared && <UsersIcon className="absolute -bottom-1 -right-1 w-5 h-5 text-purple-400 bg-[var(--color-surface-2)] rounded-full p-0.5" />}
      </div>
    );
  }

  // It's a file
  return (
    <div className="relative">
        <FileTextIcon className={`${className} text-teal-400`} />
        {isShared && <UsersIcon className="absolute -bottom-1 -right-1 w-5 h-5 text-purple-400 bg-[var(--color-surface-2)] rounded-full p-0.5" />}
    </div>
    );
};

export default NodeIcon;