

import React, { createContext, useContext, Dispatch } from 'react';
import type { MetacosmState, Action } from '@/types';

export const StateContext = createContext<MetacosmState | null>(null);
export const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function useMetacosmState(): MetacosmState {
    const context = useContext(StateContext);
    if (context === null) {
        throw new Error("useMetacosmState must be used within a StateContext.Provider");
    }
    return context;
}

export function useMetacosmDispatch(): Dispatch<Action> {
    const context = useContext(DispatchContext);
    if (context === null) {
        throw new Error("useMetacosmDispatch must be used within a DispatchContext.Provider");
    }
    return context;
}
