
import React from 'react';

const AnalyzeIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75h4.5m-4.5 3h4.5m-4.5 3h4.5m-3.75 4.5h3.75m-3.75 3h3.75M9 19.5h3.75m-3.75-1.5h3.75M3 13.5a9 9 0 1018 0a9 9 0 00-18 0z" />
    </svg>
);

export default AnalyzeIcon;