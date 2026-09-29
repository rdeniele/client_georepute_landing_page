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

import type { Locale } from "@/lib/i18n";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = "draft" | "published";
/** Any language the site is localized in (lib/i18n.ts LOCALES); the database column is free text, validated by format. */
export type PostLocale = Locale;
export type ProfileRole = "admin" | "editor";

/* ---- AI content automation (SUPABASE_SETUP.md, Step 13) -------------------------------------- */

export type TopicStatus = "draft" | "queued" | "completed" | "skipped";
export type VariantStatus =
  | "queued"
  | "generating"
  | "localizing"
  | "needs_review"
  | "ready"
  | "scheduled"
  | "published"
  | "failed"
  | "skipped";

export type AutomationSettingsRow = {
  id: number;
  enabled: boolean;
  generation_paused: boolean;
  auto_publish: boolean;
  require_review: boolean;
  articles_per_day: number;
  language_mode: "all_languages" | "rotate";
  source_locale: string;
  /** null means every language the site supports, now and in the future. */
  languages: string[] | null;
  start_date: string | null;
  publish_time: string;
  timezone: string;
  spread_minutes: number;
  lookahead_days: number;
  max_attempts: number;
  concurrency: number;
  content_config: Json;
  backoff_until: string | null;
  plan_lock_until: string | null;
  last_tick_at: string | null;
  last_tick_summary: Json | null;
  updated_at: string;
}

export type BlogTopicRow = {
  id: string;
  topic: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  category: string | null;
  search_intent: string | null;
  notes: string | null;
  status: TopicStatus;
  /** Queue order. Lower is earlier. */
  position: number;
  scheduled_date: string | null;
  source_locale: string | null;
  plan_locales: string[];
  translation_group: string;
  created_at: string;
  updated_at: string;
}

export type BlogVariantRow = {
  id: string;
  topic_id: string;
  locale: string;
  is_source: boolean;
  status: VariantStatus;
  attempts: number;
  last_error: string | null;
  error_code: string | null;
  next_attempt_at: string | null;
  locked_until: string | null;
  post_id: string | null;
  scheduled_at: string | null;
  generated_at: string | null;
  published_at: string | null;
  validation: Json | null;
  meta: Json | null;
  created_at: string;
  updated_at: string;
}

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
          featured_image_credit: Json | null;
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
          meta_title: string | null;
          meta_description: string | null;
          keywords: string[];
          faq: Json | null;
          translation_group: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          featured_image_credit?: Json | null;
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
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[];
          faq?: Json | null;
          translation_group?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          featured_image_credit?: Json | null;
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
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[];
          faq?: Json | null;
          translation_group?: string | null;
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
      blog_automation_settings: {
        Row: AutomationSettingsRow;
        Insert: Partial<AutomationSettingsRow>;
        Update: Partial<AutomationSettingsRow>;
        Relationships: [];
      };
      blog_topics: {
        Row: BlogTopicRow;
        Insert: Partial<BlogTopicRow> & Pick<BlogTopicRow, "topic">;
        Update: Partial<BlogTopicRow>;
        Relationships: [];
      };
      blog_variants: {
        Row: BlogVariantRow;
        Insert: Partial<BlogVariantRow> & Pick<BlogVariantRow, "topic_id" | "locale">;
        Update: Partial<BlogVariantRow>;
        Relationships: [
          {
            foreignKeyName: "blog_variants_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "blog_topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_variants_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
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
