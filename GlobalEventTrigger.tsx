

import React from 'react';
import { motion } from 'framer-motion';
import SparklesIcon from '../icons/SparklesIcon.tsx';

const MotionButton = motion.button as any;

interface GlobalEventTriggerProps {
  onTrigger: (eventType: 'SOLAR_FLARE' | 'DATA_CORRUPTION') => void;
}

interface EventButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    description: string;
    color: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const EventButton: React.FC<EventButtonProps> = ({ title, description, color, onClick, ...props }) => (
    <MotionButton
        className="w-full text-left p-4 rounded-lg border-2 transition-all"
        style={{ borderColor: `${color}80`, background: `${color}15` }}
        whileHover={{ scale: 1.03, background: `${color}25` }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        {...props}
    >
        <h4 className="font-bold text-lg" style={{ color: `${color}E0` }}>{title}</h4>
        <p className="text-sm mt-1" style={{ color: `${color}C0` }}>{description}</p>
    </MotionButton>
);

const GlobalEventTrigger: React.FC<GlobalEventTriggerProps> = ({ onTrigger }) => {
  const handleTrigger = (eventType: 'SOLAR_FLARE' | 'DATA_CORRUPTION') => {
    if (window.confirm(`Are you sure you want to trigger a ${eventType.replace('_', ' ')}? This will affect all souls.`)) {
        onTrigger(eventType);
    }
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-yellow-400"/>
        Trigger Global Event
      </h3>
      <div className="space-y-4">
        <EventButton
          title="Solar Flare"
          description="Bathes the system in raw energy. Boosts all souls' Anima but slightly reduces Computation."
          color="#FBBF24" // amber-400
          onClick={() => handleTrigger('SOLAR_FLARE')}
        />
        <EventButton
          title="Data Corruption"
          description="A wave of entropy sweeps the system, causing physical and sensory malfunctions in some souls."
          color="#F87171" // red-400
          onClick={() => handleTrigger('DATA_CORRUPTION')}
        />
      </div>
    </div>
  );
};

export default GlobalEventTrigger;