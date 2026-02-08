'use client'

import { motion } from 'motion/react'
import type { GameStatItem } from '@/app/games/_types/game.types'

type GameStatsProps = {
  stats: GameStatItem[]
}

export const GameStats = ({ stats }: GameStatsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
          <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                {stat.label}
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {stat.value}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
