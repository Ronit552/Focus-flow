import React from 'react';

export const CodeIcon: React.FC<{ size?: string }> = ({ size = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} fill="none" viewBox="0 0 24 24" stroke="url(#code-gradient)" strokeWidth={2}>
        <defs>
          <linearGradient id="code-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4ade80' }} /> {/* green-400 */}
            <stop offset="100%" style={{ stopColor: '#34d399' }} /> {/* emerald-400 */}
          </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);