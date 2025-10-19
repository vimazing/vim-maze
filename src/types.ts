import type { RefObject } from 'react';
import { MazeRenderer, MazeGenerator } from "./useBoard";
export * from './useGame';
export * from './useBoard';
export * from './useCursor';

export type GameStatus = 'waiting' | 'started' | 'has-key' | 'paused' | 'game-over' | 'game-won'

export type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderer;
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

export interface MazeData {
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
  heroPos: Coord | null;
  setHeroPos: (pos: Coord | null) => void;
  moveHero: (dr: number, dc: number, steps: number, gameStatus: GameStatus, setGameStatus: (s: GameStatus) => void) => void;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
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
