-- Refined RLS policies
alter table public.users enable row level security;
alter table public.items enable row level security;

drop policy if exists "users can read self" on public.users;
create policy "users can read self" on public.users
  for select using (auth.uid() = id);

drop policy if exists "items owner select" on public.items;
create policy "items owner select" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "items owner write" on public.items;
create policy "items owner write" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.users from anon;
revoke all on public.items from anon;
grant select on public.users to authenticated;
grant select, insert, update, delete on public.items to authenticated;
