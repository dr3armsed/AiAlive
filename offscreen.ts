import { ReactNode } from 'react';

// This is just a component shell. All the magic happens in the reconciler.
// The reconciler will see this component type and know to either render its children
// to a detached fragment (if hidden) or to the main tree (if visible).

export const Offscreen = ({ mode, children }: { mode: 'visible' | 'hidden', children?: ReactNode }): ReactNode => {
    // The component itself doesn't render anything special; it's a marker for the renderer.
    // When mode is "hidden", the renderer will still process children but won't commit them to the DOM.
    return children;
};