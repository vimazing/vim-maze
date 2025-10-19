import { useRef } from 'react'
import type { CursorMode, Coord, BoardManager, GameStatus } from '../types'
import { useHero } from './useHero'

type Motion = { dr: number; dc: number; steps: number };

export function useCursor(board: BoardManager, gameStatus: GameStatus) {
  const position = useRef<Coord>({ row: 0, col: 0 })
  const mode = useRef<CursorMode>('normal')
  const countRef = useRef<string>("");
  const lastMotionRef = useRef<Motion | null>(null);
  const lastKeyRef = useRef<string>("");

  const hero = useHero(board, gameStatus);

  function findAnchorTarget(dir: "left" | "right") {
    const m = board.mazeRef.current;
    const pos = position.current;
    if (!m.length) return null;

    const colsCount = m[0]?.length ?? 0;
    const r = pos.row;
    const c = pos.col;

    if (!m[r] || !m[r][c] || m[r][c].includes("wall")) return null;

    const step = dir === "left" ? -1 : 1;
    let cc = c;

    while (true) {
      const next = cc + step;
      if (next < 0 || next >= colsCount) return null;
      if (m[r][next].includes("wall")) {
        const wallIdx = next;
        const expectedWallIdx = dir === "left" ? 0 : colsCount - 1;
        const expectedCellIdx = dir === "left" ? 1 : colsCount - 2;

        if (wallIdx !== expectedWallIdx) return null;
        if (cc !== expectedCellIdx) return null;
        if (cc === c) return null;

        return { r, cTarget: cc };
      }
      cc = next;
    }
  }

  function findColumnAnchorTarget(dir: "top" | "bottom") {
    const m = board.mazeRef.current;
    const pos = position.current;
    if (!m.length) return null;

    const rowsCount = m.length;
    const r = pos.row;
    const c = pos.col;

    if (!m[r] || !m[r][c] || m[r][c].includes("wall")) return null;

    const step = dir === "top" ? -1 : 1;
    let rr = r;

    while (true) {
      const next = rr + step;
      if (next < 0 || next >= rowsCount) return null;
      if (m[next][c].includes("wall")) {
        const wallIdx = next;
        const expectedWallIdx = dir === "top" ? 0 : rowsCount - 1;
        const expectedCellIdx = dir === "top" ? 1 : rowsCount - 2;

        if (wallIdx !== expectedWallIdx) return null;
        if (rr !== expectedCellIdx) return null;
        if (rr === r) return null;

        return { rTarget: rr, c };
      }
      rr = next;
    }
  }

  function move(dCols: number, dRows: number, count: number = 1) {
    const m = board.mazeRef.current;
    if (!m.length) return;

    const currentPos = position.current;
    const n = Math.max(1, count);

    // Preflight: simulate n steps; abort if any step is invalid
    let r = currentPos.row;
    let c = currentPos.col;
    let valid = true;

    for (let i = 1; i <= n; i++) {
      r += dRows;
      c += dCols;
      if (!m[r] || !m[r][c] || m[r][c].includes("wall")) {
        valid = false;
        break;
      }
    }

    if (!valid) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    // Update position
    position.current = { row: r, col: c };
    lastMotionRef.current = { dr: dRows, dc: dCols, steps: n };
  }

  function moveLeft(count = 1) {
    move(-1, 0, count);
  }

  function moveRight(count = 1) {
    move(1, 0, count);
  }

  function moveUp(count = 1) {
    move(0, -1, count);
  }

  function moveDown(count = 1) {
    move(0, 1, count);
  }

  function moveToStart() {
    const anchor = findAnchorTarget("left");
    if (!anchor) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const pos = position.current;
    const dr = 0;
    const dc = anchor.cTarget > pos.col ? 1 : -1;
    const steps = Math.abs(anchor.cTarget - pos.col);

    move(dr, dc, steps);
  }

  function moveToEnd() {
    const anchor = findAnchorTarget("right");
    if (!anchor) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const pos = position.current;
    const dr = 0;
    const dc = anchor.cTarget > pos.col ? 1 : -1;
    const steps = Math.abs(anchor.cTarget - pos.col);

    move(dr, dc, steps);
  }

  function moveToTop() {
    const anchor = findColumnAnchorTarget("top");
    if (!anchor) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const pos = position.current;
    const dr = anchor.rTarget > pos.row ? 1 : -1;
    const dc = 0;
    const steps = Math.abs(anchor.rTarget - pos.row);

    move(dr, dc, steps);
  }

  function moveToBottom() {
    const anchor = findColumnAnchorTarget("bottom");
    if (!anchor) {
      window.dispatchEvent(new Event("maze-invalid"));
      return;
    }

    const pos = position.current;
    const dr = anchor.rTarget > pos.row ? 1 : -1;
    const dc = 0;
    const steps = Math.abs(anchor.rTarget - pos.row);

    move(dr, dc, steps);
  }

  function repeatLastMotion() {
    const last = lastMotionRef.current;
    if (!last) return;
    const steps = Math.max(1, parseInt(countRef.current || String(last.steps), 10));
    resetCount();
    move(last.dc, last.dr, steps);
  }

  function resetCount() {
    countRef.current = "";
  }

  function getCount() {
    return countRef.current;
  }

  function setCount(digit: string) {
    countRef.current += digit;
  }

  function setLastKey(key: string) {
    lastKeyRef.current = key;
  }

  function getLastKey() {
    return lastKeyRef.current;
  }

  const cursorAPI = {
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
  }

  return cursorAPI;
}

