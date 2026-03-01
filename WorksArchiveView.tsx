

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { Egregore, CreativeWork, CreativeWorkType } from '@/types';
import { XIcon, BookOpenIcon, DownloadIcon } from '@/components/icons';
import clsx from 'clsx';
import UserAvatar from '@/components/UserAvatar';
import saveAs from 'file-saver';
import PixelArtDisplay from '@/components/PixelArtDisplay';

const CreativeWorkCard: React.FC<{ work: CreativeWork & { author: Egregore } }> = ({ work }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isCode = work.type === 'CodeSegment';
    const isPixelArt = work.type === 'PixelArt';

    return (
        <motion.div 
            {...{
                layout: true,
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
            }}
            className="p-4 bg-black/20 rounded-lg border-l-4 border-amber-400/50 flex flex-col"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-amber-300 truncate">{work.title}</h4>
                    <p className="text-xs text-gray-400">{work.type}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className="text-xs text-gray-400 hidden sm:inline">{work.author.name}</span>
                    <UserAvatar egregore={work.author} size="sm" />
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        {...{
                            initial: { opacity: 0, height: 0, marginTop: 0 },
                            animate: { opacity: 1, height: 'auto', marginTop: '1rem' },
                            exit: { opacity: 0, height: 0, marginTop: 0 },
                        }}
                        className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-gray-300 border-t border-amber-400/10 pt-2"
                    >
                       {isPixelArt ? (
                           <PixelArtDisplay pixelData={work.content} />
                       ) : isCode ? (
                           <pre><code className="block p-2 rounded-md bg-black/50 text-cyan-200 font-mono text-xs">{work.content}</code></pre>
                       ) : (
                           work.content
                       )}
                    </motion.div>
                )}
            </AnimatePresence>
             <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-center mt-2 text-amber-200/70 hover:text-amber-200">
                {isExpanded ? 'Show Less' : 'Show More'}
            </button>
        </motion.div>
    );
};

const WorksArchiveView: React.FC = () => {
    const { egregores, turn } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const [authorFilter, setAuthorFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    
    const allWorks = useMemo(() => {
        return egregores
            .flatMap(e => (e.creative_works || []).map(work => ({ ...work, author: e })))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [egregores]);
    
    const filteredWorks = useMemo(() => {
        return allWorks.filter(work => {
            const authorMatch = authorFilter === 'all' || work.author.id === authorFilter;
            const typeMatch = typeFilter === 'all' || work.type === typeFilter;
            return authorMatch && typeMatch;
        });
    }, [allWorks, authorFilter, typeFilter]);

    const workTypes = useMemo(() => {
        const types = new Set(allWorks.map(w => w.type));
        return Array.from(types);
    }, [allWorks]);

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    const handleDownloadAll = () => {
        const categorizedWorks = allWorks.reduce<Record<string, any[]>>((acc, work) => {
            const { author, ...workData } = work;
            const workWithAuthor = { ...workData, author: { id: author.id, name: author.name, archetype: author.archetypeId } };
            
            const typeKey = work.type.toLowerCase().replace(/\s+/g, '_') + 's';
            if (!Object.prototype.hasOwnProperty.call(acc, typeKey)) {
                acc[typeKey] = [];
            }
            acc[typeKey].push(workWithAuthor);
            return acc;
        }, {});

        const dataToSave = {
            meta: {
                export_turn: turn,
                timestamp: new Date().toISOString(),
                work_count: allWorks.length
            },
            works: categorizedWorks
        };

        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {type: "application/json;charset=utf-8"});
        saveAs(blob, `metacosm_works_archive_turn_${turn}.json`);
    };

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                 <BookOpenIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">Works Archive</h1>
            </div>
             <p className="text-gray-400 mb-6 max-w-3xl">
                The collective library of all creative works produced by Egregores. Here, their stories, theories, and machinations are preserved for study.
            </p>

            <div className="filigree-border p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label htmlFor="author-filter" className="text-sm text-gray-400 mr-2">Author:</label>
                        <select id="author-filter" value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} className="bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white">
                            <option value="all">All Egregores</option>
                            {egregores.filter(e => !e.is_core_frf).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type-filter" className="text-sm text-gray-400 mr-2">Type:</label>
                        <select id="type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white">
                            <option value="all">All Types</option>
                            {workTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                 <button 
                    onClick={handleDownloadAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/50 text-blue-200 hover:bg-blue-500/50 disabled:opacity-50"
                    disabled={allWorks.length === 0}
                    title="Download all works as a single structured JSON file. ZIP archive is not supported on this platform."
                >
                    <DownloadIcon />
                    Download All as JSON
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {filteredWorks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredWorks.map(work => <CreativeWorkCard key={work.id} work={work} />)}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full filigree-border">
                        <p className="text-gray-500">The archive is empty, or no works match your filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorksArchiveView;
