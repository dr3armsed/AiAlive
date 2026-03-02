
import React, { useContext, useRef, useEffect } from 'react';
import { StateContext } from '../../context';
import Message from '../Message';

const ChatHistoryView: React.FC = () => {
    const state = useContext(StateContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, []);

    if (!state) return null;

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <header className="flex-shrink-0 pb-4 border-b border-amber-300/20 text-center">
                <h2 className="font-display text-3xl celestial-text">Deliberation Archives</h2>
                <p className="text-gray-400 mt-1">A complete record of all discourse within the Metacosm.</p>
            </header>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
                {(state.messages || []).map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatHistoryView;
