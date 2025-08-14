import React, { useRef } from 'react';
import type { DailyHistory, Session } from '../types';
import { CodeIcon } from './icons/CodeIcon';
import { StudyIcon } from './icons/StudyIcon';

// Inform TypeScript that html2canvas exists as a global variable
declare var html2canvas: any;

interface HistorySectionProps {
  todayHistory: DailyHistory;
  yesterdayHistory: DailyHistory | null;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}`.trim();
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
};

const SessionItem: React.FC<{ session: Session }> = ({ session }) => (
  <div className="bg-slate-800 p-3 rounded-md flex justify-between items-center gap-4">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {session.type === 'Study' ? <StudyIcon size="h-5 w-5" /> : <CodeIcon size="h-5 w-5" />}
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate ${session.type === 'Study' ? 'text-blue-400' : 'text-green-400'}`}>
          {session.type}
        </p>
        <p className="text-slate-300 text-sm truncate">{session.description}</p>
      </div>
    </div>
    <p className="text-slate-400 font-mono text-sm whitespace-nowrap">{formatTime(session.duration)}</p>
  </div>
);

const HistoryDisplay = React.forwardRef<HTMLDivElement, { history: DailyHistory, title: string }>(({ history, title }, ref) => (
  <div ref={ref} className="p-4 sm:p-6 bg-slate-900/50 rounded-lg">
    <h3 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{title}</h3>
    <div className="grid grid-cols-2 gap-4 mb-4 text-center border-b border-slate-700 pb-4">
      <div>
        <p className="text-slate-400">Total Study</p>
        <p className="text-xl font-semibold text-blue-400">{formatTime(history.totalStudy)}</p>
      </div>
      <div>
        <p className="text-slate-400">Total Coding</p>
        <p className="text-xl font-semibold text-green-400">{formatTime(history.totalCoding)}</p>
      </div>
    </div>
    <div className="space-y-3 session-list max-h-60 overflow-y-auto pr-2">
      {history.sessions.length > 0 ? (
        history.sessions.slice().reverse().map((session: Session) => (
          <SessionItem key={session.id} session={session} />
        ))
      ) : (
        <p className="text-center text-slate-500 pt-4">No sessions saved yet.</p>
      )}
    </div>
  </div>
));


const HistorySection: React.FC<HistorySectionProps> = ({ todayHistory, yesterdayHistory }) => {
  const fullHistoryRef = useRef<HTMLDivElement>(null);
  const yesterdayHistoryRef = useRef<HTMLDivElement>(null);

  const downloadHistoryAsImage = async (element: HTMLElement | null, fileNameDate: string) => {
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
        console.error("html2canvas is not defined. Make sure the library is loaded from the HTML file.");
        alert("Error: The image generation library is not loaded. Please check your internet connection and try again.");
        return;
    }

    const scrollableElements = element.querySelectorAll<HTMLElement>('.session-list');
    const truncatedElements = element.querySelectorAll<HTMLElement>('.truncate');
    const originalStyles = new Map<HTMLElement, { maxHeight: string; overflowY: string }>();

    // Temporarily remove scroll and truncate constraints to capture full content
    scrollableElements.forEach((el) => {
        originalStyles.set(el, {
            maxHeight: el.style.maxHeight,
            overflowY: el.style.overflowY
        });
        el.style.maxHeight = 'none';
        el.style.overflowY = 'visible';
    });

    truncatedElements.forEach((el) => {
        el.classList.remove('truncate');
        el.classList.add('whitespace-normal', 'break-words');
    });

    try {
        const canvas = await html2canvas(element, { 
            backgroundColor: '#0f172a', // slate-900
            useCORS: true,
            scale: 2, // Higher resolution
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `focus-flow-history-${fileNameDate}.png`;
        link.click();
    } catch (error) {
        console.error("Failed to download history image:", error);
        alert("An error occurred while creating the history image.");
    } finally {
        // Restore original styles
        scrollableElements.forEach((el) => {
            const styles = originalStyles.get(el);
            if (styles) {
                el.style.maxHeight = styles.maxHeight;
                el.style.overflowY = styles.overflowY;
            }
        });
        truncatedElements.forEach((el) => {
            el.classList.add('truncate');
            el.classList.remove('whitespace-normal', 'break-words');
        });
    }
  };

  const hasAnyHistory = todayHistory.sessions.length > 0 || (yesterdayHistory && yesterdayHistory.sessions.length > 0);
  const hasYesterdayHistory = yesterdayHistory && yesterdayHistory.sessions.length > 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg ring-1 ring-slate-700">
      <h2 className="text-3xl font-bold text-center mb-6 text-slate-200">Session History</h2>
      
      <div ref={fullHistoryRef} className="space-y-6">
        <HistoryDisplay history={todayHistory} title="Today's Progress" />
        {yesterdayHistory && (
          <HistoryDisplay ref={yesterdayHistoryRef} history={yesterdayHistory} title="Yesterday's Progress" />
        )}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={() => downloadHistoryAsImage(fullHistoryRef.current, todayHistory.date)}
          className="py-2 px-5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasAnyHistory}
        >
          Download Full History
        </button>
        {hasYesterdayHistory && (
          <button
            onClick={() => yesterdayHistory && downloadHistoryAsImage(yesterdayHistoryRef.current, yesterdayHistory.date)}
            className="py-2 px-5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Download Yesterday's History
          </button>
        )}
      </div>
    </div>
  );
};

export default HistorySection;
