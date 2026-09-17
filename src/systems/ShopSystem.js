import { SHOP_CATALOG, STARTING_CRYSTAL_BALANCE, ShopCategory } from '../config/shopConfig.js';

const STORAGE_KEY = 'star_leaper_inventory_v1';

/**
 * Singleton Shop & Inventory System for Star-Leaper: Orion Odyssey
 * Manages player wallet, purchased cosmetics/perks/pets, and active loadout.
 */
class ShopSystemClass {
  constructor() {
    this.crystals = STARTING_CRYSTAL_BALANCE;

    // Sets of purchased item IDs
    this.ownedOutfits = new Set(['standard']);
    this.ownedPerks = new Set();
    this.ownedPets = new Set();

    // Active loadout
    this.equippedOutfits = {
      NOVA: 'standard',
      ZENITH: 'standard',
      ATLAS: 'standard',
      LUMEN: 'standard'
    };
    this.equippedPerk = null;
    this.equippedPet = null;

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (typeof data.crystals === 'number') this.crystals = data.crystals;
          if (Array.isArray(data.ownedOutfits)) this.ownedOutfits = new Set(data.ownedOutfits);
          if (Array.isArray(data.ownedPerks)) this.ownedPerks = new Set(data.ownedPerks);
          if (Array.isArray(data.ownedPets)) this.ownedPets = new Set(data.ownedPets);
          if (data.equippedOutfits) this.equippedOutfits = { ...this.equippedOutfits, ...data.equippedOutfits };
          if (data.equippedPerk !== undefined) this.equippedPerk = data.equippedPerk;
          if (data.equippedPet !== undefined) this.equippedPet = data.equippedPet;
        }
      }
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const data = {
          crystals: this.crystals,
          ownedOutfits: Array.from(this.ownedOutfits),
          ownedPerks: Array.from(this.ownedPerks),
          ownedPets: Array.from(this.ownedPets),
          equippedOutfits: this.equippedOutfits,
          equippedPerk: this.equippedPerk,
          equippedPet: this.equippedPet
        };
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      // Storage save error ignored
    }
  }

  getCrystals() {
    return this.crystals;
  }

  addCrystals(amount) {
    if (typeof amount === 'number' && amount > 0) {
      this.crystals += amount;
      this.saveToStorage();
    }
  }

  spendCrystals(amount) {
    if (this.crystals >= amount) {
      this.crystals -= amount;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  canAfford(cost) {
    return this.crystals >= cost;
  }

  isOwned(itemId) {
    if (itemId === 'standard') return true;
    return (
      this.ownedOutfits.has(itemId) ||
      this.ownedPerks.has(itemId) ||
      this.ownedPets.has(itemId)
    );
  }

  isEquipped(itemId, characterId = 'NOVA') {
    if (this.equippedPerk === itemId) return true;
    if (this.equippedPet === itemId) return true;
    const charOutfit = this.equippedOutfits[characterId.toUpperCase()] || 'standard';
    return charOutfit === itemId;
  }

  getEquippedOutfit(characterId = 'NOVA') {
    return this.equippedOutfits[characterId.toUpperCase()] || 'standard';
  }

  getEquippedPerk() {
    if (!this.equippedPerk) return null;
    return SHOP_CATALOG.perks.find(p => p.id === this.equippedPerk) || null;
  }

  getEquippedPet() {
    if (!this.equippedPet) return null;
    return SHOP_CATALOG.pets.find(p => p.id === this.equippedPet) || null;
  }

  purchaseItem(item) {
    if (this.isOwned(item.id)) return { success: false, reason: 'ALREADY_OWNED' };
    if (!this.canAfford(item.price)) return { success: false, reason: 'INSUFFICIENT_FUNDS' };

    this.spendCrystals(item.price);

    if (item.category === ShopCategory.OUTFITS) {
      this.ownedOutfits.add(item.id);
    } else if (item.category === ShopCategory.PERKS) {
      this.ownedPerks.add(item.id);
    } else if (item.category === ShopCategory.PETS) {
      this.ownedPets.add(item.id);
    }

    this.saveToStorage();
    return { success: true };
  }

  unlockItem(itemId) {
    if (!itemId) return;
    const outfit = SHOP_CATALOG.outfits.find(o => o.id === itemId);
    if (outfit) this.ownedOutfits.add(itemId);
    const perk = SHOP_CATALOG.perks.find(p => p.id === itemId);
    if (perk) this.ownedPerks.add(itemId);
    const pet = SHOP_CATALOG.pets.find(p => p.id === itemId);
    if (pet) this.ownedPets.add(itemId);
    this.saveToStorage();
  }

  unlockAll() {
    SHOP_CATALOG.outfits.forEach(o => this.ownedOutfits.add(o.id));
    SHOP_CATALOG.perks.forEach(p => this.ownedPerks.add(p.id));
    SHOP_CATALOG.pets.forEach(p => this.ownedPets.add(p.id));
    this.saveToStorage();
  }

  equipItem(item, characterId = 'NOVA') {
    if (!this.isOwned(item.id) && item.id !== 'standard') {
      return { success: false, reason: 'NOT_OWNED' };
    }

    const charKey = characterId.toUpperCase();

    if (item.category === ShopCategory.OUTFITS) {
      this.equippedOutfits[charKey] = item.id;
    } else if (item.category === ShopCategory.PERKS) {
      // Toggle if already equipped
      if (this.equippedPerk === item.id) {
        this.equippedPerk = null;
      } else {
        this.equippedPerk = item.id;
      }
    } else if (item.category === ShopCategory.PETS) {
      // Toggle if already equipped
      if (this.equippedPet === item.id) {
        this.equippedPet = null;
      } else {
        this.equippedPet = item.id;
      }
    }

    this.saveToStorage();
    return { success: true };
  }

  unequipItem(category, characterId = 'NOVA') {
    if (category === ShopCategory.OUTFITS) {
      this.equippedOutfits[characterId.toUpperCase()] = 'standard';
    } else if (category === ShopCategory.PERKS) {
      this.equippedPerk = null;
    } else if (category === ShopCategory.PETS) {
      this.equippedPet = null;
    }
    this.saveToStorage();
  }
}

export const ShopSystem = new ShopSystemClass();
