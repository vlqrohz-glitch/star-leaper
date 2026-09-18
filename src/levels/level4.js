/**
 * Level 4 Layout & World Data - Ember Crater
 * Theme: Volcanic Alien Planet featuring Falling Platforms, Magma Hazard Zones & Rift Hoppers
 */
export const LEVEL_4_DATA = {
  id: 'level_4',
  name: 'Ember Crater - Sector Delta',
  theme: {
    key: 'volcano',
    name: 'Volcanic Caldera',
    skyColor: 0x1f0a0a
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
    y: 300,
    type: 'beacon'
  },

  platforms: [
    // Section 1: Basalt Entryway
    { x: 200, y: 434, width: 400, height: 32, type: 'ground_volcanic' },

    // Section 2: Fiery Ascent
    { x: 500, y: 350, width: 100, height: 20, type: 'platform_volcanic' },
    { x: 800, y: 280, width: 110, height: 20, type: 'platform_volcanic' },

    // Section 3: Central Caldera Island
    { x: 1200, y: 270, width: 180, height: 20, type: 'platform_volcanic' },

    // Section 4: Magma River Stepping Crags
    { x: 1600, y: 340, width: 100, height: 20, type: 'platform_volcanic' },
    { x: 1900, y: 280, width: 110, height: 20, type: 'platform_volcanic' },

    // Section 5: Obsidian Ridge to Goal
    { x: 2150, y: 360, width: 120, height: 20, type: 'platform_volcanic' },
    { x: 2300, y: 320, width: 160, height: 20, type: 'platform_volcanic' }
  ],

  // Falling Platforms (Core Sector 4 Mechanic: tremble and drop)
  fallingPlatforms: [
    { x: 650, y: 310, width: 96, height: 20, delay: 350, respawnDelay: 2800 },
    { x: 1000, y: 270, width: 96, height: 20, delay: 350, respawnDelay: 2800 },
    { x: 1400, y: 300, width: 96, height: 20, delay: 350, respawnDelay: 2800 },
    { x: 1750, y: 310, width: 96, height: 20, delay: 350, respawnDelay: 2800 },
    { x: 2020, y: 320, width: 96, height: 20, delay: 350, respawnDelay: 2800 }
  ],

  // Hazard Zones (Core Sector 4 Mechanic: damaging magma pools)
  hazardZones: [
    { x: 650, y: 440, width: 220, height: 24, texture: 'hazard_lava' },
    { x: 1400, y: 440, width: 260, height: 24, texture: 'hazard_lava' },
    { x: 1750, y: 440, width: 240, height: 24, texture: 'hazard_lava' }
  ],

  collectibles: [
    { x: 180, y: 390 },
    { x: 280, y: 390 },
    { x: 380, y: 390 },
    { x: 500, y: 300 },
    { x: 650, y: 250 },
    { x: 800, y: 220 },
    { x: 920, y: 240 },
    { x: 1000, y: 210 },
    { x: 1120, y: 230 },
    { x: 1200, y: 210 },
    { x: 1280, y: 210 },
    { x: 1400, y: 240 },
    { x: 1500, y: 280 },
    { x: 1600, y: 280 },
    { x: 1700, y: 260 },
    { x: 1750, y: 250 },
    { x: 1830, y: 240 },
    { x: 1900, y: 220 },
    { x: 2020, y: 260 },
    { x: 2150, y: 300 },
    { x: 2230, y: 270 },
    { x: 2300, y: 250 }
  ],

  enemies: [
    { x: 320, y: 405, type: 'RIFT_HOPPER' },
    { x: 800, y: 255, type: 'DRIFTER_DRONE' },
    { x: 1200, y: 245, type: 'RIFT_HOPPER' },
    { x: 1600, y: 315, type: 'DRIFTER_DRONE' },
    { x: 1900, y: 255, type: 'RIFT_HOPPER' }
  ],

  powerUps: [
    { x: 800, y: 210, type: 'NOVA_BURST' },
    { x: 1600, y: 270, type: 'AEGIS_CORE' }
  ],

  decorations: [
    { x: 350, y: 418, texture: 'poi_volcanic_foundry', label: '[POI] FORGE-MASTER VULCAN • OBSIDIAN SMELTER', labelColor: '#f97316' },
    { x: 1300, y: 240, texture: 'poi_volcanic_extractor', label: '[POI] PYRA • GEOTHERMAL EXTRACTOR', labelColor: '#ef4444' },
    { x: 140, y: 402, texture: 'holo_sign' }
  ]
};
