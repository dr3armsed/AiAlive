
import type { Egregore } from '@/types';
import { getInitialState } from '../state/reducer';

export const rehydrateEgregores = (loadedEgregores: Egregore[] = []): Egregore[] => {
    const initialCores = getInitialState().egregores.filter(e => e.is_metacosm_core);
    const savedUserEgregores = loadedEgregores.filter(e => !e.is_metacosm_core);
    
    // Ensure the core Egregores from the initial state are always used,
    // but keep their persistent data if it exists in the save.
    const updatedCores = initialCores.map(core => {
        const savedCore = loadedEgregores.find(e => e.id === core.id);
        return savedCore ? { ...core, ...savedCore, chat: core.chat, state: core.state, locus: core.locus } : core;
    });

    return [...updatedCores, ...savedUserEgregores];
};
