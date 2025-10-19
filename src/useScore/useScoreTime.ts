import { useEffect, useRef } from "react";
import type { TimerManager, GameStatus } from "../types";

type UseScoreTimeParams = {
  gameStatus: GameStatus;
  timer: TimerManager;
};

export function useScoreTime({ gameStatus, timer }: UseScoreTimeParams) {
  const prevStatusRef = useRef<GameStatus | null>(null);
  const { startTimer, stopTimer, resetTimer } = timer;

  useEffect(() => {
    prevStatusRef.current = gameStatus;

    switch (gameStatus) {
      case "started":
        resetTimer();
        startTimer();
        break;

      case "has-key":
        break;

      case "game-over":
      case "game-won":
      case "waiting":
        stopTimer();
        break;
    }
  }, [gameStatus]);
}
