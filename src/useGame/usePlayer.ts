import { useRef, useState, useCallback, useEffect } from "react";
import type { UseMazeType } from "./useMaze";
import type { GameStatus } from "./useGame";

export function usePlayer(mazeManager: UseMazeType) {
  const { mazeRef, containerRef } = mazeManager;
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number } | null>(null);

  // animation gate so we don't accept new motions mid-anim
  const animatingRef = useRef(false);

  // Helper: get the maze cell element by [r,c] via data attributes
  const getCellEl = useCallback((r: number, c: number): HTMLElement | null => {
    const container = containerRef.current;
    if (!container) return null;
    const mazeDiv = container.querySelector("#maze");
    if (!mazeDiv) return null;
    const selector = `.maze-row > div[data-r="${r}"][data-c="${c}"]`;
    return mazeDiv.querySelector(selector) as HTMLElement | null;
  }, [containerRef]);

  // Visual: briefly highlight a visited cell
  const leaveTrail = useCallback((r: number, c: number) => {
    const el = getCellEl(r, c);
    if (!el) return;
    el.classList.add("trail");
    setTimeout(() => el.classList.remove("trail"), 220);
  }, [getCellEl]);

  // Visual: flash an invalid move on the hero's current cell
  const flashInvalid = useCallback(() => {
    if (!playerPos) return;
    const el = getCellEl(playerPos.r, playerPos.c);
    if (!el) return;
    el.classList.add("invalid-move");
    setTimeout(() => el.classList.remove("invalid-move"), 180);
  }, [playerPos, getCellEl]);

  // Allow other modules (e.g., keybindings) to signal an invalid attempt
  useEffect(() => {
    const onInvalid = () => flashInvalid();
    window.addEventListener("maze-invalid", onInvalid);
    return () => window.removeEventListener("maze-invalid", onInvalid);
  }, [flashInvalid]);

  /**
   * movePlayer — supports counted motions with an all-or-nothing rule.
   * If steps > 1 and the path is valid, animates quickly (many steps per frame),
   * then applies interactions (key/exit) on the final tile.
   */
  const movePlayer = useCallback(
    (
      dr: number,
      dc: number,
      steps: number | undefined,
      gameStatus: GameStatus,
      setGameStatus: (s: GameStatus) => void
    ) => {
      const m = mazeRef.current;
      if (!playerPos || !m.length) return;
      if (gameStatus !== "started" && gameStatus !== "hasKey") return;
      if (animatingRef.current) return; // ignore input mid-animation

      const n = Math.max(1, steps ?? 1);

      // ----- Preflight: simulate n steps; abort if any step is invalid -----
      const r0 = playerPos.r;
      const c0 = playerPos.c;
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
        if (m[r][c].includes("exit") && gameStatus !== "hasKey") {
          valid = false;
          break;
        }
      }
      if (!valid) {
        flashInvalid(); // ❌ all-or-nothing: show feedback and do nothing
        return;
      }

      // ----- Animated multi-step (RAF, fast: multiple steps per frame, short duration) -----
      if (n > 1) {
        animatingRef.current = true;

        let i = 0;
        let rNow = r0;
        let cNow = c0;
        let cancelled = false;
        let rafId: number | null = null;

        // Target total duration (tweak): snappy/fast
        const TOTAL_MS = 64; // 48 or 32 for ultra-fast
        const framesTarget = Math.max(1, Math.round(TOTAL_MS / 16)); // ~60fps frame estimate
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

          // churn through multiple steps in one frame
          let processed = 0;
          while (processed < stepsPerFrame && i < n) {
            i += 1;
            rNow += dr;
            cNow += dc;
            leaveTrail(rNow, cNow); // visual only
            processed += 1;
          }

          // move hero to the latest stepped cell once per frame
          setPlayerPos({ r: rNow, c: cNow });
          window.dispatchEvent(new CustomEvent("maze-logic-tick", { detail: { t: performance.now() } }));

          if (i < n) {
            rafId = requestAnimationFrame(tick);
          } else {
            // final-tile interactions
            if (m[rNow][cNow].includes("key")) {
              setGameStatus("hasKey");
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

      // ----- Single-step (no animation) -----
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
      if (m[newR][newC].includes("exit") && gameStatus !== "hasKey") {
        flashInvalid();
        return;
      }

      if (m[newR][newC].includes("key")) {
        setGameStatus("hasKey");
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

      setPlayerPos({ r: newR, c: newC });
    },
    [playerPos, mazeRef, containerRef, flashInvalid, leaveTrail]
  );

  return {
    playerPos,
    setPlayerPos,
    movePlayer,
  };
}

export type UsePlayerType = ReturnType<typeof usePlayer>;
