-- Add tank_games to Realtime publication so clients receive row updates (e.g. when P2 joins, P1 sees status change)
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
