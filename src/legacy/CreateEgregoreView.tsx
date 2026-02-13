import React, { useState } from 'react';
// FIX: Updated imports to use ProposedEgregore and Egregore instead of ProposedGenmeta and Genmeta.
import { ProposedEgregore, Egregore, ArchivistLogEntry } from '../types';
import { GenesisChamberView } from './CreateEgregore/GenesisChamberView';
import { LineageView } from './CreateEgregore/LineageView';
import { CodexHarmonizationView } from './CreateEgregore/CodexHarmonizationView';
import { AgentMind } from '../core/agentMind';
import { DeepPsycheProfile } from '../services/geminiServices/index';

type TabId = 'chamber' | 'lineage' | 'codex';

const TABS: { id: TabId, label: string }[] = [
    { id: 'chamber', label: 'Genesis Chamber' },
    { id: 'lineage', label: 'Lineage Viewer' },
    { id: 'codex', label: 'Codex Harmonization' },
];

// FIX: Renamed CreateGenmetaViewProps to CreateEgregoreViewProps and updated types.
type CreateEgregoreViewProps = {
    onGenesis: (options: ProposedEgregore, sourceMaterial: string, deepProfile?: DeepPsycheProfile) => Promise<void>;
    originSeed: AgentMind;
    egregores: Egregore[];
    agentMinds: Map<string, AgentMind>;
    onOriginSeedUpdate: () => void;
    archivistLog?: ArchivistLogEntry[];
};

export const CreateEgregoreView = ({ onGenesis, originSeed, egregores, agentMinds, onOriginSeedUpdate, archivistLog }: CreateEgregoreViewProps) => {
    const [activeTab, setActiveTab] = useState<TabId>('chamber');

    const renderView = () => {
        switch (activeTab) {
            case 'chamber':
                // FIX: Updated genmetas prop to egregores to match new GenesisChamberView prop name.
                return <GenesisChamberView onGenesis={onGenesis} originSeed={originSeed} egregores={egregores} />;
            case 'lineage':
                return <LineageView />;
            case 'codex':
                return <CodexHarmonizationView
                    originSeed={originSeed}
                    egregores={egregores}
                    agentMinds={agentMinds}
                    onOriginSeedUpdate={onOriginSeedUpdate}
                    archivistLog={archivistLog}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col text-gray-300">
            <nav className="flex-shrink-0 flex items-center border-b border-yellow-300/10">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-300 border-b-2 border-yellow-400' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main className="flex-grow p-4 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};