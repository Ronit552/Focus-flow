import React from 'react';
import type { TimerType, TimerStatus } from '../types';
import { PipIcon } from './icons/PipIcon';

interface TimerCardProps {
  type: TimerType;
  icon: React.ReactNode;
  time: number;
  isActive: boolean;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleFloat: () => void;
  colorClasses: {
    bg: string;
    shadow: string;
    glow: string;
  };
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const TimerCard: React.FC<TimerCardProps> = ({ type, icon, time, isActive, status, onStart, onPause, onReset, onToggleFloat, colorClasses }) => {
  const isRunning = isActive && status === 'running';

  const baseButtonClass = "w-full sm:w-24 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <div className={`bg-slate-800 rounded-xl p-6 shadow-lg transition-all duration-300 ${isRunning ? `ring-2 ${colorClasses.glow} shadow-2xl ${colorClasses.shadow}` : 'ring-1 ring-slate-700'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-slate-700/50`}>
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-slate-200">{type}</h2>
        </div>
        <button 
            onClick={onToggleFloat} 
            disabled={time === 0 && status === 'stopped'}
            title="Picture-in-Picture" 
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500">
            <PipIcon />
        </button>
      </div>
      <div className="text-center my-6">
        <p className="text-6xl font-mono font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-slate-200 to-slate-400">
          {formatTime(time)}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {status !== 'running' || !isActive ? (
          <button onClick={onStart} className={`${baseButtonClass} bg-gradient-to-r ${colorClasses.bg} text-white hover:scale-105 active:scale-100`}>
            Start
          </button>
        ) : (
          <button onClick={onPause} className={`${baseButtonClass} bg-yellow-500 hover:bg-yellow-600 text-white`}>
            Pause
          </button>
        )}
        <button onClick={onReset} disabled={time === 0 && !isRunning} className={`${baseButtonClass} bg-slate-600 hover:bg-slate-500 text-slate-100`}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TimerCard;