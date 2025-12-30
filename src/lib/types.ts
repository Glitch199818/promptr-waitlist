export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      memories: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          tool: string | null;
          name: string | null;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          tool?: string | null;
          name?: string | null;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          tool?: string | null;
          name?: string | null;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
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
};


