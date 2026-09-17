import { CHARACTER_ROSTER, DEFAULT_CHARACTER_ID } from '../config/characterConfig.js';
import { UI_CONFIG } from '../config/uiConfig.js';

/**
 * CharacterSelectScene.js - Interactive Character Selection
 * Allows choosing between Nova, Zenith, Atlas, and Lumen with stats and animated preview.
 */
export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene');
  }

  init(data) {
    this.selectedId = data && data.characterId ? data.characterId : DEFAULT_CHARACTER_ID;
    this.characterKeys = Object.keys(CHARACTER_ROSTER);
    this.currentIndex = Math.max(0, this.characterKeys.indexOf(this.selectedId));
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Cyber background
    this.add.rectangle(w / 2, h / 2, w, h, 0x070913);
    this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_stars').setAlpha(0.6);

    // Screen Title
    this.add.text(w / 2, 35, 'SELECT EXPLORER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '18px',
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Touch Navigation Buttons for Mobile & Quick Click
    const backBtn = this.add.rectangle(55, 35, 80, 26, 0x1e293b, 0.9);
    backBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(55, 35, '◀ BACK', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('GameScene'));

    const sheetBtn = this.add.rectangle(w - 145, 35, 85, 26, 0x1e293b, 0.9);
    sheetBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(w - 145, 35, '👤 SHEET', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    sheetBtn.setInteractive({ useHandCursor: true });
    sheetBtn.on('pointerdown', () => {
      this.scene.start('CharacterSheetScene', { characterId: this.characterKeys[this.currentIndex], returnScene: 'CharacterSelectScene' });
    });

    const shopBtn = this.add.rectangle(w - 55, 35, 75, 26, 0x1e293b, 0.9);
    shopBtn.setStrokeStyle(1.5, 0xffdd44, 0.7);
    this.add.text(w - 55, 35, '🛒 SHOP', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44'
    }).setOrigin(0.5);
    shopBtn.setInteractive({ useHandCursor: true });
    shopBtn.on('pointerdown', () => {
      this.scene.start('ShopScene', { characterId: this.characterKeys[this.currentIndex], returnScene: 'CharacterSelectScene' });
    });

    // Subtitle
    this.add.text(w / 2, 60, 'CHOOSE YOUR OPERATIVE FOR SECTOR RECON', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Character Card Containers
    this.cards = [];
    const cardW = 160;
    const cardH = 260;
    const startX = w / 2 - ((this.characterKeys.length - 1) * (cardW + 16)) / 2;
    const cardY = 220;

    this.characterKeys.forEach((key, idx) => {
      const char = CHARACTER_ROSTER[key];
      const cx = startX + idx * (cardW + 16);

      const cardContainer = this.add.container(cx, cardY);

      // Card Background Box
      const bgBox = this.add.rectangle(0, 0, cardW, cardH, 0x0f172a, 0.9);
      bgBox.setStrokeStyle(2, 0x334155, 0.8);

      // Character Sprite Preview
      const sprite = this.add.image(0, -65, char.texture).setScale(2.2);

      // Floating idle tween for preview
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 4,
        duration: 1200 + idx * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Name Text
      const nameText = this.add.text(0, -20, char.name.toUpperCase(), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '11px',
        color: char.colorHex
      }).setOrigin(0.5);

      // Title Subtext
      const titleText = this.add.text(0, -5, char.title, {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '11px',
        color: '#e2e8f0'
      }).setOrigin(0.5);

      // Stats Readout
      const stats = char.stats;
      const statsBlock = this.add.text(0, 48,
        `SPD: ${stats.speedLabel.split(' ')[0]}\n` +
        `JMP: ${stats.jumpLabel.split(' ')[0]}\n` +
        `CTRL: ${stats.controlLabel}\n` +
        `DUR: ${stats.durabilityLabel}\n` +
        `ENG: ${stats.energyLabel.split(' ')[0]}`, {
        fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
        fontSize: '10px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 3
      }).setOrigin(0.5);

      // Selection Marker Tag
      const selectBadge = this.add.text(0, 105, idx === this.currentIndex ? '▶ ACTIVE ◀' : 'SELECT', {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: idx === this.currentIndex ? '#ffdd44' : '#64748b'
      }).setOrigin(0.5);

      cardContainer.add([bgBox, sprite, nameText, titleText, statsBlock, selectBadge]);
      cardContainer.bgBox = bgBox;
      cardContainer.badge = selectBadge;
      cardContainer.charKey = key;

      // Click / Tap support
      bgBox.setInteractive({ useHandCursor: true });
      bgBox.on('pointerdown', () => {
        this.currentIndex = idx;
        this.updateCardHighlight();
        this.confirmSelection();
      });

      this.cards.push(cardContainer);
    });

    this.updateCardHighlight();

    // Interactive Deploy Button for Touch & Click
    const deployBtn = this.add.rectangle(w / 2, 400, 280, 30, 0x1e293b, 0.95);
    deployBtn.setStrokeStyle(1.5, 0x00f0ff, 0.9);
    this.add.text(w / 2, 400, '▶ DEPLOY OPERATIVE [TAP HERE]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44'
    }).setOrigin(0.5);
    deployBtn.setInteractive({ useHandCursor: true });
    deployBtn.on('pointerdown', () => this.confirmSelection());

    // Bottom Navigation Help
    this.add.text(w / 2, 430, '[←/→] Operative  •  [C] Sheet  •  [S] Shop  •  [ENTER] Deploy  •  [ESC] Back', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '11px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Keyboard Inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-A', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-D', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-C', () => {
      this.scene.start('CharacterSheetScene', {
        characterId: this.characterKeys[this.currentIndex],
        returnScene: 'CharacterSelectScene'
      });
    });
    this.input.keyboard.on('keydown-S', () => {
      this.scene.start('ShopScene', {
        characterId: this.characterKeys[this.currentIndex],
        returnScene: 'CharacterSelectScene'
      });
    });
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());
  }

  moveSelection(delta) {
    this.currentIndex = (this.currentIndex + delta + this.characterKeys.length) % this.characterKeys.length;
    this.updateCardHighlight();
  }

  updateCardHighlight() {
    this.cards.forEach((card, idx) => {
      const isSelected = idx === this.currentIndex;
      const char = CHARACTER_ROSTER[card.charKey];
      if (isSelected) {
        card.bgBox.setStrokeStyle(3, char.colorNum, 1);
        card.bgBox.setFillStyle(0x1e293b, 0.98);
        card.badge.setText('▶ ACTIVE ◀').setColor('#ffdd44');
        card.setScale(1.05);
      } else {
        card.bgBox.setStrokeStyle(2, 0x334155, 0.8);
        card.bgBox.setFillStyle(0x0f172a, 0.9);
        card.badge.setText('SELECT').setColor('#64748b');
        card.setScale(1.0);
      }
    });
  }

  confirmSelection() {
    const chosenKey = this.characterKeys[this.currentIndex];
    // Proceed to Level Select Scene with chosen character
    this.scene.start('LevelSelectScene', { characterId: chosenKey });
  }

  goBack() {
    this.scene.start('GameScene');
  }
}
