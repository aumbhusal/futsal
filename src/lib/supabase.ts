import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

export const supabase =
  typeof window !== "undefined" ? getSupabase() : (null as any);

export interface Student {
  id: string;
  roll_no: string;
  created_at: string;
}

export interface Booking {
  id: string;
  student_id: string;
  team_members: string[];
  id_card_url: string;
  faculty: string;
  semester: number;
  booking_date: string;
  time_slot: string;
  no_show_count: number;
  status: string;
  created_at: string;
}
