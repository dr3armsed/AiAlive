
import React from 'react';

const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "w-6 h-6"}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.66.538-1.187 1.2-1.187h1.102c.662 0 1.2.527 1.2 1.187v1.863c0 .66-.538 1.187-1.2 1.187h-1.102c-.662 0-1.2-.527-1.2-1.187V6.087z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h8.25A2.25 2.25 0 0116.5 6v1.875c0 .621.504 1.125 1.125 1.125h.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6.375c0-.621.504-1.125 1.125-1.125h.375A2.25 2.25 0 016 6.375V6z" />
    </svg>
);

export default BeakerIcon;