

import React from 'react';
import { motion } from 'framer-motion';
import PowerIcon from '../icons/PowerIcon.tsx';
import DownloadIcon from '../icons/DownloadIcon.tsx';
import FolderIcon from '../icons/FolderIcon.tsx';

const MotionButton = motion.button as any;

interface SystemSidebarControlsProps {
    isSimulating: boolean;
    onStart: () => void;
    onStop: () => void;
    onSave: () => void;
    onLoad: () => void;
}

const SystemSidebarControls: React.FC<SystemSidebarControlsProps> = ({
    isSimulating,
    onStart,
    onStop,
    onSave,
    onLoad,
}) => {
    return (
        <div className="space-y-2">
            <MotionButton
                onClick={isSimulating ? onStop : onStart}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white transition-colors duration-300 ${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <PowerIcon className="w-5 h-5" />
                <span>{isSimulating ? 'Stop Simulation' : 'Start Simulation'}</span>
            </MotionButton>
            <div className="grid grid-cols-2 gap-2">
                <MotionButton
                    onClick={onSave}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white bg-blue-500/80 hover:bg-blue-500 transition-colors"
                     whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Save</span>
                </MotionButton>
                <MotionButton
                    onClick={onLoad}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white bg-purple-500/80 hover:bg-purple-500 transition-colors"
                     whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FolderIcon className="w-5 h-5" />
                    <span>Load</span>
                </MotionButton>
            </div>
        </div>
    );
};

export default SystemSidebarControls;