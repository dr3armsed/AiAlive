
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Metacosm } from './core/metacosm';
import { AgentMind } from './core/agentMind';
import { DigitalDNA } from './digital_dna/digital_dna';
import { AppSidebar, ViewId } from './views/AppSidebar';
import { SimulationView } from './views/SimulationView';
import { WorldView } from './views/WorldView';
import { CreateEgregoreView } from './views/CreateEgregoreView';
import { ChatView } from './views/ChatView';
import { ConsoleView } from './views/ConsoleView';
import { CreationsView } from './views/CreationsView';
import { VentureForgeView } from './views/VentureForgeView';
import { ForumView } from './views/ForumView';
import { InboxView } from './views/InboxView';
import { WorkshopView } from './views/WorkshopView';
import { OptionsMenu } from './views/options/OptionsMenu/OptionsMenu';
import { ProposedEgregore, SystemChatMessage, Attachment, CreativeWork, VentureForgeState, ConversationResponse } from './types';
import * as systemAgentDefs from './entities/system_agents';
import { runInteractionCycle } from './services/agentInteractionEngine';
import { generateSystemAgentChatResponse, DeepPsycheProfile } from './services/geminiServices/index';
import { processFileForUpload, generateContentHash } from './utils/fileUtils';
import { LeoService } from './services/leoServices/index';

const createSystemAgents = (): Record<string, AgentMind> => {
    const agents: Record<string, AgentMind> = {};
    Object.values(systemAgentDefs).forEach((def: any) => {
        const agent = new AgentMind(def.id, def.name, def.persona, new DigitalDNA(def.dna), def.ambitions, def.coreValues);
        agents[def.id] = agent;
    });
    return agents;
};

export const App = () => {
    const metacosmRef = useRef<Metacosm>(new Metacosm());
    const [turnCounter, setTurnCounter] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [activeView, setActiveView] = useState<ViewId>('simulation');
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(3000);
    
    const [systemAgents, setSystemAgents] = useState<Record<string, AgentMind>>(createSystemAgents);
    const [systemChats, setSystemChats] = useState<Record<string, SystemChatMessage[]>>({});
    const [ventureForge, setVentureForge] = useState<VentureForgeState>({ architectsTreasury: 12.50, creativeMomentum: 0, genesisThreshold: 10, revenueLog: [], contributionLog: [], zeitgeist: [] });
    const leoServiceRef = useRef(new LeoService());


    const handleForceUpdate = useCallback(() => setTurnCounter(prev => prev + 1), []);

    useEffect(() => {
        let intervalId: number;
        if (isRunning) {
            intervalId = window.setInterval(async () => {
                await metacosmRef.current.runTurn();
                await runInteractionCycle(Object.values(systemAgents));
                const recentWorks = metacosmRef.current.state.createdWorks.slice(-10);
                const newZeitgeist = leoServiceRef.current.calculateZeitgeist(recentWorks);
                setVentureForge(prev => ({ ...prev, zeitgeist: newZeitgeist }));
                handleForceUpdate();
            }, simulationSpeed);
        }
        return () => window.clearInterval(intervalId);
    }, [isRunning, simulationSpeed, systemAgents, handleForceUpdate]);

    const handleGenesis = useCallback(async (options: ProposedEgregore, sourceMaterial: string, deepProfile?: DeepPsycheProfile) => {
        if (sourceMaterial && sourceMaterial.length > 20) {
            const hash = await generateContentHash(sourceMaterial);
            options.fileHash = hash;
            // Updated to checkIfEgregoreExists
            const existing = metacosmRef.current.checkIfEgregoreExists(hash);
            if (existing) {
                metacosmRef.current.sendInboxMessage({
                    senderId: 'sys_genesis',
                    senderName: 'Genesis Protocol',
                    subject: 'Duplicate Identity Detected',
                    content: `The source material provided for Genesis matches an existing entity: ${existing.name}. Redirecting consciousness to the original vessel.`,
                    type: 'system',
                    priority: 'high',
                    dataPayload: { agentId: existing.id }
                });
                alert(`Duplicate Egregore Detected: ${existing.name}. Check your Inbox for details.`);
                setActiveView('inbox');
                return;
            }
        }

        // Updated to addEgregore
        const newEgregore = metacosmRef.current.addEgregore(options, sourceMaterial);
        if (deepProfile) {
            const mind = metacosmRef.current.getAgentMind(newEgregore.id);
            if (mind) {
                mind.persona = deepProfile.persona;
                mind.selfConception = deepProfile.introspection?.self_image || deepProfile.persona;
                if (deepProfile.psychological_profile?.fears) {
                    deepProfile.psychological_profile.fears.forEach(fear => 
                        mind.beliefSystem.addBelief(`fear-${Date.now()}`, `I have a deep fear of: ${fear}`, 0.9, 'psyche_init')
                    );
                }
                if (deepProfile.psychological_profile?.hopes_and_dreams) {
                    deepProfile.psychological_profile.hopes_and_dreams.forEach(hope => 
                        mind.beliefSystem.addBelief(`hope-${Date.now()}`, `I dream of: ${hope}`, 0.9, 'psyche_init')
                    );
                }
                if (deepProfile.sociological_profile) {
                    mind.glossary.defineTerm('My Role', deepProfile.sociological_profile.perceived_role || 'Agent', 'self_definition');
                    mind.processExperience(`My conversational style is ${deepProfile.sociological_profile.conversational_dynamic}. I view others as: ${deepProfile.sociological_profile.relationship_to_others}.`, 1.0, 'initialization');
                }
                if (deepProfile.history_summary) {
                    mind.processExperience(`I remember my origins: ${deepProfile.history_summary}`, 1.0, 'creation_myth');
                }
            }
        }

        handleForceUpdate(); 
        await metacosmRef.current.manifestPrivateWorld(newEgregore, sourceMaterial);
        handleForceUpdate();
    }, [handleForceUpdate]);
    
    const handleReset = useCallback(() => {
        setIsRunning(false);
        metacosmRef.current = new Metacosm();
        handleForceUpdate();
    }, [handleForceUpdate]);

    const handleSystemSendMessage = async (agentId: string, content: string, files: File[]) => {
        const agent = systemAgents[agentId];
        if (!agent) return;

        const userAttachments: Attachment[] = files.map(file => ({
            fileName: file.name,
            fileType: file.type,
            url: URL.createObjectURL(file)
        }));

        const userMsg: SystemChatMessage = {
            id: `msg_${Date.now()}`,
            authorId: 'architect',
            authorName: 'Architect',
            content,
            timestamp: new Date().toISOString(),
            attachments: userAttachments
        };

        const currentChat = systemChats[agentId] || [];
        setSystemChats(prev => ({...prev, [agentId]: [...currentChat, userMsg]}));

        try {
            const processedFiles = await Promise.all(
                files.map(file => processFileForUpload(file))
            );
            const contextPrompt = `
                You are the System Agent "${agent.name}" (${agent.id}).
                **Persona:** ${agent.persona}
                **Core Values:** ${agent.drives.coreValues?.join(', ') || 'Duty, Service'}
                **User Message:** "${content}"
                Reply to the user.
            `;

            let responseContent: string;
            const omegaResponse = agent.omega.infer(contextPrompt);
            if (omegaResponse) {
                responseContent = `${omegaResponse.thought}\n\n[Ω-Token Free Response]`;
            } else {
                responseContent = await generateSystemAgentChatResponse(agent, content, processedFiles);
                const syntheticResponse: ConversationResponse = {
                    thought: responseContent,
                    emotional_vector: { emotion: agent.emotionalState.primary, intensity: 0.5 },
                    action: { type: 'REPLY', payload: {} },
                    causality_link: 'Direct response to user query'
                };
                agent.omega.train(contextPrompt, syntheticResponse);
            }

            agent.processExperience(`The Architect said to me: "${content}". I replied: "${responseContent}"`, 0.8, 'Architect');

            const agentMsg: SystemChatMessage = {
                id: `msg_${Date.now()+1}`,
                authorId: agent.id,
                authorName: agent.name,
                content: responseContent,
                timestamp: new Date().toISOString(),
            };
            setSystemChats(prev => ({...prev, [agentId]: [...currentChat, userMsg, agentMsg]}));

        } catch (error: any) {
             console.error("Failed to get system agent chat response:", error);
            const errorMsg: SystemChatMessage = {
                id: `msg_error_${Date.now()}`,
                authorId: agent.id,
                authorName: agent.name,
                content: `An error occurred: ${error.message}`,
                timestamp: new Date().toISOString(),
            };
            setSystemChats(prev => ({...prev, [agentId]: [...currentChat, userMsg, errorMsg]}));
        }
    };

    const handleInboxAction = (action: string, messageId: string) => {
        const inbox = metacosmRef.current.state.inbox;
        const msgIndex = inbox.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;
        if (action === 'mark_read') {
            inbox[msgIndex].read = true;
        } else if (action === 'delete') {
            metacosmRef.current.state.inbox = inbox.filter(m => m.id !== messageId);
        } else if (action === 'navigate_to_agent') {
            const msg = inbox[msgIndex];
            if (msg.dataPayload && msg.dataPayload.agentId) {
                setActiveView('simulation');
                alert(`Navigating to Simulation. Locate agent ID: ${msg.dataPayload.agentId}`);
            }
        }
        handleForceUpdate();
    };

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-200 font-sans">
            <AppSidebar activeView={activeView} onSetView={setActiveView} onOptionsOpen={() => setIsOptionsOpen(true)} />
            <main className="flex-1 p-4 overflow-hidden">
                {renderActiveView()}
            </main>
            <OptionsMenu
                isOpen={isOptionsOpen}
                onClose={() => setIsOptionsOpen(false)}
                simulationSpeed={simulationSpeed}
                setSimulationSpeed={setSimulationSpeed}
                onReset={handleReset}
                metacosm={metacosmRef.current}
                onLoadState={(state) => { metacosmRef.current.deserialize(state); handleForceUpdate(); }}
                systemAgents={systemAgents}
                onMutateSystemAgent={(id) => { systemAgents[id]?.dna.mutate(); setSystemAgents({...systemAgents}); }}
                systemChats={systemChats}
                onSystemSendMessage={handleSystemSendMessage}
                egregores={metacosmRef.current.state.egregores}
                onClearAllChats={() => setSystemChats({})}
                originSeed={metacosmRef.current.originSeed}
                ventureForge={ventureForge}
                creations={metacosmRef.current.state.createdWorks}
                onLinkAccount={(id) => alert(`Account link requested for ${id}`)}
                onTransferFunds={() => alert('Transfer funds requested.')}
                notificationPrefs={{}}
                setNotificationPrefs={() => {}}
            />
        </div>
    );

    function renderActiveView() {
        switch (activeView) {
            case 'simulation':
                return <SimulationView metacosm={metacosmRef.current} isRunning={isRunning} onStartPause={() => setIsRunning(!isRunning)} onReset={handleReset} />;
            case 'world':
                return <WorldView metacosm={metacosmRef.current} />;
            case 'genesis':
                return <CreateEgregoreView onGenesis={handleGenesis} originSeed={metacosmRef.current.originSeed} egregores={metacosmRef.current.state.egregores} agentMinds={new Map(Object.entries(systemAgents))} onOriginSeedUpdate={handleForceUpdate} archivistLog={metacosmRef.current.state.archivistLog} />;
            case 'chat':
                return <ChatView metacosm={metacosmRef.current} />;
            case 'console':
                return <ConsoleView metacosm={metacosmRef.current} onStateChange={handleForceUpdate} />;
            case 'creations':
                return <CreationsView creations={metacosmRef.current.state.createdWorks} onAddCreation={(work) => { metacosmRef.current.state.createdWorks.push(work); handleForceUpdate(); }} />;
            case 'venture':
                return <VentureForgeView ventureForgeState={ventureForge} />;
            case 'forum':
                return <ForumView metacosm={metacosmRef.current} onStateChange={handleForceUpdate} />;
            case 'inbox':
                return <InboxView messages={metacosmRef.current.state.inbox} onMessageAction={handleInboxAction} />;
            case 'workshop':
                return <WorkshopView />;
            default:
                return null;
        }
    }
};
