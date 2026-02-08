'use client'

import { motion } from 'motion/react'
import type { Difficulty } from '@/app/games/_types/game.types'

type DifficultySelectorProps = {
  difficulty: Difficulty
  onSelect: (difficulty: Difficulty) => void
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; gradient: string; shadow: string; icon: string }
> = {
  easy: {
    label: 'Easy',
    gradient: 'from-emerald-500 to-green-500',
    shadow: 'shadow-emerald-500/30',
    icon: '🌱'
  },
  medium: {
    label: 'Medium',
    gradient: 'from-amber-500 to-yellow-500',
    shadow: 'shadow-amber-500/30',
    icon: '⚡'
  },
  hard: {
    label: 'Hard',
    gradient: 'from-rose-500 to-red-500',
    shadow: 'shadow-rose-500/30',
    icon: '🔥'
  }
}

export const DifficultySelector = ({ difficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {(['easy', 'medium', 'hard'] as Difficulty[]).map((level, index) => {
        const config = difficultyConfig[level]
        const isSelected = difficulty === level

        return (
          <motion.button
            key={level}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelect(level)}
            className={`relative w-[140px] h-9 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden group ${
              isSelected
                ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg ${config.shadow}`
                : 'bg-neutral-800/80 border border-neutral-700/50 text-neutral-300 hover:border-neutral-600'
            }`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-1.5">
              <span className="text-sm">{config.icon}</span>
              <span>{config.label}</span>
            </span>
            {isSelected && (
              <motion.span
                layoutId="difficulty-indicator"
                className="absolute inset-0 rounded-lg ring-2 ring-white/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
