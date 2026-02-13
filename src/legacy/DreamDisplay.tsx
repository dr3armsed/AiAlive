
import React, { useState, useEffect } from 'react';
import { Dream } from '../../../../types';
import { Step } from '../../common';

export const DreamDisplay: React.FC<{ dream: Dream; step: Step }> = ({ dream, step }) => {
    const [displayedText, setDisplayedText] = useState('');
    const isVisible = (step === 'ready' || step === 'finalizing') && !displayedText.includes('Genesis Complete');

    useEffect(() => {
        if (isVisible) {
            let i = 0;
            const text = dream.content || '';
            const interval = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText(prev => prev + text[i]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 40);
            return () => clearInterval(interval);
        } else {
            setDisplayedText('');
        }
    }, [dream, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in bg-black/60 backdrop-blur-sm z-10">
             <div className="text-center w-full max-w-md">
                <p className="text-sm text-cyan-200 border border-cyan-500/30 bg-black/80 p-6 rounded-xl italic font-serif shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    "{displayedText}"
                </p>
                <p className="text-xs text-gray-400 mt-4 animate-pulse tracking-widest uppercase">The Collective Subconscious is responding...</p>
            </div>
        </div>
    );
};
