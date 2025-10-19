import { useEffect, useRef, useState } from "react";
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
};

export function useScore({ board, hero, gameStatusManager, keyManager }: UseScoreParams) {
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
  const optimalRef = useRef<number>(0);
  const keystrokes = keyManager ? keyManager.keyLog.length : 0;

  useScoreTime({ gameStatus, timer });

  useEffect(() => {
    const maze = board.mazeInstanceRef.current;
    if (!maze) return;

    const k = maze.getDistance("entrance", "key");
    const e = maze.getDistance("key", "exit");
    const total = k + e;

    if (Number.isFinite(total) && total > 0) {
      optimalRef.current = total;
    }
  }, [gameStatus, board.mazeInstanceRef]);

  const optimalSteps = optimalRef.current;

  const efficiency =
    optimalSteps > 0 ? Math.round((keystrokes / optimalSteps) * 100) : 0;

  const [logicFirst, setLogicFirst] = useState<number | null>(null);
  const [logicLast, setLogicLast] = useState<number | null>(null);

  useEffect(() => {
    if (gameStatus === "started") {
      setLogicFirst(null);
      setLogicLast(null);
      setPlayerSteps(0);
      prevPosRef.current = null;
    }
  }, [gameStatus]);

  useEffect(() => {
    const onTick = (e: Event) => {
      const t =
        (e as CustomEvent<{ t?: number }>).detail?.t ?? performance.now();
      setLogicFirst((prev) => prev ?? t);
      setLogicLast(t);
    };
    window.addEventListener("maze-logic-tick", onTick as EventListener);
    return () =>
      window.removeEventListener("maze-logic-tick", onTick as EventListener);
  }, []);

  const [, setPlayerSteps] = useState(0);
  const prevPosRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const pos = hero.heroPos;
    if (!pos) {
      prevPosRef.current = null;
      return;
    }

    if (!["started", "has-key"].includes(gameStatus)) {
      prevPosRef.current = pos;
      return;
    }

    const prev = prevPosRef.current;
    prevPosRef.current = pos;
    if (!prev) return;

    const delta = Math.abs(pos.row - prev.row) + Math.abs(pos.col - prev.col);
    if (delta > 0) setPlayerSteps((s) => s + delta);
  }, [gameStatus, hero.heroPos]);

  useEffect(() => {
    if (gameStatus === "started" && efficiency > 150) {
      setGameStatus("game-over");
    }
  }, [efficiency, gameStatus, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== "game-won") return;

    const logicMs =
      logicFirst != null && logicLast != null
        ? Math.max(1, logicLast - logicFirst)
        : timeValue;

    const optimalMs = optimalSteps * 200;
    const ratio = Math.max(0.1, optimalMs / logicMs);
    const score = Math.min(100000, Math.round(ratio * 100000));

    setFinalScore(score);
  }, [gameStatus, logicFirst, logicLast, timeValue, optimalSteps]);

   return {
     timeValue,
     startTimer,
     stopTimer,
     resetTimer,
     distToKey,
     distToExit,
     keystrokes,
     optimalSteps,
     efficiency,
     finalScore,
   };
}
