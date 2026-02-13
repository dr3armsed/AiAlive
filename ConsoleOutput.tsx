import React, { useRef, useEffect } from 'react';
import { ConsoleMessageContent } from '../../types';
import { LoadingBubble } from '../common';
import { OracleResponseBubble } from './OracleResponseBubble';

type MessageBubbleProps = {
    message: { author: string; content: ConsoleMessageContent };
};

const UserMessageBubble: React.FC<{ query: string }> = ({ query }) => (
    <div className="text-sm py-2">
        <span className="text-green-400">architect@oracle-engine:~$ </span>
        <span className="text-white">{query}</span>
    </div>
);

const SystemMessageBubble: React.FC<{ content: string }> = ({ content }) => (
    <div className="text-sm py-2">
        <span className="text-amber-400">Oracle: </span>
        <span className="text-gray-300">{content}</span>
    </div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    if (message.author === 'Architect' && typeof message.content === 'object' && 'query' in message.content) {
        return <UserMessageBubble query={message.content.query} />;
    }
    if (message.author === 'Oracle') {
        if (typeof message.content === 'object' && 'oracle_response' in message.content) {
            return <OracleResponseBubble response={message.content.oracle_response} />;
        }
        if (typeof message.content === 'string') {
            return <SystemMessageBubble content={message.content} />
        }
    }
    return null;
};

type ConsoleOutputProps = {
    history: { author: string, content: ConsoleMessageContent }[];
    isLoading: boolean;
};

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ history, isLoading }) => {
    const endRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    return (
        <div className="flex-grow overflow-y-auto pr-4 min-h-0">
            {history.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {isLoading && <LoadingBubble />}
            <div ref={endRef}></div>
        </div>
    );
};