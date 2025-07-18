import { supabase } from '@/lib/supabase';
import type { Todo, TodoStatus } from '@/lib/types';
import { convertTodoFromDB, convertTodoToDB } from '../converters';

// Unified Todos CRUD
export const fetchTodos = async (
  userId: string,
  status?: TodoStatus | TodoStatus[]
) => {
  let query = supabase.from("todos").select("*").eq("user_id", userId);

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

// Status-based helper functions
export const fetchActiveTodos = (userId: string) =>
  fetchTodos(userId, "active");
export const fetchInboxTodos = (userId: string) => fetchTodos(userId, "inbox");
export const fetchCompletedTodos = (userId: string) =>
  fetchTodos(userId, "completed");
export const fetchArchivedTodos = (userId: string) =>
  fetchTodos(userId, "archived");

// Status change helper functions
export const markTodoCompleted = async (id: number, userId: string) => {
  return updateTodo(
    id,
    {
      status: "completed",
      completedAt: Date.now(),
    },
    userId
  );
};

export const moveTodoToInbox = async (id: number, userId: string) => {
  return updateTodo(id, { status: "inbox" }, userId);
};

export const moveTodoToActive = async (id: number, userId: string) => {
  return updateTodo(id, { status: "active" }, userId);
};

export const archiveCompletedTodos = async (userId: string) => {
  const { error } = await supabase
    .from("todos")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) throw error;
};

// Legacy compatibility functions (for gradual migration)
export const insertInboxTodo = async (todo: Todo, userId: string) => {
  return insertTodo({ ...todo, status: "inbox" }, userId);
};

export const insertCompletedTodo = async (todo: Todo, userId: string) => {
  return insertTodo({ ...todo, status: "completed" }, userId);
};

export const updateInboxTodo = updateTodo;
export const deleteInboxTodo = deleteTodo;
export const clearCompletedTodos = archiveCompletedTodos;

// Legacy table movement functions (for existing code compatibility)
export const moveTodoToCompleted = async (todoId: number, userId: string) => {
  return markTodoCompleted(todoId, userId);
};

export const moveTodoToMain = async (todoId: number, userId: string) => {
  return moveTodoToActive(todoId, userId);
};