import React from 'react';
import { useState, useTransition } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import Spinner from '../Spinner';

const HeavyComponent = ({ count }: { count: number }) => {
    const items = [];
    // Reduce iterations to prevent freezing even in the worker, but keep it slow
    for (let i = 0; i < count * 100; i++) {
        items.push(<div key={i} className="w-1 h-1 bg-slate-700 rounded-full" />);
    }
    // Artificial slowdown
    const start = performance.now();
    while(performance.now() - start < 8) {}

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-black/20 rounded-md min-h-[50px]">
            {items}
        </div>
    );
};

const ConcurrencyTestPanel: React.FC = () => {
    const [text, setText] = useState('');
    const [slowCount, setSlowCount] = useState(1);
    const [isPending, startTransition] = useTransition();

    const handleSlowRender = () => {
        startTransition(() => {
            setSlowCount(c => c + 1);
        });
    };

    return (
        <div className="glass-panel p-4">
            <h3 className="text-lg font-bold text-white mb-4">Concurrency Test</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Type in the input below while clicking the "Slow Render" button. The input should remain responsive even if the grid render is slow.
            </p>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-mono">High-Priority Input</label>
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText((e.target as HTMLInputElement).value)}
                        placeholder="Type here..."
                        className="w-full mt-1 bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors"
                    />
                </div>
                
                <motion.button
                    onClick={handleSlowRender}
                    className="w-full font-semibold py-2 px-4 rounded-lg text-white bg-purple-600/80 hover:bg-purple-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isPending ? <div className="flex items-center justify-center gap-2"> <Spinner size="sm" /> Rendering... </div> : `Trigger Slow Render (${slowCount})`}
                </motion.button>

                <div className={`transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                    <HeavyComponent count={slowCount} />
                </div>
            </div>
        </div>
    );
};

export default ConcurrencyTestPanel;