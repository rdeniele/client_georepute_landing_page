/**
 * Security checks for the hardening added from the security checklist review.
 *
 *   npm run security:check
 *
 * Covers: log redaction (no visitor data or secrets in server logs), safe link
 * schemes in blog content (no javascript: / data: URLs), the rate limiter that
 * protects the public meeting form and the AI actions, and static checks on the
 * configuration (security headers, no committed env files).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { createBudget } from "@/lib/utils/rateLimitCore";
import { describeError, redact } from "@/lib/utils/safeLog";
import { safeHref } from "@/lib/utils/safeHref";

let failures = 0;
let passes = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passes++;
    console.log(`  ok    ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? `: ${detail}` : ""}`);
  }
}

const TAB = String.fromCharCode(9);
const NL = String.fromCharCode(10);
const SOH = String.fromCharCode(1);

console.log("Log redaction");
const leak = "Invalid `to` field: dana.levi@example.co.il, phone +972 55-123-4567, key sk-ant-api03-AbCdEfGhIjKlMnOpQrStUv, Authorization: Bearer abc.DEF-123_xyz";
const out = redact(leak);
check("email addresses are removed", !/@|example\.co\.il/.test(out), out);
check("phone numbers are removed", !/972|123-4567/.test(out), out);
check("API keys are removed", !/sk-ant|AbCdEf/.test(out), out);
check("bearer tokens are removed", !/abc\.DEF/.test(out), out);
check("resend and google style tokens are removed", !/re_[A-Za-z0-9]{12}/.test(redact("re_ABCDEFGHIJKLMNOP1234 and ya29.a0AfB_byCabcdefghijklmnop")) && !redact("ya29.a0AfB_byCabcdefghijklmnop").includes("a0AfB"));
check("JWTs are removed", !redact("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk").includes("eyJzdWIi"));
check("secret query parameters are removed", redact("GET /x?token=abcdef123456&page=2") === "GET /x?token=[secret]&page=2");
check("useful diagnostics survive: status codes, dates and short numbers", redact("HTTP 429 at 2026-09-24 after 3 retries") === "HTTP 429 at 2026-09-24 after 3 retries");
const described = describeError(Object.assign(new Error("Failed for a@b.com"), { stack: "at secret/path.ts:1", cause: { email: "x@y.com" } }));
check("describeError keeps the error name and redacts the message", described === "Error: Failed for [email]", described);
check("describeError never includes the stack or attached objects", !/secret\/path|x@y/.test(described));
check("describeError caps very long messages", describeError(new Error("x".repeat(5000))).length < 400);
check("describeError copes with non-Error values", describeError(undefined).startsWith("undefined") && describeError("boom a@b.com") === "string: boom [email]");

console.log("\nSafe link schemes");
for (const ok of ["https://example.com/a", "http://example.com", "mailto:hi@example.com", "tel:+972555555555", "/en/reports", "#section", "HTTPS://EXAMPLE.COM"]) {
  check(`allows ${ok}`, safeHref(ok) !== null);
}
const bad: [string, string][] = [
  ["javascript:alert(1)", "javascript scheme"],
  ["JaVaScRiPt:alert(1)", "mixed-case javascript"],
  ["  javascript:alert(1)", "leading spaces"],
  [`java${TAB}script:alert(1)`, "tab inside the scheme"],
  [`java${NL}script:alert(1)`, "newline inside the scheme"],
  [`${SOH}javascript:alert(1)`, "leading control character"],
  ["data:text/html,<script>alert(1)</script>", "data URL"],
  ["vbscript:msgbox(1)", "vbscript"],
  ["//evil.example/x", "protocol-relative URL"],
  ["ftp://example.com", "ftp"],
  ["", "empty"],
];
for (const [value, label] of bad) check(`rejects ${label}`, safeHref(value) === null);
check("rejects non-strings", safeHref(undefined) === null && safeHref(42) === null && safeHref(null) === null);

console.log("\nBlog renderer");
const html = renderToStaticMarkup(
  createElement(BlockRenderer, {
    blocks: [
      {
        type: "paragraph",
        content: [
          { type: "link", href: "javascript:alert(document.cookie)", content: [{ type: "text", text: "click me", styles: {} }] },
          { type: "text", text: " and ", styles: {} },
          { type: "link", href: "https://example.com/ok", content: [{ type: "text", text: "a real link", styles: {} }] },
        ],
      },
    ] as never,
  }),
);
check("a javascript: link is rendered as plain text, not an anchor", !/javascript:/i.test(html) && html.includes("click me"), html);
check("a normal link still renders with safe attributes", html.includes('href="https://example.com/ok"') && html.includes('rel="noopener noreferrer"'));

console.log("\nRate limiter");
let clock = 1_000_000;
const budget = createBudget(() => clock);
const WIN = 10 * 60 * 1000;
const results = Array.from({ length: 7 }, () => budget("meeting:1.2.3.4", 5, WIN).ok);
check("allows 5 requests then blocks the 6th and 7th", results.join() === "true,true,true,true,true,false,false", results.join());
check("blocked requests report a sensible wait", budget("meeting:1.2.3.4", 5, WIN).retryAfterSeconds > 0 && budget("meeting:1.2.3.4", 5, WIN).retryAfterSeconds <= 600);
check("another source is not affected", budget("meeting:5.6.7.8", 5, WIN).ok);
clock += WIN + 1000;
check("the source is allowed again after the window passes", budget("meeting:1.2.3.4", 5, WIN).ok);
check("blocked attempts do not extend the block", (() => {
  const b = createBudget(() => clock);
  for (let i = 0; i < 5; i++) b("k", 5, WIN);
  clock += 1000;
  for (let i = 0; i < 50; i++) b("k", 5, WIN);
  clock += WIN - 1000 + 1;
  return b("k", 5, WIN).ok;
})());
check("memory stays bounded across many distinct sources", (() => {
  const b = createBudget(() => clock);
  for (let i = 0; i < 12000; i++) b(`ip:${i}`, 5, 1000);
  clock += 5000;
  return b("fresh", 5, 1000).ok;
})());

console.log("\nConfiguration");
const cfg = readFileSync("next.config.ts", "utf-8");
for (const h of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]) {
  check(`next.config sets ${h}`, cfg.includes(h));
}
check("the framework banner header is disabled", /poweredByHeader:\s*false/.test(cfg));
check("headers apply to every route", cfg.includes('source: "/:path*"'));
const gi = readFileSync(".gitignore", "utf-8");
check(".gitignore ignores env files but keeps .env.example", /^\.env\*$/m.test(gi) && /^!\.env\.example$/m.test(gi));
const tracked = execSync("git ls-files", { encoding: "utf-8" }).split(NL).filter((f) => /(^|\/)\.env/.test(f));
check("only .env.example is tracked by git", tracked.length === 1 && tracked[0] === ".env.example", tracked.join(", "));
const example = readFileSync(".env.example", "utf-8");
check(".env.example holds no real-looking secrets", !/sk-ant-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9]{20,}|GOCSPX-[A-Za-z0-9_-]+|eyJhbGciOi[A-Za-z0-9_-]{20,}/.test(example));

console.log("\nLogging");
const consoleCalls = execSync('git grep -nE "console\\.(log|info|warn|error|debug)\\(" -- app components lib proxy.ts', { encoding: "utf-8" }).split(NL).filter(Boolean);
const rawObjectLogs = consoleCalls.filter((l) => /console\.\w+\([^)]*,\s*(error|err|confirmationError|e)\)/.test(l));
check("no log call passes a raw error object", rawObjectLogs.length === 0, rawObjectLogs.join(" | "));
check("no log call prints request or form data", !consoleCalls.some((l) => /formData|request\.body|password|email\)/i.test(l)));

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
