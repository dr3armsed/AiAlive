// This file centralizes all types and definitions for the advanced hydration pipeline.

/**
 * Defines the available hydration strategies for the renderer.
 */
export enum HydrationStrategy {
    /** The classic approach: hydrates the entire application in a single pass. */
    Full = 'full',
    /** 
     * Islands Architecture: Only hydrates components explicitly marked as interactive (e.g., inside an <Island /> component),
     * leaving the rest of the UI as static HTML. Dramatically improves Time to Interactive (TTI).
     */
    Selective = 'selective',
    /**
     * Streams in interactivity. The initial non-interactive shell is hydrated first, then
     * components inside <Suspense> boundaries are hydrated as their data becomes available.
     * Provides the fastest perceived load time and TTI.
     */
    Progressive = 'progressive',
    /**
     * TEN-LEVEL UPGRADE: Zero-Hydration Resumability. Assumes a server-rendered page. No component code
     * is run on load. A single global listener "resumes" execution of component logic
     * only upon user interaction. Provides near-instant TTI.
     */
    Resumable = 'resumable',
}

/**
 * Represents information about the client's device, used for adaptive hydration.
 */
export interface DeviceInfo {
    isMobile: boolean;
    /** Represents the effective connection type (e.g., 'slow-2g', '2g', '3g', '4g'). */
    effectiveConnectionType: 'slow-2g' | '2g' | '3g' | '4g';
}

/**
 * The configuration object passed to `hydrateRoot` to control the hydration process.
 */
export interface HydrationConfig {
    /**
     * The desired hydration strategy. Can be a fixed value or a function that
     * adaptively selects a strategy based on the user's device and network conditions.
     */
    strategy: HydrationStrategy | ((device: DeviceInfo) => HydrationStrategy);
}