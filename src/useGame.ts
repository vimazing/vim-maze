import type { GameManager, GameOptions } from './types';
import { useBoard } from './useBoard';
import { useCursor } from './useCursor';
import { useKeyBindings } from './useKeyBindings';
import { useGameStatus } from './useGameStatus';

export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const { cols, rows } = options;
  const boardManager = useBoard(cols, rows);
  const { containerRef, renderBoard } = boardManager;
  const cursor = useCursor(boardManager);
  const gameStatusManager = useGameStatus();

  const { gameStatus, startGame, togglePause, quitGame } = gameStatusManager;

  const keyManager = useKeyBindings({ cursor, gameStatus });

  const gameManager = {
    containerRef,
    gameStatus,
    renderBoard,
    startGame,
    togglePause,
    quitGame,
    cursor,
    keyManager,
  }

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}
