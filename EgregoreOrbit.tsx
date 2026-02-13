
import React, { useState, useEffect } from 'react';
import { Egregore } from '../../types';
import { EGREGORE_COLORS, EGREGORE_GLOW_COLORS } from '../common';

type Props = {
    egregores: Egregore[];
    radius: number;
    centerX: number;
    centerY: number;
};

export const EgregoreOrbit: React.FC<Props> = ({ egregores, radius, centerX, centerY }) => {
    const [time, setTime] = useState(0);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        let animationFrame: number;
        const animate = () => {
            setTime(prev => prev + 0.005); // Orbit speed
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {egregores.map((egregore, index) => {
                const isHovered = hoveredId === egregore.id;
                
                // Distribute evenly around the circle
                const angleOffset = (2 * Math.PI * index) / egregores.length;
                const currentAngle = isHovered ? angleOffset + time : angleOffset + time; // Could pause on hover if desired
                
                // Calculate position relative to the room center
                // Note: centerX/Y are typically half the width/height of the node (e.g., 80, 80 for a 160px node)
                const orbitRadius = isHovered ? radius * 1.2 : radius;
                const x = centerX + Math.cos(currentAngle) * orbitRadius;
                const y = centerY + Math.sin(currentAngle) * orbitRadius;

                const colorClass = EGREGORE_COLORS[egregore.name] || 'text-white';
                const glowColor = EGREGORE_GLOW_COLORS[egregore.name] || '#ffffff';

                return (
                    <div 
                        key={egregore.id}
                        className="absolute flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer z-20"
                        style={{ 
                            left: x, 
                            top: y,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isHovered ? 50 : 20
                        }}
                        onMouseEnter={() => setHoveredId(egregore.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        {/* Avatar Node */}
                        <div 
                            className={`w-4 h-4 rounded-full border border-black shadow-lg transition-transform duration-300 ${isHovered ? 'scale-150 bg-white' : 'scale-100 bg-gray-900'}`}
                            style={{ 
                                boxShadow: `0 0 10px ${glowColor}`,
                                borderColor: glowColor
                            }}
                        >
                            <div className="w-full h-full rounded-full opacity-50 bg-current" style={{ color: glowColor }}></div>
                        </div>

                        {/* Holo-Tag (Tooltip) */}
                        {isHovered && (
                            <div className="absolute bottom-full mb-2 flex flex-col items-center animate-fade-in whitespace-nowrap">
                                <div className="bg-black/90 border border-gray-700 p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm text-xs">
                                    <h5 className={`font-bold text-sm ${colorClass}`}>{egregore.name}</h5>
                                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">{egregore.archetypeId}</p>
                                    <div className="mt-1 h-px w-full bg-gray-700"></div>
                                    <p className="mt-1 text-gray-500 font-mono">
                                        Q: <span className="text-cyan-400">{egregore.quintessence}</span>
                                    </p>
                                </div>
                                {/* Arrow */}
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90"></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
