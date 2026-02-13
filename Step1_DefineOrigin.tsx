import React, { useState } from 'react';
import { ProposedEgregore, EgregoreArchetype, Egregore } from '../../../types';
import { DeepPsycheProfile } from '../../../services/geminiServices/index';
import { FromTextTab } from './Step1_Tabs/FromTextTab';
import { ManualInputTab } from './Step1_Tabs/ManualInputTab';
import { AgiPromptTab } from './Step1_Tabs/AgiPromptTab';
import { FusionTab } from './Step1_Tabs/FusionTab';

type Props = {
    proposal: Partial<ProposedEgregore>;
    handleProposalChange: (field: keyof Omit<ProposedEgregore, 'dna'>, value: any) => void;
    sourceMaterial: string;
    setSourceMaterial: (value: string) => void;
    sourceFile: File | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClearFile: () => void;
    isGenerating: boolean;
    applyDnaPreset: (archetypeId: string) => void;
    baseArchetypes: EgregoreArchetype[];
    egregores: Egregore[];
    onStartGenesisFromPrompt: (prompt: string) => Promise<void>;
    onStartGenesisFromFusion: (parentAId: string, parentBId: string) => Promise<void>;
    onEntitiesDetected: (entities: DeepPsycheProfile[]) => void;
};

type GenesisMethod = 'text' | 'prompt' | 'fusion' | 'manual';

const TABS: { id: GenesisMethod, label: string, icon: string }[] = [
    { id: 'text', label: 'Data Seed', icon: '📄' },
    { id: 'prompt', label: 'AGI Invocation', icon: '🔮' },
    { id: 'fusion', label: 'Fusion', icon: '🧬' },
    { id: 'manual', label: 'Manual Build', icon: '🛠️' },
];

export const Step1_DefineOrigin: React.FC<Props> = (props) => {
    const [activeTab, setActiveTab] = useState<GenesisMethod>('text');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'text':
                return <FromTextTab {...props} />;
            case 'manual':
                return <ManualInputTab {...props} />;
            case 'prompt':
                return <AgiPromptTab onStart={props.onStartGenesisFromPrompt} isGenerating={props.isGenerating} />;
            case 'fusion':
                return <FusionTab egregores={props.egregores} onStart={props.onStartGenesisFromFusion} isGenerating={props.isGenerating} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-black/20 p-6 rounded-xl border border-yellow-300/10 shadow-[0_0_15px_rgba(252,211,77,0.1)] relative overflow-hidden group">
            {/* Aesthetic Scanlines */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-yellow-500/30"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-yellow-500/30"></div>

            <div className="mb-4">
                <h3 className="text-xl font-bold mb-1 text-orange-300 uppercase tracking-tighter">Step 1: Injection Phase</h3>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Protocol: Awaiting Source Compilation</p>
            </div>
            
            <div className="flex gap-1 mb-6 bg-black/40 p-1 rounded-lg border border-gray-800">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 px-1 text-[10px] font-bold uppercase tracking-widest transition-all rounded ${activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-300 shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        <span className="block text-sm mb-0.5">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4 min-h-[300px]">
               {renderActiveTab()}
            </div>
        </div>
    );
};