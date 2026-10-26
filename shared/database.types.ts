import type { Allergen } from "./allergens";
import type { Diet } from "./diets";

// The shape of our Supabase database, written by hand from supabase/schema.sql
// (same format as `supabase gen types typescript`). Change this file when the
// schema changes. With it, TypeScript knows every table, column and function,
// so a misspelled column is an error in the editor instead of a crash later.
//
// jsonb and text[] columns are given exact types here (e.g. string[]) because
// we know what we store in them.
//
// Row = what we read, Insert = what we must/may send when adding a row,
// Update = what we may change.

export type Database = {
  public: {
    Tables: {
      pantry: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          quantity: number | null;
          unit: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          quantity?: number | null;
          unit?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pantry"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          ingredients: string[];
          instructions: string[];
          cook_time_minutes: number | null;
          cuisine: string | null;
          kid_friendly: boolean | null;
          allergens: Allergen[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          ingredients: string[];
          instructions: string[];
          cook_time_minutes?: number | null;
          cuisine?: string | null;
          kid_friendly?: boolean | null;
          allergens?: Allergen[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      preferences: {
        Row: {
          user_id: string;
          allergens: string[];
          diet: Diet;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          allergens?: string[];
          diet?: Diet;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["preferences"]["Insert"]>;
        Relationships: [];
      };
      usage: {
        Row: {
          user_id: string;
          day: string;
          requests: number;
        };
        Insert: {
          user_id: string;
          day?: string;
          requests?: number;
        };
        Update: Partial<Database["public"]["Tables"]["usage"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Counts one Claude call for the logged-in user. true = allowed.
      increment_usage: {
        Args: { max_per_day: number };
        Returns: boolean;
      };
    };
  };
};
