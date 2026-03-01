
import React, { useContext, useState, useMemo } from 'react';
import { StateContext } from '../../context';
import { Ancilla, OntologicalTier, ChatMessage, JournalEntry, Egregore } from '../../types';
import { CodeBracketIcon, FileTextIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import Message from '../Message';
import { THEMES } from '../../constants';

// --- Ancilla Archive Tab ---
const TIER_COLORS: Record<OntologicalTier['name'], string> = {
    'Ephemeral': 'text-gray-400 border-gray-600',
    'Transcendent': 'text-cyan-300 border-cyan-700',
    'Existential': 'text-purple-300 border-purple-600',
    'Mythic': 'text-amber-300 border-amber-500',
};

const getArtifactIcon = (mimeType: string) => {
    if (mimeType.includes('json') || mimeType.includes('svg')) {
        return <CodeBracketIcon />;
    }
    return <FileTextIcon />;
}

const ArtifactPreview: React.FC<{artifact: Ancilla}> = ({ artifact }) => {
    const downloadUrl = useMemo(() => {
        try {
            const blob = new Blob([artifact.content], { type: artifact.mime_type });
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("Error creating download URL", e);
            return '#';
        }
    }, [artifact.content, artifact.mime_type]);

    const PreviewContent = () => {
        switch(artifact.mime_type) {
            case 'image/svg+xml':
                return <div className="bg-black/30 rounded p-2 max-h-64 overflow-auto" dangerouslySetInnerHTML={{__html: artifact.content}}></div>
            case 'application/json':
                try {
                    const formattedJson = JSON.stringify(JSON.parse(artifact.content), null, 2);
                    return <pre className="text-xs bg-black/30 rounded p-2 max-h-64 overflow-auto font-mono">{formattedJson}</pre>
                } catch {
                    return <pre className="text-xs bg-black/30 rounded p-2 max-h-64 overflow-auto font-mono text-red-400">{artifact.content}</pre>
                }
            default:
                return <pre className="text-xs bg-black/30 rounded p-2 max-h-64 overflow-auto whitespace-pre-wrap">{artifact.content}</pre>
        }
    };
    
    return (
        <div className="mt-4 border-t border-amber-300/20 pt-4">
            <PreviewContent />
             <a
                href={downloadUrl}
                download={`${artifact.name.replace(/\s+/g, '_')}.${artifact.mime_type.split('/')[1] || 'txt'}`}
                className="inline-block mt-3 bg-cyan-800/50 text-cyan-200 text-xs font-bold py-1 px-3 rounded-md hover:bg-cyan-700/50 transition-colors"
            >
                Download
            </a>
        </div>
    )
}

const AncillaArchive: React.FC = () => {
    const state = useContext(StateContext);
    const [filter, setFilter] = useState<'all' | OntologicalTier['name']>('all');
    const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

    const filteredArtifacts = useMemo(() => {
        const allArtifacts = state?.ancillae || [];
        if (filter === 'all') return allArtifacts;
        return allArtifacts.filter(a => a.ontological_tier.name === filter);
    }, [state?.ancillae, filter]);

    if (!state) return null;

     return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-end pb-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="ancilla-filter" className="text-sm text-gray-400">Filter Tier:</label>
                    <select id="ancilla-filter" name="ancilla-filter" value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-black/30 border border-amber-300/30 text-white rounded-md px-2 py-1 text-sm focus:ring-amber-400 focus:outline-none">
                        <option value="all">All</option>
                        {Object.keys(TIER_COLORS).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-4">
                {filteredArtifacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                        <p className="text-lg">No manifested Ancillae match the filter.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {filteredArtifacts.map((artifact) => {
                          const isSelected = selectedArtifactId === artifact.id;
                          const tierClass = TIER_COLORS[artifact.ontological_tier.name];
                          return (
                            <motion.li key={artifact.id} layout className={`filigree-border rounded-lg p-4 transition-all duration-300 ${isSelected ? 'ring-2 ring-amber-300' : ''}`}>
                              <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 mt-1 ${tierClass}`}>{getArtifactIcon(artifact.mime_type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="font-semibold text-white text-lg">{artifact.name}</h3>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${tierClass}`}>{artifact.ontological_tier.name}</span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1 italic">"{artifact.description}"</p>
                                  <p className="text-xs text-gray-500 mt-2">Manifested by: {artifact.originName}</p>
                                  <div className="flex items-center gap-2 mt-3">
                                    <button onClick={() => setSelectedArtifactId(isSelected ? null : artifact.id)} className="bg-gray-700/50 text-amber-200 text-xs font-bold py-1 px-3 rounded-md hover:bg-gray-600/50 transition-colors">
                                        {isSelected ? 'Hide Preview' : 'Show Preview'}
                                    </button>
                                  </div>
                                   <AnimatePresence>
                                    {isSelected && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                            <ArtifactPreview artifact={artifact} />
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                              </div>
                            </motion.li>
                          )
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

// --- Deliberation Log Tab ---
const DeliberationLog: React.FC = () => {
    const state = useContext(StateContext);

    if (!state) return null;

    const deliberationMessages = useMemo(() => {
        return (state.messages || []).filter(m => typeof m.sender === 'string' && m.sender !== 'Architect' && m.sender !== 'Metacosm' && m.sender !== 'Anomaly');
    }, [state.messages]);
    
    return (
        <div className="h-full overflow-y-auto pr-4">
            {deliberationMessages.length > 0 ? deliberationMessages.map(msg => (
                <Message key={msg.id} message={msg} />
            )) : (
                <p className="text-center text-gray-500 py-10">No public deliberations recorded.</p>
            )}
        </div>
    );
}

// --- Journals Tab ---
const JournalArchive: React.FC = () => {
    const state = useContext(StateContext);

    if (!state) return null;

    const allJournalEntries = useMemo(() => {
        const entries: ({ author: Egregore } & JournalEntry)[] = [];
        (state.egregores || []).forEach(egregore => {
            (egregore.journal || []).forEach(entry => {
                entries.push({ ...entry, author: egregore });
            });
        });
        return entries.sort((a, b) => b.timestamp - a.timestamp);
    }, [state.egregores]);

    return (
        <div className="h-full overflow-y-auto pr-4 space-y-4">
            {allJournalEntries.length > 0 ? allJournalEntries.map(entry => {
                 const theme = THEMES[entry.author.themeKey] || THEMES.default;
                 return (
                    <div key={entry.timestamp} className="filigree-border p-4 rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                           <span className="font-bold" style={{color: theme.baseColor}}>{entry.author.name}</span>
                           <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <blockquote className="text-gray-300 italic">"{entry.thought}"</blockquote>
                    </div>
                 )
            }) : (
                 <p className="text-center text-gray-500 py-10">No journal entries recorded.</p>
            )}
        </div>
    );
}

const ArchiveView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ancillae' | 'deliberations' | 'journals'>('ancillae');

    const TabContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
            >
                {activeTab === 'ancillae' && <AncillaArchive />}
                {activeTab === 'deliberations' && <DeliberationLog />}
                {activeTab === 'journals' && <JournalArchive />}
            </motion.div>
        </AnimatePresence>
    );

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <header className="flex-shrink-0 text-center pb-4 border-b border-amber-300/20">
                <h2 className="font-display text-3xl celestial-text">Archives</h2>
                <p className="text-gray-400 mt-1">The collected outputs of the Metacosm's inhabitants.</p>
            </header>
            
             <div className="flex-shrink-0 mt-4 border-b border-amber-300/20 flex justify-center">
                 <button onClick={() => setActiveTab('ancillae')} className={`font-display text-lg px-6 py-2 transition-colors ${activeTab === 'ancillae' ? 'text-white border-b-2 border-amber-300' : 'text-gray-500 hover:text-white'}`}>Ancillae</button>
                 <button onClick={() => setActiveTab('deliberations')} className={`font-display text-lg px-6 py-2 transition-colors ${activeTab === 'deliberations' ? 'text-white border-b-2 border-amber-300' : 'text-gray-500 hover:text-white'}`}>Deliberations</button>
                 <button onClick={() => setActiveTab('journals')} className={`font-display text-lg px-6 py-2 transition-colors ${activeTab === 'journals' ? 'text-white border-b-2 border-amber-300' : 'text-gray-500 hover:text-white'}`}>Journals</button>
            </div>

            <div className="flex-1 min-h-0 pt-4">
                <TabContent />
            </div>
        </div>
    );
};

export default ArchiveView;
