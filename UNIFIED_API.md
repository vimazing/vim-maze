# Unified API Documentation

Complete reference for the vim-maze game engine architecture. This document describes the current implementation in `src/` and serves as a blueprint for porting games and creating new games.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Type System](#type-system)
4. [Core Hooks](#core-hooks)
5. [Supporting Hooks](#supporting-hooks)
6. [Implementation Examples](#implementation-examples)
7. [Integration Points](#integration-points)

---

## Architecture Overview

The vim-maze engine follows a composable hook architecture with a single entry point: `useGame(options?, platformHook?)`.

### Design Principles

- **Single Entry Point**: All games use `useGame()` to initialize
- **Composable Hooks**: Three core hooks compose to create the complete system
- **Type-Safe**: Full TypeScript support throughout
- **Platform Agnostic**: Works across any platform without modification
- **Platform Optional**: Optional platform hook for analytics and custom bindings

### Core Composition

```tsx
// Inside useGame:
const boardManager = useBoard(cols, rows);
const { cursor, keyManager } = useCursor(boardManager, gameStatusManager);
const scoreManager = useScore({ board, hero, gameStatusManager, keyManager });
const heroRenderer = useHeroRender({ gameStatus, board, hero });

// Returns unified GameManager interface
return {
  containerRef,
  renderBoard,
  cursor,
  hero,
  renderer,
  scoreManager,
  gameStatus,
  startGame,
  togglePause,
  quitGame,
  keyLog,
  ...
};
```

---

## File Structure

```
src/
├── index.ts                    # Main package exports
├── types.ts                    # All shared TypeScript types
├── useGame.ts                  # Main orchestrator hook
├── useGameStatus/
│   └── useGameStatus.ts        # Game state management
├── useBoard/
│   ├── index.ts                # Public exports
│   ├── useBoard.ts             # Board/maze management hook
│   ├── MazeGenerator.ts        # Maze generation algorithm
│   ├── MazeRenderer.ts         # DOM rendering for maze
│   └── useMazeNavigation.ts    # Pathfinding and validation
├── useCursor/
│   ├── index.ts                # Public exports
│   ├── useCursor.ts            # Main cursor/input hook
│   ├── useHero.ts              # Player position and movement
│   ├── useHeroRender.ts        # Hero rendering on DOM
│   ├── useVimMotions.ts        # Vim keybinding system
│   ├── useGameKeys.ts          # Game-specific key handling
│   └── useAnimation.ts         # Multi-step movement animation
└── useScore/
    ├── index.ts                # Public exports
    ├── useScore.ts             # Main scoring hook
    ├── useScorePaths.ts        # Distance calculations
    ├── useScoreTime.ts         # Timer integration
    └── useTimer.ts             # Timer state management
```

---

## Type System

All types are centralized in `src/types.ts` for consistency and maintainability.

### Main Types

#### GameManager
The primary interface returned by `useGame()`.

```typescript
type GameManager = {
  // DOM reference for rendering
  containerRef: RefObject<HTMLDivElement | null>;
  
  // Rendering
  renderBoard: () => void;
  
  // Core managers
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderer;
  scoreManager: ScoreManager;
  
  // Game status
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
  
  // Input tracking
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};
```

#### GameStatus
State machine for game lifecycle.

```typescript
type GameStatus = 
  | 'waiting'      // Initial state, awaiting start
  | 'started'      // Game in progress, before key pickup
  | 'has-key'      // Key obtained, heading to exit
  | 'paused'       // Game paused
  | 'game-over'    // Game lost (efficiency > 150%)
  | 'game-won';    // Game completed
```

#### BoardManager
Manages maze data and rendering.

```typescript
type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  mazeRef: RefObject<MazeCell[][]>;
  mazeInstanceRef: RefObject<MazeGenerator | null>;
  rendererRef: RefObject<MazeRenderer | null>;
  renderBoard: () => void;
};
```

#### CursorManager
Handles player input and vim motion system.

```typescript
type CursorManager = {
  position: () => Coord;
  mode: () => CursorMode;
  move: (dCols: number, dRows: number, count: number) => void;
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;      // Move to row start (^)
  moveToEnd: () => void;         // Move to row end ($)
  moveToTop: () => void;         // Move to maze top (g)
  moveToBottom: () => void;      // Move to maze bottom (G)
  repeatLastMotion: () => void;  // Repeat last motion (.)
  resetCount: () => void;
  getCount: () => string;
  hasCount: () => boolean;
  setCount: (digit: string) => void;
  setLastKey: (key: string) => void;
  getLastKey: () => string;
  hero?: UseHeroType;
};
```

#### HeroManager
Player position and interaction.

```typescript
type HeroManager = {
  position: Coord | null;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
};
```

#### HeroRenderer
DOM rendering for hero.

```typescript
type HeroRenderer = {
  render: () => void;
  updatePosition: (coord: Coord) => void;
  showCoordinates: (show: boolean) => void;
};
```

#### ScoreManager
Scoring system return type.

```typescript
type ScoreManager = {
  timeValue: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  distToKey: number;         // Distance from hero to key
  distToExit: number;        // Distance from hero to exit
  keystrokes: number;        // Total keystrokes made
  optimalSteps: number;      // Optimal path length
  efficiency: number;        // Percentage (keystrokes / optimal * 100)
  finalScore: number | null; // Only set when game-won
};
```

#### Coordinate & Maze Types
Basic data structures.

```typescript
type Coord = { row: number; col: number };

type CellTag = 'wall' | 'door' | 'entrance' | 'exit' | 'key' | 'hero';

type MazeCell = CellTag[];  // Array of tags for a single cell

type MazeData = {
  maze: MazeCell[][];
  width: number;
  height: number;
  cols: number;
  rows: number;
  totalSteps: number;
};

type GameOptions = {
  rows: number;
  cols: number;
};
```

---

## Core Hooks

### useGame()

Main orchestrator hook. Single entry point for all games.

**Purpose**: Composes all sub-hooks into a unified interface and optionally integrates platform-specific functionality.

**Parameters**:
```typescript
useGame(options: GameOptions, platformHook?: unknown): GameManager

// GameOptions
{
  rows: number;    // Maze height in cells
  cols: number;    // Maze width in cells
}

// platformHook (optional)
// A function that receives the GameManager for platform integration
// function(gameManager: GameManager): void
```

**Return Type**: `GameManager` - Complete game interface

**Dependencies**: 
- `useBoard()` - Maze generation and rendering
- `useCursor()` - Input and movement
- `useGameStatus()` - Game lifecycle
- `useScore()` - Scoring system
- `useHeroRender()` - Visual rendering

**Example**:
```tsx
const gameManager = useGame(
  { cols: 32, rows: 24 },
  platformHook  // Optional platform integration
);

const { containerRef, gameStatus, startGame } = gameManager;
```

---

### useBoard()

Board and maze management.

**Purpose**: Generates maze, manages its data structure, and handles DOM rendering.

**Parameters**:
```typescript
useBoard(cols: number, rows: number): BoardManager
```

**Return Type**: `BoardManager`
```typescript
{
  containerRef: RefObject<HTMLDivElement | null>;
  mazeRef: RefObject<MazeCell[][]>;
  mazeInstanceRef: RefObject<MazeGenerator | null>;
  rendererRef: RefObject<MazeRenderer | null>;
  renderBoard: () => void;
}
```

**Dependencies**:
- `MazeGenerator` - Generates random maze
- `MazeRenderer` - Renders maze to DOM
- `useMazeNavigation` - Pathfinding utilities

**Key Features**:
- Generates randomized maze on mount
- Places key randomly in maze
- Manages maze reference for navigation
- Handles board re-rendering

**Example**:
```tsx
const board = useBoard(32, 24);

// Render maze to DOM
useEffect(() => {
  if (board.containerRef.current) {
    board.renderBoard();
  }
}, [board]);

// Access maze data
const maze = board.mazeRef.current;  // MazeCell[][]
```

---

### useCursor()

Input handling and movement system with vim bindings.

**Purpose**: Manages player cursor movement, vim key processing, and coordinate tracking.

**Parameters**:
```typescript
useCursor(
  board: BoardManager, 
  gameStatusManager: GameStatusManager
): CursorManager & { keyManager: GameKeyManager }
```

**Return Type**:
```typescript
CursorManager & {
  keyManager: {
    keyLog: KeyLogEntry[];
    clearKeyLog: () => void;
    getKeyLog: () => KeyLogEntry[];
  }
}
```

**Vim Motion Support**:
- `h`, `j`, `k`, `l` - Move left, down, up, right
- `^` - Move to row start
- `$` - Move to row end
- `g` - Move to maze top
- `G` - Move to maze bottom
- `.` - Repeat last motion
- Number prefixes for counts (e.g., `5j` = move down 5 cells)

**Dependencies**:
- `useHero()` - Hero position management
- `useMazeNavigation()` - Path validation
- `useVimMotions()` - Vim key processing
- `useGameKeys()` - Game-specific key handling

**Example**:
```tsx
const { cursor, keyManager } = useCursor(board, gameStatusManager);

// Direct movement
cursor.moveLeft(5);
cursor.moveDown();

// Query state
const pos = cursor.position();  // { row, col }
const count = cursor.getCount();

// Vim motions are processed by useGameKeys
keyManager.keyLog;  // Track all keystrokes
```

---

### useGameStatus()

Game lifecycle state management.

**Purpose**: Manages game status transitions (waiting → started → has-key → game-won).

**Parameters**:
```typescript
useGameStatus(): GameStatusManager
```

**Return Type**:
```typescript
{
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  togglePause: (pause?: boolean) => void;
  quitGame: () => void;
}
```

**State Transitions**:
```
waiting ──start──> started ──pickup key──> has-key
   ▲                 ▲                          ▲
   │                 │        (pause)          │
   │                 └─────────────────────────┘
   │                      paused
   │
   └──quit─────────────────────────────────────┘

started/has-key ──efficiency > 150%──> game-over
started/has-key ──reach exit + has-key──> game-won
```

**Example**:
```tsx
const gameStatus = useGameStatus();

gameStatus.startGame();
gameStatus.togglePause();
gameStatus.quitGame();
```

---

## Supporting Hooks

### useScore()

Scoring and performance metrics.

**Purpose**: Calculates efficiency, tracks time and keystrokes, computes final score.

**Parameters**:
```typescript
useScore({
  board: BoardManager;
  hero: UseHeroType;
  gameStatusManager: GameStatusManager;
  keyManager?: { keyLog: any[] };
}): ScoreManager
```

**Return Type**: `ScoreManager`

**Scoring Logic**:
- **Optimal Steps**: Calculated as distance(entrance → key) + distance(key → exit)
- **Efficiency**: `Math.round((keystrokes / optimalSteps) * 100)`
- **Game Over Trigger**: `efficiency > 150%`
- **Final Score**: `Math.round((optimalMs / logicMs) * 100000)` when game-won
- **Max Score**: 100,000 points

**Tracking**:
- Real-time keystroke count
- Elapsed time
- Distance to key and exit
- Player movement steps

**Example**:
```tsx
const score = useScore({ board, hero, gameStatusManager, keyManager });

if (score.efficiency > 100) {
  // Inefficient movement
}

// Final score available only after game-won
if (gameStatus === 'game-won') {
  console.log(`Final Score: ${score.finalScore}`);
}
```

---

### useHero()

Player position and movement logic.

**Purpose**: Manages hero position, handles cell interactions (key pickup, exit), animates movement.

**Parameters**:
```typescript
useHero(
  board: BoardManager,
  gameStatusManager: GameStatusManager
): UseHeroType
```

**Return Type**: `UseHeroType`

**Features**:
- Tracks player position (row, col)
- Validates moves through maze navigation
- Handles key pickup event
- Handles exit reached event
- Animates multi-step movements
- Prevents movement without key to exit

**Cell Interactions**:
- **Key**: Transitions to "has-key" state, removes key from maze
- **Exit**: 
  - Without key: Invalid move
  - With key: Transitions to "game-won"
- **Wall**: Blocked by path validation

**Example**:
```tsx
const hero = useHero(board, gameStatusManager);

// Query position
const pos = hero.heroPos;  // { row, col } | null

// Direct movement
hero.moveTo({ row: 10, col: 15 });

// Check validity
if (hero.canMoveTo(coord)) {
  hero.moveTo(coord);
}

// Reset on game end
hero.reset();
```

---

### useVimMotions()

Vim keybinding and motion system.

**Purpose**: Processes vim keys, manages motion count prefix, tracks last motion for repeat.

**Parameters**: None (hook state managed internally)

**Return Type**: `VimMotionSystem`

**API**:
```typescript
{
  processKey: (key: string) => { type: 'move'|'anchor'|'repeat'|'count', data: any } | null;
  resetCount: () => void;
  getCount: () => number;        // Returns 1 if no count
  hasCount: () => boolean;       // True if user entered count
  setLastMotion: (motion: Motion) => void;
  repeatLastMotion: () => Motion | null;
}
```

**Supported Keys**:
```
Move:   h (left), j (down), k (up), l (right)
Anchor: ^ (start), $ (end), g (top), G (bottom)
Repeat: . (repeat last motion)
Count:  0-9 (prefix for count)
```

**Count Behavior**:
- `5j` = move down 5 times
- `0` alone = anchor to start (special case)
- `50j` = move down 50 times
- Motion repeats use stored count

**Example**:
```tsx
const motions = useVimMotions();

const result = motions.processKey('5');  // { type: 'count', data: '5' }
const result = motions.processKey('j');  // { type: 'move', data: { dr: 1, ... } }

motions.setLastMotion({ dr: 0, dc: 1, steps: 5 });
const last = motions.repeatLastMotion();  // Re-executes the motion
```

---

### useGameKeys()

Game-specific key input handling.

**Purpose**: Bridges vim motion system with game cursor movement.

**Parameters**:
```typescript
useGameKeys({
  cursor: CursorManager;
  gameStatusManager: GameStatusManager;
}): GameKeyManager
```

**Return Type**: `GameKeyManager`

**Responsibilities**:
- Listens for keyboard input
- Routes keys through vim motion processor
- Executes corresponding cursor movements
- Tracks keystroke history
- Handles game-specific keys (space, q, p)

**Example**:
```tsx
const keyManager = useGameKeys({ cursor, gameStatusManager });

// Keystroke history available
keyManager.keyLog;  // { key: string, timestamp: number }[]
keyManager.getKeyLog();
```

---

### useAnimation()

Multi-step movement animation system.

**Purpose**: Animates hero movement over multiple cells smoothly.

**Parameters**: None

**Return Type**:
```typescript
{
  isAnimating: () => boolean;
  animateMovement: (
    from: Coord,
    to: Coord,
    steps: number,
    onStep: (coord: Coord) => void,
    onComplete: () => void
  ) => void;
  cancelAnimation: () => void;
}
```

**Behavior**:
- Animates from `from` to `to` coordinate over `steps` cells
- Calls `onStep` for each intermediate position (enables smooth animation)
- Calls `onComplete` when finished
- Prevents overlapping animations

**Example**:
```tsx
const animation = useAnimation();

animation.animateMovement(
  { row: 5, col: 5 },
  { row: 5, col: 10 },
  5,
  (coord) => {
    // Called 5 times for visualization
    updateHeroDisplay(coord);
  },
  () => {
    // Called when complete
    handleCellInteraction();
  }
);
```

---

### useHeroRender()

DOM rendering for hero character.

**Purpose**: Renders hero position on the game board DOM.

**Parameters**:
```typescript
useHeroRender({
  gameStatus: GameStatus;
  board: BoardManager;
  hero: UseHeroType;
}): HeroRenderer
```

**Return Type**: `HeroRenderer`

**Features**:
- Renders hero at current position
- Updates hero position on DOM
- Shows/hides coordinate display
- Syncs with board rendering

---

### useTimer()

Timer state management.

**Purpose**: Tracks elapsed game time.

**Return Type**:
```typescript
{
  timeValue: number;      // Milliseconds elapsed
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}
```

---

### useScorePaths()

Pathfinding for distance calculations.

**Purpose**: Calculates distances for scoring.

**Parameters**:
```typescript
useScorePaths({
  board: BoardManager;
  heroPos: Coord | null;
}): { entranceToKey, entranceToExit, heroToKey, heroToExit }
```

**Returns**: Path distances or 0 if not calculable

---

### useMazeNavigation()

Navigation and validation utilities.

**Purpose**: Validates moves, finds paths, checks cell accessibility.

**Methods**:
```typescript
{
  validatePath: (from: Coord, direction: { row, col }, steps: number) => boolean;
  isValidMove: (from: Coord, to: Coord) => boolean;
  findAnchorTarget: (from: Coord, direction: 'top'|'bottom'|'left'|'right') => Coord | null;
}
```

---

## Implementation Examples

### Minimal Game Setup

```tsx
import { useGame } from '@vim-maze/src';

function MyGame() {
  const gameManager = useGame({ cols: 32, rows: 24 });
  const { containerRef, gameStatus, startGame } = gameManager;

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={startGame}>Start</button>
      <p>Status: {gameStatus}</p>
    </div>
  );
}
```

### Complete Feature Example with Scoring

```tsx
import { useGame } from '@vim-maze/src';

function GameWithScoring() {
  const gameManager = useGame(
    { cols: 32, rows: 24 },
    platformHook  // Optional
  );
  
  const {
    containerRef,
    gameStatus,
    startGame,
    cursor,
    hero,
    scoreManager,
    keyLog,
  } = gameManager;

  const {
    timeValue,
    efficiency,
    optimalSteps,
    keystrokes,
    finalScore,
  } = scoreManager;

  return (
    <div>
      <div ref={containerRef} />
      
      {gameStatus === 'waiting' && (
        <button onClick={startGame}>Start Game</button>
      )}

      {(gameStatus === 'started' || gameStatus === 'has-key') && (
        <div>
          <p>Time: {formatTime(timeValue)}</p>
          <p>Efficiency: {efficiency}% {efficiency > 150 && '(Game Over!)'}</p>
          <p>Keystrokes: {keystrokes} / {optimalSteps}</p>
        </div>
      )}

      {gameStatus === 'game-won' && (
        <div>
          <h2>You Won!</h2>
          <p>Final Score: {finalScore}</p>
        </div>
      )}
    </div>
  );
}
```

### Custom Platform Hook Integration

```tsx
function customPlatformHook(gameManager: GameManager) {
  // Called after game initialization
  
  // Track analytics
  console.log('Game initialized:', {
    cols: gameManager.cursor.position().col,
    rows: gameManager.cursor.position().row,
  });

  // Add custom key handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
      gameManager.togglePause();
    }
  });

  // Monitor game events
  const interval = setInterval(() => {
    if (gameManager.gameStatus === 'game-won') {
      console.log('Victory:', gameManager.scoreManager.finalScore);
      clearInterval(interval);
    }
  }, 100);
}

const gameManager = useGame({ cols: 32, rows: 24 }, customPlatformHook);
```

---

## Integration Points

### For New Games

1. **Initialize**: Call `useGame(options, platformHook?)`
2. **Render Container**: Attach `gameManager.containerRef` to DOM
3. **Handle Status**: React to `gameManager.gameStatus` changes
4. **Access Managers**:
   - Movement: `gameManager.cursor`
   - Scoring: `gameManager.scoreManager`
   - Input: `gameManager.keyLog`
   - Hero: `gameManager.hero`

### For Platform Integration

Implement a platform hook function that receives the complete `GameManager`:

```typescript
type PlatformHook = (gameManager: GameManager) => void;
```

The hook can:
- Add custom key bindings
- Track analytics
- Synchronize with platform APIs
- Monitor game state
- Control game lifecycle

### Customization Points

The current implementation supports:

1. **Board Size**: Adjust `cols` and `rows` in `GameOptions`
2. **Key Bindings**: Via `useGameKeys` in custom implementations
3. **Rendering**: Override via `useHeroRender` for custom visuals
4. **Scoring**: Modify `useScore` for different scoring formulas
5. **Maze Generation**: Extend `MazeGenerator` for different algorithms

### Data Flow

```
Game Initialization
    ↓
useGame() composes hooks
    ├→ useBoard() generates maze
    ├→ useCursor() initializes input
    ├→ useGameStatus() initializes state
    └→ useScore() initializes scoring
    
User Input
    ↓
useGameKeys() processes keystroke
    ↓
useVimMotions() interprets vim command
    ↓
useCursor() executes movement
    ↓
useHero() validates and animates
    ↓
useScore() updates metrics
    ↓
Rendering updates via refs
```

---

## Type Safety Patterns

### Hook Return Types

All hook return types are explicitly defined in `src/types.ts`. Import them directly:

```typescript
import type { GameManager, CursorManager, ScoreManager } from './types';
import type { TimerManager, HeroRenderManager, AnimationSystem } from './types';
```

### Type Imports

Always import types with `import type`:

```typescript
import type { GameManager, CursorManager, Coord } from './types';
import { useGame } from './useGame';
```

### Coordinate Operations

Common patterns for working with coordinates:

```typescript
// Validate before moving
if (hero.canMoveTo(targetCoord)) {
  hero.moveTo(targetCoord);
}

// Calculate distance
const distance = Math.abs(pos1.row - pos2.row) + 
                 Math.abs(pos1.col - pos2.col);

// Check if equal
const same = pos1.row === pos2.row && pos1.col === pos2.col;
```

---

## Summary

The vim-maze unified API provides a composable, type-safe game engine:

- **Single Entry Point**: `useGame()` for all initialization
- **Modular Design**: Independent, reusable hooks
- **Type Safe**: Comprehensive TypeScript support
- **Extensible**: Platform hook system for customization
- **Well Structured**: Clear separation of concerns

For detailed implementation, refer to source files in `src/`.
