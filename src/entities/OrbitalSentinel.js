import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG, EnemyState } from '../config/enemyConfig.js';

/**
 * OrbitalSentinel - Flying robotic drone that sweeps in a sinusoidal wave
 */
export class OrbitalSentinel extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'orbital_sentinel');

    const cfg = ENEMY_CONFIG.ORBITAL_SENTINEL;
    this.patrolSpeed = cfg.speed || 65;
    this.amplitudeY = cfg.amplitudeY || 35;
    this.waveFreq = cfg.waveFreq || 0.003;
    this.timeOffset = Math.random() * 1000;

    // Flying entity: no downward gravity
    this.body.setAllowGravity(false);
    this.setSize(cfg.width || 24, cfg.height || 24);
    this.setOffset(2, 1);
    this.maxHealth = cfg.health || 20;
    this.currentHealth = this.maxHealth;
    this.renderHealthBar();
  }

  update(delta) {
    if (this.state !== EnemyState.PATROLLING) return;

    // 1. Horizontal traversal
    this.setVelocityX(this.direction * this.patrolSpeed);
    this.setFlipX(this.direction > 0);

    // 2. Sinusoidal flight elevation
    const now = (this.scene.time ? this.scene.time.now : 0) + this.timeOffset;
    this.y = this.initialY + Math.sin(now * this.waveFreq) * this.amplitudeY;

    // 3. Wall turnaround
    if (this.body.blocked.left && this.direction < 0) {
      this.reverseDirection();
    } else if (this.body.blocked.right && this.direction > 0) {
      this.reverseDirection();
    }

    this.updateHealthBarPosition();
  }

  reset(x = this.initialX, y = this.initialY) {
    super.reset(x, y);
    if (this.body) {
      this.body.setAllowGravity(false);
    }
  }
}
