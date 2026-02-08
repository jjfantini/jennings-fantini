'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TankLobby } from '@/app/games/_components/TankGame/TankLobby'
import { TankHUD } from '@/app/games/_components/TankGame/TankHUD'
import { TankControls } from '@/app/games/_components/TankGame/TankControls'
import { TankCanvas } from '@/app/games/_components/TankGame/TankCanvas'
import { TANK_GAME_CONFIG } from '@/app/games/_components/TankGame/tank.config'
import { useTankMultiplayer } from '@/app/games/_components/TankGame/useTankMultiplayer'

const TankGame = () => {
  const {
    game,
    playerNumber,
    roomCode,
    error,
    shot,
    statusMessage,
    opponentAim,
    createGame,
    joinGame,
    updateAim,
    fire,
    resumeLastRoom
  } = useTankMultiplayer()

  const [angle, setAngle] = useState(45)
  const [power, setPower] = useState(60)

  useEffect(() => {
    if (!game || !playerNumber) {
      return
    }
    const tank = playerNumber === 1 ? game.tank1_position : game.tank2_position
    setAngle(tank.angle)
    setPower(tank.power)
  }, [game?.tank1_position, game?.tank2_position, playerNumber])

  useEffect(() => {
    if (!game || !playerNumber) {
      return
    }
    if (game.current_turn !== playerNumber || game.status !== 'playing') {
      return
    }
    const timeout = window.setTimeout(() => {
      updateAim(angle, power)
    }, 120)
    return () => window.clearTimeout(timeout)
  }, [angle, power, game, playerNumber, updateAim])

  const isReady = game && game.status !== 'waiting'
  const isMyTurn = game?.current_turn === playerNumber && game?.status === 'playing'
  const resumeCode = useMemo(() => resumeLastRoom(), [resumeLastRoom])

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <TankLobby
          onCreate={async () => {
            await createGame()
          }}
          onJoin={async (code) => {
            if (!code) {
              return
            }
            await joinGame(code)
          }}
          onResume={async (code) => {
            if (!code) {
              return
            }
            await joinGame(code)
          }}
          resumeCode={resumeCode ?? undefined}
          error={error}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        <div className="w-full lg:w-auto relative">
          <TankCanvas
            width={TANK_GAME_CONFIG.canvasWidth}
            height={TANK_GAME_CONFIG.canvasHeight}
            terrain={game.terrain}
            tank1={game.tank1_position}
            tank2={game.tank2_position}
            shot={shot}
            localAim={isMyTurn ? { angle, power } : null}
            opponentAim={opponentAim}
            localPlayer={playerNumber}
          />

          {game.status === 'finished' && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/70">
              <div className="rounded-xl border border-neutral-700 bg-neutral-900/90 px-6 py-4 text-center shadow-xl">
                <p className="text-sm uppercase tracking-wide text-neutral-400">Battle complete</p>
                <p className="text-2xl font-bold text-white">
                  {game.winner === playerNumber ? 'Victory' : 'Defeat'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[260px] flex flex-col gap-3">
          <TankHUD
            playerNumber={playerNumber}
            player1Lives={game.player1_lives}
            player2Lives={game.player2_lives}
            currentTurn={game.current_turn}
            statusMessage={statusMessage}
            roomCode={roomCode}
          />

          <TankControls
            angle={angle}
            power={power}
            onAngleChange={setAngle}
            onPowerChange={setPower}
            onFire={fire}
            disabled={!isMyTurn || !isReady}
          />

          {game.status === 'finished' && (
            <button
              type="button"
              onClick={async () => {
                await createGame()
              }}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-600"
            >
              Start new battle
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default TankGame
