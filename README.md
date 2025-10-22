# @vimazing/vim-maze

[![npm version](https://img.shields.io/npm/v/@vimazing/vim-maze.svg)](https://www.npmjs.com/package/@vimazing/vim-maze)
[![npm downloads](https://img.shields.io/npm/dm/@vimazing/vim-maze.svg)](https://www.npmjs.com/package/@vimazing/vim-maze)
[![license](https://img.shields.io/npm/l/@vimazing/vim-maze.svg)](https://github.com/vimazing/vim-maze/blob/main/LICENSE)

![VIMazing maze demo](./vim-maze.gif)

Lightweight, typed **React hooks** for building interactive maze games with **VIM-style navigation**.

Part of the [VIMazing](https://vimazing.com) project.

---

## Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Game States](#game-states)
- [VIM Controls](#vim-controls)
- [Scoring System](#scoring-system)
- [Game Over Conditions](#game-over-conditions)
- [Configuration](#configuration)
- [Example App](#example-app)
- [License](#license)

---

## Features

- 🎮 **VIM navigation** – Full hjkl movement with counts, anchors, and repeat
- 🗺️ **Procedural mazes** – Algorithm-generated mazes with guaranteed solvability
- ⌨️ **Complete VIM motions** – hjkl, counts (5j), anchors (^/$), gg/G, repeat (.)
- 🎯 **Maze navigation** – Find key, reach exit, with wall collision detection
- ⏱️ **Time-based gameplay** – Configurable time limits with game-over on timeout
- 📊 **Simple scoring** – Time + keystrokes with maze size multiplier
- 🎨 **Tokyo Night theme** – Beautiful dark theme with clear visual feedback
- 📦 **Full TypeScript** – Complete type safety with generated declarations
- 🪝 **Composable architecture** – Clean separation: board, cursor, score, game status
- 🌐 **Platform hooks** – Optional integration for analytics and custom bindings

---

## Installation

```bash
npm install @vimazing/vim-maze
```

Or with bun:

```bash
bun add @vimazing/vim-maze
```

---

## Quick Start

```tsx
import { useGame } from "@vimazing/vim-maze";
import "@vimazing/vim-maze/game.css";

export function MazeGame() {
  const gameManager = useGame({ 
    rows: 24, 
    cols: 32,
    timeLimit: 600  // 10 minutes
  });
  
  const { containerRef, gameStatus, scoreManager, startGame } = gameManager;

  return (
    <div>
      <h1>VIMazing Maze</h1>
      
      {gameStatus === 'waiting' && (
        <button onClick={startGame}>Start Game</button>
      )}
      
      <div ref={containerRef} />
      
      {gameStatus === 'game-won' && (
        <div>
          <h2>You Won!</h2>
          <p>Score: {scoreManager.finalScore} / 1000</p>
          <p>Time: {Math.floor(scoreManager.timeValue / 1000)}s</p>
        </div>
      )}
    </div>
  );
}
```

> **Note:** You must manually import `game.css` for styling.

---

## API Reference

### `useGame(options, platformHook?)`

Main orchestrator hook that composes all game functionality.

#### Options

```typescript
type GameOptions = {
  rows: number;         // Maze height in cells
  cols: number;         // Maze width in cells  
  timeLimit?: number;   // In seconds, default: 600 (10 min)
};
```

**Examples:**
```typescript
// Small maze
useGame({ rows: 16, cols: 24 })

// Large maze with time pressure
useGame({ 
  rows: 32, 
  cols: 48,
  timeLimit: 300  // 5 minutes
})

// Custom configuration
useGame({ 
  rows: 24,
  cols: 32,
  timeLimit: 480  // 8 minutes
})
```

#### Returns: GameManager

```typescript
type GameManager = {
  // DOM Reference
  containerRef: RefObject<HTMLDivElement | null>;
  
  // Rendering
  renderBoard: () => void;
  
  // Game Status
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
  
  // Cursor (Hero)
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderManager;
  
  // Scoring
  scoreManager: ScoreManager;
  
  // Input Tracking
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};
```

#### CursorManager

```typescript
type CursorManager = {
  position: () => Coord;              // Current { row, col }
  mode: () => CursorMode;             // 'normal' | 'insert'
  move: (dCols: number, dRows: number, count: number) => void;
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;            // ^ or 0
  moveToEnd: () => void;              // $
  moveToTop: () => void;              // gg
  moveToBottom: () => void;           // G
  repeatLastMotion: () => void;       // .
  resetCount: () => void;
  getCount: () => string;
  hasCount: () => boolean;
  hero?: HeroManager;
};
```

#### HeroManager

```typescript
type HeroManager = {
  heroPos: Coord | null;              // Hero location
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
};
```

#### ScoreManager

```typescript
type ScoreManager = {
  timeValue: number;                  // Milliseconds elapsed
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  distToKey: number;                  // Distance to key
  distToExit: number;                 // Distance to exit
  keystrokes: number;                 // Total keys pressed
  finalScore: number | null;          // 0-1000, null until game-won
};
```

---

## Game States

The game follows a strict state machine:

```
waiting → started → has-key → game-won
              ↓
           game-over
              
All states → [quit] → waiting
started/has-key ↔ paused
```

### State Descriptions

| State | Description | Triggers |
|-------|-------------|----------|
| `waiting` | Initial state, awaiting start | Default on load |
| `started` | Game in progress, searching for key | Press Space or call `startGame()` |
| `has-key` | Key obtained, heading to exit | Hero reaches key cell |
| `paused` | Game temporarily paused | Press P or call `togglePause()` |
| `game-over` | Failed to complete in time | Time limit exceeded |
| `game-won` | Successfully reached exit with key | Hero reaches exit after getting key |

---

## VIM Controls

### Movement

| Key | Action | Example |
|-----|--------|---------|
| `h` | Move left | `h` moves 1 left |
| `j` | Move down | `j` moves 1 down |
| `k` | Move up | `k` moves 1 up |
| `l` | Move right | `l` moves 1 right |
| `<count><motion>` | Move with count | `5j` moves 5 down, `10l` moves 10 right |
| `0` or `^` | Jump to row start | Move to leftmost walkable cell |
| `$` | Jump to row end | Move to rightmost walkable cell |
| `gg` | Jump to maze top | Move to topmost walkable row |
| `G` | Jump to maze bottom | Move to bottommost walkable row |
| `.` | Repeat last motion | Repeats with same count |

### Game Control

| Key | Action | Notes |
|-----|--------|-------|
| `q` | Quit game | Return to waiting state |
| `p` | Pause/unpause | Toggle pause state |
| `Space` | Start new game | Only in waiting/game-over state |

### Movement Rules

- **Wall collision**: Movement stops at walls, no wrapping
- **Counted moves**: Multi-step movements (e.g., `5j`) stop at first wall
- **Key pickup**: Automatic when hero reaches key cell
- **Exit**: Can only enter after obtaining key

---

## Scoring System

### Formula

```
Base Score = 1000 - (time penalty) - (keystroke penalty)
Size Multiplier = max(1.0, (rows × cols) / 500)
Final Score = min(1000, max(0, round(Base Score × Size Multiplier)))
```

### Penalties

**Time Penalty:** `seconds / 10`
- 10 seconds = -1 point
- 60 seconds = -6 points
- 300 seconds = -30 points

**Keystroke Penalty:** `keystrokes / 2`
- 2 keystrokes = -1 point
- 50 keystrokes = -25 points
- 200 keystrokes = -100 points

### Size Multiplier

Rewards larger, more complex mazes:
- Small maze (16×24 = 384 cells): 1.0x multiplier
- Medium maze (24×32 = 768 cells): 1.54x multiplier
- Large maze (32×48 = 1536 cells): 3.07x multiplier

### Example Scores

**Small Maze (16×24):**
```
60 seconds, 80 keys:
= 1000 - 6 - 40 = 954 × 1.0 = 954 / 1000
```

**Medium Maze (24×32):**
```
120 seconds, 150 keys:
= 1000 - 12 - 75 = 913 × 1.54 = 1000 / 1000 (capped)
```

**Large Maze (32×48):**
```
180 seconds, 200 keys:
= 1000 - 18 - 100 = 882 × 3.07 = 1000 / 1000 (capped)
```

---

## Game Over Conditions

### Time Limit

- **Default:** 600 seconds (10 minutes)
- **Configurable:** Set via `GameOptions.timeLimit`
- **Trigger:** When `timeValue >= timeLimit × 1000`
- **States:** Checked during `started` and `has-key` states

### No Other Limits

Unlike vim-sudoku, vim-maze has no hint system or additional penalties. The only way to lose is running out of time.

---

## Configuration

### Recommended Configurations

**Beginner:**
```typescript
useGame({ 
  rows: 12,
  cols: 16,
  timeLimit: 900  // 15 minutes
})
```

**Standard Small:**
```typescript
useGame({ 
  rows: 16,
  cols: 24,
  timeLimit: 600  // 10 minutes
})
```

**Standard Medium:**
```typescript
useGame({ 
  rows: 24,
  cols: 32,
  timeLimit: 600  // 10 minutes
})
```

**Standard Large:**
```typescript
useGame({ 
  rows: 32,
  cols: 48,
  timeLimit: 600  // 10 minutes
})
```

**Speed Challenge:**
```typescript
useGame({
  rows: 24,
  cols: 32,
  timeLimit: 300  // 5 minutes
})
```

**Marathon:**
```typescript
useGame({
  rows: 48,
  cols: 64,
  timeLimit: 1200  // 20 minutes
})
```

---

## Game Instructions Export

The package exports a structured `gameInfo` object containing complete game documentation:

```typescript
import { gameInfo } from '@vimazing/vim-maze';

// Access structured instructions
console.log(gameInfo.name);           // "VIM Maze"
console.log(gameInfo.controls);       // Navigation, game controls
console.log(gameInfo.rules);          // Movement, game flow, maze elements
console.log(gameInfo.scoring);        // Formula, penalties, size multiplier, examples
console.log(gameInfo.gameOver);       // Time limit condition
console.log(gameInfo.mazeGeneration); // Algorithm, guarantees, placement
console.log(gameInfo.metrics);        // Tracked metrics during gameplay
console.log(gameInfo.objective);      // Win condition
```

**Use cases:**
- Render in-game help screens
- Generate tutorials
- Display control reference
- Show scoring breakdown
- Explain maze mechanics

All data is fully typed with the `GameInfo` type for type safety.

---

## Example App

A demo application lives under `example/` and consumes the package directly.

```bash
cd example
npm install
npm run dev
```

The example shows:
- Maze size configuration
- Live scoreboard (Time, Keystrokes, Distances)
- Game status messages
- Final score display on win
- All vim controls working

---

## Platform Hook

Optional callback for platform integration:

```typescript
function myPlatformHook(gameManager: GameManager) {
  // Track analytics
  console.log('Maze initialized:', gameManager.hero.heroPos);
  
  // Add custom key handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      console.log('Help requested');
    }
  });
  
  // Monitor game events
  const interval = setInterval(() => {
    if (gameManager.gameStatus === 'has-key') {
      console.log('Key obtained!');
    }
    if (gameManager.gameStatus === 'game-won') {
      console.log('Victory!', gameManager.scoreManager.finalScore);
      clearInterval(interval);
    }
  }, 100);
}

const gameManager = useGame(
  { rows: 24, cols: 32 }, 
  myPlatformHook
);
```

---

## Maze Generation

Mazes are procedurally generated using a depth-first search algorithm with guaranteed solvability:

- **Entrance:** Always top-left area
- **Key:** Placed in maze requiring navigation
- **Exit:** Always bottom-right area
- **Paths:** Guaranteed path from entrance → key → exit
- **Walls:** Procedurally generated with no isolated areas

---

## License

MIT © [André Padez](https://github.com/andrepadez)

---

## Acknowledgements

Inspired by [The Art of Web – Random Maze Generator](https://www.the-art-of-web.com/javascript/maze-game/) and extended for the VIMazing platform.
