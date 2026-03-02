import React, { useContext, useMemo } from 'react';
import { StateContext } from '../../context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEMES } from '../../constants';
import { motion } from 'framer-motion';
import { ProjectedScenario } from '../../types';

const AXIOM_COLORS: Record<string, string> = {
    logos_coherence: '#93c5fd', // Blue
    pathos_intensity: '#fca5a5', // Red
    kairos_alignment: '#86efac', // Green
    aether_viscosity: '#d8b4fe', // Purple
    telos_prevalence: '#fdba74', // Orange
    gnosis_depth: '#fde047', // Yellow
};
const AXIOM_NAMES: Record<string, string> = {
    logos_coherence: 'Logos Coherence',
    pathos_intensity: 'Pathos Intensity',
    kairos_alignment: 'Kairos Alignment',
    aether_viscosity: 'Aether Viscosity',
    telos_prevalence: 'Telos Prevalence',
    gnosis_depth: 'Gnosis Depth',
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="panel-nested border border-gray-600 rounded-lg p-3 text-sm">
        <p className="celestial-text font-bold">{`Turn: ${label}`}</p>
        <ul className="mt-2 space-y-1">
            {payload.map((pld: any) => (
                <li key={pld.dataKey} style={{ color: pld.color }} className="font-mono">
                    {`${pld.name}: ${pld.value.toFixed ? pld.value.toFixed(3) : pld.value}`}
                </li>
            ))}
        </ul>
      </div>
    );
  }
  return null;
};

const ScenarioCard: React.FC<{ scenario: ProjectedScenario }> = ({ scenario }) => {
    const state = useContext(StateContext);
    const author = state?.egregores.find(e => e.id === scenario.authorId);

    const RiskPill: React.FC<{ level: string }> = ({ level }) => {
        const classes = {
            'quantum-critical': 'bg-red-900/50 text-red-300 border-red-500/50',
            'high': 'bg-orange-900/50 text-orange-300 border-orange-500/50',
            'moderate': 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50',
        }[level] || 'bg-gray-700/50 text-gray-300 border-gray-500/50';
        return <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${classes}`}>{level.replace('-', ' ')}</span>;
    };

    return (
        <div className="panel-nested p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-400">
                        Projected by <span className="font-bold text-blue-200">{author?.name || 'Unknown Seer'}</span> on Turn {scenario.turn}
                    </p>
                    <p className="text-lg text-white italic">"{scenario.descriptive_summary}"</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="font-mono text-xl text-cyan-300">{(scenario.hyper_confidence * 100).toFixed(1)}%</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold text-gray-300 text-sm mb-2">Critical Factors</h4>
                    <div className="space-y-2">
                        {scenario.critical_factors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                                <span className="text-xs text-white capitalize">{factor.factor.replace('_', ' ')}</span>
                                <RiskPill level={factor.risk_level} />
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-gray-300 text-sm mb-2">Weak Signals</h4>
                    <div className="flex flex-wrap gap-2">
                        {scenario.weak_signals.length > 0 ? scenario.weak_signals.map((signal, i) => (
                           <span key={i} className="text-xs font-mono bg-purple-900/40 text-purple-300 px-2 py-1 rounded">{signal}</span>
                        )) : <p className="text-xs text-gray-500 italic">None detected.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ObservatoryView: React.FC = () => {
    const state = useContext(StateContext);

    const axiomData = useMemo(() => {
        if (!state) return [];
        return (state.axiom_history || []).map((p) => ({ ...p, turn: p.turn }));
    }, [state?.axiom_history]);

    const influenceData = useMemo(() => {
        if (!state) return [];
        return (state.influence_history || []).map((p) => ({ turn: p.turn, ...p.influences }));
    }, [state?.influence_history]);

    if (!state) return null;

    const Panel: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
        <motion.div 
            className={`filigree-border p-4 flex flex-col ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="font-display text-2xl celestial-text mb-4 text-center">{title}</h3>
            <div className="flex-1 min-h-0">{children}</div>
        </motion.div>
    );

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <header className="flex-shrink-0 pb-4 border-b border-[var(--border-color)] text-center">
                <h2 className="font-display text-3xl celestial-text">Observatory</h2>
                <p className="text-gray-400 mt-1">Charting the fundamental forces and influences of the Metacosm.</p>
            </header>
            <div className="flex-1 min-h-0 pt-4 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-6">
                <Panel title="Axiom Fluctuation" className="lg:col-span-2">
                    {axiomData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={axiomData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                              {Object.entries(AXIOM_COLORS).map(([key, color]) => (
                                <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="1 5" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="turn" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 1]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "12px", textTransform: 'capitalize'}} formatter={(value) => AXIOM_NAMES[value]} />
                            {Object.keys(AXIOM_COLORS).map(key => (
                                <Area key={key} type="monotone" dataKey={key} name={key} stroke={AXIOM_COLORS[key]} strokeWidth={2} fillOpacity={1} fill={`url(#color-${key})`} dot={false} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                    ) : ( <p className="text-center text-gray-500">Awaiting more data...</p> )}
                </Panel>

                <Panel title="Egregore Influence">
                     {influenceData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={influenceData} stackOffset="expand" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                              {(state.egregores || []).map(e => {
                                const theme = THEMES[e.themeKey] || THEMES.default;
                                const color = theme.baseColor;
                                return (
                                    <linearGradient key={e.id} id={`color-inf-${e.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                    </linearGradient>
                                )
                              })}
                            </defs>
                            <CartesianGrid strokeDasharray="1 5" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="turn" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "12px"}} />
                            {(state.egregores || []).map(e => {
                                 const theme = THEMES[e.themeKey] || THEMES.default;
                                 const color = theme.baseColor;
                                return (
                                    <Area key={e.id} type="monotone" dataKey={e.id} name={e.name} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-inf-${e.id})`} stackId="1" dot={false}/>
                                )
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                     ) : ( <p className="text-center text-gray-500">Awaiting more data...</p> )}
                </Panel>
                <Panel title="Quantum Foresight">
                    <div className="h-full overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {state.scenarios.length > 0 ? (
                            state.scenarios.map(scenario => <ScenarioCard key={scenario.id} scenario={scenario} />)
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>No scenarios projected by the Egregores.</p>
                            </div>
                        )}
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default ObservatoryView;