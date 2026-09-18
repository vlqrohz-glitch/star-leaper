import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { VoidCrawler } from '../entities/VoidCrawler.js';
import { OrbitalSentinel } from '../entities/OrbitalSentinel.js';
import { RiftHopper } from '../entities/RiftHopper.js';
import { NebulaWisp } from '../entities/NebulaWisp.js';
import { Gunslinger } from '../entities/Gunslinger.js';
import { DynamiteBandit } from '../entities/DynamiteBandit.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { FallingPlatform } from '../entities/FallingPlatform.js';
import { LaunchPad } from '../entities/LaunchPad.js';
import { EnergyGate } from '../entities/EnergyGate.js';
import { HazardZone } from '../entities/HazardZone.js';
import { GravityZone } from '../entities/GravityZone.js';
import { Goal } from '../entities/Goal.js';
import { Collectible } from '../entities/Collectible.js';
import { PowerUp } from '../entities/PowerUp.js';
import { Pet } from '../entities/Pet.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { HealthSystem } from '../systems/HealthSystem.js';
import { LivesSystem } from '../systems/LivesSystem.js';
import { LevelCompletionSystem } from '../systems/LevelCompletionSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { PlayerBullet } from '../entities/PlayerBullet.js';
import { WeaponPickup } from '../entities/WeaponPickup.js';
import { Boss } from '../entities/Boss.js';
import { ScoreboardSystem } from '../systems/ScoreboardSystem.js';
import { CheatSystem } from '../systems/CheatSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { FeedbackSystem } from '../systems/FeedbackSystem.js';
import { ParallaxBackgroundSystem } from '../systems/ParallaxBackgroundSystem.js';
import { AUDIO_KEYS, MUSIC_STATES } from '../config/audioConfig.js';
import { UIState } from '../config/uiConfig.js';
import { getLevelData } from '../levels/index.js';
import { LEVEL_1_DATA } from '../levels/level1.js';
import { ENEMY_CONFIG } from '../config/enemyConfig.js';
import { HEALTH_CONFIG, LifeState } from '../config/playerHealthConfig.js';
import { POWERUP_CONFIG, PowerUpState, PowerUpType } from '../config/powerUpConfig.js';
import { INVENTORY_CATALOG } from '../config/inventoryConfig.js';

/**
 * Main Game Scene - Star-Leaper: Orion Odyssey
 * Supports dynamic sector loading (Levels 1–6, 10 sublevels each with Final Bosses),
 * 4 playable operatives, 5-layer parallax engine, advanced hazards, moving/falling platforms, and pause menu.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelIndex = (data && data.levelIndex) ? data.levelIndex : 1;
    this.subLevel = (data && data.subLevel) ? data.subLevel : 1;
    this.characterId = (data && data.characterId) ? data.characterId : 'NOVA';
    this.levelData = getLevelData(this.levelIndex, this.subLevel) || LEVEL_1_DATA;
    this.nearbyWeaponPickup = null;
    this.boss = null;
  }

  create() {
    this.isGameOver = false;

    // 2. Configure Physics World Boundaries
    this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.deathZoneY + 60);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // 3. Multi-Layer Parallax Background System
    this.createBackground();

    // 4. Build Platforms from Level Data
    this.createPlatforms();
    this.createMovingPlatforms();
    this.createFallingPlatforms();
    this.createMechanics();

    // 5. Level Markers & Goal Beacon
    this.createLevelMarkers();
    this.createDecorations();

    // 6. Game State & Progress Systems (Authoritative Gameplay Subsystems)
    const totalCollectibles = (this.levelData.collectibles || []).length;
    this.scoreSystem = new ScoreSystem(this, totalCollectibles);
    const maxHp = HEALTH_CONFIG.MAX_HEALTH + ((ShopSystem.getEquippedPerk() && ShopSystem.getEquippedPerk().id === 'reinforced_plating') ? 1 : 0);
    this.healthSystem = new HealthSystem(this, maxHp);
    this.livesSystem = new LivesSystem(this);
    this.levelCompletionSystem = new LevelCompletionSystem(this);
    this.powerUpSystem = new PowerUpSystem(this);

    // 7. Spawn Collectibles, Enemies & Power-Ups from Level Data
    this.createCollectibles();
    this.createEnemies();
    this.createPowerUps();

    // 8. Instantiate Player at Configured Spawn Position with Selected Operative
    this.player = new Player(this, this.levelData.spawn.x, this.levelData.spawn.y, this.characterId);

    // Spawn equipped companion pet if active
    const equippedPet = ShopSystem.getEquippedPet();
    if (equippedPet && this.textures.exists(equippedPet.texture)) {
      this.pet = new Pet(this, this.player, equippedPet.texture);
    } else {
      this.pet = null;
    }

    // Shield Aura Forcefield Visual for Player
    this.playerShieldAura = this.add.image(this.levelData.spawn.x, this.levelData.spawn.y, 'player_shield_aura')
      .setVisible(false)
      .setDepth(15);

    // 9. Physics Collisions & Overlaps
    // Player <-> Static Platforms
    this.physics.add.collider(this.player, this.platforms);

    // Player <-> Moving Platforms
    if (this.movingPlatforms) {
      this.physics.add.collider(this.player, this.movingPlatforms);
    }

    // Player <-> Falling Platforms
    if (this.fallingPlatforms) {
      this.physics.add.collider(this.player, this.fallingPlatforms, (player, fp) => {
        if (player.body && (player.body.blocked.down || player.body.touching.down)) {
          fp.trigger();
        }
      });
    }

    // Player <-> Launch Pads
    if (this.launchPads) {
      this.physics.add.overlap(this.player, this.launchPads, (player, lp) => {
        lp.launch(player);
      });
    }

    // Player <-> Hazard Zones
    if (this.hazardZones) {
      this.physics.add.overlap(this.player, this.hazardZones, (player, hz) => {
        hz.onPlayerOverlap(player);
      });
    }

    // Player <-> Gravity Zones
    if (this.gravityZones) {
      this.physics.add.overlap(this.player, this.gravityZones, (player, gz) => {
        gz.onPlayerOverlap(player);
      });
    }

    // Player <-> Energy Gates
    if (this.energyGates) {
      this.physics.add.collider(this.player, this.energyGates, (player, gate) => {
        if (gate.isActive) {
          this.handlePlayerEnemyCollision(player, gate);
        }
      });
    }

    // Enemies <-> Platforms
    this.physics.add.collider(this.enemies, this.platforms, (enemy, platform) => {
      if (enemy.onPlatformCollide) {
        enemy.onPlatformCollide(platform);
      }
    });

    // Player <-> Collectibles
    this.physics.add.overlap(this.player, this.collectibles, (player, item) => {
      if (!this.uiSystem.isTitleActive() && !this.levelCompletionSystem.isLevelComplete() && !this.isGameOver) {
        item.collect();
      }
    });

    // Player <-> Power-Ups
    this.physics.add.overlap(this.player, this.powerUps, (player, powerUp) => {
      if (!this.uiSystem.isTitleActive() && !this.levelCompletionSystem.isLevelComplete() && !this.isGameOver && this.player.lifeState === LifeState.ALIVE) {
        powerUp.collect();
      }
    });

    // Player <-> Enemies (Combat / Stomp Collision)
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerEnemyCollision(player, enemy);
    });

    // 9b. Enemy Projectiles (Bullets & Dynamite)
    this.enemyProjectiles = this.physics.add.group();
    this.physics.add.collider(this.enemyProjectiles, this.platforms, (proj) => {
      if (proj.isBullet) proj.explode(false);
    });
    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      this.handlePlayerProjectileCollision(player, proj);
    });

    // 9c. Player Projectiles & Weapon Pickups
    this.playerProjectiles = this.physics.add.group();
    this.physics.add.collider(this.playerProjectiles, this.platforms, (proj) => {
      if (proj && typeof proj.explode === 'function') proj.explode(false);
    });
    this.physics.add.overlap(this.playerProjectiles, this.enemies, (bullet, enemy) => {
      this.handleBulletEnemyHit(bullet, enemy);
    });

    this.weaponPickups = this.physics.add.group();
    this.physics.add.overlap(this.player, this.weaponPickups, (player, pickup) => {
      this.nearbyWeaponPickup = pickup;
    });
    this.createWeaponPickup();

    // Player <-> Goal Beacon
    this.physics.add.overlap(this.player, this.goal, () => {
      this.handleGoalReached();
    });

    // 10. Input System
    this.inputSystem = new InputSystem(this);

    // Title / Start Screen Keys (ENTER and SPACE)
    this.startKeyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.startKeySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.startKeyEnter.on('down', () => this.handleStartInput());
    this.startKeySpace.on('down', () => this.handleStartInput());

    // 11. Full Level Restart Key ('R')
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.restartKey.on('down', () => this.restartLevel());

    // 12. Weapon Controls: 'Q' to Equip / Collect, 'E' to Fire / Attack (also supports 'F' secondary)
    this.equipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.equipKey.on('down', () => this.handleEquipKey());

    this.useKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.useKey.on('down', () => this.handlePlayerAttack());
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.attackKey.on('down', () => this.handlePlayerAttack());

    // Scoreboard Shortcut Key ('B')
    this.scoreboardKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.scoreboardKey.on('down', () => {
      if (this.uiSystem) {
        this.uiSystem.toggleScoreboard();
      }
    });

    // In-game Inventory Weapon Arsenal Key ('I')
    this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.inventoryKey.on('down', () => this.toggleInventory());

    // 1-9 Number Keybinds for Instant Inventory Weapon Selection
    const slotKeyCodes = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
      Phaser.Input.Keyboard.KeyCodes.SIX,
      Phaser.Input.Keyboard.KeyCodes.SEVEN,
      Phaser.Input.Keyboard.KeyCodes.EIGHT,
      Phaser.Input.Keyboard.KeyCodes.NINE
    ];
    slotKeyCodes.forEach((kCode, idx) => {
      const k = this.input.keyboard.addKey(kCode);
      k.on('down', () => this.equipWeaponBySlot(idx + 1));
    });

    // 13. Pause Key ('ESC') - Also returns to Main Menu or dismisses open overlays
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pauseKey.on('down', () => {
      if (this.uiSystem && typeof this.uiSystem.isInventoryActive === 'function' && this.uiSystem.isInventoryActive()) {
        this.uiSystem.hideInventory();
        return;
      }
      if (this.levelCompletionSystem && this.levelCompletionSystem.isLevelComplete()) {
        this.returnToTitleScreen();
        return;
      }
      this.togglePause();
    });

    // 14. Level Select Shortcut Key ('L')
    this.levelSelectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.levelSelectKey.on('down', () => {
      if (this.levelCompletionSystem && this.levelCompletionSystem.isLevelComplete()) {
        this.scene.start('LevelSelectScene', { characterId: this.characterId });
      }
    });

    // Universal Mobile Tap / Pointer Tap to resume audio or dismiss title / game over
    this.input.on('pointerdown', () => {
      if (this.audioSystem) {
        this.audioSystem.resumeContext();
      }
      if (this.uiSystem && this.uiSystem.isTitleActive()) {
        this.handleStartInput();
        return;
      }
      if (this.isGameOver) {
        this.handleStartInput();
        return;
      }
    });

    // 15. Camera Setup (Smooth horizontal follow with bounded viewport)
    this.setupCamera();

    // 16. Dedicated Presentation & UI System
    this.uiSystem = new UISystem(this);
    this.uiSystem.initialize();

    // 17. Dedicated Audio & Feedback Systems
    this.audioSystem = new AudioSystem(this);
    this.audioSystem.initialize(this);
    this.feedbackSystem = new FeedbackSystem(this);
    this.feedbackSystem.initialize(this);

    // Mute Toggle Key ('M')
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.muteKey.on('down', () => {
      this.audioSystem.toggleMute();
    });

    // Cheat Terminal Key ('C')
    this.cheatKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.cheatKey.on('down', () => {
      if (this.uiSystem) {
        this.uiSystem.showCheatTerminal();
      }
    });

    // Start Title Music
    this.audioSystem.playMusic(MUSIC_STATES.TITLE_MUSIC);

    // 18. Event Bindings
    this.bindEvents();
    this.uiSystem.updateHUD();
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  togglePause() {
    if (this.uiSystem) {
      this.uiSystem.togglePause();
    }
  }

  handleStartInput() {
    // If Game Over, return to title screen
    if (this.isGameOver) {
      this.returnToTitleScreen();
      return;
    }

    // If Level Complete, advance to next sublevel or next sector
    if (this.levelCompletionSystem && this.levelCompletionSystem.isLevelComplete()) {
      if (this.subLevel < 10) {
        this.scene.restart({
          levelIndex: this.levelIndex,
          subLevel: this.subLevel + 1,
          characterId: this.characterId
        });
      } else if (this.levelIndex < 6) {
        this.scene.restart({
          levelIndex: this.levelIndex + 1,
          subLevel: 1,
          characterId: this.characterId
        });
      } else {
        // Grand victory loop: back to Level Select
        this.scene.start('LevelSelectScene', { characterId: this.characterId });
      }
      return;
    }

    if (this.uiSystem && this.uiSystem.isTitleActive()) {
      this.audioSystem.playSFX(AUDIO_KEYS.UI_START);
      this.uiSystem.hideTitleScreen(() => {
        this.audioSystem.stopMusic();
        this.audioSystem.playMusic(MUSIC_STATES.GAMEPLAY_MUSIC);
      });
    }
  }

  createBackground() {
    // 5-Layer Parallax Background System
    if (this.parallaxSystem) {
      this.parallaxSystem.destroy();
    }
    this.parallaxSystem = new ParallaxBackgroundSystem(this, this.levelData.theme || {});
    this.parallaxSystem.initialize();

    // Retain fallback tileSprite for tests inspecting 'background' texture existence
    if (!this.bg) {
      this.bg = this.add.tileSprite(0, 0, this.levelData.width, 450, 'background')
        .setOrigin(0, 0)
        .setScrollFactor(0.2, 1)
        .setVisible(false);
    }
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    for (const p of this.levelData.platforms) {
      const platformSprite = this.add.tileSprite(p.x, p.y, p.width, p.height, p.type || 'platform');
      this.physics.add.existing(platformSprite, true);
      this.platforms.add(platformSprite);
    }
  }

  createMovingPlatforms() {
    this.movingPlatforms = this.physics.add.group();
    if (this.levelData.movingPlatforms) {
      for (const mp of this.levelData.movingPlatforms) {
        const platform = new MovingPlatform(this, mp.x, mp.y, mp.width, mp.height, mp);
        this.movingPlatforms.add(platform);
      }
    }
  }

  createFallingPlatforms() {
    this.fallingPlatforms = this.physics.add.group();
    if (this.levelData.fallingPlatforms) {
      for (const fp of this.levelData.fallingPlatforms) {
        const platform = new FallingPlatform(this, fp.x, fp.y, fp.width, fp.height, fp);
        this.fallingPlatforms.add(platform);
      }
    }
  }

  createMechanics() {
    // Launch Pads
    this.launchPads = this.physics.add.staticGroup();
    if (this.levelData.launchPads) {
      for (const lp of this.levelData.launchPads) {
        const pad = new LaunchPad(this, lp.x, lp.y, lp.force);
        this.launchPads.add(pad);
      }
    }

    // Energy Gates
    this.energyGates = this.physics.add.staticGroup();
    if (this.levelData.energyGates) {
      for (const eg of this.levelData.energyGates) {
        const gate = new EnergyGate(this, eg.x, eg.y, eg);
        this.energyGates.add(gate);
      }
    }

    // Hazard Zones (Magma / Plasma)
    this.hazardZones = this.physics.add.staticGroup();
    if (this.levelData.hazardZones) {
      for (const hz of this.levelData.hazardZones) {
        const zone = new HazardZone(this, hz.x, hz.y, hz.width, hz.height, hz.texture);
        this.hazardZones.add(zone);
      }
    }

    // Gravity Zones
    this.gravityZones = this.physics.add.staticGroup();
    if (this.levelData.gravityZones) {
      for (const gz of this.levelData.gravityZones) {
        const zone = new GravityZone(this, gz.x, gz.y, gz.width, gz.height, gz.gravityScale);
        this.gravityZones.add(zone);
      }
    }
  }

  createLevelMarkers() {
    this.startPad = this.add.image(this.levelData.spawn.x, this.levelData.spawn.y + 16, 'start_pad');
    this.goal = new Goal(this, this.levelData.goal.x, this.levelData.goal.y);

    this.goalLabel = this.add.text(this.levelData.goal.x, this.levelData.goal.y - 42, 'WARP GATE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);

    // If boss level, hide and disable goal beacon until boss is defeated
    if (this.levelData.goal && this.levelData.goal.initiallyHidden) {
      this.goal.setVisible(false);
      if (this.goal.body) this.goal.body.enable = false;
      this.goalLabel.setVisible(false);
    }
  }

  createDecorations() {
    this.decorations = [];
    if (!this.levelData.decorations || !Array.isArray(this.levelData.decorations)) {
      return;
    }

    for (const d of this.levelData.decorations) {
      if (!this.textures.exists(d.texture)) continue;

      const originX = d.originX !== undefined ? d.originX : 0.5;
      const originY = d.originY !== undefined ? d.originY : 1; // Default grounded at bottom
      const spr = this.add.image(d.x, d.y, d.texture)
        .setOrigin(originX, originY)
        .setDepth(d.depth || 8)
        .setAlpha(d.alpha || 1);

      if (d.scale) spr.setScale(d.scale);
      if (d.flipX) spr.setFlipX(true);

      // Character & Lore POI Plaque / Overhead Badge
      if (d.label) {
        const sprHeight = (spr.height || 32) * (spr.scaleY || 1);
        const labelY = d.y - (sprHeight * originY) - 10;

        const lblBg = this.add.text(d.x, labelY, d.label, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: d.labelColor || '#facc15',
          backgroundColor: '#05070dbb',
          padding: { x: 5, y: 3 }
        }).setOrigin(0.5, 1).setDepth(14);

        // Subtle floating glow animation for character POI plaques
        this.tweens.add({
          targets: lblBg,
          y: labelY - 4,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Atmospheric animation for tumbleweeds
      if (d.texture === 'scenery_tumbleweed') {
        const driftDistance = d.drift || 90;
        this.tweens.add({
          targets: spr,
          x: spr.x + driftDistance,
          angle: 360,
          duration: 3200,
          yoyo: true,
          repeat: -1,
          ease: 'Linear'
        });
      }

      this.decorations.push(spr);
    }
  }

  createCollectibles() {
    this.collectibles = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    if (this.levelData.collectibles) {
      for (const item of this.levelData.collectibles) {
        const collectible = new Collectible(this, item.x, item.y, item.type || 'star_crystal', item.value);
        this.collectibles.add(collectible);
      }
    }
  }

  createEnemies() {
    this.enemies = this.physics.add.group();

    if (this.levelData.enemies) {
      for (const e of this.levelData.enemies) {
        let enemy;
        if (e.type === 'VOID_CRAWLER') {
          enemy = new VoidCrawler(this, e.x, e.y);
        } else if (e.type === 'ORBITAL_SENTINEL') {
          enemy = new OrbitalSentinel(this, e.x, e.y);
        } else if (e.type === 'RIFT_HOPPER') {
          enemy = new RiftHopper(this, e.x, e.y);
        } else if (e.type === 'NEBULA_WISP') {
          enemy = new NebulaWisp(this, e.x, e.y);
        } else if (e.type === 'GUNSLINGER') {
          enemy = new Gunslinger(this, e.x, e.y);
        } else if (e.type === 'DYNAMITE_BANDIT') {
          enemy = new DynamiteBandit(this, e.x, e.y);
        } else {
          enemy = new Enemy(this, e.x, e.y);
        }
        this.enemies.add(enemy);
      }
    }

    // Spawn Boss if Level Data defines a Final Boss
    if (this.levelData.boss) {
      const bInfo = this.levelData.boss;
      this.boss = new Boss(this, bInfo.x, bInfo.y, bInfo.sectorIndex || this.levelIndex);
      this.physics.add.collider(this.boss, this.platforms);
      if (this.movingPlatforms) {
        this.physics.add.collider(this.boss, this.movingPlatforms);
      }
      this.physics.add.collider(this.player, this.boss, (player, boss) => {
        this.handlePlayerBossCollision(player, boss);
      });
      this.physics.add.overlap(this.playerProjectiles, this.boss, (bullet, boss) => {
        this.handleBulletBossHit(bullet, boss);
      });
    } else {
      this.boss = null;
    }
  }

  createPowerUps() {
    this.powerUps = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    if (this.levelData.powerUps) {
      for (const item of this.levelData.powerUps) {
        const powerUp = new PowerUp(this, item.x, item.y, item.type);
        this.powerUps.add(powerUp);
      }
    }
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.levelData.width, this.levelData.height);
    cam.startFollow(this.player, true, 0.06, 0.04);
    cam.setDeadzone(70, 45);
  }

  handlePowerUpActivated() {
    if (this.playerShieldAura) {
      this.playerShieldAura.setPosition(this.player.x, this.player.y);
      this.playerShieldAura.setVisible(true);
    }
    if (this.uiSystem) {
      this.uiSystem.updateHUD();
    }
  }

  handlePowerUpExpired() {
    if (this.playerShieldAura) {
      this.playerShieldAura.setVisible(false);
    }
    if (this.uiSystem) {
      this.uiSystem.updateHUD();
    }
  }

  handleDamagePrevented() {
    if (this.playerShieldAura) {
      this.tweens.add({
        targets: this.playerShieldAura,
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 90,
        yoyo: true
      });
    }
  }

  handlePlayerEnemyCollision(player, enemy) {
    if (
      this.uiSystem.isTitleActive() ||
      this.isGameOver ||
      this.levelCompletionSystem.isLevelComplete() ||
      player.lifeState !== LifeState.ALIVE ||
      enemy.getState() === 'DEFEATED'
    ) {
      return;
    }

    // 1. Nova Burst active: destroys enemy on contact from any angle
    if (this.powerUpSystem && this.powerUpSystem.isPowerUpActive('NOVA_BURST')) {
      enemy.defeat();
      this.audioSystem.playSFX(AUDIO_KEYS.ENEMY_DEFEAT);
      player.bounceAfterStomp(ENEMY_CONFIG.STOMP_BOUNCE_FORCE);
      return;
    }

    // 2. Aegis Shield active: blocks enemy damage
    if (this.powerUpSystem && this.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
      this.handleDamagePrevented();
      const dir = (player.x < enemy.x) ? -1 : 1;
      player.setVelocityX(dir * 120);
      return;
    }

    // 3. Stomp Attack Condition
    const isStomp = (player.body.velocity.y > 0) && (player.y + player.height / 2 <= enemy.y + ENEMY_CONFIG.STOMP_OFFSET_THRESHOLD);

    if (isStomp) {
      if (typeof enemy.takeDamage === 'function') {
        enemy.takeDamage(30);
      } else {
        enemy.defeat();
      }
      player.bounceAfterStomp(ENEMY_CONFIG.STOMP_BOUNCE_FORCE);
    } else {
      const hit = player.handleEnemyHit(enemy);
      if (hit && this.healthSystem) {
        this.healthSystem.takeDamage(HEALTH_CONFIG.DAMAGE_PER_HIT, 'enemy');
      }
    }
  }

  handlePlayerProjectileCollision(player, proj) {
    if (
      this.uiSystem.isTitleActive() ||
      this.isGameOver ||
      this.levelCompletionSystem.isLevelComplete() ||
      player.lifeState !== LifeState.ALIVE
    ) {
      return;
    }

    if (this.powerUpSystem && this.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
      this.handleDamagePrevented();
      if (proj.explode) proj.explode(true);
      else proj.destroy();
      return;
    }

    const hit = player.handleEnemyHit(proj);
    if (hit && this.healthSystem) {
      this.healthSystem.takeDamage(HEALTH_CONFIG.DAMAGE_PER_HIT, 'projectile');
    }
    if (proj.explode) proj.explode(true);
    else proj.destroy();
  }

  handlePlayerBossCollision(player, boss) {
    if (
      this.uiSystem.isTitleActive() ||
      this.isGameOver ||
      this.levelCompletionSystem.isLevelComplete() ||
      player.lifeState !== LifeState.ALIVE ||
      boss.state === 'DEFEATED'
    ) {
      return;
    }

    // Aegis shield blocks damage
    if (this.powerUpSystem && this.powerUpSystem.isPowerUpActive('AEGIS_CORE')) {
      this.handleDamagePrevented();
      const dir = (player.x < boss.x) ? -1 : 1;
      player.setVelocityX(dir * 150);
      return;
    }

    // Check stomp from above
    const isFalling = player.body.velocity.y > 0;
    const playerBottom = player.y + (player.height / 2);
    const bossTop = boss.y - (boss.height / 2);

    if (isFalling && (playerBottom <= bossTop + 14)) {
      player.bounceAfterStomp(ENEMY_CONFIG.STOMP_BOUNCE_FORCE || -280);
      boss.takeDamage(25);
      if (this.cameras && this.cameras.main) {
        this.cameras.main.shake(120, 0.008);
      }
      return;
    }

    // Side hit: 5 HP damage to player
    const hit = player.handleEnemyHit(boss);
    if (hit && this.healthSystem) {
      this.healthSystem.takeDamage(HEALTH_CONFIG.DAMAGE_PER_HIT, 'boss');
    }
  }

  handleBulletBossHit(bullet, boss) {
    if (!bullet || !boss || boss.state === 'DEFEATED' || !bullet.active) return;
    const dmg = bullet.damage || 10;
    boss.takeDamage(dmg);
    this.spawnDamagePopup(boss.x, boss.y - 20, dmg);
    if (bullet.explode) {
      bullet.explode(true);
    } else {
      bullet.destroy();
    }
  }

  activateBossGoal() {
    if (this.goal) {
      this.goal.setVisible(true);
      if (this.goal.body) this.goal.body.enable = true;
      if (this.goalLabel) this.goalLabel.setVisible(true);
      if (this.cameras && this.cameras.main) {
        this.cameras.main.flash(350, 0, 240, 255);
      }
      const ring = this.add.circle(this.goal.x, this.goal.y, 40, 0x00f0ff, 0.8);
      this.tweens.add({
        targets: ring,
        scale: 2.5,
        alpha: 0,
        duration: 600,
        onComplete: () => ring.destroy()
      });
    }
  }

  handleGoalReached() {
    if (
      this.uiSystem.isTitleActive() ||
      this.isGameOver ||
      this.levelCompletionSystem.isLevelComplete() ||
      this.player.lifeState !== LifeState.ALIVE
    ) {
      return;
    }

    if (this.audioSystem) {
      this.audioSystem.playSFX(AUDIO_KEYS.GOAL_REACHED);
    }
    if (this.feedbackSystem) {
      this.feedbackSystem.goalReached();
    }

    this.goal.trigger();
    this.player.setVelocity(0, 0);

    const stats = {
      score: this.scoreSystem.getScore(),
      crystalsCollected: this.scoreSystem.getCollectedCount(),
      crystalsTotal: this.scoreSystem.getTotalCount(),
      enemiesDefeated: this.enemies.getChildren().filter(e => e.getState && e.getState() === 'DEFEATED').length,
      enemiesTotal: this.enemies.getChildren().length,
      livesRemaining: this.livesSystem.getLives(),
      healthRemaining: this.healthSystem.getHealth()
    };

    this.levelCompletionSystem.completeLevel(stats);
  }

  handlePlayerDeath(source = 'damage') {
    if (
      this.uiSystem.isTitleActive() ||
      this.isGameOver ||
      this.levelCompletionSystem.isLevelComplete() ||
      this.player.lifeState === LifeState.DEAD ||
      this.player.lifeState === LifeState.RESPAWNING
    ) {
      return;
    }

    this.player.lifeState = LifeState.DEAD;
    this.player.setVelocity(0, 0);
    this.powerUpSystem.reset();
    if (this.playerShieldAura) {
      this.playerShieldAura.setVisible(false);
    }

    if (this.audioSystem) {
      this.audioSystem.playSFX(AUDIO_KEYS.PLAYER_DEATH);
    }
    if (this.feedbackSystem) {
      this.feedbackSystem.playerDeath();
    }

    this.cameras.main.flash(250, 255, 30, 60);
    this.livesSystem.loseLife();

    if (this.livesSystem.hasLivesRemaining()) {
      this.player.lifeState = LifeState.RESPAWNING;
      this.time.delayedCall(HEALTH_CONFIG.RESPAWN_DELAY, () => {
        this.player.reset(this.levelData.spawn.x, this.levelData.spawn.y);
        this.healthSystem.reset();
        this.player.setPostRespawnInvulnerability();
        this.audioSystem.playSFX(AUDIO_KEYS.PLAYER_RESPAWN);
        this.feedbackSystem.playerRespawn();
      });
    } else {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.audioSystem.stopMusic();
    this.audioSystem.playSFX(AUDIO_KEYS.GAME_OVER);
    this.audioSystem.playMusic(MUSIC_STATES.GAME_OVER_MUSIC);

    this.player.setVelocity(0, 0);
    this.player.lifeState = LifeState.DEAD;

    if (this.feedbackSystem) {
      this.feedbackSystem.screenShake(0.015, 250);
    }

    this.uiSystem.showGameOver();

    if (this.gameOverTimer) {
      this.gameOverTimer.remove(false);
    }
    this.gameOverTimer = this.time.delayedCall(2500, () => {
      if (this.isGameOver) {
        this.returnToTitleScreen();
      }
    });
  }

  returnToTitleScreen() {
    if (this.gameOverTimer) {
      this.gameOverTimer.remove(false);
      this.gameOverTimer = null;
    }

    this.isGameOver = false;

    // Reset Authoritative Systems
    this.levelCompletionSystem.reset();
    this.powerUpSystem.reset();
    this.healthSystem.reset();
    this.livesSystem.reset();
    this.scoreSystem.reset();

    // Reset Entities
    this.goal.reset();
    this.collectibles.getChildren().forEach(c => c.reset && c.reset());
    this.enemies.getChildren().forEach(e => e.reset && e.reset());
    this.powerUps.getChildren().forEach(p => p.reset && p.reset());
    if (this.movingPlatforms) this.movingPlatforms.getChildren().forEach(mp => mp.reset && mp.reset());
    if (this.fallingPlatforms) this.fallingPlatforms.getChildren().forEach(fp => fp.reset && fp.reset());
    if (this.energyGates) this.energyGates.getChildren().forEach(eg => eg.reset && eg.reset());
    if (this.enemyProjectiles) this.enemyProjectiles.clear(true, true);
    if (this.playerProjectiles) this.playerProjectiles.clear(true, true);
    if (this.weaponPickups) {
      this.weaponPickups.clear(true, true);
      this.createWeaponPickup();
    }
    this.nearbyWeaponPickup = null;
    if (this.boss && this.levelData.boss) {
      this.boss.reset(this.levelData.boss.x, this.levelData.boss.y);
    }

    // Reset Player & Companion Pet
    this.player.reset(this.levelData.spawn.x, this.levelData.spawn.y);
    this.player.setVelocity(0, 0);
    if (this.playerShieldAura) {
      this.playerShieldAura.setVisible(false);
    }
    if (this.pet) {
      this.pet.reset(this.levelData.spawn.x, this.levelData.spawn.y);
    }

    // Audio & Feedback Reset
    if (this.feedbackSystem) {
      this.feedbackSystem.reset();
    }
    if (this.audioSystem) {
      this.audioSystem.reset();
      this.audioSystem.playMusic(MUSIC_STATES.TITLE_MUSIC);
    }

    if (this.cameras.main) {
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(300);
    }

    if (this.uiSystem) {
      this.uiSystem.showTitleScreen();
      this.uiSystem.updateHUD();
    }
  }

  restartLevel() {
    if (this.gameOverTimer) {
      this.gameOverTimer.remove(false);
      this.gameOverTimer = null;
    }
    if (this.isGameOver) {
      this.returnToTitleScreen();
      return;
    }

    this.isGameOver = false;

    if (this.audioSystem) {
      this.audioSystem.reset();
      this.audioSystem.playSFX(AUDIO_KEYS.UI_START);
      this.audioSystem.playMusic(MUSIC_STATES.GAMEPLAY_MUSIC);
    }
    if (this.feedbackSystem) {
      this.feedbackSystem.reset();
    }

    this.cameras.main.flash(300, 0, 240, 255);

    this.levelCompletionSystem.reset();
    this.powerUpSystem.reset();
    this.healthSystem.reset();
    this.livesSystem.reset();
    this.scoreSystem.reset();

    this.goal.reset();
    this.collectibles.getChildren().forEach(c => c.reset && c.reset());
    this.enemies.getChildren().forEach(e => e.reset && e.reset());
    this.powerUps.getChildren().forEach(p => p.reset && p.reset());
    if (this.movingPlatforms) this.movingPlatforms.getChildren().forEach(mp => mp.reset && mp.reset());
    if (this.fallingPlatforms) this.fallingPlatforms.getChildren().forEach(fp => fp.reset && fp.reset());
    if (this.energyGates) this.energyGates.getChildren().forEach(eg => eg.reset && eg.reset());
    if (this.enemyProjectiles) this.enemyProjectiles.clear(true, true);
    if (this.playerProjectiles) this.playerProjectiles.clear(true, true);
    if (this.weaponPickups) {
      this.weaponPickups.clear(true, true);
      this.createWeaponPickup();
    }
    this.nearbyWeaponPickup = null;
    if (this.boss && this.levelData.boss) {
      this.boss.reset(this.levelData.boss.x, this.levelData.boss.y);
    }
    if (this.levelData.goal && this.levelData.goal.initiallyHidden) {
      this.goal.setVisible(false);
      if (this.goal.body) this.goal.body.enable = false;
      if (this.goalLabel) this.goalLabel.setVisible(false);
    }

    this.player.reset(this.levelData.spawn.x, this.levelData.spawn.y);
    if (this.playerShieldAura) {
      this.playerShieldAura.setVisible(false);
    }
    if (this.pet) {
      this.pet.reset(this.levelData.spawn.x, this.levelData.spawn.y);
    }

    if (this.uiSystem) {
      this.uiSystem.reset();
    }
  }

  bindEvents() {
    this.events.on('COLLECTIBLE_COLLECTED', () => {
      this.audioSystem.playSFX(AUDIO_KEYS.CRYSTAL_COLLECT);
    });

    this.events.on('ENEMY_DEFEATED', (data) => {
      this.audioSystem.playSFX(AUDIO_KEYS.ENEMY_DEFEAT);
      if (this.feedbackSystem) {
        this.feedbackSystem.enemyDefeated(data.x, data.y);
      }
    });

    this.events.on('HEALTH_CHANGED', (data) => {
      if (data.delta < 0) {
        this.audioSystem.playSFX(AUDIO_KEYS.PLAYER_DAMAGE);
        if (this.feedbackSystem) {
          this.feedbackSystem.playerDamage();
        }
      }
      if (data.current <= 0) {
        this.handlePlayerDeath('damage');
      }
      this.uiSystem.updateHUD();
    });

    this.events.on('POWERUP_COLLECTED', () => {
      this.audioSystem.playSFX(AUDIO_KEYS.POWERUP_COLLECT);
    });

    this.events.on('POWERUP_ACTIVATED', () => {
      this.audioSystem.playSFX(AUDIO_KEYS.POWERUP_ACTIVATE);
      this.handlePowerUpActivated();
    });

    this.events.on('POWERUP_EXPIRED', () => {
      this.audioSystem.playSFX(AUDIO_KEYS.POWERUP_EXPIRE);
      this.handlePowerUpExpired();
    });

    this.events.on('PLAYER_DOUBLE_JUMP', (data) => {
      this.audioSystem.playSFX(AUDIO_KEYS.PLAYER_DOUBLE_JUMP);
      if (this.feedbackSystem) {
        this.feedbackSystem.playerDoubleJump(data.x, data.y);
      }
    });

    this.events.on('LEVEL_COMPLETE', (stats) => {
      this.audioSystem.stopMusic();
      this.audioSystem.playSFX(AUDIO_KEYS.LEVEL_COMPLETE);
      this.audioSystem.playMusic(MUSIC_STATES.COMPLETION_MUSIC);
      if (this.uiSystem) {
        this.uiSystem.showLevelComplete(stats);
      }
    });

    this.events.on('PLAY_SFX', (key) => {
      this.audioSystem.playSFX(key);
    });
  }

  update(time, delta) {
    if (!this.player || !this.inputSystem || !this.uiSystem) return;

    // Freeze if Paused
    if (this.uiSystem.isPaused()) {
      return;
    }

    // Parallax update
    if (this.parallaxSystem) {
      this.parallaxSystem.update(time, delta);
    }

    // Title screen freeze
    if (this.uiSystem.isTitleActive()) {
      this.player.setVelocity(0, 0);
      return;
    }

    // Player & Companion Pet update
    if (!this.levelCompletionSystem.isLevelComplete()) {
      this.player.update(this.inputSystem, delta);
      if (this.pet) {
        this.pet.update(delta);
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    // Magnet Core perk: pulls nearby crystals towards the player
    const perk = ShopSystem.getEquippedPerk();
    if (perk && perk.id === 'magnet_core' && this.collectibles && !this.uiSystem.isTitleActive() && !this.isGameOver) {
      const magnetRadius = (perk.statModifier && perk.statModifier.magnetRadius) || 120;
      const px = this.player.x;
      const py = this.player.y;
      this.collectibles.getChildren().forEach(crystal => {
        if (crystal.active && crystal.state === 'ACTIVE') {
          const dist = Phaser.Math.Distance.Between(px, py, crystal.x, crystal.y);
          if (dist < magnetRadius && dist > 10) {
            const angle = Phaser.Math.Angle.Between(crystal.x, crystal.y, px, py);
            const pullSpeed = 160 * (1 - dist / magnetRadius);
            crystal.x += Math.cos(angle) * (pullSpeed * (delta / 1000));
            crystal.y += Math.sin(angle) * (pullSpeed * (delta / 1000));
          }
        }
      });
    }

    // Moving platforms update
    if (this.movingPlatforms && !this.isGameOver && !this.levelCompletionSystem.isLevelComplete()) {
      this.movingPlatforms.getChildren().forEach(mp => {
        if (mp.active && mp.update) mp.update(delta);
      });
    }

    // Energy gates update
    if (this.energyGates && !this.isGameOver && !this.levelCompletionSystem.isLevelComplete()) {
      this.energyGates.getChildren().forEach(eg => {
        if (eg.active && eg.update) eg.update(delta);
      });
    }

    // Power-ups update
    if (!this.isGameOver && !this.levelCompletionSystem.isLevelComplete()) {
      this.powerUpSystem.update(delta);
      this.powerUps.getChildren().forEach(p => {
        if (p.active) p.update(time, delta);
      });
    }

    // Shield aura tracking
    if (this.playerShieldAura) {
      if (this.powerUpSystem.isPowerUpActive() && this.player.lifeState === LifeState.ALIVE && !this.levelCompletionSystem.isLevelComplete() && !this.isGameOver) {
        this.playerShieldAura.setPosition(this.player.x, this.player.y);
        this.playerShieldAura.setVisible(true);
      } else {
        this.playerShieldAura.setVisible(false);
      }
    }

    // HUD update
    this.uiSystem.updateHUD();

    // Enemies update
    if (!this.isGameOver && !this.levelCompletionSystem.isLevelComplete()) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.active && enemy.update) {
          enemy.update(delta);
        }
      });
      if (this.boss && this.boss.active && this.boss.update) {
        this.boss.update(delta);
      }
    }

    // Nearby weapon pickup proximity check
    if (this.nearbyWeaponPickup && this.player) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.nearbyWeaponPickup.x, this.nearbyWeaponPickup.y);
      if (dist > 60) {
        this.nearbyWeaponPickup = null;
      }
    }

    // Fall death check
    if (this.player.y > this.levelData.deathZoneY && this.player.lifeState === LifeState.ALIVE) {
      this.handlePlayerDeath('pit');
    }

    // Player equip trigger via InputSystem [Q]
    if (this.inputSystem && typeof this.inputSystem.isEquipJustPressed === 'function' && this.inputSystem.isEquipJustPressed()) {
      this.handleEquipKey();
    }

    // Player attack / fire trigger via InputSystem [E]
    if (this.inputSystem && typeof this.inputSystem.isAttackJustPressed === 'function' && this.inputSystem.isAttackJustPressed()) {
      this.handlePlayerAttack();
    }

    // Player inventory toggle trigger via InputSystem [I]
    if (this.inputSystem && typeof this.inputSystem.isInventoryJustPressed === 'function' && this.inputSystem.isInventoryJustPressed()) {
      this.toggleInventory();
    }

    // Direct weapon hotkey slot trigger [1-9] via InputSystem
    if (this.inputSystem && typeof this.inputSystem.getJustPressedSlot === 'function') {
      const hotkeySlot = this.inputSystem.getJustPressedSlot();
      if (hotkeySlot !== null) {
        this.equipWeaponBySlot(hotkeySlot);
      }
    }

    // Telemetry readout
    const pos = `POS: X:${Math.round(this.player.x)}/${this.levelData.width} Y:${Math.round(this.player.y)}`;
    const cam = `CAM: ${Math.round(this.cameras.main.scrollX)}`;
    const vel = `VEL: ${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)}`;
    const foes = `FOES: ${this.enemies.getChildren().filter(e => e.active && (!e.getState || e.getState() !== 'DEFEATED')).length}`;
    this.uiSystem.updateTelemetry(`${pos} | ${cam} | STATE: ${this.player.state} | ${vel} | ${foes}`);
  }

  /**
   * Spawns a random collectible firearm on the map for player pickup
   */
  createWeaponPickup() {
    if (!this.weaponPickups) {
      this.weaponPickups = this.physics.add.group({
        allowGravity: false,
        immovable: true
      });
    }

    let wx = this.levelData.spawn.x + 180;
    let wy = this.levelData.spawn.y - 20;

    if (this.levelData.isBossLevel) {
      wx = this.levelData.spawn.x + 110;
      wy = this.levelData.spawn.y - 12;
    } else if (this.levelData.platforms && this.levelData.platforms.length > 0) {
      const targetIdx = Math.min(2, Math.floor(this.levelData.platforms.length / 2));
      const targetPlat = this.levelData.platforms[targetIdx];
      if (targetPlat) {
        wx = targetPlat.x;
        wy = targetPlat.y - 26;
      }
    }

    const pickup = new WeaponPickup(this, wx, wy);
    this.weaponPickups.add(pickup);
    if (pickup.body) {
      pickup.body.setAllowGravity(false);
      pickup.body.setImmovable(true);
      pickup.body.setVelocity(0, 0);
    }
    return pickup;
  }

  /**
   * Instantiates and registers a player bullet projectile
   * @param {number} x
   * @param {number} y
   * @param {number} dir
   * @param {string} weaponType
   * @returns {PlayerBullet}
   */
  spawnPlayerBullet(x, y, dir, weaponType) {
    if (!this.playerProjectiles) {
      this.playerProjectiles = this.physics.add.group();
    }
    const bullet = new PlayerBullet(this, x, y, dir, weaponType);
    this.playerProjectiles.add(bullet);
    return bullet;
  }

  /**
   * Handles [Q] key: equips / collects nearby weapon pickup, or cycles through collected firearms
   */
  handleEquipKey() {
    if (this.uiSystem && (this.uiSystem.isTitleActive() || this.uiSystem.isPaused() || this.uiSystem.isGameOverActive())) {
      return;
    }
    if (this.nearbyWeaponPickup && this.nearbyWeaponPickup.active && !this.nearbyWeaponPickup.isCollected) {
      this.handleWeaponPickup(this.player, this.nearbyWeaponPickup);
      this.nearbyWeaponPickup = null;
      return;
    }
    if (this.player && typeof this.player.cycleWeapon === 'function') {
      this.player.cycleWeapon();
    }
  }

  /**
   * Handles [E] key: fires equipped firearm (also collects if no weapon equipped)
   */
  handleUseOrAttackKey() {
    if (this.uiSystem && (this.uiSystem.isTitleActive() || this.uiSystem.isPaused() || this.uiSystem.isGameOverActive())) {
      return;
    }
    if (this.nearbyWeaponPickup && this.nearbyWeaponPickup.active && !this.nearbyWeaponPickup.isCollected && (!this.player || !this.player.getWeapon())) {
      this.handleWeaponPickup(this.player, this.nearbyWeaponPickup);
      this.nearbyWeaponPickup = null;
      return;
    }
    this.handlePlayerAttack();
  }

  /**
   * Triggers player weapon attack
   */
  handlePlayerAttack() {
    if (this.uiSystem && (this.uiSystem.isTitleActive() || this.uiSystem.isPaused() || this.uiSystem.isGameOverActive())) {
      return;
    }
    if (this.player && typeof this.player.attack === 'function') {
      this.player.attack();
    }
  }

  /**
   * Handles collision when a player projectile strikes an enemy
   * @param {PlayerBullet} bullet
   * @param {Enemy} enemy
   */
  handleBulletEnemyHit(bullet, enemy) {
    if (!bullet || !bullet.active || !enemy || !enemy.active) return;
    const dmg = bullet.damage || 10;
    bullet.explode(true);

    this.spawnDamagePopup(enemy.x, enemy.y - 12, dmg);

    if (typeof enemy.takeDamage === 'function') {
      const remainingHp = enemy.takeDamage(dmg);
      if (remainingHp <= 0) {
        if (this.cameras && this.cameras.main) {
          this.cameras.main.shake(120, 0.007);
        }
        if (this.audioSystem) {
          this.audioSystem.playSFX(AUDIO_KEYS.ENEMY_DEFEATED || AUDIO_KEYS.POWERUP_ACTIVATE);
        }
      } else {
        if (this.audioSystem) {
          this.audioSystem.playSFX(AUDIO_KEYS.PLAYER_DAMAGE);
        }
      }
    } else if (typeof enemy.defeat === 'function' && (!enemy.getState || enemy.getState() !== 'DEFEATED')) {
      enemy.defeat();
      if (this.cameras && this.cameras.main) {
        this.cameras.main.shake(120, 0.007);
      }
      if (this.audioSystem) {
        this.audioSystem.playSFX(AUDIO_KEYS.ENEMY_DEFEATED || AUDIO_KEYS.POWERUP_ACTIVATE);
      }
    }
  }

  /**
   * Spawns a floating combat damage number that pops up and floats upward
   * @param {number} x
   * @param {number} y
   * @param {number} amount
   * @param {boolean} [isCrit=false]
   */
  spawnDamagePopup(x, y, amount, isCrit = false) {
    const color = isCrit ? '#ef4444' : (amount >= 30 ? '#facc15' : '#00f0ff');
    const text = this.add.text(x, y, `-${amount}`, {
      fontFamily: 'Courier New, monospace',
      fontSize: amount >= 30 ? '12px' : '10px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(28);

    this.tweens.add({
      targets: text,
      y: y - 26,
      scale: 1.25,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Equips a weapon by its hotkey slot (1 through 9)
   * @param {number} slot
   */
  equipWeaponBySlot(slot) {
    if (this.uiSystem && (this.uiSystem.isTitleActive() || this.uiSystem.isGameOverActive())) {
      return;
    }
    const item = INVENTORY_CATALOG.find(w => w.slot === slot);
    if (!item) return;

    if (this.player && typeof this.player.setWeapon === 'function') {
      this.player.setWeapon(item.id);
    }
    if (this.audioSystem) {
      this.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
    }
    if (this.feedbackSystem) {
      this.feedbackSystem.playerFlash(item.colorNum, 140);
    }
    if (this.uiSystem) {
      this.uiSystem.updateHUD();
      if (typeof this.uiSystem.refreshInventoryCards === 'function') {
        this.uiSystem.refreshInventoryCards();
      }
    }
  }

  /**
   * Toggles in-game inventory modal
   */
  toggleInventory() {
    if (this.uiSystem && typeof this.uiSystem.toggleInventory === 'function') {
      this.uiSystem.toggleInventory();
    }
  }

  /**
   * Handles player collecting a map weapon pickup
   * @param {Player} player
   * @param {WeaponPickup} pickup
   */
  handleWeaponPickup(player, pickup) {
    if (!pickup || pickup.isCollected) return;
    pickup.collect(player);
    if (this.uiSystem) {
      this.uiSystem.updateHUD();
    }
  }
}
