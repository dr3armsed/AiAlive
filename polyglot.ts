// This file contains the logic for detecting React versions and providing the correct adapter.
import react18Adapter from '../adapters/react-18-adapter';
import react19Adapter from '../adapters/react-19-adapter';
import type { ReactElement } from 'react';

// The registry of all known version adapters.
const ADAPTERS = [react19Adapter, react18Adapter];

// This is a simplified check. A real renderer would inspect the Symbol more rigorously.
const REACT_ELEMENT_TYPE = Symbol.for('react.element');

export interface ChimeraElement {
    type: any;
    props: {
        children: any[];
        [key: string]: any;
    };
}

export interface VersionAdapter {
    versionId: string;
    isElementFromThisVersion: (element: any) => boolean;
    translate: (element: ReactElement) => ChimeraElement;
}

export const getAdapterForElement = (element: any): VersionAdapter => {
    if (typeof element !== 'object' || element === null || !element.$$typeof) {
        let receivedType = 'null';
        if (element !== null) {
            receivedType = typeof element;
            if (receivedType === 'object') {
                receivedType = element.constructor.name;
            }
        }
        // This is where we prevent the "Objects are not valid..." error.
        // We can provide a much more descriptive error.
        throw new Error(`React Chimera Renderer Error: Invalid element passed to render. Expected a React element, but received type '${receivedType}'. This is often caused by a version mismatch or an invalid component import.`);
    }
    
    if (element.$$typeof !== REACT_ELEMENT_TYPE) {
         throw new Error(`React Chimera Renderer Error: Invalid element type. Expected Symbol(react.element), but received ${String(element.$$typeof)}.`);
    }

    // Find the first adapter that recognizes this element's structure.
    const adapter = ADAPTERS.find(a => a.isElementFromThisVersion(element));

    if (adapter) {
        return adapter;
    }

    // Fallback or throw an error for unsupported versions.
    console.warn("React Chimera: No specific version adapter found for this element. Using default React 18 adapter. This may lead to unexpected behavior if you are using a different version of React.");
    return react18Adapter;
};