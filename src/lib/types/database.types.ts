import { TodoStatus } from './entities';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number;
          user_id: string | null;
          text: string;
          color: "yellow" | "pink" | "blue";
          status: TodoStatus | null;
          is_pinned: boolean | null;
          pinned_at: string | null;
          completed_at: string | null;
          archived_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          text: string;
          color: "yellow" | "pink" | "blue";
          status?: TodoStatus | null;
          is_pinned?: boolean | null;
          pinned_at?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          text?: string;
          color?: "yellow" | "pink" | "blue";
          status?: TodoStatus | null;
          is_pinned?: boolean | null;
          pinned_at?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          selected_color: "yellow" | "pink" | "blue" | null;
          inbox_selected_color: "yellow" | "pink" | "blue" | null;
          coins: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          selected_color?: "yellow" | "pink" | "blue" | null;
          inbox_selected_color?: "yellow" | "pink" | "blue" | null;
          coins?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          selected_color?: "yellow" | "pink" | "blue" | null;
          inbox_selected_color?: "yellow" | "pink" | "blue" | null;
          coins?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      rituals: {
        Row: {
          id: number;
          user_id: string | null;
          name: string;
          order_index: number;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          name: string;
          order_index: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          name?: string;
          order_index?: number;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
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
          user_id: string | null;
          date: string;
          completed_ritual_ids: string[];
          created_at: string | null;
          updated_at: string | null;
          is_archived: boolean | null;
          archived_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          date: string;
          completed_ritual_ids: string[];
          created_at?: string | null;
          updated_at?: string | null;
          is_archived?: boolean | null;
          archived_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          date?: string;
          completed_ritual_ids?: string[];
          created_at?: string | null;
          updated_at?: string | null;
          is_archived?: boolean | null;
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
  user_id: string | null;
  text: string;
  color: "yellow" | "pink" | "blue";
  status: TodoStatus | null;
  is_pinned: boolean | null;
  pinned_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RitualDatabase {
  id: number;
  user_id: string | null;
  name: string;
  order_index: number;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RitualCompletionDatabase {
  id: number;
  user_id: string | null;
  date: string;
  completed_ritual_ids: string[];
  created_at: string | null;
  updated_at: string | null;
  is_archived?: boolean | null;
  archived_at?: string | null;
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
  archived_at?: string | null;
}