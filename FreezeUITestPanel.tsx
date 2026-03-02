import React from 'react';
import { motion } from 'framer-motion';
import BeakerIcon from '../icons/BeakerIcon';

const MotionButton = motion.button as any;

const FreezeUITestPanel: React.FC = () => {
    const handleFreeze = () => {
        if (window.confirm("This will intentionally freeze the UI to test the watchdog handoff. The page will become unresponsive. Continue?")) {
            console.warn("INTENTIONALLY FREEZING MAIN THREAD. WATCHDOG SHOULD ACTIVATE.");
            // This is an infinite loop that will freeze the browser tab's main thread.
            while (true) {}
        }
    };

    return (
        <div className="glass-panel p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BeakerIcon className="w-5 h-5 text-red-400"/>
                Resilience Test
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                This action will intentionally cause an infinite loop on the main UI thread, simulating a critical failure. The Watchdog should detect this and hand off control to the Svelte standby UI within 3 seconds.
            </p>
            <MotionButton
                onClick={handleFreeze}
                className="w-full font-semibold py-2.5 px-4 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Initiate UI Freeze
            </MotionButton>
        </div>
    );
};

export default FreezeUITestPanel;