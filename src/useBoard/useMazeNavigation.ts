import type { Coord, MazeCell } from '../types';

export type MazeNavigator = {
  isValidMove: (from: Coord, to: Coord) => boolean;
  findAnchorTarget: (from: Coord, direction: 'left'|'right'|'top'|'bottom') => Coord | null;
  validatePath: (from: Coord, direction: Coord, steps: number) => boolean;
};

export function useMazeNavigation(maze: MazeCell[][]): MazeNavigator {
  function isValidMove(_from: Coord, to: Coord): boolean {
    if (!maze.length) return false;
    if (!maze[to.row] || !maze[to.row][to.col]) return false;
    if (maze[to.row][to.col].includes('wall')) return false;
    return true;
  }

  function findAnchorTarget(from: Coord, direction: 'left'|'right'|'top'|'bottom'): Coord | null {
    if (!maze.length) return null;

    const rowsCount = maze.length;
    const colsCount = maze[0]?.length ?? 0;
    const { row: r, col: c } = from;

    if (!maze[r] || !maze[r][c] || maze[r][c].includes('wall')) return null;

    if (direction === 'left' || direction === 'right') {
      const step = direction === 'left' ? -1 : 1;
      let cc = c;
      let lastValidPos = { row: r, col: c };

      while (true) {
        const next = cc + step;
        if (next < 0 || next >= colsCount) break;
        if (maze[r][next].includes('wall')) break;
        if (!maze[r][next].includes('wall')) {
          lastValidPos = { row: r, col: next };
        }
        cc = next;
      }

      return lastValidPos.col !== c ? lastValidPos : null;
    } else {
      const step = direction === 'top' ? -1 : 1;
      let rr = r;
      let lastValidPos = { row: r, col: c };

      while (true) {
        const next = rr + step;
        if (next < 0 || next >= rowsCount) break;
        if (maze[next][c].includes('wall')) break;
        if (!maze[next][c].includes('wall')) {
          lastValidPos = { row: next, col: c };
        }
        rr = next;
      }

      return lastValidPos.row !== r ? lastValidPos : null;
    }
  }

  function validatePath(from: Coord, direction: Coord, steps: number): boolean {
    if (!maze.length) return false;

    let r = from.row;
    let c = from.col;

    for (let i = 1; i <= steps; i++) {
      r += direction.row;
      c += direction.col;
      if (!isValidMove(from, { row: r, col: c })) return false;
    }

    return true;
  }

  return {
    isValidMove,
    findAnchorTarget,
    validatePath
  };
}

export type MazeNavigationManager = ReturnType<typeof useMazeNavigation>;