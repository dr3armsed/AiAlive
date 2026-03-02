import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { VDirectory } from '../../types/index.ts';
import ArrowSmRightIcon from '../../icons/ArrowSmRightIcon.tsx';
import NodeIcon from './NodeIcon.tsx';

const MotionDiv = motion.div as any;

interface TreeViewProps {
  root: VDirectory;
  activeDirId: string;
  setActiveDirId: (id: string) => void;
  setSelectedNodeId: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
}

const TreeViewNode: React.FC<{
    node: VDirectory,
    activeDirId: string,
    setActiveDirId: (id: string) => void,
    setSelectedNodeId: (id: string) => void,
    onContextMenu: (e: React.MouseEvent, nodeId: string) => void,
    level: number
}> = ({ node, activeDirId, setActiveDirId, setSelectedNodeId, onContextMenu, level }) => {
    const [isOpen, setIsOpen] = useState(level === 0);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveDirId(node.id);
        setSelectedNodeId(node.id);
    };

    const sortedChildren = [...node.children].sort((a,b) => {
      if(a.type !== b.type) return a.type === 'DIRECTORY' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).filter(child => child.type === 'DIRECTORY') as VDirectory[];

    return (
        <div>
            <div
                onClick={handleClick}
                onContextMenu={(e) => onContextMenu(e, node.id)}
                className={`flex items-center p-1 rounded-md cursor-pointer transition-colors ${activeDirId === node.id ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                style={{ paddingLeft: `${level * 1.25}rem` }}
            >
                <button onClick={handleToggle} className="p-0.5 rounded-sm hover:bg-white/10" disabled={sortedChildren.length === 0}>
                    <ArrowSmRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'} ${sortedChildren.length === 0 ? 'opacity-20' : ''}`} />
                </button>
                <NodeIcon node={node} className="w-5 h-5 mx-1" />
                <span className="text-sm truncate">{node.name}</span>
            </div>
            <AnimatePresence>
                {isOpen && sortedChildren.length > 0 && (
                    <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {sortedChildren.map(child => (
                            <TreeViewNode 
                                key={child.id}
                                node={child}
                                activeDirId={activeDirId}
                                setActiveDirId={setActiveDirId}
                                setSelectedNodeId={setSelectedNodeId}
                                onContextMenu={onContextMenu}
                                level={level + 1}
                            />
                        ))}
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export const VFSTreeView: React.FC<TreeViewProps> = ({ root, activeDirId, setActiveDirId, setSelectedNodeId, onContextMenu }) => {
    return (
        <TreeViewNode 
            node={root}
            activeDirId={activeDirId}
            setActiveDirId={setActiveDirId}
            setSelectedNodeId={setSelectedNodeId}
            onContextMenu={onContextMenu}
            level={0}
        />
    );
};