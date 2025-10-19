# Implementation Instructions for New Games

## Goal
Create a comprehensive `UNIFIED_API.md` that documents the current architecture in `src/` (not `src_old/`), replacing the old `UNIFIED_API_OLD.md`. This will serve as the blueprint for porting existing games and creating new games using the new unified architecture.

## Files to Reference

### Read These First
1. **AGENTS.md** - Contains all development guidelines, code conventions, naming patterns, hook structure, and architectural principles
2. **UNIFIED_API_OLD.md** - The old API documentation (for reference on what we're replacing)

### Reference the New Codebase
- **src/useGame.ts** - Main orchestrator hook, entry point
- **src/useBoard/** - Board/level management
  - useBoard.ts
  - MazeGenerator.ts
  - MazeRenderer.ts
  - useMazeNavigation.ts
- **src/useCursor/** - Player/actor management
  - useCursor.ts
  - useHero.ts
  - useHeroRender.ts
  - useVimMotions.ts
  - useGameKeys.ts
  - useAnimation.ts
- **src/useScore/** - Scoring system
  - useScore.ts
  - useScorePaths.ts
  - useScoreTime.ts
  - useTimer.ts
- **src/useGameStatus.ts** - Game state management
- **src/types.ts** - All shared TypeScript types

### Example Implementation
- **example/src/App.tsx** - Shows how to use the new unified API

## What the New UNIFIED_API.md Should Cover

### 1. Architecture Overview
- Single entry point: `useGame(options?, platformHook?)`
- Three core hooks composition pattern
- Scoring system integration
- Type-safe throughout

### 2. Core Hooks Reference
For each hook, document:
- **Purpose** - What it does
- **Parameters** - What it accepts with types
- **Return Type** - What it returns with type definition
- **Dependencies** - What other hooks it depends on
- **Example Usage** - Real code example

Core hooks to document:
- `useGame()` - Main orchestrator
- `useBoard()` - Board/maze management
- `useCursor()` - Player movement and controls
- `useScore()` - Scoring system
- `useGameStatus()` - Game state
- Supporting hooks in each module

### 3. Type System Documentation
- Document all major types from `src/types.ts`:
  - `GameManager`
  - `BoardManager`
  - `CursorManager`
  - `ScoreManager`
  - `GameStatusManager`
  - `Coord`, `MazeCell`, etc.
- Show relationships between types
- Include examples of how types flow through the system

### 4. File Structure & Organization
- Show the complete `src/` directory structure
- Explain the purpose of each module
- Show public exports from `index.ts` files

### 5. Naming Conventions & Patterns
- Hook naming: `use[FeatureName]()`
- Type naming: `PascalCase` with descriptive names
- Function naming: `camelCase` with clear verbs
- Pattern examples from actual code

### 6. Key Implementation Details
- How board generation and rendering works
- How player movement and vim motions are handled
- How scoring is calculated
- How game status transitions work
- Animation system for multi-step movements
- Keyboard input handling and key binding system

### 7. Integration Points for New Games
- What you need to implement for a new game
- How to customize board generation
- How to customize player movement rules
- How to customize scoring logic
- Platform hook integration (if applicable)

### 8. Code Examples
- Minimal game setup example
- Complete feature examples (movement, scoring, rendering)
- Type usage examples
- Common patterns and best practices

### 9. Migration Guide (Optional)
- How to port games from `src_old/` structure to new structure
- Common gotchas and solutions
- Before/after code comparisons

## Output Requirements

The new `UNIFIED_API.md` should:
- Be comprehensive but readable
- Use clear sections and subsections
- Include code blocks for all examples
- Show actual types and function signatures from the codebase
- Be focused on developers porting games or creating new ones
- Be maintainable - designed to stay in sync with actual code in `src/`

## Success Criteria

When done, a developer should be able to:
1. Understand the complete architecture without reading source code
2. Know exactly what types and functions are available
3. Understand how hooks compose together
4. Have templates/examples for common tasks
5. Easily port a game from `src_old/` to new structure
6. Create a completely new game following this pattern

## Notes

- AGENTS.md already contains code conventions and patterns - reference it heavily
- Focus the new doc on WHAT each part does and HOW to use it, not just code style
- Keep the doc well-organized so it's easy to find specific information
- Show how everything connects together (data flow, composition)
