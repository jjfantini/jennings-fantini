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
  <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-sm text-neutral-200">
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-neutral-400">Angle</span>
        <input
          type="range"
          min={AIM_CONFIG.min}
          max={AIM_CONFIG.max}
          value={angle}
          onChange={(event) => onAngleChange(Number(event.target.value))}
          disabled={disabled}
          className="accent-indigo-500"
        />
        <span className="text-xs text-neutral-400">{Math.round(angle)}°</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-neutral-400">Power</span>
        <input
          type="range"
          min={10}
          max={100}
          value={power}
          onChange={(event) => onPowerChange(Number(event.target.value))}
          disabled={disabled}
          className="accent-violet-500"
        />
        <span className="text-xs text-neutral-400">{Math.round(power)}%</span>
      </label>

      <button
        type="button"
        onClick={onFire}
        disabled={disabled}
        className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-40"
      >
        Fire
      </button>
    </div>
  </div>
)
