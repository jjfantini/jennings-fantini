import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Difficulty, GameSaveData } from '@/app/games/_types/game.types'

type UseGameStorageOptions = {
  initialDifficulty?: Difficulty
}

const buildStorageKey = (slug: string) => `arcade_game_${slug}`

export const useGameStorage = (slug: string, options: UseGameStorageOptions = {}) => {
  const { initialDifficulty = 'medium' } = options
  const storageKey = useMemo(() => buildStorageKey(slug), [slug])

  const [highScore, setHighScore] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [lastPlayed, setLastPlayed] = useState<string | null>(null)

  const loadSaveData = useCallback((): GameSaveData | null => {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    try {
      return JSON.parse(raw) as GameSaveData
    } catch {
      return null
    }
  }, [storageKey])

  const writeSaveData = useCallback(
    (data: GameSaveData) => {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(storageKey, JSON.stringify(data))
    },
    [storageKey]
  )

  const saveSettings = useCallback(
    (nextDifficulty: Difficulty) => {
      const now = new Date().toISOString()
      const data: GameSaveData = {
        highScore,
        lastPlayed: now,
        settings: {
          difficulty: nextDifficulty,
          soundEnabled: true
        }
      }
      writeSaveData(data)
      setDifficulty(nextDifficulty)
      setLastPlayed(now)
    },
    [highScore, writeSaveData]
  )

  const updateHighScore = useCallback(
    (score: number) => {
      if (score <= highScore) return false
      const now = new Date().toISOString()
      const data: GameSaveData = {
        highScore: score,
        lastPlayed: now,
        settings: {
          difficulty,
          soundEnabled: true
        }
      }
      writeSaveData(data)
      setHighScore(score)
      setLastPlayed(now)
      return true
    },
    [difficulty, highScore, writeSaveData]
  )

  useEffect(() => {
    const data = loadSaveData()
    if (!data) return
    setHighScore(data.highScore ?? 0)
    setDifficulty(data.settings?.difficulty ?? initialDifficulty)
    setLastPlayed(data.lastPlayed ?? null)
  }, [initialDifficulty, loadSaveData])

  return {
    highScore,
    difficulty,
    lastPlayed,
    setDifficulty,
    saveSettings,
    updateHighScore
  }
}
