// Keep vowel marks attached to their letter while constructing a word.
export function graphemes(text, locale) {
  const parts = typeof Intl.Segmenter === "function"
    ? [...new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text)].map(({ segment }) => segment)
    : text.match(/\P{M}\p{M}*/gu) || [];
  if (locale !== "fil") return parts;
  const units = [];
  for (let index = 0; index < parts.length; index++) {
    if (/^n$/i.test(parts[index]) && /^g$/i.test(parts[index + 1] || "")) units.push(parts[index] + parts[++index]);
    else units.push(parts[index]);
  }
  return units;
}
