/**
 * Companion Pet Entity for Star-Leaper: Orion Odyssey
 * Autonomous cosmetic pet that follows the player with smooth physics,
 * harmonic floating bobbing, and orientation matching.
 */
export class Pet extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./Player.js').Player} player
   * @param {string} [petId='pet_cosmo']
   */
  constructor(scene, player, petId = 'pet_cosmo') {
    super(scene, player ? player.x - 24 : 0, player ? player.y - 14 : 0, petId);

    this.scene = scene;
    this.player = player;
    this.petId = petId;
    this.bobTimer = 0;
    this.stardustTimer = 0;

    this.setDepth(14);
    this.scene.add.existing(this);
  }

  /**
   * Updates pet position relative to player each frame
   * @param {number} delta Delta time in milliseconds
   */
  update(delta) {
    if (!this.player || !this.player.active) {
      this.setVisible(false);
      return;
    }

    this.setVisible(true);

    // Follow target offset (drifts behind the player depending on facing direction)
    const isFacingRight = !this.player.flipX;
    const targetOffsetX = isFacingRight ? -26 : 26;
    const targetOffsetY = -16;

    const targetX = this.player.x + targetOffsetX;
    const targetY = this.player.y + targetOffsetY;

    // Smooth lag-follow interpolation
    this.x = Phaser.Math.Linear(this.x, targetX, 0.08);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.08);

    // Harmonic floating bobbing
    this.bobTimer += delta * 0.003;
    this.y += Math.sin(this.bobTimer) * 0.35;

    // Match facing orientation with player
    this.setFlipX(!isFacingRight);

    // Subtle stardust emission when player is in motion
    this.stardustTimer += delta;
    if (this.stardustTimer > 180 && this.player.body && Math.abs(this.player.body.velocity.x) > 30) {
      this.stardustTimer = 0;
      this.emitStardust();
    }
  }

  emitStardust() {
    const p = this.scene.add.circle(this.x + (Math.random() * 8 - 4), this.y + (Math.random() * 8 - 4), 1.5, 0x38bdf8, 0.8);
    p.setDepth(13);
    this.scene.tweens.add({
      targets: p,
      alpha: 0,
      y: p.y - 12,
      duration: 350,
      ease: 'Power1',
      onComplete: () => p.destroy()
    });
  }

  setPetId(petId) {
    this.petId = petId;
    if (this.scene.textures.exists(petId)) {
      this.setTexture(petId);
    }
  }

  reset(x, y) {
    this.setPosition(x - 24, y - 14);
    this.bobTimer = 0;
  }
}
