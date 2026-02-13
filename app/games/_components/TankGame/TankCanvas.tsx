import React, { useEffect, useRef, useState } from 'react'
import { BlueTank, RedTank } from '@/app/games/_components/TankGame/TankAssets'
import { buildTerrainPath, getTerrainAngle } from '@/app/games/_components/TankGame/TankTerrain'
import type { PathPoint, ShotResult, TankState, TankVector, TerrainMap } from '@/app/games/_components/TankGame/tank.types'
import { TANK_GAME_CONFIG, TANK_SPRITE, BLUE_BARREL, RED_BARREL, MISSILE_SPRITE } from '@/app/games/_components/TankGame/tank.config'
import { relativeToScreenAngle } from '@/app/games/_components/TankGame/TankPhysics'

type TankCanvasProps = {
  width: number
  height: number
  terrain: TerrainMap
  tank1: TankState
  tank2: TankState
  shot: ShotResult | null
  localAim?: { angle: number; power: number } | null
  opponentAim?: { angle: number; power: number } | null
  localPlayer?: 1 | 2 | null
}

type ShotAnimation = {
  path: PathPoint[]
  impact: TankVector | null
  startTime: number
  terrainSnapshot: TerrainMap
  updatedTerrain: TerrainMap
  tank1Snapshot: TankState
  tank2Snapshot: TankState
  updatedTank1: TankState
  updatedTank2: TankState
  fallsTriggered: boolean
}

const tankSprite = TANK_SPRITE

const degreesToRadians = (deg: number) => (deg * Math.PI) / 180
const radiansToDegrees = (rad: number) => (rad * 180) / Math.PI

const rotateVector = (vector: TankVector, angleRad: number) => {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos
  }
}

const rotatePointAround = (point: TankVector, origin: TankVector, angleRad: number) => {
  const offset = { x: point.x - origin.x, y: point.y - origin.y }
  const rotated = rotateVector(offset, angleRad)
  return { x: origin.x + rotated.x, y: origin.y + rotated.y }
}

const getTurretRotationDeg = (aimAngleDeg: number, bodyAngleRad: number, player: 1 | 2) => {
  const screenAimRad = -degreesToRadians(aimAngleDeg)
  const base = screenAimRad - bodyAngleRad
  return radiansToDegrees(player === 2 ? base + Math.PI : base)
}

type BarrelConfig = { barrelPivot: { x: number; y: number }; turretMuzzle: { x: number; y: number } }

const getPathPointVelocity = (path: PathPoint[], index: number): { vx: number; vy: number } => {
  const point = path[index] as PathPoint | undefined
  if (point?.vx != null && point?.vy != null) {
    return { vx: point.vx, vy: point.vy }
  }
  if (index < path.length - 1) {
    const next = path[index + 1]
    return { vx: next.x - (path[index]?.x ?? 0), vy: next.y - (path[index]?.y ?? 0) }
  }
  if (index > 0) {
    const prev = path[index - 1]
    return { vx: (path[index]?.x ?? 0) - prev.x, vy: (path[index]?.y ?? 0) - prev.y }
  }
  return { vx: 1, vy: 0 }
}

const getAimLine = (
  tank: TankState,
  aimAngleDeg: number,
  power: number,
  bodyAngleRad: number,
  barrel: BarrelConfig,
  player: 1 | 2
) => {
  const turretRotationRad = degreesToRadians(getTurretRotationDeg(aimAngleDeg, bodyAngleRad, player))
  const topLeft = {
    x: tank.position.x - tankSprite.width / 2,
    y: tank.position.y - tankSprite.height / 2
  }
  const muzzleAfterTurret = rotatePointAround(barrel.turretMuzzle, barrel.barrelPivot, turretRotationRad)
  const muzzleAfterBody = rotatePointAround(muzzleAfterTurret, tankSprite.bodyPivot, bodyAngleRad)
  const muzzleWorld = { x: topLeft.x + muzzleAfterBody.x, y: topLeft.y + muzzleAfterBody.y }
  const barrelVector = {
    x: barrel.turretMuzzle.x - barrel.barrelPivot.x,
    y: barrel.turretMuzzle.y - barrel.barrelPivot.y
  }
  const barrelAfterTurret = rotateVector(barrelVector, turretRotationRad)
  const barrelAfterBody = rotateVector(barrelAfterTurret, bodyAngleRad)
  const barrelLength = Math.hypot(barrelAfterBody.x, barrelAfterBody.y) || 1
  const direction = { x: barrelAfterBody.x / barrelLength, y: barrelAfterBody.y / barrelLength }
  const length = Math.max(12, power * 1.1)
  const endpoint = {
    x: muzzleWorld.x + direction.x * length,
    y: muzzleWorld.y + direction.y * length
  }
  return [muzzleWorld, endpoint]
}

export const TankCanvas = ({
  width,
  height,
  terrain,
  tank1,
  tank2,
  shot,
  localAim,
  opponentAim,
  localPlayer
}: TankCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const shotRef = useRef<ShotAnimation | null>(null)
  const missileImgRef = useRef<HTMLImageElement | null>(null)
  const previousTerrainRef = useRef<TerrainMap>(terrain)
  const tankSnapshotRef = useRef<{ tank1: TankState; tank2: TankState }>({ tank1, tank2 })
  const [visualTerrain, setVisualTerrain] = useState<TerrainMap>(terrain)
  const [visualTank1, setVisualTank1] = useState<TankState>(tank1)
  const [visualTank2, setVisualTank2] = useState<TankState>(tank2)
  const [tankFallDurations, setTankFallDurations] = useState<{ tank1: number; tank2: number }>({
    tank1: 0,
    tank2: 0
  })
  const tank1BodyAngle = getTerrainAngle(visualTerrain, visualTank1.position.x)
  const tank2BodyAngle = getTerrainAngle(visualTerrain, visualTank2.position.x)
  const tank1DisplayAngle =
    localPlayer === 1 && localAim ? localAim.angle : localPlayer === 2 && opponentAim ? opponentAim.angle : visualTank1.angle
  const tank2DisplayAngle =
    localPlayer === 2 && localAim ? localAim.angle : localPlayer === 1 && opponentAim ? opponentAim.angle : visualTank2.angle
  const tank1TurretAngle = getTurretRotationDeg(relativeToScreenAngle(tank1DisplayAngle, 1), tank1BodyAngle, 1)
  const tank2TurretAngle = getTurretRotationDeg(relativeToScreenAngle(tank2DisplayAngle, 2), tank2BodyAngle, 2)

  useEffect(() => {
    if (!shot?.path?.length) {
      shotRef.current = null
      return
    }
    const { tank1: tank1Snapshot, tank2: tank2Snapshot } = tankSnapshotRef.current
    shotRef.current = {
      path: shot.path,
      impact: shot.impact,
      startTime: performance.now(),
      terrainSnapshot: previousTerrainRef.current,
      updatedTerrain: shot.updatedTerrain,
      tank1Snapshot,
      tank2Snapshot,
      updatedTank1: shot.updatedTank1,
      updatedTank2: shot.updatedTank2,
      fallsTriggered: false
    }
    setVisualTerrain(previousTerrainRef.current)
    setVisualTank1(tank1Snapshot)
    setVisualTank2(tank2Snapshot)
    setTankFallDurations({ tank1: 0, tank2: 0 })
  }, [shot])

  useEffect(() => {
    const img = new Image()
    img.src = '/ammo/missile.png'
    img.onload = () => {
      missileImgRef.current = img
    }
  }, [])

  useEffect(() => {
    previousTerrainRef.current = terrain
  }, [terrain])

  useEffect(() => {
    tankSnapshotRef.current = { tank1, tank2 }
  }, [tank1, tank2])

  useEffect(() => {
    if (shotRef.current) {
      return
    }
    setVisualTerrain(terrain)
    setVisualTank1(tank1)
    setVisualTank2(tank2)
    setTankFallDurations({ tank1: 0, tank2: 0 })
  }, [terrain, tank1, tank2])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return undefined
    }

    const render = () => {
      const shotAnimation = shotRef.current
      const elapsed = shotAnimation ? performance.now() - shotAnimation.startTime : 0
      const duration = shotAnimation ? Math.max(800, shotAnimation.path.length * 8) : 0
      const progress = shotAnimation ? Math.min(1, elapsed / duration) : 0
      const activeTerrain = shotAnimation
        ? progress >= 1
          ? shotAnimation.updatedTerrain
          : shotAnimation.terrainSnapshot
        : terrain
      const terrainPath = buildTerrainPath(activeTerrain)

      ctx.clearRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#020617')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.beginPath()
      ctx.moveTo(0, height)
      terrainPath.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fillStyle = '#14532d'
      ctx.fill()

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.stroke()

      if (localAim && localPlayer) {
        const activeTank = localPlayer === 1 ? visualTank1 : visualTank2
        const activeBodyAngle = localPlayer === 1 ? tank1BodyAngle : tank2BodyAngle
        const points = getAimLine(
          { ...activeTank, angle: localAim.angle, power: localAim.power },
          relativeToScreenAngle(localAim.angle, localPlayer),
          localAim.power,
          activeBodyAngle,
          localPlayer === 1 ? BLUE_BARREL : RED_BARREL,
          localPlayer
        )
        ctx.strokeStyle = '#a5b4fc'
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (opponentAim && localPlayer) {
        const opponentTank = localPlayer === 1 ? visualTank2 : visualTank1
        const opponentBodyAngle = localPlayer === 1 ? tank2BodyAngle : tank1BodyAngle
        const opponentPlayer = localPlayer === 1 ? 2 : 1
        const points = getAimLine(
          { ...opponentTank, angle: opponentAim.angle, power: opponentAim.power },
          relativeToScreenAngle(opponentAim.angle, opponentPlayer),
          opponentAim.power,
          opponentBodyAngle,
          localPlayer === 1 ? RED_BARREL : BLUE_BARREL,
          opponentPlayer
        )
        ctx.strokeStyle = '#fda4af'
        ctx.setLineDash([4, 8])
        ctx.beginPath()
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (shotAnimation) {
        const index = Math.floor(progress * (shotAnimation.path.length - 1))
        const currentPoint = shotAnimation.path[index]
        const missileImg = missileImgRef.current

        const drawMissileAt = (x: number, y: number, pathIndex: number) => {
          const { vx, vy } = getPathPointVelocity(shotAnimation!.path, pathIndex)
          const angle = Math.atan2(vy, vx)
          if (missileImg?.complete && missileImg.naturalWidth > 0) {
            const w = MISSILE_SPRITE.width
            const h = MISSILE_SPRITE.height
            ctx.save()
            ctx.imageSmoothingEnabled = false
            ctx.translate(x, y)
            ctx.rotate(angle)
            ctx.drawImage(missileImg, -w / 2, -h / 2, w, h)
            ctx.restore()
          } else {
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        if (currentPoint && progress < 1) {
          drawMissileAt(currentPoint.x, currentPoint.y, index)
        }

        if (progress >= 1 && shotAnimation.impact) {
          const explosionProgress = Math.min(1, (elapsed - duration) / 400)
          if (explosionProgress < 0.3) {
            const lastIndex = Math.max(0, shotAnimation.path.length - 1)
            drawMissileAt(shotAnimation.impact.x, shotAnimation.impact.y, lastIndex)
          }
          ctx.fillStyle = `rgba(248, 113, 113, ${1 - explosionProgress})`
          ctx.beginPath()
          ctx.arc(
            shotAnimation.impact.x,
            shotAnimation.impact.y,
            TANK_GAME_CONFIG.explosionRadius * explosionProgress,
            0,
            Math.PI * 2
          )
          ctx.fill()
        }

        if (progress >= 1 && !shotAnimation.fallsTriggered) {
          shotAnimation.fallsTriggered = true
          const tank1Distance = shotAnimation.updatedTank1.position.y - shotAnimation.tank1Snapshot.position.y
          const tank2Distance = shotAnimation.updatedTank2.position.y - shotAnimation.tank2Snapshot.position.y
          const tank1Duration =
            tank1Distance > 2 ? Math.min(800, Math.max(180, Math.sqrt(tank1Distance) * 30)) : 0
          const tank2Duration =
            tank2Distance > 2 ? Math.min(800, Math.max(180, Math.sqrt(tank2Distance) * 30)) : 0

          setVisualTerrain(shotAnimation.updatedTerrain)
          setVisualTank1(shotAnimation.updatedTank1)
          setVisualTank2(shotAnimation.updatedTank2)
          setTankFallDurations({ tank1: tank1Duration, tank2: tank2Duration })
        }

        if (progress >= 1.2) {
          shotRef.current = null
          setVisualTerrain(terrain)
          setVisualTank1(tank1)
          setVisualTank2(tank2)
          setTankFallDurations({ tank1: 0, tank2: 0 })
        }
      }

      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [height, localAim, opponentAim, width, tank1, tank2, localPlayer, terrain])

  return (
    <div className="relative w-full max-w-[900px] mx-auto" style={{ aspectRatio: `${width}/${height}` }}>
      <canvas ref={canvasRef} width={width} height={height} className="block w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${((visualTank1.position.x - tankSprite.width / 2) / width) * 100}%`,
            top: `${((visualTank1.position.y - tankSprite.height / 2) / height) * 100}%`,
            width: `${(tankSprite.width / width) * 100}%`,
            height: `${(tankSprite.height / height) * 100}%`,
            transform: `rotate(${tank1BodyAngle}rad)`,
            transformOrigin: '50% 100%',
            transition:
              tankFallDurations.tank1 > 0
                ? `top ${tankFallDurations.tank1}ms cubic-bezier(0.2, 0, 0.6, 1), transform 180ms linear`
                : 'none'
          }}
        >
          <BlueTank turretAngle={tank1TurretAngle} />
        </div>
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${((visualTank2.position.x - tankSprite.width / 2) / width) * 100}%`,
            top: `${((visualTank2.position.y - tankSprite.height / 2) / height) * 100}%`,
            width: `${(tankSprite.width / width) * 100}%`,
            height: `${(tankSprite.height / height) * 100}%`,
            transform: `rotate(${tank2BodyAngle}rad)`,
            transformOrigin: '50% 100%',
            transition:
              tankFallDurations.tank2 > 0
                ? `top ${tankFallDurations.tank2}ms cubic-bezier(0.2, 0, 0.6, 1), transform 180ms linear`
                : 'none'
          }}
        >
          <RedTank turretAngle={tank2TurretAngle} />
        </div>
      </div>
    </div>
  )
}
