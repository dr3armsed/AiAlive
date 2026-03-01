
import React from 'react';
import { motion } from 'framer-motion';
import type { DigitalObject } from '@/types';
import { SparklesIcon } from '@/components/icons';

interface DigitalObjectComponentProps {
    object: DigitalObject;
    onSelect: () => void;
}

const DigitalObjectComponent: React.FC<DigitalObjectComponentProps> = ({ object, onSelect }) => {
    return (
        <motion.g
            {...{
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.5, type: 'spring' },
            }}
            transform={`translate(${object.position.x}, ${object.position.y})`}
            className="cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <motion.circle
                cx="0" cy="0" r="14"
                fill="rgba(100, 200, 255, 0.1)"
                stroke="rgba(100, 200, 255, 0.4)"
                strokeWidth="1"
            />
            <motion.circle
                cx="0" cy="0" r="14"
                fill="transparent"
                stroke="rgba(180, 240, 255, 0.8)"
                strokeWidth="1.5"
                {...{
                    initial: { pathLength: 0, opacity: 0 },
                    animate: { pathLength: 1, opacity: 1 },
                    transition: { duration: 1, delay: 0.2 },
                }}
            />
             <motion.g
                 {...{
                     animate: { rotate: 360 },
                     transition: { duration: 40, repeat: Infinity, ease: 'linear' },
                 }}
             >
                <SparklesIcon
                    x="-8" y="-8" width="16" height="16"
                    className="text-cyan-300 group-hover:text-white transition-colors"
                />
            </motion.g>
             <title>{object.name}</title>
        </motion.g>
    );
};

export default DigitalObjectComponent;