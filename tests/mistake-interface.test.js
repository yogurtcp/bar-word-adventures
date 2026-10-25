import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { games } from "../src/games/index.js";
import { languages } from "../src/core/i18n.js";
import { seeded } from "../src/core/helpers.js";
import { GameAudio } from "../src/core/audio.js";

// Exercise real activity callbacks through the shared app API, rather than stubbing wrong().
function controls(game, task, field, placed = 0) {
  const buttons = [...field.querySelectorAll(".choice")];
  if (game.id === "memoryPairs") {
    const first = 0;
    const wrong = task.cards.findIndex((card) => card.id !== task.cards[first].id);
    const correct = task.cards.findIndex((card, i) => i !== first && card.id === task.cards[first].id);
    return { mistake() { buttons[first].click(); buttons[wrong].click(); }, correct: buttons[correct], wrong: buttons[wrong] };
  }
  const choices = game.id === "buildWord" ? task.options.map(({ text }) => text) : task.options;
  const answers = game.id === "initialSet" ? task.answers
    : [Array.isArray(task.answer) ? task.answer[placed] : task.answer];
  const correct = buttons[choices.findIndex((value, i) => answers.includes(value) && !buttons[i].disabled)];
  const wrong = buttons[choices.findIndex((value, i) => !answers.includes(value) && !buttons[i].disabled)];
  return { mistake() { wrong.click(); }, correct, wrong };
}

test("every gameplay mistake in every language shows crying and blocks input for three seconds, including repeated and partial-answer mistakes", async () => {
  const { document, window } = parseHTML('<html><body><div id="app"></div></body></html>');
  globalThis.document = document; globalThis.window = window;
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  globalThis.location = { hostname: "localhost" };
  window.matchMedia = () => ({ matches: false }); window.scrollTo = () => {};
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  globalThis.sessionStorage = { getItem: () => null, removeItem() {} };
  const oldSpeak = GameAudio.prototype.speak, oldEffect = GameAudio.prototype.effect;
  const oldSet = globalThis.setTimeout, oldClear = globalThis.clearTimeout;
  const originals = new Map(games.map((game) => [game, game.create]));
  const effects = [], speech = [], timers = new Map();
  let now = 0, next = 0;
  globalThis.setTimeout = (fn, delay) => { timers.set(++next, { fn, at: now + delay }); return next; };
  globalThis.clearTimeout = (id) => timers.delete(id);
  const tick = (ms) => {
    now += ms;
    for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); }
  };
  GameAudio.prototype.speak = async (text, locale) => { speech.push({ text, locale }); return true; };
  GameAudio.prototype.effect = (kind) => effects.push(kind);
  try {
    await import("../src/main.js");
    for (const { code } of languages) {
      document.querySelector(`[data-target-language="${code}"]`).click();
      for (const game of games.filter(({ id }) => id !== "wordCards")) {
        const task = originals.get(game)({ locale: code, level: 1, rng: seeded(12) });
        game.create = () => task;
        document.querySelectorAll(".activity-chip")[games.indexOf(game)].click();
        const screen = document.querySelector(".game-screen"), field = document.querySelector(".task-field");
        const initialText = field.textContent;
        let inputs = controls(game, task, field);
        const checkPause = () => {
          const before = effects.filter((kind) => kind === "crying").length;
          const progress = [...saved];
          inputs.mistake();
          assert.ok(document.querySelector(".mistake-overlay .bar-crying"), `${code}:${game.id}`);
          assert.equal(screen.inert, true);
          assert.equal(effects.filter((kind) => kind === "crying").length, before + 1);
          document.dispatchEvent(Object.assign(new window.Event("keydown"), { altKey: true, shiftKey: true, key: "p" }));
          assert.equal(document.querySelector("dialog"), null);
          const count = speech.length, textDuringPause = field.textContent;
          inputs.correct.click(); inputs.wrong.click();
          assert.equal(speech.length, count);
          assert.equal(field.textContent, textDuringPause);
          assert.deepEqual([...saved], progress, "locked input cannot award progress");
          assert.equal(document.querySelectorAll(".mistake-overlay").length, 1);
          tick(2999);
          assert.ok(document.querySelector(".mistake-overlay")); assert.equal(screen.inert, true);
          tick(1);
          assert.equal(document.querySelector(".mistake-overlay"), null); assert.equal(screen.inert, false);
          assert.equal(document.querySelector(".task-field"), field);
          assert.equal(document.querySelector(".next-button"), null);
        };
        for (let attempt = 0; attempt < 2; attempt++) {
          checkPause();
          assert.equal(field.textContent, initialText);
        }
        // A mistake after a correct tile must retain that partial answer, too.
        if (["buildWord", "letterOrder", "initialSet"].includes(game.id)) {
          inputs.correct.click();
          inputs = controls(game, task, field, 1);
          if (inputs.wrong) {
            const partial = field.textContent;
            checkPause(); assert.equal(field.textContent, partial);
          }
        }
        inputs.correct.click();
        assert.equal(document.querySelector(".mistake-overlay"), null);
        document.querySelector(".home-button").click(); tick(5000);
        assert.equal(document.querySelector(".mistake-overlay"), null);
        game.create = originals.get(game);
      }
      document.querySelector(".language-switch").click();
    }
  } finally {
    GameAudio.prototype.speak = oldSpeak; GameAudio.prototype.effect = oldEffect;
    globalThis.setTimeout = oldSet; globalThis.clearTimeout = oldClear;
    for (const [game, create] of originals) game.create = create;
  }
});
