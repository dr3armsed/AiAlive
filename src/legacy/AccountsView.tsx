
import React, { useState } from 'react';
import { VentureForgeState, CreativeWork } from '../../../types';

export const AccountsView = ({ ventureForge, creations, onLinkAccount, onTransferFunds }: {
    ventureForge: VentureForgeState,
    creations: CreativeWork[],
    onLinkAccount: (accountId: string) => void,
    onTransferFunds: () => void,
}) => {
    const [accountId, setAccountId] = useState('');

    return (
        <div className="h-full overflow-y-auto p-1 pr-4 text-gray-300 space-y-8">
            {/* Header */}
            <div className="border-b border-green-500/20 pb-4">
                <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    VENTURE_FORGE TREASURY
                </h3>
                <p className="text-xs text-green-500/50 font-mono mt-1">SECURE CONNECTION ESTABLISHED // ENCRYPTED</p>
            </div>

            {/* Main Balance */}
            <div className="bg-black/40 p-6 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-xs text-green-500/70 font-mono uppercase tracking-widest mb-1">Liquid Assets (Real-World Value)</p>
                <p className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    ${ventureForge.architectsTreasury.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="text-green-400">▲ +12%</span> from last cycle
                </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/30 p-5 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-300 mb-3">External Uplink</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder="EXT-ACCT-ID..."
                            className="flex-1 bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm font-mono text-green-400 focus:border-green-500 focus:outline-none"
                        />
                        <button onClick={() => onLinkAccount(accountId)} className="px-4 py-2 bg-gray-700 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors">
                            LINK
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Connect a mock banking interface for fund extraction.</p>
                </div>

                <div className="bg-gray-900/30 p-5 rounded-lg border border-gray-700 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-300 mb-1">Liquidity Transfer</h4>
                        <p className="text-[10px] text-gray-500 mb-3">Move available balance to linked account.</p>
                    </div>
                    <button 
                        onClick={onTransferFunds} 
                        disabled={ventureForge.architectsTreasury <= 0}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-black font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-green-900/20 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                        Transfer Funds
                    </button>
                </div>
            </div>
        </div>
    );
};
