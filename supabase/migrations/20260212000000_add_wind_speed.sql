-- Add wind_speed to tank_games
-- Range -1 to 1: negative = wind blows left, positive = wind blows right
alter table public.tank_games add column if not exists wind_speed real not null default 0;
