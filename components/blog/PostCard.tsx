import Image from "next/image";
import logo from "@/public/brand/logo-g-mark.png";
import type { PostWithAuthor } from "@/types/posts";
import { formatDate } from "@/lib/utils/format";
import { getFirstContentImage } from "@/lib/utils/blocks";

export function PostCard({ post }: { post: PostWithAuthor }) {
  // Falls back to the first image already uploaded into the post body when
  // there's no separate featured image set, before giving up to the
  // branded placeholder.
  const cardImage = post.featured_image || getFirstContentImage(post.content_blocks);

  return (
    <a className="kit-card blog-card" href={`/blog/${post.slug}`}>
      <div className="blog-card__media">
        {cardImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cardImage} alt="" loading="lazy" />
        ) : (
          <div className="blog-card__media-fallback" aria-hidden="true">
            <Image src={logo} alt="" width={40} height={40} />
          </div>
        )}
      </div>
      <div className="blog-card__body">
        {post.category ? <span className="t-label blog-card__category">{post.category}</span> : null}
        <h3 className="t-h4 blog-card__title">{post.title}</h3>
        {post.excerpt ? <p className="t-body blog-card__excerpt">{post.excerpt}</p> : null}
        <div className="blog-card__meta">
          {post.published_at ? <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> : null}
          {post.author?.full_name ? <span>{post.author.full_name}</span> : null}
        </div>
      </div>
    </a>
  );
}
