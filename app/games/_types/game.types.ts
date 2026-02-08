export type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameStatItem = {
  label: string
  value: string | number
}

export type GameControls = {
  keyboard: Record<string, string>
  touch: string[]
}

export type GameConfig = {
  slug: string
  title: string
  description: string
  color: string
  supportsAI: boolean
  controls: GameControls
}

export type GameSaveData = {
  highScore: number
  lastPlayed: string
  settings: {
    difficulty: Difficulty
    soundEnabled: boolean
  }
}

export type GameControlsProps = {
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onToggleAI?: () => void
  isPaused: boolean
  isAIEnabled?: boolean
  gameState: GameState
  supportsAI: boolean
}

export type GameOverlayVariant = 'start' | 'pause' | 'game-over'

export type GameShellLayout = 'stacked' | 'side-by-side'
