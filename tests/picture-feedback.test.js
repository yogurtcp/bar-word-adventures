import { languages } from "../src/core/i18n.js";
const locales = languages.map(({ code }) => code);
import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { describe } from "../src/games/describe.js";
import { listenChoose } from "../src/games/listenChoose.js";
import { initialSet } from "../src/games/initialSet.js";
import { firstLetter } from "../src/games/firstLetter.js";
import { seeded } from "../src/core/helpers.js";
import { byId, word } from "../src/core/content.js";

test("incorrect picture taps say the chosen word without revealing spelling", () => {
  for (const game of [describe, listenChoose, initialSet])
    for (const locale of locales) {
      const { document } = parseHTML("<main></main>");
      globalThis.document = document;
      const host = document.querySelector("main"),
        speech = [];
      let mistakes = 0,
        wins = 0;
      const task = game.create({ locale, level: 1, rng: seeded(32) });
      task.render(host, {
        locale,
        audio: { speak: (text) => speech.push(text) },
        wrong: () => mistakes++,
        complete: () => wins++,
      });
      const wrong = task.options.find(
        (id) => !(task.answers || [task.answer]).includes(id),
      );
      host.querySelectorAll("button")[task.options.indexOf(wrong)].click();
      assert.equal(mistakes, 1);
      assert.equal(wins, 0);
      assert.equal(speech.at(-1), word(byId[wrong], locale).speech);
      assert.equal(host.querySelectorAll(".picture-word").length, 0);
    }
});
test("first-letter questions keep the same generic instruction across different pictured words", () => {
  // Whole-word substring checks reject innocent overlaps, such as Spanish pie in empieza.
  for (const locale of locales) {
    const prompts = new Set();
    const words = new Set();
    for (let seed = 1; seed <= 30; seed++) {
      const task = firstLetter.create({ locale, level: 3, rng: seeded(seed) });
      prompts.add(task.prompt);
      words.add(word(byId[task.key], locale).display);
    }
    assert.ok(words.size > 1, locale);
    assert.equal(prompts.size, 1, `The picture name must not be interpolated into ${locale} instructions`);
  }
});
