import type { RefObject } from 'react';
import { MazeRenderer, MazeGenerator } from "./useBoard";
export * from './useGame';
export * from './useBoard';
export * from './useCursor';
export * from './useScore';

export type GameStatus = 'waiting' | 'started' | 'has-key' | 'paused' | 'game-over' | 'game-won'

export type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderer;
  scoreManager: ScoreManager;
} & GameStatusManager & GameKeyManager;


export type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>
  mazeRef: RefObject<MazeCell[][]>
  mazeInstanceRef: RefObject<MazeGenerator | null>
  rendererRef: RefObject<MazeRenderer | null>
  renderBoard: () => void
}


export type PositionTag = "entrance" | "exit" | "key" | "hero";

export type Coord = { row: number, col: number };

export type CellTag = "wall" | "door" | PositionTag;

export type MazeCell = CellTag[];

export type MazeData = {
  maze: MazeCell[][];
  width: number;
  height: number;
  cols: number;
  rows: number;
  totalSteps: number;
}


export type GameOptions = {
  rows: number;
  cols: number;
};

export type KeyLogEntry = { key: string; timestamp: number };

export type GameKeyManager = {
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};

export type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
};

//Cursor Stuff
export type CursorMode = 'normal' | 'insert' | 'replace' | 'visual' | 'visual-line';

export type UseHeroType = {
  position: Coord | null;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
  heroPos: Coord | null;
  setHeroPos: (pos: Coord | null) => void;
  moveHero: (dr: number, dc: number, steps: number, gameStatus: GameStatus, setGameStatus: (s: GameStatus) => void) => void;
};

export type CursorManager = {
  position: () => Coord;
  mode: () => CursorMode;
  move: (dCols: number, dRows: number, count: number) => void;
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  moveToTop: () => void;
  moveToBottom: () => void;
  repeatLastMotion: () => void;
  resetCount: () => void;
  getCount: () => string;
  hasCount: () => boolean;
  setCount: (digit: string) => void;
  setLastKey: (key: string) => void;
  getLastKey: () => string;
  hero?: UseHeroType;
}

export type HeroManager = {
  position: Coord | null;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
}

export type HeroRenderer = {
  render: () => void;
  updatePosition: (coord: Coord) => void;
  showCoordinates: (show: boolean) => void;
}

// Legacy type for backward compatibility
export type Cursor = CursorManager;

export type Motion = { dr: number; dc: number; steps: number };

export type VimMotionSystem = {
  processKey: (key: string) => { type: 'move'|'anchor'|'repeat'|'count', data: any } | null;
  resetCount: () => void;
  getCount: () => number;
  hasCount: () => boolean;
  setLastMotion: (motion: Motion) => void;
  repeatLastMotion: () => Motion | null;
};

export type AnimationSystem = {
  animateMovement: (from: Coord, to: Coord, steps: number, onStep: (coord: Coord) => void, onComplete: () => void) => void;
  cancelAnimation: () => void;
  isAnimating: () => boolean;
};

export type MazeNavigator = {
  isValidMove: (from: Coord, to: Coord) => boolean;
  findAnchorTarget: (from: Coord, direction: 'left'|'right'|'top'|'bottom') => Coord | null;
  validatePath: (from: Coord, direction: Coord, steps: number) => boolean;
};

export type HeroRenderManager = {
  render: () => void;
  updatePosition: (coord: Coord) => void;
  showCoordinates: (show: boolean) => void;
};

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
  finalScore: number | null;
};
