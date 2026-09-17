# Technical Documentation: Player Health & Lives System

## 1. Overview
The Player Health & Lives system provides a modular, event-driven damage, life tracking, respawning, and Game Over pipeline for **Star-Leaper: Orion Odyssey**. It cleanly decouples damage calculation (`HealthSystem`) and life tracking (`LivesSystem`) from the player entity (`Player.js`) and presentation layer (`HUD`).

---

## 2. Configuration (`src/config/playerHealthConfig.js`)
All tuning parameters are centralized and configurable:
```javascript
export const HEALTH_CONFIG = {
  MAX_HEALTH: 3,                          // Maximum shield capacity
  STARTING_HEALTH: 3,                     // Health granted at spawn/respawn
  STARTING_LIVES: 3,                      // Starting lives allocation
  DAMAGE_PER_HIT: 1,                      // Health deducted per enemy collision
  POST_RESPAWN_INVULNERABILITY: 1.5,      // Seconds of immunity granted after respawn
  RESPAWN_DELAY: 500,                     // Milliseconds before respawn sequence triggers
  MINIMUM_HEALTH: 0                       // Floor for health values
};

export const LifeState = Object.freeze({
  ALIVE: 'ALIVE',
  DAMAGED: 'DAMAGED',
  DEAD: 'DEAD',
  RESPAWNING: 'RESPAWNING'
});
```

---

## 3. Architecture & Class Responsibilities

### A. `HealthSystem` (`src/systems/HealthSystem.js`)
- **Responsibility**: Tracks current shield/health units, clamps within `[0, MAX_HEALTH]`, and emits state events.
- **Key Methods**:
  - `takeDamage(amount, source)`: Deducts health and emits `HEALTH_CHANGED`. If health reaches 0, emits `PLAYER_DIED`.
  - `heal(amount)`: Restores health up to `MAX_HEALTH`.
  - `getHealth()` / `getMaxHealth()`: Accessors for HUD and gameplay checks.
  - `isDead()`: Returns boolean indicating whether health is 0.
  - `reset()`: Restores health to `MAX_HEALTH`.

### B. `LivesSystem` (`src/systems/LivesSystem.js`)
- **Responsibility**: Tracks remaining life allocations, decrements on death, and triggers Game Over.
- **Key Methods**:
  - `loseLife()`: Decrements life count and emits `LIVES_CHANGED`. If lives reach 0, emits `GAME_OVER`.
  - `getLives()`: Returns remaining lives.
  - `hasLivesRemaining()`: Returns `lives > 0`.
  - `reset()`: Restores lives to `STARTING_LIVES`.

### C. `Player` (`src/entities/Player.js`)
- Maintains `lifeState` (`ALIVE`, `DAMAGED`, `DEAD`, `RESPAWNING`).
- Dispatches `PLAYER_ENEMY_HIT` with knockback velocity upon enemy collision when not invulnerable.
- Runs invulnerability timer with rapid visual flickering (`setAlpha(0.3 / 0.9)`).
- Provides `setPostRespawnInvulnerability(duration)` to grant grace immunity after respawning.
- Freezes input and movement during `DEAD` and `RESPAWNING` states.

---

## 4. Flow Diagrams

### Damage Pipeline
```
[Player touches Enemy from side]
          │
  Is Invulnerable or Dead?
     ├── YES ──> Ignore collision
     └── NO  ──> Apply knockback velocity (±180, -160)
                 Start 1.0s invulnerability flicker
                 Camera micro-shake (120ms)
                 Emit PLAYER_ENEMY_HIT
                        │
             HealthSystem.takeDamage(1)
                        │
                Emit HEALTH_CHANGED
                        │
                 HUD updates shield cells
```

### Unified Death & Respawn Pipeline
```
[Health <= 0] OR [Player falls into Death Zone (Y >= 480)]
                        │
              handlePlayerDeath(source)
                        │
         Is already Dead / Game Over?
            ├── YES ──> Return (prevent duplicate triggers)
            └── NO  ──> Set player.lifeState = DEAD
                        Zero player velocity
                        Camera red flash (250ms)
                        LivesSystem.loseLife()
                                │
                   Has Lives Remaining?
                      ├── YES ──> Wait RESPAWN_DELAY (500ms)
                      │           Move player to spawn (80, 360)
                      │           HealthSystem.reset() (Health = 3)
                      │           player.setPostRespawnInvulnerability(1.5s)
                      │           Reset all 5 Drifter Drones to starting patrol
                      │           Star Crystals and Score stay preserved!
                      │           player.lifeState = ALIVE
                      │
                      └── NO  ──> Emit GAME_OVER
                                  triggerGameOver()
                                  Display GAME OVER overlay
                                  Freeze input and collision
```

### Full Level Restart (`R` key)
```
[Press 'R' Key]
        │
restartLevel()
        ├── Clear Game Over overlay
        ├── HealthSystem.reset() (Health = 3)
        ├── LivesSystem.reset() (Lives = 3)
        ├── ScoreSystem.reset() (Score = 0, Crystals = 0/20)
        ├── Collectibles: Reset all 20 Star Crystals
        ├── Enemies: Reset all 5 Drifter Drones
        ├── Player: reset to spawn (80, 360) with LifeState.ALIVE
        └── Update HUD
```

---

## 5. HUD Display
The screen-pinned HUD displays reactive metrics:
```text
SCORE: 000000  ★  CRYSTALS: 00 / 20
SHIELD: [■■■] 3/3   LIVES: 3
```
- **Shield Cells**: Visual segmented representation (`■` for active cell, `□` for depleted cell).
- Pinned to viewport using `setScrollFactor(0)` to ensure visibility while the camera tracks the player.
