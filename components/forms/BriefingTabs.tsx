"use client";

import { useId, useState } from "react";
import { CalendlyEmbed } from "@/components/forms/CalendlyEmbed";
import { MeetingRequestForm } from "@/components/forms/MeetingRequestForm";

type TabId = "calendly" | "form";

/**
 * /briefing offers two ways to reach the team: book straight onto the
 * calendar, or send a message. Showing both as separate stacked cards read
 * as "two competing forms" on the page, so they share one card behind two
 * tabs instead — Calendly first, the message form second. If Calendly isn't
 * configured (see lib/services/calendly.ts) there's only the one tab.
 */
export function BriefingTabs({
  locale,
  calendlyUrl,
  booking,
  tabs,
}: {
  locale: string;
  calendlyUrl: string | null;
  booking: { title: string; hint: string };
  tabs: { calendly: string; form: string };
}) {
  const [active, setActive] = useState<TabId>(calendlyUrl ? "calendly" : "form");
  const baseId = useId();

  const items: { id: TabId; label: string }[] = [
    ...(calendlyUrl ? [{ id: "calendly" as const, label: tabs.calendly }] : []),
    { id: "form" as const, label: tabs.form },
  ];

  const tabId = (id: TabId) => `${baseId}-tab-${id}`;
  const panelId = (id: TabId) => `${baseId}-panel-${id}`;

  return (
    <div className="briefing-card briefing-tabs">
      {items.length > 1 ? (
        <div className="briefing-tabs__list" role="tablist">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={active === item.id}
              aria-controls={panelId(item.id)}
              tabIndex={active === item.id ? 0 : -1}
              className={`briefing-tabs__tab ${active === item.id ? "is-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {calendlyUrl ? (
        <div id={panelId("calendly")} role="tabpanel" aria-labelledby={tabId("calendly")} hidden={active !== "calendly"}>
          <h2 className="briefing-card__title">{booking.title}</h2>
          <p className="briefing-card__hint">{booking.hint}</p>
          <CalendlyEmbed url={calendlyUrl} locale={locale} />
        </div>
      ) : null}

      <div id={panelId("form")} role="tabpanel" aria-labelledby={tabId("form")} hidden={active !== "form"}>
        <MeetingRequestForm locale={locale} bare />
      </div>
    </div>
  );
}
