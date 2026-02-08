export const TANK_GAME_CONFIG = {
  canvasWidth: 900,
  canvasHeight: 520,
  terrainStep: 8,
  tankSize: { width: 48, height: 28 },
  projectileRadius: 4,
  explosionRadius: 42,
  gravity: 0.32,
  powerScale: 0.12,
  maxSteps: 600,
  stepMs: 16
} as const
