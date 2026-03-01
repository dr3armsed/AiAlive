
import React from 'react';

const ThumbDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085c.935 0 1.75-.56 2.164-1.414l2.11-4.22a1 1 0 00.056-.242l1.1-4.895A2 2 0 0016.667 9h-2.176M10 14h2M10 14l2 2" />
    </svg>
);

export default ThumbDownIcon;