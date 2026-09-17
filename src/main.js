import { GAME_CONFIG } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { CharacterSheetScene } from './scenes/CharacterSheetScene.js';
import { ShopScene } from './scenes/ShopScene.js';

/**
 * Game Bootstrap - Star-Leaper: Orion Odyssey
 * Resilient bootstrap with readyState check, Phaser polling, and error boundaries.
 */
function launchGame() {
  if (window.game) return;

  const container = document.getElementById('game-container');
  if (!container) {
    setTimeout(launchGame, 50);
    return;
  }

  if (typeof Phaser === 'undefined') {
    setTimeout(launchGame, 100);
    return;
  }

  try {
    const config = {
      ...GAME_CONFIG,
      parent: 'game-container',
      scene: [BootScene, GameScene, CharacterSelectScene, LevelSelectScene, CharacterSheetScene, ShopScene]
    };

    window.game = new Phaser.Game(config);

    // Remove loading indicator as soon as Phaser's canvas is active
    window.game.events.once('ready', () => {
      const loader = document.getElementById('game-loading-indicator');
      if (loader) loader.remove();
    });

    console.log('[Star-Leaper] Phaser engine initialized successfully');
  } catch (err) {
    console.error('[Star-Leaper] Fatal error starting game:', err);
    const loader = document.getElementById('game-loading-indicator');
    if (loader) {
      loader.innerHTML = `
        <div style="color: #ff3366; font-size: 14px; font-weight: 800; margin-bottom: 8px;">BOOT SEQUENCE ERROR</div>
        <div style="color: #8892b0; font-size: 11px; margin-bottom: 16px; max-width: 320px; line-height: 1.4;">${err.message || 'Engine failed to initialize'}</div>
        <button onclick="location.reload()" style="background: #00f0ff; color: #000; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 800; cursor: pointer;">RELOAD SYSTEM</button>
      `;
    }
  }
}

// Handle all document readiness states (loading, interactive, complete)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', launchGame);
  // Backup timeout in case DOMContentLoaded already fired or was skipped
  setTimeout(launchGame, 500);
} else {
  launchGame();
}
