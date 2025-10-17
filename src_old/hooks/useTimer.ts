import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useTimer – a low-level timer that updates with requestAnimationFrame.
 *
 * @returns { timeValue, startTimer, stopTimer, resetTimer }
 */
export function useTimer() {
  const [timeValue, setTimeValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  // 🕒 Start timer
  const startTimer = useCallback(() => {
    if (runningRef.current) return; runningRef.current = true;
    startTimeRef.current = performance.now();

    const tick = () => {
      if (!runningRef.current) return;
      const now = performance.now();
      const elapsed = now - (startTimeRef.current ?? now);
      setTimeValue(elapsed);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, []);

  // ⏹ Stop/pause timer
  const stopTimer = useCallback(() => {
    runningRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  // 🔄 Reset timer
  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeValue(0);
    startTimeRef.current = null;
  }, [stopTimer]);

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { timeValue, startTimer, stopTimer, resetTimer };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;

