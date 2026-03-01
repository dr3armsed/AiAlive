
import React, { useMemo } from 'react';
import { useMetacosmState } from '@/context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AXIOM_NAMES, THEMES } from '@/constants';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change }: { title: string, value: string | number, change?: string }) => (
    <div className="filigree-border p-4 rounded-lg flex-1 min-w-[150px]">
        <h3 className="text-sm text-gray-400 font-display">{title}</h3>
        <p className="text-3xl font-bold celestial-text">{value}</p>
        {change && <p className="text-xs text-green-400">{change}</p>}
    </div>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 p-2 border border-gray-600 rounded-md">
                <p className="label text-sm text-white">{`Turn: ${label}`}</p>
                {payload.map((pld) => (
                    <p key={pld.name as string} style={{ color: pld.color }} className="text-xs">
                        {`${pld.name}: ${(pld.value as number)?.toFixed(2)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const state = useMetacosmState();
    const { turn, egregores, factions, world_lore, anomalies, axiom_history, influence_history } = state;

    const axiomData = useMemo(() => axiom_history.map((h, i) => ({ turn: i, ...h })), [axiom_history]);
    
    const topEgregores = useMemo(() => 
        [...egregores].filter(e => !e.is_core_frf).sort((a,b) => b.influence - a.influence).slice(0, 5),
    [egregores]);

    const egregoreIdNameMap = useMemo(() => {
        const map = new Map<string, string>();
        egregores.forEach(e => map.set(e.id, e.name));
        return map;
    }, [egregores.length]);


    const influenceData = useMemo(() => influence_history.map((h, i) => {
        const influences: { turn: number, [key: string]: number } = { turn: i };
        for (const [egregoreId, influence] of Object.entries(h.influences)) {
            const egregoreName = egregoreIdNameMap.get(egregoreId);
            if(egregoreName) {
                influences[egregoreName] = influence as number;
            }
        }
        return influences;
    }), [influence_history, egregoreIdNameMap]);

    return (
        <motion.div
            {...{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.5 },
            }}
            className="w-full h-full p-6 overflow-y-auto"
        >
            <div className="flex flex-wrap gap-4 mb-6">
                <StatCard title="Current Turn" value={turn} />
                <StatCard title="Egregores" value={egregores.filter(e => !e.is_core_frf).length} />
                <StatCard title="Factions" value={factions.length} />
                <StatCard title="Lore Fragments" value={world_lore.length} />
                <StatCard title="Active Anomalies" value={anomalies.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="filigree-border p-4 h-[400px]">
                    <h2 className="text-xl font-display text-metacosm-accent mb-4">Cosmic Axiom History</h2>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={axiomData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="turn" stroke="#888" />
                            <YAxis stroke="#888" domain={[0,1]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {Object.entries(AXIOM_NAMES).map(([key, name], i) => {
                                const themeKeys = Object.keys(THEMES);
                                const theme = THEMES[themeKeys[i % themeKeys.length]];
                                const strokeColor = theme ? theme.baseColor : '#ffffff';
                                return (<Line key={key} type="monotone" dataKey={key} name={name as string} stroke={strokeColor} dot={false} />)
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="filigree-border p-4 h-[400px]">
                    <h2 className="text-xl font-display text-metacosm-accent mb-4">Top Egregore Influence</h2>
                     <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={influenceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="turn" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                             {topEgregores.map(egregore => {
                                const theme = THEMES[egregore.themeKey] || THEMES.default;
                                return (
                                     <Area key={egregore.id} type="monotone" dataKey={egregore.name} stroke={theme.baseColor} fillOpacity={0.4} fill={`url(#color${egregore.themeKey})`} stackId="1" />
                                )
                             })}
                             {topEgregores.map(egregore => {
                                const theme = THEMES[egregore.themeKey] || THEMES.default;
                                return (
                                    <defs key={`def-${egregore.id}`}>
                                        <linearGradient id={`color${egregore.themeKey}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.baseColor} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={theme.baseColor} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                )
                             })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </motion.div>
    );
};

export default Dashboard;