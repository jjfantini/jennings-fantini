import type { GameConfig } from '@/app/games/_types/game.types'

export const gameConfigs: GameConfig[] = [
  {
    slug: 'snake',
    title: 'Snake',
    description: 'Control the snake, eat the food, and avoid hitting the walls or yourself!',
    color: 'from-emerald-500 to-green-600',
    supportsAI: true,
    controls: {
      keyboard: {
        Move: 'Arrow keys / WASD',
        Pause: 'Space',
        Restart: 'R'
      },
      touch: ['Swipe to move', 'Double tap to pause']
    }
  },
  {
    slug: 'tetris',
    title: 'Tetris',
    description: 'Stack falling tetriminos and clear lines to score points in this classic puzzle game!',
    color: 'from-violet-500 to-purple-600',
    supportsAI: true,
    controls: {
      keyboard: {
        Move: 'Arrow keys / WASD',
        Rotate: 'Arrow up / W',
        SoftDrop: 'Arrow down / S',
        HardDrop: 'Space',
        Pause: 'P'
      },
      touch: ['Swipe left or right to move', 'Swipe up to rotate', 'Swipe down to drop', 'Double tap for hard drop']
    }
  }
]

export const gamesBySlug = gameConfigs.reduce<Record<string, GameConfig>>((acc, game) => {
  acc[game.slug] = game
  return acc
}, {})
