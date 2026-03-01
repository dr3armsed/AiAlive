import React from 'react';
import { motion } from 'framer-motion';
import type { ProposedEgregore } from '../types';

interface ProposedEgregoreCardProps {
    proposal: ProposedEgregore;
    actions: React.ReactNode;
}

const ProposedEgregoreCard: React.FC<ProposedEgregoreCardProps> = ({ proposal, actions }) => {
    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0, x: -10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 10 },
            }}
            className="bg-black/20 p-3 rounded-lg flex justify-between items-center"
        >
            <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{proposal.name}</p>
                <p className="text-xs text-gray-400 truncate">{proposal.archetype.name} - {proposal.persona}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {actions}
            </div>
        </motion.li>
    );
};

export default ProposedEgregoreCard;
