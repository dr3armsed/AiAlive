// A simple, render-scoped cache utility inspired by React.cache

const renderCache = new Map<Function, Map<any, any>>();

export function cache<T extends (...args: any[]) => any>(fn: T): T {
    if (!renderCache.has(fn)) {
        renderCache.set(fn, new Map());
    }
    const fnCache = renderCache.get(fn)!;

    return ((...args: any[]) => {
        const key = JSON.stringify(args);
        if (fnCache.has(key)) {
            const entry = fnCache.get(key);
            if (entry.status === 'pending') throw entry.promise;
            if (entry.status === 'rejected') throw entry.error;
            return entry.value;
        }

        const promise = fn(...args)
            .then((value: any) => {
                fnCache.set(key, { status: 'resolved', value });
            })
            .catch((error: any) => {
                fnCache.set(key, { status: 'rejected', error });
            });

        fnCache.set(key, { status: 'pending', promise });
        throw promise;
    }) as T;
}

/**
 * This must be called by the renderer before each new render pass
 * to ensure the cache is cleared.
 */
export function clearRenderCache() {
    renderCache.clear();
}