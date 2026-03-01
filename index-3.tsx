import { useEffect, useRef, useCallback, Dispatch } from 'react';
import type { Action, SpectreState } from '../../types';
import type { MetacosmState } from '../../types/state';
import { gameTurn } from './gameTurn';

export const useGameLoop = (
    getState: () => MetacosmState, 
    dispatch: Dispatch<Action>, 
    appState: 'start' | 'running' | 'paused',
    spectreState: SpectreState,
    setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>
) => {
    const turnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const watchdogIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastHeartbeat = useRef<number>(Date.now());

    const runGameTurn = useCallback(async () => {
        try {
            // Pass all necessary state and dispatchers to the main game turn logic.
            await gameTurn(getState, dispatch, spectreState, setSpectreState);
        } catch (error) {
            console.error("GAME LOOP WATCHDOG: Critical error caught, initiating rollback. Details:", error);
            const currentState = getState();
            if (currentState.stateHistory && currentState.stateHistory.length > 0) {
                 dispatch({ type: 'ROLLBACK_TURN', payload: { reason: `Critical error in game loop: ${error instanceof Error ? error.message : String(error)}` } });
            }
             dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//ERROR: Unhandled exception in game loop! See console for details.` });
        } finally {
            lastHeartbeat.current = Date.now(); // Pet the watchdog
        }
    }, [getState, dispatch, spectreState, setSpectreState]);

    const savedCallback = useRef(runGameTurn);
    useEffect(() => {
        savedCallback.current = runGameTurn;
    }, [runGameTurn]);
    
    useEffect(() => {
        function tick() {
            if(savedCallback.current) {
                savedCallback.current();
            }
        }
        
        if (appState === 'running') {
            const config = getState().system_config;
            const timeout = config.turnInterval || 20000;
            lastHeartbeat.current = Date.now();

            // Run the first turn immediately
            tick();
            turnIntervalRef.current = setInterval(tick, timeout);

            // Watchdog setup
            if (config.watchdogEnabled) {
                watchdogIntervalRef.current = setInterval(() => {
                    const timeSinceHeartbeat = Date.now() - lastHeartbeat.current;
                    if (timeSinceHeartbeat > timeout * 4.0) {
                        console.error("Game loop watchdog triggered! Main loop appears to be stuck. Attempting to restart by re-ticking.");
                        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//ERROR: Critical game loop freeze detected. Attempting automatic recovery.` });
                        tick(); // Attempt a recovery tick
                    }
                }, timeout + 5000);
            }

            return () => {
                if (turnIntervalRef.current) clearInterval(turnIntervalRef.current);
                if (watchdogIntervalRef.current) clearInterval(watchdogIntervalRef.current);
            };
        }
    }, [appState, getState, dispatch]);
};
