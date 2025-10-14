import { useScore } from "./useScore";
import { useGame } from "./useGame";
export type UseGameType = ReturnType<typeof useGame>;
export type UseScoreType = ReturnType<typeof useScore>;

export type GamePhase = "idle" | "playing";
export type PlayStatus = "started" | "hasKey" | "game-over" | "game-won";
export type GameStatus = "waiting" | "started" | "hasKey" | "game-over" | "game-won";

export const isPlaying = (status: GameStatus): status is PlayStatus =>
  status === "started" || status === "hasKey" || status === "game-over" || status === "game-won";

export const getGamePhase = (status: GameStatus): GamePhase =>
  status === "waiting" ? "idle" : "playing";

export type KeyLogEntry = { key: string; timestamp: number };
export type KeyLogProvider = { keyLog: KeyLogEntry[] };

export type GameScoreContext = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  stopGame: () => void;

  // Optional — only Maze-type games provide these
  mazeManager?: {
    mazeInstanceRef?: { current?: any };
  };
  playerManager?: {
    playerPos?: { r: number; c: number } | null;
  };
};

export type UseScoreParams = {
  gameContext: GameScoreContext;
  keyManager?: KeyLogProvider;
};

export type PositionTag = "entrance" | "exit" | "key" | "hero";

export type Coord = [number, number];

export type CellTag = "wall" | "door" | PositionTag;

export type MazeCell = CellTag[];

export interface MazeData {
  maze: MazeCell[][];
  width: number;
  height: number;
  cols: number;
  rows: number;
  totalSteps: number;
}

