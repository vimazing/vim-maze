import type { GameManager } from './types';
import { gameInfo as baseGameInfo } from './gameInfo';

/**
 * Format the gameOver condition as a readable string
 */
function formatGameOverCondition(condition: GameManager['gameOverCondition']): string {
  if (condition === undefined) {
    return 'None - game continues indefinitely';
  }
  
  if (condition === true) {
    return 'Always (immediate game over)';
  }
  
  if (condition === false) {
    return 'Never (game never ends)';
  }
  
  if (typeof condition === 'function') {
    // Try to get the function source
    const source = condition.toString();
    // Clean up and format
    const cleaned = source
      .replace(/\s+/g, ' ')
      .replace(/=>/, '→')
      .trim();
    return cleaned.length > 200 ? cleaned.substring(0, 197) + '...' : cleaned;
  }
  
  return 'Unknown condition';
}

/**
 * Enrich gameInfo with runtime gameOver condition
 * Returns the base gameInfo plus runtime condition info
 */
export function enrichGameInfo(gameManager: GameManager) {
  const runtimeCondition = formatGameOverCondition(gameManager.gameOverCondition);
  
  return {
    ...baseGameInfo,
    gameOverRuntime: {
      condition: runtimeCondition,
      type: gameManager.gameOverCondition === undefined 
        ? 'none' 
        : typeof gameManager.gameOverCondition === 'boolean' 
          ? 'static' 
          : 'function',
    },
  };
}

export { formatGameOverCondition };
