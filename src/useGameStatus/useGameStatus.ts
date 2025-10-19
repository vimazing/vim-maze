import { useState } from 'react';
import type { GameStatus } from '../types';

export function useGameStatus() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');

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

  return {
    gameStatus,
    setGameStatus,
    startGame,
    togglePause,
    quitGame,
  };
}

