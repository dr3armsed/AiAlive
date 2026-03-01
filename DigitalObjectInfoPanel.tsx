
import React from 'react';
import InfoPanel from '@/components/InfoPanel';
import type { DigitalObject } from '@/types';

const DigitalObjectInfoPanel = ({ object, onClose }: { object: DigitalObject, onClose: () => void }) => {
    return (
        <InfoPanel title={object.name} onClose={onClose}>
            <div className="space-y-2 text-sm">
                <p className="italic text-gray-300">"{object.description}"</p>
                <p><span className="text-gray-400">Function: </span>{object.function}</p>
                {object.traits && object.traits.length > 0 && (
                     <div>
                        <span className="text-gray-400">Traits:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {object.traits.map(trait => (
                                <span key={trait} className="text-xs bg-cyan-800/50 text-cyan-200 px-2 py-0.5 rounded-full">{trait}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </InfoPanel>
    );
};

export default DigitalObjectInfoPanel;