import { PLAYER_CONFIG } from './playerConfig.js';

/**
 * Character Roster Configuration for Star-Leaper: Orion Odyssey
 * Defines attributes, stats, silhouettes, lore, and behavior modifiers for all playable explorers.
 */
export const CHARACTER_ROSTER = {
  NOVA: {
    id: 'NOVA',
    name: 'Nova',
    title: 'Cosmic Explorer',
    concept: 'A versatile vanguard scout equipped with standard-issue Orion planetary gear.',
    texture: 'player_nova',
    colorHex: '#00f0ff',
    colorNum: 0x00f0ff,
    stats: {
      speedLabel: 'MED (230 px/s)',
      jumpLabel: 'MED (-330 px/s)',
      controlLabel: 'BALANCED',
      durabilityLabel: 'STANDARD',
      energyLabel: 'NORMAL (5.0s)'
    },
    // Multipliers / Overrides applied over PLAYER_CONFIG
    physics: {
      MOVE_SPEED: PLAYER_CONFIG.MOVE_SPEED, // 230
      GROUND_ACCELERATION: PLAYER_CONFIG.GROUND_ACCELERATION, // 1100
      GROUND_DECELERATION: PLAYER_CONFIG.GROUND_DECELERATION, // 1300
      AIR_ACCELERATION: PLAYER_CONFIG.AIR_ACCELERATION, // 750
      AIR_DECELERATION: PLAYER_CONFIG.AIR_DECELERATION, // 350
      GRAVITY: PLAYER_CONFIG.GRAVITY, // 650
      JUMP_FORCE: PLAYER_CONFIG.JUMP_FORCE, // -330
      DOUBLE_JUMP_FORCE: PLAYER_CONFIG.DOUBLE_JUMP_FORCE, // -315
      MAX_JUMPS: PLAYER_CONFIG.MAX_JUMPS || 2,
      COYOTE_TIME: PLAYER_CONFIG.COYOTE_TIME, // 0.13
      JUMP_BUFFER_TIME: PLAYER_CONFIG.JUMP_BUFFER_TIME // 0.14
    },
    modifiers: {
      invulnerabilityMultiplier: 1.0,
      powerUpDurationMultiplier: 1.0,
      stompBonusMultiplier: 1.0
    }
  },

  ZENITH: {
    id: 'ZENITH',
    name: 'Zenith',
    title: 'Aerial Specialist',
    concept: 'High-altitude atmospheric operative with specialized twin winglet thrusters and enhanced air steer.',
    texture: 'player_zenith',
    colorHex: '#34d399',
    colorNum: 0x34d399,
    stats: {
      speedLabel: 'HIGH (260 px/s)',
      jumpLabel: 'HIGH (-350 px/s)',
      controlLabel: 'EXCELLENT',
      durabilityLabel: 'LIGHT',
      energyLabel: 'NORMAL (5.0s)'
    },
    physics: {
      MOVE_SPEED: 260,
      GROUND_ACCELERATION: 1200,
      GROUND_DECELERATION: 1300,
      AIR_ACCELERATION: 900,
      AIR_DECELERATION: 300,
      GRAVITY: 620,
      JUMP_FORCE: -350,
      DOUBLE_JUMP_FORCE: -335,
      MAX_JUMPS: 2,
      COYOTE_TIME: 0.15,
      JUMP_BUFFER_TIME: 0.15
    },
    modifiers: {
      invulnerabilityMultiplier: 0.9,
      powerUpDurationMultiplier: 1.0,
      stompBonusMultiplier: 1.15
    }
  },

  ATLAS: {
    id: 'ATLAS',
    name: 'Atlas',
    title: 'Heavy Explorer',
    concept: 'Heavily armored planetary defender clad in thick titanium alloy plates with high kinetic resistance.',
    texture: 'player_atlas',
    colorHex: '#f97316',
    colorNum: 0xf97316,
    stats: {
      speedLabel: 'LOW (205 px/s)',
      jumpLabel: 'LOW (-310 px/s)',
      controlLabel: 'WEIGHTY',
      durabilityLabel: 'HIGH (+50% Grace)',
      energyLabel: 'NORMAL (5.0s)'
    },
    physics: {
      MOVE_SPEED: 205,
      GROUND_ACCELERATION: 1350,
      GROUND_DECELERATION: 1500,
      AIR_ACCELERATION: 650,
      AIR_DECELERATION: 400,
      GRAVITY: 700,
      JUMP_FORCE: -310,
      DOUBLE_JUMP_FORCE: -290,
      MAX_JUMPS: 2,
      COYOTE_TIME: 0.12,
      JUMP_BUFFER_TIME: 0.14
    },
    modifiers: {
      invulnerabilityMultiplier: 1.5, // 50% longer post-hit invulnerability
      powerUpDurationMultiplier: 1.0,
      stompBonusMultiplier: 1.0
    }
  },

  LUMEN: {
    id: 'LUMEN',
    name: 'Lumen',
    title: 'Energy Conductor',
    concept: 'Cosmic resonance scholar whose suit amplifies celestial artifacts and power-up matrix durations.',
    texture: 'player_lumen',
    colorHex: '#c084fc',
    colorNum: 0xc084fc,
    stats: {
      speedLabel: 'MED (230 px/s)',
      jumpLabel: 'MED (-330 px/s)',
      controlLabel: 'SMOOTH',
      durabilityLabel: 'STANDARD',
      energyLabel: 'EXTENDED (+40% Duration)'
    },
    physics: {
      MOVE_SPEED: 230,
      GROUND_ACCELERATION: 1100,
      GROUND_DECELERATION: 1300,
      AIR_ACCELERATION: 780,
      AIR_DECELERATION: 350,
      GRAVITY: 640,
      JUMP_FORCE: -330,
      DOUBLE_JUMP_FORCE: -315,
      MAX_JUMPS: 2,
      COYOTE_TIME: 0.14,
      JUMP_BUFFER_TIME: 0.14
    },
    modifiers: {
      invulnerabilityMultiplier: 1.0,
      powerUpDurationMultiplier: 1.4, // +40% longer power-up durations
      stompBonusMultiplier: 1.0
    }
  },

  WYATT: {
    id: 'WYATT',
    name: 'Sheriff Wyatt',
    title: 'Frontier Lawman',
    concept: 'Legendary space-western marshal equipped with a gold star badge, reinforced duster, and heavy stomp boots.',
    texture: 'player_sheriff',
    colorHex: '#eab308',
    colorNum: 0xeab308,
    isExclusive: true,
    stats: {
      speedLabel: 'MED (240 px/s)',
      jumpLabel: 'HIGH (-340 px/s)',
      controlLabel: 'RESOLUTE',
      durabilityLabel: 'ARMORED (+30% Grace)',
      energyLabel: 'NORMAL (5.0s)'
    },
    physics: {
      MOVE_SPEED: 240,
      GROUND_ACCELERATION: 1200,
      GROUND_DECELERATION: 1400,
      AIR_ACCELERATION: 800,
      AIR_DECELERATION: 360,
      GRAVITY: 660,
      JUMP_FORCE: -340,
      DOUBLE_JUMP_FORCE: -320,
      MAX_JUMPS: 2,
      COYOTE_TIME: 0.15,
      JUMP_BUFFER_TIME: 0.15
    },
    modifiers: {
      invulnerabilityMultiplier: 1.3,
      powerUpDurationMultiplier: 1.1,
      stompBonusMultiplier: 1.25 // Stomp deals +25% bonus score and extra bounce
    }
  },

  BILLY: {
    id: 'BILLY',
    name: 'Desperado Billy',
    title: 'Outlaw Gunslinger',
    concept: 'Swift bandit sharpshooter sporting a crimson bandana, twin ammo belts, and quickdraw momentum.',
    texture: 'player_outlaw',
    colorHex: '#ef4444',
    colorNum: 0xef4444,
    isExclusive: true,
    stats: {
      speedLabel: 'FAST (270 px/s)',
      jumpLabel: 'AGILE (-355 px/s)',
      controlLabel: 'QUICKDRAW',
      durabilityLabel: 'LIGHT',
      energyLabel: 'QUICK (4.5s)'
    },
    physics: {
      MOVE_SPEED: 270,
      GROUND_ACCELERATION: 1350,
      GROUND_DECELERATION: 1250,
      AIR_ACCELERATION: 920,
      AIR_DECELERATION: 320,
      GRAVITY: 620,
      JUMP_FORCE: -355,
      DOUBLE_JUMP_FORCE: -340,
      MAX_JUMPS: 2,
      COYOTE_TIME: 0.16,
      JUMP_BUFFER_TIME: 0.16
    },
    modifiers: {
      invulnerabilityMultiplier: 0.95,
      powerUpDurationMultiplier: 0.9,
      stompBonusMultiplier: 1.15
    }
  }
};

export const DEFAULT_CHARACTER_ID = 'NOVA';
