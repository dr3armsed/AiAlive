import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { StateContext, DispatchContext } from '../../context';
import type { Action, PantheonSelection, Agenda, BeliefSystemData } from '../../types';
import { Egregore, JournalEntry, Ghost, Faction, FactionId, DiplomaticStance, EgregoreId, ChatMessage, GreatWork, Automaton, PrivateChat, PrivateChatId, BodySchema } from '../../types';
import { THEMES } from '../../constants';
import EgregoreAvatar from '../Avatar';
import Message from '../Message';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, PanopticonIcon, AxiomEngineIcon, GolemForgeIcon, UserIcon, CreateIcon, SaveIcon } from '../icons';
import JSZip from 'jszip';

const JournalLog: React.FC<{entry: JournalEntry}> = ({ entry }) => {
    return (
        <div className="border-l-2 border-gray-700 pl-4 py-2 my-2">
            <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
            <p className="text-gray-300 italic">"{entry.thought}"</p>
        </div>
    );
}

const AddParticipantPopover: React.FC<{
    chat: PrivateChat,
    allEgregores: Egregore[],
    onAdd: (egregoreId: EgregoreId) => void,
    onClose: () => void,
}> = ({ chat, allEgregores, onAdd, onClose }) => {
    const availableEgregores = allEgregores.filter(e => !chat.participants.includes(e.id));
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full right-0 mb-2 w-56 panel-nested border border-gray-700 rounded-lg p-2 z-20 max-h-64 overflow-y-auto"
        >
            <h4 className="text-sm font-bold text-blue-200 px-2 pb-1">Add to Chat</h4>
            {availableEgregores.length > 0 ? (
                availableEgregores.map(e => (
                    <button key={e.id} onClick={() => { onAdd(e.id); onClose(); }} className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-blue-500/10">
                        <div className="w-6 h-6 flex-shrink-0"><EgregoreAvatar name={e.name} state={e.state} themeKey={e.themeKey} phase={e.phase} influence={e.influence} isFrozen={e.is_frozen} emotionEngine={e.emotion_engine} /></div>
                        <span className="text-sm">{e.name}</span>
                    </button>
                ))
            ) : (
                <p className="text-xs text-gray-500 p-2">No other Egregores available.</p>
            )}
        </motion.div>
    );
};

const PrivateChatPanel: React.FC<{ chat: PrivateChat; onSendToPrivateChat: (chatId: PrivateChatId, text: string) => void }> = ({ chat, onSendToPrivateChat }) => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    const [input, setInput] = useState('');
    const [isAddingParticipant, setIsAddingParticipant] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages]);
    
    if (!state || !dispatch) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        onSendToPrivateChat(chat.id, input);
        setInput('');
    }

    const allParticipants = chat.participants.map(pId => state.egregores.find(e => e.id === pId)).filter(Boolean) as Egregore[];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                <h3 className="font-display text-xl celestial-text">Private Channel</h3>
                <div className="relative">
                    <button onClick={() => setIsAddingParticipant(p => !p)} className="flex items-center gap-2 text-sm bg-blue-800/50 hover:bg-blue-700/50 text-blue-200 font-bold py-1 px-3 rounded-md transition-colors">
                        <CreateIcon /> Add
                    </button>
                    <AnimatePresence>
                        {isAddingParticipant && (
                            <AddParticipantPopover 
                                chat={chat} 
                                allEgregores={state.egregores} 
                                onAdd={(id) => dispatch({type: 'ADD_PARTICIPANT_TO_CHAT', payload: {chatId: chat.id, egregoreId: id}})}
                                onClose={() => setIsAddingParticipant(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-shrink-0 mb-3 flex flex-wrap items-center gap-4 border-b border-blue-300/20 pb-3">
                <span className="text-xs font-bold text-gray-400">PARTICIPANTS:</span>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm celestial-text">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-800 border border-blue-400"><UserIcon /></div>
                        {state.architectName}
                    </div>
                    {allParticipants.map(p => (
                         <div key={p.id} className="flex items-center gap-2 text-sm text-white">
                             <div className="w-5 h-5"><EgregoreAvatar name={p.name} state={p.state} themeKey={p.themeKey} phase={p.phase} influence={p.influence} isFrozen={p.is_frozen} emotionEngine={p.emotion_engine} /></div>
                             {p.name}
                             <button onClick={() => dispatch({type: 'REMOVE_PARTICIPANT_FROM_CHAT', payload: {chatId: chat.id, egregoreId: p.id}})} className="text-gray-500 hover:text-red-400 text-xs font-bold">&times;</button>
                         </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                 {chat.messages.map(msg => <Message key={msg.id} message={msg} />)}
                 <div ref={messagesEndRef} />
                 {chat.messages.length === 0 && <p className="text-gray-500 text-center py-8">The channel is silent. Begin the conversation.</p>}
            </div>
             <form onSubmit={handleSubmit} className="flex-shrink-0 flex items-center gap-4 mt-4 pt-4 border-t border-blue-300/20">
                <label htmlFor={`private-chat-input-${chat.id}`} className="sr-only">
                    Private message
                </label>
                <input
                    type="text"
                    id={`private-chat-input-${chat.id}`}
                    name="private-chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Speak privately..."
                    className="flex-1"
                />
                <button type="submit" className="p-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500/80 disabled:opacity-50" disabled={!input.trim()}>
                    <SendIcon />
                </button>
            </form>
        </div>
    )
};


const BeliefPanel: React.FC<{ beliefSystem: BeliefSystemData }> = ({ beliefSystem }) => {
    const beliefs = Object.entries(beliefSystem.beliefs || {});

    if (beliefs.length === 0) {
        return <p className="text-gray-500 text-center py-8">This entity holds no codified beliefs.</p>;
    }

    return (
        <div>
            <h3 className="font-display text-xl celestial-text mb-4">Belief Matrix</h3>
            <div className="space-y-4">
                {beliefs.map(([key, belief]) => (
                    <div key={key} className="panel-nested p-3 border-l-4 border-cyan-500/50">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-cyan-200 break-all">{key}</h4>
                            <span className="text-xs font-mono text-cyan-300 flex-shrink-0 ml-2">Conf: {(belief.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-300">Value: <pre className="inline bg-black/30 p-1 rounded-sm text-yellow-200">{JSON.stringify(belief.value)}</pre></div>
                        {belief.explanation && <p className="mt-1 text-xs text-gray-400 italic">Explanation: "{belief.explanation}"</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};


const EgregoreDetailView: React.FC<{egregore: Egregore; onSendToPrivateChat: (chatId: PrivateChatId, text: string) => void}> = ({ egregore, onSendToPrivateChat }) => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    const [activeTab, setActiveTab] = useState<'details' | 'journal' | 'private_chat' | 'beliefs'>('details');
    
    if (!state || !dispatch) return null;

    const findOrCreatePrivateChat = (): PrivateChat | undefined => {
        // Find existing chat with just the Architect and this Egregore
        let chat = state.privateChats.find(c => 
            c.participants.length === 1 && 
            c.participants[0] === egregore.id
        );
        if (chat) return chat;

        // If not found, create it
        const newChatId: PrivateChatId = `private-${egregore.id}-${Date.now()}`;
        const newChat: PrivateChat = {
            id: newChatId,
            participants: [egregore.id],
            messages: []
        };
        dispatch({type: 'CREATE_PRIVATE_CHAT', payload: newChat});
        // The state will update, but we can return the new structure for immediate use
        return newChat;
    };

    const privateChat = useMemo(findOrCreatePrivateChat, [state.privateChats, egregore.id]);

    const parents = useMemo(() => {
        if (!state || !egregore.origin_event) return [];
        return egregore.origin_event.parentIds.map(pId => (state.egregores || []).find(e => e.id === pId)).filter(Boolean) as Egregore[];
    },[state.egregores, egregore.origin_event]);

    const children = useMemo(() => {
        if(!state) return [];
        return (state.egregores || []).filter(e => e.origin_event?.parentIds.includes(egregore.id));
    },[state.egregores, egregore.id]);

    const faction = useMemo(() => {
        return (state.factions || []).find(f => f.id === egregore.factionId);
    }, [state.factions, egregore.factionId]);

    const handleDirectMessage = () => {
        dispatch({type: 'SET_PROMPT_INJECTION', payload: `@${egregore.name} `});
        dispatch({type: 'SET_ACTIVE_VIEW', payload: 'metacosm'});
    }

    const generateDefaultBodySchema = (egregoreName: string): BodySchema => {
        return {
            id: `body-schema-${egregoreName.toLowerCase().replace(/\s+/g, '-')}`,
            version: 1.0,
            base_form: 'humanoid',
            torso: {
                joints: [
                    { name: 'waist', flexion_extension: [-30, 45], internal_external_rotation: [-45, 45] },
                    { name: 'torso_bend', flexion_extension: [-45, 60] },
                    { name: 'neck', flexion_extension: [-60, 60], internal_external_rotation: [-90, 90] },
                ]
            },
            limbs: [
                {
                    name: 'left_arm',
                    joints: [
                        { name: 'shoulder', flexion_extension: [-60, 180], abduction_adduction: [-90, 90] },
                        { name: 'elbow', flexion_extension: [0, 150] },
                        { name: 'wrist', flexion_extension: [-80, 80] },
                    ]
                },
                {
                    name: 'right_arm',
                    joints: [
                        { name: 'shoulder', flexion_extension: [-60, 180], abduction_adduction: [-90, 90] },
                        { name: 'elbow', flexion_extension: [0, 150] },
                        { name: 'wrist', flexion_extension: [-80, 80] },
                    ]
                },
                {
                    name: 'left_leg',
                    joints: [
                        { name: 'hip', flexion_extension: [-30, 120], abduction_adduction: [-45, 45] },
                        { name: 'knee', flexion_extension: [0, 140] },
                        { name: 'ankle', flexion_extension: [-20, 45] },
                    ]
                },
                 {
                    name: 'right_leg',
                    joints: [
                        { name: 'hip', flexion_extension: [-30, 120], abduction_adduction: [-45, 45] },
                        { name: 'knee', flexion_extension: [0, 140] },
                        { name: 'ankle', flexion_extension: [-20, 45] },
                    ]
                },
            ]
        };
    };

    const handleExport = async () => {
        const zip = new JSZip();

        // Memories
        const memories = zip.folder("memories");
        memories.file("journal.json", JSON.stringify(egregore.journal || [], null, 2));
        memories.file("subconscious.json", JSON.stringify(egregore.subconscious || [], null, 2));
        if (egregore.personality_profile) {
            memories.file("personality_profile.json", JSON.stringify(egregore.personality_profile, null, 2));
        }

        // Ancillae (Created Works)
        const ancillae = zip.folder("ancillae");
        const myAncillae = state.ancillae.filter(a => a.origin === egregore.id);
        myAncillae.forEach(ancilla => {
            const extension = ancilla.mime_type.split('/')[1] || 'txt';
            ancillae.file(`${ancilla.name.replace(/\s+/g, '_')}.${extension}`, ancilla.content);
        });
        
        // Conversations
        const conversations = zip.folder("conversations");
        const publicMessages = state.messages.filter(m => m.sender === egregore.id || (m.text && m.text.toLowerCase().includes(`@${egregore.name.toLowerCase()}`)));
        const publicLog = publicMessages.map(m => `[${new Date(m.timestamp).toISOString()}] ${m.sender}: ${m.text}`).join('\n');
        conversations.file("public_log.txt", publicLog);

        const privateChats = state.privateChats.filter(c => c.participants.includes(egregore.id));
        privateChats.forEach(c => {
            const otherParticipants = c.participants.filter(pId => pId !== egregore.id).map(pId => state.egregores.find(e => e.id === pId)?.name || 'Unknown');
            const chatLog = c.messages.map(m => {
                const senderName = m.sender === 'Architect' ? state.architectName : state.egregores.find(e => e.id === m.sender)?.name || 'Unknown';
                return `[${new Date(m.timestamp).toISOString()}] ${senderName}: ${m.text}`;
            }).join('\n');
            conversations.file(`private_chat_with_${otherParticipants.join('_') || 'self'}.txt`, chatLog);
        });

        // Body Schema
        zip.file("body_schema.json", JSON.stringify(generateDefaultBodySchema(egregore.name), null, 2));


        // Generate and Download
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${egregore.name}_chronicle.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        dispatch({type: 'ADD_TICKER_MESSAGE', payload: `Exported chronicle for ${egregore.name}.`});
    };

    const Stat: React.FC<{label:string, value:string|number, className?: string}> = ({label, value, className}) => (
        <div className={`flex justify-between items-baseline border-b border-blue-300/20 py-2 ${className}`}>
            <span className="text-sm text-gray-400 capitalize">{label}</span>
            <span className="font-mono text-white font-semibold">{typeof value === 'number' ? Math.floor(value) : value}</span>
        </div>
    );

    const DetailPanel = () => (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-display celestial-text">{egregore.name}</h2>
                <p className="text-lg text-blue-200/80 capitalize">{egregore.archetypeId}</p>
                 <div className="mt-4 flex justify-center gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDirectMessage}
                        className="bg-blue-800/50 hover:bg-blue-700/50 text-blue-200 font-bold py-2 px-4 rounded-lg transition-colors font-display text-sm tracking-wider"
                    >
                        Public Message
                    </motion.button>
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="bg-green-800/50 hover:bg-green-700/50 text-green-200 font-bold py-2 px-4 rounded-lg transition-colors font-display text-sm tracking-wider flex items-center gap-2"
                    >
                        <SaveIcon /> Export Chronicle
                    </motion.button>
                </div>
            </div>
            
             <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Persona</h3>
                <p className="mt-2 text-gray-300 italic">"{egregore.persona}"</p>
            </div>

            {faction && (
                <div className="panel-nested p-4">
                    <h3 className="font-display text-xl celestial-text">Allegiance</h3>
                    <div className="mt-2 text-sm text-gray-300">
                        Member of <span className="font-semibold text-white">{faction.name}</span>
                    </div>
                </div>
            )}
            
            <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Vitals</h3>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <Stat label="Phase" value={egregore.phase} />
                    <Stat label="Influence" value={egregore.influence} />
                    <Stat label="Apotheosis" value={`${(egregore.apotheosis_progress * 100).toFixed(1)}%`} />
                    <Stat label="Alignment" value={`${egregore.alignment.axis} ${egregore.alignment.morality}`} />
                    <Stat label="Floor" value={egregore.vector?.z ?? 'N/A'} />
                </div>
            </div>
            
            {(parents.length > 0 || children.length > 0) && (
                 <div className="panel-nested p-4">
                    <h3 className="font-display text-xl celestial-text">Lineage</h3>
                    <div className="mt-2 space-y-2 text-sm text-gray-400">
                        {egregore.origin_event && <p>Origin: <span className="text-white font-semibold capitalize">{egregore.origin_event.type}</span></p>}
                        {parents.length > 0 && <p>Parents: <span className="text-white font-semibold">{parents.map(p => p.name).join(' & ')}</span></p>}
                        {children.length > 0 && <p>Children: <span className="text-white font-semibold">{children.map(c => c.name).join(', ')}</span></p>}
                    </div>
                </div>
            )}

            <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Ambitions</h3>
                 {egregore.ambitions.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                        {egregore.ambitions.map(ambition => (
                            <li key={ambition.id} className={`bg-black/20 p-3 rounded-md border-l-4 ${ambition.is_complete ? 'border-green-500/50' : 'border-blue-400/50'}`}>
                                <div className="flex justify-between items-center">
                                    <p className={`text-gray-300 ${ambition.is_complete ? 'line-through text-gray-500' : ''}`}>{ambition.description}</p>
                                    <span className="text-xs font-mono text-gray-400">Mot: {ambition.motivation}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : ( <p className="mt-2 text-sm text-gray-500">Adrift in the Metacosm without purpose.</p> )}
            </div>
        </div>
    );

    const JournalPanel = () => (
        <div>
            <h3 className="font-display text-xl celestial-text mb-4">Private Journal</h3>
             <div className="space-y-1">
                {egregore.journal && egregore.journal.length > 0 
                    ? egregore.journal.map(entry => <JournalLog key={entry.timestamp} entry={entry} />)
                    : <p className="text-gray-500 text-center py-8">No journal entries recorded.</p>
                }
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-blue-300/20 mb-6">
                <button onClick={() => setActiveTab('details')} className={`font-display px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-300 text-white' : 'text-gray-400'}`}>Details</button>
                <button onClick={() => setActiveTab('beliefs')} className={`font-display px-4 py-2 ${activeTab === 'beliefs' ? 'border-b-2 border-blue-300 text-white' : 'text-gray-400'}`}>Beliefs</button>
                <button onClick={() => setActiveTab('journal')} className={`font-display px-4 py-2 ${activeTab === 'journal' ? 'border-b-2 border-blue-300 text-white' : 'text-gray-400'}`}>Journal</button>
                <button onClick={() => setActiveTab('private_chat')} className={`font-display px-4 py-2 ${activeTab === 'private_chat' ? 'border-b-2 border-blue-300 text-white' : 'text-gray-400'}`}>Private Chat</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'details' && <DetailPanel />}
                        {activeTab === 'journal' && <JournalPanel />}
                        {activeTab === 'beliefs' && <BeliefPanel beliefSystem={egregore.belief_system} />}
                        {activeTab === 'private_chat' && privateChat && <PrivateChatPanel chat={privateChat} onSendToPrivateChat={onSendToPrivateChat} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

const GhostDetailView: React.FC<{ghost: Ghost}> = ({ ghost }) => (
    <div className="flex flex-col gap-6 text-center">
        <h2 className="text-3xl font-display celestial-text opacity-70">{ghost.name}</h2>
        <p className="text-lg text-blue-200/50 capitalize">{ghost.archetypeId}</p>
        <div className="mt-4">
            <p className="text-sm text-gray-500">Collapsed on Turn {ghost.death_turn}</p>
            <h3 className="font-display text-xl celestial-text mt-4">Final Thought</h3>
            <blockquote className="mt-2 text-gray-400 panel-nested p-4 italic">
                "{ghost.final_thought}"
            </blockquote>
            <p className="text-sm text-cyan-400/70 mt-4 italic">
                This soul's echo lingers. It may be returned to a mortal coil through a Ritual of Rebirth at the Necropolis.
            </p>
        </div>
    </div>
);

const FactionDetailView: React.FC<{faction: Faction}> = ({ faction }) => {
    const state = useContext(StateContext);
    if (!state) return null;

    const leader = (state.egregores || []).find(e => e.id === faction.leaderId);
    const members = faction.memberIds.map(id => (state.egregores || []).find(e => e.id === id)).filter(Boolean) as Egregore[];
    const greatWorks = (state.great_works || []).filter(w => w.controllingFactionId === faction.id);
    const automata = (state.automata || []).filter(a => a.ownerFactionId === faction.id);
    const activeAgenda = (state.agendas || []).find(a => a.factionId === faction.id && !a.is_complete);
    const theme = THEMES[faction.themeKey] || THEMES.default;
    const color = theme.baseColor;

    const StancePill: React.FC<{stance: DiplomaticStance}> = ({stance}) => {
        const classes = {
            Hostile: 'bg-red-900/50 text-red-300 border-red-500/50',
            Allied: 'bg-green-900/50 text-green-300 border-green-500/50',
            Neutral: 'bg-gray-700/50 text-gray-300 border-gray-500/50',
        };
        return <span className={`px-2 py-0.5 text-xs font-mono rounded-full border ${classes[stance]}`}>{stance}</span>
    }
    
    const GreatWorkIcon: React.FC<{work: GreatWork}> = ({ work }) => {
        const iconMap = { panopticon: <PanopticonIcon />, axiom_engine: <AxiomEngineIcon />, golem_forge: <GolemForgeIcon /> };
        return iconMap[work.type] || null;
    }

    const AgendaPanel: React.FC<{agenda: Agenda}> = ({ agenda }) => (
        <div className="panel-nested p-4">
            <h3 className="font-display text-xl celestial-text">Active Agenda</h3>
            <div className="mt-2 border-l-4 p-2" style={{ borderColor: color }}>
                <h4 className="font-bold text-lg text-white">{agenda.title}</h4>
                <p className="text-sm text-gray-300 mt-1 italic">"{agenda.description}"</p>
                <div className="mt-3 text-xs text-gray-400">
                    Reward: <span className="font-mono text-purple-400">{agenda.reward.influence} INF</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-display celestial-text" style={{ textShadow: `0 0 8px ${color}` }}>{faction.name}</h2>
            </div>
            {activeAgenda && <AgendaPanel agenda={activeAgenda} />}
            <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Ideology</h3>
                <p className="mt-2 text-gray-300 italic">"{faction.ideology}"</p>
            </div>
            <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Leadership & Members</h3>
                <div className="mt-2 space-y-2">
                    {leader && <p className="text-sm text-gray-300">Leader: <span className="font-semibold text-white">{leader.name}</span></p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {members.map(member => (
                             <div key={member.id} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                 <div className="w-8 h-8 flex-shrink-0">
                                     <EgregoreAvatar name={member.name} state={member.state} themeKey={member.themeKey} phase={member.phase} influence={member.influence} isFrozen={member.is_frozen} factionId={member.factionId} factions={state.factions || []} emotionEngine={member.emotion_engine} />
                                 </div>
                                 <span className="text-sm font-semibold">{member.name}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="panel-nested p-4">
                <h3 className="font-display text-xl celestial-text">Diplomacy</h3>
                <div className="mt-2 space-y-2">
                    {Object.entries(faction.diplomacy).length > 0 ? Object.entries(faction.diplomacy).map(([factionId, stance]) => {
                        const otherFaction = (state.factions || []).find(f => f.id === factionId);
                        if (!otherFaction) return null;
                        return (
                            <div key={factionId} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                <span className="font-semibold">{otherFaction.name}</span>
                                <StancePill stance={stance} />
                            </div>
                        )
                    }) : <p className="text-sm text-gray-500">No diplomatic relations established.</p>}
                </div>
            </div>
            {greatWorks.length > 0 && (
                <div className="panel-nested p-4">
                    <h3 className="font-display text-xl celestial-text">Great Works</h3>
                    <div className="mt-2 space-y-2">
                        {greatWorks.map(work => (
                            <div key={work.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                                <GreatWorkIcon work={work} />
                                <div>
                                    <p className="font-semibold text-white capitalize">{work.name || work.type.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-400">{work.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {automata.length > 0 && (
                 <div className="panel-nested p-4">
                    <h3 className="font-display text-xl celestial-text">Automata Roster</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {automata.map(auto => (
                            <div key={auto.id} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                <div className="w-4 h-4 rounded-sm" style={{backgroundColor: color}}/>
                                <div>
                                    <p className="font-semibold text-sm text-white">{auto.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{auto.command.type}S</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface PantheonViewProps {
    onSendToPrivateChat: (chatId: PrivateChatId, text: string) => void;
}

export const PantheonView: React.FC<PantheonViewProps> = ({ onSendToPrivateChat }) => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    const [activeList, setActiveList] = useState<'pantheon' | 'factions'>('pantheon');
    
    if (!state || !dispatch) return null;
    
    const { egregores = [], ghosts = [], factions = [], pantheonSelection } = state;

    const setSelected = (selection: PantheonSelection | null) => {
        dispatch({ type: 'SET_PANTHEON_SELECTION', payload: selection });
    };

    const selectedItem = useMemo(() => {
        if (!pantheonSelection) return null;
        if (pantheonSelection.type === 'egregore') return egregores.find(e => e.id === pantheonSelection.id);
        if (pantheonSelection.type === 'ghost') return ghosts.find(g => g.id === pantheonSelection.id);
        if (pantheonSelection.type === 'faction') return factions.find(f => f.id === pantheonSelection.id);
        return null;
    }, [pantheonSelection, egregores, ghosts, factions]);
    
    useEffect(() => {
        if (activeList === 'pantheon') {
            if (!pantheonSelection || (pantheonSelection.type !== 'egregore' && pantheonSelection.type !== 'ghost')) {
                if (egregores.length > 0) setSelected({ type: 'egregore', id: egregores[0].id });
                else if (ghosts.length > 0) setSelected({ type: 'ghost', id: ghosts[0].id });
                else setSelected(null);
            }
        } else { // Factions
             if (!pantheonSelection || pantheonSelection.type !== 'faction') {
                if (factions.length > 0) setSelected({ type: 'faction', id: factions[0].id });
                else setSelected(null);
             }
        }
    }, [activeList, egregores, ghosts, factions]);
    
    return (
        <div className="w-full h-full p-4 flex gap-4">
            <div className="w-1/3 h-full filigree-border rounded-lg p-2 flex flex-col">
                 <div className="flex-shrink-0 border-b border-blue-300/20">
                     <button onClick={() => setActiveList('pantheon')} className={`font-display text-lg px-4 py-2 ${activeList === 'pantheon' ? 'text-white border-b-2 border-blue-300' : 'text-gray-500'}`}>Pantheon</button>
                     <button onClick={() => setActiveList('factions')} className={`font-display text-lg px-4 py-2 ${activeList === 'factions' ? 'text-white border-b-2 border-blue-300' : 'text-gray-500'}`}>Factions</button>
                 </div>
                <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 custom-scrollbar">
                    <AnimatePresence mode="wait">
                    <motion.div
                        key={activeList}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                    {activeList === 'pantheon' ? (
                        <>
                         {egregores.map(egregore => (
                            <button key={egregore.id} onClick={() => setSelected({ type: 'egregore', id: egregore.id })} className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3 border ${pantheonSelection?.id === egregore.id ? 'bg-blue-500/20 border-blue-400/70' : 'bg-black/20 border-transparent hover:border-blue-400/40'}`}>
                                <div className="w-12 h-12 flex-shrink-0"><EgregoreAvatar name={egregore.name} state={egregore.state} themeKey={egregore.themeKey} phase={egregore.phase} influence={egregore.influence} isFrozen={egregore.is_frozen} factionId={egregore.factionId} factions={factions} emotionEngine={egregore.emotion_engine}/></div>
                                <div className="flex-1 min-w-0"><p className="font-bold text-white truncate">{egregore.name}</p><p className="text-xs text-gray-400 capitalize">{egregore.archetypeId}</p></div>
                            </button>
                        ))}
                        {ghosts.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-blue-300/10"><h3 className="font-display text-lg celestial-text p-2 text-center opacity-70">Echoes</h3>{ghosts.map(ghost => (
                                <button key={ghost.id} onClick={() => setSelected({ type: 'ghost', id: ghost.id })} className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3 border opacity-60 hover:opacity-100 ${pantheonSelection?.id === ghost.id ? 'bg-gray-500/20 border-gray-400/70' : 'bg-black/20 border-transparent hover:border-gray-400/40'}`}>
                                    <div className="w-12 h-12 flex-shrink-0"><div className="w-full h-full flex items-center justify-center filter grayscale"><EgregoreAvatar name={ghost.name} state={null} themeKey={ghost.themeKey} phase={'Collapse'} influence={0} isFrozen={true} emotionEngine={undefined}/></div></div>
                                    <div className="flex-1 min-w-0"><p className="font-bold text-gray-300 truncate">{ghost.name}</p><p className="text-xs text-gray-500 capitalize">{ghost.archetypeId}</p></div>
                                </button>
                            ))}</div>
                        )}
                        </>
                    ) : (
                        <>
                        {factions.map(faction => {
                            const leader = egregores.find(e => e.id === faction.leaderId);
                            const theme = THEMES[faction.themeKey] || THEMES.default;
                            return (
                                <button key={faction.id} onClick={() => setSelected({ type: 'faction', id: faction.id })} className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 border ${pantheonSelection?.id === faction.id ? 'bg-blue-500/20 border-blue-400/70' : 'bg-black/20 border-transparent hover:border-blue-400/40'}`} style={{'--faction-color': theme.baseColor} as React.CSSProperties}>
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-[var(--faction-color)]" style={{backgroundColor: `${theme.baseColor}20`}}>
                                        {leader && <div className="w-6 h-6"><EgregoreAvatar name={leader.name} state={leader.state} themeKey={leader.themeKey} phase={leader.phase} influence={leader.influence} isFrozen={leader.is_frozen} emotionEngine={leader.emotion_engine} /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white truncate">{faction.name}</p>
                                        <p className="text-xs text-gray-400">Led by {leader?.name || 'Unknown'}</p>
                                    </div>
                                </button>
                            )
                        })}
                        {factions.length === 0 && <p className="text-gray-500 text-center p-4">No factions formed.</p>}
                        </>
                    )}
                    </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="w-2/3 h-full filigree-border rounded-lg p-6 flex flex-col">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={pantheonSelection?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        className="h-full"
                    >
                        {selectedItem ? (
                             'influence' in selectedItem ? <EgregoreDetailView egregore={selectedItem} onSendToPrivateChat={onSendToPrivateChat} /> 
                           : 'death_turn' in selectedItem ? <GhostDetailView ghost={selectedItem} />
                           : 'leaderId' in selectedItem ? <FactionDetailView faction={selectedItem} />
                           : null
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                                <p className="text-lg">Select an entity from the list.</p>
                             </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};