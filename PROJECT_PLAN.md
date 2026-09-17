# Star-Leaper: Orion Odyssey - Project Plan & Roadmap

## 1. Project Overview & Architectural Goals
An original 2D side-scrolling browser platformer created from scratch, inspired by classic Super Mario Bros gameplay, with 100% original characters, mechanics, art, names, levels, and branding.

- **Engine**: Phaser 3.80.1 (Arcade Physics).
- **Language**: Vanilla JavaScript (ES Modules).
- **Dependencies**: Zero external build/bundle dependencies; uses native HTTP server.
- **Current Stage**: **STAGE 12: STARLEAPER.IO DOMAIN INTEGRATION**
- **Status**: **COMPLETED AND VERIFIED (137 / 137 Tests Passing)**

---

## 2. Development Roadmap & Status

| Stage | Title | Status | Completion Date |
|---|---|---|---|
| **Stage 1** | Project Foundation & Minimal Scene | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 2** | Responsive Player Movement Physics | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 3** | Level, Camera & World System | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 4** | Collectibles & Scoring System | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 5** | Enemies (Patrol, Stomp & Damage) | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 6** | Player Health & Lives System | **COMPLETED & VERIFIED** | 2026-09-09 |
| **Stage 7** | Level Completion & Goal System | **COMPLETED & VERIFIED** | 2026-09-10 |
| **Stage 8** | Power-Ups System | **COMPLETED & VERIFIED** | 2026-09-10 |
| **Stage 9** | Full UI, Menus & Screens | **COMPLETED & VERIFIED** | 2026-09-10 |
| **Stage 10**| Audio & Feedback System | **COMPLETED & VERIFIED** | 2026-09-10 |
| **Stage 11**| Fullscreen, Character Sheet & Cosmic Shop | **COMPLETED & VERIFIED** | 2026-09-14 |
| **Stage 12**| starleaper.io Domain Integration & Routing | **COMPLETED & VERIFIED** | 2026-09-15 |

---

## 3. Stage-by-Stage Implementation Records

### Stage 1: Project Foundation (Completed)
- **Features**: Initialized Phaser 3.80.1 with Arcade Physics; created player, ground, platform, and starfield background textures procedurally via HTML5 Canvas; built modular folder structure (`src/config`, `src/entities`, `src/scenes`, `src/systems`, `src/levels`, `src/ui`).
- **Key Decisions**: Adopted standard ES Modules to avoid heavy node/bundler toolchains; authored `server.ps1` to serve files locally without CORS restrictions.

### Stage 2: Player Movement (Completed)
- **Features**: Smooth ground acceleration (`1100 px/s²`) and friction deceleration (`1300 px/s²`); independent air acceleration (`600 px/s²`); variable-height jump cutoff (`0.45x`); coyote time (`0.13s`); jump buffering (`0.12s`); jump/land squash & stretch; movement state tracking (`IDLE`, `RUNNING`, `JUMPING`, `FALLING`).
- **Key Decisions**: Centralized all movement constants into `playerConfig.js` to eliminate magic numbers and allow rapid gameplay tuning.

### Stage 3: Level, Camera & World System (Completed)
- **Features**: Built Sector Alpha (`2400x450px`); isolated level layout into `src/levels/level1.js`; smooth camera interpolation (`lerpX: 0.08`, `lerpY: 0.03`) with deadzone; strict camera bounds; open-bottom world bounds permitting death-zone falls (`y >= 480`); player reset pipeline zeroing residual velocity; Warp Gate goal beacon.
- **Key Decisions**: Completely decoupled level design from game engine logic, allowing future level generation and editing without touching `Player.js`.

### Stage 4: Collectibles & Scoring System (Completed)
- **Features**: Reusable `Collectible` entity with idle bobbing; multi-frame collection guard (state locking and physics disable); floating `+100` score popup effect; decoupled `ScoreSystem` managing points and collection tallies; 20 Star Crystals strategically placed in Sector Alpha; persistent collection across pit falls; `R`-key full level restart.
- **Key Decisions**: Retained collected crystals across death-zone respawns so players do not lose hard-earned progress on pit falls; implemented clean `reset()` on collectibles for full level restarts.

### Stage 5: Enemies & Basic Combat (Completed)
- **Features**: Original Drifter Drone entity (`src/entities/Enemy.js`); autonomous patrol with platform boundary detection and wall turnaround; stomp defeat mechanics granting upward bounce (`-280 px/s`) and `+200` score; side impact knockback (`±180 px/s` X, `-160 px/s` Y) and 1.0s invulnerability flicker; 5 drones placed across Sector Alpha; reset of all drones to initial positions on player death or `R` restart.
- **Key Decisions**: Tracked platform boundaries to turn enemies around deterministically without edge jitter; decoupled combat damage emission (`PLAYER_ENEMY_HIT`) so Stage 6 can hook in health/lives cleanly.

### Stage 6: Player Health & Lives (Completed)
- **Features**: Dedicated `HealthSystem` (`src/systems/HealthSystem.js`) with 3 shield cells and non-negative bounds; dedicated `LivesSystem` (`src/systems/LivesSystem.js`) starting with 3 lives; damage hook linked to `PLAYER_ENEMY_HIT` with invulnerability guard; unified death & respawn pipeline handling both health depletion and pit falls; 1.5s post-respawn invulnerability; clean Game Over state with restart prompt; HUD updated with shield cells and lives counter.
- **Key Decisions**: Unified pit falls and combat deaths through `handlePlayerDeath()`; ensured normal deaths deduct a life and respawn without resetting score or collected crystals, while `R` executes a full level restart.

### Stage 7: Level Completion & Goal System (Completed)
- **Features**: Dedicated `Goal` entity (`src/entities/Goal.js`) with idle oscillation and celebration pulse at `(X: 2300, Y: 330)`; decoupled `LevelCompletionSystem` (`src/systems/LevelCompletionSystem.js`) with single-fire completion guard; snapshot statistics capture (final score, crystals, enemies defeated, remaining health, lives); celebratory Level Complete overlay; clean restart restoration via `R`.
- **Key Decisions**: Kept completion decoupled from individual subsystems; disabled player inputs, enemy damage, and death processing upon goal contact; preserved player visibility and telemetry during completion display.

### Stage 8: Power-Ups System (Completed & Verified)
- **Features**: Dedicated `PowerUpSystem` (`src/systems/PowerUpSystem.js`) managing active effects, duration timers (5000ms), duration refresh, and expiration; `PowerUp` entity (`src/entities/PowerUp.js`) representing the Aegis Core artifact at `(620, 300)` and `(1420, 250)`; `HealthSystem.takeDamage()` integration to completely block incoming enemy collision damage while Aegis is active; player shield aura forcefield visual; camera-pinned HUD timer (`AEGIS: ACTIVE 4.8s` or `AEGIS: --`); strict completion and death boundaries.
- **Key Decisions**: Power-up collection awards no points in Stage 8 to preserve scoring invariants (+100 crystal, +200 drone); picking up a second Aegis Core while one is active refreshes the duration to full 5000ms rather than stacking; pit falls remain lethal; power-up timers freeze on level completion.

### Stage 9: Full UI, Menus & Screens (Completed & Verified)
- **Features**: Dedicated `UISystem` (`src/systems/UISystem.js`) and design constants (`src/config/uiConfig.js`); Title / Start screen with pulsing `PRESS ENTER TO START` pausing gameplay until triggered; modernized dual-line camera-pinned HUD displaying zero-padded score (`000000`), star crystals (`00 / 20`), segmented shields (`[■■■] 3/3`), lives (`3`), and live Aegis power-up timer with $\le 1000\text{ms}$ amber warning alert; modal Game Over overlay with final statistics; modal Level Complete overlay with 5-point frozen audit; single-screen exclusivity constraint; clean `R` restart hygiene with zero duplicate event listeners.
- **Key Decisions**: Strictly decoupled UI from gameplay state—`UISystem` acts solely as an observer/view layer; utilized Phaser containers pinned with `setScrollFactor(0)` and explicit depths (50 and 100) to isolate HUD from world camera scrolling.

### Stage 10: Audio & Feedback System (Completed & Verified)
- **Features**: Dedicated `AudioSystem` (`src/systems/AudioSystem.js`) and `FeedbackSystem` (`src/systems/FeedbackSystem.js`) backed by centralized configuration (`src/config/audioConfig.js`); zero-dependency procedural Web Audio synthesis for sound effects (`UI_START`, `CRYSTAL_COLLECT`, `ENEMY_DEFEAT`, `PLAYER_DAMAGE`, `PLAYER_DEATH`, `PLAYER_RESPAWN`, `POWERUP_COLLECT`, `POWERUP_ACTIVATE`, `POWERUP_EXPIRE`, `GOAL_REACHED`, `LEVEL_COMPLETE`, `GAME_OVER`) and ambient music states (`TITLE_MUSIC`, `GAMEPLAY_MUSIC`, `GAME_OVER_MUSIC`, `COMPLETION_MUSIC`); restrained screen shakes, temporary player color flashes, and self-cleaning floating score labels (`+100`, `+200`); real-time mute support (`M` key); full cleanup on restart and completion boundaries.
- **Key Decisions**: Synthesized audio natively via the browser Web Audio API to eliminate external audio dependencies and ensure 100% original sci-fi sound; decoupled feedback from gameplay logic with strict suppression upon level completion or Game Over.

---

## 4. Known Limitations & Technical Notes
1. **Multi-Level Progression**: Sector Alpha is currently the solitary level; additional sectors and scene transitions will be added in future expansions.
2. **Browser Autoplay Policies**: Audio synthesis resumes automatically on the first user interaction (e.g., pressing `ENTER` to start), complying with standard browser Web Audio security policies.

---

## 5. Next Planned Stage: Stage 11 (Polish & Expansions)
- Implement multi-sector transitions, additional hazard types, and further visual enhancements while preserving all existing system invariants.
