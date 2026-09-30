import { PageHead } from "@/components/admin/ui/kit";

export const metadata = { title: "Help | GeoRepute Admin" };

/**
 * The help page: everything a first-time user needs, in plain words, on one page. Written for someone who has never used a
 * CMS or heard of SEO. Anchors (#ai-key, #photos, #scheduler, #database) are linked from the checklists and warnings.
 */
export default function AdminHelpPage() {
  return (
    <>
      <PageHead title="Help">Plain-language answers for writing and publishing. No experience needed.</PageHead>

      <nav aria-label="Help topics">
        <ul className="ui-flow" style={{ marginBottom: 8 }}>
        {[
          ["#basics", "The basics", "Drafts, live posts and how a post gets on the website."],
          ["#seo", "The search boxes explained", "What each box under “Get found” is for."],
          ["#auto", "The AI Auto-Writer", "How it works and what each status means."],
          ["#authors", "Authors", "Who wrote an article, and the author box readers see."],
          ["#setup", "One-time setup", "AI key, photos, scheduler and database."],
          ["#problems", "Something is wrong", "The most common problems and their fixes."],
        ].map(([href, title, text]) => (
          <li key={href}>
            <a href={href}>
              <strong>{title}</strong>
              <span className="ui-flow__text">{text}</span>
            </a>
          </li>
        ))}
        </ul>
      </nav>

      <div className="ui-prose">
        <h2 id="basics">The basics</h2>
        <p>
          Every post is either a <strong>Draft</strong> or <strong>Live</strong>. A draft is private: only people signed in here can see it. A live post is on
          your website, visible to everyone and to Google. Saving a post never makes it live by itself. You always press <strong>Publish</strong> on purpose.
        </p>
        <ol>
          <li>
            Go to <a href="/admin/blogs/new">Write a post</a>. Type a title and write your article. Or open “Let AI write a first draft” at the top, describe the
            topic, and edit what comes back.
          </li>
          <li>
            Under <strong>Get found on Google and AI</strong>, press <strong>Optimize for search</strong>. The AI fills in the boxes you would otherwise have to
            understand. You can change anything.
          </li>
          <li>
            Press <strong>Save</strong>. The post is saved as a draft. Open it from <a href="/admin/blogs">Posts</a> and press <strong>Publish</strong> when you
            are happy.
          </li>
        </ol>
        <p>
          Changed your mind? <strong>Take offline</strong> turns a live post back into a draft. The address and the text are kept.
        </p>

        <h2 id="seo">The search boxes explained</h2>
        <p>
          SEO means helping people (and AI tools such as ChatGPT) find your post. You do not have to learn it: the <strong>SEO assistant</strong> fills these boxes
          for you. This is what they mean:
        </p>
        <dl>
          <dt>Web address</dt>
          <dd>The last part of the link to your post, for example <code>/blog/how-to-get-more-reviews</code>. Short and readable is best. Once a post is live, do not change it, because old links would break.</dd>
          <dt>Short summary</dt>
          <dd>One or two sentences shown on the blog list, next to the post title.</dd>
          <dt>Google headline (meta title)</dt>
          <dd>The blue title people see in Google results. Keep it under 60 characters, or Google cuts it off. Put the main phrase people would search for near the start.</dd>
          <dt>Google description (meta description)</dt>
          <dd>The two grey lines under the headline in Google. 120 to 160 characters. Say what the reader will learn and why it is worth clicking.</dd>
          <dt>Keywords</dt>
          <dd>The phrases people type into Google. The first one is the most important and should appear in the headline and the first paragraph.</dd>
          <dt>Questions and answers (FAQ)</dt>
          <dd>Short answers to questions readers ask next. Google and AI tools like to quote these directly, so they help you get found.</dd>
          <dt>Category and tags</dt>
          <dd>How posts are grouped on the blog. One category per post, a few tags.</dd>
        </dl>
        <p>
          The <strong>Autocomplete</strong> button fills only the empty boxes and leaves what you typed. <strong>Optimize for search</strong> rewrites the search boxes
          for the best result. Neither changes your article, and both have an Undo.
        </p>

        <h2 id="auto">The AI Auto-Writer</h2>
        <p>
          You give it a list of topics. It writes each article, adapts it into every language you choose (not word for word, but written for readers of that
          language), adds a photo, and publishes on a schedule. You stay in control:
        </p>
        <ul>
          <li>
            <strong>Ask me first</strong>: every article waits for your OK. Press Approve and it goes live at its scheduled time.
          </li>
          <li>
            <strong>Fully automatic</strong>: articles that pass all checks go live by themselves. Use this once you trust the results.
          </li>
          <li>
            <strong>I publish by hand</strong> (the safest, and where new setups start): articles are written but never go live until you press Publish.
          </li>
        </ul>
        <p>What the statuses mean:</p>
        <dl>
          <dt>Waiting</dt>
          <dd>The topic is in the list. It has not been picked yet.</dd>
          <dt>Being written</dt>
          <dd>The AI is writing or translating it right now.</dd>
          <dt>Ready for your OK</dt>
          <dd>Written and checked. Read it, then Approve or edit it.</dd>
          <dt>Scheduled</dt>
          <dd>Approved. It goes live by itself at the time shown.</dd>
          <dt>Live</dt>
          <dd>On your website.</dd>
          <dt>Needs your attention</dt>
          <dd>A check found a problem (for example a broken link or the wrong language), or the AI failed several times. It will not go live until you fix it or retry it.</dd>
          <dt>Skipped</dt>
          <dd>You told it to leave this topic alone. You can bring it back.</dd>
        </dl>

        <h2 id="authors">Authors</h2>
        <p>
          Under every article readers see a box with the author&apos;s name, photo, role and a short bio, plus a list of that author&apos;s other articles. Google and AI tools use the same
          facts to judge whether an article can be trusted, so a real name with a real bio helps.
        </p>
        <ul>
          <li>
            Add people under <a href="/admin/authors">Authors</a>. Only add real people and only information you are happy to show publicly.
          </li>
          <li>Pick the author of a post in step 3 of the post editor.</li>
          <li>
            Tick <strong>Use as the default author</strong> on one author, and the AI-written articles (and posts with no author chosen) are shown under them. With none, they show
            &ldquo;GeoRepute Editorial Team&rdquo;.
          </li>
        </ul>
        <p>
          The pictures and charts the Auto-Writer adds inside articles have a written description for screen readers and search engines. Charts are drawn from real numbers only when you
          put those numbers in the topic notes; otherwise they are clearly labelled &ldquo;illustrative example, not real data&rdquo;.
        </p>

        <h2 id="setup">One-time setup</h2>
        <p>
          These are done once, by whoever manages the website&apos;s hosting (Vercel) and database (Supabase). If that is not you, send this section to them. After
          changing anything in Vercel, <strong>redeploy</strong>: new settings only apply to a new deployment.
        </p>
        <h3 id="ai-key">Connect the AI</h3>
        <p>
          In Vercel: Project → Settings → Environment Variables. Add <code>ANTHROPIC_API_KEY</code> (a key from console.anthropic.com) for Production. Redeploy.
        </p>
        <h3 id="photos">Automatic photos</h3>
        <p>
          Create a free app at unsplash.com/developers and copy its <em>Access Key</em>. Add it in Vercel as <code>UNSPLASH_ACCESS_KEY</code> for Production, and
          optionally <code>UNSPLASH_APP_NAME</code>. Redeploy. Only articles written after this get photos: one main picture, plus the pictures inside the article (you choose how many in Settings). Add photos to older articles by hand. Unsplash allows 50
          requests an hour for a new app, so a big batch may finish without photos for some articles.
        </p>
        <h3 id="scheduler">The scheduler</h3>
        <p>
          It is what writes and publishes by itself, even when nobody has this page open. It needs <code>CRON_SECRET</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          in Vercel, and a cron job that calls <code>/api/cron/blog-automation</code>. Without it, articles are only written when you press{" "}
          <strong>Write now</strong>. Full steps: <code>SUPABASE_SETUP.md</code>, Step 13.
        </p>
        <h3 id="author-table">Authors table</h3>
        <p>
          To add real authors, run the SQL in <code>SUPABASE_SETUP.md</code>, Step 14, once. It is safe to run again. Without it everything works, and articles show the built-in team as the
          author.
        </p>
        <h3 id="database">Database tables</h3>
        <p>
          The Auto-Writer stores its topics in the database. Run the SQL in <code>SUPABASE_SETUP.md</code>, Step 13, once, in the Supabase SQL Editor. It is safe to
          run again.
        </p>

        <h2 id="problems">Something is wrong</h2>
        <dl>
          <dt>My post is saved but not on the website</dt>
          <dd>It is still a draft. Open Posts and press Publish. A post can also be scheduled for a future time; it appears then.</dd>
          <dt>The AI says it is not configured</dt>
          <dd>The AI key is missing or wrong on the server. See “Connect the AI” above.</dd>
          <dt>An article has no photo</dt>
          <dd>Open the article in the Auto-Writer list. It says why. Most often the Unsplash key is missing, or it was added but the site was not redeployed.</dd>
          <dt>An article says “Needs your attention”</dt>
          <dd>Open it. Each problem is listed in plain words. Fix it in the editor, or press Retry to have the AI write it again.</dd>
          <dt>The Auto-Writer is not doing anything</dt>
          <dd>Check the top of its Overview page. It tells you if it is off, paused, waiting, or missing a setup step.</dd>
          <dt>The SEO score is low</dt>
          <dd>Press Optimize for search, then read the to-do list under it. Usually it is one or two things in your own text, such as a long first paragraph.</dd>
        </dl>
      </div>
    </>
  );
}
