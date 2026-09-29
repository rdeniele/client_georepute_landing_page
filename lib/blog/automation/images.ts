/**
 * Featured images for the automation, from the Unsplash API. Kept free of secrets and `server-only`: the
 * caller passes the access key and (in tests) a scripted `fetch`.
 *
 * Follows Unsplash's API guidelines: photos are hotlinked from images.unsplash.com (the URL the API
 * returns, unchanged), a download is reported to Unsplash when a photo is chosen, and the photographer and
 * Unsplash are credited with UTM-tagged links wherever the photo is shown.
 *
 * An image is a nice-to-have: `find` never throws, and returns null when there is no key, no result, or
 * the API refuses (including the rate limit), so an article is never held back by it.
 */

export type ImageCredit = {
  /** The exact image URL this credit belongs to. The credit is only shown while the post still uses that URL. */
  url: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
  sourceName: "Unsplash";
  sourceUrl: string;
};

export type FeaturedImage = { url: string; credit: ImageCredit };

export interface ImageFinder {
  /** `seed` (the topic id) spreads similar queries over different results, so two articles rarely share a photo. */
  find(query: string, seed: string): Promise<FeaturedImage | null>;
}

const API = "https://api.unsplash.com";
const IMAGE_HOST = "images.unsplash.com";

type UnsplashPhoto = {
  urls?: { regular?: string };
  user?: { name?: string; links?: { html?: string } };
  links?: { html?: string; download_location?: string };
};

const tagged = (href: string, app: string) => {
  const u = new URL(href);
  u.searchParams.set("utm_source", app);
  u.searchParams.set("utm_medium", "referral");
  return u.toString();
};

const isHttps = (href: unknown, host?: string): href is string => {
  if (typeof href !== "string") return false;
  try {
    const u = new URL(href);
    return u.protocol === "https:" && (!host || u.hostname === host);
  } catch {
    return false;
  }
};

/** Small stable hash, so the same topic always picks the same result. */
function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h;
}

export function createUnsplashFinder(o: { accessKey: string; appName: string; fetchImpl?: typeof fetch }): ImageFinder {
  const doFetch = o.fetchImpl ?? fetch;
  const headers = { Authorization: `Client-ID ${o.accessKey}`, "Accept-Version": "v1" };

  return {
    async find(query, seed) {
      const q = query.replace(/\s+/g, " ").trim().slice(0, 100);
      if (!o.accessKey || q.length < 2) return null;
      try {
        const url = `${API}/search/photos?${new URLSearchParams({ query: q, per_page: "10", orientation: "landscape", content_filter: "high" })}`;
        const res = await doFetch(url, { headers, signal: AbortSignal.timeout(10_000) });
        if (!res.ok) return null;
        const body = (await res.json()) as { results?: UnsplashPhoto[] };
        const usable = (body.results ?? []).filter(
          (p) => isHttps(p.urls?.regular, IMAGE_HOST) && p.user?.name && isHttps(p.user.links?.html, "unsplash.com") && isHttps(p.links?.html, "unsplash.com"),
        );
        if (!usable.length) return null;
        const photo = usable[hash(seed) % usable.length];

        // Unsplash asks for a download to be reported when a photo is used. Best effort: it never blocks the article.
        if (isHttps(photo.links?.download_location, "api.unsplash.com")) {
          await doFetch(photo.links.download_location, { headers, signal: AbortSignal.timeout(5_000) }).catch(() => {});
        }

        const image = photo.urls!.regular!;
        return {
          url: image,
          credit: {
            url: image,
            photographer: photo.user!.name!.slice(0, 100),
            photographerUrl: tagged(photo.user!.links!.html!, o.appName),
            photoUrl: tagged(photo.links!.html!, o.appName),
            sourceName: "Unsplash",
            sourceUrl: tagged("https://unsplash.com/", o.appName),
          },
        };
      } catch {
        return null;
      }
    },
  };
}

/** Reads a stored credit defensively (it comes from a jsonb column). Null unless it belongs to `imageUrl`. */
export function creditFor(imageUrl: string | null | undefined, raw: unknown): ImageCredit | null {
  if (!imageUrl || !raw || typeof raw !== "object") return null;
  const c = raw as Partial<ImageCredit>;
  if (c.url !== imageUrl || typeof c.photographer !== "string") return null;
  if (!isHttps(c.photographerUrl, "unsplash.com") || !isHttps(c.sourceUrl, "unsplash.com") || !isHttps(c.photoUrl, "unsplash.com")) return null;
  return c as ImageCredit;
}
