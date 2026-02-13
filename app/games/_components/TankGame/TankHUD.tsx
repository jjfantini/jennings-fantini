import React from 'react'

type TankHUDProps = {
  playerNumber: 1 | 2 | null
  currentTurn: 1 | 2
  statusMessage: string
  roomCode: string
}

export const TankHUD = ({
  playerNumber,
  currentTurn,
  statusMessage,
  roomCode
}: TankHUDProps) => (
  <div className="flex flex-col gap-3 text-sm text-neutral-200">
    <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs uppercase text-neutral-500">Room</span>
        <span className="font-semibold tracking-wide text-white">{roomCode || '------'}</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-xs uppercase text-neutral-500">Turn</span>
        <span className="font-semibold text-white">
          Player {currentTurn} {playerNumber === currentTurn ? '(You)' : ''}
        </span>
      </div>
    </div>

    <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300">
      {statusMessage}
    </div>
  </div>
)
