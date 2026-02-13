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
  <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-2.5 py-2 text-sm text-neutral-200">
    <div className="flex items-center gap-2 sm:gap-3">
      <label className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">Angle</span>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min={AIM_CONFIG.min}
            max={AIM_CONFIG.max}
            value={angle}
            onChange={(event) => onAngleChange(Number(event.target.value))}
            disabled={disabled}
            className="h-1.5 flex-1 min-w-0 accent-indigo-500"
          />
          <span className="text-[10px] text-neutral-500 w-7 shrink-0 tabular-nums">{Math.round(angle)}°</span>
        </div>
      </label>

      <label className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">Power</span>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min={10}
            max={100}
            value={power}
            onChange={(event) => onPowerChange(Number(event.target.value))}
            disabled={disabled}
            className="h-1.5 flex-1 min-w-0 accent-violet-500"
          />
          <span className="text-[10px] text-neutral-500 w-8 shrink-0 tabular-nums">{Math.round(power)}%</span>
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
