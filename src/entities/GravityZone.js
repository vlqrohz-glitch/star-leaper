/**
 * GravityZone - Spatial trigger area altering player gravity while overlapping
 */
export class GravityZone extends Phaser.GameObjects.TileSprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} [gravityScale=0.35]
   */
  constructor(scene, x, y, width = 128, height = 128, gravityScale = 0.35) {
    super(scene, x, y, width, height, 'gravity_zone_fx');

    this.scene = scene;
    this.gravityScale = gravityScale;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static trigger body

    this.setAlpha(0.65);

    // Drifting background effect
    scene.tweens.add({
      targets: this,
      alpha: 0.85,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Applies low gravity to player while overlapping
   * @param {import('./Player.js').Player} player
   */
  onPlayerOverlap(player) {
    if (player) {
      player.gravityModifier = this.gravityScale;
      player.inGravityZone = true;
    }
  }
}
