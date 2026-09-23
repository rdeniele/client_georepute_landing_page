import { redirect } from "next/navigation";

// /briefing moved under the locale segment so it renders in the visitor's own
// language and direction. This keeps the old bookmarked/shared URL working.
export default function BriefingRedirect() {
  redirect("/en/briefing");
}
