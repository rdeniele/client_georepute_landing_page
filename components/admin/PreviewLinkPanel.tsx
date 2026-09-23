"use client";

import { useActionState, useState } from "react";
import { regeneratePreviewLinkAction, type PreviewLinkState } from "@/lib/actions/posts";
import { getPreviewUrl } from "@/lib/utils/preview";
import { formatDate } from "@/lib/utils/format";
import type { Post } from "@/types/posts";

export function PreviewLinkPanel({ post }: { post: Post }) {
  const boundAction = regeneratePreviewLinkAction.bind(null, post.id);
  const initialState: PreviewLinkState = {
    error: null,
    token: post.preview_token,
    expiresAt: post.preview_expires_at,
  };
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [copied, setCopied] = useState(false);

  const url = getPreviewUrl(state.token);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the field is still selectable by hand.
    }
  }

  return (
    <div className="admin-preview-link">
      <h2 className="admin-section-title">Share draft preview</h2>
      <p className="admin-field__hint">
        Anyone with this link can view the post before it&apos;s published. It stops working the moment you
        regenerate it{state.expiresAt ? " or after it expires" : ""}. Publishing the post doesn&apos;t require it
        and doesn&apos;t revoke it.
      </p>

      <div className="admin-preview-link__row">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
          aria-label="Preview link"
        />
        <button type="button" className="admin-btn admin-btn--ghost" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="admin-field__hint">
        {state.expiresAt ? `Expires ${formatDate(state.expiresAt)}.` : "Never expires."}
      </p>

      <form action={formAction} className="admin-preview-link__row">
        <select name="expires_in_days" defaultValue="" aria-label="New link expiration">
          <option value="">Never expires</option>
          <option value="1">Expires in 1 day</option>
          <option value="7">Expires in 7 days</option>
          <option value="30">Expires in 30 days</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost" disabled={pending}>
          {pending ? "Regenerating…" : "Regenerate link"}
        </button>
      </form>

      {state.error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {state.error}
        </div>
      ) : null}
    </div>
  );
}
