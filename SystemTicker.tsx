import React, { useState, useEffect, useRef } from 'react';
import { useMetacosmState } from '../context';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, SparklesIcon } from './icons';
import clsx from 'clsx';
import UserAvatar from './UserAvatar';

const SystemTicker: React.FC = () => {
    const { systemTickerMessages, turn, world_phase, egregores, options, system_config } = useMetacosmState();
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const tickerRef = useRef<HTMLDivElement>(null);
    const prevMsgLength = useRef(systemTickerMessages.length);

    const thinkingEgregores = egregores.filter(e => e.isLoading);

    useEffect(() => {
        if (systemTickerMessages.length > prevMsgLength.current && !isOpen) {
            setHasNew(true);
        }
        prevMsgLength.current = systemTickerMessages.length;
    }, [systemTickerMessages, isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tickerRef.current && !tickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tickerRef]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNew(false);
        }
    };

    const messagesToShow = systemTickerMessages.slice(-10).reverse();

    return (
        <div className="flex items-center gap-2">
             <div className="filigree-border px-4 py-2 flex items-center gap-4 text-sm relative overflow-hidden">
                {options.gameplay.showTurnTimer && (
                    <motion.div
                        key={turn} // Re-triggers animation on turn change
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: system_config.turnInterval / 1000, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1 bg-metacosm-accent/30"
                    />
                )}
                <div>
                    <span className="text-gray-400">Turn: </span>
                    <span className="font-bold text-white">{turn}</span>
                </div>
                <div>
                    <span className="text-gray-400">Phase: </span>
                    <span className="font-bold" style={{color: world_phase === 'Day' ? '#ffc107' : '#93c5fd'}}>{world_phase}</span>
                </div>
            </div>

            <AnimatePresence>
                {thinkingEgregores.length > 0 && (
                    <motion.div
                        {...{
                            initial: { opacity: 0, width: 0 },
                            animate: { opacity: 1, width: 'auto' },
                            exit: { opacity: 0, width: 0 },
                        }}
                        className="filigree-border px-4 py-2 flex items-center gap-2 text-sm overflow-hidden"
                    >
                        <SparklesIcon className="w-5 h-5 text-cyan-300 animate-pulse" />
                        <span className="text-gray-400">Thinking:</span>
                        <div className="flex items-center gap-2">
                        {thinkingEgregores.map(e => <UserAvatar key={e.id} egregore={e} size="xs" />)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={tickerRef} className="relative">
                <button
                    onClick={handleToggle}
                    className="relative p-3 rounded-full filigree-border bg-black/50 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="System Messages"
                >
                    <BellIcon />
                    {hasNew && (
                        <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-black/50" />
                    )}
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            {...{
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: 10 },
                            }}
                            className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto filigree-border p-2 rounded-lg"
                        >
                            <ul className="space-y-2">
                                {messagesToShow.length > 0 ? messagesToShow.map((msg, index) => (
                                    <li
                                        key={index}
                                        className={clsx(
                                            "text-xs p-2 rounded-md font-mono",
                                            msg.startsWith("//ERROR:") ? "bg-red-900/50 text-red-300" :
                                            msg.startsWith("//WARN") ? "bg-yellow-900/50 text-yellow-300" :
                                            "bg-gray-800/50 text-gray-300"
                                        )}
                                    >
                                        {msg}
                                    </li>
                                )) : (
                                    <li className="text-xs text-gray-500 p-2 text-center">No new messages.</li>
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SystemTicker;