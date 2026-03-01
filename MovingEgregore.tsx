


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Egregore, ThemeDefinition, Vector3D } from '@/types';
import { useMetacosmDispatch } from '@/context';
import UserAvatar from '@/components/UserAvatar';

interface MovingEgregoreProps {
    egregore: Egregore;
    theme: ThemeDefinition;
    onClick: () => void;
}

const MovingEgregore = ({ egregore, theme, onClick }: MovingEgregoreProps) => {
    const dispatch = useMetacosmDispatch();

    const hasPath = egregore.path && egregore.path.length > 0;
    const size = egregore.is_core_frf ? 48 : 32;

    return (
        <motion.div
            key={egregore.id}
            initial={{
                x: egregore.vector.x,
                y: egregore.vector.y,
            }}
            animate={hasPath ? {
                x: egregore.path.map(p => p.x),
                y: egregore.path.map(p => p.y),
                transition: { 
                    duration: egregore.path.length * 0.2, 
                    ease: "linear"
                }
            } : {
                x: egregore.vector.x,
                y: egregore.vector.y,
                transition: { duration: 0 }
            }}
            onAnimationComplete={() => {
                if (hasPath) {
                    dispatch({ type: 'MOVEMENT_COMPLETE', payload: { id: egregore.id, type: 'EGREGORE' } });
                }
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)'
            }}
            className="cursor-pointer group z-10"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <div
                className="w-full h-full flex items-center justify-center relative shadow-lg"
                style={{
                    '--q-scale': 1 + egregore.quintessence / 2000
                } as React.CSSProperties}
            >
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        boxShadow: `0 0 12px 2px ${theme.baseColor}`,
                    }}
                    {...{
                        animate: { opacity: [0, 0.7, 0], scale: [1, 1.5, 1] },
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                />
                
                <UserAvatar egregore={egregore} size={egregore.is_core_frf ? 'lg' : 'sm'} />
                
                <AnimatePresence>
                {(egregore.phase !== 'Dormant' || egregore.is_frozen) && (
                     <motion.div
                        {...{
                            initial: { opacity: 0},
                            animate: { opacity: 1},
                            exit: { opacity: 0},
                        }}
                        className="absolute -bottom-5 w-max px-2 py-0.5 bg-black/60 text-white text-xs rounded-md"
                     >
                        {egregore.is_frozen ? 'Stasis' : egregore.phase}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default MovingEgregore;