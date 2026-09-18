/**
 * Boot Scene - Generates crisp original sci-fi procedural textures, tilesets,
 * character sprites, enemies, power-ups, and multi-layer parallax assets.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // 1. Player Characters
    this.createCharacterTextures();

    // 2. Themed Environment Tilesets
    this.createPlatformTextures();

    // 3. Multi-Layer Parallax Backgrounds
    this.createParallaxTextures();

    // 4. Level Objects & Markers
    this.createGoalMarkerTexture();
    this.createStartPadTexture();
    this.createCrystalTextures();

    // 5. Expanded Enemies Roster
    this.createEnemyTextures();

    // 6. Expanded Power-Ups Roster
    this.createPowerUpTextures();
    this.createShieldAuraTexture();

    // 7. Interactive Mechanics & Hazards
    this.createMechanicsTextures();

    // 8. Environmental Storytelling & Decor
    this.createDecorTextures();

    // 9. Outfits, Pets & Shop Badges
    this.createOutfitTextures();
    this.createPetTextures();
    this.createShopBadgeTextures();
    this.createWeaponAndCombatTextures();
    this.createBossTextures();

    // Dismiss loading indicator with fade
    const loader = document.getElementById('game-loading-indicator');
    if (loader) {
      loader.style.transition = 'opacity 0.25s ease';
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => loader.remove(), 250);
    }

    // Ready to start GameScene
    this.scene.start('GameScene');
  }

  /* -------------------------------------------------------------
     1. PLAYER CHARACTERS ROSTER (NOVA, ZENITH, ATLAS, LUMEN)
     ------------------------------------------------------------- */
  createCharacterTextures() {
    // NOVA: Balanced Explorer (Cyan / Deep Navy / Gold Visor)
    const nova = this.make.graphics({ x: 0, y: 0, add: false });
    // Torso
    nova.fillStyle(0x0f3460, 1);
    nova.fillRoundedRect(7, 12, 18, 14, 3);
    // Helmet
    nova.fillStyle(0x00adb5, 1);
    nova.fillCircle(16, 8, 7);
    // Visor
    nova.fillStyle(0xffd700, 1);
    nova.fillRect(16, 5, 8, 5);
    // Thruster Pack
    nova.fillStyle(0xe94560, 1);
    nova.fillRect(4, 13, 4, 10);
    nova.fillStyle(0x00f0ff, 1);
    nova.fillRect(5, 23, 2, 3);
    // Celestial Energy Core
    nova.fillStyle(0x00fff5, 1);
    nova.fillRect(14, 20, 4, 3);
    // Boots
    nova.fillStyle(0xeeeeee, 1);
    nova.fillRect(8, 26, 6, 6);
    nova.fillRect(18, 26, 6, 6);
    nova.generateTexture('player_nova', 32, 32);
    nova.generateTexture('player', 32, 32); // Backward compatibility alias
    nova.destroy();

    // ZENITH: Aerial Specialist (Emerald / Slate / Winged Thrusters)
    const zenith = this.make.graphics({ x: 0, y: 0, add: false });
    // Streamlined Sleek Torso
    zenith.fillStyle(0x1e293b, 1);
    zenith.fillRoundedRect(8, 13, 16, 13, 3);
    // Aerodynamic Helmet
    zenith.fillStyle(0x10b981, 1);
    zenith.fillCircle(16, 8, 6);
    // Swept Visor
    zenith.fillStyle(0xa7f3d0, 1);
    zenith.fillRect(17, 6, 8, 4);
    // Dual Winglet Jetpack
    zenith.fillStyle(0x059669, 1);
    zenith.fillTriangle(2, 10, 6, 15, 6, 22);
    zenith.fillStyle(0x34d399, 1);
    zenith.fillRect(4, 22, 3, 4);
    // Core Battery
    zenith.fillStyle(0x6ee7b7, 1);
    zenith.fillCircle(16, 20, 2);
    // Lightweight Boots
    zenith.fillStyle(0x94a3b8, 1);
    zenith.fillRect(9, 26, 5, 6);
    zenith.fillRect(18, 26, 5, 6);
    zenith.generateTexture('player_zenith', 32, 32);
    zenith.destroy();

    // ATLAS: Heavy Exo-Suit (Crimson / Titanium / Reinforced Plating)
    const atlas = this.make.graphics({ x: 0, y: 0, add: false });
    // Heavy Armored Torso
    atlas.fillStyle(0x334155, 1);
    atlas.fillRoundedRect(5, 11, 22, 16, 4);
    // Heavy Shoulder Pads
    atlas.fillStyle(0xd97706, 1);
    atlas.fillRect(3, 11, 5, 7);
    atlas.fillRect(24, 11, 5, 7);
    // Reinforced Helmet
    atlas.fillStyle(0xb91c1c, 1);
    atlas.fillRoundedRect(10, 3, 12, 10, 3);
    // Blast Visor
    atlas.fillStyle(0xfde047, 1);
    atlas.fillRect(15, 6, 7, 4);
    // Dual Exhaust Stacks
    atlas.fillStyle(0x78716c, 1);
    atlas.fillRect(6, 4, 3, 7);
    atlas.fillRect(23, 4, 3, 7);
    // Reactor Core
    atlas.fillStyle(0xf97316, 1);
    atlas.fillCircle(16, 20, 3);
    // Stomp Boots
    atlas.fillStyle(0x475569, 1);
    atlas.fillRect(7, 26, 7, 6);
    atlas.fillRect(18, 26, 7, 6);
    atlas.generateTexture('player_atlas', 32, 32);
    atlas.destroy();

    // LUMEN: Energy Specialist (Violet / Prismatic / Luminescent Aura)
    const lumen = this.make.graphics({ x: 0, y: 0, add: false });
    // Ambient Energy Halo
    lumen.fillStyle(0xc084fc, 0.3);
    lumen.fillCircle(16, 16, 14);
    // Sleek Robed Cyber-Suit
    lumen.fillStyle(0x4c1d95, 1);
    lumen.fillRoundedRect(8, 12, 16, 15, 3);
    // Crystalline Cowl/Helmet
    lumen.fillStyle(0x7c3aed, 1);
    lumen.fillCircle(16, 8, 7);
    // Prismatic Visor
    lumen.fillStyle(0xe879f9, 1);
    lumen.fillRect(16, 5, 8, 5);
    // Radiant Energy Conduit Spine
    lumen.fillStyle(0xa855f7, 1);
    lumen.fillRect(4, 14, 4, 10);
    lumen.fillStyle(0xf0abfc, 1);
    lumen.fillRect(5, 24, 2, 3);
    // Resonant Prism Core
    lumen.fillStyle(0xf472b6, 1);
    lumen.fillRect(14, 19, 4, 4);
    // Hover Boots
    lumen.fillStyle(0xd8b4fe, 1);
    lumen.fillRect(9, 26, 5, 6);
    lumen.fillRect(18, 26, 5, 6);
    lumen.generateTexture('player_lumen', 32, 32);
    lumen.destroy();

    // WYATT: Sheriff Star (Wild West Cowboy Marshal)
    const wyatt = this.make.graphics({ x: 0, y: 0, add: false });
    // Brown leather duster coat
    wyatt.fillStyle(0x78350f, 1);
    wyatt.fillRoundedRect(7, 13, 18, 13, 3);
    // Denim pants
    wyatt.fillStyle(0x1e3a8a, 1);
    wyatt.fillRect(9, 23, 14, 4);
    // Head & Face
    wyatt.fillStyle(0xfde047, 1);
    wyatt.fillCircle(16, 9, 6);
    // Stetson Cowboy Hat (Crown & Wide Brim)
    wyatt.fillStyle(0x854d0e, 1);
    wyatt.fillRoundedRect(10, 2, 12, 6, 2); // Crown
    wyatt.fillRoundedRect(6, 6, 20, 3, 1);  // Brim
    // Hat Band
    wyatt.fillStyle(0x18181b, 1);
    wyatt.fillRect(10, 6, 12, 1);
    // Golden 6-point Star Badge
    wyatt.fillStyle(0xfacc15, 1);
    wyatt.fillCircle(19, 16, 2.5);
    // Heavy Cowboy Boots with Spurs
    wyatt.fillStyle(0x451a03, 1);
    wyatt.fillRect(7, 26, 7, 6);
    wyatt.fillRect(18, 26, 7, 6);
    wyatt.fillStyle(0xfef08a, 1);
    wyatt.fillRect(6, 28, 2, 2); // Silver spur
    wyatt.generateTexture('player_sheriff', 32, 32);
    wyatt.destroy();

    // BILLY: Desperado Kid (Wild West Outlaw Bandit)
    const billy = this.make.graphics({ x: 0, y: 0, add: false });
    // Outlaw Poncho (Charcoal / Gold Trim)
    billy.fillStyle(0x292524, 1);
    billy.fillTriangle(6, 14, 26, 14, 16, 25);
    // Red Desert Bandana over face
    billy.fillStyle(0xef4444, 1);
    billy.fillTriangle(11, 10, 21, 10, 16, 16);
    // Wide Brim Outlaw Hat
    billy.fillStyle(0x1c1917, 1);
    billy.fillRoundedRect(11, 3, 10, 5, 2);
    billy.fillRoundedRect(5, 7, 22, 3, 1);
    // Dual Ammo Bandolier
    billy.fillStyle(0xd97706, 1);
    billy.fillRect(10, 15, 12, 2);
    // Quickdraw Holster
    billy.fillStyle(0x78350f, 1);
    billy.fillRect(21, 19, 4, 6);
    // Swift Outlaw Boots
    billy.fillStyle(0x44403c, 1);
    billy.fillRect(8, 26, 6, 6);
    billy.fillRect(18, 26, 6, 6);
    billy.generateTexture('player_outlaw', 32, 32);
    billy.destroy();
  }

  /* -------------------------------------------------------------
     2. THEMED ENVIRONMENT TILESETS
     ------------------------------------------------------------- */
  createPlatformTextures() {
    // THEME 1: FRONTIER (Sector 1 - Preserves base ground & platform)
    const groundG = this.make.graphics({ x: 0, y: 0, add: false });
    groundG.fillStyle(0x1a1a2e, 1);
    groundG.fillRect(0, 0, 32, 32);
    groundG.fillStyle(0x00adb5, 1);
    groundG.fillRect(0, 0, 32, 4);
    groundG.fillStyle(0x16213e, 1);
    groundG.fillRect(2, 6, 28, 24);
    groundG.fillStyle(0x00fff5, 0.6);
    groundG.fillRect(14, 16, 4, 4);
    groundG.generateTexture('ground', 32, 32);
    groundG.destroy();

    const platG = this.make.graphics({ x: 0, y: 0, add: false });
    platG.fillStyle(0x16213e, 1);
    platG.fillRoundedRect(0, 0, 96, 20, 4);
    platG.fillStyle(0x00fff5, 1);
    platG.fillRoundedRect(2, 1, 92, 4, 2);
    platG.fillStyle(0xe94560, 0.8);
    platG.fillRect(24, 16, 48, 3);
    platG.generateTexture('platform', 96, 20);
    platG.destroy();

    // THEME 2: MOONFALL STATION (Metallic / Industrial Plates)
    const stationG = this.make.graphics({ x: 0, y: 0, add: false });
    stationG.fillStyle(0x1e293b, 1);
    stationG.fillRect(0, 0, 32, 32);
    stationG.fillStyle(0x38bdf8, 1); // Cyan illuminated edge
    stationG.fillRect(0, 0, 32, 3);
    stationG.fillStyle(0x0f172a, 1);
    stationG.fillRect(3, 5, 26, 24);
    // Hex bolt details
    stationG.fillStyle(0x64748b, 1);
    stationG.fillRect(4, 6, 2, 2);
    stationG.fillRect(26, 6, 2, 2);
    stationG.fillRect(4, 26, 2, 2);
    stationG.fillRect(26, 26, 2, 2);
    stationG.generateTexture('ground_station', 32, 32);
    stationG.destroy();

    const platStationG = this.make.graphics({ x: 0, y: 0, add: false });
    platStationG.fillStyle(0x0f172a, 1);
    platStationG.fillRoundedRect(0, 0, 96, 20, 3);
    platStationG.fillStyle(0x0284c7, 1);
    platStationG.fillRect(0, 0, 96, 3);
    platStationG.fillStyle(0x38bdf8, 0.7);
    platStationG.fillRect(20, 16, 56, 2);
    platStationG.generateTexture('platform_station', 96, 20);
    platStationG.destroy();

    // THEME 3: NEBULA RIFT (Deep Violet Cosmic Rock / Bioluminescent)
    const nebulaG = this.make.graphics({ x: 0, y: 0, add: false });
    nebulaG.fillStyle(0x2e1065, 1);
    nebulaG.fillRect(0, 0, 32, 32);
    nebulaG.fillStyle(0xa855f7, 1);
    nebulaG.fillRect(0, 0, 32, 4);
    nebulaG.fillStyle(0x3b0764, 1);
    nebulaG.fillRect(2, 6, 28, 24);
    // Bioluminescent crystal specks
    nebulaG.fillStyle(0x06b6d4, 0.9);
    nebulaG.fillRect(8, 14, 3, 3);
    nebulaG.fillRect(22, 20, 3, 3);
    nebulaG.generateTexture('ground_nebula', 32, 32);
    nebulaG.destroy();

    const platNebulaG = this.make.graphics({ x: 0, y: 0, add: false });
    platNebulaG.fillStyle(0x3b0764, 1);
    platNebulaG.fillRoundedRect(0, 0, 96, 20, 4);
    platNebulaG.fillStyle(0xc084fc, 1);
    platNebulaG.fillRect(0, 0, 96, 3);
    platNebulaG.fillStyle(0x06b6d4, 0.8);
    platNebulaG.fillRect(30, 16, 36, 2);
    platNebulaG.generateTexture('platform_nebula', 96, 20);
    platNebulaG.destroy();

    // THEME 4: EMBER CRATER (Volcanic Obsidian / Magma Crust)
    const volcanicG = this.make.graphics({ x: 0, y: 0, add: false });
    volcanicG.fillStyle(0x18181b, 1);
    volcanicG.fillRect(0, 0, 32, 32);
    volcanicG.fillStyle(0xf97316, 1); // Scorching molten edge
    volcanicG.fillRect(0, 0, 32, 4);
    volcanicG.fillStyle(0x27272a, 1);
    volcanicG.fillRect(2, 6, 28, 24);
    // Glowing lava fracture line
    volcanicG.fillStyle(0xef4444, 0.9);
    volcanicG.fillRect(6, 16, 20, 2);
    volcanicG.fillStyle(0xfacc15, 1);
    volcanicG.fillRect(12, 15, 6, 4);
    volcanicG.generateTexture('ground_volcanic', 32, 32);
    volcanicG.destroy();

    const platVolcanicG = this.make.graphics({ x: 0, y: 0, add: false });
    platVolcanicG.fillStyle(0x18181b, 1);
    platVolcanicG.fillRoundedRect(0, 0, 96, 20, 3);
    platVolcanicG.fillStyle(0xf97316, 1);
    platVolcanicG.fillRect(0, 0, 96, 3);
    platVolcanicG.fillStyle(0xdc2626, 0.85);
    platVolcanicG.fillRect(20, 16, 56, 2);
    platVolcanicG.generateTexture('platform_volcanic', 96, 20);
    platVolcanicG.destroy();

    // THEME 5: ZENITH RUINS (Ancient Celestial Stone / Gold-Inlaid Glyphs)
    const ruinsG = this.make.graphics({ x: 0, y: 0, add: false });
    ruinsG.fillStyle(0x0f172a, 1);
    ruinsG.fillRect(0, 0, 32, 32);
    ruinsG.fillStyle(0xf59e0b, 1); // Gold celestial inlay
    ruinsG.fillRect(0, 0, 32, 4);
    ruinsG.fillStyle(0x1e293b, 1);
    ruinsG.fillRect(3, 6, 26, 23);
    // Ancient runic glyph
    ruinsG.lineStyle(1, 0x38bdf8, 0.9);
    ruinsG.strokeRect(10, 12, 12, 12);
    ruinsG.fillStyle(0xfbbf24, 0.9);
    ruinsG.fillRect(14, 16, 4, 4);
    ruinsG.generateTexture('ground_ruins', 32, 32);
    ruinsG.destroy();

    const platRuinsG = this.make.graphics({ x: 0, y: 0, add: false });
    platRuinsG.fillStyle(0x1e293b, 1);
    platRuinsG.fillRoundedRect(0, 0, 96, 20, 4);
    platRuinsG.fillStyle(0xf59e0b, 1);
    platRuinsG.fillRect(0, 0, 96, 3);
    platRuinsG.fillStyle(0x38bdf8, 0.85);
    platRuinsG.fillRect(24, 16, 48, 2);
    platRuinsG.generateTexture('platform_ruins', 96, 20);
    platRuinsG.destroy();

    // THEME 6: DUST DEVIL CANYON (Warm Terracotta Sandstone & Saloon Wood)
    const desertG = this.make.graphics({ x: 0, y: 0, add: false });
    desertG.fillStyle(0x9a3412, 1);
    desertG.fillRect(0, 0, 32, 32);
    desertG.fillStyle(0xf59e0b, 1); // Sunlit sandstone crest
    desertG.fillRect(0, 0, 32, 4);
    desertG.fillStyle(0x7c2d12, 1);
    desertG.fillRect(2, 6, 28, 24);
    // Desert strata lines
    desertG.fillStyle(0xc2410c, 1);
    desertG.fillRect(4, 12, 24, 2);
    desertG.fillRect(4, 20, 24, 2);
    desertG.generateTexture('ground_desert', 32, 32);
    desertG.destroy();

    const platDesertG = this.make.graphics({ x: 0, y: 0, add: false });
    platDesertG.fillStyle(0x7c2d12, 1);
    platDesertG.fillRoundedRect(0, 0, 96, 20, 4);
    platDesertG.fillStyle(0xf59e0b, 1);
    platDesertG.fillRect(0, 0, 96, 3);
    platDesertG.fillStyle(0xd97706, 0.8);
    platDesertG.fillRect(16, 15, 64, 2);
    platDesertG.generateTexture('platform_desert', 96, 20);
    platDesertG.destroy();

    // Wooden Saloon / Mine Scaffold
    const platWoodG = this.make.graphics({ x: 0, y: 0, add: false });
    platWoodG.fillStyle(0x78350f, 1);
    platWoodG.fillRoundedRect(0, 0, 96, 20, 3);
    platWoodG.fillStyle(0xb45309, 1);
    platWoodG.fillRect(0, 0, 96, 3);
    // Wood grain planks & iron nail studs
    platWoodG.fillStyle(0x451a03, 1);
    platWoodG.fillRect(32, 3, 2, 17);
    platWoodG.fillRect(64, 3, 2, 17);
    platWoodG.fillStyle(0xd1d5db, 1);
    platWoodG.fillRect(10, 8, 2, 2);
    platWoodG.fillRect(50, 8, 2, 2);
    platWoodG.fillRect(80, 8, 2, 2);
    platWoodG.generateTexture('platform_wood', 96, 20);
    platWoodG.destroy();

    // Cactus Hazard (32x32)
    const cactusG = this.make.graphics({ x: 0, y: 0, add: false });
    cactusG.fillStyle(0x15803d, 1);
    cactusG.fillRoundedRect(12, 4, 8, 28, 3); // Main trunk
    // Left branch
    cactusG.fillRect(4, 12, 10, 5);
    cactusG.fillRoundedRect(4, 6, 5, 11, 2);
    // Right branch
    cactusG.fillRect(18, 16, 10, 5);
    cactusG.fillRoundedRect(23, 10, 5, 11, 2);
    // Prickly needles
    cactusG.fillStyle(0xfef08a, 1);
    cactusG.fillRect(2, 8, 2, 2);
    cactusG.fillRect(28, 12, 2, 2);
    cactusG.fillRect(10, 24, 2, 2);
    cactusG.fillRect(20, 22, 2, 2);
    cactusG.generateTexture('cactus_hazard', 32, 32);
    cactusG.destroy();
  }

  /* -------------------------------------------------------------
     3. MULTI-LAYER PARALLAX BACKGROUND TEXTURES
     ------------------------------------------------------------- */
  createParallaxTextures() {
    // Default background (retained for backward compatibility)
    this.createBackgroundTexture();

    // Layer 1: Stars (800x450)
    const starsG = this.make.graphics({ x: 0, y: 0, add: false });
    starsG.fillStyle(0x000000, 0); // Transparent base
    starsG.fillRect(0, 0, 800, 450);
    for (let i = 0; i < 140; i++) {
      const x = (i * 97 + 23) % 800;
      const y = (i * 53 + 17) % 450;
      const alpha = ((i % 6) + 3) / 10;
      const size = (i % 9 === 0) ? 2.5 : ((i % 4 === 0) ? 2 : 1);
      const color = (i % 7 === 0) ? 0x00f0ff : ((i % 5 === 0) ? 0xffdd44 : 0xffffff);
      starsG.fillStyle(color, alpha);
      starsG.fillRect(x, y, size, size);
    }
    starsG.generateTexture('bg_layer_stars', 800, 450);
    starsG.destroy();

    // Layer 2: Cosmic Nebula Clouds (800x450)
    const nebulaG = this.make.graphics({ x: 0, y: 0, add: false });
    nebulaG.fillStyle(0x000000, 0);
    nebulaG.fillRect(0, 0, 800, 450);
    // Draw soft atmospheric cloud bands
    for (let b = 0; b < 6; b++) {
      const cx = (b * 160 + 80) % 800;
      const cy = 120 + (b * 40) % 200;
      const rad = 110 + (b * 15);
      const col = (b % 2 === 0) ? 0x3b0764 : 0x0369a1;
      nebulaG.fillStyle(col, 0.28);
      nebulaG.fillCircle(cx, cy, rad);
    }
    nebulaG.generateTexture('bg_layer_nebula', 800, 450);
    nebulaG.destroy();

    // Layer 3: Celestial Bodies (Giant Moon & Gas Giant) (800x450)
    const celG = this.make.graphics({ x: 0, y: 0, add: false });
    celG.fillStyle(0x000000, 0);
    celG.fillRect(0, 0, 800, 450);
    // Ringed Gas Giant (Center right)
    celG.fillStyle(0x0284c7, 0.4);
    celG.fillCircle(620, 110, 42);
    celG.fillStyle(0x38bdf8, 0.7);
    celG.fillCircle(620, 110, 36);
    // Ring
    celG.lineStyle(3, 0x7dd3fc, 0.6);
    celG.strokeEllipse(620, 110, 68, 14);
    // Distant Crystalline Moon (Top left)
    celG.fillStyle(0xf59e0b, 0.35);
    celG.fillCircle(180, 85, 24);
    celG.fillStyle(0xfde68a, 0.6);
    celG.fillCircle(180, 85, 18);
    celG.generateTexture('bg_layer_celestial', 800, 450);
    celG.destroy();

    // Layer 4: Distant Spires / Skyline (800x450)
    const structG = this.make.graphics({ x: 0, y: 0, add: false });
    structG.fillStyle(0x000000, 0);
    structG.fillRect(0, 0, 800, 450);
    // Silhouette spires
    structG.fillStyle(0x0f172a, 0.65);
    const spireHeights = [90, 140, 75, 120, 60, 160, 110, 80];
    for (let s = 0; s < spireHeights.length; s++) {
      const sx = s * 105;
      const sh = spireHeights[s];
      structG.fillRect(sx, 450 - sh, 55, sh);
      // Spire antenna
      structG.lineStyle(2, 0x00f0ff, 0.7);
      structG.lineBetween(sx + 27, 450 - sh, sx + 27, 450 - sh - 18);
      structG.fillStyle(0xef4444, 0.8);
      structG.fillRect(sx + 26, 450 - sh - 20, 3, 3); // Beacon blinking light
    }
    structG.generateTexture('bg_layer_structures', 800, 450);
    structG.destroy();

    // Layer 5: Atmospheric Dust & Cyber Grid (800x450)
    const dustG = this.make.graphics({ x: 0, y: 0, add: false });
    dustG.fillStyle(0x000000, 0);
    dustG.fillRect(0, 0, 800, 450);
    // Cyber grid lines
    dustG.lineStyle(1, 0x1e293b, 0.35);
    for (let x = 0; x < 800; x += 40) {
      dustG.lineBetween(x, 0, x, 450);
    }
    for (let y = 0; y < 450; y += 40) {
      dustG.lineBetween(0, y, 800, y);
    }
    // Atmospheric glowing dust specks
    for (let d = 0; d < 35; d++) {
      const dx = (d * 83 + 15) % 800;
      const dy = (d * 61 + 9) % 450;
      dustG.fillStyle(0x38bdf8, 0.3);
      dustG.fillCircle(dx, dy, 2);
    }
    dustG.generateTexture('bg_layer_dust', 800, 450);
    dustG.destroy();
  }

  createBackgroundTexture() {
    const bgG = this.make.graphics({ x: 0, y: 0, add: false });
    bgG.fillStyle(0x0a0b18, 1);
    bgG.fillRect(0, 0, 800, 450);

    for (let i = 0; i < 90; i++) {
      const x = (i * 73 + 19) % 800;
      const y = (i * 47 + 11) % 450;
      const alpha = ((i % 5) + 3) / 10;
      const size = (i % 7 === 0) ? 2 : 1;
      bgG.fillStyle(0xffffff, alpha);
      bgG.fillRect(x, y, size, size);
    }

    bgG.lineStyle(1, 0x1f244a, 0.4);
    for (let x = 0; x < 800; x += 40) {
      bgG.lineBetween(x, 0, x, 450);
    }
    for (let y = 0; y < 450; y += 40) {
      bgG.lineBetween(0, y, 800, y);
    }

    bgG.generateTexture('background', 800, 450);
    bgG.destroy();
  }

  /* -------------------------------------------------------------
     4. LEVEL OBJECTS & COLLECTIBLE TEXTURES
     ------------------------------------------------------------- */
  createGoalMarkerTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x1e293b, 1);
    g.fillRect(8, 54, 16, 10);
    g.fillStyle(0x00f0ff, 1);
    g.fillRect(14, 16, 4, 38);
    // Hologram diamond
    g.fillStyle(0xffdd44, 1);
    g.beginPath();
    g.moveTo(16, 2);
    g.lineTo(24, 12);
    g.lineTo(16, 22);
    g.lineTo(8, 12);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 12, 3);
    g.generateTexture('goal_marker', 32, 64);
    g.destroy();
  }

  createStartPadTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0284c7, 0.4);
    g.fillRoundedRect(0, 0, 48, 8, 3);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(8, 2, 32, 4);
    g.generateTexture('start_pad', 48, 8);
    g.destroy();
  }

  createCrystalTextures() {
    // 1. Standard Star Crystal (20x24 Cyan/Gold)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00f0ff, 0.4);
    g.fillCircle(10, 12, 9);
    g.fillStyle(0x00d2ff, 1);
    g.beginPath();
    g.moveTo(10, 2);
    g.lineTo(18, 12);
    g.lineTo(10, 22);
    g.lineTo(2, 12);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffdd44, 0.9);
    g.beginPath();
    g.moveTo(10, 5);
    g.lineTo(15, 12);
    g.lineTo(10, 19);
    g.lineTo(8, 12);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 10, 2);
    g.generateTexture('star_crystal', 20, 24);
    g.destroy();

    // 2. Ancient Star Shard (24x28 Prismatic Gold/Amber relic)
    const ag = this.make.graphics({ x: 0, y: 0, add: false });
    ag.fillStyle(0xf59e0b, 0.45);
    ag.fillCircle(12, 14, 11);
    ag.fillStyle(0xfbbf24, 1);
    ag.beginPath();
    ag.moveTo(12, 2);
    ag.lineTo(22, 14);
    ag.lineTo(12, 26);
    ag.lineTo(2, 14);
    ag.closePath();
    ag.fillPath();
    ag.fillStyle(0xffffff, 0.95);
    ag.fillCircle(12, 12, 3);
    ag.generateTexture('crystal_ancient', 24, 28);
    ag.destroy();
  }

  /* -------------------------------------------------------------
     5. EXPANDED ENEMIES ROSTER
     ------------------------------------------------------------- */
  createEnemyTextures() {
    // 1. Drifter Drone (24x22 Hovering Scout - Retained)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(0, 7, 5, 10, 2);
    g.fillRoundedRect(19, 7, 5, 10, 2);
    g.fillStyle(0xf97316, 1);
    g.fillRect(1, 17, 3, 2);
    g.fillRect(20, 17, 3, 2);
    g.fillStyle(0x334155, 1);
    g.fillCircle(12, 11, 8);
    g.fillStyle(0x64748b, 1);
    g.fillRect(6, 4, 12, 4);
    g.fillStyle(0xdc2626, 1);
    g.fillCircle(12, 11, 4);
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(12, 11, 2);
    g.generateTexture('drifter_drone', 24, 22);
    g.destroy();

    // 2. Void Crawler (26x18 Ground Arthropod)
    const vc = this.make.graphics({ x: 0, y: 0, add: false });
    // Carapace
    vc.fillStyle(0x4c1d95, 1);
    vc.fillRoundedRect(4, 3, 18, 11, 3);
    // Glowing sensor slit
    vc.fillStyle(0xa855f7, 1);
    vc.fillRect(14, 6, 6, 3);
    // Crawler limbs
    vc.fillStyle(0x6b21a8, 1);
    vc.fillRect(2, 12, 4, 6);
    vc.fillRect(8, 13, 3, 5);
    vc.fillRect(16, 13, 3, 5);
    vc.fillRect(21, 12, 4, 6);
    vc.generateTexture('void_crawler', 26, 18);
    vc.destroy();

    // 3. Orbital Sentinel (28x26 Disc Flying Scout)
    const os = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer rotating disc armor
    os.fillStyle(0x1e293b, 1);
    os.fillCircle(14, 13, 11);
    // Cyan shield perimeter
    os.lineStyle(2, 0x06b6d4, 0.9);
    os.strokeCircle(14, 13, 11);
    // Core lens
    os.fillStyle(0x0f172a, 1);
    os.fillCircle(14, 13, 6);
    os.fillStyle(0x00f0ff, 1);
    os.fillCircle(14, 13, 3.5);
    os.generateTexture('orbital_sentinel', 28, 26);
    os.destroy();

    // 4. Rift Hopper (22x24 Spring Leaper)
    const rh = this.make.graphics({ x: 0, y: 0, add: false });
    // Spring legs
    rh.fillStyle(0xd97706, 1);
    rh.fillTriangle(4, 22, 11, 12, 8, 22);
    rh.fillTriangle(18, 22, 11, 12, 14, 22);
    // Head / Body
    rh.fillStyle(0x78350f, 1);
    rh.fillRoundedRect(5, 4, 12, 10, 3);
    // Amber ocular
    rh.fillStyle(0xfde047, 1);
    rh.fillRect(11, 6, 5, 4);
    rh.generateTexture('rift_hopper', 22, 24);
    rh.destroy();

    // 5. Nebula Wisp (24x24 Pulsating Cosmic Hazard)
    const nw = this.make.graphics({ x: 0, y: 0, add: false });
    nw.fillStyle(0xa855f7, 0.35);
    nw.fillCircle(12, 12, 11);
    nw.fillStyle(0xc084fc, 0.85);
    nw.fillCircle(12, 12, 6);
    nw.fillStyle(0xffffff, 1);
    nw.fillCircle(12, 12, 2.5);
    nw.generateTexture('nebula_wisp', 24, 24);
    nw.destroy();

    // 6. Gunslinger Bandit (24x26 Wild West Pistol Robot)
    const gs = this.make.graphics({ x: 0, y: 0, add: false });
    // Cyber Chassis
    gs.fillStyle(0x334155, 1);
    gs.fillRoundedRect(5, 8, 14, 14, 2);
    // Bowler / Cowboy Stetson Hat
    gs.fillStyle(0x1e293b, 1);
    gs.fillRoundedRect(7, 2, 10, 6, 2);
    gs.fillRoundedRect(3, 6, 18, 3, 1);
    // Glowing Crimson Crosshair Visor
    gs.fillStyle(0xef4444, 1);
    gs.fillCircle(12, 12, 3.5);
    gs.fillStyle(0xfef08a, 1);
    gs.fillCircle(12, 12, 1.5);
    // Revolver Pistol Arm
    gs.fillStyle(0x64748b, 1);
    gs.fillRect(18, 13, 6, 3);
    gs.fillRect(20, 16, 2, 3);
    gs.generateTexture('gunslinger', 24, 26);
    gs.destroy();

    // 7. Dynamite Bandit (24x26 Wild West Prospector Robot)
    const db = this.make.graphics({ x: 0, y: 0, add: false });
    // Heavy Duster / Miner Rig
    db.fillStyle(0x78350f, 1);
    db.fillRoundedRect(5, 8, 14, 14, 2);
    // Miner Hardhat with Glowing Headlamp
    db.fillStyle(0xd97706, 1);
    db.fillRoundedRect(6, 2, 12, 6, 2);
    db.fillStyle(0xfde047, 1);
    db.fillCircle(12, 5, 2.5);
    // Backpack with Dynamite Sticks
    db.fillStyle(0xdc2626, 1);
    db.fillRect(1, 9, 4, 8);
    // Raised Hand holding Lit Dynamite Stick
    db.fillStyle(0xdc2626, 1);
    db.fillRect(18, 4, 4, 8);
    // Sparking Fuse Tip
    db.fillStyle(0xfacc15, 1);
    db.fillCircle(20, 2, 2);
    db.generateTexture('dynamite_bandit', 24, 26);
    db.destroy();

    // 8. Bullet Projectile (12x6 Glowing Slug)
    const bp = this.make.graphics({ x: 0, y: 0, add: false });
    bp.fillStyle(0xfde047, 1);
    bp.fillRoundedRect(2, 1, 8, 4, 2);
    bp.fillStyle(0xffffff, 1);
    bp.fillRect(3, 2, 4, 2);
    bp.fillStyle(0xf59e0b, 0.6);
    bp.fillRect(0, 1, 3, 4);
    bp.generateTexture('bullet', 12, 6);
    bp.destroy();

    // 9. Dynamite Projectile (14x14 Stick with Fuse)
    const dyn = this.make.graphics({ x: 0, y: 0, add: false });
    // Red dynamite stick body
    dyn.fillStyle(0xdc2626, 1);
    dyn.fillRoundedRect(3, 4, 8, 8, 1);
    // White label band
    dyn.fillStyle(0xffffff, 1);
    dyn.fillRect(3, 7, 8, 2);
    // Copper fuse wire & spark
    dyn.lineStyle(1.5, 0xd97706, 1);
    dyn.beginPath();
    dyn.moveTo(7, 4);
    dyn.lineTo(9, 1);
    dyn.strokePath();
    dyn.fillStyle(0xfacc15, 1);
    dyn.fillCircle(9, 1, 1.5);
    dyn.generateTexture('dynamite', 14, 14);
    dyn.destroy();
  }

  /* -------------------------------------------------------------
     6. EXPANDED POWER-UPS ROSTER
     ------------------------------------------------------------- */
  createPowerUpTextures() {
    // 1. Aegis Core (Retained)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00f0ff, 0.35);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0x0284c7, 0.9);
    g.beginPath();
    g.moveTo(12, 2);
    g.lineTo(21, 7);
    g.lineTo(21, 17);
    g.lineTo(12, 22);
    g.lineTo(3, 17);
    g.lineTo(3, 7);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x38bdf8, 1);
    g.beginPath();
    g.moveTo(12, 5);
    g.lineTo(18, 9);
    g.lineTo(18, 15);
    g.lineTo(12, 19);
    g.lineTo(6, 15);
    g.lineTo(6, 9);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(12, 12, 3);
    g.fillStyle(0xffdd44, 0.9);
    g.fillCircle(12, 12, 1.5);
    g.generateTexture('powerup_aegis', 24, 24);
    g.destroy();

    // 2. Nova Burst (24x24 Explosive Radial Flare)
    const nb = this.make.graphics({ x: 0, y: 0, add: false });
    nb.fillStyle(0xf43f5e, 0.4);
    nb.fillCircle(12, 12, 11);
    nb.fillStyle(0xe11d48, 1);
    nb.fillCircle(12, 12, 7);
    nb.fillStyle(0xfbbf24, 1);
    nb.fillRect(9, 9, 6, 6);
    nb.fillStyle(0xffffff, 1);
    nb.fillCircle(12, 12, 2);
    nb.generateTexture('powerup_novaburst', 24, 24);
    nb.destroy();

    // 3. Gravity Shift (24x24 Anti-Gravity Vortex)
    const gs = this.make.graphics({ x: 0, y: 0, add: false });
    gs.fillStyle(0x8b5cf6, 0.4);
    gs.fillCircle(12, 12, 11);
    gs.fillStyle(0x7c3aed, 1);
    gs.fillCircle(12, 12, 8);
    // Upward arrow glyph
    gs.fillStyle(0xffffff, 1);
    gs.fillTriangle(12, 4, 18, 12, 6, 12);
    gs.fillRect(10, 12, 4, 7);
    gs.generateTexture('powerup_gravity', 24, 24);
    gs.destroy();

    // 4. Chrono Core (24x24 Temporal Dial)
    const cc = this.make.graphics({ x: 0, y: 0, add: false });
    cc.fillStyle(0x10b981, 0.4);
    cc.fillCircle(12, 12, 11);
    cc.fillStyle(0x059669, 1);
    cc.fillCircle(12, 12, 8);
    // Clock hands
    cc.lineStyle(2, 0xffffff, 1);
    cc.lineBetween(12, 12, 12, 6);
    cc.lineBetween(12, 12, 16, 12);
    cc.generateTexture('powerup_chrono', 24, 24);
    cc.destroy();

    // 5. Star Surge (24x24 Multiplier Supernova)
    const ss = this.make.graphics({ x: 0, y: 0, add: false });
    ss.fillStyle(0xf59e0b, 0.45);
    ss.fillCircle(12, 12, 11);
    ss.fillStyle(0xfbbf24, 1);
    ss.beginPath();
    ss.moveTo(12, 2);
    ss.lineTo(16, 8);
    ss.lineTo(22, 12);
    ss.lineTo(16, 16);
    ss.lineTo(12, 22);
    ss.lineTo(8, 16);
    ss.lineTo(2, 12);
    ss.lineTo(8, 8);
    ss.closePath();
    ss.fillPath();
    ss.fillStyle(0xffffff, 1);
    ss.fillCircle(12, 12, 3);
    ss.generateTexture('powerup_starsurge', 24, 24);
    ss.destroy();
  }

  createShieldAuraTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00f0ff, 0.25);
    g.fillCircle(20, 20, 18);
    g.lineStyle(2, 0x38bdf8, 0.85);
    g.strokeCircle(20, 20, 18);
    g.lineStyle(1, 0xffffff, 0.6);
    g.strokeCircle(20, 20, 14);
    g.generateTexture('player_shield_aura', 40, 40);
    g.destroy();
  }

  /* -------------------------------------------------------------
     7. INTERACTIVE MECHANICS & HAZARDS
     ------------------------------------------------------------- */
  createMechanicsTextures() {
    // 1. Moving Platform (96x20 with directional kinetic thrusters)
    const mp = this.make.graphics({ x: 0, y: 0, add: false });
    mp.fillStyle(0x1e293b, 1);
    mp.fillRoundedRect(0, 0, 96, 20, 4);
    mp.fillStyle(0xf59e0b, 1); // Amber kinetic strip
    mp.fillRect(0, 0, 96, 3);
    // Kinetic chevron arrows
    mp.fillStyle(0xfbbf24, 0.9);
    mp.fillTriangle(20, 10, 26, 6, 26, 14);
    mp.fillTriangle(76, 10, 70, 6, 70, 14);
    mp.generateTexture('moving_platform', 96, 20);
    mp.destroy();

    // 2. Falling Platform (96x20 with stress fracture lines)
    const fp = this.make.graphics({ x: 0, y: 0, add: false });
    fp.fillStyle(0x292524, 1);
    fp.fillRoundedRect(0, 0, 96, 20, 3);
    fp.fillStyle(0xf87171, 0.9); // Warning red rim
    fp.fillRect(0, 0, 96, 2);
    // Cracking fault lines
    fp.lineStyle(1, 0xef4444, 0.8);
    fp.lineBetween(24, 3, 30, 17);
    fp.lineBetween(65, 3, 60, 17);
    fp.generateTexture('falling_platform', 96, 20);
    fp.destroy();

    // 3. Launch Pad (36x14 Spring / Thruster Pad)
    const lp = this.make.graphics({ x: 0, y: 0, add: false });
    lp.fillStyle(0x0f172a, 1);
    lp.fillRect(2, 8, 32, 6);
    // Glowing spring coils
    lp.fillStyle(0x00f0ff, 1);
    lp.fillRoundedRect(4, 2, 28, 6, 2);
    lp.fillStyle(0xffffff, 1);
    lp.fillRect(14, 0, 8, 3);
    lp.generateTexture('launch_pad', 36, 14);
    lp.destroy();

    // 4. Energy Gate Barrier (16x64 Laser Grid)
    const eg = this.make.graphics({ x: 0, y: 0, add: false });
    // Top & bottom emitters
    eg.fillStyle(0x334155, 1);
    eg.fillRect(0, 0, 16, 8);
    eg.fillRect(0, 56, 16, 8);
    // Pulsing central laser beam
    eg.fillStyle(0x00f0ff, 0.85);
    eg.fillRect(6, 8, 4, 48);
    eg.fillStyle(0xffffff, 1);
    eg.fillRect(7, 8, 2, 48);
    eg.generateTexture('energy_gate', 16, 64);
    eg.destroy();

    // 5. Hazard Plasma / Lava (32x20 Surface Hazard)
    const hz = this.make.graphics({ x: 0, y: 0, add: false });
    hz.fillStyle(0xef4444, 0.9);
    hz.fillRect(0, 6, 32, 14);
    hz.fillStyle(0xfacc15, 1);
    // Bubbles
    hz.fillCircle(8, 6, 4);
    hz.fillCircle(24, 6, 4);
    hz.generateTexture('hazard_lava', 32, 20);
    hz.destroy();

    // 6. Gravity Zone Trigger Texture (64x64 Low-Gravity Vortex FX)
    const gz = this.make.graphics({ x: 0, y: 0, add: false });
    gz.fillStyle(0x8b5cf6, 0.18);
    gz.fillRect(0, 0, 64, 64);
    gz.lineStyle(1, 0xc084fc, 0.5);
    gz.strokeRect(0, 0, 64, 64);
    // Floating upward particles
    gz.fillStyle(0xe879f9, 0.8);
    gz.fillRect(16, 40, 3, 3);
    gz.fillRect(44, 20, 3, 3);
    gz.fillRect(28, 10, 2, 2);
    gz.generateTexture('gravity_zone_fx', 64, 64);
    gz.destroy();
  }

  /* -------------------------------------------------------------
     8. ENVIRONMENTAL STORYTELLING & DECOR
     ------------------------------------------------------------- */
  createDecorTextures() {
    // Holographic Terminal Sign (24x32)
    const hs = this.make.graphics({ x: 0, y: 0, add: false });
    hs.fillStyle(0x1e293b, 1);
    hs.fillRect(10, 22, 4, 10);
    hs.fillStyle(0x0284c7, 0.8);
    hs.fillRoundedRect(2, 2, 20, 20, 2);
    hs.lineStyle(1, 0x38bdf8, 1);
    hs.strokeRoundedRect(2, 2, 20, 20, 2);
    // Terminal text lines
    hs.fillStyle(0x00f0ff, 0.9);
    hs.fillRect(5, 6, 14, 2);
    hs.fillRect(5, 11, 10, 2);
    hs.fillRect(5, 16, 12, 2);
    hs.generateTexture('holo_sign', 24, 32);
    hs.destroy();

    // Conduit Pipe Section (32x12)
    const pipe = this.make.graphics({ x: 0, y: 0, add: false });
    pipe.fillStyle(0x334155, 1);
    pipe.fillRect(0, 2, 32, 8);
    pipe.fillStyle(0x64748b, 1);
    pipe.fillRect(4, 0, 4, 12);
    pipe.fillRect(24, 0, 4, 12);
    pipe.fillStyle(0x00f0ff, 0.7);
    pipe.fillRect(0, 5, 32, 2);
    pipe.generateTexture('pipe_station', 32, 12);
    pipe.destroy();

    // Ancient Star Shard (20x24 Iridescent Cosmic Shard)
    const as = this.make.graphics({ x: 0, y: 0, add: false });
    as.fillStyle(0xd946ef, 0.5);
    as.fillCircle(10, 12, 9);
    as.fillStyle(0xfbbf24, 1);
    as.beginPath();
    as.moveTo(10, 2);
    as.lineTo(18, 12);
    as.lineTo(10, 22);
    as.lineTo(2, 12);
    as.closePath();
    as.fillPath();
    as.fillStyle(0xffffff, 1);
    as.beginPath();
    as.moveTo(10, 6);
    as.lineTo(14, 12);
    as.lineTo(10, 18);
    as.lineTo(6, 12);
    as.closePath();
    as.fillPath();
    as.generateTexture('crystal_ancient', 20, 24);
    as.destroy();
  }

  /* -------------------------------------------------------------
     9. COSMETIC OUTFITS & SKINS
     ------------------------------------------------------------- */
  createOutfitTextures() {
    const characters = ['nova', 'zenith', 'atlas', 'lumen'];
    const outfitThemes = {
      solar_flare: {
        torso: 0xe11d48,
        helmet: 0xf59e0b,
        visor: 0xfef08a,
        core: 0xf97316,
        pack: 0x991b1b,
        boots: 0xfbbf24
      },
      cyber_void: {
        torso: 0x09090b,
        helmet: 0x581c87,
        visor: 0x22d3ee,
        core: 0xa855f7,
        pack: 0x3b0764,
        boots: 0x7c3aed
      },
      neon_pulse: {
        torso: 0x06b6d4,
        helmet: 0x4c1d95,
        visor: 0xf43f5e,
        core: 0xec4899,
        pack: 0x8b5cf6,
        boots: 0x00fff5
      },
      stellar_gold: {
        torso: 0xf8fafc,
        helmet: 0xf59e0b,
        visor: 0x38bdf8,
        core: 0xffffff,
        pack: 0xd97706,
        boots: 0xfacc15
      }
    };

    characters.forEach(char => {
      Object.keys(outfitThemes).forEach(outfitKey => {
        const theme = outfitThemes[outfitKey];
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Base Torso
        g.fillStyle(theme.torso, 1);
        g.fillRoundedRect(7, 12, 18, 14, 3);

        // Helmet
        g.fillStyle(theme.helmet, 1);
        g.fillCircle(16, 8, char === 'atlas' ? 8 : 7);

        // Visor
        g.fillStyle(theme.visor, 1);
        g.fillRect(15, 5, 9, 5);

        // Thruster Backpack
        g.fillStyle(theme.pack, 1);
        g.fillRect(char === 'zenith' ? 2 : 4, 13, char === 'zenith' ? 5 : 4, 10);
        g.fillStyle(theme.core, 1);
        g.fillRect(5, 23, 2, 3);

        // Center Energy Core
        g.fillStyle(theme.core, 1);
        g.fillRect(14, 20, 4, 3);

        // Boots
        g.fillStyle(theme.boots, 1);
        g.fillRect(8, 26, 6, 6);
        g.fillRect(18, 26, 6, 6);

        const texKey = `player_${char}_${outfitKey}`;
        g.generateTexture(texKey, 32, 32);
        g.destroy();
      });
    });
  }

  /* -------------------------------------------------------------
     10. COMPANION PETS
     ------------------------------------------------------------- */
  createPetTextures() {
    // 1. Cosmo the Stellar Pup (24x24)
    const cosmo = this.make.graphics({ x: 0, y: 0, add: false });
    // Star aura glow
    cosmo.fillStyle(0x38bdf8, 0.25);
    cosmo.fillCircle(12, 12, 11);
    // Pup Head & Body
    cosmo.fillStyle(0xf8fafc, 1);
    cosmo.fillCircle(11, 11, 6);
    cosmo.fillRoundedRect(7, 13, 10, 8, 3);
    // Glowing Cyan Ears
    cosmo.fillStyle(0x00f0ff, 1);
    cosmo.fillTriangle(6, 7, 9, 4, 10, 8);
    cosmo.fillTriangle(13, 8, 14, 4, 17, 7);
    // Amber Eyes & Muzzle
    cosmo.fillStyle(0x0f172a, 1);
    cosmo.fillCircle(13, 11, 1.5);
    cosmo.fillStyle(0x38bdf8, 1);
    cosmo.fillRect(14, 12, 3, 2);
    // Golden Collar
    cosmo.fillStyle(0xfbbf24, 1);
    cosmo.fillRect(8, 14, 7, 2);
    // Wagging tail with starlight
    cosmo.fillStyle(0x00f0ff, 1);
    cosmo.fillCircle(5, 17, 2.5);
    cosmo.generateTexture('pet_cosmo', 24, 24);
    cosmo.destroy();

    // 2. Orb-E Mini Drone (24x24)
    const orbe = this.make.graphics({ x: 0, y: 0, add: false });
    // Floating ring orbit
    orbe.lineStyle(1.5, 0x00f0ff, 0.85);
    orbe.strokeEllipse(12, 12, 10, 4);
    // Spherical Metallic Chassis
    orbe.fillStyle(0x1e293b, 1);
    orbe.fillCircle(12, 12, 7);
    // Ocular Cyan Lens
    orbe.fillStyle(0x00f0ff, 1);
    orbe.fillCircle(12, 12, 3.5);
    orbe.fillStyle(0xffffff, 1);
    orbe.fillCircle(13, 11, 1.5);
    // Top Micro Antenna & Blinking Beacon
    orbe.fillStyle(0x64748b, 1);
    orbe.fillRect(11, 3, 2, 3);
    orbe.fillStyle(0xef4444, 1);
    orbe.fillCircle(12, 3, 1.5);
    orbe.generateTexture('pet_orbe', 24, 24);
    orbe.destroy();

    // 3. Chrono-Sprite (24x24)
    const chrono = this.make.graphics({ x: 0, y: 0, add: false });
    // Ethereal emerald aura
    chrono.fillStyle(0x10b981, 0.3);
    chrono.fillCircle(12, 12, 11);
    chrono.fillStyle(0x34d399, 0.8);
    // Diamond Core
    chrono.beginPath();
    chrono.moveTo(12, 4);
    chrono.lineTo(19, 12);
    chrono.lineTo(12, 20);
    chrono.lineTo(5, 12);
    chrono.closePath();
    chrono.fillPath();
    // Inner starlight
    chrono.fillStyle(0xffffff, 1);
    chrono.fillCircle(12, 12, 3);
    // Clockwork ring dots
    chrono.fillStyle(0xfbbf24, 1);
    chrono.fillCircle(12, 2, 1.5);
    chrono.fillCircle(22, 12, 1.5);
    chrono.fillCircle(12, 22, 1.5);
    chrono.fillCircle(2, 12, 1.5);
    chrono.generateTexture('pet_chrono', 24, 24);
    chrono.destroy();

    // 4. Star-Kitten (24x24)
    const kitten = this.make.graphics({ x: 0, y: 0, add: false });
    // Bubble helmet dome
    kitten.fillStyle(0xf472b6, 0.35);
    kitten.fillCircle(12, 11, 8);
    kitten.lineStyle(1, 0xf472b6, 0.8);
    kitten.strokeCircle(12, 11, 8);
    // Kitten face
    kitten.fillStyle(0xfdf2f8, 1);
    kitten.fillCircle(12, 11, 5.5);
    // Pink kitten ears
    kitten.fillStyle(0xf472b6, 1);
    kitten.fillTriangle(7, 8, 9, 3, 11, 7);
    kitten.fillTriangle(13, 7, 15, 3, 17, 8);
    // Eyes & tiny nose
    kitten.fillStyle(0x831843, 1);
    kitten.fillCircle(10, 11, 1);
    kitten.fillCircle(14, 11, 1);
    kitten.fillStyle(0xf43f5e, 1);
    kitten.fillRect(11, 13, 2, 1);
    // Little body & star-tipped tail
    kitten.fillStyle(0xfbcfe8, 1);
    kitten.fillRoundedRect(8, 15, 8, 6, 2);
    kitten.fillStyle(0xfbbf24, 1);
    kitten.fillCircle(4, 18, 2);
    kitten.generateTexture('pet_starkitten', 24, 24);
    kitten.destroy();

    // 5. Mustang Spirit (Celestial Wild Horse - 24x24)
    const horse = this.make.graphics({ x: 0, y: 0, add: false });
    // Horse Body
    horse.fillStyle(0xb45309, 1);
    horse.fillRoundedRect(6, 10, 14, 9, 3);
    // Horse Neck & Head
    horse.fillRoundedRect(14, 4, 7, 10, 2);
    horse.fillRoundedRect(17, 3, 6, 5, 2); // Snout
    // White Muzzle
    horse.fillStyle(0xfef3c7, 1);
    horse.fillRect(21, 5, 2, 3);
    // Starlight Flowing Mane & Tail
    horse.fillStyle(0x00f0ff, 1);
    horse.fillRect(13, 2, 3, 7);
    horse.fillRect(2, 11, 5, 3); // Tail
    // Celestial Star on Flank
    horse.fillStyle(0xffffff, 1);
    horse.fillCircle(10, 14, 1.5);
    // Hooves
    horse.fillStyle(0x18181b, 1);
    horse.fillRect(7, 19, 3, 4);
    horse.fillRect(15, 19, 3, 4);
    horse.generateTexture('pet_horse', 24, 24);
    horse.destroy();

    // 6. Barnaby the Bear (Frontier Grizzly Cub - 24x24)
    const bear = this.make.graphics({ x: 0, y: 0, add: false });
    // Chubby Bear Body
    bear.fillStyle(0x78350f, 1);
    bear.fillCircle(12, 14, 8);
    // Round Head
    bear.fillCircle(12, 7, 6);
    // Round Ears
    bear.fillCircle(7, 3, 2.5);
    bear.fillCircle(17, 3, 2.5);
    bear.fillStyle(0xd97706, 1);
    bear.fillCircle(7, 3, 1.2);
    bear.fillCircle(17, 3, 1.2);
    // Tan Muzzle & Nose
    bear.fillStyle(0xfde047, 1);
    bear.fillCircle(12, 9, 3);
    bear.fillStyle(0x1c1917, 1);
    bear.fillCircle(12, 8, 1.2);
    // Eyes
    bear.fillCircle(9, 6, 1);
    bear.fillCircle(15, 6, 1);
    // Red Cowboy Bandana around neck
    bear.fillStyle(0xef4444, 1);
    bear.fillTriangle(7, 11, 17, 11, 12, 16);
    bear.generateTexture('pet_bear', 24, 24);
    bear.destroy();
  }

  /* -------------------------------------------------------------
     11. SHOP BADGES & PERK ICONS
     ------------------------------------------------------------- */
  createShopBadgeTextures() {
    // 1. Magnet Core Badge (24x24)
    const mb = this.make.graphics({ x: 0, y: 0, add: false });
    mb.fillStyle(0x0f172a, 1);
    mb.fillRoundedRect(0, 0, 24, 24, 4);
    mb.lineStyle(1, 0x38bdf8, 0.8);
    mb.strokeRoundedRect(0, 0, 24, 24, 4);
    // Horseshoe magnet
    mb.lineStyle(4, 0xef4444, 1);
    mb.beginPath();
    mb.arc(12, 14, 6, Math.PI, 0, false);
    mb.strokePath();
    // Blue poles
    mb.fillStyle(0x38bdf8, 1);
    mb.fillRect(6, 13, 4, 5);
    mb.fillRect(14, 13, 4, 5);
    mb.generateTexture('badge_magnet', 24, 24);
    mb.destroy();

    // 2. Reinforced Plating Badge (24x24)
    const ab = this.make.graphics({ x: 0, y: 0, add: false });
    ab.fillStyle(0x0f172a, 1);
    ab.fillRoundedRect(0, 0, 24, 24, 4);
    ab.lineStyle(1, 0x34d399, 0.8);
    ab.strokeRoundedRect(0, 0, 24, 24, 4);
    // Shield
    ab.fillStyle(0x059669, 1);
    ab.fillTriangle(5, 6, 19, 6, 12, 19);
    // Cross
    ab.fillStyle(0xffffff, 1);
    ab.fillRect(10, 7, 4, 8);
    ab.fillRect(8, 9, 8, 4);
    ab.generateTexture('badge_armor', 24, 24);
    ab.destroy();

    // 3. Boost Thrusters Badge (24x24)
    const tb = this.make.graphics({ x: 0, y: 0, add: false });
    tb.fillStyle(0x0f172a, 1);
    tb.fillRoundedRect(0, 0, 24, 24, 4);
    tb.lineStyle(1, 0xfbbf24, 0.8);
    tb.strokeRoundedRect(0, 0, 24, 24, 4);
    // Rocket
    tb.fillStyle(0xe2e8f0, 1);
    tb.fillTriangle(12, 4, 17, 14, 7, 14);
    // Twin flame exhaust
    tb.fillStyle(0xf97316, 1);
    tb.fillTriangle(9, 14, 11, 20, 7, 14);
    tb.fillTriangle(15, 14, 13, 20, 17, 14);
    tb.generateTexture('badge_thruster', 24, 24);
    tb.destroy();

    // 4. Lucky Stars Badge (24x24)
    const lb = this.make.graphics({ x: 0, y: 0, add: false });
    lb.fillStyle(0x0f172a, 1);
    lb.fillRoundedRect(0, 0, 24, 24, 4);
    lb.lineStyle(1, 0xe879f9, 0.8);
    lb.strokeRoundedRect(0, 0, 24, 24, 4);
    // 4-point star
    lb.fillStyle(0xf472b6, 1);
    lb.beginPath();
    lb.moveTo(12, 3);
    lb.lineTo(15, 9);
    lb.lineTo(21, 12);
    lb.lineTo(15, 15);
    lb.lineTo(12, 21);
    lb.lineTo(9, 15);
    lb.lineTo(3, 12);
    lb.lineTo(9, 9);
    lb.closePath();
    lb.fillPath();
    lb.fillStyle(0xffffff, 1);
    lb.fillCircle(12, 12, 2);
    lb.generateTexture('badge_luck', 24, 24);
    lb.destroy();

    // 5. Quickdraw Holster Badge (24x24)
    const qb = this.make.graphics({ x: 0, y: 0, add: false });
    qb.fillStyle(0x0f172a, 1);
    qb.fillRoundedRect(0, 0, 24, 24, 4);
    qb.lineStyle(1, 0xf97316, 0.8);
    qb.strokeRoundedRect(0, 0, 24, 24, 4);
    // Revolver cylinder shape
    qb.fillStyle(0xfacc15, 1);
    qb.fillCircle(12, 12, 6);
    qb.fillStyle(0x0f172a, 1);
    qb.fillCircle(12, 12, 2);
    qb.fillCircle(9, 10, 1.2);
    qb.fillCircle(15, 10, 1.2);
    qb.fillCircle(9, 14, 1.2);
    qb.fillCircle(15, 14, 1.2);
    qb.generateTexture('badge_quickdraw', 24, 24);
    qb.destroy();

    // 6. Gold Rush Badge (24x24)
    const gb = this.make.graphics({ x: 0, y: 0, add: false });
    gb.fillStyle(0x0f172a, 1);
    gb.fillRoundedRect(0, 0, 24, 24, 4);
    gb.lineStyle(1, 0xeab308, 0.8);
    gb.strokeRoundedRect(0, 0, 24, 24, 4);
    // Gold nugget
    gb.fillStyle(0xfacc15, 1);
    gb.fillTriangle(6, 17, 12, 6, 19, 17);
    gb.fillStyle(0xfef08a, 1);
    gb.fillTriangle(9, 14, 12, 7, 16, 14);
    gb.generateTexture('badge_goldrush', 24, 24);
    gb.destroy();

    // 7. Dynamite Boots Badge (24x24)
    const dbb = this.make.graphics({ x: 0, y: 0, add: false });
    dbb.fillStyle(0x0f172a, 1);
    dbb.fillRoundedRect(0, 0, 24, 24, 4);
    dbb.lineStyle(1, 0xef4444, 0.8);
    dbb.strokeRoundedRect(0, 0, 24, 24, 4);
    // Dynamite stick
    dbb.fillStyle(0xdc2626, 1);
    dbb.fillRoundedRect(8, 7, 8, 12, 2);
    dbb.fillStyle(0xfacc15, 1);
    dbb.fillCircle(12, 4, 2); // Spark
    dbb.generateTexture('badge_dynamiteboots', 24, 24);
    dbb.destroy();
  }

  /* -------------------------------------------------------------
     12. WEAPONS & COMBAT PROJECTILE TEXTURES
     ------------------------------------------------------------- */
  createWeaponAndCombatTextures() {
    // 1. Revolver (24x16 Six-Shooter)
    const rev = this.make.graphics({ x: 0, y: 0, add: false });
    rev.fillStyle(0x78350f, 1);
    rev.fillRoundedRect(2, 7, 6, 8, 2); // Wooden grip
    rev.fillStyle(0x475569, 1);
    rev.fillRect(7, 6, 7, 5);          // Receiver & cylinder frame
    rev.fillStyle(0xfacc15, 1);
    rev.fillRect(9, 7, 3, 3);          // Brass cylinder
    rev.fillStyle(0x94a3b8, 1);
    rev.fillRect(14, 5, 9, 3);         // Barrel
    rev.fillStyle(0x334155, 1);
    rev.fillRect(5, 4, 3, 3);          // Hammer
    rev.generateTexture('weapon_revolver', 24, 16);
    rev.destroy();

    // 2. Plasma Blaster (24x16 Sci-Fi Energy Pistol)
    const pb = this.make.graphics({ x: 0, y: 0, add: false });
    pb.fillStyle(0x1e293b, 1);
    pb.fillRoundedRect(3, 7, 6, 8, 2); // Cyber grip
    pb.fillStyle(0x0f172a, 1);
    pb.fillRoundedRect(7, 4, 12, 6, 2); // Body
    pb.fillStyle(0x00f0ff, 1);
    pb.fillRect(10, 5, 5, 4);          // Glowing plasma battery
    pb.fillStyle(0x38bdf8, 1);
    pb.fillRect(19, 5, 4, 4);          // Emitter muzzle
    pb.fillStyle(0xffffff, 1);
    pb.fillRect(21, 6, 2, 2);          // Core tip
    pb.generateTexture('weapon_plasma_blaster', 24, 16);
    pb.destroy();

    // 3. Photon Rifle (28x16 Long-Range Laser Carbine)
    const pr = this.make.graphics({ x: 0, y: 0, add: false });
    pr.fillStyle(0x2e1065, 1);
    pr.fillRoundedRect(2, 6, 7, 8, 2); // Heavy stock
    pr.fillStyle(0x4c1d95, 1);
    pr.fillRect(8, 4, 10, 6);          // Receiver
    pr.fillStyle(0xa855f7, 1);
    pr.fillRect(11, 5, 5, 4);          // Resonance crystal
    pr.fillStyle(0xc084fc, 1);
    pr.fillRect(18, 5, 8, 3);          // Precision laser barrel
    pr.fillStyle(0xffffff, 1);
    pr.fillRect(24, 6, 3, 1);          // Focusing lens
    pr.generateTexture('weapon_photon_rifle', 28, 16);
    pr.destroy();

    // 4. Dynamite Launcher (26x16 Frontier Rocket Cannon)
    const dl = this.make.graphics({ x: 0, y: 0, add: false });
    dl.fillStyle(0x334155, 1);
    dl.fillRoundedRect(2, 6, 6, 8, 2); // Heavy grip
    dl.fillStyle(0xd97706, 1);
    dl.fillRect(7, 3, 13, 8);          // Brass tube barrel
    dl.fillStyle(0xb45309, 1);
    dl.strokeRect(7, 3, 13, 8);        // Outer reinforcement ring
    dl.fillStyle(0xdc2626, 1);
    dl.fillRoundedRect(17, 4, 7, 6, 1); // Loaded dynamite bundle
    dl.fillStyle(0xfacc15, 1);
    dl.fillCircle(24, 4, 2);           // Sparking fuse
    dl.generateTexture('weapon_dynamite_launcher', 26, 16);
    dl.destroy();

    // 5. Cosmic Scattergun (26x16 Shotgun)
    const sg = this.make.graphics({ x: 0, y: 0, add: false });
    sg.fillStyle(0x92400e, 1);
    sg.fillRoundedRect(2, 6, 8, 8, 2); // Timber stock
    sg.fillStyle(0xf59e0b, 1);
    sg.fillRect(9, 5, 5, 5);           // Brass breach
    sg.fillStyle(0x475569, 1);
    sg.fillRect(14, 4, 11, 3);         // Upper barrel
    sg.fillRect(14, 8, 11, 3);         // Lower barrel
    sg.generateTexture('weapon_shotgun', 26, 16);
    sg.destroy();

    // 5b. Aegis Blaster (26x16 Harmonic Barrier Pulse Cannon)
    const ab = this.make.graphics({ x: 0, y: 0, add: false });
    ab.fillStyle(0x0f172a, 1);
    ab.fillRoundedRect(2, 6, 7, 8, 2); // Slate grip
    ab.fillStyle(0x0284c7, 1);
    ab.fillRect(8, 4, 11, 7);          // Armored casing
    ab.fillStyle(0x38bdf8, 1);
    ab.fillRect(11, 5, 5, 5);          // Harmonic shield emitter
    ab.fillStyle(0x00f0ff, 1);
    ab.fillRect(19, 5, 6, 4);          // Prismatic muzzle
    ab.fillStyle(0xffffff, 1);
    ab.fillRect(23, 6, 2, 2);          // Beam focal point
    ab.generateTexture('weapon_aegis_blaster', 26, 16);
    ab.destroy();

    // 5c. Chrono Cannon (26x16 Quantum Temporal Pulse Rifle)
    const cc = this.make.graphics({ x: 0, y: 0, add: false });
    cc.fillStyle(0x1e1b4b, 1);
    cc.fillRoundedRect(2, 6, 7, 8, 2); // Deep violet grip
    cc.fillStyle(0x581c87, 1);
    cc.fillRect(8, 4, 10, 7);          // Phase chamber
    cc.fillStyle(0xa855f7, 1);
    cc.fillRect(10, 5, 6, 4);          // Quantum coil
    cc.fillStyle(0xd8b4fe, 1);
    cc.fillRect(18, 5, 7, 3);          // Temporal emitter
    cc.fillStyle(0xffffff, 1);
    cc.fillCircle(24, 6, 1.5);         // Tachyon lens
    cc.generateTexture('weapon_chrono_warp', 26, 16);
    cc.destroy();

    // 5d. Hyper Laser (28x16 Emerald Heavy Continuous Beam Cannon)
    const hl = this.make.graphics({ x: 0, y: 0, add: false });
    hl.fillStyle(0x064e3b, 1);
    hl.fillRoundedRect(2, 6, 7, 8, 2); // Dark emerald grip
    hl.fillStyle(0x065f46, 1);
    hl.fillRect(8, 3, 11, 8);          // Heavy power block
    hl.fillStyle(0x10b981, 1);
    hl.fillRect(11, 5, 6, 4);          // Fusion reactor
    hl.fillStyle(0x34d399, 1);
    hl.fillRect(19, 4, 8, 4);          // Hyper laser barrel
    hl.fillStyle(0xffffff, 1);
    hl.fillRect(25, 5, 2, 2);          // Focus emitter
    hl.generateTexture('weapon_hyper_laser', 28, 16);
    hl.destroy();

    // 5e. Cluster Bomb Launcher (26x16 High-Yield Starburst Cannon)
    const cb = this.make.graphics({ x: 0, y: 0, add: false });
    cb.fillStyle(0x500724, 1);
    cb.fillRoundedRect(2, 6, 7, 8, 2); // Dark magenta stock
    cb.fillStyle(0x831843, 1);
    cb.fillRect(8, 3, 12, 9);          // Broad rocket chamber
    cb.fillStyle(0xec4899, 1);
    cb.fillRect(11, 5, 6, 5);          // Cluster warhead
    cb.fillStyle(0xf43f5e, 1);
    cb.fillRect(20, 4, 5, 6);          // Quad rocket exhaust muzzle
    cb.fillStyle(0xfacc15, 1);
    cb.fillCircle(24, 4, 1.5);         // Fuse spark
    cb.generateTexture('weapon_cluster_bomb', 26, 16);
    cb.destroy();

    // 6. Player Bullet (10x5 Brass High-Velocity Bullet)
    const b = this.make.graphics({ x: 0, y: 0, add: false });
    b.fillStyle(0xfacc15, 1);
    b.fillRoundedRect(0, 0, 10, 5, 2);
    b.fillStyle(0xffffff, 1);
    b.fillRect(5, 1, 4, 3);
    b.generateTexture('player_bullet', 10, 5);
    b.destroy();

    // 7. Player Plasma Bolt (12x8 Cyan Energy Orb)
    const pl = this.make.graphics({ x: 0, y: 0, add: false });
    pl.fillStyle(0x00f0ff, 0.5);
    pl.fillCircle(6, 4, 4);
    pl.fillStyle(0x38bdf8, 1);
    pl.fillRoundedRect(2, 1, 8, 6, 3);
    pl.fillStyle(0xffffff, 1);
    pl.fillCircle(6, 4, 2);
    pl.generateTexture('player_plasma', 12, 8);
    pl.destroy();

    // 8. Player Photon Beam (16x4 Laser Beam)
    const ph = this.make.graphics({ x: 0, y: 0, add: false });
    ph.fillStyle(0xa855f7, 0.6);
    ph.fillRoundedRect(0, 0, 16, 4, 2);
    ph.fillStyle(0xc084fc, 1);
    ph.fillRect(2, 1, 12, 2);
    ph.fillStyle(0xffffff, 1);
    ph.fillRect(4, 1, 8, 2);
    ph.generateTexture('player_photon', 16, 4);
    ph.destroy();

    // 9. Player Dynamite Projectile (10x10 Mini Dynamite Stick)
    const dyn = this.make.graphics({ x: 0, y: 0, add: false });
    dyn.fillStyle(0xdc2626, 1);
    dyn.fillRoundedRect(1, 2, 7, 7, 1);
    dyn.fillStyle(0xfacc15, 1);
    dyn.fillRect(1, 4, 7, 2);          // Band
    dyn.fillStyle(0xffffff, 1);
    dyn.fillCircle(8, 2, 1.5);         // Spark
    dyn.generateTexture('player_dynamite', 10, 10);
    dyn.destroy();

    // 10. Player Scatter Pellet (6x6 Amber Spark)
    const sc = this.make.graphics({ x: 0, y: 0, add: false });
    sc.fillStyle(0xf59e0b, 1);
    sc.fillCircle(3, 3, 3);
    sc.fillStyle(0xfef08a, 1);
    sc.fillCircle(3, 3, 1.5);
    sc.generateTexture('player_scatter', 6, 6);
    sc.destroy();
  }

  /* -------------------------------------------------------------
     10. SECTOR FINAL BOSS TEXTURES (SECTORS 1 - 6)
     ------------------------------------------------------------- */
  createBossTextures() {
    // 1. Sector 1: Alpha Dreadnought Mech (48x44 Cyan/Steel Heavy Mech)
    const dG = this.make.graphics({ x: 0, y: 0, add: false });
    // Heavy Armored Chassis
    dG.fillStyle(0x0f172a, 1);
    dG.fillRoundedRect(6, 10, 36, 26, 4);
    // Outer Shoulder Weapon Pods
    dG.fillStyle(0x1e293b, 1);
    dG.fillRect(2, 6, 8, 18);
    dG.fillRect(38, 6, 8, 18);
    // Railgun barrels
    dG.fillStyle(0x475569, 1);
    dG.fillRect(0, 10, 4, 6);
    dG.fillRect(44, 10, 4, 6);
    // Core Reactor Cockpit (Cyan Glow)
    dG.fillStyle(0x00f0ff, 0.4);
    dG.fillCircle(24, 22, 10);
    dG.fillStyle(0x00f0ff, 1);
    dG.fillCircle(24, 22, 6);
    dG.fillStyle(0xffffff, 1);
    dG.fillCircle(24, 22, 2.5);
    // Upper Sensor Antennae
    dG.fillStyle(0x00f0ff, 1);
    dG.fillRect(16, 2, 3, 8);
    dG.fillRect(29, 2, 3, 8);
    // Thruster exhaust
    dG.fillStyle(0x38bdf8, 1);
    dG.fillRect(12, 36, 6, 4);
    dG.fillRect(30, 36, 6, 4);
    dG.generateTexture('boss_dreadnought', 48, 44);
    dG.destroy();

    // 2. Sector 2: Orbital Behemoth Core (48x44 Sapphire Station AI Core)
    const oG = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer Station Defense Ring
    oG.lineStyle(3, 0x0284c7, 1);
    oG.strokeCircle(24, 22, 18);
    oG.fillStyle(0x0f172a, 0.95);
    oG.fillCircle(24, 22, 16);
    // Heavy Armor Vanes
    oG.fillStyle(0x38bdf8, 1);
    oG.fillRect(4, 20, 6, 4);
    oG.fillRect(38, 20, 6, 4);
    oG.fillRect(22, 2, 4, 6);
    oG.fillRect(22, 36, 4, 6);
    // Core Eye
    oG.fillStyle(0x0369a1, 1);
    oG.fillCircle(24, 22, 10);
    oG.fillStyle(0x38bdf8, 1);
    oG.fillCircle(24, 22, 6);
    oG.fillStyle(0xffffff, 1);
    oG.fillCircle(24, 22, 3);
    oG.generateTexture('boss_orbital_behemoth', 48, 44);
    oG.destroy();

    // 3. Sector 3: Void Leviathan (50x44 Nebula Void Serpent)
    const vG = this.make.graphics({ x: 0, y: 0, add: false });
    // Segmented Void Carapace
    vG.fillStyle(0x3b0764, 1);
    vG.fillRoundedRect(6, 8, 38, 28, 6);
    // Ethereal Wings/Fins
    vG.fillStyle(0x7e22ce, 0.85);
    vG.fillTriangle(6, 12, 0, 4, 10, 24);
    vG.fillTriangle(44, 12, 50, 4, 40, 24);
    // Glowing Nebula Ribs
    vG.fillStyle(0xc084fc, 1);
    vG.fillRect(14, 12, 22, 3);
    vG.fillRect(16, 19, 18, 3);
    vG.fillRect(18, 26, 14, 3);
    // Triple Ocular Sensors
    vG.fillStyle(0xf0abfc, 1);
    vG.fillCircle(20, 14, 2.5);
    vG.fillCircle(30, 14, 2.5);
    vG.fillCircle(25, 8, 3);
    vG.generateTexture('boss_void_leviathan', 50, 44);
    vG.destroy();

    // 4. Sector 4: Magma Colossus (50x46 Volcanic Titan)
    const mG = this.make.graphics({ x: 0, y: 0, add: false });
    // Dark Basalt Body
    mG.fillStyle(0x18181b, 1);
    mG.fillRoundedRect(6, 6, 38, 34, 5);
    // Shoulders
    mG.fillStyle(0x27272a, 1);
    mG.fillRect(2, 10, 8, 14);
    mG.fillRect(40, 10, 8, 14);
    // Magma Fissures
    mG.fillStyle(0xf97316, 1);
    mG.fillRect(12, 16, 26, 4);
    mG.fillRect(22, 16, 6, 20);
    mG.fillRect(14, 28, 22, 4);
    // Burning Core
    mG.fillStyle(0xfde047, 1);
    mG.fillCircle(25, 23, 5);
    mG.fillStyle(0xffffff, 1);
    mG.fillCircle(25, 23, 2);
    // Flaming Horns
    mG.fillStyle(0xef4444, 1);
    mG.fillTriangle(14, 6, 10, 0, 18, 6);
    mG.fillTriangle(36, 6, 40, 0, 32, 6);
    mG.generateTexture('boss_magma_colossus', 50, 46);
    mG.destroy();

    // 5. Sector 5: Zenith Sovereign (48x46 Ancient Warp Deity)
    const zG = this.make.graphics({ x: 0, y: 0, add: false });
    // Sacred Halo
    zG.lineStyle(2, 0xfacc15, 0.9);
    zG.strokeCircle(24, 14, 12);
    // Gold/Platinum Ancient Torso
    zG.fillStyle(0x1e1b4b, 1);
    zG.fillRoundedRect(8, 12, 32, 28, 4);
    zG.fillStyle(0xfacc15, 1);
    zG.fillRect(12, 14, 24, 6);
    zG.fillRect(14, 24, 20, 4);
    // Celestial Eye Core
    zG.fillStyle(0x00f0ff, 1);
    zG.fillCircle(24, 23, 6);
    zG.fillStyle(0xffffff, 1);
    zG.fillCircle(24, 23, 2.5);
    // Floating Obelisk Spires
    zG.fillStyle(0xeab308, 1);
    zG.fillTriangle(2, 28, 6, 14, 8, 28);
    zG.fillTriangle(46, 28, 42, 14, 40, 28);
    zG.generateTexture('boss_zenith_overlord', 48, 46);
    zG.destroy();

    // 6. Sector 6: Cyber Outlaw King (46x46 El Bandido Supremo)
    const kG = this.make.graphics({ x: 0, y: 0, add: false });
    // Cyber Duster Coat
    kG.fillStyle(0x451a03, 1);
    kG.fillRoundedRect(8, 18, 30, 24, 3);
    // Giant Outlaw Cowboy Hat Brim & Crown
    kG.fillStyle(0x78350f, 1);
    kG.fillRect(2, 12, 42, 5);
    kG.fillRect(12, 4, 22, 9);
    kG.fillStyle(0xfacc15, 1);
    kG.fillRect(12, 11, 22, 2); // Gold hat band
    // Cyber Face & Monocle
    kG.fillStyle(0x1c1917, 1);
    kG.fillRect(14, 17, 18, 10);
    // Glowing Crimson Cyber Ocular Eye
    kG.fillStyle(0xef4444, 1);
    kG.fillCircle(25, 21, 3.5);
    kG.fillStyle(0xffffff, 1);
    kG.fillCircle(25, 21, 1.5);
    // Dual Outlaw Heavy Blasters
    kG.fillStyle(0xfacc15, 1);
    kG.fillRect(2, 26, 8, 5);
    kG.fillRect(36, 26, 8, 5);
    // Dynamite Sticks on Bandolier
    kG.fillStyle(0xdc2626, 1);
    kG.fillRect(14, 32, 5, 6);
    kG.fillRect(21, 32, 5, 6);
    kG.fillRect(28, 32, 5, 6);
    kG.generateTexture('boss_outlaw_king', 46, 46);
    kG.destroy();
  }
}
