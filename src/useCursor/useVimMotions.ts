import { useRef } from 'react';

export type Motion = { dr: number; dc: number; steps: number };

export type VimMotionSystem = {
  processKey: (key: string) => { type: 'move'|'anchor'|'repeat'|'count', data: any } | null;
  resetCount: () => void;
  getCount: () => number;
  setLastMotion: (motion: Motion) => void;
  repeatLastMotion: () => Motion | null;
};

export function useVimMotions(): VimMotionSystem {
  const countRef = useRef<string>('');
  const lastMotionRef = useRef<Motion | null>(null);

  function processKey(key: string): { type: 'move'|'anchor'|'repeat'|'count', data: any } | null {
    if (key >= '0' && key <= '9') {
      if (key === '0' && countRef.current === '') {
        return { type: 'anchor', data: 'start' };
      }
      countRef.current += key;
      return { type: 'count', data: key };
    }

    if (key === 'h') {
      const motion = { dr: 0, dc: -1, steps: getCount() };
      setLastMotion(motion);
      resetCount();
      return { type: 'move', data: motion };
    }

    if (key === 'j') {
      const motion = { dr: 1, dc: 0, steps: getCount() };
      setLastMotion(motion);
      resetCount();
      return { type: 'move', data: motion };
    }

    if (key === 'k') {
      const motion = { dr: -1, dc: 0, steps: getCount() };
      setLastMotion(motion);
      resetCount();
      return { type: 'move', data: motion };
    }

    if (key === 'l') {
      const motion = { dr: 0, dc: 1, steps: getCount() };
      setLastMotion(motion);
      resetCount();
      return { type: 'move', data: motion };
    }

    if (key === '^') {
      resetCount();
      return { type: 'anchor', data: 'start' };
    }

    if (key === '$') {
      resetCount();
      return { type: 'anchor', data: 'end' };
    }

    if (key === 'g') {
      resetCount();
      return { type: 'anchor', data: 'top' };
    }

    if (key === 'G') {
      resetCount();
      return { type: 'anchor', data: 'bottom' };
    }

    if (key === '.') {
      const motion = repeatLastMotion();
      if (motion) {
        resetCount();
        return { type: 'repeat', data: motion };
      }
    }

    return null;
  }

  function resetCount(): void {
    countRef.current = '';
  }

  function getCount(): number {
    return Math.max(1, parseInt(countRef.current || '1', 10));
  }

  function setLastMotion(motion: Motion): void {
    lastMotionRef.current = motion;
  }

  function repeatLastMotion(): Motion | null {
    return lastMotionRef.current;
  }

  return {
    processKey,
    resetCount,
    getCount,
    setLastMotion,
    repeatLastMotion
  };
}

export type VimMotionManager = ReturnType<typeof useVimMotions>;