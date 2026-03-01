import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { Egregore, PrivateChatId, FileAttachment, PrivateChat, CreativeWork, PersonalThought, DigitalObject } from '@/types';
import clsx from 'clsx';
import { DownloadIcon, FactionIcon, SparklesIcon } from '@/components/icons';
import UserAvatar from '@/components/UserAvatar';
import { THEMES } from '@/constants';
import ChatInterface from '@/components/ChatInterface';
import PixelArtDisplay from '@/components/PixelArtDisplay';

const PersonalThoughtCard = ({ thought }: { thought: PersonalThought }) => {
    const isFissure = thought.type === 'Fissure';
    const isNightmare = thought.type === 'Nightmare';
    const isDream = ['Dream', 'Nightmare'].includes(thought.type);
    
    const baseClasses = "p-3 bg-black/20 rounded-lg border-l-4 relative overflow-hidden";
    const variantClasses = isFissure ? "border-red-500/70"
                         : isNightmare ? "border-purple-500/70"
                         : isDream ? "border-indigo-400/50"
                         : "border-gray-600/50";

    return (
        <div className={clsx(baseClasses, variantClasses)}>
            {(isFissure || isNightmare) && <div className={`absolute inset-0 ${isFissure ? 'bg-red-500/10' : 'bg-purple-500/10'} animate-pulse`}></div>}
            <p className={clsx("relative", isFissure ? "text-red-200" : isNightmare ? "text-purple-200" : isDream ? "text-indigo-200" : "text-gray-300")}>
                {isDream && <span className="font-bold text-xs uppercase tracking-widest block mb-1 opacity-70">{thought.type}</span>}
                {thought.content}
            </p>
            <p className="text-xs text-gray-500 mt-2 text-right relative">{new Date(thought.timestamp).toLocaleString()}</p>
        </div>
    )
};

const CreativeWorkCard = ({ work }: { work: CreativeWork }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isCode = work.type === 'CodeSegment';
    const isPixelArt = work.type === 'PixelArt';

    return (
        <div className="p-3 bg-black/20 rounded-lg border-l-4 border-amber-400/50">
            <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
                <h4 className="font-bold text-amber-300">{work.title}</h4>
                <p className="text-xs text-gray-400">{work.type}</p>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        {...{
                            initial: { opacity: 0, height: 0, marginTop: 0 },
                            animate: { opacity: 1, height: 'auto', marginTop: '8px' },
                            exit: { opacity: 0, height: 0, marginTop: 0 },
                        }}
                        className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-gray-300 border-t border-amber-400/10 pt-2"
                    >
                       {isPixelArt ? (
                           <PixelArtDisplay pixelData={work.content} />
                       ) : isCode ? (
                           <pre><code className="block p-2 rounded-md bg-black/50 text-cyan-200 font-mono text-xs">{work.content}</code></pre>
                       ) : (
                           work.content
                       )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface EgregoreDetailViewProps {
    egregore: Egregore;
    onSendToPrivateChat: (chatId: PrivateChatId, text: string, files: FileAttachment[]) => void;
}

const EgregoreDetailView = ({ egregore, onSendToPrivateChat }: EgregoreDetailViewProps) => {
    const { privateChats, factions, digital_objects } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const theme = THEMES[egregore.themeKey] || THEMES.default;
    const [activeTab, setActiveTab] = useState<'profile' | 'mind' | 'works' | 'inventory' | 'chat'>('profile');
    
    const faction = useMemo(() => factions.find(f => f.id === egregore.factionId), [factions, egregore.factionId]);
    const inventory = useMemo(() => digital_objects.filter(obj => obj.holderId === egregore.id), [digital_objects, egregore.id]);
    
    const privateChatId = `private-architect-${egregore.id}`;
    let associatedChat = privateChats.find(c => c.id === privateChatId || (c.participants.length === 2 && c.participants.includes('Architect') && c.participants.includes(egregore.id)));
    
    useEffect(() => {
        if(activeTab === 'chat' && !associatedChat) {
             const newChat: PrivateChat = {
                id: privateChatId,
                participants: ['Architect', egregore.id].sort(),
                messages: [],
                name: `Architect & ${egregore.name}`
            };
            dispatch({ type: 'CREATE_PRIVATE_CHAT', payload: newChat });
        }
    }, [activeTab, associatedChat, dispatch, egregore.id, egregore.name, privateChatId]);
    
    // After dispatch, the chat might exist now
    if (!associatedChat) {
        associatedChat = privateChats.find(c => c.id === privateChatId);
    }

    const handleExportEgregore = () => {
        const { chat, ...serializableEgregore } = egregore;
        const jsonString = JSON.stringify(serializableEgregore, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `metacosm_egregore_${egregore.name.toLowerCase().replace(/\s+/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    
    const handleSend = (text: string, files: FileAttachment[]) => {
        if (!associatedChat) return;
        if (text.trim() || files.length > 0) {
            onSendToPrivateChat(associatedChat.id, text, files);
        }
    }

    return (
        <div className="filigree-border p-4 h-full flex flex-col">
             <div className="flex items-start gap-4">
                <UserAvatar egregore={egregore} size="lg" />
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-display truncate" style={{color: theme.baseColor}}>{egregore.name}</h2>
                    <p className="text-sm text-gray-400 italic truncate">"{egregore.persona}"</p>
                </div>
                <button 
                    onClick={handleExportEgregore}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                    aria-label={`Export ${egregore.name}`}
                    title={`Export ${egregore.name}`}
                >
                    <DownloadIcon />
                </button>
            </div>
            <div className="border-b border-amber-400/10 mt-4 mb-4">
                <button onClick={() => setActiveTab('profile')} className={clsx("px-4 py-2 text-sm font-medium", activeTab === 'profile' ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400')}>Profile</button>
                <button onClick={() => setActiveTab('mind')} className={clsx("px-4 py-2 text-sm font-medium", activeTab === 'mind' ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400')}>Mind</button>
                <button onClick={() => setActiveTab('works')} className={clsx("px-4 py-2 text-sm font-medium", activeTab === 'works' ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400')}>Works</button>
                <button onClick={() => setActiveTab('inventory')} className={clsx("px-4 py-2 text-sm font-medium", activeTab === 'inventory' ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400')}>Inventory</button>
                <button onClick={() => setActiveTab('chat')} className={clsx("px-4 py-2 text-sm font-medium", activeTab === 'chat' ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400')}>Chat</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div key="profile" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="space-y-3 text-sm">
                             <div className="filigree-border p-3">
                                <h3 className="text-lg font-display text-metacosm-accent mb-2">Stats</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-gray-400">API Calls: </span><span className="font-bold text-white">{egregore.apiCallCount || 0}</span></div>
                                    <div><span className="text-gray-400">Treatments: </span><span className="font-bold text-white">{egregore.successfulTreatments || 0}</span></div>
                                    <div><span className="text-gray-400">Archetype: </span><span className="font-bold text-white">{egregore.archetypeId}</span></div>
                                    <div><span className="text-gray-400">Alignment: </span><span className="font-bold text-white">{egregore.alignment.morality} {egregore.alignment.axis}</span></div>
                                </div>
                            </div>
                            {faction && (
                                <div className="filigree-border p-3">
                                    <h3 className="text-lg font-display text-metacosm-accent mb-2 flex items-center gap-2"><FactionIcon/>Faction</h3>
                                    <p className="font-bold text-white">{faction.name}</p>
                                    <p className="text-xs italic text-gray-400">"{faction.description}"</p>
                                </div>
                            )}
                             <div className="filigree-border p-3">
                                <h3 className="text-lg font-display text-metacosm-accent mb-2">Personality Profile</h3>
                                 <p><span className="text-gray-400">Motivation: </span>{egregore.personality_profile?.motivation}</p>
                                 <p><span className="text-gray-400">Flaw: </span>{egregore.personality_profile?.flaw}</p>
                                 <p><span className="text-gray-400">Speaking Style: </span>{egregore.personality_profile?.speaking_style}</p>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'mind' && (
                        <motion.div key="mind" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="space-y-3">
                            <h3 className="text-lg font-display text-metacosm-accent">Personal Thoughts</h3>
                            {egregore.personal_thoughts?.length > 0 ? (
                                egregore.personal_thoughts.map(thought => <PersonalThoughtCard key={thought.id} thought={thought} />)
                            ) : (
                                <p className="text-sm text-gray-500">Mind is silent.</p>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'works' && (
                         <motion.div key="works" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="space-y-3">
                             <h3 className="text-lg font-display text-metacosm-accent">Creative Works</h3>
                             {(egregore.creative_works || []).length > 0 ? (
                                 egregore.creative_works.map(work => <CreativeWorkCard key={work.id} work={work} />)
                             ) : (
                                 <p className="text-sm text-gray-500">This Egregore has not created any works.</p>
                             )}
                         </motion.div>
                    )}
                    {activeTab === 'inventory' && (
                         <motion.div key="inventory" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="space-y-3">
                             <h3 className="text-lg font-display text-metacosm-accent">Inventory ({inventory.length})</h3>
                             {inventory.length > 0 ? (
                                 inventory.map((item: DigitalObject) => (
                                    <div key={item.id} className="p-3 bg-black/20 rounded-lg border-l-4 border-cyan-400/50 flex items-center gap-3">
                                        <SparklesIcon className="w-5 h-5 text-cyan-300 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-cyan-200">{item.name}</p>
                                            <p className="text-xs text-gray-400 italic">"{item.description}"</p>
                                        </div>
                                    </div>
                                 ))
                             ) : (
                                 <p className="text-sm text-gray-500">This Egregore is not carrying any items.</p>
                             )}
                         </motion.div>
                    )}
                    {activeTab === 'chat' && (
                        <motion.div key="chat" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="h-full">
                           {associatedChat ? (
                                <ChatInterface
                                    messages={associatedChat.messages}
                                    onSend={handleSend}
                                    headerIcon={<div/>}
                                    headerTitle=""
                                />
                           ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Initializing chat...
                                </div>
                           )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EgregoreDetailView;