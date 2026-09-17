import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG, EnemyState } from '../config/enemyConfig.js';

/**
 * NebulaWisp - Ethereal floating energy hazard drifting along a cyclic path
 */
export class NebulaWisp extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'nebula_wisp');

    const cfg = ENEMY_CONFIG.NEBULA_WISP;
    this.orbitRadius = cfg.orbitRadius || 40;
    this.orbitSpeed = 0.0025;
    this.timeOffset = Math.random() * 500;

    this.body.setAllowGravity(false);
    this.setSize(cfg.width || 20, cfg.height || 20);
    this.setOffset(2, 2);

    // Shimmering alpha pulse
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(delta) {
    if (this.state !== EnemyState.PATROLLING) return;

    const now = (this.scene.time ? this.scene.time.now : 0) + this.timeOffset;
    this.x = this.initialX + Math.cos(now * this.orbitSpeed) * this.orbitRadius;
    this.y = this.initialY + Math.sin(now * this.orbitSpeed) * (this.orbitRadius * 0.6);
  }

  reset(x = this.initialX, y = this.initialY) {
    super.reset(x, y);
    if (this.body) {
      this.body.setAllowGravity(false);
    }
  }
}
