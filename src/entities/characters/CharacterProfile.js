import { CHARACTER_ROSTER, DEFAULT_CHARACTER_ID } from '../../config/characterConfig.js';
import { PLAYER_CONFIG } from '../../config/playerConfig.js';

/**
 * CharacterProfile - Reusable Character Framework Model
 * Encapsulates character-specific configuration, visual profiles, and physics adjustments.
 */
export class CharacterProfile {
  /**
   * @param {string} [characterId='NOVA']
   */
  constructor(characterId = DEFAULT_CHARACTER_ID) {
    this.characterId = characterId;
    this.raw = CHARACTER_ROSTER[characterId] || CHARACTER_ROSTER[DEFAULT_CHARACTER_ID];
  }

  /**
   * Returns merged physics configuration
   * @returns {object}
   */
  getPhysicsConfig() {
    return {
      ...PLAYER_CONFIG,
      ...(this.raw.physics || {})
    };
  }

  /**
   * Returns character texture key
   * @returns {string}
   */
  getTexture() {
    return this.raw.texture || 'player_nova';
  }

  /**
   * Returns character display name
   * @returns {string}
   */
  getName() {
    return this.raw.name || 'Nova';
  }

  /**
   * Returns character subtitle / title
   * @returns {string}
   */
  getTitle() {
    return this.raw.title || 'Explorer';
  }

  /**
   * Returns modifiers for durability, power-ups, etc.
   * @returns {object}
   */
  getModifiers() {
    return this.raw.modifiers || {
      invulnerabilityMultiplier: 1.0,
      powerUpDurationMultiplier: 1.0,
      stompBonusMultiplier: 1.0
    };
  }

  /**
   * Retrieves all available character profiles as an array
   * @returns {CharacterProfile[]}
   */
  static getAllProfiles() {
    return Object.keys(CHARACTER_ROSTER).map(id => new CharacterProfile(id));
  }
}
