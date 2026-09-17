import { COLLECTIBLE_CONFIG, CollectibleState } from '../config/collectibleConfig.js';

/**
 * Collectible Entity - 'Star Crystal'
 * Reusable collectible item with idle bobbing, collision overlap, and collection animation
 */
export class Collectible extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [type='star_crystal']
   * @param {number} [value=COLLECTIBLE_CONFIG.DEFAULT_VALUE]
   */
  constructor(scene, x, y, type = 'star_crystal', value = COLLECTIBLE_CONFIG.DEFAULT_VALUE) {
    super(scene, x, y, type);

    this.scene = scene;
    this.initialX = x;
    this.initialY = y;
    this.value = value;
    this.collectibleType = type;
    this.state = CollectibleState.ACTIVE;

    // Add to scene rendering and physics
    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    // Static/kinematic physics setup
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    this.body.setCircle(COLLECTIBLE_CONFIG.COLLISION_RADIUS, 0, 2);

    // Start idle floating animation
    this.startIdleAnimation();
  }

  startIdleAnimation() {
    this.stopIdleAnimation();
    this.idleTween = this.scene.tweens.add({
      targets: this,
      y: this.initialY - COLLECTIBLE_CONFIG.BOB_DISTANCE,
      duration: COLLECTIBLE_CONFIG.BOB_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  stopIdleAnimation() {
    if (this.idleTween) {
      this.idleTween.stop();
      this.idleTween = null;
    }
  }

  /**
   * Called when player overlaps this collectible
   * @returns {number|null} Awarded score value, or null if already collected
   */
  collect() {
    // Prevent duplicate collection
    if (this.state !== CollectibleState.ACTIVE) {
      return null;
    }

    this.state = CollectibleState.COLLECTING;

    // Immediately disable physics body to block any further collision checks
    this.body.enable = false;
    this.stopIdleAnimation();

    // Trigger placeholder audio event hook
    this.scene.events.emit('PLAY_SFX', 'collect_crystal');

    // Spawn floating score popup (+100)
    this.spawnScorePopup();

    // Collection visual effect (scale-up, rise, fade out)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      y: this.y - 18,
      alpha: 0,
      duration: COLLECTIBLE_CONFIG.ANIM_DURATION,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.state = CollectibleState.COLLECTED;
        this.setVisible(false);
      }
    });

    // Notify scene and score system
    this.scene.events.emit('COLLECTIBLE_COLLECTED', {
      collectible: this,
      value: this.value,
      type: this.collectibleType,
      x: this.x,
      y: this.y
    });

    return this.value;
  }

  /**
   * Floating floating score text pop-up
   */
  spawnScorePopup() {
    const popup = this.scene.add.text(this.x, this.y - 10, `+${this.value}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 24,
      alpha: 0,
      duration: 600,
      ease: 'Power1',
      onComplete: () => {
        popup.destroy();
      }
    });
  }

  /**
   * Fully restores collectible to original active state for level restarts
   */
  reset() {
    this.stopIdleAnimation();
    this.scene.tweens.killTweensOf(this);

    this.setPosition(this.initialX, this.initialY);
    this.setScale(1, 1);
    this.setAlpha(1);
    this.setVisible(true);
    this.state = CollectibleState.ACTIVE;
    this.body.enable = true;
    if (this.body) {
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.moves = false;
      this.body.setVelocity(0, 0);
    }

    this.startIdleAnimation();
  }
}
