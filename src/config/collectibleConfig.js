/**
 * Centralized Collectible Configuration
 */
export const COLLECTIBLE_CONFIG = {
  DEFAULT_VALUE: 100,           // Score points awarded per collected energy crystal
  ANIM_DURATION: 260,           // Milliseconds for collection pop/fade animation
  BOB_DISTANCE: 4,              // Pixels for gentle idle floating bob
  BOB_DURATION: 900,            // Milliseconds per idle bob cycle
  COLLISION_RADIUS: 12          // Physics overlap radius (px)
};

/**
 * Collectible Lifecycle States
 */
export const CollectibleState = Object.freeze({
  ACTIVE: 'ACTIVE',
  COLLECTING: 'COLLECTING',
  COLLECTED: 'COLLECTED'
});
