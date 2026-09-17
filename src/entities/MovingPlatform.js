/**
 * MovingPlatform - Kinematic platform that travels between configured points
 */
export class MovingPlatform extends Phaser.GameObjects.TileSprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {object} config - { rangeX, rangeY, speed, texture }
   */
  constructor(scene, x, y, width = 96, height = 20, config = {}) {
    const texture = config.texture || 'moving_platform';
    super(scene, x, y, width, height, texture);

    this.scene = scene;
    this.startX = x;
    this.startY = y;
    this.rangeX = config.rangeX || 120;
    this.rangeY = config.rangeY || 0;
    this.speed = config.speed || 60;
    this.progress = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = true;
    this.body.setFriction(1, 0);

    // Initial velocity
    if (this.rangeX !== 0) {
      this.body.setVelocityX(this.speed);
    }
    if (this.rangeY !== 0) {
      this.body.setVelocityY(this.speed);
    }
  }

  update(delta) {
    if (!this.active || !this.body) return;

    // Boundary turnaround logic
    if (this.rangeX !== 0) {
      if (this.x >= this.startX + this.rangeX) {
        this.x = this.startX + this.rangeX;
        this.body.setVelocityX(-Math.abs(this.speed));
      } else if (this.x <= this.startX - this.rangeX) {
        this.x = this.startX - this.rangeX;
        this.body.setVelocityX(Math.abs(this.speed));
      }
    }

    if (this.rangeY !== 0) {
      if (this.y >= this.startY + this.rangeY) {
        this.y = this.startY + this.rangeY;
        this.body.setVelocityY(-Math.abs(this.speed));
      } else if (this.y <= this.startY - this.rangeY) {
        this.y = this.startY - this.rangeY;
        this.body.setVelocityY(Math.abs(this.speed));
      }
    }
  }

  reset() {
    this.setPosition(this.startX, this.startY);
    if (this.body) {
      this.body.reset(this.startX, this.startY);
      if (this.rangeX !== 0) this.body.setVelocityX(this.speed);
      if (this.rangeY !== 0) this.body.setVelocityY(this.speed);
    }
  }
}
