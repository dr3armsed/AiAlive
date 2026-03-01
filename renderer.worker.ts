import { reconcileChildren, ChimeraFiber } from './core/reconciler.ts';
import { setWipFiber, resetIdCounter, wipFiber } from './hooks.ts';
import { Offscreen } from './offscreen.ts';
import { clearRenderCache } from './cache.ts';
import { HydrationStrategy } from './core/hydration.ts';
import { RESUMABILITY_CONFIG } from './core/initializer.ts';

// --- Renderer State ---
let nextUnitOfWork: ChimeraFiber | null = null;
let wipRoot: ChimeraFiber | null = null;
let currentRoot: ChimeraFiber | null = null;
let deletions: ChimeraFiber[] = [];
let suspendedFibers = new Map<Promise<any>, ChimeraFiber>();

// --- Scheduling & Concurrency ---
let highPriorityRenderRequest: any = null;
let isLoopRunning = false;
let currentHydrationStrategy: HydrationStrategy = HydrationStrategy.Full;

// --- Level 9 & 10 State ---
let initialHtmlString: string | null = null; // For Level 9 Hydration Analysis
const resumableListenerMap = new Map<string, { fiber: ChimeraFiber, handler: Function }>(); // For Level 10 Resumability
let listenerIdCounter = 0;


// Actor System State
const actorRegistry = new Map<string, ChimeraFiber>();

const workLoop = () => {
    isLoopRunning = true;
    
    if (highPriorityRenderRequest) {
        startRender(highPriorityRenderRequest.element, highPriorityRenderRequest.transitionId);
        highPriorityRenderRequest = null;
    }

    const startTime = performance.now();
    while (nextUnitOfWork && (performance.now() - startTime < 5)) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot(wipRoot);
    }

    if (nextUnitOfWork || highPriorityRenderRequest) {
        setTimeout(workLoop, 0);
    } else {
        isLoopRunning = false;
    }
};

const startRender = (element: any, transitionId?: number, isHydration: boolean = false) => {
    resetIdCounter();
    clearRenderCache();

    wipRoot = {
        dom: null, 
        props: { children: [element] },
        alternate: currentRoot,
        parent: undefined,
        child: undefined,
        sibling: undefined,
        type: 'ROOT',
        memoizedState: null,
        isHydrating: isHydration,
    };
    if (transitionId !== undefined) (wipRoot as any).transitionId = transitionId;

    deletions = [];
    nextUnitOfWork = wipRoot;
};

function scheduleHighPriorityUpdate() {
    if (currentRoot) {
        highPriorityRenderRequest = { element: currentRoot.props.children[0] };
        if (!isLoopRunning) workLoop();
    }
}

function performUnitOfWork(fiber: ChimeraFiber): ChimeraFiber | null {
    const isFunctionComponent = fiber.type instanceof Function;

    fiber.isHidden = (fiber.parent?.isHidden) || (fiber.type === Offscreen && fiber.props.mode === 'hidden');
    if (fiber.alternate && fiber.alternate.isHidden && !fiber.isHidden) {
        fiber.effectTag = 'PLACEMENT';
    }

    fiber.isInIsland = (fiber.parent?.isInIsland) || (fiber.type?.name === 'Island');

    // --- Level 10: Resumability Prop Interception ---
    if (currentHydrationStrategy === HydrationStrategy.Resumable && typeof fiber.type === 'string') {
        const newProps: any = {};
        for (const key in fiber.props) {
            if (key.startsWith('on')) {
                const eventName = key.toLowerCase().substring(2);
                const resumableAttrName = RESUMABILITY_CONFIG.EVENT_MAP[eventName as keyof typeof RESUMABILITY_CONFIG.EVENT_MAP];
                if (resumableAttrName) {
                    const listenerId = `${RESUMABILITY_CONFIG.LISTENER_ID_PREFIX}-${listenerIdCounter++}`;
                    resumableListenerMap.set(listenerId, { fiber, handler: fiber.props[key] });
                    newProps[resumableAttrName] = listenerId;
                } else {
                    newProps[key] = fiber.props[key];
                }
            } else {
                newProps[key] = fiber.props[key];
            }
        }
        fiber.props = newProps;
    }
    // --- End Level 10 ---

    if (isFunctionComponent) {
        if (fiber.type.prototype && fiber.type.prototype.isReactComponent) {
            updateClassComponent(fiber);
        } else {
            updateFunctionComponent(fiber);
        }
    } else {
        updateHostComponent(fiber);
    }
    
    if (currentHydrationStrategy === HydrationStrategy.Selective && !fiber.isInIsland && fiber.type !== 'ROOT') {
        fiber.effectTag = undefined;
    }


    if (fiber.child) return fiber.child;
    
    let nextFiber: ChimeraFiber | undefined = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling;
        nextFiber = nextFiber.parent;
    }
    return null;
}

function updateClassComponent(fiber: ChimeraFiber) {
    // A simplified implementation for class components.
    // In a full renderer, this would handle state, lifecycle methods, context, etc.
    const instance = new fiber.type(fiber.props);
    // Attach instance to fiber for later use (e.g., componentDidCatch)
    (fiber as any).stateNode = instance;
    const children = [instance.render()];
    reconcileChildren(fiber, children, deletions);
}

function updateFunctionComponent(fiber: ChimeraFiber) {
    setWipFiber(fiber);
    try {
        const children = [(fiber.type as Function)(fiber.props)];
        reconcileChildren(fiber, children, deletions);
    } catch (e) {
        if (e instanceof Promise) {
            if (currentHydrationStrategy === HydrationStrategy.Progressive || currentHydrationStrategy === HydrationStrategy.Resumable) {
                suspendedFibers.set(e, fiber);
                e.then(() => {
                    const resolvedFiber = suspendedFibers.get(e);
                    if (resolvedFiber) {
                        suspendedFibers.delete(e);
                        const partialRoot = { ...resolvedFiber, alternate: resolvedFiber, parent: resolvedFiber.parent };
                        nextUnitOfWork = partialRoot;
                        wipRoot = partialRoot;
                        if (!isLoopRunning) workLoop();
                    }
                });
                const suspenseBoundary = findSuspenseBoundary(fiber);
                if (suspenseBoundary) {
                    reconcileChildren(fiber, [suspenseBoundary.props.fallback], deletions);
                }
            } else {
                 throw new Error("Data fetching/lazy components require the Progressive or Resumable Hydration strategy.");
            }
        } else {
            throw e;
        }
    }
    setWipFiber(null);
}

function findSuspenseBoundary(fiber: ChimeraFiber): ChimeraFiber | null {
    let current: ChimeraFiber | undefined = fiber.parent;
    while (current) {
        if (current.type?.name === 'Suspense') return current;
        current = current.parent;
    }
    return null;
}

function updateHostComponent(fiber: ChimeraFiber) {
    if (fiber.isHydrating) {
        fiber.effectTag = 'UPDATE';
    }
    reconcileChildren(fiber, fiber.props.children || [], deletions);
}

function getDomPath(fiber: ChimeraFiber): number[] {
    const path: number[] = [];
    let current: ChimeraFiber | undefined = fiber;

    while (current && current.parent && current.type !== 'ROOT') {
        let sibling = current.parent.child;
        let domIndex = 0;
        while (sibling && sibling !== current) {
            if (typeof sibling.type !== 'function' && sibling.type !== Offscreen) {
                domIndex++;
            }
            sibling = sibling.sibling;
        }
        path.unshift(domIndex);
        current = current.parent;
    }
    return path;
}


function commitWork(fiber: ChimeraFiber | undefined, mutations: any[]) {
    if (!fiber || (currentHydrationStrategy === HydrationStrategy.Resumable)) {
        return;
    }

    if (fiber.effectTag) {
        let domParentFiber = fiber.parent;
        while (domParentFiber && typeof domParentFiber.type === 'function') {
            domParentFiber = domParentFiber.parent;
        }

        if (domParentFiber && !fiber.isHidden) {
            const parentPath = getDomPath(domParentFiber);
            
             // --- Level 9: Specialized Hydration Mutation ---
            if (fiber.isHydrating && fiber.effectTag === 'UPDATE') {
                if (typeof fiber.type !== 'function' && fiber.type !== Offscreen) {
                    mutations.push({
                        type: 'HYDRATE_NODE',
                        childPath: getDomPath(fiber),
                        props: fiber.props,
                    });
                }
            } else if (fiber.effectTag === 'PLACEMENT') {
                 if (typeof fiber.type !== 'function' && fiber.type !== Offscreen) {
                    mutations.push({ type: 'INSERT', parentPath: parentPath, props: { as: fiber.type, ...fiber.props } });
                }
            } else if (fiber.effectTag === 'UPDATE') {
                 if (typeof fiber.type !== 'function' && fiber.type !== Offscreen) {
                    mutations.push({ type: 'UPDATE', childPath: getDomPath(fiber), oldProps: fiber.alternate?.props || {}, props: fiber.props });
                }
            }
        }
    }

    commitWork(fiber.child, mutations);
    commitWork(fiber.sibling, mutations);
}

function commitDeletion(fiber: ChimeraFiber | undefined, mutations: any[]) {
    if (!fiber || (currentHydrationStrategy === HydrationStrategy.Resumable)) return;
    
    if (typeof fiber.type !== 'function' && fiber.type !== Offscreen) {
        let domParentFiber = fiber.parent;
        while (domParentFiber && typeof domParentFiber.type === 'function') {
            domParentFiber = domParentFiber.parent;
        }
        if (domParentFiber) {
             mutations.push({ type: 'DELETE', parentPath: getDomPath(domParentFiber), childPath: getDomPath(fiber) });
        }
    } else {
        commitDeletion(fiber.child, mutations);
    }
}


function commitRoot(rootToCommit: ChimeraFiber) {
    const mutations: any[] = [];
    
    deletions.forEach(fiber => commitDeletion(fiber, mutations));
    commitWork(rootToCommit.child, mutations);
    
    const completedTransitionId = (rootToCommit as any)?.transitionId;
    const isPartialCommit = rootToCommit.type !== 'ROOT' && rootToCommit.parent !== undefined;

    if (!isPartialCommit) {
        currentRoot = rootToCommit;
    }
    
    wipRoot = null;
    deletions = [];
    
    // For Resumable mode, the commit phase is a dry run; we don't send DOM mutations.
    if (currentHydrationStrategy !== HydrationStrategy.Resumable) {
        self.postMessage({ 
            type: isPartialCommit ? 'COMMIT_PARTIAL' : 'COMMIT', 
            payload: { mutations, completedTransitionId } 
        });
    }
}

self.onmessage = (event) => {
    const { type, payload } = event.data;
    switch(type) {
        case 'INIT_HYDRATION':
            initialHtmlString = payload.initialHTML;
            break;
        case 'HYDRATE':
            currentHydrationStrategy = payload.strategy || HydrationStrategy.Full;
            startRender(payload.element, payload.transitionId, true);
            break;
        case 'RENDER':
        case 'UPDATE':
            const request = {
                element: payload.element || payload.fiber,
                transitionId: payload.transitionId,
            };
            if (payload.isHighPriority) {
                highPriorityRenderRequest = request;
            } else {
                startRender(request.element, request.transitionId, false);
            }
            break;
        case 'EXECUTE_RESUMABLE_LISTENER':
            const listenerInfo = resumableListenerMap.get(payload.listenerId);
            if (listenerInfo) {
                setWipFiber(listenerInfo.fiber);
                listenerInfo.handler(); // This might call useState, which will schedule an update
                setWipFiber(null);
            }
            break;
        
        case 'REGISTER_ACTOR':
            if (wipFiber) actorRegistry.set(payload.id, wipFiber);
            break;
        case 'UNREGISTER_ACTOR':
            actorRegistry.delete(payload.id);
            break;
        case 'SEND_MESSAGE':
            const { sourceId, targetId, message } = payload;
            const targetFiber = actorRegistry.get(targetId);

            if (targetFiber) {
                if (!targetFiber.messageQueue) targetFiber.messageQueue = [];
                targetFiber.messageQueue.push({ from: sourceId, message });
                scheduleHighPriorityUpdate();
            }
            break;
    }

    if (!isLoopRunning) {
        workLoop();
    }
};