/**
 * LaunchPad - Springboard/thruster pad that launches player high into the air
 */
export class LaunchPad extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [force=-540]
   */
  constructor(scene, x, y, force = -540) {
    super(scene, x, y, 'launch_pad');

    this.scene = scene;
    this.launchForce = force;
    this.cooldown = false;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    this.setSize(34, 12);
    this.setOffset(1, 2);
  }

  /**
   * Launches the player upward with visual squash and feedback
   * @param {import('./Player.js').Player} player
   */
  launch(player) {
    if (this.cooldown || !player || !player.body) return;
    this.cooldown = true;

    // Apply launch impulse
    player.setVelocityY(this.launchForce);
    player.isJumping = true;
    player.hasJumpCutoff = false;
    player.jumpCount = 1; // Allows a second jump at apex
    player.triggerSquashAndStretch(0.7, 1.35);

    // Launch pad visual compression and flash
    this.setScale(1.2, 0.5);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.cooldown = false;
      }
    });

    // Audio & Feedback
    this.scene.events.emit('PLAY_SFX', 'launch_pad');
    if (this.scene.feedbackSystem) {
      this.scene.feedbackSystem.screenShake(0.005, 80);
    }
  }

  reset() {
    this.cooldown = false;
    this.setScale(1, 1);
  }
}
