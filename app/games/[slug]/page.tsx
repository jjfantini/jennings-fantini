'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import SnakeGame from '../_components/SnakeGame'
import TetrisGame from '../_components/TetrisGame'
import { useIsMobile } from '@/lib/hooks/use-mobile-device'
import { gamesBySlug } from '@/app/games/_lib/gameConfig'

const gameComponents = {
  snake: SnakeGame,
  tetris: TetrisGame
}

const gameIcons: Record<string, string> = {
  snake: '🐍',
  tetris: '🧱'
}

type Props = {
  params: Promise<{
    slug: string
  }>
}

type UnwrappedParams = {
  slug: string
}

export default function GamePage({ params }: Props) {
  const unwrappedParams = React.use(params) as UnwrappedParams
  const { slug } = unwrappedParams
  const isMobile = useIsMobile()

  const gameData = gamesBySlug[slug]
  const GameComponent = gameComponents[slug as keyof typeof gameComponents]
  const gameIcon = gameIcons[slug] || '🎮'

  if (!gameData || !GameComponent) {
    notFound()
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center p-2 md:p-8 font-mono"
      suppressHydrationWarning
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-8"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Arcade</span>
          </Link>

          <div className="flex items-center justify-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className={`${isMobile ? 'text-3xl' : 'text-5xl'}`}
            >
              {gameIcon}
            </motion.span>
            <h1
              className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500`}
            >
              {gameData.title}
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${isMobile ? 'text-xs' : 'text-sm'} text-neutral-400 text-center mt-2 max-w-md mx-auto`}
          >
            {gameData.description}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <GameComponent />
        </motion.div>
      </div>

      <div className={`${isMobile ? 'h-16' : 'h-20'}`} />
    </div>
  )
}
