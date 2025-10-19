import { useRef } from 'react';
import type { Coord, AnimationSystem } from '../types';

export type { AnimationSystem } from '../types';

export function useAnimation(): AnimationSystem {
  const animatingRef = useRef(false);
  const cancelRef = useRef<(() => void) | null>(null);

  function animateMovement(
    from: Coord,
    to: Coord,
    steps: number,
    onStep: (coord: Coord) => void,
    onComplete: () => void
  ): void {
    if (animatingRef.current) return;

    animatingRef.current = true;

    const dr = (to.row - from.row) / steps;
    const dc = (to.col - from.col) / steps;
    
    let i = 0;
    let cancelled = false;
    let rafId: number | null = null;

    const cancel = () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onEsc);
      animatingRef.current = false;
      cancelRef.current = null;
    };

    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') cancel();
    };

    window.addEventListener('keydown', onEsc);
    cancelRef.current = cancel;

    const TOTAL_MS = 64;
    const framesTarget = Math.max(1, Math.round(TOTAL_MS / 16));
    const stepsPerFrame = Math.max(1, Math.ceil(steps / framesTarget));

    const tick = () => {
      if (cancelled) return;

      let processed = 0;
      while (processed < stepsPerFrame && i < steps) {
        i += 1;
        const currentRow = Math.round(from.row + dr * i);
        const currentCol = Math.round(from.col + dc * i);
        onStep({ row: currentRow, col: currentCol });
        processed += 1;
      }

      if (i < steps) {
        rafId = requestAnimationFrame(tick);
      } else {
        window.removeEventListener('keydown', onEsc);
        animatingRef.current = false;
        cancelRef.current = null;
        onComplete();
      }
    };

    rafId = requestAnimationFrame(tick);
  }

  function cancelAnimation(): void {
    if (cancelRef.current) {
      cancelRef.current();
    }
  }

  function isAnimating(): boolean {
    return animatingRef.current;
  }

  return {
    animateMovement,
    cancelAnimation,
    isAnimating
  };
}