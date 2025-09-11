import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoIcon({ className = '', size = 'md' }: LogoIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card outline */}
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Three horizontal lines (text/data) */}
      <line
        x1="6"
        y1="9"
        x2="12"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="11.5"
        x2="10"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="14"
        x2="11"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Star/sparkle in top right */}
      <path
        d="M16.5 7.5L17.5 6.5L18.5 7.5L17.5 8.5L16.5 7.5Z"
        fill="currentColor"
      />
      <path
        d="M17.5 6.5L18 6L18.5 6.5L18 7L17.5 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
