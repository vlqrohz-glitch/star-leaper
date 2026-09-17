/**
 * Dedicated Scoreboard & Leaderboard System for Star-Leaper: Orion Odyssey
 * Manages high score records, arcade initials, persistent local storage,
 * sector rankings, and personal best milestones.
 */

const STORAGE_KEY = 'starleaper_scoreboard';
const PLAYER_NAME_KEY = 'starleaper_player_name';

export const DEFAULT_HIGH_SCORES = Object.freeze([
  { id: 'def-1', name: 'WYATT_99', score: 4850, sector: 6, operative: 'WYATT', stars: 3, date: 'SEP 16' },
  { id: 'def-2', name: 'NOVA_ONE', score: 4200, sector: 5, operative: 'NOVA', stars: 3, date: 'SEP 15' },
  { id: 'def-3', name: 'DESPERADO', score: 3650, sector: 6, operative: 'BILLY', stars: 3, date: 'SEP 16' },
  { id: 'def-4', name: 'ZENITH_ACE', score: 3100, sector: 4, operative: 'ZENITH', stars: 3, date: 'SEP 14' },
  { id: 'def-5', name: 'ATLAS_TANK', score: 2750, sector: 3, operative: 'ATLAS', stars: 2, date: 'SEP 13' },
  { id: 'def-6', name: 'LUMEN_STAR', score: 2400, sector: 3, operative: 'LUMEN', stars: 2, date: 'SEP 12' },
  { id: 'def-7', name: 'ORION_SCOUT', score: 1950, sector: 2, operative: 'NOVA', stars: 2, date: 'SEP 11' },
  { id: 'def-8', name: 'STARDUST', score: 1600, sector: 2, operative: 'BILLY', stars: 1, date: 'SEP 10' },
  { id: 'def-9', name: 'COSMIC_KID', score: 1250, sector: 1, operative: 'WYATT', stars: 1, date: 'SEP 09' },
  { id: 'def-10', name: 'ROOKIE_LEAPER', score: 800, sector: 1, operative: 'NOVA', stars: 1, date: 'SEP 08' }
]);

export class ScoreboardSystem {
  /**
   * Retrieves all high scores from storage, falling back to pre-seeded defaults
   * @param {number|null} [sectorFilter=null] Optional sector index filter (1-6)
   * @returns {Array<{id: string, name: string, score: number, sector: number, operative: string, stars: number, date: string, rank: number}>}
   */
  static getScores(sectorFilter = null) {
    let scores = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        scores = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[ScoreboardSystem] Failed to read localStorage, falling back to defaults:', e);
    }

    if (!Array.isArray(scores) || scores.length === 0) {
      scores = [...DEFAULT_HIGH_SCORES];
      this.saveScores(scores);
    }

    // Sort descending by score
    scores.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Optional sector filter
    if (typeof sectorFilter === 'number' && sectorFilter > 0) {
      scores = scores.filter(s => s.sector === sectorFilter);
    }

    // Assign dynamic 1-indexed ranks
    return scores.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }

  /**
   * Checks if a given score qualifies for the leaderboard (top 10)
   * @param {number} score
   * @param {number|null} [sectorFilter=null]
   * @returns {boolean}
   */
  static isHighScore(score, sectorFilter = null) {
    if (typeof score !== 'number' || score <= 0) return false;
    const currentScores = this.getScores(sectorFilter);
    if (currentScores.length < 10) return true;
    const lowestTopScore = currentScores[currentScores.length - 1].score;
    return score > lowestTopScore;
  }

  /**
   * Records a new score entry, sorts, trims to top 10, and persists to localStorage
   * @param {object} params
   * @param {string} [params.name] Player initials / handle
   * @param {number} params.score Final score
   * @param {number} params.sector Sector index (1-6)
   * @param {string} [params.operative='NOVA'] Character ID
   * @param {number} [params.stars=1] Earned star rating (1-3)
   * @returns {{ success: boolean, rank: number, isNewRecord: boolean, entry: object }}
   */
  static recordScore({ name, score, sector = 1, operative = 'NOVA', stars = 1 }) {
    if (typeof score !== 'number' || score <= 0) {
      return { success: false, rank: -1, isNewRecord: false, entry: null };
    }

    const cleanName = (name && typeof name === 'string' && name.trim().length > 0)
      ? name.trim().toUpperCase().substring(0, 10).replace(/[^A-Z0-9_-]/g, '')
      : this.getLastPlayerName() || operative.toUpperCase() || 'PLAYER';

    this.setLastPlayerName(cleanName);

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;

    const newEntry = {
      id: `score-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanName,
      score: Math.round(score),
      sector: Number(sector) || 1,
      operative: (operative || 'NOVA').toUpperCase(),
      stars: Math.max(1, Math.min(3, Number(stars) || 1)),
      date: dateStr
    };

    let scores = this.getScores(); // gets all unfiltered scores
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);

    // Find rank of new entry
    const rank = scores.findIndex(s => s.id === newEntry.id) + 1;
    const isTopScore = rank === 1;

    // Retain top 15 records in storage
    scores = scores.slice(0, 15);
    this.saveScores(scores);

    return {
      success: true,
      rank,
      isNewRecord: isTopScore,
      entry: newEntry
    };
  }

  /**
   * Retrieves player's personal best score
   * @returns {number}
   */
  static getPersonalBest() {
    const scores = this.getScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  /**
   * Resets scoreboard back to default arcade records
   */
  static resetDefaults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HIGH_SCORES));
      return [...DEFAULT_HIGH_SCORES];
    } catch (e) {
      console.warn('[ScoreboardSystem] Failed to reset defaults:', e);
      return [...DEFAULT_HIGH_SCORES];
    }
  }

  /**
   * Persists score array to localStorage
   * @private
   */
  static saveScores(scores) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      console.warn('[ScoreboardSystem] Failed to save scores to localStorage:', e);
    }
  }

  /**
   * Remembers last entered player handle
   * @returns {string}
   */
  static getLastPlayerName() {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY) || 'COWBOY';
    } catch (e) {
      return 'COWBOY';
    }
  }

  /**
   * Saves player handle
   * @param {string} name
   */
  static setLastPlayerName(name) {
    if (!name || typeof name !== 'string') return;
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name.trim().toUpperCase().substring(0, 10));
    } catch (e) {}
  }
}
