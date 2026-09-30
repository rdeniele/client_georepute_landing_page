import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAuthors } from "@/lib/services/authors";
import { TEAM_NAME, initials } from "@/lib/authors";
import { AuthorForm } from "@/components/admin/AuthorForm";
import { Callout, PageHead, Section } from "@/components/admin/ui/kit";

export const metadata = { title: "Authors | GeoRepute Admin" };

export default async function AdminAuthorsPage() {
  const supabase = await createSupabaseServerClient();
  const authors = await listAuthors(supabase);

  return (
    <>
      <PageHead title="Authors">
        Who wrote your articles. Readers see the author&apos;s name, photo and bio under every article, with a list of their other articles. Search engines and AI tools also take the author into account when deciding whom to trust.
      </PageHead>

      {authors === null ? (
        <Callout tone="warn" title="One quick setup step is needed" action={{ label: "See how", href: "/admin/help#author-table" }}>
          Someone who manages the database needs to run <strong>SUPABASE_SETUP.md, Step 14</strong> once. Until then, every article shows &ldquo;{TEAM_NAME}&rdquo; as its author, which is fine.
        </Callout>
      ) : (
        <>
          {authors.length === 0 ? (
            <Callout tone="info" title={`Right now every article shows “${TEAM_NAME}”`}>
              That is the built-in author. Add a real person below if you would like articles to carry a name, photo and bio. You can mark one as the default so AI-written articles use it too.
            </Callout>
          ) : null}

          <Section step={1} title="Add an author" description="Only add real people, and only information you are happy to show publicly. It appears on the website.">
            <AuthorForm />
          </Section>

          {authors.length > 0 ? (
            <Section step={2} title="Your authors" description="Open one to change it. Changes appear on the website straight away.">
              <div className="ui-author-list">
                {authors.map((a) => (
                  <details key={a.id} className="ui-author-item">
                    <summary>
                      <span className="ui-author-item__pic" aria-hidden="true">
                        {a.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.avatar_url} alt="" />
                        ) : (
                          initials(a.name)
                        )}
                      </span>
                      <span className="ui-author-item__text">
                        <strong>{a.name}</strong>
                        <span>{a.job_title || "No job title"}</span>
                      </span>
                      {a.is_default ? <span className="ui-badge">default</span> : null}
                    </summary>
                    <div className="ui-author-item__body">
                      <AuthorForm author={a} />
                    </div>
                  </details>
                ))}
              </div>
            </Section>
          ) : null}
        </>
      )}
    </>
  );
}
