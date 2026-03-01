import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScannerCommsChannel from '@/views/scanners/ScannerCommsChannel';
import ParadoxRegistry from '@/views/ParadoxRegistry';
import clsx from 'clsx';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { XIcon } from '@/components/icons';
import StressTestPanel from '@/components/StressTestPanel';
import ScannerCard from '@/components/ScannerCard';
import type { SystemReportItem, ReportSeverity } from '@/types';

type SystemTab = 'scanners' | 'comms' | 'paradoxes';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={clsx(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
            active
                ? "text-metacosm-accent border-b-2 border-metacosm-accent"
                : "text-gray-400 hover:text-white"
        )}
    >
        {children}
    </button>
);

const SystemIntegrity = () => {
    const [activeTab, setActiveTab] = useState<SystemTab>('scanners');
    const { ui_typo_active, paradoxes, egregores, world_lore, world, projects, turn } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const activeParadoxes = paradoxes.filter(p => p.status === 'active').length;

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    // --- Scanner Logic ---
    const stabilityReports = useMemo((): SystemReportItem[] => {
        const fracturedCount = egregores.filter(e => e.phase === 'Fractured').length;
        const totalEgregores = egregores.filter(e => !e.is_core_frf).length;
        if (totalEgregores === 0) {
            return [{
                id: 'no-egregores',
                title: 'No Egregores',
                details: 'The Metacosm is empty. Stability is undefined.',
                suggestion: 'Conjure a new Egregore to begin the simulation.',
                severity: 'warning'
            }];
        }

        const fractureRate = fracturedCount / totalEgregores;
        let severity: ReportSeverity = 'nominal';
        let details = `${fracturedCount} of ${totalEgregores} Egregores are in a Fractured state.`;
        if (fractureRate > 0.5) {
            severity = 'critical';
            details += ' Widespread axiomatic failure is imminent.';
        } else if (fractureRate > 0.2) {
            severity = 'warning';
        }

        return [{
            id: 'fracture-rate',
            title: 'Egregore Fracture Rate',
            details,
            suggestion: 'Escort fractured Egregores to the FRF Matrix. If the rate is critical, consider using a stabilizing Architect Glyph.',
            severity
        }];
    }, [egregores]);

    const performanceReports = useMemo((): SystemReportItem[] => {
        const entityCount = egregores.length + (world_lore.length); // Ancillae removed for brevity
        
        let severity: ReportSeverity = 'nominal';
        if (entityCount > 500) severity = 'critical';
        else if (entityCount > 250) severity = 'warning';

        return [{
            id: 'entity-count',
            title: 'Total Entity Count',
            details: `Tracking ${entityCount} total entities (Egregores, Lore).`,
            suggestion: 'If performance degrades, consider creating Tomes from lore or archiving old data.',
            severity
        }];
    }, [egregores, world_lore]);
    
    const upgradeReports = useMemo((): SystemReportItem[] => {
        const reportsList: SystemReportItem[] = [];
        if (Object.keys(world.floors).length === 1 && turn > 20) {
            reportsList.push({
                id: 'multi-floor', title: 'Vertical Expansion Potential',
                details: 'The Metacosm exists on a single plane. Vertical construction is possible but has not been attempted.',
                suggestion: 'Encourage Egregores to use the CONSTRUCT_STRUCTURE action to build stairwells to new floors.',
                severity: 'nominal'
            });
        }
        if (reportsList.length === 0) {
            reportsList.push({
                id: 'no-upgrades', title: 'All Systems Evolving',
                details: 'Egregores are exploring the available mechanics at a nominal rate.',
                suggestion: 'Continue to observe and provide novel prompts to inspire new avenues of growth.',
                severity: 'nominal'
            });
        }
        return reportsList;
    }, [world, projects, turn]);

    const modularizationReports = useMemo((): SystemReportItem[] => {
        const reportsList: SystemReportItem[] = [];
        const loreByAuthor = world_lore.reduce((acc, lore) => {
            acc[lore.authorId] = (acc[lore.authorId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let hasBloat = false;
        for (const authorId in loreByAuthor) {
            if (loreByAuthor[authorId] > 10) {
                hasBloat = true;
                const author = egregores.find(e => e.id === authorId);
                reportsList.push({
                    id: `lore-bloat-${authorId}`, title: 'Conceptual Bloat Detected',
                    details: `${author?.name || 'An Egregore'} has created ${loreByAuthor[authorId]} individual lore fragments, risking incoherence.`,
                    suggestion: 'Consider prompting the Egregore to synthesize their work into a cohesive Tome.',
                    severity: 'warning'
                });
            }
        }
        if (!hasBloat) {
            reportsList.push({
                id: 'no-bloat', title: 'Knowledge Base Coherent',
                details: 'Lore production is distributed and modular. No single point of conceptual failure detected.',
                suggestion: 'Continue monitoring for emergent complexity.',
                severity: 'nominal'
            });
        }
        return reportsList;
    }, [world_lore, egregores]);

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <h1 className="text-4xl font-display celestial-text mb-4">
                {ui_typo_active ? 'System Integirty Matrix' : 'System Integrity Matrix'}
            </h1>
            <div className="border-b border-amber-300/20 mb-4 flex items-center">
                <TabButton active={activeTab === 'scanners'} onClick={() => setActiveTab('scanners')}>Diagnostic Scanners</TabButton>
                <TabButton active={activeTab === 'comms'} onClick={() => setActiveTab('comms')}>Comms Channel</TabButton>
                <TabButton active={activeTab === 'paradoxes'} onClick={() => setActiveTab('paradoxes')}>
                    <div className="relative">
                        Paradox Registry
                        {activeParadoxes > 0 && (
                            <span className="absolute -top-1 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {activeParadoxes}
                            </span>
                        )}
                    </div>
                </TabButton>
            </div>
            
             <div className="flex-1 overflow-hidden">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full overflow-y-auto"
                    >
                        {activeTab === 'scanners' && (
                            <div>
                                <p className="text-gray-400 mb-6 max-w-3xl">
                                    This matrix provides a high-level overview of the Metacosm's operational status. The sub-scanners continuously monitor for instability, performance degradation, and opportunities for evolution.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ScannerCard title="Stability Scanner" reports={stabilityReports} delay={0} />
                                    <ScannerCard title="Performance Scanner" reports={performanceReports} delay={0.1} />
                                    <ScannerCard title="Upgrade Scanner" reports={upgradeReports} delay={0.2} />
                                    <ScannerCard title="Modularization Scanner" reports={modularizationReports} delay={0.3} />
                                </div>
                                <StressTestPanel />
                            </div>
                        )}
                        {activeTab === 'comms' && <ScannerCommsChannel />}
                        {activeTab === 'paradoxes' && <ParadoxRegistry />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SystemIntegrity;