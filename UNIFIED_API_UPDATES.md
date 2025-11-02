# UNIFIED_API.md Update Recommendations

This document outlines the changes needed in `/vimazing/games/UNIFIED_API.md` to reflect the scoring refactor implemented in vim-maze v2.3.0.

## Summary of Changes

Vim-maze has implemented a new pattern for score management:
- **ScoreManager** is now a pure data collector (no score calculation)
- **Score calculation** moved to consumer (via utility function or custom logic)
- **Game-over conditions** are fully flexible and consumer-controlled

## Required Updates

### 1. Example Entry Point (Line ~100)

**OLD:**
```typescript
// vim-maze
useGame({ rows: 24, cols: 32, timeLimit: 600 })
```

**NEW:**
```typescript
// vim-maze (with custom game-over condition)
useGame({ 
  rows: 24, 
  cols: 32, 
  gameOver: (sm) => sm.timeValue >= 600000  // 10 minutes in milliseconds
})
```

### 2. Score Manager Type (Line ~189-201)

**OLD:**
```typescript
type ScoreManager = {
  // Required Timing
  timeValue: number;            // Current time in milliseconds
  
  // Required Metrics
  totalKeystrokes: number;      // Total keys pressed
  
  // Required Result
  finalScore: number | null;    // 0-1000 (null until game-won)
  
  // Optional: Game-specific metrics
  // [additional fields as needed]
};
```

**NEW:**
```typescript
type ScoreManager = {
  // Required Timing
  timeValue: number;            // Current time in milliseconds
  
  // Required Metrics
  totalKeystrokes: number;      // Total keys pressed
  
  // Optional: Game-specific metrics
  // [additional fields as needed]
  // NOTE: finalScore removed - calculation moved to consumer
};
```

**Add note:**
```
**Important:** ScoreManager is now a pure data collector. 
Score calculation has been moved to the consumer. 
Games should provide a utility function like `calculateScore()` 
or instructions for score calculation in their documentation.
```

### 3. GameOptions Examples (Line ~222-230)

**OLD:**
```typescript
// vim-maze
type GameOptions = {
  rows: number;
  cols: number;
  timeLimit?: number;
};
```

**NEW:**
```typescript
// vim-maze
type GameOptions = {
  rows: number;
  cols: number;
  gameOver?: boolean | ((scoreManager: ScoreManager) => boolean);
};
```

### 4. Scoring Implementation Section (Line ~257-265)

**OLD:**
```typescript
**vim-maze approach:**
```typescript
// Size-based: time + keystrokes × maze size
const baseScore = 1000 - timePenalty - keystrokePenalty;
const sizeMultiplier = max(1.0, (rows × cols) / 500);
const finalScore = min(1000, baseScore × sizeMultiplier);
```
```

**NEW:**
```typescript
**vim-maze approach (v2.3+):**
```typescript
// Pure data collection in ScoreManager
const scoreManager = useScore({ /* dependencies */ });
// scoreManager returns: { timeValue, keystrokes, optimalSteps, efficiency, ... }

// Score calculation moved to consumer
import { calculateMazeScore } from '@vimazing/vim-maze';
const finalScore = calculateMazeScore(scoreManager, mazeSize);
// Base: 1000 - (time/10) - (keystrokes/2)
// Then: multiply by size factor = max(1.0, (rows × cols) / 500)
// Final: clamp to 0-1000
```
```

### 5. Scoring Requirements Section (Line ~203-208)

**OLD:**
```
**Scoring Requirements:**
- Score range: 0-1000 (capped)
- Score calculated on game-won
- Based on time and keystrokes (minimum)
- Can include game-specific penalties/bonuses
```

**NEW:**
```
**Scoring Requirements:**
- Score range: 0-1000 (capped)
- Based on time and keystrokes (minimum)
- Can include game-specific penalties/bonuses
- **NEW:** Score calculation moved to consumer via utility function
- Games should provide `calculateScore()` or similar utility
- Games should document their scoring formula clearly
```

### 6. Game-Over Conditions Pattern (New Section)

Add a new subsection after "Scoring Requirements":

```markdown
### Game-Over Conditions

Starting with vim-maze v2.3+, games have full control over game-over conditions:

```typescript
type GameOptions = {
  // ...game-specific options...
  gameOver?: boolean | ((scoreManager: ScoreManager) => boolean);
};
```

**Examples:**
```typescript
// Static game-over
useGame({ rows: 24, cols: 32, gameOver: true })

// Time-based
useGame({ 
  rows: 24, 
  cols: 32,
  gameOver: (sm) => sm.timeValue >= 600000  // 10 minutes
})

// Efficiency-based
useGame({
  rows: 24,
  cols: 32,
  gameOver: (sm) => sm.efficiency > 150  // >150% keystrokes
})

// Combined conditions
useGame({
  rows: 24,
  cols: 32,
  gameOver: (sm) => sm.efficiency > 150 || sm.timeValue >= 600000
})
```

**Benefits:**
- No hardcoded game-over logic in libraries
- Consumers define win/loss conditions
- Flexible for tournaments, variations, custom rules
```

### 7. Hook Specifications - useScore Section (Line ~424+)

Find and update the useScore section:

**OLD:**
```typescript
export function useScore(/* dependencies */) {
  // ...
  const [timeValue, setTimeValue] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  
  // Calculate score on game-won
  useEffect(() => {
    if (gameStatus === 'game-won') {
      const score = calculateScore(timeValue, totalKeystrokes);
      setFinalScore(Math.min(1000, Math.max(0, score)));
    }
  }, [gameStatus]);
  
  return {
    timeValue,
    totalKeystrokes,
    finalScore,
    // Additional metrics
  };
}
```

**NEW:**
```typescript
export function useScore(/* dependencies */) {
  // Returns raw metrics only - no calculation
  // Score calculation moved to consumer
  
  return {
    timeValue,
    totalKeystrokes,
    // Additional game-specific metrics
    // finalScore removed - consumer responsibility
  };
}
```

Add note:
```
**Change in v2.3+:** ScoreManager is now a pure data collector.
All score calculation has been moved to the consumer.
This provides flexibility and allows games to:
- Provide utility functions for standard scoring
- Allow consumers to implement custom scoring
- Keep the hook focused on metrics collection
```

## Migration Guide for Games

For games updating to this pattern:

1. Remove `finalScore` from `ScoreManager` type
2. Remove score calculation logic from `useScore` hook
3. Export a `calculateScore()` utility function
4. Update `gameOver` option to accept function receiving `scoreManager`
5. Remove `timeLimit` logic from `useScore` (delegate to consumer)
6. Document the new scoring approach in gameInfo

## Benefits of This Pattern

✅ **Pure Data Collection** - ScoreManager has no side effects  
✅ **Separation of Concerns** - Scoring logic is independent  
✅ **Flexibility** - Consumers control both scoring and game-over  
✅ **Testability** - Scoring functions can be tested in isolation  
✅ **Reusability** - Metrics available for any custom logic  
✅ **Clarity** - Clear boundaries between collection and calculation  
