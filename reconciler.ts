import type { ChimeraElement } from './polyglot.ts';

export type ChimeraFiber = {
    type: any;
    props: any;
    dom: Node | null;
    parent?: ChimeraFiber;
    child?: ChimeraFiber;
    sibling?: ChimeraFiber;
    alternate?: ChimeraFiber | null;
    effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION';
    // For Hooks
    memoizedState: any; // The head of the hooks linked list
    updateQueue?: any[]; // For useEffect
    // For Concurrency
    pendingProps?: any; // Props for the work-in-progress render
    // For Offscreen rendering
    isHidden?: boolean;
    // For Actor Model
    messageQueue?: { from: string; message: any }[];
    // For Hydration Strategies
    isHydrating?: boolean;
    isInIsland?: boolean;
};

export function reconcileChildren(wipFiber: ChimeraFiber, elements: any[], deletions: ChimeraFiber[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling: ChimeraFiber | null = null;

    while (index < elements.length || oldFiber) {
        const element = elements[index];
        let newFiber: ChimeraFiber | null = null;
        
        const sameType = oldFiber && element && element.type === oldFiber.type;

        if (sameType) {
            // Update the node
            newFiber = {
                type: oldFiber!.type,
                props: element.props,
                dom: oldFiber!.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE',
                memoizedState: oldFiber!.memoizedState,
                isHydrating: wipFiber.isHydrating,
            };
        }
        if (element && !sameType) {
            // Add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT',
                memoizedState: null,
                isHydrating: wipFiber.isHydrating,
            };
        }
        if (oldFiber && !sameType) {
            // Delete the oldFiber's node
            oldFiber.effectTag = 'DELETION';
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            wipFiber.child = newFiber || undefined;
        } else if (element && prevSibling) {
            prevSibling.sibling = newFiber || undefined;
        }

        if(newFiber) {
             prevSibling = newFiber;
        }
        index++;
    }
}