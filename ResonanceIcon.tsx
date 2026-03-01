import React from 'react';

const ResonanceIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "w-6 h-6"}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c-3.465 0-6.536 2.063-7.96 5.035M19.96 8.785A8.217 8.217 0 0112 3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c3.465 0 6.536-2.063 7.96-5.035M4.04 15.215A8.217 8.217 0 0112 20.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
);

export default ResonanceIcon;