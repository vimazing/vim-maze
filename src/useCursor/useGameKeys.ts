import type { GameStatusManager, KeyLogEntry, Cursor } from "../types";
import { useEffect, useRef, useState } from "react";


type UseGameKeysParams = {
  cursor: Cursor;
  gameStatusManager: GameStatusManager;
};

const RELEVANT_KEYS = new Set([
  "h", "H", "j", "J", "k", "K", "l", "L", ".", "^", "$", "g", "G", "0",
  "1", "2", "3", "4", "5", "6", "7", "8", "9"
]);

export const useGameKeys = (props: UseGameKeysParams) => {
  const { cursor, gameStatusManager } = props;
  const { gameStatus } = gameStatusManager;
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const logRef = useRef<KeyLogEntry[]>([]);
  const { hero } = cursor;

  const clearKeyLog = () => {
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

       if (ev.key === "0" && !cursor.hasCount()) {
         recordKey("0");
         cursor.resetCount();
         cursor.moveToStart();
         return;
       }

      const isDigit = ev.key >= "0" && ev.key <= "9";
      if (isDigit) {
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

      switch (ev.key) {
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
  }, [gameStatus, cursor, hero]);

  return {
    keyLog,
    clearKeyLog,
    getKeyLog: () => logRef.current,
  };
};


