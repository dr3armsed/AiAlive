
import React from 'react';
import { motion } from 'framer-motion';
import type { TreeNode } from '@/components/TreeView';

interface FileContentViewProps {
    selectedNode: TreeNode | null;
}

const FileContentView: React.FC<FileContentViewProps> = ({ selectedNode }) => {

    if (!selectedNode || !selectedNode.content) {
        return (
            <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full text-gray-500"
            >
                Select a file to view its contents.
            </motion.div>
        );
    }
    
    const renderContent = () => {
        switch(selectedNode.content?.type) {
            case 'json':
                try {
                    return <pre className="whitespace-pre-wrap text-xs text-cyan-200">{JSON.stringify(selectedNode.content.data, null, 2)}</pre>;
                } catch(e) {
                    return <p className="text-red-400">Error rendering JSON content.</p>;
                }
            case 'text':
                return <p className="whitespace-pre-wrap text-gray-300">{selectedNode.content.data}</p>;
            default:
                return <p className="text-red-400">Unknown file type.</p>;
        }
    };

    return (
        <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
        >
            <h3 className="text-lg font-display text-metacosm-accent mb-4 pb-2 border-b border-amber-400/20">{selectedNode.name}</h3>
            <div className="font-mono">
                {renderContent()}
            </div>
        </motion.div>
    );
};

export default FileContentView;