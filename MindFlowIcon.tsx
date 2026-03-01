
import React from 'react';

const MindFlowIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "w-6 h-6"}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h5.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 17.25h-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 11.25l-3 3m0 0l-3-3m3 3V3.75" />
    </svg>
);

export default MindFlowIcon;
