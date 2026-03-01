

import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import type { GenesisProfile, Belief } from '../../types/index.ts';

const MotionButton = motion.button as any;

interface ManualCreationFormProps {
  onGenesis: (name: string, persona: GenesisProfile) => void;
  isLoading: boolean;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
        <input
            type="text"
            className="w-full bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
            {...props}
        />
    </div>
);

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
        <textarea
            rows={2}
            className="w-full bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
            {...props}
        />
    </div>
);

const ManualCreationForm: React.FC<ManualCreationFormProps> = ({ onGenesis, isLoading }) => {
    const [name, setName] = useState('');
    const [persona, setPersona] = useState<GenesisProfile>({
        summary: '',
        coreTraits: [''],
        motivations: [''],
        fears: [''],
        speakingStyle: '',
        relationships: [],
        beliefs: [{ tenet: '', conviction: 0.8 }]
    });

    const handleArrayChange = (field: 'coreTraits' | 'motivations' | 'fears', index: number, value: string) => {
        const newArray = [...persona[field]];
        newArray[index] = value;
        setPersona(p => ({ ...p, [field]: newArray }));
    };
    
    const addArrayItem = (field: 'coreTraits' | 'motivations' | 'fears') => {
        setPersona(p => ({ ...p, [field]: [...p[field], '']}));
    };
    
    const removeArrayItem = (field: 'coreTraits' | 'motivations' | 'fears', index: number) => {
        if(persona[field].length <= 1) return;
        setPersona(p => ({ ...p, [field]: persona[field].filter((_, i) => i !== index)}));
    };
    
    const handleBeliefChange = (index: number, value: Partial<Belief>) => {
        const newBeliefs = [...persona.beliefs];
        newBeliefs[index] = { ...newBeliefs[index], ...value };
        setPersona(p => ({ ...p, beliefs: newBeliefs }));
    };

    const addBelief = () => {
        setPersona(p => ({...p, beliefs: [...p.beliefs, { tenet: '', conviction: 0.5 }]}));
    }

    const removeBelief = (index: number) => {
        if (persona.beliefs.length <= 1) return;
        setPersona(p => ({...p, beliefs: persona.beliefs.filter((_, i) => i !== index)}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !persona.summary.trim() || isLoading) return;
        const cleanedPersona = {
            ...persona,
            coreTraits: persona.coreTraits.filter(t => t.trim()),
            motivations: persona.motivations.filter(t => t.trim()),
            fears: persona.fears.filter(t => t.trim()),
            beliefs: persona.beliefs.filter(b => b.tenet.trim())
        }
        onGenesis(name, cleanedPersona);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
            <InputField label="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            <TextAreaField label="Summary" value={persona.summary} onChange={(e) => setPersona(p => ({...p, summary: e.target.value}))} disabled={isLoading} />
            <TextAreaField label="Speaking Style" value={persona.speakingStyle} onChange={(e) => setPersona(p => ({...p, speakingStyle: e.target.value}))} disabled={isLoading} />
            
            {['coreTraits', 'motivations', 'fears'].map(field => (
                <div key={field}>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1 capitalize">{field.replace('coreT', 'Core T')}</label>
                    <div className="space-y-2">
                    {persona[field as 'coreTraits' | 'motivations' | 'fears'].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                           <input
                             type="text"
                             value={item}
                             onChange={(e) => handleArrayChange(field as any, index, e.target.value)}
                             disabled={isLoading}
                             className="flex-grow w-full bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
                           />
                           <button type="button" onClick={() => removeArrayItem(field as any, index)} disabled={isLoading || persona[field as 'coreTraits' | 'motivations' | 'fears'].length <= 1} className="p-1 text-red-400 disabled:opacity-30">x</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem(field as any)} className="text-xs text-blue-400 hover:underline">+ Add</button>
                    </div>
                </div>
            ))}

            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Beliefs</label>
                <div className="space-y-3">
                    {persona.beliefs.map((belief, index) => (
                         <div key={index} className="flex items-start gap-2 p-2 bg-[var(--color-surface-inset)] rounded-lg">
                           <div className="flex-grow">
                             <input
                               type="text"
                               value={belief.tenet}
                               placeholder="Tenet"
                               onChange={(e) => handleBeliefChange(index, { tenet: e.target.value })}
                               disabled={isLoading}
                               className="w-full bg-black/20 border-2 border-transparent focus:border-[var(--color-border-interactive)] rounded-lg py-1 px-2 text-sm text-white placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors disabled:opacity-50"
                             />
                              <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={belief.conviction}
                                onChange={(e) => handleBeliefChange(index, { conviction: parseFloat(e.target.value) })}
                                disabled={isLoading}
                                className="w-full mt-2 h-1 accent-[var(--color-accent-purple)]"
                              />
                           </div>
                           <button type="button" onClick={() => removeBelief(index)} disabled={isLoading || persona.beliefs.length <= 1} className="p-1 text-red-400 disabled:opacity-30 mt-1">x</button>
                        </div>
                    ))}
                    <button type="button" onClick={addBelief} className="text-xs text-blue-400 hover:underline">+ Add Belief</button>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                 <MotionButton
                    type="submit"
                    disabled={!name.trim() || !persona.summary.trim() || isLoading}
                    className="w-64 font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-magenta)] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:shadow-xl"
                    whileHover={{ scale: !name.trim() || !persona.summary.trim() || isLoading ? 1 : 1.05, y: !name.trim() || !persona.summary.trim() || isLoading ? 0 : -2 }}
                    whileTap={{ scale: !name.trim() || !persona.summary.trim() || isLoading ? 1 : 0.95 }}
                >
                    Create Soul
                </MotionButton>
            </div>
        </form>
    );
};

export default ManualCreationForm;