import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG, EnemyState } from '../config/enemyConfig.js';

/**
 * RiftHopper - Alien leaper that pauses on platforms and hops periodically
 */
export class RiftHopper extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'rift_hopper');

    const cfg = ENEMY_CONFIG.RIFT_HOPPER;
    this.hopInterval = cfg.hopInterval || 1400;
    this.hopForceY = cfg.hopForceY || -290;
    this.hopForceX = cfg.hopForceX || 95;
    this.timer = 0;

    this.setSize(cfg.width || 20, cfg.height || 22);
    this.setOffset(1, 1);
    this.maxHealth = cfg.health || 20;
    this.currentHealth = this.maxHealth;
    this.renderHealthBar();
  }

  update(delta) {
    if (this.state !== EnemyState.PATROLLING && this.state !== EnemyState.HOPPING) return;

    const isGrounded = Boolean(this.body.blocked.down || this.body.touching.down);

    if (isGrounded) {
      this.setVelocityX(0);
      this.timer += delta;

      // Face player if nearby
      if (this.scene.player) {
        this.direction = (this.scene.player.x < this.x) ? -1 : 1;
        this.setFlipX(this.direction > 0);
      }

      if (this.timer >= this.hopInterval) {
        this.timer = 0;
        this.hop();
      }
    } else {
      // While in mid-air, maintain horizontal leaping speed
      this.setVelocityX(this.direction * this.hopForceX);
    }

    this.updateHealthBarPosition();
  }

  hop() {
    this.setVelocityY(this.hopForceY);
    this.setVelocityX(this.direction * this.hopForceX);
    this.state = EnemyState.HOPPING;

    // Anticipation squash & stretch
    this.setScale(0.8, 1.25);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Quad.easeOut'
    });
  }

  reset(x = this.initialX, y = this.initialY) {
    super.reset(x, y);
    this.timer = 0;
  }
}
