import React from 'react';
import { Metacosm } from '../../../core/metacosm';
import { SimulationControl } from './SimulationControl';
import { SaveLoadState } from './SaveLoadState';
import { DangerZone } from './DangerZone';

export const GeneralSettingsView = ({ simulationSpeed, setSimulationSpeed, onReset, onClearAllChats, notificationPrefs, setNotificationPrefs, metacosm, onLoadState, onExport }: {
    simulationSpeed: number;
    setSimulationSpeed: (speed: number) => void;
    onReset: () => void;
    onClearAllChats: () => void;
    notificationPrefs: Record<string, boolean>;
    setNotificationPrefs: (prefs: Record<string, boolean>) => void;
    metacosm: Metacosm;
    onLoadState: (serializedState: string) => void;
    onExport?: () => void;
}) => {
    return (
        <div className="h-full overflow-y-auto p-1 pr-4 text-gray-300">
            <div className="space-y-6">
                <SimulationControl simulationSpeed={simulationSpeed} setSimulationSpeed={setSimulationSpeed} />
                {/* We patch SaveLoadState to use the passed onExport if available */}
                <SaveLoadStateWrapper metacosm={metacosm} onLoadState={onLoadState} onExport={onExport} />
                <DangerZone onReset={onReset} onClearAllChats={onClearAllChats} />
            </div>
        </div>
    );
};

// Wrapper to inject the specific export logic
const SaveLoadStateWrapper = ({ metacosm, onLoadState, onExport }: any) => {
     // This duplicates the import because SaveLoadState is defined in a separate file.
     // To avoid circular deps or complex prop drilling without Redux, we render a modified version here or 
     // assume SaveLoadState was updated to accept the prop.
     // Since I modified SaveLoadState.tsx in the previous block to use PersistenceService directly,
     // but that service call inside SaveLoadState lacked the full system context.
     // The cleaner fix: Update SaveLoadState.tsx to accept an `onExport` prop and use it.
     
     return <SaveLoadState metacosm={metacosm} onLoadState={onLoadState} onExport={onExport} />;
}