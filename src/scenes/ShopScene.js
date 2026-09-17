import { SHOP_CATALOG, ShopCategory } from '../config/shopConfig.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { CHARACTER_ROSTER } from '../config/characterConfig.js';
import { UI_CONFIG } from '../config/uiConfig.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';

/**
 * ShopScene - In-game Cosmic Shop & Universal Inventory
 * Browse, purchase, and equip Outfits, Perks, Companion Pets, and Operatives.
 * Features 2D bidirectional scrollbars (sideways and up/down) and a dedicated Inventory tab.
 */
export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  init(data) {
    this.characterId = (data && data.characterId) ? data.characterId.toUpperCase() : 'NOVA';
    this.returnScene = (data && data.returnScene) ? data.returnScene : 'GameScene';
    this.currentCategory = (data && (data.category || data.activeTab)) ? (data.category || data.activeTab) : ShopCategory.OUTFITS;
    this.selectedCardIndex = 0;
    this.cards = [];

    // 2D Scroll state
    this.scrollX = 0;
    this.scrollY = 0;
    this.maxScrollX = 0;
    this.maxScrollY = 0;
    this.isDraggingContent = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartScrollX = 0;
    this.dragStartScrollY = 0;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Deep space gradient backdrop
    this.add.rectangle(w / 2, h / 2, w, h, 0x060813);
    this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_stars').setAlpha(0.6);

    // Header Bar
    const headerBar = this.add.rectangle(w / 2, 32, w, 50, 0x0f172a, 0.95);
    headerBar.setStrokeStyle(1, 0x00f0ff, 0.4);

    this.add.text(28, 22, 'COSMIC SHOP // EMPORIUM', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: UI_CONFIG.COLOR_CYAN
    });

    // Touch Exit & Sheet Buttons
    const backBtn = this.add.rectangle(340, 32, 75, 26, 0x1e293b, 0.9);
    backBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(340, 32, '◀ BACK', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.exitShop());

    const sheetBtn = this.add.rectangle(430, 32, 85, 26, 0x1e293b, 0.9);
    sheetBtn.setStrokeStyle(1.5, 0x00f0ff, 0.7);
    this.add.text(430, 32, '👤 SHEET', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    sheetBtn.setInteractive({ useHandCursor: true });
    sheetBtn.on('pointerdown', () => this.openCharacterSheet());

    this.walletText = this.add.text(w - 28, 22, `★ CRYSTALS: ${ShopSystem.getCrystals()}`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: UI_CONFIG.COLOR_GOLD
    }).setOrigin(1, 0);

    // Category Tabs Bar (including [4] INVENTORY)
    this.createCategoryTabs(w);

    // Viewport Clipping Mask for Cards/Inventory
    this.viewBounds = { x: 20, y: 98, width: 735, height: 292 };
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.viewBounds.x, this.viewBounds.y, this.viewBounds.width, this.viewBounds.height);
    this.cardsMask = maskShape.createGeometryMask();

    // Cards Container with mask
    this.cardsContainer = this.add.container(0, 0);
    this.cardsContainer.setMask(this.cardsMask);

    // 2D Scrollbars (Horizontal Sideways and Vertical Up/Down)
    this.create2DScrollbars(w, h);

    // Render initial category cards or inventory
    this.renderCurrentCategory();

    // Footer Navigation
    this.footerText = this.add.text(w / 2, h - 18, '[1-4] Tabs  •  [WASD/Arrows/Scroll] Pan 2D  •  [ENTER] Buy / Equip  •  [ESC] Exit', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Keyboard inputs
    this.input.keyboard.on('keydown-ONE', () => this.switchCategory(ShopCategory.OUTFITS));
    this.input.keyboard.on('keydown-TWO', () => this.switchCategory(ShopCategory.PERKS));
    this.input.keyboard.on('keydown-THREE', () => this.switchCategory(ShopCategory.PETS));
    this.input.keyboard.on('keydown-FOUR', () => this.switchCategory('INVENTORY'));
    this.input.keyboard.on('keydown-LEFT', () => this.scrollHorizontally(-70));
    this.input.keyboard.on('keydown-RIGHT', () => this.scrollHorizontally(70));
    this.input.keyboard.on('keydown-UP', () => this.scrollVertically(-60));
    this.input.keyboard.on('keydown-DOWN', () => this.scrollVertically(60));
    this.input.keyboard.on('keydown-A', () => this.scrollHorizontally(-70));
    this.input.keyboard.on('keydown-D', () => this.scrollHorizontally(70));
    this.input.keyboard.on('keydown-W', () => this.scrollVertically(-60));
    this.input.keyboard.on('keydown-S', () => this.scrollVertically(60));
    this.input.keyboard.on('keydown-ENTER', () => this.triggerSelectedAction());
    this.input.keyboard.on('keydown-SPACE', () => this.triggerSelectedAction());
    this.input.keyboard.on('keydown-C', () => this.openCharacterSheet());
    this.input.keyboard.on('keydown-ESC', () => this.exitShop());

    // Mouse Wheel 2D Scroll Listener
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.scrollHorizontally(deltaX > 0 ? 50 : -50);
      } else {
        this.scrollVertically(deltaY > 0 ? 50 : -50);
      }
    });

    // Content Drag-to-Pan (Mouse & Touch)
    const dragZone = this.add.rectangle(
      this.viewBounds.x + this.viewBounds.width / 2,
      this.viewBounds.y + this.viewBounds.height / 2,
      this.viewBounds.width,
      this.viewBounds.height,
      0x000000,
      0
    ).setInteractive();

    dragZone.on('pointerdown', (pointer) => {
      this.isDraggingContent = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.dragStartScrollX = this.scrollX;
      this.dragStartScrollY = this.scrollY;
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isDraggingContent && pointer.isDown) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        this.setScroll(this.dragStartScrollX - dx, this.dragStartScrollY - dy);
      }
    });

    this.input.on('pointerup', () => {
      this.isDraggingContent = false;
    });
  }

  createCategoryTabs(w) {
    this.tabs = [
      { id: ShopCategory.OUTFITS, label: '[1] OUTFITS', key: '1' },
      { id: ShopCategory.PERKS, label: '[2] PERKS', key: '2' },
      { id: ShopCategory.PETS, label: '[3] PETS', key: '3' },
      { id: 'INVENTORY', label: '[4] INVENTORY', key: '4' }
    ];

    this.tabButtons = [];
    const tabW = 126;
    const spacing = 12;
    const startX = w / 2 - ((this.tabs.length - 1) * (tabW + spacing)) / 2;

    this.tabs.forEach((tab, idx) => {
      const tx = startX + idx * (tabW + spacing);
      const ty = 74;

      const btnBg = this.add.rectangle(tx, ty, tabW, 28, 0x0f172a, 0.9);
      btnBg.setStrokeStyle(1.5, 0x334155, 0.8);

      const btnText = this.add.text(tx, ty, tab.label, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '9px',
        color: '#94a3b8'
      }).setOrigin(0.5);

      btnBg.setInteractive({ useHandCursor: true });
      btnBg.on('pointerdown', () => this.switchCategory(tab.id));

      this.tabButtons.push({ bg: btnBg, text: btnText, id: tab.id });
    });

    this.updateTabStyles();
  }

  updateTabStyles() {
    this.tabButtons.forEach(tb => {
      const active = tb.id === this.currentCategory;
      if (active) {
        tb.bg.setFillStyle(0x1e293b, 1);
        tb.bg.setStrokeStyle(2, 0x00f0ff, 1);
        tb.text.setColor('#00f0ff');
      } else {
        tb.bg.setFillStyle(0x0f172a, 0.85);
        tb.bg.setStrokeStyle(1, 0x334155, 0.7);
        tb.text.setColor('#64748b');
      }
    });
  }

  /**
   * Builds the 2D scrollbars: horizontal track/thumb at bottom, vertical track/thumb at right
   */
  create2DScrollbars(w, h) {
    // 1. Horizontal Scrollbar (Bottom)
    this.hTrackX = 400;
    this.hTrackY = 402;
    this.hTrackWidth = 460;
    this.hTrackHeight = 8;

    this.hTrack = this.add.rectangle(this.hTrackX, this.hTrackY, this.hTrackWidth, this.hTrackHeight, 0x0f172a, 0.85);
    this.hTrack.setStrokeStyle(1, 0x334155, 0.6);
    this.hTrack.setInteractive({ useHandCursor: true });
    this.hTrack.on('pointerdown', (pointer) => {
      const localX = pointer.x - (this.hTrackX - this.hTrackWidth / 2);
      const ratio = Phaser.Math.Clamp(localX / this.hTrackWidth, 0, 1);
      this.setScroll(ratio * this.maxScrollX, this.scrollY);
    });

    this.hThumb = this.add.rectangle(this.hTrackX, this.hTrackY, 60, 8, 0x00f0ff, 0.85);
    this.hThumb.setInteractive({ useHandCursor: true, draggable: true });
    this.hThumb.on('drag', (pointer, dragX) => {
      const minX = this.hTrackX - this.hTrackWidth / 2 + this.hThumb.width / 2;
      const maxX = this.hTrackX + this.hTrackWidth / 2 - this.hThumb.width / 2;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      this.hThumb.x = clampedX;
      const range = maxX - minX;
      const ratio = range > 0 ? (clampedX - minX) / range : 0;
      this.scrollX = ratio * this.maxScrollX;
      this.cardsContainer.x = -this.scrollX;
    });

    // Horizontal arrow step buttons
    const hLeftBtn = this.add.text(this.hTrackX - this.hTrackWidth / 2 - 14, this.hTrackY, '◀', {
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    hLeftBtn.on('pointerdown', () => this.scrollHorizontally(-60));

    const hRightBtn = this.add.text(this.hTrackX + this.hTrackWidth / 2 + 14, this.hTrackY, '▶', {
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    hRightBtn.on('pointerdown', () => this.scrollHorizontally(60));

    // 2. Vertical Scrollbar (Right Side)
    this.vTrackX = 768;
    this.vTrackY = 244;
    this.vTrackWidth = 8;
    this.vTrackHeight = 270;

    this.vTrack = this.add.rectangle(this.vTrackX, this.vTrackY, this.vTrackWidth, this.vTrackHeight, 0x0f172a, 0.85);
    this.vTrack.setStrokeStyle(1, 0x334155, 0.6);
    this.vTrack.setInteractive({ useHandCursor: true });
    this.vTrack.on('pointerdown', (pointer) => {
      const localY = pointer.y - (this.vTrackY - this.vTrackHeight / 2);
      const ratio = Phaser.Math.Clamp(localY / this.vTrackHeight, 0, 1);
      this.setScroll(this.scrollX, ratio * this.maxScrollY);
    });

    this.vThumb = this.add.rectangle(this.vTrackX, this.vTrackY, 8, 60, 0x00f0ff, 0.85);
    this.vThumb.setInteractive({ useHandCursor: true, draggable: true });
    this.vThumb.on('drag', (pointer, dragX, dragY) => {
      const minY = this.vTrackY - this.vTrackHeight / 2 + this.vThumb.height / 2;
      const maxY = this.vTrackY + this.vTrackHeight / 2 - this.vThumb.height / 2;
      const clampedY = Phaser.Math.Clamp(dragY, minY, maxY);
      this.vThumb.y = clampedY;
      const range = maxY - minY;
      const ratio = range > 0 ? (clampedY - minY) / range : 0;
      this.scrollY = ratio * this.maxScrollY;
      this.cardsContainer.y = -this.scrollY;
    });

    // Vertical arrow step buttons
    const vUpBtn = this.add.text(this.vTrackX, this.vTrackY - this.vTrackHeight / 2 - 10, '▲', {
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    vUpBtn.on('pointerdown', () => this.scrollVertically(-50));

    const vDownBtn = this.add.text(this.vTrackX, this.vTrackY + this.vTrackHeight / 2 + 10, '▼', {
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    vDownBtn.on('pointerdown', () => this.scrollVertically(50));
  }

  setScroll(newX, newY) {
    this.scrollX = Phaser.Math.Clamp(newX, 0, Math.max(0, this.maxScrollX));
    this.scrollY = Phaser.Math.Clamp(newY, 0, Math.max(0, this.maxScrollY));

    this.cardsContainer.x = -this.scrollX;
    this.cardsContainer.y = -this.scrollY;

    this.updateScrollbarThumbs();
  }

  scrollHorizontally(delta) {
    this.setScroll(this.scrollX + delta, this.scrollY);
    this.playAudio(AUDIO_KEYS.UI_NAV);
  }

  scrollVertically(delta) {
    this.setScroll(this.scrollX, this.scrollY + delta);
    this.playAudio(AUDIO_KEYS.UI_NAV);
  }

  updateScrollbarThumbs() {
    // Horizontal Thumb
    const minX = this.hTrackX - this.hTrackWidth / 2 + this.hThumb.width / 2;
    const maxX = this.hTrackX + this.hTrackWidth / 2 - this.hThumb.width / 2;
    const hRatio = this.maxScrollX > 0 ? this.scrollX / this.maxScrollX : 0;
    this.hThumb.x = minX + hRatio * (maxX - minX);

    // Vertical Thumb
    const minY = this.vTrackY - this.vTrackHeight / 2 + this.vThumb.height / 2;
    const maxY = this.vTrackY + this.vTrackHeight / 2 - this.vThumb.height / 2;
    const vRatio = this.maxScrollY > 0 ? this.scrollY / this.maxScrollY : 0;
    this.vThumb.y = minY + vRatio * (maxY - minY);
  }

  switchCategory(catId) {
    if (this.currentCategory === catId) return;
    this.currentCategory = catId;
    this.selectedCardIndex = 0;
    this.scrollX = 0;
    this.scrollY = 0;
    this.cardsContainer.x = 0;
    this.cardsContainer.y = 0;
    this.updateTabStyles();
    this.renderCurrentCategory();
    this.playAudio(AUDIO_KEYS.UI_NAV);
  }

  renderCurrentCategory() {
    if (this.currentCategory === 'INVENTORY') {
      this.renderInventory();
    } else {
      this.renderCategoryCards();
    }
  }

  /**
   * Renders standard Catalog items (Outfits, Perks, Pets)
   */
  renderCategoryCards() {
    this.cardsContainer.removeAll(true);
    this.cards = [];

    const items = SHOP_CATALOG[this.currentCategory] || [];
    const count = items.length;
    const cardW = count >= 5 ? 138 : 164;
    const cardH = 265;
    const gap = count >= 5 ? 10 : 16;
    const startX = 400 - ((count - 1) * (cardW + gap)) / 2;
    const cardY = 240;

    // Determine content dimensions for 2D scrolling
    const totalW = count * (cardW + gap);
    this.maxScrollX = Math.max(0, totalW - this.viewBounds.width + 40);
    this.maxScrollY = 0; // standard cards fit vertically
    this.updateScrollbarThumbs();

    items.forEach((item, idx) => {
      const cx = startX + idx * (cardW + gap);
      const card = this.add.container(cx, cardY);

      // Card Background Box
      const box = this.add.rectangle(0, 0, cardW, cardH, 0x0f172a, 0.92);
      box.setStrokeStyle(2, 0x334155, 0.8);

      // Rarity & Category Banner
      const rarityBadge = this.add.text(0, -112, `${item.rarity.toUpperCase()}`, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: item.accentColor || '#94a3b8'
      }).setOrigin(0.5);

      // Item Visual Preview
      const preview = this.createItemPreview(item);
      preview.setPosition(0, -60);

      // Item Name
      const nameText = this.add.text(0, -12, item.name.toUpperCase(), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: count >= 5 ? '8px' : '9px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Description
      const descText = this.add.text(0, 26, item.description, {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: count >= 5 ? '10px' : '11px',
        color: '#94a3b8',
        align: 'center',
        wordWrap: { width: cardW - 16 }
      }).setOrigin(0.5);

      // Action Button
      const btn = this.add.rectangle(0, 95, cardW - 16, 26, 0x1e293b, 0.95);
      btn.setStrokeStyle(1.5, 0x00f0ff, 0.8);

      const btnText = this.add.text(0, 95, '', {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: count >= 5 ? '8px' : '9px',
        color: '#ffffff'
      }).setOrigin(0.5);

      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.handleItemAction(item));

      card.add([box, rarityBadge, preview, nameText, descText, btn, btnText]);
      card.box = box;
      card.btn = btn;
      card.btnText = btnText;
      card.item = item;

      this.cards.push(card);
      this.cardsContainer.add(card);
    });

    this.updateCardStatuses();
  }

  /**
   * Renders the comprehensive Universal Inventory tab
   * Allows player to view and select owned characters, perks, companion pets, and outfits with 1-click
   */
  renderInventory() {
    this.cardsContainer.removeAll(true);
    this.cards = [];

    let currentY = 120;
    const colWidth = 140;
    const startX = 100;

    // --- Section 1: PLAYABLE CHARACTERS ---
    const charTitle = this.add.text(startX, currentY, '👤 PLAYABLE EXPLORERS & HEROES', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#00f0ff'
    });
    this.cardsContainer.add(charTitle);
    currentY += 26;

    const characters = Object.values(CHARACTER_ROSTER);
    characters.forEach((char, idx) => {
      const cx = startX + 65 + (idx % 4) * (colWidth + 24);
      const cy = currentY + 50 + Math.floor(idx / 4) * 115;

      const card = this.add.container(cx, cy);
      const isActive = (this.characterId === char.id);

      const box = this.add.rectangle(0, 0, colWidth, 100, 0x0f172a, 0.95);
      box.setStrokeStyle(1.5, isActive ? 0x00f0ff : 0x334155, 1);

      // Character portrait
      let charTex = char.texture;
      if (!this.textures.exists(charTex)) charTex = 'player_nova';
      const sprite = this.add.image(-42, -14, charTex).setScale(1.7);

      const name = this.add.text(12, -26, char.name.toUpperCase(), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: char.colorHex || '#ffffff'
      }).setOrigin(0.5);

      const title = this.add.text(12, -10, char.title, {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '10px',
        color: '#94a3b8'
      }).setOrigin(0.5);

      // Equip / Switch Button
      const btn = this.add.rectangle(0, 26, colWidth - 16, 22, isActive ? 0x064e3b : 0x1e293b, 1);
      btn.setStrokeStyle(1.5, isActive ? 0x10b981 : 0x00f0ff, 0.9);
      const btnText = this.add.text(0, 26, isActive ? '✓ ACTIVE' : 'EQUIP', {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: isActive ? '#6ee7b7' : '#00f0ff'
      }).setOrigin(0.5);

      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this.characterId = char.id;
        this.renderInventory();
        this.playAudio(AUDIO_KEYS.UI_CONFIRM);
      });

      card.add([box, sprite, name, title, btn, btnText]);
      this.cardsContainer.add(card);
    });

    currentY += Math.ceil(characters.length / 4) * 115 + 10;

    // --- Section 2: PASSIVE PERKS ---
    const perkTitle = this.add.text(startX, currentY, '⚡ PASSIVE PERKS & MODIFIERS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#facc15'
    });
    this.cardsContainer.add(perkTitle);
    currentY += 26;

    const perks = SHOP_CATALOG.perks;
    perks.forEach((perk, idx) => {
      const cx = startX + 65 + (idx % 4) * (colWidth + 24);
      const cy = currentY + 45 + Math.floor(idx / 4) * 105;

      const card = this.add.container(cx, cy);
      const isOwned = ShopSystem.isOwned(perk.id);
      const isEquipped = (ShopSystem.getEquippedPerk() && ShopSystem.getEquippedPerk().id === perk.id);

      const box = this.add.rectangle(0, 0, colWidth, 90, 0x0f172a, 0.95);
      box.setStrokeStyle(1.5, isEquipped ? 0x10b981 : (isOwned ? 0x38bdf8 : 0x334155), 1);

      const icon = this.add.image(-42, -10, perk.iconTexture || 'badge_magnet').setScale(1.6);
      const name = this.add.text(12, -18, perk.name.toUpperCase(), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '7px',
        color: perk.accentColor || '#ffffff'
      }).setOrigin(0.5);

      const btn = this.add.rectangle(0, 24, colWidth - 16, 20, isEquipped ? 0x064e3b : (isOwned ? 0x1e293b : 0x18181b), 1);
      btn.setStrokeStyle(1, isEquipped ? 0x10b981 : (isOwned ? 0x38bdf8 : 0x64748b), 0.8);
      const btnText = this.add.text(0, 24, isEquipped ? '✓ EQUIPPED' : (isOwned ? 'EQUIP' : 'LOCKED'), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '7px',
        color: isEquipped ? '#6ee7b7' : (isOwned ? '#38bdf8' : '#64748b')
      }).setOrigin(0.5);

      if (isOwned) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
          this.handleItemAction(perk);
          this.renderInventory();
        });
      }

      card.add([box, icon, name, btn, btnText]);
      this.cardsContainer.add(card);
    });

    currentY += Math.ceil(perks.length / 4) * 105 + 10;

    // --- Section 3: COMPANION PETS ---
    const petTitle = this.add.text(startX, currentY, '🐾 COMPANION PETS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#e879f9'
    });
    this.cardsContainer.add(petTitle);
    currentY += 26;

    const pets = SHOP_CATALOG.pets;
    pets.forEach((pet, idx) => {
      const cx = startX + 65 + (idx % 4) * (colWidth + 24);
      const cy = currentY + 45 + Math.floor(idx / 4) * 105;

      const card = this.add.container(cx, cy);
      const isOwned = ShopSystem.isOwned(pet.id);
      const isEquipped = (ShopSystem.getEquippedPet() && ShopSystem.getEquippedPet().id === pet.id);

      const box = this.add.rectangle(0, 0, colWidth, 90, 0x0f172a, 0.95);
      box.setStrokeStyle(1.5, isEquipped ? 0x10b981 : (isOwned ? 0x38bdf8 : 0x334155), 1);

      let petTex = pet.texture || 'pet_cosmo';
      if (!this.textures.exists(petTex)) petTex = 'star_crystal';
      const icon = this.add.image(-42, -10, petTex).setScale(1.5);
      const name = this.add.text(12, -18, pet.name.toUpperCase(), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '7px',
        color: pet.accentColor || '#ffffff'
      }).setOrigin(0.5);

      const btn = this.add.rectangle(0, 24, colWidth - 16, 20, isEquipped ? 0x064e3b : (isOwned ? 0x1e293b : 0x18181b), 1);
      btn.setStrokeStyle(1, isEquipped ? 0x10b981 : (isOwned ? 0x38bdf8 : 0x64748b), 0.8);
      const btnText = this.add.text(0, 24, isEquipped ? '✓ EQUIPPED' : (isOwned ? 'EQUIP' : 'LOCKED'), {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '7px',
        color: isEquipped ? '#6ee7b7' : (isOwned ? '#38bdf8' : '#64748b')
      }).setOrigin(0.5);

      if (isOwned) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
          this.handleItemAction(pet);
          this.renderInventory();
        });
      }

      card.add([box, icon, name, btn, btnText]);
      this.cardsContainer.add(card);
    });

    currentY += Math.ceil(pets.length / 4) * 105 + 30;

    // Calculate maximum scroll boundaries for 2D scrolling in Inventory
    this.maxScrollX = 60;
    this.maxScrollY = Math.max(0, currentY - this.viewBounds.height);
    this.updateScrollbarThumbs();
  }

  createItemPreview(item) {
    if (item.category === ShopCategory.OUTFITS) {
      const charKey = this.characterId.toLowerCase();
      let tex = `player_${charKey}`;
      if (item.id !== 'standard') {
        const customTex = `player_${charKey}_${item.id}`;
        if (this.textures.exists(customTex)) tex = customTex;
      }
      return this.add.image(0, 0, tex).setScale(2.4);
    }

    if (item.category === ShopCategory.PERKS) {
      return this.add.image(0, 0, item.iconTexture || 'badge_magnet').setScale(2.4);
    }

    if (item.category === ShopCategory.PETS) {
      const p = this.add.image(0, 0, item.texture || 'pet_cosmo').setScale(2.2);
      this.tweens.add({
        targets: p,
        y: -6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      return p;
    }

    return this.add.image(0, 0, 'star_crystal').setScale(2.0);
  }

  updateCardStatuses() {
    const wallet = ShopSystem.getCrystals();
    this.walletText.setText(`★ CRYSTALS: ${wallet}`);

    this.cards.forEach((card, idx) => {
      const item = card.item;
      const isOwned = ShopSystem.isOwned(item.id);
      const isEquipped = ShopSystem.isEquipped(item.id, this.characterId);
      const isSelected = idx === this.selectedCardIndex;

      // Card Highlight
      if (isSelected) {
        card.box.setStrokeStyle(3, 0x00f0ff, 1);
        card.box.setFillStyle(0x1e293b, 0.98);
        card.setScale(1.03);
      } else {
        card.box.setStrokeStyle(2, 0x334155, 0.7);
        card.box.setFillStyle(0x0f172a, 0.92);
        card.setScale(1.0);
      }

      // Button Label & Color
      if (isEquipped) {
        card.btn.setFillStyle(0x064e3b, 1);
        card.btn.setStrokeStyle(1.5, 0x10b981, 1);
        card.btnText.setText('✓ EQUIPPED').setColor('#6ee7b7');
      } else if (isOwned) {
        card.btn.setFillStyle(0x1e293b, 1);
        card.btn.setStrokeStyle(1.5, 0x38bdf8, 1);
        card.btnText.setText('EQUIP').setColor('#38bdf8');
      } else {
        // Buy button
        const canAfford = wallet >= item.price;
        if (canAfford) {
          card.btn.setFillStyle(0x78350f, 1);
          card.btn.setStrokeStyle(1.5, 0xf59e0b, 1);
          card.btnText.setText(`BUY: ★ ${item.price}`).setColor('#fde047');
        } else {
          card.btn.setFillStyle(0x18181b, 0.8);
          card.btn.setStrokeStyle(1.5, 0xef4444, 0.6);
          card.btnText.setText(`★ ${item.price}`).setColor('#ef4444');
        }
      }
    });
  }

  handleItemAction(item) {
    const isOwned = ShopSystem.isOwned(item.id);
    const isEquipped = ShopSystem.isEquipped(item.id, this.characterId);

    if (isEquipped) {
      // Unequip perk or pet
      if (item.category === ShopCategory.PERKS || item.category === ShopCategory.PETS) {
        ShopSystem.unequipItem(item.category, this.characterId);
        this.playAudio(AUDIO_KEYS.UI_NAV);
      }
    } else if (isOwned) {
      // Equip item
      ShopSystem.equipItem(item, this.characterId);
      this.playAudio(AUDIO_KEYS.POWERUP_ACTIVATE);
    } else {
      // Purchase item
      const res = ShopSystem.purchaseItem(item);
      if (res.success) {
        ShopSystem.equipItem(item, this.characterId);
        this.playAudio(AUDIO_KEYS.CRYSTAL_COLLECT);
      } else {
        this.playAudio(AUDIO_KEYS.HAZARD_HIT || AUDIO_KEYS.UI_NAV);
      }
    }

    if (this.currentCategory === 'INVENTORY') {
      this.renderInventory();
    } else {
      this.updateCardStatuses();
    }
  }

  moveSelection(delta) {
    if (this.cards.length === 0) return;
    this.selectedCardIndex = (this.selectedCardIndex + delta + this.cards.length) % this.cards.length;
    this.updateCardStatuses();
    this.playAudio(AUDIO_KEYS.UI_NAV);
  }

  triggerSelectedAction() {
    const card = this.cards[this.selectedCardIndex];
    if (card && card.item) {
      this.handleItemAction(card.item);
    }
  }

  openCharacterSheet() {
    this.scene.start('CharacterSheetScene', {
      characterId: this.characterId,
      returnScene: 'ShopScene'
    });
  }

  exitShop() {
    this.scene.start(this.returnScene, { characterId: this.characterId });
  }

  playAudio(key) {
    const gs = this.scene.get('GameScene');
    if (gs && gs.audioSystem) {
      gs.audioSystem.playSFX(key);
    }
  }
}
