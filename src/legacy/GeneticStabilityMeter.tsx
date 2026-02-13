
import React, { useMemo } from 'react';
import { InstructionKey } from '../../../../digital_dna/instructions';

type Props = {
    genes: InstructionKey[];
};

export const GeneticStabilityMeter: React.FC<Props> = ({ genes }) => {
    const stats = useMemo(() => {
        let score = 100;
        const counts = {
            art: genes.filter(k => k.startsWith('ART')).length,
            ctl: genes.filter(k => k.startsWith('CTL')).length,
            util: genes.filter(k => k.startsWith('UTIL')).length,
            total: genes.length
        };

        // Instability factors
        if (counts.art > 2 && counts.ctl === 0) score -= 20; // Chaos without control
        if (counts.total < 4) score -= 30; // Too simple to survive
        if (genes.includes('SELF-EDIT') && !genes.includes('CTL-TRY-CATCH')) score -= 40; // Dangerous self-mod without error handling

        // Stability factors
        if (genes.includes('CTL-TRY-CATCH')) score += 10;
        if (genes.includes('UTIL-TYPEOF')) score += 5;
        
        return { score: Math.min(100, Math.max(0, score)), counts };
    }, [genes]);

    let statusColor = 'bg-green-500';
    let statusLabel = 'Stable';
    
    if (stats.score < 40) { statusColor = 'bg-red-500'; statusLabel = 'Critical'; }
    else if (stats.score < 70) { statusColor = 'bg-yellow-500'; statusLabel = 'Volatile'; }

    return (
        <div className="bg-black/30 p-3 rounded-lg border border-gray-700 mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-500">Genetic Stability Forecast</span>
                <span className={`text-xs font-bold ${statusColor.replace('bg-', 'text-')}`}>{statusLabel} ({stats.score}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${statusColor} transition-all duration-500`} style={{ width: `${stats.score}%` }}></div>
            </div>
            <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                <span>Logic: {stats.counts.ctl}</span>
                <span>Creative: {stats.counts.art}</span>
                <span>Utility: {stats.counts.util}</span>
            </div>
        </div>
    );
};
