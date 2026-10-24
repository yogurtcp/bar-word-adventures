import { node } from "../core/helpers.js";
export const gestures = ["hello", "yes", "no", "listen", "look", "wellDone", "thankYou", "please"];
export function barGesture(gesture = "hello", { label = "", small = false } = {}) {
  const index = gestures.indexOf(gesture);
  if (index < 0) throw new Error(`Unknown Bar gesture: ${gesture}`);
  const element = node("span", `bar-gesture${small ? " small" : ""}`);
  element.dataset.gesture = gesture;
  const frame = index * 2;
  const row = Math.floor(frame / 4), col = frame % 4;
  element.style.setProperty("--bar-from", `${col * 100 / 3}%`);
  element.style.setProperty("--bar-to", `${(col + 1) * 100 / 3}%`);
  element.style.setProperty("--bar-row", `${row * 100 / 3}%`);
  if (label) { element.setAttribute("role", "img"); element.setAttribute("aria-label", label); }
  else element.setAttribute("aria-hidden", "true");
  return element;
}
