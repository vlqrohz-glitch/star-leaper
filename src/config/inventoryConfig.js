/**
 * INVENTORY CONFIGURATION & 9-SLOT WEAPON CATALOG
 * Defines all 9 equipable firearms and special ordnance with damage, fire rate, and visual themes.
 * Accessible via [I] key modal and direct hotkeys [1] through [9].
 */
export const INVENTORY_CATALOG = Object.freeze([
  {
    slot: 1,
    id: 'REVOLVER',
    name: 'Six-Shooter',
    type: 'Ballistic',
    damage: 15,
    fireRate: 'High',
    desc: 'Heavy brass magnum slugs',
    colorHex: '#facc15',
    colorNum: 0xfacc15,
    texture: 'weapon_revolver'
  },
  {
    slot: 2,
    id: 'PLASMA_BLASTER',
    name: 'Plasma Blaster',
    type: 'Energy',
    damage: 12,
    fireRate: 'Very High',
    desc: 'High-speed dual ion bolts',
    colorHex: '#00f0ff',
    colorNum: 0x00f0ff,
    texture: 'weapon_plasma_blaster'
  },
  {
    slot: 3,
    id: 'PHOTON_RIFLE',
    name: 'Photon Rifle',
    type: 'Rail Beam',
    damage: 28,
    fireRate: 'Medium',
    desc: 'Piercing high-energy beam',
    colorHex: '#c084fc',
    colorNum: 0xc084fc,
    texture: 'weapon_photon_rifle'
  },
  {
    slot: 4,
    id: 'DYNAMITE_LAUNCHER',
    name: 'Dynamite Cannon',
    type: 'Explosive',
    damage: 40,
    fireRate: 'Burst',
    desc: 'Arcing cluster explosive charge',
    colorHex: '#ef4444',
    colorNum: 0xef4444,
    texture: 'weapon_dynamite_launcher'
  },
  {
    slot: 5,
    id: 'SHOTGUN',
    name: 'Scattergun',
    type: 'Multi-Pellet',
    damage: 30,
    fireRate: 'Heavy',
    desc: 'Devastating close-range spread',
    colorHex: '#f59e0b',
    colorNum: 0xf59e0b,
    texture: 'weapon_shotgun'
  },
  {
    slot: 6,
    id: 'AEGIS_BLASTER',
    name: 'Aegis Blaster',
    type: 'Barrier Pulse',
    damage: 35,
    fireRate: 'High',
    desc: 'Harmonic barrier discharge',
    colorHex: '#38bdf8',
    colorNum: 0x38bdf8,
    texture: 'weapon_aegis_blaster'
  },
  {
    slot: 7,
    id: 'CHRONO_WARP',
    name: 'Chrono Cannon',
    type: 'Quantum',
    damage: 32,
    fireRate: 'Fast Pulse',
    desc: 'Temporal phase distortion',
    colorHex: '#a855f7',
    colorNum: 0xa855f7,
    texture: 'weapon_chrono_warp'
  },
  {
    slot: 8,
    id: 'HYPER_LASER',
    name: 'Hyper Laser',
    type: 'Focused Ray',
    damage: 50,
    fireRate: 'Concentrated',
    desc: 'Continuous hyper heat ray',
    colorHex: '#10b981',
    colorNum: 0x10b981,
    texture: 'weapon_hyper_laser'
  },
  {
    slot: 9,
    id: 'CLUSTER_BOMB',
    name: 'Cluster Bomb',
    type: 'Cataclysmic',
    damage: 60,
    fireRate: 'Heavy Ordnance',
    desc: 'Multi-detonation starburst cluster',
    colorHex: '#ec4899',
    colorNum: 0xec4899,
    texture: 'weapon_cluster_bomb'
  }
]);
