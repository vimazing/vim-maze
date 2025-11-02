export * from './types';
export * from './useGame';
export * from './useGameStatus';
export { gameInfo } from './gameInfo';
export { calculateMazeScore } from './useScore';
export { enrichGameInfo, formatGameOverCondition } from './formatGameInfo';
import { version } from '../package.json';
export type { GameInfo } from './gameInfo';
export { version };
