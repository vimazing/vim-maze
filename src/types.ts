import type { RefObject } from 'react';
import type { CursorManager, HeroManager, HeroRenderManager } from './useCursor/types';
import type { GameStatusManager } from './useGameStatus/types';
import type { ScoreManager } from './useScore/types';

export * from './useBoard/types';
export * from './useCursor/types';
export * from './useGameStatus/types';
export * from './useScore/types';

export type GameOptions = {
  rows: number;
  cols: number;
  timeLimit?: number;
};

export type KeyLogEntry = { key: string; timestamp: number };

export type GameKeyManager = {
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};

export type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderManager;
  scoreManager: ScoreManager;
} & GameStatusManager & GameKeyManager;
