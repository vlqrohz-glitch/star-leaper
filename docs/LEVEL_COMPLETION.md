# Technical Documentation: Level Completion & Goal System

## 1. Overview
The Level Completion & Goal System manages the objective terminus of **Sector Alpha**, detects player arrival at the **Warp Gate Beacon**, compiles snapshot completion statistics, freezes gameplay, and displays the celebratory Level Complete overlay.

---

## 2. Architecture & Components

```text
Player (Orion)
      │
[Reaches X: 2300, Y: 330]
      │
      ▼
Goal Entity (Warp Gate Beacon)
      ├── Plays energy pulse expansion tween
      ├── Flashes camera cyan (400ms)
      └── Emits PLAY_SFX ('level_complete')
      │
      ▼
LevelCompletionSystem
      ├── Single-fire guard (prevents repeated triggers)
      ├── Compiles completion statistics snapshot
      └── Emits LEVEL_COMPLETE (stats)
      │
      ▼
GameScene UI Presentation
      ├── Freezes player movement and controls
      ├── Disables enemy damage and pit death triggers
      ├── Disables collectible gathering
      └── Displays Level Complete overlay with final tallies
```

---

## 3. Class Responsibilities

### A. `Goal` (`src/entities/Goal.js`)
- **Responsibility**: Interactive beacon entity with idle floating oscillation, overlap hitbox (`36x64`), and celebratory visual feedback.
- **States**:
  - `ACTIVE`: Ready to be triggered by player contact.
  - `TRIGGERED`: Animation active, physics disabled.
  - `COMPLETED`: Fully finished.
- **Key Methods**:
  - `trigger()`: Starts expansion pulse, camera flash, audio hook.
  - `isActive()`: Returns `goalState === 'ACTIVE'`.
  - `reset()`: Restores to original spawn position, active state, and restarts idle bobbing.

### B. `LevelCompletionSystem` (`src/systems/LevelCompletionSystem.js`)
- **Responsibility**: Manages level completion state and stores snapshot performance metrics.
- **Key Methods**:
  - `completeLevel(stats)`: Single-fire method recording completion stats and dispatching `LEVEL_COMPLETE`.
  - `isLevelComplete()`: Returns boolean completion flag.
  - `getCompletionStats()`: Returns cached completion stats.
  - `reset()`: Clears completed state and stats cache for new runs.

---

## 4. Completion Statistics Snapshot
At the moment the player touches the goal, a performance snapshot is compiled:
```javascript
{
  score: 2400,               // Final score tally
  crystalsCollected: 18,     // Star Crystals collected
  crystalsTotal: 20,         // Total Star Crystals in level
  enemiesDefeated: 4,        // Drifter Drones stomped
  enemiesTotal: 5,           // Total Drifter Drones spawned
  livesRemaining: 3,         // Lives remaining
  healthRemaining: 3,        // Shield units remaining
  completedAt: 1725870000000 // Timestamp
}
```

---

## 5. System Interactions & Guards

- **Health & Lives Integration**:
  - Reaching the goal does not damage or heal the player.
  - Once `isLevelComplete()` is true, enemy damage, pit falls, and Game Over triggers are completely blocked.
- **Score & Collectible Integration**:
  - Collectibles cannot be gathered after level completion.
  - Final score is preserved exactly as earned.
- **Restart Behavior (`R` key)**:
  - Resets `LevelCompletionSystem` and `Goal` entity.
  - Hides the completion overlay.
  - Resets `HealthSystem` (full 3 shields) and `LivesSystem` (3 lives).
  - Resets `ScoreSystem` (0 score, 0/20 crystals).
  - Respawns all 20 Star Crystals and resets all 5 Drifter Drones.
  - Teleports player to spawn pad `(80, 360)` with active gameplay restored.
