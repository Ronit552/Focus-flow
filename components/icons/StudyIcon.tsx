import React from 'react';

export const StudyIcon: React.FC<{ size?: string }> = ({ size = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} fill="none" viewBox="0 0 24 24" stroke="url(#study-gradient)" strokeWidth={2}>
        <defs>
          <linearGradient id="study-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa' }} /> {/* blue-400 */}
            <stop offset="100%" style={{ stopColor: '#22d3ee' }} /> {/* cyan-400 */}
          </linearGradient>
        </defs>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.494h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
        <path d="M4 6h16M4 18h16" />
    </svg>
);