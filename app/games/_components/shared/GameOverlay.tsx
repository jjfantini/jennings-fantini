'use client'

import { motion, AnimatePresence } from 'motion/react'
import type { GameOverlayVariant } from '@/app/games/_types/game.types'

type OverlayAction = {
  label: string
  onClick: () => void
  className?: string
}

type GameOverlayProps = {
  variant: GameOverlayVariant
  title: string
  description?: string
  primaryAction: OverlayAction
  secondaryAction?: OverlayAction
  children?: React.ReactNode
}

const variantConfig: Record<
  GameOverlayVariant,
  { icon: string; gradient: string; buttonGradient: string; buttonShadow: string }
> = {
  start: {
    icon: '🎮',
    gradient: 'from-violet-600/20 via-transparent to-indigo-600/20',
    buttonGradient: 'from-emerald-500 to-green-500',
    buttonShadow: 'shadow-emerald-500/30'
  },
  pause: {
    icon: '⏸️',
    gradient: 'from-blue-600/20 via-transparent to-cyan-600/20',
    buttonGradient: 'from-blue-500 to-indigo-500',
    buttonShadow: 'shadow-blue-500/30'
  },
  'game-over': {
    icon: '💀',
    gradient: 'from-rose-600/20 via-transparent to-orange-600/20',
    buttonGradient: 'from-emerald-500 to-green-500',
    buttonShadow: 'shadow-emerald-500/30'
  }
}

export const GameOverlay = ({
  variant,
  title,
  description,
  primaryAction,
  secondaryAction,
  children
}: GameOverlayProps) => {
  const config = variantConfig[variant]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto py-4"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
          className="relative z-10 flex flex-col items-center text-center px-4 py-2 max-w-xs w-full"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl mb-1 sm:mb-2"
          >
            {config.icon}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1"
          >
            {title}
          </motion.h2>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-300 text-xs sm:text-sm mb-1 sm:mb-2"
            >
              {description}
            </motion.p>
          )}

          {children}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3 w-full justify-center"
          >
            <button
              onClick={primaryAction.onClick}
              className={`relative px-5 py-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${config.buttonGradient} shadow-lg ${config.buttonShadow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">{primaryAction.label}</span>
            </button>

            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-5 py-2 rounded-xl font-semibold text-sm text-neutral-300 bg-neutral-800/80 border border-neutral-700/50 hover:bg-neutral-700/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {secondaryAction.label}
              </button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
