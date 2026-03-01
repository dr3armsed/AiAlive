
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiFile } from 'react-icons/fi';
import clsx from 'clsx';

export interface TreeNode {
    id: string;
    name: string;
    children?: TreeNode[];
    content?: { type: 'json' | 'text'; data: any };
}

interface TreeViewProps {
    node: TreeNode;
    onSelect: (node: TreeNode) => void;
    selectedNode: TreeNode | null;
    level?: number;
}

const TreeView: React.FC<TreeViewProps> = ({ node, onSelect, selectedNode, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first few levels
    const hasChildren = node.children && node.children.length > 0;
    const isFile = !!node.content;
    
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node);
        if (hasChildren) {
           setIsOpen(!isOpen);
        }
    };

    return (
        <div style={{ paddingLeft: level > 0 ? '1rem' : 0 }}>
            <div
                onClick={handleSelect}
                className={clsx(
                    "flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors",
                    selectedNode?.id === node.id ? "bg-amber-400/20 text-metacosm-accent" : "hover:bg-white/10 text-gray-300"
                )}
            >
                {hasChildren ? (
                    <FiChevronRight className={clsx("transition-transform", isOpen && "rotate-90")} />
                ) : (
                    <FiFile className="ml-1 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
            </div>
            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map(child => (
                            <TreeView key={child.id} node={child} onSelect={onSelect} selectedNode={selectedNode} level={level + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TreeView;
