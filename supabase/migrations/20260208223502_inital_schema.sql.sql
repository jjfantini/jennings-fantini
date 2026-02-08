create type "public"."tank_game_status" as enum ('waiting', 'playing', 'finished');


  create table "public"."tank_games" (
    "id" uuid not null default gen_random_uuid(),
    "room_code" text not null,
    "player1_id" text not null,
    "player2_id" text,
    "status" public.tank_game_status not null default 'waiting'::public.tank_game_status,
    "current_turn" integer not null default 1,
    "player1_lives" integer not null default 3,
    "player2_lives" integer not null default 3,
    "terrain" jsonb not null,
    "tank1_position" jsonb not null,
    "tank2_position" jsonb not null,
    "last_action" jsonb not null default '{}'::jsonb,
    "winner" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."tank_games" enable row level security;

CREATE UNIQUE INDEX tank_games_pkey ON public.tank_games USING btree (id);

CREATE INDEX tank_games_room_code_idx ON public.tank_games USING btree (room_code);

CREATE UNIQUE INDEX tank_games_room_code_key ON public.tank_games USING btree (room_code);

CREATE INDEX tank_games_status_idx ON public.tank_games USING btree (status);

alter table "public"."tank_games" add constraint "tank_games_pkey" PRIMARY KEY using index "tank_games_pkey";

alter table "public"."tank_games" add constraint "tank_games_room_code_key" UNIQUE using index "tank_games_room_code_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."tank_games" to "anon";

grant insert on table "public"."tank_games" to "anon";

grant references on table "public"."tank_games" to "anon";

grant select on table "public"."tank_games" to "anon";

grant trigger on table "public"."tank_games" to "anon";

grant truncate on table "public"."tank_games" to "anon";

grant update on table "public"."tank_games" to "anon";

grant delete on table "public"."tank_games" to "authenticated";

grant insert on table "public"."tank_games" to "authenticated";

grant references on table "public"."tank_games" to "authenticated";

grant select on table "public"."tank_games" to "authenticated";

grant trigger on table "public"."tank_games" to "authenticated";

grant truncate on table "public"."tank_games" to "authenticated";

grant update on table "public"."tank_games" to "authenticated";

grant delete on table "public"."tank_games" to "service_role";

grant insert on table "public"."tank_games" to "service_role";

grant references on table "public"."tank_games" to "service_role";

grant select on table "public"."tank_games" to "service_role";

grant trigger on table "public"."tank_games" to "service_role";

grant truncate on table "public"."tank_games" to "service_role";

grant update on table "public"."tank_games" to "service_role";


  create policy "tank_games_insert"
  on "public"."tank_games"
  as permissive
  for insert
  to public
with check (true);



  create policy "tank_games_select"
  on "public"."tank_games"
  as permissive
  for select
  to public
using (true);



  create policy "tank_games_update"
  on "public"."tank_games"
  as permissive
  for update
  to public
using (true)
with check (true);


CREATE TRIGGER set_tank_games_updated_at BEFORE UPDATE ON public.tank_games FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


