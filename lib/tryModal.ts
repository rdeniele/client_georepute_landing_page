/**
 * The "Try it on your business" modal.
 *
 * Every CTA that points at the platform sign-up (`SIGNUP_URL`) opens this modal
 * instead of navigating; the modal's own unlock button is the one place that
 * finally opens the sign-up in a new tab. Routing happens in `Button`, so any
 * new CTA that links to `SIGNUP_URL` picks the behaviour up automatically.
 */
export const SIGNUP_URL = "https://www.georepute.ai/signup";

/** Fired on window to open the modal from anywhere. */
export const TRY_OPEN_EVENT = "georepute:open-try";
