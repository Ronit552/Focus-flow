import React, { useState } from 'react';
import type { TimerType } from '../types';

interface ResetModalProps {
  isOpen: boolean;
  timerType: TimerType | null;
  onSave: (description: string) => void;
  onDiscard: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, timerType, onSave, onDiscard }) => {
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(description || `Completed ${timerType} session.`);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Reset {timerType} Timer</h2>
        <p className="text-slate-400 mb-4">What did you accomplish during this session?</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Finished Chapter 5 of React hooks..."
          className="w-full h-24 p-2 rounded-md bg-slate-700 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
        />
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onDiscard}
            className="py-2 px-5 rounded-lg font-semibold bg-slate-600 hover:bg-slate-500 transition-colors"
          >
            Don't Save
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;