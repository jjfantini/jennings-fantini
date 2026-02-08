import React, { useState } from 'react'
import { motion } from 'motion/react'

type TankLobbyProps = {
  onCreate: () => Promise<void>
  onJoin: (roomCode: string) => Promise<void>
  onResume?: (roomCode: string) => Promise<void>
  resumeCode?: string | null
  isLoading?: boolean
  error?: string | null
}

export const TankLobby = ({
  onCreate,
  onJoin,
  onResume,
  resumeCode,
  isLoading,
  error
}: TankLobbyProps) => {
  const [roomCode, setRoomCode] = useState('')

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-2"
      >
        <h2 className="text-xl font-bold text-white">Tank Battle Live</h2>
        <p className="text-sm text-neutral-400">
          Create a room and share the code. Only two players can join a battle.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={onCreate}
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 disabled:opacity-50"
        >
          Create Game
        </button>

        <div className="flex gap-2">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600"
          />
          <button
            type="button"
            onClick={() => onJoin(roomCode.trim())}
            disabled={!roomCode.trim() || isLoading}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Join
          </button>
        </div>

        {resumeCode && onResume && (
          <button
            type="button"
            onClick={() => onResume(resumeCode)}
            disabled={isLoading}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-300 hover:border-neutral-600"
          >
            Resume last game ({resumeCode})
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
