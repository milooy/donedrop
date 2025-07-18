import type {
  Ritual,
  RitualCompleteLog,
  RitualCompleteLogDatabase,
  RitualCompletion,
  RitualCompletionDatabase,
  RitualDatabase,
  RitualGem,
  RitualGemDatabase,
  Todo,
  TodoDatabase,
} from "@/lib/types";

// Todo conversion functions
export const convertTodoFromDB = (dbTodo: TodoDatabase): Todo => ({
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
  archived_at: todo.archivedAt ? new Date(todo.archivedAt).toISOString() : null,
});

// Ritual conversion functions
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

// RitualCompleteLog conversion functions
export const convertRitualCompleteLogFromDB = (
  dbLog: RitualCompleteLogDatabase
): RitualCompleteLog => ({
  id: dbLog.id,
  userId: dbLog.user_id,
  ritualId: dbLog.ritual_id,
  completedAt: new Date(dbLog.completed_at).getTime(),
  createdAt: new Date(dbLog.created_at).getTime(),
});

export const convertRitualCompleteLogToDB = (
  log: RitualCompleteLog,
  userId: string
): Partial<RitualCompleteLogDatabase> => ({
  user_id: userId,
  ritual_id: log.ritualId,
  completed_at: new Date(log.completedAt).toISOString(),
  created_at: new Date(log.createdAt).toISOString(),
});

// RitualGem conversion functions
export const convertRitualGemFromDB = (
  dbGem: RitualGemDatabase
): RitualGem => ({
  id: dbGem.id,
  userId: dbGem.user_id,
  date: dbGem.date,
  createdAt: new Date(dbGem.created_at).getTime(),
  isArchived: dbGem.is_archived,
  archivedAt: dbGem.archived_at
    ? new Date(dbGem.archived_at).getTime()
    : undefined,
});

export const convertRitualGemToDB = (
  gem: RitualGem,
  userId: string
): Partial<RitualGemDatabase> => ({
  user_id: userId,
  date: gem.date,
  created_at: new Date(gem.createdAt).toISOString(),
  is_archived: gem.isArchived,
  archived_at: gem.archivedAt
    ? new Date(gem.archivedAt).toISOString()
    : undefined,
});

// RitualCompletion conversion functions
export const convertRitualCompletionFromDB = (
  dbCompletion: RitualCompletionDatabase
): RitualCompletion => ({
  id: dbCompletion.id,
  userId: dbCompletion.user_id,
  date: dbCompletion.date,
  completedRitualIds: dbCompletion.completed_ritual_ids,
  createdAt: new Date(dbCompletion.created_at).getTime(),
  updatedAt: new Date(dbCompletion.updated_at).getTime(),
  isArchived: dbCompletion.is_archived || false,
  archivedAt: dbCompletion.archived_at
    ? new Date(dbCompletion.archived_at).getTime()
    : undefined,
});

export const convertRitualCompletionToDB = (
  completion: RitualCompletion,
  userId: string
): Partial<RitualCompletionDatabase> => ({
  user_id: userId,
  date: completion.date,
  completed_ritual_ids: completion.completedRitualIds,
  created_at: new Date(completion.createdAt).toISOString(),
  updated_at: new Date(completion.updatedAt).toISOString(),
  is_archived: completion.isArchived,
  archived_at: completion.archivedAt
    ? new Date(completion.archivedAt).toISOString()
    : undefined,
});
