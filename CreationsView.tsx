
import React, { useState } from 'react';
import { CreativeWork } from '../types';
import { forgeCreation } from '../services/geminiServices/index';
import { CREATION_DEFINITIONS, CreationDef, FieldDef } from '../core/creation_definitions';

// --- Components ---

const TypeCard: React.FC<{ def: CreationDef, onSelect: () => void }> = ({ def, onSelect }) => (
    <button 
        onClick={onSelect}
        className="flex flex-col items-start p-4 bg-black/30 border border-gray-700 rounded-xl hover:bg-purple-900/20 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-200 text-left group h-full"
    >
        <h4 className="text-sm font-bold text-gray-200 group-hover:text-purple-300 mb-1">{def.label}</h4>
        <p className="text-xs text-gray-500 leading-snug">{def.description}</p>
    </button>
);

const DynamicInput = ({ field, value, onChange }: { field: FieldDef, value: any, onChange: (val: any) => void }) => {
    const baseClass = "w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors";

    if (field.type === 'textarea') {
        return <textarea 
            className={`${baseClass} min-h-[100px]`} 
            placeholder={field.placeholder} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
        />;
    }
    if (field.type === 'select') {
        return (
            <select className={baseClass} value={value || ''} onChange={e => onChange(e.target.value)}>
                <option value="">-- Select --</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        );
    }
    if (field.type === 'repeatable_group') {
        const items = Array.isArray(value) ? value : [];
        const addItem = () => onChange([...items, {}]);
        const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
        const updateItem = (idx: number, k: string, v: any) => {
            const newItems = [...items];
            newItems[idx] = { ...newItems[idx], [k]: v };
            onChange(newItems);
        };

        return (
            <div className="space-y-2">
                {items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-black/20 rounded border border-gray-700 relative">
                        <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400">&times;</button>
                        <p className="text-xs text-gray-500 mb-2 font-mono">Entry #{idx + 1}</p>
                        <div className="grid gap-2">
                            {field.subFields?.map(sub => (
                                <div key={sub.key}>
                                    <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{sub.label}</label>
                                    <DynamicInput field={sub} value={item[sub.key]} onChange={v => updateItem(idx, sub.key, v)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded">+ Add Entry</button>
            </div>
        );
    }
    
    return <input 
        type={field.type} 
        className={baseClass} 
        placeholder={field.placeholder} 
        value={value || ''} 
        onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
        min={field.min}
        max={field.max}
    />;
};

export const CreationsView = ({ creations, onAddCreation }: { creations: CreativeWork[], onAddCreation?: (work: CreativeWork) => void }) => {
    const [mode, setMode] = useState<'select' | 'forge' | 'result'>('select');
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isForging, setIsForging] = useState(false);
    const [search, setSearch] = useState('');
    const [lastResult, setLastResult] = useState<CreativeWork | null>(null);

    const selectedDef = CREATION_DEFINITIONS.find(d => d.id === selectedTypeId);

    const handleSelect = (id: string) => {
        setSelectedTypeId(id);
        setFormData({});
        // Initialize defaults
        const def = CREATION_DEFINITIONS.find(d => d.id === id);
        if (def) {
            const defaults: any = {};
            def.fields.forEach(f => {
                if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
            });
            setFormData(defaults);
        }
        setMode('forge');
    };

    const handleFieldChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleForge = async () => {
        if (!selectedDef) return;
        setIsForging(true);
        try {
            const result = await forgeCreation(selectedDef.label, formData);
            const newWork: CreativeWork = {
                id: `forge-${Date.now()}`,
                title: result.title,
                content: result.content,
                type: result.type as any,
                authorId: 'Metacosmic Forge',
                contributionValue: 100,
                createdAt: new Date().toISOString()
            };
            if (onAddCreation) onAddCreation(newWork);
            setLastResult(newWork);
            setMode('result');
        } catch (e) {
            alert("The Forge encountered a critical error.");
        } finally {
            setIsForging(false);
        }
    };
    
    const handleViewCreation = (work: CreativeWork) => {
        setLastResult(work);
        setMode('result');
    };
    
    const filteredDefs = CREATION_DEFINITIONS.filter(d => d.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full flex flex-col p-6 text-gray-300 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-end mb-6 border-b border-cyan-500/20 pb-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-widest [text-shadow:0_0_10px_rgba(34,211,238,0.3)]">
                        METACOSMIC FORGE
                    </h2>
                    <p className="text-xs text-cyan-500 font-mono mt-1 tracking-wider">Omni-Universal Creation Interface // v1000.0</p>
                </div>
                {mode !== 'select' && (
                    <button onClick={() => setMode('select')} className="text-xs text-gray-500 hover:text-white">Return to Index</button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                
                {/* MODE: SELECT */}
                {mode === 'select' && (
                    <div className="space-y-8 animate-fade-in">
                        
                        {/* Recent Creations List */}
                        {creations.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Recent Artifacts</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {creations.slice().reverse().map(work => (
                                        <button key={work.id} onClick={() => handleViewCreation(work)} className="text-left p-3 bg-black/40 border border-gray-700 rounded hover:bg-cyan-900/20 hover:border-cyan-500/50 transition-all">
                                            <h4 className="font-bold text-white text-sm truncate">{work.title}</h4>
                                            <p className="text-xs text-gray-500">{work.type}</p>
                                            <p className="text-[10px] text-gray-600 mt-1">By: {work.authorId}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Initiate New Protocol</h3>
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search creation types..." 
                                className="w-full bg-black/40 border border-gray-700 p-3 rounded-lg text-gray-300 focus:border-cyan-500 outline-none mb-4"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDefs.map(def => (
                                    <TypeCard key={def.id} def={def} onSelect={() => handleSelect(def.id)} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODE: FORGE FORM */}
                {mode === 'forge' && selectedDef && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{selectedDef.label}</h3>
                            <p className="text-sm text-gray-400">{selectedDef.description}</p>
                        </div>

                        <div className="bg-black/20 p-6 rounded-xl border border-gray-800 space-y-6 shadow-xl">
                            {selectedDef.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">{field.label}</label>
                                    <DynamicInput 
                                        field={field} 
                                        value={formData[field.key]} 
                                        onChange={v => handleFieldChange(field.key, v)} 
                                    />
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleForge} 
                            disabled={isForging}
                            className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg tracking-widest uppercase hover:from-purple-500 hover:to-cyan-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] relative overflow-hidden group"
                        >
                             <span className="relative z-10">{isForging ? 'Forging Reality...' : 'Forge This Creation Into Existence'}</span>
                             {isForging && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                        </button>
                    </div>
                )}

                {/* MODE: RESULT */}
                {mode === 'result' && lastResult && (
                    <div className="max-w-4xl mx-auto animate-fade-in h-full flex flex-col">
                        <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-8 shadow-2xl flex-grow flex flex-col min-h-0">
                            <div className="text-center border-b border-gray-800 pb-6 mb-6">
                                <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-2 block">Creation Complete</span>
                                <h3 className="text-3xl font-bold text-white mb-2">{lastResult.title}</h3>
                                <p className="text-sm text-gray-500">Type: {lastResult.type} | Author: {lastResult.authorId}</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none flex-grow overflow-y-auto custom-scrollbar font-serif leading-relaxed text-gray-300">
                                <pre className="whitespace-pre-wrap font-sans">{lastResult.content}</pre>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between">
                                <button onClick={() => setMode('select')} className="text-gray-400 hover:text-white">Back to Index</button>
                                {lastResult.authorId === 'Metacosmic Forge' && (
                                    <button onClick={() => setMode('forge')} className="text-cyan-400 hover:text-cyan-300">Edit Parameters</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};