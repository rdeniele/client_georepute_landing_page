import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";
import { getAllPosts } from "@/lib/services/posts";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [profile, posts] = await Promise.all([
    getCurrentProfile(supabase),
    getAllPosts(supabase).catch(() => []),
  ]);

  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-card__value">{posts.length}</span>
          <span className="admin-stat-card__label">Total posts</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__value">{published}</span>
          <span className="admin-stat-card__label">Published</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__value">{drafts}</span>
          <span className="admin-stat-card__label">Drafts</span>
        </div>
      </div>

      <h2 className="admin-section-title">Sections</h2>
      <div className="admin-quicklinks">
        <a className="admin-quicklink" href="/admin/blogs">
          <span className="admin-quicklink__title">Blog Posts</span>
          <span className="admin-quicklink__desc">Create, edit and publish blog content.</span>
        </a>
        <a className="admin-quicklink" href="/admin/blogs/new">
          <span className="admin-quicklink__title">New Post</span>
          <span className="admin-quicklink__desc">Start writing a new blog post.</span>
        </a>
      </div>
    </>
  );
}
