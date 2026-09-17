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

    // Health & Health Bar (24px wide, visibly shorter than player's 48px bar)
    this.maxHealth = this.config.BASE_HEALTH || 15;
    this.currentHealth = this.maxHealth;
    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(16);

    // Physics Bounding Box
    this.setSize(this.config.WIDTH, this.config.HEIGHT);
    this.setOffset(1, 1);
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.body.setGravityY(this.config.GRAVITY);
    this.renderHealthBar();
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

    // 4. Track overhead health bar position
    this.updateHealthBarPosition();
  }

  /**
   * Repositions overhead health bar directly above enemy sprite
   */
  updateHealthBarPosition() {
    if (!this.healthBar || !this.active) return;
    this.healthBar.setPosition(this.x, this.y);
  }

  /**
   * Renders compact overhead health bar (24px, shorter than player's 48px bar)
   */
  renderHealthBar() {
    if (!this.healthBar) return;
    this.healthBar.clear();

    if (this.state === EnemyState.DEFEATED || !this.visible) {
      return;
    }

    const barW = this.config.HEALTH_BAR_WIDTH || 24;
    const barH = this.config.HEALTH_BAR_HEIGHT || 3.5;
    const offX = -barW / 2;
    const offY = -(this.height / 2 + 8);

    // Background box
    this.healthBar.fillStyle(0x000000, 0.75);
    this.healthBar.fillRect(offX - 1, offY - 1, barW + 2, barH + 2);
    this.healthBar.fillStyle(0x0f172a, 0.9);
    this.healthBar.fillRect(offX, offY, barW, barH);

    // Health Fill
    const safeMax = Math.max(1, this.maxHealth);
    const safeHp = Math.max(0, Math.min(safeMax, this.currentHealth));
    const ratio = safeHp / safeMax;
    const fillW = Math.round(barW * ratio);

    if (fillW > 0) {
      let fillColor = 0x22c55e;
      if (ratio <= 0.3) {
        fillColor = 0xef4444;
      } else if (ratio <= 0.6) {
        fillColor = 0xf59e0b;
      }
      this.healthBar.fillStyle(fillColor, 1);
      this.healthBar.fillRect(offX, offY, fillW, barH);
    }

    // Border
    this.healthBar.lineStyle(1, 0x475569, 0.85);
    this.healthBar.strokeRect(offX, offY, barW, barH);

    this.healthBar.setPosition(this.x, this.y);
  }

  /**
   * Inflicts damage onto the enemy, updating its health bar
   * @param {number} [amount=10] Damage dealt
   * @returns {number} Remaining health
   */
  takeDamage(amount = 10) {
    if (this.state === EnemyState.DEFEATED || !this.active) return 0;
    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // Visual damage reaction flash
    this.setTint(0xff5555);
    this.scene.time.delayedCall(90, () => {
      if (this.active) this.clearTint();
    });

    this.renderHealthBar();

    if (this.currentHealth <= 0) {
      if (this.healthBar) {
        this.healthBar.destroy();
        this.healthBar = null;
      }
      this.defeat();
    }
    return this.currentHealth;
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

    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }

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

    this.currentHealth = this.maxHealth;
    if (!this.healthBar && this.scene) {
      this.healthBar = this.scene.add.graphics();
      this.healthBar.setDepth(16);
    }
    this.renderHealthBar();

    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
      this.setVelocity(0, 0);
    }
  }

  destroy(fromScene) {
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    super.destroy(fromScene);
  }

  isActive() {
    return this.state === EnemyState.PATROLLING;
  }

  getState() {
    return this.state;
  }
}
