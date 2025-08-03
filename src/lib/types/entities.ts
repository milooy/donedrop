export type PostItColor = "yellow" | "pink" | "blue" | "green";
export type PostItType = "normal" | "frog";
export type TodoStatus = "inbox" | "active" | "completed" | "archived";

export interface Todo {
  id: number;
  text: string;
  color: PostItColor;
  type: PostItType;
  status: TodoStatus;
  isPinned: boolean;
  pinnedAt?: number;
  createdAt: number;
  completedAt?: number;
  archivedAt?: number;
}

export interface Ritual {
  id: number;
  name: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: number;
}

export interface RitualCompleteLog {
  id: number;
  userId: string;
  ritualId: number;
  completedAt: number;
  createdAt: number;
}

export interface RitualGem {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  createdAt: number;
  isArchived: boolean;
  archivedAt?: number;
}

export interface RitualCompletion {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  completedRitualIds: number[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  archivedAt?: number;
}

export interface UserSettings {
  user_id: string;
  selected_color: PostItColor;
  inbox_selected_color: PostItColor;
  coins: number;
  created_at: string;
  updated_at: string;
}

// Legacy alias for backward compatibility
export type Gem = RitualGem;