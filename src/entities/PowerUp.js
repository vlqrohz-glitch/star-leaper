import { POWERUP_CONFIG, PowerUpState, PowerUpType } from '../config/powerUpConfig.js';

/**
 * Collectible Power-Up Entity
 * Represents physical energy artifacts spawned in the level world
 */
export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [type=PowerUpType.AEGIS_CORE]
   */
  constructor(scene, x, y, type = PowerUpType.AEGIS_CORE) {
    const config = POWERUP_CONFIG[type] || POWERUP_CONFIG.AEGIS_CORE;
    super(scene, x, y, config.texture);

    this.scene = scene;
    this.initialX = x;
    this.initialY = y;
    this.type = type;
    this.config = config;
    this.state = PowerUpState.AVAILABLE;
    this.bobTimer = Math.random() * Math.PI * 2;

    // Add to scene and Arcade Physics as kinematic body
    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    if (this.body) {
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.moves = false;
      this.body.setSize(POWERUP_CONFIG.COLLECTION_RADIUS, POWERUP_CONFIG.COLLECTION_RADIUS);
      this.body.setOffset(2, 2);
    }
  }

  /**
   * Per-frame idle floating bobbing animation
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    if (this.state === PowerUpState.AVAILABLE) {
      this.bobTimer += delta * POWERUP_CONFIG.SPAWN_BOB_SPEED;
      this.y = this.initialY + Math.sin(this.bobTimer) * POWERUP_CONFIG.SPAWN_BOB_DISTANCE;
      if (this.body) {
        this.body.updateFromGameObject();
      }
    }
  }

  /**
   * Collects the power-up, triggers effect, and starts pickup feedback animation
   * @returns {boolean} Whether collection was successful
   */
  collect() {
    if (this.state !== PowerUpState.AVAILABLE) {
      return false;
    }

    // Sealed completion boundary guard
    if (this.scene.levelCompletionSystem && this.scene.levelCompletionSystem.isLevelComplete()) {
      return false;
    }

    this.state = PowerUpState.COLLECTING;

    // Disable physics immediately to prevent duplicate collision
    if (this.body) {
      this.body.enable = false;
    }

    // Emit collection event & SFX hook
    this.scene.events.emit('POWERUP_COLLECTED', {
      type: this.type,
      x: this.x,
      y: this.y
    });
    this.scene.events.emit('PLAY_SFX', 'powerup_collect');

    // Activate effect in system
    if (this.scene.powerUpSystem) {
      this.scene.powerUpSystem.activatePowerUp(this.type);
    }

    // Pickup scale-pop and fade animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      y: this.y - 14,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.state = PowerUpState.COLLECTED;
        this.setVisible(false);
      }
    });

    return true;
  }

  isAvailable() {
    return this.state === PowerUpState.AVAILABLE;
  }

  /**
   * Resets power-up entity to original spawn location and available state
   */
  reset() {
    this.scene.tweens.killTweensOf(this);
    this.setPosition(this.initialX, this.initialY);
    this.setScale(1, 1);
    this.setAlpha(1);
    this.setVisible(true);
    this.state = PowerUpState.AVAILABLE;
    this.bobTimer = 0;

    if (this.body) {
      this.body.enable = true;
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.moves = false;
      this.body.setVelocity(0, 0);
      this.body.updateFromGameObject();
    }
  }
}
