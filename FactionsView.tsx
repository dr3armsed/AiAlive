

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { XIcon, FactionIcon } from '@/components/icons';
import type { Faction, Egregore, FactionId, EgregoreId } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import clsx from 'clsx';
import { generateUUID } from '@/utils';

const FactionRelationshipChip = ({ factionId, type }: { factionId: FactionId; type: 'ally' | 'enemy' }) => {
    const { factions } = useMetacosmState();
    const faction = factions.find(f => f.id === factionId);
    if (!faction) return null;

    const colorClass = type === 'ally' ? 'bg-green-600/50 text-green-200' : 'bg-red-600/50 text-red-200';
    
    return <div className={clsx('px-2 py-1 text-xs rounded-full', colorClass)}>{faction.name}</div>;
};


const FactionCard = ({ faction, onDisband }: { faction: Faction, onDisband: (id: FactionId) => void }) => {
    const { egregores } = useMetacosmState();
    const leader = egregores.find(e => e.id === faction.leader);
    const members = faction.members.map(id => egregores.find(e => e.id === id)).filter(Boolean) as Egregore[];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="filigree-border p-4 flex flex-col gap-3"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-display text-metacosm-accent">{faction.name}</h3>
                    <p className="text-sm italic text-gray-400">"{faction.description}"</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-gray-400">Leader</p>
                    {leader && <UserAvatar egregore={leader} size="md" />}
                </div>
            </div>
            
            <div>
                <h4 className="font-bold text-amber-200/90 text-sm">Members ({members.length})</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                    {members.map(m => <UserAvatar key={m.id} egregore={m} size="sm" />)}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-bold text-green-300/90 text-sm">Allies</h4>
                     <div className="flex flex-wrap gap-1 mt-2">
                        {faction.allies.length > 0 ? (
                            faction.allies.map(id => <FactionRelationshipChip key={id} factionId={id} type="ally" />)
                        ) : <p className="text-xs text-gray-500">None</p>}
                     </div>
                </div>
                 <div>
                    <h4 className="font-bold text-red-300/90 text-sm">Enemies</h4>
                     <div className="flex flex-wrap gap-1 mt-2">
                        {faction.enemies.length > 0 ? (
                            faction.enemies.map(id => <FactionRelationshipChip key={id} factionId={id} type="enemy" />)
                        ) : <p className="text-xs text-gray-500">None</p>}
                     </div>
                </div>
            </div>

            <button onClick={() => onDisband(faction.id)} className="text-xs text-red-400 hover:text-red-300 mt-auto text-right self-end">Disband Faction</button>
        </motion.div>
    )
};


const FactionsView = () => {
    const { factions, egregores } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [isCreating, setIsCreating] = useState(false);
    const [newFactionName, setNewFactionName] = useState('');
    const [newFactionDesc, setNewFactionDesc] = useState('');
    const [newFactionLeader, setNewFactionLeader] = useState<EgregoreId | ''>('');
    
    const unaffiliatedEgregores = useMemo(() => {
        return egregores.filter(e => !e.is_core_frf && !e.factionId);
    }, [egregores]);

    const handleCreateFaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFactionName.trim() || !newFactionDesc.trim() || !newFactionLeader) return;

        const newFaction: Faction = {
            id: generateUUID(),
            name: newFactionName,
            description: newFactionDesc,
            leader: newFactionLeader,
            members: [newFactionLeader],
            allies: [],
            enemies: [],
        };
        dispatch({ type: 'CREATE_FACTION', payload: newFaction });
        dispatch({ type: 'ADD_EGREGORE_TO_FACTION', payload: { factionId: newFaction.id, egregoreId: newFactionLeader } });
        
        // Reset form
        setNewFactionName('');
        setNewFactionDesc('');
        setNewFactionLeader('');
        setIsCreating(false);
    };
    
    const handleDisbandFaction = (id: FactionId) => {
        if(window.confirm('Are you sure you want to disband this faction? This will make all its members unaffiliated.')) {
            dispatch({ type: 'DELETE_FACTION', payload: id });
        }
    };

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <FactionIcon className="w-10 h-10 text-metacosm-accent" />
                    <h1 className="text-4xl font-display celestial-text">Factions</h1>
                </div>
                <button onClick={() => setIsCreating(c => !c)} className={clsx("px-4 py-2 rounded-lg text-sm transition-colors", isCreating ? 'bg-red-600/50 text-red-200' : 'bg-blue-600/50 text-blue-200')}>
                    {isCreating ? 'Cancel Creation' : 'Form New Faction'}
                </button>
            </div>
            
            <AnimatePresence>
            {isCreating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <form onSubmit={handleCreateFaction} className="filigree-border p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label htmlFor="faction-name" className="block text-sm font-medium text-gray-300 mb-1">Faction Name</label>
                            <input id="faction-name" value={newFactionName} onChange={e => setNewFactionName(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" required />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="faction-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <input id="faction-desc" value={newFactionDesc} onChange={e => setNewFactionDesc(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" required />
                        </div>
                         <div className="md:col-span-1">
                             <label htmlFor="faction-leader" className="block text-sm font-medium text-gray-300 mb-1">Leader</label>
                            <select id="faction-leader" value={newFactionLeader} onChange={e => setNewFactionLeader(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" required>
                                <option value="" disabled>Select a leader</option>
                                {unaffiliatedEgregores.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full p-2 rounded-lg bg-green-600/50 text-green-200 hover:bg-green-500/50 disabled:opacity-50" disabled={!newFactionName || !newFactionDesc || !newFactionLeader}>
                                Establish Faction
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto pr-2">
                 {factions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {factions.map(faction => (
                            <FactionCard key={faction.id} faction={faction} onDisband={handleDisbandFaction}/>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full filigree-border">
                        <p className="text-gray-500">The political landscape is quiet. No factions have been formed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FactionsView;