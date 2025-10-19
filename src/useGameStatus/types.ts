export type GameStatus = 'waiting' | 'started' | 'has-key' | 'paused' | 'game-over' | 'game-won';

export type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
};
