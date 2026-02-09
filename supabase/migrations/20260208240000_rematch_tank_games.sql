-- Add rematch link to tank games
alter table public.tank_games
  add column if not exists rematch_game_id uuid;
