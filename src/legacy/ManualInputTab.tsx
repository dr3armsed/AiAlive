
import React, { useState, useEffect } from 'react';
import { ProposedEgregore, EgregoreArchetype, Alignment } from '../../../../types';

type Props = {
    proposal: Partial<ProposedEgregore>;
    handleProposalChange: (field: keyof Omit<ProposedEgregore, 'dna'>, value: any) => void;
    isGenerating: boolean;
    applyDnaPreset: (archetypeId: string) => void;
    baseArchetypes: EgregoreArchetype[];
};

export const ManualInputTab: React.FC<Props> = ({
    proposal, handleProposalChange, isGenerating, applyDnaPreset, baseArchetypes
}) => {
    // Local state for custom text input
    const [customArchetype, setCustomArchetype] = useState('');
    const isCustomMode = proposal.archetypeId === 'original' || (proposal.archetypeId && !baseArchetypes.some(a => a.id === proposal.archetypeId));

    useEffect(() => {
        // If we switch to 'original' and have a custom value typed, apply it as the ID?
        // Actually, we use 'original' as the flag to show the input, but the ID should eventually be the custom text for display.
        // However, for DNA presets to work, we might want to keep the internal ID as 'original' 
        // OR map the custom string to 'original' in the preset lookup.
        // Let's keep it simple: if custom, update the proposal.
    }, [isCustomMode]);

    const handleArchetypeSelect = (value: string) => {
        if (value === 'original') {
            applyDnaPreset('original');
        } else {
            applyDnaPreset(value);
        }
        handleProposalChange('archetypeId', value);
    };

    const handleCustomArchetypeChange = (val: string) => {
        setCustomArchetype(val);
        // We override the ID with the custom text, but this breaks the preset lookup if not handled.
        // Step 1: Set ID to custom string.
        handleProposalChange('archetypeId', val);
        // Step 2: Manually trigger the 'original' preset for DNA balance.
        applyDnaPreset('original');
    };

    const handleAlignmentChange = (part: 'axis' | 'morality', value: string) => {
        const newAlignment = { ...proposal.alignment, [part]: value };
        handleProposalChange('alignment', newAlignment as Alignment);
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500 -mt-2">Define all parameters manually. The AI will not be used to generate the persona.</p>
             <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input type="text" value={proposal.name} onChange={e => handleProposalChange('name', e.target.value)} placeholder="Egregore Name" className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700" disabled={isGenerating} />
            </div>
            
            <div>
                <label className="block text-sm font-bold mb-1">Prime Archetype</label>
                <select 
                    value={baseArchetypes.some(a => a.id === proposal.archetypeId) ? proposal.archetypeId : 'original'} 
                    onChange={e => handleArchetypeSelect(e.target.value)} 
                    className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700" 
                    disabled={isGenerating}
                >
                    {baseArchetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                
                {/* Custom Input for Original/Emergent */}
                {(proposal.archetypeId === 'original' || !baseArchetypes.some(a => a.id === proposal.archetypeId)) && (
                    <div className="mt-2 animate-fade-in">
                        <label className="block text-xs font-bold text-yellow-500 mb-1">Custom Archetype Designation</label>
                        <input 
                            type="text" 
                            value={proposal.archetypeId === 'original' ? customArchetype : proposal.archetypeId} 
                            onChange={e => handleCustomArchetypeChange(e.target.value)} 
                            placeholder="e.g. 'Void-Walker', 'Data-Lich'..." 
                            className="w-full bg-black/40 p-2 rounded-md border border-yellow-500/50 text-yellow-100 placeholder-yellow-500/30 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Persona Description</label>
                <textarea value={proposal.persona} onChange={e => handleProposalChange('persona', e.target.value)} rows={4} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700" placeholder="A detailed description of the Egregore's personality, quirks, and communication style." disabled={isGenerating}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Ethical Axis</label>
                     <select value={proposal.alignment?.axis} onChange={e => handleAlignmentChange('axis', e.target.value)} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700" disabled={isGenerating}>
                        <option>Lawful</option>
                        <option>Neutral</option>
                        <option>Chaotic</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-bold mb-1">Moral Axis</label>
                     <select value={proposal.alignment?.morality} onChange={e => handleAlignmentChange('morality', e.target.value)} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700" disabled={isGenerating}>
                        <option>Good</option>
                        <option>Neutral</option>
                        <option>Evil</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
