/**
 * FeedbackSystem.js - Centralized Gameplay Visual & Tactile Feedback Controller
 * Manages screen shakes, player flashes, floating score labels, and energy pulses
 * without owning or modifying any gameplay state.
 */

import { AUDIO_CONFIG } from '../config/audioConfig.js';

export class FeedbackSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.activePopups = new Set();
    this.activeTweens = new Set();
  }

  /**
   * Initializes feedback system
   * @param {Phaser.Scene} scene
   */
  initialize(scene) {
    this.scene = scene || this.scene;
  }

  /**
   * Triggers a subtle camera screen shake
   * @param {number} [intensity]
   * @param {number} [duration]
   */
  screenShake(intensity = 0.006, duration = 100) {
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(duration, intensity);
    }
  }

  /**
   * Flashes the player with a brief tint
   * @param {number} color
   * @param {number} duration
   */
  playerFlash(color = 0xffffff, duration = 120) {
    if (!this.scene || !this.scene.player) return;
    const player = this.scene.player;
    if (player.setTint) {
      player.setTint(color);
      this.scene.time.delayedCall(duration, () => {
        if (player && player.clearTint) {
          player.clearTint();
        }
      });
    }
  }

  /**
   * Feedback for player taking damage
   */
  playerDamage() {
    if (this.isGameplayLocked()) return;
    this.screenShake(AUDIO_CONFIG.SHAKE.DAMAGE.intensity, AUDIO_CONFIG.SHAKE.DAMAGE.duration);
    this.playerFlash(0xff3333, 100);
  }

  /**
   * Feedback for player death
   */
  playerDeath() {
    this.screenShake(AUDIO_CONFIG.SHAKE.DEATH.intensity, AUDIO_CONFIG.SHAKE.DEATH.duration);
    if (this.scene && this.scene.player) {
      this.playerFlash(0xff0000, 200);
    }
  }

  /**
   * Feedback for player respawning at start pad
   */
  playerRespawn() {
    if (this.scene && this.scene.player) {
      this.playerFlash(0x00f0ff, 250);
      if (this.scene.cameras && this.scene.cameras.main) {
        this.scene.cameras.main.flash(200, 0, 240, 255);
      }
    }
  }

  /**
   * Feedback for double jump thruster pulse
   * @param {number} x
   * @param {number} y
   */
  playerDoubleJump(x, y) {
    if (this.isGameplayLocked()) return;
    this.playerFlash(0x00f0ff, 100);
  }

  /**
   * Spawns a floating score popup that drifts up and destroys itself
   * @param {number} x
   * @param {number} y
   * @param {number} [amount=100]
   * @param {string} [color='#ffd700']
   */
  spawnFloatingScore(x, y, amount = 100, color = AUDIO_CONFIG.POPUP.CRYSTAL_COLOR) {
    if (!this.scene || this.isGameplayLocked()) return;

    try {
      const popup = this.scene.add.text(x, y - 10, `+${amount}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: color,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(40);

      this.activePopups.add(popup);

      const tween = this.scene.tweens.add({
        targets: popup,
        y: y - (10 + AUDIO_CONFIG.POPUP.RISE_DISTANCE),
        alpha: 0,
        duration: AUDIO_CONFIG.POPUP.DURATION,
        ease: 'Power2',
        onComplete: () => {
          this.activeTweens.delete(tween);
          this.activePopups.delete(popup);
          if (popup && popup.destroy) {
            popup.destroy();
          }
        }
      });

      this.activeTweens.add(tween);
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Feedback for collecting a Star Crystal
   */
  crystalCollected(x, y, amount = 100) {
    if (this.isGameplayLocked()) return;
    this.spawnFloatingScore(x, y, amount, AUDIO_CONFIG.POPUP.CRYSTAL_COLOR);
  }

  /**
   * Feedback for defeating a Drifter Drone
   */
  enemyDefeated(x, y, amount = 200) {
    if (this.isGameplayLocked()) return;
    this.screenShake(AUDIO_CONFIG.SHAKE.ENEMY_DEFEAT.intensity, AUDIO_CONFIG.SHAKE.ENEMY_DEFEAT.duration);
    this.spawnFloatingScore(x, y, amount, AUDIO_CONFIG.POPUP.ENEMY_COLOR);
  }

  /**
   * Feedback for picking up an Aegis Core
   */
  powerUpCollected(x, y) {
    if (this.isGameplayLocked()) return;
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.screenShake(0.004, 80);
    }
  }

  /**
   * Feedback for Aegis activation
   */
  powerUpActivated() {
    if (this.scene && this.scene.playerShieldAura) {
      this.scene.tweens.add({
        targets: this.scene.playerShieldAura,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 120,
        yoyo: true
      });
    }
  }

  /**
   * Feedback for Aegis expiration
   */
  powerUpExpired() {
    if (this.scene && this.scene.player) {
      this.playerFlash(0x64748b, 150);
    }
  }

  /**
   * Feedback for touching the Goal Beacon
   */
  goalReached() {
    this.screenShake(AUDIO_CONFIG.SHAKE.GOAL.intensity, AUDIO_CONFIG.SHAKE.GOAL.duration);
  }

  /**
   * Feedback for level complete
   */
  levelComplete() {
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.flash(400, 0, 240, 255);
    }
  }

  /**
   * Feedback for Game Over
   */
  gameOver() {
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.fade(300, 20, 0, 10);
    }
  }

  /**
   * Checks whether gameplay feedback should be suppressed (completion or game over)
   * @returns {boolean}
   */
  isGameplayLocked() {
    if (!this.scene) return false;
    const isCompleted = this.scene.levelCompletionSystem && this.scene.levelCompletionSystem.isLevelComplete();
    const isGameOver = this.scene.isGameOver;
    return Boolean(isCompleted || isGameOver);
  }

  /**
   * Resets and cleans up all active feedback objects, tweens, and camera states
   */
  reset() {
    // Clear all active floating score popups
    this.activePopups.forEach(popup => {
      try {
        if (popup && popup.destroy) popup.destroy();
      } catch (e) {}
    });
    this.activePopups.clear();

    // Kill all active tweens
    this.activeTweens.forEach(tween => {
      try {
        if (tween && tween.stop) tween.stop();
      } catch (e) {}
    });
    this.activeTweens.clear();

    // Reset player tint
    if (this.scene && this.scene.player && this.scene.player.clearTint) {
      this.scene.player.clearTint();
    }

    // Reset camera visual effects (fade, shake, flash)
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.resetFX();
    }
  }
}
