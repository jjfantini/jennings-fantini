'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { AnimatedTitle } from '@/components/ui/animated-title'
import TypingAnimation from '@/components/ui/typing-animation'
import { gameConfigs } from '@/app/games/_lib/gameConfig'
import { useGameStorage } from '@/app/games/_hooks/useGameStorage'
import { PlayIcon } from '@radix-ui/react-icons'

type GameCardProps = {
  slug: string
  title: string
  description: string
  color: string
  delay: number
  icon: string
}

const gameIcons: Record<string, string> = {
  snake: '🐍',
  tetris: '🧱'
}

const GameCard = ({ slug, title, description, color, delay, icon }: GameCardProps) => {
  const { highScore, difficulty } = useGameStorage(slug)

  const difficultyColors: Record<string, string> = {
    easy: 'from-emerald-500 to-green-500',
    medium: 'from-amber-500 to-yellow-500',
    hard: 'from-rose-500 to-red-500'
  }

  return (
    <Link href={`/games/${slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, type: 'spring', bounce: 0.3 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="group relative h-full"
      >
        <div className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500`} />

        <div className="relative h-full bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 group-hover:border-neutral-700">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-20 translate-x-20" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <motion.span
                className="text-4xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                {icon}
              </motion.span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${difficultyColors[difficulty]} text-white shadow-lg`}
              >
                {difficulty}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all duration-300">
              {title}
            </h3>

            <p className="text-sm text-neutral-400 mb-6 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  High Score
                </span>
                <span className="text-lg font-bold text-white tabular-nums">{highScore}</span>
              </div>

              <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayIcon className="w-4 h-4" />
                <span>Play</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function GamesPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center p-4 md:p-8 font-mono"
      suppressHydrationWarning
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <AnimatedTitle
            text="Arcade"
            className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
          />

          <div className="h-[3rem]">
            <TypingAnimation
              className="text-lg text-neutral-400"
              duration={50}
              delay={500}
              startOnView
            >
              Classic games, reimagined. Pick your challenge.
            </TypingAnimation>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto">
          {gameConfigs.map((game, index) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              title={game.title}
              description={game.description}
              color={game.color}
              icon={gameIcons[game.slug] || '🎮'}
              delay={index * 0.15}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-neutral-500 text-xs mt-12"
        >
          More games coming soon...
        </motion.p>
      </div>

      <div className="h-20" />
    </div>
  )
}
