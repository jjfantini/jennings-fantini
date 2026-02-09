import React from 'react'

type TankSpriteProps = {
  turretAngle: number
}

const turretStyle = (angle: number) => ({
  transform: `rotate(${angle}deg)`,
  transformOrigin: '24px 24px'
})

export const BlueTank = ({ turretAngle }: TankSpriteProps) => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden>
    <g>
      <rect x="6" y="24" width="52" height="16" rx="4" fill="#1e3a8a" />
      <rect x="12" y="18" width="40" height="10" rx="4" fill="#2563eb" />
      <circle cx="20" cy="40" r="4" fill="#0f172a" />
      <circle cx="32" cy="40" r="4" fill="#0f172a" />
      <circle cx="44" cy="40" r="4" fill="#0f172a" />
      <g style={turretStyle(turretAngle)}>
        <rect x="26" y="20" width="14" height="6" rx="3" fill="#38bdf8" />
        <rect x="36" y="21" width="16" height="4" rx="2" fill="#7dd3fc" />
      </g>
    </g>
  </svg>
)

export const RedTank = ({ turretAngle }: TankSpriteProps) => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden>
    <g>
      <rect x="6" y="24" width="52" height="16" rx="4" fill="#7f1d1d" />
      <rect x="12" y="18" width="40" height="10" rx="4" fill="#dc2626" />
      <circle cx="20" cy="40" r="4" fill="#111827" />
      <circle cx="32" cy="40" r="4" fill="#111827" />
      <circle cx="44" cy="40" r="4" fill="#111827" />
      <g style={turretStyle(turretAngle)}>
        <rect x="26" y="20" width="14" height="6" rx="3" fill="#fb7185" />
        <rect x="36" y="21" width="16" height="4" rx="2" fill="#fecdd3" />
      </g>
    </g>
  </svg>
)
