import { PLAYER_CONFIG, PlayerState } from '../config/playerConfig.js';
import { ENEMY_CONFIG } from '../config/enemyConfig.js';
import { LifeState, HEALTH_CONFIG } from '../config/playerHealthConfig.js';
import { CharacterProfile } from './characters/CharacterProfile.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { PlayerBullet } from './PlayerBullet.js';

/**
 * Player Entity - Reusable Explorer Framework
 * Supports multiple playable characters (Nova, Zenith, Atlas, Lumen)
 * with individual physics, animations, and state management.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [characterId='NOVA']
   */
  constructor(scene, x, y, characterId = 'NOVA') {
    super(scene, x, y, 'player');

    // Add to scene rendering and physics engine
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics bounding box configuration
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.setSize(18, 30);
    this.setOffset(7, 2);

    // Character Framework Profile & Config
    this.characterId = characterId;
    this.characterProfile = new CharacterProfile(characterId);
    this.config = this.characterProfile.getPhysicsConfig();
    this.enemyConfig = ENEMY_CONFIG;
    this.healthConfig = HEALTH_CONFIG;

    // Apply active cosmetics & perks
    this.applyAppearanceAndPerks();

    // Movement & Life Cycle State
    this.state = PlayerState.IDLE;
    this.lifeState = LifeState.ALIVE;

    // Internal Jump & Timing State
    this.isJumping = false;
    this.jumpCount = 0;
    this.jumpHoldTimer = 0;
    this.hasJumpCutoff = false;
    this.wasGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // Environmental / Power-up Modifiers
    this.gravityModifier = 1.0;
    this.animationTimer = 0;

    // Combat & Invulnerability State
    this.invulnerableTimer = 0;
    this.equippedWeapon = 'REVOLVER';
    this.attackCooldown = 0;

    // Overhead Floating Dynamic Health Bar
    this.currentHealth = HEALTH_CONFIG.MAX_HEALTH;
    this.maxHealth = HEALTH_CONFIG.MAX_HEALTH;
    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(26);

    this.healthListener = (data) => {
      if (data) {
        this.currentHealth = data.health;
        this.maxHealth = data.maxHealth || this.maxHealth;
      }
      this.renderHealthBar();
    };
    scene.events.on('HEALTH_CHANGED', this.healthListener);
    this.renderHealthBar();
  }

  /**
   * Applies equipped outfit skin and passive perk modifiers
   */
  applyAppearanceAndPerks() {
    // 1. Outfit texture override
    const outfitId = ShopSystem.getEquippedOutfit(this.characterId);
    let tex = this.characterProfile.getTexture();
    if (outfitId && outfitId !== 'standard') {
      const skinKey = `player_${this.characterId.toLowerCase()}_${outfitId}`;
      if (this.scene.textures.exists(skinKey)) {
        tex = skinKey;
      }
    }
    if (this.scene.textures.exists(tex)) {
      this.setTexture(tex);
    }

    // 2. Perk boosts (Boost Thrusters: +12% speed, +8% jump)
    const perk = ShopSystem.getEquippedPerk();
    if (perk && perk.id === 'boost_thrusters') {
      this.config = {
        ...this.config,
        MOVE_SPEED: Math.round(this.config.MOVE_SPEED * 1.12),
        JUMP_FORCE: Math.round(this.config.JUMP_FORCE * 1.08)
      };
    }
  }

  /**
   * Switches active character profile dynamically
   * @param {string} characterId
   */
  setCharacter(characterId) {
    this.characterId = characterId;
    this.characterProfile = new CharacterProfile(characterId);
    this.config = this.characterProfile.getPhysicsConfig();
    this.applyAppearanceAndPerks();
  }

  /**
   * Main per-frame update loop
   * @param {import('../systems/InputSystem.js').InputSystem} input
   * @param {number} delta Delta time in milliseconds
   */
  update(input, delta = 16.66) {
    if (!input) return;

    // Convert milliseconds to seconds
    const dt = Math.max(0.001, delta / 1000);
    this.animationTimer += delta;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // Freeze inputs during death or respawn transitions
    if (this.lifeState === LifeState.DEAD || this.lifeState === LifeState.RESPAWNING) {
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
      }
      return;
    }

    // 1. Reliable Ground Detection
    const isGrounded = this.checkGrounded();

    // 2. Coyote Time Management
    if (isGrounded) {
      this.coyoteTimer = this.config.COYOTE_TIME;
      this.isJumping = false;
      this.hasJumpCutoff = false;
      this.jumpCount = 0;

      // Landing feedback
      if (!this.wasGrounded && this.body.velocity.y >= 0) {
        this.onLand();
      }
    } else {
      // Decrement coyote timer when in the air
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    this.wasGrounded = isGrounded;

    // 3. Jump Buffer Management (Preserve single-frame press across evaluation)
    const jumpJustPressed = input.isJumpJustPressed();
    if (jumpJustPressed) {
      this.jumpBufferTimer = this.config.JUMP_BUFFER_TIME;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Manage Invulnerability Flicker
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
      const now = this.scene.time ? this.scene.time.now : 0;
      this.setAlpha(Math.floor(now / 80) % 2 === 0 ? 0.3 : 0.9);
      if (this.invulnerableTimer <= 0) {
        this.setAlpha(1);
      }
    }

    // Dynamic Gravity Scale (supports Gravity Shift power-up and Gravity Zones)
    const activeGravity = this.config.GRAVITY * this.gravityModifier;
    if (this.body.gravity.y !== (activeGravity - this.scene.physics.world.gravity.y)) {
      this.body.setGravityY(activeGravity - this.scene.physics.world.gravity.y);
    }

    // 4. Horizontal Movement (Smooth Acceleration & Deceleration)
    this.handleHorizontalMovement(input, isGrounded, dt);

    // 5. Jump Execution & Variable Jump Height
    this.handleJumping(input, isGrounded, dt, jumpJustPressed);

    // 6. Update Movement State (IDLE, RUNNING, JUMPING, FALLING) & Animations
    this.updateMovementState(isGrounded);

    // 7. Update Overhead Dynamic Health Bar Position
    this.updateHealthBarPosition();
  }

  /**
   * Reliable ground detection via Arcade physics flags
   * @returns {boolean}
   */
  checkGrounded() {
    return Boolean(this.body.blocked.down || this.body.touching.down);
  }

  /**
   * Computes horizontal acceleration, deceleration, and clamps to MOVE_SPEED
   * @param {import('../systems/InputSystem.js').InputSystem} input
   * @param {boolean} isGrounded
   * @param {number} dt
   */
  handleHorizontalMovement(input, isGrounded, dt) {
    const leftDown = input.isLeft();
    const rightDown = input.isRight();
    let vx = this.body.velocity.x;

    const accel = isGrounded ? this.config.GROUND_ACCELERATION : this.config.AIR_ACCELERATION;
    const decel = isGrounded ? this.config.GROUND_DECELERATION : this.config.AIR_DECELERATION;
    const maxSpeed = this.config.MOVE_SPEED;

    if (leftDown && !rightDown) {
      // Accelerate Left
      this.setFlipX(true);
      if (vx > 0) {
        // Turning around: apply deceleration first to reverse momentum smoothly
        vx = Math.max(-maxSpeed, vx - (decel + accel * 0.5) * dt);
      } else {
        vx = Math.max(-maxSpeed, vx - accel * dt);
      }
      this.setVelocityX(vx);
    } else if (rightDown && !leftDown) {
      // Accelerate Right
      this.setFlipX(false);
      if (vx < 0) {
        // Turning around: apply deceleration first to reverse momentum smoothly
        vx = Math.min(maxSpeed, vx + (decel + accel * 0.5) * dt);
      } else {
        vx = Math.min(maxSpeed, vx + accel * dt);
      }
      this.setVelocityX(vx);
    } else {
      // No horizontal input: smoothly decelerate toward zero
      if (Math.abs(vx) <= decel * dt) {
        this.setVelocityX(0);
      } else {
        this.setVelocityX(vx - Math.sign(vx) * decel * dt);
      }
    }
  }

  /**
   * Handles jump initiation, variable jump sustain, and early release cutoffs
   * @param {import('../systems/InputSystem.js').InputSystem} input
   * @param {boolean} isGrounded
   * @param {number} dt
   * @param {boolean} [jumpJustPressed=false]
   */
  handleJumping(input, isGrounded, dt, jumpJustPressed = false) {
    // A. Ground Jump Initiation (Triggered if buffered and coyote window is open)
    const canGroundJump = (this.coyoteTimer > 0) && !this.isJumping;
    if (this.jumpBufferTimer > 0 && canGroundJump) {
      this.setVelocityY(this.config.JUMP_FORCE);
      this.isJumping = true;
      this.hasJumpCutoff = false;
      this.jumpCount = 1;
      this.coyoteTimer = 0;       // Consume coyote window
      this.jumpBufferTimer = 0;   // Consume buffer
      this.jumpHoldTimer = this.config.JUMP_HOLD_TIME;

      // Subtle vertical stretch upon takeoff
      this.triggerSquashAndStretch(0.85, 1.2);
    } else if ((jumpJustPressed || this.jumpBufferTimer > 0) && !isGrounded && this.coyoteTimer <= 0 && this.jumpCount < (this.config.MAX_JUMPS || 2)) {
      // B. Double Jump Initiation (Mid-air leap on second press)
      this.setVelocityY(this.config.DOUBLE_JUMP_FORCE || -315);
      this.isJumping = true;
      this.hasJumpCutoff = false;
      this.jumpCount = 2;
      this.jumpBufferTimer = 0;
      this.jumpHoldTimer = this.config.DOUBLE_JUMP_HOLD_TIME || 0.14;

      // Energetic double-jump thruster stretch
      this.triggerSquashAndStretch(0.8, 1.25);

      // Trigger audio & visual feedback
      this.scene.events.emit('PLAYER_DOUBLE_JUMP', {
        x: this.x,
        y: this.y
      });
    }

    // C. Variable Jump Hold (Holding jump applies upward force during ascent)
    const isHoldingJump = input.isJump();
    const isAscending = this.body.velocity.y < 0;

    if (this.isJumping && isHoldingJump && this.jumpHoldTimer > 0 && isAscending) {
      this.jumpHoldTimer -= dt;
      const holdForce = (this.jumpCount === 2)
        ? (this.config.DOUBLE_JUMP_HOLD_FORCE || this.config.JUMP_HOLD_FORCE)
        : this.config.JUMP_HOLD_FORCE;
      this.setVelocityY(this.body.velocity.y + (holdForce * dt));
    }

    // D. Variable Jump Cutoff (Releasing jump early during ascent cuts upward velocity)
    const jumpReleased = input.isJumpJustReleased() || (!isHoldingJump && this.isJumping);
    if (jumpReleased && isAscending && !this.hasJumpCutoff) {
      this.setVelocityY(this.body.velocity.y * this.config.JUMP_CUTOFF_MULTIPLIER);
      this.hasJumpCutoff = true;
      this.jumpHoldTimer = 0;
    }

    // Reset jump state if downward falling
    if (this.body.velocity.y >= 0 && !isGrounded) {
      this.isJumping = false;
    }
  }

  /**
   * Updates the exposed player state: IDLE, RUNNING, JUMPING, FALLING and animates
   * @param {boolean} isGrounded
   */
  updateMovementState(isGrounded) {
    if (isGrounded) {
      if (Math.abs(this.body.velocity.x) > 6) {
        this.state = PlayerState.RUNNING;
        // Subtle rhythmic running bob
        const bob = Math.sin(this.animationTimer * 0.02) * 0.06;
        this.setScale(1 + bob * 0.5, 1 - bob);
      } else {
        this.state = PlayerState.IDLE;
        // Breathing idle pulse
        const breath = Math.sin(this.animationTimer * 0.004) * 0.03;
        this.setScale(1 - breath * 0.5, 1 + breath);
      }
    } else {
      if (this.body.velocity.y < -10) {
        this.state = PlayerState.JUMPING;
      } else {
        this.state = PlayerState.FALLING;
      }
    }
  }

  /**
   * Called once when player makes contact with the ground from mid-air
   */
  onLand() {
    this.triggerSquashAndStretch(1.2, 0.8);
  }

  /**
   * Applies bounce force after stomping an enemy
   * @param {number} [force]
   */
  bounceAfterStomp(force = this.enemyConfig.STOMP_BOUNCE_FORCE) {
    this.setVelocityY(force);
    this.isJumping = true;
    this.hasJumpCutoff = false;
    this.coyoteTimer = 0;
    this.triggerSquashAndStretch(0.85, 1.25);
  }

  /**
   * Handles non-fatal impact when colliding with an enemy from the side
   * @param {import('./Enemy.js').Enemy} enemy
   * @returns {boolean} Whether damage/knockback was registered
   */
  handleEnemyHit(enemy) {
    // If currently invulnerable or dead, ignore hit
    if (this.invulnerableTimer > 0 || this.lifeState === LifeState.DEAD || this.lifeState === LifeState.RESPAWNING) {
      return false;
    }

    // Determine horizontal knockback direction away from enemy center
    const dir = (this.x < enemy.x) ? -1 : 1;
    this.setVelocityX(dir * this.enemyConfig.KNOCKBACK_X);
    this.setVelocityY(this.enemyConfig.KNOCKBACK_Y);

    // Apply invulnerability grace period scaled by character durability
    const durabilityMod = this.characterProfile.getModifiers().invulnerabilityMultiplier || 1.0;
    this.invulnerableTimer = this.enemyConfig.INVULNERABILITY_TIME * durabilityMod;

    // Camera micro-shake for impact feel
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(120, 0.008);
    }

    // Emit event for HealthSystem integration
    this.scene.events.emit('PLAYER_ENEMY_HIT', {
      player: this,
      enemy: enemy,
      knockbackDir: dir
    });

    return true;
  }

  /**
   * Sets post-respawn immunity window
   * @param {number} [duration] In seconds
   */
  setPostRespawnInvulnerability(duration = this.healthConfig.POST_RESPAWN_INVULNERABILITY) {
    const durabilityMod = this.characterProfile.getModifiers().invulnerabilityMultiplier || 1.0;
    this.invulnerableTimer = duration * durabilityMod;
  }

  /**
   * Complete reset of player position, velocity, timers, and movement state
   * @param {number} spawnX
   * @param {number} spawnY
   */
  reset(spawnX, spawnY) {
    this.setPosition(spawnX, spawnY);
    this.setVelocity(0, 0);
    this.body.setAcceleration(0, 0);
    this.state = PlayerState.IDLE;
    this.lifeState = LifeState.ALIVE;
    this.isJumping = false;
    this.jumpCount = 0;
    this.jumpHoldTimer = 0;
    this.hasJumpCutoff = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.wasGrounded = false;
    this.invulnerableTimer = 0;
    this.gravityModifier = 1.0;
    this.setAlpha(1);
    this.setScale(1, 1);
    this.scene.tweens.killTweensOf(this);
    this.currentHealth = this.maxHealth;
    this.attackCooldown = 0;
    this.renderHealthBar();
  }

  /**
   * Subtle visual juice for jumps and landings
   * @param {number} sx
   * @param {number} sy
   */
  triggerSquashAndStretch(sx, sy) {
    this.setScale(sx, sy);
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Quad.easeOut'
    });
  }

  /**
   * Repositions floating overhead health bar directly above player sprite
   */
  updateHealthBarPosition() {
    if (!this.healthBar || !this.active) return;
    this.healthBar.setPosition(this.x, this.y);
  }

  /**
   * Renders segmented/gradient health gauge above character head
   * Dimensions: 36x5 px with 1px border and high-contrast styling
   * @param {number} [hp]
   * @param {number} [maxHp]
   */
  renderHealthBar(hp = this.currentHealth, maxHp = this.maxHealth) {
    if (!this.healthBar) return;
    this.healthBar.clear();

    if (this.lifeState === LifeState.DEAD || !this.visible) {
      return;
    }

    const barW = 36;
    const barH = 5;
    const offX = -18;
    const offY = -28;

    // Background shadow and backing box
    this.healthBar.fillStyle(0x000000, 0.75);
    this.healthBar.fillRect(offX - 1, offY - 1, barW + 2, barH + 2);
    this.healthBar.fillStyle(0x0f172a, 0.95);
    this.healthBar.fillRect(offX, offY, barW, barH);

    // Compute health ratio
    const safeMax = Math.max(1, maxHp);
    const safeHp = Math.max(0, Math.min(safeMax, hp));
    const ratio = safeHp / safeMax;
    const fillW = Math.round(barW * ratio);

    if (fillW > 0) {
      // Color coding: Green (>60%), Amber (30%-60%), Red (<30%)
      let fillColor = 0x22c55e;
      if (ratio <= 0.3) {
        fillColor = 0xef4444;
      } else if (ratio <= 0.6) {
        fillColor = 0xf59e0b;
      }

      this.healthBar.fillStyle(fillColor, 1);
      this.healthBar.fillRect(offX, offY, fillW, barH);

      // Inner highlight line for sleek neon glow
      this.healthBar.fillStyle(0xffffff, 0.4);
      this.healthBar.fillRect(offX, offY, fillW, 1);
    }

    // Border: gold/cyan if shield active, dark slate otherwise
    const hasShield = (this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive('AEGIS_CORE'));
    const borderColor = hasShield ? 0x00f0ff : 0x334155;
    this.healthBar.lineStyle(1, borderColor, 0.85);
    this.healthBar.strokeRect(offX, offY, barW, barH);

    this.healthBar.setPosition(this.x, this.y);
  }

  /**
   * Equips a new firearm weapon
   * @param {string} weaponType
   */
  setWeapon(weaponType) {
    if (!weaponType) return;
    this.equippedWeapon = weaponType;
    this.attackCooldown = 0;
  }

  /**
   * Retrieves active weapon identifier
   * @returns {string}
   */
  getWeapon() {
    return this.equippedWeapon || 'REVOLVER';
  }

  /**
   * Executes weapon attack/fire in facing direction
   * Triggered by [F] key or touch attack button
   * @returns {boolean} Whether attack was successfully fired
   */
  attack() {
    // Cannot attack while dead or in cooldown
    if (this.lifeState === LifeState.DEAD || this.lifeState === LifeState.RESPAWNING) {
      return false;
    }
    if (this.attackCooldown > 0) {
      return false;
    }

    const weapon = this.getWeapon();
    const spec = PlayerBullet.getWeaponSpec(weapon);
    this.attackCooldown = (spec.cooldownMs || 280) / 1000;

    const dir = this.flipX ? -1 : 1;
    const spawnX = this.x + (dir * 14);
    const spawnY = this.y - 2;

    // Spawn projectile via GameScene
    if (this.scene && typeof this.scene.spawnPlayerBullet === 'function') {
      this.scene.spawnPlayerBullet(spawnX, spawnY, dir, weapon);
    }

    // Shotgun fires 2 additional spread pellets
    if (weapon === 'SHOTGUN' && this.scene && typeof this.scene.spawnPlayerBullet === 'function') {
      const b2 = this.scene.spawnPlayerBullet(spawnX, spawnY - 4, dir, weapon);
      if (b2 && b2.body) b2.setVelocityY(-60);
      const b3 = this.scene.spawnPlayerBullet(spawnX, spawnY + 4, dir, weapon);
      if (b3 && b3.body) b3.setVelocityY(60);
    }

    // Subtle gun recoil animation on character
    this.triggerSquashAndStretch(0.92, 1.08);

    // Audio SFX
    if (this.scene && this.scene.audioSystem) {
      this.scene.audioSystem.playSFX('PLAYER_FIRE');
    }

    // Visual muzzle flash
    const flash = this.scene.add.circle(spawnX, spawnY, 5, spec.glowColor, 0.9);
    flash.setDepth(22);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.8,
      alpha: 0,
      duration: 80,
      onComplete: () => flash.destroy()
    });

    return true;
  }

  /**
   * Clean up event listeners and graphics upon destruction
   */
  destroy(fromScene) {
    if (this.healthListener && this.scene && this.scene.events) {
      this.scene.events.off('HEALTH_CHANGED', this.healthListener);
      this.healthListener = null;
    }
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    super.destroy(fromScene);
  }
}
