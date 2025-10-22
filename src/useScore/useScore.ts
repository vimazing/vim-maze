import { useEffect, useState } from "react";
import { useTimer } from "./useTimer";
import { useScoreTime } from "./useScoreTime";
import { useScorePaths } from "./useScorePaths";
import type { BoardManager } from "../useBoard/types";
import type { GameStatusManager } from "../useGameStatus/types";
import type { UseHeroType } from "../useCursor/types";

type UseScoreParams = {
  board: BoardManager;
  hero: UseHeroType;
  gameStatusManager: GameStatusManager;
  keyManager?: { keyLog: any[] };
  rows: number;
  cols: number;
  timeLimit: number;
};

export function useScore({ board, hero, gameStatusManager, keyManager, rows, cols, timeLimit }: UseScoreParams) {
  const timer = useTimer();
  const { gameStatus, setGameStatus } = gameStatusManager;
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  const {
    entranceToKey = 0,
    entranceToExit = 0,
    heroToKey = 0,
    heroToExit = 0,
  } = useScorePaths({ board, heroPos: hero.heroPos });

  const distToKey = entranceToKey || heroToKey;
  const distToExit = entranceToExit || heroToExit;

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const keystrokes = keyManager ? keyManager.keyLog.length : 0;

  useScoreTime({ gameStatus, timer });

  useEffect(() => {
    if (gameStatus !== "started" && gameStatus !== "has-key") return;

    const timeLimitMs = timeLimit * 1000;
    if (timeValue >= timeLimitMs) {
      setGameStatus("game-over");
      return;
    }
  }, [gameStatus, timeValue, timeLimit, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== "game-won") return;

    const seconds = timeValue / 1000;
    const mazeSize = rows * cols;
    
    const timePenalty = seconds / 10;
    const keystrokePenalty = keystrokes / 2;
    const sizeMultiplier = Math.max(1.0, mazeSize / 500);
    
    const baseScore = 1000 - timePenalty - keystrokePenalty;
    const score = Math.min(1000, Math.max(0, Math.round(baseScore * sizeMultiplier)));

    setFinalScore(score);
  }, [gameStatus, timeValue, keystrokes, rows, cols]);

   return {
     timeValue,
     startTimer,
     stopTimer,
     resetTimer,
     distToKey,
     distToExit,
     keystrokes,
     finalScore,
   };
}
