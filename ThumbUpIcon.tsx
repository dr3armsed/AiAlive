
import React from 'react';

const ThumbUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085c-.935 0-1.75.56-2.164 1.414l-2.11 4.22a1 1 0 00-.056.242l-1.1 4.895A2 2 0 007.333 15h2.176M14 10h-2M14 10l-2-2" />
    </svg>
);

export default ThumbUpIcon;