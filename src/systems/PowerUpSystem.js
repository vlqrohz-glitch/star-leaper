import { POWERUP_CONFIG, PowerUpType } from '../config/powerUpConfig.js';

/**
 * Dedicated Power-Up System for Star-Leaper: Orion Odyssey
 * Manages active effect state, duration countdown, character duration modifiers, and expiration
 */
export class PowerUpSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.activePowerUp = null;
    this.remainingTime = 0;
    this.totalDuration = 0;
  }

  /**
   * Activates a power-up effect or refreshes duration if already active
   * @param {string} type - Power-up type key (e.g. 'AEGIS_CORE', 'NOVA_BURST', etc.)
   * @param {number} [customDuration] - Optional custom duration in ms
   * @returns {boolean} Whether activation succeeded
   */
  activatePowerUp(type, customDuration) {
    // Sealed Stage 7 completion boundary: cannot activate after completion
    if (this.scene.levelCompletionSystem && this.scene.levelCompletionSystem.isLevelComplete()) {
      return false;
    }

    const config = POWERUP_CONFIG[type] || {};
    let duration = customDuration !== undefined ? customDuration : (config.duration || POWERUP_CONFIG.DEFAULT_DURATION);

    // Apply operative duration multiplier (e.g. Lumen +40%)
    if (this.scene.player && this.scene.player.characterProfile) {
      const mult = this.scene.player.characterProfile.getModifiers().powerUpDurationMultiplier || 1.0;
      duration = Math.round(duration * mult);
    }

    this.activePowerUp = type;
    this.totalDuration = duration;
    this.remainingTime = duration;

    // Apply immediate effect modifiers
    this.applyActiveEffects(type);

    // Dispatches reactive activation event
    this.scene.events.emit('POWERUP_ACTIVATED', {
      type: this.activePowerUp,
      duration: this.remainingTime
    });

    // Audio hook
    this.scene.events.emit('PLAY_SFX', 'powerup_activate');

    return true;
  }

  /**
   * Applies direct effect hooks to player/scene
   * @param {string} type
   */
  applyActiveEffects(type) {
    if (!this.scene || !this.scene.player) return;

    if (type === PowerUpType.GRAVITY_SHIFT) {
      this.scene.player.gravityModifier = 0.5;
    }
  }

  /**
   * Checks if any or a specific power-up is currently active
   * @param {string} [type] - Optional specific type to verify
   * @returns {boolean}
   */
  isPowerUpActive(type) {
    if (this.activePowerUp === null || this.remainingTime <= 0) {
      return false;
    }
    if (type) {
      return this.activePowerUp === type;
    }
    return true;
  }

  /**
   * Returns current active power-up type or null
   * @returns {string|null}
   */
  getActivePowerUp() {
    return this.isPowerUpActive() ? this.activePowerUp : null;
  }

  /**
   * Returns remaining duration in milliseconds
   * @returns {number}
   */
  getRemainingTime() {
    return Math.max(0, this.remainingTime);
  }

  /**
   * Advances active power-up timer
   * @param {number} delta - Frame delta in ms
   */
  update(delta) {
    // Freeze timers if level is complete or game over
    if (this.scene.levelCompletionSystem && this.scene.levelCompletionSystem.isLevelComplete()) {
      return;
    }
    if (this.scene.isGameOver) {
      return;
    }

    if (this.activePowerUp && this.remainingTime > 0) {
      this.remainingTime -= delta;

      if (this.remainingTime <= 0) {
        this.expire();
      }
    }
  }

  /**
   * Handles natural expiration of the active power-up
   */
  expire() {
    const expiredType = this.activePowerUp;
    this.activePowerUp = null;
    this.remainingTime = 0;
    this.totalDuration = 0;

    // Remove active effects
    if (this.scene && this.scene.player) {
      this.scene.player.gravityModifier = 1.0;
    }

    if (expiredType) {
      this.scene.events.emit('POWERUP_EXPIRED', {
        type: expiredType
      });

      // Audio hook
      this.scene.events.emit('PLAY_SFX', 'powerup_expire');
    }
  }

  /**
   * Resets active power-up state without emitting expiration event
   */
  reset() {
    this.activePowerUp = null;
    this.remainingTime = 0;
    this.totalDuration = 0;
    if (this.scene && this.scene.player) {
      this.scene.player.gravityModifier = 1.0;
    }
  }
}
