import React from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState } from '../../context';
import type { ChatMessage } from '../../types';
import { THEMES } from '../../constants';
import UserAvatar from '../UserAvatar';

const MessageCombatEvent = ({ message }: { message: ChatMessage }) => {
    const { egregores } = useMetacosmState();
    const combatEvent = message.combat_event;

    if (!combatEvent) return null;

    const attacker = egregores.find(e => e.id === combatEvent.attacker_id);
    const defender = egregores.find(e => e.id === combatEvent.defender_id);

    if (!attacker || !defender) return null;

    const attackerTheme = THEMES[attacker.themeKey] || THEMES.default;
    const defenderTheme = THEMES[defender.themeKey] || THEMES.default;
    
    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 },
            }}
            className="w-full my-4"
        >
            <div className="filigree-border p-4 mx-auto max-w-2xl border-2 border-red-500/50 bg-gradient-to-t from-red-900/20 to-black/20">
                <div className="flex justify-around items-center text-center">
                    <div className="flex flex-col items-center gap-2 w-1/3">
                        <UserAvatar egregore={attacker} size="lg" />
                        <span className="font-bold truncate" style={{ color: attackerTheme.baseColor }}>{attacker.name}</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <motion.div
                            {...{
                                initial: { scale: 0 },
                                animate: { scale: 1 },
                                transition: { delay: 0.2, type: 'spring', stiffness: 200, damping: 10 },
                            }}
                            className="font-display text-4xl text-red-400"
                        >
                            VS
                        </motion.div>
                        <p className="text-sm text-gray-300 mt-2">{combatEvent.outcome}</p>
                        <p className="text-xs text-red-300">({combatEvent.quintessence_lost} Quintessence lost)</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-1/3">
                         <UserAvatar egregore={defender} size="lg" />
                         <span className="font-bold truncate" style={{ color: defenderTheme.baseColor }}>{defender.name}</span>
                    </div>
                </div>
            </div>
        </motion.li>
    );
};

export default MessageCombatEvent;
