import { Enemy } from './Enemy.js';
import { EnemyState } from '../config/enemyConfig.js';
import { Dynamite } from './Dynamite.js';

/**
 * Dynamite Bandit Enemy - Outlaw prospector that hurls arcing dynamite sticks
 */
export class DynamiteBandit extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'dynamite_bandit');

    this.patrolSpeed = 35;
    this.throwRange = 340;
    this.throwCooldown = 2500;
    this.lastThrowTime = 0;
    this.isThrowing = false;
    this.setSize(22, 24);
    this.setOffset(2, 2);
    this.maxHealth = 25;
    this.currentHealth = this.maxHealth;
    this.renderHealthBar();
  }

  update(delta) {
    if (this.state !== EnemyState.PATROLLING) return;

    const player = this.scene.player;
    if (!player || !player.active || this.scene.isGameOver || this.scene.uiSystem.isTitleActive()) {
      super.update(delta);
      return;
    }

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    const now = this.scene.time.now;

    // Check if player is within throwing range
    if (dist < this.throwRange && (now - this.lastThrowTime > this.throwCooldown)) {
      this.throwDynamite(dx);
      this.updateHealthBarPosition();
      return;
    }

    if (!this.isThrowing) {
      super.update(delta);
    } else {
      this.updateHealthBarPosition();
    }
  }

  throwDynamite(dx) {
    this.isThrowing = true;
    this.setVelocityX(0);
    const faceDir = dx < 0 ? -1 : 1;
    this.direction = faceDir;
    this.setFlipX(faceDir > 0);
    this.lastThrowTime = this.scene.time.now + 800;

    // Wind-up hop animation
    this.setVelocityY(-110);

    this.scene.time.delayedCall(300, () => {
      if (this.state !== EnemyState.PATROLLING || !this.active) return;

      // Compute trajectory arc
      const clampedDist = Phaser.Math.Clamp(dx, -220, 220);
      const vx = clampedDist * 1.1;
      const vy = -260;

      const dyn = new Dynamite(this.scene, this.x + faceDir * 10, this.y - 12, vx, vy);
      if (this.scene.enemyProjectiles) {
        this.scene.enemyProjectiles.add(dyn);
      }

      this.isThrowing = false;
      this.lastThrowTime = this.scene.time.now;
    });
  }
}
