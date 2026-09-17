/**
 * audioConfig.js - Centralized Audio & Feedback Configuration for Star-Leaper: Orion Odyssey
 * Defines volume levels, logical sound effect keys, music states, and visual feedback metrics.
 */

export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.4,

  // Feedback Screen Shake Configurations
  SHAKE: {
    DAMAGE: { intensity: 0.008, duration: 120 },
    ENEMY_DEFEAT: { intensity: 0.006, duration: 100 },
    DEATH: { intensity: 0.015, duration: 250 },
    GOAL: { intensity: 0.010, duration: 200 }
  },

  // Floating Score Popup Tuning
  POPUP: {
    DURATION: 400,
    RISE_DISTANCE: 18,
    CRYSTAL_COLOR: '#ffd700',
    ENEMY_COLOR: '#ff4444'
  }
};

/**
 * Logical Audio Sound Effect Identifiers
 */
export const AUDIO_KEYS = Object.freeze({
  UI_START: 'ui_start',
  UI_NAV: 'ui_nav',
  UI_CONFIRM: 'ui_confirm',
  UI_PAUSE: 'ui_pause',
  CRYSTAL_COLLECT: 'crystal_collect',
  ENEMY_DEFEAT: 'enemy_defeat',
  PLAYER_DAMAGE: 'player_damage',
  PLAYER_DEATH: 'player_death',
  PLAYER_RESPAWN: 'player_respawn',
  POWERUP_COLLECT: 'powerup_collect',
  POWERUP_ACTIVATE: 'powerup_activate',
  POWERUP_EXPIRE: 'powerup_expire',
  PLAYER_DOUBLE_JUMP: 'player_double_jump',
  LAUNCH_PAD: 'launch_pad',
  HAZARD_HIT: 'hazard_hit',
  GOAL_REACHED: 'goal_reached',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  SHOP_BUY: 'shop_buy',
  SHOP_EQUIP: 'shop_equip',
  SHOP_ERROR: 'shop_error'
});

/**
 * Music States / Identifiers
 */
export const MUSIC_STATES = Object.freeze({
  TITLE_MUSIC: 'title_music',
  GAMEPLAY_MUSIC: 'gameplay_music',
  GAME_OVER_MUSIC: 'game_over_music',
  COMPLETION_MUSIC: 'completion_music',
  SECTOR_1_MUSIC: 'sector_1_music',
  SECTOR_2_MUSIC: 'sector_2_music',
  SECTOR_3_MUSIC: 'sector_3_music',
  SECTOR_4_MUSIC: 'sector_4_music',
  SECTOR_5_MUSIC: 'sector_5_music'
});
