import React from 'react';

interface KaspiBrandProps {
  variant?: 'badge' | 'text' | 'accent';
  className?: string;
  children?: React.ReactNode;
}

export default function KaspiBrand({ variant = 'badge', className = '', children }: KaspiBrandProps) {
  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 ${className}`}>
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 9.739s9-4.189 9-9.739V7l-10-5z"/>
        </svg>
        для Kaspi.kz
      </span>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`text-red-600 font-medium ${className}`}>
        {children || 'Kaspi.kz'}
      </span>
    );
  }

  if (variant === 'accent') {
    return (
      <div className={`border-l-4 border-red-500 pl-4 ${className}`}>
        {children}
      </div>
    );
  }

  return null;
}
