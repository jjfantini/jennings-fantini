export const TANK_GAME_CONFIG = {
  canvasWidth: 900,
  canvasHeight: 520,
  terrainStep: 8,
  tankSize: { width: 30, height: 18 },
  projectileRadius: 4,
  explosionRadius: 42,
  gravity: 0.32,
  powerScale: 0.12,
  maxSteps: 600,
  stepMs: 16,
  windVelocityScale: 10,
  windDragCoeff: 0.003
} as const

export const TANK_SPRITE = {
  width: 40,
  height: 30,
  bodyPivot: { x: 20, y: 30 }
} as const

export const BLUE_BARREL = {
  barrelPivot: { x: 26, y: 8 },
  turretMuzzle: { x: 38, y: 8 }
} as const

export const RED_BARREL = {
  barrelPivot: { x: 14, y: 8 },
  turretMuzzle: { x: 3, y: 8 }
} as const
