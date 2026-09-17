/**
 * Level 2 Layout & World Data - Moonfall Station
 * Theme: Abandoned Orbital Station featuring Moving Platforms & Void Crawlers
 */
export const LEVEL_2_DATA = {
  id: 'level_2',
  name: 'Moonfall Station - Sector Beta',
  theme: {
    key: 'station',
    name: 'Orbital Station',
    skyColor: 0x050711
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
    y: 330,
    type: 'beacon'
  },

  // Stationary Platforms (Station tileset)
  platforms: [
    // Section 1: Hangar Bay
    { x: 200, y: 434, width: 400, height: 32, type: 'ground_station' },

    // Section 2: Ascending Air-lock Gantries
    { x: 500, y: 360, width: 100, height: 20, type: 'platform_station' },
    { x: 800, y: 300, width: 110, height: 20, type: 'platform_station' },

    // Section 3: Generator Deck
    { x: 1200, y: 240, width: 180, height: 20, type: 'platform_station' },

    // Section 4: Debris Corridor
    { x: 1550, y: 320, width: 90, height: 20, type: 'platform_station' },
    { x: 1850, y: 260, width: 100, height: 20, type: 'platform_station' },

    // Section 5: Docking Arm leading to Goal
    { x: 2150, y: 390, width: 130, height: 20, type: 'platform_station' },
    { x: 2300, y: 350, width: 180, height: 20, type: 'platform_station' }
  ],

  // Moving Platforms (Core Sector 2 Mechanic)
  movingPlatforms: [
    // 1. Moving elevator between air-lock gantries
    { x: 650, y: 330, width: 96, height: 20, rangeX: 0, rangeY: 40, speed: 45 },
    // 2. Horizontal ferry across generator chasm
    { x: 1000, y: 270, width: 96, height: 20, rangeX: 70, rangeY: 0, speed: 60 },
    // 3. Diagonal-like moving gantry to debris corridor
    { x: 1400, y: 280, width: 96, height: 20, rangeX: 60, rangeY: 30, speed: 50 },
    // 4. Final moving platform to docking arm
    { x: 2000, y: 330, width: 96, height: 20, rangeX: 50, rangeY: 0, speed: 55 }
  ],

  // Collectibles: 22 Star Crystals
  collectibles: [
    { x: 180, y: 390 },
    { x: 280, y: 390 },
    { x: 380, y: 390 },
    { x: 500, y: 310 },
    { x: 650, y: 280 },
    { x: 800, y: 250 },
    { x: 930, y: 230 },
    { x: 1000, y: 210 },
    { x: 1070, y: 230 },
    { x: 1200, y: 190 },
    { x: 1260, y: 190 },
    { x: 1350, y: 230 },
    { x: 1400, y: 230 },
    { x: 1550, y: 270 },
    { x: 1700, y: 230 },
    { x: 1850, y: 210 },
    { x: 1950, y: 280 },
    { x: 2000, y: 280 },
    { x: 2050, y: 280 },
    { x: 2150, y: 340 },
    { x: 2230, y: 310 },
    { x: 2300, y: 280 }
  ],

  // Enemies: Void Crawlers (ground patrol) + Drifter Drones (aerial)
  enemies: [
    { x: 300, y: 405, type: 'VOID_CRAWLER' },
    { x: 800, y: 275, type: 'VOID_CRAWLER' },
    { x: 1200, y: 215, type: 'VOID_CRAWLER' },
    { x: 1550, y: 295, type: 'DRIFTER_DRONE' },
    { x: 1850, y: 235, type: 'DRIFTER_DRONE' }
  ],

  // Power-Ups: Chrono Core + Aegis Core
  powerUps: [
    { x: 800, y: 230, type: 'CHRONO_CORE' },
    { x: 1650, y: 200, type: 'AEGIS_CORE' }
  ],

  decorations: [
    { x: 140, y: 402, texture: 'holo_sign' },
    { x: 520, y: 345, texture: 'pipe_station' },
    { x: 1220, y: 225, texture: 'pipe_station' }
  ]
};
