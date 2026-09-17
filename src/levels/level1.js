/**
 * Level 1 Layout & World Data - Sector Alpha
 * Centralized data defining level geometry, boundaries, spawn points, and collectibles.
 */
export const LEVEL_1_DATA = {
  id: 'level_1',
  name: 'Orion Outpost - Sector Alpha',
  theme: {
    key: 'frontier',
    name: 'Celestial Frontier',
    skyColor: 0x0a0b18
  },
  width: 2400,        // Full horizontal scroll width (px)
  height: 450,        // Vertical world height (px)
  deathZoneY: 480,    // Falling past this Y coordinate triggers player death/reset

  // Player Starting Position
  spawn: {
    x: 80,
    y: 360
  },

  // Level Completion Marker Coordinates
  goal: {
    x: 2300,
    y: 330,
    type: 'beacon'
  },

  // Platform Definitions: [x, y, width, height, type]
  platforms: [
    // Section 1: Starting Run Area (0 - 450)
    { x: 220, y: 434, width: 440, height: 32, type: 'ground' },

    // Section 2: Stepped Ascent (Testing jump heights & variable jump)
    { x: 530, y: 360, width: 110, height: 20, type: 'platform' },
    { x: 700, y: 290, width: 110, height: 20, type: 'platform' },
    { x: 880, y: 230, width: 130, height: 20, type: 'platform' },

    // Section 3: High Suspended Runner (Testing running & momentum)
    { x: 1080, y: 230, width: 220, height: 20, type: 'platform' },

    // Section 4: Chasm with Gaps (Testing coyote time & air control)
    { x: 1300, y: 290, width: 90, height: 20, type: 'platform' },
    { x: 1470, y: 340, width: 80, height: 20, type: 'platform' },
    { x: 1640, y: 280, width: 100, height: 20, type: 'platform' },

    // Section 5: Long Low Stretch (Sprint zone)
    { x: 1900, y: 434, width: 360, height: 32, type: 'ground' },

    // Section 6: Final Ascent to Goal
    { x: 2120, y: 380, width: 110, height: 20, type: 'platform' },
    { x: 2300, y: 350, width: 180, height: 20, type: 'platform' }
  ],

  // Collectible Placements: 20 Star Crystals placed throughout Sector Alpha
  collectibles: [
    // Section 1: Introduction crystals
    { x: 200, y: 390 },
    { x: 300, y: 390 },
    { x: 400, y: 360 },

    // Section 2: Stepped ascent jump arcs
    { x: 530, y: 310 },
    { x: 615, y: 270 },
    { x: 700, y: 240 },
    { x: 790, y: 200 },
    { x: 880, y: 180 },

    // Section 3: High suspended sprint
    { x: 1030, y: 180 },
    { x: 1130, y: 180 },

    // Section 4: Chasm gaps (rewarding risk and coyote time)
    { x: 1300, y: 240 },
    { x: 1385, y: 270 },
    { x: 1470, y: 290 },
    { x: 1555, y: 240 },
    { x: 1640, y: 230 },

    // Section 5: Sprint stretch
    { x: 1850, y: 390 },
    { x: 1950, y: 390 },

    // Section 6: Final ascent into Warp Gate
    { x: 2120, y: 330 },
    { x: 2210, y: 300 },
    { x: 2300, y: 280 }
  ],

  // Enemy Placements: 5 Drifter Drones positioned across Sector Alpha
  enemies: [
    // 1. Safe ground introductory drone
    { x: 360, y: 405, type: 'DRIFTER_DRONE' },
    // 2. Stepped ascent platform drone
    { x: 700, y: 265, type: 'DRIFTER_DRONE' },
    // 3. High suspended runner ledge drone
    { x: 1080, y: 205, type: 'DRIFTER_DRONE' },
    // 4. Risky pre-chasm ledge drone
    { x: 1300, y: 265, type: 'DRIFTER_DRONE' },
    // 5. Sprint stretch ground drone
    { x: 1940, y: 405, type: 'DRIFTER_DRONE' }
  ],

  // Power-Up Placements: 2 Aegis Cores placed in Sector Alpha
  powerUps: [
    // 1. Stepped ascent platform reward (near drone 2)
    { x: 620, y: 300, type: 'AEGIS_CORE' },
    // 2. Chasm gap midway island (near drone 4)
    { x: 1420, y: 250, type: 'AEGIS_CORE' }
  ],

  // Environmental storytelling / decor objects
  decorations: [
    { x: 120, y: 402, texture: 'holo_sign' },
    { x: 920, y: 215, texture: 'pipe_station' }
  ]
};
