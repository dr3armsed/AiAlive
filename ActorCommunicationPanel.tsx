import React from 'react';
import { useActor, useState } from '../../packages/react-chimera-renderer/index.ts';
import UsersIcon from '../icons/UsersIcon';

const ComponentA = () => {
    const [lastMessage, send] = useActor('component-a');
    const [sentCount, setSentCount] = useState(0);

    const handleClick = () => {
        const newMessage = `Hello from A! (msg #${sentCount + 1})`;
        send('component-b', newMessage);
        setSentCount(c => c + 1);
    };

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-blue-500/30">
            <h4 className="font-bold text-blue-300">Component A (Actor ID: component-a)</h4>
            <button
                onClick={handleClick}
                className="mt-2 w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
                Send Message to B
            </button>
            <p className="text-xs text-slate-400 mt-2">Messages Sent: {sentCount}</p>
        </div>
    );
};

const ComponentB = () => {
    const [lastMessage] = useActor<string>('component-b');

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-500/30">
            <h4 className="font-bold text-purple-300">Component B (Actor ID: component-b)</h4>
            <div className="mt-2 p-2 bg-black/30 rounded min-h-[4rem] text-sm text-slate-300 italic">
                {lastMessage ? `"${lastMessage}"` : 'Waiting for a message...'}
            </div>
        </div>
    );
};


const ActorCommunicationPanel: React.FC = () => {
    return (
        <div className="glass-panel p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-purple-400" />
                Actor Model Communication
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                These two components are not parent/child. They communicate directly using the `useActor` hook and the renderer's message bus, demonstrating decoupled state management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComponentA />
                <ComponentB />
            </div>
        </div>
    );
};

export default ActorCommunicationPanel;