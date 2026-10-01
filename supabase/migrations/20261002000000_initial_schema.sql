create type public.app_role as enum ('ADMIN', 'TRAINER', 'MEMBER');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.app_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  specialization text not null default '',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  member_code text not null unique,
  name text not null,
  phone text not null,
  email text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  trainer_id uuid references public.trainers (id) on delete set null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  duration_days integer not null check (duration_days > 0),
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete restrict,
  plan_id uuid not null references public.membership_plans (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  price numeric(12, 2) not null check (price >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  final_amount numeric(12, 2) not null check (final_amount >= 0),
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (discount <= price),
  check (final_amount = price - discount)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete restrict,
  membership_id uuid references public.memberships (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null check (method in ('CASH', 'BKASH', 'NAGAD', 'CARD', 'BANK', 'OTHER')),
  reference text,
  paid_at timestamptz not null default now(),
  status text not null default 'COMPLETED'
    check (status in ('PENDING', 'COMPLETED', 'REFUNDED', 'VOID')),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  manufacturer text not null,
  model text not null,
  serial_number text,
  location text not null,
  status text not null default 'DEMO' check (status in ('DEMO', 'ONLINE', 'OFFLINE')),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.attendance_method as enum ('QR', 'MANUAL', 'MOBILE', 'ZKTECO');
create type public.attendance_event_type as enum ('CHECK_IN', 'CHECK_OUT');

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete restrict,
  device_id uuid references public.devices (id) on delete set null,
  method public.attendance_method not null,
  event_type public.attendance_event_type not null default 'CHECK_IN',
  check_in_at timestamptz not null default now(),
  check_out_at timestamptz,
  status text not null default 'SUCCESS' check (status in ('SUCCESS', 'REJECTED')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (check_out_at is null or check_out_at >= check_in_at),
  check (
    (event_type = 'CHECK_IN' and check_out_at is null)
    or (event_type = 'CHECK_OUT' and check_out_at is not null)
  )
);

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete restrict,
  name text not null,
  description text,
  start_date date not null,
  end_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  name text not null,
  sets integer not null check (sets > 0),
  reps text not null,
  weight numeric(8, 2) check (weight is null or weight >= 0),
  notes text,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  unique (workout_plan_id, order_index)
);

create index members_trainer_id_idx on public.members (trainer_id);
create index memberships_member_dates_idx on public.memberships (member_id, start_date desc, end_date desc);
create index payments_member_paid_at_idx on public.payments (member_id, paid_at desc);
create index attendance_member_check_in_idx on public.attendance (member_id, check_in_at desc);
create unique index attendance_one_open_session_per_member_idx
  on public.attendance (member_id)
  where event_type = 'CHECK_IN' and check_out_at is null and status = 'SUCCESS';
create index workout_plans_member_idx on public.workout_plans (member_id, start_date desc);
create index workout_plans_trainer_idx on public.workout_plans (trainer_id, start_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    'MEMBER'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trainers_set_updated_at before update on public.trainers
  for each row execute function public.set_updated_at();
create trigger members_set_updated_at before update on public.members
  for each row execute function public.set_updated_at();
create trigger membership_plans_set_updated_at before update on public.membership_plans
  for each row execute function public.set_updated_at();
create trigger memberships_set_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();
create trigger devices_set_updated_at before update on public.devices
  for each row execute function public.set_updated_at();
create trigger workout_plans_set_updated_at before update on public.workout_plans
  for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles as p where p.id = (select auth.uid())
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_app_role() = 'ADMIN'::public.app_role, false)
$$;

create or replace function public.current_trainer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.id from public.trainers as t where t.profile_id = (select auth.uid())
$$;

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.id from public.members as m where m.profile_id = (select auth.uid())
$$;

create or replace function public.is_assigned_trainer_for_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.members as m
    where m.id = target_member_id
      and m.trainer_id = public.current_trainer_id()
  )
$$;

create or replace function public.can_access_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1
    from public.members as m
    where m.id = target_member_id
      and (m.profile_id = (select auth.uid()) or m.trainer_id = public.current_trainer_id())
  )
$$;

create or replace function public.can_access_workout_plan(target_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1
    from public.workout_plans as wp
    where wp.id = target_plan_id
      and (wp.member_id = public.current_member_id() or wp.trainer_id = public.current_trainer_id())
  )
$$;

revoke all on function public.current_app_role() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.current_trainer_id() from public, anon;
revoke all on function public.current_member_id() from public, anon;
revoke all on function public.is_assigned_trainer_for_member(uuid) from public, anon;
revoke all on function public.can_access_member(uuid) from public, anon;
revoke all on function public.can_access_workout_plan(uuid) from public, anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_trainer_id() to authenticated;
grant execute on function public.current_member_id() to authenticated;
grant execute on function public.is_assigned_trainer_for_member(uuid) to authenticated;
grant execute on function public.can_access_member(uuid) to authenticated;
grant execute on function public.can_access_workout_plan(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.trainers enable row level security;
alter table public.members enable row level security;
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;
alter table public.payments enable row level security;
alter table public.devices enable row level security;
alter table public.attendance enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_exercises enable row level security;

revoke all on public.profiles, public.trainers, public.members,
  public.membership_plans, public.memberships, public.payments,
  public.devices, public.attendance, public.workout_plans,
  public.workout_exercises from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.trainers, public.members,
  public.membership_plans, public.memberships, public.payments,
  public.devices, public.workout_plans, public.workout_exercises to authenticated;
grant select, insert, update on public.attendance to authenticated;

create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy trainers_select_related on public.trainers
  for select to authenticated
  using (
    (select public.is_admin())
    or profile_id = (select auth.uid())
    or exists (
      select 1 from public.members as m
      where m.trainer_id = trainers.id and m.profile_id = (select auth.uid())
    )
  );
create policy trainers_admin_manage on public.trainers
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy members_select_related on public.members
  for select to authenticated
  using (
    (select public.is_admin())
    or profile_id = (select auth.uid())
    or trainer_id = (select public.current_trainer_id())
  );
create policy members_admin_manage on public.members
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy membership_plans_read_active on public.membership_plans
  for select to authenticated
  using (status = 'ACTIVE' or (select public.is_admin()));
create policy membership_plans_admin_manage on public.membership_plans
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy memberships_select_related on public.memberships
  for select to authenticated
  using ((select public.can_access_member(member_id)));
create policy memberships_admin_manage on public.memberships
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy payments_select_related on public.payments
  for select to authenticated
  using (
    (select public.is_admin())
    or member_id = (select public.current_member_id())
  );
create policy payments_admin_manage on public.payments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy devices_authenticated_read on public.devices
  for select to authenticated
  using (true);
create policy devices_admin_manage on public.devices
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy attendance_select_related on public.attendance
  for select to authenticated
  using ((select public.can_access_member(member_id)));
create policy attendance_admin_insert on public.attendance
  for insert to authenticated
  with check ((select public.is_admin()));
create policy attendance_admin_update on public.attendance
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy workout_plans_select_related on public.workout_plans
  for select to authenticated
  using (
    (select public.is_admin())
    or trainer_id = (select public.current_trainer_id())
    or member_id = (select public.current_member_id())
  );
create policy workout_plans_admin_manage on public.workout_plans
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy workout_plans_trainer_manage on public.workout_plans
  for all to authenticated
  using (
    trainer_id = (select public.current_trainer_id())
    and (select public.is_assigned_trainer_for_member(member_id))
  )
  with check (
    trainer_id = (select public.current_trainer_id())
    and (select public.is_assigned_trainer_for_member(member_id))
  );

create policy workout_exercises_select_related on public.workout_exercises
  for select to authenticated
  using ((select public.can_access_workout_plan(workout_plan_id)));
create policy workout_exercises_admin_manage on public.workout_exercises
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy workout_exercises_trainer_manage on public.workout_exercises
  for all to authenticated
  using (
    exists (
      select 1 from public.workout_plans as wp
      where wp.id = workout_plan_id
        and wp.trainer_id = (select public.current_trainer_id())
        and (select public.is_assigned_trainer_for_member(wp.member_id))
    )
  )
  with check (
    exists (
      select 1 from public.workout_plans as wp
      where wp.id = workout_plan_id
        and wp.trainer_id = (select public.current_trainer_id())
        and (select public.is_assigned_trainer_for_member(wp.member_id))
    )
  );