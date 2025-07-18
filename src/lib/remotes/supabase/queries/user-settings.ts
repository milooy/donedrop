import { supabase } from '@/lib/supabase';
import type { UserSettings } from '@/lib/types';

// User Settings CRUD
export const fetchUserSettings = async (
  userId: string
): Promise<UserSettings | null> => {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return data;
};

export const upsertUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
) => {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};