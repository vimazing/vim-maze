import type { GameStatus, KeyLogEntry } from "../types";
import { useEffect, useRef, useState } from "react";

export type CursorBindingContext = {
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  moveToTop: () => void;
  moveToBottom: () => void;
  repeatLastMotion: () => void;
  resetCount: () => void;
  getCount: () => string;
  setCount: (digit: string) => void;
  setLastKey: (key: string) => void;
  getLastKey: () => string;
};

type UseKeyBindingsParams = {
  cursor: CursorBindingContext;
  gameStatus: GameStatus;
};

const RELEVANT_KEYS = new Set([
  "h", "H", "j", "J", "k", "K", "l", "L", ".", "^", "$", "g", "G", "0",
  "1", "2", "3", "4", "5", "6", "7", "8", "9"
]);

export const useKeyBindings = ({ cursor, gameStatus }: UseKeyBindingsParams) => {

  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const logRef = useRef<KeyLogEntry[]>([]);

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
    const handler = (e: KeyboardEvent) => {
      if (["waiting", "game-over", "game-won"].includes(gameStatus)) return;

      // "0" behaves like Vim: beginning of line
      if (e.key === "0" && cursor.getCount() === "") {
        recordKey("0");
        cursor.resetCount();
        cursor.moveToStart();
        return;
      }

      const isDigit = e.key >= "0" && e.key <= "9";
      if (isDigit) {
        if (e.key === "0" && cursor.getCount() === "") return;
        recordKey(e.key);
        cursor.setCount(e.key);
        return;
      }

      if (e.key === ".") {
        recordKey(".");
        cursor.repeatLastMotion();
        return;
      }

      if (e.key === "^" || e.key === "$") {
        recordKey(e.key);
        cursor.resetCount();
        if (e.key === "^") {
          cursor.moveToStart();
        } else {
          cursor.moveToEnd();
        }
        return;
      }

      if (e.key === "g" || e.key === "G") {
        if (e.key === "g") {
          if (cursor.getLastKey() === "g") {
            recordKey(e.key);
            cursor.resetCount();
            cursor.setLastKey("");
            cursor.moveToTop();
            return;
          } else {
            recordKey(e.key);
            cursor.setLastKey("g");
            return;
          }
        } else {
          recordKey(e.key);
          cursor.resetCount();
          cursor.setLastKey("");
          cursor.moveToBottom();
          return;
        }
      }

      if (!RELEVANT_KEYS.has(e.key)) return;

      recordKey(e.key);

      const count = Math.max(1, parseInt(cursor.getCount() || "1", 10));
      cursor.resetCount();

      switch (e.key) {
        case "h":
        case "H": cursor.moveLeft(count); break;
        case "j":
        case "J": cursor.moveDown(count); break;
        case "k":
        case "K": cursor.moveUp(count); break;
        case "l":
        case "L": cursor.moveRight(count); break;
        default: return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cursor, gameStatus]);

  return {
    keyLog,
    clearLog,
    getLog: () => logRef.current,
  };
};


