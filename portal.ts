import { ReactNode } from 'react';

export const PORTAL_COMPONENT = Symbol.for('chimera.portal');

export function createPortal(children: ReactNode, container: HTMLElement) {
    return {
        $$typeof: PORTAL_COMPONENT,
        containerInfo: container,
        children: children,
    };
}