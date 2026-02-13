import React from 'react';
import { Egregore } from '../../types';
import { EGREGORE_COLORS } from '../common';

type ChannelListProps = {
    egregores: Egregore[];
    selectedChannel: string;
    onSelectChannel: (id: string) => void;
};

export const ChannelList: React.FC<ChannelListProps> = ({ egregores, selectedChannel, onSelectChannel }) => {
    return (
        <aside className="w-64 border-r border-purple-400/10 bg-black/10 flex flex-col">
            <div className="p-4 border-b border-purple-400/10">
                <h2 className="text-xl font-bold text-purple-200">Cognitive Conduit</h2>
            </div>
            <nav className="flex-grow overflow-y-auto p-2">
                <h3 className="px-2 py-1 text-xs font-bold uppercase text-gray-500">Channels</h3>
                <button
                    onClick={() => onSelectChannel('general')}
                    className={`w-full text-left px-2 py-1.5 rounded-md transition-colors text-sm ${selectedChannel === 'general' ? 'bg-purple-900/40' : 'hover:bg-white/5'}`}
                >
                    # general
                </button>
                <h3 className="px-2 py-1 mt-4 text-xs font-bold uppercase text-gray-500">Direct Messages</h3>
                 {egregores.map(egregore => (
                    <button
                        key={egregore.id}
                        onClick={() => onSelectChannel(egregore.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-md transition-colors text-sm flex items-center gap-2 ${selectedChannel === egregore.id ? 'bg-purple-900/40 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${EGREGORE_COLORS[egregore.name] ? 'bg-current' : 'bg-gray-400'}`}></span>
                        {egregore.name}
                    </button>
                 ))}
            </nav>
        </aside>
    );
};
