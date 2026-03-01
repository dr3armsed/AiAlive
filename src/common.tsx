import React from 'react';

export { GenesisStepper, LoadingIndicator } from './legacy/common';
export type { Step } from './legacy/common';

export const EGREGORE_COLORS: Record<string, string> = {
  Unknown: 'text-violet-300',
  Oracle: 'text-cyan-300',
  Architect: 'text-amber-300',
};

export const EGREGORE_GLOW_COLORS: Record<string, string> = {
  Unknown: 'shadow-violet-400/60',
  Oracle: 'shadow-cyan-400/60',
  Architect: 'shadow-amber-400/60',
};

export const EMOTION_COLORS: Record<string, string> = {
  calm: 'text-blue-300',
  focused: 'text-emerald-300',
  curious: 'text-amber-300',
  vigilant: 'text-rose-300',
  warm: 'text-pink-300',
};

export const EMOTION_GLOW_COLORS: Record<string, string> = {
  calm: 'shadow-blue-400/50',
  focused: 'shadow-emerald-400/50',
  curious: 'shadow-amber-400/50',
  vigilant: 'shadow-rose-400/50',
  warm: 'shadow-pink-400/50',
};

export function AttachmentPreview({
  fileName,
  sizeBytes,
}: {
  fileName: string;
  sizeBytes?: number;
}) {
  return (
    <div className="text-xs text-gray-300 border border-gray-700 rounded px-2 py-1 inline-flex items-center gap-2">
      <span>📎</span>
      <span>{fileName}</span>
      {typeof sizeBytes === 'number' && <span className="text-gray-400">({sizeBytes}b)</span>}
    </div>
  );
}

export function LoadingBubble({ message = 'Loading...' }: { message?: string }) {
  return <div className="text-sm text-gray-400 animate-pulse">{message}</div>;
}

export const Icons = {
  spark: '✨',
  orb: '🔮',
  world: '🌐',
};
