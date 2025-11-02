export type TimerManager = {
  timeValue: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

export type ScorePathsResult = {
  entranceToKey: number;
  entranceToExit: number;
  heroToKey: number;
  heroToExit: number;
};

export type ScoreManager = {
  timeValue: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  distToKey: number;
  distToExit: number;
  keystrokes: number;
  optimalSteps: number;
  efficiency: number;
};
