import type { GameManager, GameOptions } from './types';
import { useBoard } from './useBoard';
import { useCursor } from './useCursor';
import { useGameStatus } from './useGameStatus';
import { useHeroRender } from './useCursor';
import { useScore } from './useScore';

export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const { cols, rows, gameOver } = options;
  const board = useBoard(cols, rows);
  const { containerRef, renderBoard } = board;
  const gameStatusManager = useGameStatus();
  const { keyManager, ...cursor } = useCursor(board, gameStatusManager);
  
  const hero = cursor.hero;
  const renderer = useHeroRender({ gameStatus: gameStatusManager.gameStatus, board, hero });
  const scoreManager = useScore({ board, hero, gameStatusManager, keyManager, gameOver });

  const gameManager: GameManager = {
    containerRef,
    ...keyManager,
    ...gameStatusManager,
    renderBoard,
    cursor,
    hero,
    renderer,
    scoreManager,
  }

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}
