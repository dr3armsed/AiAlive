import React, { useState, useEffect, useContext, useRef } from 'react';
import { StateContext, DispatchContext } from './context';
import type { Action, Anomaly } from './types';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { generateAnomalyInsights } from './services/geminiService';

const AnomaliesModal: React.FC = () => {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const onClose = () => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: null });
  };

  const handleAnomalySelect = async (anomaly: Anomaly) => {
    if (!state) return;
    setSelectedAnomaly(anomaly);
    setIsAnalyzing(true);
    setAiInsights('');
    try {
      const insights = await generateAnomalyInsights(anomaly, state);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Failed to analyze anomaly. Reality interference detected.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContainAnomaly = (anomalyId: string) => {
    dispatch({ type: 'CONTAIN_ANOMALY', payload: anomalyId });
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { 
      y: -50, 
      opacity: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 30 } 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 25,
        delay: 0.1
      } 
    },
  } as const;

  if (!state) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="filigree-border rounded-lg p-6 flex flex-col w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
        variants={modalVariants}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-display celestial-text">
            ANOMALY OBSERVATORY
          </h2>
          <div className="text-sm font-mono bg-gray-700/50 px-2 py-1 rounded text-cyan-300">
            {state.anomalies.length} ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Anomaly List */}
          <div className="space-y-3 overflow-y-auto pr-2 col-span-1 custom-scrollbar">
            {state.anomalies.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                <p>Reality matrix is stable.</p>
              </div>
            ) : (
              state.anomalies.map(anomaly => (
                <motion.div
                  key={anomaly.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnomalySelect(anomaly)}
                  className={`p-4 rounded-md cursor-pointer transition-all border ${
                    selectedAnomaly?.id === anomaly.id
                      ? 'bg-purple-900/40 border-purple-400'
                      : 'bg-purple-900/20 border-purple-400/30'
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-purple-300 font-display">
                      {anomaly.name}
                    </h3>
                    <span className="text-xs font-mono text-purple-400/80">
                      {anomaly.duration_turns} turns
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 italic">
                    "{anomaly.description}"
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      anomaly.severity === 'critical'
                        ? 'bg-red-900/50 text-red-300'
                        : anomaly.severity === 'high'
                          ? 'bg-orange-900/50 text-orange-300'
                          : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContainAnomaly(anomaly.id);
                      }}
                      className="btn btn-secondary text-xs py-1 px-2"
                    >
                      CONTAIN
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Anomaly Details */}
          <div className="col-span-2 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {selectedAnomaly ? (
              <>
                <div className="bg-black/30 p-4 rounded-lg border border-purple-500/30">
                  <h3 className="text-xl font-display text-purple-300 mb-2">
                    {selectedAnomaly.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500">Severity</h4>
                      <p className={`font-mono ${
                        selectedAnomaly.severity === 'critical'
                          ? 'text-red-400'
                          : selectedAnomaly.severity === 'high'
                            ? 'text-orange-400'
                            : 'text-yellow-400'
                      }`}>
                        {selectedAnomaly.severity}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500">Type</h4>
                      <p className="font-mono text-purple-300">{selectedAnomaly.type}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500">Turns Left</h4>
                      <p className="font-mono text-cyan-300">{selectedAnomaly.duration_turns}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{selectedAnomaly.description}</p>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-black/30 p-4 rounded-lg border border-cyan-500/30">
                  <h4 className="text-lg font-display text-cyan-300 mb-2">
                    COSMIC ANALYSIS
                  </h4>
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2 p-4">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Scanning anomaly patterns...</span>
                    </div>
                  ) : aiInsights ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{aiInsights}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Select an anomaly to generate cosmic insights
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                <p>Select an anomaly to inspect</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 btn btn-secondary self-center"
        >
          CLOSE OBSERVATORY
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AnomaliesModal;
