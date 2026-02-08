import React from 'react'

type TankHUDProps = {
  playerNumber: 1 | 2 | null
  player1Lives: number
  player2Lives: number
  currentTurn: 1 | 2
  statusMessage: string
  roomCode: string
}

export const TankHUD = ({
  playerNumber,
  player1Lives,
  player2Lives,
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

    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2">
        <p className="text-xs uppercase text-blue-200">Player 1</p>
        <p className="text-lg font-bold text-white">{player1Lives} lives</p>
      </div>
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2">
        <p className="text-xs uppercase text-rose-200">Player 2</p>
        <p className="text-lg font-bold text-white">{player2Lives} lives</p>
      </div>
    </div>

    <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300">
      {statusMessage}
    </div>
  </div>
)
