
import React from 'react';

type ChatHeaderProps = {
    channelName: string;
    isOnline: boolean;
    participants?: string[]; // Names of other participants
    onInvite?: () => void;
    onNewThread?: () => void;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({ channelName, isOnline, participants = [], onInvite, onNewThread }) => {
    return (
        <header className="p-4 border-b border-purple-400/10 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-2xl text-gray-500">#</span>
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {channelName}
                        {isOnline && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
                    </h2>
                    {participants.length > 0 && (
                        <p className="text-xs text-gray-400">with {participants.join(', ')}</p>
                    )}
                </div>
            </div>
            
            {onInvite && onNewThread && (
                <div className="flex gap-2">
                    <button 
                        onClick={onNewThread}
                        className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
                        title="Clear context and start fresh"
                    >
                        New Thread
                    </button>
                    <button 
                        onClick={onInvite}
                        className="text-xs px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 text-purple-200 rounded border border-purple-500/30 transition-colors flex items-center gap-1"
                    >
                        <span>+</span> Invite
                    </button>
                </div>
            )}
        </header>
    );
};
