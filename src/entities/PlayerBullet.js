/**
 * PlayerBullet Entity - High-velocity player projectiles
 * Fired using the [F] key to fight and defeat enemies across all sectors.
 */
export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} dir -1 for left, 1 for right
   * @param {string} [weaponType='REVOLVER']
   */
  constructor(scene, x, y, dir = 1, weaponType = 'REVOLVER') {
    const textureKey = PlayerBullet.getTextureForWeapon(weaponType);
    super(scene, x, y, textureKey);

    this.scene = scene;
    this.dir = dir >= 0 ? 1 : -1;
    this.weaponType = weaponType;
    this.isPlayerBullet = true;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Weapon projectile properties
    const spec = PlayerBullet.getWeaponSpec(weaponType);
    this.speed = spec.speed;
    this.damage = spec.damage;
    this.aoeRadius = spec.aoeRadius || 0;

    this.setSize(spec.width, spec.height);
    this.setFlipX(this.dir < 0);
    this.setDepth(18);

    if (spec.hasArcGravity) {
      this.body.setAllowGravity(true);
      this.body.setGravityY(160);
      this.setVelocity(this.dir * this.speed, -110);
    } else {
      this.body.setAllowGravity(false);
      this.setVelocity(this.dir * this.speed, 0);
    }

    // Projectile trail glow
    this.createTrailEffect(spec.glowColor);

    // Lifespan timer
    this.lifespanTimer = scene.time.delayedCall(spec.lifespanMs, () => {
      this.explode(false);
    });
  }

  static getTextureForWeapon(weaponType) {
    switch (weaponType) {
      case 'PLASMA_BLASTER':
        return 'player_plasma';
      case 'PHOTON_RIFLE':
        return 'player_photon';
      case 'DYNAMITE_LAUNCHER':
      case 'CLUSTER_BOMB':
        return 'player_dynamite';
      case 'SHOTGUN':
        return 'player_scatter';
      case 'AEGIS_BLASTER':
        return 'player_plasma';
      case 'CHRONO_WARP':
      case 'HYPER_LASER':
        return 'player_photon';
      case 'REVOLVER':
      default:
        return 'player_bullet';
    }
  }

  static getWeaponSpec(weaponType) {
    switch (weaponType) {
      case 'PLASMA_BLASTER':
        return {
          speed: 420,
          damage: 12,
          width: 14,
          height: 8,
          lifespanMs: 1800,
          glowColor: 0x00f0ff,
          hasArcGravity: false,
          cooldownMs: 200
        };
      case 'PHOTON_RIFLE':
        return {
          speed: 560,
          damage: 28,
          width: 18,
          height: 5,
          lifespanMs: 1600,
          glowColor: 0xc084fc,
          hasArcGravity: false,
          cooldownMs: 300
        };
      case 'DYNAMITE_LAUNCHER':
        return {
          speed: 280,
          damage: 40,
          aoeRadius: 60,
          width: 12,
          height: 12,
          lifespanMs: 2200,
          glowColor: 0xef4444,
          hasArcGravity: true,
          cooldownMs: 440
        };
      case 'SHOTGUN':
        return {
          speed: 360,
          damage: 10,
          width: 8,
          height: 8,
          lifespanMs: 1200,
          glowColor: 0xf59e0b,
          hasArcGravity: false,
          cooldownMs: 340
        };
      case 'AEGIS_BLASTER':
        return {
          speed: 460,
          damage: 35,
          width: 14,
          height: 10,
          lifespanMs: 1800,
          glowColor: 0x38bdf8,
          hasArcGravity: false,
          cooldownMs: 320
        };
      case 'CHRONO_WARP':
        return {
          speed: 500,
          damage: 32,
          width: 16,
          height: 6,
          lifespanMs: 1600,
          glowColor: 0xa855f7,
          hasArcGravity: false,
          cooldownMs: 260
        };
      case 'HYPER_LASER':
        return {
          speed: 620,
          damage: 50,
          width: 22,
          height: 6,
          lifespanMs: 1600,
          glowColor: 0x10b981,
          hasArcGravity: false,
          cooldownMs: 350
        };
      case 'CLUSTER_BOMB':
        return {
          speed: 300,
          damage: 60,
          aoeRadius: 75,
          width: 14,
          height: 14,
          lifespanMs: 2200,
          glowColor: 0xec4899,
          hasArcGravity: true,
          cooldownMs: 500
        };
      case 'REVOLVER':
      default:
        return {
          speed: 380,
          damage: 15,
          width: 10,
          height: 5,
          lifespanMs: 2000,
          glowColor: 0xfacc15,
          hasArcGravity: false,
          cooldownMs: 260
        };
    }
  }

  createTrailEffect(color) {
    if (this.weaponType === 'DYNAMITE_LAUNCHER') {
      // Spinning dynamic rotation for thrown dynamite
      this.scene.tweens.add({
        targets: this,
        angle: this.dir * 360,
        duration: 400,
        repeat: -1
      });
    }

    // Gentle pulsing trail
    this.trailTween = this.scene.tweens.add({
      targets: this,
      scaleY: 1.25,
      duration: 100,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Explodes the projectile on impact or expiration
   * @param {boolean} hit Whether an enemy or solid obstacle was hit
   */
  explode(hit = false) {
    if (!this.active) return;
    if (this.lifespanTimer) {
      this.lifespanTimer.remove(false);
      this.lifespanTimer = null;
    }
    if (this.trailTween) {
      this.trailTween.stop();
      this.trailTween = null;
    }

    const spec = PlayerBullet.getWeaponSpec(this.weaponType);

    // Area of effect explosion for Dynamite Launcher
    if (this.aoeRadius > 0 && this.scene && this.scene.enemies) {
      this.triggerAOEExplosion();
    }

    // Visual impact burst
    const burstColor = spec.glowColor;
    const burst = this.scene.add.circle(this.x, this.y, hit ? 8 : 4, burstColor, 0.95);
    burst.setDepth(20);

    this.scene.tweens.add({
      targets: burst,
      scale: hit ? 2.5 : 1.6,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy()
    });

    // Particle spark sparks
    for (let i = 0; i < (hit ? 5 : 2); i++) {
      const angle = (Math.PI * 2 * i) / (hit ? 5 : 2);
      const spark = this.scene.add.circle(this.x, this.y, 2, burstColor, 0.9);
      spark.setDepth(20);
      const dist = hit ? 16 + Math.random() * 8 : 8;
      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * dist,
        y: spark.y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 160,
        onComplete: () => spark.destroy()
      });
    }

    this.destroy();
  }

  triggerAOEExplosion() {
    // Blast ring
    const ring = this.scene.add.circle(this.x, this.y, this.aoeRadius, 0xef4444, 0.35);
    ring.setStrokeStyle(2, 0xfacc15, 0.9);
    ring.setDepth(19);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.3,
      alpha: 0,
      duration: 250,
      onComplete: () => ring.destroy()
    });

    // Check all active enemies within radius
    const enemies = this.scene.enemies.getChildren ? this.scene.enemies.getChildren() : [];
    enemies.forEach(enemy => {
      if (!enemy || !enemy.active || (enemy.isActive && !enemy.isActive())) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (d <= this.aoeRadius) {
        if (typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(this.damage);
        } else if (typeof enemy.defeat === 'function') {
          enemy.defeat();
        }
      }
    });

    // Also check Boss entity if active in arena
    if (this.scene.boss && this.scene.boss.active) {
      const bDist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.boss.x, this.scene.boss.y);
      if (bDist <= this.aoeRadius) {
        this.scene.boss.takeDamage(this.damage);
      }
    }
  }
}
