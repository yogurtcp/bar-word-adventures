import { node } from "../core/helpers.js";
export const MISTAKE_PAUSE_MS = 3000;
export const strictActivities = new Set(["firstLetter", "buildWord"]);
export function createMistakePause({ host, screen, lifetime, audio, locale, onResume = () => {} }) {
  let active = false, overlay = null, priorInert = false, returnFocus = null;
  function finish(restoreFocus = true) {
    if (!active) return;
    active = false;
    overlay?.remove(); overlay = null;
    screen.inert = priorInert;
    if (lifetime.alive) {
      onResume();
      if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    }
  }
  lifetime.onDispose(() => finish(false));
  return {
    get active() { return active; },
    start() {
      if (active || !lifetime.alive) return false;
      active = true;
      priorInert = Boolean(screen.inert); returnFocus = document.activeElement;
      screen.inert = true;
      overlay = node("section", "mistake-overlay");
      overlay.setAttribute("role", "alertdialog");overlay.setAttribute("aria-modal", "true");overlay.tabIndex = -1;
      const message = locale === "he" ? "ננסה שוב בעוד רגע…" : "Try again in a moment…";
      overlay.setAttribute("aria-label", message);
      const card = node("div", "mistake-card"), portrait = node("div", "bar-crying");
      portrait.setAttribute("aria-hidden", "true");
      card.append(portrait, node("p", "mistake-message", message), node("div", "mistake-timer"));
      overlay.append(card);host.append(overlay);overlay.focus({ preventScroll: true });
      audio.effect("crying");
      lifetime.later(() => finish(), MISTAKE_PAUSE_MS);
      return true;
    },
  };
}
