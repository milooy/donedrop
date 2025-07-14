import { supabase } from "./supabase";
import { Todo } from "@/hooks/useSupabaseData";

export interface TodoDatabase {
  id: number;
  user_id: string;
  text: string;
  color: "yellow" | "pink" | "blue";
  is_pinned: boolean;
  pinned_at: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface UserSettings {
  user_id: string;
  selected_color: "yellow" | "pink" | "blue";
  inbox_selected_color: "yellow" | "pink" | "blue";
  coins: number;
  created_at: string;
  updated_at: string;
}

// Todo 변환 함수
export const convertTodoFromDB = (dbTodo: TodoDatabase) => ({
  id: dbTodo.id,
  text: dbTodo.text,
  color: dbTodo.color,
  isPinned: dbTodo.is_pinned,
  pinnedAt: dbTodo.pinned_at ? new Date(dbTodo.pinned_at).getTime() : undefined,
  createdAt: new Date(dbTodo.created_at).getTime(),
  completedAt: dbTodo.completed_at
    ? new Date(dbTodo.completed_at).getTime()
    : undefined,
});

export const convertTodoToDB = (
  todo: Todo,
  userId: string
): Partial<TodoDatabase> => ({
  user_id: userId,
  text: todo.text,
  color: todo.color,
  is_pinned: todo.isPinned,
  pinned_at: todo.pinnedAt ? new Date(todo.pinnedAt).toISOString() : null,
  created_at: new Date(todo.createdAt).toISOString(),
  completed_at: todo.completedAt
    ? new Date(todo.completedAt).toISOString()
    : undefined,
});

// Todos CRUD
export const fetchTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
  const { data, error } = await supabase
    .from("todos")
    .update({
      ...updates,
      is_pinned: updates.isPinned,
      pinned_at: updates.pinnedAt
        ? new Date(updates.pinnedAt).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
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

// Inbox Todos CRUD
export const fetchInboxTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from("inbox_todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map(convertTodoFromDB) || [];
};

export const insertInboxTodo = async (todo: Todo, userId: string) => {
  const { data, error } = await supabase
    .from("inbox_todos")
    .insert(convertTodoToDB(todo, userId))
    .select()
    .single();

  if (error) throw error;
  return convertTodoFromDB(data);
};

export const updateInboxTodo = async (
  id: number,
  updates: Partial<Todo>,
  userId: string
) => {
  const { data, error } = await supabase
    .from("inbox_todos")
    .update({
      ...updates,
      is_pinned: updates.isPinned,
      pinned_at: updates.pinnedAt
        ? new Date(updates.pinnedAt).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return convertTodoFromDB(data);
};

export const deleteInboxTodo = async (id: number, userId: string) => {
  const { error } = await supabase
    .from("inbox_todos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};

// Completed Todos CRUD
export const fetchCompletedTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from("completed_todos")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data?.map(convertTodoFromDB) || [];
};

export const insertCompletedTodo = async (todo: Todo, userId: string) => {
  const { data, error } = await supabase
    .from("completed_todos")
    .insert({
      ...convertTodoToDB(todo, userId),
      completed_at:
        todo.completedAt !== undefined
          ? new Date(todo.completedAt).toISOString()
          : undefined,
    })
    .select()
    .single();

  if (error) throw error;
  return convertTodoFromDB(data);
};

export const clearCompletedTodos = async (userId: string) => {
  const { error } = await supabase
    .from("completed_todos")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
};

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

// Move todo between tables
export const moveTodoToCompleted = async (
  todo: Todo,
  userId: string,
  fromTable: "todos" | "inbox_todos"
) => {
  const completedTodo = {
    ...todo,
    completedAt: Date.now(),
  };

  // Insert to completed_todos
  await insertCompletedTodo(completedTodo, userId);

  // Delete from source table
  if (fromTable === "todos") {
    await deleteTodo(todo.id, userId);
  } else {
    await deleteInboxTodo(todo.id, userId);
  }
};

export const moveTodoToInbox = async (todo: Todo, userId: string) => {
  await insertInboxTodo(todo, userId);
  await deleteTodo(todo.id, userId);
};

export const moveTodoToMain = async (todo: Todo, userId: string) => {
  await insertTodo(todo, userId);
  await deleteInboxTodo(todo.id, userId);
};
