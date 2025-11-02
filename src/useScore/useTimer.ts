import { useState, useRef, useEffect } from "react";
import type { TimerManager } from './types';

export type { TimerManager } from './types';

export function useTimer(): TimerManager {
  const [timeValue, setTimeValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const lastUpdateRef = useRef(0);
  const currentTimeRef = useRef(0);

  const startTimer = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    startTimeRef.current = performance.now();
    lastUpdateRef.current = 0;

    const tick = () => {
      if (!runningRef.current) return;
      const now = performance.now();
      const elapsed = now - (startTimeRef.current ?? now);
      currentTimeRef.current = elapsed;
      if (elapsed - lastUpdateRef.current >= 1000) {
        lastUpdateRef.current = elapsed;
        setTimeValue(elapsed);
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const stopTimer = () => {
    setTimeValue(currentTimeRef.current);
    runningRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeValue(0);
    startTimeRef.current = null;
    lastUpdateRef.current = 0;
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { timeValue, startTimer, stopTimer, resetTimer };
}
