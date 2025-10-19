import type { Coord, MazeCell, MazeNavigator } from '../types';

export type { MazeNavigator } from '../types';

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

       while (true) {
         const next = cc + step;
         if (next < 0 || next >= colsCount) return null;
         if (maze[r][next].includes('wall')) {
           const wallIdx = next;
           const expectedWallIdx = direction === 'left' ? 0 : colsCount - 1;
           const expectedCellIdx = direction === 'left' ? 1 : colsCount - 2;

           if (wallIdx !== expectedWallIdx) return null;
           if (cc !== expectedCellIdx) return null;
           if (cc === c) return null;

           return { row: r, col: cc };
         }
         cc = next;
       }
     } else {
       const step = direction === 'top' ? -1 : 1;
       let rr = r;

       while (true) {
         const next = rr + step;
         if (next < 0 || next >= rowsCount) return null;
         if (maze[next][c].includes('wall')) {
           const wallIdx = next;
           const expectedWallIdx = direction === 'top' ? 0 : rowsCount - 1;
           const expectedCellIdx = direction === 'top' ? 1 : rowsCount - 2;

           if (wallIdx !== expectedWallIdx) return null;
           if (rr !== expectedCellIdx) return null;
           if (rr === r) return null;

           return { row: rr, col: c };
         }
         rr = next;
       }
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