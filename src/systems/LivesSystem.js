import { HEALTH_CONFIG } from '../config/playerHealthConfig.js';

/**
 * Dedicated Lives System
 * Manages player attempt allocations, life deduction, and Game Over triggers
 */
export class LivesSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} [startingLives=HEALTH_CONFIG.STARTING_LIVES]
   */
  constructor(scene, startingLives = HEALTH_CONFIG.STARTING_LIVES) {
    this.scene = scene;
    this.startingLives = startingLives;
    this.lives = startingLives;
  }

  /**
   * Deducts one life
   * @returns {number} Remaining lives
   */
  loseLife() {
    if (this.lives > 0) {
      this.lives--;
    }

    this.scene.events.emit('LIVES_CHANGED', {
      lives: this.lives
    });

    if (this.lives <= 0) {
      this.scene.events.emit('GAME_OVER', {
        lives: this.lives
      });
    }

    return this.lives;
  }

  /**
   * Adds extra lives
   * @param {number} [amount=1]
   */
  addLife(amount = 1) {
    if (amount > 0) {
      this.lives += amount;
      this.scene.events.emit('LIVES_CHANGED', {
        lives: this.lives
      });
    }
  }

  getLives() {
    return this.lives;
  }

  hasLivesRemaining() {
    return this.lives > 0;
  }

  /**
   * Fully resets lives back to starting allocation
   */
  reset() {
    this.lives = this.startingLives;
    this.scene.events.emit('LIVES_CHANGED', {
      lives: this.lives
    });
  }
}
