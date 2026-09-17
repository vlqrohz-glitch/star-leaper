import { LEVEL_1_DATA } from './level1.js';
import { LEVEL_2_DATA } from './level2.js';
import { LEVEL_3_DATA } from './level3.js';
import { LEVEL_4_DATA } from './level4.js';
import { LEVEL_5_DATA } from './level5.js';
import { LEVEL_6_DATA } from './level6.js';
import {
  getSectorLevelData,
  SECTOR_THEMES,
  createBossArenaData,
  createSubLevelData
} from './levelManager.js';

export const LEVELS = [
  LEVEL_1_DATA,
  LEVEL_2_DATA,
  LEVEL_3_DATA,
  LEVEL_4_DATA,
  LEVEL_5_DATA,
  LEVEL_6_DATA
];

export {
  LEVEL_1_DATA,
  LEVEL_2_DATA,
  LEVEL_3_DATA,
  LEVEL_4_DATA,
  LEVEL_5_DATA,
  LEVEL_6_DATA,
  getSectorLevelData,
  SECTOR_THEMES,
  createBossArenaData,
  createSubLevelData
};

/**
 * Resolves level data by sector index (1-6) and sublevel (1-10),
 * or by 1-based index (1-6 for baseline sectors, or 1-60 for extended levels),
 * or by string id (e.g. 'level_1', 'level_1_10').
 *
 * @param {number|string} [indexOrId=1] Sector index (1-6), level id, or global level index
 * @param {number|null} [subLevel=null] Sublevel (1-10, where 10 is the Final Boss level)
 * @returns {object} Level data object (defaults to LEVEL_1_DATA)
 */
export function getLevelData(indexOrId = 1, subLevel = null) {
  // If explicitly called with sector and subLevel (1-10)
  if (subLevel !== null && typeof indexOrId === 'number') {
    return getSectorLevelData(indexOrId, subLevel);
  }

  // If called with string level ID (e.g. 'level_1_10')
  if (typeof indexOrId === 'string') {
    if (indexOrId.includes('_') && indexOrId.split('_').length > 2) {
      return getSectorLevelData(indexOrId);
    }
    const match = LEVELS.find(l => l.id === indexOrId);
    return match || LEVEL_1_DATA;
  }

  // If called with numeric index
  if (typeof indexOrId === 'number') {
    // Extended index (1 to 60)
    if (indexOrId > 6 && indexOrId <= 60) {
      const s = Math.floor((indexOrId - 1) / 10) + 1;
      const sub = ((indexOrId - 1) % 10) + 1;
      return getSectorLevelData(s, sub);
    }
    // Baseline sector index (1 to 6)
    const idx = Math.max(0, Math.min(LEVELS.length - 1, indexOrId - 1));
    return LEVELS[idx] || LEVEL_1_DATA;
  }

  return LEVEL_1_DATA;
}
