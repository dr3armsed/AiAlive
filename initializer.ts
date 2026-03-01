/**
 * ============================================================================
 *               Chimera Renderer Initializer & Core Constants
 * ============================================================================
 * TEN-LEVEL UPGRADE: This module is no longer just a list of constants. It is
 * the central nervous system for the renderer's configuration, type safety,
 * and operational logic. It provides a single, authoritative source for all
 * core definitions, ensuring stability, maintainability, and extensibility.
 *
 * It establishes type-safe enums for reconciler operations, defines scheduler
 * priorities, centralizes error codes, and exposes a runtime configuration
 * API with feature flags.
 * ============================================================================
 */

// --- Versioning ---

/**
 * Metadata about the React Chimera Renderer itself.
 */
export const RENDERER_METADATA = {
    /** The current version of the renderer, critical for compatibility checks and debugging. */
    VERSION: '10.0.0-ultra',
    /** A prefix for internal-only props attached to fibers to avoid collisions. */
    INTERNAL_PROP_PREFIX: '__chimera$',
};


// --- Core Reconciler Enums (Type Safety) ---

/**
 * Defines the different types of Fibers the reconciler can process.
 * Using an enum prevents errors from typos in string comparisons.
 */
export enum FiberTag {
    FunctionComponent,
    HostComponent,
    HostRoot,
    SuspenseComponent,
    OffscreenComponent,
    ProfilerComponent,
    IslandComponent,
    PortalComponent,
}

/**
 * Defines the work to be done on a Fiber using a bitmask.
 * This is a performance optimization that allows combining multiple effects
 * on a single fiber with efficient bitwise operations.
 * e.g., `fiber.effectTag |= EffectTag.Placement | EffectTag.Update;`
 */
export enum EffectTag {
    NoEffect         = 0b000000000000,
    Placement        = 0b000000000001, // 1
    Update           = 0b000000000010, // 2
    Deletion         = 0b000000000100, // 4
    Hydration        = 0b000000001000, // 8
    Ref              = 0b000000010000, // 16
    LifecycleEffect  = 0b000000100000, // 32 (for useEffect hooks)
}


// --- Scheduler Configuration ---

/**
 * Defines the priority levels for updates in the concurrent scheduler.
 */
export enum SchedulerPriority {
    /** For synchronous, critical updates that cannot be deferred (e.g., controlled inputs). */
    Immediate,
    /** For high-priority updates resulting from user interactions (e.g., clicks). */
    UserBlocking,
    /** The default priority for most state transitions. */
    Normal,
    /** For low-priority updates that can be deferred (e.g., pre-rendering offscreen content). */
    Low,
}

/**
 * Configuration constants for the concurrent scheduler.
 */
export const SCHEDULER_CONFIG = {
    /**
     * The time slice (in milliseconds) the work loop is allowed to run
     * before yielding back to the main thread to prevent blocking.
     */
    WORK_LOOP_TIMESLICE_MS: 5,

    /**
     * Timeouts for different priorities before they are considered expired and
     * must be rendered synchronously.
     */
    TIMEOUTS: {
        [SchedulerPriority.Immediate]: -1,      // Never times out, always sync.
        [SchedulerPriority.UserBlocking]: 250,  // ms
        [SchedulerPriority.Normal]: 5000,       // ms
        [SchedulerPriority.Low]: 10000,         // ms
    },
};


// --- Resumability Configuration ---

/**
 * Constants for the Zero-Hydration "Resumable" strategy.
 */
export const RESUMABILITY_CONFIG = {
    /**
     * A comprehensive map of DOM event names to the `data-` attribute used for
     * event delegation. This allows a single global listener to invoke the
     * correct component handler on demand.
     */
    EVENT_MAP: {
        'click': 'data-on-click-resumable',
        'input': 'data-on-input-resumable',
        'change': 'data-on-change-resumable',
        'submit': 'data-on-submit-resumable',
        'focus': 'data-on-focus-resumable',
        'blur': 'data-on-blur-resumable',
        'keydown': 'data-on-keydown-resumable',
        'keyup': 'data-on-keyup-resumable',
        'mouseenter': 'data-on-mouseenter-resumable',
        'mouseleave': 'data-on-mouseleave-resumable',
    },
    /** A short, unique prefix for listener IDs to avoid collisions in the DOM. */
    LISTENER_ID_PREFIX: 'cl', // Chimera Listener
};


// --- Centralized Error Handling ---

/**
 * A centralized dictionary of error codes and messages for the renderer.
 * This improves debugging by providing consistent, searchable error information.
 */
export const ERROR_CODES: Record<string, string> = {
    '001': 'Invalid element passed to render. Expected a React element, but received an object of a different type.',
    '002': 'Hooks can only be called inside the body of a function component.',
    '003': 'Renderer crashed: Maximum update depth exceeded. This is likely a bug in the application causing an infinite loop.',
    '004': 'Data fetching/lazy components require the Progressive or Resumable Hydration strategy.',
    '005': 'A component suspended, but no <Suspense> boundary was found in the tree.',
};

/**
 * Formats an error message with a link to documentation for help.
 * @param code The error code from the `ERROR_CODES` dictionary.
 */
export function formatError(code: keyof typeof ERROR_CODES): string {
    const message = ERROR_CODES[code] || 'An unknown renderer error occurred.';
    return `React Chimera Renderer [Error ${code}]: ${message} See https://chimera.dev/errors/${code} for more details.`;
}


// --- Global Runtime Configuration & Feature Flags ---

/**
 * Defines the structure for the renderer's global configuration object.
 */
interface ChimeraConfig {
    /** Enables additional checks and warnings. Automatically true in development. */
    strictMode: boolean;
    /** Enables the <ChimeraProfiler> component to measure render performance. */
    enableProfiler: boolean;
    /** Enables the `useActor` hook and the underlying message bus. */
    enableActorModel: boolean;
    /** A global callback for catching unhandled errors within the renderer. */
    onError: (error: Error, fiberStack: string) => void;
}

/**
 * The mutable, global configuration for the renderer.
 * Use `configureRenderer` to modify these settings.
 */
export const globalConfig: ChimeraConfig = {
    strictMode: false, // process.env.NODE_ENV === 'development', // Simplified for this environment
    enableProfiler: true,
    enableActorModel: true,
    onError: (error, fiberStack) => {
        console.error('React Chimera Renderer Error:', error);
        console.error('Component Stack:', fiberStack);
    },
};

/**
 * Updates the global configuration of the React Chimera Renderer.
 * This allows for runtime customization and feature flagging.
 * @param options An object containing the configuration options to override.
 */
export function configureRenderer(options: Partial<ChimeraConfig>) {
    Object.assign(globalConfig, options);
}