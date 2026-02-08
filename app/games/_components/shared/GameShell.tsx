'use client'

import React from 'react'
import { motion } from 'motion/react'
import { GameControls } from '@/app/games/_components/shared/GameControls'
import { GameOverlay } from '@/app/games/_components/shared/GameOverlay'
import { GameStats } from '@/app/games/_components/shared/GameStats'
import { DifficultySelector } from '@/app/games/_components/shared/DifficultySelector'
import type {
  Difficulty,
  GameControlsProps,
  GameOverlayVariant,
  GameStatItem,
  GameState
} from '@/app/games/_types/game.types'

type OverlayConfig = {
  title: string
  description?: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  children?: React.ReactNode
}

type GameShellProps = {
  stats: GameStatItem[]
  gameArea: React.ReactNode
  sidePanel?: React.ReactNode
  controlsInfo?: React.ReactNode
  mobileControls?: React.ReactNode
  gameState: GameState
  difficulty: Difficulty
  onDifficultySelect: (difficulty: Difficulty) => void
  controls: Omit<GameControlsProps, 'gameState'>
  startOverlay: OverlayConfig
  pauseOverlay: OverlayConfig
  gameOverOverlay: OverlayConfig
}

const buildOverlay = (variant: GameOverlayVariant, config: OverlayConfig) => (
  <GameOverlay
    variant={variant}
    title={config.title}
    description={config.description}
    primaryAction={{
      label: config.primaryActionLabel,
      onClick: config.onPrimaryAction
    }}
    secondaryAction={
      config.secondaryActionLabel && config.onSecondaryAction
        ? {
            label: config.secondaryActionLabel,
            onClick: config.onSecondaryAction
          }
        : undefined
    }
  >
    {config.children}
  </GameOverlay>
)

export const GameShell = ({
  stats,
  gameArea,
  sidePanel,
  controlsInfo,
  mobileControls,
  gameState,
  difficulty,
  onDifficultySelect,
  controls,
  startOverlay,
  pauseOverlay,
  gameOverOverlay
}: GameShellProps) => {
  const isIdle = gameState === 'IDLE'
  const isPaused = gameState === 'PAUSED'
  const isGameOver = gameState === 'GAME_OVER'

  return (
    <div className="flex justify-center select-none w-full px-2">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 w-full md:w-auto"
        >
          <GameStats stats={stats} />

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-purple-600/30 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-neutral-950 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
              {gameArea}

              {isIdle &&
                buildOverlay('start', {
                  ...startOverlay,
                  children: (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-2"
                    >
                      <DifficultySelector difficulty={difficulty} onSelect={onDifficultySelect} />
                    </motion.div>
                  )
                })}
              {isPaused && buildOverlay('pause', pauseOverlay)}
              {isGameOver && buildOverlay('game-over', gameOverOverlay)}
            </div>
          </div>

          {/* Mobile side panel - uses CSS to hide on desktop */}
          {sidePanel && (
            <div className="relative w-full max-w-[200px] md:hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl blur-md opacity-50" />
              <div className="relative bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-xl p-3 shadow-xl">
                {sidePanel}
              </div>
            </div>
          )}

          <GameControls {...controls} gameState={gameState} />

          {/* Mobile controls - uses CSS to hide on desktop */}
          <div className="md:hidden w-full">{mobileControls}</div>
        </motion.div>

        {/* Desktop side panel - uses CSS to hide on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex flex-col gap-4 w-[200px]"
        >
          {sidePanel && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl blur-md opacity-50" />
              <div className="relative bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 shadow-xl">
                {sidePanel}
              </div>
            </div>
          )}

          {controlsInfo && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-neutral-600/10 to-neutral-700/10 rounded-xl blur-md opacity-50" />
              <div className="relative bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 shadow-xl">
                {controlsInfo}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
