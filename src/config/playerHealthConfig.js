/**
 * Player Health & Lives Configuration
 * Centralized tuning parameters for damage, invulnerability, and respawns
 */
export const HEALTH_CONFIG = {
  MAX_HEALTH: 3,                          // Maximum shield/health capacity
  STARTING_HEALTH: 3,                     // Health granted at spawn/respawn
  STARTING_LIVES: 3,                      // Starting lives allocation
  DAMAGE_PER_HIT: 1,                      // Health deducted per enemy collision
  POST_RESPAWN_INVULNERABILITY: 1.5,      // Seconds of immunity granted after respawn
  RESPAWN_DELAY: 500,                     // Milliseconds before respawn sequence triggers
  MINIMUM_HEALTH: 0                       // Floor for health values
};

/**
 * Player Life Cycle States
 */
export const LifeState = Object.freeze({
  ALIVE: 'ALIVE',
  DAMAGED: 'DAMAGED',
  DEAD: 'DEAD',
  RESPAWNING: 'RESPAWNING'
});
