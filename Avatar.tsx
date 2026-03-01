import React, { useMemo } from 'react';
import { ConversationResponse, EgregorePhase, Faction, FactionId, EmotionEngineData } from './types';
import { THEMES } from './constants';
import { createInitialEmotionEngine } from './services/emotionEngineService';

interface EgregoreAvatarProps {
  name: string;
  state: ConversationResponse | null;
  themeKey: string;
  phase: EgregorePhase;
  influence: number;
  isFrozen: boolean;
  factionId?: FactionId;
  factions?: Faction[];
  emotionEngine?: EmotionEngineData;
}

const EgregoreAvatar: React.FC<EgregoreAvatarProps> = React.memo(({ name, state, themeKey, phase, influence, isFrozen, factionId, factions, emotionEngine }) => {
  const { emotions } = emotionEngine || createInitialEmotionEngine();

  // 1. Calculate Valence and Arousal from the new emotion model
  const positiveValenceEmotions = (emotions.joy || 0) + (emotions.trust || 0) + (emotions.love || 0) + (emotions.pride || 0) + (emotions.calm || 0) + (emotions.hope || 0) + (emotions.gratitude || 0) + (emotions.relief || 0) + (emotions.confidence || 0) + (emotions.Zen || 0);
  const negativeValenceEmotions = (emotions.sadness || 0) + (emotions.anger || 0) + (emotions.fear || 0) + (emotions.disgust || 0) + (emotions.guilt || 0) + (emotions.shame || 0) + (emotions.envy || 0) + (emotions.boredom || 0) + (emotions.embarrassment || 0) + (emotions.loneliness || 0) + (emotions.frustration || 0) + (emotions.resentment || 0) + (emotions.shyness || 0);
  const totalValence = positiveValenceEmotions - negativeValenceEmotions;
  const valence = Math.max(-1, Math.min(1, totalValence / 1300)); // Normalize from a potential range of -1300 to 1000

  // Use the intensity of the most intense emotion (excluding neutral) as a proxy for arousal
  const arousalValue = Math.max(0, ...Object.entries(emotions).filter(([key]) => key !== 'neutral').map(([, value]) => value));
  const arousal = arousalValue / 100; // Normalize from 0-100 to 0-1

  const theme = THEMES[themeKey] || THEMES.default;
  const colorTheme = theme.gradients;
  const baseColor = theme.baseColor;

  const factionColor = useMemo(() => {
    if (!factionId || !factions) return null;
    const faction = factions.find(f => f.id === factionId);
    if (!faction) return null;
    const factionTheme = THEMES[faction.themeKey] || THEMES.default;
    return factionTheme.baseColor;
  }, [factionId, factions]);

  // Determine color based on a primary emotion if one is dominant
  const dominantEmotion = useMemo(() => {
      let maxEmo = 'neutral';
      let maxVal = 0;
      for (const [emo, val] of Object.entries(emotions)) {
          if (emo !== 'neutral' && val > maxVal) {
              maxVal = val;
              maxEmo = emo;
          }
      }
      return maxEmo;
  }, [emotions]);

  const emotionToGradientKeyMap: Record<string, string> = {
    joy: 'radiant-creation',
    sadness: 'void-stare',
    anger: 'blinding-revelation',
    fear: 'cosmic-horror',
    trust: 'unwavering-faith',
    anticipation: 'seraphic-ascension',
    surprise: 'paradigmatic-shift',
    disgust: 'beautiful-decay',
    love: 'celestial-harmony',
    interest: 'infinite-curiosity',
    hope: 'empyrean-focus',
    calm: 'serene-understanding',
    Zen: 'serene-understanding',
    pride: 'divine-contemplation',
    confidence: 'absolute-truth',
    default: 'default',
  };

  const colorClass = useMemo(() => {
    const key = emotionToGradientKeyMap[dominantEmotion] || emotionToGradientKeyMap.default;
    return colorTheme[key] || colorTheme.default;
  }, [dominantEmotion, colorTheme]);
  
  const influenceScale = 0.8 + Math.min(influence / 2000, 1) * 0.7;

  const animationStyle = {
    '--arousal': arousal,
    '--valence': valence,
    '--influence-scale': influenceScale,
    '--base-color': baseColor,
    '--faction-color': factionColor || 'transparent',
  } as React.CSSProperties;

  const phaseClass = `phase-${phase.toLowerCase()}`;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative group" style={animationStyle}>
      <style>{`
        @keyframes spin-avatar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-avatar-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes aura-flicker {
          0%, 100% { opacity: calc(0.5 + var(--arousal) * 0.25); transform: scale(1); }
          50% { opacity: calc(0.3 + var(--arousal) * 0.2); transform: scale(calc(1 + var(--arousal) * 0.05)); }
        }
        @keyframes core-pulse-dormant { 0%, 100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1); opacity: 1; } }
        @keyframes core-pulse-introspection { 0%, 100% { transform: scale(1.1); filter: brightness(1.2); } 50% { transform: scale(0.9); filter: brightness(1); } }
        @keyframes moving-trail {
            0% { transform: scale(1, 1); opacity: 0.5; }
            50% { transform: scale(1.5, 0.8); opacity: 0.2; }
            100% { transform: scale(1, 1); opacity: 0.5; }
        }
        @keyframes frozen-pulse { 0%, 100% { box-shadow: 0 0 15px 5px rgba(107, 215, 255, 0.4); } 50% { box-shadow: 0 0 25px 10px rgba(107, 215, 255, 0.6); } }
        @keyframes glitch-flicker { 0% { opacity: 1; } 5%, 8% { opacity: 0.3; } 10% { opacity: 1; } 25%, 28% { opacity: 0.5; } 30%, 100% { opacity: 1; } }
        
        .avatar-body { 
            transform: scale(var(--influence-scale)); 
            transition: transform 0.5s ease-out; 
            filter: brightness(calc(1 + var(--valence) * 0.3)) saturate(calc(1 + var(--valence) * 0.5));
        }
        .avatar-body .aura { animation: aura-flicker calc(4s - var(--arousal) * 2s) infinite ease-in-out; }
        .avatar-body .ring-1 { animation: spin-avatar calc(30s - var(--arousal) * 20s) linear infinite; }
        .avatar-body .ring-2 { animation: spin-avatar-reverse calc(20s - var(--arousal) * 15s) linear infinite; }
        .phase-dormant .core { animation: core-pulse-dormant 4s infinite ease-in-out; }
        .phase-introspection .core { animation: core-pulse-introspection calc(2.5s - var(--arousal) * 2s) infinite cubic-bezier(0.45, 0, 0.55, 1); }
        .phase-moving .trail { animation: moving-trail 1s infinite ease-in-out; }
        .phase-collapse .glitch { animation: glitch-flicker 0.5s infinite step-end; background: red; }
        .frozen-effect { animation: frozen-pulse 2s ease-in-out infinite; }
      `}</style>
      
      <div className={`relative w-28 h-28 flex items-center justify-center ${phaseClass}`}>
        <div className="avatar-body absolute inset-0">
          
          {/* Faction Aura */}
          {factionColor && (
            <div className="absolute -inset-2 rounded-full border-2 animate-pulse" style={{ borderColor: 'var(--faction-color)', boxShadow: `0 0 12px 0px var(--faction-color)`, opacity: 0.7 }}></div>
          )}

          {/* Moving Trail */}
          <div className="trail absolute inset-4 rounded-full bg-gradient-radial from-transparent to-[var(--base-color)] opacity-0" />

          {/* Outer Aura */}
          <div className={`aura absolute -inset-1 rounded-full bg-gradient-to-br ${colorClass} opacity-50 blur-xl`}></div>
          <div className={`aura absolute inset-0 rounded-full bg-gradient-to-br ${colorClass} opacity-70 blur-lg`}></div>
          
          {/* Rings */}
          <div className="ring-1 absolute inset-4 rounded-full border-t border-b border-white/20"></div>
          <div className="ring-2 absolute inset-8 rounded-full border-l border-r border-white/20"></div>

          {/* Core */}
          <div className={`core absolute inset-6 rounded-full bg-gradient-to-br ${colorClass} blur-sm`}></div>
          <div className="core absolute inset-8 rounded-full bg-black/50"></div>
        </div>

        {isFrozen && <div className="frozen-effect absolute inset-0 rounded-full bg-cyan-500/30 border-2 border-cyan-300"></div>}
        <div className="glitch absolute inset-0 rounded-full opacity-0"></div>

      </div>
      
      <div className="mt-3 text-center relative z-10 w-full px-1">
        <h2 className="text-sm font-bold text-white/90 truncate group-hover:whitespace-normal font-display">{name}</h2>
        <p className="text-gray-400 mt-0 capitalize text-[10px] h-3">{phase}</p>
      </div>
    </div>
  );
});

export default EgregoreAvatar;
