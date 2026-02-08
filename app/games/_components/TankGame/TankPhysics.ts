import Matter from 'matter-js'
import type { ShotResult, TankState, TankVector, TerrainMap } from '@/app/games/_components/TankGame/tank.types'
import { applyCrater, getTankRestingPosition, getTerrainY } from '@/app/games/_components/TankGame/TankTerrain'

type SimulationConfig = {
  gravity: number
  powerScale: number
  projectileRadius: number
  explosionRadius: number
  tankSize: { width: number; height: number }
  maxSteps: number
  stepMs: number
}

type SimulationInput = {
  terrain: TerrainMap
  tank1: TankState
  tank2: TankState
  firingPlayer: 1 | 2
  angleDeg: number
  power: number
  player1Lives: number
  player2Lives: number
  config: SimulationConfig
}

const buildTerrainBodies = (terrain: TerrainMap) => {
  const bodies: Matter.Body[] = []
  for (let i = 0; i < terrain.heights.length; i += 1) {
    const x = i * terrain.step + terrain.step / 2
    const surfaceY = terrain.heights[i]
    const height = terrain.height - surfaceY
    if (height <= 0) {
      continue
    }
    const body = Matter.Bodies.rectangle(x, surfaceY + height / 2, terrain.step + 1, height, {
      isStatic: true,
      label: 'terrain'
    })
    bodies.push(body)
  }
  return bodies
}

const toRadians = (deg: number) => (deg * Math.PI) / 180

export const simulateShot = ({
  terrain,
  tank1,
  tank2,
  firingPlayer,
  angleDeg,
  power,
  player1Lives: currentPlayer1Lives,
  player2Lives: currentPlayer2Lives,
  config
}: SimulationInput): ShotResult => {
  const engine = Matter.Engine.create()
  engine.gravity.y = config.gravity

  const terrainBodies = buildTerrainBodies(terrain)

  const tank1Body = Matter.Bodies.rectangle(
    tank1.position.x,
    tank1.position.y,
    config.tankSize.width,
    config.tankSize.height,
    { isStatic: true, label: 'tank1' }
  )
  const tank2Body = Matter.Bodies.rectangle(
    tank2.position.x,
    tank2.position.y,
    config.tankSize.width,
    config.tankSize.height,
    { isStatic: true, label: 'tank2' }
  )

  const firingTank = firingPlayer === 1 ? tank1 : tank2
  const angle = toRadians(angleDeg)
  const launchX = firingTank.position.x + Math.cos(angle) * (config.tankSize.width / 2 + 6)
  const launchY = firingTank.position.y - Math.sin(angle) * (config.tankSize.height / 2 + 4)

  const projectile = Matter.Bodies.circle(launchX, launchY, config.projectileRadius, {
    restitution: 0.2,
    friction: 0.1,
    frictionAir: 0.002,
    label: 'projectile'
  })

  Matter.Body.setVelocity(projectile, {
    x: Math.cos(angle) * power * config.powerScale,
    y: -Math.sin(angle) * power * config.powerScale
  })

  Matter.World.add(engine.world, [projectile, tank1Body, tank2Body, ...terrainBodies])

  const path: TankVector[] = []
  let impact: TankVector | null = null
  let hitTank: 1 | 2 | null = null

  for (let step = 0; step < config.maxSteps; step += 1) {
    Matter.Engine.update(engine, config.stepMs)
    path.push({ x: projectile.position.x, y: projectile.position.y })

    if (
      projectile.position.x < 0 ||
      projectile.position.x > terrain.width ||
      projectile.position.y > terrain.height + 100
    ) {
      break
    }

    const tankHits = Matter.Query.collides(projectile, [tank1Body, tank2Body])
    if (tankHits.length > 0) {
      hitTank = tankHits[0].bodyB.label === 'tank1' ? 1 : 2
      impact = { x: projectile.position.x, y: projectile.position.y }
      break
    }

    const terrainHits = Matter.Query.collides(projectile, terrainBodies)
    if (terrainHits.length > 0) {
      impact = { x: projectile.position.x, y: projectile.position.y }
      break
    }
  }

  if (!impact) {
    impact = { x: projectile.position.x, y: projectile.position.y }
  }

  const updatedTerrain = applyCrater(terrain, impact, config.explosionRadius)

  const updatedTank1 = {
    ...tank1,
    position: getTankRestingPosition(updatedTerrain, tank1.position.x, config.tankSize.height)
  }
  const updatedTank2 = {
    ...tank2,
    position: getTankRestingPosition(updatedTerrain, tank2.position.x, config.tankSize.height)
  }

  const distanceToTank1 = Math.hypot(updatedTank1.position.x - impact.x, updatedTank1.position.y - impact.y)
  const distanceToTank2 = Math.hypot(updatedTank2.position.x - impact.x, updatedTank2.position.y - impact.y)

  const tank1Hit = distanceToTank1 <= config.explosionRadius * 0.9
  const tank2Hit = distanceToTank2 <= config.explosionRadius * 0.9

  const player1Lives = tank1Hit ? Math.max(0, currentPlayer1Lives - 1) : currentPlayer1Lives
  const player2Lives = tank2Hit ? Math.max(0, currentPlayer2Lives - 1) : currentPlayer2Lives

  return {
    path,
    impact,
    hitTank,
    updatedTerrain,
    updatedTank1,
    updatedTank2,
    player1Lives,
    player2Lives
  }
}

export const clampAimAngle = (angle: number) => Math.max(5, Math.min(175, angle))

export const clampPower = (power: number) => Math.max(10, Math.min(100, power))

export const getTankAimOrigin = (tank: TankState, tankSize: { width: number; height: number }) => {
  const angle = toRadians(tank.angle)
  const originX = tank.position.x + Math.cos(angle) * (tankSize.width / 2 + 6)
  const originY = tank.position.y - Math.sin(angle) * (tankSize.height / 2 + 4)
  return { x: originX, y: originY }
}

export const getAimPreviewPoint = (
  tank: TankState,
  power: number,
  config: SimulationConfig
) => {
  const origin = getTankAimOrigin(tank, config.tankSize)
  const angle = toRadians(tank.angle)
  const velocityX = Math.cos(angle) * power * config.powerScale
  const velocityY = -Math.sin(angle) * power * config.powerScale
  const time = 0.8
  const x = origin.x + velocityX * time * 60
  const y = origin.y + velocityY * time * 60 + 0.5 * config.gravity * (time * 60) * (time * 60)
  return { x, y }
}

export const getTerrainAngle = (terrain: TerrainMap, x: number) => {
  const left = getTerrainY(terrain, x - terrain.step)
  const right = getTerrainY(terrain, x + terrain.step)
  return Math.atan2(left - right, terrain.step * 2)
}
