import { ShopSystem } from './ShopSystem.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';
import { LevelCompletionSystem } from './LevelCompletionSystem.js';

/**
 * Singleton Cheat Code System for Star-Leaper: Orion Odyssey
 * Enables entering secret cheat codes to unlock exclusive Wild West characters,
 * pets, perks, crystals, and levels.
 */
class CheatSystemClass {
  constructor() {
    this.godMode = false;
    this.unlockedCheats = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem('star_leaper_cheats');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) this.unlockedCheats = new Set(list);
        }
      }
    } catch (e) {}
  }

  saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('star_leaper_cheats', JSON.stringify(Array.from(this.unlockedCheats)));
      }
    } catch (e) {}
  }

  getCheatCatalog() {
    return [
      {
        code: 'YEEHAW',
        name: 'The Grand Frontier',
        description: 'Unlocks ALL characters, outfits, perks, pets, Sector 6, and adds +9999 Star Crystals!'
      },
      {
        code: 'COWBOY',
        name: 'Wild West Legends',
        description: 'Unlocks Sheriff Wyatt, Desperado Billy, Frontier Duster, and Desperado Poncho!'
      },
      {
        code: 'RODEO',
        name: 'Frontier Companions',
        description: 'Unlocks Mustang Spirit (Horse) and Barnaby the Bear companion pets!'
      },
      {
        code: 'QUICKDRAW',
        name: 'Outlaw Arsenal',
        description: 'Unlocks Quickdraw Holster, Gold Rush, and Dynamite Boots passive perks!'
      },
      {
        code: 'GOLDRUSH',
        name: "Prospector's Bonanza",
        description: 'Instantly grants +5000 Star Crystals to your wallet!'
      },
      {
        code: 'WESTWORLD',
        name: 'Canyon Fast-Travel',
        description: 'Unlocks and deploys directly into Sector 6: Dust Devil Canyon!'
      },
      {
        code: 'INVINCIBLE',
        name: 'Aegis Matrix Overdrive',
        description: 'Toggles invulnerability & boundless vitality for testing and casual fun!'
      }
    ];
  }

  /**
   * Redeems a cheat code
   * @param {string} rawCode
   * @param {Phaser.Scene} [scene]
   * @returns {{ success: boolean, code?: string, title?: string, message: string, unlocks?: string[] }}
   */
  redeemCode(rawCode, scene = null) {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, message: 'Enter a valid cheat code.' };
    }

    const code = rawCode.trim().toUpperCase();

    if (code === 'YEEHAW' || code === 'FRONTIER') {
      ShopSystem.addCrystals(9999);
      ShopSystem.unlockAll();
      LevelCompletionSystem.unlockLevel(6);
      this.unlockedCheats.add('YEEHAW');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);

      return {
        success: true,
        code: 'YEEHAW',
        title: '★ THE GRAND FRONTIER ACTIVATED! ★',
        message: 'All 6 Characters, Outfits, Perks, Pets, Sector 6, and +9999 Crystals unlocked!',
        unlocks: ['Wyatt', 'Billy', 'Mustang Horse', 'Barnaby Bear', 'Quickdraw', 'Gold Rush', '+9999 ★']
      };
    }

    if (code === 'COWBOY' || code === 'OUTLAW') {
      ShopSystem.unlockItem('frontier_duster');
      ShopSystem.unlockItem('desperado_poncho');
      this.unlockedCheats.add('COWBOY');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);

      return {
        success: true,
        code: 'COWBOY',
        title: '★ WILD WEST LEGENDS UNLOCKED! ★',
        message: 'Sheriff Wyatt & Desperado Billy unlocked with authentic Frontier Duster & Poncho!',
        unlocks: ['Sheriff Wyatt', 'Desperado Billy', 'Frontier Duster', 'Desperado Poncho']
      };
    }

    if (code === 'RODEO' || code === 'PETS' || code === 'HORSE' || code === 'BEAR') {
      ShopSystem.unlockItem('pet_horse');
      ShopSystem.unlockItem('pet_bear');
      this.unlockedCheats.add('RODEO');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);

      return {
        success: true,
        code: 'RODEO',
        title: '★ FRONTIER COMPANIONS UNLOCKED! ★',
        message: 'Mustang Spirit (Horse) and Barnaby the Bear are ready to ride beside you!',
        unlocks: ['Mustang Spirit (Horse)', 'Barnaby the Bear']
      };
    }

    if (code === 'QUICKDRAW' || code === 'PERKS') {
      ShopSystem.unlockItem('quickdraw');
      ShopSystem.unlockItem('gold_rush');
      ShopSystem.unlockItem('dynamite_boots');
      this.unlockedCheats.add('QUICKDRAW');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);

      return {
        success: true,
        code: 'QUICKDRAW',
        title: '★ OUTLAW ARSENAL UNLOCKED! ★',
        message: 'Quickdraw Holster, Gold Rush, and Dynamite Boots perks added to your loadout!',
        unlocks: ['Quickdraw Holster', 'Gold Rush Prospector', 'Dynamite Boots']
      };
    }

    if (code === 'GOLDRUSH' || code === 'CRYSTALS' || code === 'CASH') {
      ShopSystem.addCrystals(5000);
      this.unlockedCheats.add('GOLDRUSH');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.CRYSTAL_COLLECT);

      return {
        success: true,
        code: 'GOLDRUSH',
        title: "★ PROSPECTOR'S BONANZA! ★",
        message: '+5,000 Star Crystals deposited directly into your cosmic wallet!',
        unlocks: ['+5,000 Star Crystals']
      };
    }

    if (code === 'WESTWORLD' || code === 'DESERT' || code === 'CANYON') {
      LevelCompletionSystem.unlockLevel(6);
      this.unlockedCheats.add('WESTWORLD');
      this.saveToStorage();
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);

      return {
        success: true,
        code: 'WESTWORLD',
        title: '★ DUST DEVIL CANYON UNLOCKED! ★',
        message: 'Sector 6 (Desert Biome) is unlocked and ready for deployment!',
        unlocks: ['Sector 6: Dust Devil Canyon']
      };
    }

    if (code === 'INVINCIBLE' || code === 'GODMODE') {
      this.godMode = !this.godMode;
      if (scene && scene.powerUpSystem) {
        if (this.godMode) {
          scene.powerUpSystem.activatePowerUp('AEGIS_CORE', 9999);
        } else {
          scene.powerUpSystem.reset();
        }
      }
      if (scene && scene.audioSystem) scene.audioSystem.playSFX(AUDIO_KEYS.POWERUP_ACTIVATE);

      return {
        success: true,
        code: 'INVINCIBLE',
        title: this.godMode ? '★ GOD MODE: ENABLED ★' : '★ GOD MODE: DISABLED ★',
        message: this.godMode ? 'Invulnerability matrix energized!' : 'Normal vulnerability restored.',
        unlocks: [this.godMode ? 'Invulnerability Active' : 'Normal State']
      };
    }

    return {
      success: false,
      message: 'Invalid Code. Try: YEEHAW, COWBOY, RODEO, GOLDRUSH, WESTWORLD, or QUICKDRAW'
    };
  }

  isGodModeActive() {
    return this.godMode;
  }
}

export const CheatSystem = new CheatSystemClass();
