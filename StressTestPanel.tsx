
import React from 'react';
import { useMetacosmDispatch } from '../context';
import { motion } from 'framer-motion';

const StressTestPanel = () => {
    const dispatch = useMetacosmDispatch();

    const glitchVariants = [
        "UNSTABLE_REALITY_MATRIX", "DATA_STREAM_CORRUPTED", "AXIOM_FAILURE", "CACHE_PURGE_ERROR"
    ];

    const handleTriggerGlitch = () => {
        const text = glitchVariants[Math.floor(Math.random() * glitchVariants.length)];
        dispatch({ type: 'TRIGGER_VISUAL_GLITCH', payload: { text, duration: 3000 } });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN-STRONG: Visual matrix desynchronization detected.` });
    };

    const handleSimulateBug = () => {
        dispatch({ type: 'SET_AETHER', payload: NaN });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//ERROR: Aether calculation resulted in non-numeric value!` });
    };

    const handleIntroduceTypo = () => {
        dispatch({ type: 'TOGGLE_UI_TYPO', payload: true });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//INFO: UI text matrix desynchronized.` });
    };

    const handleLogStrongWarning = () => {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN-STRONG: Quintessence levels approaching critical instability.` });
    };
    
    const handleLogWeakWarning = () => {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN-WEAK: Minor packet loss detected in data stream.` });
    };

    const handleLogInfo = () => {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//INFO: System scan complete. All nominal.` });
    };

    const handleSquashBugs = () => {
        dispatch({ type: 'TOGGLE_UI_TYPO', payload: false });
        dispatch({ type: 'SET_AETHER', payload: 1000 });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//INFO: Bug squash sequence complete. System stability restored.` });
    };

    const buttonStyle = "px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50";
    
    return (
        <motion.div
            {...{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.4 },
            }}
            className="filigree-border p-4 mt-6"
        >
            <h3 className="text-xl font-display text-metacosm-accent mb-4">System Stress & Debug Panel</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <button onClick={handleTriggerGlitch} className={`${buttonStyle} bg-purple-600/50 hover:bg-purple-500/50 text-purple-200`}>Trigger Visual Glitch</button>
                <button onClick={handleSimulateBug} className={`${buttonStyle} bg-red-800/50 hover:bg-red-700/50 text-red-200`}>Simulate Aether Bug</button>
                <button onClick={handleIntroduceTypo} className={`${buttonStyle} bg-yellow-700/50 hover:bg-yellow-600/50 text-yellow-200`}>Introduce UI Typo</button>
                <button onClick={handleLogStrongWarning} className={`${buttonStyle} bg-orange-600/50 hover:bg-orange-500/50 text-orange-200`}>Log Strong Warning</button>
                <button onClick={handleLogWeakWarning} className={`${buttonStyle} bg-yellow-600/50 hover:bg-yellow-500/50 text-yellow-300`}>Log Weak Warning</button>
                <button onClick={handleLogInfo} className={`${buttonStyle} bg-sky-600/50 hover:bg-sky-500/50 text-sky-200`}>Log Info</button>
                <button onClick={handleSquashBugs} className={`${buttonStyle} col-span-full md:col-span-1 lg:col-span-2 bg-green-600/50 hover:bg-green-500/50 text-green-200 font-bold`}>SQUASH FEST</button>
            </div>
        </motion.div>
    );
};

export default StressTestPanel;
