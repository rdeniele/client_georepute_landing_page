import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";
import { getPostCounts } from "@/lib/services/posts";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [profile, counts] = await Promise.all([
    getCurrentProfile(supabase),
    getPostCounts(supabase).catch(() => ({ total: 0, published: 0, drafts: 0 })),
  ]);

  const { published, drafts } = counts;

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
          <span className="admin-stat-card__value">{counts.total.toLocaleString("en-US")}</span>
          <span className="admin-stat-card__label">Total posts</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__value">{published.toLocaleString("en-US")}</span>
          <span className="admin-stat-card__label">Published</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__value">{drafts.toLocaleString("en-US")}</span>
          <span className="admin-stat-card__label">Drafts</span>
        </div>
      </div>

      <h2 className="admin-section-title">Sections</h2>
      <div className="admin-quicklinks">
        <a className="admin-quicklink" href="/admin/blogs">
          <span className="admin-quicklink__title">Blog Posts</span>
          <span className="admin-quicklink__desc">Create, edit and publish blog content.</span>
        </a>
        <a className="admin-quicklink" href="/admin/automation">
          <span className="admin-quicklink__title">AI Content Automation</span>
          <span className="admin-quicklink__desc">Upload topics once; Claude writes, translates and publishes them on a schedule.</span>
        </a>
        <a className="admin-quicklink" href="/admin/blogs/new">
          <span className="admin-quicklink__title">New Post</span>
          <span className="admin-quicklink__desc">Start writing a new blog post.</span>
        </a>
      </div>
    </>
  );
}
