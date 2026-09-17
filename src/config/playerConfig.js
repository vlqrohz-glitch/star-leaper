/**
 * Player Movement & Physics Configuration
 * Centralized tuning parameters for Orion
 */
export const PLAYER_CONFIG = {
  // Horizontal Movement (px/s)
  MOVE_SPEED: 230,              // Maximum horizontal running speed
  GROUND_ACCELERATION: 1100,    // Acceleration rate while grounded (px/s²)
  GROUND_DECELERATION: 1300,    // Deceleration/friction rate when releasing controls on ground (px/s²)
  AIR_ACCELERATION: 750,        // Acceleration rate while airborne (px/s²) - smooth air control
  AIR_DECELERATION: 350,        // Air resistance / deceleration rate when airborne (px/s²)

  // Vertical Movement / Jump Physics
  GRAVITY: 650,                 // Vertical gravity acceleration (px/s²)
  JUMP_FORCE: -330,             // Initial impulse applied when starting a jump (px/s)
  JUMP_HOLD_TIME: 0.16,         // Maximum duration (in seconds) to sustain upward jump force
  JUMP_HOLD_FORCE: -180,        // Continuous upward boost while holding jump during ascent (px/s²)
  JUMP_CUTOFF_MULTIPLIER: 0.45, // Factor to reduce upward velocity when jump key is released early

  // Double Jump Settings
  MAX_JUMPS: 2,                 // Maximum jumps before landing (ground jump + air jump)
  DOUBLE_JUMP_FORCE: -315,      // Upward impulse applied on second jump (px/s)
  DOUBLE_JUMP_HOLD_TIME: 0.14,  // Sustain duration for double jump hold
  DOUBLE_JUMP_HOLD_FORCE: -160, // Upward lift while holding during double jump

  // Forgiveness / Game Feel
  COYOTE_TIME: 0.13,            // Time window (in seconds) player can still jump after leaving an edge
  JUMP_BUFFER_TIME: 0.14        // Time window (in seconds) to buffer an upcoming jump input before landing
};

/**
 * Player Movement States for Animation / State Tracking
 */
export const PlayerState = Object.freeze({
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  FALLING: 'FALLING'
});
