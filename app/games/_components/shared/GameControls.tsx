'use client'

import { motion } from 'motion/react'
import { PauseIcon, PlayIcon, ReloadIcon, RocketIcon } from '@radix-ui/react-icons'
import type { GameControlsProps } from '@/app/games/_types/game.types'

export const GameControls = ({
  onPause,
  onResume,
  onReset,
  onToggleAI,
  isPaused,
  isAIEnabled,
  gameState,
  supportsAI
}: GameControlsProps) => {
  const isPlaying = gameState === 'PLAYING'
  const isGameOver = gameState === 'GAME_OVER'
  const isIdle = gameState === 'IDLE'

  const buttonBase =
    'relative flex-1 min-w-0 min-h-[48px] py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden group'

  return (
    <div className="flex flex-row gap-3 w-full max-w-md">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={isPaused ? onResume : onPause}
        disabled={!isPlaying && !isPaused}
        className={`${buttonBase} ${
          !isPlaying && !isPaused
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {isPaused ? <PlayIcon className="w-5 h-5 flex-shrink-0" /> : <PauseIcon className="w-5 h-5 flex-shrink-0" />}
        <span className="truncate">{isPaused ? 'Resume' : 'Pause'}</span>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onClick={onReset}
        className={`${buttonBase} bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98]`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <ReloadIcon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">Reset</span>
      </motion.button>

      {supportsAI && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onClick={onToggleAI}
          disabled={isGameOver || isIdle}
          className={`${buttonBase} ${
            isGameOver || isIdle
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              : isAIEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-neutral-800 border border-neutral-600 text-neutral-200 hover:bg-neutral-700 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <RocketIcon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{isAIEnabled ? 'AI On' : 'AI'}</span>
          {isAIEnabled && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          )}
        </motion.button>
      )}
    </div>
  )
}
