import React from 'react';

const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "w-6 h-6"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83m-3.58-3.58l.707-.707a2.652 2.652 0 013.75 0l.707.707M4.5 8.5L12 16"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.75 8.25l-2.25 2.25 2.25 2.25M7.5 15.75l-2.25-2.25 2.25-2.25"
    />
  </svg>
);

export default WrenchIcon;