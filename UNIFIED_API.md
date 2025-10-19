# Unified API Design

## Overview

The VIMazing game engine provides a uniform external API for building grid-based games. The architecture is designed around three core hooks that can be composed to create various game types (maze, puzzle, strategy, etc.).

## Core Philosophy

**Single Entry Point**: Platforms consume games by calling `useGame(gameOptions?, platformHook?)` and receive everything needed to run the game.

**Composable Architecture**: Three fundamental hooks that work together:
- `useBoard` - Manages the game board/level/field
- `useCursor` - Manages player/actor/selector movement
- `useGame` - Orchestrates everything together

## Primary API

### `useGame(gameOptions?, platformHook?)`

The main entry point for consuming any game.

```tsx
const gameManager = useGame(gameOptions?, platformHook?)
```

**Parameters:**
- `gameOptions?: GameOptions` - Game-specific configuration
- `platformHook?: (gameManager: GameManager) => void` - Platform-specific integration

**Returns:** `GameManager` - Complete game management interface

## Core Types

### `GameOptions`
```tsx
type GameOptions = {
  rows: number;
  cols: number;
};
```

### `GameManager`
```tsx
type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: Cursor;
} & GameStatusManager & GameKeyManager;
```

### `GameStatus`
```tsx
type GameStatus = 'waiting' | 'started' | 'has-key' | 'paused' | 'game-over' | 'game-won'
```

### `Cursor`
```tsx
type Cursor = {
  position: () => Coord;
  mode: () => CursorMode;
  move: (dCols: number, dRows: number, count: number) => void;
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
}
```

### `CursorMode`
```tsx
type CursorMode = 'normal' | 'insert' | 'replace' | 'visual' | 'visual-line';
```

### `Coord`
```tsx
type Coord = { row: number, col: number };
```

### `GameStatusManager`
```tsx
type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
};
```

### `GameKeyManager`
```tsx
type GameKeyManager = {
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};
```

### `CursorBindingContext`
```tsx
type CursorBindingContext = {
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
```

### `UseKeyBindingsParams`
```tsx
type UseKeyBindingsParams = {
  cursor: CursorBindingContext;
  gameStatus: GameStatus;
};
```

## Core Hooks Architecture

### `useBoard(cols, rows) -> BoardManager`
Manages the game board/level structure.

**Returns:**
- `containerRef` - DOM container reference
- `mazeRef` - Board data reference
- `mazeInstanceRef` - Board generator instance
- `rendererRef` - Renderer instance
- `renderBoard()` - Initialize/render the board

### `useCursor(board: BoardManager, gameStatusManager: GameStatusManager) -> Cursor & { keyManager: GameKeyManager }`
Manages player/actor movement and state, now includes integrated key management.

**Returns:**
- Position tracking
- Mode management
- Movement methods (with count support)
- Directional movement helpers
- Integrated `keyManager` for key logging and input handling

### `useGameKeys({ cursor, gameStatusManager }) -> GameKeyManager`
Internal hook that handles keyboard input and maps keys to cursor actions.

**Parameters:**
- `cursor` - Cursor binding context with movement methods
- `gameStatusManager` - Game status manager for state checking

**Returns:**
- `keyLog` - Array of key press entries with timestamps
- `clearKeyLog()` - Clear the key log
- `getKeyLog()` - Get current key log

**Note:** This is now integrated within `useCursor` and not exposed as a separate hook.

### `useGameStatus() -> GameStatusManager`
Manages game state and lifecycle.

**Returns:**
- `gameStatus` - Current game state
- `setGameStatus` - State setter
- `startGame()` - Start the game
- `togglePause(pause?)` - Toggle or set pause state
- `quitGame()` - Quit/reset the game

### `useGame(options: GameOptions, platformHook?) -> GameManager`
Orchestrates board, cursor, and game status, provides game lifecycle management.

**Returns:**
- Complete game management interface
- Game state control
- Platform integration point

## Platform Integration

### Platform Hook Pattern
```tsx
const platformHook = (gameManager: GameManager) => {
  // Platform-specific logic
  // - Custom key bindings
  // - Analytics tracking
  // - Save/load functionality
  // - Platform UI integration
};

const gameManager = useGame(gameOptions, platformHook);
```

## Game Implementation Pattern

### For New Game Types
1. **Extend `GameOptions`** with game-specific configuration
2. **Extend `GameStatus`** with game-specific states
3. **Implement game logic** in core hooks
4. **Maintain same external API** - `useGame(options, platformHook)`

### Example: Maze Game
```tsx
// Platform consumes the game
const mazeGame = useGame({ rows: 20, cols: 16 }, platformHook);

// Everything needed is provided
return (
  <div ref={mazeGame.containerRef}>
    {/* Game renders here */}
    <button onClick={mazeGame.startGame}>Start</button>
    <div>Status: {mazeGame.gameStatus}</div>
  </div>
);
```

## Design Principles

### 1. **Uniform Interface**
All games expose the same `GameManager` interface regardless of internal complexity.

### 2. **Composable Architecture**
Core hooks can be mixed and matched for different game types.

### 3. **Platform Agnostic**
Games work across different platforms without modification.

### 4. **Type Safety**
Full TypeScript support with generated declarations.

### 5. **Tree-Shakeable**
Only used functionality is included in the final bundle.

## Migration Path

### From Old Architecture
- **Old**: Multiple specialized managers (`useMaze`, `usePlayer`, `useScore`, etc.)
- **New**: Three core hooks with unified interfaces

### Benefits
- **Simpler consumption**: Single `useGame` call
- **Consistent API**: Same pattern across all games
- **Better maintainability**: Clear separation of concerns
- **Platform flexibility**: Easy integration points

## Future Extensibility

The unified API is designed to accommodate:
- Different game types (puzzles, strategy, arcade)
- Various input methods (touch, gamepad, voice)
- Multiple rendering backends (Canvas, WebGL, DOM)
- Cross-platform features (save states, leaderboards, multiplayer)

## Implementation Status

- ✅ **Type definitions** - Complete
- ✅ **Core architecture** - Defined
- ✅ **useGameStatus implementation** - Complete
- ✅ **useGameKeys implementation** - Complete (integrated into useCursor)
- ✅ **useCursor implementation** - Complete (with integrated key management)
- ✅ **useBoard implementation** - Complete
- ✅ **useGame implementation** - Complete (with flattened GameManager interface)
- ✅ **React 19 optimization** - No useCallback/useMemo usage
- ✅ **API refactoring** - Complete (key management moved into cursor module)
- ⏳ **Platform integration** - Pending
- ⏳ **Advanced features** - Pending (scoring, animations, etc.)

## Usage Examples

### Basic Game Integration
```tsx
import { useGame } from "@vimazing/vim-maze";

function App() {
  const gameManager = useGame({ cols: 32, rows: 24 });
  const { containerRef, gameStatus, keyManager } = gameManager;

  return (
    <div className="relative mx-auto my-4 w-fit">
      <div ref={containerRef} className="relative" />
    </div>
  );
}
```

### Platform Integration Pattern
```tsx
import { useGame } from "@vimazing/vim-maze";
import { useKeyBindings } from "./useKeyBindings";

function App() {
  const gameManager = useGame({ cols: 32, rows: 24 }, useKeyBindings);
  const { containerRef, gameStatus, cursor, keyManager } = gameManager;

  return (
    <div className="relative mx-auto my-4 w-fit">
      <div ref={containerRef} className="relative" />
    </div>
  );
}
```

### Platform Hook Implementation
```tsx
export const useKeyBindings = (gameManager: GameManager) => {
  const { gameStatus, startGame, quitGame, cursor, clearKeyLog } = gameManager;
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Start game with 'i'
      if (e.key === "i" || e.key === "I") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearKeyLog();
          startGame();
          return;
        }
      }

      // Movement keys
      if (gameStatus === "started") {
        switch (e.key) {
          case "h": cursor.moveLeft(); break;
          case "j": cursor.moveDown(); break;
          case "k": cursor.moveUp(); break;
          case "l": cursor.moveRight(); break;
        }
      }

      // Quit with 'q'
      if (e.key === "q" || e.key === "Q") {
        quitGame();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus, startGame, quitGame, cursor, clearKeyLog]);
};
```

### Internal Key Bindings Integration
```tsx
// Inside useGame - simplified integration
const { keyManager, ...cursor } = useCursor(board, gameStatusManager);

const gameManager = {
  containerRef,
  renderBoard,
  cursor,
  ...keyManager,
  ...gameStatusManager,
};
```

### Responsive Game Sizing
```tsx
function App() {
  const isMobile = useIsMobile();
  const cols = isMobile ? 12 : 32;
  const rows = isMobile ? 8 : 24;

  const gameManager = useGame({ cols, rows }, useKeyBindings);
  const { containerRef, keyManager } = gameManager;

  return (
    <div className="relative mx-auto my-4 w-fit">
      <div ref={containerRef} className="relative" />
    </div>
  );
}
```

## Platform Integration Examples

### Key Binding Platform Hook
Platforms can provide custom key bindings by passing a platform hook:

```tsx
const platformHook = (gameManager: GameManager) => {
  // Custom VIM-style bindings
  const { gameStatus, cursor, startGame, quitGame } = gameManager;
  
  // Implementation details...
};

const gameManager = useGame(gameOptions, platformHook);
```

### Analytics Platform Hook
```tsx
const analyticsHook = (gameManager: GameManager) => {
  const { gameStatus } = gameManager;
  
  useEffect(() => {
    analytics.track('game_status_change', { status: gameStatus });
  }, [gameStatus]);
};
```

### Save/Load Platform Hook
```tsx
const saveLoadHook = (gameManager: GameManager) => {
  const { cursor, gameStatus } = gameManager;
  
  const saveGame = () => {
    localStorage.setItem('gameState', JSON.stringify({
      position: cursor.position(),
      status: gameStatus
    }));
  };
  
  // Auto-save on status changes
  useEffect(() => {
    saveGame();
  }, [gameStatus]);
};
```

## Expected Platform Hook Interface

Platform hooks receive the complete `GameManager` interface:

```tsx
type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: Cursor;
} & GameStatusManager & GameKeyManager;
```

This allows platforms to:
- Add custom input handling
- Implement analytics tracking
- Add save/load functionality
- Integrate with platform-specific UI
- Extend game behavior without modifying core logic
- Access key logging functionality via `clearKeyLog()` and `getKeyLog()`