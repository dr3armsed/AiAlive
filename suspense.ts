import { ReactNode } from 'react';

// This is just a component shell. All the magic happens in the reconciler.
// The reconciler will see this component type and know to look for thrown promises.
export const Suspense = ({ children, fallback }: { children?: ReactNode, fallback: ReactNode }): ReactNode => {
    // In our custom renderer, Suspense itself doesn't render anything different.
    // It's a marker for the rendering engine.
    return children;
};