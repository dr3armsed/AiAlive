import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useMetacosmState } from '@/context';

const ScannerCommsChannel = () => {
    const { systemTickerMessages } = useMetacosmState();

    const parseMessage = (msg: string) => {
        if (msg.startsWith('//ERROR:')) return { text: msg.substring(8), scanner: 'Stability', color: 'text-red-300' };
        if (msg.startsWith('//WARN-STRONG:')) return { text: msg.substring(14), scanner: 'Stability', color: 'text-orange-400' };
        if (msg.startsWith('//WARN-WEAK:')) return { text: msg.substring(12), scanner: 'Performance', color: 'text-yellow-400' };
        if (msg.startsWith('//INFO:')) return { text: msg.substring(7), scanner: 'Modularization', color: 'text-sky-300' };
        // Default for general messages, assign it to a general scanner
        return { text: msg, scanner: 'System', color: 'text-cyan-300' };
    };

    // Reverse to show newest first
    const messages = systemTickerMessages.slice().reverse();

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-display text-metacosm-accent mb-4">Scanner Comms Channel</h2>
            <p className="text-gray-400 mb-6 max-w-3xl">
                Internal communication log between the Metacosm's diagnostic subroutines. Monitor this channel for emergent analysis and suggestions.
            </p>

            <div className="flex-1 filigree-border p-4 space-y-4 overflow-y-auto">
                {messages.length > 0 ? messages.map((msg, index) => {
                    const { text, scanner, color } = parseMessage(msg);
                    const timestamp = `T-${messages.length - index - 1}.0 cycles`
                    return (
                        <motion.div
                            key={`${index}-${msg}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 bg-black/20 rounded-lg"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={clsx("font-bold", color)}>
                                    {`//SCANNER_CORE::${scanner.toUpperCase()}`}
                                </h4>
                                <span className="text-xs text-gray-500">{timestamp}</span>
                            </div>
                            <p className="text-gray-300">{text}</p>
                        </motion.div>
                    )
                }) : (
                    <div className="text-center text-gray-500 p-8">Comms channel is quiet.</div>
                )}
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Broadcast to scanners... (Feature Offline)"
                    disabled
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-metacosm-accent disabled:opacity-50"
                />
            </div>
        </div>
    );
};

export default ScannerCommsChannel;