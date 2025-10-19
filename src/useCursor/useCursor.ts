import { useRef, useEffect } from 'react'
import type { CursorMode, Coord, BoardManager, GameStatusManager } from '../types'
import { useHero } from './useHero';
import { useGameKeys } from './useGameKeys';
import { useMazeNavigation } from '../useBoard';
import { useVimMotions } from './useVimMotions';

export function useCursor(board: BoardManager, gameStatusManager: GameStatusManager) {
  const position = useRef<Coord>({ row: 0, col: 0 })
  const mode = useRef<CursorMode>('normal')
  const lastKeyRef = useRef<string>("");

  const hero = useHero(board, gameStatusManager);
  const navigator = useMazeNavigation(board.mazeRef.current);
  const vimMotions = useVimMotions();

  // Sync cursor position with hero position
  useEffect(() => {
    if (hero.heroPos) {
      position.current = hero.heroPos;
    }
  }, [hero.heroPos]);

  function move(dCols: number, dRows: number, count: number = 1): void {
    const currentPos = position.current;
    const steps = Math.max(1, count);
    const direction = { row: dRows, col: dCols };
    
    const targetCoord = {
      row: currentPos.row + direction.row * steps,
      col: currentPos.col + direction.col * steps
    };

    if (!navigator.validatePath(currentPos, direction, steps)) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    position.current = targetCoord;
    if (hero && hero.heroPos) {
      hero.moveHero(dRows, dCols, steps, gameStatusManager.gameStatus, gameStatusManager.setGameStatus);
      vimMotions.setLastMotion({ dr: dRows, dc: dCols, steps });
    }
  }

  function moveLeft(count = 1): void {
    move(-1, 0, count);
  }

  function moveRight(count = 1): void {
    move(1, 0, count);
  }

  function moveUp(count = 1): void {
    move(0, -1, count);
  }

  function moveDown(count = 1): void {
    move(0, 1, count);
  }

  function moveToAnchor(target: 'start'|'end'|'top'|'bottom'): void {
    const currentPos = position.current;
    const direction = target === 'start' ? 'left' : 
                     target === 'end' ? 'right' : 
                     target === 'top' ? 'top' : 'bottom';
    
    const anchorTarget = navigator.findAnchorTarget(currentPos, direction);
    if (!anchorTarget) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const dr = anchorTarget.row > currentPos.row ? 1 : 
              anchorTarget.row < currentPos.row ? -1 : 0;
    const dc = anchorTarget.col > currentPos.col ? 1 : 
              anchorTarget.col < currentPos.col ? -1 : 0;
    const steps = Math.abs(anchorTarget.row - currentPos.row) + Math.abs(anchorTarget.col - currentPos.col);

    position.current = anchorTarget;
    if (hero && hero.heroPos) {
      hero.moveTo(anchorTarget);
      if (steps > 0) {
        vimMotions.setLastMotion({ dr, dc, steps });
      }
    }
  }

  function moveToStart(): void {
    moveToAnchor('start');
  }

  function moveToEnd(): void {
    moveToAnchor('end');
  }

  function moveToTop(): void {
    moveToAnchor('top');
  }

  function moveToBottom(): void {
    moveToAnchor('bottom');
  }

  function repeatLastMotion(): void {
    const motion = vimMotions.repeatLastMotion();
    if (!motion || !hero || !hero.heroPos) return;
    
    const currentPos = position.current;
    const targetCoord = {
      row: currentPos.row + motion.dr * motion.steps,
      col: currentPos.col + motion.dc * motion.steps
    };

    if (navigator.validatePath(currentPos, { row: motion.dr, col: motion.dc }, motion.steps)) {
      position.current = targetCoord;
      hero.moveHero(motion.dr, motion.dc, motion.steps, gameStatusManager.gameStatus, gameStatusManager.setGameStatus);
    } else {
      window.dispatchEvent(new Event("maze-invalid"));
    }
  }

  function resetCount(): void {
    vimMotions.resetCount();
  }

  function getCount(): string {
    return String(vimMotions.getCount());
  }

  function setCount(digit: string): void {
    vimMotions.processKey(digit);
  }

  function setLastKey(key: string): void {
    lastKeyRef.current = key;
  }

  function getLastKey(): string {
    return lastKeyRef.current;
  }

  const cursor = {
    position: () => position.current,
    mode: () => mode.current,
    move,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    moveToStart,
    moveToEnd,
    moveToTop,
    moveToBottom,
    repeatLastMotion,
    resetCount,
    getCount,
    setCount,
    setLastKey,
    getLastKey,
    hero,
  }

  const keyManager = useGameKeys({ cursor, gameStatusManager });

  return { ...cursor, keyManager };
}

