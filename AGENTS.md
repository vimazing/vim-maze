# Development Guidelines & Agent Instructions

## Documentation Management

### Automatic Documentation Updates
- **UNIFIED_API.md**: Automatically update after any implementation changes
- **Track**: Implementation status, API changes, new types, completed features
- **No prompting required**: Keep docs in sync with codebase proactively

## Code Conventions

### File Structure & Organization
```
src/
├── useBoard/          # Board/level management
│   ├── index.ts       # Public exports
│   ├── useBoard.ts    # Main hook implementation
│   ├── MazeGenerator.ts
│   └── MazeRenderer.ts
├── useCursor/         # Player/actor management
│   ├── index.ts       # Public exports
│   └── useCursor.ts   # Main hook implementation
├── types.ts           # All shared TypeScript types
├── useGame.ts         # Main orchestrator hook
└── index.ts           # Main package exports
```

### TypeScript Patterns
- **Type-first approach**: Define types before implementation
- **Explicit imports**: Always import types with `import type`
- **Shared types**: Keep all types in `types.ts` for consistency
- **Return type annotations**: Use `ReturnType<typeof hookName>` for hook return types

### Hook Structure
```tsx
// Standard hook pattern
export function useHookName(param: Type): ReturnType {
  // 1. Refs for persistent state
  const ref = useRef<Type>(initialValue);
  
  // 2. State for reactive values
  const [state, setState] = useState<Type>(initialValue);
  
  // 3. Internal functions (private)
  function internalFunction() {
    // Implementation
  }
  
  // 4. Public API functions
  function publicMethod() {
    // Implementation
  }
  
  // 5. Return object with explicit interface
  return {
    // Public API only
  };
}

// Export type for consumers
export type HookManager = ReturnType<typeof useHookName>;
```

### Naming Conventions
- **Hooks**: `use[FeatureName]` (e.g., `useBoard`, `useCursor`, `useGame`)
- **Types**: `PascalCase` with descriptive names (e.g., `GameManager`, `BoardManager`)
- **Functions**: `camelCase` with clear verbs (e.g., `renderBoard`, `movePlayer`)
- **Refs**: `[concept]Ref` pattern (e.g., `containerRef`, `mazeRef`)
- **Constants**: `UPPER_SNAKE_CASE`

### Import Organization
```tsx
// 1. React imports
import { useRef, useState } from 'react';
import type { RefObject } from 'react';

// 2. Internal type imports
import type { Cursor, BoardManager } from '../types';

// 3. Internal implementation imports
import { MazeGenerator } from './MazeGenerator';
import { MazeRenderer } from './MazeRenderer';
```

### Code Style
- **No comments**: Avoid adding comments unless explicitly requested
- **Minimal whitespace**: Clean, concise formatting
- **Explicit returns**: Always return objects from hooks
- **Destructuring**: Use object destructuring for parameters and returns
- **Arrow functions**: Prefer arrow functions for consistency
- **No useCallback/useMemo**: React 19 optimization makes these hooks unnecessary

### Error Handling
- **Early returns**: Guard clauses at function start
- **Null checks**: Always validate refs and state before use
- **Graceful failures**: Return early if conditions aren't met

## Architecture Principles

### Unified API Design
- **Single entry point**: `useGame(options?, platformHook?)` for all games
- **Composable hooks**: Three core hooks (`useBoard`, `useCursor`, `useGame`)
- **Platform agnostic**: Games work across platforms without modification
- **Type safety**: Full TypeScript support throughout

### Hook Composition Pattern
```tsx
// Standard composition in useGame
export function useGame(options: GameOptions, platformHook?: unknown): GameManager {
  const boardManager = useBoard(cols, rows);
  const cursor = useCursor(boardManager);
  
  // Orchestrate and return unified interface
  return {
    // Expose necessary functionality
  };
}
```

### Platform Integration
- **Platform hook pattern**: Optional function parameter for platform-specific logic
- **Non-intrusive**: Core game logic works without platform integration
- **Extensible**: Platform can add analytics, custom bindings, etc.

## Development Workflow

### Implementation Order
1. **Types first**: Define interfaces in `types.ts`
2. **Core hooks**: Implement `useBoard`, `useCursor`
3. **Orchestrator**: Implement `useGame`
4. **Integration**: Add platform hook support
5. **Features**: Add advanced features (scoring, animations, etc.)

### Testing & Validation
- **Type checking**: Run TypeScript compiler after changes
- **Build verification**: Ensure build process works
- **Example testing**: Test with example application

### File Management
- **Prefer editing**: Modify existing files over creating new ones
- **Never create docs**: Don't create README files unless explicitly requested
- **Consistent exports**: Use `index.ts` files for clean public APIs

## Agent Behavior Rules

### Proactive Documentation
- Update `UNIFIED_API.md` after every meaningful change
- Track implementation status changes
- Document new types and interfaces
- Note API modifications and architectural decisions

### Code Generation
- Follow existing patterns exactly
- Mimic code style from surrounding files
- Use established naming conventions
- Maintain type safety throughout

### Communication
- **Concise responses**: Keep explanations brief and direct
- **Focus on code**: Prioritize implementation over explanation
- **No elaboration**: Avoid unnecessary preamble or summary
- **Direct answers**: Respond to specific requests without extra context

### Quality Assurance
- **Type safety first**: Ensure all TypeScript types are correct
- **Import consistency**: Follow established import patterns
- **Code style matching**: Mirror existing code style exactly
- **Error prevention**: Write defensive code with proper validation

## Forbidden Patterns

### Do NOT
- Add comments to code (unless requested)
- Create documentation files (except UNIFIED_API.md updates)
- Use generic variable names (`data`, `item`, etc.)
- Mix import styles (some type imports, some runtime)
- Break existing patterns without reason
- Write overly complex implementations
- Add unnecessary features
- Use `useCallback` or `useMemo` anywhere in the codebase

### Always DO
- Follow existing code patterns exactly
- Use descriptive, meaningful names
- Maintain type safety
- Keep implementations simple and focused
- Update documentation proactively
- Test builds after changes
- Use plain functions instead of `useCallback`/`useMemo` (React 19 optimization)