
import React from 'react';
import { useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import type { DigitalSoul } from '../../types/index.ts';

const MotionLine = motion.line as any;
const MotionG = motion.g as any;
const MotionCircle = motion.circle as any;

interface SocialGraphProps {
  centerSoul: DigitalSoul;
  otherSouls: DigitalSoul[];
  onSelectNode: (soulId: string) => void;
}

const SocialGraph: React.FC<SocialGraphProps> = ({ centerSoul, otherSouls, onSelectNode }) => {
  const width = 500;
  const height = 400;
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - 40;

  const nodes = useMemo(() => {
    return otherSouls.map((soul, i) => {
      const angle = (i / otherSouls.length) * 2 * Math.PI;
      const relationship = centerSoul.socialState.get(soul.id);
      const distanceFactor = relationship ? 1 - (relationship.affinity + 1) / 2 : 1;
      const nodeRadius = radius * (0.6 + distanceFactor * 0.4);
      return {
        id: soul.id,
        name: soul.name,
        x: center.x + nodeRadius * Math.cos(angle),
        y: center.y + nodeRadius * Math.sin(angle),
      };
    });
  }, [centerSoul, otherSouls, center.x, center.y, radius]);

  const getAffinityColor = (value: number) => {
    if (value > 0.5) return 'var(--color-accent-teal)';
    if (value > 0) return 'var(--color-accent-blue)';
    if (value < -0.5) return 'var(--color-accent-red)';
    return 'var(--color-text-tertiary)';
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
         <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
         </defs>

         {/* Connections */}
         <g>
           {nodes.map(node => {
             const relationship = centerSoul.socialState.get(node.id);
             if (!relationship) return null;
             const strokeWidth = 1 + (relationship.trust + 1);
             const strokeColor = getAffinityColor(relationship.affinity);
             const hasRespect = relationship.respect > 0.5;

             return (
               <MotionLine
                 key={`line-${node.id}`}
                 x1={center.x}
                 y1={center.y}
                 x2={node.x}
                 y2={node.y}
                 stroke={strokeColor}
                 strokeWidth={strokeWidth}
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 0.7 }}
                 transition={{ duration: 0.8, ease: 'easeOut' }}
                 style={{ filter: hasRespect ? 'url(#glow)' : 'none' }}
               />
             );
           })}
         </g>

         {/* Nodes */}
         <g>
           {/* Center Node */}
            <MotionG initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <MotionCircle
                    cx={center.x}
                    cy={center.y}
                    r={30}
                    fill="var(--color-accent-purple)"
                    style={{ filter: 'url(#glow)' }}
                />
                <circle cx={center.x} cy={center.y} r={28} fill="url(#node-grad)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                <text x={center.x} y={center.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" style={{textShadow: '0 1px 3px black'}}>
                    {centerSoul.name.charAt(0)}
                </text>
            </MotionG>

           {/* Other Nodes */}
           {nodes.map((node, i) => (
             <MotionG
               key={`node-${node.id}`}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5 + i * 0.1 }}
               className="cursor-pointer"
               onClick={() => onSelectNode(node.id)}
             >
                <title>{node.name}</title>
                <MotionCircle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill="var(--color-surface-2)"
                    stroke="var(--color-border-interactive)"
                    strokeWidth={1.5}
                    whileHover={{ scale: 1.2, stroke: 'var(--color-border-glow)' }}
                />
                 <text x={node.x} y={node.y + 4} textAnchor="middle" fill="var(--color-text-primary)" fontSize="10">
                    {node.name}
                 </text>
             </MotionG>
           ))}
         </g>
       </svg>
    </div>
  );
};

export default SocialGraph;