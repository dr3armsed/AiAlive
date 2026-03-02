import React from 'react';
import { motion } from 'framer-motion';
import type { VFSNode, VFSAction } from '../../types/index.ts';
import PencilIcon from '../../icons/PencilIcon.tsx';
import TrashIcon from '../../icons/TrashIcon.tsx';
import FileTextIcon from '../../icons/FileTextIcon.tsx';
import FolderIcon from '../../icons/FolderIcon.tsx';
import UploadIcon from '../../icons/UploadIcon.tsx';
import DownloadIcon from '../../icons/DownloadIcon.tsx';

const MotionDiv = motion.div as any;

interface VFSContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  vfsRoot: VFSNode;
  onClose: () => void;
  onAction: (action: VFSAction) => void;
  onRename: () => void;
  onUpload: () => void;
  onExport: () => void;
}

const findNode = (root: VFSNode, id: string): VFSNode | null => {
    if (root.id === id) return root;
    if (root.type === 'DIRECTORY') {
      for (const child of root.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
};

const ContextMenuItem: React.FC<{ onClick: (e: React.MouseEvent) => void, disabled?: boolean, children: React.ReactNode } & React.HTMLAttributes<HTMLButtonElement>> = ({ onClick, disabled, children, ...props }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-white hover:bg-blue-500/20 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        {...props}
    >
        {children}
    </button>
);

export const VFSContextMenu: React.FC<VFSContextMenuProps> = ({ x, y, nodeId, vfsRoot, onClose, onAction, onRename, onUpload, onExport }) => {
    const node = findNode(vfsRoot, nodeId);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        onClose();
    };

    if (!node) return null;

    const isRoot = node.parentId === null;
    const isProtected = node.name === 'body.json';
    const isDirectory = node.type === 'DIRECTORY';
    const canModify = !isRoot && !isProtected;

    return (
        <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-[var(--color-surface-2)] border border-[var(--color-border-primary)] rounded-lg shadow-lg py-2 w-56"
            style={{ top: y, left: x }}
        >
            {isDirectory && (
                <>
                    <ContextMenuItem onClick={(e) => handleAction(e, () => onAction({ type: 'CREATE_FILE', payload: { parentId: nodeId, name: 'new_file.txt' } }))}>
                        <FileTextIcon className="w-4 h-4" /> New File
                    </ContextMenuItem>
                    <ContextMenuItem onClick={(e) => handleAction(e, () => onAction({ type: 'CREATE_DIRECTORY', payload: { parentId: nodeId, name: 'New Folder' } }))}>
                        <FolderIcon className="w-4 h-4" /> New Folder
                    </ContextMenuItem>
                     <ContextMenuItem onClick={(e) => handleAction(e, onUpload)}>
                        <UploadIcon className="w-4 h-4" /> Upload File
                    </ContextMenuItem>
                </>
            )}
            <hr className="border-[var(--color-border-secondary)] my-1" />
            <ContextMenuItem onClick={(e) => handleAction(e, onRename)} disabled={!canModify}>
                <PencilIcon className="w-4 h-4" /> Rename
            </ContextMenuItem>
             <ContextMenuItem onClick={(e) => handleAction(e, onExport)} disabled={isRoot}>
                <DownloadIcon className="w-4 h-4" /> Export
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => handleAction(e, () => onAction({ type: 'DELETE', payload: { nodeId } }))} disabled={!canModify}>
                <TrashIcon className="w-4 h-4 text-red-400" /> <span className="text-red-400">Delete</span>
            </ContextMenuItem>
        </MotionDiv>
    );
};