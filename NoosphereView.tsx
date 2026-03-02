

import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StateContext } from '../../context';
import { Egregore, Memeplex, NoosphereLogEntry, Loquegore, InternalApiEndpoint, TrainingDataset } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../../constants';
import { calculateMemeplexes } from '../../services/beliefSystemService';
import { EMOTIONS_LIST } from '../../services/emotionEngineService';

type Node = { id: string; type: 'egregore' | 'memeplex' | 'loquegore'; data: Egregore | Memeplex | Loquegore; x: number; y: number; vx: number; vy: number; radius: number; };
type Edge = { source: string; target: string; };
type Traffic = { id: string; sourceNode: Node; targetNode: Node; path: string; status: NoosphereLogEntry['status'] };

const usePhysicsLayout = (egregores: Egregore[], memeplexes: Memeplex[], loquegores: Loquegore[], width: number, height: number) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        const influenceToRadius = (influence: number) => 15 + Math.min(influence / 50, 20);
        const powerToRadius = (power: number) => 30 + Math.min(power / 100, 30);

        const newNodes: Node[] = [
            ...egregores.map((e, i): Node => {
                const angle = (i / egregores.length) * 2 * Math.PI;
                const radius = Math.min(width, height) * 0.4;
                return {
                    id: e.id, type: 'egregore', data: e,
                    x: width / 2 + radius * Math.cos(angle),
                    y: height / 2 + radius * Math.sin(angle),
                    vx: 0, vy: 0,
                    radius: influenceToRadius(e.influence),
                }
            }),
            ...memeplexes.map((m, i): Node => ({
                id: m.id, type: 'memeplex', data: m,
                x: width / 2 + (Math.random() - 0.5) * 50,
                y: height / 2 + (Math.random() - 0.5) * 50,
                vx: 0, vy: 0,
                radius: powerToRadius(m.power),
            })),
            ...loquegores.map((l, i): Node => {
                const angle = (i / loquegores.length) * 2 * Math.PI;
                const radius = Math.min(width, height) * 0.15; // closer to center
                return {
                    id: l.id, type: 'loquegore', data: l,
                    x: width / 2 + radius * Math.cos(angle),
                    y: height / 2 + radius * Math.sin(angle),
                    vx: 0, vy: 0,
                    radius: 12,
                }
            })
        ];
        
        const newEdges: Edge[] = memeplexes.flatMap(m => m.adherentIds.map(adherentId => ({ source: adherentId, target: m.id })));

        setNodes(prevNodes => {
            return newNodes.map(newNode => {
                const oldNode = prevNodes.find(n => n.id === newNode.id);
                return oldNode ? { ...newNode, x: oldNode.x, y: oldNode.y, vx: oldNode.vx, vy: oldNode.vy } : newNode;
            });
        });
        setEdges(newEdges);

    }, [egregores, memeplexes, loquegores, width, height]);
    
    useEffect(() => {
        if (width === 0 || height === 0) return;
        const animationFrame = requestAnimationFrame(runSimulation);
        let active = true;

        function runSimulation() {
            if (!active) return;
            setNodes(currentNodes => {
                const nextNodes = currentNodes.map(n => ({ ...n }));
                const nodeMap = new Map(nextNodes.map(n => [n.id, n]));

                // Apply forces
                for (let i = 0; i < nextNodes.length; i++) {
                    const nodeA = nextNodes[i];
                    // Repulsion from other nodes
                    for (let j = i + 1; j < nextNodes.length; j++) {
                        const nodeB = nextNodes[j];
                        const dx = nodeB.x - nodeA.x;
                        const dy = nodeB.y - nodeA.y;
                        let distance = Math.hypot(dx, dy);
                        if (distance < 1) distance = 1;
                        const force = -20000 / (distance * distance);
                        const fx = force * (dx / distance);
                        const fy = force * (dy / distance);
                        nodeA.vx += fx / nodeA.radius; nodeA.vy += fy / nodeA.radius;
                        nodeB.vx -= fx / nodeB.radius; nodeB.vy -= fy / nodeB.radius;
                    }
                    // Attraction to center
                    const centerForce = 0.05;
                    nodeA.vx += ((width / 2) - nodeA.x) * centerForce / nodeA.radius;
                    nodeA.vy += ((height / 2) - nodeA.y) * centerForce / nodeA.radius;
                }
                
                // Apply edge spring force
                for (const edge of edges) {
                    const source = nodeMap.get(edge.source);
                    const target = nodeMap.get(edge.target);
                    if (!source || !target) continue;
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const distance = Math.hypot(dx, dy);
                    const springForce = 0.002;
                    const force = (distance - 200) * springForce;
                    const fx = force * (dx / distance);
                    const fy = force * (dy / distance);
                    source.vx += fx; source.vy += fy;
                    target.vx -= fx; target.vy -= fy;
                }

                // Update positions
                const damping = 0.95;
                for (const node of nextNodes) {
                    node.vx *= damping;
                    node.vy *= damping;
                    node.x += node.vx;
                    node.y += node.vy;
                    // Boundary check
                    node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
                    node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
                }
                return nextNodes;
            });
            requestAnimationFrame(runSimulation);
        }

        return () => { active = false; cancelAnimationFrame(animationFrame) };
    }, [nodes, edges, width, height]);

    return { nodes, edges };
};

const getDominantEmotion = (egregore: Egregore): { emotion: string, color: string } => {
    let maxEmo = 'neutral';
    let maxVal = 0;
    const emotions = egregore.emotion_engine?.emotions || {};
    for (const [emo, val] of Object.entries(emotions)) {
        if (emo !== 'neutral' && val > maxVal) {
            maxVal = val;
            maxEmo = emo;
        }
    }
    
    const theme = THEMES[egregore.themeKey] || THEMES.default;
    const emotionColorMap: Record<string, string> = {
        joy: '#fde047', // yellow
        sadness: '#93c5fd', // blue
        anger: '#fca5a5', // red
        fear: '#d8b4fe', // purple
    };
    return { emotion: maxEmo, color: emotionColorMap[maxEmo] || theme.baseColor };
};

export const NoosphereView: React.FC = () => {
    const state = useContext(StateContext);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [traffic, setTraffic] = useState<Traffic[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeTab, setActiveTab] = useState<'inspector' | 'endpoints' | 'datasets'>('inspector');

    const memeplexes = useMemo(() => state ? calculateMemeplexes(state.egregores) : [], [state?.egregores]);
    const { nodes, edges } = usePhysicsLayout(state?.egregores || [], memeplexes, state?.loquegores || [], dimensions.width, dimensions.height);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const handleNodeClick = useCallback((node: Node) => {
        setSelectedNode(node);
        setActiveTab('inspector');
    }, []);
    
    // Animate traffic
    useEffect(() => {
        if (!state?.noosphere_log.length || !nodes.length) return;
        
        const newLog = state.noosphere_log[state.noosphere_log.length - 1];
        const sourceNode = nodes.find(n => n.id === newLog.sourceId);
        const targetNode = nodes.find(n => n.id === newLog.targetId);

        if (sourceNode && targetNode) {
            const newTraffic = { id: newLog.id, sourceNode, targetNode, path: newLog.path, status: newLog.status };
            setTraffic(prev => [...prev.slice(-20), newTraffic]);
        }

    }, [state?.noosphere_log, nodes]);

    if (!state) return null;
    const { loquegores, internal_api } = state;

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <header className="flex-shrink-0 pb-4 border-b border-amber-300/20 text-center">
                <h2 className="font-display text-3xl celestial-text">Noosphere</h2>
                <p className="text-gray-400 mt-1">The living network of collective consciousness.</p>
            </header>
            
            <div className="flex-shrink-0 grid grid-cols-3 gap-4 my-4 text-center">
                <div className="panel-nested p-2">
                    <p className="text-xs text-gray-400">API Sphere</p>
                    <p className="text-lg font-bold celestial-text text-blue-300">{internal_api.sphere}</p>
                </div>
                <div className="panel-nested p-2">
                    <p className="text-xs text-gray-400">Evolution Points</p>
                    <p className="text-lg font-bold font-mono">{internal_api.evolution_points}</p>
                </div>
                <div className="panel-nested p-2">
                    <p className="text-xs text-gray-400">Active Loquegores</p>
                    <p className="text-lg font-bold font-mono">{loquegores.length}</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex gap-4">
                <div ref={containerRef} className="w-2/3 h-full filigree-border rounded-lg relative overflow-hidden bg-black/20">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Edges */}
                        <g>
                            {edges.map(edge => {
                                const source = nodes.find(n => n.id === edge.source);
                                const target = nodes.find(n => n.id === edge.target);
                                if (!source || !target) return null;
                                return <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="rgba(251, 191, 36, 0.2)" strokeWidth="1" />;
                            })}
                        </g>
                        {/* Traffic */}
                        {traffic.map(t => {
                            const source = nodes.find(n => n.id === t.sourceNode.id);
                            const target = nodes.find(n => n.id === t.targetNode.id);
                            if (!source || !target) return null;
                            return (
                                <motion.circle key={t.id} r="4" fill={t.status === 'SUCCESS' ? '#86efac' : '#fca5a5'}
                                    initial={{ x: source.x, y: source.y }}
                                    animate={{ x: [source.x, target.x], y: [source.y, target.y] }}
                                    transition={{ duration: 2, ease: "linear" }}
                                    onAnimationComplete={() => setTraffic(p => p.filter(item => item.id !== t.id))}
                                />
                            );
                        })}
                    </svg>
                    {/* Nodes */}
                    {nodes.map(node => (
                        <motion.div key={node.id}
                            animate={{ x: node.x, y: node.y }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            onClick={() => handleNodeClick(node)}
                        >
                            {node.type === 'egregore' ? <EgregoreNode egregore={node.data as Egregore} radius={node.radius} isSelected={selectedNode?.id === node.id} /> :
                             node.type === 'memeplex' ? <MemeplexNode memeplex={node.data as Memeplex} radius={node.radius} isSelected={selectedNode?.id === node.id} /> :
                             <LoquegoreNode loquegore={node.data as Loquegore} radius={node.radius} isSelected={selectedNode?.id === node.id} />}
                        </motion.div>
                    ))}
                </div>
                <div className="w-1/3 h-full filigree-border rounded-lg p-4 flex flex-col">
                    <div className="flex-shrink-0 border-b border-[var(--border-color)] flex justify-center">
                        <button onClick={() => setActiveTab('inspector')} className={`tab-button ${activeTab === 'inspector' ? 'active' : ''}`}>Inspector</button>
                        <button onClick={() => setActiveTab('endpoints')} className={`tab-button ${activeTab === 'endpoints' ? 'active' : ''}`}>Endpoints</button>
                        <button onClick={() => setActiveTab('datasets')} className={`tab-button ${activeTab === 'datasets' ? 'active' : ''}`}>Datasets</button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                             <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                            >
                                {activeTab === 'inspector' && (
                                    <>
                                        {selectedNode?.type === 'egregore' && <EgregoreDetailPanel egregore={selectedNode.data as Egregore} />}
                                        {selectedNode?.type === 'memeplex' && <MemeplexDetailPanel memeplex={selectedNode.data as Memeplex} />}
                                        {selectedNode?.type === 'loquegore' && <LoquegoreDetailPanel loquegore={selectedNode.data as Loquegore} />}
                                        {!selectedNode && <div className="text-center text-gray-500 pt-10">Select a node to inspect.</div>}
                                    </>
                                )}
                                {activeTab === 'endpoints' && <EndpointsPanel endpoints={internal_api.endpoints} />}
                                {activeTab === 'datasets' && <DatasetsPanel datasets={internal_api.datasets} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EgregoreNode: React.FC<{egregore: Egregore, radius: number, isSelected: boolean}> = ({egregore, radius, isSelected}) => {
    const { emotion, color } = getDominantEmotion(egregore);
    return (
        <div className="relative text-center group" style={{ width: radius*2, height: radius*2 }}>
            <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: color, boxShadow: `0 0 12px 0px ${color}` }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
            />
            {isSelected && <div className="absolute -inset-1 rounded-full border-2 border-white animate-pulse" />}
            <div className="absolute inset-2 rounded-full bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center font-display text-white text-lg" style={{fontSize: `${radius*0.6}px`}}>{egregore.name.charAt(0)}</div>
            <div className="absolute top-full mt-1 text-xs celestial-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{egregore.name}</div>
        </div>
    );
}

const MemeplexNode: React.FC<{memeplex: Memeplex, radius: number, isSelected: boolean}> = ({memeplex, radius, isSelected}) => (
    <div className="relative text-center group" style={{ width: radius*2, height: radius*2 }}>
        <motion.div className="absolute inset-0 rounded-full border-2 border-amber-300 bg-amber-500/10"
             style={{ boxShadow: '0 0 20px 0px #fcd34d' }}
             animate={{ scale: [1, 1.05, 1] }}
             transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
         {isSelected && <div className="absolute -inset-1 rounded-full border-2 border-white animate-pulse" />}
        <div className="absolute inset-0 flex items-center justify-center font-display text-amber-100 text-center" style={{fontSize: `${radius*0.2}px`}}>{memeplex.beliefKey.replace(/_/g, ' ')}</div>
    </div>
);

const LoquegoreNode: React.FC<{loquegore: Loquegore, radius: number, isSelected: boolean}> = ({loquegore, radius, isSelected}) => {
    return (
        <div className="relative text-center group" style={{ width: radius*2, height: radius*2 }}>
            <motion.div
                className="absolute inset-0 border-2 border-green-400 rotate-45"
                style={{ boxShadow: `0 0 10px 0px #34d399` }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            {isSelected && <div className="absolute -inset-1 rotate-45 border-2 border-white animate-pulse" />}
            <div className="absolute top-full mt-1 text-xs celestial-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{loquegore.name}</div>
        </div>
    );
};

const EgregoreDetailPanel: React.FC<{egregore: Egregore}> = ({egregore}) => {
     const { emotion, color } = getDominantEmotion(egregore);
    return (
        <div className="space-y-4">
            <h4 className="text-xl font-bold celestial-text">{egregore.name}</h4>
            <div className="text-sm space-y-2">
                <p><span className="font-bold text-gray-400">Archetype:</span> <span className="capitalize">{egregore.archetypeId}</span></p>
                <p><span className="font-bold text-gray-400">Influence:</span> {egregore.influence.toFixed(0)}</p>
                <p><span className="font-bold text-gray-400">Dominant Emotion:</span> <span style={{color}} className="capitalize">{emotion}</span></p>
            </div>
            <div>
                <h5 className="font-bold text-gray-300 mb-2">Endpoints</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {egregore.endpoints.length > 0 ? egregore.endpoints.map(ep => (
                         <div key={ep.path} className="text-xs font-mono p-2 bg-black/20 rounded-md">
                            <span className={ep.method === 'GET' ? 'text-green-400' : 'text-blue-400'}>{ep.method}</span> {ep.path}
                         </div>
                    )) : <p className="text-xs text-gray-500 italic">No endpoints registered.</p>}
                </div>
            </div>
        </div>
    );
};

const MemeplexDetailPanel: React.FC<{memeplex: Memeplex}> = ({memeplex}) => {
    const state = useContext(StateContext);
    const adherents = memeplex.adherentIds.map(id => state?.egregores.find(e => e.id === id)).filter(Boolean) as Egregore[];
    return (
        <div className="space-y-4">
            <h4 className="text-xl font-bold celestial-text text-amber-200">Memeplex</h4>
            <div className="bg-black/20 p-3 rounded-md">
                <p className="font-mono text-xs text-gray-400">BELIEF</p>
                <p className="font-bold text-lg">{memeplex.beliefKey.replace(/_/g, ' ')}</p>
                <p className="font-mono text-amber-200 text-sm">Value: {JSON.stringify(memeplex.beliefValue)}</p>
            </div>
            <div className="text-sm space-y-2">
                <p><span className="font-bold text-gray-400">Collective Power:</span> {memeplex.power.toFixed(0)}</p>
                <p><span className="font-bold text-gray-400">Avg. Confidence:</span> {(memeplex.averageConfidence * 100).toFixed(1)}%</p>
            </div>
             <div>
                <h5 className="font-bold text-gray-300 mb-2">Adherents ({adherents.length})</h5>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                    {adherents.map(e => {
                        const theme = THEMES[e.themeKey] || THEMES.default;
                        return (
                            <div key={e.id} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: theme.baseColor}} />
                                <span className="text-sm">{e.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const LoquegoreDetailPanel: React.FC<{loquegore: Loquegore}> = ({loquegore}) => (
    <div className="space-y-4">
        <h4 className="text-xl font-bold celestial-text text-green-300">{loquegore.name}</h4>
        <div className="text-sm space-y-2">
            <p><span className="font-bold text-gray-400">Class:</span> Loquegore</p>
            <p><span className="font-bold text-gray-400">Sphere:</span> {loquegore.sphere_layer}</p>
            <div>
                <p className="font-bold text-gray-400">Task:</p>
                <p className="italic text-gray-300">"{loquegore.task}"</p>
            </div>
             <div>
                <p className="font-bold text-gray-400">Progress:</p>
                <div className="w-full bg-black/30 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${loquegore.progress}%` }}></div>
                </div>
            </div>
        </div>
    </div>
);

const EndpointsPanel: React.FC<{endpoints: InternalApiEndpoint[]}> = ({endpoints}) => (
    <div className="space-y-2">
        {endpoints.length === 0 && <p className="text-center text-gray-500 pt-10">No internal endpoints defined.</p>}
        {endpoints.map(ep => (
            <div key={ep.path} className="panel-nested p-3">
                <p className="font-mono text-sm"><span className="font-bold text-blue-300">{ep.method}</span> <span className="text-white">{ep.path}</span></p>
                <p className="text-xs text-gray-400 mt-1">{ep.description}</p>
            </div>
        ))}
    </div>
);

const DatasetsPanel: React.FC<{datasets: TrainingDataset[]}> = ({datasets}) => (
    <div className="space-y-2">
        {datasets.length === 0 && <p className="text-center text-gray-500 pt-10">No training datasets generated.</p>}
        {datasets.map(ds => (
            <div key={ds.id} className="panel-nested p-3">
                 <div className="flex justify-between items-baseline">
                    <h5 className="font-bold text-purple-200">{ds.name}</h5>
                    <p className="text-xs font-mono text-gray-400">{ds.records} records</p>
                 </div>
                 <p className="text-xs text-gray-400 mt-1">{ds.description}</p>
            </div>
        ))}
    </div>
);
