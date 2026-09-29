import { creditFor } from "@/lib/blog/automation/images";

/** "Photo by <photographer> on Unsplash", as Unsplash's API guidelines require, for an automatically chosen featured image. */
export function PhotoCredit({ image, credit }: { image: string | null; credit: unknown }) {
  const c = creditFor(image, credit);
  if (!c) return null;
  return (
    <p className="blog-photo-credit">
      Photo by{" "}
      <a href={c.photographerUrl} target="_blank" rel="noopener noreferrer">
        {c.photographer}
      </a>{" "}
      on{" "}
      <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
        {c.sourceName}
      </a>
    </p>
  );
}
