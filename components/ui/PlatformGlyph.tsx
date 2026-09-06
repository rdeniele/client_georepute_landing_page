"use client";

/**
 * Recognizable marks for the surfaces GeoRepute scans — Google plus the six
 * AI engines verified from the live site ("Google + 6 AI engines"; the GEON
 * protocol names ChatGPT, Gemini, Claude, Perplexity, Copilot and Grok).
 *
 * Each mark is a simplified geometric glyph in the platform's own colours,
 * paired with its name in the chip so recognition never depends on the icon
 * alone. Size is fixed via the chip's .platforms__glyph box.
 */

export type PlatformId =
  | "google"
  | "chatgpt"
  | "gemini"
  | "claude"
  | "perplexity"
  | "copilot"
  | "grok";

export const PLATFORMS: { id: PlatformId; name: string }[] = [
  { id: "google", name: "Google" },
  { id: "chatgpt", name: "ChatGPT" },
  { id: "gemini", name: "Gemini" },
  { id: "claude", name: "Claude" },
  { id: "perplexity", name: "Perplexity" },
  { id: "copilot", name: "Copilot" },
  { id: "grok", name: "Grok" },
];

/** Four-pointed star used by Gemini and Claude, parameterised by flare. */
function FourPointStar({
  r,
  flare,
  fill,
}: {
  r: number;
  flare: number;
  fill: string;
}) {
  const d = `M ${r} 0 C ${r * flare} ${r * flare} ${r * flare} ${r * flare} 0 ${r} C ${-r * flare} ${r * flare} ${-r * flare} ${r * flare} ${-r} 0 C ${-r * flare} ${-r * flare} ${-r * flare} ${-r * flare} 0 ${-r} C ${r * flare} ${-r * flare} ${r * flare} ${-r * flare} ${r} 0 Z`;
  return <path d={d} fill={fill} />;
}

/** ChatGPT's sparkle — four points meeting at a waist. */
function Sparkle({ fill }: { fill: string }) {
  return (
    <path
      d="M10 2.6c.7 2.6 1.9 3.9 4.3 4.5-2.4.6-3.6 1.9-4.3 4.4-.7-2.5-1.9-3.8-4.3-4.4 2.4-.6 3.6-1.9 4.3-4.5Z M16.2 12.4c.4 1.5 1.1 2.2 2.5 2.6-1.4.4-2.1 1.1-2.5 2.5-.4-1.4-1.1-2.1-2.5-2.5 1.4-.4 2.1-1.1 2.5-2.6Z"
      fill={fill}
      fillRule="evenodd"
    />
  );
}

export function PlatformGlyph({ id }: { id: PlatformId }) {
  switch (id) {
    case "google":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path
            d="M10.2 3.9c1.7 0 3.2.6 4.4 1.6l3.2-3.2A10 10 0 0 0 10.2.1C6.2.1 2.7 2.5 1 6l3.7 2.9c.9-2.7 3.4-5 5.5-5Z"
            fill="#4285F4"
          />
          <path
            d="M19.9 10.2c0-.7-.1-1.4-.2-2H10.2v3.8h5.5a4.6 4.6 0 0 1-2 3l3.6 2.8c2.1-2 2.6-4.9 2.6-7.6Z"
            fill="#34A853"
          />
          <path
            d="M4.7 11.9a6 6 0 0 1 0-3.8L1 5.2a10 10 0 0 0 0 9.6l3.7-2.9Z"
            fill="#FBBC05"
          />
          <path
            d="M10.2 19.9c2.7 0 5-1 6.7-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.1 1.1-2.1 0-4.6-2.2-5.5-4.9L1 15.4c1.7 3.6 5.2 4.5 9.2 4.5Z"
            fill="#EA4335"
          />
        </svg>
      );
    case "chatgpt":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <Sparkle fill="#10A37F" />
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <defs>
            <linearGradient id="gemini-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="100%" stopColor="#9B72CB" />
            </linearGradient>
          </defs>
          <FourPointStar r={10} flare={0.62} fill="url(#gemini-g)" />
        </svg>
      );
    case "claude":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <FourPointStar r={9.4} flare={0.72} fill="#D97757" />
        </svg>
      );
    case "perplexity":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path
            d="M10 1.5 3 5v6c0 4.1 2.8 7 7 8.5 4.2-1.5 7-4.4 7-8.5V5l-7-3.5Z"
            fill="none"
            stroke="#20B8CD"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M6.6 13.6V6.4l6.8 6.8M6.6 13.6l3.4-3.6 3.4 3.6"
            fill="none"
            stroke="#20B8CD"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "copilot":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <Sparkle fill="#0F6CBD" />
        </svg>
      );
    case "grok":
      // Monochrome X — follows the chip's ink colour so it reads in both themes
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path
            d="M3 3l14 14M17 3 3 17"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}