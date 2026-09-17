/**
 * ParallaxBackgroundSystem.js - Reusable 5-Layer Sci-Fi Parallax Background Engine
 * Manages multi-depth background planes, thematic color transitions, and camera tracking.
 */

export class ParallaxBackgroundSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} [themeConfig]
   */
  constructor(scene, themeConfig = {}) {
    this.scene = scene;
    this.theme = themeConfig;
    this.layers = [];
    this.worldWidth = scene.levelData ? scene.levelData.width : 2400;
    this.worldHeight = scene.levelData ? scene.levelData.height : 450;
  }

  /**
   * Initializes all 5 parallax depth layers
   */
  initialize() {
    this.destroy();

    const w = this.scene.cameras.main ? this.scene.cameras.main.width : 800;
    const h = this.scene.cameras.main ? this.scene.cameras.main.height : 450;
    const themeKey = this.theme.key || 'frontier';

    // Base Sky Fill (Depth -100)
    const skyColor = this.theme.skyColor || 0x070913;
    this.skyBg = this.scene.add.rectangle(0, 0, this.worldWidth + 800, this.worldHeight + 200, skyColor)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-100);

    // Layer 1: Distant Stars (8% scroll speed)
    const starsKey = this.scene.textures.exists(`bg_stars_${themeKey}`) ? `bg_stars_${themeKey}` : 'bg_layer_stars';
    this.layer1 = this.scene.add.tileSprite(0, 0, this.worldWidth, h, starsKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.08, 0.05)
      .setDepth(-90);

    // Layer 2: Nebula / Cosmic Clouds (18% scroll speed)
    const nebulaKey = this.scene.textures.exists(`bg_nebula_${themeKey}`) ? `bg_nebula_${themeKey}` : 'bg_layer_nebula';
    this.layer2 = this.scene.add.tileSprite(0, 0, this.worldWidth, h, nebulaKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.18, 0.12)
      .setAlpha(0.85)
      .setDepth(-80);

    // Layer 3: Celestial Bodies / Moons / Planets (32% scroll speed)
    const celestialKey = this.scene.textures.exists(`bg_celestial_${themeKey}`) ? `bg_celestial_${themeKey}` : 'bg_layer_celestial';
    this.layer3 = this.scene.add.tileSprite(0, 0, this.worldWidth, h, celestialKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.32, 0.20)
      .setDepth(-70);

    // Layer 4: Distant Horizon / Futuristic Spires (48% scroll speed)
    const structuresKey = this.scene.textures.exists(`bg_structures_${themeKey}`) ? `bg_structures_${themeKey}` : 'bg_layer_structures';
    this.layer4 = this.scene.add.tileSprite(0, 0, this.worldWidth, h, structuresKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.48, 0.35)
      .setDepth(-60);

    // Layer 5: Atmospheric Dust & Floating Cyber Grid (85% scroll speed)
    const dustKey = this.scene.textures.exists(`bg_dust_${themeKey}`) ? `bg_dust_${themeKey}` : 'bg_layer_dust';
    this.layer5 = this.scene.add.tileSprite(0, 0, this.worldWidth, h, dustKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.85, 0.70)
      .setAlpha(0.65)
      .setDepth(-50);

    this.layers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5];
  }

  /**
   * Advances subtle idle drift animations for gas and space dust
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    const dt = delta / 1000;
    if (this.layer1) this.layer1.tilePositionX += 0.5 * dt;
    if (this.layer2) this.layer2.tilePositionX += 1.8 * dt;
    if (this.layer5) this.layer5.tilePositionX += 4.0 * dt;
  }

  /**
   * Cleans up all parallax objects
   */
  destroy() {
    if (this.skyBg) {
      this.skyBg.destroy();
      this.skyBg = null;
    }
    this.layers.forEach(layer => {
      if (layer) layer.destroy();
    });
    this.layers = [];
  }
}
