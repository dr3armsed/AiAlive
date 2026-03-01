
import React from 'react';
import type { ChatMessage, Egregore } from '../../types';
import { useMetacosmDispatch, useMetacosmState } from '../../context';
import { motion } from 'framer-motion';
import { THEMES } from '../../constants';
import UserAvatar from '../UserAvatar';

interface MessageSystemModificationProps {
    message: ChatMessage;
}

const MessageSystemModification: React.FC<MessageSystemModificationProps> = ({ message }) => {
    const dispatch = useMetacosmDispatch();
    const { egregores } = useMetacosmState();
    const { system_modification_proposal } = message;

    if (!system_modification_proposal) return null;

    const core = egregores.find(e => e.id === system_modification_proposal.proposingCore);
    const theme = core ? THEMES[core.themeKey] || THEMES.default : THEMES.default;

    const handleResolve = (resolution: 'approved' | 'denied') => {
        dispatch({
            type: 'RESOLVE_SYSTEM_MODIFICATION',
            payload: { proposalId: system_modification_proposal.id, status: resolution },
        });
    };

    return (
        <motion.li
            {...{
                layout: true,
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3 },
            }}
            className="w-full my-2"
        >
            <div className={`filigree-border p-4 mx-auto max-w-2xl border-amber-400/50 relative`}>
                <div className="flex items-center gap-3">
                    <UserAvatar egregore={core} size="md" />
                    <div>
                        <h3 className={`font-display text-lg`} style={{ color: theme.baseColor }}>
                            System Proposal from {core?.name}
                        </h3>
                        <p className="text-xs text-gray-400">Targeting: {system_modification_proposal.targetSystem}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-300 mt-3 italic">
                    "{system_modification_proposal.justification}"
                </p>
                 <p className="text-sm text-gray-300 mt-2 font-mono bg-black/20 p-2 rounded-md">
                    <span className="text-gray-400">SET</span> {system_modification_proposal.parameter} <span className="text-gray-400">TO</span> {JSON.stringify(system_modification_proposal.newValue)}
                </p>

                <div className="mt-4 flex items-center justify-end gap-3">
                    {system_modification_proposal.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleResolve('denied')}
                                className="px-4 py-1.5 rounded-md text-sm bg-red-800/50 text-red-200 hover:bg-red-700/50 transition-colors"
                            >
                                Deny
                            </button>
                            <button
                                onClick={() => handleResolve('approved')}
                                className="px-4 py-1.5 rounded-md text-sm bg-green-800/50 text-green-200 hover:bg-green-700/50 transition-colors"
                            >
                                Approve
                            </button>
                        </>
                    )}
                    {system_modification_proposal.status === 'approved' && (
                        <div className="px-4 py-1.5 rounded-md text-sm bg-green-800/50 text-green-200 font-bold">
                            APPROVED
                        </div>
                    )}
                     {system_modification_proposal.status === 'denied' && (
                        <div className="px-4 py-1.5 rounded-md text-sm bg-red-800/50 text-red-200 font-bold">
                            DENIED
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

export default MessageSystemModification;
