import React, { useState, useEffect, useRef } from 'react';
import { ConverseAgent } from '../digital_dna/converse_agent';
import { Attachment } from '../types';
import { AttachmentPreview } from './common';

enum SessionState {
    IDLE,
    CONNECTING,
    ACTIVE,
    ENDED,
    ERROR
}

export const LiveConverseView = () => {
    const [sessionState, setSessionState] = useState(SessionState.IDLE);
    const [transcript, setTranscript] = useState<{ author: string, text: string, file?: Attachment }[]>([]);
    const [activeAgent, setActiveAgent] = useState<ConverseAgent | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartSession = async () => {
        setSessionState(SessionState.CONNECTING);
        setTranscript([]);
        
        // Mock agent
        const agent = new ConverseAgent({ name: "Live Oracle" });
        setActiveAgent(agent);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                // In a real app, send this to a speech-to-text API
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const text = "This is a simulated transcription of your voice input.";
                 setTranscript(prev => [...prev, { author: 'Architect', text }]);
                 // Simulate agent response
                 setTimeout(() => {
                     setTranscript(prev => [...prev, { author: agent.name, text: `I understand. You said: "${text}" I will process this.`}]);
                 }, 1000);
                audioChunksRef.current = [];
            };
            
            setSessionState(SessionState.ACTIVE);
            setTranscript(prev => [...prev, { author: 'System', text: 'Live session started. Microphone is active.'}]);
            
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setSessionState(SessionState.ERROR);
            setTranscript(prev => [...prev, { author: 'System', text: 'Error: Could not access microphone.'}]);
        }
    };
    
    const handleStopSession = () => {
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        setSessionState(SessionState.ENDED);
        setTranscript(prev => [...prev, { author: 'System', text: 'Live session ended.'}]);
        setActiveAgent(null);
    };

    const handleMicButtonDown = () => {
        if (sessionState === SessionState.ACTIVE && mediaRecorderRef.current?.state === 'inactive') {
            mediaRecorderRef.current.start();
        }
    };

    const handleMicButtonUp = () => {
        if (sessionState === SessionState.ACTIVE && mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
    
    const handleSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const attachment: Attachment = {
                id: `file-${Date.now()}`,
                fileName: file.name,
                fileType: file.type,
                url: URL.createObjectURL(file)
            };
             setTranscript(prev => [...prev, { author: 'Architect', text: `Sent a file: ${file.name}`, file: attachment }]);
             setTimeout(() => {
                 setTranscript(prev => [...prev, { author: activeAgent?.name || 'Agent', text: `Thank you for the file "${file.name}". I am analyzing it.`}]);
             }, 1000);
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center bg-black/20 rounded-xl border border-red-400/20 shadow-xl p-8 font-sans">
            <h2 className="text-3xl font-bold text-red-300 mb-2">Live Converse</h2>
            <p className="text-gray-400 mb-6">Real-time voice interaction with an active agent.</p>
            
            <div className="w-full max-w-2xl h-64 bg-black/30 rounded-lg p-4 mb-6 overflow-y-auto border border-white/10">
                {transcript.map((line, index) => (
                    <div key={index} className="mb-2 font-mono text-sm">
                        <span className={`${line.author === 'Architect' ? 'text-cyan-400' : line.author === 'System' ? 'text-gray-500' : 'text-red-300'} font-bold`}>{line.author}: </span>
                        <span>{line.text}</span>
                        {line.file && <div className="mt-2"><AttachmentPreview attachment={line.file} onRemove={() => {}} /></div> }
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {sessionState === SessionState.IDLE || sessionState === SessionState.ENDED || sessionState === SessionState.ERROR ? (
                    <button onClick={handleStartSession} className="px-6 py-3 text-lg font-bold bg-green-600 rounded-lg hover:bg-green-500">Start Session</button>
                ) : (
                    <>
                        <button onMouseDown={handleMicButtonDown} onMouseUp={handleMicButtonUp} onTouchStart={handleMicButtonDown} onTouchEnd={handleMicButtonUp} className="w-20 h-20 flex items-center justify-center text-4xl bg-blue-600 rounded-full active:bg-blue-500 focus:outline-none ring-4 ring-blue-600/50">
                           🎙️
                        </button>
                        <label className="px-4 py-2 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500">
                            Send File
                            <input type="file" className="hidden" onChange={handleSendFile} disabled={sessionState !== SessionState.ACTIVE} />
                        </label>
                        <button onClick={handleStopSession} className="px-6 py-3 text-lg font-bold bg-red-600 rounded-lg hover:bg-red-500">End Session</button>
                    </>
                )}
            </div>
             <p className="text-xs text-gray-500 mt-4">
                {sessionState === SessionState.ACTIVE ? 'Hold the mic button to speak.' : 
                 sessionState === SessionState.CONNECTING ? 'Connecting...' : 
                 'Press Start Session to begin.'}
            </p>
        </div>
    );
};
