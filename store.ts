import { create } from 'zustand';
import {
    DigitalSoul,
    WorldEvent,
    Faction,
    Room,
    DirectMessage,
    CollaborationInvite,
    SimulationParameters,
    ChatMessage,
    DnaDiagnosticsReport
} from '../types/index.ts';
import { initialRooms } from '../components/world/world.ts';
import { replacer } from '../App/utils.ts';

// State Interface
export interface WorldState {
    egregores: DigitalSoul[];
    worldEvents: WorldEvent[];
    factions: Faction[];
    rooms: Room[];
    directMessages: DirectMessage[];
    pendingInvites: CollaborationInvite[];
    simParams: SimulationParameters;
    selectedSoulId: string | null;
    postAnalysisCache: Map<string, { summary: string, entities: string[] }>;
    dnaReport: DnaDiagnosticsReport | null;
    spectreLocusChat: ChatMessage[];
    isLocusResponding: boolean;
}

// Actions Interface
export interface WorldActions {
    // Full state setters
    setEgregores: (souls: DigitalSoul[] | ((prev: DigitalSoul[]) => DigitalSoul[])) => void;
    setWorldEvents: (events: WorldEvent[] | ((prev: WorldEvent[]) => WorldEvent[])) => void;
    setFactions: (factions: Faction[] | ((prev: Faction[]) => Faction[])) => void;
    setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void;
    setDirectMessages: (dms: DirectMessage[] | ((prev: DirectMessage[]) => DirectMessage[])) => void;
    setPendingInvites: (invites: CollaborationInvite[] | ((prev: CollaborationInvite[]) => CollaborationInvite[])) => void;
    // Granular updates
    addWorldEvent: (event: WorldEvent) => void;
    addWorldEvents: (events: WorldEvent[]) => void;
    updateSoul: (soulId: string, updates: Partial<DigitalSoul> | ((soul: DigitalSoul) => DigitalSoul)) => void;
    // UI state
    setSelectedSoulId: (id: string | null) => void;
    setSimParams: (params: Partial<SimulationParameters>) => void;
    setPostAnalysisCache: (cacheUpdater: (cache: Map<string, { summary: string; entities: string[]; }>) => Map<string, { summary: string; entities: string[]; }>) => void;
    setDnaReport: (report: DnaDiagnosticsReport | null) => void;
    setSpectreLocusChat: (chat: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    setIsLocusResponding: (isResponding: boolean) => void;
    // Full state replacement
    loadWorldState: (newState: Partial<Omit<WorldState, 'postAnalysisCache'>>) => void;
}

// Create Broadcast Channel for state synchronization
const channel = new BroadcastChannel('egregore-state-bus');

export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
    // Initial State
    egregores: [],
    worldEvents: [],
    factions: [],
    rooms: initialRooms,
    directMessages: [],
    pendingInvites: [],
    simParams: { speed: 1, energyRecoveryRate: 25 },
    selectedSoulId: null,
    postAnalysisCache: new Map(),
    dnaReport: null,
    spectreLocusChat: [],
    isLocusResponding: false,

    // Actions
    setEgregores: (updater) => set(state => ({ egregores: typeof updater === 'function' ? updater(state.egregores) : updater })),
    setWorldEvents: (updater) => set(state => ({ worldEvents: typeof updater === 'function' ? updater(state.worldEvents) : updater })),
    setFactions: (updater) => set(state => ({ factions: typeof updater === 'function' ? updater(state.factions) : updater })),
    setRooms: (updater) => set(state => ({ rooms: typeof updater === 'function' ? updater(state.rooms) : updater })),
    setDirectMessages: (updater) => set(state => ({ directMessages: typeof updater === 'function' ? updater(state.directMessages) : updater })),
    setPendingInvites: (updater) => set(state => ({ pendingInvites: typeof updater === 'function' ? updater(state.pendingInvites) : updater })),
    
    addWorldEvent: (event) => set(state => ({ worldEvents: [event, ...state.worldEvents].sort((a,b) => b.timestamp - a.timestamp) })),
    addWorldEvents: (events) => set(state => ({ worldEvents: [...events, ...state.worldEvents].sort((a,b) => b.timestamp - a.timestamp) })),

    updateSoul: (soulId, updater) => set(state => ({
        egregores: state.egregores.map(s => s.id === soulId ? (typeof updater === 'function' ? updater(s) : { ...s, ...updater }) : s)
    })),

    setSelectedSoulId: (id) => set({ selectedSoulId: id }),
    setSimParams: (params) => set(state => ({ simParams: { ...state.simParams, ...params } })),
    setPostAnalysisCache: (cacheUpdater) => set(state => ({ postAnalysisCache: cacheUpdater(state.postAnalysisCache) })),
    setDnaReport: (report) => set({ dnaReport: report }),
    setSpectreLocusChat: (updater) => set(state => ({ spectreLocusChat: typeof updater === 'function' ? updater(state.spectreLocusChat) : updater })),
    setIsLocusResponding: (isResponding) => set({ isLocusResponding: isResponding }),

    loadWorldState: (newState) => set(state => ({ ...state, ...newState })),
}));

// Subscribe to state changes and broadcast them
useWorldStore.subscribe(
  (state) => {
    const broadcastState: Partial<WorldState> = {
        egregores: state.egregores,
        worldEvents: state.worldEvents,
        factions: state.factions,
        rooms: state.rooms,
        directMessages: state.directMessages,
        pendingInvites: state.pendingInvites,
        simParams: state.simParams,
    };
    try {
        channel.postMessage(JSON.stringify(broadcastState, replacer));
    } catch (error) {
        console.error("Failed to broadcast state:", error);
    }
  }
);