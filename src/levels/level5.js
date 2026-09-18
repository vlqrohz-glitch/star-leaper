/**
 * Level 5 Layout & World Data - Zenith Ruins
 * Theme: Ancient Cosmic Civilization featuring Energy Gates, Ancient Star Shards & Nebula Wisps
 */
export const LEVEL_5_DATA = {
  id: 'level_5',
  name: 'Zenith Ruins - Sector Omega',
  theme: {
    key: 'ruins',
    name: 'Cosmic Ruins',
    skyColor: 0x090d1a
  },
  width: 2500,
  height: 450,
  deathZoneY: 480,

  spawn: {
    x: 80,
    y: 360
  },

  goal: {
    x: 2380,
    y: 280,
    type: 'beacon'
  },

  platforms: [
    // Section 1: Sunken Temple Terrace
    { x: 200, y: 434, width: 400, height: 32, type: 'ground_ruins' },

    // Section 2: Ascending Monolith Pillars
    { x: 500, y: 350, width: 100, height: 20, type: 'platform_ruins' },
    { x: 750, y: 280, width: 110, height: 20, type: 'platform_ruins' },

    // Section 3: High Sanctuary Colonnade
    { x: 1050, y: 220, width: 140, height: 20, type: 'platform_ruins' },
    { x: 1350, y: 220, width: 140, height: 20, type: 'platform_ruins' },

    // Section 4: Floating Obelisk Array
    { x: 1650, y: 300, width: 100, height: 20, type: 'platform_ruins' },
    { x: 1900, y: 240, width: 110, height: 20, type: 'platform_ruins' },

    // Section 5: The Grand Spire Gateway
    { x: 2180, y: 340, width: 120, height: 20, type: 'platform_ruins' },
    { x: 2380, y: 300, width: 180, height: 20, type: 'platform_ruins' }
  ],

  // Energy Gates (Core Sector 5 Mechanic: timed laser barriers)
  energyGates: [
    { x: 620, y: 310, activeTime: 2000, inactiveTime: 1800, initialActive: true },
    { x: 1200, y: 190, activeTime: 2200, inactiveTime: 1600, initialActive: false },
    { x: 1780, y: 270, activeTime: 1800, inactiveTime: 1800, initialActive: true },
    { x: 2060, y: 280, activeTime: 2000, inactiveTime: 2000, initialActive: false }
  ],

  // Collectibles: Mix of Standard Star Crystals & Rare Ancient Star Shards (+250)
  collectibles: [
    { x: 180, y: 390 },
    { x: 280, y: 390 },
    { x: 380, y: 390 },
    { x: 500, y: 300 },
    { x: 620, y: 240, type: 'crystal_ancient', value: 250 },
    { x: 750, y: 230 },
    { x: 900, y: 180 },
    { x: 1050, y: 160 },
    { x: 1120, y: 160 },
    { x: 1200, y: 130, type: 'crystal_ancient', value: 250 },
    { x: 1350, y: 160 },
    { x: 1500, y: 240 },
    { x: 1650, y: 250 },
    { x: 1780, y: 200, type: 'crystal_ancient', value: 250 },
    { x: 1900, y: 180 },
    { x: 2000, y: 220 },
    { x: 2060, y: 220, type: 'crystal_ancient', value: 250 },
    { x: 2180, y: 280 },
    { x: 2280, y: 250 },
    { x: 2340, y: 230 },
    { x: 2380, y: 220 },
    { x: 2440, y: 230, type: 'crystal_ancient', value: 250 }
  ],

  // Enemies: Nebula Wisps + Orbital Sentinels + Void Crawlers
  enemies: [
    { x: 750, y: 255, type: 'VOID_CRAWLER' },
    { x: 900, y: 190, type: 'NEBULA_WISP' },
    { x: 1350, y: 195, type: 'VOID_CRAWLER' },
    { x: 1650, y: 210, type: 'ORBITAL_SENTINEL' },
    { x: 1900, y: 160, type: 'NEBULA_WISP' }
  ],

  powerUps: [
    { x: 1050, y: 150, type: 'STAR_SURGE' },
    { x: 1350, y: 150, type: 'NOVA_BURST' },
    { x: 2180, y: 270, type: 'AEGIS_CORE' }
  ],

  decorations: [
    { x: 340, y: 418, texture: 'poi_ruins_vault', label: '[POI] ARCH-ARCHIVIST SOLON • CELESTIAL VAULT', labelColor: '#fde047' },
    { x: 1450, y: 230, texture: 'poi_ruins_shrine', label: '[POI] AETHELGARD • TITAN SHRINE', labelColor: '#38bdf8' },
    { x: 140, y: 402, texture: 'holo_sign' }
  ]
};
