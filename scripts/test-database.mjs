import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const adminId = "00000000-0000-4000-8000-000000000001";
const trainerId = "00000000-0000-4000-8000-000000000002";
const assignedMemberId = "00000000-0000-4000-8000-000000000003";
const otherMemberId = "00000000-0000-4000-8000-000000000004";

const database = new PGlite();

async function assumeAuthenticatedUser(profileId) {
  await database.query("reset role");
  await database.query("set role authenticated");
  await database.query(
    "select set_config('request.jwt.claim.sub', $1, false)",
    [profileId],
  );
}

try {
  await database.exec("create schema auth;");
  for (const role of ["anon", "authenticated", "service_role"]) {
    await database.exec(`create role ${role} nologin;`);
  }
  await database.exec(`
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid
    language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
  `);

  const migration = await readFile(
    new URL(
      "../supabase/migrations/20261002000000_initial_schema.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const seed = await readFile(
    new URL("../supabase/seed.sql", import.meta.url),
    "utf8",
  );
  await database.exec(migration);
  await database.exec(seed);

  await database.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values
       ($1, 'admin@example.test', '{"full_name":"Test Admin"}'),
       ($2, 'trainer@example.test', '{"full_name":"Test Trainer"}'),
       ($3, 'member@example.test', '{"full_name":"Test Member"}'),
       ($4, 'other@example.test', '{"full_name":"Other Member"}')`,
    [adminId, trainerId, assignedMemberId, otherMemberId],
  );
  await database.query(
    "update public.profiles set role = 'ADMIN' where id = $1",
    [adminId],
  );
  await database.query(
    "update public.profiles set role = 'TRAINER' where id = $1",
    [trainerId],
  );

  const { rows: trainerRows } = await database.query(
    `insert into public.trainers (profile_id, name, phone, email, specialization)
     values ($1, 'Test Trainer', '00000000000', 'trainer@example.test', 'Strength')
     returning id`,
    [trainerId],
  );
  const testTrainerId = trainerRows[0].id;
  const { rows: memberRows } = await database.query(
    `insert into public.members (profile_id, member_code, name, phone, trainer_id)
     values
       ($1, 'TEST-0001', 'Test Member', '00000000000', $3),
       ($2, 'TEST-0002', 'Other Member', '00000000000', null)
     returning id`,
    [assignedMemberId, otherMemberId, testTrainerId],
  );
  const [assignedMember, otherMember] = memberRows;
  const { rows: planRows } = await database.query(
    `select id from public.membership_plans where name = 'Monthly'`,
  );
  await database.query(
    `insert into public.memberships
       (member_id, plan_id, start_date, end_date, price, final_amount)
     values
       ($1, $3, current_date, current_date + 30, 2000, 2000),
       ($2, $3, current_date, current_date + 30, 2000, 2000)`,
    [assignedMember.id, otherMember.id, planRows[0].id],
  );
  await database.query(
    `insert into public.payments (member_id, amount, method)
     values ($1, 2000, 'CASH'), ($2, 2000, 'CASH')`,
    [assignedMember.id, otherMember.id],
  );
  const { rows: workoutRows } = await database.query(
    `insert into public.workout_plans (member_id, trainer_id, name, start_date)
     values ($1, $2, 'Test plan', current_date)
     returning id`,
    [assignedMember.id, testTrainerId],
  );

  await assumeAuthenticatedUser(assignedMemberId);
  let result = await database.query("select id from public.members");
  assert.equal(
    result.rows.length,
    1,
    "a member can only see their own member record",
  );
  result = await database.query("select id from public.payments");
  assert.equal(
    result.rows.length,
    1,
    "a member can only see their own payments",
  );
  await assert.rejects(
    database.query("update public.profiles set role = 'ADMIN' where id = $1", [
      assignedMemberId,
    ]),
    { code: "42501" },
    "members cannot update their profile role",
  );

  await assumeAuthenticatedUser(trainerId);
  result = await database.query("select id from public.members");
  assert.equal(
    result.rows.length,
    1,
    "a trainer sees only currently assigned members",
  );
  result = await database.query("select id from public.payments");
  assert.equal(
    result.rows.length,
    0,
    "trainers cannot read member payment details",
  );
  await database.query(
    `insert into public.workout_exercises (workout_plan_id, name, sets, reps)
     values ($1, 'Squat', 3, '8')`,
    [workoutRows[0].id],
  );

  await database.query("reset role");
  await database.query(
    "update public.members set trainer_id = null where id = $1",
    [assignedMember.id],
  );
  await assumeAuthenticatedUser(trainerId);
  await assert.rejects(
    database.query(
      `insert into public.workout_exercises (workout_plan_id, name, sets, reps, order_index)
       values ($1, 'Unauthorized exercise', 1, '1', 1)`,
      [workoutRows[0].id],
    ),
    { code: "42501" },
    "a trainer cannot edit exercises after member assignment ends",
  );

  await assumeAuthenticatedUser(adminId);
  const { rows: firstAttendance } = await database.query(
    `insert into public.attendance (member_id, method, created_by)
     values ($1, 'MANUAL', $2)
     returning id`,
    [assignedMember.id, adminId],
  );
  await assert.rejects(
    database.query(
      `insert into public.attendance (member_id, method, created_by)
       values ($1, 'QR', $2)`,
      [assignedMember.id, adminId],
    ),
    { code: "23505" },
    "a member cannot have two simultaneous open check-ins",
  );
  await database.query(
    `update public.attendance
     set event_type = 'CHECK_OUT', check_out_at = now()
     where id = $1`,
    [firstAttendance[0].id],
  );
  await database.query(
    `insert into public.attendance (member_id, method, created_by)
     values ($1, 'QR', $2)`,
    [assignedMember.id, adminId],
  );

  result = await database.query("select id from public.payments");
  assert.equal(result.rows.length, 2, "admins can review all gym payments");

  await database.query("reset role");
  await database.query("set role anon");
  await assert.rejects(
    database.query("select id from public.members"),
    { code: "42501" },
    "anonymous clients have no table grants",
  );

  console.log("Database migration, seeds, and core RLS checks passed.");
} finally {
  await database.close();
}
