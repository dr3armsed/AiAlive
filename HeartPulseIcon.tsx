import React from 'react';

const HeartPulseIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className || "w-6 h-6"}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l3-3 1.5 1.5 3-3 1.5 1.5 3-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 8.25v10.5A2.25 2.25 0 004.5 21h15z" />
    </svg>
);

export default HeartPulseIcon;