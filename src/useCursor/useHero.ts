import { useState, useEffect } from "react";
import type { BoardManager } from "../useBoard/types";
import type { GameStatusManager, GameStatus } from "../useGameStatus/types";
import type { UseHeroType, Coord } from "./types";
import { useHeroRender } from "./useHeroRender";
import { useMazeNavigation } from "../useBoard";
import { useAnimation } from "./useAnimation";

export function useHero(board: BoardManager, gameStatusManager: GameStatusManager): UseHeroType {
  const { mazeRef } = board;
  const [heroPos, setHeroPos] = useState<Coord | null>(null);
  const { gameStatus, setGameStatus } = gameStatusManager;
  
  const navigator = useMazeNavigation(mazeRef.current);
  const animation = useAnimation();

  useEffect(() => {
    if (gameStatus === 'started' && !heroPos) {
      const m = mazeRef.current;
      if (!m.length) return;

      for (let c = 0; c < m[0].length; c++) {
        if (m[m.length - 1][c].includes("entrance")) {
          setHeroPos({ row: m.length - 1, col: c });
          break;
        }
      }
    }
  }, [gameStatus, heroPos, mazeRef]);

  useEffect(() => {
    if (gameStatus === 'waiting' || gameStatus === 'game-over' || gameStatus === 'game-won') {
      setHeroPos(null);
    }
  }, [gameStatus]);

  function canMoveTo(coord: Coord): boolean {
    if (!heroPos) return false;
    return navigator.isValidMove(heroPos, coord);
  }

  function moveTo(coord: Coord): void {
    if (!heroPos || !canMoveTo(coord)) return;
    // Note: gameStatus check will be done in moveHero
    if (animation.isAnimating()) return;

    const m = mazeRef.current;
    if (!m.length) return;

    if (m[coord.row][coord.col].includes("exit") && gameStatus !== "has-key") {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const steps = Math.abs(coord.row - heroPos.row) + Math.abs(coord.col - heroPos.col);

    if (steps > 1) {
      animation.animateMovement(
        heroPos,
        coord,
        steps,
        (stepCoord) => {
          setHeroPos(stepCoord);
          window.dispatchEvent(new CustomEvent("maze-logic-tick", { detail: { t: performance.now() } }));
        },
        () => {
          setHeroPos(coord);
          handleCellInteraction(coord);
        }
      );
    } else {
      setHeroPos(coord);
      handleCellInteraction(coord);
    }
  }

  function handleCellInteraction(coord: Coord): void {
    const m = mazeRef.current;
    if (!m.length) return;

    if (m[coord.row][coord.col].includes("key")) {
      setGameStatus("has-key");
      m[coord.row][coord.col] = [];
      window.dispatchEvent(new CustomEvent("maze-key-picked", { detail: coord }));
    }
    if (m[coord.row][coord.col].includes("exit")) {
      setGameStatus("game-won");
    }
  }

  function pickupKey(): void {
    if (!heroPos) return;
    handleCellInteraction(heroPos);
  }

  function reachExit(): void {
    if (!heroPos) return;
    const m = mazeRef.current;
    if (!m.length) return;
    
    if (m[heroPos.row][heroPos.col].includes("exit") && gameStatus === "has-key") {
      setGameStatus("game-won");
    }
  }

  function reset(): void {
    setHeroPos(null);
    animation.cancelAnimation();
  }

  function moveHero(
    dr: number,
    dc: number,
    steps: number | undefined,
    currentGameStatus: GameStatus,
    currentSetGameStatus: (s: GameStatus) => void
  ) {
    if (!heroPos) return;
    if (currentGameStatus !== "started" && currentGameStatus !== "has-key") return;
    if (animation.isAnimating()) return;
    
    const n = Math.max(1, steps ?? 1);
    const targetCoord = {
      row: heroPos.row + dr * n,
      col: heroPos.col + dc * n
    };

    if (!navigator.validatePath(heroPos, { row: dr, col: dc }, n)) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const m = mazeRef.current;
    if (!m.length) return;

    if (m[targetCoord.row][targetCoord.col].includes("exit") && currentGameStatus !== "has-key") {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    if (n > 1) {
      animation.animateMovement(
        heroPos,
        targetCoord,
        n,
        (stepCoord) => {
          setHeroPos(stepCoord);
          window.dispatchEvent(new CustomEvent("maze-logic-tick", { detail: { t: performance.now() } }));
        },
        () => {
          setHeroPos(targetCoord);
          handleCellInteractionForStatus(targetCoord, currentSetGameStatus);
        }
      );
    } else {
      setHeroPos(targetCoord);
      handleCellInteractionForStatus(targetCoord, currentSetGameStatus);
    }
  }

  function handleCellInteractionForStatus(coord: Coord, currentSetGameStatus: (s: GameStatus) => void): void {
    const m = mazeRef.current;
    if (!m.length) return;

    if (m[coord.row][coord.col].includes("key")) {
      currentSetGameStatus("has-key");
      m[coord.row][coord.col] = [];
      window.dispatchEvent(new CustomEvent("maze-key-picked", { detail: coord }));
    }
    if (m[coord.row][coord.col].includes("exit")) {
      currentSetGameStatus("game-won");
    }
  }

  const hero = {
    position: heroPos,
    canMoveTo,
    moveTo,
    pickupKey,
    reachExit,
    reset,
    // Legacy properties for backward compatibility
    heroPos,
    setHeroPos,
    moveHero,
  };

  useHeroRender({ gameStatus, board, hero });

   return hero;
}
