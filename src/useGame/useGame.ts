import { useEffect } from "react";
import { useMaze } from "./useMaze";
import { usePlayer } from "./usePlayer";
import { useGameStatus } from "./useGameStatus";
import { useHeroRender } from "./useHeroRender";
import { useScore } from "../useScore";
import type { UseScoreType } from '../types'
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";

export function useGame(cols: number, rows: number, platformHook?: unknown) {
  const mazeManager = useMaze(cols, rows);
  const playerManager = usePlayer(mazeManager);
  const gameManager = useGameStatus(mazeManager, playerManager);
  useHeroRender({ mazeManager, playerManager });

  const { initMaze } = mazeManager;
  const { movePlayer } = playerManager;
  const { gameStatus, setGameStatus, startGame, stopGame } = gameManager;
  const { containerRef } = mazeManager;

  // Initialize maze on mount
  useEffect(() => {
    initMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = (autoStart = false) => {
    if (autoStart) {
      initMaze(true, startGame);
    } else {
      initMaze();
    }
  };

  // 🎮 key bindings integrated
  const keyBindings: UseKeyBindingsType = useKeyBindings({
    gameManager: {
      movePlayer: (dr: number, dc: number, count: number = 1) =>
        movePlayer(dr, dc, count, gameStatus, setGameStatus),
      gameStatus,
      mazeManager,
      playerManager,
    } as any, // minimal shape needed by useKeyBindings
  });

  // 🏆 scoring integrated — pass the full context it needs (incl. maze/player)
  const scoreManager: UseScoreType = useScore({
    gameContext: {
      gameStatus,
      setGameStatus,
      stopGame,
      mazeManager,    // <-- provide for useScorePaths
      playerManager,  // <-- provide for step counting
    },
    keyManager: { keyLog: keyBindings.keyLog }, // minimal info; avoids type cycles
  });

  const fullGameManager = {
    // core game
    containerRef,
    gameStatus,
    setGameStatus,
    mazeManager,
    playerManager,
    startGame,
    initGame: startNewGame,
    movePlayer: (dr: number, dc: number, count: number = 1) =>
      movePlayer(dr, dc, count, gameStatus, setGameStatus),
    stopGame,
    reset: () => initMaze(),

    // key bindings
    ...keyBindings,

    // scoring
    scoreManager,
  };

  if (typeof platformHook === 'function') {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}

export type { GameStatus } from "../types";
