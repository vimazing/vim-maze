import { useRef, useCallback } from "react";
import { MazeGenerator } from "../MazeGenerator";
import { MazeRenderer } from "../MazeRenderer";
import type { MazeCell } from "../types";

export function useMaze(cols: number, rows: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mazeRef = useRef<MazeCell[][]>([]);
  const mazeInstanceRef = useRef<MazeGenerator | null>(null);
  const rendererRef = useRef<MazeRenderer | null>(null);

  const initMaze = useCallback(
    (autoStart = false, startCallback?: () => void) => {
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = "";

      const generator = new MazeGenerator(cols, rows);
      generator.placeKey();

      const renderer = new MazeRenderer(generator.getData(), true);
      renderer.display(container);

      mazeRef.current = generator.maze;
      mazeInstanceRef.current = generator;
      rendererRef.current = renderer;

      if (autoStart && startCallback) {
        setTimeout(() => startCallback(), 0);
      }
    },
    [cols, rows]
  );

  return {
    containerRef,
    mazeRef,
    mazeInstanceRef,
    rendererRef,
    initMaze,
  };
}

export type UseMazeType = ReturnType<typeof useMaze>;
