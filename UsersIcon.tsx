import React from 'react';

// Explicitly define a title prop for better TS support and accessibility
interface UsersIconProps extends React.ComponentProps<'svg'> {
  title?: string;
}

const UsersIcon: React.FC<UsersIconProps> = ({ className, title, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "w-6 h-6"}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
        {...props}
    >
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.952a4.5 4.5 0 011.88-2.186c.38-.198.668-.55.8-.962a4.5 4.5 0 01-1.88-2.186c-.132-.412-.42-.764-.8-.962a4.5 4.5 0 01-1.88-2.186A4.502 4.502 0 006 13.5v.72c0 .597.237 1.17.659 1.591l.244.257c.386.406.913.633 1.458.633h4.253a4.5 4.5 0 011.88-2.186z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
    </svg>
);

export default UsersIcon;