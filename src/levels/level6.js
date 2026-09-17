/**
 * Level 6 Layout & World Data - Dust Devil Canyon
 * Theme: Wild West Desert Biome featuring Sandstone Mesas, Cacti, Pistol Gunslingers & Dynamite Bandits
 */
export const LEVEL_6_DATA = {
  id: 'level_6',
  name: 'Dust Devil Canyon - Sector West',
  theme: {
    key: 'desert',
    name: 'Desert Canyon',
    skyColor: 0x3d1a0d
  },
  width: 2600,
  height: 450,
  deathZoneY: 480,

  spawn: {
    x: 80,
    y: 360
  },

  goal: {
    x: 2480,
    y: 280,
    type: 'saloon_gateway'
  },

  platforms: [
    // Section 1: Canyon Basin Entrance
    { x: 220, y: 434, width: 440, height: 32, type: 'ground_desert' },

    // Section 2: Sandstone Butte Ascents
    { x: 540, y: 360, width: 130, height: 22, type: 'platform_desert' },
    { x: 760, y: 300, width: 130, height: 22, type: 'platform_desert' },

    // Section 3: Old Mining Wooden Trestle & Saloon Scaffolds
    { x: 990, y: 240, width: 150, height: 20, type: 'platform_wood' },
    { x: 1250, y: 220, width: 160, height: 20, type: 'platform_wood' },

    // Section 4: High Mesa Terraces
    { x: 1540, y: 280, width: 130, height: 22, type: 'platform_desert' },
    { x: 1810, y: 230, width: 150, height: 22, type: 'platform_desert' },

    // Section 5: Outlaw Gulch & Grand Canyon Gateway
    { x: 2110, y: 320, width: 140, height: 22, type: 'platform_desert' },
    { x: 2360, y: 300, width: 160, height: 22, type: 'platform_desert' },
    { x: 2500, y: 300, width: 130, height: 22, type: 'platform_wood' }
  ],

  // Cacti spikes & Desert hazard zones
  hazardZones: [
    { x: 670, y: 430, width: 36, height: 24, type: 'cactus' },
    { x: 1420, y: 430, width: 40, height: 24, type: 'cactus' },
    { x: 1980, y: 430, width: 36, height: 24, type: 'cactus' }
  ],

  // Collectibles: 22 Crystals + Gold Nuggets (+250)
  collectibles: [
    { x: 180, y: 390 },
    { x: 280, y: 390 },
    { x: 380, y: 390 },
    { x: 540, y: 310 },
    { x: 650, y: 260, type: 'crystal_ancient', value: 250 },
    { x: 760, y: 250 },
    { x: 880, y: 200 },
    { x: 990, y: 190 },
    { x: 1120, y: 170 },
    { x: 1250, y: 160, type: 'crystal_ancient', value: 250 },
    { x: 1400, y: 230 },
    { x: 1540, y: 230 },
    { x: 1680, y: 190 },
    { x: 1810, y: 180, type: 'crystal_ancient', value: 250 },
    { x: 1950, y: 240 },
    { x: 2040, y: 260 },
    { x: 2110, y: 270 },
    { x: 2230, y: 250 },
    { x: 2360, y: 240, type: 'crystal_ancient', value: 250 },
    { x: 2420, y: 230 },
    { x: 2480, y: 220 },
    { x: 2540, y: 220, type: 'crystal_ancient', value: 250 }
  ],

  // Power-Ups
  powerUps: [
    { x: 880, y: 170, type: 'AEGIS_CORE' },
    { x: 1680, y: 160, type: 'NOVA_BURST' }
  ],

  // Enemies: Pistol Gunslingers & Dynamite Bandits
  enemies: [
    { type: 'VOID_CRAWLER', x: 320, y: 410 },
    { type: 'GUNSLINGER', x: 560, y: 340 },
    { type: 'DYNAMITE_BANDIT', x: 780, y: 280 },
    { type: 'GUNSLINGER', x: 1260, y: 200 },
    { type: 'DYNAMITE_BANDIT', x: 1550, y: 260 },
    { type: 'GUNSLINGER', x: 1820, y: 210 },
    { type: 'DYNAMITE_BANDIT', x: 2120, y: 300 },
    { type: 'GUNSLINGER', x: 2370, y: 280 }
  ]
};
