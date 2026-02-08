import React, { useEffect, useMemo, useRef } from 'react'
import { BlueTank, RedTank } from '@/app/games/_components/TankGame/TankAssets'
import { buildTerrainPath } from '@/app/games/_components/TankGame/TankTerrain'
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
}

const getAimLine = (tank: TankState, power: number) => {
  const angle = (tank.angle * Math.PI) / 180
  const origin = {
    x: tank.position.x + Math.cos(angle) * 30,
    y: tank.position.y - Math.sin(angle) * 24
  }
  const points: TankVector[] = []
  for (let t = 0; t <= 1; t += 0.1) {
    const time = t * 0.9
    const velocityX = Math.cos(angle) * power * TANK_GAME_CONFIG.powerScale * 60
    const velocityY = -Math.sin(angle) * power * TANK_GAME_CONFIG.powerScale * 60
    points.push({
      x: origin.x + velocityX * time,
      y: origin.y + velocityY * time + 0.5 * TANK_GAME_CONFIG.gravity * (time * 60) * (time * 60)
    })
  }
  return points
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

  const terrainPath = useMemo(() => buildTerrainPath(terrain), [terrain])

  useEffect(() => {
    if (!shot?.path?.length) {
      return
    }
    shotRef.current = {
      path: shot.path,
      impact: shot.impact,
      startTime: performance.now()
    }
  }, [shot])

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
          ctx.fillStyle = `rgba(248, 113, 113, ${1 - explosionProgress})`
          ctx.beginPath()
          ctx.arc(
            shotAnimation.impact.x,
            shotAnimation.impact.y,
            TANK_GAME_CONFIG.explosionRadius * (0.6 + explosionProgress * 0.4),
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
  }, [height, localAim, opponentAim, terrainPath, width, tank1, tank2, localPlayer])

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className="block" />

      <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
        <div
          className="absolute"
          style={{
            left: tank1.position.x - 32,
            top: tank1.position.y - 32
          }}
        >
          <BlueTank turretAngle={tank1.angle} />
        </div>
        <div
          className="absolute"
          style={{
            left: tank2.position.x - 32,
            top: tank2.position.y - 32
          }}
        >
          <RedTank turretAngle={tank2.angle} />
        </div>
      </div>
    </div>
  )
}
