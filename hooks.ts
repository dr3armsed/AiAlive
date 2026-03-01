import type { ChimeraFiber } from './core/reconciler.ts';

export let wipFiber: ChimeraFiber | null = null;
let hookIndex: number = 0;

// The dispatcher object that connects hooks to the renderer's internal state
export const dispatcher: { [key: string]: Function } = {
    // These will be populated by the hook implementations themselves
};

interface Hook {
    memoizedState: any;
    queue: any;
    next: Hook | null;
}

function getWorkInProgressFiber(): ChimeraFiber {
    if (!wipFiber) {
        throw new Error('Hooks can only be called inside a component.');
    }
    return wipFiber;
}

export function setWipFiber(fiber: ChimeraFiber | null) {
    wipFiber = fiber;
    if (wipFiber) {
        hookIndex = 0;
        // The current hook is retrieved from the alternate fiber during render
    }
}

function getNextHook(): Hook {
    const fiber = getWorkInProgressFiber();
    let oldHook: Hook | null = null;

    if (fiber.alternate && fiber.alternate.memoizedState) {
        oldHook = fiber.alternate.memoizedState;
        for (let i = 0; i < hookIndex; i++) {
            oldHook = oldHook ? oldHook.next : null;
        }
    }
    
    const newHook: Hook = {
        memoizedState: oldHook ? oldHook.memoizedState : undefined,
        queue: oldHook ? oldHook.queue : { pending: null },
        next: null,
    };

    if (hookIndex === 0) {
        fiber.memoizedState = newHook;
    } else {
        let prevHook = fiber.memoizedState;
        while(prevHook.next) {
            prevHook = prevHook.next;
        }
        prevHook.next = newHook;
    }
    
    hookIndex++;
    return newHook;
}

export function useState<S>(initialState: S | (() => S)): [S, (action: S | ((prevState: S) => S)) => void] {
    const hook = getNextHook();
    const isMount = !wipFiber?.alternate;

    if (isMount && hook.memoizedState === undefined) {
        hook.memoizedState = typeof initialState === 'function' ? (initialState as () => S)() : initialState;
    }
    
    const queue = hook.queue.pending;
    if (queue) {
        let newState = hook.memoizedState;
        queue.forEach((action: any) => {
            newState = typeof action === 'function' ? action(newState) : action;
        });
        hook.memoizedState = newState;
        hook.queue.pending = null;
    }

    const setState = (action: S | ((prevState: S) => S)) => {
        if (!hook.queue.pending) {
            hook.queue.pending = [];
        }
        hook.queue.pending.push(action);
        dispatcher.scheduleUpdate(getWorkInProgressFiber());
    };

    return [hook.memoizedState, setState];
}
dispatcher.useState = useState;


export function useEffect(effect: () => (() => void) | void, deps?: any[]) {
    const hook = getNextHook();
    const oldDeps = hook.memoizedState;
    const hasChanged = !oldDeps || !deps || deps.some((dep, i) => dep !== oldDeps[i]);

    if (hasChanged) {
        hook.memoizedState = deps;
        const fiber = getWorkInProgressFiber();
        if (!fiber.updateQueue) {
            fiber.updateQueue = [];
        }
        fiber.updateQueue.push({ effect, deps });
    }
}
dispatcher.useEffect = useEffect;


export function useMemo<T>(compute: () => T, deps: any[]): T {
    const hook = getNextHook();
    const [oldValue, oldDeps] = hook.memoizedState || [undefined, []];
    const hasChanged = !oldDeps || !deps || deps.some((dep, i) => dep !== oldDeps[i]);

    if (hasChanged) {
        const newValue = compute();
        hook.memoizedState = [newValue, deps];
        return newValue;
    }
    
    return oldValue;
}
dispatcher.useMemo = useMemo;

export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
    return useMemo(() => callback, deps);
}
dispatcher.useCallback = useCallback;


export function useRef<T>(initialValue: T): { current: T } {
    return useMemo(() => ({ current: initialValue }), []);
}
dispatcher.useRef = useRef;

export function useTransition(): [boolean, (callback: () => void) => void] {
    const [isPending, setIsPending] = useState(false);

    const startTransition = (callback: () => void) => {
        setIsPending(true);
        dispatcher.startTransition(callback, setIsPending);
    };

    return [isPending, startTransition];
}
dispatcher.useTransition = useTransition;

// --- Data Fetching Hook ---

type CacheEntry = {
    status: 'pending' | 'resolved' | 'rejected';
    data: any;
    promise?: Promise<void>;
}
const dataCache = new Map<string, CacheEntry>();

export function useData<T>(key: string, fetcher: () => Promise<T>): T {
    const entry = dataCache.get(key);

    if (entry) {
        if (entry.status === 'resolved') {
            return entry.data;
        }
        if (entry.status === 'rejected') {
            throw entry.data; // Throw the error
        }
        if (entry.status === 'pending') {
            throw entry.promise; // Suspend
        }
    }

    const promise = fetcher().then(
        (data) => {
            dataCache.set(key, { status: 'resolved', data });
        },
        (error) => {
            dataCache.set(key, { status: 'rejected', data: error });
        }
    );
    
    dataCache.set(key, { status: 'pending', data: undefined, promise });

    throw promise; // Suspend
}
dispatcher.useData = useData;

export function invalidateData(key: string) {
    dataCache.delete(key);
}
dispatcher.invalidateData = invalidateData;

// --- ID Hook ---

let idCounter = 0;

export function resetIdCounter() {
    idCounter = 0;
}

export function useId(): string {
    // This hook generates a unique ID during a render pass.
    // The resetIdCounter function ensures it's stable between server and client.
    return useMemo(() => `:r${idCounter++}:`, []);
}
dispatcher.useId = useId;

// --- Actor Hook ---

export function useActor<T = any>(actorId: string): [T | null, (targetId: string, message: any) => void] {
    const fiber = getWorkInProgressFiber();
    const [lastMessage, setLastMessage] = useState<T | null>(null);

    // @ts-ignore - attaching custom property
    const messageQueue = fiber.messageQueue;
    useEffect(() => {
        if (messageQueue && messageQueue.length > 0) {
            const latestMessage = messageQueue.pop(); // Process the last received message
            setLastMessage(latestMessage.message);
            // @ts-ignore
            fiber.messageQueue = []; // Clear the queue after processing
        }
    }, [messageQueue]); // Re-run when the messageQueue reference changes

    useEffect(() => {
        dispatcher.registerActor(actorId);
        return () => {
            dispatcher.unregisterActor(actorId);
        };
    }, [actorId]);

    const send = (targetId: string, message: any) => {
        dispatcher.sendMessage(actorId, targetId, message);
    };

    return [lastMessage, send];
}
dispatcher.useActor = useActor;