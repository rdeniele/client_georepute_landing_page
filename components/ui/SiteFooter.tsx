import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import logo from "@/public/brand/logo-g-mark.png";
import { footer as f } from "@/lib/content";
import { getLocaleCopy, localizeNav, localizePath, normalizeLocale } from "@/lib/i18n";

type FooterLink = { label: string; href: string; external?: boolean };

/** The group's other companies. Names are brands and are never translated; only the one-line descriptions are. */
const ECOSYSTEM = [
  { name: "GINTEX", href: "https://gintex.com/", desc: "ecoGintex" },
  { name: "copyup.ai", href: "https://copyup.ai/", desc: "ecoCopyup" },
  { name: "onlineperception.ai", href: "https://onlineperception.ai/", desc: "ecoOnlinePerception" },
] as const;

/**
 * Every destination here already exists in the app (see ROUTES in
 * app/[locale]/[...slug]/page.tsx and the section ids on the Methodology page).
 * Add a link only once its route or anchor is real: no placeholders, and no
 * social icons until the official profile URLs are confirmed. Labels come from
 * localizeNav() so the footer reads the same as the header in every language.
 */
export function SiteFooter({ locale = "en" }: { locale?: string }) {
  const loc = normalizeLocale(locale);
  const c = getLocaleCopy(locale).footer;
  const nv = localizeNav(locale);
  const p = (path: string) => localizePath(path, loc);

  const platformGroup = nv.groups[0];
  const enginesGroup = nv.groups.find((g) => g.id === "engines");
  const [howItWorks, , reports, blog] = nv.links;
  const methodology = p("/en/methodology");

  const unique = (links: FooterLink[]) => links.filter((l, i, all) => all.findIndex((x) => x.href === l.href) === i);

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: c.product,
      links: unique([
        ...platformGroup.items.map((i) => ({ label: i.name, href: i.href })),
        { label: c.bookDemo, href: p("/en/briefing") },
      ]),
    },
    {
      title: c.intelligence,
      links: unique([
        ...(enginesGroup && "more" in enginesGroup ? [{ label: enginesGroup.label, href: enginesGroup.more.href }] : []),
        ...(enginesGroup ? enginesGroup.items.map((i) => ({ label: i.name, href: i.href })) : []),
        { label: reports.label, href: reports.href },
      ]),
    },
    {
      title: c.methodology,
      links: [
        { label: howItWorks.label, href: howItWorks.href },
        { label: c.geon, href: `${methodology}#geon` },
        { label: c.evidence, href: `${methodology}#evidence` },
        { label: c.confidence, href: `${methodology}#confidence` },
        { label: c.financial, href: `${methodology}#financial` },
        { label: c.limits, href: `${methodology}#limits` },
      ],
    },
    {
      title: c.company,
      links: [
        // The blog is not locale-prefixed and stays "Blog" in every language, same as the header.
        { label: blog.label, href: blog.href },
        { label: nv.signIn.label, href: nv.signIn.href },
        { label: c.privacy, href: p("/en/privacy") },
        { label: c.emailUs, href: `mailto:${CONTACT.email}`, external: true },
        { label: c.whatsapp, href: CONTACT.whatsappHref, external: true },
        { label: nv.cta.label, href: nv.cta.href, external: true },
      ],
    },
  ];

  return (
    <footer className="foot">
      <div className="shell foot__shell">
        <div className="foot__intro">
          <Link href={`/${loc}`} className="foot__brand" aria-label={`${f.brand} home`}>
            <Image src={logo} alt="" width={40} height={40} className="foot__logo" />
          </Link>
          <span className="foot__powered">{c.poweredBy}</span>
          <span className="foot__tagline">{c.tagline}</span>
          <span className="foot__note t-editorial">{c.note}</span>
        </div>

        <nav className="foot__cols" aria-label={f.brand}>
          {columns.map((col) => (
            <div className="foot__col" key={col.title}>
              <h2 className="foot__head">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="foot__col foot__col--eco">
            <h2 className="foot__head">{c.ecosystem}</h2>
            <ul>
              {ECOSYSTEM.map((e) => (
                <li key={e.href}>
                  <a href={e.href} target="_blank" rel="noopener noreferrer" className="foot__eco">
                    <span className="foot__eco-name">
                      {e.name} <span aria-hidden="true">&#8599;</span>
                    </span>
                    <span className="foot__eco-desc">{c[e.desc]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="foot__bottom">
          <p className="foot__disclaimer">{c.disclaimer}</p>
          {/* Credits and trademark notice. The footer's own logo is GeoRepute's mark; there is no photography on the
              site yet (photo slots render placeholder plates), so no photo credit belongs here until real photos ship. */}
          <p className="foot__credits">
            {c.trademarks} {c.iconCredit}
          </p>
          <div className="foot__bar">
            <span>
              &copy; {new Date().getFullYear()} {f.brand}. {c.rights}
            </span>
            <span>{c.demoNote}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
