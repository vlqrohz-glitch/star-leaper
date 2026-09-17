import { LEVEL_1_DATA } from './level1.js';
import { LEVEL_2_DATA } from './level2.js';
import { LEVEL_3_DATA } from './level3.js';
import { LEVEL_4_DATA } from './level4.js';
import { LEVEL_5_DATA } from './level5.js';
import { LEVEL_6_DATA } from './level6.js';
import { BOSS_CONFIGS } from '../entities/Boss.js';

export const SECTOR_THEMES = Object.freeze({
  1: {
    key: 'frontier',
    name: 'Celestial Frontier',
    sectorName: 'SECTOR ALPHA - ORION OUTPOST',
    groundType: 'ground',
    platformType: 'platform',
    primaryEnemy: 'DRIFTER_DRONE',
    secondaryEnemy: 'DRIFTER_DRONE',
    powerUp: 'AEGIS_CORE'
  },
  2: {
    key: 'station',
    name: 'Orbital Station',
    sectorName: 'SECTOR BETA - MOONFALL STATION',
    groundType: 'ground_station',
    platformType: 'platform_station',
    primaryEnemy: 'VOID_CRAWLER',
    secondaryEnemy: 'DRIFTER_DRONE',
    powerUp: 'CHRONO_CORE'
  },
  3: {
    key: 'nebula',
    name: 'Cosmic Nebula',
    sectorName: 'SECTOR GAMMA - NEBULA RIFT',
    groundType: 'ground_nebula',
    platformType: 'platform_nebula',
    primaryEnemy: 'ORBITAL_SENTINEL',
    secondaryEnemy: 'VOID_CRAWLER',
    powerUp: 'WARP_CORE'
  },
  4: {
    key: 'volcano',
    name: 'Volcanic Caldera',
    sectorName: 'SECTOR DELTA - EMBER CRATER',
    groundType: 'ground_volcanic',
    platformType: 'platform_volcanic',
    primaryEnemy: 'RIFT_HOPPER',
    secondaryEnemy: 'ORBITAL_SENTINEL',
    powerUp: 'AEGIS_CORE'
  },
  5: {
    key: 'ruins',
    name: 'Cosmic Ruins',
    sectorName: 'SECTOR OMEGA - ZENITH RUINS',
    groundType: 'ground_ruins',
    platformType: 'platform_ruins',
    primaryEnemy: 'NEBULA_WISP',
    secondaryEnemy: 'RIFT_HOPPER',
    powerUp: 'HYPER_CORE'
  },
  6: {
    key: 'desert',
    name: 'Desert Canyon',
    sectorName: 'SECTOR WEST - DUST DEVIL CANYON',
    groundType: 'ground_desert',
    platformType: 'platform_desert',
    primaryEnemy: 'GUNSLINGER',
    secondaryEnemy: 'DYNAMITE_BANDIT',
    powerUp: 'AEGIS_CORE'
  }
});

/**
 * Generates Sublevel 10: The Dedicated Final Boss Arena for a sector
 * @param {number} sector 1 to 6
 * @returns {object} Boss level definition
 */
export function createBossArenaData(sector = 1) {
  const theme = SECTOR_THEMES[sector] || SECTOR_THEMES[1];
  const bossMeta = BOSS_CONFIGS[sector] || BOSS_CONFIGS[1];

  return {
    id: `level_${sector}_10`,
    sectorIndex: sector,
    subLevel: 10,
    isBossLevel: true,
    name: `${theme.sectorName} • [FINAL BOSS: ${bossMeta.name}]`,
    theme: {
      key: theme.key,
      name: `${theme.name} - Boss Core`,
      skyColor: 0x070914
    },
    width: 1400,
    height: 450,
    deathZoneY: 480,

    // Starting spawn safely on left platform
    spawn: {
      x: 100,
      y: 360
    },

    // Goal warp gate placed on right side (activated on boss defeat)
    goal: {
      x: 1260,
      y: 340,
      type: 'beacon',
      initiallyHidden: true
    },

    // Boss entity metadata
    boss: {
      x: 880,
      y: 320,
      sectorIndex: sector,
      config: bossMeta
    },

    // Arena Combat Platform Layout
    platforms: [
      // Main arena floor (ground stretch)
      { x: 700, y: 434, width: 1400, height: 32, type: theme.groundType },

      // Left vantage perch
      { x: 220, y: 320, width: 130, height: 20, type: theme.platformType },
      { x: 340, y: 240, width: 120, height: 20, type: theme.platformType },

      // Center high dodging platform
      { x: 680, y: 210, width: 180, height: 20, type: theme.platformType },

      // Right vantage perches
      { x: 1020, y: 240, width: 120, height: 20, type: theme.platformType },
      { x: 1160, y: 320, width: 130, height: 20, type: theme.platformType }
    ],

    // Arena crystals for score and recovery
    collectibles: [
      { x: 220, y: 270 },
      { x: 340, y: 190 },
      { x: 620, y: 160 },
      { x: 680, y: 160 },
      { x: 740, y: 160 },
      { x: 1020, y: 190 },
      { x: 1160, y: 270 },
      { x: 480, y: 380 },
      { x: 880, y: 380 }
    ],

    // Power-up placed on center high perch to reward agility during battle
    powerUps: [
      { x: 680, y: 170, type: theme.powerUp || 'AEGIS_CORE' }
    ],

    // No minion enemies in boss arena; the Boss is the sole encounter
    enemies: [],

    decorations: [
      { x: 120, y: 402, texture: 'holo_sign' },
      { x: 1280, y: 402, texture: 'pipe_station' }
    ]
  };
}

/**
 * Generates Sublevels 2 through 9 for a sector with procedural scaling
 * @param {number} sector 1 to 6
 * @param {number} subLevel 2 to 9
 * @returns {object} Level layout data
 */
export function createSubLevelData(sector = 1, subLevel = 2) {
  const theme = SECTOR_THEMES[sector] || SECTOR_THEMES[1];
  const worldWidth = 2400 + (subLevel * 80);

  // Progressive platform heights and stepped layouts
  const platforms = [
    // Entrance runway
    { x: 200, y: 434, width: 400, height: 32, type: theme.groundType }
  ];

  // Mid-run platforms spaced across the world
  const numSteps = 5 + Math.min(4, subLevel);
  const stepWidth = Math.max(90, 150 - (subLevel * 6));
  const spanStart = 480;
  const spanEnd = worldWidth - 300;
  const stepInterval = (spanEnd - spanStart) / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const px = Math.round(spanStart + i * stepInterval);
    // Varied platform heights between 200 and 380
    const py = 360 - ((i % 3) * 60) + (Math.sin(i + subLevel) * 20);
    platforms.push({
      x: px,
      y: Math.round(py),
      width: stepWidth,
      height: 20,
      type: theme.platformType
    });
  }

  // Final landing pad and goal beacon platform
  platforms.push({
    x: worldWidth - 140,
    y: 350,
    width: 200,
    height: 24,
    type: theme.platformType
  });

  // Collectibles (15 to 22 crystals)
  const collectibles = [];
  const crystalCount = 16 + (subLevel % 5);
  for (let c = 0; c < crystalCount; c++) {
    const cx = Math.round(200 + (c * (worldWidth - 400) / crystalCount));
    const cy = Math.round(380 - ((c % 4) * 55));
    collectibles.push({ x: cx, y: cy });
  }

  // Enemies (4 to 7 patrolling hostiles with health bars)
  const enemies = [];
  const enemyCount = 4 + Math.floor(subLevel / 2);
  for (let e = 0; e < enemyCount; e++) {
    const ex = Math.round(380 + (e * (worldWidth - 650) / enemyCount));
    const ey = 390 - ((e % 3) * 60);
    const enemyType = (e % 2 === 0) ? theme.primaryEnemy : theme.secondaryEnemy;
    enemies.push({ x: ex, y: ey, type: enemyType });
  }

  // Power-Ups (1 or 2 per level)
  const powerUps = [
    { x: Math.round(worldWidth * 0.45), y: 220, type: theme.powerUp }
  ];
  if (subLevel >= 5) {
    powerUps.push({ x: Math.round(worldWidth * 0.8), y: 240, type: 'AEGIS_CORE' });
  }

  // Sector mechanics
  const movingPlatforms = [];
  const fallingPlatforms = [];
  const gravityZones = [];
  const launchPads = [];
  const hazardZones = [];
  const energyGates = [];

  if (sector === 2) {
    movingPlatforms.push(
      { x: Math.round(worldWidth * 0.35), y: 320, width: 96, height: 20, rangeX: 60, rangeY: 0, speed: 50 },
      { x: Math.round(worldWidth * 0.7), y: 280, width: 96, height: 20, rangeX: 0, rangeY: 40, speed: 45 }
    );
  } else if (sector === 3) {
    launchPads.push(
      { x: 340, y: 412, force: -540 },
      { x: Math.round(worldWidth * 0.6), y: 340, force: -560 }
    );
    gravityZones.push(
      { x: Math.round(worldWidth * 0.5), y: 200, width: 220, height: 160, gravityScale: 0.35 }
    );
  } else if (sector === 4) {
    fallingPlatforms.push(
      { x: Math.round(worldWidth * 0.3), y: 310, width: 96, height: 20, delay: 350, respawnDelay: 2800 },
      { x: Math.round(worldWidth * 0.65), y: 290, width: 96, height: 20, delay: 350, respawnDelay: 2800 }
    );
    hazardZones.push(
      { x: Math.round(worldWidth * 0.48), y: 440, width: 240, height: 24, texture: 'hazard_lava' }
    );
  } else if (sector === 5) {
    energyGates.push(
      { x: Math.round(worldWidth * 0.4), y: 290, activeTime: 2000, inactiveTime: 1800, initialActive: true },
      { x: Math.round(worldWidth * 0.72), y: 270, activeTime: 1800, inactiveTime: 1800, initialActive: false }
    );
  } else if (sector === 6) {
    hazardZones.push(
      { x: Math.round(worldWidth * 0.35), y: 430, width: 36, height: 24, type: 'cactus' },
      { x: Math.round(worldWidth * 0.68), y: 430, width: 36, height: 24, type: 'cactus' }
    );
  }

  return {
    id: `level_${sector}_${subLevel}`,
    sectorIndex: sector,
    subLevel,
    name: `${theme.sectorName} • STAGE ${subLevel}/10`,
    theme: {
      key: theme.key,
      name: theme.name,
      skyColor: 0x090d1a
    },
    width: worldWidth,
    height: 450,
    deathZoneY: 480,
    spawn: { x: 80, y: 360 },
    goal: { x: worldWidth - 100, y: 310, type: 'beacon' },
    platforms,
    collectibles,
    enemies,
    powerUps,
    movingPlatforms,
    fallingPlatforms,
    gravityZones,
    launchPads,
    hazardZones,
    energyGates,
    decorations: [
      { x: 120, y: 402, texture: 'holo_sign' }
    ]
  };
}

// Canonical baseline levels for Sublevel 1 of each sector
const BASELINE_LEVELS = [
  LEVEL_1_DATA,
  LEVEL_2_DATA,
  LEVEL_3_DATA,
  LEVEL_4_DATA,
  LEVEL_5_DATA,
  LEVEL_6_DATA
];

/**
 * Primary Level Resolver
 * Resolves level data for any (sector, subLevel) combination (6 sectors x 10 levels = 60 levels total).
 * Level 10 of each sector is guaranteed to be the Final Boss encounter arena.
 *
 * @param {number|string} sectorIndexOrId Sector (1-6) or Level ID (e.g. 'level_1', 'level_1_10')
 * @param {number} [subLevel=1] Sublevel (1-10)
 * @returns {object} Level layout data
 */
export function getSectorLevelData(sectorIndexOrId = 1, subLevel = 1) {
  // Handle string ID lookup
  if (typeof sectorIndexOrId === 'string') {
    const parts = sectorIndexOrId.replace('level_', '').split('_');
    const s = parseInt(parts[0], 10) || 1;
    const sub = parts.length > 1 ? parseInt(parts[1], 10) : subLevel;
    return getSectorLevelData(s, sub);
  }

  const s = Math.max(1, Math.min(6, sectorIndexOrId || 1));
  const sub = Math.max(1, Math.min(10, subLevel || 1));

  // Level 1 of each sector uses baseline hand-crafted maps
  if (sub === 1) {
    const base = BASELINE_LEVELS[s - 1] || LEVEL_1_DATA;
    return {
      ...base,
      sectorIndex: s,
      subLevel: 1
    };
  }

  // Level 10 of each sector is the dedicated Final Boss Level
  if (sub === 10) {
    return createBossArenaData(s);
  }

  // Sublevels 2 to 9
  return createSubLevelData(s, sub);
}
