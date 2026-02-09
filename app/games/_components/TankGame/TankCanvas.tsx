import React, { useEffect, useRef } from 'react'
import { BlueTank, RedTank } from '@/app/games/_components/TankGame/TankAssets'
import { buildTerrainPath, getTerrainAngle } from '@/app/games/_components/TankGame/TankTerrain'
import { getTankAimOrigin } from '@/app/games/_components/TankGame/TankPhysics'
import type { ShotResult, TankState, TankVector, TerrainMap } from '@/app/games/_components/TankGame/tank.types'
import { TANK_GAME_CONFIG } from '@/app/games/_components/TankGame/tank.config'

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
  path: TankVector[]
  impact: TankVector | null
  startTime: number
  terrainSnapshot: TerrainMap
}

const getAimLine = (tank: TankState, power: number) => {
  const angle = (tank.angle * Math.PI) / 180
  const origin = getTankAimOrigin(tank, TANK_GAME_CONFIG.tankSize)
  const length = Math.max(12, power * 1.1)
  const endpoint = {
    x: origin.x + Math.cos(angle) * length,
    y: origin.y - Math.sin(angle) * length
  }
  return [origin, endpoint]
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
  const previousTerrainRef = useRef<TerrainMap>(terrain)
  const tankSpriteSize = { width: 64, height: 48 }
  const tank1BodyAngle = getTerrainAngle(terrain, tank1.position.x)
  const tank2BodyAngle = getTerrainAngle(terrain, tank2.position.x)
  const tank1TurretAngle = tank1.angle - (tank1BodyAngle * 180) / Math.PI
  const tank2TurretAngle = tank2.angle - (tank2BodyAngle * 180) / Math.PI

  useEffect(() => {
    if (!shot?.path?.length) {
      return
    }
    shotRef.current = {
      path: shot.path,
      impact: shot.impact,
      startTime: performance.now(),
      terrainSnapshot: previousTerrainRef.current
    }
  }, [shot])

  useEffect(() => {
    previousTerrainRef.current = terrain
  }, [terrain])

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
      const activeTerrain = shotRef.current?.terrainSnapshot ?? terrain
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
        const activeTank = localPlayer === 1 ? tank1 : tank2
        const points = getAimLine(
          { ...activeTank, angle: localAim.angle, power: localAim.power },
          localAim.power
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
        const opponentTank = localPlayer === 1 ? tank2 : tank1
        const points = getAimLine(
          { ...opponentTank, angle: opponentAim.angle, power: opponentAim.power },
          opponentAim.power
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

      const shotAnimation = shotRef.current
      if (shotAnimation) {
        const elapsed = performance.now() - shotAnimation.startTime
        const duration = Math.max(800, shotAnimation.path.length * 8)
        const progress = Math.min(1, elapsed / duration)
        const index = Math.floor(progress * (shotAnimation.path.length - 1))
        const currentPoint = shotAnimation.path[index]

        if (currentPoint) {
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(currentPoint.x, currentPoint.y, 4, 0, Math.PI * 2)
          ctx.fill()
        }

        if (progress >= 1 && shotAnimation.impact) {
          const explosionProgress = Math.min(1, (elapsed - duration) / 400)
          if (explosionProgress < 0.3) {
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath()
            ctx.arc(shotAnimation.impact.x, shotAnimation.impact.y, 4, 0, Math.PI * 2)
            ctx.fill()
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

        if (progress >= 1.2) {
          shotRef.current = null
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
    <div className="relative" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className="block" />

      <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
        <div
          className="absolute"
          style={{
            left: tank1.position.x - tankSpriteSize.width / 2,
            top: tank1.position.y - tankSpriteSize.height / 2,
            transform: `rotate(${tank1BodyAngle}rad)`,
            transformOrigin: '50% 100%'
          }}
        >
          <BlueTank turretAngle={tank1TurretAngle} />
        </div>
        <div
          className="absolute"
          style={{
            left: tank2.position.x - tankSpriteSize.width / 2,
            top: tank2.position.y - tankSpriteSize.height / 2,
            transform: `rotate(${tank2BodyAngle}rad)`,
            transformOrigin: '50% 100%'
          }}
        >
          <RedTank turretAngle={tank2TurretAngle} />
        </div>
      </div>
    </div>
  )
}
