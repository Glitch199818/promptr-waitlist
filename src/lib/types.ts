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
          variables: string[] | null;
          variable_defaults: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          tool?: string | null;
          name?: string | null;
          model?: string | null;
          variables?: string[] | null;
          variable_defaults?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          tool?: string | null;
          name?: string | null;
          model?: string | null;
          variables?: string[] | null;
          variable_defaults?: Json | null;
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
      page_views: {
        Row: {
          id: string;
          path: string;
          timestamp: string;
          referrer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          timestamp: string;
          referrer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          path?: string;
          timestamp?: string;
          referrer?: string | null;
          user_agent?: string | null;
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


