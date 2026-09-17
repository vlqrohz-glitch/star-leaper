/**
 * HazardZone - Environmental danger surface (lava / plasma) that damages player on contact
 */
export class HazardZone extends Phaser.GameObjects.TileSprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} [texture='hazard_lava']
   */
  constructor(scene, x, y, width = 64, height = 20, texture = 'hazard_lava') {
    super(scene, x, y, width, height, texture);

    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Animated glow tween
    scene.tweens.add({
      targets: this,
      alpha: 0.8,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Damages player on overlap
   * @param {import('./Player.js').Player} player
   */
  onPlayerOverlap(player) {
    if (!player || player.invulnerableTimer > 0) return;

    // If Aegis shield is active, block hazard
    if (this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
      if (this.scene.handleDamagePrevented) {
        this.scene.handleDamagePrevented();
      }
      return;
    }

    // Apply direct hazard knockback & damage
    player.setVelocityY(-260);
    player.invulnerableTimer = 1.2;
    if (this.scene.healthSystem) {
      this.scene.healthSystem.takeDamage(1);
    }
    this.scene.events.emit('PLAY_SFX', 'player_damage');
    if (this.scene.feedbackSystem) {
      this.scene.feedbackSystem.playerDamage();
    }
  }
}
