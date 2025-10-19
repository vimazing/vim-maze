import type { Coord } from '../useBoard/types';
import type { GameStatus } from '../useGameStatus/types';

export type { Coord } from '../useBoard/types';

export type CursorMode = 'normal' | 'insert' | 'replace' | 'visual' | 'visual-line';

export type Motion = { dr: number; dc: number; steps: number };

export type VimMotionSystem = {
  processKey: (key: string) => { type: 'move' | 'anchor' | 'repeat' | 'count'; data: any } | null;
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
};

export type HeroManager = {
  position: Coord | null;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
};

export type HeroRenderManager = {
  render: () => void;
  updatePosition: (coord: Coord) => void;
  showCoordinates: (show: boolean) => void;
};

export type Cursor = CursorManager;
