# Changelog

All notable changes to the **Star-Leaper: Orion Odyssey** codebase will be documented in this file.

## [Stage 12] - 2026-09-15
### starleaper.io Domain Integration & Local Routing
### Status: COMPLETED AND VERIFIED (137 / 137 Tests Passing)

### Features Added
- **`starleaper.io` Local Domain Resolution**:
  - Authored `setup_starleaper_domain.ps1` with self-elevation to map `127.0.0.1 starleaper.io` and `127.0.0.1 www.starleaper.io` in Windows `hosts` and flush DNS.
  - Authored one-click `setup_starleaper_domain.bat` wrapper for easy elevation.
  - Authored `uninstall_starleaper_domain.ps1` for clean reversal.
- **Web & Arcade Interface Domain Branding**:
  - Updated `<title>` to `starleaper.io — Star-Leaper: Orion Odyssey`.
  - Added `<link rel="canonical" href="http://starleaper.io/">` and meta tags.
  - Added glowing neon `.domain-pill` in arcade cabinet header linking to `http://starleaper.io/`.
  - Added `🌐 STARLEAPER.IO` cyberpunk watermark in `UISystem.js` Title screen and Pause menu.
  - Added `starleaper.io` domain indicator in footer controls status bar.
- **Server Support (`server.ps1`)**:
  - Updated `server.ps1` to accept `Host: starleaper.io:8080` requests and display clean domain access URLs.
- **Automated Validation Suite (`validate_domain_url.ps1`)**:
  - 14 automated unit and integration assertions validating title, canonical links, watermarks, setup scripts, and server host routing.

---

## [Stage 11] - 2026-09-14
### Fullscreen Overhaul, Character Sheet & Cosmic Shop (Outfits, Perks, Pets)
### Status: COMPLETED AND VERIFIED (123 / 123 Tests Passing)

### Features Added
- **Fullscreen System Overhaul**:
  - Eliminated disruptive CSS overrides (`width: 100% !important; height: 100% !important;`) that distorted the game canvas.
  - Implemented responsive letterboxing in `index.html` via flexbox and `object-fit: contain; max-width: 100%; max-height: 100%`.
  - Added `window.toggleGameFullscreen()` with vendor prefix fallbacks, global `F` key handler, and live UI button label sync.
  - Configured Phaser `Scale.FIT` and `fullscreenTarget: 'game-container'`.
- **Cosmic Shop System (`src/scenes/ShopScene.js` & `src/systems/ShopSystem.js`)**:
  - Integrated persistent crystal wallet balance with initial 500 ★ grant and live in-game collection replenishment.
  - Built tabbed shopping interface (`[1] OUTFITS`, `[2] PERKS`, `[3] PETS`) with dynamic status badges (`BUY`, `EQUIP`, `✓ EQUIPPED`).
  - Added 5 Outfits per operative (*Standard Issue*, *Solar Flare*, *Cyber Void*, *Neon Pulse*, *Stellar Gold*).
  - Added 4 Passive Perks (*Magnet Core* 120px crystal attraction, *Reinforced Plating* +1 HP capacity, *Boost Thrusters* +12% speed / +8% jump, *Lucky Stars* bonus score).
  - Added 4 Companion Pets (*Cosmo the Pup*, *Orb-E Drone*, *Chrono Owl*, *Star-Kitten*).
  - Created Web Audio procedural SFX for `SHOP_BUY`, `SHOP_EQUIP`, and `SHOP_ERROR`.
- **Operative Dossier & Character Sheet (`src/scenes/CharacterSheetScene.js`)**:
  - Dynamic inspection bay rendering the active operative wearing the equipped outfit alongside their active companion pet.
  - Tactical metrics visualizer with proportional attribute bars for Ground Speed, Jump Lift, Air Agility, and Shield HP.
  - Equipped modules breakdown and direct shortcuts to the Cosmic Shop (`[S]`), Deployment (`[ENTER]`), and Operative switching (`[←/→]`).
- **Autonomous Companion Pet Entity (`src/entities/Pet.js`)**:
  - Smooth lag-following with linear interpolation, sinusoidal vertical bobbing, facing direction mirroring, and stardust emission.
- **In-Game Systems Integration**:
  - `Player.js`: Dynamically adopts equipped outfit textures and applies `boost_thrusters` multipliers.
  - `GameScene.js`: Spawns and updates active companion `Pet`, manages `magnet_core` crystal attraction, and integrates `reinforced_plating` shield capacity.
  - `ScoreSystem.js`: Awards `lucky_stars` bonuses and credits collected Star Crystals directly into `ShopSystem`.
  - `UISystem.js` & `CharacterSelectScene.js`: Wired `[3] CHARACTER SHEET` and `[4] COSMIC SHOP` shortcuts across Title, Character Select, and Pause menus.

### Files Added / Modified
- `src/config/shopConfig.js` (NEW)
- `src/systems/ShopSystem.js` (NEW)
- `src/entities/Pet.js` (NEW)
- `src/scenes/CharacterSheetScene.js` (NEW)
- `src/scenes/ShopScene.js` (NEW)
- `validate_shop_sheet.ps1` (NEW)
- `verify_shop_and_sheet.ps1` (NEW)
- `docs/SHOP_AND_CUSTOMIZATION.md` (NEW)
- `src/scenes/BootScene.js` (MODIFIED)
- `src/scenes/GameScene.js` (MODIFIED)
- `src/entities/Player.js` (MODIFIED)
- `src/systems/ScoreSystem.js` (MODIFIED)
- `src/systems/UISystem.js` (MODIFIED)
- `src/scenes/CharacterSelectScene.js` (MODIFIED)
- `src/config/audioConfig.js` (MODIFIED)
- `src/systems/AudioSystem.js` (MODIFIED)
- `src/config/gameConfig.js` (MODIFIED)
- `src/main.js` (MODIFIED)
- `index.html` (MODIFIED)
- `README.md` (MODIFIED)
- `PROJECT_PLAN.md` (MODIFIED)
- `CHANGELOG.md` (MODIFIED)

---

## [Stage 10] - 2026-09-10
### Status: COMPLETED AND VERIFIED

### Features Added
- **AudioSystem (`src/systems/AudioSystem.js`)**: Created centralized audio management system featuring zero-dependency procedural Web Audio API synthesis for 12 distinct sound effects and 4 looped ambient music states, volume attenuation, and mute controls with graceful non-audio fallback.
- **FeedbackSystem (`src/systems/FeedbackSystem.js`)**: Created visual and tactile feedback controller providing restrained camera shakes for damage, defeat, death, and goal events, temporary player color flashes, forcefield aura ripples, and floating score labels (`+100`, `+200`).
- **Audio Configuration (`src/config/audioConfig.js`)**: Centralized volume tuning (`MASTER_VOLUME`, `SFX_VOLUME`, `MUSIC_VOLUME`), logical audio keys, music state identifiers, camera shake profiles, and popup dimensions.
- **Audio Mute Support**: Implemented `toggleMute()` and `isMuted()`, wired to the `M` key.
- **Zero Gameplay Coupling**: Guaranteed that `AudioSystem` and `FeedbackSystem` never own, modify, or duplicate gameplay state.
- **Autonomous Feedback Cleanup**: All temporary floating score texts, tweens, and camera flash effects self-terminate upon completion, with full cleanup on `R` restart.
- **Boundary Guards**: Gameplay audio and feedback are strictly suppressed during level completion and Game Over states.
- **Technical Documentation**: Authored `docs/AUDIO_AND_FEEDBACK.md` covering architecture, synthesis parameters, and system integrations.

### Files Added / Modified
- `src/config/audioConfig.js` (NEW)
- `src/systems/AudioSystem.js` (NEW)
- `src/systems/FeedbackSystem.js` (NEW)
- `docs/AUDIO_AND_FEEDBACK.md` (NEW)
- `validate_stage10.ps1` (NEW)
- `test_stage10.html` (NEW)
- `src/scenes/GameScene.js` (MODIFIED)
- `index.html` (MODIFIED)
- `README.md` (MODIFIED)
- `PROJECT_PLAN.md` (MODIFIED)
- `CHANGELOG.md` (MODIFIED)

### Testing Status
- All 44 validation tests (Tests A through AR) plus 8 regression suites verified and passed (52 / 52 tests passed):
  - AudioSystem initializes without errors (TEST A)
  - Audio configuration loads correctly (TEST B)
  - Title music state activates correctly (TEST C)
  - Gameplay music state activates after starting (TEST D)
  - Repeated restarts do not create duplicate music instances (TEST E)
  - Crystal collection triggers CRYSTAL_COLLECT (TEST F)
  - Enemy defeat triggers ENEMY_DEFEAT (TEST G)
  - Player damage triggers PLAYER_DAMAGE (TEST H)
  - Player death triggers PLAYER_DEATH (TEST I)
  - Player respawn triggers PLAYER_RESPAWN (TEST J)
  - Aegis collection triggers POWERUP_COLLECT (TEST K)
  - Aegis activation triggers POWERUP_ACTIVATE (TEST L)
  - Aegis expiration triggers POWERUP_EXPIRE (TEST M)
  - Goal interaction triggers GOAL_REACHED (TEST N)
  - Level completion triggers completion audio (TEST O)
  - Game Over triggers Game Over audio (TEST P)
  - Gameplay music stops on Game Over (TEST Q)
  - Gameplay music stops on completion (TEST R)
  - Completion music/state activates correctly (TEST S)
  - Screen shake works for appropriate events (TEST T)
  - Player damage visual feedback works (TEST U)
  - Player death feedback works (TEST V)
  - Respawn feedback works (TEST W)
  - Aegis visual feedback works (TEST X)
  - Floating score feedback works (TEST Y)
  - Temporary feedback effects clean themselves up (TEST Z)
  - Feedback does not modify score (TEST AA)
  - Feedback does not modify health (TEST AB)
  - Feedback does not modify lives (TEST AC)
  - Feedback does not modify power-up duration (TEST AD)
  - Completion state remains frozen (TEST AE)
  - No gameplay audio starts after completion (TEST AF)
  - No gameplay feedback starts after completion (TEST AG)
  - Game Over state remains authoritative (TEST AH)
  - R clears audio and feedback state (TEST AI)
  - R starts a fresh audio/feedback state (TEST AJ)
  - Mute functionality works with toggle and query methods (TEST AK)
  - Missing audio assets do not crash the game (TEST AL)
  - No duplicate event listeners occur (TEST AM)
  - No console errors occur during normal gameplay (TEST AN)
  - No console errors occur during death/respawn (TEST AO)
  - No console errors occur during Game Over (TEST AP)
  - No console errors occur during completion (TEST AQ)
  - Repeated restarts cleanly reset audio and feedback (TEST AR)
  - Regression Suite (REG-2 through REG-9) 100% passed

## [Stage 9] - 2026-09-10
### Status: COMPLETED AND VERIFIED

### Features Added
- **UISystem (`src/systems/UISystem.js`)**: Built dedicated presentational controller managing HUD, Title screen, Game Over modal, and Level Complete modal with strict zero gameplay state duplication.
- **UI Design System (`src/config/uiConfig.js`)**: Established unified color palette, typography hierarchy, layout dimensions, transition durations, and `UIState` enum (`TITLE`, `GAMEPLAY`, `GAME_OVER`, `LEVEL_COMPLETE`).
- **Title / Start Screen**: Atmospheric overlay panel with pulsing `PRESS ENTER TO START` callout (`600ms` cycle) and complete controls reference that cleanly freezes gameplay world physics and enemy updates until dismissed.
- **Modernized Compact HUD**: Dual-line camera-pinned overlay (`scrollFactor: 0`, `depth: 50`) displaying 6-digit padded score (`000000`), 2-digit crystal collection progress (`00 / 20`), segmented health shield bar (`[■■■] 3/3`), lives (`3`), and live Aegis power-up timer with $\le 1000\text{ms}$ amber warning alert (`#f59e0b`).
- **Dedicated Game Over Overlay**: Modal window with dark red border presenting final score and collected crystals with `PRESS [R] TO RETRY` callout.
- **Dedicated Level Complete Overlay**: Modal window with radiant cyan border presenting 5-metric frozen audit (Final Score, Star Crystals, Enemies Defeated, Shields Remaining, Lives Remaining) with `PRESS [R] TO RESTART` callout.
- **Single-Screen Exclusivity**: Enforced bidirectional guard ensuring Game Over and Level Complete screens cannot render simultaneously.
- **Restart Hygiene**: Integrated `[R]` restart cleanly without duplicate event listener bindings.
- **Technical Documentation**: Authored `docs/UI_SYSTEM.md` covering system architecture, presentation flow, and component responsibilities.

### Files Added / Modified
- `src/config/uiConfig.js` (NEW)
- `src/systems/UISystem.js` (NEW)
- `docs/UI_SYSTEM.md` (NEW)
- `validate_stage9.ps1` (NEW)
- `test_stage9.html` (NEW)
- `src/scenes/GameScene.js` (MODIFIED)
- `index.html` (MODIFIED)
- `README.md` (MODIFIED)
- `PROJECT_PLAN.md` (MODIFIED)
- `CHANGELOG.md` (MODIFIED)

### Testing Status
- All 36 validation tests (Tests A through AJ) plus 7 regression suites verified and passed (43 / 43 tests passed):
  - Title screen appears on initial launch (TEST A)
  - Pressing ENTER starts gameplay (TEST B)
  - Title screen disappears after starting (TEST C)
  - Gameplay HUD appears correctly (TEST D)
  - Score displays correctly with leading zeroes (TEST E)
  - Star Crystal counter displays correctly (TEST F)
  - Health display reflects HealthSystem (TEST G)
  - Lives display reflects LivesSystem (TEST H)
  - Aegis display reflects PowerUpSystem (TEST I)
  - Aegis timer displays actual remaining duration (TEST J)
  - Aegis display clears after expiration (TEST K)
  - Score updates after collecting a Star Crystal (TEST L)
  - Score updates after defeating a Drifter Drone (TEST M)
  - Crystal count updates after collection (TEST N)
  - Health display updates after damage (TEST O)
  - Lives display updates after death (TEST P)
  - HUD behaves correctly after respawn (TEST Q)
  - Game Over screen appears correctly (TEST R)
  - Game Over statistics are accurate (TEST S)
  - R resets Game Over correctly (TEST T)
  - Title screen cannot coexist with gameplay UI (TEST U)
  - Game Over UI cannot coexist with completion UI (TEST V)
  - Goal completion still works (TEST W)
  - Completion screen displays correct final statistics (TEST X)
  - Completion statistics remain frozen (TEST Y)
  - Power-up state does not alter completion statistics (TEST Z)
  - R resets the completion screen correctly (TEST AA)
  - HUD remains camera-pinned (scrollFactor 0) (TEST AB)
  - HUD remains readable during camera movement (depth >= 50) (TEST AC)
  - UI remains stable and centered within viewport bounds (TEST AD)
  - No duplicate event listeners occur after restart (TEST AE)
  - Single UISystem instance prevents duplicate UI updates (TEST AF)
  - Clean UISystem imports and zero syntax discrepancies (TEST AG)
  - Game Over cleanly delegates to UISystem (TEST AH)
  - Level completion cleanly delegates to UISystem (TEST AI)
  - Repeated restarts cleanly execute with zero errors (TEST AJ)
  - Regression Suite (REG-2 through REG-8) 100% passed

## [Stage 8] - 2026-09-10
### Status: COMPLETED AND VERIFIED

### Features Added
- **PowerUpSystem**: Created `PowerUpSystem` (`src/systems/PowerUpSystem.js`) managing active power-ups, 5000ms duration tracking, duration refresh on repeated collection, and automatic expiration.
- **Aegis Core Entity**: Created `PowerUp` entity (`src/entities/PowerUp.js`) with procedural cyan/gold energy artifact visuals, smooth vertical floating oscillation (`Math.sin()`), and scale-up fade pickup feedback.
- **Level Data Placements**: Configured 2 Aegis Cores in `src/levels/level1.js` at `(620, 300)` and `(1420, 250)`.
- **Combat Immunity Integration**: Integrated with `HealthSystem.takeDamage()` to completely absorb incoming enemy collision damage during active Aegis with zero shield or life deduction.
- **Shield Aura Visual**: Added procedural cyan forcefield shield aura rendered over the player during active Aegis, with pulse animation upon damage deflection.
- **HUD Indicator**: Added camera-pinned live timer display (`AEGIS: ACTIVE  4.8s` or `AEGIS: --`).
- **Boundaries & Reset**: Sealed completion boundary ensuring no collection, activation, or timer ticks occur during level completion; cleared active power-up on death or Game Over; restored all power-up entities upon `R` restart.
- **Technical Documentation**: Created `docs/POWERUPS.md` covering system architecture, lifecycle, and damage pipeline integration.

### Files Added / Modified
- `src/config/powerUpConfig.js` (NEW)
- `src/systems/PowerUpSystem.js` (NEW)
- `src/entities/PowerUp.js` (NEW)
- `validate_stage8.ps1` (NEW)
- `test_stage8.html` (NEW)
- `docs/POWERUPS.md` (NEW)
- `src/levels/level1.js` (MODIFIED)
- `src/scenes/BootScene.js` (MODIFIED)
- `src/scenes/GameScene.js` (MODIFIED)
- `src/systems/HealthSystem.js` (MODIFIED)
- `index.html` (MODIFIED)
- `README.md` (MODIFIED)
- `PROJECT_PLAN.md` (MODIFIED)

### Testing Status
- All 34 validation tests (Tests A through AH) plus 6 regression suites verified and passed (40 / 40 tests passed):
  - Aegis Core spawning at configured positions (TEST A)
  - Power-up positions sourced from `level1.js` (TEST B)
  - Visual reachability and 20x20 hitbox (TEST C)
  - Overlap collection (TEST D)
  - Single-collection guard (TEST E)
  - PowerUpSystem activation (TEST F)
  - Enemy damage prevention (TEST G)
  - No permanent health modification (TEST H)
  - No extra lives granted (TEST I)
  - 5000ms automatic expiration (TEST J)
  - Resumption of normal enemy damage (TEST K)
  - Duration refresh on second pickup (TEST L)
  - HUD active state indicator (TEST M)
  - HUD countdown timer (TEST N)
  - HUD clearance on expiry (TEST O)
  - Active power-up cleared on death (TEST P)
  - Non-powered respawn (TEST Q)
  - Clear on Game Over (TEST R)
  - R-key system reset (TEST S)
  - R-key entity restoration (TEST T)
  - Completion boundary activation blocking (TEST U)
  - Completion boundary collection blocking (TEST V)
  - Completion boundary timer freeze (TEST W)
  - Goal reachable with active Aegis (TEST X)
  - Completion statistics unchanged (TEST Y)
  - Scoring invariants preserved (+100 crystal, +200 drone, 0 power-up) (TEST Z & AA)
  - Movement physics regression (TEST AB)
  - Camera and world boundaries regression (TEST AC)
  - Star Crystal collection regression (TEST AD)
  - Enemy combat regression (TEST AE)
  - Health and lives pipeline regression (TEST AF)
  - Goal completion regression (TEST AG)
  - Zero runtime errors and clean imports (TEST AH)

---

## [Stage 7] - 2026-09-10
### Status: COMPLETED AND VERIFIED

### Features Added
- **LevelCompletionSystem**: Created `LevelCompletionSystem` (`src/systems/LevelCompletionSystem.js`) managing single-fire level completion, performance statistics compilation, and `LEVEL_COMPLETE` event emission.
- **Goal Entity**: Created interactive `Goal` entity (`src/entities/Goal.js`) representing the Warp Gate Beacon at `(X: 2300, Y: 330)` with idle hovering, expansion pulse animation, and camera cyan flash on player contact.
- **Level Complete Overlay**: Designed a screen-pinned cyber panel overlay displaying final score, crystal count (`14 / 20`), enemies defeated (`3 / 5`), remaining shields, remaining lives, and `PRESS [R] TO RESTART`.
- **Gameplay Completion Freeze**: Freezes player movement, disables enemy damage, blocks collectible alterations, and prevents accidental death triggers upon reaching the goal.
- **Level Data Integration**: Formally typed the goal beacon in `src/levels/level1.js` (`goal: { x: 2300, y: 330, type: 'beacon' }`).
- **Technical Documentation**: Added `docs/LEVEL_COMPLETION.md` detailing the goal architecture, snapshot metrics, and restart behavior.

### Files Added / Modified
- `src/systems/LevelCompletionSystem.js` (NEW)
- `src/entities/Goal.js` (NEW)
- `validate_stage7.ps1` (NEW)
- `test_stage7.html` (NEW)
- `docs/LEVEL_COMPLETION.md` (NEW)
- `src/levels/level1.js` (MODIFIED)
- `src/scenes/GameScene.js` (MODIFIED)
- `src/scenes/BootScene.js` (MODIFIED)
- `src/systems/HealthSystem.js` (MODIFIED)
- `index.html` (MODIFIED)
- `README.md` (MODIFIED)
- `PROJECT_PLAN.md` (MODIFIED)

### Testing Status
- All 27 validation tests (Tests A through AA) plus 5 regression suites passed (32 / 32 tests verified):
  - Goal spawning at configured coordinates (TEST A)
  - Visual reachability and 36x64 hitbox (TEST B)
  - Goal trigger on contact (TEST C)
  - Single-fire event guard (TEST D)
  - Goal state transitions (TEST E)
  - Player movement freeze (TEST F)
  - Enemy damage disabling (TEST G)
  - Collectible interaction disabling (TEST H)
  - Final score accuracy (TEST I)
  - Crystal count accuracy (TEST J)
  - Enemy defeat tally accuracy (TEST K)
  - Shield display accuracy (TEST L)
  - Lives display accuracy (TEST M)
  - Repeat goal blocking (TEST N)
  - Game Over suppression on completion (TEST O)
  - R-key full level restart (TEST P)
  - Stage 6 death pipeline regression (TEST Q)
  - Crystal and score persistence on pre-completion deaths (TEST R & S)
  - Enemy respawn on death (TEST T)
  - Scoring integrity (+100/+200) (TEST U & V)
  - Camera bounds and deadzone (TEST W)
  - Stage 2 movement physics (TEST X)
  - Health/lives systems (TEST Y)
  - Pre-goal Game Over verification (TEST Z)
  - Clean Stage 7 codebase and zero runtime errors (TEST AA)

---

## [Stage 6] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **HealthSystem**: Created `HealthSystem` (`src/systems/HealthSystem.js`) managing player shield/health capacity (`MAX_HEALTH: 3`), non-negative clamping, and `HEALTH_CHANGED` / `PLAYER_DIED` event emission.
- **LivesSystem**: Created `LivesSystem` (`src/systems/LivesSystem.js`) managing player attempts (`STARTING_LIVES: 3`), life decrement on death, and `GAME_OVER` event emission.
- **Unified Death & Respawn Pipeline**: Handled both combat health depletion and death-zone pit falls through `handlePlayerDeath()`, deducting 1 life, granting 1.5s post-respawn invulnerability, restoring shields to full, and resetting Drifter Drones while preserving collected Star Crystals and score.
- **Game Over State**: Added a retro-styled `GAME OVER` overlay when all 3 lives are exhausted, freezing gameplay until `R` is pressed.
- **HUD Expansion**: Updated screen-pinned HUD to display segmented shield cells and life counters:
  `SHIELD: [■■■] 3/3   LIVES: 3`.

---

## [Stage 5] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **Drifter Drone Entity**: Created reusable `Enemy` entity (`src/entities/Enemy.js`) representing autonomous patrol drones with metallic shell, red ocular sensor, and thruster exhaust.
- **Platform Edge & Wall Awareness**: Implemented reliable edge boundary checking to smoothly reverse drone patrol direction without falling off platforms or jittering.
- **Stomp Combat Mechanic**: Added stomp detection when the player lands on top of a drone while descending (`vy > 0`), triggering a defeat squash animation, `+200` floating score popup, and upward bounce impulse (`-280 px/s`).
- **Side Impact & Knockback**: Added non-fatal side impact handler applying knockback impulse (`±180 px/s` X, `-160 px/s` Y), camera micro-shake, 1.0s invulnerability flicker, and emitting `PLAYER_ENEMY_HIT`.

---

## [Stage 4] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **Collectible System**: Created reusable `Collectible` entity (`src/entities/Collectible.js`) with idle floating bobbing, overlap detection, upward scale-pop animation, and score popup label (`+100`).
- **Decoupled ScoreSystem**: Implemented `ScoreSystem` (`src/systems/ScoreSystem.js`) maintaining total score, crystals collected, and emitting reactive `SCORE_CHANGED` events.
- **Sector Alpha Collectibles**: Placed 20 Star Crystals across ground sprints, stepped jumps, high runner ledges, and chasm gaps in `src/levels/level1.js`.

---

## [Stage 3] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **Modular Level Data**: Level geometry, spawn coordinates, and goal markers isolated in `src/levels/level1.js`.
- **Sector Alpha World**: Expansive 2400px side-scrolling level with varied platforms, ascents, and bottomless pits.
- **Smooth Camera Tracking**: Horizontal camera following with smooth interpolation (`lerpX: 0.08`, `lerpY: 0.03`) and deadzone (`60x40`).

---

## [Stage 2] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **Smooth Acceleration & Deceleration**: Snappy ground acceleration (`1100 px/s²`) and friction deceleration (`1300 px/s²`) up to `MOVE_SPEED: 230 px/s`.
- **Variable Jump Height**: Tapping jump yields a short hop; holding jump sustains lift. Early release applies `0.45x` velocity cutoff.
- **Coyote Time & Jump Buffering**: `0.13s` ledge jump forgiveness and `0.12s` pre-landing jump buffer.

---

## [Stage 1] - 2026-09-09
### Status: COMPLETED AND VERIFIED

### Features Added
- **Project Foundation**: Phaser 3.80.1 integration in pure ES Modules.
- **Procedural Graphics**: Canvas-generated placeholder textures for Orion, ground blocks, floating platforms, and starfield.
- **Player Entity**: Arcade physics sprite with bounding box and world collision.
- **Local Server**: PowerShell HTTP server (`server.ps1`) on port 8080.
