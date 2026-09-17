/**
 * Centralized Enemy Configuration for Star-Leaper: Orion Odyssey
 * Tuning values for all 5 enemy types and combat interactions
 */
export const ENEMY_CONFIG = {
  // Base / Drifter Drone (Preserving REG-5)
  PATROL_SPEED: 55,             // Horizontal patrol speed (px/s)
  GRAVITY: 650,                 // Vertical gravity acceleration (px/s²)
  EDGE_MARGIN: 12,              // Distance ahead to detect platform edge (px)

  // Stomp Mechanics
  STOMP_BOUNCE_FORCE: -280,     // Upward impulse given to player upon successful stomp (px/s)
  STOMP_OFFSET_THRESHOLD: 8,    // Vertical overlap forgiveness threshold (px)

  // Combat & Impact
  KNOCKBACK_X: 180,             // Horizontal knockback velocity on side hit (px/s)
  KNOCKBACK_Y: -160,            // Upward knockback velocity on side hit (px/s)
  INVULNERABILITY_TIME: 1.0,    // Duration of post-hit immunity/flicker (seconds)

  // Defeat & Scoring
  DEFEAT_SCORE: 200,            // Score points awarded per defeated drone/enemy
  DEFEAT_ANIM_DURATION: 250,    // Squash and fade duration in ms

  // Collision Dimensions
  WIDTH: 22,
  HEIGHT: 20,

  // Specific Configurations for Expanded Roster
  VOID_CRAWLER: {
    speed: 45,
    texture: 'void_crawler',
    score: 200,
    width: 24,
    height: 16
  },
  ORBITAL_SENTINEL: {
    speed: 65,
    amplitudeY: 35,
    waveFreq: 0.003,
    texture: 'orbital_sentinel',
    score: 200,
    width: 24,
    height: 24
  },
  RIFT_HOPPER: {
    hopInterval: 1400,
    hopForceY: -290,
    hopForceX: 95,
    texture: 'rift_hopper',
    score: 200,
    width: 20,
    height: 22
  },
  NEBULA_WISP: {
    speed: 50,
    orbitRadius: 40,
    texture: 'nebula_wisp',
    score: 200,
    width: 20,
    height: 20
  },
  GUNSLINGER: {
    speed: 40,
    texture: 'gunslinger',
    score: 250,
    width: 22,
    height: 24
  },
  DYNAMITE_BANDIT: {
    speed: 35,
    texture: 'dynamite_bandit',
    score: 250,
    width: 22,
    height: 24
  }
};

/**
 * Enemy Lifecycle States
 */
export const EnemyState = Object.freeze({
  PATROLLING: 'PATROLLING',
  STUNNED: 'STUNNED',
  HOPPING: 'HOPPING',
  DEFEATED: 'DEFEATED'
});
