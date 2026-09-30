import type { ReactNode } from "react";
import { initials, type Author } from "@/lib/authors";
import { blogPath } from "@/lib/utils/postLocale";
import { formatDate } from "@/lib/utils/format";
import type { PostLocale, PostWithAuthor } from "@/types/posts";
import type { BlogChromeCopy } from "@/lib/subpages/blogChrome";

/**
 * Who wrote this: name, photo, role, a short bio and where to find them. Readers use it to decide whether to trust the article, and
 * search engines and AI answers use the same facts (they are repeated in the article's structured data). Everything shown here was
 * typed by an admin in Admin > Authors, or is the built-in team description; links are https-only (lib/authors.ts).
 */
export function AuthorBox({ author, copy, teamMark }: { author: Author; copy: BlogChromeCopy; /** Shown as the avatar of the built-in team author (the site logo). Passed in so this file stays free of image imports. */ teamMark?: ReactNode }) {
  return (
    <section id="author" className="blog-author" aria-labelledby="author-name">
      <p className="t-label blog-author__label">{copy.writtenBy}</p>
      <div className="blog-author__head">
        <span className="blog-author__pic" aria-hidden="true">
          {author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatarUrl} alt="" loading="lazy" decoding="async" />
          ) : author.isTeam && teamMark ? (
            teamMark
          ) : (
            initials(author.name)
          )}
        </span>
        <div>
          <h2 id="author-name" className="blog-author__name">
            {author.name}
          </h2>
          {author.jobTitle ? <p className="blog-author__role">{author.jobTitle}</p> : null}
        </div>
      </div>
      {author.bio ? <p className="blog-author__bio">{author.bio}</p> : null}
      {author.links.length > 0 ? (
        <ul className="blog-author__links">
          {author.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="me noopener noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** A short list of other articles by the same author, in the same language. Hidden when there are none. */
export function MoreByAuthor({ author, posts, locale, copy }: { author: Author; posts: PostWithAuthor[]; locale: PostLocale; copy: BlogChromeCopy }) {
  if (posts.length === 0) return null;
  return (
    <section className="blog-more" aria-labelledby="more-by-author">
      <h2 id="more-by-author" className="t-label blog-more__title">
        {copy.moreFrom(author.name)}
      </h2>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <a href={blogPath(locale, p.slug)}>
              <span className="blog-more__post">{p.title}</span>
              {p.published_at ? <time dateTime={p.published_at}>{formatDate(p.published_at)}</time> : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
