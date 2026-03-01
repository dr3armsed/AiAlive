import React from 'react';

const SignalTowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "w-6 h-6"}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6c0-1.033-.27-2.003-.75-2.883m-10.5 0A6.001 6.001 0 0012 18.75m0-13.5a13.48 13.48 0 00-3.375.516" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 14.25v1.5M5.25 12h-1.5M12 5.25a13.48 13.48 0 013.375.516m-8.25-2.633A13.473 13.473 0 005.25 6M20.25 12h-1.5m-1.5-6.234a13.473 13.473 0 00-2.625-2.625" />
    </svg>
);

export default SignalTowerIcon;