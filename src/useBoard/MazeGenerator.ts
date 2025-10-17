import type { PositionTag, Coord, CellTag, MazeCell, MazeData } from "../types";

export class MazeGenerator {
  width: number;
  height: number;
  cols: number;
  rows: number;
  maze: MazeCell[][];
  totalSteps: number = 0;

  constructor(userCols: number, userRows: number) {
    const cellsWide = Math.max(1, Math.floor(userCols / 2));
    const cellsHigh = Math.max(1, Math.floor(userRows / 2));

    this.width = cellsWide;
    this.height = cellsHigh;

    this.cols = 2 * this.width + 1;
    this.rows = 2 * this.height + 1;

    this.maze = this.initArray<MazeCell>([]);

    this.maze.forEach((row, r) => {
      row.forEach((_cell, c) => {
        switch (r) {
          case 0:
          case this.rows - 1:
            this.maze[r][c] = ["wall"];
            break;

          default:
            if ((r % 2) === 1) {
              if ((c === 0) || (c === this.cols - 1)) {
                this.maze[r][c] = ["wall"];
              }
            } else if (c % 2 === 0) {
              this.maze[r][c] = ["wall"];
            }
        }
      });

      if (r === 0) {
        const doorPos = this.posToSpace(this.rand(1, this.width));
        this.maze[r][doorPos] = ["door", "exit"];
      }

      if (r === this.rows - 1) {
        const doorPos = this.posToSpace(this.rand(1, this.width));
        this.maze[r][doorPos] = ["door", "entrance"];
      }
    });

    this.partition(1, this.height - 1, 1, this.width - 1);
  }

  private initArray<T = unknown>(value?: T): T[][] {
    return new Array(this.rows)
      .fill(null)
      .map(() => new Array(this.cols).fill(value as T));
  }

  private rand(min: number, max: number): number {
    return min + Math.floor(Math.random() * (1 + max - min));
  }

  private posToSpace(x: number): number {
    return 2 * (x - 1) + 1;
  }

  private posToWall(x: number): number {
    return 2 * x;
  }

  private inBounds(r: number, c: number): boolean {
    if (
      typeof this.maze[r] === "undefined" ||
      typeof this.maze[r]?.[c] === "undefined"
    ) {
      return false;
    }
    return true;
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private partition(r1: number, r2: number, c1: number, c2: number): void {
    let horiz: number, vert: number;
    let x: number, y: number, start: number, end: number;

    if (r2 < r1 || c2 < c1) {
      return;
    }

    if (r1 === r2) {
      horiz = r1;
    } else {
      x = r1 + 1;
      y = r2 - 1;
      start = Math.round(x + (y - x) / 4);
      end = Math.round(x + (y - x) * 3 / 4);
      horiz = this.rand(start, end);
    }

    if (c1 === c2) {
      vert = c1;
    } else {
      x = c1 + 1;
      y = c2 - 1;
      start = Math.round(x + (y - x) / 3);
      end = Math.round(x + (y - x) * 2 / 3);
      vert = this.rand(start, end);
    }

    for (let i = this.posToWall(r1) - 1; i <= this.posToWall(r2) + 1; i++) {
      for (let j = this.posToWall(c1) - 1; j <= this.posToWall(c2) + 1; j++) {
        if (i === this.posToWall(horiz) || j === this.posToWall(vert)) {
          this.maze[i][j] = ["wall"];
        }
      }
    }

    const gaps = this.shuffle([true, true, true, false]);

    if (gaps[0]) {
      const gapPosition = this.rand(c1, vert);
      this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
    }

    if (gaps[1]) {
      const gapPosition = this.rand(vert + 1, c2 + 1);
      this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
    }

    if (gaps[2]) {
      const gapPosition = this.rand(r1, horiz);
      this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
    }

    if (gaps[3]) {
      const gapPosition = this.rand(horiz + 1, r2 + 1);
      this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
    }

    this.partition(r1, horiz - 1, c1, vert - 1);
    this.partition(horiz + 1, r2, c1, vert - 1);
    this.partition(r1, horiz - 1, vert + 1, c2);
    this.partition(horiz + 1, r2, vert + 1, c2);
  }

  private isGap(...cells: Array<[number, number]>): boolean {
    return cells.every(([row, col]) => {
      const cell = this.maze[row][col];
      if (cell.length > 0) {
        if (!cell.includes("door")) return false;
      }
      return true;
    });
  }

  private countSteps(
    array: (number | undefined)[][],
    r: number,
    c: number,
    val: number,
    stop: CellTag
  ): boolean {
    if (!this.inBounds(r, c)) {
      return false;
    }

    if (array[r][c] !== undefined && (array[r][c] as number) <= val) {
      return false;
    }

    if (!this.isGap([r, c])) {
      return false;
    }

    array[r][c] = val;

    if (this.maze[r][c].includes(stop)) {
      return true;
    }

    this.countSteps(array, r - 1, c, val + 1, stop);
    this.countSteps(array, r, c + 1, val + 1, stop);
    this.countSteps(array, r + 1, c, val + 1, stop);
    this.countSteps(array, r, c - 1, val + 1, stop);

    return false;
  }

  private getKeyLocation(): Coord {
    const fromEntrance = this.initArray<number | undefined>();
    const fromExit = this.initArray<number | undefined>();

    this.totalSteps = -1;

    for (let j = 1; j < this.cols - 1; j++) {
      if (this.maze[this.rows - 1][j].includes("entrance")) {
        this.countSteps(fromEntrance, this.rows - 1, j, 0, "exit");
      }
      if (this.maze[0][j].includes("exit")) {
        this.countSteps(fromExit, 0, j, 0, "entrance");
      }
    }

    let fc = -1,
      fr = -1;

    this.maze.forEach((_row, r) => {
      _row.forEach((_cell, c) => {
        if (typeof fromEntrance[r]?.[c] === "undefined") {
          return;
        }
        const stepCount =
          (fromEntrance[r][c] ?? Infinity) + (fromExit[r][c] ?? Infinity);
        if (stepCount > this.totalSteps) {
          fr = r;
          fc = c;
          this.totalSteps = stepCount;
        }
      });
    });

    return [fr, fc];
  }

  placeKey(): void {
    const [fr, fc] = this.getKeyLocation();
    this.maze[fr][fc] = ["key"];
  }

  shortestPath(
    fromTag: PositionTag,
    toTag: PositionTag,
    currentPosition?: Coord
  ): Coord[] {
    let start: Coord | undefined;
    let end: Coord | undefined;

    if (fromTag === "hero" && currentPosition) {
      start = currentPosition;
    } else {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.maze[r][c].includes(fromTag)) start = [r, c];
        }
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.maze[r][c].includes(toTag)) end = [r, c];
      }
    }

    if (!start || !end) return [];

    const visited = this.initArray<boolean>(false);
    const prev = this.initArray<Coord | null>(null);
    const queue: Coord[] = [[...start]];
    visited[start[0]][start[1]] = true;

    const dirs: Coord[] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (queue.length > 0) {
      const [r, c] = queue.shift() as Coord;

      if (r === end[0] && c === end[1]) {
        const path: Coord[] = [];
        let curr: Coord | null = end;
        while (curr) {
          path.unshift(curr);
          curr = prev[curr[0]][curr[1]];
        }
        return path;
      }

      for (const [dr, dc] of dirs) {
        const nr = r + dr,
          nc = c + dc;
        if (!this.inBounds(nr, nc)) continue;
        if (visited[nr][nc]) continue;
        if (this.maze[nr][nc].includes("wall")) continue;

        visited[nr][nc] = true;
        prev[nr][nc] = [r, c];
        queue.push([nr, nc]);
      }
    }

    return [];
  }

  shortestPathToKey(currentPosition?: Coord): Coord[] {
    return this.shortestPath(
      currentPosition ? "hero" : "entrance",
      "key",
      currentPosition
    );
  }

  shortestPathToExit(currentPosition?: Coord): Coord[] {
    return this.shortestPath(
      currentPosition ? "hero" : "entrance",
      "exit",
      currentPosition
    );
  }

  getDistance(
    fromTag: PositionTag,
    toTag: PositionTag,
    currentPosition?: Coord
  ): number {
    const path = this.shortestPath(fromTag, toTag, currentPosition);
    return path.length ? path.length - 1 : Infinity;
  }

  getData(): MazeData {
    return {
      maze: this.maze,
      width: this.width,
      height: this.height,
      cols: this.cols,
      rows: this.rows,
      totalSteps: this.totalSteps,
    };
  }

  toJSON(): MazeData {
    return this.getData();
  }
}

