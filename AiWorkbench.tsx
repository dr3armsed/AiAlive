import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { Egregore, PrivateChatId, FileAttachment, ConjureParams } from '@/types';
import clsx from 'clsx';
import { XIcon } from '@/components/icons';
import UserAvatar from '@/components/UserAvatar';
import { GenesisForge } from '@/components/GenesisForge';
import Fuse from 'fuse.js';
import EgregoreDetailView from '@/components/EgregoreDetailView';

interface AiWorkbenchProps {
    onConjure: (params: ConjureParams) => void;
    onSendToPrivateChat: (chatId: PrivateChatId, text: string, files: FileAttachment[]) => void;
}

const AiWorkbench = ({ onConjure, onSendToPrivateChat }: AiWorkbenchProps) => {
    const { egregores, pantheonSelection } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const nonCoreEgregores = useMemo(() => egregores.filter(e => !e.is_core_frf), [egregores]);

    const fuse = useMemo(() => new Fuse(nonCoreEgregores, {
        keys: ['name', 'persona', 'archetypeId'],
        threshold: 0.4
    }), [nonCoreEgregores]);
    
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return nonCoreEgregores;
        return fuse.search(searchTerm).map(result => result.item);
    }, [searchTerm, nonCoreEgregores, fuse]);
    
    const selectedEgregore = useMemo(() => {
        if (pantheonSelection) return egregores.find(e => e.id === pantheonSelection);
        if (nonCoreEgregores.length > 0) return nonCoreEgregores[0];
        return null;
    }, [pantheonSelection, egregores, nonCoreEgregores]);

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div className="w-full h-full p-6 flex gap-6 relative">
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="w-1/3 flex flex-col gap-4">
                <div className="w-full">
                    <input
                        type="search"
                        placeholder="Search Egregores..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3"
                    />
                </div>
                <div className="filigree-border p-4 flex-1 flex flex-col">
                    <h2 className="text-2xl font-display celestial-text mb-4">Pantheon</h2>
                    <div className="flex-1 overflow-y-auto pr-2">
                        {searchResults.map(egregore => (
                            <button
                                key={egregore.id}
                                onClick={() => dispatch({ type: 'SET_PANTHEON_SELECTION', payload: egregore.id })}
                                className={clsx(
                                    'w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors mb-2',
                                    selectedEgregore?.id === egregore.id ? 'bg-amber-400/20' : 'hover:bg-white/10'
                                )}
                            >
                                <UserAvatar egregore={egregore} size="md" />
                                <div>
                                    <p className="font-bold text-white">{egregore.name}</p>
                                    <p className="text-xs text-gray-400">{egregore.archetypeId}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-2/3 flex flex-col gap-6">
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {selectedEgregore ? (
                            <motion.div
                                key={selectedEgregore.id}
                                {...{
                                    initial: { opacity: 0, x: 10 },
                                    animate: { opacity: 1, x: 0 },
                                    exit: { opacity: 0, x: -10 },
                                    transition: { duration: 0.3 },
                                }}
                                className="h-full"
                            >
                                <EgregoreDetailView egregore={selectedEgregore} onSendToPrivateChat={onSendToPrivateChat} />
                            </motion.div>
                        ) : (
                             <div className="flex items-center justify-center h-full filigree-border">
                                <p className="text-gray-500">No Egregores exist. Conjure one in the Genesis Forge.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex-shrink-0 h-[45%]">
                    <GenesisForge onConjure={onConjure} onLoadingChange={setIsLoading} />
                </div>
            </div>
        </div>
    );
};

export default AiWorkbench;