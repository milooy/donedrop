import { Todo, Ritual, RitualCompletion } from "@/hooks/useSupabaseData";
import { supabase } from "./supabase";

export type TodoStatus = 'inbox' | 'active' | 'completed' | 'archived';

export interface TodoDatabase {
  id: number;
  user_id: string;
  text: string;
  color: "yellow" | "pink" | "blue";
  status: TodoStatus;
  is_pinned: boolean;
  pinned_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  selected_color: "yellow" | "pink" | "blue";
  inbox_selected_color: "yellow" | "pink" | "blue";
  coins: number;
  created_at: string;
  updated_at: string;
}

export interface RitualDatabase {
  id: number;
  user_id: string;
  name: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RitualCompletionDatabase {
  id: number;
  user_id: string;
  date: string;
  completed_ritual_ids: number[];
  created_at: string;
  updated_at: string;
}

// Todo 변환 함수
export const convertTodoFromDB = (dbTodo: TodoDatabase) => ({
  id: dbTodo.id,
  text: dbTodo.text,
  color: dbTodo.color,
  status: dbTodo.status,
  isPinned: dbTodo.is_pinned,
  pinnedAt: dbTodo.pinned_at ? new Date(dbTodo.pinned_at).getTime() : undefined,
  createdAt: new Date(dbTodo.created_at).getTime(),
  completedAt: dbTodo.completed_at
    ? new Date(dbTodo.completed_at).getTime()
    : undefined,
  archivedAt: dbTodo.archived_at
    ? new Date(dbTodo.archived_at).getTime()
    : undefined,
});

export const convertTodoToDB = (
  todo: Todo,
  userId: string
): Partial<TodoDatabase> => ({
  user_id: userId,
  text: todo.text,
  color: todo.color,
  status: todo.status,
  is_pinned: todo.isPinned,
  pinned_at: todo.pinnedAt ? new Date(todo.pinnedAt).toISOString() : null,
  created_at: new Date(todo.createdAt).toISOString(),
  completed_at: todo.completedAt
    ? new Date(todo.completedAt).toISOString()
    : null,
  archived_at: todo.archivedAt
    ? new Date(todo.archivedAt).toISOString()
    : null,
});

// 통합 Todos CRUD
export const fetchTodos = async (userId: string, status?: TodoStatus | TodoStatus[]) => {
  let query = supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId);
  
  if (status) {
    if (Array.isArray(status)) {
      query = query.in("status", status);
    } else {
      query = query.eq("status", status);
    }
  }
  
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data?.map(convertTodoFromDB) || [];
};

export const insertTodo = async (todo: Todo, userId: string) => {
  const { data, error } = await supabase
    .from("todos")
    .insert(convertTodoToDB(todo, userId))
    .select()
    .single();

  if (error) throw error;
  return convertTodoFromDB(data);
};

export const updateTodo = async (
  id: number,
  updates: Partial<Todo>,
  userId: string
) => {
  // 업데이트할 데이터 구성
  const updateData: Record<string, unknown> = {};

  // text 업데이트
  if (updates.text !== undefined) {
    updateData.text = updates.text;
  }

  // status 업데이트
  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  // pin 상태 업데이트
  if (updates.isPinned !== undefined) {
    updateData.is_pinned = updates.isPinned;
  }

  // pin 시간 업데이트
  if (updates.pinnedAt !== undefined) {
    updateData.pinned_at = updates.pinnedAt
      ? new Date(updates.pinnedAt).toISOString()
      : null;
  }

  // 완료 시간 업데이트
  if (updates.completedAt !== undefined) {
    updateData.completed_at = updates.completedAt
      ? new Date(updates.completedAt).toISOString()
      : null;
  }

  // 아카이브 시간 업데이트
  if (updates.archivedAt !== undefined) {
    updateData.archived_at = updates.archivedAt
      ? new Date(updates.archivedAt).toISOString()
      : null;
  }

  // 업데이트 시간
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return convertTodoFromDB(data);
};

export const deleteTodo = async (id: number, userId: string) => {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};

// 상태 기반 헬퍼 함수들
export const fetchActiveTodos = (userId: string) => fetchTodos(userId, 'active');
export const fetchInboxTodos = (userId: string) => fetchTodos(userId, 'inbox');
export const fetchCompletedTodos = (userId: string) => fetchTodos(userId, 'completed');
export const fetchArchivedTodos = (userId: string) => fetchTodos(userId, 'archived');

// 상태 변경 헬퍼 함수들
export const markTodoCompleted = async (id: number, userId: string) => {
  return updateTodo(id, { 
    status: 'completed', 
    completedAt: Date.now() 
  }, userId);
};

export const moveTodoToInbox = async (id: number, userId: string) => {
  return updateTodo(id, { status: 'inbox' }, userId);
};

export const moveTodoToActive = async (id: number, userId: string) => {
  return updateTodo(id, { status: 'active' }, userId);
};

export const archiveCompletedTodos = async (userId: string) => {
  const { error } = await supabase
    .from("todos")
    .update({ 
      status: 'archived',
      archived_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) throw error;
};

// 레거시 호환성을 위한 함수들 (점진적 마이그레이션용)
export const insertInboxTodo = async (todo: Todo, userId: string) => {
  return insertTodo({ ...todo, status: 'inbox' }, userId);
};

export const insertCompletedTodo = async (todo: Todo, userId: string) => {
  return insertTodo({ ...todo, status: 'completed' }, userId);
};

export const updateInboxTodo = updateTodo;
export const deleteInboxTodo = deleteTodo;
export const clearCompletedTodos = archiveCompletedTodos;

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

// 레거시 테이블 간 이동 함수들 (기존 코드 호환성용)
export const moveTodoToCompleted = async (
  todoId: number,
  userId: string
) => {
  return markTodoCompleted(todoId, userId);
};

export const moveTodoToMain = async (todoId: number, userId: string) => {
  return moveTodoToActive(todoId, userId);
};

// Ritual 변환 함수
export const convertRitualFromDB = (dbRitual: RitualDatabase): Ritual => ({
  id: dbRitual.id,
  name: dbRitual.name,
  orderIndex: dbRitual.order_index,
  isActive: dbRitual.is_active,
  createdAt: new Date(dbRitual.created_at).getTime(),
});

export const convertRitualToDB = (
  ritual: Ritual,
  userId: string
): Partial<RitualDatabase> => ({
  user_id: userId,
  name: ritual.name,
  order_index: ritual.orderIndex,
  is_active: ritual.isActive,
  created_at: new Date(ritual.createdAt).toISOString(),
});

// RitualCompletion 변환 함수
export const convertRitualCompletionFromDB = (
  dbCompletion: RitualCompletionDatabase
): RitualCompletion => ({
  id: dbCompletion.id,
  date: dbCompletion.date,
  completedRitualIds: dbCompletion.completed_ritual_ids,
  createdAt: new Date(dbCompletion.created_at).getTime(),
});

export const convertRitualCompletionToDB = (
  completion: RitualCompletion,
  userId: string
): Partial<RitualCompletionDatabase> => ({
  user_id: userId,
  date: completion.date,
  completed_ritual_ids: completion.completedRitualIds,
  created_at: new Date(completion.createdAt).toISOString(),
});

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

// RitualCompletion CRUD
export const fetchRitualCompletions = async (userId: string) => {
  const { data, error } = await supabase
    .from("ritual_completions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data?.map(convertRitualCompletionFromDB) || [];
};

export const upsertRitualCompletion = async (
  completion: RitualCompletion,
  userId: string
) => {
  const { data, error } = await supabase
    .from("ritual_completions")
    .upsert({
      user_id: userId,
      date: completion.date,
      completed_ritual_ids: completion.completedRitualIds,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return convertRitualCompletionFromDB(data);
};
