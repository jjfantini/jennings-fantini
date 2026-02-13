export const TANK_GAME_CONFIG = {
  canvasWidth: 900,
  canvasHeight: 1000,
  terrainStep: 8,
  tankSize: { width: 30, height: 18 },
  projectileRadius: 4,
  explosionRadius: 42,
  gravity: 0.32,
  powerScale: 0.12,
  maxSteps: 900,
  stepMs: 16,
  projectileFrictionAir: 0.0008,
  windVelocityScale: 2
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

export const AIM_CONFIG = {
  min: -10,
  max: 90,
  default: 45
} as const

export const MISSILE_SPRITE = {
  width: 24,
  height: 12
} as const

export const WIND_SPRITES = [
  { path: '/wind/wind-1.png', width: 175, height: 70 },
  { path: '/wind/wind-2.png', width: 280, height: 87 },
  { path: '/wind/wind-3.png', width: 388, height: 116 },
  { path: '/wind/wind-4.png', width: 491, height: 132 }
] as const
