import { useEffect } from "react";
import type { GameManager } from "../../src";

export const useKeyBindings = (gameManager: GameManager) => {
  const { gameStatus, startGame, quitGame, keyManager } = gameManager;
  const { clearLog } = keyManager;

  console.log('gameStatus', gameStatus);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // start game
      if (e.key === "i" || e.key === "I") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearLog();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            quitGame();
            setTimeout(() => startGame(), 0);
          } else {
            startGame();
          }
          return;
        }
      }

      // ignore other keys while waiting
      if (gameStatus === "waiting") return;

      // cancel count or stop game
      if (e.key === "Escape") {
        quitGame();
        return;
      }

      // quit
      if (e.key === "q" || e.key === "Q") {
        quitGame();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus]);
};

