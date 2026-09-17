/**
 * Player Health & Lives Configuration
 * Centralized tuning parameters for damage, invulnerability, and respawns
 */
export const HEALTH_CONFIG = {
  MAX_HEALTH: 100,                        // Maximum shield/health capacity (100 HP, upgraded from MAX_HEALTH: 3)
  STARTING_HEALTH: 100,                   // Health granted at spawn/respawn
  STARTING_LIVES: 3,                      // Starting lives allocation
  DAMAGE_PER_HIT: 5,                      // Health deducted per enemy collision (-5 HP)
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
