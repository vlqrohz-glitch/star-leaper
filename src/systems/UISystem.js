import { UI_CONFIG, UIState } from '../config/uiConfig.js';
import { AUDIO_KEYS } from '../config/audioConfig.js';
import { POWERUP_CONFIG } from '../config/powerUpConfig.js';
import { LevelCompletionSystem } from './LevelCompletionSystem.js';
import { CheatSystem } from './CheatSystem.js';
import { ScoreboardSystem } from './ScoreboardSystem.js';

/**
 * Dedicated UI & Presentation System for Star-Leaper: Orion Odyssey
 * Manages HUD, Title Screen with main menu options, Pause Menu, Settings,
 * Game Over, and Level Complete overlays with responsive presentation.
 */
export class UISystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentState = UIState.TITLE;

    // UI Containers
    this.hudContainer = null;
    this.titleContainer = null;
    this.pauseContainer = null;
    this.settingsContainer = null;
    this.gameOverContainer = null;
    this.levelCompleteContainer = null;
    this.cheatContainer = null;
    this.openedCheatFromGameplay = false;
    this.scoreboardContainer = null;
    this.scoreboardTableContainer = null;
    this.scoreboardFilterSector = null;
    this.openedScoreboardFromGameplay = false;

    // HUD text references
    this.hudScoreText = null;
    this.hudCrystalsText = null;
    this.hudStatusText = null;
    this.hudPowerUpText = null;
    this.guideText = null;
    this.telemetryText = null;

    // HUD in-game action buttons
    this.hudSettingsBtn = null;
    this.hudPauseBtn = null;
    this.hudPauseText = null;
    this.openedSettingsFromGameplay = false;

    // Overlays references
    this.titlePromptText = null;
    this.gameOverStatsText = null;
    this.completeStatsText = null;

    // Menu selection indices
    this.titleMenuIndex = 0;
    this.pauseMenuIndex = 0;
  }

  /**
   * Builds all UI containers and displays the initial title screen
   */
  initialize() {
    this.createGameplayHUD();
    this.createTitleScreen();
    this.createPauseOverlay();
    this.createSettingsOverlay();
    this.createCheatOverlay();
    this.createScoreboardOverlay();
    this.createGameOverOverlay();
    this.createLevelCompleteOverlay();

    this.showTitleScreen();
  }

  /**
   * Creates the in-game HUD overlay
   */
  createGameplayHUD() {
    this.hudContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(90);

    const pad = UI_CONFIG.HUD_PADDING;

    // Line 1 Left: SCORE
    this.hudScoreText = this.scene.add.text(pad.x, pad.y, 'SCORE: 000000', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_FONT_SIZE,
      color: UI_CONFIG.COLOR_GOLD,
      stroke: '#000000',
      strokeThickness: 3
    });

    // Line 1 Center: STAR CRYSTALS
    this.hudCrystalsText = this.scene.add.text(190, pad.y, '★  CRYSTALS: 00 / 20', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 3
    });

    // Line 1 Center-Right: LEVEL SECTOR & OPERATIVE
    this.hudSectorText = this.scene.add.text(375, pad.y, 'SEC 1 • NOVA', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_SMALL_FONT_SIZE,
      color: '#94a3b8',
      stroke: '#000000',
      strokeThickness: 3
    });

    // In-game Scoreboard Button (Gold Border)
    const scoresBtn = this.scene.add.rectangle(495, pad.y + 7, 70, 22, 0x0f172a, 0.85);
    scoresBtn.setStrokeStyle(1.5, 0xfacc15, 0.85);
    const scoresBtnText = this.scene.add.text(495, pad.y + 7, '🏆 SCORES', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#facc15'
    }).setOrigin(0.5);
    scoresBtn.setInteractive({ useHandCursor: true });
    scoresBtn.on('pointerover', () => {
      scoresBtn.setFillStyle(0x1e293b, 0.95);
      scoresBtn.setStrokeStyle(2, 0xfacc15, 1);
      scoresBtn.setScale(1.05);
      scoresBtnText.setScale(1.05);
    });
    scoresBtn.on('pointerout', () => {
      scoresBtn.setFillStyle(0x0f172a, 0.85);
      scoresBtn.setStrokeStyle(1.5, 0xfacc15, 0.85);
      scoresBtn.setScale(1.0);
      scoresBtnText.setScale(1.0);
    });
    scoresBtn.on('pointerdown', () => {
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.showScoreboard();
    });

    // In-game Cheats Button (Purple Border)
    const codesBtn = this.scene.add.rectangle(578, pad.y + 7, 68, 22, 0x0f172a, 0.85);
    codesBtn.setStrokeStyle(1.5, 0xc084fc, 0.85);
    const codesBtnText = this.scene.add.text(578, pad.y + 7, '★ CODES', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#c084fc'
    }).setOrigin(0.5);
    codesBtn.setInteractive({ useHandCursor: true });
    codesBtn.on('pointerover', () => {
      codesBtn.setFillStyle(0x1e293b, 0.95);
      codesBtn.setStrokeStyle(2, 0xc084fc, 1);
      codesBtn.setScale(1.05);
      codesBtnText.setScale(1.05);
    });
    codesBtn.on('pointerout', () => {
      codesBtn.setFillStyle(0x0f172a, 0.85);
      codesBtn.setStrokeStyle(1.5, 0xc084fc, 0.85);
      codesBtn.setScale(1.0);
      codesBtnText.setScale(1.0);
    });
    codesBtn.on('pointerdown', () => {
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.showCheatTerminal();
    });

    // In-Game Settings Button (Interactive Cyber Button)
    const settingsBtn = this.scene.add.rectangle(662, pad.y + 7, 74, 22, 0x0f172a, 0.85);
    settingsBtn.setStrokeStyle(1.5, 0xffdd44, 0.85);
    const settingsBtnText = this.scene.add.text(662, pad.y + 7, '⚙ SETTINGS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#ffdd44'
    }).setOrigin(0.5);
    settingsBtn.setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => {
      settingsBtn.setFillStyle(0x1e293b, 0.95);
      settingsBtn.setStrokeStyle(2, 0xffdd44, 1);
      settingsBtn.setScale(1.05);
      settingsBtnText.setScale(1.05);
    });
    settingsBtn.on('pointerout', () => {
      settingsBtn.setFillStyle(0x0f172a, 0.85);
      settingsBtn.setStrokeStyle(1.5, 0xffdd44, 0.85);
      settingsBtn.setScale(1.0);
      settingsBtnText.setScale(1.0);
    });
    settingsBtn.on('pointerdown', () => {
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.showSettings();
    });
    this.hudSettingsBtn = settingsBtn;

    // In-Game Pause Button (Interactive Cyber Button)
    const pauseBtn = this.scene.add.rectangle(750, pad.y + 7, 66, 22, 0x0f172a, 0.85);
    pauseBtn.setStrokeStyle(1.5, 0x00f0ff, 0.85);
    const pauseBtnText = this.scene.add.text(750, pad.y + 7, '⏸ PAUSE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerover', () => {
      pauseBtn.setFillStyle(0x1e293b, 0.95);
      pauseBtn.setStrokeStyle(2, 0x00f0ff, 1);
      pauseBtn.setScale(1.05);
      pauseBtnText.setScale(1.05);
    });
    pauseBtn.on('pointerout', () => {
      pauseBtn.setFillStyle(0x0f172a, 0.85);
      pauseBtn.setStrokeStyle(1.5, 0x00f0ff, 0.85);
      pauseBtn.setScale(1.0);
      pauseBtnText.setScale(1.0);
    });
    pauseBtn.on('pointerdown', () => {
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.scene.togglePause();
    });
    this.hudPauseBtn = pauseBtn;
    this.hudPauseText = pauseBtnText;

    // Line 2 Left: HEALTH & LIVES
    this.hudStatusText = this.scene.add.text(pad.x, pad.y + 22, 'HEALTH: [■■■] 3/3   LIVES: 3', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 3
    });

    // Line 2 Center: ACTIVE WEAPON READOUT
    this.hudWeaponText = this.scene.add.text(305, pad.y + 22, 'WEAPON: [REVOLVER] [F]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_SMALL_FONT_SIZE,
      color: '#facc15',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Line 2 Right: ACTIVE POWER-UP READOUT
    this.hudPowerUpText = this.scene.add.text(510, pad.y + 22, 'MODULE: --', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.HUD_FONT_SIZE,
      color: UI_CONFIG.COLOR_MUTED,
      stroke: '#000000',
      strokeThickness: 3
    });

    // Line 3: CONTROLS & SHORTCUT GUIDE (Primary: Equip: [Q], Fire/Attack: [E], also supports Attack/Use: [E] and Attack: [F])
    this.guideText = this.scene.add.text(
      pad.x,
      pad.y + 42,
      'Move: [A/D] | Jump: [Space/W] | Equip: [Q] | Fire: [E] | Pause: [ESC] | Scores: [B] | Restart: [R]',
      {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '11px',
        color: '#94a3b8',
        stroke: '#000000',
        strokeThickness: 2
      }
    );

    // Live Telemetry Bar
    this.telemetryText = this.scene.add.text(pad.x, 62, '', {
      fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
      fontSize: '9px',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Arena Boss Health Bar (Centered in top HUD)
    this.hudBossContainer = this.scene.add.container(400, 26).setVisible(false);
    const bossBarBg = this.scene.add.rectangle(0, 0, 260, 16, 0x0f172a, 0.92);
    bossBarBg.setStrokeStyle(1.5, 0xef4444, 0.9);
    this.hudBossText = this.scene.add.text(0, -14, '★ BOSS: ALPHA DREADNOUGHT ★', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.hudBossFill = this.scene.add.rectangle(-125, 0, 250, 10, 0xef4444, 1).setOrigin(0, 0.5);
    this.hudBossHpText = this.scene.add.text(0, 0, '150 / 150', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '7px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.hudBossContainer.add([bossBarBg, this.hudBossFill, this.hudBossText, this.hudBossHpText]);

    this.hudContainer.add([
      this.hudScoreText,
      this.hudCrystalsText,
      this.hudSectorText,
      scoresBtn,
      scoresBtnText,
      codesBtn,
      codesBtnText,
      settingsBtn,
      settingsBtnText,
      pauseBtn,
      pauseBtnText,
      this.hudStatusText,
      this.hudWeaponText,
      this.hudPowerUpText,
      this.guideText,
      this.telemetryText,
      this.hudBossContainer
    ]);
  }

  /**
   * Creates the Title/Start Screen overlay with menu options
   */
  createTitleScreen() {
    this.titleContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(100);

    // Dark backdrop scrim
    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, 0.92);

    // Decorative cyber frame
    const frame = this.scene.add.rectangle(0, 0, 620, 340, UI_CONFIG.HEX_PANEL_BG, 0.95);
    frame.setStrokeStyle(2, UI_CONFIG.HEX_BORDER_CYAN, 0.8);

    // Main Game Title
    const titleText = this.scene.add.text(0, -115, 'STAR-LEAPER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.BANNER_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Subtitle
    const subtitleText = this.scene.add.text(0, -86, 'ORION ODYSSEY', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SUBTITLE_FONT_SIZE,
      color: UI_CONFIG.COLOR_GOLD,
      letterSpacing: 2
    }).setOrigin(0.5);

    // Relocated Primary Prompt Text: Placed below menu options at Y = +116 with cyan glow and clickability
    this.titlePromptText = this.scene.add.text(0, 116, 'PRESS ENTER TO START', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '11px',
      color: '#00f0ff',
      stroke: '#000000',
      strokeThickness: 3,
      letterSpacing: 2
    }).setOrigin(0.5);

    this.titlePromptText.setInteractive({ useHandCursor: true });
    this.titlePromptText.on('pointerover', () => {
      this.titlePromptText.setColor('#ffdd44');
      this.titlePromptText.setScale(1.08);
    });
    this.titlePromptText.on('pointerout', () => {
      this.titlePromptText.setColor('#00f0ff');
      this.titlePromptText.setScale(1.0);
    });
    this.titlePromptText.on('pointerdown', () => {
      this.selectTitleMenuOption('play');
    });

    // Domain Watermark
    const domainWatermark = this.scene.add.text(290, -154, '🌐 STARLEAPER.IO', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: UI_CONFIG.COLOR_CYAN,
      letterSpacing: 1
    }).setOrigin(1, 0).setAlpha(0.85);

    this.titleContainer.add([scrim, frame, titleText, subtitleText, this.titlePromptText, domainWatermark]);

    // Interactive Menu Buttons Container (Centered neatly between subtitle and start prompt)
    this.titleMenuItems = [];
    const menuOptions = [
      { id: 'play', label: '[1] PLAY SECTOR' },
      { id: 'characters', label: '[2] SELECT EXPLORER' },
      { id: 'sheet', label: '[3] CHARACTER SHEET' },
      { id: 'shop', label: '[4] COSMIC SHOP' },
      { id: 'levels', label: '[5] SELECT SECTOR' },
      { id: 'settings', label: '[6] SETTINGS' },
      { id: 'cheats', label: '[7] CHEAT TERMINAL' },
      { id: 'scoreboard', label: '[8] SCOREBOARD' }
    ];

    menuOptions.forEach((opt, idx) => {
      const btnY = -52 + idx * 20;
      // Transparent hit area
      const btnBg = this.scene.add.rectangle(0, btnY, 320, 20, 0x000000, 0);

      const defaultColor = idx === 0 ? '#ffdd44' : '#e2e8f0';
      const btnText = this.scene.add.text(0, btnY, opt.label, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '10px',
        color: defaultColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const onHover = () => {
        btnText.setColor('#00f0ff');
        btnText.setScale(1.08);
      };
      const onOut = () => {
        btnText.setColor(defaultColor);
        btnText.setScale(1.0);
      };

      btnBg.setInteractive({ useHandCursor: true });
      btnBg.on('pointerover', onHover);
      btnBg.on('pointerout', onOut);
      btnBg.on('pointerdown', () => {
        this.selectTitleMenuOption(opt.id);
      });

      btnText.setInteractive({ useHandCursor: true });
      btnText.on('pointerover', onHover);
      btnText.on('pointerout', onOut);
      btnText.on('pointerdown', () => {
        this.selectTitleMenuOption(opt.id);
      });

      this.titleMenuItems.push({ bg: btnBg, text: btnText, id: opt.id });
      this.titleContainer.add([btnBg, btnText]);
    });

    // Controls tip (Primary: Equip: [Q], Fire: [E], also supports Attack: [F] and Attack/Use: [E])
    const controlsTip = this.scene.add.text(
      0,
      144,
      'Controls: [A/D] Move  •  [W]/[SPACE] Jump  •  [Q] Equip  •  [E] Fire  •  [ESC] Pause  •  [B] Scores',
      {
        fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
        fontSize: '10px',
        color: '#64748b'
      }
    ).setOrigin(0.5);

    this.titleContainer.add(controlsTip);
  }

  selectTitleMenuOption(optionId) {
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
    }

    if (optionId === 'play') {
      this.scene.handleStartInput();
    } else if (optionId === 'characters') {
      this.scene.scene.start('CharacterSelectScene', {
        characterId: this.scene.characterId || 'NOVA'
      });
    } else if (optionId === 'sheet') {
      this.scene.scene.start('CharacterSheetScene', {
        characterId: this.scene.characterId || 'NOVA',
        returnScene: 'GameScene'
      });
    } else if (optionId === 'shop') {
      this.scene.scene.start('ShopScene', {
        characterId: this.scene.characterId || 'NOVA',
        returnScene: 'GameScene'
      });
    } else if (optionId === 'levels') {
      this.scene.scene.start('LevelSelectScene', {
        characterId: this.scene.characterId || 'NOVA',
        levelIndex: this.scene.levelIndex || 1
      });
    } else if (optionId === 'settings') {
      this.showSettings();
    } else if (optionId === 'cheats') {
      this.showCheatTerminal();
    } else if (optionId === 'scoreboard') {
      this.showScoreboard();
    }
  }

  /**
   * Creates the Pause Menu overlay
   */
  createPauseOverlay() {
    this.pauseContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(110).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, 0.85);
    const panel = this.scene.add.rectangle(0, 0, 440, 290, UI_CONFIG.HEX_PANEL_BG, 0.95);
    panel.setStrokeStyle(2, UI_CONFIG.HEX_BORDER_CYAN, 0.9);

    const title = this.scene.add.text(0, -100, 'PAUSED', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const pauseDomain = this.scene.add.text(200, -132, 'starleaper.io', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#475569'
    }).setOrigin(1, 0);

    this.pauseContainer.add([scrim, panel, title, pauseDomain]);

    this.pauseMenuItems = [];
    const pauseOptions = [
      { id: 'resume', label: 'RESUME [ESC]' },
      { id: 'restart', label: 'RESTART SECTOR [R]' },
      { id: 'sheet', label: 'CHARACTER SHEET [C]' },
      { id: 'scoreboard', label: 'SCOREBOARD [B]' },
      { id: 'settings', label: 'SETTINGS' },
      { id: 'cheats', label: 'CHEAT TERMINAL' },
      { id: 'menu', label: 'MAIN MENU' }
    ];

    pauseOptions.forEach((opt, idx) => {
      const btnY = -56 + idx * 25;
      // Transparent hit area (visible rectangle removed)
      const btnBg = this.scene.add.rectangle(0, btnY, 280, 23, 0x000000, 0);

      const defaultColor = idx === 0 ? '#ffdd44' : '#e2e8f0';
      const btnText = this.scene.add.text(0, btnY, opt.label, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '10px',
        color: defaultColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const onHover = () => {
        btnText.setColor('#00f0ff');
        btnText.setScale(1.08);
      };
      const onOut = () => {
        btnText.setColor(defaultColor);
        btnText.setScale(1.0);
      };

      btnBg.setInteractive({ useHandCursor: true });
      btnBg.on('pointerover', onHover);
      btnBg.on('pointerout', onOut);
      btnBg.on('pointerdown', () => this.handlePauseSelect(opt.id));

      btnText.setInteractive({ useHandCursor: true });
      btnText.on('pointerover', onHover);
      btnText.on('pointerout', onOut);
      btnText.on('pointerdown', () => this.handlePauseSelect(opt.id));

      this.pauseMenuItems.push({ bg: btnBg, text: btnText, id: opt.id });
      this.pauseContainer.add([btnBg, btnText]);
    });
  }

  handlePauseSelect(id) {
    if (id === 'resume') {
      this.togglePause();
    } else if (id === 'restart') {
      this.togglePause();
      this.scene.restartLevel();
    } else if (id === 'sheet') {
      this.togglePause();
      this.scene.scene.start('CharacterSheetScene', {
        characterId: this.scene.characterId || 'NOVA',
        returnScene: 'GameScene'
      });
    } else if (id === 'scoreboard') {
      this.showScoreboard();
    } else if (id === 'settings') {
      this.showSettings();
    } else if (id === 'cheats') {
      this.showCheatTerminal();
    } else if (id === 'menu') {
      this.togglePause();
      this.scene.returnToTitleScreen();
    }
  }

  /**
   * Creates the Settings Menu overlay
   */
  createSettingsOverlay() {
    this.settingsContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(120).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, 0.9);
    const panel = this.scene.add.rectangle(0, 0, 520, 330, UI_CONFIG.HEX_PANEL_BG, 0.95);
    panel.setStrokeStyle(2, UI_CONFIG.HEX_BORDER_CYAN, 0.9);

    const title = this.scene.add.text(0, -125, 'SETTINGS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN
    }).setOrigin(0.5);

    // Audio & Visual Options
    this.settingsMusicText = this.scene.add.text(0, -80, 'MUSIC: ON [Mute: M]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.settingsMusicText.setInteractive({ useHandCursor: true });
    this.settingsMusicText.on('pointerdown', () => {
      if (this.scene.audioSystem) {
        this.scene.audioSystem.toggleMute();
        this.settingsMusicText.setText(`MUSIC: ${this.scene.audioSystem.muted ? 'OFF' : 'ON'} [Mute: M]`);
      }
    });

    this.settingsShakeText = this.scene.add.text(0, -45, 'SCREEN SHAKE: ENABLED', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#34d399'
    }).setOrigin(0.5);

    this.settingsFullscreenText = this.scene.add.text(0, -10, 'FULLSCREEN: TOGGLE [F]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#ffdd44'
    }).setOrigin(0.5);
    this.settingsFullscreenText.setInteractive({ useHandCursor: true });
    this.settingsFullscreenText.on('pointerdown', () => {
      if (window.toggleGameFullscreen) window.toggleGameFullscreen();
    });

    // Touch Button Size Row
    const touchSizeLabel = this.scene.add.text(0, 24, 'TOUCH BUTTON SIZE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    const sizePresets = [0.75, 1.0, 1.25, 1.5];
    const sizeLabels = { '0.75': '75% [COMPACT]', '1': '100% [STANDARD]', '1.25': '125% [LARGE]', '1.5': '150% [MAX]' };

    const minusBtn = this.scene.add.rectangle(-130, 52, 40, 26, 0x1e293b, 0.95);
    minusBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const minusText = this.scene.add.text(-130, 52, '−', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '14px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    minusBtn.setInteractive({ useHandCursor: true });

    const currentScale = (typeof window.getTouchButtonScale === 'function') ? window.getTouchButtonScale() : 1.0;
    this.settingsTouchSizeText = this.scene.add.text(0, 52, sizeLabels[currentScale] || `${Math.round(currentScale * 100)}%`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#ffdd44'
    }).setOrigin(0.5);

    const plusBtn = this.scene.add.rectangle(130, 52, 40, 26, 0x1e293b, 0.95);
    plusBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const plusText = this.scene.add.text(130, 52, '+', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '14px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    plusBtn.setInteractive({ useHandCursor: true });

    const adjustScale = (delta) => {
      const cur = (typeof window.getTouchButtonScale === 'function') ? window.getTouchButtonScale() : 1.0;
      let idx = sizePresets.findIndex(p => Math.abs(p - cur) < 0.05);
      if (idx === -1) idx = 1;
      let nextIdx = Math.max(0, Math.min(sizePresets.length - 1, idx + delta));
      const newScale = sizePresets[nextIdx];
      if (typeof window.setTouchButtonScale === 'function') {
        window.setTouchButtonScale(newScale);
      }
      this.settingsTouchSizeText.setText(sizeLabels[newScale] || `${Math.round(newScale * 100)}%`);
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
    };

    minusBtn.on('pointerdown', () => adjustScale(-1));
    plusBtn.on('pointerdown', () => adjustScale(1));

    // Close button
    const closeBtn = this.scene.add.rectangle(0, 105, 200, 30, 0x1e293b, 0.95);
    closeBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const closeText = this.scene.add.text(0, 105, 'CLOSE [X]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '10px',
      color: '#00f0ff'
    }).setOrigin(0.5);

    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hideSettings());

    this.settingsContainer.add([
      scrim,
      panel,
      title,
      this.settingsMusicText,
      this.settingsShakeText,
      this.settingsFullscreenText,
      touchSizeLabel,
      minusBtn,
      minusText,
      this.settingsTouchSizeText,
      plusBtn,
      plusText,
      closeBtn,
      closeText
    ]);
  }

  /**
   * Creates the Secret Cheat Code Terminal overlay
   */
  createCheatOverlay() {
    this.cheatContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(130).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, 0.92);
    const panel = this.scene.add.rectangle(0, 0, 560, 360, UI_CONFIG.HEX_PANEL_BG, 0.96);
    panel.setStrokeStyle(2, 0xfacc15, 0.9);

    const title = this.scene.add.text(0, -145, '★ SECRET CHEAT TERMINAL ★', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: '#facc15',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const sub = this.scene.add.text(0, -120, 'TAP A CODE CHIP OR REDEEM CODES FOR FREE REWARDS', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '11px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.cheatStatusText = this.scene.add.text(0, -92, 'Awaiting code authorization...', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.cheatContainer.add([scrim, panel, title, sub, this.cheatStatusText]);

    // 6 Quick-Tap Cheat Chips (2 columns x 3 rows)
    const chips = [
      { code: 'YEEHAW', label: '★ YEEHAW (ALL ACCESS)', color: '#facc15' },
      { code: 'COWBOY', label: '🤠 COWBOY (WEST HEROES)', color: '#f97316' },
      { code: 'RODEO', label: '🐎 RODEO (HORSE & BEAR)', color: '#34d399' },
      { code: 'QUICKDRAW', label: '⚡ QUICKDRAW (PERKS)', color: '#38bdf8' },
      { code: 'GOLDRUSH', label: '💰 GOLDRUSH (+5,000★)', color: '#facc15' },
      { code: 'WESTWORLD', label: '🏜️ WESTWORLD (SECTOR 6)', color: '#fb923c' }
    ];

    chips.forEach((ch, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = col === 0 ? -130 : 130;
      const cy = -52 + row * 44;

      const chipBg = this.scene.add.rectangle(cx, cy, 245, 34, 0x0f172a, 0.95);
      chipBg.setStrokeStyle(1.5, Phaser.Display.Color.HexStringToColor(ch.color).color, 0.85);

      const chipText = this.scene.add.text(cx, cy, ch.label, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8.5px',
        color: ch.color,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const onRedeem = () => {
        const res = CheatSystem.redeemCode(ch.code, this.scene);
        this.applyCheatResult(res);
      };

      chipBg.setInteractive({ useHandCursor: true });
      chipBg.on('pointerover', () => {
        chipBg.setFillStyle(0x1e293b, 1);
        chipBg.setScale(1.03);
        chipText.setScale(1.03);
      });
      chipBg.on('pointerout', () => {
        chipBg.setFillStyle(0x0f172a, 0.95);
        chipBg.setScale(1.0);
        chipText.setScale(1.0);
      });
      chipBg.on('pointerdown', onRedeem);

      chipText.setInteractive({ useHandCursor: true });
      chipText.on('pointerdown', onRedeem);

      this.cheatContainer.add([chipBg, chipText]);
    });

    // Custom Code Prompt / Manual Entry Button
    const customPromptBg = this.scene.add.rectangle(0, 95, 320, 28, 0x1e293b, 0.95);
    customPromptBg.setStrokeStyle(1.5, 0x64748b, 0.8);
    const customPromptText = this.scene.add.text(0, 95, '⌨️ ENTER CUSTOM CODE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    const onCustomCode = () => {
      const entered = window.prompt ? window.prompt('Enter Cheat Code (e.g. YEEHAW, COWBOY, RODEO, GOLDRUSH, WESTWORLD, QUICKDRAW, INVINCIBLE):') : null;
      if (entered) {
        const res = CheatSystem.redeemCode(entered, this.scene);
        this.applyCheatResult(res);
      }
    };

    customPromptBg.setInteractive({ useHandCursor: true });
    customPromptBg.on('pointerdown', onCustomCode);
    customPromptText.setInteractive({ useHandCursor: true });
    customPromptText.on('pointerdown', onCustomCode);

    // Close Button
    const closeBtn = this.scene.add.rectangle(0, 138, 180, 26, 0x0f172a, 0.95);
    closeBtn.setStrokeStyle(1.5, UI_CONFIG.HEX_BORDER_CYAN, 0.9);
    const closeBtnText = this.scene.add.text(0, 138, 'CLOSE [ESC / C]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: UI_CONFIG.COLOR_CYAN
    }).setOrigin(0.5);

    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hideCheatTerminal());
    closeBtnText.setInteractive({ useHandCursor: true });
    closeBtnText.on('pointerdown', () => this.hideCheatTerminal());

    this.cheatContainer.add([customPromptBg, customPromptText, closeBtn, closeBtnText]);
  }

  applyCheatResult(res) {
    if (!res) return;
    if (this.cheatStatusText) {
      if (res.success) {
        this.cheatStatusText.setText(res.title || '★ CHEAT ACTIVATED! ★').setColor('#22c55e');
        this.scene.tweens.add({
          targets: this.cheatStatusText,
          scale: 1.15,
          duration: 120,
          yoyo: true
        });
      } else {
        this.cheatStatusText.setText(res.message || 'Invalid code.').setColor('#ef4444');
      }
    }
    this.updateHUD();
  }

  showCheatTerminal() {
    if (this.currentState === UIState.GAMEPLAY && !this.scene.isGameOver && !this.scene.levelCompletionSystem.isLevelComplete()) {
      if (!this.scene.physics.world.isPaused) {
        this.scene.physics.pause();
        this.openedCheatFromGameplay = true;
      }
    }
    if (this.cheatContainer) {
      this.cheatContainer.setVisible(true);
    }
  }

  hideCheatTerminal() {
    if (this.cheatContainer) {
      this.cheatContainer.setVisible(false);
    }
    if (this.openedCheatFromGameplay) {
      this.openedCheatFromGameplay = false;
      if (this.scene.physics.world.isPaused && this.currentState !== UIState.PAUSED) {
        this.scene.physics.resume();
      }
    }
  }

  isCheatTerminalActive() {
    return Boolean(this.cheatContainer && this.cheatContainer.visible);
  }

  /**
   * Creates the Galactic Scoreboard & Leaderboard overlay
   */
  createScoreboardOverlay() {
    this.scoreboardContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(135).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, 0.92);
    const panel = this.scene.add.rectangle(0, 0, 600, 370, UI_CONFIG.HEX_PANEL_BG, 0.96);
    panel.setStrokeStyle(2, 0xfacc15, 0.9);

    const title = this.scene.add.text(0, -152, '🏆 GALACTIC SCOREBOARD // HALL OF FAME 🏆', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '12px',
      color: '#facc15',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Sector Filter Buttons
    const filterRow = this.scene.add.container(0, -122);
    const filters = [
      { id: null, label: 'ALL SECTORS' },
      { id: 1, label: 'SEC 1' },
      { id: 2, label: 'SEC 2' },
      { id: 3, label: 'SEC 3' },
      { id: 4, label: 'SEC 4' },
      { id: 5, label: 'SEC 5' },
      { id: 6, label: 'SEC 6' }
    ];

    this.scoreboardFilterButtons = [];
    const filterW = 68;
    const startFX = -((filters.length - 1) * (filterW + 6)) / 2;

    filters.forEach((f, idx) => {
      const fx = startFX + idx * (filterW + 6);
      const bg = this.scene.add.rectangle(fx, 0, filterW, 20, 0x0f172a, 0.9);
      bg.setStrokeStyle(1, 0x334155, 0.8);

      const text = this.scene.add.text(fx, 0, f.label, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '7px',
        color: '#94a3b8'
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.scoreboardFilterSector = f.id;
        this.updateScoreboardFilterStyles();
        this.renderScoreboardTable();
        if (this.scene.audioSystem) this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_NAV);
      });

      this.scoreboardFilterButtons.push({ bg, text, id: f.id });
      filterRow.add([bg, text]);
    });

    // Table Header Row
    const headerY = -95;
    const colRank = this.scene.add.text(-250, headerY, 'RANK', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });
    const colOp = this.scene.add.text(-185, headerY, 'HERO', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });
    const colName = this.scene.add.text(-90, headerY, 'HANDLE', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });
    const colSec = this.scene.add.text(35, headerY, 'SECTOR', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });
    const colStars = this.scene.add.text(125, headerY, 'STARS', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });
    const colScore = this.scene.add.text(205, headerY, 'SCORE', { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: '8px', color: '#94a3b8' });

    const tableLine = this.scene.add.line(0, -82, -260, 0, 260, 0, 0x334155, 0.8);

    // Table Content Rows Container
    this.scoreboardTableContainer = this.scene.add.container(0, 0);

    // Bottom Controls & Personal Best
    this.scoreboardPbText = this.scene.add.text(-250, 150, `PERSONAL BEST: ${ScoreboardSystem.getPersonalBest()} PTS`, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#facc15'
    }).setOrigin(0, 0.5);

    const resetBtn = this.scene.add.rectangle(110, 150, 115, 24, 0x1e293b, 0.95);
    resetBtn.setStrokeStyle(1.5, 0xef4444, 0.8);
    const resetText = this.scene.add.text(110, 150, '↺ DEFAULTS', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#ef4444'
    }).setOrigin(0.5);
    resetBtn.setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      ScoreboardSystem.resetDefaults();
      this.renderScoreboardTable();
      if (this.scene.audioSystem) this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
    });

    const closeBtn = this.scene.add.rectangle(225, 150, 85, 24, 0x1e293b, 0.95);
    closeBtn.setStrokeStyle(1.5, 0x00f0ff, 0.8);
    const closeText = this.scene.add.text(225, 150, '✖ CLOSE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hideScoreboard());

    scrim.setInteractive();
    scrim.on('pointerdown', (p) => {
      if (Math.abs(p.x - 400) > 310 || Math.abs(p.y - 225) > 190) {
        this.hideScoreboard();
      }
    });

    this.scoreboardContainer.add([
      scrim,
      panel,
      title,
      filterRow,
      colRank,
      colOp,
      colName,
      colSec,
      colStars,
      colScore,
      tableLine,
      this.scoreboardTableContainer,
      this.scoreboardPbText,
      resetBtn,
      resetText,
      closeBtn,
      closeText
    ]);

    this.updateScoreboardFilterStyles();
    this.renderScoreboardTable();
  }

  updateScoreboardFilterStyles() {
    if (!this.scoreboardFilterButtons) return;
    this.scoreboardFilterButtons.forEach(fb => {
      const active = (fb.id === this.scoreboardFilterSector);
      if (active) {
        fb.bg.setFillStyle(0x1e293b, 1);
        fb.bg.setStrokeStyle(1.5, 0xfacc15, 1);
        fb.text.setColor('#facc15');
      } else {
        fb.bg.setFillStyle(0x0f172a, 0.85);
        fb.bg.setStrokeStyle(1, 0x334155, 0.7);
        fb.text.setColor('#94a3b8');
      }
    });
  }

  renderScoreboardTable() {
    if (!this.scoreboardTableContainer) return;
    this.scoreboardTableContainer.removeAll(true);

    const scores = ScoreboardSystem.getScores(this.scoreboardFilterSector).slice(0, 10);
    const startY = -68;
    const rowH = 20;

    scores.forEach((s, idx) => {
      const ry = startY + idx * rowH;
      const isTop1 = (idx === 0);
      const isTop2 = (idx === 1);
      const isTop3 = (idx === 2);

      let rowColor = '#38bdf8';
      let rankPrefix = `#${s.rank}`;
      if (isTop1) {
        rowColor = '#facc15';
        rankPrefix = `👑 #1`;
      } else if (isTop2) {
        rowColor = '#e2e8f0';
        rankPrefix = `🥈 #2`;
      } else if (isTop3) {
        rowColor = '#f97316';
        rankPrefix = `🥉 #3`;
      }

      // Alternating row background
      if (idx % 2 === 1) {
        const rowBg = this.scene.add.rectangle(0, ry + 4, 520, 18, 0x1e293b, 0.35);
        this.scoreboardTableContainer.add(rowBg);
      }

      const tRank = this.scene.add.text(-250, ry, rankPrefix, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: rowColor
      });

      const tOp = this.scene.add.text(-185, ry, s.operative || 'NOVA', {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: '#ffffff'
      });

      const tName = this.scene.add.text(-90, ry, s.name, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: rowColor
      });

      const tSec = this.scene.add.text(45, ry, `SEC ${s.sector}`, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: '#94a3b8'
      });

      let starIcons = '★☆☆';
      if (s.stars === 3) starIcons = '★★★';
      else if (s.stars === 2) starIcons = '★★☆';

      const tStars = this.scene.add.text(125, ry, starIcons, {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '8px',
        color: '#ffdd44'
      });

      const tScore = this.scene.add.text(205, ry, String(s.score).padStart(6, '0'), {
        fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
        fontSize: '9px',
        color: rowColor
      });

      this.scoreboardTableContainer.add([tRank, tOp, tName, tSec, tStars, tScore]);
    });

    if (this.scoreboardPbText) {
      this.scoreboardPbText.setText(`PERSONAL BEST: ${ScoreboardSystem.getPersonalBest()} PTS`);
    }
  }

  showScoreboard() {
    if (this.currentState === UIState.GAMEPLAY && !this.scene.isGameOver && !this.scene.levelCompletionSystem.isLevelComplete()) {
      if (!this.scene.physics.world.isPaused) {
        this.scene.physics.pause();
        this.openedScoreboardFromGameplay = true;
      }
    }
    if (this.scoreboardContainer) {
      this.renderScoreboardTable();
      this.scoreboardContainer.setVisible(true);
    }
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
    }
  }

  hideScoreboard() {
    if (this.scoreboardContainer) {
      this.scoreboardContainer.setVisible(false);
    }
    if (this.openedScoreboardFromGameplay) {
      this.openedScoreboardFromGameplay = false;
      if (this.scene.physics.world.isPaused && this.currentState !== UIState.PAUSED) {
        this.scene.physics.resume();
      }
    }
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_NAV);
    }
  }

  toggleScoreboard() {
    if (this.isScoreboardActive()) {
      this.hideScoreboard();
    } else {
      this.showScoreboard();
    }
  }

  isScoreboardActive() {
    return Boolean(this.scoreboardContainer && this.scoreboardContainer.visible);
  }

  showSettings() {
    if (this.currentState === UIState.GAMEPLAY) {
      this.togglePause();
      this.openedSettingsFromGameplay = true;
    }
    this.settingsContainer.setVisible(true);
    if (this.settingsTouchSizeText && typeof window.getTouchButtonScale === 'function') {
      const cur = window.getTouchButtonScale();
      const labels = { '0.75': '75% [COMPACT]', '1': '100% [STANDARD]', '1.25': '125% [LARGE]', '1.5': '150% [MAX]' };
      this.settingsTouchSizeText.setText(labels[cur] || `${Math.round(cur * 100)}%`);
    }
  }

  hideSettings() {
    this.settingsContainer.setVisible(false);
    if (this.openedSettingsFromGameplay) {
      this.openedSettingsFromGameplay = false;
      this.togglePause();
    }
  }

  /**
   * Toggles pause state
   */
  togglePause() {
    if (this.currentState === UIState.TITLE || this.currentState === UIState.GAME_OVER || this.currentState === UIState.LEVEL_COMPLETE) {
      return;
    }

    if (this.currentState === UIState.PAUSED) {
      // Resume
      this.currentState = UIState.GAMEPLAY;
      this.pauseContainer.setVisible(false);
      this.scene.physics.resume();
      if (this.hudPauseText) {
        this.hudPauseText.setText('⏸ PAUSE');
      }
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_PAUSE);
      }
    } else {
      // Pause
      this.currentState = UIState.PAUSED;
      this.pauseContainer.setVisible(true);
      this.scene.physics.pause();
      if (this.hudPauseText) {
        this.hudPauseText.setText('▶ RESUME');
      }
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_PAUSE);
      }
    }
  }

  isPaused() {
    return this.currentState === UIState.PAUSED;
  }

  /**
   * Creates the Game Over screen overlay
   */
  createGameOverOverlay() {
    this.gameOverContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(100).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, UI_CONFIG.OVERLAY_ALPHA);
    const panel = this.scene.add.rectangle(0, 0, 500, 280, UI_CONFIG.HEX_PANEL_BG, UI_CONFIG.PANEL_ALPHA);
    panel.setStrokeStyle(2, UI_CONFIG.HEX_BORDER_RED, 0.85);

    const overTitle = this.scene.add.text(0, -85, 'GAME OVER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: UI_CONFIG.COLOR_RED,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.gameOverStatsText = this.scene.add.text(0, -10, '', {
      fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
      fontSize: '14px',
      color: UI_CONFIG.COLOR_TEXT,
      lineSpacing: 10,
      align: 'center'
    }).setOrigin(0.5);

    const restartPrompt = this.scene.add.text(0, 75, 'PRESS [ENTER] OR TAP TO RETURN', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SUBTITLE_FONT_SIZE,
      color: UI_CONFIG.COLOR_GOLD
    }).setOrigin(0.5);

    scrim.setInteractive({ useHandCursor: true });
    scrim.on('pointerdown', () => this.scene.handleStartInput());
    panel.setInteractive({ useHandCursor: true });
    panel.on('pointerdown', () => this.scene.handleStartInput());

    this.gameOverContainer.add([scrim, panel, overTitle, this.gameOverStatsText, restartPrompt]);
  }

  /**
   * Creates the Level Complete screen overlay
   */
  createLevelCompleteOverlay() {
    this.levelCompleteContainer = this.scene.add.container(400, 225).setScrollFactor(0).setDepth(100).setVisible(false);

    const scrim = this.scene.add.rectangle(0, 0, 800, 450, UI_CONFIG.HEX_SCRIM_BG, UI_CONFIG.OVERLAY_ALPHA);
    const panel = this.scene.add.rectangle(0, 0, 580, 340, UI_CONFIG.HEX_PANEL_BG, UI_CONFIG.PANEL_ALPHA);
    panel.setStrokeStyle(2, UI_CONFIG.HEX_BORDER_CYAN, 0.85);

    const completeTitle = this.scene.add.text(0, -135, 'SECTOR CLEAR', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.BANNER_FONT_SIZE,
      color: UI_CONFIG.COLOR_CYAN,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // 1-3 Performance Stars Glyphs (Animated)
    this.completeStarsText = this.scene.add.text(0, -100, '★  ★  ★', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '22px',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Performance Star Rating Title
    this.completeRatingTitle = this.scene.add.text(0, -74, 'ORION MASTER • FLAWLESS RECON', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Statistics Breakdown Text
    this.completeStatsText = this.scene.add.text(0, -14, '', {
      fontFamily: UI_CONFIG.MONO_FONT_FAMILY,
      fontSize: '11px',
      color: UI_CONFIG.COLOR_TEXT,
      lineSpacing: 6,
      align: 'center'
    }).setOrigin(0.5);

    // Decision Prompt: Ask the player what they want to do
    this.completePromptText = this.scene.add.text(0, 50, 'MISSION COMPLETE! CHOOSE NEXT OBJECTIVE:', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    // Choice 1: Progress to Next Sector / Next Level [ENTER]
    const nextBtnBg = this.scene.add.rectangle(-130, 88, 230, 36, 0x1e293b, 0.95);
    nextBtnBg.setStrokeStyle(1.5, 0x00f0ff, 0.9);

    const nextBtn = this.scene.add.text(-130, 88, '▶ NEXT SECTOR [ENTER]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#ffdd44'
    }).setOrigin(0.5);

    const onAdvanceNext = () => {
      if (this.autoAdvanceTimer) {
        this.autoAdvanceTimer.remove(false);
        this.autoAdvanceTimer = null;
      }
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.scene.handleStartInput();
    };

    nextBtnBg.setInteractive({ useHandCursor: true });
    nextBtnBg.on('pointerdown', onAdvanceNext);
    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', onAdvanceNext);

    // Subtle pulsing animation on Next button
    this.scene.tweens.add({
      targets: [nextBtnBg, nextBtn],
      scaleX: 1.03,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Choice 2: Return to Main Menu [ESC]
    const menuBtnBg = this.scene.add.rectangle(130, 88, 230, 36, 0x1e293b, 0.95);
    menuBtnBg.setStrokeStyle(1.5, 0xff0077, 0.85);

    const menuBtn = this.scene.add.text(130, 88, '◀ MAIN MENU [ESC]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '9px',
      color: '#f43f5e'
    }).setOrigin(0.5);

    const onReturnMenu = () => {
      if (this.autoAdvanceTimer) {
        this.autoAdvanceTimer.remove(false);
        this.autoAdvanceTimer = null;
      }
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.hideLevelComplete();
      this.scene.returnToTitleScreen();
    };

    menuBtnBg.setInteractive({ useHandCursor: true });
    menuBtnBg.on('pointerdown', onReturnMenu);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', onReturnMenu);

    // Choice 3: Quick Jump to Sector Select [L] & Scoreboard [B]
    const selectBtnBg = this.scene.add.rectangle(-95, 128, 175, 24, 0x0f172a, 0.9);
    selectBtnBg.setStrokeStyle(1, 0x38bdf8, 0.6);

    const selectBtn = this.scene.add.text(-95, 128, '🗺️ SECTORS [L]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    const onSelectSector = () => {
      if (this.autoAdvanceTimer) {
        this.autoAdvanceTimer.remove(false);
        this.autoAdvanceTimer = null;
      }
      if (this.scene.audioSystem) {
        this.scene.audioSystem.playSFX(AUDIO_KEYS.UI_CONFIRM);
      }
      this.hideLevelComplete();
      this.scene.scene.start('LevelSelectScene', { characterId: this.scene.characterId || 'NOVA' });
    };

    selectBtnBg.setInteractive({ useHandCursor: true });
    selectBtnBg.on('pointerdown', onSelectSector);
    selectBtn.setInteractive({ useHandCursor: true });
    selectBtn.on('pointerdown', onSelectSector);

    // High Scores Button in Level Complete
    const scoresCompleteBtn = this.scene.add.rectangle(95, 128, 140, 24, 0x0f172a, 0.9);
    scoresCompleteBtn.setStrokeStyle(1, 0xfacc15, 0.8);
    const scoresCompleteText = this.scene.add.text(95, 128, '🏆 SCORES [B]', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#facc15'
    }).setOrigin(0.5);
    scoresCompleteBtn.setInteractive({ useHandCursor: true });
    scoresCompleteBtn.on('pointerdown', () => this.showScoreboard());
    scoresCompleteText.setInteractive({ useHandCursor: true });
    scoresCompleteText.on('pointerdown', () => this.showScoreboard());

    // High Score Rank banner
    this.completeHighScoreBanner = this.scene.add.text(0, 32, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '8px',
      color: '#facc15'
    }).setOrigin(0.5);

    // Helper text for mobile / auto-advance
    this.completeAutoText = this.scene.add.text(0, 153, 'Choose an option above [or tap screen]', {
      fontFamily: UI_CONFIG.BODY_FONT_FAMILY,
      fontSize: '11px',
      color: '#64748b'
    }).setOrigin(0.5);

    this.levelCompleteContainer.add([
      scrim,
      panel,
      completeTitle,
      this.completeStarsText,
      this.completeRatingTitle,
      this.completeStatsText,
      this.completeHighScoreBanner,
      this.completePromptText,
      nextBtnBg,
      nextBtn,
      menuBtnBg,
      menuBtn,
      selectBtnBg,
      selectBtn,
      scoresCompleteBtn,
      scoresCompleteText,
      this.completeAutoText
    ]);
  }

  /**
   * Displays the title screen and begins blinking prompt
   */
  showTitleScreen() {
    this.currentState = UIState.TITLE;
    this.titleContainer.setVisible(true).setAlpha(1);
    this.hudContainer.setVisible(false);
    this.pauseContainer.setVisible(false);
    this.settingsContainer.setVisible(false);
    if (this.cheatContainer) {
      this.cheatContainer.setVisible(false);
    }
    this.gameOverContainer.setVisible(false);
    this.levelCompleteContainer.setVisible(false);

    if (this.titlePromptTween) {
      this.titlePromptTween.stop();
    }
    this.titlePromptTween = this.scene.tweens.add({
      targets: this.titlePromptText,
      alpha: 0.3,
      duration: UI_CONFIG.TITLE_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Fades out title screen and transitions to active gameplay HUD
   * @param {Function} [onComplete]
   */
  hideTitleScreen(onComplete) {
    if (this.titlePromptTween) {
      this.titlePromptTween.stop();
      this.titlePromptTween = null;
    }

    this.scene.tweens.add({
      targets: this.titleContainer,
      alpha: 0,
      duration: UI_CONFIG.TRANSITION_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.titleContainer.setVisible(false);
        this.currentState = UIState.GAMEPLAY;
        this.showGameplayHUD();
        this.updateHUD();
        if (onComplete) onComplete();
      }
    });
  }

  showGameplayHUD() {
    this.hudContainer.setVisible(true);
  }

  /**
   * Updates all HUD data readouts from scene systems
   */
  updateHUD() {
    if (!this.hudContainer || !this.hudScoreText) return;

    // Line 1: Score & Crystals
    const score = this.scene.scoreSystem ? this.scene.scoreSystem.getScore() : 0;
    const crystals = this.scene.scoreSystem ? this.scene.scoreSystem.getCollectedCount() : 0;
    const totalCrystals = this.scene.scoreSystem ? this.scene.scoreSystem.getTotalCount() : 20;

    const formattedScore = String(score).padStart(6, '0');
    const formattedCrystals = `${String(crystals).padStart(2, '0')} / ${String(totalCrystals).padStart(2, '0')}`;

    this.hudScoreText.setText(`SCORE: ${formattedScore}`);
    this.hudCrystalsText.setText(`★  CRYSTALS: ${formattedCrystals}`);

    // Sector & Operative info
    const secNum = this.scene.levelIndex || this.scene.currentLevelIndex || 1;
    const subNum = this.scene.subLevel || 1;
    const charName = this.scene.player && this.scene.player.characterProfile ? this.scene.player.characterProfile.getName().toUpperCase() : 'NOVA';
    if (this.hudSectorText) {
      const subTag = (subNum === 10) ? '[FINAL BOSS]' : `STAGE ${subNum}/10`;
      this.hudSectorText.setText(`SEC ${secNum} • ${subTag} • ${charName}`);
    }

    // Line 2: Health (Segmented Shields / HP Bar) & Lives
    const hp = this.scene.healthSystem ? this.scene.healthSystem.getHealth() : 3;
    const maxHp = this.scene.healthSystem ? this.scene.healthSystem.getMaxHealth() : 3;
    const lives = this.scene.livesSystem ? this.scene.livesSystem.getLives() : 3;

    let shieldBar = '';
    const barSegments = (maxHp > 10) ? 10 : maxHp;
    const filledSegments = (maxHp > 10) ? Math.round((hp / maxHp) * 10) : hp;
    for (let i = 0; i < barSegments; i++) {
      shieldBar += (i < filledSegments) ? '■' : '□';
    }
    this.hudStatusText.setText(`HEALTH: [${shieldBar}] ${hp}/${maxHp}   LIVES: ${lives}`);

    // Line 2b: Active Power-Up Readout
    if (this.scene.powerUpSystem && this.scene.powerUpSystem.isPowerUpActive()) {
      const activeType = this.scene.powerUpSystem.getActivePowerUp();
      const config = POWERUP_CONFIG[activeType] || {};
      const remainingMs = this.scene.powerUpSystem.getRemainingTime();
      const remainingSec = (remainingMs / 1000).toFixed(1);

      this.hudPowerUpText
        .setText(`${(config.name || activeType).toUpperCase()}: ${remainingSec}s`)
        .setColor(config.colorHex || UI_CONFIG.COLOR_CYAN);
    } else {
      this.hudPowerUpText
        .setText('MODULE: --')
        .setColor(UI_CONFIG.COLOR_MUTED);
    }

    // Line 2c: Active Weapon Readout
    if (this.hudWeaponText) {
      const activeWeapon = (this.scene.player && typeof this.scene.player.getWeapon === 'function')
        ? this.scene.player.getWeapon()
        : 'REVOLVER';
      this.hudWeaponText.setText(`WEAPON: [${activeWeapon}] [E]`);
    }

    // Arena Boss Health Bar update
    if (this.hudBossContainer) {
      const boss = this.scene.boss;
      if (boss && boss.active && boss.state === 'ACTIVE') {
        this.hudBossContainer.setVisible(true);
        const bHp = Math.max(0, boss.currentHealth);
        const bMax = Math.max(1, boss.maxHealth);
        const bRatio = Math.max(0, Math.min(1, bHp / bMax));
        this.hudBossText.setText(`★ BOSS: ${boss.config.name} ★`);
        this.hudBossText.setColor(boss.config.colorHex || '#ef4444');
        this.hudBossFill.width = Math.round(250 * bRatio);
        this.hudBossFill.setFillStyle(boss.config.colorNum || 0xef4444, 1);
        this.hudBossHpText.setText(`${bHp} / ${bMax} HP`);
      } else {
        this.hudBossContainer.setVisible(false);
      }
    }
  }

  /**
   * Updates the telemetry readout in HUD
   * @param {string} text
   */
  updateTelemetry(text) {
    if (this.telemetryText) {
      this.telemetryText.setText(text);
    }
  }

  /**
   * Displays Game Over overlay
   */
  showGameOver() {
    if (this.currentState === UIState.LEVEL_COMPLETE) {
      return;
    }

    this.currentState = UIState.GAME_OVER;
    const score = this.scene.scoreSystem ? this.scene.scoreSystem.getScore() : 0;
    const crystals = this.scene.scoreSystem ? this.scene.scoreSystem.getCollectedCount() : 0;
    const totalCrystals = this.scene.scoreSystem ? this.scene.scoreSystem.getTotalCount() : 20;

    const scoreFormatted = String(score).padStart(6, '0');
    const crystalFormatted = `${String(crystals).padStart(2, '0')} / ${String(totalCrystals).padStart(2, '0')}`;

    this.gameOverStatsText.setText(
      `FINAL SCORE:    ${scoreFormatted}\n` +
      `STAR CRYSTALS:  ${crystalFormatted}`
    );

    this.gameOverContainer.setAlpha(0).setVisible(true);
    this.scene.tweens.add({
      targets: this.gameOverContainer,
      alpha: 1,
      duration: UI_CONFIG.TRANSITION_DURATION,
      ease: 'Power2'
    });
  }

  /**
   * Displays Level Complete overlay with frozen snapshot statistics
   * @param {object} stats
   */
  showLevelComplete(stats) {
    if (this.currentState === UIState.GAME_OVER) {
      return;
    }

    this.currentState = UIState.LEVEL_COMPLETE;

    // Determine performance stars (1 to 3)
    const starCount = stats.stars || (this.scene.levelCompletionSystem ? this.scene.levelCompletionSystem.getStars() : 1);
    const starMeta = LevelCompletionSystem.getStarRatingMeta(starCount);

    const starsGlyphs = (starCount === 3)
      ? '★  ★  ★'
      : (starCount === 2)
        ? '★  ★  ☆'
        : '★  ☆  ☆';

    if (this.completeStarsText) {
      this.completeStarsText.setText(starsGlyphs).setColor(starMeta.color);

      // Star celebration bounce animation
      this.completeStarsText.setScale(0.3);
      this.scene.tweens.add({
        targets: this.completeStarsText,
        scale: 1.25,
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.completeStarsText,
            scale: 1.0,
            duration: 200,
            ease: 'Sine.easeInOut'
          });
        }
      });
    }

    if (this.completeRatingTitle) {
      this.completeRatingTitle
        .setText(`${starMeta.badge}  ${starMeta.title}  •  ${starMeta.description}`)
        .setColor(starMeta.color);
    }

    // Record score in ScoreboardSystem
    const rec = ScoreboardSystem.recordScore({
      name: ScoreboardSystem.getLastPlayerName(),
      score: stats.score || 0,
      sector: this.scene.levelIndex || 1,
      operative: this.scene.characterId || 'NOVA',
      stars: starCount
    });

    if (this.completeHighScoreBanner) {
      if (rec.isNewRecord) {
        this.completeHighScoreBanner.setText(`★ NEW RECORD! RANK #1 ON GALACTIC LEADERBOARD! ★`).setColor('#facc15');
      } else if (rec.rank <= 10) {
        this.completeHighScoreBanner.setText(`★ HIGH SCORE: RANK #${rec.rank} ON LEADERBOARD ★`).setColor('#38bdf8');
      } else {
        this.completeHighScoreBanner.setText(`PERSONAL BEST: ${ScoreboardSystem.getPersonalBest()} PTS`).setColor('#94a3b8');
      }
    }

    const scoreFormatted = String(stats.score || 0).padStart(6, '0');
    const crystalFormatted = `${String(stats.crystalsCollected || 0).padStart(2, '0')} / ${String(stats.crystalsTotal || 20).padStart(2, '0')}`;
    const enemyFormatted = `${String(stats.enemiesDefeated || 0).padStart(2, '0')} / ${String(stats.enemiesTotal || 5).padStart(2, '0')}`;
    const maxHp = this.scene.healthSystem ? this.scene.healthSystem.getMaxHealth() : 3;
    const shieldFormatted = `${stats.healthRemaining !== undefined ? stats.healthRemaining : 3} / ${maxHp}`;
    const livesFormatted = stats.livesRemaining !== undefined ? stats.livesRemaining : 3;

    this.completeStatsText.setText(
      `FINAL SCORE:        ${scoreFormatted}\n` +
      `STAR CRYSTALS:      ${crystalFormatted}\n` +
      `ENEMIES DEFEATED:   ${enemyFormatted}\n` +
      `SHIELD REMAINING:   ${shieldFormatted}\n` +
      `LIVES REMAINING:    ${livesFormatted}`
    );

    this.levelCompleteContainer.setAlpha(0).setVisible(true);
    this.scene.tweens.add({
      targets: this.levelCompleteContainer,
      alpha: 1,
      duration: UI_CONFIG.TRANSITION_DURATION,
      ease: 'Power2'
    });

    // Auto-advance countdown on mobile: advances automatically after 12 seconds if idle
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.remove(false);
      this.autoAdvanceTimer = null;
    }
    let countdown = 12;
    if (this.completeAutoText) {
      this.completeAutoText.setText(`Choose an option above (Auto-advancing in ${countdown}s...)`);
    }

    this.autoAdvanceTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: 12,
      callback: () => {
        countdown--;
        if (this.completeAutoText && this.currentState === UIState.LEVEL_COMPLETE) {
          if (countdown > 0) {
            this.completeAutoText.setText(`Choose an option above (Auto-advancing in ${countdown}s...)`);
          } else {
            this.completeAutoText.setText('Advancing to next sector...');
            this.scene.handleStartInput();
          }
        }
      }
    });
  }

  hideGameOver() {
    this.gameOverContainer.setVisible(false);
  }

  hideLevelComplete() {
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.remove(false);
      this.autoAdvanceTimer = null;
    }
    this.levelCompleteContainer.setVisible(false);
  }

  isTitleActive() {
    return this.currentState === UIState.TITLE;
  }

  isGameOverActive() {
    return this.currentState === UIState.GAME_OVER;
  }

  isLevelCompleteActive() {
    return this.currentState === UIState.LEVEL_COMPLETE;
  }

  getCurrentState() {
    return this.currentState;
  }

  reset() {
    if (this.autoAdvanceTimer) {
      this.autoAdvanceTimer.remove(false);
      this.autoAdvanceTimer = null;
    }
    this.titleContainer.setVisible(false);
    this.gameOverContainer.setVisible(false);
    this.levelCompleteContainer.setVisible(false);
    this.pauseContainer.setVisible(false);
    this.settingsContainer.setVisible(false);
    if (this.cheatContainer) {
      this.cheatContainer.setVisible(false);
    }
    this.openedCheatFromGameplay = false;
    if (this.scoreboardContainer) {
      this.scoreboardContainer.setVisible(false);
    }
    this.openedScoreboardFromGameplay = false;
    this.currentState = UIState.GAMEPLAY;
    this.showGameplayHUD();
    this.updateHUD();
  }
}
