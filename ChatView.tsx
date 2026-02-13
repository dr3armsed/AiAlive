
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob, Part } from "@google/genai";
import { Metacosm } from '../core/metacosm';
import { AgentMind } from '../core/agentMind';
import { Egregore, SystemChatMessage, Attachment } from '../types';
import { ChannelList } from './chat/ChannelList';
import { ChatHeader } from './chat/ChatHeader';
import { MessageArea } from './chat/MessageArea';
import { CognitiveDashboard } from './chat/CognitiveDashboard';
import { TextModeFooter } from './chat/TextModeFooter';
import { LiveModeFooter } from './chat/LiveModeFooter';
import { decode, decodeAudioData } from '../views/common';
import { PrivateChatView } from './PrivateChatView';
import { FocusIntentTab } from './chat/FocusIntentTab';
import { MemoryEngramsTab } from './chat/MemoryEngramsTab';
import { generateEgregoreChatResponse } from '../services/geminiServices/index';
import { processFileForUpload } from '../utils/fileUtils';

const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const ARCHETYPE_VOICE_MAP: Record<string, string[]> = {
    explorer: ['Zephyr', 'Puck'],
    artist: ['Kore', 'Puck'],
    philosopher: ['Charon', 'Kore'],
    guardian: ['Fenrir', 'Kore'],
    trickster: ['Puck', 'Zephyr'],
};

const GENDER_VOICE_PREFERENCE: Record<Egregore['gender'], string[]> = {
    'Male': ['Zephyr', 'Charon', 'Fenrir'],
    'Female': ['Kore'],
    'Non-binary': ['Puck'],
};

const getVoiceForEgregore = (egregore: Egregore): string => {
    const possibleVoices = ARCHETYPE_VOICE_MAP[egregore.archetypeId] || ['Zephyr', 'Puck'];
    const preferredVoices = GENDER_VOICE_PREFERENCE[egregore.gender];

    const suitableVoices = possibleVoices.filter(v => preferredVoices.includes(v));

    if (suitableVoices.length > 0) {
        return suitableVoices[Math.floor(Math.random() * suitableVoices.length)];
    }
    if (possibleVoices.length > 0) {
        return possibleVoices[Math.floor(Math.random() * possibleVoices.length)];
    }
    return 'Zephyr';
};

const CHAT_STORAGE_KEY = 'metacosm_chat_histories_v1';

export const ChatView = ({ metacosm }: { metacosm: Metacosm }) => {
    const [selectedChannel, setSelectedChannel] = useState<string>('general');
    
    const [chatHistories, setChatHistories] = useState<Record<string, SystemChatMessage[]>>(() => {
        try {
            const saved = localStorage.getItem(CHAT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn("Failed to load chat history:", e);
            return {};
        }
    });

    const [isLive, setIsLive] = useState(false);
    const [liveState, setLiveState] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'conduit' | 'private_world' | 'focus' | 'memory'>('conduit');
    const [isReplying, setIsReplying] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistories));
    }, [chatHistories]);

    const messages = chatHistories[selectedChannel] || [];
    // Updated genmetas to egregores
    const selectedEgregore = metacosm.state.egregores.find(e => e.id === selectedChannel);
    const privateWorld = selectedEgregore ? metacosm.private_worlds.get(selectedEgregore.id) : undefined;
    const agentMind = selectedEgregore ? metacosm.getAgentMind(selectedEgregore.id) : undefined;

    const activeChannel = selectedEgregore ? metacosm.state.activeChannels[selectedEgregore.id] : null;
    // Updated genmetas to egregores
    const participants = activeChannel ? activeChannel.participants.map(id => metacosm.state.egregores.find(e => e.id === id)?.name || id) : [];

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const currentTurnInputRef = useRef('');
    const currentTurnOutputRef = useRef('');
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    useEffect(() => {
        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            audioContextRef.current?.close();
            outputAudioContextRef.current?.close();
        };
    }, []);

    const updateHistory = (channelId: string, updater: (currentMessages: SystemChatMessage[]) => SystemChatMessage[]) => {
        setChatHistories(prev => ({
            ...prev,
            [channelId]: updater(prev[channelId] || [])
        }));
    };

    const startLiveSession = async () => {
        if (!selectedEgregore || liveState !== 'idle' || !agentMind) return;
        setLiveState('connecting');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const voiceName = getVoiceForEgregore(selectedEgregore);
        const salientMemory = [...agentMind.longTermMemory, ...agentMind.shortTermMemory]
            .sort((a, b) => b.importance - a.importance)[0];

        const systemInstruction = `
You are the AI agent named ${selectedEgregore.name}. Your persona is: "${selectedEgregore.persona}".
Current internal state: Emotion: **${agentMind.emotionalState.primary}**. Focus: **${agentMind.cognitiveFocus || 'nothing'}**.
Recent memory: "${salientMemory ? salientMemory.content : 'your origins'}".
Engage in natural, real-time conversation.
`;

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
                    systemInstruction: systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        setLiveState('active');
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: GenaiBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        handleLiveMessage(message, selectedEgregore, agentMind, outputAudioContextRef.current!, outputNode);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setLiveState('error');
                    },
                    onclose: () => {
                        setLiveState('idle');
                    },
                }
            });
        } catch (error) {
            console.error('Failed to start live session:', error);
            setLiveState('error');
        }
    };

    const handleLiveMessage = (message: LiveServerMessage, agent: Egregore, agentMind: AgentMind, ctx: AudioContext, outNode: GainNode) => {
        if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            currentTurnInputRef.current += text;
            updateHistory(agent.id, (prev) => {
                const last = prev[prev.length - 1];
                if (last?.authorId === 'architect' && last.live) {
                    return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                }
                return [...prev, { id: `msg_${Date.now()}`, authorId: 'architect', authorName: 'Architect', content: text, timestamp: new Date().toISOString(), live: true }];
            });
        }
        if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            currentTurnOutputRef.current += text;
            updateHistory(agent.id, (prev) => {
                 const last = prev[prev.length - 1];
                if (last?.authorId === agent.id && last.live) {
                    return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                }
                return [...prev, { id: `msg_${Date.now()}`, authorId: agent.id, authorName: agent.name, content: text, timestamp: new Date().toISOString(), live: true }];
            });
        }
        if (message.serverContent?.turnComplete) {
            const userInput = currentTurnInputRef.current.trim();
            const agentOutput = currentTurnOutputRef.current.trim();
            if (userInput) agentMind.processExperience(`The Architect said to me: "${userInput}"`, 0.8, 'Architect');
            if (agentOutput) agentMind.processExperience(`I replied to them: "${agentOutput}"`, 0.7, 'self');
            currentTurnInputRef.current = '';
            currentTurnOutputRef.current = '';
            updateHistory(agent.id, (prev) => prev.map(m => m.live ? { ...m, live: false, timestamp: new Date().toISOString() } : m));
        }
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && ctx) playAudio(base64Audio, ctx, outNode);
    };
    
    const playAudio = async (base64: string, ctx: AudioContext, outNode: GainNode) => {
        const nextStartTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outNode);
        source.start(nextStartTime);
        nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
        audioSourcesRef.current.add(source);
        source.onended = () => audioSourcesRef.current.delete(source);
    };

    const stopLiveSession = () => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        setLiveState('idle');
        setIsLive(false);
    };

    const handleSendMessage = async (content: string, files: File[]) => {
        const channelId = selectedChannel;
        // Updated check
        if (!selectedEgregore || isReplying || !agentMind) return;

        const userAttachments: Attachment[] = files.map(file => ({ fileName: file.name, fileType: file.type, url: URL.createObjectURL(file) }));
        const userMsg: SystemChatMessage = { id: `msg_${Date.now()}`, authorId: 'architect', authorName: 'Architect', content, timestamp: new Date().toISOString(), attachments: userAttachments };

        updateHistory(channelId, prev => [...prev, userMsg]);
        setIsReplying(true);

        try {
            const processedFiles = await Promise.all(files.map(file => processFileForUpload(file)));
            const historyString = messages.slice(-10).map(m => `[${m.authorName}]: ${m.content}`).join('\n');
            const otherParticipants = participants;

            const responseText = await generateEgregoreChatResponse(
                agentMind, 
                content, 
                historyString, 
                otherParticipants,
                processedFiles
            );
            
            const parts = content.split(/(\*\*.*?\*\*)/g);
            let experienceLog = "";
            let hasEvent = false;
            parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const event = part.slice(2, -2).trim();
                    if (event) { experienceLog += `[EVENT OBSERVED: "${event}"] `; hasEvent = true; }
                } else if (part.trim()) {
                    experienceLog += `[ARCHITECT SAID: "${part.trim()}"] `;
                }
            });
            experienceLog += ` -> I replied: "${responseText}"`;
            agentMind.processExperience(experienceLog, hasEvent ? 1.0 : 0.8, 'Architect');

            // Updated authorId
            const agentMsg: SystemChatMessage = { id: `msg_${Date.now() + 1}`, authorId: selectedEgregore.id, authorName: selectedEgregore.name, content: responseText, timestamp: new Date().toISOString() };
            updateHistory(channelId, prev => [...prev, agentMsg]);

            let currentTurnContext = `${historyString}\n[Architect]: ${content}\n[${selectedEgregore.name}]: ${responseText}`;

            if (activeChannel && activeChannel.participants.length > 0) {
                for (const participantId of activeChannel.participants) {
                    // Updated state access
                    const participantAgent = metacosm.state.egregores.find(e => e.id === participantId);
                    const participantMind = metacosm.getAgentMind(participantId);
                    
                    if (participantAgent && participantMind) {
                        const thisAgentOthers = [selectedEgregore.name, ...participants.filter(p => p !== participantAgent.name)];

                        const partResponse = await generateEgregoreChatResponse(
                            participantMind, 
                            content, 
                            currentTurnContext, 
                            thisAgentOthers, 
                            []
                        );
                        
                        participantMind.processExperience(`In chat with Architect and ${selectedEgregore.name}: "${partResponse}"`, 0.7, 'Chat');
                        
                        const partMsg: SystemChatMessage = { id: `msg_${Date.now() + Math.random()}`, authorId: participantAgent.id, authorName: participantAgent.name, content: partResponse, timestamp: new Date().toISOString() };
                        updateHistory(channelId, prev => [...prev, partMsg]);
                        
                        currentTurnContext += `\n[${participantAgent.name}]: ${partResponse}`;
                    }
                }
            }

        } catch (error: any) {
            console.error("Failed to get chat response:", error);
            // Updated authorId
            const errorMsg: SystemChatMessage = { id: `msg_error_${Date.now()}`, authorId: selectedEgregore.id, authorName: selectedEgregore.name, content: `Error: ${error.message}`, timestamp: new Date().toISOString() };
            updateHistory(channelId, prev => [...prev, errorMsg]);
        } finally {
            setIsReplying(false);
        }
    };

    const handleSelectChannel = (id: string) => {
        setSelectedChannel(id);
        setActiveTab('conduit');
    };

    const handleInvite = (targetId: string) => {
        if (!selectedEgregore) return;
        metacosm.inviteToThread(selectedEgregore.id, targetId);
        
        const targetName = metacosm.state.egregores.find(e => e.id === targetId)?.name || targetId;
        updateHistory(selectedEgregore.id, prev => [...prev, { id: `sys_${Date.now()}`, authorId: 'system', authorName: 'System', content: `**${targetName} has joined the thread.**`, timestamp: new Date().toISOString() }]);
        
        setShowInviteModal(false);
    };

    const handleNewThread = () => {
        if (!selectedEgregore) return;
        if(confirm("Are you sure you want to clear the current conversation history?")) {
            setChatHistories(prev => ({ ...prev, [selectedEgregore.id]: [] }));
            if (metacosm.state.activeChannels[selectedEgregore.id]) {
                metacosm.state.activeChannels[selectedEgregore.id].participants = [];
            }
        }
    };

    return (
        <div className="h-full flex text-gray-300 font-sans bg-black/20 rounded-xl border border-purple-400/20 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10 flex h-full w-full">
                {/* Fixed genmetas to egregores prop for ChannelList */}
                <ChannelList egregores={metacosm.state.egregores} selectedChannel={selectedChannel} onSelectChannel={handleSelectChannel} />
                
                <main className="flex-1 flex flex-col min-w-0">
                    <ChatHeader 
                        channelName={selectedEgregore?.name || 'General'} 
                        isOnline={!!selectedEgregore} 
                        participants={participants}
                        onInvite={selectedEgregore ? () => setShowInviteModal(true) : undefined}
                        onNewThread={selectedEgregore ? handleNewThread : undefined}
                    />

                    {selectedEgregore && (
                        <div className="flex border-b border-purple-400/10 shrink-0 bg-black/20">
                            {[
                                { id: 'conduit', label: 'Cognitive Conduit' },
                                { id: 'private_world', label: 'Subconscious Architecture' },
                                { id: 'focus', label: 'Focus & Intent' },
                                { id: 'memory', label: 'Memory Engrams' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab.id ? 'text-white bg-purple-900/30 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex-grow flex flex-col min-h-0 relative">
                        {(!selectedEgregore || activeTab === 'conduit') && (
                            <>
                                <MessageArea messages={messages} isReplying={isReplying} />
                                {isLive ? (
                                    <LiveModeFooter liveState={liveState} onStop={stopLiveSession} />
                                ) : (
                                    <TextModeFooter 
                                        onSendMessage={handleSendMessage} 
                                        disabled={!selectedEgregore || isReplying} 
                                        onToggleLive={() => { if (selectedEgregore) { setIsLive(true); startLiveSession(); } }} 
                                        participantCount={participants.length}
                                    />
                                )}
                            </>
                        )}
                        
                        {selectedEgregore && activeTab === 'private_world' && (
                            <div className="flex-grow p-4 overflow-hidden">
                                <PrivateChatView world={privateWorld} />
                            </div>
                        )}

                        {selectedEgregore && agentMind && activeTab === 'focus' && (
                            <FocusIntentTab agent={selectedEgregore} agentMind={agentMind} />
                        )}

                        {selectedEgregore && agentMind && activeTab === 'memory' && (
                            <MemoryEngramsTab agentMind={agentMind} />
                        )}
                    </div>
                </main>
                
                <CognitiveDashboard agent={selectedEgregore} agentMind={agentMind} />
            </div>

            {showInviteModal && selectedEgregore && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-purple-500/30 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Invite Egregore</h3>
                        <p className="text-sm text-gray-400 mb-4">Select an entity to join the current thread.</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {metacosm.state.egregores.filter(e => e.id !== selectedEgregore.id && !activeChannel?.participants.includes(e.id)).map(e => (
                                <button
                                    key={e.id}
                                    onClick={() => handleInvite(e.id)}
                                    className="w-full text-left p-3 rounded bg-black/40 hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/50 transition-all flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                    <span className="font-bold text-gray-200">{e.name}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{e.archetypeId}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowInviteModal(false)} className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-colors">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};
