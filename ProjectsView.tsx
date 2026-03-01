
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import type { AnyProject, Egregore, PlayProject } from '@/types';
import { XIcon, ProjectsIcon } from '../components/icons';
import UserAvatar from '../components/UserAvatar';

const ProjectCard = ({ project }: { project: AnyProject }) => {
    const { egregores } = useMetacosmState();
    const [isExpanded, setIsExpanded] = useState(false);
    const lead = egregores.find(e => e.id === project.leadId);
    const participants = project.participantIds.map(id => egregores.find(e => e.id === id)).filter(Boolean) as Egregore[];

    const isPlay = project.type === 'Play';
    const playProject = isPlay ? (project as PlayProject) : null;
    const isConstruction = project.type === 'Construction';

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="filigree-border p-4 flex flex-col"
        >
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <h3 className="text-lg font-display text-metacosm-accent">{project.name}</h3>
                    <p className="text-xs text-gray-400">A {project.type} led by {lead?.name || 'an unknown entity'}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-mono px-2 py-1 bg-black/30 rounded">{project.status}</span>
                </div>
            </div>

            {isConstruction && (
                 <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.floor(project.completionProgress)}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                        <motion.div
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.completionProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-amber-400/20 pt-4 space-y-4">
                            <p className="text-sm italic text-gray-300">"{project.description}"</p>
                            
                            <div>
                                <h4 className="font-bold text-amber-200 mb-2">Participants</h4>
                                {participants.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {participants.map(p => (
                                            <div key={p.id} className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded-full text-sm">
                                                <UserAvatar egregore={p} size="xs" />
                                                <span>{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-gray-500">No participants assigned.</p>}
                            </div>

                            {playProject && (
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-bold text-amber-200">Cast</h4>
                                        {playProject.cast.length > 0 ? (
                                            playProject.cast.map(member => {
                                                const actor = egregores.find(e => e.id === member.egregoreId);
                                                return (
                                                    <div key={member.egregoreId} className="flex items-center gap-2 text-sm mt-1">
                                                        <UserAvatar egregore={actor} size="xs" />
                                                        <span>{actor?.name} as {member.role}</span>
                                                    </div>
                                                );
                                            })
                                        ) : <p className="text-xs text-gray-500">No one has been cast yet.</p>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-200">Auditions</h4>
                                        {playProject.auditions.length > 0 ? (
                                             playProject.auditions.map(audition => {
                                                const actor = egregores.find(e => e.id === audition.egregoreId);
                                                return (
                                                    <div key={audition.egregoreId} className="flex items-center gap-2 text-sm mt-1">
                                                        <UserAvatar egregore={actor} size="xs" />
                                                        <span>{actor?.name} auditioned for {audition.role}</span>
                                                    </div>
                                                );
                                            })
                                        ): <p className="text-xs text-gray-500">No auditions held.</p>}
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ProjectsView = () => {
    const { projects } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    const sortedProjects = [...projects].sort((a,b) => b.startTurn - a.startTurn);

    return (
        <div
            className="w-full h-full p-6 flex flex-col relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                 <ProjectsIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">Projects Chronicle</h1>
            </div>
            <p className="text-gray-400 mb-6 max-w-3xl">
                A log of all major collaborative and creative endeavors undertaken by the Egregores. Track their ambitions from conception to completion.
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {sortedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedProjects.map(project => (
                           <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full filigree-border">
                        <p className="text-gray-500">No projects have been initiated yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsView;
