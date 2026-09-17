import { ENEMY_CONFIG, EnemyState } from '../config/enemyConfig.js';

/**
 * Enemy Entity - 'Drifter Drone'
 * Patrolling hostile drone that turns at platform edges and walls, and can be stomped.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [texture='drifter_drone']
   */
  constructor(scene, x, y, texture = 'drifter_drone') {
    super(scene, x, y, texture);

    this.scene = scene;
    this.initialX = x;
    this.initialY = y;
    this.config = ENEMY_CONFIG;

    // Movement & Direction
    this.direction = -1; // Start moving left (-1) or right (1)
    this.patrolSpeed = this.config.PATROL_SPEED;
    this.edgeMargin = this.config.EDGE_MARGIN;

    // State
    this.state = EnemyState.PATROLLING;
    this.currentPlatform = null;

    // Add to scene display and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics Bounding Box
    this.setSize(this.config.WIDTH, this.config.HEIGHT);
    this.setOffset(1, 1);
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.body.setGravityY(this.config.GRAVITY);
  }

  /**
   * Called on every frame by the scene
   * @param {number} delta Delta time in milliseconds
   */
  update(delta) {
    if (this.state !== EnemyState.PATROLLING) return;

    // 1. Maintain horizontal patrol velocity
    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction > 0);

    // 2. Wall Collision Check
    if (this.body.blocked.left && this.direction < 0) {
      this.reverseDirection();
    } else if (this.body.blocked.right && this.direction > 0) {
      this.reverseDirection();
    }

    // 3. Platform Edge Detection
    this.checkPlatformEdge();
  }

  /**
   * Track supporting platform when resting on it
   * @param {Phaser.GameObjects.GameObject} platform
   */
  onPlatformCollide(platform) {
    if (platform && (this.body.blocked.down || this.body.touching.down)) {
      this.currentPlatform = platform;
    }
  }

  /**
   * Detects when the drone's leading edge exceeds the supporting platform boundaries
   */
  checkPlatformEdge() {
    if (!this.currentPlatform) return;

    // Only check when grounded
    const isGrounded = this.body.blocked.down || this.body.touching.down;
    if (!isGrounded) return;

    const plat = this.currentPlatform;
    const platLeft = plat.x - (plat.width / 2);
    const platRight = plat.x + (plat.width / 2);

    const leadingEdgeX = this.x + (this.direction * this.edgeMargin);

    // If leading edge steps beyond platform bounds, turn around immediately
    if (this.direction < 0 && leadingEdgeX <= platLeft) {
      this.reverseDirection();
    } else if (this.direction > 0 && leadingEdgeX >= platRight) {
      this.reverseDirection();
    }
  }

  /**
   * Reverses horizontal patrol direction
   */
  reverseDirection() {
    this.direction *= -1;
    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction > 0);
  }

  /**
   * Called when stomped by the player
   * @returns {number|null} Score value awarded, or null if already defeated
   */
  defeat() {
    if (this.state === EnemyState.DEFEATED) {
      return null;
    }

    this.state = EnemyState.DEFEATED;

    // Immediately disable physics body to prevent repeated hits
    this.body.enable = false;
    this.setVelocity(0, 0);

    // Spawn floating score popup (+200)
    this.spawnScorePopup();

    // Defeat animation (squash flat, flash, fade out)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 0.25,
      alpha: 0,
      duration: this.config.DEFEAT_ANIM_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
      }
    });

    // Notify scene and score system
    this.scene.events.emit('ENEMY_DEFEATED', {
      enemy: this,
      score: this.config.DEFEAT_SCORE,
      x: this.x,
      y: this.y
    });

    return this.config.DEFEAT_SCORE;
  }

  /**
   * Spawns floating score label (+200)
   */
  spawnScorePopup() {
    const popup = this.scene.add.text(this.x, this.y - 12, `+${this.config.DEFEAT_SCORE}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 24,
      alpha: 0,
      duration: 650,
      ease: 'Power1',
      onComplete: () => {
        popup.destroy();
      }
    });
  }

  /**
   * Restores enemy to original position and active patrol state
   * @param {number} [x]
   * @param {number} [y]
   */
  reset(x = this.initialX, y = this.initialY) {
    this.scene.tweens.killTweensOf(this);

    this.setPosition(x, y);
    this.setScale(1, 1);
    this.setAlpha(1);
    this.setVisible(true);
    this.state = EnemyState.PATROLLING;
    this.direction = -1;
    this.currentPlatform = null;

    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
      this.setVelocity(0, 0);
    }
  }

  isActive() {
    return this.state === EnemyState.PATROLLING;
  }

  getState() {
    return this.state;
  }
}
