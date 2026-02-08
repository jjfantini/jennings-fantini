"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '@/app/games/_components/shared/GameShell'
import { MobileControls } from '@/app/games/_components/shared/MobileControls'
import { useGameState } from '@/app/games/_hooks/useGameState'
import { useGameStorage } from '@/app/games/_hooks/useGameStorage'
import { useTouchGestures } from '@/app/games/_hooks/useTouchGestures'
import { useIsMobile } from '@/lib/hooks/use-mobile-device'
import type { Difficulty, GameStatItem } from '@/app/games/_types/game.types'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const SPEEDS = {
  easy: 600,
  medium: 450,
  hard: 300
}

const getDifficultyByLevel = (level: number): keyof typeof SPEEDS => {
  if (level <= 1) return 'easy'
  if (level <= 3) return 'medium'
  return 'hard'
}

const TETRIMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-600'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
}

const tetriminoIdRef = { current: 0 }

type PlayerType = {
  pos: { x: number; y: number }
  tetrimino: {
    shape: number[][]
    color: string
  }
  name: string
  collided: boolean
  id: number
}

const randomTetrimino = () => {
  const keys = Object.keys(TETRIMINOS)
  const key = keys[Math.floor(Math.random() * keys.length)]
  const tetriminoType = TETRIMINOS[key as keyof typeof TETRIMINOS]
  const width = tetriminoType.shape[0].length

  tetriminoIdRef.current += 1

  return {
    pos: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(width / 2),
      y: 0
    },
    tetrimino: tetriminoType,
    name: key,
    collided: false,
    id: tetriminoIdRef.current
  }
}

const createEmptyBoard = () =>
  Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0))

type CellContent = string | number

const ControlItem = ({ keys, action }: { keys: string[]; action: string }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex gap-1">
      {keys.map(key => (
        <kbd
          key={key}
          className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-[10px]"
        >
          {key}
        </kbd>
      ))}
    </div>
    <span className="text-neutral-400">{action}</span>
  </div>
)

const TetrisGame: React.FC = () => {
  const { highScore, difficulty: storedDifficulty, saveSettings, updateHighScore } = useGameStorage('tetris')
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

  const [board, setBoard] = useState<CellContent[][]>(createEmptyBoard())
  const [player, setPlayer] = useState<PlayerType>(randomTetrimino())
  const [nextPlayer, setNextPlayer] = useState<PlayerType>(randomTetrimino())
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [aiActions, setAiActions] = useState<(() => void)[]>([])

  const isMobile = useIsMobile()
  const requestRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const dropTimeRef = useRef<number>(SPEEDS[difficulty])
  const accumulatedTimeRef = useRef<number>(0)
  const aiActionTimerRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [cellSize, setCellSize] = useState(isMobile ? 22 : 30)
  const [smallCellSize, setSmallCellSize] = useState(isMobile ? 14 : 20)

  useEffect(() => {
    const updateCellSize = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const screenHeight = window.innerHeight
      const maxCellWidth = Math.floor((containerWidth - 160) / BOARD_WIDTH)
      const maxCellHeight = Math.floor((screenHeight * 0.75) / BOARD_HEIGHT)
      const optimalCellSize = Math.min(maxCellWidth, maxCellHeight, isMobile ? 26 : 30)

      setCellSize(Math.max(optimalCellSize, 18))
      setSmallCellSize(Math.max(Math.floor(optimalCellSize * 0.65), 12))
    }

    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    return () => window.removeEventListener('resize', updateCellSize)
  }, [isMobile])

  useEffect(() => {
    setDifficulty(storedDifficulty)
    dropTimeRef.current = SPEEDS[storedDifficulty]
  }, [setDifficulty, storedDifficulty])

  const checkCollision = useCallback(
    (activePlayer: PlayerType, activeBoard: CellContent[][], { x: moveX, y: moveY } = { x: 0, y: 0 }) => {
      for (let y = 0; y < activePlayer.tetrimino.shape.length; y++) {
        for (let x = 0; x < activePlayer.tetrimino.shape[y].length; x++) {
          if (activePlayer.tetrimino.shape[y][x] !== 0) {
            const newY = y + activePlayer.pos.y + moveY
            const newX = x + activePlayer.pos.x + moveX
            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && activeBoard[newY][newX] !== 0)
            ) {
              return true
            }
          }
        }
      }
      return false
    },
    []
  )

  const placeTetrimino = useCallback(
    (activeBoard: CellContent[][], tetrimino: { shape: number[][]; color: string }, pos: { x: number; y: number }) => {
      const newBoard = activeBoard.map(row => [...row])
      tetrimino.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 0) {
            const boardY = pos.y + dy
            const boardX = pos.x + dx
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = tetrimino.color
            }
          }
        })
      })
      return newBoard
    },
    []
  )

  const clearCompletedLines = useCallback((activeBoard: CellContent[][]) => {
    const newBoard: CellContent[][] = []
    let rowsCleared = 0
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (activeBoard[y].every(cell => cell !== 0)) {
        rowsCleared += 1
      } else {
        newBoard.push([...activeBoard[y]])
      }
    }
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }
    return { newBoard, rowsCleared }
  }, [])

  const calculateMetrics = useCallback((activeBoard: CellContent[][]) => {
    const heights = Array(BOARD_WIDTH).fill(BOARD_HEIGHT)
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (activeBoard[y][x] !== 0) {
          heights[x] = BOARD_HEIGHT - y
          break
        }
      }
    }
    const actualHeights = heights.map(h => (h < BOARD_HEIGHT ? h : 0))
    const aggregateHeight = actualHeights.reduce((sum, h) => sum + h, 0)
    let holes = 0
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let hasFilledAbove = false
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (activeBoard[y][x] !== 0) {
          hasFilledAbove = true
        } else if (hasFilledAbove) {
          holes += 1
        }
      }
    }
    let bumpiness = 0
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      bumpiness += Math.abs(actualHeights[x] - actualHeights[x + 1])
    }
    return { aggregateHeight, holes, bumpiness }
  }, [])

  const rotate = (matrix: number[][], dir: number) => {
    const rotatedTetrimino = matrix.map((_, index) => matrix.map(col => col[index]))
    if (dir > 0) return rotatedTetrimino.map(row => row.reverse())
    return rotatedTetrimino.reverse()
  }

  const findBestMove = useCallback(() => {
    let bestScore = -Infinity
    let bestMove = { rotation: 0, x: player.pos.x }
    const currentBoard = board
    const tetrimino = player.tetrimino
    const tetriminoName = player.name
    const maxRotations = tetriminoName === 'O' ? 1 : tetriminoName === 'I' || tetriminoName === 'S' || tetriminoName === 'Z' ? 2 : 4

    for (let rot = 0; rot < maxRotations; rot++) {
      let rotatedShape = [...tetrimino.shape]
      for (let r = 0; r < rot; r++) {
        rotatedShape = rotate(rotatedShape, 1)
      }
      const width = rotatedShape[0].length
      for (let x = -width + 1; x < BOARD_WIDTH; x++) {
        const tempPlayer = {
          ...player,
          tetrimino: { ...tetrimino, shape: rotatedShape },
          pos: { x, y: 0 }
        }
        if (checkCollision(tempPlayer, currentBoard, { x: 0, y: 0 })) continue

        let dropY = 0
        while (!checkCollision(tempPlayer, currentBoard, { x: 0, y: dropY + 1 })) {
          dropY += 1
        }
        tempPlayer.pos.y = dropY

        const newBoard = placeTetrimino(currentBoard, tempPlayer.tetrimino, tempPlayer.pos)
        const { newBoard: sweptBoard, rowsCleared } = clearCompletedLines(newBoard)
        const { aggregateHeight, holes, bumpiness } = calculateMetrics(sweptBoard)

        const moveScore = 10 * rowsCleared + (rowsCleared === 4 ? 20 : 0) - 1 * aggregateHeight - 5 * holes - 1 * bumpiness
        if (moveScore > bestScore) {
          bestScore = moveScore
          bestMove = { rotation: rot, x }
        }
      }
    }
    return bestMove
  }, [player, board, checkCollision, placeTetrimino, clearCompletedLines, calculateMetrics])

  const updatePlayerPos = useCallback(
    ({ x, y, collided = false }: { x: number; y: number; collided?: boolean }) => {
      if (!isPlaying || isPaused) return
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + x, y: prev.pos.y + y },
        collided
      }))
    },
    [isPaused, isPlaying]
  )

  const playerRotate = useCallback(
    (activeBoard: CellContent[][], dir: number) => {
      if (!isPlaying || isPaused) return
      const clonedPlayer = JSON.parse(JSON.stringify(player)) as PlayerType
      clonedPlayer.tetrimino.shape = rotate(clonedPlayer.tetrimino.shape, dir)

      const pos = clonedPlayer.pos.x
      let offset = 1
      while (checkCollision(clonedPlayer, activeBoard)) {
        clonedPlayer.pos.x += offset
        offset = -(offset + (offset > 0 ? 1 : -1))
        if (offset > clonedPlayer.tetrimino.shape[0].length) {
          rotate(clonedPlayer.tetrimino.shape, -dir)
          clonedPlayer.pos.x = pos
          return
        }
      }

      setPlayer(clonedPlayer)
    },
    [checkCollision, isPaused, isPlaying, player]
  )

  const sweepRows = useCallback(
    (newBoard: CellContent[][]) => {
      let rowsCleared = 0
      const sweepedBoard = newBoard.reduce((acc, row) => {
        if (row.findIndex(cell => cell === 0) === -1) {
          rowsCleared += 1
          acc.unshift(new Array(newBoard[0].length).fill(0))
          return acc
        }
        acc.push(row)
        return acc
      }, [] as CellContent[][])

      if (rowsCleared > 0) {
        const points = [0, 40, 100, 300, 1200][rowsCleared] * level
        setScore(prev => prev + points)
        setLines(prev => {
          const newLines = prev + rowsCleared
          const newLevel = Math.floor(newLines / 10) + 1
          if (newLevel > level) {
            setLevel(newLevel)
            dropTimeRef.current = SPEEDS[getDifficultyByLevel(newLevel)]
            accumulatedTimeRef.current = 0
          }
          return newLines
        })
      }

      return sweepedBoard
    },
    [level, setScore]
  )

  const drop = useCallback(() => {
    if (!isPlaying || isPaused) return
    if (lines >= level * 10) {
      setLevel(prev => prev + 1)
      dropTimeRef.current = SPEEDS[getDifficultyByLevel(level + 1)]
    }

    if (checkCollision(player, board, { x: 0, y: 1 })) {
      if (player.pos.y <= 0) {
        let topCollision = false
        player.tetrimino.shape.forEach((row, y) => {
          row.forEach(cell => {
            if (cell !== 0 && y + player.pos.y <= 0) {
              topCollision = true
            }
          })
        })
        if (topCollision) {
          endGame(score)
          return
        }
      }
      setPlayer(prev => ({
        ...prev,
        collided: true
      }))
    } else {
      updatePlayerPos({ x: 0, y: 1, collided: false })
    }
  }, [board, checkCollision, endGame, isPaused, isPlaying, level, lines, player, score, updatePlayerPos])

  const dropPlayer = useCallback(() => {
    if (!isPlaying || isPaused) return
    drop()
  }, [drop, isPaused, isPlaying])

  const hardDrop = useCallback(() => {
    if (!isPlaying || isPaused) return
    let newY = player.pos.y
    while (!checkCollision(player, board, { x: 0, y: newY - player.pos.y + 1 })) {
      newY += 1
    }
    updatePlayerPos({ x: 0, y: newY - player.pos.y, collided: true })
  }, [board, checkCollision, isPaused, isPlaying, player, updatePlayerPos])

  const movePlayer = useCallback(
    (dir: number) => {
      if (!isPlaying || isPaused) return
      if (!checkCollision(player, board, { x: dir, y: 0 })) {
        updatePlayerPos({ x: dir, y: 0 })
      }
    },
    [board, checkCollision, isPaused, isPlaying, player, updatePlayerPos]
  )

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isAiEnabled) return

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault()
      }

      if (event.code === 'KeyP') {
        if (isPaused) resumeGame()
        else pauseGame()
        return
      }

      if (!isPlaying || isPaused) return

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(-1)
          break
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(1)
          break
        case 'ArrowDown':
        case 'KeyS':
          dropPlayer()
          break
        case 'ArrowUp':
        case 'KeyW':
          playerRotate(board, 1)
          break
        case 'Space':
          hardDrop()
          break
        default:
          break
      }
    },
    [board, dropPlayer, hardDrop, isAiEnabled, isPaused, isPlaying, movePlayer, pauseGame, playerRotate, resumeGame]
  )

  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures({
    onSwipeLeft: () => movePlayer(-1),
    onSwipeRight: () => movePlayer(1),
    onSwipeDown: () => dropPlayer(),
    onSwipeUp: () => playerRotate(board, 1),
    onTap: () => playerRotate(board, 1),
    onDoubleTap: () => hardDrop()
  })

  const selectDifficulty = useCallback(
    (selectedDifficulty: Difficulty) => {
      setDifficulty(selectedDifficulty)
      saveSettings(selectedDifficulty)
      dropTimeRef.current = SPEEDS[selectedDifficulty]
    },
    [saveSettings, setDifficulty]
  )

  const startNewGame = useCallback(
    (selectedDifficulty: Difficulty) => {
      setBoard(createEmptyBoard())
      setPlayer(randomTetrimino())
      setNextPlayer(randomTetrimino())
      setScore(0)
      setLines(0)
      setLevel(1)
      setDifficulty(selectedDifficulty)
      saveSettings(selectedDifficulty)
      dropTimeRef.current = SPEEDS[selectedDifficulty]
      accumulatedTimeRef.current = 0
      startGame()
    },
    [saveSettings, setDifficulty, setScore, startGame]
  )

  const resetToIdle = useCallback(() => {
    resetGame()
    setBoard(createEmptyBoard())
    setPlayer(randomTetrimino())
    setNextPlayer(randomTetrimino())
    setLines(0)
    setLevel(1)
    accumulatedTimeRef.current = 0
  }, [resetGame])

  const gameLoop = useCallback(
    (time = 0) => {
      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      if (isPlaying && !isPaused) {
        if (isAiEnabled && aiActions.length > 0) {
          aiActionTimerRef.current += deltaTime
          const AI_ACTION_INTERVAL = 100
          if (aiActionTimerRef.current >= AI_ACTION_INTERVAL) {
            const action = aiActions[0]
            action()
            setAiActions(prev => prev.slice(1))
            aiActionTimerRef.current = 0
          }
        } else {
          accumulatedTimeRef.current += deltaTime
          if (accumulatedTimeRef.current >= dropTimeRef.current) {
            drop()
            accumulatedTimeRef.current = 0
          }
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop)
    },
    [aiActions, drop, isAiEnabled, isPaused, isPlaying]
  )

  useEffect(() => {
    if (player.collided) {
      const newBoard = [...board]
      player.tetrimino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const boardY = y + player.pos.y
            const boardX = x + player.pos.x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = player.tetrimino.color
            }
          }
        })
      })

      const sweptBoard = sweepRows(newBoard)
      setBoard(sweptBoard)
      setPlayer(nextPlayer)
      setNextPlayer(randomTetrimino())
    }
  }, [board, nextPlayer, player, sweepRows])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  useEffect(() => {
    if (isAiEnabled && isPlaying && !isPaused) {
      const bestMove = findBestMove()
      if (bestMove) {
        const actions: (() => void)[] = []
        for (let i = 0; i < bestMove.rotation; i++) {
          actions.push(() => playerRotate(board, 1))
        }
        const dx = bestMove.x - player.pos.x
        if (dx > 0) {
          for (let i = 0; i < dx; i++) actions.push(() => movePlayer(1))
        } else if (dx < 0) {
          for (let i = 0; i < -dx; i++) actions.push(() => movePlayer(-1))
        }
        actions.push(hardDrop)
        setAiActions(actions)
      }
    }
  }, [board, findBestMove, hardDrop, isAiEnabled, isPaused, isPlaying, movePlayer, player.pos.x, playerRotate])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop)
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [gameLoop])

  const cellStyle = useMemo(
    () => ({
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      border: '1px solid #404040'
    }),
    [cellSize]
  )

  const smallCellStyle = useMemo(
    () => ({
      width: `${smallCellSize}px`,
      height: `${smallCellSize}px`
    }),
    [smallCellSize]
  )

  const renderBoard = () => {
    const boardCopy = board.map(row => [...row])
    player.tetrimino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const boardY = y + player.pos.y
          const boardX = x + player.pos.x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            boardCopy[boardY][boardX] = player.tetrimino.color
          }
        }
      })
    })
    return boardCopy.map((row, y) =>
      row.map((cell, x) => (
        <div key={`${y}-${x}`} className={typeof cell === 'string' ? cell : 'bg-transparent'} style={cellStyle} />
      ))
    )
  }

  const renderNextPiece = () =>
    nextPlayer.tetrimino.shape.map((row, y) =>
      row.map((cell, x) => (
        <div
          key={`next-${y}-${x}`}
          className={cell !== 0 ? nextPlayer.tetrimino.color : 'bg-transparent'}
          style={smallCellStyle}
        />
      ))
    )

  const boardContainerStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${cellSize}px)`,
      width: `${BOARD_WIDTH * cellSize}px`,
      height: `${BOARD_HEIGHT * cellSize}px`
    }),
    [cellSize]
  )

  const nextPieceContainerStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${nextPlayer.tetrimino.shape[0].length}, ${smallCellSize}px)`,
      gap: '2px',
      padding: '4px',
      backgroundColor: '#171717',
      justifyContent: 'center'
    }),
    [nextPlayer.tetrimino.shape, smallCellSize]
  )

  const stats: GameStatItem[] = [
    { label: 'Score', value: score },
    { label: 'Level', value: level },
    { label: 'Lines', value: lines },
    { label: 'High', value: highScore }
  ]

  const controlsInfo = (
    <div>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Controls</h3>
      <div className="space-y-2">
        {isMobile ? (
          <>
            <ControlItem keys={['Tap', 'Swipe ↑']} action="Rotate" />
            <ControlItem keys={['Swipe ←']} action="Move Left" />
            <ControlItem keys={['Swipe →']} action="Move Right" />
            <ControlItem keys={['Swipe ↓']} action="Soft Drop" />
            <ControlItem keys={['Double Tap']} action="Hard Drop" />
          </>
        ) : (
          <>
            <ControlItem keys={['←', '→', 'A', 'D']} action="Move" />
            <ControlItem keys={['↑', 'W']} action="Rotate" />
            <ControlItem keys={['↓', 'S']} action="Soft Drop" />
            <ControlItem keys={['Space']} action="Hard Drop" />
            <ControlItem keys={['P']} action="Pause" />
          </>
        )}
      </div>
      {isAiEnabled && (
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">AI Active</span>
        </div>
      )}
    </div>
  )

  const sidePanel = (
    <div>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 text-center">
        Next Piece
      </h3>
      <div className="flex justify-center p-2 bg-neutral-950 rounded-lg">
        <div style={nextPieceContainerStyle}>{renderNextPiece()}</div>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="w-full">
      <GameShell
        stats={stats}
        gameArea={
          <div
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={boardContainerStyle}
          >
            {renderBoard()}
          </div>
        }
        sidePanel={sidePanel}
        controlsInfo={controlsInfo}
        mobileControls={
          <MobileControls
            onUp={() => playerRotate(board, 1)}
            onDown={dropPlayer}
            onLeft={() => movePlayer(-1)}
            onRight={() => movePlayer(1)}
            onPrimary={hardDrop}
            primaryLabel="Hard Drop"
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
          description: 'Choose a pace before you start.',
          primaryActionLabel: 'Start',
          onPrimaryAction: () => startNewGame(difficulty)
        }}
        pauseOverlay={{
          title: 'Paused',
          description: 'Ready to keep stacking?',
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

export default TetrisGame