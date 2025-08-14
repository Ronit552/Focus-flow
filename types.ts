export type TimerType = 'Study' | 'Coding';

export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface Session {
  id: number;
  type: TimerType;
  duration: number; // in seconds
  description: string;
  timestamp: number;
}

export interface DailyHistory {
  date: string;
  totalStudy: number; // in seconds
  totalCoding: number; // in seconds
  sessions: Session[];
}