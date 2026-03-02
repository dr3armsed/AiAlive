

import React from 'react';
import { useState, useMemo, useCallback, useEffect, useRef } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { VFSNode, VDirectory, VFile, VFSAction } from '../../types/index.ts';
import FileViewer from './FileViewer.tsx';
import { VFSTreeView } from './VFSTreeView.tsx';
import { VFSContextMenu } from './VFSContextMenu.tsx';
import VFSDetailPanel from './VFSDetailPanel.tsx';
import NodeIcon from './NodeIcon.tsx';

const MotionDiv = motion.div as any;

const gridContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
  },
};


interface VFSExplorerProps {
  vfsRoot: VFSNode;
  onAction: (action: VFSAction) => void;
  onFileUpload: (parentId: string, files: File[]) => void;
  onExportNode: (nodeId: string) => void;
}

const VFSExplorer: React.FC<VFSExplorerProps> = ({ vfsRoot, onAction, onFileUpload, onExportNode }) => {
  const [activeDirId, setActiveDirId] = useState<string>(vfsRoot.id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetDirId = useRef<string | null>(null);

  const findDirRecursive = (node: VFSNode, id: string): VDirectory | null => {
    if (node.id === id && node.type === 'DIRECTORY') return node as VDirectory;
    if (node.type === 'DIRECTORY') {
      for (const child of node.children) {
        const found = findDirRecursive(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeDir = useMemo(() => findDirRecursive(vfsRoot, activeDirId), [vfsRoot, activeDirId]);

  useEffect(() => {
    // If the active directory ID is no longer valid (e.g., it was deleted),
    // reset to the root directory to prevent a crash.
    if (!findDirRecursive(vfsRoot, activeDirId)) {
        setActiveDirId(vfsRoot.id);
    }
  }, [vfsRoot, activeDirId, setActiveDirId]);

  const selectedNode = useMemo(() => {
    const findNode = (node: VFSNode, id: string): VFSNode | null => {
        if(node.id === id) return node;
        if(node.type === 'DIRECTORY') {
            for(const child of node.children) {
                const found = findNode(child, id);
                if(found) return found;
            }
        }
        return null;
    };
    return selectedNodeId ? findNode(vfsRoot, selectedNodeId) : null;
  }, [vfsRoot, selectedNodeId]);

  const handleNodeClick = (e: React.MouseEvent, node: VFSNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    if(node.type === 'DIRECTORY') {
        setActiveDirId(node.id);
    }
  };
  
  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>, nodeId: string) => {
      e.preventDefault();
      const newName = (e.currentTarget.elements.namedItem('rename-input') as HTMLInputElement).value;
      if (newName) {
          onAction({ type: 'RENAME', payload: { nodeId, newName } });
      }
      setRenamingId(null);
  }

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };
  
  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  
  const handleTriggerUpload = (nodeId: string) => {
    uploadTargetDirId.current = nodeId;
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && uploadTargetDirId.current) {
        onFileUpload(uploadTargetDirId.current, Array.from(e.target.files));
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, [closeContextMenu]);

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedId(nodeId);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDrop = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(draggedId && draggedId !== targetNodeId) {
        onAction({ type: 'MOVE', payload: { draggedId, targetId: targetNodeId }});
    }
    setDraggedId(null);
  }

  if (!vfsRoot) return <div className="text-red-400">VFS Root not available.</div>;
  if (!activeDir) {
      return <div className="text-red-400">Error: Active directory not found. Resetting...</div>;
  }
  
  const sortedChildren = [...activeDir.children].sort((a,b) => {
      if(a.type !== b.type) return a.type === 'DIRECTORY' ? -1 : 1;
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full flex flex-col p-1">
      <input type="file" multiple ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
      <div className="flex-grow grid grid-cols-12 gap-4 min-h-0">
        
        <div className="col-span-4 h-full overflow-y-auto bg-[var(--color-surface-inset)] rounded-lg p-2">
            <VFSTreeView 
                root={vfsRoot as VDirectory}
                activeDirId={activeDirId}
                setActiveDirId={setActiveDirId}
                setSelectedNodeId={setSelectedNodeId}
                onContextMenu={handleContextMenu}
            />
        </div>

        <div 
            className="col-span-8 grid grid-cols-12 gap-4 h-full min-h-0"
            onContextMenu={(e) => handleContextMenu(e, activeDirId)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e as unknown as React.DragEvent, activeDirId)}
        >
          <div className="col-span-12 flex flex-col min-h-0">
            <div 
                className="flex-grow bg-[var(--color-surface-inset)] rounded-lg p-4 overflow-y-auto"
            >
                {sortedChildren.length > 0 ? (
                <MotionDiv 
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sortedChildren.map(node => (
                        <MotionDiv
                            key={node.id}
                            layout
                            variants={gridItemVariants}
                            onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, node.id)}
                            onClick={(e: React.MouseEvent) => handleNodeClick(e, node)}
                            onDoubleClick={() => node.type === 'DIRECTORY' && setActiveDirId(node.id)}
                            draggable
                            onDragStart={((e: React.DragEvent) => handleDragStart(e, node.id)) as any}
                            onDragEnd={(() => setDraggedId(null)) as any}
                            onDrop={(e: React.DragEvent) => node.type === 'DIRECTORY' && handleDrop(e, node.id)}
                            onDragOver={(e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }}
                            className={`flex flex-col items-center justify-center text-center p-2 rounded-lg cursor-pointer aspect-square transition-all duration-200 border ${selectedNodeId === node.id ? 'bg-blue-500/20 border-blue-400' : 'border-transparent hover:bg-white/5'}`}
                        >
                            <NodeIcon node={node} />
                            {renamingId === node.id ? (
                                <form onSubmit={(e) => handleRenameSubmit(e, node.id)} className="w-full mt-2">
                                    <input
                                        type="text"
                                        name="rename-input"
                                        defaultValue={node.name}
                                        autoFocus
                                        onBlur={() => setRenamingId(null)}
                                        className="w-full text-xs text-center bg-gray-900 border border-blue-400 rounded"
                                        onClick={e => e.stopPropagation()}
                                    />
                                </form>
                            ) : (
                                <p className="text-xs text-white break-all mt-2">{node.name}</p>
                            )}
                        </MotionDiv>
                    ))}
                </MotionDiv>
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">This directory is empty.</div>
                )}
            </div>
          </div>

          <div className="col-span-12">
            <AnimatePresence>
                {selectedNode && (
                  <MotionDiv 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {selectedNode.type === 'FILE' ? <FileViewer file={selectedNode as VFile} /> : <VFSDetailPanel node={selectedNode} />}
                  </MotionDiv>
                )}
            </AnimatePresence>
          </div>

        </div>

        <AnimatePresence>
            {contextMenu && (
                <VFSContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    nodeId={contextMenu.nodeId}
                    vfsRoot={vfsRoot}
                    onClose={closeContextMenu}
                    onAction={onAction}
                    onRename={() => setRenamingId(contextMenu.nodeId)}
                    onUpload={() => handleTriggerUpload(contextMenu.nodeId)}
                    onExport={() => onExportNode(contextMenu.nodeId)}
                />
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VFSExplorer;