import type { RefObject } from 'react';
import { MazeRenderer, MazeGenerator } from "./useBoard";
export * from './useGame';
export * from './useBoard';
export * from './useCursor';

export type GameStatus = 'waiting' | 'started' | 'hasKey' | 'paused' | 'game-over' | 'game-won'

export type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  gameStatus: GameStatus;
  renderBoard: () => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;

  cursor: Cursor;
  keyManager: GameKeyManager;
};


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
  clearLog: () => void;
  getLog: () => KeyLogEntry[];
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
export type Cursor = { //return type of useCursor (currently useHero)
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
}
