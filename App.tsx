import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerType, TimerStatus, Session, DailyHistory } from './types';
import { MOTIVATIONAL_QUOTES, LOCAL_STORAGE_KEY } from './constants';
import TimerCard from './components/TimerCard';
import HistorySection from './components/HistorySection';
import MotivationalBox from './components/MotivationalBox';
import ResetModal from './components/ResetModal';
import FloatingTimer from './components/FloatingTimer';
import { CodeIcon } from './components/icons/CodeIcon';
import { StudyIcon } from './components/icons/StudyIcon';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const App: React.FC = () => {
  const [studyTime, setStudyTime] = useState(0);
  const [codingTime, setCodingTime] = useState(0);
  const [activeTimer, setActiveTimer] = useState<TimerType | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('stopped');
  
  const [history, setHistory] = useState<{ today: DailyHistory; yesterday: DailyHistory | null }>({
    today: { date: getTodayDateString(), totalStudy: 0, totalCoding: 0, sessions: [] },
    yesterday: null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timerToReset, setTimerToReset] = useState<TimerType | null>(null);

  const [floatingTimer, setFloatingTimer] = useState<{type: TimerType} | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipUpdateIntervalRef = useRef<number | null>(null);

  const studyTimeRef = useRef(studyTime);
  studyTimeRef.current = studyTime;
  const codingTimeRef = useRef(codingTime);
  codingTimeRef.current = codingTime;
  
  const historyRef = useRef(history);
  historyRef.current = history;

  const getInitialState = useCallback(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedHistory = item ? JSON.parse(item) : { today: null, yesterday: null };
      const todayStr = getTodayDateString();
      let today: DailyHistory = { date: todayStr, totalStudy: 0, totalCoding: 0, sessions: [] };
      let yesterday: DailyHistory | null = null;

      if (savedHistory.today && savedHistory.today.date === todayStr) {
        today = savedHistory.today;
        yesterday = savedHistory.yesterday;
      } else if (savedHistory.today) {
        // It's a new day, so today's saved data becomes yesterday's
        yesterday = savedHistory.today;
      }

      setHistory({ today, yesterday });
    } catch (error) {
      console.error("Error reading from local storage", error);
    }
  }, []);

  useEffect(() => {
    getInitialState();
  }, [getInitialState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(historyRef.current));
    } catch (error) {
      console.error("Error writing to local storage", error);
    }
  }, [history]);

  useEffect(() => {
    let interval: number | undefined;
    if (timerStatus === 'running' && activeTimer) {
      interval = setInterval(() => {
        if (activeTimer === 'Study') {
          setStudyTime(prev => prev + 1);
        } else {
          setCodingTime(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus, activeTimer]);

  const handleStart = (type: TimerType) => {
    if (activeTimer && activeTimer !== type) {
      return; 
    }
    setActiveTimer(type);
    setTimerStatus('running');
  };

  const handlePause = () => {
    setTimerStatus('paused');
  };

  const handleReset = (type: TimerType) => {
    setTimerStatus('paused');
    setTimerToReset(type);
    setIsModalOpen(true);
  };
  
  const resetTimerState = useCallback((type: TimerType) => {
    if (type === 'Study') {
      setStudyTime(0);
    } else {
      setCodingTime(0);
    }
    if (floatingTimer?.type === type) {
      setFloatingTimer(null);
    }
    if (pipWindow) {
      pipWindow.close();
    }
    setActiveTimer(null);
    setTimerStatus('stopped');
    setTimerToReset(null);
    setIsModalOpen(false);
  }, [floatingTimer, pipWindow]);

  const handleSaveSession = useCallback((description: string) => {
    if (!timerToReset) return;
    
    const duration = timerToReset === 'Study' ? studyTime : codingTime;
    if (duration === 0) {
        resetTimerState(timerToReset);
        return;
    }

    const newSession: Session = {
      id: Date.now(),
      type: timerToReset,
      duration,
      description,
      timestamp: Date.now(),
    };

    setHistory(prev => {
        const newToday = { ...prev.today };
        newToday.sessions.push(newSession);
        if (timerToReset === 'Study') {
            newToday.totalStudy += duration;
        } else {
            newToday.totalCoding += duration;
        }
        return { ...prev, today: newToday };
    });
    
    resetTimerState(timerToReset);
  }, [timerToReset, studyTime, codingTime, resetTimerState]);

  const handleDiscardSession = useCallback(() => {
    if (!timerToReset) return;
    resetTimerState(timerToReset);
  }, [timerToReset, resetTimerState]);

  const handleToggleFloatingTimer = async (type: TimerType) => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }
    
    if (floatingTimer) {
      setFloatingTimer(null);
      return;
    }

    // Try Picture-in-Picture first
    if ('documentPictureInPicture' in window) {
      try {
        const newPipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 288,
          height: 120,
        });

        const pipCss = `
            body { margin: 0; font-family: sans-serif; color: #e2e8f0; background-color: #1e293b; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            #pip-root { box-sizing: border-box; padding: 8px; display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; }
            #pip-header { display: flex; justify-content: space-between; align-items: center; }
            .icon-title { display: flex; align-items: center; gap: 8px; font-weight: bold; }
            .icon-title span { background-image: linear-gradient(to right, ${type === 'Study' ? '#60a5fa, #22d3ee' : '#4ade80, #34d399'}); -webkit-background-clip: text; background-clip: text; color: transparent; }
            #pip-expand-btn { background: #334155; border: none; color: #cbd5e1; border-radius: 9999px; width: 24px; height: 24px; cursor: pointer; font-size: 18px; line-height: 24px; text-align: center; display: flex; align-items: center; justify-content: center;}
            #pip-expand-btn:hover { background: #475569; }
            #pip-time { font-family: monospace; font-size: 2.5rem; text-align: center; font-weight: bold; flex-grow: 1; display: flex; align-items: center; justify-content: center; color: #f1f5f9; }
        `;

        const getPipIcon = (timerType: TimerType) => timerType === 'Study' ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="url(#study-gradient)" stroke-width="2">
                <defs><linearGradient id="study-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#60a5fa"/><stop offset="100%" style="stop-color:#22d3ee"/></linearGradient></defs>
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v11.494m-9-5.494h18" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                <path d="M4 6h16M4 18h16" />
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="url(#code-gradient)" stroke-width="2">
                <defs><linearGradient id="code-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4ade80"/><stop offset="100%" style="stop-color:#34d399"/></linearGradient></defs>
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        `;

        const pipHtml = `
            <div id="pip-root">
                <div id="pip-header">
                    <div class="icon-title">${getPipIcon(type)} <span>${type}</span></div>
                    <button id="pip-expand-btn" title="Expand View">⤢</button>
                </div>
                <div id="pip-time">${formatTime(type === 'Study' ? studyTimeRef.current : codingTimeRef.current)}</div>
            </div>
        `;

        const style = newPipWindow.document.createElement('style');
        style.textContent = pipCss;
        newPipWindow.document.head.appendChild(style);
        newPipWindow.document.body.innerHTML = pipHtml;

        const timeElement = newPipWindow.document.getElementById('pip-time')!;
        
        pipUpdateIntervalRef.current = newPipWindow.setInterval(() => {
            timeElement.textContent = formatTime(type === 'Study' ? studyTimeRef.current : codingTimeRef.current);
        }, 500);

        newPipWindow.document.getElementById('pip-expand-btn')!.addEventListener('click', () => {
            window.focus();
        });

        newPipWindow.addEventListener('pagehide', () => {
            if(pipUpdateIntervalRef.current) {
                clearInterval(pipUpdateIntervalRef.current);
                pipUpdateIntervalRef.current = null;
            }
            setPipWindow(null);
        });
        
        setPipWindow(newPipWindow);
        return; // Success
      } catch (error) {
        console.error("Failed to open Picture-in-Picture window, falling back to in-page timer:", error);
        // Fallback is handled below
      }
    }
    
    // Fallback to draggable in-page timer
    setFloatingTimer({ type });
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Focus Flow
          </h1>
          <p className="text-slate-400 text-lg">Your Personal Productivity Partner</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TimerCard
            type="Study"
            icon={<StudyIcon />}
            time={studyTime}
            isActive={activeTimer === 'Study'}
            status={timerStatus}
            onStart={() => handleStart('Study')}
            onPause={handlePause}
            onReset={() => handleReset('Study')}
            onToggleFloat={() => handleToggleFloatingTimer('Study')}
            colorClasses={{
                bg: 'from-blue-500 to-cyan-400',
                shadow: 'shadow-blue-500/20',
                glow: 'ring-blue-400'
            }}
          />
          <TimerCard
            type="Coding"
            icon={<CodeIcon />}
            time={codingTime}
            isActive={activeTimer === 'Coding'}
            status={timerStatus}
            onStart={() => handleStart('Coding')}
            onPause={handlePause}
            onReset={() => handleReset('Coding')}
            onToggleFloat={() => handleToggleFloatingTimer('Coding')}
            colorClasses={{
                bg: 'from-green-500 to-emerald-400',
                shadow: 'shadow-green-500/20',
                glow: 'ring-green-400'
            }}
          />
        </div>

        <MotivationalBox quotes={MOTIVATIONAL_QUOTES} />

        <HistorySection todayHistory={history.today} yesterdayHistory={history.yesterday} />
      </main>

      {floatingTimer && (
        <FloatingTimer
          type={floatingTimer.type}
          time={floatingTimer.type === 'Study' ? studyTime : codingTime}
          onClose={() => setFloatingTimer(null)}
        />
      )}

      <ResetModal 
        isOpen={isModalOpen} 
        timerType={timerToReset}
        onSave={handleSaveSession}
        onDiscard={handleDiscardSession}
      />
    </div>
  );
};

export default App;
