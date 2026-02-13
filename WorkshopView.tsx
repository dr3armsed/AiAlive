
import React, { useState } from 'react';
import { EgregoreWorkspace } from '../types';
import { simulateCodeExecution } from '../services/geminiServices/index';

const mockWorkspace: EgregoreWorkspace = {
    files: [
        { path: 'main.js', content: 'console.log("Hello, Metacosm!");' },
        { path: 'ideas.txt', content: '- A poem about data streams\n- A fractal from quintessence fluctuations' },
    ],
    consoleHistory: ["Workspace initialized."],
};

export const WorkshopView = () => {
    const [workspace, setWorkspace] = useState<EgregoreWorkspace>(mockWorkspace);
    const [activeFile, setActiveFile] = useState<string>('main.js');
    const [isRunning, setIsRunning] = useState(false);
    
    const currentFile = workspace.files.find(f => f.path === activeFile);

    const handleFileContentChange = (content: string) => {
        setWorkspace(prev => ({
            ...prev,
            files: prev.files.map(f => f.path === activeFile ? { ...f, content } : f),
        }));
    };
    
    const runCode = async () => {
        if (!currentFile || !currentFile.path.endsWith('.js')) {
            setWorkspace(prev => ({ ...prev, consoleHistory: [...prev.consoleHistory, "Error: Only .js files can be executed."] }));
            return;
        }
        setIsRunning(true);
        setWorkspace(prev => ({ ...prev, consoleHistory: [...prev.consoleHistory, `Executing ${currentFile.path}...`] }));
        const result = await simulateCodeExecution(currentFile.content, {});
        const output = result.success ? `> ${result.output}` : `> Error: ${result.error}`;
        setWorkspace(prev => ({ ...prev, consoleHistory: [...prev.consoleHistory, output] }));
        setIsRunning(false);
    };

    return (
        <div className="h-full flex flex-col bg-black/20 rounded-xl border border-indigo-300/10 shadow-xl overflow-hidden font-sans">
            <header className="p-2 border-b border-indigo-300/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-indigo-200 pl-2">Egregore Workshop</h2>
                 <button onClick={runCode} disabled={isRunning} className="px-4 py-1.5 text-sm font-bold bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600">
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </header>
            <div className="flex-grow flex min-h-0">
                <aside className="w-1/4 max-w-xs border-r border-indigo-300/10 bg-black/10 flex flex-col">
                    <div className="p-2 border-b border-indigo-300/10">
                        <h3 className="font-bold text-gray-300">Files</h3>
                    </div>
                    <nav className="flex-grow overflow-y-auto">
                        {workspace.files.map(file => (
                            <button key={file.path} onClick={() => setActiveFile(file.path)} className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${activeFile === file.path ? 'bg-indigo-900/40 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                                {file.path}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 flex flex-col">
                    <div className="flex-grow">
                        <textarea
                            value={currentFile?.content || ''}
                            onChange={(e) => handleFileContentChange(e.target.value)}
                            className="w-full h-full bg-transparent p-4 text-sm font-mono resize-none focus:outline-none"
                            placeholder="Select a file or create a new one..."
                        />
                    </div>
                    <div className="h-1/3 border-t border-indigo-300/10 bg-black/30 flex flex-col">
                        <h4 className="p-2 text-sm font-bold border-b border-indigo-300/10">Console</h4>
                        <div className="flex-grow p-2 overflow-y-auto font-mono text-xs">
                            {workspace.consoleHistory.map((line, i) => (
                                <p key={i} className={line.startsWith('>') ? 'text-cyan-300' : ''}>{line}</p>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};