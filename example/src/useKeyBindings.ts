import { useEffect } from "react";
import type { UseGameType } from "@vimazing/vim-maze";

export const useKeyBindings = (gameManager: UseGameType) => {
  const { gameStatus, startGame, stopGame, clearLog } = gameManager;
  console.log('gameStatus', gameStatus);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // start game
      if (e.key === "i" || e.key === "I") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearLog();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            stopGame();
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
        stopGame();
        return;
      }

      // quit
      if (e.key === "q" || e.key === "Q") {
        stopGame();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus]);
};

