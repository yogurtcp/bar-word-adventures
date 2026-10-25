import { graphemes } from "./writing.js";
import { settingsCopy } from "./language-settings.js";
import { lessonText, phrases } from "./lessons.js";
import { speech as spanish } from "../locales/es.js";
import { speech as arabic } from "../locales/ar.js";
import { speech as turkish } from "../locales/tr.js";
import { concepts, alphabets, word } from "./content.js";
import { t } from "./i18n.js";
import { clues } from "./clues.js";
import { speech as chinese, initialPrompt } from "../locales/zh.js";
import { speech as japanese, quantity as japaneseQuantity } from "../locales/ja.js";
export const spoken = {
  es: spanish,
  ar: arabic,
  tr: turkish,
  zh: chinese,
  ja: japanese,
  ru: {
    numbers: [
      "ноль",
      "один",
      "два",
      "три",
      "четыре",
      "пять",
      "шесть",
      "семь",
      "восемь",
      "девять",
      "десять",
    ],
    plus: "плюс",
    minus: "минус",
    and: "и",
    answer: "Сколько получится?",
    first: "Какая первая буква в этом слове?",
    letters: [
      "а",
      "бэ",
      "вэ",
      "гэ",
      "дэ",
      "е",
      "ё",
      "жэ",
      "зэ",
      "и",
      "и краткое",
      "ка",
      "эль",
      "эм",
      "эн",
      "о",
      "пэ",
      "эр",
      "эс",
      "тэ",
      "у",
      "эф",
      "ха",
      "цэ",
      "чэ",
      "ша",
      "ща",
      "твёрдый знак",
      "ы",
      "мягкий знак",
      "э",
      "ю",
      "я",
    ],
  },
  he: {
    numbers: [
      "אֶפֶס",
      "אַחַת",
      "שְׁתַּיִם",
      "שָׁלוֹשׁ",
      "אַרְבַּע",
      "חָמֵשׁ",
      "שֵׁשׁ",
      "שֶׁבַע",
      "שְׁמוֹנֶה",
      "תֵּשַׁע",
      "עֶשֶׂר",
    ],
    plus: "וְעוֹד",
    minus: "פָּחוֹת",
    and: "וְגַם",
    answer: "כַּמָּה זֶה?",
    first: "מָה הָאוֹת הָרִאשׁוֹנָה בַּמִּלָּה הַזֹּאת?",
    letters: [
      "אָלֶף",
      "בֵּית",
      "גִּימֶל",
      "דָּלֶת",
      "הֵא",
      "וָו",
      "זַיִן",
      "חֵית",
      "טֵית",
      "יוֹד",
      "כָּף",
      "לָמֶד",
      "מֵם",
      "נוּן",
      "סָמֶךְ",
      "עַיִן",
      "פֵּא",
      "צָדִי",
      "קוֹף",
      "רֵישׁ",
      "שִׁין",
      "תָּו",
    ],
  },
  en: {
    numbers: [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ],
    plus: "plus",
    minus: "minus",
    and: "and",
    answer: "What is the answer?",
    first: "What is the first letter of this word?",
    letters: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
  },
};
export const letterSpeech = (locale, letter) =>
  spoken[locale].letters[alphabets[locale].indexOf(letter)];
// Word-building tiles include lower case, accents, final forms and non-alphabet characters.
const extraUnitNames = {
  es: { " ": "espacio", "á": "a con tilde", "é": "e con tilde", "í": "i con tilde", "ó": "o con tilde", "ú": "u con tilde", "ü": "u con diéresis" },
  en: { " ": "space" }, ru: { " ": "пробел" }, tr: { " ": "boşluk" },
  he: { " ": "רֶוַח", "ך": "כָּף סוֹפִית", "ם": "מֵם סוֹפִית", "ן": "נוּן סוֹפִית", "ף": "פֵּא סוֹפִית", "ץ": "צָדִי סוֹפִית", "׳": "גֵּרֵשׁ" },
  ar: { " ": "مَسَافَة", "أ": "أَلِف بِهَمْزَة", "إ": "أَلِف بِهَمْزَة", "آ": "أَلِف مَمْدُودَة", "ؤ": "وَاو بِهَمْزَة", "ئ": "يَاء بِهَمْزَة", "ة": "تَاء مَرْبُوطَة", "ى": "أَلِف مَقْصُورَة", "ء": "هَمْزَة" },
  ja: { "ゃ": "ちいさい や", "ゅ": "ちいさい ゆ", "ょ": "ちいさい よ", "っ": "ちいさい つ", "ー": "ちょうおん", " ": "くうはく" },
  zh: { " ": "空格" },
};
export function unitSpeech(locale, unit) {
  let normalized = unit.normalize("NFC");
  if (["he", "ar"].includes(locale)) normalized = normalized.replace(/\p{M}/gu, "");
  const extra = extraUnitNames[locale]?.[normalized];
  if (extra) return extra;
  const letter = ["en", "es", "ru", "tr"].includes(locale) ? normalized.toLocaleUpperCase(locale) : normalized;
  // Mandarin characters and kana are pronounced in their native writing system.
  return letterSpeech(locale, letter) || normalized;
}
export const initialSpeech = (locale, letter) =>
  locale === "zh" ? initialPrompt(letter) : t(
    locale,
    "initialSet",
    spoken[locale].letters[alphabets[locale].indexOf(letter)],
  );
export const firstSpeech = (locale, item) => [
  spoken[locale].first,
  word(item, locale).speech,
];
export function speechCatalog(locale) {
  const values = [
    ...concepts.map((item) => word(item, locale).speech),
    ...clues.map((clue) => clue.prompts[locale]),
    ...alphabets[locale].map((letter) => initialSpeech(locale, letter)),
    ...["memoryPairs", "letterOrder", "listenChoose"].map((key) => t(locale, key)),
    ...spoken[locale].letters,
    ...concepts.flatMap((item) => graphemes(word(item, locale).display, locale).map((unit) => unitSpeech(locale, unit))),
    spoken[locale].first,
    ...["sayIt", "wordChoice", "buildWord", "gesturePrompt"].map((key) => lessonText(locale, key)),
    ...phrases.map((phrase) => phrase.words[locale]),
    ...(["he", "en"].includes(locale) ? [settingsCopy[locale].initialSound] : []),
  ];
  return [...new Set(values)];
}
