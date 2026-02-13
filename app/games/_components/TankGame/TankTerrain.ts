import type { TankVector, TerrainMap } from '@/app/games/_components/TankGame/tank.types'

type TerrainConfig = {
  width: number
  height: number
  step: number
  seed: string
}

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const hashSeed = (seed: string) => {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const createTerrain = ({ width, height, step, seed }: TerrainConfig): TerrainMap => {
  const random = mulberry32(hashSeed(seed))
  const baseline = height * 0.90
  const amplitude1 = height * (0.08 + random() * 0.06)
  const amplitude2 = height * (0.04 + random() * 0.04)
  const amplitude3 = height * (0.02 + random() * 0.03)
  const phase1 = random() * Math.PI * 2
  const phase2 = random() * Math.PI * 2
  const phase3 = random() * Math.PI * 2
  const freq1 = 0.8 + random() * 0.6
  const freq2 = 1.6 + random() * 0.8
  const freq3 = 2.8 + random() * 0.8

  const points = Math.floor(width / step) + 1
  const heights: number[] = []

  for (let i = 0; i < points; i += 1) {
    const x = (i / (points - 1)) * Math.PI * 2
    const noise =
      Math.sin(x * freq1 + phase1) * amplitude1 +
      Math.sin(x * freq2 + phase2) * amplitude2 +
      Math.sin(x * freq3 + phase3) * amplitude3
    const value = Math.min(height - 40, Math.max(height * 0.65, baseline + noise))
    heights.push(value)
  }

  return { width, height, step, heights }
}

export const getTerrainY = (terrain: TerrainMap, x: number) => {
  const clampedX = Math.max(0, Math.min(terrain.width, x))
  const index = clampedX / terrain.step
  const leftIndex = Math.floor(index)
  const rightIndex = Math.min(terrain.heights.length - 1, leftIndex + 1)
  const t = index - leftIndex
  const left = terrain.heights[leftIndex]
  const right = terrain.heights[rightIndex]
  return left + (right - left) * t
}

export const getTerrainAngle = (terrain: TerrainMap, x: number) => {
  const left = getTerrainY(terrain, x - terrain.step)
  const right = getTerrainY(terrain, x + terrain.step)
  return Math.atan2(right - left, terrain.step * 2)
}

export const applyCrater = (terrain: TerrainMap, center: TankVector, radius: number): TerrainMap => {
  const updated = [...terrain.heights]
  const startX = Math.max(0, center.x - radius)
  const endX = Math.min(terrain.width, center.x + radius)

  for (let x = startX; x <= endX; x += terrain.step) {
    const dx = x - center.x
    const distanceSquared = dx * dx
    if (distanceSquared > radius * radius) {
      continue
    }
    const craterDepth = Math.sqrt(radius * radius - distanceSquared)
    const craterY = center.y + craterDepth
    const index = Math.round(x / terrain.step)
    if (index < 0 || index >= updated.length) {
      continue
    }
    updated[index] = Math.min(terrain.height - 4, Math.max(updated[index], craterY))
  }

  return { ...terrain, heights: updated }
}

export const getTankRestingPosition = (
  terrain: TerrainMap,
  x: number,
  tankSize: { width: number; height: number }
): TankVector => {
  const groundY = getTerrainY(terrain, x)
  const angle = getTerrainAngle(terrain, x)
  const halfHeight = tankSize.height / 2
  const halfWidth = tankSize.width / 2
  const verticalExtent =
    halfHeight * Math.abs(Math.cos(angle)) + halfWidth * Math.abs(Math.sin(angle))
  return {
    x,
    y: groundY - verticalExtent
  }
}

export const buildTerrainPath = (terrain: TerrainMap): TankVector[] => {
  const path: TankVector[] = []
  for (let i = 0; i < terrain.heights.length; i += 1) {
    path.push({
      x: i * terrain.step,
      y: terrain.heights[i]
    })
  }
  return path
}
