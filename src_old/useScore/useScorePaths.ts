import { useEffect, useState } from "react";
import type { GameStatus } from "../types";

// explicit so as not to break with circular deps, but should be UseGameType
type UseScorePathsParams = {
  gameManager: {
    gameStatus: GameStatus;
    mazeManager: {
      mazeInstanceRef: { current: any };
    };
    playerManager: {
      playerPos: { r: number; c: number } | null;
    };
  };
};

export function useScorePaths({ gameManager }: UseScorePathsParams) {
  const { gameStatus } = gameManager;
  const { mazeInstanceRef } = gameManager.mazeManager;
  const { playerPos } = gameManager.playerManager;

  const [distances, setDistances] = useState({
    entranceToKey: Infinity,
    entranceToExit: Infinity,
    heroToKey: Infinity,
    heroToExit: Infinity,
  });

  // 🧭 1️⃣ Calculate static distances (entrance-based) when game starts
  useEffect(() => {
    if (gameStatus !== "started") return;

    const maze = mazeInstanceRef.current;
    if (!maze) return;

    setDistances((prev) => ({
      ...prev,
      entranceToKey: maze.getDistance("entrance", "key"),
      entranceToExit: maze.getDistance("entrance", "exit"),
    }));
  }, [gameStatus, mazeInstanceRef]);

  // 🚶 2️⃣ Update dynamic distances (hero-based) on every move
  useEffect(() => {
    const maze = mazeInstanceRef.current;
    if (!maze || !playerPos) return;

    setDistances((prev) => ({
      ...prev,
      heroToKey: maze.getDistance("hero", "key", [playerPos.r, playerPos.c]),
      heroToExit: maze.getDistance("hero", "exit", [playerPos.r, playerPos.c]),
    }));
  }, [playerPos, mazeInstanceRef]);

  return distances;
}

export type UseScorePathsReturn = ReturnType<typeof useScorePaths>;
