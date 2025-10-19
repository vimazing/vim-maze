import { useState, useRef, useEffect } from "react";
import type { TimerManager } from '../types';

export type { TimerManager } from '../types';

export function useTimer(): TimerManager {
  const [timeValue, setTimeValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const startTimer = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    startTimeRef.current = performance.now();

    const tick = () => {
      if (!runningRef.current) return;
      const now = performance.now();
      const elapsed = now - (startTimeRef.current ?? now);
      setTimeValue(elapsed);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const stopTimer = () => {
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
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

   return { timeValue, startTimer, stopTimer, resetTimer };
}
