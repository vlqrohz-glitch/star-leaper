# Technical Documentation: Cosmic Shop, Character Sheet & Fullscreen Architecture

## 1. Overview
The Star-Leaper customization suite introduces an integrated meta-progression loop, operative inspection system, and responsive viewport engine.

```text
Gameplay (Collect Star Crystals) ──► Wallet Balance (ShopSystem)
                                             │
      ┌──────────────────────────────────────┴──────────────────────────────────────┐
      ▼                                      ▼                                      ▼
5 Outfit Variants                      4 Passive Perks                        4 Companion Pets
(Procedural pixel textures)            (Stat & mechanic modifiers)            (Autonomous lag-followers)
      │                                      │                                      │
      └──────────────────────────────────────┼──────────────────────────────────────┘
                                             ▼
                               Equipped Loadout Active
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          Operative Character Sheet                     In-Game Gameplay Entities
       (Stat meters, lore, inspection bay)         (Player skin, Magnet, HP shield, Pet)
```

---

## 2. Fullscreen Architecture (`index.html` & `gameConfig.js`)

### The Problem
Previously, CSS applied aggressive overrides (`width: 100% !important; height: 100% !important;`) on `#game-container canvas`. This crushed and distorted the Phaser 800x450 canvas when entering fullscreen mode, stretching pixels non-uniformly.

### The Solution
1. **Container-Targeted Fullscreen**: Phaser's `scale` configuration targets `'game-container'`:
   ```javascript
   scale: {
     mode: Phaser.Scale.FIT,
     autoCenter: Phaser.Scale.CENTER_BOTH,
     width: 800,
     height: 450,
     fullscreenTarget: 'game-container'
   }
   ```
2. **CSS Letterbox Preservation**:
   ```css
   #game-container {
     display: flex;
     justify-content: center;
     align-items: center;
     width: 100%;
     height: 100%;
     background: #000;
   }
   #game-container canvas {
     max-width: 100%;
     max-height: 100%;
     object-fit: contain;
     box-shadow: 0 0 30px rgba(0, 240, 255, 0.25);
   }
   ```
3. **Global Toggle Function**:
   `window.toggleGameFullscreen()` handles `requestFullscreen()` and `exitFullscreen()` with vendor prefix fallbacks, synchronizes `#fullscreen-btn` text (`⛶ FULLSCREEN [F]` vs `🗗 WINDOWED [F]`), and listens to `fullscreenchange`.

---

## 3. Shop & Progression System (`src/systems/ShopSystem.js`)

### Singleton Architecture
`ShopSystem` is an authoritative singleton managing:
- `crystals`: Current wallet balance (starts at 500 ★ for instant customization; replenished via crystal pickups in gameplay).
- `ownedOutfits`: Set of unlocked outfit IDs (includes `'standard'` by default).
- `ownedPerks`: Set of unlocked perk IDs.
- `ownedPets`: Set of unlocked companion pet IDs.
- `equippedOutfits`: Map of operative character ID to equipped outfit (`{ NOVA: 'standard', ... }`).
- `equippedPerk`: Currently active perk ID or `null`.
- `equippedPet`: Currently active pet ID or `null`.

### Storage & Persistence
- Automatically syncs to `sessionStorage` under `star_leaper_shop_data` upon any purchase or equip.
- Gracefully falls back to in-memory state in restricted environments.

---

## 4. Cosmic Shop Catalog (`src/config/shopConfig.js`)

### Outfits (5 Variants per Operative)
| Outfit ID | Name | Rarity | Price | Visual Signature |
|---|---|---|---|---|
| `standard` | Standard Issue | Common | 0 ★ | Operative default colors |
| `solar_flare` | Solar Flare | Rare | 250 ★ | Molten crimson insulation armor, gold visor |
| `cyber_void` | Cyber Void | Epic | 300 ★ | Stealth-coated carbon plate, UV conduits |
| `neon_pulse` | Neon Pulse | Epic | 350 ★ | High-frequency synthwave armor (cyan & magenta) |
| `stellar_gold` | Stellar Gold | Legendary | 500 ★ | Ceremonial commander plate forged from auric alloy |

### Passive Perks
| Perk ID | Name | Price | Gameplay Effect |
|---|---|---|---|
| `magnet_core` | Magnet Core | 200 ★ | Creates a 120px magnetic gravity pull on nearby Star Crystals |
| `reinforced_plating` | Reinforced Plating | 250 ★ | Adds +1 extra shield capacity (4 Max HP instead of 3) |
| `boost_thrusters` | Boost Thrusters | 300 ★ | Increases movement speed by +12% and jump lift by +8% |
| `lucky_stars` | Lucky Stars | 350 ★ | Awards +50 bonus score points and extra crystals per pickup |

### Companion Pets
| Pet ID | Name | Price | Visual & Behavioral Characteristics |
|---|---|---|---|
| `pet_cosmo` | Cosmo the Pup | 180 ★ | Celestial puppy with glowing ears, tail, and harmonic bobbing |
| `pet_orbe` | Orb-E Drone | 220 ★ | Hovering recon drone with pulsing cyan optic scanner |
| `pet_chrono` | Chrono Owl | 280 ★ | Biomechanical owl with golden feathers and temporal glow |
| `pet_starkitten` | Star-Kitten | 320 ★ | Playful stardust kitten with pink ears and stardust trail |

---

## 5. Companion Pet Entity (`src/entities/Pet.js`)

The `Pet` class is an autonomous physics-aware entity:
- **Lag-Following (Lerp)**: Smoothly tracks the player's position with offset:
  ```javascript
  const targetX = player.x + (player.flipX ? 28 : -28);
  const targetY = player.y - 18 + Math.sin(this.bobTimer * 3.5) * 6;
  this.x += (targetX - this.x) * 0.08;
  this.y += (targetY - this.y) * 0.08;
  ```
- **Orientation Matching**: Automatically mirrors player's horizontal flip (`setFlipX(player.flipX)`).
- **Stardust Trail**: Periodically emits procedural stardust particles as it glides behind the player.

---

## 6. Character Sheet Scene (`src/scenes/CharacterSheetScene.js`)

- **Operative Inspection Bay**: Features an illuminated cybernetic pedestal rendering the active operative wearing their equipped outfit variant and their active companion pet.
- **Dynamic Attribute Visualizer**: Renders proportional bar meters (`[■■■■■□□□]`) for Ground Speed, Jump Lift, Air Agility, and Shield HP based on operative multipliers.
- **Equipped Modules Display**: Cleanly shows active perk bonuses, companion pet status, and current crystal balance.
- **Controls**:
  - `[←/→]` or `[A/D]`: Cycle through operatives (Nova, Zenith, Atlas, Lumen).
  - `[S]`: Direct shortcut to open the Cosmic Shop.
  - `[ENTER]`: Deploy directly to Sector Selection.
  - `[ESC]`: Return to previous scene.

---

## 7. Verification & Regression Testing

The system is continuously verified through three comprehensive test suites:
1. `validate_stage10.ps1`: 52/52 Stage 10 Audio & Feedback tests passing.
2. `validate_expansion.ps1`: 35/35 Major Expansion tests passing.
3. `validate_shop_sheet.ps1`: 36/36 Fullscreen, Character Sheet & Shop tests passing.
**Total: 123 / 123 automated assertions passing.**
