import React, { useState, useEffect, useRef } from 'react';
import type { TimerType } from '../types';
import { StudyIcon } from './icons/StudyIcon';
import { CodeIcon } from './icons/CodeIcon';

interface FloatingTimerProps {
  type: TimerType;
  time: number;
  onClose: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const FloatingTimer: React.FC<FloatingTimerProps> = ({ type, time, onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      setIsDragging(true);
      const rect = dragRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const gradient = type === 'Study' 
    ? 'from-blue-500 to-cyan-400' 
    : 'from-green-500 to-emerald-400';

  return (
    <div
      ref={dragRef}
      className="fixed z-50 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 w-72"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div
        className={`flex items-center justify-between p-2 rounded-t-xl cursor-move bg-slate-900/50`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
            {type === 'Study' ? <StudyIcon size="h-5 w-5" /> : <CodeIcon size="h-5 w-5" />}
            <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>{type} Timer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 text-center">
        <p className="text-5xl font-mono font-bold tracking-wider text-slate-100">
          {formatTime(time)}
        </p>
      </div>
    </div>
  );
};

export default FloatingTimer;
