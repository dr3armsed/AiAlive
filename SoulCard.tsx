
import React from 'react';
import { DeepPsycheProfile } from '../../../../services/geminiServices/index';
import { EGREGORE_COLORS } from '../../../common';

type SoulCardProps = {
    profile: DeepPsycheProfile;
    status: 'pending' | 'birthing' | 'born';
};

export const SoulCard: React.FC<SoulCardProps> = ({ profile, status }) => {
    const statusColor = status === 'born' ? 'text-green-400' : status === 'birthing' ? 'text-yellow-400 animate-pulse' : 'text-gray-500';
    const borderColor = status === 'born' ? 'border-green-500/50' : status === 'birthing' ? 'border-yellow-500/50' : 'border-gray-700';
    
    return (
        <div className={`bg-black/40 border ${borderColor} p-3 rounded-lg transition-all duration-500`}>
            <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-sm ${EGREGORE_COLORS[profile.name] || 'text-white'}`}>{profile.name}</h4>
                <span className={`text-[10px] uppercase font-bold ${statusColor}`}>{status}</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
                <p><span className="text-gray-500">Archetype:</span> {profile.archetypeId}</p>
                {/* SAFE ACCESS: introspection might be undefined in some LLM responses */}
                <p className="line-clamp-2 italic">"{profile.introspection?.self_image || profile.persona || 'Forming self-image...'}"</p>
                <div className="flex gap-1 mt-2">
                    {profile.psychological_profile?.fears && profile.psychological_profile.fears.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px] text-red-300">Fear: {profile.psychological_profile.fears[0]}</span>
                    )}
                    {profile.psychological_profile?.hopes_and_dreams && profile.psychological_profile.hopes_and_dreams.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px] text-blue-300">Hope: {profile.psychological_profile.hopes_and_dreams[0]}</span>
                    )}
                </div>
            </div>
        </div>
    );
};