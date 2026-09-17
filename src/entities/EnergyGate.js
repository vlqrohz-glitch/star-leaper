/**
 * EnergyGate - Periodic laser barrier that alternates between active and inactive states
 */
export class EnergyGate extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object} config - { activeTime, inactiveTime, initialActive }
   */
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'energy_gate');

    this.scene = scene;
    this.activeTime = config.activeTime || 2200;
    this.inactiveTime = config.inactiveTime || 1800;
    this.isActive = config.initialActive !== undefined ? config.initialActive : true;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    this.setSize(14, 58);
    this.setOffset(1, 3);

    this.timer = 0;
    this.updateVisualState();
  }

  update(delta) {
    this.timer += delta;
    const cycleDuration = this.isActive ? this.activeTime : this.inactiveTime;

    if (this.timer >= cycleDuration) {
      this.timer = 0;
      this.isActive = !this.isActive;
      this.updateVisualState();
    }
  }

  updateVisualState() {
    if (this.isActive) {
      this.setAlpha(1.0);
      if (this.body) this.body.enable = true;
    } else {
      this.setAlpha(0.25);
      if (this.body) this.body.enable = false;
    }
  }

  reset() {
    this.timer = 0;
    this.isActive = true;
    this.updateVisualState();
  }
}
