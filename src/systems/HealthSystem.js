import { HEALTH_CONFIG } from '../config/playerHealthConfig.js';

/**
 * Dedicated Health System
 * Manages player shield/health capacity, damage deduction, and death triggers
 */
export class HealthSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} [maxHealth=HEALTH_CONFIG.MAX_HEALTH]
   */
  constructor(scene, maxHealth = HEALTH_CONFIG.MAX_HEALTH) {
    this.scene = scene;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.isDeadState = false;
  }

  /**
   * Deducts damage from current health
   * @param {number} [amount=HEALTH_CONFIG.DAMAGE_PER_HIT]
   * @param {string} [source='enemy']
   * @returns {number} Remaining health
   */
  takeDamage(amount = HEALTH_CONFIG.DAMAGE_PER_HIT, source = 'enemy') {
    if (this.isDeadState || amount <= 0) {
      return this.health;
    }

    // Stage 8: Check if Aegis Core power-up protects against enemy damage
    if (source === 'enemy' && this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
      this.scene.events.emit('DAMAGE_PREVENTED', {
        source: source,
        powerUp: 'AEGIS_CORE'
      });
      return this.health;
    }

    this.health = Math.max(HEALTH_CONFIG.MINIMUM_HEALTH, this.health - amount);

    // Emit reactive health changed event
    this.scene.events.emit('HEALTH_CHANGED', {
      health: this.health,
      maxHealth: this.maxHealth,
      amount: -amount,
      source: source
    });

    // Check for depletion
    if (this.health <= HEALTH_CONFIG.MINIMUM_HEALTH && !this.isDeadState) {
      this.isDeadState = true;
      this.scene.events.emit('PLAYER_DIED', {
        health: this.health,
        source: source
      });
    }

    return this.health;
  }

  /**
   * Restores health up to maximum capacity
   * @param {number} amount
   */
  heal(amount) {
    if (amount <= 0) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
    if (this.health > HEALTH_CONFIG.MINIMUM_HEALTH) {
      this.isDeadState = false;
    }

    this.scene.events.emit('HEALTH_CHANGED', {
      health: this.health,
      maxHealth: this.maxHealth,
      amount: amount,
      source: 'heal'
    });
  }

  getHealth() {
    return this.health;
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  isDead() {
    return this.isDeadState || this.health <= HEALTH_CONFIG.MINIMUM_HEALTH;
  }

  canTakeDamage() {
    return !this.isDead();
  }

  setHealth(value) {
    this.health = Phaser.Math.Clamp(value, HEALTH_CONFIG.MINIMUM_HEALTH, this.maxHealth);
    this.isDeadState = (this.health <= HEALTH_CONFIG.MINIMUM_HEALTH);
    this.scene.events.emit('HEALTH_CHANGED', {
      health: this.health,
      maxHealth: this.maxHealth,
      amount: 0,
      source: 'set'
    });
  }

  /**
   * Resets health to maximum starting capacity
   */
  reset() {
    this.health = this.maxHealth;
    this.isDeadState = false;
    this.scene.events.emit('HEALTH_CHANGED', {
      health: this.health,
      maxHealth: this.maxHealth,
      amount: 0,
      source: 'reset'
    });
  }
}
