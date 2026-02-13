export type TankVector = {
  x: number
  y: number
}

export type TerrainMap = {
  width: number
  height: number
  step: number
  heights: number[]
}

export type TankState = {
  position: TankVector
  angle: number
  power: number
}

export type TankGameStatus = 'waiting' | 'playing' | 'finished'

export type TankGameRow = {
  id: string
  room_code: string
  player1_id: string
  player2_id: string | null
  rematch_game_id?: string | null
  status: TankGameStatus
  current_turn: 1 | 2
  player1_lives: number
  player2_lives: number
  wind_speed?: number
  terrain: TerrainMap
  tank1_position: TankState
  tank2_position: TankState
  last_action: TankLastAction
  winner: 1 | 2 | null
  created_at: string
  updated_at: string
}

export type TankLastAction =
  | {
      type: 'aim'
      player: 1 | 2
      angle: number
      power: number
      updated_at: string
    }
  | {
      type: 'fire'
      player: 1 | 2
      angle: number
      power: number
      impact: TankVector | null
      updated_at: string
    }
  | {
      type: 'none'
    }

export type PathPoint = TankVector & { vx?: number; vy?: number }

export type ProjectilePath = PathPoint[]

export type ShotResult = {
  path: ProjectilePath
  impact: TankVector | null
  hitTank: 1 | 2 | null
  updatedTerrain: TerrainMap
  updatedTank1: TankState
  updatedTank2: TankState
  player1Lives: number
  player2Lives: number
}
