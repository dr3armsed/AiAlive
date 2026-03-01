import React, { ReactNode } from 'react';

// This component doesn't render anything itself.
// Its presence in the tree signals to the Chimera Renderer
// that it should measure render times for this part of the UI.

interface ChimeraProfilerProps {
  id: string; // A unique ID for this profiler
  onRender: (
    id: string, // the "id" prop of the Profiler tree that has just committed
    phase: "mount" | "update", // "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration: number, // time spent rendering the committed update
    baseDuration?: number, // estimated time to render the entire subtree without memoization
    startTime?: number, // when React began rendering this update
    commitTime?: number, // when React committed this update
    interactions?: any // the Set of interactions belonging to this update
  ) => void;
  children: ReactNode;
}

export const ChimeraProfiler: React.FC<ChimeraProfilerProps> = ({ children }) => {
  // The profiler's logic is entirely within the renderer's core.
  // This component is just a declarative way to enable it for a subtree.
  return <>{children}</>;
};