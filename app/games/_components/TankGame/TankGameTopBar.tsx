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

const WIND_MAX = 0.6
const WIND_SLOTS_PER_SIDE = 5

const getFilledSlotCount = (windSpeed: number) => {
  const abs = Math.abs(windSpeed)
  if (abs < 0.02) return 0
  return Math.min(WIND_SLOTS_PER_SIDE, Math.ceil((abs / WIND_MAX) * WIND_SLOTS_PER_SIDE))
}

const pathPointsRight = 'M14 5L4 0v10l10-5z'
const pathPointsLeft = 'M0 5l10 5V0L0 5z'

const WindBar = ({
  pointsLeft,
  filledCount
}: {
  pointsLeft: boolean
  filledCount: number
}) => (
  <>
    <div className="flex items-center gap-0.5 flex-1 justify-end">
      {Array.from({ length: WIND_SLOTS_PER_SIDE }, (_, i) => {
        const filled = pointsLeft && i >= WIND_SLOTS_PER_SIDE - filledCount
        return (
          <svg
            key={`l-${i}`}
            width="12"
            height="9"
            viewBox="0 0 14 10"
            className="shrink-0 text-sky-400"
            aria-hidden
          >
            <path d={pathPointsLeft} fill="currentColor" opacity={filled ? 0.9 : 0.25} />
          </svg>
        )
      })}
    </div>
    <div
      className="shrink-0 w-px h-full bg-white/20 mx-0.5"
      aria-hidden
    />
    <div className="flex items-center gap-0.5 flex-1 justify-start">
      {Array.from({ length: WIND_SLOTS_PER_SIDE }, (_, i) => {
        const filled = !pointsLeft && i < filledCount
        return (
          <svg
            key={`r-${i}`}
            width="12"
            height="9"
            viewBox="0 0 14 10"
            className="shrink-0 text-sky-400"
            aria-hidden
          >
            <path d={pathPointsRight} fill="currentColor" opacity={filled ? 0.9 : 0.25} />
          </svg>
        )
      })}
    </div>
  </>
)

export const TankGameTopBar = ({
  player1Lives,
  player2Lives,
  windSpeed,
  currentTurn
}: TankGameTopBarProps) => {
  const pointsLeft = windSpeed < 0
  const filledSlots = getFilledSlotCount(windSpeed)

  const boxClass = 'rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2'

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
      <div className={`flex flex-col gap-1.5 min-w-[56px] sm:min-w-[80px] shrink-0 ${boxClass}`}>
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

      <div className={`flex flex-col gap-1.5 shrink-0 w-[160px] sm:w-[180px] mx-1 sm:mx-2 ${boxClass}`}>
        <span className="text-xs uppercase text-neutral-500 text-center">wind</span>
        <div className="h-5 w-full rounded-md border border-neutral-600 bg-neutral-800/60 overflow-hidden flex items-center">
          <WindBar pointsLeft={pointsLeft} filledCount={filledSlots} />
        </div>
      </div>

      <div className={`flex flex-col gap-1.5 min-w-[56px] sm:min-w-[80px] shrink-0 items-end ${boxClass}`}>
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
