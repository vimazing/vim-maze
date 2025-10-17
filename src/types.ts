import type { RefObject } from 'react';
export * from './useGame';
export * from './useBoard';
export * from './useCursor';

export type GameStatus = 'waiting' | 'started' | 'hasKey' | 'paused' | 'game-over' | 'game-won'

export type GameManager = { //return type of useGame
  containerRef: RefObject<HTMLDivElement | null>;
  gameStatus: GameStatus;
  renderBoard: () => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;

  cursor: Cursor;
};

export type Cursor = { //return type of useCursor (currently useHero)
  position: () => Coord;
  mode: () => CursorMode;
  move: (dCols: number, dRows: number, count: number) => void;
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
}

export type CursorMode = 'normal' | 'insert' | 'replace' | 'visual' | 'visual-line';



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
