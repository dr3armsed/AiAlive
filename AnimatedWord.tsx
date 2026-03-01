import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Egregore } from '../types';

interface AnimatedWordProps {
    word: string;
    egregore?: Egregore;
}

const AnimatedWord: React.FC<AnimatedWordProps> = ({ word, egregore }) => {
    const emotionalIntensity = egregore?.state?.emotional_vector.intensity || 0.5;
    const isSpecialChar = !/^[a-zA-Z0-9]+$/.test(word);

    const animationProps = useMemo(() => {
        if (isSpecialChar || word.length < 3 || Math.random() > emotionalIntensity * 0.3) {
            return {}; // Don't animate short words, punctuation, or based on random chance
        }
        
        const variants: Variants = {
            initial: { y: 0, scale: 1, opacity: 1 },
            hover: {
                y: Math.random() > 0.7 ? [0, -2, 0] : 0,
                scale: 1 + (Math.random() * 0.2),
                opacity: 1 - (Math.random() * 0.3),
                transition: { duration: 0.3, type: 'spring', stiffness: 400, damping: 10 }
            }
        };

        return {
            variants: variants,
            whileHover: "hover",
            initial: "initial",
        };
    }, [word, isSpecialChar, emotionalIntensity]);

    return (
        <motion.span {...animationProps} className="inline-block">
            {word}
        </motion.span>
    );
};

export default AnimatedWord;
