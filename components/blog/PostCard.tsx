import Image from "next/image";
import logo from "@/public/brand/logo-g-mark.png";
import type { PostWithAuthor } from "@/types/posts";
import { formatDate } from "@/lib/utils/format";

export function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <a className="kit-card blog-card" href={`/blog/${post.slug}`}>
      <div className="blog-card__media">
        {post.featured_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image} alt="" loading="lazy" />
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
