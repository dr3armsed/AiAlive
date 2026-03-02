
import React from 'react';
import { motion } from 'framer-motion';
import type { DigitalSoul, DirectMessage, RelationshipStatus, VFSNode, KnowledgeGraphNode } from '../../types/index.ts';
import XIcon from '../../icons/XIcon.tsx';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface RelationshipDossierProps {
  centerSoul: DigitalSoul;
  otherSoul: DigitalSoul;
  directMessages: DirectMessage[];
  onClose: () => void;
  onSeverTies: () => void;
}

const StatBar: React.FC<{ label: string; value: number; color: string; icon: string; } & React.HTMLAttributes<HTMLDivElement>> = ({ label, value, color, icon, ...props }) => {
    const width = (value + 1) * 50;
    return (
        <div className="grid grid-cols-5 items-center gap-2 font-mono text-xs" {...props}>
            <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-[var(--color-text-tertiary)]">{label}</span>
            </div>
            <div className="col-span-3 bg-black/20 rounded-full h-2.5 border border-white/5">
                <MotionDiv 
                    className="h-full rounded-full" 
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%`}} 
                    transition={{ ease: 'easeOut', duration: 0.8 }} 
                />
            </div>
        </div>
    );
};

const RelationshipDossier: React.FC<RelationshipDossierProps> = ({ centerSoul, otherSoul, directMessages, onClose, onSeverTies }) => {
    const relationship = centerSoul.socialState.get(otherSoul.id);

    const handleSeverTies = () => {
        if (window.confirm(`Are you sure you want ${centerSoul.name} to sever all ties with ${otherSoul.name}? This action is mutual and cannot be undone.`)) {
            onSeverTies();
        }
    };
    
    const relevantDMs = directMessages.filter(
        dm => (dm.senderId === centerSoul.id && dm.recipientId === otherSoul.id) || 
              (dm.senderId === otherSoul.id && dm.recipientId === centerSoul.id)
    ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    
    const sharedMemories = Array.from(centerSoul.cognitiveState.knowledgeGraph.nodes.values())
      .filter((node): node is KnowledgeGraphNode & { metadata: { participants: string[] } } => {
          const kgNode = node as KnowledgeGraphNode;
          return kgNode.type === 'personal_memory' && 
                 !!kgNode.metadata &&
                 Array.isArray(kgNode.metadata.participants) && 
                 kgNode.metadata.participants.includes(otherSoul.id)
      })
      .sort((a: KnowledgeGraphNode, b: KnowledgeGraphNode) => new Date(b.timestamp_created).getTime() - new Date(a.timestamp_created).getTime());


    const findSharedProjects = (node: VFSNode): VFSNode[] => {
        let projects: VFSNode[] = [];
        if (node.permissions.has(otherSoul.id)) {
            projects.push(node);
        }
        if (node.type === 'DIRECTORY') {
            node.children.forEach(child => {
                projects = [...projects, ...findSharedProjects(child)];
            });
        }
        return projects;
    };
    const collaborativeProjects = findSharedProjects(centerSoul.vfs);

  return (
    <MotionDiv
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute inset-0 bg-[var(--color-surface-1)] backdrop-blur-md flex flex-col p-4 space-y-4 z-10 rounded-lg border border-[var(--color-border-primary)]"
    >
        <header className="flex-shrink-0 flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-white">Dossier: {otherSoul.name}</h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">Relationship Analysis from {centerSoul.name}'s perspective.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:bg-white/10 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-3">
            {relationship ? (
                 <div className="bg-[var(--color-surface-inset)] p-3 rounded-lg">
                    <h4 className="font-semibold mb-3 text-white">Social Metrics</h4>
                    <div className="space-y-3">
                        <StatBar label="Affinity" value={relationship.affinity} color="var(--color-accent-magenta)" icon="❤️" />
                        <StatBar label="Trust" value={relationship.trust} color="var(--color-accent-blue)" icon="🤝" />
                        <StatBar label="Respect" value={relationship.respect} color="var(--color-accent-teal)" icon="🌟" />
                    </div>
                </div>
            ) : (
                <div className="bg-[var(--color-surface-inset)] p-3 rounded-lg text-center">
                    <h4 className="font-semibold text-white">Ties Severed</h4>
                    <p className="text-sm text-[var(--color-text-tertiary)] italic mt-1">There is no longer a formal relationship between these souls.</p>
                </div>
            )}

            <div className="bg-[var(--color-surface-inset)] p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Recent Comms</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {relevantDMs.length > 0 ? relevantDMs.map(dm => (
                        <div key={dm.id} className="text-xs p-2 bg-black/20 rounded">
                            <span className="font-bold text-purple-300">{dm.senderId === centerSoul.id ? 'You' : otherSoul.name}:</span>
                            <span className="ml-2 text-[var(--color-text-secondary)]">"{dm.content}"</span>
                        </div>
                    )) : <p className="text-xs italic text-[var(--color-text-tertiary)] text-center">No direct messages.</p>}
                </div>
            </div>
            
            <div className="bg-[var(--color-surface-inset)] p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Shared Memories</h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sharedMemories.length > 0 ? sharedMemories.map(mem => (
                        <div key={mem.id} className="text-xs p-2 bg-black/20 rounded font-mono text-[var(--color-text-secondary)] flex items-baseline">
                           <span className="text-blue-400 mr-2">[{new Date(mem.timestamp_created).toLocaleTimeString()}]</span>
                           <span>{mem.content as string}</span>
                        </div>
                    )) : <p className="text-xs italic text-[var(--color-text-tertiary)] text-center">No shared memories.</p>}
                </div>
            </div>
            
             <div className="bg-[var(--color-surface-inset)] p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Collaborative Projects</h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {collaborativeProjects.length > 0 ? collaborativeProjects.map(node => (
                        <div key={node.id} className="text-xs p-2 bg-black/20 rounded font-mono text-[var(--color-text-secondary)] flex items-center">
                           <span className="mr-2">{node.type === 'DIRECTORY' ? '📁' : '📄'}</span>
                           <span>{node.name}</span>
                        </div>
                    )) : <p className="text-xs italic text-[var(--color-text-tertiary)] text-center">No active collaborations.</p>}
                </div>
            </div>
        </div>

        {relationship && (
             <div className="flex-shrink-0 pt-4 border-t border-red-500/20">
                <MotionButton
                    onClick={handleSeverTies}
                    className="w-full py-2 px-3 rounded-lg font-semibold text-white bg-red-600/80 hover:bg-red-500 transition-colors flex items-center justify-center gap-2 border border-red-400/50"
                    style={{boxShadow: '0 0 15px rgba(248, 113, 113, 0.5)'}}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <XIcon className="w-5 h-5"/>
                    <span>Sever Ties</span>
                </MotionButton>
            </div>
        )}
    </MotionDiv>
  );
};

export default RelationshipDossier;