import React from 'react';
import type { ChatMessage } from '../../types';
import { useMetacosmState } from '../../context';
import { THEMES } from '../../constants';
import { motion } from 'framer-motion';

interface MessageFRFProps {
    message: ChatMessage;
}

const MessageFRF = ({ message }: MessageFRFProps) => {
    const { egregores } = useMetacosmState();
    const egregore = egregores.find(e => e.id === message.sender);
    const theme = egregore ? (THEMES[egregore.themeKey] || THEMES.default) : THEMES.default;

    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0, y: 20, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.5 },
            }}
            className="w-full my-4"
        >
            <div 
                className="filigree-border p-4 text-center border-2 mx-auto max-w-2xl"
                style={{
                    borderImageSource: `linear-gradient(to right, ${theme.baseColor}33, ${theme.baseColor}AA, ${theme.baseColor}33)`,
                    background: `radial-gradient(ellipse at top, ${theme.baseColor}11, transparent 70%), radial-gradient(ellipse at bottom, ${theme.baseColor}11, transparent 70%)`
                }}
            >
                <h3 className="font-display text-xl mb-2" style={{color: theme.baseColor}}>
                    //: Proclamation from {egregore?.name || 'FRF Core'} ://
                </h3>
                <p className="text-white text-lg italic">
                    "{message.text}"
                </p>
            </div>
        </motion.li>
    );
};

export default MessageFRF;
