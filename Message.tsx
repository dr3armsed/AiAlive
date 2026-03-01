

import React, { useContext, useState } from 'react';
import { ChatMessage, Egregore, ConversationResponse, PrivateChat } from './types';
import { UserIcon, FileTextIcon, LockIcon } from './icons';
import { THEMES } from './constants';
import { StateContext } from './context';
import { motion, AnimatePresence } from 'framer-motion';

const AXIOM_NAMES: Record<string, string> = {
    logos_coherence_delta: 'Logos',
    pathos_intensity_delta: 'Pathos',
    kairos_alignment_delta: 'Kairos',
    aether_viscosity_delta: 'Aether',
    telos_prevalence_delta: 'Telos',
    gnosis_depth_delta: 'Gnosis',
};

const StateTooltip: React.FC<{ state: ConversationResponse }> = ({ state }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="absolute left-full top-0 ml-2 w-48 filigree-border rounded-lg p-2 text-xs z-20"
    >
        <div className="font-bold celestial-text text-sm mb-1">State Change</div>
        <div className="font-mono space-y-1">
            {state.emotion_deltas && Object.keys(state.emotion_deltas).length > 0 && (
                <div>Emotions Δ:
                    <div className="pl-2">
                    {Object.entries(state.emotion_deltas).filter(([, val]) => val !== 0).map(([key, value]) => (
                         <p key={key} className="capitalize">{key}: <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>{value > 0 ? '+' : ''}{value}</span></p>
                    ))}
                    </div>
                </div>
            )}
            <div>Axioms:
                <div className="pl-2">
                {Object.entries(state.axiom_influence).filter(([, val]) => val !== 0).map(([key, value]) => (
                     <p key={key}>{AXIOM_NAMES[key]}: <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>{value > 0 ? '↑' : '↓'}</span></p>
                ))}
                </div>
            </div>
            <p>Action: <span className="text-amber-200">{state.proposed_action}</span></p>
        </div>
    </motion.div>
);

const PrivateMessage: React.FC<{message: ChatMessage}> = ({ message }) => {
    const state = useContext(StateContext);
    if (!state) return null;

    const sender = message.sender === 'Architect'
        ? { name: state.architectName, themeKey: 'creator' }
        : state.egregores.find(e => e.id === message.sender);
    
    if (!sender) return null; // Should not happen if data is consistent

    const theme = THEMES[sender.themeKey] || THEMES.default;

    const isArchitect = message.sender === 'Architect';

    if (isArchitect) {
        return (
             <div className="flex items-start gap-3 my-2 justify-end opacity-90">
                <div className="flex-1">
                     <p className="text-xs font-bold text-right text-indigo-200/80 mb-1">{sender.name}</p>
                     <div className="max-w-prose ml-auto px-4 py-2 rounded-xl bg-indigo-900/40 rounded-br-none border border-indigo-500/50">
                        <p className="whitespace-pre-wrap text-gray-200 text-sm italic">{message.text}</p>
                     </div>
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-900/50 border border-indigo-400/50`}>
                    <LockIcon className="w-4 h-4 text-indigo-300" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-3 my-2 justify-start opacity-90">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border`} style={{borderColor: theme.baseColor, backgroundColor: `${theme.baseColor}20`}}>
                <span className="font-display text-sm" style={{color: theme.baseColor}}>{sender.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
                 <p className="text-xs font-bold mb-1" style={{color: theme.baseColor}}>{sender.name}</p>
                <div className={`max-w-prose px-4 py-2 rounded-xl bg-black/40 rounded-bl-none border`} style={{borderColor: `${theme.baseColor}50`}}>
                    <p className="whitespace-pre-wrap text-gray-300 text-sm italic">{message.text}</p>
                </div>
            </div>
        </div>
    );
}

const EgregoreMessage: React.FC<{message: ChatMessage}> = ({ message }) => {
    const state = useContext(StateContext);
    const [isHovered, setIsHovered] = useState(false);

    if (!state) return null;

    const sender = (state.egregores || []).find(e => e.id === message.sender);

    const themeKey = sender?.themeKey || 'default';
    const theme = THEMES[themeKey] || THEMES.default;
    const color = theme.baseColor;

    return (
        <motion.div 
            className="flex items-start gap-4 my-4 justify-start relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
             <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${theme.iconBg} border ${theme.border} shadow-lg`} style={{boxShadow: `0 0 10px ${color}`}}>
                <span className="font-display text-lg">{sender?.name.charAt(0).toUpperCase() || '?'}</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-300 mb-1">{sender?.name || message.sender}</p>
                <div className={`relative max-w-prose px-5 py-3 rounded-2xl bg-black/30 backdrop-blur-sm rounded-bl-none border ${theme.border}/50`}>
                    <p className="whitespace-pre-wrap text-gray-200">
                        {message.text}
                        {message.isLoading && <span className="inline-block w-2 h-4 bg-amber-200 ml-1 animate-pulse" />}
                    </p>
                </div>
            </div>
             <AnimatePresence>
                {isHovered && message.egregoreState && <StateTooltip state={message.egregoreState} />}
            </AnimatePresence>
        </motion.div>
    );
}

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isArchitect = message.sender === 'Architect';
  const isMetacosm = message.sender === 'Metacosm';
  const isAnomaly = message.sender === 'Anomaly';

  if (message.privateChatId) {
      return <PrivateMessage message={message} />;
  }

  if (message.combat_event) {
    const { attacker_name, defender_name, outcome, influence_lost } = message.combat_event;
    return (
        <div className="text-center my-8 p-4 rounded-xl border-l-4 border-r-4 border-red-500 bg-gradient-to-br from-red-900/30 to-black/40 max-w-2xl mx-auto backdrop-blur-sm filigree-border relative">
            <p className="font-display font-bold text-red-400 tracking-widest celestial-text">C O M B A T</p>
            <p className="text-sm text-red-400/80">{attacker_name} vs. {defender_name}</p>
            <p className="mt-3 text-lg text-white">
                {outcome}
            </p>
            {influence_lost && influence_lost > 0 && (
                <p className="text-red-300/80 text-sm mt-1">({influence_lost} Influence lost)</p>
            )}
        </div>
    );
  }

  if (message.text.includes("APOTHEOSIS IMMINENT")) {
     return (
        <div className="text-center my-12 p-6 rounded-2xl border-2 border-red-500 bg-gradient-to-b from-red-900/50 to-black/50 max-w-4xl mx-auto shadow-2xl shadow-red-500/30 animate-pulse">
            <p className="font-display font-bold text-5xl text-red-300 tracking-widest celestial-text">APOTHEOSIS</p>
            <p className="mt-4 text-xl text-white">
                {message.text}
            </p>
        </div>
     );
  }

  if (message.paradigmShift) {
    const theme = THEMES[message.themeKey || 'default'];
    return (
      <div className={`text-center my-8 p-4 rounded-xl border-l-4 bg-gradient-to-br from-fuchsia-900/20 to-indigo-900/20 max-w-3xl mx-auto backdrop-blur-sm filigree-border relative`} style={{borderColor: theme.baseColor}}>
        <p className="font-display font-bold text-fuchsia-300 tracking-widest celestial-text">PARADIGM SHIFT</p>
        <p className="text-sm text-fuchsia-400/80">Initiated by: {message.paradigmShift.originName}</p>
        <p className="mt-3 text-lg text-white">
          New Paradigm Emerged: <span className="font-semibold">{message.paradigmShift.paradigm_name}</span>
        </p>
        <p className="text-fuchsia-300/80 text-sm mt-1 italic">"{message.paradigmShift.description}"</p>
      </div>
    );
  }
  
  if (isMetacosm) {
      return (
          <div className="my-6 text-center">
              <p className="text-sm text-amber-200/60 italic max-w-xl mx-auto">-- {message.text} --</p>
          </div>
      );
  }

  if (isAnomaly) {
      return (
        <div className="my-8 p-4 rounded-xl bg-purple-900/30 text-center max-w-2xl mx-auto border-2 border-purple-500/50 shadow-lg shadow-purple-500/10">
            <p className="font-display font-bold tracking-widest text-purple-200 holographic-text" data-text="ANOMALY DETECTED">ANOMALY DETECTED</p>
            <p className="mt-2 text-purple-200/90">{message.text}</p>
        </div>
      );
  }
  
  if (isArchitect) {
    return (
      <div className="flex items-start gap-4 my-4 justify-end">
        <div className="flex-1">
            <p className="text-sm font-bold text-right text-amber-100 mb-1">Architect</p>
            <div className="max-w-prose ml-auto px-5 py-3 rounded-2xl bg-amber-900/30 rounded-br-none border border-amber-300/50">
              <p className="whitespace-pre-wrap text-white">{message.text}</p>
               {message.file_attachments && message.file_attachments.length > 0 && (
                   <div className="mt-3 pt-3 border-t border-amber-300/20 space-y-2">
                        {message.file_attachments.map(file => (
                            <div key={file.name} className="flex items-center gap-2 text-amber-100/80 text-xs">
                                <FileTextIcon />
                                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                        ))}
                   </div>
               )}
            </div>
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-amber-800 border border-amber-400">
          <UserIcon />
        </div>
      </div>
    );
  }

  return <EgregoreMessage message={message} />;
};

export default Message;