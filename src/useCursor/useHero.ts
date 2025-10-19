import { useRef, useState, useEffect } from "react";
import type { BoardManager, GameStatusManager, GameStatus, Coord } from "../types";
import { useHeroRender } from "./useHeroRender";

export function useHero(board: BoardManager, gameStatusManager: GameStatusManager) {
  const { mazeRef, containerRef } = board;
  const [heroPos, setHeroPos] = useState<Coord | null>(null);
  const animatingRef = useRef(false);
  const { gameStatus } = gameStatusManager;

  function getCellEl(r: number, c: number): HTMLElement | null {
    const container = containerRef.current;
    if (!container) return null;
    const mazeDiv = container.querySelector("#maze");
    if (!mazeDiv) return null;
    const selector = `.maze-row > div[data-r="${r}"][data-c="${c}"]`;
    return mazeDiv.querySelector(selector) as HTMLElement | null;
  }

  function leaveTrail(r: number, c: number) {
    const el = getCellEl(r, c);
    if (!el) return;
    el.classList.add("trail");
    setTimeout(() => el.classList.remove("trail"), 220);
  }

  function flashInvalid() {
    if (!heroPos) return;
    const el = getCellEl(heroPos.row, heroPos.col);
    if (!el) return;
    el.classList.add("invalid-move");
    setTimeout(() => el.classList.remove("invalid-move"), 180);
  }

  useEffect(() => {
    const onInvalid = () => flashInvalid();
    window.addEventListener("maze-invalid", onInvalid);
    return () => window.removeEventListener("maze-invalid", onInvalid);
  }, []);

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
      const container = containerRef.current;
      container?.querySelector("#maze")?.classList.remove("finished");
      container?.querySelectorAll(".hero").forEach((el) => el.classList.remove("hero"));
    }
  }, [gameStatus, containerRef]);

  function moveHero(
    dr: number,
    dc: number,
    steps: number | undefined,
    gameStatus: GameStatus,
    setGameStatus: (s: GameStatus) => void
  ) {
    const m = mazeRef.current;
    if (!heroPos || !m.length) return;
    if (gameStatus !== "started" && gameStatus !== "has-key") return;
    if (animatingRef.current) return;

    const n = Math.max(1, steps ?? 1);

    const r0 = heroPos.row;
    const c0 = heroPos.col;
    let r = r0;
    let c = c0;
    let valid = true;

    for (let i = 1; i <= n; i++) {
      r += dr;
      c += dc;
      if (!m[r] || !m[r][c] || m[r][c].includes("wall")) {
        valid = false;
        break;
      }
      if (m[r][c].includes("exit") && gameStatus !== "has-key") {
        valid = false;
        break;
      }
    }
    if (!valid) {
      flashInvalid();
      return;
    }

    if (n > 1) {
      animatingRef.current = true;

      let i = 0;
      let rNow = r0;
      let cNow = c0;
      let cancelled = false;
      let rafId: number | null = null;

      const TOTAL_MS = 64;
      const framesTarget = Math.max(1, Math.round(TOTAL_MS / 16));
      const stepsPerFrame = Math.max(1, Math.ceil(n / framesTarget));

      const cancel = () => {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener("keydown", onEsc);
        animatingRef.current = false;
      };
      const onEsc = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") cancel();
      };
      window.addEventListener("keydown", onEsc);

      const tick = () => {
        if (cancelled) return;

        let processed = 0;
        while (processed < stepsPerFrame && i < n) {
          i += 1;
          rNow += dr;
          cNow += dc;
          leaveTrail(rNow, cNow);
          processed += 1;
        }

        setHeroPos({ row: rNow, col: cNow });
        window.dispatchEvent(new CustomEvent("maze-logic-tick", { detail: { t: performance.now() } }));

        if (i < n) {
          rafId = requestAnimationFrame(tick);
        } else {
          if (m[rNow][cNow].includes("key")) {
            setGameStatus("has-key");
            m[rNow][cNow] = [];
            const container = containerRef.current;
            const mazeDiv = container?.querySelector("#maze");
            const keyCell = mazeDiv?.querySelector<HTMLElement>(
              `.maze-row > div[data-r="${rNow}"][data-c="${cNow}"]`
            );
            keyCell?.classList.remove("key");
          }
          if (m[rNow][cNow].includes("exit")) {
            setGameStatus("game-won");
          }
          window.removeEventListener("keydown", onEsc);
          animatingRef.current = false;
        }
      };

      rafId = requestAnimationFrame(tick);
      return;
    }

    const newR = r0 + dr;
    const newC = c0 + dc;

    if (!m[newR] || !m[newR][newC]) {
      flashInvalid();
      return;
    }
    if (m[newR][newC].includes("wall")) {
      flashInvalid();
      return;
    }
    if (m[newR][newC].includes("exit") && gameStatus !== "has-key") {
      flashInvalid();
      return;
    }

    if (m[newR][newC].includes("key")) {
      setGameStatus("has-key");
      m[newR][newC] = [];
      const container = containerRef.current;
      const mazeDiv = container?.querySelector("#maze");
      const cell = mazeDiv?.querySelector<HTMLElement>(
        `.maze-row > div[data-r="${newR}"][data-c="${newC}"]`
      );
      cell?.classList.remove("key");
    }
    if (m[newR][newC].includes("exit")) {
      setGameStatus("game-won");
    }

    setHeroPos({ row: newR, col: newC });
  }

  const hero = {
    heroPos,
    setHeroPos,
    moveHero,
  };

  useHeroRender({ gameStatus, board, hero });

  return hero;
}

export type UseHeroType = ReturnType<typeof useHero>;
