
import React, { useContext, useMemo } from 'react';
import { StateContext } from '../../context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEMES } from '../../constants';
import { motion } from 'framer-motion';

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
      <div className="filigree-border rounded-lg p-3 text-sm">
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

const ObservatoryView: React.FC = () => {
    const state = useContext(StateContext);

    const axiomData = useMemo(() => {
        if (!state) return [];
        return (state.axiom_history || []).map((p, i) => ({ ...p, turn: state.turn - (state.axiom_history || []).length + i + 1 }));
    }, [state?.axiom_history, state?.turn]);

    const influenceData = useMemo(() => {
        if (!state) return [];
        return (state.influence_history || []).map((p, i) => ({ turn: state.turn - (state.influence_history || []).length + i + 1, ...p.influences }));
    }, [state?.influence_history, state?.turn]);

    if (!state) return null;

    const Panel: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <motion.div 
            className="filigree-border rounded-2xl p-4 flex flex-col"
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
            <header className="flex-shrink-0 pb-4 border-b border-amber-300/20 text-center">
                <h2 className="font-display text-3xl celestial-text">Observatory</h2>
                <p className="text-gray-400 mt-1">Charting the fundamental forces and influences of the Metacosm.</p>
            </header>
            <div className="flex-1 min-h-0 pt-4 grid grid-cols-1 grid-rows-2 gap-6">
                <Panel title="Axiom Fluctuation">
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
                            <CartesianGrid strokeDasharray="1 5" stroke="rgba(255,223,186,0.1)" />
                            <XAxis dataKey="turn" stroke="rgba(255,223,186,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(255,223,186,0.5)" fontSize={12} domain={[0, 1]} />
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
                            <CartesianGrid strokeDasharray="1 5" stroke="rgba(255,223,186,0.1)" />
                            <XAxis dataKey="turn" stroke="rgba(255,223,186,0.5)" fontSize={12} />
                            <YAxis tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="rgba(255,223,186,0.5)" fontSize={12} />
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
            </div>
        </div>
    );
};

export default ObservatoryView;
