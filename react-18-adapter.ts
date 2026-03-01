import type { ReactElement, ReactNode } from 'react';
import type { VersionAdapter, ChimeraElement } from '../core/polyglot';

const react18Adapter: VersionAdapter = {
    versionId: 'react-18',

    isElementFromThisVersion: (element: any): boolean => {
        // React 18 elements are the default for this project.
        // A more robust check might look for specific properties or structures
        // unique to React 18's fiber nodes if we had access to them here.
        // For now, we'll assume it's the default.
        return true;
    },

    translate: (element: ReactElement): ChimeraElement => {
        // The translation process standardizes the element structure for Chimera's reconciler.
        // One key difference is ensuring `children` is always an array.
        const { children, ...restProps }: { children?: ReactNode; [key: string]: any } = element.props;
        
        return {
            type: element.type,
            props: {
                ...restProps,
                children: Array.isArray(children) ? children : [children].filter(c => c != null),
            },
        };
    },
};

export default react18Adapter;