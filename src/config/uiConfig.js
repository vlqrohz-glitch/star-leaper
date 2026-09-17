/**
 * Centralized UI Configuration for Star-Leaper: Orion Odyssey
 * Visual styling, positioning, layout metrics, and presentation timing values
 */

export const UIState = Object.freeze({
  TITLE: 'TITLE',
  GAMEPLAY: 'GAMEPLAY',
  PAUSED: 'PAUSED',
  SETTINGS: 'SETTINGS',
  GAME_OVER: 'GAME_OVER',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE'
});

export const UI_CONFIG = {
  // Typography
  FONT_FAMILY: '"Press Start 2P", monospace',
  BODY_FONT_FAMILY: 'Outfit, sans-serif',
  MONO_FONT_FAMILY: 'monospace',

  // Font Sizes
  HUD_FONT_SIZE: '10px',
  HUD_SMALL_FONT_SIZE: '8px',
  MENU_FONT_SIZE: '14px',
  TITLE_FONT_SIZE: '22px',
  SUBTITLE_FONT_SIZE: '11px',
  BANNER_FONT_SIZE: '26px',

  // Layout & Spacing
  HUD_PADDING: { x: 16, y: 10 },
  PANEL_PADDING: { x: 24, y: 20 },
  OVERLAY_ALPHA: 0.88,
  PANEL_ALPHA: 0.95,

  // Timing & Transitions (ms)
  TRANSITION_DURATION: 300,
  POWERUP_WARNING_TIME: 1000,
  TITLE_PULSE_DURATION: 900,

  // Color Palette
  COLOR_CYAN: '#00f0ff',
  COLOR_GOLD: '#ffdd44',
  COLOR_RED: '#ef4444',
  COLOR_WARNING: '#f59e0b',
  COLOR_MUTED: '#64748b',
  COLOR_TEXT: '#e2e8f0',
  COLOR_ACCENT: '#38bdf8',

  // Numeric Hex Colors for Phaser Graphics/Containers
  HEX_PANEL_BG: 0x0f172a,
  HEX_SCRIM_BG: 0x050711,
  HEX_BORDER_CYAN: 0x00f0ff,
  HEX_BORDER_RED: 0xef4444
};
