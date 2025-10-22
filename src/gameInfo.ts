export const gameInfo = {
  name: 'VIM Maze',
  description: 'Navigate procedurally generated mazes with VIM-style controls',
  
  controls: {
    navigation: [
      { keys: 'hjkl', description: 'Move left/down/up/right' },
      { keys: '5j, 10l', description: 'Move with count (5 down, 10 right)' },
      { keys: '0 or ^', description: 'Jump to leftmost walkable cell in row' },
      { keys: '$', description: 'Jump to rightmost walkable cell in row' },
      { keys: 'gg', description: 'Jump to topmost walkable row' },
      { keys: 'G', description: 'Jump to bottommost walkable row' },
      { keys: '.', description: 'Repeat last motion' },
    ],
    
    game: [
      { keys: 'Space', description: 'Start new game (when waiting)' },
      { keys: 'q', description: 'Quit game' },
      { keys: 'p', description: 'Pause/unpause game' },
    ],
  },
  
  rules: {
    movement: [
      { rule: 'Wall Collision', description: 'Movement stops at walls, no wrapping' },
      { rule: 'Counted Moves', description: 'Multi-step movements (e.g., 5j) stop at first wall encountered' },
      { rule: 'Path Required', description: 'Can only move through open passages' },
    ],
    
    gameFlow: [
      {
        phase: 'Start',
        location: 'Entrance (top-left area)',
        objective: 'Navigate to find the key',
        status: 'started',
      },
      {
        phase: 'Key Found',
        location: 'Somewhere in maze',
        objective: 'Navigate to exit',
        status: 'has-key',
      },
      {
        phase: 'Victory',
        location: 'Exit (bottom-right area)',
        objective: 'Reached with key!',
        status: 'game-won',
      },
    ],
    
    mazeElements: [
      { element: 'Entrance', appearance: 'Special cell in top-left area', description: 'Starting position' },
      { element: 'Key', appearance: 'Special cell in maze', description: 'Must collect before exit' },
      { element: 'Exit', appearance: 'Special cell in bottom-right area', description: 'Win condition (with key)' },
      { element: 'Walls', appearance: 'Solid barriers', description: 'Cannot pass through' },
      { element: 'Passages', appearance: 'Open paths', description: 'Walkable areas' },
    ],
  },
  
  scoring: {
    formula: 'Base Score = 1000 - (time penalty) - (keystroke penalty)',
    multiplier: 'Final Score = min(1000, Base Score × size multiplier)',
    range: '0 - 1000 points',
    
    penalties: [
      { factor: 'Time', formula: 'seconds / 10', example: '60 seconds = -6 points' },
      { factor: 'Keystrokes', formula: 'total keys / 2', example: '100 keys = -50 points' },
    ],
    
    sizeMultiplier: {
      formula: 'max(1.0, (rows × cols) / 500)',
      description: 'Larger mazes earn higher potential scores',
      examples: [
        { size: '16×24 (384 cells)', multiplier: '1.0x', description: 'Small maze, no bonus' },
        { size: '24×32 (768 cells)', multiplier: '1.54x', description: 'Medium maze' },
        { size: '32×48 (1536 cells)', multiplier: '3.07x', description: 'Large maze' },
      ],
    },
    
    examples: [
      {
        size: '16×24',
        time: '60 seconds',
        keystrokes: 80,
        calculation: '1000 - 6 - 40 = 954 × 1.0',
        score: '954 / 1000',
      },
      {
        size: '32×48',
        time: '180 seconds',
        keystrokes: 200,
        calculation: '1000 - 18 - 100 = 882 × 3.07',
        score: '1000 / 1000 (capped)',
      },
    ],
  },
  
  gameOver: {
    conditions: [
      {
        type: 'Time Limit',
        trigger: '10 minutes (600 seconds) by default',
        configurable: true,
        message: 'Time ran out!',
        description: 'Failed to reach exit with key in time',
      },
    ],
    note: 'No other game-over conditions - take your time and find the optimal path!',
  },
  
  mazeGeneration: {
    algorithm: 'Depth-first search with backtracking',
    guarantees: [
      'Path exists from entrance to key',
      'Path exists from key to exit',
      'No isolated areas',
      'Fully connected passages',
    ],
    placement: [
      { element: 'Entrance', location: 'Top-left area of maze' },
      { element: 'Key', location: 'Random location requiring navigation' },
      { element: 'Exit', location: 'Bottom-right area of maze' },
    ],
  },
  
  metrics: {
    tracked: [
      { metric: 'Time', unit: 'seconds', description: 'Elapsed time since game start' },
      { metric: 'Keystrokes', unit: 'count', description: 'Total keys pressed' },
      { metric: 'Distance to Key', unit: 'cells', description: 'Current shortest path to key' },
      { metric: 'Distance to Exit', unit: 'cells', description: 'Current shortest path to exit' },
    ],
    displayed: 'Live during gameplay to help you track progress',
  },
  
  objective: 'Navigate from entrance to key, then from key to exit, before time runs out.',
  
  winCondition: 'Reach the exit cell while holding the key (key must be collected first).',
} as const;

export type GameInfo = typeof gameInfo;
