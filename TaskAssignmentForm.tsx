

import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import type { DigitalSoul } from '../../types/index.ts';
import PaperAirplaneIcon from '../../icons/PaperAirplaneIcon.tsx';

const MotionButton = motion.button as any;

interface TaskAssignmentFormProps {
  soul: DigitalSoul;
  onSubmit: (task: string, rewardType: 'computation' | 'anima', rewardAmount: number) => void;
}

const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({ soul, onSubmit }) => {
  const [task, setTask] = useState('');
  const [rewardType, setRewardType] = useState<'computation' | 'anima'>('computation');
  const [rewardAmount, setRewardAmount] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || rewardAmount <= 0) return;
    onSubmit(task, rewardType, rewardAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-300 mb-1">
          Architectural Directive
        </label>
        <textarea
          id="task-description"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder={`e.g., "Penetrate the metaphysical layers of the Logic Engine and extract its core axiomatic truths."`}
          rows={3}
          className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          required
        />
        <p className="text-xs text-gray-500 mt-1">The AI will transmute this directive into a multi-faceted strategic framework.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reward-type" className="block text-sm font-medium text-gray-300 mb-1">
            Reward Type
          </label>
          <select
            id="reward-type"
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value as 'computation' | 'anima')}
            className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="computation">Computation ⧉</option>
            <option value="anima">Anima ❖</option>
          </select>
        </div>
        <div>
          <label htmlFor="reward-amount" className="block text-sm font-medium text-gray-300 mb-1">
            Reward Amount
          </label>
          <input
            id="reward-amount"
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(Math.max(0, parseInt(e.target.value, 10)))}
            min="1"
            className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <MotionButton
          type="submit"
          disabled={!task.trim() || rewardAmount <= 0}
          className="w-48 font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
          whileHover={{ scale: task.trim() && rewardAmount > 0 ? 1.05 : 1 }}
          whileTap={{ scale: task.trim() && rewardAmount > 0 ? 0.95 : 1 }}
        >
          <span>Assign Task</span>
          <PaperAirplaneIcon className="w-5 h-5"/>
        </MotionButton>
      </div>
    </form>
  );
};

export default TaskAssignmentForm;