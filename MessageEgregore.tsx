import React from 'react';
import type { ChatMessage } from '@/types';
import { useMetacosmState } from '@/context';
import { THEMES } from '@/constants';
import UserAvatar from '@/components/UserAvatar';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { PaperclipIcon } from '@/components/icons';
import { formatFileSize } from '@/utils';
import AnimatedWord from '@/components/AnimatedWord';

interface MessageProps {
    message: ChatMessage;
}

const MessageEgregore = ({ message }: MessageProps) => {
    const { egregores, currentUser } = useMetacosmState();
    const isArchitect = message.sender === 'Architect';
    const egregore = !isArchitect ? egregores.find(e => e.id === message.sender) : undefined;

    const theme = egregore ? (THEMES[egregore.themeKey] || THEMES.default) : THEMES.creator;
    const name = isArchitect ? currentUser?.username : (egregore?.name || '[Deleted Entity]');

    const containerClasses = clsx(
        "flex items-start gap-3 w-full",
        { "flex-row-reverse": isArchitect }
    );
    const bubbleClasses = clsx(
        "p-3 rounded-lg max-w-lg relative text-white break-words",
        {
            "bg-blue-900/50 border border-blue-400/30": isArchitect,
        }
    );

    // Split text into words and spaces to preserve them for rendering
    const wordsAndSpaces = message.text ? message.text.split(/(\s+)/) : [];

    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3 },
            }}
            className={containerClasses}
        >
            <div className="flex-shrink-0 mt-1">
                <UserAvatar user={isArchitect ? currentUser! : undefined} egregore={egregore} size="sm" />
            </div>
            <div className={clsx("flex flex-col", isArchitect ? 'items-end' : 'items-start')}>
                 <p className={clsx("text-xs mb-1", isArchitect ? 'text-blue-300' : 'text-gray-400')} style={{color: egregore ? theme.baseColor: undefined}}>{name}</p>
                 <div
                    className={bubbleClasses}
                    style={egregore ? {
                        background: `linear-gradient(135deg, color-mix(in srgb, ${theme.baseColor} 20%, black), color-mix(in srgb, ${theme.baseColor} 5%, black) )`,
                        border: `1px solid color-mix(in srgb, ${theme.baseColor} 50%, transparent)`
                    }: {}}
                >
                    {message.isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:75ms]" />
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">
                            {wordsAndSpaces.map((segment, index) => {
                                // Don't animate for architect messages
                                if (isArchitect) {
                                    return <span key={index}>{segment}</span>;
                                }
                                // Render spaces normally, animate words
                                if (segment.trim() === '') {
                                    return <span key={index}>{segment}</span>;
                                }
                                return <AnimatedWord key={index} word={segment} egregore={egregore} />;
                            })}
                        </p>
                    )}
                     {message.file_attachments && message.file_attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                            {message.file_attachments.map((file, index) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    download={file.name}
                                    className="flex items-center gap-2 p-1.5 rounded-md bg-black/30 hover:bg-black/50 transition-colors"
                                    title={`Download ${file.name}`}
                                >
                                    <PaperclipIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

export default MessageEgregore;