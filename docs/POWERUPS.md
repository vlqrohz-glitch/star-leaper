# Technical Documentation: Power-Ups System & Aegis Core

## 1. Overview
The **Power-Ups System** introduces temporary enhancement mechanics into *Star-Leaper: Orion Odyssey*. In Stage 8, the system implements the **Aegis Core**, a celestial energy artifact that temporarily shields Orion from enemy collision damage while preserving normal platforming physics, scoring, health management, and level completion boundaries.

---

## 2. Architecture & Components

```text
               Player Overlap
                     │
                     ▼
           PowerUp Entity (Aegis Core)
           ├── State: AVAILABLE -> COLLECTING -> COLLECTED
           ├── Physics disabled immediately (single-collection guard)
           ├── Scale-pop and fade-out tween
           └── Emits POWERUP_COLLECTED, PLAY_SFX ('powerup_collect')
                     │
                     ▼
              PowerUpSystem
           ├── Checks LevelCompletionSystem.isLevelComplete() guard
           ├── Sets activePowerUp = 'AEGIS_CORE'
           ├── Sets remainingTime = 5000ms (or refreshes duration)
           └── Emits POWERUP_ACTIVATED, PLAY_SFX ('powerup_activate')
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
Player Forcefield Aura         Camera-Pinned HUD
├── Translucent cyan bubble    └── 'AEGIS: ACTIVE 4.8s' (cyan)
└── Pulses on damage deflection
```

---

## 3. Class Responsibilities

### A. `PowerUpSystem` (`src/systems/PowerUpSystem.js`)
- **Responsibility**: Manages the global active power-up state, countdown timer, duration refresh, and expiration.
- **Constraints**:
  - Enforces a single active power-up at a time.
  - If a second Aegis Core is collected while one is active, the timer is refreshed to the full 5000ms duration rather than stacking.
  - Strictly blocked from activating or ticking if `LevelCompletionSystem.isLevelComplete()` is true.
- **Key Methods**:
  - `activatePowerUp(type, [duration])`: Activates power-up or refreshes duration; dispatches `POWERUP_ACTIVATED`.
  - `isPowerUpActive([type])`: Checks if a power-up (or specific type) is active.
  - `getActivePowerUp()`: Returns active type string or `null`.
  - `getRemainingTime()`: Returns remaining time in milliseconds.
  - `update(delta)`: Decrements timer and invokes `expire()` upon reaching 0.
  - `expire()`: Clears active state and dispatches `POWERUP_EXPIRED`.
  - `reset()`: Immediately clears active state and cancels timers without firing false expiration events.

### B. `PowerUp` Entity (`src/entities/PowerUp.js`)
- **Responsibility**: Collectible game entity spawned in the level world.
- **States**:
  - `AVAILABLE`: Idle floating oscillation (`Math.sin()`), overlap enabled.
  - `COLLECTING`: Interaction triggered, physics disabled, playing scale-up/fade tween.
  - `COLLECTED`: Invisible and inactive for the remainder of the run.
- **Key Methods**:
  - `update(time, delta)`: Drives gentle vertical floating bobbing.
  - `collect()`: Single-fire collection handler; activates `PowerUpSystem`.
  - `reset()`: Restores original spawn coordinates, scale, alpha, visibility, and re-enables physics body in `AVAILABLE` state.

---

## 4. Damage Pipeline Integration

When the player collides with an enemy from the side, `GameScene` emits `PLAYER_ENEMY_HIT`, which routes to `HealthSystem.takeDamage()`:

```text
Enemy Collision (Side Hit)
            │
            ▼
   PLAYER_ENEMY_HIT
            │
            ▼
HealthSystem.takeDamage(1, 'enemy')
            │
     Aegis Active?
     ├── YES ──► Emit DAMAGE_PREVENTED
     │           └── Pulse player shield aura visual
     │           └── Health remains unchanged
     │           └── Lives remain unchanged
     │
     └── NO  ──► Deduct 1 shield cell
                 └── Normal Stage 6 damage & death logic
```

> [!NOTE]
> Pit falls (`source === 'pit'`) bypass Aegis Core protection and directly trigger the death and respawn pipeline.

---

## 5. System Interactions & Boundaries

### A. Level Completion Boundary
- Once `LevelCompletionSystem.isLevelComplete()` is true:
  - `PowerUp.collect()` immediately returns `false`.
  - `PowerUpSystem.activatePowerUp()` immediately returns `false`.
  - `PowerUpSystem.update()` freezes timer progression.
  - The Level Complete overlay renders without power-up statistics, preserving the sealed Stage 7 layout.

### B. Player Death & Respawn
- When player health drops to 0 or a pit fall occurs:
  - `this.powerUpSystem.reset()` is called immediately.
  - `this.playerShieldAura.setVisible(false)` clears the visual shield.
  - Player respawns after 500ms in a normal, non-powered state.
  - Collected power-ups do not respawn on normal death (only on full restart).

### C. Game Over
- When all lives are depleted:
  - `this.powerUpSystem.reset()` clears any active power-up.
  - Game Over screen renders normally.

### D. Full Level Restart (`R` key)
- Pressing `R`:
  - Resets `PowerUpSystem`.
  - Resets all `PowerUp` entities back to `AVAILABLE` state at `(620, 300)` and `(1420, 250)`.
  - Hides player shield aura.
  - Resets health (3/3), lives (3), score (0), crystals (0/20), enemies, and goal.

---

## 6. Known Limitations
1. **Single Power-Up Type**: The Aegis Core is the solitary power-up in Stage 8; additional mobility or projectile power-ups may be introduced in subsequent stages.
2. **No Stacking**: Collecting multiple cores refreshes duration to 5000ms rather than stacking layers.
3. **No Power-Up Scoring**: Collecting power-ups yields 0 points to preserve scoring invariants (+100 crystal, +200 drone).
