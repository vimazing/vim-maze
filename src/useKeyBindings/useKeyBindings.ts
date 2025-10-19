import type { GameStatus, KeyLogEntry, UseHeroType, Cursor } from "../types";
import { useEffect, useRef, useState } from "react";


type UseKeyBindingsParams = {
  cursor: Cursor;
  hero: UseHeroType;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
};

const RELEVANT_KEYS = new Set([
  "h", "H", "j", "J", "k", "K", "l", "L", ".", "^", "$", "g", "G", "0",
  "1", "2", "3", "4", "5", "6", "7", "8", "9"
]);

export const useKeyBindings = ({ cursor, gameStatus, setGameStatus }: UseKeyBindingsParams) => {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const logRef = useRef<KeyLogEntry[]>([]);
  const { hero } = cursor;

  const clearLog = () => {
    logRef.current = [];
    setKeyLog([]);
  };

  const recordKey = (key: string) => {
    const entry = { key, timestamp: performance.now() };
    logRef.current.push(entry);
    setKeyLog([...logRef.current]);
  };

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (["waiting", "game-over", "game-won"].includes(gameStatus)) return;

      // "0" behaves like Vim: beginning of line
      if (ev.key === "0" && cursor.getCount() === "") {
        recordKey("0");
        cursor.resetCount();
        cursor.moveToStart();
        return;
      }

      const isDigit = ev.key >= "0" && ev.key <= "9";
      if (isDigit) {
        if (ev.key === "0" && cursor.getCount() === "") return;
        recordKey(ev.key);
        cursor.setCount(ev.key);
        return;
      }

      if (ev.key === ".") {
        recordKey(".");
        cursor.repeatLastMotion();
        return;
      }

      if (ev.key === "^" || ev.key === "$") {
        recordKey(ev.key);
        cursor.resetCount();
        if (ev.key === "^") {
          cursor.moveToStart();
        } else {
          cursor.moveToEnd();
        }
        return;
      }

      if (ev.key === "g" || ev.key === "G") {
        if (ev.key === "g") {
          if (cursor.getLastKey() === "g") {
            recordKey(ev.key);
            cursor.resetCount();
            cursor.setLastKey("");
            cursor.moveToTop();
            return;
          } else {
            recordKey(ev.key);
            cursor.setLastKey("g");
            return;
          }
        } else {
          recordKey(ev.key);
          cursor.resetCount();
          cursor.setLastKey("");
          cursor.moveToBottom();
          return;
        }
      }

      if (!RELEVANT_KEYS.has(ev.key)) return;

      recordKey(ev.key);

      const count = Math.max(1, parseInt(cursor.getCount() || "1", 10));
      cursor.resetCount();

      if (!hero) return;
      switch (ev.key) {
        case "h":
        case "H": hero.moveHero(0, -1, count, gameStatus, setGameStatus); break;
        case "j":
        case "J": hero.moveHero(1, 0, count, gameStatus, setGameStatus); break;
        case "k":
        case "K": hero.moveHero(-1, 0, count, gameStatus, setGameStatus); break;
        case "l":
        case "L": hero.moveHero(0, 1, count, gameStatus, setGameStatus); break;
        default: return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus]);

  return {
    keyLog,
    clearLog,
    getLog: () => logRef.current,
  };
};


