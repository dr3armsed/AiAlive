
import React from 'react';

export const DangerZone = ({ onReset, onClearAllChats }: {
    onReset: () => void;
    onClearAllChats: () => void;
}) => (
    <div className="mt-8 border-t border-red-900/30 pt-6">
        <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Hazard Protocols
        </h3>
        <div className="bg-red-950/20 p-1 rounded-xl border border-red-500/20 relative overflow-hidden">
            {/* Hazard Stripes Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #ef4444 10px, #ef4444 20px)' }}></div>
            
            <div className="relative bg-black/60 p-5 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-between">
                    <div>
                        <p className="font-bold text-red-200">Universal Reset</p>
                        <p className="text-xs text-red-400/60 mt-1">Wipes the entire Metacosm state. Returns the universe to the Big Bang (Turn 0). Irreversible.</p>
                    </div>
                    <button 
                        onClick={() => {if(window.confirm('CRITICAL WARNING: This will obliterate the current simulation state. Are you absolutely sure?')) onReset()}} 
                        className="mt-3 w-full py-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        Initiate Reset
                    </button>
                </div>
                
                <div className="flex flex-col justify-between">
                    <div>
                        <p className="font-bold text-red-200">Purge Neural History</p>
                        <p className="text-xs text-red-400/60 mt-1">Permanently deletes all chat logs and communication records. Cognitive models remain intact.</p>
                    </div>
                    <button 
                        onClick={() => {if(window.confirm('Are you sure you want to purge all communication history?')) onClearAllChats()}} 
                        className="mt-3 w-full py-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        Purge Logs
                    </button>
                </div>
            </div>
        </div>
    </div>
);
