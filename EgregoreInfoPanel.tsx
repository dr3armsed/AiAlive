import React from 'react';
import InfoPanel from '@/components/InfoPanel';
import { Egregore } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import { THEMES } from '@/constants';

const EgregoreInfoPanel = ({ egregore, onClose }: { egregore: Egregore, onClose: () => void }) => {
    const theme = THEMES[egregore.themeKey] || THEMES.default;
    return (
        <InfoPanel title={egregore.name} onClose={onClose}>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                    <UserAvatar egregore={egregore} size="md" />
                    <div>
                        <p className="font-bold text-white">{egregore.archetypeId}</p>
                        <p className="text-xs text-gray-400">{egregore.alignment.morality} {egregore.alignment.axis}</p>
                    </div>
                </div>
                <p className="italic text-gray-300">"{egregore.persona}"</p>
                <div>
                    <span className="text-gray-400">Phase: </span>
                    <span className="font-bold">{egregore.phase}</span>
                </div>
                 <div className="h-2 w-full bg-black/20 rounded-full mt-2">
                    <div className="h-full rounded-full" style={{ width: `${egregore.coherence}%`, backgroundColor: theme.baseColor }}></div>
                    <div className="text-xs text-center text-gray-400">Coherence</div>
                </div>
            </div>
        </InfoPanel>
    );
};

export default EgregoreInfoPanel;