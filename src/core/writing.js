// Keep vowel marks attached to their letter while constructing a word.
export function graphemes(text, locale) {
  return typeof Intl.Segmenter === "function"
    ? [...new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text)].map(({ segment }) => segment)
    : text.match(/\P{M}\p{M}*/gu) || [];
}
