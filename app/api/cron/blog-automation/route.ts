import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { runAutomationTick } from "@/lib/services/blogAutomationRunner";

/**
 * The scheduler entry point for the AI blog automation. Something outside the app calls this every few
 * minutes (see SUPABASE_SETUP.md, Step 13): Vercel Cron, Supabase pg_cron, or any HTTP pinger. Each call
 * does one bounded slice of work (plan, generate, localize, publish) and returns a small JSON summary.
 *
 * Auth: the caller must send `Authorization: Bearer <CRON_SECRET>` (Vercel Cron does this by itself when
 * the CRON_SECRET environment variable is set). Without the secret nothing runs, and the response never
 * says why a request was refused.
 */
export const dynamic = "force-dynamic";
// A tick may spend most of this on Claude calls; jobs are only started while enough time remains.
export const maxDuration = 300;
const TICK_BUDGET_MS = 265_000;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  // Compare digests so the check takes the same time whatever the input and never throws on a length mismatch.
  const given = createHash("sha256").update(request.headers.get("authorization") ?? "").digest();
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(given, expected);
}

async function handle(request: NextRequest) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ ok: false, error: "The scheduler is not configured." }, { status: 503 });
  }
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const summary = await runAutomationTick(createSupabaseServiceClient(), "cron", TICK_BUDGET_MS);
    return NextResponse.json({ ok: true, summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[blog-automation] tick crashed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ ok: false, error: "The scheduler run failed." }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
