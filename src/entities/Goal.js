/**
 * Goal Entity - 'Warp Gate Beacon'
 * Interactive level completion marker with energetic pulsing and completion triggers
 */
export class Goal extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [texture='goal_marker']
   */
  constructor(scene, x, y, texture = 'goal_marker') {
    super(scene, x, y, texture);

    this.scene = scene;
    this.initialX = x;
    this.initialY = y;
    this.goalState = 'ACTIVE'; // 'ACTIVE', 'TRIGGERED', 'COMPLETED'

    // Add to scene and physics engine
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Generous collision bounding box for player contact
    this.setSize(36, 64);
    this.setOffset(-2, 0);

    // Start idle beacon pulse
    this.startIdleAnimation();
  }

  startIdleAnimation() {
    this.stopIdleAnimation();
    this.idleTween = this.scene.tweens.add({
      targets: this,
      scaleY: 1.08,
      y: this.initialY - 4,
      yoyo: true,
      repeat: -1,
      duration: 1200,
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
   * Triggers the goal beacon completion animation
   * @returns {boolean} Whether the goal was successfully triggered
   */
  trigger() {
    if (this.goalState !== 'ACTIVE') {
      return false;
    }

    this.goalState = 'TRIGGERED';
    this.stopIdleAnimation();

    // Visual feedback: expansion pulse and camera flash
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 350,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.goalState = 'COMPLETED';
      }
    });

    // Camera celebratory cyan flash
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.flash(400, 0, 240, 255);
    }

    // Audio hook for Stage 10
    this.scene.events.emit('PLAY_SFX', 'level_complete');

    return true;
  }

  isActive() {
    return this.goalState === 'ACTIVE';
  }

  getState() {
    return this.goalState;
  }

  /**
   * Resets goal beacon for fresh level attempts
   */
  reset() {
    this.stopIdleAnimation();
    this.scene.tweens.killTweensOf(this);

    this.setPosition(this.initialX, this.initialY);
    this.setScale(1, 1);
    this.setAlpha(1);
    this.goalState = 'ACTIVE';

    if (this.body) {
      this.body.enable = true;
    }

    this.startIdleAnimation();
  }
}
