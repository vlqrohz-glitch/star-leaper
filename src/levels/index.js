import { LEVEL_1_DATA } from './level1.js';
import { LEVEL_2_DATA } from './level2.js';
import { LEVEL_3_DATA } from './level3.js';
import { LEVEL_4_DATA } from './level4.js';
import { LEVEL_5_DATA } from './level5.js';
import { LEVEL_6_DATA } from './level6.js';

export const LEVELS = [
  LEVEL_1_DATA,
  LEVEL_2_DATA,
  LEVEL_3_DATA,
  LEVEL_4_DATA,
  LEVEL_5_DATA,
  LEVEL_6_DATA
];

/**
 * Resolves level data by numeric 1-based index or string id
 * @param {number|string} [indexOrId=1]
 * @returns {object} Level data object (defaults to LEVEL_1_DATA)
 */
export function getLevelData(indexOrId = 1) {
  if (typeof indexOrId === 'number') {
    const idx = Math.max(0, Math.min(LEVELS.length - 1, indexOrId - 1));
    return LEVELS[idx] || LEVEL_1_DATA;
  }
  if (typeof indexOrId === 'string') {
    const match = LEVELS.find(l => l.id === indexOrId);
    return match || LEVEL_1_DATA;
  }
  return LEVEL_1_DATA;
}
