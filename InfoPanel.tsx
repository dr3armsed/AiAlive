
import React from 'react';
import { motion } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { XIcon } from './icons';

interface InfoPanelProps {
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ onClose, children, title }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState({ x: 0, y: 0 });

    const bindPos = useGesture({
        onDrag: ({ offset: [x, y], event }) => {
            event.stopPropagation();
            setPos({ x, y });
        },
        onClick: ({ event }) => {
             event.stopPropagation();
        }
    }, {
        drag: { 
            filterTaps: true, 
            from: () => [pos.x, pos.y],
             bounds: (state) => {
                if (!ref.current) return {};
                const panelRect = ref.current.getBoundingClientRect();
                return {
                    left: -panelRect.left + 20,
                    right: window.innerWidth - panelRect.right - 20,
                    top: -panelRect.top + 20,
                    bottom: window.innerHeight - panelRect.bottom - 20,
                }
            }
        }
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{ 
                x: pos.x, 
                y: pos.y, 
                touchAction: 'none', 
                position: 'absolute', 
                top: '50%', 
                left: '50%',
            }}
            className="filigree-border p-4 rounded-lg w-80 max-h-[80vh] flex flex-col z-20"
        >
            <div 
                {...bindPos()} 
                className="flex items-center justify-between pb-2 mb-2 border-b border-amber-400/20 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    {/* Drag handle visual affordance */}
                    <div className="flex flex-col gap-0.5 opacity-50">
                        <div className="w-3 h-0.5 bg-gray-500 rounded-full"></div>
                        <div className="w-3 h-0.5 bg-gray-500 rounded-full"></div>
                        <div className="w-3 h-0.5 bg-gray-500 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-display text-metacosm-accent">{title}</h3>
                </div>

                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 rounded-full hover:bg-white/10" aria-label="Close panel">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {children}
            </div>
        </motion.div>
    );
};

export default InfoPanel;
