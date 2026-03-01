import React from 'react';
import type { ChatMessage, ScannerType } from '../../types';
import { useMetacosmDispatch } from '../../context';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MessageUpgradeProposalProps {
    message: ChatMessage;
}

const scannerInfo: Record<ScannerType, { color: string; ring: string }> = {
    Stability: { color: 'text-red-300', ring: 'ring-red-500/50' },
    Performance: { color: 'text-green-300', ring: 'ring-green-500/50' },
    Upgrade: { color: 'text-cyan-300', ring: 'ring-cyan-500/50' },
    Modularization: { color: 'text-yellow-300', ring: 'ring-yellow-500/50' },
};

const MessageUpgradeProposal = ({ message }: MessageUpgradeProposalProps) => {
    const dispatch = useMetacosmDispatch();
    const { upgrade_proposal } = message;

    if (!upgrade_proposal) return null;

    const { color, ring } = scannerInfo[upgrade_proposal.proposingScanner];
    const { status } = upgrade_proposal;

    const handleResolve = (resolution: 'approved' | 'denied') => {
        dispatch({
            type: 'RESOLVE_UPGRADE_PROPOSAL',
            payload: { proposalId: upgrade_proposal.id, status: resolution },
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
            <div className={`filigree-border p-4 mx-auto max-w-xl border-amber-400/50 relative`}>
                <h3 className={`font-display text-lg ${color}`}>
                    Upgrade Proposal: {upgrade_proposal.proposingScanner} Scanner
                </h3>
                <p className="text-sm text-gray-300 mt-2">
                    <span className="font-bold text-gray-100">Justification:</span> {upgrade_proposal.justification}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                    <span className="font-bold text-gray-100">Effect:</span> {upgrade_proposal.resource_cost}
                </p>

                <div className="mt-4 flex items-center justify-end gap-3">
                    {status === 'pending' && (
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
                    {status === 'approved' && (
                        <div className="px-4 py-1.5 rounded-md text-sm bg-green-800/50 text-green-200 font-bold">
                            APPROVED
                        </div>
                    )}
                     {status === 'denied' && (
                        <div className="px-4 py-1.5 rounded-md text-sm bg-red-800/50 text-red-200 font-bold">
                            DENIED
                        </div>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

export default MessageUpgradeProposal;
