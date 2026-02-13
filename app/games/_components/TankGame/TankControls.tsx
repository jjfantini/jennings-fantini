import React from 'react'
import { AIM_CONFIG } from '@/app/games/_components/TankGame/tank.config'

type TankControlsProps = {
  angle: number
  power: number
  onAngleChange: (value: number) => void
  onPowerChange: (value: number) => void
  onFire: () => void
  disabled?: boolean
}

export const TankControls = ({
  angle,
  power,
  onAngleChange,
  onPowerChange,
  onFire,
  disabled
}: TankControlsProps) => (
  <div className="w-full rounded-lg border border-neutral-700 bg-neutral-800/95 shadow-lg shadow-black/30 px-2.5 py-2.5 text-sm text-neutral-200">
    <div className="flex items-center gap-2 sm:gap-3">
      <label className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wide font-medium text-neutral-300">Angle</span>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min={AIM_CONFIG.min}
            max={AIM_CONFIG.max}
            value={angle}
            onChange={(event) => onAngleChange(Number(event.target.value))}
            disabled={disabled}
            className="h-2 flex-1 min-w-0 accent-indigo-500"
          />
          <span className="text-xs font-medium text-neutral-200 w-8 shrink-0 tabular-nums">{Math.round(angle)}°</span>
        </div>
      </label>

      <label className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wide font-medium text-neutral-300">Power</span>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min={10}
            max={100}
            value={power}
            onChange={(event) => onPowerChange(Number(event.target.value))}
            disabled={disabled}
            className="h-2 flex-1 min-w-0 accent-violet-500"
          />
          <span className="text-xs font-medium text-neutral-200 w-9 shrink-0 tabular-nums">{Math.round(power)}%</span>
        </div>
      </label>

      <button
        type="button"
        onClick={onFire}
        disabled={disabled}
        className="shrink-0 rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-40"
      >
        Fire
      </button>
    </div>
  </div>
)
