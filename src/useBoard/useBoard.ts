import { useEffect, useRef } from "react";
import { MazeGenerator } from "./MazeGenerator";
import { MazeRenderer } from "./MazeRenderer";
import type { MazeCell } from "./types";

export function useBoard(cols: number, rows: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mazeRef = useRef<MazeCell[][]>([]);
  const mazeInstanceRef = useRef<MazeGenerator | null>(null);
  const rendererRef = useRef<MazeRenderer | null>(null);


  useEffect(() => {
    if (containerRef.current) {
      renderBoard();
    }
  }, [containerRef]);

  function renderBoard() {
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
  }

  return {
    containerRef,
    mazeRef,
    mazeInstanceRef,
    rendererRef,
    renderBoard,
  };
}
