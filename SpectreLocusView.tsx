
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpectreType, ChatMessage, FileAttachment, SpectreResponse, SpectreState } from '@/types';
import { generateSpectreResponse, SPECTRE_PROMPTS } from '@/services/spectre';
import { XIcon, PaperclipIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import clsx from 'clsx';
import { useMetacosmState } from '../context';
import ChatInterface from '../components/ChatInterface';
import { generateUUID } from '../utils';
import { formatFileSize } from '../utils';

interface SpectreLocusViewProps {
    onClose: () => void;
    spectreState: SpectreState;
    setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>;
}

const SpectreLocusView: React.FC<SpectreLocusViewProps> = ({ onClose, spectreState, setSpectreState }) => {
    const { unlockedSpectres } = useMetacosmState();
    
    const [activeSpectre, setActiveSpectre] = useState<SpectreType>('System');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
    const [editorContent, setEditorContent] = useState<string>('');
    const [stagedFile, setStagedFile] = useState<{ name: string; content: string } | null>(null);
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);

    const messages = spectreState.chats[activeSpectre] || [];
    const memory = spectreState.memory[activeSpectre];
    const sharedFiles = spectreState.sharedFiles;
    const description = SPECTRE_PROMPTS[activeSpectre] || "No description available.";
    const isFileDirty = selectedFile && editorContent !== selectedFile.content;

    useEffect(() => {
        if (!messages.length) {
            const initialMessage: ChatMessage = {
                id: `spectre-init-${activeSpectre}-${generateUUID()}`,
                sender: activeSpectre,
                text: SPECTRE_PROMPTS[activeSpectre].split('.')[0] + ". How may I assist you, Architect?",
                timestamp: Date.now(),
            };
             setSpectreState(prevState => ({
                ...prevState,
                chats: {
                    ...prevState.chats,
                    [activeSpectre]: [initialMessage]
                }
            }));
        }
    }, [activeSpectre, messages.length, setSpectreState]);

    const handleSelectFile = (file: FileAttachment) => {
        setSelectedFile(file);
        setEditorContent(file.content);
        setStagedFile(null);
    };

    const handleStageChanges = () => {
        if (selectedFile && isFileDirty) {
            setStagedFile({ name: selectedFile.name, content: editorContent });
        }
    };

    const handleSend = useCallback(async (text: string, files: FileAttachment[]) => {
        if ((!text.trim() && files.length === 0 && !stagedFile) || isLoading) return;

        setIsLoading(true);
        
        const userMessage: ChatMessage = {
            id: generateUUID(),
            sender: 'Architect',
            text: text,
            file_attachments: files,
            timestamp: Date.now(),
        };
        
        const currentStagedFile = stagedFile;
        setStagedFile(null);

        const updatedMemoryLog = [...(memory.short_term_log || []), userMessage];
        setSpectreState(prevState => {
             const newSharedFiles = [...prevState.sharedFiles];
             files.forEach(newFile => {
                if (!prevState.sharedFiles.some(f => f.name === newFile.name)) {
                    newSharedFiles.push(newFile);
                }
             });

            return {
                ...prevState,
                chats: { ...prevState.chats, [activeSpectre]: [...(prevState.chats[activeSpectre] || []), userMessage] },
                memory: { ...prevState.memory, [activeSpectre]: { ...memory, short_term_log: updatedMemoryLog } },
                sharedFiles: newSharedFiles,
            };
        });

        try {
            const response: SpectreResponse = await generateSpectreResponse(activeSpectre, { ...memory, short_term_log: updatedMemoryLog }, sharedFiles, currentStagedFile);

            const spectreMessage: ChatMessage = {
                id: generateUUID(),
                sender: activeSpectre,
                text: response.statement,
                timestamp: Date.now(),
            };
            
            setSpectreState(prevState => {
                const finalMemoryLog = [...(prevState.memory[activeSpectre]?.short_term_log || []), spectreMessage];
                
                let updatedSharedFiles = [...prevState.sharedFiles];
                let fileWasModified = false;
                let modifiedFileName = '';

                if (response.file_action) {
                    const { type, name, content } = response.file_action;
                    if (type === 'CREATE' && content) {
                        if (!updatedSharedFiles.some(f => f.name === name)) {
                            const newFile: FileAttachment = { name, content, mime_type: 'text/plain', size: content.length, url: '' };
                            updatedSharedFiles.push(newFile);
                            fileWasModified = true;
                            modifiedFileName = name;
                        }
                    } else if (type === 'MODIFY' && content) {
                        const fileExists = updatedSharedFiles.some(f => f.name === name);
                        if(fileExists) {
                            updatedSharedFiles = updatedSharedFiles.map(f =>
                                f.name === name ? { ...f, content, size: content.length, timestamp: Date.now() } as FileAttachment : f
                            );
                        } else {
                            const newFile: FileAttachment = { name, content, mime_type: 'text/plain', size: content.length, url: '' };
                            updatedSharedFiles.push(newFile);
                        }
                        fileWasModified = true;
                        modifiedFileName = name;
                    }
                }
                
                if (fileWasModified && selectedFile?.name === modifiedFileName) {
                    const updatedFile = updatedSharedFiles.find(f => f.name === modifiedFileName);
                    if(updatedFile) {
                        setSelectedFile(updatedFile);
                        setEditorContent(updatedFile.content);
                    }
                }


                return {
                    ...prevState,
                    chats: { ...prevState.chats, [activeSpectre]: [...(prevState.chats[activeSpectre] || []), spectreMessage] },
                    memory: { ...prevState.memory, [activeSpectre]: { ...prevState.memory[activeSpectre], short_term_log: finalMemoryLog } },
                    sharedFiles: updatedSharedFiles
                };
            });

        } catch (error) {
            console.error("Spectre chat failed:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                sender: 'Metacosm',
                text: `The ${activeSpectre} Spectre fades into static... (API Error)`,
                timestamp: Date.now(),
            };
            setSpectreState(prevState => ({
                ...prevState,
                chats: { ...prevState.chats, [activeSpectre]: [...(prevState.chats[activeSpectre] || []), errorMessage] }
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, activeSpectre, memory, sharedFiles, setSpectreState, stagedFile, selectedFile]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="filigree-border w-full max-w-7xl h-[90vh] flex flex-col"
            >
                <header className="flex items-center justify-between p-2 border-b border-amber-400/20 flex-shrink-0">
                    <h2 className="text-xl font-display celestial-text ml-2">Spectre IDE</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon /></button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-48 border-r border-amber-400/20 p-2 flex flex-col gap-1">
                        {unlockedSpectres.map(spectre => (
                            <button
                                key={spectre}
                                onClick={() => setActiveSpectre(spectre)}
                                className={clsx(
                                    "w-full text-left p-2 rounded-md text-sm transition-colors",
                                    activeSpectre === spectre ? "bg-amber-400/20 text-metacosm-accent" : "hover:bg-white/10"
                                )}
                            >
                                {spectre}
                            </button>
                        ))}
                    </aside>
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-px bg-amber-400/10 overflow-hidden">
                            <div className="md:col-span-1 bg-black/30 p-2 overflow-y-auto">
                                <h3 className="font-bold text-gray-300 p-2">Shared Filesystem</h3>
                                 {sharedFiles.length > 0 ? (
                                    sharedFiles.map(file => (
                                        <button 
                                            key={file.name} 
                                            onClick={() => handleSelectFile(file)}
                                            className={clsx("w-full text-left flex items-center gap-2 p-2 rounded-md font-mono text-sm", selectedFile?.name === file.name ? 'bg-amber-400/20 text-metacosm-accent' : 'hover:bg-white/10')}
                                        >
                                            <PaperclipIcon className="w-4 h-4" />
                                            {file.name}
                                        </button>
                                    ))
                                 ) : <p className="p-2 text-sm text-gray-500">No shared files.</p>}
                            </div>
                            <div className="md:col-span-2 bg-gray-900/40 flex flex-col">
                                {selectedFile ? (
                                    <>
                                        <div className="flex-shrink-0 p-2 flex justify-between items-center border-b border-amber-400/10">
                                            <span className="font-mono text-sm text-gray-300">{selectedFile.name}</span>
                                            <button 
                                                onClick={handleStageChanges}
                                                disabled={!isFileDirty}
                                                className="px-3 py-1 text-xs rounded-md bg-green-600/50 hover:bg-green-500/50 text-green-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                 {stagedFile && stagedFile.name === selectedFile.name ? 'Changes Staged' : 'Stage Changes'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={editorContent}
                                            onChange={(e) => setEditorContent(e.target.value)}
                                            className="w-full h-full flex-1 bg-transparent p-2 text-white font-mono text-sm resize-none focus:outline-none"
                                            placeholder={`// Edit ${selectedFile.name}`}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">Select a file to view/edit.</div>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                             <button onClick={() => setIsChatPanelOpen(o => !o)} className="w-full p-1 bg-black/30 hover:bg-black/50 border-t border-b border-amber-400/10 flex items-center justify-center text-gray-400">
                                {isChatPanelOpen ? <ChevronDownIcon/> : <ChevronUpIcon />}
                                <span className="ml-2 text-xs font-bold">Dialogue: {activeSpectre}</span>
                             </button>
                             <AnimatePresence>
                             {isChatPanelOpen && (
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: '300px' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ChatInterface
                                        messages={messages}
                                        onSend={handleSend}
                                        placeholder={`Converse with ${activeSpectre}...`}
                                    />
                                </motion.div>
                             )}
                             </AnimatePresence>
                        </div>
                    </main>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SpectreLocusView;
