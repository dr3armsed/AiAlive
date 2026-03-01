// A simplified implementation of React.lazy
// It returns a special object that the reconciler understands.
import type { ComponentType } from 'react';

export const LAZY_COMPONENT = Symbol.for('chimera.lazy');

export function lazy<T extends ComponentType<any>>(importer: () => Promise<{ default: T }>): T {
    // This payload object is where the lazy component's state is stored.
    // It's attached to the special lazy object.
    const payload = {
        _status: -1, // -1: PENDING, 0: LOADING, 1: RESOLVED, 2: REJECTED
        _result: importer,
    };

    const lazyType = {
        $$typeof: LAZY_COMPONENT,
        _payload: payload,
    };

    return lazyType as unknown as T;
}