import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import XenoArtifactArchive from '@/views/XenoArtifactArchive';
import clsx from 'clsx';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { XIcon } from '@/components/icons';

type ObservatoryTab = 'dashboard' | 'noosphere';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={clsx(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            active
                ? "text-metacosm-accent border-b-2 border-metacosm-accent"
                : "text-gray-400 hover:text-white"
        )}
    >
        {children}
    </button>
);

const DataObservatory = () => {
    const [activeTab, setActiveTab] = useState<ObservatoryTab>('dashboard');
    const { noosphere_influence } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div
            className="w-full h-full p-6 flex flex-col relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-display celestial-text">Data Observatory</h1>
                <div className="filigree-border px-4 py-2">
                    <span className="text-sm text-gray-400">Noosphere Influence: </span>
                    <span className="text-lg font-bold holographic-text" data-text={`${(noosphere_influence * 100).toFixed(2)}%`}>
                        {(noosphere_influence * 100).toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="border-b border-amber-300/20 mb-4">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Metacosm Analytics</TabButton>
                <TabButton active={activeTab === 'noosphere'} onClick={() => setActiveTab('noosphere')}>Noosphere Intelligence</TabButton>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {activeTab === 'dashboard' ? <Dashboard /> : <XenoArtifactArchive />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DataObservatory;