
import React, { useState } from 'react';
import { SystemChatMessage, VentureForgeState, CreativeWork, Egregore } from '../../../types';
import { Metacosm } from '../../../core/metacosm';
import { GeneralSettingsView } from '../GeneralSettings/GeneralSettingsView';
import { AccountsView } from '../Accounts/AccountsView';
import { SystemConverseView } from '../SystemConverseView';
import { AboutView } from '../About/AboutView';
import { EgregoresView } from '../Egregores/EgregoresView';
import { MemoryExplorerView } from '../MemoryExplorer/MemoryExplorerView';
import { AgentMind } from '../../../core/agentMind';
import { OptionsHeader } from './OptionsHeader';
import { OptionsTabs } from './OptionsTabs';
import { PersistenceService } from '../../../services/persistenceService';

type OptionsMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    systemChats: Record<string, SystemChatMessage[]>;
    onSystemSendMessage: (systemId: string, content: string, files: File[]) => Promise<void>;
    simulationSpeed: number;
    setSimulationSpeed: (speed: number) => void;
    onReset: () => void;
    onClearAllChats: () => void;
    ventureForge: VentureForgeState;
    creations: CreativeWork[];
    onLinkAccount: (accountId: string) => void;
    onTransferFunds: () => void;
    notificationPrefs: Record<string, boolean>;
    setNotificationPrefs: (prefs: Record<string, boolean>) => void;
    metacosm: Metacosm;
    onLoadState: (serializedState: string) => void;
    systemAgents: Record<string, AgentMind>;
    onMutateSystemAgent: (id: string) => void;
    egregores: Egregore[];
    originSeed: AgentMind;
};

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ 
    isOpen, onClose, systemChats, onSystemSendMessage, simulationSpeed, setSimulationSpeed, onReset, onClearAllChats,
    ventureForge, creations, onLinkAccount, onTransferFunds, notificationPrefs, setNotificationPrefs,
    metacosm, onLoadState, systemAgents, onMutateSystemAgent, egregores, originSeed,
}) => {
    type TabId = 'converse' | 'general' | 'accounts' | 'about' | 'egregores' | 'memory';
    const [activeTab, setActiveTab] = useState<TabId>('general');

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'accounts', label: 'Accounts' },
        { id: 'egregores', label: 'Egregores' },
        { id: 'memory', label: 'Memory' },
        { id: 'converse', label: 'System Agents' },
        { id: 'about', label: 'About' },
    ];
    
    const handleFullExport = async () => {
        await PersistenceService.exportUniverse(metacosm, systemAgents, systemChats);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettingsView 
                    simulationSpeed={simulationSpeed}
                    setSimulationSpeed={setSimulationSpeed}
                    onReset={onReset}
                    onClearAllChats={onClearAllChats}
                    notificationPrefs={notificationPrefs}
                    setNotificationPrefs={setNotificationPrefs}
                    metacosm={metacosm}
                    onLoadState={onLoadState}
                    onExport={handleFullExport}
                />;
            case 'accounts':
                return <AccountsView ventureForge={ventureForge} creations={creations} onLinkAccount={onLinkAccount} onTransferFunds={onTransferFunds} />;
            case 'egregores':
                return <EgregoresView egregores={egregores} />;
            case 'memory':
                return <MemoryExplorerView />;
            case 'converse':
                return <SystemConverseView agents={systemAgents} onMutateAgent={onMutateSystemAgent} chats={systemChats} onSendMessage={onSystemSendMessage} />;
            case 'about':
                return <AboutView />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center animate-fade-in p-4 sm:p-8">
            <div className="w-full h-full max-w-6xl max-h-[90vh] p-4 sm:p-6 bg-black/30 border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/20 flex flex-col">
                <OptionsHeader onClose={onClose} />
                <OptionsTabs tabs={tabs} activeTab={activeTab} setActiveTab={(id) => setActiveTab(id as TabId)} />
                <main className="flex-grow min-h-0">
                    {renderActiveTab()}
                </main>
            </div>
        </div>
    );
};
