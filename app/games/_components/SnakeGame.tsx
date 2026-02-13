"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { GameShell } from '@/app/games/_components/shared/GameShell'
import { MobileControls } from '@/app/games/_components/shared/MobileControls'
import { useGameState } from '@/app/games/_hooks/useGameState'
import { useGameStorage } from '@/app/games/_hooks/useGameStorage'
import { useTouchGestures } from '@/app/games/_hooks/useTouchGestures'
import type { Difficulty, GameStatItem } from '@/app/games/_types/game.types'

type Position = {
  x: number
  y: number
}

type RenderPosition = {
  x: number
  y: number
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const GRID_SIZE = 20
const CELL_SIZE_DESKTOP = 20
const CELL_SIZE_MOBILE = 16
const SPEEDS = {
  easy: 150,
  medium: 120,
  hard: 80
}

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

const KEYCODES = {
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  PAUSE: ['Space', 'KeyP'],
  RESTART: ['KeyR', 'Enter']
}

const ControlItem = ({ keys, action }: { keys: string[]; action: string }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex gap-1 flex-wrap">
      {keys.map(key => (
        <kbd
          key={key}
          className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-[10px]"
        >
          {key}
        </kbd>
      ))}
    </div>
    <span className="text-neutral-400 ml-2">{action}</span>
  </div>
)

const COLORS = {
  light: {
    background: '#f5f5f5',
    grid: '#e5e5e5',
    snakeHead: '#10b981',
    snakeBody: '#34d399',
    food: '#f43f5e',
    border: '#d4d4d4'
  },
  dark: {
    background: '#171717',
    grid: '#262626',
    snakeHead: '#34d399',
    snakeBody: '#10b981',
    food: '#fb7185',
    border: '#404040'
  }
}

export default function SnakeGame() {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'
  const colors = isDarkMode ? COLORS.dark : COLORS.light

  const { highScore, difficulty: storedDifficulty, saveSettings, updateHighScore } = useGameStorage('snake')
  const {
    gameState,
    score,
    setScore,
    difficulty,
    setDifficulty,
    isPaused,
    isPlaying,
    isGameOver,
    isAiEnabled,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    endGame,
    toggleAi
  } = useGameState({
    initialDifficulty: storedDifficulty,
    onGameOver: finalScore => updateHighScore(finalScore)
  })

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastRenderTimeRef = useRef<number>(0)
  const lastMoveTimeRef = useRef<number>(0)
  const motionTrailRef = useRef<RenderPosition[]>([])

  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT')
  const [cellSize, setCellSize] = useState<number>(CELL_SIZE_DESKTOP)
  const [prevSnake, setPrevSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [animationProgress, setAnimationProgress] = useState<number>(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCellSize(CELL_SIZE_MOBILE)
      } else {
        setCellSize(CELL_SIZE_DESKTOP)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setDifficulty(storedDifficulty)
  }, [setDifficulty, storedDifficulty])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = GRID_SIZE * cellSize
    canvas.height = GRID_SIZE * cellSize
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [cellSize, colors])

  const generateFood = useCallback((activeSnake: Position[]): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    const isOnSnake = activeSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    if (isOnSnake) {
      return generateFood(activeSnake)
    }
    return newFood
  }, [])

  const checkCollision = useCallback((position: Position, activeSnake: Position[]): boolean => {
    if (position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE) {
      return true
    }
    return activeSnake.some(segment => segment.x === position.x && segment.y === position.y)
  }, [])

  const generateSmoothPath = useCallback((points: RenderPosition[]): RenderPosition[] => {
    if (points.length < 3) return points
    const smoothedPath: RenderPosition[] = []
    smoothedPath.push(points[0])
    const tensionFactor = 0.3
    const steps = 5
    for (let i = 1; i < points.length - 1; i++) {
      const prevPoint = points[i - 1]
      const currentPoint = points[i]
      const nextPoint = points[i + 1]
      for (let t = 0; t < 1; t += 1 / steps) {
        const h1 = 2 * t * t * t - 3 * t * t + 1
        const h2 = -2 * t * t * t + 3 * t * t
        const h3 = t * t * t - 2 * t * t + t
        const h4 = t * t * t - t * t
        const tangent1X = tensionFactor * (nextPoint.x - prevPoint.x)
        const tangent1Y = tensionFactor * (nextPoint.y - prevPoint.y)
        const tangent2X = tensionFactor * (nextPoint.x - prevPoint.x)
        const tangent2Y = tensionFactor * (nextPoint.y - prevPoint.y)
        const x = h1 * currentPoint.x + h2 * nextPoint.x + h3 * tangent1X + h4 * tangent2X
        const y = h1 * currentPoint.y + h2 * nextPoint.y + h3 * tangent1Y + h4 * tangent2Y
        smoothedPath.push({ x, y })
      }
    }
    smoothedPath.push(points[points.length - 1])
    return smoothedPath
  }, [])

  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const isOppositeDirection = (next: Direction, current: Direction) => {
    return (
      (next === 'UP' && current === 'DOWN') ||
      (next === 'DOWN' && current === 'UP') ||
      (next === 'LEFT' && current === 'RIGHT') ||
      (next === 'RIGHT' && current === 'LEFT')
    )
  }

  const findAiDirection = useCallback(
    (activeSnake: Position[], activeFood: Position): Direction => {
      const head = activeSnake[0]
      const blocked = new Set(activeSnake.map(segment => `${segment.x},${segment.y}`))
      const queue: Position[] = [head]
      const visited = new Set([`${head.x},${head.y}`])
      const parent = new Map<string, string>()

      while (queue.length > 0) {
        const current = queue.shift()
        if (!current) break
        if (current.x === activeFood.x && current.y === activeFood.y) {
          break
        }
        const neighbors: Position[] = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 }
        ]
        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`
          if (neighbor.x < 0 || neighbor.x >= GRID_SIZE || neighbor.y < 0 || neighbor.y >= GRID_SIZE) continue
          if (blocked.has(key)) continue
          if (visited.has(key)) continue
          visited.add(key)
          parent.set(key, `${current.x},${current.y}`)
          queue.push(neighbor)
        }
      }

      const foodKey = `${activeFood.x},${activeFood.y}`
      if (parent.has(foodKey)) {
        let currentKey = foodKey
        let prevKey = parent.get(currentKey)
        while (prevKey && prevKey !== `${head.x},${head.y}`) {
          currentKey = prevKey
          prevKey = parent.get(currentKey)
        }
        const [nextX, nextY] = currentKey.split(',').map(Number)
        if (nextX > head.x) return 'RIGHT'
        if (nextX < head.x) return 'LEFT'
        if (nextY > head.y) return 'DOWN'
        return 'UP'
      }

      const fallbackDirections: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT']
      for (const dir of fallbackDirections) {
        const nextPos = {
          x: head.x + DIRECTIONS[dir].x,
          y: head.y + DIRECTIONS[dir].y
        }
        if (!checkCollision(nextPos, activeSnake)) return dir
      }

      return direction
    },
    [checkCollision, direction]
  )

  const selectDifficulty = useCallback(
    (selectedDifficulty: Difficulty) => {
      setDifficulty(selectedDifficulty)
      saveSettings(selectedDifficulty)
    },
    [saveSettings, setDifficulty]
  )

  const startNewGame = useCallback(
    (selectedDifficulty: Difficulty) => {
      const initialPos = { x: 10, y: 10 }
      setSnake([initialPos])
      setPrevSnake([initialPos])
      motionTrailRef.current = Array(16).fill({ x: 10, y: 10 })
      setFood(generateFood([initialPos]))
      setDirection('RIGHT')
      setNextDirection('RIGHT')
      setScore(0)
      setAnimationProgress(1)
      selectDifficulty(selectedDifficulty)
      startGame()
    },
    [generateFood, selectDifficulty, setScore, startGame]
  )

  const resetToIdle = useCallback(() => {
    resetGame()
    const initialPos = { x: 10, y: 10 }
    setSnake([initialPos])
    setPrevSnake([initialPos])
    motionTrailRef.current = Array(16).fill({ x: 10, y: 10 })
    setDirection('RIGHT')
    setNextDirection('RIGHT')
    setAnimationProgress(1)
  }, [resetGame])

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      setPrevSnake([...prevSnake])
      setAnimationProgress(0)
      lastMoveTimeRef.current = performance.now()

      const head = { ...prevSnake[0] }
      const currentDirection = DIRECTIONS[direction]
      const newHead = {
        x: head.x + currentDirection.x,
        y: head.y + currentDirection.y
      }

      if (checkCollision(newHead, prevSnake)) {
        endGame(score)
        return prevSnake
      }

      const hasEatenFood = newHead.x === food.x && newHead.y === food.y
      let newSnake: Position[]
      if (hasEatenFood) {
        newSnake = [newHead, ...prevSnake]
        setFood(generateFood(newSnake))
        setScore(prev => prev + 1)
      } else {
        newSnake = [newHead, ...prevSnake.slice(0, -1)]
      }

      motionTrailRef.current = [{ x: newHead.x, y: newHead.y }, ...motionTrailRef.current.slice(0, 15)]
      return newSnake
    })

    setDirection(nextDirection)
  }, [checkCollision, direction, endGame, food, generateFood, nextDirection, score, setScore])

  const drawGame = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 0.5
      for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      const foodX = food.x * cellSize + cellSize / 2
      const foodY = food.y * cellSize + cellSize / 2
      const pulseAmount = Math.sin(Date.now() * 0.002) * 0.1 + 1
      const foodRadius = (cellSize / 2) * 0.8 * pulseAmount
      const gradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodRadius * 1.5)
      gradient.addColorStop(0, colors.food)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(foodX, foodY, foodRadius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = colors.food
      ctx.beginPath()
      ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2)
      ctx.fill()

      const easedProgress = easeInOutCubic(progress)
      const interpolatedSnake: RenderPosition[] = []
      if (prevSnake.length > 0 && isPlaying) {
        const minLength = Math.min(snake.length, prevSnake.length)
        for (let i = 0; i < minLength; i++) {
          interpolatedSnake.push({
            x: prevSnake[i].x + (snake[i].x - prevSnake[i].x) * easedProgress,
            y: prevSnake[i].y + (snake[i].y - prevSnake[i].y) * easedProgress
          })
        }
        if (snake.length > prevSnake.length) {
          interpolatedSnake.push(
            ...snake.slice(prevSnake.length).map(pos => ({
              x: pos.x,
              y: pos.y
            }))
          )
        }
      } else {
        interpolatedSnake.push(...snake.map(pos => ({ x: pos.x, y: pos.y })))
      }

      const smoothPath = generateSmoothPath(interpolatedSnake)
      if (smoothPath.length > 1) {
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(smoothPath[0].x * cellSize + cellSize / 2, smoothPath[0].y * cellSize + cellSize / 2)
        for (let i = 1; i < smoothPath.length; i++) {
          const segment = smoothPath[i]
          ctx.lineTo(segment.x * cellSize + cellSize / 2, segment.y * cellSize + cellSize / 2)
        }
        ctx.strokeStyle = colors.snakeBody
        ctx.lineWidth = cellSize * 0.7
        ctx.stroke()

        if (motionTrailRef.current.length > 1 && isPlaying) {
          for (let i = 1; i < interpolatedSnake.length; i++) {
            const segment = interpolatedSnake[i]
            ctx.fillStyle = colors.snakeBody
            const distFromHead = i / interpolatedSnake.length
            const sizeVariation = 1 - distFromHead * 0.2
            const segmentRadius = cellSize * 0.4 * sizeVariation
            ctx.beginPath()
            ctx.arc(segment.x * cellSize + cellSize / 2, segment.y * cellSize + cellSize / 2, segmentRadius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      if (interpolatedSnake.length > 0) {
        const head = interpolatedSnake[0]
        const headX = head.x * cellSize + cellSize / 2
        const headY = head.y * cellSize + cellSize / 2
        const headRadius = (cellSize / 2) * 0.9
        const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headRadius * 1.3)
        headGlow.addColorStop(0, colors.snakeHead)
        headGlow.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.beginPath()
        ctx.fillStyle = headGlow
        ctx.arc(headX, headY, headRadius * 1.3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = colors.snakeHead
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2)
        ctx.fill()

        const eyeRadius = cellSize * 0.15
        const eyeOffset = cellSize * 0.2
        ctx.fillStyle = '#FFFFFF'
        let eyeX1: number
        let eyeY1: number
        let eyeX2: number
        let eyeY2: number

        if (direction === 'UP') {
          eyeX1 = headX - eyeOffset
          eyeY1 = headY - eyeOffset
          eyeX2 = headX + eyeOffset
          eyeY2 = headY - eyeOffset
        } else if (direction === 'DOWN') {
          eyeX1 = headX - eyeOffset
          eyeY1 = headY + eyeOffset
          eyeX2 = headX + eyeOffset
          eyeY2 = headY + eyeOffset
        } else if (direction === 'LEFT') {
          eyeX1 = headX - eyeOffset
          eyeY1 = headY - eyeOffset
          eyeX2 = headX - eyeOffset
          eyeY2 = headY + eyeOffset
        } else {
          eyeX1 = headX + eyeOffset
          eyeY1 = headY - eyeOffset
          eyeX2 = headX + eyeOffset
          eyeY2 = headY + eyeOffset
        }

        ctx.beginPath()
        ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2)
        ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(eyeX1, eyeY1, eyeRadius * 0.5, 0, Math.PI * 2)
        ctx.arc(eyeX2, eyeY2, eyeRadius * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.strokeStyle = colors.border
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
    },
    [cellSize, colors, direction, food, generateSmoothPath, isPlaying, prevSnake, snake]
  )

  const animationFrame = useCallback(
    (timestamp: number) => {
      if (!lastRenderTimeRef.current) {
        lastRenderTimeRef.current = timestamp
      }
      if (isPlaying && lastMoveTimeRef.current > 0) {
        const timeSinceLastMove = timestamp - lastMoveTimeRef.current
        const stepDuration = SPEEDS[difficulty]
        if (animationProgress < 1) {
          const newProgress = Math.min(timeSinceLastMove / stepDuration, 1)
          setAnimationProgress(newProgress)
        }
      }

      drawGame(animationProgress)
      gameLoopRef.current = requestAnimationFrame(animationFrame)
      lastRenderTimeRef.current = timestamp
    },
    [animationProgress, difficulty, drawGame, isPlaying]
  )

  useEffect(() => {
    if (!isPlaying) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    if (!gameLoopRef.current) {
      gameLoopRef.current = requestAnimationFrame(animationFrame)
    }

    const moveInterval = setInterval(() => {
      if (isAiEnabled) {
        const aiDirection = findAiDirection(snake, food)
        if (!isOppositeDirection(aiDirection, direction)) {
          setNextDirection(aiDirection)
        }
      }
      moveSnake()
    }, SPEEDS[difficulty])

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      clearInterval(moveInterval)
    }
  }, [animationFrame, difficulty, direction, findAiDirection, isAiEnabled, isPlaying, moveSnake, snake, food])

  useEffect(() => {
    drawGame(animationProgress)
  }, [drawGame, animationProgress, isDarkMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (KEYCODES.UP.includes(event.code) && direction !== 'DOWN') {
        setNextDirection('UP')
      } else if (KEYCODES.DOWN.includes(event.code) && direction !== 'UP') {
        setNextDirection('DOWN')
      } else if (KEYCODES.LEFT.includes(event.code) && direction !== 'RIGHT') {
        setNextDirection('LEFT')
      } else if (KEYCODES.RIGHT.includes(event.code) && direction !== 'LEFT') {
        setNextDirection('RIGHT')
      } else if (KEYCODES.PAUSE.includes(event.code)) {
        if (isPaused) resumeGame()
        else pauseGame()
      } else if (KEYCODES.RESTART.includes(event.code) && isGameOver) {
        startNewGame(difficulty)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [difficulty, direction, isGameOver, isPaused, pauseGame, resumeGame, startNewGame])

  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures({
    onSwipeUp: () => direction !== 'DOWN' && setNextDirection('UP'),
    onSwipeDown: () => direction !== 'UP' && setNextDirection('DOWN'),
    onSwipeLeft: () => direction !== 'RIGHT' && setNextDirection('LEFT'),
    onSwipeRight: () => direction !== 'LEFT' && setNextDirection('RIGHT'),
    onDoubleTap: () => {
      if (isPaused) resumeGame()
      else pauseGame()
    }
  })

  const stats: GameStatItem[] = [
    { label: 'Score', value: score },
    { label: 'Length', value: snake.length },
    { label: 'Speed', value: difficulty.toUpperCase() },
    { label: 'High', value: highScore }
  ]

  const controlsInfo = (
    <div>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Controls</h3>
      <div className="space-y-2">
        <ControlItem keys={['↑', '↓', '←', '→']} action="Move" />
        <ControlItem keys={['W', 'A', 'S', 'D']} action="Move" />
        <ControlItem keys={['Space']} action="Pause" />
        <ControlItem keys={['Swipe']} action="Move" />
        <ControlItem keys={['Double Tap']} action="Pause" />
      </div>
      {isAiEnabled && (
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">AI Active</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full text-neutral-900 dark:text-neutral-300">
      <GameShell
        stats={stats}
        gameArea={
          <div
            ref={gameAreaRef}
            className="relative"
            style={{
              width: `${GRID_SIZE * cellSize}px`,
              height: `${GRID_SIZE * cellSize}px`
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
        }
        controlsInfo={controlsInfo}
        mobileControls={
          <MobileControls
            onUp={() => direction !== 'DOWN' && setNextDirection('UP')}
            onDown={() => direction !== 'UP' && setNextDirection('DOWN')}
            onLeft={() => direction !== 'RIGHT' && setNextDirection('LEFT')}
            onRight={() => direction !== 'LEFT' && setNextDirection('RIGHT')}
            onPrimary={() => (isPaused ? resumeGame() : pauseGame())}
            primaryLabel={isPaused ? 'Resume' : 'Pause'}
          />
        }
        gameState={gameState}
        difficulty={difficulty}
        onDifficultySelect={selectDifficulty}
        controls={{
          onPause: pauseGame,
          onResume: resumeGame,
          onReset: resetToIdle,
          onToggleAI: toggleAi,
          isPaused,
          isAIEnabled: isAiEnabled,
          supportsAI: true
        }}
        startOverlay={{
          title: 'Select Difficulty',
          description: 'Swipe or use the arrow keys to move.',
          primaryActionLabel: 'Start',
          onPrimaryAction: () => startNewGame(difficulty)
        }}
        pauseOverlay={{
          title: 'Paused',
          description: 'Resume when you are ready.',
          primaryActionLabel: 'Resume',
          onPrimaryAction: resumeGame
        }}
        gameOverOverlay={{
          title: 'Game Over',
          description: `Final Score: ${score}`,
          primaryActionLabel: 'Play Again',
          onPrimaryAction: () => startNewGame(difficulty),
          secondaryActionLabel: 'Back',
          onSecondaryAction: resetToIdle
        }}
      />
    </div>
  )
}
