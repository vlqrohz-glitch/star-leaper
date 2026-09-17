# Technical Documentation: Audio & Feedback System

## 1. Overview
The **Audio & Feedback System** introduced in Stage 10 establishes a centralized, modular audio engine (`AudioSystem.js`) and visual/tactile juice controller (`FeedbackSystem.js`) for *Star-Leaper: Orion Odyssey*. Governed by centralized configuration constants (`audioConfig.js`), it provides responsive sound effects, ambient sci-fi music states, screen shakes, floating score labels, and energy pulses while preserving all gameplay invariants from Stages 1 through 9.

### Key Architectural Pillars
- **Zero Gameplay State Duplication**: Neither `AudioSystem` nor `FeedbackSystem` owns, tracks, calculates, or modifies score, health, lives, crystals, enemy counters, power-up duration, or level completion.
- **Event-Driven Integration**: Systems react asynchronously to authoritative engine events (`SCORE_CHANGED`, `HEALTH_CHANGED`, `LIVES_CHANGED`, `ENEMY_DEFEATED`, `COLLECTIBLE_COLLECTED`, `POWERUP_COLLECTED`, `POWERUP_ACTIVATED`, `POWERUP_EXPIRE`, `LEVEL_COMPLETE`, `GAME_OVER`).
- **Autonomous Feedback Cleanup**: All temporary feedback objects (floating texts, camera shakes, player flashes, and tweens) automatically clean themselves up or reset cleanly on `R`.
- **Procedural Zero-Dependency Audio**: In compliance with development rules, audio is synthesized natively using the standard browser Web Audio API (`AudioContext`), ensuring zero external copyrighted assets and graceful fallback in headless or restricted browser environments.

---

## 2. AudioSystem Architecture (`src/systems/AudioSystem.js`)

```text
                     Phaser GameScene Events
                                │
                                ▼
                       AudioSystem.js
   ┌────────────────────────────┼────────────────────────────┐
   ▼                            ▼                            ▼
SFX Synthesizer          Music Synthesizer           Volume / Mute Bus
• UI Start Chime         • Title Ambient Drone       • Master Volume (0.7)
• Crystal Chime          • Gameplay Arpeggio Loop    • SFX Volume (0.8)
• Drone Crunch Stomp     • Game Over Drone           • Music Volume (0.4)
• Damage / Death Buzz    • Victory Triad Loop        • Mute Toggle [M Key]
• Respawn Hum                                        • Safe Gain Nodes
• Aegis Surge / Down
• Goal / Complete Fanfare
```

### API Specification
- `initialize(scene)`: Connects scene reference and instantiates the browser Web Audio context.
- `playSFX(key)`: Triggers procedural sound synthesis for the given logical key. Safely resumes audio context if suspended.
- `playMusic(key)`: Transitions to the specified music state, terminating any previously active music loop to guarantee single-instance playback.
- `stopMusic()`: Halts the active music oscillator loop and clears internal timers.
- `setMasterVolume(value)` / `setSFXVolume(value)` / `setMusicVolume(value)`: Clamps input to `[0.0, 1.0]` and adjusts respective Web Audio gain nodes.
- `toggleMute()` / `isMuted()`: Toggles mute status; sets master gain node to `0` without halting background state.
- `reset()`: Stops all active oscillators, timers, and active nodes, returning audio state to fresh baseline.

### Logical Keys & Synthesizer Mappings (`audioConfig.js`)
| Logical Key | Type | Frequency / Waveform | Synthesis Character |
|---|---|---|---|
| `UI_START` | SFX | `[440, 660, 880] Hz` (Sine) | Ascending cybernetic triad chime |
| `CRYSTAL_COLLECT` | SFX | `[1200, 1800] Hz` (Sine) | Rapid celestial dual chime |
| `ENEMY_DEFEAT` | SFX | `280 → 60 Hz` (Triangle) | Downward mechanical crunch sweep |
| `PLAYER_DAMAGE` | SFX | `160 → 70 Hz` (Sawtooth) | Harsh impact distortion buzz |
| `PLAYER_DEATH` | SFX | `420 → 50 Hz` (Sawtooth) | Downward quantum dissolution |
| `PLAYER_RESPAWN` | SFX | `180 → 540 Hz` (Sine) | Upward materialization sweep |
| `POWERUP_COLLECT` | SFX | `[587.33, 880] Hz` (Sine) | Resonant dual harmonic chime |
| `POWERUP_ACTIVATE` | SFX | `[440, 660, 880, 1100] Hz` | Forcefield energy power surge |
| `POWERUP_EXPIRE` | SFX | `520 → 180 Hz` (Sine) | Dissipating energy release |
| `GOAL_REACHED` | SFX | `[523.25, 659.25, 783.99] Hz` | Radiant cosmic resonance chime |
| `LEVEL_COMPLETE` | SFX | `[523, 659, 784, 1046] Hz` | Victorious celestial arpeggio |
| `GAME_OVER` | SFX | `[220, 164.81, 110] Hz` | Low descending sombre cadence |

---

## 3. FeedbackSystem Architecture (`src/systems/FeedbackSystem.js`)

```text
                     Gameplay Event Trigger
                                │
                                ▼
                       FeedbackSystem.js
   ┌────────────────────────────┼────────────────────────────┐
   ▼                            ▼                            ▼
Tactile Screen Shakes    Visual Player Flashes      Floating Score Labels
• Damage (0.008, 120ms)  • Red Tint (0xff3333)      • Crystal (+100 Gold)
• Stomp (0.006, 100ms)   • Cyan Spawn (0x00f0ff)    • Stomp (+200 Red)
• Death (0.015, 250ms)   • Death Flash (0xff0000)   • Drift upward 18px
• Goal (0.010, 200ms)    • Aura Ripple              • Auto-destroy onComplete
```

### API Specification
- `initialize(scene)`: Sets scene reference and initializes tracking sets for popups and tweens.
- `screenShake(intensity, duration)`: Invokes `cameras.main.shake(duration, intensity)` with restrained values that do not displace camera bounds.
- `playerFlash(color, duration)`: Applies temporary color tint to the player sprite and schedules automatic `clearTint()`.
- `spawnFloatingScore(x, y, amount, color)`: Creates a bitmap text popup at `(x, y)` that drifts upward by 18px while fading out over 400ms, then destroys itself.
- `playerDamage()`, `playerDeath()`, `playerRespawn()`: Triggers specific combinations of screen shake, camera flash, and sprite tints.
- `crystalCollected(x, y, amount)`, `enemyDefeated(x, y, amount)`: Spawns floating labels with appropriate colors and shakes.
- `powerUpCollected(x, y)`, `powerUpActivated()`, `powerUpExpired()`: Pulses shield forcefield aura and triggers aura expansion.
- `goalReached()`, `levelComplete()`, `gameOver()`: Provides celebratory or failure camera flashes.
- `isGameplayLocked()`: Returns `true` if `LevelCompletionSystem.isLevelComplete()` or `isGameOver` is true, suppressing further gameplay feedback.
- `reset()`: Destroys all active floating score popups, terminates active tweens, and restores default player sprite tint.

---

## 4. System Integrations & Boundaries

### A. Level Completion Boundary
- When `levelCompletionSystem.isLevelComplete()` becomes `true`:
  - `audioSystem.stopMusic()` immediately stops `GAMEPLAY_MUSIC`.
  - `audioSystem.playMusic(MUSIC_STATES.COMPLETION_MUSIC)` starts the victory theme.
  - `audioSystem.playSFX(AUDIO_KEYS.LEVEL_COMPLETE)` plays the triumphant fanfare.
  - `feedbackSystem.isGameplayLocked()` returns `true`, guaranteeing that subsequent background contacts or timer events cannot spawn new floating labels or screen shakes.
  - Completion statistics snapshot remains 100% frozen.

### B. Game Over Boundary
- When player lives hit `0`:
  - `audioSystem.stopMusic()` stops `GAMEPLAY_MUSIC`.
  - `audioSystem.playMusic(MUSIC_STATES.GAME_OVER_MUSIC)` starts the failure theme.
  - `audioSystem.playSFX(AUDIO_KEYS.GAME_OVER)` plays the Game Over sound.
  - `feedbackSystem.isGameplayLocked()` returns `true`, blocking further combat feedback.

### C. Level Restart Hygiene (`R` Key)
- Pressing `R` triggers `restartLevel()`:
  - `audioSystem.reset()` clears active oscillators and stops old music.
  - `audioSystem.playSFX(AUDIO_KEYS.UI_START)` plays the restart confirmation sound.
  - `audioSystem.playMusic(MUSIC_STATES.GAMEPLAY_MUSIC)` starts fresh gameplay music.
  - `feedbackSystem.reset()` destroys all orphan popups, stops active tweens, and resets camera tint/shake.
  - Guaranteed zero duplicate event listeners or overlapping music instances.

---

## 5. Controls & Configuration Reference
- **Mute Shortcut**: Pressing **`M`** toggles audio mute on the fly (`audioSystem.toggleMute()`).
- **Tuning File**: All audio volumes, music states, shake intensities, and popup timings are centralized in [`src/config/audioConfig.js`](file:///c:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/src/config/audioConfig.js).
