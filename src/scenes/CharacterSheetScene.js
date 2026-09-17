import { CHARACTER_ROSTER, DEFAULT_CHARACTER_ID } from '../config/characterConfig.js';
import { UI_CONFIG } from '../config/uiConfig.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { SHOP_CATALOG } from '../config/shopConfig.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';

/**
 * CharacterSheetScene - Interactive Operative Dossier & Character Sheet
 * Inspects stats, active outfit, equipped passive perks, and companion pets.
 */
export class CharacterSheetScene extends Phaser.Scene {
  constructor() {
    super('CharacterSheetScene');
  }

  init(data) {
    this.selectedId = (data && data.characterId) ? data.characterId.toUpperCase() : DEFAULT_CHARACTER_ID;
    this.characterKeys = Object.keys(CHARACTER_ROSTER);
    this.currentIndex = Math.max(0, this.characterKeys.indexOf(this.selectedId));
    this.returnScene = (data && data.returnScene) ? data.returnScene : 'CharacterSelectScene';
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Deep space background with twinkling parallax stars
    this.add.rectangle(w / 2, h / 2, w, h, 0x070913);
    this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_stars').setAlpha(0.65);

    // Header Bar
    const headerBar = this.add.rectangle(w / 2, 32, w, 50, 0x0f172a, 0.9);
    headerBar.setStrokeStyle(1, 0x00f0ff, 0.4);

    this.add.text(28, 22, 'OPERATIVE DOSSIER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: UI_CONFIG.COLOR_CYAN
    });

    // Touch Navigation Buttons for Mobile & Click
    const backBtn = this.add.rectangle(340, 32, 75, 26, 0x1e293b, 0.9);
    backBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(340, 32, '◀ BACK', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.exitScene());

    const shopBtn = this.add.rectangle(425, 32, 75, 26, 0x1e293b, 0.9);
    shopBtn.setStrokeStyle(1.5, 0xffdd44, 0.7);
    this.add.text(425, 32, '🛒 SHOP', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#ffdd44'
    }).setOrigin(0.5);
    shopBtn.setInteractive({ useHandCursor: true });
    shopBtn.on('pointerdown', () => this.openShop());

    this.walletText = this.add.text(w - 28, 22, `★ CRYSTALS: ${ShopSystem.getCrystals()}`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: UI_CONFIG.COLOR_GOLD
    }).setOrigin(1, 0);

    // Main Content Containers
    this.createInspectionBay(w, h);
    this.createMetricsPanel(w, h);

    // Footer Navigation
    this.add.text(w / 2, h - 22, '[←/→] Switch Operative  •  [S] Cosmic Shop  •  [ENTER] Deploy  •  [ESC] Back', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Keyboard controls
    this.input.keyboard.on('keydown-LEFT', () => this.changeOperative(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.changeOperative(1));
    this.input.keyboard.on('keydown-A', () => this.changeOperative(-1));
    this.input.keyboard.on('keydown-D', () => this.changeOperative(1));
    this.input.keyboard.on('keydown-S', () => this.openShop());
    this.input.keyboard.on('keydown-ENTER', () => this.confirmDeploy());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmDeploy());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());

    this.updateDossier();
  }

  createInspectionBay(w, h) {
    // Left side container (Inspection Pedestal)
    this.pedestalContainer = this.add.container(210, 220);

    const bayBg = this.add.rectangle(0, 0, 340, 310, 0x0f172a, 0.85);
    bayBg.setStrokeStyle(2, 0x1e293b, 0.9);

    // Holographic energy grid pedestal
    const holoGrid = this.add.ellipse(0, 80, 180, 44, 0x00f0ff, 0.18);
    holoGrid.setStrokeStyle(1.5, 0x00f0ff, 0.8);

    // Character Preview Sprite
    this.previewSprite = this.add.image(0, 10, 'player_nova').setScale(3.2);

    // Floating animation
    this.tweens.add({
      targets: this.previewSprite,
      y: 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Companion Pet Sprite Preview
    this.petPreview = this.add.image(75, -20, 'pet_cosmo').setScale(2.0).setVisible(false);
    this.tweens.add({
      targets: this.petPreview,
      y: -26,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Operative Name Badge
    this.nameBadge = this.add.text(0, -115, 'NOVA', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '16px',
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.titleBadge = this.add.text(0, -92, 'CELESTIAL SCOUT', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Touch Switch Operative Arrow Buttons
    const prevBtn = this.add.rectangle(-135, 10, 32, 36, 0x1e293b, 0.9);
    prevBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const prevText = this.add.text(-135, 10, '◀', { fontFamily: 'Press Start 2P', fontSize: '13px', color: '#00f0ff' }).setOrigin(0.5);
    prevBtn.setInteractive({ useHandCursor: true });
    prevBtn.on('pointerdown', () => this.changeOperative(-1));

    const nextBtn = this.add.rectangle(135, 10, 32, 36, 0x1e293b, 0.9);
    nextBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const nextText = this.add.text(135, 10, '▶', { fontFamily: 'Press Start 2P', fontSize: '13px', color: '#00f0ff' }).setOrigin(0.5);
    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => this.changeOperative(1));

    this.pedestalContainer.add([bayBg, holoGrid, this.previewSprite, this.petPreview, prevBtn, prevText, nextBtn, nextText, this.nameBadge, this.titleBadge, this.outfitBadge, this.petBadge]);
  }

  createMetricsPanel(w, h) {
    // Right side container (Tactical Metrics & Loadout)
    this.metricsContainer = this.add.container(580, 220);

    const panelBg = this.add.rectangle(0, 0, 360, 330, 0x0f172a, 0.85);
    panelBg.setStrokeStyle(2, 0x334155, 0.8);

    const title = this.add.text(-160, -145, 'TACTICAL METRICS & ATTRIBUTES', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: UI_CONFIG.COLOR_CYAN
    });

    // Attributes Readout Block
    this.attributesText = this.add.text(-160, -122, '', {
      fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
      fontSize: '11px',
      color: '#e2e8f0',
      lineSpacing: 4
    });

    // Divider Line
    const divLine = this.add.rectangle(0, -28, 320, 1, 0x334155, 0.8);

    // Loadout & Equipment Block
    const equipTitle = this.add.text(-160, -16, 'EQUIPPED MODULES & PERKS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#f59e0b'
    });

    this.loadoutText = this.add.text(-160, 4, '', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '11px',
      color: '#cbd5e1',
      lineSpacing: 3,
      wordWrap: { width: 320 }
    });

    // Open Shop Action Button
    const shopBtn = this.add.rectangle(0, 140, 260, 26, 0x1e293b, 0.95);
    shopBtn.setStrokeStyle(1, 0xf59e0b, 0.9);
    const shopBtnText = this.add.text(0, 140, '🛍 OPEN COSMIC SHOP [S]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44'
    }).setOrigin(0.5);

    shopBtn.setInteractive({ useHandCursor: true });
    shopBtn.on('pointerdown', () => this.openShop());

    this.metricsContainer.add([panelBg, title, this.attributesText, divLine, equipTitle, this.loadoutText, shopBtn, shopBtnText]);
  }

  updateDossier() {
    const charKey = this.characterKeys[this.currentIndex];
    const char = CHARACTER_ROSTER[charKey];
    const equippedOutfit = ShopSystem.getEquippedOutfit(charKey);
    const equippedPerk = ShopSystem.getEquippedPerk();
    const equippedPet = ShopSystem.getEquippedPet();

    // 1. Update Preview Sprite Texture
    let textureKey = `player_${charKey.toLowerCase()}`;
    if (equippedOutfit && equippedOutfit !== 'standard') {
      const skinKey = `player_${charKey.toLowerCase()}_${equippedOutfit}`;
      if (this.textures.exists(skinKey)) {
        textureKey = skinKey;
      }
    }
    this.previewSprite.setTexture(textureKey);

    // 2. Update Companion Pet
    if (equippedPet && this.textures.exists(equippedPet.texture)) {
      this.petPreview.setTexture(equippedPet.texture).setVisible(true);
      this.petBadge.setText(`COMPANION: ${equippedPet.name.toUpperCase()}`);
    } else {
      this.petPreview.setVisible(false);
      this.petBadge.setText('COMPANION: NONE (VISIT SHOP)');
    }

    // 3. Update Name & Labels
    this.nameBadge.setText(char.name.toUpperCase()).setColor(char.colorHex);
    this.titleBadge.setText(char.title.toUpperCase());

    const outfitObj = SHOP_CATALOG.outfits.find(o => o.id === equippedOutfit);
    const outfitName = outfitObj ? outfitObj.name.toUpperCase() : 'STANDARD ISSUE';
    this.outfitBadge.setText(`OUTFIT: ${outfitName}`);

    // 4. Update Attribute Bars
    const stats = char.stats;
    const speedBar = this.createBar(stats.speedMultiplier, 0.8, 1.25);
    const jumpBar = this.createBar(stats.jumpMultiplier, 0.8, 1.25);
    const ctrlBar = this.createBar(stats.controlMultiplier, 0.8, 1.25);
    const durBar = this.createBar(stats.durabilityMultiplier, 0.8, 1.25);

    this.attributesText.setText(
      `CLASS:        ${char.title}\n` +
      `GROUND SPEED: ${speedBar} (${stats.speedLabel.split(' ')[0]})\n` +
      `JUMP LIFT:    ${jumpBar} (${stats.jumpLabel.split(' ')[0]})\n` +
      `AIR AGILITY:  ${ctrlBar} (${stats.controlLabel})\n` +
      `SHIELD HP:    ${durBar} (${stats.durabilityLabel})\n` +
      `ENERGY CORE:  ${stats.energyLabel}`
    );

    // 5. Update Loadout Details
    const perkDesc = equippedPerk ? `★ ${equippedPerk.name}: ${equippedPerk.description}` : '• None equipped. Visit shop to purchase passive perks!';
    const petDesc = equippedPet ? `🐾 ${equippedPet.name}: ${equippedPet.description}` : '• None equipped. Visit shop to adopt a companion pet!';
    this.loadoutText.setText(
      `ACTIVE PERK:\n${perkDesc}\n\n` +
      `COMPANION PET:\n${petDesc}`
    );

    this.walletText.setText(`★ CRYSTALS: ${ShopSystem.getCrystals()}`);
  }

  createBar(val, min, max) {
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const filled = Math.round(ratio * 8);
    let bar = '[';
    for (let i = 0; i < 8; i++) {
      bar += (i < filled) ? '■' : '□';
    }
    bar += ']';
    return bar;
  }

  changeOperative(delta) {
    this.currentIndex = (this.currentIndex + delta + this.characterKeys.length) % this.characterKeys.length;
    this.updateDossier();
  }

  openShop() {
    this.scene.start('ShopScene', {
      characterId: this.characterKeys[this.currentIndex],
      returnScene: 'CharacterSheetScene'
    });
  }

  confirmDeploy() {
    const chosenKey = this.characterKeys[this.currentIndex];
    this.scene.start('LevelSelectScene', { characterId: chosenKey });
  }

  goBack() {
    this.scene.start(this.returnScene, { characterId: this.characterKeys[this.currentIndex] });
  }
}
