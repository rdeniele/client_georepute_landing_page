import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/services/profiles";
import { getSetupState } from "@/lib/admin/setup";
import { Files, PencilSimpleLine, Robot } from "@phosphor-icons/react/ssr";
import { Callout, Checklist, PageHead, type ChecklistEntry } from "@/components/admin/ui/kit";

export const metadata = { title: "Home | GeoRepute Admin" };

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  const [profile, setup] = await Promise.all([getCurrentProfile(supabase), getSetupState(supabase)]);
  const drafts = Math.max(0, setup.posts - setup.published);

  // Each item says what it is, why it matters, and gives one button. "Optional" items never block the all-set state.
  const items: ChecklistEntry[] = [
    {
      done: setup.aiKey,
      title: "Connect the AI",
      detail: "The AI writes drafts, translations and search descriptions. It needs a key saved on the server once.",
      action: { label: "How to do it", href: "/admin/help#ai-key" },
    },
    {
      done: setup.posts > 0,
      title: "Write your first post",
      detail: "Type a title and a few paragraphs, or let the AI write a first draft for you.",
      action: { label: "Write a post", href: "/admin/blogs/new" },
    },
    {
      done: setup.published > 0,
      title: "Make a post live",
      detail: "New posts start as private drafts. Press “Publish” on a post to put it on your website.",
      action: { label: "Open your posts", href: "/admin/blogs" },
    },
    {
      done: setup.topics > 0,
      optional: true,
      title: "Try the AI Auto-Writer",
      detail: "Upload a list of topics and the AI writes, translates and publishes articles for you on a schedule.",
      action: { label: "Add topics", href: "/admin/automation/topics" },
    },
    {
      done: setup.photos,
      optional: true,
      title: "Turn on automatic photos",
      detail: "Adds a free photo from Unsplash to each article the AI writes.",
      action: { label: "How to do it", href: "/admin/help#photos" },
    },
    {
      done: setup.scheduler,
      optional: true,
      title: "Let the Auto-Writer run on its own",
      detail: "Without this, articles are only written when you press “Write now”. With it, they are written and published by themselves.",
      action: { label: "How to do it", href: "/admin/help#scheduler" },
    },
  ];
  const requiredDone = items.filter((i) => !i.optional).every((i) => i.done);
  const doneCount = items.filter((i) => i.done).length;

  return (
    <>
      <PageHead title={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}`}>
        This is where you write and publish the GeoRepute blog. Not sure where to start? Follow the steps below, or open the <a href="/admin/help">Help page</a>.
      </PageHead>

      <h2 className="admin-section-title">What would you like to do?</h2>
      <div className="ui-actions">
        <a className="ui-action" href="/admin/blogs/new">
          <span className="ui-action__icon" aria-hidden="true">
            <PencilSimpleLine weight="duotone" />
          </span>
          <strong>Write a post</strong>
          <span className="ui-action__text">Write it yourself, or let AI write a first draft from a topic. AI can also fill in all the search-engine boxes for you.</span>
          <span className="ui-action__go">Start writing →</span>
        </a>
        <a className="ui-action" href="/admin/automation">
          <span className="ui-action__icon" aria-hidden="true">
            <Robot weight="duotone" />
          </span>
          <strong>Let AI write posts for you</strong>
          <span className="ui-action__text">Upload a list of topics. AI writes each article, translates it into your languages and publishes it on a schedule.</span>
          <span className="ui-action__go">Open the AI Auto-Writer →</span>
        </a>
        <a className="ui-action" href="/admin/blogs">
          <span className="ui-action__icon" aria-hidden="true">
            <Files weight="duotone" />
          </span>
          <strong>Manage your posts</strong>
          <span className="ui-action__text">
            See everything you have written: <b>{setup.published.toLocaleString("en-US")}</b> live and <b>{drafts.toLocaleString("en-US")}</b> waiting as drafts. Edit, publish or take posts offline.
          </span>
          <span className="ui-action__go">Open your posts →</span>
        </a>
      </div>

      {!setup.automationTables ? (
        <Callout tone="warn" title="The AI Auto-Writer needs a one-time database setup" action={{ label: "See how", href: "/admin/help#database" }}>
          Its tables do not exist yet, so it cannot be used. Writing posts by hand works normally.
        </Callout>
      ) : null}

      <details className="ui-more" open={!requiredDone}>
        <summary>
          {requiredDone ? `Setup complete (${doneCount} of ${items.length} done). Show the checklist` : `Getting started: ${doneCount} of ${items.length} done`}
        </summary>
        <div style={{ marginTop: 12 }}>
          <Checklist items={items} />
        </div>
      </details>
    </>
  );
}
