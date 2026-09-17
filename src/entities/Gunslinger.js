import { Enemy } from './Enemy.js';
import { EnemyState } from '../config/enemyConfig.js';
import { Bullet } from './Bullet.js';

/**
 * Gunslinger Enemy - Outlaw robot that patrols, aims with a revolver, and fires bullets
 */
export class Gunslinger extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'gunslinger');

    this.patrolSpeed = 40;
    this.shootRange = 360;
    this.shootCooldown = 2200;
    this.lastShotTime = 0;
    this.isTelegraphing = false;
    this.setSize(22, 24);
    this.setOffset(2, 2);
    this.maxHealth = 30;
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
    const dy = Math.abs(player.y - this.y);
    const dist = Math.abs(dx);
    const now = this.scene.time.now;

    // Check if player is in line of sight (horizontal alley)
    if (dist < this.shootRange && dy < 65 && (now - this.lastShotTime > this.shootCooldown)) {
      this.aimAndFire(dx < 0 ? -1 : 1);
      this.updateHealthBarPosition();
      return;
    }

    if (!this.isTelegraphing) {
      super.update(delta);
    } else {
      this.updateHealthBarPosition();
    }
  }

  aimAndFire(faceDir) {
    this.isTelegraphing = true;
    this.setVelocityX(0);
    this.direction = faceDir;
    this.setFlipX(faceDir > 0);
    this.lastShotTime = this.scene.time.now + 600; // brief delay before cooldown kicks in

    // Flash telegraph indicator (laser aim)
    const aimBeam = this.scene.add.line(
      0,
      0,
      this.x,
      this.y - 1,
      this.x + faceDir * 120,
      this.y - 1,
      0xef4444,
      0.8
    );
    aimBeam.setLineWidth(1.5);
    aimBeam.setDepth(14);

    this.scene.time.delayedCall(450, () => {
      aimBeam.destroy();
      if (this.state !== EnemyState.PATROLLING || !this.active) return;

      // Fire projectile
      const bulletX = this.x + faceDir * 14;
      const bulletY = this.y - 1;
      const bullet = new Bullet(this.scene, bulletX, bulletY, faceDir);

      if (this.scene.enemyProjectiles) {
        this.scene.enemyProjectiles.add(bullet);
      }

      // Muzzle flash
      const flash = this.scene.add.circle(bulletX, bulletY, 7, 0xfacc15, 1);
      flash.setDepth(16);
      this.scene.tweens.add({
        targets: flash,
        scale: 1.6,
        alpha: 0,
        duration: 120,
        onComplete: () => flash.destroy()
      });

      this.isTelegraphing = false;
      this.lastShotTime = this.scene.time.now;
    });
  }
}
