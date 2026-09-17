/**
 * Dynamite Entity - Arcing fuse-blinking explosive thrown by Dynamite Bandits
 */
export class Dynamite extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} vx Initial horizontal impulse
   * @param {number} vy Initial upward impulse
   */
  constructor(scene, x, y, vx = -140, vy = -220) {
    super(scene, x, y, 'dynamite');

    this.scene = scene;
    this.isDynamite = true;
    this.blastRadius = 52;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(12, 12);
    this.setBounce(0.45);
    this.setCollideWorldBounds(true);
    this.body.setGravityY(550);
    this.setVelocity(vx, vy);
    this.setAngularVelocity(vx > 0 ? 240 : -240);
    this.setDepth(15);

    // Fuse flicker timer
    this.fuseTimer = scene.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        if (!this.active) return;
        this.setTint(this.isTinted ? 0xffffff : 0xff2222);
      }
    });

    // Detonate after 1.8 seconds
    this.detonateTimer = scene.time.delayedCall(1800, () => {
      this.detonate();
    });
  }

  detonate() {
    if (!this.active) return;

    if (this.fuseTimer) this.fuseTimer.remove(false);
    if (this.detonateTimer) this.detonateTimer.remove(false);

    const bx = this.x;
    const by = this.y;

    // Visual Explosion Wave
    const blast = this.scene.add.circle(bx, by, 12, 0xff4422, 0.9);
    blast.setStrokeStyle(3, 0xfacc15, 1);
    blast.setDepth(17);

    this.scene.tweens.add({
      targets: blast,
      scale: 3.8,
      alpha: 0,
      duration: 320,
      onComplete: () => blast.destroy()
    });

    // Smoke particles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const smoke = this.scene.add.circle(bx, by, 4, 0x64748b, 0.7);
      smoke.setDepth(16);
      this.scene.tweens.add({
        targets: smoke,
        x: bx + Math.cos(angle) * 35,
        y: by + Math.sin(angle) * 35,
        alpha: 0,
        duration: 380,
        onComplete: () => smoke.destroy()
      });
    }

    // Camera rumble
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(160, 0.008);
    }

    // Proximity Damage Check to Player
    if (this.scene.player && this.scene.player.active) {
      const dist = Phaser.Math.Distance.Between(bx, by, this.scene.player.x, this.scene.player.y);
      if (dist <= this.blastRadius) {
        if (this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
          this.scene.handleDamagePrevented();
        } else {
          this.scene.player.handleEnemyHit({ x: bx, y: by });
        }
      }
    }

    this.destroy();
  }
}
