import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_ALLOW_DEMO_SEED",
  "DEMO_ADMIN_EMAIL",
  "DEMO_ADMIN_PASSWORD",
  "DEMO_TRAINER_EMAIL",
  "DEMO_TRAINER_PASSWORD",
  "DEMO_MEMBER_EMAIL",
  "DEMO_MEMBER_PASSWORD",
];

const missing = required.filter((name) => !process.env[name]);
const secretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!secretKey) {
  missing.push("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
}
if (missing.length > 0) {
  throw new Error(`Missing required environment values: ${missing.join(", ")}`);
}
if (process.env.SUPABASE_ALLOW_DEMO_SEED !== "true") {
  throw new Error(
    "Demo provisioning is disabled. Set SUPABASE_ALLOW_DEMO_SEED=true only for a development Supabase project.",
  );
}

const accounts = [
  {
    role: "ADMIN",
    fullName: "Demo Administrator",
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
  },
  {
    role: "TRAINER",
    fullName: "Demo Trainer",
    email: process.env.DEMO_TRAINER_EMAIL,
    password: process.env.DEMO_TRAINER_PASSWORD,
  },
  {
    role: "MEMBER",
    fullName: "Demo Member",
    email: process.env.DEMO_MEMBER_EMAIL,
    password: process.env.DEMO_MEMBER_PASSWORD,
  },
];

if (
  new Set(accounts.map(({ email }) => email.toLowerCase())).size !==
  accounts.length
) {
  throw new Error("Each demo role must use a different email address.");
}
for (const account of accounts) {
  if (account.password.length < 12) {
    throw new Error(
      `The ${account.role} demo password must be at least 12 characters.`,
    );
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: userPage, error: listError } =
  await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
if (listError) {
  throw new Error(`Could not inspect Auth users: ${listError.message}`);
}

const provisioned = new Map();
for (const account of accounts) {
  const existingUser = userPage.users.find(
    (user) => user.email?.toLowerCase() === account.email.toLowerCase(),
  );
  let user = existingUser;

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error || !data.user) {
      throw new Error(
        `Could not provision ${account.role} Auth user: ${error?.message ?? "no user returned"}`,
      );
    }
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, full_name: account.fullName },
    });
    if (error || !data.user) {
      throw new Error(
        `Could not update ${account.role} Auth user: ${error?.message ?? "no user returned"}`,
      );
    }
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: account.email,
      full_name: account.fullName,
      role: account.role,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    throw new Error(
      `Could not assign ${account.role} profile: ${profileError.message}`,
    );
  }

  provisioned.set(account.role, { ...account, profileId: user.id });
}

const trainer = provisioned.get("TRAINER");
const { data: trainerRow, error: trainerError } = await supabase
  .from("trainers")
  .upsert(
    {
      profile_id: trainer.profileId,
      name: trainer.fullName,
      email: trainer.email,
      phone: "00000000000",
      specialization: "General fitness",
      status: "ACTIVE",
    },
    { onConflict: "profile_id" },
  )
  .select("id")
  .single();
if (trainerError || !trainerRow) {
  throw new Error(
    `Could not provision trainer record: ${trainerError?.message ?? "no record returned"}`,
  );
}

const member = provisioned.get("MEMBER");
const { error: memberError } = await supabase.from("members").upsert(
  {
    profile_id: member.profileId,
    member_code: "GYM-900001",
    name: member.fullName,
    phone: "00000000000",
    email: member.email,
    trainer_id: trainerRow.id,
    status: "ACTIVE",
  },
  { onConflict: "profile_id" },
);
if (memberError) {
  throw new Error(`Could not provision member record: ${memberError.message}`);
}

console.log("Development Admin, Trainer, and Member accounts are provisioned.");
