# Star-Leaper: Orion Odyssey

An original 2D side-scrolling platformer built from scratch using **Phaser 3.80.1** and modern **JavaScript ES Modules**, featuring responsive Mario-inspired platforming physics, modular level architecture, and an original sci-fi celestial aesthetic.

---

## Current Development Status
- **Current Stage**: **STAGE 11: FULLSCREEN, CHARACTER SHEET & COSMIC SHOP (MAJOR EXPANSION)**
- **Status**: **COMPLETED AND VERIFIED (123/123 Automated Tests Passing)**
- **Key Additions**:
  - **Fullscreen Overhaul**: Native 16:9 letterbox preservation, global `[F]` toggle, zero stretching.
  - **Character Sheet (Operative Dossier)**: Stats meters, live outfit & pet inspection bay, class lore.
  - **Cosmic Shop (Emporium)**: Outfits, passive perks, companion pets with dynamic equipping and wallet persistence.

---

## Complete Core Gameplay Loop

```text
Title / Start Screen ("PRESS ENTER TO START" + Ambient Drone)
              ↓
Start at Spawn Pad (X: 80, Y: 360)
              ↓
Explore Sector Alpha (2400x450 + Space Synth Arpeggio)
              ↓
Collect Star Crystals (+100 pts Floating Feedback & Chime)
              ↓
Stomp Drifter Drones (+200 pts Floating Feedback, Shake & Crunch)
              ↓
Collect Aegis Core Power-Up (5.0s Shield Aura Surge & HUD Warning Pulse)
              ↓
Manage Shields & Lives via Modernized Compact HUD
              ↓
Reach Warp Gate Beacon (X: 2300, Y: 330 + Cosmic Chime)
              ↓
Level Complete! (Snapshot Statistics & Victory Fanfare)
              ↓
Restart Cleanly via [R] Key (Instant Fresh Run & Audio Reset)
```

---

## Features Implemented

### 1. Foundation & Engine (Stage 1)
- **Framework**: Phaser 3.80.1 Arcade Physics engine running in pure ES Modules without npm/bundler dependencies.
- **Procedural Graphics**: Crisp custom pixel art generated dynamically via HTML5 Canvas (Player suit, cyber-slate ground blocks, floating neon platforms, starfield grid).

### 2. Player Movement Physics (Stage 2)
- **Acceleration & Deceleration**: Smooth ground acceleration (`1100 px/s²`) and friction braking (`1300 px/s²`) up to terminal speed (`230 px/s`).
- **Air Control**: Dedicated airborne acceleration (`600 px/s²`) preserving forward momentum.
- **Variable Jump Height**: Tapping jump yields a low hop; holding jump sustains upward lift (`JUMP_HOLD_TIME: 0.16s`). Early release dampens velocity by `0.45x`.
- **Coyote Time & Jump Buffering**: `0.13s` ledge grace window and `0.12s` pre-landing jump buffer.
- **Movement State Machine**: Exposes `IDLE`, `RUNNING`, `JUMPING`, and `FALLING`.

### 3. Level & Camera System (Stage 3)
- **Sector Alpha (Level 1)**: Expansive `2400x450` world defined in modular data format (`src/levels/level1.js`).
- **Smooth Camera Tracking**: Horizontal tracking with interpolation (`lerpX: 0.08`, `lerpY: 0.03`) and `60x40` deadzone.
- **World Boundaries**: Strict camera clamping inside `[0, 0, 2400, 450]`.
- **Death Zone & Respawn**: Falling below `y: 480` flashes the camera and triggers the unified death and respawn pipeline.

### 4. Collectibles & Scoring System (Stage 4)
- **Star Crystals**: 20 faceted celestial crystals scattered across Sector Alpha (ground sprints, jump arcs, and over chasm gaps).
- **Decoupled ScoreSystem**: Tracks score points (`+100` per crystal, `+200` per enemy defeat), crystals collected, and emits reactive events.
- **Visual Feedback**: Floating score popups (`+100`), upward scale-pop animation, and audio event hooks.
- **Persistent Progress**: Collected crystals remain collected across player deaths.

### 5. Enemies & Basic Combat (Stage 5)
- **Drifter Drone**: Autonomous hovering patrol robot with metallic chassis, pulsating crimson optic eye, and dual thrusters.
- **Platform Edge & Wall Awareness**: Intelligently senses the boundaries of supporting platforms and walls, reversing patrol direction smoothly without falling or jittering.
- **Stomp Mechanic**: Landing on top of an enemy while falling (`vy > 0`) defeats the drone with a squash animation, grants an upward bounce impulse (`-280 px/s`), and awards `+200` points.
- **Side Impact & Knockback**: Colliding from the side triggers a knockback impulse (`±180 px/s` horizontal, `-160 px/s` vertical) and 1.0s invulnerability flicker.

### 6. Player Health & Lives System (Stage 6)
- **HealthSystem (`HealthSystem.js`)**: Manages 3 shield units (`MAX_HEALTH: 3`). Side collisions deduct 1 unit per hit. Duplicate hits during invulnerability are blocked.
- **LivesSystem (`LivesSystem.js`)**: Tracks remaining player attempts (`STARTING_LIVES: 3`). When health drops to 0 or player falls into a pit, 1 life is deducted.
- **Unified Death & Respawn Pipeline**: Respawns the player after 500ms at the start pad with full shield and 1.5s post-respawn invulnerability. If all lives are lost, triggers the `GAME OVER` overlay.

### 7. Level Completion & Goal System (Stage 7)
- **Warp Gate Beacon (`src/entities/Goal.js`)**: Interactive beacon entity with idle oscillation and celebratory expansion pulse at level terminus `(X: 2300, Y: 330)`.
- **LevelCompletionSystem (`src/systems/LevelCompletionSystem.js`)**: Single-fire completion manager that compiles performance statistics and emits `LEVEL_COMPLETE`.
- **Level Complete Overlay**: Freezes player movement, disables enemy damage and collectibles, and displays final score, crystals gathered, enemies stomped, remaining shields, and lives.
- **Full Level Restart (`R` key)**: Pressing `R` cleanly resets completion states, health, lives, score, crystals, enemies, and player for a fresh attempt.

### 8. Power-Ups System (Stage 8)
- **PowerUpSystem (`src/systems/PowerUpSystem.js`)**: Manages active power-ups, duration timers (5000ms), duration refresh upon collecting additional cores, and automatic expiration.
- **Aegis Core Artifact (`src/entities/PowerUp.js`)**: Procedural celestial energy artifacts at `(620, 300)` and `(1420, 250)` with smooth sine-wave bobbing and pickup feedback.
- **Combat Immunity Integration**: Enemy collision damage is completely blocked during active Aegis with zero shield or life loss; player shield aura provides clear visual feedback.
- **HUD Power-Up Indicator**: Camera-pinned live timer display (`AEGIS: ACTIVE  4.8s` or `AEGIS: --`).
- **Clean Boundary Enforcement**: Active power-up clears upon death or Game Over; power-up collection and timers freeze upon reaching level completion.

### 9. UI, Menus & Game-State Presentation (Stage 9)
- **UISystem (`src/systems/UISystem.js`)**: Centralized presentation manager isolating all UI elements into screen-pinned containers (`scrollFactor: 0`, depths 50 and 100).
- **Centralized UI Design System (`src/config/uiConfig.js`)**: Cohesive typography, layout metrics, transition timings, and curated sci-fi color palette.
- **Title / Start Screen**: Atmospheric overlay with cybernetic panel and pulsing `PRESS ENTER TO START` callout that pauses world physics until activated.
- **Modernized Compact HUD**: Dual-line camera-pinned overlay showing zero-padded score (`000000`), star crystals (`00 / 20`), segmented shields (`[■■■] 3/3`), lives (`3`), and live Aegis timer with $\le 1000\text{ms}$ amber warning alert.
- **Cohesive Game Over & Level Complete Screens**: Dedicated modals enforcing strict single-screen exclusivity with complete final run statistics.
- **Zero-State Duplication**: Presentation layer is strictly view-only, querying engine systems without storing or duplicating authoritative gameplay state.

### 10. Audio & Feedback System (Stage 10)
- **AudioSystem (`src/systems/AudioSystem.js`)**: Centralized audio manager and procedural Web Audio synthesizer creating custom sound effects and ambient melodic music states without external asset dependencies.
- **FeedbackSystem (`src/systems/FeedbackSystem.js`)**: Centralized visual juice controller driving restrained camera screen shakes, temporary player color flashes, energy aura pulses, and floating score popups.
- **Centralized Audio Configuration (`src/config/audioConfig.js`)**: Volume constants (`MASTER_VOLUME: 0.7`, `SFX_VOLUME: 0.8`, `MUSIC_VOLUME: 0.4`), logical sound keys, music states, and screen shake metrics.
- **Audio Mute Support**: Real-time mute toggling via the `M` key with clean gain ramp attenuation.
### 11. Fullscreen Engine & Responsive Letterboxing
- **Distortion-Free Scaling**: Eliminated aggressive CSS stretching overrides (`width: 100% !important; height: 100% !important;`) on `#game-container canvas`, applying modern CSS letterbox containment (`max-width: 100%; max-height: 100%; object-fit: contain;`).
- **Phaser 3.80.1 Integration**: `Scale.FIT` and `Scale.CENTER_BOTH` dynamically adapt to any screen resolution while strictly preserving the pristine 16:9 aspect ratio with clean letterboxing bars.
- **Global Key & UI Binding**: Pressing `F` or clicking the top-bar `⛶ FULLSCREEN [F]` button instantly toggles fullscreen mode with automatic state tracking across `fullscreenchange` and vendor events.

### 12. Operative Dossier & Character Sheet (`CharacterSheetScene.js`)
- **Inspection Pedestal**: Features an active holographic examination bay rendering the operative wearing their equipped outfit variant alongside their animated companion pet.
- **Attribute Visualizer**: Bar meters tracking Ground Speed, Jump Lift, Air Agility, and Shield HP durability across all playable operatives (Nova, Zenith, Atlas, Lumen).
- **Loadout Status**: Direct readouts of currently equipped passive perk modules and active companion pets.
- **Seamless Navigation**: Switch between operatives via `[←/→]`, deploy directly via `[ENTER]`, or jump straight into the Cosmic Shop with `[S]`.

### 13. Cosmic Shop & Progression Economy (`ShopScene.js`)
- **Star Crystal Economy**: Collecting crystals in levels directly funds your persistent wallet balance. Initial balance starts at 500 ★ for instant customization.
- **Outfits Catalog**: 5 customizable flight suits per operative with procedurally synthesized pixel textures:
  - *Standard Issue* (Default flight suit)
  - *Solar Flare* (Molten crimson insulation armor with thermonuclear gold visor)
  - *Cyber Void* (Stealth-coated carbon composite plate laced with ultraviolet conduits)
  - *Neon Pulse* (High-frequency luminescent synthwave armor)
  - *Stellar Gold* (Legendary ceremonial commander plate forged from auric alloy)
- **Passive Perks Catalog**: Equippable gameplay modifiers:
  - *Magnet Core*: Pulls Star Crystals towards the player within a 120px magnetic radius.
  - *Reinforced Plating*: Grants +1 extra maximum shield hit point capacity.
  - *Boost Thrusters*: Grants +12% movement speed and +8% jump lift.
  - *Lucky Stars*: Grants +50 bonus score points and extra crystal payout per pickup.
- **Companion Pets Catalog**: Autonomous stardust-trailing familiars that accompany the player:
  - *Cosmo the Pup*: Loyal celestial puppy with glowing neon ears and tail.
  - *Orb-E Drone*: Autonomous hovering reconnaissance companion with a pulsing cyan optical lens.
  - *Chrono Owl*: Ancient biomechanical owl with golden plumage and chronal temporal tail feathers.
  - *Star-Kitten*: Mischievous stardust kitten with pink luminescent ears and playful harmonic bobbing.
- **Storage Persistence**: State seamlessly persists in `sessionStorage` with graceful fallback across scene reloads.

---

## How to Run the Project

The project is zero-dependency and served locally via PowerShell:

1. **Configure Local Domain `starleaper.io` (One-Time Setup)**:
   - Double-click **`setup_starleaper_domain.bat`** (or run `powershell -ExecutionPolicy Bypass -File .\setup_starleaper_domain.ps1` as Administrator).
   - This maps `starleaper.io` to `127.0.0.1` in your Windows hosts file and flushes the DNS cache.
2. **Launch the Game Server**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8080
   ```
3. **Open in Your Browser**:
   - **[http://starleaper.io:8080/](http://starleaper.io:8080/)** (or **[http://starleaper.io/](http://starleaper.io/)**)
   - Local fallback: **[http://127.0.0.1:8080/](http://127.0.0.1:8080/)**

---

## Controls

| Key | Action | Description |
|---|---|---|
| `Enter` / `Space` | Start / Confirm | Dismisses Title Screen, confirms shop/sheet selections |
| `←` / `A` | Move Left | Smooth acceleration to maximum ground speed |
| `→` / `D` | Move Right | Smooth acceleration to maximum ground speed |
| `↑` / `W` / `Space` | Jump & Double Jump | Variable jump height; tap again in mid-air to Double Jump |
| `F` | Fullscreen Toggle | Toggles distortion-free 16:9 fullscreen mode |
| `ESC` | Pause / Back | Opens the Pause Menu or returns to previous screen |
| `C` | Character Sheet | Opens the Operative Dossier from menus or in-game pause |
| `S` | Cosmic Shop | Opens the Cosmic Shop from Character Select or Character Sheet |
| `1` - `5` | Quick Select | Category tabs in Shop; direct sector select in Level Select |
| `R` | Restart Level | Clean level reset (entities, audio, shields, lives) |
| `M` | Toggle Mute | Silences / restores all sound effects and background music |

---

## Project Structure

```
star-leaper/
├── index.html                      # Arcade frame container & canvas viewport
├── server.ps1                      # Zero-dependency local development HTTP server
├── validate_stage10.ps1            # Automated Stage 10 test verification script
├── test_stage10.html               # Browser-based Stage 10 test suite
├── README.md                       # Project documentation & run guide
├── PROJECT_PLAN.md                 # 10-Stage development roadmap & progress tracker
├── CHANGELOG.md                    # Detailed stage-by-stage release log
├── docs/
│   ├── HEALTH_AND_LIVES.md         # Technical architecture for health, lives & respawn
│   ├── LEVEL_COMPLETION.md         # Technical architecture for goal and completion
│   ├── POWERUPS.md                 # Technical architecture for power-ups and Aegis Core
│   ├── UI_SYSTEM.md                # Technical architecture for UI, HUD & Game-State presentation
│   └── AUDIO_AND_FEEDBACK.md       # Technical architecture for Audio and Feedback systems
├── lib/
│   └── phaser.min.js               # Phaser 3.80.1 runtime library
└── src/
    ├── main.js                     # Game entry point and bootstrap
    ├── config/
    │   ├── gameConfig.js           # Resolution (800x450), Arcade physics config
    │   ├── playerConfig.js         # Movement tuning (speed, accel, jump, coyote)
    │   ├── playerHealthConfig.js   # Health, lives, damage, respawn delay constants
    │   ├── powerUpConfig.js        # Power-up types, duration (5.0s), bobbing tuning
    │   ├── uiConfig.js             # UI states, colors, layout metrics, timing constants
    │   ├── audioConfig.js          # Volumes, audio keys, music states, shake constants
    │   ├── collectibleConfig.js    # Crystal score values, bobbing, animation timing
    │   └── enemyConfig.js          # Drone patrol speed, bounce, knockback, score
    ├── entities/
    │   ├── Player.js               # Orion entity (movement, jump, combat, invulnerability)
    │   ├── Enemy.js                # Drifter Drone entity (patrol AI, edge turn, defeat)
    │   ├── PowerUp.js              # Aegis Core entity (bobbing, collection, reset)
    │   ├── Collectible.js          # Star Crystal entity (overlap, floating popup, reset)
    │   └── Goal.js                 # Warp Gate Beacon entity (pulse, trigger, reset)
    ├── scenes/
    │   ├── BootScene.js            # Procedural canvas textures generator
    │   └── GameScene.js            # Main world scene (platforms, camera, HUD, audio loop)
    ├── systems/
    │   ├── InputSystem.js          # Unified keyboard input abstraction
    │   ├── ScoreSystem.js          # Decoupled score and collectible counter state
    │   ├── HealthSystem.js         # Decoupled shield/health tracking and damage logic
    │   ├── LivesSystem.js          # Decoupled life allocations and Game Over triggers
    │   ├── PowerUpSystem.js        # Decoupled power-up timer and state manager
    │   ├── LevelCompletionSystem.js# Decoupled level completion and statistics manager
    │   ├── UISystem.js             # Decoupled HUD, Title, Game Over, and Completion presentation
    │   ├── AudioSystem.js          # Decoupled procedural audio engine & music synthesizer
    │   └── FeedbackSystem.js       # Decoupled screen shake, flash & floating score feedback
    └── levels/
        └── level1.js               # Sector Alpha platforms, spawn, crystals, enemies, power-ups, goal
```

---

## Configuration & Tuning

- **Audio & Feedback**: Modify [src/config/audioConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/audioConfig.js).
- **UI & Presentation**: Modify [src/config/uiConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/uiConfig.js).
- **Power-Ups**: Modify [src/config/powerUpConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/powerUpConfig.js).
- **Level & Placements**: Modify [src/levels/level1.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/levels/level1.js).
- **Health & Lives**: Modify [src/config/playerHealthConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/playerHealthConfig.js).
- **Movement Feel**: Modify [src/config/playerConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/playerConfig.js).
- **Enemies & Combat**: Modify [src/config/enemyConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/enemyConfig.js).
- **Collectibles**: Modify [src/config/collectibleConfig.js](file:///C:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/collectibleConfig.js).
