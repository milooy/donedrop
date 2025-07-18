import { supabase } from '@/lib/supabase';
import type { Ritual } from '@/lib/types';
import { 
  convertRitualFromDB, 
  convertRitualToDB,
  convertRitualCompleteLogFromDB,
  convertRitualGemFromDB,
} from '../converters';

// Ritual CRUD
export const fetchRituals = async (userId: string) => {
  const { data, error } = await supabase
    .from("rituals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data?.map(convertRitualFromDB) || [];
};

export const insertRitual = async (ritual: Ritual, userId: string) => {
  const { data, error } = await supabase
    .from("rituals")
    .insert(convertRitualToDB(ritual, userId))
    .select()
    .single();

  if (error) throw error;
  return convertRitualFromDB(data);
};

export const updateRitual = async (
  id: number,
  updates: Partial<Ritual>,
  userId: string
) => {
  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }

  if (updates.orderIndex !== undefined) {
    updateData.order_index = updates.orderIndex;
  }

  if (updates.isActive !== undefined) {
    updateData.is_active = updates.isActive;
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("rituals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return convertRitualFromDB(data);
};

export const deleteRitual = async (id: number, userId: string) => {
  const { error } = await supabase
    .from("rituals")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};

// RitualCompleteLog CRUD
export const fetchRitualCompleteLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from("ritual_complete_logs")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data?.map(convertRitualCompleteLogFromDB) || [];
};

// Date range helper function
const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const insertRitualCompleteLog = async (ritualId: number, userId: string) => {
  // Check if there's already a log for the same ritual today
  const { startOfDay, endOfDay } = getTodayRange();
  
  const { data: existingLogs } = await supabase
    .from("ritual_complete_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("ritual_id", ritualId)
    .gte("completed_at", startOfDay.toISOString())
    .lte("completed_at", endOfDay.toISOString());

  // If there's already a completion record for today, return the existing log
  if (existingLogs && existingLogs.length > 0) {
    // Fetch the full log information again
    const { data: fullLog, error: fetchError } = await supabase
      .from("ritual_complete_logs")
      .select("*")
      .eq("id", existingLogs[0].id)
      .single();
    
    if (fetchError) throw fetchError;
    return convertRitualCompleteLogFromDB(fullLog);
  }

  const { data, error } = await supabase
    .from("ritual_complete_logs")
    .insert({
      user_id: userId,
      ritual_id: ritualId,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return convertRitualCompleteLogFromDB(data);
};

export const deleteRitualCompleteLog = async (ritualId: number, userId: string) => {
  // Delete all logs for the given ritual for today
  const { startOfDay, endOfDay } = getTodayRange();
  
  const { error } = await supabase
    .from("ritual_complete_logs")
    .delete()
    .eq("user_id", userId)
    .eq("ritual_id", ritualId)
    .gte("completed_at", startOfDay.toISOString())
    .lte("completed_at", endOfDay.toISOString());

  if (error) throw error;
};

// RitualGem CRUD
export const fetchRitualGems = async (userId: string) => {
  const { data, error } = await supabase
    .from("ritual_gems")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("date", { ascending: true });

  if (error) throw error;
  return data?.map(convertRitualGemFromDB) || [];
};

export const insertRitualGem = async (date: string, userId: string) => {
  const { data, error } = await supabase
    .from("ritual_gems")
    .insert({
      user_id: userId,
      date: date,
      created_at: new Date().toISOString(),
      is_archived: false,
    })
    .select()
    .single();

  if (error) throw error;
  return convertRitualGemFromDB(data);
};

export const archiveRitualGems = async (userId: string) => {
  const { error } = await supabase
    .from("ritual_gems")
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_archived", false);

  if (error) throw error;
};