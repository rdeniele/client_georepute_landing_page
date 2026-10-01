export const SCROLL_LOCK_EVENT = "georepute:scroll-lock";

/** Freezes page scroll while a modal is open, keeping the layout from shifting when the scrollbar disappears. */
export function lockScroll(lock: boolean) {
  const root = document.documentElement;
  if (lock) {
    const gutter = window.innerWidth - root.clientWidth;
    root.style.setProperty("--intro-gutter", `${gutter}px`);
    root.classList.add("intro-lock");
  } else {
    root.classList.remove("intro-lock");
    root.style.removeProperty("--intro-gutter");
  }
  window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: lock }));
}
