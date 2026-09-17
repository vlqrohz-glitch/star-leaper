/**
 * Dedicated Level Completion System
 * Manages goal activation, level complete state, star ratings, and completion statistics
 */
export class LevelCompletionSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.completed = false;
    this.stats = null;
  }

  /**
   * Calculates star rating (1 to 3 stars) based on level performance metrics
   * @param {object} stats Performance snapshot
   * @returns {number} 1, 2, or 3 stars
   */
  calculateStars(stats = {}) {
    // Guaranteed 1 star for clearing the sector
    let stars = 1;

    const crystalPct = (stats.crystalsTotal && stats.crystalsTotal > 0)
      ? (stats.crystalsCollected / stats.crystalsTotal)
      : 1;
    const enemyPct = (stats.enemiesTotal && stats.enemiesTotal > 0)
      ? (stats.enemiesDefeated / stats.enemiesTotal)
      : 0;
    const lives = stats.livesRemaining !== undefined ? stats.livesRemaining : 1;
    const score = stats.score || 0;

    // 2 Stars (Stellar Recon): >= 60% crystals and >= 2 lives, or >= 75% crystals, or score >= 1200
    if ((crystalPct >= 0.60 && lives >= 2) || crystalPct >= 0.75 || score >= 1200) {
      stars = 2;
    }

    // 3 Stars (Orion Master):
    // - >= 85% crystals and all 3 lives intact, OR
    // - >= 80% crystals and >= 75% enemies defeated, OR
    // - >= 95% crystals collected, OR
    // - score >= 2200
    if (
      (crystalPct >= 0.85 && lives >= 3) ||
      (crystalPct >= 0.80 && enemyPct >= 0.75) ||
      (crystalPct >= 0.95) ||
      (score >= 2200)
    ) {
      stars = 3;
    }

    return Math.max(1, Math.min(3, stars));
  }

  /**
   * Returns display metadata for a given star count
   * @param {number} stars 1, 2, or 3
   * @returns {{ title: string, badge: string, color: string, description: string }}
   */
  static getStarRatingMeta(stars) {
    switch (stars) {
      case 3:
        return {
          title: 'ORION MASTER',
          badge: '★★★',
          color: '#ffdd44',
          description: 'Flawless exploration & survival!'
        };
      case 2:
        return {
          title: 'STELLAR RECON',
          badge: '★★☆',
          color: '#38bdf8',
          description: 'Superb crystal collection & agility!'
        };
      case 1:
      default:
        return {
          title: 'SECTOR CLEAR',
          badge: '★☆☆',
          color: '#00f0ff',
          description: 'Mission completed successfully!'
        };
    }
  }

  /**
   * Saves earned stars for a specific level to localStorage
   * @param {number} levelIndex
   * @param {number} stars
   */
  static saveStars(levelIndex, stars) {
    try {
      const raw = localStorage.getItem('starleaper_level_stars');
      const data = raw ? JSON.parse(raw) : {};
      const prev = data[levelIndex] || 0;
      if (stars > prev) {
        data[levelIndex] = stars;
        localStorage.setItem('starleaper_level_stars', JSON.stringify(data));
      }
      return data;
    } catch (e) {
      return { [levelIndex]: stars };
    }
  }

  /**
   * Gets highest earned stars for a level from localStorage
   * @param {number} levelIndex
   * @returns {number} 0-3
   */
  static getSavedStars(levelIndex) {
    try {
      const raw = localStorage.getItem('starleaper_level_stars');
      const data = raw ? JSON.parse(raw) : {};
      return data[levelIndex] || 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Completes the level with snapshot statistics and star rating
   * @param {object} stats
   * @returns {boolean} Whether completion was registered (false if already completed)
   */
  completeLevel(stats = {}) {
    // Enforce single-fire guard
    if (this.completed) {
      return false;
    }

    this.completed = true;

    const baseStats = {
      score: stats.score || 0,
      crystalsCollected: stats.crystalsCollected || 0,
      crystalsTotal: stats.crystalsTotal || 0,
      enemiesDefeated: stats.enemiesDefeated || 0,
      enemiesTotal: stats.enemiesTotal || 0,
      livesRemaining: stats.livesRemaining || 0,
      healthRemaining: stats.healthRemaining || 0,
      completedAt: Date.now()
    };

    // Calculate performance stars (1 to 3)
    const stars = this.calculateStars(baseStats);
    baseStats.stars = stars;

    // Persist highest stars for current sector
    const currentLvl = (this.scene && this.scene.levelIndex) ? this.scene.levelIndex : 1;
    LevelCompletionSystem.saveStars(currentLvl, stars);

    this.stats = baseStats;

    // Emit event for GameScene and UI presentation
    this.scene.events.emit('LEVEL_COMPLETE', this.stats);

    return true;
  }

  isLevelComplete() {
    return this.completed;
  }

  getCompletionStats() {
    return this.stats;
  }

  getStars() {
    return this.stats ? (this.stats.stars || 1) : 0;
  }

  /**
   * Resets level completion state for fresh level attempts
   */
  reset() {
    this.completed = false;
    this.stats = null;
  }
}
