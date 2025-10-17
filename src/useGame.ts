import { useState } from 'react';
import type { GameManager, GameOptions, GameStatus } from './types';
import { useBoard } from './useBoard';
import { useCursor } from './useCursor';

export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const { cols, rows } = options;
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const boardManager = useBoard(cols, rows);
  const { containerRef, renderBoard } = boardManager;
  const cursor = useCursor(boardManager);

  function startGame() {
    setGameStatus('started');
  }

  function togglePause(pause?: boolean) {
    if (typeof pause === 'boolean') {
      setGameStatus(pause ? 'paused' : 'started');
      return;
    }
    setGameStatus(prevStatus => prevStatus === 'paused' ? 'started' : 'paused');
  }

  function quitGame() {
    setGameStatus('waiting');
  }


  const gameManager = {
    containerRef,
    gameStatus,
    renderBoard,
    startGame,
    togglePause,
    quitGame,
    cursor,
  }

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}
