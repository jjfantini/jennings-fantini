-- Tank game schema and RLS policies

create extension if not exists "pgcrypto";

create type public.tank_game_status as enum ('waiting', 'playing', 'finished');

create table if not exists public.tank_games (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  player1_id text not null,
  player2_id text,
  status public.tank_game_status not null default 'waiting',
  current_turn int not null default 1,
  player1_lives int not null default 3,
  player2_lives int not null default 3,
  terrain jsonb not null,
  tank1_position jsonb not null,
  tank2_position jsonb not null,
  last_action jsonb not null default '{}'::jsonb,
  winner int,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists tank_games_room_code_idx on public.tank_games (room_code);
create index if not exists tank_games_status_idx on public.tank_games (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tank_games_updated_at on public.tank_games;
create trigger set_tank_games_updated_at
before update on public.tank_games
for each row execute function public.set_updated_at();

alter table public.tank_games enable row level security;

create policy "tank_games_select"
on public.tank_games
for select
using (true);

create policy "tank_games_insert"
on public.tank_games
for insert
with check (true);

create policy "tank_games_update"
on public.tank_games
for update
using (true)
with check (true);

-- Realtime: broadcast row changes so the other player sees status/state updates
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tank_games'
  ) then
    alter publication supabase_realtime add table public.tank_games;
  end if;
end
$$;
