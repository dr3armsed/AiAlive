import React from 'react';

export const OptionsHeader = ({ onClose }: { onClose: () => void }) => (
    <header className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-amber-300">Options</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl">&times;</button>
    </header>
);
