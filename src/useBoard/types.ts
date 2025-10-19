import type { RefObject } from 'react';

export type PositionTag = "entrance" | "exit" | "key" | "hero";

export type Coord = { row: number; col: number };

export type CellTag = "wall" | "door" | PositionTag;

export type MazeCell = CellTag[];

export type MazeData = {
  maze: MazeCell[][];
  width: number;
  height: number;
  cols: number;
  rows: number;
  totalSteps: number;
};

export type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  mazeRef: RefObject<MazeCell[][]>;
  mazeInstanceRef: RefObject<any>;
  rendererRef: RefObject<any>;
  renderBoard: () => void;
};

export type MazeNavigator = {
  isValidMove: (from: Coord, to: Coord) => boolean;
  findAnchorTarget: (from: Coord, direction: 'left' | 'right' | 'top' | 'bottom') => Coord | null;
  validatePath: (from: Coord, direction: Coord, steps: number) => boolean;
};
