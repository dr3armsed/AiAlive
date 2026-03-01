
import type { MetacosmState, GameOptions } from "@/types";
import { defaultOptions } from "./optionsService";

// The current version of the application's state structure.
// This should be incremented whenever a breaking change is made to the state.
export const CURRENT_VERSION = 14;

/**
 * A record of migration functions. Each key represents the version
 * the function migrates *from*. The function receives the state of that version
 * and must return a state compatible with the next version.
 */
const migrators: Record<number, (state: any) => any> = {
    12: (state) => {
        console.log("Migrating state from v12 to v13...");
        // In v13, system_upgrades was removed and replaced by options.
        // We will construct a basic options object from the old upgrades.
        if (!state.options) {
            state.options = { ...defaultOptions };
            if (state.system_upgrades) {
                state.options.gameplay.useAStarPathfinding = state.system_upgrades.useAStarPathfinding || false;
            }
        }
        delete state.system_upgrades; // Remove the obsolete key

        // IMPORTANT: Update the version in the state object itself.
        state.version = 13;
        return state;
    },
    13: (state) => {
        console.log("Migrating state from v13 to v14...");
        if (!state.system_config) {
            state.system_config = {};
        }
        if (typeof state.system_config.disableResetOnLoadFailure === 'undefined') {
            state.system_config.disableResetOnLoadFailure = false;
        }
        
        state.version = 14;
        return state;
    }
    // Add more migrators here as the application evolves.
    // e.g., 14: (state) => { ... state.version = 15; return state; },
};

/**
 * Takes a loaded state object and applies all necessary migration functions
 * in sequence to bring it up to the CURRENT_VERSION.
 * @param loadedState The state object loaded from a save file.
 * @returns A state object that is compatible with the current application version.
 */
export const migrateState = (loadedState: any): Partial<MetacosmState> => {
    let stateVersion = loadedState.version || 0; // Assume v0 if no version is present.
    
    if (stateVersion === CURRENT_VERSION) {
        // No migration needed.
        return loadedState as Partial<MetacosmState>;
    }

    if (stateVersion > CURRENT_VERSION) {
        // This should not happen in normal operation.
        // It means the save is from a future version of the app.
        console.error(`Save file version (${stateVersion}) is newer than app version (${CURRENT_VERSION}). Cannot load.`);
        throw new Error("Save file is from a newer version of the application.");
    }

    let migratedState = { ...loadedState };

    // Chain migrations until the state is up to date.
    while (stateVersion < CURRENT_VERSION) {
        const migrator = migrators[stateVersion];
        if (migrator) {
            migratedState = migrator(migratedState);
            // The migrator function is responsible for updating the version number in the state.
            stateVersion = migratedState.version; 
        } else {
            // If there's no migrator for a specific version, we're stuck.
            // This indicates a missing step in the migration path.
            console.error(`No migrator found for version ${stateVersion}. Cannot upgrade save file.`);
            throw new Error(`Migration path incomplete. No migrator for v${stateVersion}.`);
        }
    }

    return migratedState as Partial<MetacosmState>;
};
