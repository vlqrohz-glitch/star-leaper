import { PLAYER_CONFIG } from './playerConfig.js';

/**
 * Global Game Configuration for Star-Leaper
 */
export const GAME_CONFIG = {
  width: 800,
  height: 450,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: PLAYER_CONFIG.GRAVITY },
      debug: false
    }
  },
  pixelArt: true,
  scale: {
    mode: (typeof Phaser !== 'undefined' && Phaser.Scale) ? Phaser.Scale.FIT : 3,
    autoCenter: (typeof Phaser !== 'undefined' && Phaser.Scale) ? Phaser.Scale.CENTER_BOTH : 1,
    fullscreenTarget: 'game-container'
  }
};
