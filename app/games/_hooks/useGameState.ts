import { useCallback, useMemo, useState } from 'react'
import type { Difficulty, GameState } from '@/app/games/_types/game.types'

type UseGameStateOptions = {
  initialDifficulty?: Difficulty
  onGameOver?: (finalScore: number) => void
}

export const useGameState = (options: UseGameStateOptions = {}) => {
  const { initialDifficulty = 'medium', onGameOver } = options

  const [gameState, setGameState] = useState<GameState>('IDLE')
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [isAiEnabled, setIsAiEnabled] = useState(false)

  const startGame = useCallback(() => {
    setScore(0)
    setGameState('PLAYING')
  }, [])

  const pauseGame = useCallback(() => {
    setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : prev))
  }, [])

  const resumeGame = useCallback(() => {
    setGameState(prev => (prev === 'PAUSED' ? 'PLAYING' : prev))
  }, [])

  const resetGame = useCallback(() => {
    setScore(0)
    setIsAiEnabled(false)
    setGameState('IDLE')
  }, [])

  const endGame = useCallback((finalScore: number) => {
    setGameState('GAME_OVER')
    onGameOver?.(finalScore)
  }, [onGameOver])

  const toggleAi = useCallback(() => {
    setIsAiEnabled(prev => !prev)
  }, [])

  const isPaused = gameState === 'PAUSED'
  const isGameOver = gameState === 'GAME_OVER'
  const isPlaying = gameState === 'PLAYING'

  const state = useMemo(
    () => ({
      gameState,
      score,
      difficulty,
      isAiEnabled,
      isPaused,
      isGameOver,
      isPlaying
    }),
    [gameState, score, difficulty, isAiEnabled, isPaused, isGameOver, isPlaying]
  )

  return {
    ...state,
    setGameState,
    setScore,
    setDifficulty,
    setIsAiEnabled,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    endGame,
    toggleAi
  }
}
