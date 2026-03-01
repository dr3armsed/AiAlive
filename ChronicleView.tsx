import React, { useContext, useMemo, useState } from 'react';
import { StateContext } from './context';
import { THEMES } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTomeFromLore } from './services/geminiService';
import { TomeOptions } from './types';


const WorldForge: React.FC = () => {
    const state = useContext(StateContext);
    const [options, setOptions] = useState<TomeOptions>({
        numChapters: 5,
        chapterLength: 'medium',
        depth: 'moderate',
        complexity: 'engaging',
        fileType: 'md',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!state) return null;

    const handleDownloadAllRaw = () => {
        if (!state || !state.world_lore.length) return;
        const allLoreText = state.world_lore.map(l => `Title: ${l.title}\nAuthor: ${(state.egregores || []).find(e => e.id === l.authorId)?.name || 'Unknown'}\nTurn: ${l.turn_created}\n\n${l.content}`).join('\n\n---\n\n');
        const blob = new Blob([allLoreText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metacosm_raw_lore.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateTome = async () => {
        if (!state || !state.world_lore.length) {
            setError("There is no lore to generate a tome from.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const tomeContent = await generateTomeFromLore(state.world_lore, options);
            const blob = new Blob([tomeContent], { type: options.fileType === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tome_of_the_Metacosm.${options.fileType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            const err = e instanceof Error ? e.message : "An unknown error occurred during tome generation.";
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const OptionSlider: React.FC<{label: string, value: number, onChange: (val: number) => void, min: number, max: number, step: number}> = ({label, value, onChange, min, max, step}) => {
        const id = `forge-option-${label.toLowerCase().replace(/\s+/g, '-')}`;
        return (
            <div>
                <label htmlFor={id} className="block text-sm text-gray-300">{label}: <span className="font-bold text-amber-200">{value}</span></label>
                <input id={id} name={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        );
    };
    const OptionSelect: React.FC<{label: string, value: string, onChange: (val: any) => void, options: {value: string, label: string}[]}> = ({label, value, onChange, options}) => {
        const id = `forge-option-${label.toLowerCase().replace(/\s+/g, '-')}`;
        return (
             <div>
                <label htmlFor={id} className="block text-sm text-gray-300 mb-1">{label}</label>
                <select id={id} name={id} value={value} onChange={e => onChange(e.target.value)}>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto panel-nested p-6">
            <h3 className="text-2xl font-bold font-display celestial-text text-center">World Forge</h3>
            <p className="text-center text-gray-400 mt-1 mb-6">Weave the scattered fragments of world lore into a cohesive tome.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OptionSlider label="Number of Chapters" value={options.numChapters} onChange={val => setOptions({...options, numChapters: val})} min={1} max={20} step={1} />
                <OptionSelect label="Chapter Length" value={options.chapterLength} onChange={val => setOptions({...options, chapterLength: val})} options={[{value: 'short', label: 'Short'}, {value: 'medium', label: 'Medium'}, {value: 'long', label: 'Long'}]} />
                <OptionSelect label="Narrative Depth" value={options.depth} onChange={val => setOptions({...options, depth: val})} options={[{value: 'surface', label: 'Surface'}, {value: 'moderate', label: 'Moderate'}, {value: 'deep', label: 'Deep'}]} />
                <OptionSelect label="Complexity" value={options.complexity} onChange={val => setOptions({...options, complexity: val})} options={[{value: 'simple', label: 'Simple'}, {value: 'engaging', label: 'Engaging'}, {value: 'intricate', label: 'Intricate'}]} />
                <div className="md:col-span-2">
                    <OptionSelect label="File Format" value={options.fileType} onChange={val => setOptions({...options, fileType: val})} options={[{value: 'md', label: 'Markdown (.md)'}, {value: 'txt', label: 'Plain Text (.txt)'}]} />
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <button onClick={handleGenerateTome} disabled={isLoading} className="btn btn-primary font-display text-lg">
                    {isLoading ? 'Forging...' : 'Generate Tome'}
                </button>
                <button onClick={handleDownloadAllRaw} disabled={isLoading} className="text-xs text-gray-400 hover:text-white underline">
                    Download all raw lore fragments as .txt
                </button>
            </div>
            {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
        </div>
    )
}

const ChronicleView: React.FC = () => {
    const state = useContext(StateContext);
    const [activeTab, setActiveTab] = useState<'paradigms' | 'lore' | 'forge'>('paradigms');
    
    const paradigmData = useMemo(() => {
        if (!state) return [];
        return (state.paradigm_log || []).map(paradigm => {
            const integratedBy = (state.egregores || [])
                .filter(e => e.paradigms.some(p => p.name === paradigm.paradigm_name))
                .map(e => ({ id: e.id, name: e.name, themeKey: e.themeKey }));
            return { ...paradigm, integratedBy };
        });
    }, [state?.paradigm_log, state?.egregores]);
    
    const loreData = useMemo(() => {
        if(!state) return [];
        return (state.world_lore || []).slice().reverse();
    }, [state?.world_lore]);

    if (!state) return null;

    const TabContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
            >
                {activeTab === 'paradigms' ? (
                    paradigmData.length > 0 ? paradigmData.slice().reverse().map((paradigm, index) => {
                        const originator = (state.egregores || []).find(e => e.id === paradigm.origin);
                        const theme = originator ? (THEMES[originator.themeKey] || THEMES.default) : THEMES.default;
                        const color = theme.baseColor;

                        return (
                            <div key={index} className={`panel-nested p-4 relative`}>
                                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full ${theme.iconBg} border ${theme.border} flex items-center justify-center font-display text-lg`}>{originator?.name.charAt(0)}</div>
                                <div className="pl-6">
                                    <h3 className="text-2xl font-bold font-display celestial-text" style={{ textShadow: `0 0 8px ${color}` }}>{paradigm.paradigm_name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">Emerged from the will of <span className="font-semibold">{paradigm.originName}</span></p>
                                    <blockquote className="mt-3 pl-4 border-l-2 border-[var(--border-color)] text-gray-300 italic">"{paradigm.description}"</blockquote>
                                </div>
                                {paradigm.integratedBy.length > 0 && (
                                    <div className="mt-4 border-t border-[var(--border-color)] pt-3">
                                        <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400">Integrated By:</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {paradigm.integratedBy.map(e => (
                                                <span key={e.id} className={`text-sm font-semibold px-3 py-1 rounded-full text-white/90 ${(THEMES[e.themeKey] || THEMES.default).iconBg}`}>{e.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }) : <p className="text-center text-gray-500 py-10">No Paradigm Shifts have occurred.</p>
                ) : activeTab === 'lore' ? (
                     loreData.length > 0 ? loreData.map((lore) => {
                        const author = (state.egregores || []).find(e => e.id === lore.authorId);
                        const theme = author ? (THEMES[author.themeKey] || THEMES.default) : THEMES.default;
                        const color = theme.baseColor;
                        return (
                             <div key={lore.id} className={`panel-nested p-4 relative`}>
                                 <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full ${theme.iconBg} border ${theme.border} flex items-center justify-center font-display text-lg`}>{author?.name.charAt(0)}</div>
                                 <div className="pl-6">
                                     <h3 className="text-2xl font-bold font-display celestial-text" style={{ textShadow: `0 0 8px ${color}` }}>{lore.title}</h3>
                                     <p className="text-sm text-gray-400 mt-1">Inscribed by <span className="font-semibold">{author?.name || 'an unknown scribe'}</span> on Turn {lore.turn_created}</p>
                                     <blockquote className="mt-3 p-4 bg-black/20 rounded-md whitespace-pre-wrap text-gray-300 font-serif leading-relaxed">
                                         {lore.content}
                                     </blockquote>
                                 </div>
                             </div>
                        );
                     }) : <p className="text-center text-gray-500 py-10">The World Archives are empty. The first stories have yet to be written.</p>
                ) : (
                    <WorldForge />
                )}
            </motion.div>
        </AnimatePresence>
    );

    return (
        <div className="w-full h-full p-4 flex flex-col filigree-border">
            <header className="flex-shrink-0 pb-4 border-b border-[var(--border-color)] text-center">
                <h2 className="font-display text-3xl celestial-text">Chronicle</h2>
                <p className="text-gray-400 mt-1">The collected history of the Metacosm's evolution and its emergent myths.</p>
            </header>

            <div className="flex-shrink-0 mt-4 border-b border-[var(--border-color)] flex justify-center">
                 <button onClick={() => setActiveTab('paradigms')} className={`tab-button ${activeTab === 'paradigms' ? 'active' : ''}`}>Paradigm Shifts</button>
                 <button onClick={() => setActiveTab('lore')} className={`tab-button ${activeTab === 'lore' ? 'active' : ''}`}>World Lore</button>
                 <button onClick={() => setActiveTab('forge')} className={`tab-button ${activeTab === 'forge' ? 'active' : ''}`}>World Forge</button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
               <TabContent />
            </div>
        </div>
    );
};

export default ChronicleView;
