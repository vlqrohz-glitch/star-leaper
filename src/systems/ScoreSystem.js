import { ShopSystem } from './ShopSystem.js';

/**
 * Dedicated Score & Game State System
 * Manages player score, collectible tracking, and awards with Star Surge multiplier support
 */
export class ScoreSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} [totalCollectibles=0]
   */
  constructor(scene, totalCollectibles = 0) {
    this.scene = scene;
    this.score = 0;
    this.collectedCount = 0;
    this.totalCollectibles = totalCollectibles;

    // Listen to scene-wide collection events
    this.bindEvents();
  }

  bindEvents() {
    this.onCollectionHandler = (data) => {
      this.onCollectibleCollected(data);
    };
    this.scene.events.on('COLLECTIBLE_COLLECTED', this.onCollectionHandler);

    this.onEnemyDefeatedHandler = (data) => {
      const value = (data && typeof data.score === 'number') ? data.score : 200;
      this.addScore(value);
      this.scene.events.emit('SCORE_CHANGED', {
        score: this.score,
        collectedCount: this.collectedCount,
        totalCount: this.totalCollectibles
      });
    };
    this.scene.events.on('ENEMY_DEFEATED', this.onEnemyDefeatedHandler);
  }

  unbindEvents() {
    if (this.onCollectionHandler) {
      this.scene.events.off('COLLECTIBLE_COLLECTED', this.onCollectionHandler);
    }
    if (this.onEnemyDefeatedHandler) {
      this.scene.events.off('ENEMY_DEFEATED', this.onEnemyDefeatedHandler);
    }
  }

  /**
   * Handle incoming collectible event with Star Surge multiplier support
   * @param {{ collectible: any, value: number }} data
   */
  onCollectibleCollected(data) {
    let value = (data && typeof data.value === 'number') ? data.value : 100;

    // Star Surge power-up doubles crystal points
    if (this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive('STAR_SURGE')) {
      value *= 2;
    }

    // Lucky Stars perk: +50 score bonus and +1 extra credit
    let creditAward = 1;
    const perk = ShopSystem.getEquippedPerk();
    if (perk && perk.id === 'lucky_stars') {
      value += 50;
      creditAward += 1;
    }
    ShopSystem.addCrystals(creditAward);

    this.addScore(value);
    this.collectedCount++;

    this.scene.events.emit('SCORE_CHANGED', {
      score: this.score,
      collectedCount: this.collectedCount,
      totalCount: this.totalCollectibles
    });
  }

  /**
   * Adds points to total score
   * @param {number} amount
   */
  addScore(amount) {
    if (amount > 0) {
      this.score += amount;
    }
  }

  getScore() {
    return this.score;
  }

  getCollectedCount() {
    return this.collectedCount;
  }

  getTotalCount() {
    return this.totalCollectibles;
  }

  getRemainingCount() {
    return Math.max(0, this.totalCollectibles - this.collectedCount);
  }

  setTotal(total) {
    this.totalCollectibles = total;
  }

  /**
   * Resets score and counts to zero for full level restart
   */
  reset() {
    this.score = 0;
    this.collectedCount = 0;
    this.scene.events.emit('SCORE_CHANGED', {
      score: this.score,
      collectedCount: this.collectedCount,
      totalCount: this.totalCollectibles
    });
  }
}
