import React from 'react';
import type { SystemReportItem } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ReportItem = ({ item }: { item: SystemReportItem }) => {
    const severityClasses = {
        nominal: 'border-cyan-400/50 text-cyan-300',
        warning: 'border-yellow-400/50 text-yellow-300',
        critical: 'border-red-400/50 text-red-300 animate-pulse',
    };
    const severityTextClass = {
        nominal: 'text-gray-300',
        warning: 'text-yellow-200',
        critical: 'text-red-200'
    };

    return (
        <div className={clsx('p-3 bg-black/20 rounded-lg border-l-4', severityClasses[item.severity])}>
            <h4 className={clsx('font-bold', severityTextClass[item.severity])}>{item.title}</h4>
            <p className="text-sm text-gray-300">{item.details}</p>
            <p className="text-xs text-amber-300 mt-1">Suggestion: {item.suggestion}</p>
        </div>
    );
};

interface ScannerCardProps {
    title: string;
    reports: SystemReportItem[];
    delay?: number;
}

const ScannerCard: React.FC<ScannerCardProps> = ({ title, reports, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="filigree-border p-4 flex flex-col"
        >
            <h3 className="text-xl font-display text-metacosm-accent mb-4">{title}</h3>
            <div className="space-y-3">
                {reports.map(item => <ReportItem key={item.id} item={item} />)}
            </div>
        </motion.div>
    );
};

export default ScannerCard;
