import { useState, useCallback } from 'react';
import type { GameStatus, BoardManager, Coord } from '../types';

export function useGameStatus(board?: BoardManager, setHeroPos?: (pos: Coord) => void) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');

  const startGame = useCallback(() => {
    if (board && setHeroPos) {
      const m = board.mazeRef.current;
      if (!m.length) return;

      for (let c = 0; c < m[0].length; c++) {
        if (m[m.length - 1][c].includes("entrance")) {
          setHeroPos({ row: m.length - 1, col: c });
          break;
        }
      }
    }
    setGameStatus('started');
  }, [board, setHeroPos]);

  function togglePause(pause?: boolean) {
    if (typeof pause === 'boolean') {
      setGameStatus(pause ? 'paused' : 'started');
      return;
    }
    setGameStatus(prevStatus => prevStatus === 'paused' ? 'started' : 'paused');
  }

  function quitGame() {
    if (setHeroPos) {
      setHeroPos({ row: 0, col: 0 });
    }
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

