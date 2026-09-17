import { UI_CONFIG } from '../config/uiConfig.js';
import { DEFAULT_CHARACTER_ID } from '../config/characterConfig.js';
import { LevelCompletionSystem } from '../systems/LevelCompletionSystem.js';

export const LEVEL_CATALOG = [
  {
    index: 1,
    id: 'level_1',
    name: 'SECTOR ALPHA',
    theme: 'Celestial Frontier',
    difficulty: 'EASY ★☆☆☆☆',
    mechanics: 'Star Crystals • Drifter Drones • Aegis Core',
    colorHex: '#00f0ff',
    colorNum: 0x00f0ff
  },
  {
    index: 2,
    id: 'level_2',
    name: 'MOONFALL STATION',
    theme: 'Abandoned Orbital Station',
    difficulty: 'MEDIUM ★★☆☆☆',
    mechanics: 'Moving Platforms • Void Crawlers • Chrono Core',
    colorHex: '#38bdf8',
    colorNum: 0x38bdf8
  },
  {
    index: 3,
    id: 'level_3',
    name: 'NEBULA RIFT',
    theme: 'Colorful Cosmic Rift',
    difficulty: 'CHALLENGING ★★★☆☆',
    mechanics: 'Gravity Zones • Launch Pads • Orbital Sentinels',
    colorHex: '#c084fc',
    colorNum: 0xc084fc
  },
  {
    index: 4,
    id: 'level_4',
    name: 'EMBER CRATER',
    theme: 'Volcanic Alien Planet',
    difficulty: 'EXPERT ★★★★☆',
    mechanics: 'Falling Platforms • Hazard Magma • Rift Hoppers',
    colorHex: '#f97316',
    colorNum: 0xf97316
  },
  {
    index: 5,
    id: 'level_5',
    name: 'ZENITH RUINS',
    theme: 'Ancient Cosmic Civilization',
    difficulty: 'MASTER ★★★★★',
    mechanics: 'Energy Gates • Nebula Wisps • Warp Spire Climax',
    colorHex: '#facc15',
    colorNum: 0xfacc15
  },
  {
    index: 6,
    id: 'level_6',
    name: 'DUST DEVIL CANYON',
    theme: 'Wild West Desert Biome',
    difficulty: 'OUTLAW ★★★★★',
    mechanics: 'Pistol Gunslingers • Flying Dynamite • Sandstone Mesas',
    colorHex: '#eab308',
    colorNum: 0xeab308
  }
];

/**
 * LevelSelectScene.js - Sector Selection Screen
 * Allows jumping into any of the 6 sectors with the chosen operative.
 */
export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  init(data) {
    this.characterId = data && data.characterId ? data.characterId : DEFAULT_CHARACTER_ID;
    this.currentIndex = data && data.levelIndex ? data.levelIndex - 1 : 0;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x070913);
    this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_stars').setAlpha(0.65);

    // Title
    this.add.text(w / 2, 30, 'SELECT SECTOR', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '18px',
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Touch Back Button for Mobile
    const backBtn = this.add.rectangle(60, 30, 90, 24, 0x1e293b, 0.9);
    backBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(60, 30, '◀ TITLE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(w / 2, 52, `OPERATIVE ASSIGNED: [${this.characterId}]`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44'
    }).setOrigin(0.5);

    // List of 6 Level Rows
    this.rows = [];
    const rowW = 600;
    const rowH = 40;
    const startY = 82;
    const spacingY = 48;

    LEVEL_CATALOG.forEach((lvl, idx) => {
      const cy = startY + idx * spacingY;
      const rowContainer = this.add.container(w / 2, cy);

      // Row panel box
      const box = this.add.rectangle(0, 0, rowW, rowH, 0x0f172a, 0.9);
      box.setStrokeStyle(2, 0x334155, 0.8);

      // Level number badge [1], [2], etc.
      const numText = this.add.text(-260, 0, `[${lvl.index}]`, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '12px',
        color: lvl.colorHex
      }).setOrigin(0.5);

      // Name & Theme
      const nameText = this.add.text(-220, -8, lvl.name, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '11px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      const themeText = this.add.text(-220, 10, lvl.theme, {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '11px',
        color: '#94a3b8'
      }).setOrigin(0, 0.5);

      // Star Performance Badge (1 - 3 Stars earned)
      const savedStars = LevelCompletionSystem.getSavedStars ? LevelCompletionSystem.getSavedStars(lvl.index) : 0;
      let starGlyph = '☆☆☆';
      let starColor = '#475569';
      if (savedStars === 3) {
        starGlyph = '★★★';
        starColor = '#facc15';
      } else if (savedStars === 2) {
        starGlyph = '★★☆';
        starColor = '#38bdf8';
      } else if (savedStars === 1) {
        starGlyph = '★☆☆';
        starColor = '#00f0ff';
      }

      const starsText = this.add.text(15, 0, starGlyph, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '12px',
        color: starColor
      }).setOrigin(0.5);

      // Difficulty Badge
      const diffText = this.add.text(130, -8, lvl.difficulty, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: lvl.colorHex
      }).setOrigin(0, 0.5);

      // Mechanics summary
      const mechText = this.add.text(130, 10, lvl.mechanics, {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '10px',
        color: '#64748b'
      }).setOrigin(0, 0.5);

      // Interactive Pointer Tag
      const selectTag = this.add.text(265, 0, idx === this.currentIndex ? '▶' : '', {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '12px',
        color: '#ffdd44'
      }).setOrigin(0.5);

      rowContainer.add([box, numText, nameText, themeText, starsText, diffText, mechText, selectTag]);
      rowContainer.box = box;
      rowContainer.tag = selectTag;
      rowContainer.lvl = lvl;

      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => {
        this.currentIndex = idx;
        this.updateRowHighlight();
        this.launchLevel();
      });

      this.rows.push(rowContainer);
    });

    this.updateRowHighlight();

    // Bottom Navigation Help
    this.add.text(w / 2, 410, '[↑/↓] or [W/S] Choose Sector  •  [1-6] Quick Jump  •  [ENTER] Launch  •  [ESC] Back', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '13px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Keyboard inputs
    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-ENTER', () => this.launchLevel());
    this.input.keyboard.on('keydown-SPACE', () => this.launchLevel());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());

    // Number keys 1-6
    for (let i = 1; i <= LEVEL_CATALOG.length; i++) {
      this.input.keyboard.on(`keydown-${i}`, () => {
        this.currentIndex = i - 1;
        this.updateRowHighlight();
        this.launchLevel();
      });
    }
  }

  moveSelection(delta) {
    this.currentIndex = (this.currentIndex + delta + LEVEL_CATALOG.length) % LEVEL_CATALOG.length;
    this.updateRowHighlight();
  }

  updateRowHighlight() {
    this.rows.forEach((row, idx) => {
      const isSelected = idx === this.currentIndex;
      const lvl = row.lvl;
      if (isSelected) {
        row.box.setStrokeStyle(2, lvl.colorNum, 1);
        row.box.setFillStyle(0x1e293b, 0.98);
        row.tag.setText('▶');
        row.setScale(1.02);
      } else {
        row.box.setStrokeStyle(1, 0x334155, 0.6);
        row.box.setFillStyle(0x0f172a, 0.9);
        row.tag.setText('');
        row.setScale(1.0);
      }
    });
  }

  launchLevel() {
    const selectedLevel = LEVEL_CATALOG[this.currentIndex];
    this.scene.start('GameScene', {
      levelIndex: selectedLevel.index,
      levelId: selectedLevel.id,
      characterId: this.characterId
    });
  }

  goBack() {
    this.scene.start('CharacterSelectScene', { characterId: this.characterId });
  }
}
