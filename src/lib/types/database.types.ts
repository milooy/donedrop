import { TodoStatus } from './entities';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
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
        };
        Insert: {
          id?: number;
          user_id: string;
          text: string;
          color: "yellow" | "pink" | "blue";
          status?: TodoStatus;
          is_pinned?: boolean;
          pinned_at?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          text?: string;
          color?: "yellow" | "pink" | "blue";
          status?: TodoStatus;
          is_pinned?: boolean;
          pinned_at?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inbox_todos: {
        Row: {
          id: number;
          user_id: string;
          text: string;
          color: "yellow" | "pink" | "blue";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          text: string;
          color: "yellow" | "pink" | "blue";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          text?: string;
          color?: "yellow" | "pink" | "blue";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      completed_todos: {
        Row: {
          id: number;
          user_id: string;
          text: string;
          color: "yellow" | "pink" | "blue";
          completed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          text: string;
          color: "yellow" | "pink" | "blue";
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          text?: string;
          color?: "yellow" | "pink" | "blue";
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          selected_color: "yellow" | "pink" | "blue";
          inbox_selected_color: "yellow" | "pink" | "blue";
          coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          selected_color: "yellow" | "pink" | "blue";
          inbox_selected_color: "yellow" | "pink" | "blue";
          coins?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          selected_color?: "yellow" | "pink" | "blue";
          inbox_selected_color?: "yellow" | "pink" | "blue";
          coins?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rituals: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          order_index: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ritual_complete_logs: {
        Row: {
          id: number;
          user_id: string;
          ritual_id: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          ritual_id: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          ritual_id?: number;
          completed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ritual_complete_logs_ritual_id_fkey";
            columns: ["ritual_id"];
            referencedRelation: "rituals";
            referencedColumns: ["id"];
          },
        ];
      };
      ritual_gems: {
        Row: {
          id: number;
          user_id: string;
          date: string;
          created_at: string;
          is_archived: boolean;
          archived_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          date: string;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          date?: string;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      ritual_completions: {
        Row: {
          id: number;
          user_id: string;
          date: string;
          completed_ritual_ids: number[];
          created_at: string;
          updated_at: string;
          is_archived: boolean;
          archived_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          date: string;
          completed_ritual_ids: number[];
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          date?: string;
          completed_ritual_ids?: number[];
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Database-specific types (for conversion between DB and app types)
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
  is_archived?: boolean;
  archived_at?: string;
}

export interface RitualCompleteLogDatabase {
  id: number;
  user_id: string;
  ritual_id: number;
  completed_at: string;
  created_at: string;
}

export interface RitualGemDatabase {
  id: number;
  user_id: string;
  date: string;
  created_at: string;
  is_archived: boolean;
  archived_at?: string;
}