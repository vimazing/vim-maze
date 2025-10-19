import { useEffect } from "react";
import type { BoardManager, GameStatus, Coord } from "../types";
import type { UseHeroType } from "./useHero";

type UseHeroRenderParams = {
  gameStatus: GameStatus;
  board: BoardManager;
  hero: UseHeroType;
  relative?: boolean;
};

export function useHeroRender(params: UseHeroRenderParams) {
  const { gameStatus, board, hero, relative = true } = params;
  const { containerRef } = board;
  const playerPos = hero.heroPos;

  function render(): void {
    const container = containerRef.current;
    if (!container) return;

    const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
    if (!mazeDiv) return;

    mazeDiv.querySelectorAll(".hero").forEach((el) => el.classList.remove("hero"));

    if (playerPos) {
      const selector = `.maze-row > div[data-r="${playerPos.row}"][data-c="${playerPos.col}"]`;
      const cell = mazeDiv.querySelector(selector) as HTMLElement | null;
      if (cell) cell.classList.add("hero");
    }
  }

  function updatePosition(coord: Coord): void {
    const container = containerRef.current;
    if (!container) return;

    const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
    if (!mazeDiv) return;

    mazeDiv.querySelectorAll(".hero").forEach((el) => el.classList.remove("hero"));

    const selector = `.maze-row > div[data-r="${coord.row}"][data-c="${coord.col}"]`;
    const cell = mazeDiv.querySelector(selector) as HTMLElement | null;
    if (cell) cell.classList.add("hero");
  }

  function showCoordinates(show: boolean): void {
    const container = containerRef.current;
    if (!container) return;

    const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
    if (!mazeDiv) return;

    if (show && playerPos) {
      mazeDiv.dataset.rows = String(mazeDiv.querySelectorAll(".maze-row").length);
      mazeDiv.dataset.cols = String(
        mazeDiv
          .querySelector(".maze-row > div[data-r][data-c]")
          ?.parentElement?.querySelectorAll(':scope > div[data-r][data-c]').length || 0
      );
      applyRelativeNumbers(mazeDiv, playerPos.row, playerPos.col);
    } else {
      mazeDiv.classList.remove("is-relative");
    }
  }

  const applyRelativeNumbers = (mazeDiv: HTMLElement, R: number, C: number) => {
    const rows = Number(mazeDiv.dataset.rows || 0);
    const cols = Number(mazeDiv.dataset.cols || 0);

    const rowNums = mazeDiv.querySelectorAll<HTMLElement>(".number.row[data-r]");
    rowNums.forEach((el) => {
      const r = Number(el.getAttribute("data-r"));
      if (r <= 0 || r >= rows) {
        el.textContent = "";
        el.classList.remove("is-active");
        return;
      }
      el.textContent = r === R ? String(r) : String(Math.abs(r - R));
      el.classList.toggle("is-active", r === R);
    });

    const colNums = mazeDiv.querySelectorAll<HTMLElement>(".number.col[data-c]");
    colNums.forEach((el) => {
      const c = Number(el.getAttribute("data-c"));
      if (c <= 0 || c >= cols) {
        el.textContent = "";
        el.classList.remove("is-active");
        return;
      }
      el.textContent = c === C ? String(c) : String(Math.abs(c - C));
      el.classList.toggle("is-active", c === C);
    });

    mazeDiv.classList.add("is-relative");
  };

  useEffect(() => {
    if (!['started', 'has-key'].includes(gameStatus)) return;
    render();
    if (relative) {
      showCoordinates(true);
    }
  }, [gameStatus, playerPos, containerRef, relative]);

  useEffect(() => {
    const onInvalid = () => {
      if (!playerPos) return;
      const container = containerRef.current;
      if (!container) return;

      const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
      if (!mazeDiv) return;

      const selector = `.maze-row > div[data-r="${playerPos.row}"][data-c="${playerPos.col}"]`;
      const cell = mazeDiv.querySelector(selector) as HTMLElement | null;
      if (cell) {
        cell.classList.add("invalid-move");
        setTimeout(() => cell.classList.remove("invalid-move"), 180);
      }
    };

    const onKeyPicked = (event: Event) => {
      const customEvent = event as CustomEvent;
      const coord = customEvent.detail as Coord;
      const container = containerRef.current;
      if (!container) return;

      const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
      if (!mazeDiv) return;

      const selector = `.maze-row > div[data-r="${coord.row}"][data-c="${coord.col}"]`;
      const cell = mazeDiv.querySelector(selector) as HTMLElement | null;
      if (cell) {
        cell.classList.remove("key");
      }
    };

    const onLogicTick = (_event: Event) => {
      const container = containerRef.current;
      if (!container) return;

      const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
      if (!mazeDiv) return;

      mazeDiv.querySelectorAll(".trail").forEach((el) => el.classList.remove("trail"));
    };

    window.addEventListener("maze-invalid", onInvalid);
    window.addEventListener("maze-key-picked", onKeyPicked);
    window.addEventListener("maze-logic-tick", onLogicTick);

    return () => {
      window.removeEventListener("maze-invalid", onInvalid);
      window.removeEventListener("maze-key-picked", onKeyPicked);
      window.removeEventListener("maze-logic-tick", onLogicTick);
    };
  }, [playerPos, containerRef]);

  return {
    render,
    updatePosition,
    showCoordinates
  };
}

export type UseHeroRenderType = ReturnType<typeof useHeroRender>;
