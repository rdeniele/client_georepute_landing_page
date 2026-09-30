import type { ReactNode } from "react";

/**
 * Small building blocks shared by every admin screen. The point of all of them is the same: a first-time user should
 * never have to guess what something is, what to do next, or whether something is wrong. Server-safe (no client
 * JavaScript): help popovers are native <details>, so they work everywhere and are keyboard accessible for free.
 */

export type Tone = "info" | "success" | "warn" | "error";

/** A message with a clear title, a plain explanation and, when there is something to do, a button. */
export function Callout({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className={`ui-callout ui-callout--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="ui-callout__icon" aria-hidden="true">
        {tone === "success" ? "✓" : tone === "info" ? "i" : "!"}
      </span>
      <div className="ui-callout__body">
        <strong>{title}</strong>
        {children ? <div>{children}</div> : null}
      </div>
      {action ? (
        <a className="admin-btn admin-btn--ghost ui-callout__action" href={action.href}>
          {action.label}
        </a>
      ) : null}
    </div>
  );
}

/** A small "?" next to a label. Opens a short plain-language explanation. */
export function HelpTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="ui-help">
      <summary aria-label={`What is ${label}?`}>?</summary>
      <div className="ui-help__pop" role="note">
        <strong>{label}</strong>
        <div>{children}</div>
      </div>
    </details>
  );
}

/** A form or page section with a number, a title and one sentence saying what it is for. */
export function Section({
  step,
  title,
  description,
  children,
  id,
}: {
  step?: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="ui-section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <header className="ui-section__head">
        {step ? (
          <span className="ui-section__step" aria-hidden="true">
            {step}
          </span>
        ) : null}
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="ui-section__title">
            {title}
          </h2>
          {description ? <p className="ui-section__desc">{description}</p> : null}
        </div>
      </header>
      <div className="ui-section__body">{children}</div>
    </section>
  );
}

export type ChecklistEntry = {
  done: boolean;
  title: string;
  detail?: ReactNode;
  action?: { label: string; href: string };
  /** Something that is nice to have rather than needed. Shown, but never blocks the "all set" state. */
  optional?: boolean;
};

/** "Getting started" style list. Every open item says what it is and gives one button to do it. */
export function Checklist({ items }: { items: ChecklistEntry[] }) {
  return (
    <ol className="ui-checklist">
      {items.map((item) => (
        <li key={item.title} className={item.done ? "is-done" : undefined}>
          <span className="ui-checklist__mark" aria-hidden="true">
            {item.done ? "✓" : ""}
          </span>
          <div className="ui-checklist__text">
            <strong>
              {item.title}
              {item.optional ? <span className="ui-tag">optional</span> : null}
              <span className="ui-sr">{item.done ? " (done)" : " (to do)"}</span>
            </strong>
            {item.detail ? <span>{item.detail}</span> : null}
          </div>
          {!item.done && item.action ? (
            <a className="admin-btn admin-btn--ghost" href={item.action.href}>
              {item.action.label}
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** "1 → 2 → 3" strip that explains how a feature works, with a live number under each step when there is one. */
export function Flow({ steps }: { steps: { title: string; text: string; count?: number; countLabel?: string; href?: string; download?: boolean }[] }) {
  return (
    <ol className="ui-flow">
      {steps.map((s, i) => {
        const body = (
          <>
            <span className="ui-flow__n" aria-hidden="true">
              {i + 1}
            </span>
            <strong>{s.title}</strong>
            <span className="ui-flow__text">{s.text}</span>
            {s.count !== undefined ? (
              <span className="ui-flow__count">
                <b>{s.count.toLocaleString("en-US")}</b> {s.countLabel}
              </span>
            ) : null}
          </>
        );
        return <li key={s.title}>{s.href ? <a href={s.href} download={s.download ? "" : undefined}>{body}</a> : <div>{body}</div>}</li>;
      })}
    </ol>
  );
}

/** What a list shows before there is anything in it: what this is, and the one thing to do. */
export function EmptyState({ title, children, actions }: { title: string; children?: ReactNode; actions?: { label: string; href: string; primary?: boolean }[] }) {
  return (
    <div className="ui-empty">
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {actions?.length ? (
        <div className="ui-empty__actions">
          {actions.map((a) => (
            <a key={a.label} className={`admin-btn ${a.primary ? "admin-btn--primary" : "admin-btn--ghost"}`} href={a.href}>
              {a.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Page title block: what this page is, in one sentence, plus the main action. */
export function PageHead({ title, children, action }: { title: string; children?: ReactNode; action?: { label: string; href: string } }) {
  return (
    <div className="admin-header">
      <div>
        <h1>{title}</h1>
        {children ? <div className="admin-header__sub">{children}</div> : null}
      </div>
      {action ? (
        <a className="admin-btn admin-btn--primary" href={action.href}>
          {action.label}
        </a>
      ) : null}
    </div>
  );
}

/** A field label with an optional "?" beside it (not inside it, so clicking the help never touches the field). */
export function FieldLabel({ htmlFor, children, help }: { htmlFor: string; children: ReactNode; help?: { label: string; text: ReactNode } }) {
  return (
    <div className="ui-label">
      <label htmlFor={htmlFor}>{children}</label>
      {help ? <HelpTip label={help.label}>{help.text}</HelpTip> : null}
    </div>
  );
}
