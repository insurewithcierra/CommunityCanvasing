-- Rate-limit storage for the `ai` edge function. Run once in the SQL Editor.
create table if not exists public.ai_usage (
  user_id uuid not null,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);
-- RLS on, no policies: only the edge function (security-definer fn / service role) touches it.
alter table public.ai_usage enable row level security;

create or replace function public.bump_ai_usage(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare c int;
begin
  insert into public.ai_usage (user_id, day, count)
  values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into c;
  return c;
end $$;

grant execute on function public.bump_ai_usage(uuid) to service_role;
