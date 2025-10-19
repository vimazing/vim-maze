import type { GameManager, GameOptions } from './types';
import { useBoard } from './useBoard';
import { useCursor } from './useCursor';
import { useGameStatus } from './useGameStatus';

export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const { cols, rows } = options;
  const board = useBoard(cols, rows);
  const { containerRef, renderBoard } = board;
  const gameStatusManager = useGameStatus();
  const { keyManager, ...cursor } = useCursor(board, gameStatusManager);

  const gameManager = {
    containerRef,
    ...keyManager,
    ...gameStatusManager,
    renderBoard,
    cursor,
  }

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}
