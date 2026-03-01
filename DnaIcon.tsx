import React from 'react';

const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "w-6 h-6"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
    />
    <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.093 4.972c.53.53.884 1.27.884 2.028v10c0 .758-.354 1.498-.884 2.028m13.814-14.056c-.53-.53-.884-1.27-.884-2.028v-1M18.907 19.028c-.53.53-.884 1.27-.884 2.028v1M12 2.972c0 .758.354 1.498.884 2.028m-1.768 14.056c-.53.53-1.17.884-2.028.884H8.25c-.858 0-1.498-.354-2.028-.884"
    />
  </svg>
);

export default DnaIcon;
