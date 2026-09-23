/**
 * Hand-written to match the SQL in SUPABASE_SETUP.md exactly. Once the
 * project is created and that SQL has been run, regenerate this file from
 * the live schema instead of maintaining it by hand:
 *
 *   npx supabase login
 *   npx supabase gen types typescript --project-id <your-project-ref> --schema public > types/database.types.ts
 *
 * (Project ref is the subdomain in the project URL, e.g.
 * "abcdefghijklmnop" from https://abcdefghijklmnop.supabase.co.)
 *
 * Regenerating is safe: as long as the table/column names below match the
 * SQL you ran, the generated file will have the same shape. Nothing else in
 * this codebase imports from the Supabase CLI, so there is no lock-in.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = "draft" | "published";
export type PostLocale = "en" | "he";
export type ProfileRole = "admin" | "editor";

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          author_id: string | null;
          category: string | null;
          tags: string[];
          status: PostStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          preview_token: string;
          preview_expires_at: string | null;
          content_blocks: Json | null;
          locale: PostLocale;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          author_id?: string | null;
          category?: string | null;
          tags?: string[];
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          preview_token?: string;
          preview_expires_at?: string | null;
          content_blocks?: Json | null;
          locale?: PostLocale;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          author_id?: string | null;
          category?: string | null;
          tags?: string[];
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          preview_token?: string;
          preview_expires_at?: string | null;
          content_blocks?: Json | null;
          locale?: PostLocale;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_post_by_preview_token: {
        Args: { token: string };
        Returns: Database["public"]["Tables"]["posts"]["Row"] | null;
      };
      regenerate_preview_link: {
        Args: { post_id: string; expires_in_days: number | null };
        Returns: Database["public"]["Tables"]["posts"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
