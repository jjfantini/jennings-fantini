import React from 'react'

type TankGameTopBarProps = {
  player1Lives: number
  player2Lives: number
  windSpeed: number
  currentTurn: 1 | 2
}

const LIVES_MAX = 3

const LivesBar = ({
  lives,
  filledColor,
  emptyColor
}: {
  lives: number
  filledColor: string
  emptyColor: string
}) => (
  <div className="flex gap-0.5">
    {Array.from({ length: LIVES_MAX }, (_, i) => (
      <div
        key={i}
        className={`h-2 flex-1 min-w-[12px] rounded-sm transition-colors ${
          i < lives ? filledColor : emptyColor
        }`}
      />
    ))}
  </div>
)

const getWindTriangleCount = (windSpeed: number) => {
  const abs = Math.abs(windSpeed)
  if (abs < 0.15) return 1
  if (abs < 0.3) return 2
  if (abs < 0.45) return 3
  if (abs < 0.55) return 4
  if (abs < 0.7) return 5
  if (abs < 0.85) return 6
  return 7
}

const WindArrow = ({ pointsLeft, count }: { pointsLeft: boolean; count: number }) => {
  const pathLeft = 'M14 5L4 0v10l10-5z'
  const pathRight = 'M0 5l10 5V0L0 5z'
  const path = pointsLeft ? pathLeft : pathRight
  return (
    <div
      className={`flex items-center gap-0.5 ${pointsLeft ? '' : 'flex-row-reverse'}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="14" height="10" viewBox="0 0 14 10" className="text-sky-400 shrink-0">
          <path d={path} fill="currentColor" opacity={0.85} />
        </svg>
      ))}
    </div>
  )
}

export const TankGameTopBar = ({
  player1Lives,
  player2Lives,
  windSpeed,
  currentTurn
}: TankGameTopBarProps) => {
  const pointsLeft = windSpeed > 0
  const triangleCount = getWindTriangleCount(windSpeed)

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 w-full">
      <div className="flex flex-col gap-1.5 min-w-[80px]">
        <div className="flex items-center gap-2">
          {currentTurn === 1 && (
            <span className="text-emerald-400 text-xs" aria-hidden>
              &#9654;
            </span>
          )}
          <span className="text-sm font-semibold text-blue-200">P1</span>
        </div>
        <LivesBar
          lives={player1Lives}
          filledColor="bg-blue-500"
          emptyColor="bg-neutral-700/60"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1 max-w-[240px] mx-4">
        <span className="text-xs uppercase text-neutral-500 text-center">wind</span>
        <div className="relative h-5 rounded-md border border-neutral-600 bg-neutral-800/60">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-neutral-600/40"
            aria-hidden
          />
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={pointsLeft ? { left: '50%' } : { right: '50%' }}
          >
            <WindArrow pointsLeft={pointsLeft} count={triangleCount} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[80px] items-end">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-rose-200">P2</span>
          {currentTurn === 2 && (
            <span className="text-emerald-400 text-xs" aria-hidden>
              &#9654;
            </span>
          )}
        </div>
        <LivesBar
          lives={player2Lives}
          filledColor="bg-rose-500"
          emptyColor="bg-neutral-700/60"
        />
      </div>
    </div>
  )
}
