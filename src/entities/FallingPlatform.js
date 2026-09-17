/**
 * FallingPlatform - Platform that trembles and drops after player lands on it,
 * then respawns at its origin after a cooldown.
 */
export class FallingPlatform extends Phaser.GameObjects.TileSprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {object} config - { delay, respawnDelay, texture }
   */
  constructor(scene, x, y, width = 96, height = 20, config = {}) {
    const texture = config.texture || 'falling_platform';
    super(scene, x, y, width, height, texture);

    this.scene = scene;
    this.startX = x;
    this.startY = y;
    this.collapseDelay = config.delay || 400; // ms to shake before falling
    this.respawnDelay = config.respawnDelay || 3200; // ms before reappearing

    this.isTriggered = false;
    this.isFalling = false;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
  }

  /**
   * Called when player lands on top of this platform
   */
  trigger() {
    if (this.isTriggered || this.isFalling) return;
    this.isTriggered = true;

    // Subtle vibration / trembling effect
    this.scene.tweens.add({
      targets: this,
      x: this.startX + 2,
      duration: 40,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.drop();
      }
    });
  }

  drop() {
    this.isFalling = true;
    if (this.body) {
      this.body.enable = false; // Disable collision so player drops through
    }

    // Fall animation
    this.scene.tweens.add({
      targets: this,
      y: this.startY + 160,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        this.scene.time.delayedCall(this.respawnDelay, () => {
          this.respawn();
        });
      }
    });
  }

  respawn() {
    this.scene.tweens.killTweensOf(this);
    this.setPosition(this.startX, this.startY);
    this.setAlpha(0);
    this.setVisible(true);
    this.isTriggered = false;
    this.isFalling = false;

    if (this.body) {
      this.body.reset(this.startX, this.startY);
      this.body.enable = true;
    }

    // Smooth materialization fade
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power1'
    });
  }

  reset() {
    this.respawn();
  }
}
