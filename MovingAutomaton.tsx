import React, { useEffect, useContext } from 'react';
import { useAnimate } from 'framer-motion';
import { Automaton, World, Faction } from '../types';
import { DispatchContext } from '../context';
import type { Action } from '../types';
import { THEMES } from '../constants';

interface MovingAutomatonProps {
  automaton: Automaton;
  world: World;
  factions: Faction[];
}

const MovingAutomaton: React.FC<MovingAutomatonProps> = ({ automaton, world, factions }) => {
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    const [scope, animate] = useAnimate();

    if (!dispatch) return null;
    
    if (!automaton.vector) {
        console.warn(`Automaton ${automaton.name} (${automaton.id}) is missing position data and will not be rendered.`);
        return null;
    }

    const faction = factions.find(f => f.id === automaton.ownerFactionId);
    const theme = faction ? THEMES[faction.themeKey] || THEMES.default : THEMES.default;
    const color = theme.baseColor;
    
    const getTransform = (x: number, y: number) => `translateX(${x}px) translateY(${y}px) translate(-50%, -50%)`;


    useEffect(() => {
        if (!scope.current) return;

        let animationControls: ReturnType<typeof animate> | undefined;

        const hasPath = automaton.path && automaton.path.length > 0;

        if (hasPath) {
            const pathTransforms = automaton.path.map(p => getTransform(p.x, p.y));
            const startTransform = getTransform(automaton.vector.x, automaton.vector.y);

            animationControls = animate(
                scope.current,
                { transform: [startTransform, ...pathTransforms] },
                {
                    duration: automaton.path.length * 0.2,
                    ease: 'linear',
                    onComplete: () => {
                        dispatch({ type: 'MOVEMENT_COMPLETE', payload: { id: automaton.id, type: 'AUTOMATON' } });
                    }
                }
            );
        } else {
             animationControls = animate(
                scope.current,
                { transform: getTransform(automaton.vector.x, automaton.vector.y) },
                { duration: 0.3, ease: 'easeOut' }
            );
        }

        return () => {
            animationControls?.stop();
        };

    }, [automaton.path, automaton.vector, automaton.id, animate, scope, dispatch]);

    return (
        <div
            ref={scope}
            className="absolute w-8 h-8"
            style={{
                top: 0,
                left: 0,
                transform: getTransform(automaton.vector.x, automaton.vector.y),
            }}
        >
            <div className="w-full h-full relative group">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg" style={{'--color': color} as any}>
                    <defs>
                        <radialGradient id={`automaton-glow-${automaton.id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="var(--color)" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="var(--color)" stopOpacity="0.1"/>
                        </radialGradient>
                    </defs>
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" fill={`url(#automaton-glow-${automaton.id})`} stroke="var(--color)" strokeWidth="4" className="animate-pulse" />
                </svg>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-mono whitespace-nowrap hidden group-hover:block">
                    {automaton.name}
                </div>
            </div>
        </div>
    );
};

export default MovingAutomaton;