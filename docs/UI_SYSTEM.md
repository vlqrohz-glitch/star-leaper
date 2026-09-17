# Technical Documentation: UI, Menus & Game-State Presentation

## 1. Overview
The **UI, Menus & Game-State Presentation System** introduced in Stage 9 establishes a centralized, modular presentation layer for *Star-Leaper: Orion Odyssey*. It replaces temporary inline HUD elements and text popups with a structured system (`UISystem.js`) configured via dedicated design constants (`uiConfig.js`).

The presentation architecture strictly separates visual rendering from gameplay simulation:
- **Zero State Duplication**: `UISystem` never owns, duplicates, or mutates gameplay state.
- **Authoritative Data Sources**: All UI elements query authoritative engine systems (`ScoreSystem`, `HealthSystem`, `LivesSystem`, `PowerUpSystem`, and `LevelCompletionSystem`).
- **Camera Isolation**: All HUD and overlay containers are pinned to screen space (`setScrollFactor(0)`) at elevated depth tiers (`setDepth(50)` and `setDepth(100)`).

---

## 2. State Machine & Presentation Flow

```text
               GAME INITIALIZATION / BOOT
                           │
                           ▼
                 TITLE / START SCREEN
                  (UIState.TITLE)
              • Scrim & Cybernetic Panel
              • "PRESS ENTER TO START" (pulsing)
              • Gameplay & enemies paused
                           │
              [ENTER] or [SPACE] Pressed
                           │ (300ms fade transition)
                           ▼
                  ACTIVE GAMEPLAY HUD
                 (UIState.GAMEPLAY)
              • Camera-pinned dual-line HUD
              • Live score, crystal counter
              • Segmented shield bar [■■■]
              • Real-time Aegis timer & amber pulse
                           │
             ┌─────────────┴─────────────┐
             │                           │
   Lives Depleted (0)             Goal Beacon Touched
             ▼                           ▼
      GAME OVER OVERLAY          LEVEL COMPLETE OVERLAY
     (UIState.GAME_OVER)        (UIState.LEVEL_COMPLETE)
   • Dark crimson border        • Cyan cybernetic border
   • Final score & crystals     • Frozen snapshot metrics:
   • "PRESS [R] TO RETRY"         - Final Score
             │                    - Star Crystals
             │                    - Enemies Defeated
             │                    - Shield Remaining
             │                    - Lives Remaining
             │                  • "PRESS [R] TO RESTART"
             │                           │
             └─────────────┬─────────────┘
                           │
                   [R] Key Pressed
                           │
                           ▼
               FULL GAMEPLAY & UI RESET
                 (UIState.GAMEPLAY)
              • Reset authoritative systems
              • Reset entities & player spawn
              • Cleanly restore active HUD
```

---

## 3. Architecture & Class Responsibilities

### A. `uiConfig.js` (`src/config/uiConfig.js`)
Central repository for all presentation tokens, geometry, colors, typography, and states.

- **`UIState` Enum**:
  - `TITLE`: Title screen active, gameplay paused.
  - `GAMEPLAY`: Active HUD displayed, live telemetry ticking.
  - `GAME_OVER`: Final failure overlay displayed.
  - `LEVEL_COMPLETE`: Final victory summary overlay displayed.
- **Color Tokens**:
  - `COLOR_CYAN` (`#00f0ff`): Primary sci-fi accent, title headers, active Aegis text.
  - `COLOR_GOLD` (`#ffd700`): Collectible star crystals, restart prompt highlight.
  - `COLOR_GREEN` (`#22c55e`): Intact shields, positive status readouts.
  - `COLOR_WARNING` (`#f59e0b`): Aegis power-up warning pulse ($\le 1000\text{ms}$).
  - `COLOR_DANGER` (`#ef4444`): Game Over header, depleted health warning.
  - `COLOR_TEXT` (`#f8fafc`): Crisp off-white readability for statistics.
  - `COLOR_MUTED` (`#64748b`): Inactive power-up indicators (`AEGIS: --`).
- **Timing & Layout Metrics**:
  - `TRANSITION_DURATION`: 300ms smooth fade animations.
  - `TITLE_PULSE_DURATION`: 600ms oscillating prompt opacity.
  - `POWERUP_WARNING_TIME`: 1000ms threshold for Aegis expiration alert.
  - `OVERLAY_ALPHA` & `PANEL_ALPHA`: 0.75 scrim opacity / 0.90 panel opacity.

### B. `UISystem` (`src/systems/UISystem.js`)
Dedicated presentation controller instantiated once within `GameScene`.

- **Container Layering**:
  - `this.hudContainer` (`depth: 50`): Screen-pinned HUD positioned at `(0, 0)` with semi-transparent backdrop panel.
  - `this.titleContainer` (`depth: 100`): Fullscreen scrim + dialog panel at `(400, 225)`.
  - `this.gameOverContainer` (`depth: 100`): Centered Game Over panel with statistics readout.
  - `this.levelCompleteContainer` (`depth: 100`): Centered Level Complete panel with 5-point frozen audit.
- **Key Methods**:
  - `initialize()`: Creates all four containers, applies scroll factors, and displays the Title screen.
  - `showTitleScreen()`: Activates `UIState.TITLE`, pauses gameplay, and initiates the pulsing start prompt.
  - `hideTitleScreen([onComplete])`: Fades out the title overlay over 300ms, transitions to `UIState.GAMEPLAY`, and reveals the HUD.
  - `updateHUD()`: Pulls current metrics from authoritative systems and formats them cleanly:
    - Formats score padded to 6 digits (e.g., `SCORE: 000450`).
    - Formats crystals collected vs total (e.g., `CRYSTALS: 03 / 20`).
    - Formats segmented shield health bar (e.g., `HEALTH: [■■■] 3/3`).
    - Displays live Aegis timer and switches color to amber when $\le 1000\text{ms}$.
  - `updateTelemetry(text)`: Renders low-priority coordinate/velocity/foe telemetry in HUD line 3.
  - `showGameOver()`: Enforces single-screen constraint, queries final score and crystals, and fades in Game Over modal.
  - `showLevelComplete(stats)`: Enforces single-screen constraint, populates frozen statistics snapshot, and fades in Level Complete modal.
  - `reset()`: Dismisses modals, cancels active tweens, sets state to `UIState.GAMEPLAY`, and refreshes HUD.

### C. `GameScene` Integration (`src/scenes/GameScene.js`)
- **Single Instance**: A single `UISystem` instance is created during `create()` and reused throughout the session.
- **Lifecycle Hooks**:
  - `ENTER` and `SPACE` keys call `handleStartInput()`, which transitions `UISystem` out of Title mode.
  - `update()` begins with `if (this.uiSystem.isTitleActive()) { this.player.setVelocity(0, 0); return; }`, ensuring the game world remains frozen until the player starts.
  - Reactive game events (`SCORE_CHANGED`, `HEALTH_CHANGED`, `LIVES_CHANGED`) trigger `this.uiSystem.updateHUD()`.
  - Frame-by-frame `update()` invokes `this.uiSystem.updateHUD()` to keep the Aegis power-up countdown timer ticking smoothly.
  - On player death, `handlePlayerDeath()` triggers `this.uiSystem.showGameOver()` if lives hit zero, or updates the HUD upon respawn.
  - On goal beacon contact, `this.levelCompletionSystem.completeLevel(stats)` triggers `this.uiSystem.showLevelComplete(stats)`.
  - On `[R]` restart, `restartLevel()` invokes `this.uiSystem.reset()` without duplicate event binding.

---

## 4. Visual Screen Specifications

### 1. Title / Start Screen
- **Backdrop**: Full viewport 800×450 scrim (`#030712`, 85% alpha) over stationary Sector Alpha background.
- **Panel**: 540×280 rounded rectangular frame with cyan border (`#00f0ff`, 2px stroke).
- **Title**: `STAR-LEAPER: ORION ODYSSEY` (20px bold Orbitron/monospace, drop-shadow).
- **Subtitle**: `SECTOR ALPHA // MISSION DEPLOYMENT` (11px cyan).
- **Controls Reference**: `MOVE: [A][D] / [LEFT][RIGHT]  •  JUMP: [W] / [UP] / [SPACE]`.
- **Start Callout**: `PRESS [ENTER] OR [SPACE] TO START` pulsing smoothly between 30% and 100% alpha.

### 2. Modernized Gameplay HUD
- **Position**: Pinned to top-left `(0, 0)` with fixed dimensions 800×64px and 45% dark scrim.
- **Line 1 (Scoring & Collectibles)**:
  `SCORE: 000500  ★  CRYSTALS: 05 / 20`
- **Line 2 (Defensive Status & Enhancements)**:
  `HEALTH: [■■■] 3/3   LIVES: 3   |   AEGIS: ACTIVE 7.4s` (Cyan, shifts to Amber under 1.0s)
- **Line 3 (Telemetry & Orbit Data)**:
  `POS: X:620/3200 Y:320 | CAM: 220 | STATE: RUNNING | VEL: 230, 0 | FOES: 4`

### 3. Game Over Screen
- **Backdrop**: Full viewport dark scrim with 85% opacity.
- **Panel**: 480×260 modal card with danger-crimson border (`#ef4444`).
- **Header**: `MISSION FAILED: ORION LOST` (18px danger red).
- **Statistics**:
  - `FINAL SCORE: 000450`
  - `STAR CRYSTALS: 04 / 20`
- **Action Prompt**: `PRESS [R] TO RETRY` (12px gold).

### 4. Level Complete Screen
- **Backdrop**: Full viewport deep space scrim with 85% opacity.
- **Panel**: 520×310 modal card with celestial cyan border (`#00f0ff`).
- **Header**: `SECTOR ALPHA COMPLETE` (16px radiant cyan).
- **Snapshot Statistics**:
  - `FINAL SCORE:        002500`
  - `STAR CRYSTALS:      20 / 20`
  - `ENEMIES DEFEATED:   05 / 05`
  - `SHIELD REMAINING:   3 / 3`
  - `LIVES REMAINING:    3`
- **Action Prompt**: `PRESS [R] TO RESTART` (12px gold).

---

## 5. Architectural Invariants & Anti-Regression Guards

1. **Mutual Exclusivity (Single-Screen Constraint)**:
   `showGameOver()` checks `if (this.currentState === UIState.LEVEL_COMPLETE) return;` and `showLevelComplete()` checks `if (this.currentState === UIState.GAME_OVER) return;`. It is physically impossible for Game Over and Level Complete screens to render simultaneously.
2. **Snapshot Immutability**:
   `LevelCompletionSystem` latches on completion; subsequent enemy contacts or power-up events do not alter the snapshot rendered by `UISystem`.
3. **No Duplicate Event Listeners**:
   `bindEvents()` is executed exactly once during `GameScene.create()`. Level restart via `[R]` only resets entity states and `UISystem.reset()`, guaranteeing listeners never multiply.
4. **Power-Up Decoupling**:
   The HUD visualizes the Aegis power-up cleanly using read-only accessors (`isPowerUpActive()`, `getRemainingTime()`), ensuring zero coupling or side-effects on power-up timers.
