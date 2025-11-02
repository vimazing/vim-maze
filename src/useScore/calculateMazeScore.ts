import type { ScoreManager } from './types';

/**
 * Calculate the final maze score based on performance metrics
 * 
 * Formula:
 * Base Score = 1000 - (time penalty) - (keystroke penalty)
 * Size Multiplier = max(1.0, (mazeSize) / 500)
 * Final Score = min(1000, max(0, round(Base Score × Size Multiplier)))
 * 
 * Penalties:
 * - Time Penalty = seconds / 10
 * - Keystroke Penalty = keystrokes / 2
 * 
 * @param scoreManager - Current score metrics
 * @param mazeSize - Total cells in maze (rows * cols)
 * @returns Final score between 0-1000
 */
export function calculateMazeScore(scoreManager: ScoreManager, mazeSize: number): number {
  const seconds = scoreManager.timeValue / 1000;
  
  const timePenalty = seconds / 10;
  const keystrokePenalty = scoreManager.keystrokes / 2;
  const sizeMultiplier = Math.max(1.0, mazeSize / 500);
  
  const baseScore = 1000 - timePenalty - keystrokePenalty;
  const score = Math.min(1000, Math.max(0, Math.round(baseScore * sizeMultiplier)));

  return score;
}
