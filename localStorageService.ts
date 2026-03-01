
import { MetacosmState } from '../types';

const STORAGE_KEY = 'metacosm_state_v12';

export const getSerializableState = (state: MetacosmState): Omit<MetacosmState, 'egregores'> & { egregores: Omit<MetacosmState['egregores'][0], 'chat'>[] } => {
    const serializableEgregores = state.egregores.map(({ chat, ...rest }) => rest);
    return { ...state, egregores: serializableEgregores };
};

export const hasState = (): boolean => {
    return localStorage.getItem(STORAGE_KEY) !== null;
};

export const saveState = (state: MetacosmState) => {
    try {
        if (!state || !state.egregores) return;
        const serializableState = getSerializableState(state);
        const stateString = JSON.stringify(serializableState);
        localStorage.setItem(STORAGE_KEY, stateString);
    } catch (e) {
        console.error("Could not save state to local storage", e);
    }
};

export const loadState = (): Partial<MetacosmState> | null => {
    try {
        const stateString = localStorage.getItem(STORAGE_KEY);
        if (stateString === null) {
            return null;
        }
        const loaded = JSON.parse(stateString);
        
        if (loaded.version !== 12) {
            console.warn(`State version mismatch (found v${loaded.version || 'unknown'}, expected v12). Clearing for new session.`);
            clearState();
            return null;
        }
        return loaded as Partial<MetacosmState>;
    } catch (e) {
        console.error("Could not load state from local storage", e);
        clearState();
        return null;
    }
};

export const clearState = () => {
    try {
        // Clear current and all previous versions
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('metacosm_state_v11');
        localStorage.removeItem('metacosm_state_v10');
        localStorage.removeItem('metacosm_state_v9');
        localStorage.removeItem('metacosm_state_v8');
        localStorage.removeItem('metacosm_state_v7');
        localStorage.removeItem('metacosm_state_v6');
        localStorage.removeItem('metacosm_state_v4');
        localStorage.removeItem('metacosm_state_v3');
        localStorage.removeItem('plenum_state_v2');
        localStorage.removeItem('noosphere_state');
    } catch (e) {
        console.error("Could not clear state from local storage", e);
    }
}
