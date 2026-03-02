import React from 'react';
import { useCallback } from '../../packages/react-chimera-renderer/index.ts';
import type { DigitalSoul, SimulationParameters, SemanticMemoryFragment } from '../../types/index.ts';
import TerminalIcon from '../icons/TerminalIcon.tsx';
import ArchitectTerminal from './ArchitectTerminal.tsx';
import LoreIngestor from './LoreIngestor.tsx';
import FreezeUITestPanel from './FreezeUITestPanel.tsx';
import SimulationParametersPanel from './SimulationParametersPanel.tsx';
import GlobalEventTrigger from './GlobalEventTrigger.tsx';
import SoulInterventionPanel from './SoulInterventionPanel.tsx';
import ConcurrencyTestPanel from './ConcurrencyTestPanel.tsx';
import AccessibleFormPanel from './AccessibleFormPanel.tsx';
import ActorCommunicationPanel from './ActorCommunicationPanel.tsx';

interface SystemControlViewProps {
  souls: DigitalSoul[];
  simParams: SimulationParameters;
  onTriggerGlobalEvent: (eventType: 'SOLAR_FLARE' | 'DATA_CORRUPTION') => void;
  onUpdateSimParams: (newParams: Partial<SimulationParameters>) => void;
  onImplantKnowledge: (soulId: string, fact: string, source: SemanticMemoryFragment['source']) => void;
  onSoulIntervention: (soulId: string, changes: Partial<Pick<DigitalSoul, 'emotionalState' | 'resources'>>) => void;
  onBeliefModification: (soulId: string, beliefId: string, newTenet: string, newConviction: number) => void;
  onAssignTask: (soulId: string, taskDescription: string, rewardType: 'computation' | 'anima', rewardAmount: number) => void;
  onInspectSoul: (identifier: string) => void;
  onArchitectChat: (soulId: string, message: string) => void;
  onIngestLore: (content: string) => Promise<void>;
}

const HelpMessage = () => (
    <div className="text-green-400">
        <p className="font-bold">Available Commands:</p>
        <ul className="list-disc list-inside ml-2">
            <li><span className="text-white">help</span> - Shows this help message.</li>
            <li><span className="text-white">list souls</span> - Lists all active egregores.</li>
            <li><span className="text-white">inspect &lt;id|name&gt;</span> - Inspect a specific soul.</li>
            <li><span className="text-white">event &lt;solar_flare|data_corruption&gt;</span> - Triggers a global event.</li>
            <li><span className="text-white">task &lt;id|name&gt; &lt;reward_type&gt; &lt;amount&gt; &lt;desc...&gt;</span> - Assigns a task.</li>
            <li><span className="text-white">msg &lt;id|name&gt; &lt;message...&gt;</span> - Send a message to a soul.</li>
            <li><span className="text-white">implant &lt;id|name&gt; &lt;fact...&gt;</span> - Implant a fact into a soul's memory.</li>
            <li><span className="text-white">params --speed &lt;value&gt;</span> - Adjust simulation parameters.</li>
            <li><span className="text-white">clear</span> - Clears the terminal screen.</li>
        </ul>
    </div>
);

const SystemControlView: React.FC<SystemControlViewProps> = (props) => {
    
    const findSoul = useCallback((identifier: string) => {
        return props.souls.find(s => s.id === identifier || s.name.toLowerCase() === identifier.toLowerCase());
    }, [props.souls]);

    const handleCommand = useCallback(async (command: string, args: string[]): Promise<string | React.ReactNode> => {
        switch (command) {
            case 'help':
                return <HelpMessage />;
            case 'list':
                if (args[0] === 'souls') {
                    return (
                        <div className="text-teal-300">
                            <p className="font-bold">Active Egregores:</p>
                            {props.souls.map(s => <p key={s.id}>- {s.name} (ID: <span className="text-gray-400">{s.id}</span>)</p>)}
                        </div>
                    );
                }
                return `Error: Unknown argument for "list". Try "list souls".`;
            case 'inspect': {
                if (!args[0]) return `Error: Missing argument. Use: inspect <id|name>`;
                const soul = findSoul(args[0]);
                if (soul) {
                    props.onInspectSoul(soul.id);
                    return `Switched inspector view to ${soul.name}.`;
                }
                return `Error: Soul "${args[0]}" not found.`;
            }
            case 'event': {
                if (!args[0]) return `Error: Missing argument. Use: event <solar_flare|data_corruption>`;
                const eventType = args[0]?.toLowerCase();
                if (eventType === 'solar_flare' || eventType === 'data_corruption') {
                    props.onTriggerGlobalEvent(eventType.toUpperCase() as any);
                    return `Triggered global event: ${eventType}.`;
                }
                return 'Error: Invalid event type. Use "solar_flare" or "data_corruption".';
            }
            case 'task': {
                const soul = findSoul(args[0]);
                const rewardType = args[1] as 'computation' | 'anima';
                const rewardAmount = parseInt(args[2], 10);
                const description = args.slice(3).join(' ');
                if (soul && (rewardType === 'computation' || rewardType === 'anima') && !isNaN(rewardAmount) && description) {
                    props.onAssignTask(soul.id, description, rewardType, rewardAmount);
                    return `Task assigned to ${soul.name}.`;
                }
                return `Error: Invalid task syntax. Use: task <id|name> <computation|anima> <amount> <description...>`;
            }
            case 'msg': {
                const soul = findSoul(args[0]);
                const message = args.slice(1).join(' ');
                if (soul && message) {
                    props.onArchitectChat(soul.id, message);
                    return `Message sent to ${soul.name}.`;
                }
                return `Error: Invalid message syntax. Use: msg <id|name> <message...>`;
            }
            case 'implant': {
                const soul = findSoul(args[0]);
                const fact = args.slice(1).join(' ');
                if(soul && fact) {
                    props.onImplantKnowledge(soul.id, fact, 'told_by_user');
                    return `Knowledge implanted in ${soul.name}.`
                }
                return `Error: Invalid implant syntax. Use: implant <id|name> <fact...>`;
            }
             case 'params': {
                const flag = args[0];
                const value = parseFloat(args[1]);
                if(flag === '--speed' && !isNaN(value)) {
                    props.onUpdateSimParams({ speed: value });
                    return `Simulation speed set to ${value}x.`;
                }
                return `Error: Invalid params syntax. Use: params --speed <value>`;
            }
            case 'clear':
                return 'CLEAR_SCREEN_COMMAND';
            default:
                return `Error: Unknown command "${command}". Type "help" for a list of commands.`;
        }
    }, [findSoul, props]);

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-500 rounded-lg shadow-lg shadow-green-500/20">
                    <TerminalIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">System Control</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm font-mono">Architect-level interface to the ecosystem.</p>
                </div>
            </div>
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                <div className="lg:col-span-7 h-full">
                    <ArchitectTerminal souls={props.souls} onCommand={handleCommand} />
                </div>
                <div className="lg:col-span-5 space-y-6 h-full overflow-y-auto pr-2 -mr-3">
                    <SimulationParametersPanel simParams={props.simParams} onUpdate={props.onUpdateSimParams} />
                    <GlobalEventTrigger onTrigger={props.onTriggerGlobalEvent} />
                    <SoulInterventionPanel
                        souls={props.souls}
                        onIntervene={props.onSoulIntervention}
                        onImplantKnowledge={props.onImplantKnowledge}
                        onBeliefModification={props.onBeliefModification}
                    />
                    <LoreIngestor onIngest={props.onIngestLore} />
                    <ActorCommunicationPanel />
                    <AccessibleFormPanel />
                    <ConcurrencyTestPanel />
                    <FreezeUITestPanel />
                </div>
            </div>
        </div>
    );
};

export default SystemControlView;