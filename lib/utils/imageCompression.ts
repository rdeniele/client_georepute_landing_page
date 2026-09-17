const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.82;

export type CompressedImage = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
};

function withWebpExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return `${dot > 0 ? name.slice(0, dot) : name}.webp`;
}

/**
 * Downscales oversized images and re-encodes them as WebP entirely in the
 * browser (Canvas API — no server round-trip). Animated GIFs are left
 * untouched since re-encoding would flatten them to a single frame. Falls
 * back to the original file if the "optimized" version isn't actually
 * smaller, or if canvas/blob conversion isn't available.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const passthrough: CompressedImage = { file, originalBytes: file.size, optimizedBytes: file.size };
  if (file.type === "image/gif") return passthrough;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return passthrough;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
    if (!blob || blob.size >= file.size) return passthrough;

    const optimized = new File([blob], withWebpExtension(file.name), { type: "image/webp" });
    return { file: optimized, originalBytes: file.size, optimizedBytes: optimized.size };
  } catch {
    return passthrough;
  }
}
