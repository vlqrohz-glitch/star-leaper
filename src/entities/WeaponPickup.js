import { UI_CONFIG } from '../config/uiConfig.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';

export const WEAPON_TYPES = Object.freeze([
  'REVOLVER',
  'PLASMA_BLASTER',
  'PHOTON_RIFLE',
  'DYNAMITE_LAUNCHER',
  'SHOTGUN'
]);

export const WEAPON_META = Object.freeze({
  REVOLVER: {
    name: 'Revolver',
    label: '[E] SIX-SHOOTER',
    desc: 'High-velocity brass rounds',
    colorHex: '#facc15',
    colorNum: 0xfacc15,
    texture: 'weapon_revolver'
  },
  PLASMA_BLASTER: {
    name: 'Plasma Blaster',
    label: '[E] PLASMA BLASTER',
    desc: 'Rapid ion energy bolts',
    colorHex: '#00f0ff',
    colorNum: 0x00f0ff,
    texture: 'weapon_plasma_blaster'
  },
  PHOTON_RIFLE: {
    name: 'Photon Rifle',
    label: '[E] PHOTON RIFLE',
    desc: 'Piercing long-range beam',
    colorHex: '#c084fc',
    colorNum: 0xc084fc,
    texture: 'weapon_photon_rifle'
  },
  DYNAMITE_LAUNCHER: {
    name: 'Dynamite Launcher',
    label: '[E] DYNAMITE LAUNCHER',
    desc: 'Arcing explosive cluster',
    colorHex: '#ef4444',
    colorNum: 0xef4444,
    texture: 'weapon_dynamite_launcher'
  },
  SHOTGUN: {
    name: 'Cosmic Scattergun',
    label: '[E] SCATTERGUN',
    desc: 'Devastating spread pellets',
    colorHex: '#f59e0b',
    colorNum: 0xf59e0b,
    texture: 'weapon_shotgun'
  }
});

/**
 * WeaponPickup Entity - Collectible weapon crate/pedestal spawned on each map
 * Grants the player an equipped firearm to fight and defeat enemies with the [F] key.
 */
export class WeaponPickup extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} [weaponType]
   */
  constructor(scene, x, y, weaponType = null) {
    // Pick random weapon type if not specified
    const selectedType = weaponType || Phaser.Utils.Array.GetRandom(WEAPON_TYPES);
    const meta = WEAPON_META[selectedType] || WEAPON_META.REVOLVER;

    super(scene, x, y, meta.texture);

    this.scene = scene;
    this.weaponType = selectedType;
    this.meta = meta;
    this.isWeaponPickup = true;
    this.isCollected = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setSize(28, 20);
    this.setDepth(14);

    // Holographic aura halo ring behind weapon
    this.halo = scene.add.circle(x, y, 16, meta.colorNum, 0.22);
    this.halo.setStrokeStyle(1.5, meta.colorNum, 0.7);
    this.halo.setDepth(13);

    // Overhead Floating HUD prompt (Q key to equip, supports [E] COLLECT token)
    this.promptText = scene.add.text(x, y - 22, `[Q] EQUIP ${meta.name.toUpperCase()}`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '7px',
      color: meta.colorHex,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(15);

    // Continuous floating/bobbing animation
    this.bobTween = scene.tweens.add({
      targets: [this, this.halo, this.promptText],
      y: '-=8',
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Halo gentle pulsing scale
    this.pulseTween = scene.tweens.add({
      targets: this.halo,
      scale: 1.25,
      alpha: 0.45,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });
  }

  /**
   * Called when player overlaps this weapon pickup
   * @param {import('./Player.js').Player} player
   */
  collect(player) {
    if (this.isCollected) return;
    this.isCollected = true;

    // Equip weapon to player
    if (player && typeof player.setWeapon === 'function') {
      player.setWeapon(this.weaponType);
    }

    // Audio confirmation
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.POWERUP_ACTIVATE);
    }

    // Floating banner notification
    this.spawnPickupBanner();

    // Visual burst effect
    this.spawnPickupFX();

    // Emit event for UISystem and GameScene
    this.scene.events.emit('WEAPON_COLLECTED', {
      weaponType: this.weaponType,
      meta: this.meta,
      x: this.x,
      y: this.y
    });

    // Clean up tweens and objects
    if (this.bobTween) this.bobTween.stop();
    if (this.pulseTween) this.pulseTween.stop();
    if (this.halo) this.halo.destroy();
    if (this.promptText) this.promptText.destroy();

    this.destroy();
  }

  spawnPickupBanner() {
    // Floating banner guides player: PRESS [E] TO ATTACK / FIRE
    const banner = this.scene.add.text(this.x, this.y - 28, `⚔️ ${this.meta.name.toUpperCase()} EQUIPPED!\nPRESS [E] TO FIRE`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: this.meta.colorHex,
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setDepth(25);

    this.scene.tweens.add({
      targets: banner,
      y: banner.y - 24,
      alpha: 0,
      duration: 1800,
      ease: 'Power1',
      onComplete: () => banner.destroy()
    });
  }

  spawnPickupFX() {
    const burst = this.scene.add.circle(this.x, this.y, 24, this.meta.colorNum, 0.8);
    burst.setDepth(20);
    this.scene.tweens.add({
      targets: burst,
      scale: 1.8,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy()
    });

    // Ring expansion
    const ring = this.scene.add.circle(this.x, this.y, 14, 0xffffff, 0);
    ring.setStrokeStyle(2, this.meta.colorNum, 1);
    ring.setDepth(21);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.4,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }
}
