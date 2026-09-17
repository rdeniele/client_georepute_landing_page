import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { compressImage } from "@/lib/utils/imageCompression";

type Client = SupabaseClient<Database>;

/** Must match the bucket name created manually in Supabase Storage — see SUPABASE_SETUP.md Step 6. */
export const BLOG_IMAGES_BUCKET = "blog-images";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "jpg";
  return `${base || "image"}.${ext}`;
}

/**
 * Uploads a featured or in-article image to the `blog-images` bucket and
 * returns its public URL. Runs from the browser client — Storage RLS
 * (SUPABASE_SETUP.md Step 6) is what actually restricts writes to admins,
 * this is just client-side validation for a fast error message.
 *
 * Images are downscaled/re-encoded to WebP client-side first (see
 * lib/utils/imageCompression.ts) so the author never has to think about
 * resizing or compressing before uploading.
 */
export async function uploadBlogImage(
  supabase: Client,
  file: File,
): Promise<{ path: string; publicUrl: string; originalBytes: number; optimizedBytes: number }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Failed to upload image: only JPEG, PNG, WebP, GIF or AVIF files are allowed.");
  }

  const { file: optimized, originalBytes, optimizedBytes } = await compressImage(file);

  if (optimized.size > MAX_UPLOAD_BYTES) {
    throw new Error("Failed to upload image: file is larger than 5MB even after optimization.");
  }

  const path = `posts/${crypto.randomUUID()}-${sanitizeFileName(optimized.name)}`;

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, optimized, {
    cacheControl: "3600",
    upsert: false,
    contentType: optimized.type,
  });

  if (error) throw new Error(`Failed to upload image: ${error.message}`);

  const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl, originalBytes, optimizedBytes };
}

/** Deletes an image from the bucket by its storage path (not its public URL — see `pathFromPublicUrl`). */
export async function deleteBlogImage(supabase: Client, path: string): Promise<void> {
  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).remove([path]);
  if (error) throw new Error(`Failed to delete image: ${error.message}`);
}

/** Recovers the storage path from a public URL previously returned by `uploadBlogImage`, so an old featured image can be deleted when it's replaced. */
export function pathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${BLOG_IMAGES_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}
