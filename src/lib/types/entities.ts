export type PostItColor = "yellow" | "pink" | "blue" | "green";
export type PostItType = "normal" | "frog";
export type TodoStatus = "inbox" | "active" | "completed" | "archived";

// 날짜 형식을 위한 타입 (더 유연하게)
export type DateString = string; // YYYY-MM-DD 형식이지만 런타임에서 검증
export type Timestamp = number;
export type UserId = string;

export interface Todo {
  readonly id: number;
  text: string;
  color: PostItColor;
  type: PostItType;
  status: TodoStatus;
  isPinned: boolean;
  pinnedAt?: Timestamp;
  readonly createdAt: Timestamp;
  completedAt?: Timestamp;
  archivedAt?: Timestamp;
}

export interface Ritual {
  readonly id: number;
  name: string;
  orderIndex: number;
  isActive: boolean;
  readonly createdAt: Timestamp;
}

export interface RitualCompleteLog {
  readonly id: number;
  readonly userId: UserId;
  readonly ritualId: number;
  readonly completedAt: Timestamp;
  readonly createdAt: Timestamp;
}

export interface RitualGem {
  readonly id: number;
  readonly userId: UserId;
  readonly date: DateString;
  readonly createdAt: Timestamp;
  isArchived: boolean;
  archivedAt?: Timestamp;
}

export interface RitualCompletion {
  readonly id: number;
  readonly userId: UserId;
  readonly date: DateString;
  completedRitualIds: number[];
  readonly createdAt: Timestamp;
  updatedAt: Timestamp;
  isArchived: boolean;
  archivedAt?: Timestamp;
}

export interface UserSettings {
  readonly user_id: UserId;
  selected_color: PostItColor;
  inbox_selected_color: PostItColor;
  coins: number;
  readonly created_at: string;
  updated_at: string;
}

// 유틸리티 타입들
export type PartialTodo = Partial<Omit<Todo, 'id' | 'createdAt'>>;
export type TodoUpdate = Partial<Pick<Todo, 'text' | 'color' | 'isPinned' | 'pinnedAt'>>;
export type CreateTodoData = Pick<Todo, 'text' | 'color' | 'type'> & {
  status?: TodoStatus;
  isPinned?: boolean;
};

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Legacy alias for backward compatibility
export type Gem = RitualGem;

// 상수 타입들
export const POST_IT_COLORS = ['yellow', 'pink', 'blue', 'green'] as const;
export const POST_IT_TYPES = ['normal', 'frog'] as const;
export const TODO_STATUSES = ['inbox', 'active', 'completed', 'archived'] as const;

// 타입 가드들
export function isValidPostItColor(color: string): color is PostItColor {
  return POST_IT_COLORS.includes(color as PostItColor);
}

export function isValidPostItType(type: string): type is PostItType {
  return POST_IT_TYPES.includes(type as PostItType);
}

export function isValidTodoStatus(status: string): status is TodoStatus {
  return TODO_STATUSES.includes(status as TodoStatus);
}