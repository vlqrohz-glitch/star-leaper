import { UI_CONFIG } from '../config/uiConfig.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';
import { Bullet } from './Bullet.js';

export const BOSS_CONFIGS = Object.freeze({
  1: {
    id: 'DREADNOUGHT_ALPHA',
    name: 'ALPHA DREADNOUGHT',
    title: 'SECTOR COMMAND MECH',
    texture: 'boss_dreadnought',
    health: 150,
    speed: 50,
    attackCooldown: 2200,
    projectileSpeed: 220,
    score: 5000,
    width: 46,
    height: 40,
    colorHex: '#00f0ff',
    colorNum: 0x00f0ff
  },
  2: {
    id: 'ORBITAL_BEHEMOTH',
    name: 'ORBITAL BEHEMOTH',
    title: 'STATION DEFENSE AI CORE',
    texture: 'boss_orbital_behemoth',
    health: 180,
    speed: 55,
    attackCooldown: 2000,
    projectileSpeed: 230,
    score: 5000,
    width: 46,
    height: 40,
    colorHex: '#38bdf8',
    colorNum: 0x38bdf8
  },
  3: {
    id: 'VOID_LEVIATHAN',
    name: 'VOID LEVIATHAN',
    title: 'COSMIC RIFT APEX',
    texture: 'boss_void_leviathan',
    health: 200,
    speed: 50,
    attackCooldown: 1900,
    projectileSpeed: 240,
    score: 5000,
    width: 48,
    height: 40,
    colorHex: '#c084fc',
    colorNum: 0xc084fc
  },
  4: {
    id: 'MAGMA_COLOSSUS',
    name: 'MAGMA COLOSSUS',
    title: 'VOLCANIC CORE TITAN',
    texture: 'boss_magma_colossus',
    health: 220,
    speed: 45,
    attackCooldown: 2100,
    projectileSpeed: 210,
    score: 5000,
    width: 48,
    height: 44,
    colorHex: '#f97316',
    colorNum: 0xf97316
  },
  5: {
    id: 'ZENITH_SOVEREIGN',
    name: 'ZENITH SOVEREIGN',
    title: 'ANCIENT WARP EMPEROR',
    texture: 'boss_zenith_overlord',
    health: 250,
    speed: 60,
    attackCooldown: 1800,
    projectileSpeed: 250,
    score: 5000,
    width: 46,
    height: 44,
    colorHex: '#facc15',
    colorNum: 0xfacc15
  },
  6: {
    id: 'OUTLAW_KING',
    name: 'EL BANDIDO SUPREMO',
    title: 'CYBER DYNAMITE OVERLORD',
    texture: 'boss_outlaw_king',
    health: 300,
    speed: 65,
    attackCooldown: 1600,
    projectileSpeed: 260,
    score: 5000,
    width: 44,
    height: 44,
    colorHex: '#eab308',
    colorNum: 0xeab308
  }
});

/**
 * Boss Entity - Sector Final Boss with distinct visual styles, multi-phase AI,
 * ranged projectile volleys, overhead & arena health bars, and dramatic victory events.
 */
export class Boss extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [sectorIndex=1]
   */
  constructor(scene, x, y, sectorIndex = 1) {
    const config = BOSS_CONFIGS[sectorIndex] || BOSS_CONFIGS[1];
    const textureKey = scene.textures.exists(config.texture) ? config.texture : 'drifter_drone';

    super(scene, x, y, textureKey);

    this.scene = scene;
    this.initialX = x;
    this.initialY = y;
    this.sectorIndex = sectorIndex;
    this.config = config;
    this.isBoss = true;

    // Movement & AI
    this.direction = -1;
    this.patrolSpeed = config.speed;
    this.isEnraged = false;
    this.isAttacking = false;
    this.lastAttackTime = 0;
    this.state = 'ACTIVE';

    // Scene integration
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Bounding Box
    this.setSize(config.width, config.height);
    this.setOffset(2, 2);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.body.setGravityY(600);

    // Health Configuration
    this.maxHealth = config.health;
    this.currentHealth = this.maxHealth;

    // Overhead Health Bar (36px wide - explicitly shorter than player's 48px bar)
    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(16);

    // Boss Name Tag Floating Overhead
    this.nameTag = scene.add.text(x, y - (config.height / 2 + 18), `★ ${config.name} ★`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '7.5px',
      color: config.colorHex,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(17);

    this.renderHealthBar();
    this.emitBossState();
  }

  update(delta) {
    if (this.state !== 'ACTIVE' || !this.active) return;

    const now = this.scene.time ? this.scene.time.now : 0;
    const player = this.scene.player;

    // Face player
    if (player && player.active) {
      this.direction = (player.x < this.x) ? -1 : 1;
      this.setFlipX(this.direction > 0);
    }

    // Check enrage threshold (HP < 50%)
    if (!this.isEnraged && (this.currentHealth / this.maxHealth) <= 0.5) {
      this.triggerEnrage();
    }

    // Normal movement
    if (!this.isAttacking) {
      const speed = this.isEnraged ? this.patrolSpeed * 1.35 : this.patrolSpeed;
      this.setVelocityX(this.direction * speed);

      // Periodical jump / stomp shockwave if grounded
      if (this.body.blocked.down && Math.random() < (this.isEnraged ? 0.015 : 0.008)) {
        this.setVelocityY(-260);
      }
    }

    // Periodic ranged attack
    const cooldown = this.isEnraged ? this.config.attackCooldown * 0.7 : this.config.attackCooldown;
    if (now - this.lastAttackTime > cooldown && player && player.active) {
      this.performBossAttack();
      this.lastAttackTime = now;
    }

    // Reposition overhead health bar & name tag
    this.updateHealthBarPosition();
  }

  updateHealthBarPosition() {
    if (!this.active) return;
    if (this.healthBar) {
      this.healthBar.setPosition(this.x, this.y);
    }
    if (this.nameTag) {
      this.nameTag.setPosition(this.x, this.y - (this.config.height / 2 + 18));
    }
  }

  /**
   * Renders compact overhead health bar (36px wide, shorter than player's 48px bar)
   */
  renderHealthBar() {
    if (!this.healthBar) return;
    this.healthBar.clear();

    if (this.state === 'DEFEATED' || !this.visible) return;

    const barW = 36;
    const barH = 4;
    const offX = -barW / 2;
    const offY = -(this.config.height / 2 + 8);

    // Frame
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(offX - 1, offY - 1, barW + 2, barH + 2);
    this.healthBar.fillStyle(0x0f172a, 0.9);
    this.healthBar.fillRect(offX, offY, barW, barH);

    // Fill
    const ratio = Math.max(0, Math.min(1, this.currentHealth / this.maxHealth));
    const fillW = Math.round(barW * ratio);

    if (fillW > 0) {
      let fillColor = this.config.colorNum;
      if (ratio <= 0.25) {
        fillColor = 0xef4444;
      } else if (ratio <= 0.5) {
        fillColor = 0xf59e0b;
      }
      this.healthBar.fillStyle(fillColor, 1);
      this.healthBar.fillRect(offX, offY, fillW, barH);
    }
  }

  takeDamage(amount = 10) {
    if (this.state === 'DEFEATED') return 0;

    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // Visual damage reaction
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) {
        if (this.isEnraged) {
          this.setTint(0xff4444);
        } else {
          this.clearTint();
        }
      }
    });

    // Sound effect
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.PLAYER_DAMAGE);
    }

    this.renderHealthBar();
    this.emitBossState();

    if (this.currentHealth <= 0) {
      this.defeat();
    }

    return this.currentHealth;
  }

  triggerEnrage() {
    this.isEnraged = true;
    this.setTint(0xff4444);

    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(180, 0.008);
    }

    // Floating ENRAGED banner
    const enrageText = this.scene.add.text(this.x, this.y - 32, '⚡ ENRAGED! ⚡', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(25);

    this.scene.tweens.add({
      targets: enrageText,
      y: enrageText.y - 20,
      alpha: 0,
      duration: 1200,
      ease: 'Power1',
      onComplete: () => enrageText.destroy()
    });
  }

  performBossAttack() {
    this.isAttacking = true;
    this.setVelocityX(0);

    // Muzzle flash / telegraph ring
    const aura = this.scene.add.circle(this.x, this.y, 22, this.config.colorNum, 0.5);
    aura.setDepth(15);
    this.scene.tweens.add({
      targets: aura,
      scale: 1.5,
      alpha: 0,
      duration: 250,
      onComplete: () => aura.destroy()
    });

    this.scene.time.delayedCall(220, () => {
      if (!this.active || this.state === 'DEFEATED') return;

      const player = this.scene.player;
      const targetX = player ? player.x : this.x + this.direction * 100;
      const targetY = player ? player.y : this.y;

      // Spawn 1 or 2 boss projectiles towards player
      this.fireProjectileAt(targetX, targetY);
      if (this.isEnraged) {
        this.scene.time.delayedCall(150, () => {
          if (this.active && this.state === 'ACTIVE') {
            this.fireProjectileAt(targetX, targetY - 20);
          }
        });
      }

      this.isAttacking = false;
    });
  }

  fireProjectileAt(tx, ty) {
    const projX = this.x + (this.direction * 20);
    const projY = this.y - 4;

    const angle = Phaser.Math.Angle.Between(projX, projY, tx, ty);
    const speed = this.config.projectileSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const bullet = new Bullet(this.scene, projX, projY, this.direction);
    bullet.setVelocity(vx, vy);
    bullet.body.setAllowGravity(false);
    bullet.setTint(this.config.colorNum);

    if (this.scene.enemyProjectiles) {
      this.scene.enemyProjectiles.add(bullet);
    }
  }

  defeat() {
    if (this.state === 'DEFEATED') return;
    this.state = 'DEFEATED';

    this.body.enable = false;
    this.setVelocity(0, 0);

    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    if (this.nameTag) {
      this.nameTag.destroy();
      this.nameTag = null;
    }

    // Camera shake & explosion series
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(400, 0.015);
      this.scene.cameras.main.flash(300, 255, 240, 200);
    }

    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.ENEMY_DEFEAT || AUDIO_KEYS.LEVEL_COMPLETE);
    }

    // Boss defeat explosions
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 90, () => {
        const ox = (Math.random() - 0.5) * 40;
        const oy = (Math.random() - 0.5) * 30;
        const burst = this.scene.add.circle(this.x + ox, this.y + oy, 16, this.config.colorNum, 0.9);
        burst.setDepth(25);
        this.scene.tweens.add({
          targets: burst,
          scale: 2.2,
          alpha: 0,
          duration: 300,
          onComplete: () => burst.destroy()
        });
      });
    }

    // Floating boss score banner
    const scoreText = this.scene.add.text(this.x, this.y - 20, `🏆 BOSS DEFEATED!\n+${this.config.score}`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5).setDepth(30);

    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 35,
      alpha: 0,
      duration: 2500,
      ease: 'Power1',
      onComplete: () => scoreText.destroy()
    });

    // Fade out sprite
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0.1,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
      }
    });

    // Notify scene
    this.scene.events.emit('BOSS_DEFEATED', {
      boss: this,
      score: this.config.score,
      x: this.x,
      y: this.y
    });

    // Award score
    if (this.scene.scoreSystem && typeof this.scene.scoreSystem.addScore === 'function') {
      this.scene.scoreSystem.addScore(this.config.score);
    }

    // Reveal / Activate the Goal Warp Beacon in the arena
    if (typeof this.scene.activateBossGoal === 'function') {
      this.scene.activateBossGoal();
    }
  }

  emitBossState() {
    this.scene.events.emit('BOSS_HEALTH_CHANGED', {
      boss: this,
      current: this.currentHealth,
      max: this.maxHealth,
      name: this.config.name,
      title: this.config.title,
      colorHex: this.config.colorHex,
      colorNum: this.config.colorNum
    });
  }

  reset(x = this.initialX, y = this.initialY) {
    this.setPosition(x, y);
    this.currentHealth = this.maxHealth;
    this.state = 'ACTIVE';
    this.isEnraged = false;
    this.isAttacking = false;
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();
    if (this.body) {
      this.body.enable = true;
    }
    this.renderHealthBar();
    this.emitBossState();
  }

  destroy(fromScene) {
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    if (this.nameTag) {
      this.nameTag.destroy();
      this.nameTag = null;
    }
    super.destroy(fromScene);
  }
}
