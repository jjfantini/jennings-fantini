import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/app/games/_lib/supabase'
import { TANK_GAME_CONFIG } from '@/app/games/_components/TankGame/tank.config'
import { createTerrain, getTankRestingPosition } from '@/app/games/_components/TankGame/TankTerrain'
import { simulateShot } from '@/app/games/_components/TankGame/TankPhysics'
import type { ShotResult, TankGameRow, TankLastAction, TankState } from '@/app/games/_components/TankGame/tank.types'

const PLAYER_ID_KEY = 'tank_player_id'
const LAST_ROOM_KEY = 'tank_last_room'

const createPlayerId = () => {
  const cryptoRef = globalThis.crypto
  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID()
  }
  if (cryptoRef?.getRandomValues) {
    const bytes = new Uint8Array(16)
    cryptoRef.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `local-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}

const createGameId = () => {
  const cryptoRef = globalThis.crypto
  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID()
  }
  if (cryptoRef?.getRandomValues) {
    const bytes = new Uint8Array(16)
    cryptoRef.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `game-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}

const getOrCreatePlayerId = () => {
  if (typeof window === 'undefined') {
    return ''
  }
  const existing = window.localStorage.getItem(PLAYER_ID_KEY)
  if (existing) {
    return existing
  }
  const created = createPlayerId()
  window.localStorage.setItem(PLAYER_ID_KEY, created)
  return created
}

const generateRoomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

const buildInitialTankState = (terrain: ReturnType<typeof createTerrain>, side: 'left' | 'right'): TankState => {
  const x = side === 'left' ? terrain.width * 0.2 : terrain.width * 0.8
  const position = getTankRestingPosition(terrain, x, TANK_GAME_CONFIG.tankSize)
  return {
    position,
    angle: side === 'left' ? 45 : 135,
    power: 60
  }
}

export const useTankMultiplayer = () => {
  const [game, setGame] = useState<TankGameRow | null>(null)
  const [playerId, setPlayerId] = useState<string>('')
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shot, setShot] = useState<ShotResult | null>(null)

  const previousGameRef = useRef<TankGameRow | null>(null)
  const lastFireRef = useRef<string | null>(null)
  const rematchSwitchRef = useRef<string | null>(null)

  useEffect(() => {
    setPlayerId(getOrCreatePlayerId())
  }, [])

  useEffect(() => {
    if (!game?.id) {
      return
    }
    const channel = supabase
      .channel(`tank-game:${game.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tank_games', filter: `id=eq.${game.id}` },
        (payload) => {
          const updatedGame = payload.new as TankGameRow
          const previousGame = previousGameRef.current
          const lastAction = updatedGame.last_action as TankLastAction

          if (
            previousGame &&
            lastAction.type === 'fire' &&
            lastAction.updated_at &&
            lastAction.updated_at !== lastFireRef.current
          ) {
            const simulation = simulateShot({
              terrain: previousGame.terrain,
              tank1: previousGame.tank1_position,
              tank2: previousGame.tank2_position,
              firingPlayer: lastAction.player,
              angleDeg: lastAction.angle,
              power: lastAction.power,
              player1Lives: previousGame.player1_lives,
              player2Lives: previousGame.player2_lives,
              config: {
                gravity: TANK_GAME_CONFIG.gravity,
                powerScale: TANK_GAME_CONFIG.powerScale,
                projectileRadius: TANK_GAME_CONFIG.projectileRadius,
                explosionRadius: TANK_GAME_CONFIG.explosionRadius,
                tankSize: TANK_GAME_CONFIG.tankSize,
                maxSteps: TANK_GAME_CONFIG.maxSteps,
                stepMs: TANK_GAME_CONFIG.stepMs
              }
            })
            setShot(simulation)
            lastFireRef.current = lastAction.updated_at
          }

          const mergedGame = previousGame
            ? {
                ...previousGame,
                ...updatedGame,
                terrain: updatedGame.terrain ?? previousGame.terrain,
                tank1_position: updatedGame.tank1_position ?? previousGame.tank1_position,
                tank2_position: updatedGame.tank2_position ?? previousGame.tank2_position,
                last_action: updatedGame.last_action ?? previousGame.last_action
              }
            : updatedGame

          previousGameRef.current = mergedGame
          setGame(mergedGame)

          if (
            updatedGame.id === game.id &&
            updatedGame.status === 'finished' &&
            updatedGame.rematch_game_id &&
            updatedGame.rematch_game_id !== rematchSwitchRef.current
          ) {
            rematchSwitchRef.current = updatedGame.rematch_game_id
            void (async () => {
              const { data: rematchGame, error: rematchError } = await supabase
                .from('tank_games')
                .select('*')
                .eq('id', updatedGame.rematch_game_id)
                .single()

              if (rematchError || !rematchGame) {
                setError(rematchError?.message ?? 'Failed to load rematch.')
                rematchSwitchRef.current = null
                return
              }

              const resolvedPlayerId = getOrCreatePlayerId()
              setPlayerId(resolvedPlayerId)
              const nextGame = rematchGame as TankGameRow
              previousGameRef.current = nextGame
              setGame(nextGame)
              setShot(null)
              const nextPlayerNumber =
                nextGame.player1_id === resolvedPlayerId ? 1 : nextGame.player2_id === resolvedPlayerId ? 2 : null
              setPlayerNumber(nextPlayerNumber)
              window.localStorage.setItem(LAST_ROOM_KEY, nextGame.room_code)
            })()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [game?.id])

  const createGame = useCallback(async () => {
    setError(null)
    const resolvedPlayerId = getOrCreatePlayerId()
    setPlayerId(resolvedPlayerId)

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const roomCode = generateRoomCode()
      const terrain = createTerrain({
        width: TANK_GAME_CONFIG.canvasWidth,
        height: TANK_GAME_CONFIG.canvasHeight,
        step: TANK_GAME_CONFIG.terrainStep,
        seed: roomCode
      })
      const tank1 = buildInitialTankState(terrain, 'left')
      const tank2 = buildInitialTankState(terrain, 'right')
      const { data, error: insertError } = await supabase
        .from('tank_games')
        .insert({
          room_code: roomCode,
          player1_id: resolvedPlayerId,
          player2_id: null,
          status: 'waiting',
          current_turn: 1,
          player1_lives: 3,
          player2_lives: 3,
          terrain,
          tank1_position: tank1,
          tank2_position: tank2,
          last_action: { type: 'none' },
          winner: null
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.message.toLowerCase().includes('duplicate')) {
          continue
        }
        setError(insertError.message)
        return null
      }

      window.localStorage.setItem(LAST_ROOM_KEY, roomCode)
      previousGameRef.current = data as TankGameRow
      setGame(data as TankGameRow)
      setPlayerNumber(1)
      return data as TankGameRow
    }

    setError('Failed to create a unique room code. Please try again.')
    return null
  }, [])

  const startRematch = useCallback(async () => {
    if (!game || game.status !== 'finished') {
      return null
    }

    if (!game.player2_id) {
      setError('Opponent has not joined yet.')
      return null
    }

    setError(null)
    const resolvedPlayerId = getOrCreatePlayerId()
    setPlayerId(resolvedPlayerId)

    if (game.rematch_game_id) {
      const { data: rematchGame, error: rematchError } = await supabase
        .from('tank_games')
        .select('*')
        .eq('id', game.rematch_game_id)
        .single()

      if (rematchError || !rematchGame) {
        setError(rematchError?.message ?? 'Failed to load rematch.')
        return null
      }

      const nextGame = rematchGame as TankGameRow
      previousGameRef.current = nextGame
      setGame(nextGame)
      setShot(null)
      const nextPlayerNumber =
        nextGame.player1_id === resolvedPlayerId ? 1 : nextGame.player2_id === resolvedPlayerId ? 2 : null
      setPlayerNumber(nextPlayerNumber)
      window.localStorage.setItem(LAST_ROOM_KEY, nextGame.room_code)
      return nextGame
    }

    const rematchId = createGameId()
    rematchSwitchRef.current = rematchId

    const { data: claimedGame, error: claimError } = await supabase
      .from('tank_games')
      .update({ rematch_game_id: rematchId })
      .eq('id', game.id)
      .is('rematch_game_id', null)
      .select()
      .single()

    if (claimError) {
      setError(claimError.message)
      rematchSwitchRef.current = null
      return null
    }

    if (!claimedGame) {
      const { data: latestGame } = await supabase.from('tank_games').select('rematch_game_id').eq('id', game.id).single()
      if (latestGame?.rematch_game_id) {
        const { data: rematchGame } = await supabase
          .from('tank_games')
          .select('*')
          .eq('id', latestGame.rematch_game_id)
          .single()
        if (rematchGame) {
          const nextGame = rematchGame as TankGameRow
          previousGameRef.current = nextGame
          setGame(nextGame)
          setShot(null)
          const nextPlayerNumber =
            nextGame.player1_id === resolvedPlayerId ? 1 : nextGame.player2_id === resolvedPlayerId ? 2 : null
          setPlayerNumber(nextPlayerNumber)
          window.localStorage.setItem(LAST_ROOM_KEY, nextGame.room_code)
          return nextGame
        }
      }
      setError('Rematch already started.')
      rematchSwitchRef.current = null
      return null
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const roomCode = generateRoomCode()
      const terrain = createTerrain({
        width: TANK_GAME_CONFIG.canvasWidth,
        height: TANK_GAME_CONFIG.canvasHeight,
        step: TANK_GAME_CONFIG.terrainStep,
        seed: roomCode
      })
      const tank1 = buildInitialTankState(terrain, 'left')
      const tank2 = buildInitialTankState(terrain, 'right')

      const { data: newGame, error: insertError } = await supabase
        .from('tank_games')
        .insert({
          id: rematchId,
          room_code: roomCode,
          player1_id: game.player1_id,
          player2_id: game.player2_id,
          status: 'playing',
          current_turn: 1,
          player1_lives: 3,
          player2_lives: 3,
          terrain,
          tank1_position: tank1,
          tank2_position: tank2,
          last_action: { type: 'none' },
          winner: null
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.message.toLowerCase().includes('duplicate')) {
          continue
        }
        await supabase.from('tank_games').update({ rematch_game_id: null }).eq('id', game.id).eq('rematch_game_id', rematchId)
        setError(insertError.message)
        rematchSwitchRef.current = null
        return null
      }

      const nextGame = newGame as TankGameRow
      previousGameRef.current = nextGame
      setGame(nextGame)
      setShot(null)
      const nextPlayerNumber =
        nextGame.player1_id === resolvedPlayerId ? 1 : nextGame.player2_id === resolvedPlayerId ? 2 : null
      setPlayerNumber(nextPlayerNumber)
      window.localStorage.setItem(LAST_ROOM_KEY, nextGame.room_code)
      return nextGame
    }

    await supabase.from('tank_games').update({ rematch_game_id: null }).eq('id', game.id).eq('rematch_game_id', rematchId)
    setError('Failed to create a unique room code. Please try again.')
    rematchSwitchRef.current = null
    return null
  }, [game])

  const joinGame = useCallback(async (roomCode: string) => {
    setError(null)
    const resolvedPlayerId = getOrCreatePlayerId()
    setPlayerId(resolvedPlayerId)

    const { data, error: selectError } = await supabase
      .from('tank_games')
      .select('*')
      .eq('room_code', roomCode)
      .single()

    if (selectError || !data) {
      setError('Room not found.')
      return null
    }

    const existing = data as TankGameRow

    if (existing.player1_id === resolvedPlayerId) {
      setPlayerNumber(1)
      setGame(existing)
      window.localStorage.setItem(LAST_ROOM_KEY, roomCode)
      return existing
    }

    if (existing.player2_id === resolvedPlayerId) {
      setPlayerNumber(2)
      setGame(existing)
      window.localStorage.setItem(LAST_ROOM_KEY, roomCode)
      return existing
    }

    if (existing.player2_id) {
      setError('Room is full.')
      return null
    }

    const { data: updated, error: updateError } = await supabase
      .from('tank_games')
      .update({
        player2_id: resolvedPlayerId,
        status: 'playing'
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError || !updated) {
      setError(updateError?.message ?? 'Failed to join the room.')
      return null
    }

    window.localStorage.setItem(LAST_ROOM_KEY, roomCode)
    previousGameRef.current = updated as TankGameRow
    setGame(updated as TankGameRow)
    setPlayerNumber(2)
    return updated as TankGameRow
  }, [])

  const updateAim = useCallback(
    async (angle: number, power: number) => {
      if (!game || !playerNumber) {
        return
      }

      const updatedAt = new Date().toISOString()
      const lastAction: TankLastAction = {
        type: 'aim',
        player: playerNumber,
        angle,
        power,
        updated_at: updatedAt
      }

      const tankKey = playerNumber === 1 ? 'tank1_position' : 'tank2_position'
      const tankState: TankState = {
        ...(playerNumber === 1 ? game.tank1_position : game.tank2_position),
        angle,
        power
      }

      await supabase
        .from('tank_games')
        .update({
          last_action: lastAction,
          [tankKey]: tankState
        })
        .eq('id', game.id)
    },
    [game, playerNumber]
  )

  const fire = useCallback(async () => {
    if (!game || !playerNumber || game.current_turn !== playerNumber || game.status !== 'playing') {
      return
    }

    const firingTank = playerNumber === 1 ? game.tank1_position : game.tank2_position
    const simulation = simulateShot({
      terrain: game.terrain,
      tank1: game.tank1_position,
      tank2: game.tank2_position,
      firingPlayer: playerNumber,
      angleDeg: firingTank.angle,
      power: firingTank.power,
      player1Lives: game.player1_lives,
      player2Lives: game.player2_lives,
      config: {
        gravity: TANK_GAME_CONFIG.gravity,
        powerScale: TANK_GAME_CONFIG.powerScale,
        projectileRadius: TANK_GAME_CONFIG.projectileRadius,
        explosionRadius: TANK_GAME_CONFIG.explosionRadius,
        tankSize: TANK_GAME_CONFIG.tankSize,
        maxSteps: TANK_GAME_CONFIG.maxSteps,
        stepMs: TANK_GAME_CONFIG.stepMs
      }
    })

    const updatedAt = new Date().toISOString()
    const nextTurn = playerNumber === 1 ? 2 : 1
    const winner =
      simulation.player1Lives === 0 ? 2 : simulation.player2Lives === 0 ? 1 : null

    setShot(simulation)
    lastFireRef.current = updatedAt

    await supabase
      .from('tank_games')
      .update({
        terrain: simulation.updatedTerrain,
        tank1_position: simulation.updatedTank1,
        tank2_position: simulation.updatedTank2,
        player1_lives: simulation.player1Lives,
        player2_lives: simulation.player2Lives,
        current_turn: winner ? game.current_turn : nextTurn,
        status: winner ? 'finished' : 'playing',
        winner,
        last_action: {
          type: 'fire',
          player: playerNumber,
          angle: firingTank.angle,
          power: firingTank.power,
          impact: simulation.impact,
          updated_at: updatedAt
        }
      })
      .eq('id', game.id)
      .eq('current_turn', playerNumber)
  }, [game, playerNumber])

  const resumeLastRoom = useCallback(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const roomCode = window.localStorage.getItem(LAST_ROOM_KEY)
    return roomCode
  }, [])

  const statusMessage = useMemo(() => {
    if (!game) {
      return 'Create or join a room to start.'
    }
    if (game.status === 'waiting') {
      return 'Waiting for opponent to join...'
    }
    if (game.status === 'finished') {
      return game.winner === playerNumber ? 'Victory.' : 'Defeat.'
    }
    if (game.current_turn === playerNumber) {
      return 'Your turn. Aim and fire.'
    }
    const lastAction = game.last_action as TankLastAction
    if (lastAction.type === 'aim' && lastAction.player !== playerNumber) {
      return 'Opponent is aiming...'
    }
    if (lastAction.type === 'fire' && lastAction.player !== playerNumber) {
      return 'Opponent fired. Waiting for your turn...'
    }
    return "Opponent's turn."
  }, [game, playerNumber])

  const opponentAim = useMemo(() => {
    if (!game) {
      return null
    }
    const lastAction = game.last_action as TankLastAction
    if (lastAction.type === 'aim' && lastAction.player !== playerNumber) {
      return { angle: lastAction.angle, power: lastAction.power }
    }
    return null
  }, [game, playerNumber])

  const roomCode = game?.room_code ?? ''

  return {
    game,
    playerId,
    playerNumber,
    roomCode,
    error,
    shot,
    statusMessage,
    opponentAim,
    createGame,
    startRematch,
    joinGame,
    updateAim,
    fire,
    resumeLastRoom,
    setShot
  }
}
