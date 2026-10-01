export type AppRole = "ADMIN" | "TRAINER" | "MEMBER";

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
};

export type TrainerRow = {
  id: string;
  profile_id: string | null;
  name: string;
  phone: string;
  email: string;
  specialization: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
};

export type MemberRow = {
  id: string;
  profile_id: string | null;
  member_code: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  trainer_id: string | null;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  joined_at: string;
  created_at: string;
  updated_at: string;
};

export type MembershipPlanRow = {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
};

export type MembershipRow = {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  price: number;
  discount: number;
  final_amount: number;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  method: "CASH" | "BKASH" | "NAGAD" | "CARD" | "BANK" | "OTHER";
  reference: string | null;
  paid_at: string;
  status: "PENDING" | "COMPLETED" | "REFUNDED" | "VOID";
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type DeviceRow = {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string | null;
  location: string;
  status: "DEMO" | "ONLINE" | "OFFLINE";
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceRow = {
  id: string;
  member_id: string;
  device_id: string | null;
  method: "QR" | "MANUAL" | "MOBILE" | "ZKTECO";
  event_type: "CHECK_IN" | "CHECK_OUT";
  check_in_at: string;
  check_out_at: string | null;
  status: "SUCCESS" | "REJECTED";
  created_by: string | null;
  created_at: string;
};

export type WorkoutPlanRow = {
  id: string;
  member_id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  created_at: string;
  updated_at: string;
};

export type WorkoutExerciseRow = {
  id: string;
  workout_plan_id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  notes: string | null;
  order_index: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      trainers: Table<TrainerRow>;
      members: Table<MemberRow>;
      membership_plans: Table<MembershipPlanRow>;
      memberships: Table<MembershipRow>;
      payments: Table<PaymentRow>;
      devices: Table<DeviceRow>;
      attendance: Table<AttendanceRow>;
      workout_plans: Table<WorkoutPlanRow>;
      workout_exercises: Table<WorkoutExerciseRow>;
    };
    Views: Record<string, never>;
    Functions: {
      current_app_role: { Args: Record<string, never>; Returns: AppRole };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_trainer_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      current_member_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      can_access_member: {
        Args: { target_member_id: string };
        Returns: boolean;
      };
      can_access_workout_plan: {
        Args: { target_plan_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      attendance_method: "QR" | "MANUAL" | "MOBILE" | "ZKTECO";
      attendance_event_type: "CHECK_IN" | "CHECK_OUT";
    };
    CompositeTypes: Record<string, never>;
  };
};
