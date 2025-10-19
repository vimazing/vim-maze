import { useEffect, useState } from "react";
import type { BoardManager } from "../types";

type UseScorePathsParams = {
  board: BoardManager;
  heroPos: { row: number; col: number } | null;
};

export function useScorePaths({ board, heroPos }: UseScorePathsParams) {
  const { mazeInstanceRef } = board;

  const [distances, setDistances] = useState({
    entranceToKey: Infinity,
    entranceToExit: Infinity,
    heroToKey: Infinity,
    heroToExit: Infinity,
  });

  useEffect(() => {
    const maze = mazeInstanceRef.current;
    if (!maze) return;

    setDistances((prev) => ({
      ...prev,
      entranceToKey: maze.getDistance("entrance", "key"),
      entranceToExit: maze.getDistance("entrance", "exit"),
    }));
  }, [mazeInstanceRef]);

  useEffect(() => {
    const maze = mazeInstanceRef.current;
    if (!maze || !heroPos) return;

    setDistances((prev) => ({
      ...prev,
      heroToKey: maze.getDistance("hero", "key", heroPos),
      heroToExit: maze.getDistance("hero", "exit", heroPos),
    }));
  }, [heroPos, mazeInstanceRef]);

  return distances;
}

export type UseScorePathsReturn = ReturnType<typeof useScorePaths>;
