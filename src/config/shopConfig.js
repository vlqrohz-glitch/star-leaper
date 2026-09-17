/**
 * Central Shop Configuration for Star-Leaper: Orion Odyssey
 * Outfits, Perks, and Pets catalog with pricing, attributes, and descriptions.
 */

export const ShopCategory = Object.freeze({
  OUTFITS: 'outfits',
  PERKS: 'perks',
  PETS: 'pets'
});

export const SHOP_CATALOG = {
  // 1. COSMETIC ARMOR OUTFITS
  outfits: [
    {
      id: 'standard',
      name: 'Standard Issue',
      category: ShopCategory.OUTFITS,
      price: 0,
      isDefault: true,
      description: 'Standard exploration flight suit calibrated for planetary recon.',
      palette: 'default',
      accentColor: '#00f0ff',
      rarity: 'Common'
    },
    {
      id: 'solar_flare',
      name: 'Solar Flare',
      category: ShopCategory.OUTFITS,
      price: 250,
      description: 'Molten crimson insulation armor with a radiant thermonuclear gold visor.',
      palette: 'solar',
      accentColor: '#f97316',
      rarity: 'Rare'
    },
    {
      id: 'cyber_void',
      name: 'Cyber Void',
      category: ShopCategory.OUTFITS,
      price: 300,
      description: 'Stealth-coated carbon composite plate laced with ultraviolet conduits.',
      palette: 'cyber',
      accentColor: '#a855f7',
      rarity: 'Epic'
    },
    {
      id: 'neon_pulse',
      name: 'Neon Pulse',
      category: ShopCategory.OUTFITS,
      price: 350,
      description: 'High-frequency luminescent synthwave armor pulsating with cyan & magenta.',
      palette: 'neon',
      accentColor: '#ec4899',
      rarity: 'Epic'
    },
    {
      id: 'stellar_gold',
      name: 'Stellar Gold',
      category: ShopCategory.OUTFITS,
      price: 500,
      description: 'Ceremonial commander plate forged from condensed stardust and auric alloy.',
      palette: 'gold',
      accentColor: '#facc15',
      rarity: 'Legendary'
    },
    {
      id: 'frontier_duster',
      name: 'Frontier Duster',
      category: ShopCategory.OUTFITS,
      price: 350,
      description: 'Rugged leather marshal coat with an authentic star badge and brass buckle.',
      palette: 'frontier',
      accentColor: '#eab308',
      rarity: 'Exclusive'
    },
    {
      id: 'desperado_poncho',
      name: 'Desperado Poncho',
      category: ShopCategory.OUTFITS,
      price: 350,
      description: 'Woven desert nomad poncho paired with a dust bandana and dual holsters.',
      palette: 'desperado',
      accentColor: '#ef4444',
      rarity: 'Exclusive'
    }
  ],

  // 2. EQUIPPABLE PASSIVE PERKS
  perks: [
    {
      id: 'magnet_core',
      name: 'Magnet Core',
      category: ShopCategory.PERKS,
      price: 350,
      description: 'Generates a 120px magnetic gravity field pulling nearby Star Crystals.',
      statModifier: { magnetRadius: 120 },
      iconTexture: 'badge_magnet',
      accentColor: '#38bdf8',
      rarity: 'Rare'
    },
    {
      id: 'reinforced_plating',
      name: 'Reinforced Plating',
      category: ShopCategory.PERKS,
      price: 400,
      description: 'Nanotech shield reinforcement increasing maximum shield capacity to 4 HP.',
      statModifier: { bonusHealth: 1 },
      iconTexture: 'badge_armor',
      accentColor: '#34d399',
      rarity: 'Epic'
    },
    {
      id: 'boost_thrusters',
      name: 'Boost Thrusters',
      category: ShopCategory.PERKS,
      price: 300,
      description: 'Overclocks micro-propulsion boots by +12% horizontal speed and jump lift.',
      statModifier: { speedMultiplier: 1.12, jumpMultiplier: 1.08 },
      iconTexture: 'badge_thruster',
      accentColor: '#fbbf24',
      rarity: 'Rare'
    },
    {
      id: 'lucky_stars',
      name: 'Lucky Stars',
      category: ShopCategory.PERKS,
      price: 250,
      description: 'Cosmic fortune: crystals award +50 bonus score and +1 extra wallet credit.',
      statModifier: { bonusScore: 50, bonusCredits: 1 },
      iconTexture: 'badge_luck',
      accentColor: '#e879f9',
      rarity: 'Common'
    },
    {
      id: 'quickdraw',
      name: 'Quickdraw Holster',
      category: ShopCategory.PERKS,
      price: 380,
      description: 'Outlaw reflexes: grants +15% sprint acceleration and +20px stomp reach.',
      statModifier: { speedMultiplier: 1.15, stompReach: 20 },
      iconTexture: 'badge_quickdraw',
      accentColor: '#f97316',
      rarity: 'Exclusive'
    },
    {
      id: 'gold_rush',
      name: 'Gold Rush',
      category: ShopCategory.PERKS,
      price: 420,
      description: 'Prospector instinct: Star Crystals award +100 bonus score and +2 extra credits.',
      statModifier: { bonusScore: 100, bonusCredits: 2 },
      iconTexture: 'badge_goldrush',
      accentColor: '#eab308',
      rarity: 'Exclusive'
    },
    {
      id: 'dynamite_boots',
      name: 'Dynamite Boots',
      category: ShopCategory.PERKS,
      price: 450,
      description: 'Explosive jump takeoff: triggers a mini dust shockwave pushing nearby enemies.',
      statModifier: { jumpMultiplier: 1.1, shockwaveRadius: 40 },
      iconTexture: 'badge_dynamiteboots',
      accentColor: '#ef4444',
      rarity: 'Exclusive'
    }
  ],

  // 3. ANIMATED COMPANION PETS
  pets: [
    {
      id: 'pet_cosmo',
      name: 'Cosmo the Pup',
      category: ShopCategory.PETS,
      price: 400,
      description: 'A loyal celestial puppy with glowing ears and tail that playfully follows you.',
      texture: 'pet_cosmo',
      accentColor: '#38bdf8',
      rarity: 'Epic'
    },
    {
      id: 'pet_orbe',
      name: 'Orb-E Drone',
      category: ShopCategory.PETS,
      price: 300,
      description: 'A sleek hovering robotic drone with a spinning scanner ring and blue optic lens.',
      texture: 'pet_orbe',
      accentColor: '#00f0ff',
      rarity: 'Rare'
    },
    {
      id: 'pet_chrono',
      name: 'Chrono-Sprite',
      category: ShopCategory.PETS,
      price: 350,
      description: 'An ethereal star-wisp drifting around the explorer leaving shimmering sparkles.',
      texture: 'pet_chrono',
      accentColor: '#10b981',
      rarity: 'Rare'
    },
    {
      id: 'pet_starkitten',
      name: 'Star-Kitten',
      category: ShopCategory.PETS,
      price: 450,
      description: 'An adorable cosmic kitten floating in a micro bubble helmet with star tail.',
      texture: 'pet_starkitten',
      accentColor: '#f472b6',
      rarity: 'Legendary'
    },
    {
      id: 'pet_horse',
      name: 'Mustang Spirit',
      category: ShopCategory.PETS,
      price: 500,
      description: 'A majestic celestial wild horse with a starry mane galloping loyally alongside you.',
      texture: 'pet_horse',
      accentColor: '#eab308',
      rarity: 'Exclusive'
    },
    {
      id: 'pet_bear',
      name: 'Barnaby the Bear',
      category: ShopCategory.PETS,
      price: 500,
      description: 'A cuddly yet formidable frontier grizzly cub wearing a tiny red bandana.',
      texture: 'pet_bear',
      accentColor: '#a16207',
      rarity: 'Exclusive'
    }
  ]
};

export const STARTING_CRYSTAL_BALANCE = 500;
