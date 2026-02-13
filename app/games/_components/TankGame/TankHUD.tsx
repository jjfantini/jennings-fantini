import React from 'react'

type RoomTurnBarProps = {
  playerNumber: 1 | 2 | null
  currentTurn: 1 | 2
  roomCode: string
}

export const RoomTurnBar = ({
  playerNumber,
  currentTurn,
  roomCode
}: RoomTurnBarProps) => (
  <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-200">
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase text-neutral-500">Room</span>
      <span className="font-semibold tracking-wide text-white">{roomCode || '------'}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase text-neutral-500">Turn</span>
      <span className="font-semibold text-white">
        P{currentTurn} {playerNumber === currentTurn ? '(You)' : ''}
      </span>
    </div>
  </div>
)

type StatusMessageProps = {
  statusMessage: string
}

export const StatusMessage = ({ statusMessage }: StatusMessageProps) => (
  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[11px] text-neutral-300">
    {statusMessage}
  </div>
)

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
    <RoomTurnBar playerNumber={playerNumber} currentTurn={currentTurn} roomCode={roomCode} />
    <StatusMessage statusMessage={statusMessage} />
  </div>
)
