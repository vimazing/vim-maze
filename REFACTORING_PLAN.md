# Vim-Maze Architecture Refactoring Plan

## Current Problems Identified

### 1. Dual Position System
- `useCursor` maintains logical cursor position
- `useHero` maintains actual hero position  
- They sync but can diverge during animations
- Creates confusion about single source of truth

### 2. Mixed Responsibilities
- **useCursor**: Input abstraction + maze geometry + event dispatching
- **useHero**: Game logic + DOM manipulation + animation + visual feedback
- **useHeroRender**: Hero rendering + coordinate system + DOM querying

### 3. Anti-Patterns
- Global events for component communication (`maze-invalid`)
- Direct DOM manipulation breaking React abstraction
- Hard-coded CSS selectors and maze structure assumptions
- Debug code left in production (`console.log`)

## Target Architecture

### Clear Separation of Concerns

```
useCursor → Pure input abstraction (Vim motions → coordinates)
useHero → Pure game logic (position validation, state transitions)  
useHeroRender → Pure visual layer (CSS classes, coordinate display)
```

### Single Source of Truth
- Hero position = game state (authoritative)
- Cursor position = input intent (derived from hero)
- Render position = derived from hero position

### React-First Architecture
- State-driven rendering instead of DOM manipulation
- Callback props instead of global events
- Ref-based access instead of direct queries

## Detailed Refactoring Steps

### Phase 1: Extract Specialized Hooks

#### 1.1 Create `useMazeNavigation`
**Location:** `src/useBoard/useMazeNavigation.ts`
**Responsibilities:**
- Wall detection and boundary finding
- Path validation for movements
- Anchor target detection (line start/end, top/bottom)
- Pure functions, no side effects

**Interface:**
```tsx
type MazeNavigator = {
  isValidMove: (from: Coord, to: Coord) => boolean;
  findAnchorTarget: (from: Coord, direction: 'left'|'right'|'top'|'bottom') => Coord | null;
  validatePath: (from: Coord, direction: Coord, steps: number) => boolean;
}
```

#### 1.2 Create `useVimMotions`
**Location:** `src/useCursor/useVimMotions.ts`
**Responsibilities:**
- Parse Vim-style input (hjkl, counts, gg, G, ^, $, .)
- Convert motions to coordinate changes
- Manage count accumulation and last motion tracking
- Pure input parsing, no game logic

**Interface:**
```tsx
type VimMotionSystem = {
  processKey: (key: string) => { type: 'move'|'anchor'|'repeat', data: any } | null;
  resetCount: () => void;
  getCount: () => number;
  setLastMotion: (motion: Motion) => void;
  repeatLastMotion: () => Motion | null;
}
```

#### 1.3 Create `useAnimation`
**Location:** `src/useCursor/useAnimation.ts`
**Responsibilities:**
- Smooth interpolated movement for multi-step actions
- Animation timing and frame management
- Cancellation handling (Escape key)
- Trail effects during animation

**Interface:**
```tsx
type AnimationSystem = {
  animateMovement: (from: Coord, to: Coord, steps: number, onComplete: () => void) => void;
  cancelAnimation: () => void;
  isAnimating: () => boolean;
}
```

### Phase 2: Refactor Core Hooks

#### 2.1 Simplify `useCursor`
**New Responsibilities:**
- Coordinate input from Vim motions
- Delegate navigation to `useMazeNavigation`
- Delegate animation to `useAnimation`
- Maintain cursor state (synced with hero)

**New Interface:**
```tsx
type CursorManager = {
  position: () => Coord;
  mode: () => CursorMode;
  move: (direction: Coord, count?: number) => boolean;
  moveToAnchor: (target: 'start'|'end'|'top'|'bottom') => boolean;
  repeatLastMotion: () => boolean;
}
```

#### 2.2 Refactor `useHero`
**New Responsibilities:**
- Pure game logic and state management
- Position validation and game rule enforcement
- Game state transitions (key pickup, victory)
- No DOM manipulation or visual effects

**New Interface:**
```tsx
type HeroManager = {
  position: Coord | null;
  canMoveTo: (coord: Coord) => boolean;
  moveTo: (coord: Coord) => void;
  pickupKey: () => void;
  reachExit: () => void;
  reset: () => void;
}
```

#### 2.3 Refactor `useHeroRender`
**New Responsibilities:**
- Pure visual presentation
- CSS class management for hero position
- Coordinate system display
- No game logic or state management

**New Interface:**
```tsx
type HeroRenderer = {
  render: () => void;
  updatePosition: (coord: Coord) => void;
  showCoordinates: (show: boolean) => void;
}
```

### Phase 3: Fix Communication Patterns

#### 3.1 Replace Global Events
**Current:** `window.dispatchEvent(new Event("maze-invalid"))`
**New:** Callback props and return values

```tsx
// Instead of events, use return values
const canMove = cursor.move(direction, count);
if (!canMove) {
  // Handle invalid move in caller
  flashInvalid();
}
```

#### 3.2 Remove Direct DOM Manipulation
**Current:** `getCellEl().classList.add("hero")`
**New:** State-driven rendering

```tsx
// In render component
<div className={`cell ${heroPosition === coord ? 'hero' : ''}`}>
```

#### 3.3 Replace Direct Queries
**Current:** `container.querySelector("#maze")`
**New:** Ref-based access

```tsx
const mazeRef = useRef<HTMLElement>(null);
// Use mazeRef.current instead of queries
```

### Phase 4: Update Integration Points

#### 4.1 Fix `useGame` Integration
```tsx
export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const board = useBoard(cols, rows);
  const gameStatusManager = useGameStatus();
  
  // New clean composition
  const hero = useHero(board, gameStatusManager);
  const cursor = useCursor(board, hero, gameStatusManager);
  const renderer = useHeroRender(board, hero);
  const keyManager = useGameKeys({ cursor, gameStatusManager });

  const gameManager = {
    containerRef: board.containerRef,
    renderBoard: board.renderBoard,
    cursor,
    hero,
    renderer,
    ...keyManager,
    ...gameStatusManager,
  };

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}
```

#### 4.2 Update Platform Hook Interface
```tsx
type GameManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  cursor: CursorManager;
  hero: HeroManager;
  renderer: HeroRenderer;
} & GameStatusManager & GameKeyManager;
```

### Phase 5: Clean Up and Optimize

#### 5.1 Remove Debug Code
- Remove `console.log('gameStatus', gameStatus)` from `useHeroRender`
- Remove any other debug statements

#### 5.2 Update Type Definitions
- Update all interfaces in `types.ts`
- Ensure proper export of new types
- Update `UNIFIED_API.md` documentation

#### 5.3 Update Tests and Examples
- Fix any broken tests
- Update example usage
- Ensure platform hooks still work

## Implementation Order

1. **Create new specialized hooks** (Phase 1)
2. **Refactor useCursor** (Phase 2.1) 
3. **Refactor useHero** (Phase 2.2)
4. **Refactor useHeroRender** (Phase 2.3)
5. **Fix communication patterns** (Phase 3)
6. **Update integration points** (Phase 4)
7. **Clean up and optimize** (Phase 5)

## Success Criteria

- ✅ Single source of truth for position (hero position)
- ✅ Clear separation of concerns between hooks
- ✅ No global events or direct DOM manipulation
- ✅ All functionality preserved (Vim motions, animation, etc.)
- ✅ Type safety maintained throughout
- ✅ Platform hooks continue to work
- ✅ Documentation updated to reflect new architecture

## Files to Modify

### New Files
- `src/useBoard/useMazeNavigation.ts`
- `src/useCursor/useVimMotions.ts` 
- `src/useCursor/useAnimation.ts`

### Modified Files
- `src/types.ts`
- `src/useCursor/useCursor.ts`
- `src/useCursor/useHero.ts`
- `src/useCursor/useHeroRender.ts`
- `src/useGame.ts`
- `UNIFIED_API.md`

### Files to Remove
- None (all existing functionality preserved)

## Risk Mitigation

- **Incremental changes**: Implement one phase at a time
- **Backward compatibility**: Ensure platform hooks still work
- **Type safety**: Use TypeScript to catch issues early
- **Testing**: Verify functionality after each phase
- **Documentation**: Keep docs in sync with changes

This refactoring will result in a cleaner, more maintainable architecture while preserving all existing functionality.