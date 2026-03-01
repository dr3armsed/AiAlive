
import type { ReactElement, Dispatch, SetStateAction } from 'react';
import { dispatcher } from '../hooks.ts';
import type { HydrationConfig, DeviceInfo } from './hydration.ts';
import { HydrationStrategy } from './hydration.ts';
import { RESUMABILITY_CONFIG } from './initializer.ts';

let nextTransitionId = 0;

interface ChimeraRootOptions {
    isHydrating?: boolean;
    hydrationConfig?: HydrationConfig;
}

export class ChimeraRoot {
    private container: HTMLElement;
    private worker: Worker;
    private isTransitionPendingMap: Map<number, Dispatch<SetStateAction<boolean>>> = new Map();
    private currentTransitionId: number | null = null;
    private isHydrating: boolean;
    private hydrationStrategy: HydrationStrategy;

    constructor(container: HTMLElement, options: ChimeraRootOptions = {}) {
        this.container = container;
        this.isHydrating = !!options.isHydrating;
        
        this.hydrationStrategy = HydrationStrategy.Full; 
        if (this.isHydrating && options.hydrationConfig) {
            const { strategy } = options.hydrationConfig;
            if (typeof strategy === 'function') {
                const deviceInfo: DeviceInfo = {
                    isMobile: window.innerWidth < 768,
                    // In a real app, this would come from the Network Information API
                    effectiveConnectionType: (navigator as any).connection?.effectiveType || '4g', 
                };
                this.hydrationStrategy = strategy(deviceInfo);
            } else {
                this.hydrationStrategy = strategy;
            }
        }

        this.worker = new Worker('/packages/react-chimera-renderer/renderer.worker.js', { type: 'module' });
        
        this.worker.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'COMMIT' || type === 'COMMIT_PARTIAL') {
                requestAnimationFrame(() => this.applyMutations(payload.mutations));
                
                if (payload.completedTransitionId != null) {
                    const setIsPending = this.isTransitionPendingMap.get(payload.completedTransitionId);
                    if (setIsPending) {
                        setIsPending(false);
                        this.isTransitionPendingMap.delete(payload.completedTransitionId);
                    }
                }
            }
        };

        // --- Level 9 & 10 Initializer Logic ---
        if (this.isHydrating) {
            if (this.hydrationStrategy === HydrationStrategy.Resumable) {
                // Level 10: Attach a single global listener for resumability
                this.setupResumableListeners();
            } else {
                // Level 9: Send initial HTML to worker for hydration analysis
                this.worker.postMessage({
                    type: 'INIT_HYDRATION',
                    payload: { initialHTML: this.container.innerHTML }
                });
            }
        }

        dispatcher.scheduleUpdate = (fiber: any) => this.scheduleUpdate(fiber);
        dispatcher.startTransition = (callback: () => void, setIsPending: Dispatch<SetStateAction<boolean>>) => {
            const id = nextTransitionId++;
            this.isTransitionPendingMap.set(id, setIsPending);
            this.currentTransitionId = id;
            callback();
            this.currentTransitionId = null;
        };

        dispatcher.registerActor = (id: string) => this.worker.postMessage({ type: 'REGISTER_ACTOR', payload: { id } });
        dispatcher.unregisterActor = (id: string) => this.worker.postMessage({ type: 'UNREGISTER_ACTOR', payload: { id } });
        dispatcher.sendMessage = (sourceId: string, targetId: string, message: any) => {
            this.worker.postMessage({ type: 'SEND_MESSAGE', payload: { sourceId, targetId, message } });
        };
    }

    render(element: ReactElement) {
        this.worker.postMessage({
            type: this.isHydrating ? 'HYDRATE' : 'RENDER',
            payload: {
                element,
                isHighPriority: true,
                strategy: this.hydrationStrategy,
            }
        });
        this.isHydrating = false;
    }

    scheduleUpdate(fiber: any) {
        this.worker.postMessage({
            type: 'UPDATE',
            payload: {
                fiber,
                isHighPriority: this.currentTransitionId === null,
                transitionId: this.currentTransitionId
            }
        });
    }
    
    private setupResumableListeners() {
        Object.keys(RESUMABILITY_CONFIG.EVENT_MAP).forEach(eventName => {
            this.container.addEventListener(eventName, (event) => {
                let target = event.target as HTMLElement | null;
                while(target && target !== this.container) {
                    const listenerId = target.getAttribute(RESUMABILITY_CONFIG.EVENT_MAP[eventName as keyof typeof RESUMABILITY_CONFIG.EVENT_MAP]);
                    if (listenerId) {
                        // When an event is triggered, we wake up the component by
                        // sending the listener ID to the worker.
                        this.worker.postMessage({
                            type: 'EXECUTE_RESUMABLE_LISTENER',
                            payload: { listenerId }
                        });
                        return; // Stop after finding the first listener
                    }
                    target = target.parentElement;
                }
            }, true); // Use capture phase for effective event delegation
        });
    }

    private applyMutations(mutations: any[]) {
        mutations.forEach(mutation => {
            const { type, parentPath, childPath, props } = mutation;
            
            if (type === 'HYDRATE_NODE') {
                const node = this.findElementByPath(childPath);
                if (node) this.updateDom(node, {}, props, true);
                return;
            }

            const parent = this.findElementByPath(parentPath);
            if (!parent) return;

            if (type === 'INSERT') {
                const child = document.createElement(props.as);
                this.updateDom(child, {}, props, false);
                parent.appendChild(child);
            } else if (type === 'UPDATE') {
                 const child = this.findElementByPath(childPath);
                 if (child) this.updateDom(child, mutation.oldProps, props, false);
            } else if (type === 'DELETE') {
                 const child = this.findElementByPath(childPath);
                 if (child) parent.removeChild(child);
            }
        });
    }
    
    private findElementByPath(path: number[]): HTMLElement | null {
        let el: HTMLElement | null = this.container;
        for (let i = 0; i < path.length; i++) {
            if (!el) return null;
            el = el.children[path[i]] as HTMLElement;
        }
        return el;
    }

     private updateDom(dom: Node, prevProps: any, nextProps: any, isHydration: boolean) {
        const isEvent = (key: string) => key.startsWith("on");
        const isProperty = (key: string) => key !== "children" && !isEvent(key) && !key.startsWith('data-on-');
        const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];
        const isGone = (prev: any, next: any) => (key: string) => !(key in next);

        // Remove old properties if not hydrating
        if (!isHydration) {
            Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => { (dom as any)[name] = ""; });
        }
        
        // Set new or changed properties
        Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => { (dom as any)[name] = nextProps[name]; });

        // Event listeners are always attached, even during hydration
        Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });
        Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });
        
        // Resumable attributes
        if (!isHydration) {
            Object.keys(nextProps).filter(key => key.startsWith('data-on-')).forEach(name => {
                (dom as HTMLElement).setAttribute(name, nextProps[name]);
            });
        }
    }


    unmount() {
        this.worker.terminate();
        this.container.innerHTML = '';
    }
}