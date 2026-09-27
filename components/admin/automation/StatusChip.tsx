import { STATUS_HELP, STATUS_LABEL } from "@/lib/blog/automation/labels";
import type { VariantStatus } from "@/types/database.types";

/** One status, one look, everywhere: queue, overview and the post editor. The title explains what the status means. */
export function StatusChip({ status, label, tone }: { status?: VariantStatus; label?: string; tone?: string }) {
  const key = tone ?? status ?? "queued";
  return (
    <span className={`auto-chip auto-chip--${key}`} title={status ? STATUS_HELP[status] : undefined}>
      {label ?? (status ? STATUS_LABEL[status] : "")}
    </span>
  );
}
