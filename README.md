# @vimazing/vim-maze

![VIMazing maze demo](./vim-maze.gif)

Lightweight, typed **React hooks** and utilities for building interactive maze games with VIM-inspired controls.

Part of the [VIMazing](https://vimazing.com) project - [GitHub](https://github.com/andrepadez/vimazing-vimaze).

---

## Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Unified Architecture](#unified-architecture)
- [Example App](#example-app)
- [Documentation](#documentation)
- [Build & Release](#build--release)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- **Unified API** – Single entry point `useGame()` for complete game setup with composition hooks for granular control
- **Fully Typed** – Comprehensive TypeScript support with organized, module-specific type definitions
- **VIM-style Navigation** – Full `hjkl` motion support with counts, anchors (`^`, `$`, `g`, `G`), and repeat (`.`)
- **Modular Hooks** – Independent, reusable hooks: `useBoard`, `useCursor`, `useScore`, `useGameStatus`
- **Scoring System** – Built-in timer, efficiency tracking, keystroke logging, and optimal path calculation
- **Platform Integration** – Optional platform hook for analytics, custom bindings, and platform-specific logic
- **Tree-shakeable Exports** – Import only what you need to keep bundles lean
- **CSS Included** – Pre-styled maze rendering with optional coordinate display

---

## Installation

Using **npm**:

```bash
npm install @vimazing/vim-maze
```

Or with **bun**:

```bash
bun add @vimazing/vim-maze
```

---

## Quick Start

### Minimal Setup

```tsx
import { useGame } from "@vimazing/vim-maze";
import "@vimazing/vim-maze/game.css";

function MazeGame() {
  const gameManager = useGame({ cols: 32, rows: 24 });
  const { containerRef, gameStatus, startGame } = gameManager;

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={startGame}>Start Game</button>
      <p>Status: {gameStatus}</p>
    </div>
  );
}
```

### With Scoring and Full Features

```tsx
import { useGame } from "@vimazing/vim-maze";
import "@vimazing/vim-maze/game.css";

function MazeGame() {
  const gameManager = useGame({ cols: 32, rows: 24 });
  const { containerRef, gameStatus, startGame, scoreManager } = gameManager;
  const { timeValue, efficiency, keystrokes, optimalSteps, finalScore } = scoreManager;

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={startGame}>Start</button>
      
      {(gameStatus === 'started' || gameStatus === 'has-key') && (
        <div>
          <p>Time: {(timeValue / 1000).toFixed(1)}s</p>
          <p>Efficiency: {efficiency}%</p>
          <p>Keystrokes: {keystrokes} / {optimalSteps}</p>
        </div>
      )}

      {gameStatus === 'game-won' && <p>🎉 Final Score: {finalScore}</p>}
    </div>
  );
}
```

> **Note:** You must manually import the CSS file. The package exports styles but does not auto-import them, giving you control over when and how styles are loaded.

### Default Controls

| Key | Action |
| --- | --- |
| `Space` | Start game / Restart |
| `h` / `j` / `k` / `l` | Move left / down / up / right |
| `^` | Move to row start |
| `$` | Move to row end |
| `g` | Move to maze top |
| `G` | Move to maze bottom |
| `.` | Repeat last motion |
| `<count><motion>` | Move with count (e.g., `5j` = down 5) |
| `q` | Quit game |

---

## API Overview

### Main Entry Point: `useGame()`

Initialize a complete game with a single call:

```tsx
const gameManager = useGame(
  { cols: 32, rows: 24 },  // GameOptions
  platformHook             // Optional: function for platform integration
);
```

**Returns: `GameManager`**
- `containerRef` – DOM ref for maze rendering
- `gameStatus` – Current game state
- `startGame()` / `togglePause()` / `quitGame()` – Game lifecycle
- `cursor` – Player movement manager
- `hero` – Player position and interactions
- `scoreManager` – Scoring metrics
- `renderer` – Hero rendering manager
- `keyLog` – Keystroke history

### Core Hooks

| Hook | Purpose |
| --- | --- |
| `useBoard(cols, rows)` | Generates maze, manages board data, handles DOM rendering |
| `useCursor(board, gameStatus)` | Input handling, vim motion processing, movement commands |
| `useScore({ board, hero, gameStatusManager, keyManager })` | Timer, efficiency, keystroke tracking, score calculation |
| `useGameStatus()` | Game state machine (waiting → started → has-key → game-won) |

### Utility Functions & Classes

```ts
import { MazeGenerator, MazeRenderer } from "@vimazing/vim-maze";

// Procedural maze generation
const generator = new MazeGenerator(32, 24);
generator.placeKey();
const maze = generator.maze;

// DOM rendering for mazes
const renderer = new MazeRenderer(generator.getData(), true);
renderer.display(containerElement);
```

### Types

All types are organized by module:

```ts
import type {
  GameManager,
  GameStatus,
  GameOptions,
  Coord,
  CursorManager,
  HeroManager,
  ScoreManager,
  BoardManager,
} from "@vimazing/vim-maze";

// Or import directly from module types:
import type { CursorManager } from "@vimazing/vim-maze/useCursor";
import type { BoardManager } from "@vimazing/vim-maze/useBoard";
```

---

## Unified Architecture

The library uses a **composable hook architecture** with modular organization:

```
useGame()
  ├─ useBoard()           → maze generation & rendering
  ├─ useCursor()          → vim motions & input handling
  │   ├─ useHero()        → player position & interactions
  │   └─ useVimMotions()  → vim keybinding processor
  ├─ useGameStatus()      → game lifecycle state
  └─ useScore()           → timing & scoring metrics
```

### Type Organization

- **`useBoard/types.ts`** – Coord, MazeCell, MazeData, BoardManager
- **`useCursor/types.ts`** – CursorManager, HeroManager, CursorMode, VimMotionSystem
- **`useGameStatus/types.ts`** – GameStatus, GameStatusManager
- **`useScore/types.ts`** – ScoreManager, TimerManager
- **`types.ts`** – Re-exports all + useGame-specific types (GameOptions, GameManager, KeyLogEntry)

Each module's `types.ts` keeps types colocated with their logic, making the architecture easy to understand and extend.

### Platform Integration

Integrate with your platform using an optional platform hook:

```tsx
function platformHook(gameManager: GameManager) {
  // Track analytics
  console.log('Game initialized');

  // Add custom key handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'p') gameManager.togglePause();
  });

  // Monitor game state
  const interval = setInterval(() => {
    if (gameManager.gameStatus === 'game-won') {
      console.log('Victory!', gameManager.scoreManager.finalScore);
      clearInterval(interval);
    }
  }, 100);
}

const gameManager = useGame({ cols: 32, rows: 24 }, platformHook);
```

---

## Example App

A complete demo application lives under `example/` showcasing the full API:

```bash
cd example
bun install
bun run dev
```

Open `http://localhost:5173` to play the game with scoring, efficiency tracking, and status display.

During local development, the Vite config aliases `@vimazing/vim-maze` to source files for hot reloading. When publishing, run the build first so TypeScript declarations are generated.

---

## Documentation

For comprehensive documentation of all hooks, types, and patterns, see **[UNIFIED_API.md](./UNIFIED_API.md)**.

Key sections:
- Architecture Overview & Core Composition
- Complete Type System Reference
- Detailed Hook Documentation
- Implementation Patterns & Examples
- Integration Guide for New Games

---

## Build & Release

Build the distributable bundle and type declarations:

```bash
bun run build
```

This writes JavaScript, type definitions, and styles to `dist/`. The `prepublishOnly` hook runs this automatically before publishing.

To publish a new version:

```bash
npm version patch  # or minor / major
npm publish
```

---

## License

MIT © [André Padez](https://github.com/andrepadez)

---

## Acknowledgements

Inspired by [The Art of Web – Random Maze Generator](https://www.the-art-of-web.com/javascript/maze-game/) and extended for the VIMazing platform.
