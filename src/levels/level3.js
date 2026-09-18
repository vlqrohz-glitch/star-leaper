/**
 * Level 3 Layout & World Data - Nebula Rift
 * Theme: Colorful Cosmic Nebula featuring Gravity Zones, Launch Pads & Orbital Sentinels
 */
export const LEVEL_3_DATA = {
  id: 'level_3',
  name: 'Nebula Rift - Sector Gamma',
  theme: {
    key: 'nebula',
    name: 'Cosmic Nebula',
    skyColor: 0x17072b
  },
  width: 2400,
  height: 450,
  deathZoneY: 480,

  spawn: {
    x: 80,
    y: 360
  },

  goal: {
    x: 2300,
    y: 280,
    type: 'beacon'
  },

  platforms: [
    // Section 1: Crystalline Ridge
    { x: 200, y: 434, width: 400, height: 32, type: 'ground_nebula' },

    // Section 2: Floating Nebula Rocks
    { x: 520, y: 350, width: 100, height: 20, type: 'platform_nebula' },
    { x: 740, y: 280, width: 110, height: 20, type: 'platform_nebula' },

    // Section 3: High Zero-G Spire
    { x: 1020, y: 190, width: 120, height: 20, type: 'platform_nebula' },
    { x: 1250, y: 240, width: 100, height: 20, type: 'platform_nebula' },

    // Section 4: Deep Rift Stepping Stones
    { x: 1500, y: 360, width: 90, height: 20, type: 'platform_nebula' },
    { x: 1720, y: 300, width: 100, height: 20, type: 'platform_nebula' },
    { x: 1940, y: 220, width: 120, height: 20, type: 'platform_nebula' },

    // Section 5: Warp Sanctuary
    { x: 2200, y: 340, width: 120, height: 20, type: 'platform_nebula' },
    { x: 2300, y: 300, width: 160, height: 20, type: 'platform_nebula' }
  ],

  // Gravity Zones (Core Sector 3 Mechanic: low gravity floaty areas)
  gravityZones: [
    { x: 950, y: 160, width: 220, height: 160, gravityScale: 0.35 },
    { x: 1850, y: 180, width: 200, height: 160, gravityScale: 0.35 }
  ],

  // Launch Pads (Core Sector 3 Mechanic: upward thruster boost)
  launchPads: [
    { x: 340, y: 412, force: -540 },
    { x: 1470, y: 344, force: -560 }
  ],

  collectibles: [
    { x: 180, y: 390 },
    { x: 260, y: 390 },
    { x: 340, y: 330 },
    { x: 420, y: 280 },
    { x: 520, y: 300 },
    { x: 630, y: 260 },
    { x: 740, y: 230 },
    { x: 880, y: 190 },
    { x: 960, y: 140 },
    { x: 1020, y: 130 },
    { x: 1120, y: 160 },
    { x: 1250, y: 190 },
    { x: 1380, y: 280 },
    { x: 1500, y: 310 },
    { x: 1610, y: 250 },
    { x: 1720, y: 240 },
    { x: 1830, y: 170 },
    { x: 1940, y: 160 },
    { x: 2070, y: 220 },
    { x: 2200, y: 280 },
    { x: 2260, y: 250 },
    { x: 2300, y: 230 }
  ],

  enemies: [
    { x: 600, y: 240, type: 'ORBITAL_SENTINEL' },
    { x: 740, y: 255, type: 'VOID_CRAWLER' },
    { x: 1140, y: 150, type: 'ORBITAL_SENTINEL' },
    { x: 1720, y: 275, type: 'VOID_CRAWLER' },
    { x: 2000, y: 180, type: 'ORBITAL_SENTINEL' }
  ],

  powerUps: [
    { x: 1020, y: 120, type: 'GRAVITY_SHIFT' },
    { x: 1940, y: 140, type: 'STAR_SURGE' }
  ],

  decorations: [
    { x: 320, y: 418, texture: 'poi_nebula_sanctuary', label: '[POI] ASTRAL SEER LUMEN • VOID SANCTUARY', labelColor: '#c084fc' },
    { x: 1350, y: 240, texture: 'poi_nebula_siphon', label: '[POI] ZEPHYR • RIFT SIPHON', labelColor: '#06b6d4' },
    { x: 140, y: 402, texture: 'holo_sign' }
  ]
};
