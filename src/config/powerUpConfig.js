/**
 * Centralized Power-Up Configuration for Star-Leaper: Orion Odyssey
 * Tuning values for collectible artifacts and temporary enhancement effects
 */
export const POWERUP_CONFIG = {
  // Global tuning
  DEFAULT_DURATION: 5000,    // Effect active duration in milliseconds
  SPAWN_BOB_SPEED: 0.003,    // Floating oscillation frequency
  SPAWN_BOB_DISTANCE: 4,     // Floating oscillation vertical amplitude (px)
  COLLECTION_RADIUS: 20,     // Interaction/overlap radius (px)

  // 1. Aegis Core: Temporary energy shield preventing enemy & hazard damage
  AEGIS_CORE: {
    type: 'AEGIS_CORE',
    name: 'Aegis Core',
    duration: 5000,
    texture: 'powerup_aegis',
    color: 0x00f0ff,
    colorHex: '#00f0ff'
  },

  // 2. Nova Burst: Explosive radial energy pulse repelling & defeating foes
  NOVA_BURST: {
    type: 'NOVA_BURST',
    name: 'Nova Burst',
    duration: 6000,
    texture: 'powerup_novaburst',
    color: 0xf43f5e,
    colorHex: '#f43f5e'
  },

  // 3. Gravity Shift: Lowers local gravity by 50% for high aerial leaps
  GRAVITY_SHIFT: {
    type: 'GRAVITY_SHIFT',
    name: 'Gravity Shift',
    duration: 5500,
    texture: 'powerup_gravity',
    color: 0x8b5cf6,
    colorHex: '#8b5cf6',
    gravityScale: 0.5
  },

  // 4. Chrono Core: Slows down enemies and moving hazards by 50%
  CHRONO_CORE: {
    type: 'CHRONO_CORE',
    name: 'Chrono Core',
    duration: 5000,
    texture: 'powerup_chrono',
    color: 0x10b981,
    colorHex: '#10b981',
    timeDilation: 0.5
  },

  // 5. Star Surge: Doubles the score value of collected Star Crystals (+200 pts)
  STAR_SURGE: {
    type: 'STAR_SURGE',
    name: 'Star Surge',
    duration: 6000,
    texture: 'powerup_starsurge',
    color: 0xf59e0b,
    colorHex: '#f59e0b',
    scoreMultiplier: 2
  }
};

/**
 * Power-Up Types Enumeration
 */
export const PowerUpType = Object.freeze({
  AEGIS_CORE: 'AEGIS_CORE',
  NOVA_BURST: 'NOVA_BURST',
  GRAVITY_SHIFT: 'GRAVITY_SHIFT',
  CHRONO_CORE: 'CHRONO_CORE',
  STAR_SURGE: 'STAR_SURGE'
});

/**
 * Power-Up Entity Lifecycle States
 */
export const PowerUpState = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  COLLECTING: 'COLLECTING',
  COLLECTED: 'COLLECTED'
});
