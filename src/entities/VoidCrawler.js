import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG } from '../config/enemyConfig.js';

/**
 * VoidCrawler - Ground-based alien arthropod
 * Patrols platforms, turns around at edges and walls, stomped from above.
 */
export class VoidCrawler extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'void_crawler');
    const cfg = ENEMY_CONFIG.VOID_CRAWLER;
    this.patrolSpeed = cfg.speed || 45;
    this.setSize(cfg.width || 24, cfg.height || 16);
    this.setOffset(1, 1);
  }
}
