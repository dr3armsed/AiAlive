import React from 'react';
import type { ChatMessage, ScannerType } from '../../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MessageScannerProps {
    message: ChatMessage;
}

const scannerColors: Record<ScannerType | 'default', string> = {
    Stability: 'text-red-300',
    Performance: 'text-green-300',
    Upgrade: 'text-cyan-300',
    Modularization: 'text-yellow-300',
    default: 'text-gray-400',
};

const MessageScanner = ({ message }: MessageScannerProps) => {
    
    const colorClass = scannerColors[message.sourceScanner || 'default'];
    const prefix = message.sourceScanner ? `//${message.sourceScanner.toUpperCase()}_SCAN` : `//METACOSM`;

    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.3 },
            }}
            className="w-full my-1 text-sm font-mono"
        >
            <div className="flex items-baseline gap-2 text-gray-400">
                <span className={clsx("font-bold flex-shrink-0", colorClass)}>{prefix}</span>
                <p className="flex-1 break-words whitespace-pre-wrap">{message.text}</p>
            </div>
        </motion.li>
    );
};

export default MessageScanner;
