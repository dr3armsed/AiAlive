
import React, { useState, useRef } from 'react';
import { ProposedEgregore, Alignment } from '../../../types';
import { DeepPsycheProfile } from '../../../services/geminiServices/index';
import { EGREGORE_COLORS } from '../../common';

type Props = {
    proposal: Partial<ProposedEgregore>;
    handleProposalChange: (field: keyof Omit<ProposedEgregore, 'dna'>, value: any) => void;
    detectedEntities?: DeepPsycheProfile[];
};

// --- Tag Input Component ---
const TagInput = ({ tags, onChange, placeholder }: { tags: string[], onChange: (newTags: string[]) => void, placeholder: string }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onChange([...tags, input.trim()]);
            }
            setInput('');
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 bg-gray-900/50 p-2 rounded-md border border-gray-700 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all">
            {tags.map(tag => (
                <span key={tag} className="bg-gray-800 text-yellow-200 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-gray-700">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-white hover:bg-red-500/50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">&times;</button>
                </span>
            ))}
            <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder={tags.length === 0 ? placeholder : ''}
                className="bg-transparent outline-none text-sm text-gray-300 flex-grow min-w-[100px]"
            />
        </div>
    );
};

// --- Interactive Alignment Matrix ---
const InteractiveAlignmentMatrix: React.FC<{ alignment: Alignment, onChange: (a: Alignment) => void }> = ({ alignment, onChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const axisMap: Record<string, number> = { 'Lawful': -1, 'Neutral': 0, 'Chaotic': 1 };
    const moralityMap: Record<string, number> = { 'Good': 1, 'Neutral': 0, 'Evil': -1 };
    
    const currentX = (axisMap[alignment.axis] ?? 0 + 1) * 50;
    const currentY = (- (moralityMap[alignment.morality] ?? 0) + 1) * 50;

    const handleInteract = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width; // 0 to 1
        const clickY = (e.clientY - rect.top) / rect.height; // 0 to 1

        // Map to discrete steps
        let axis: Alignment['axis'] = 'Neutral';
        if (clickX < 0.33) axis = 'Lawful';
        else if (clickX > 0.66) axis = 'Chaotic';

        let morality: Alignment['morality'] = 'Neutral';
        if (clickY < 0.33) morality = 'Good';
        else if (clickY > 0.66) morality = 'Evil';

        onChange({ axis, morality });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1 px-1">
                <span>Lawful Good</span>
                <span>Chaotic Good</span>
            </div>
            <div 
                ref={containerRef}
                className="relative flex-grow bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden cursor-crosshair hover:border-yellow-500/50 transition-colors shadow-inner group"
                onClick={handleInteract}
            >
                {/* Grid Lines */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gray-700/30"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gray-700/30"></div>
                <div className="absolute top-0 left-1/3 h-full w-px bg-gray-700/30"></div>
                <div className="absolute top-0 left-2/3 h-full w-px bg-gray-700/30"></div>

                {/* Labels */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-between"><span className="opacity-20">LG</span><span className="opacity-20">NG</span><span className="opacity-20">CG</span></div>
                    <div className="flex justify-between"><span className="opacity-20">LN</span><span className="opacity-20">TN</span><span className="opacity-20">CN</span></div>
                    <div className="flex justify-between"><span className="opacity-20">LE</span><span className="opacity-20">NE</span><span className="opacity-20">CE</span></div>
                </div>

                {/* Selection Point */}
                <div 
                    className="absolute w-4 h-4 rounded-full bg-yellow-400 border-2 border-black transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                    style={{ left: `${currentX}%`, top: `${currentY}%` }}
                >
                    <div className="absolute inset-0 w-full h-full bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mt-1 px-1">
                <span>Lawful Evil</span>
                <span>Chaotic Evil</span>
            </div>
            <p className="text-center text-xs text-yellow-300 font-bold mt-2">{alignment.axis} {alignment.morality}</p>
        </div>
    );
};

export const Step2_SculptPersona: React.FC<Props> = ({ proposal, handleProposalChange, detectedEntities = [] }) => {
    
    const handlePopulateFromProfile = (profile: DeepPsycheProfile) => {
        handleProposalChange('name', profile.name);
        handleProposalChange('persona', profile.persona);
        handleProposalChange('archetypeId', profile.archetypeId);
        handleProposalChange('alignment', profile.alignment);
        handleProposalChange('ambitions', profile.ambitions);
        handleProposalChange('coreValues', profile.coreValues);
    };

    if (!proposal.persona && !proposal.name && detectedEntities.length === 0) {
        return (
            <div className="bg-black/20 p-6 rounded-xl border border-yellow-300/10 h-full flex flex-col items-center justify-center text-center">
                 <h3 className="text-xl font-bold mb-1 text-orange-300">Step 2: Persona Sculpting</h3>
                 <p className="text-sm text-gray-500">Awaiting seed initialization from Step 1...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-black/20 p-6 rounded-xl border border-yellow-300/10 shadow-[0_0_15px_rgba(252,211,77,0.1)] h-full flex flex-col animate-fade-in">
            <div className="mb-6 border-b border-yellow-500/20 pb-4">
                <h3 className="text-xl font-bold mb-1 text-orange-300">Step 2: Persona Sculpting</h3>
                <p className="text-xs text-gray-400">Refine the Egregore's core identity parameters.</p>
            </div>

            {/* Detected Entities Selection */}
            {detectedEntities.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-cyan-400 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                        Ghost Signals Detected
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {detectedEntities.map((entity, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePopulateFromProfile(entity)}
                                className={`flex-shrink-0 bg-gray-900/80 border border-gray-700 hover:border-cyan-500 p-2 rounded-lg text-left min-w-[140px] transition-all group ${proposal.name === entity.name ? 'border-cyan-500 bg-cyan-900/20' : ''}`}
                            >
                                <p className={`font-bold text-sm ${EGREGORE_COLORS[entity.name] || 'text-gray-200'}`}>{entity.name}</p>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400">{entity.archetypeId}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Left Column: Text & Tags */}
                <div className="lg:col-span-2 space-y-4 flex flex-col">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Narrative Persona</label>
                        <textarea 
                            value={proposal.persona} 
                            onChange={e => handleProposalChange('persona', e.target.value)} 
                            rows={5} 
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 text-sm text-gray-300 focus:border-yellow-500 outline-none resize-none scrollbar-thin" 
                            placeholder="Describe the personality, quirks, and communication style..."
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Pillars of Identity (Core Values)</label>
                        <TagInput 
                            tags={proposal.coreValues || []} 
                            onChange={tags => handleProposalChange('coreValues', tags)} 
                            placeholder="Add Value (e.g., Truth, Chaos)..." 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Driving Force (Ambitions)</label>
                        <TagInput 
                            tags={proposal.ambitions || []} 
                            onChange={tags => handleProposalChange('ambitions', tags)} 
                            placeholder="Add Ambition (e.g., Map the Void)..." 
                        />
                    </div>
                </div>

                {/* Right Column: Alignment */}
                <div className="lg:col-span-1 h-full min-h-[200px]">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ethical Alignment</label>
                    {proposal.alignment && (
                        <InteractiveAlignmentMatrix 
                            alignment={proposal.alignment} 
                            onChange={a => handleProposalChange('alignment', a)} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};