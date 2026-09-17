/**
 * Bullet Entity - High-velocity projectile fired by Gunslingers
 */
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} dir -1 for left, 1 for right
   */
  constructor(scene, x, y, dir = -1) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.dir = dir;
    this.speed = 280;
    this.isBullet = true;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(10, 6);
    this.body.setAllowGravity(false);
    this.setVelocityX(this.dir * this.speed);
    this.setFlipX(this.dir > 0);
    this.setDepth(15);

    // Self-destruct after 3.2s
    this.lifespanTimer = scene.time.delayedCall(3200, () => {
      this.explode(false);
    });
  }

  explode(hit = false) {
    if (!this.active) return;
    if (this.lifespanTimer) {
      this.lifespanTimer.remove(false);
    }

    // Visual impact burst
    const burst = this.scene.add.circle(this.x, this.y, 6, 0xfacc15, 0.9);
    burst.setDepth(16);
    this.scene.tweens.add({
      targets: burst,
      scale: 1.8,
      alpha: 0,
      duration: 180,
      onComplete: () => burst.destroy()
    });

    this.destroy();
  }
}
