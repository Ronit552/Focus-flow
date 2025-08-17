import React, { useRef } from 'react';
import type { DailyHistory, Session, TimerType } from '../types';
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
        <p className="text-slate-200 font-medium text-lg truncate">{session.description}</p>
        <p className={`text-xs uppercase font-semibold tracking-wider mt-1 ${session.type === 'Study' ? 'text-blue-400/80' : 'text-green-400/80'}`}>
          {session.type}
        </p>
      </div>
    </div>
    <p className="text-slate-300 font-mono text-lg whitespace-nowrap">{formatTime(session.duration)}</p>
  </div>
);

const CategoryHistoryDisplay = React.forwardRef<HTMLDivElement, { history: DailyHistory, title: string, filterType: TimerType }>(({ history, title, filterType }, ref) => {
    const filteredSessions = history.sessions.filter(s => s.type === filterType);
    const totalTime = filterType === 'Study' ? history.totalStudy : history.totalCoding;
    const color = filterType === 'Study' ? 'text-blue-400' : 'text-green-400';
  
    return (
      <div ref={ref} className="p-4 bg-slate-900/50 rounded-lg">
        <h4 className="text-xl font-bold text-center mb-4 text-slate-300">{title}</h4>
        <div className="text-center border-b border-slate-700 pb-4 mb-4">
            <p className="text-slate-400">Total Time</p>
            <p className={`text-3xl font-semibold font-mono tracking-tight ${color}`}>{formatTime(totalTime)}</p>
        </div>
        <div className="space-y-3 session-list max-h-48 overflow-y-auto pr-2">
          {filteredSessions.length > 0 ? (
            filteredSessions.slice().reverse().map((session: Session) => (
              <SessionItem key={session.id} session={session} />
            ))
          ) : (
            <p className="text-center text-slate-500 pt-4">No {filterType.toLowerCase()} sessions saved.</p>
          )}
        </div>
      </div>
    );
  });


const HistorySection: React.FC<HistorySectionProps> = ({ todayHistory, yesterdayHistory }) => {
  const todayStudyRef = useRef<HTMLDivElement>(null);
  const yesterdayStudyRef = useRef<HTMLDivElement>(null);
  const todayCodingRef = useRef<HTMLDivElement>(null);
  const yesterdayCodingRef = useRef<HTMLDivElement>(null);

  const downloadHistoryAsImage = async (element: HTMLElement | null, fileName: string, historyDateString: string) => {
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
        console.error("html2canvas is not defined. Make sure the library is loaded from the HTML file.");
        alert("Error: The image generation library is not loaded. Please check your internet connection and try again.");
        return;
    }
    
    const downloadTime = new Date();
    // Parse the date string to avoid timezone issues with `new Date(string)`
    const [year, month, day] = historyDateString.split('-').map(Number);
    const historyDate = new Date(year, month - 1, day);

    const timestampString = `<strong>History Date:</strong> ${historyDate.toLocaleDateString()} | <strong>Downloaded:</strong> ${downloadTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const timestampEl = document.createElement('div');
    timestampEl.innerHTML = timestampString;
    timestampEl.style.textAlign = 'center';
    timestampEl.style.marginTop = '24px';
    timestampEl.style.paddingTop = '12px';
    timestampEl.style.borderTop = '1px solid #334155'; // slate-700
    timestampEl.style.color = '#cbd5e1'; // slate-300
    timestampEl.style.fontSize = '14px';
    timestampEl.style.fontFamily = `sans-serif`;
    timestampEl.style.letterSpacing = '0.5px';
    
    const strongTags = timestampEl.querySelectorAll('strong');
    strongTags.forEach(strongTag => {
        strongTag.style.color = '#94a3b8'; // slate-400
    });


    element.appendChild(timestampEl);

    const scrollableElements = element.querySelectorAll<HTMLElement>('.session-list');
    const truncatedElements = element.querySelectorAll<HTMLElement>('.truncate');
    const originalStyles = new Map<HTMLElement, { maxHeight: string; overflowY: string }>();

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
            scale: 2,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `focus-flow-${fileName}.png`;
        link.click();
    } catch (error) {
        console.error("Failed to download history image:", error);
        alert("An error occurred while creating the history image.");
    } finally {
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
        if (element.contains(timestampEl)) {
            element.removeChild(timestampEl);
        }
    }
  };

  const hasTodayStudy = todayHistory.sessions.some(s => s.type === 'Study');
  const hasYesterdayStudy = yesterdayHistory?.sessions.some(s => s.type === 'Study');
  const hasTodayCoding = todayHistory.sessions.some(s => s.type === 'Coding');
  const hasYesterdayCoding = yesterdayHistory?.sessions.some(s => s.type === 'Coding');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg ring-1 ring-slate-700">
      <h2 className="text-3xl font-bold text-center mb-6 text-slate-200">Session History</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Study Column */}
        <div className="space-y-4 flex flex-col">
          <h3 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Study History</h3>
          <CategoryHistoryDisplay ref={todayStudyRef} history={todayHistory} title="Today's Progress" filterType="Study" />
          <button
            onClick={() => downloadHistoryAsImage(todayStudyRef.current, `study-history-${todayHistory.date}`, todayHistory.date)}
            className="w-full py-2 px-5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasTodayStudy}
          >
            Download Today's Study History
          </button>
          
          {yesterdayHistory && (
            <>
              <CategoryHistoryDisplay ref={yesterdayStudyRef} history={yesterdayHistory} title="Yesterday's Progress" filterType="Study" />
              <button
                onClick={() => yesterdayHistory && downloadHistoryAsImage(yesterdayStudyRef.current, `study-history-${yesterdayHistory.date}`, yesterdayHistory.date)}
                className="w-full py-2 px-5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasYesterdayStudy}
              >
                Download Yesterday's Study History
              </button>
            </>
          )}
        </div>

        {/* Coding Column */}
        <div className="space-y-4 flex flex-col">
          <h3 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">Coding History</h3>
          <CategoryHistoryDisplay ref={todayCodingRef} history={todayHistory} title="Today's Progress" filterType="Coding" />
           <button
            onClick={() => downloadHistoryAsImage(todayCodingRef.current, `coding-history-${todayHistory.date}`, todayHistory.date)}
            className="w-full py-2 px-5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasTodayCoding}
          >
            Download Today's Coding History
          </button>

          {yesterdayHistory && (
            <>
              <CategoryHistoryDisplay ref={yesterdayCodingRef} history={yesterdayHistory} title="Yesterday's Progress" filterType="Coding" />
              <button
                onClick={() => yesterdayHistory && downloadHistoryAsImage(yesterdayCodingRef.current, `coding-history-${yesterdayHistory.date}`, yesterdayHistory.date)}
                className="w-full py-2 px-5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasYesterdayCoding}
              >
                Download Yesterday's Coding History
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySection;