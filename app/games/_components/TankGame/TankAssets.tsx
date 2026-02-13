import React from 'react'
import { TANK_SPRITE, BLUE_BARREL, RED_BARREL } from '@/app/games/_components/TankGame/tank.config'

const { width: SPRITE_WIDTH, height: SPRITE_HEIGHT } = TANK_SPRITE
const BLUE_BARREL_LENGTH = BLUE_BARREL.turretMuzzle.x - BLUE_BARREL.barrelPivot.x
const RED_BARREL_LENGTH = Math.abs(RED_BARREL.turretMuzzle.x - RED_BARREL.barrelPivot.x)

type TankSpriteProps = {
  turretAngle: number
}

const BlueBarrelOverlay = ({ turretAngle }: TankSpriteProps) => {
  const leftPercent = (BLUE_BARREL.barrelPivot.x / SPRITE_WIDTH) * 100
  const topPercent = (BLUE_BARREL.barrelPivot.y / SPRITE_HEIGHT) * 100
  const widthPercent = (BLUE_BARREL_LENGTH / SPRITE_WIDTH) * 100
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        transformOrigin: '0 50%',
        transform: `translateY(-50%) rotate(${turretAngle}deg)`,
        transition: 'transform ease-out'
      }}
    >
      <img
        src="/tanks/blue-barrel.png"
        alt=""
        className="block w-full h-auto object-contain"
        style={{ imageRendering: 'pixelated', objectPosition: 'left center' }}
      />
    </div>
  )
}

const RedBarrelOverlay = ({ turretAngle }: TankSpriteProps) => {
  const leftPercent = (RED_BARREL.turretMuzzle.x / SPRITE_WIDTH) * 100
  const topPercent = (RED_BARREL.barrelPivot.y / SPRITE_HEIGHT) * 100
  const widthPercent = (RED_BARREL_LENGTH / SPRITE_WIDTH) * 100
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        transformOrigin: '100% 50%',
        transform: `translateY(-50%) scaleX(-1) rotate(${turretAngle}deg)`,
        transition: 'transform ease-out'
      }}
    >
      <img
        src="/tanks/red-barrel.png"
        alt=""
        className="block w-full h-auto object-contain"
        style={{ imageRendering: 'pixelated', objectPosition: 'left center' }}
      />
    </div>
  )
}

export const BlueTank = ({ turretAngle }: TankSpriteProps) => (
  <div className="relative w-full h-full" style={{ imageRendering: 'pixelated' }}>
    <img
      src="/tanks/blue-tank.png"
      alt=""
      className="block w-full h-full object-fill"
      style={{ imageRendering: 'pixelated' }}
    />
    <BlueBarrelOverlay turretAngle={turretAngle} />
  </div>
)

export const RedTank = ({ turretAngle }: TankSpriteProps) => (
  <div className="relative w-full h-full" style={{ imageRendering: 'pixelated' }}>
    <img
      src="/tanks/red-tank.png"
      alt=""
      className="block w-full h-full object-fill"
      style={{ imageRendering: 'pixelated' }}
    />
    <RedBarrelOverlay turretAngle={turretAngle} />
  </div>
)
