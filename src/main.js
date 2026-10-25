import { readLanguageSettings, saveLanguageSetting, settingsCopy, supportLanguages } from "./core/language-settings.js";
import { taskGuidance } from "./core/guidance.js";
import { lessonText, phrases, topics, topicWords, appleInstallHelp } from "./core/lessons.js";
import { concepts, word, alphabets } from "./core/content.js";
import { art } from "./core/art.js";
import { spoken } from "./core/speech.js";
import { barGesture } from "./ui/bar.js";
import { watchUpdates } from "./core/updates.js";
import { node, button } from "./core/helpers.js";
import { languages, t, direction } from "./core/i18n.js";
import { GameAudio } from "./core/audio.js";
import { nextTask, TaskScheduler } from "./core/scheduler.js";
import { readProgress, resetProgress, award } from "./core/rewards.js";
import { readSetting, writeSetting } from "./core/storage.js";
import { TaskLifetime } from "./core/lifecycle.js";
import { createParentUI } from "./ui/parents.js";
import { volumeControl } from "./ui/volume.js";
import { createReaction } from "./ui/reactions.js";
import { games } from "./games/index.js";

document.documentElement.classList.toggle("gentle-motion", readSetting("bwa-motion") === "gentle");
const app = document.querySelector("#app"),
  audio = new GameAudio();
let scheduler = new TaskScheduler(),
  progress = readProgress();
const languageSettings = readLanguageSettings();
let uiLocale = languageSettings.instructions, narratorLocale = languageSettings.narrator, activeGame = null;
let locale = null,
  levelOverride = Number(readSetting("bwa-level")) || 0;
let lifetime = null,
  installPrompt = null;
const parents = createParentUI({
  audio,
  locale: () => locale,
  uiLocale: () => uiLocale,
  narratorLocale: () => narratorLocale,
  languageControls,
  level: () => levelOverride,
  setLevel(value) {
    levelOverride = value;
    writeSetting("bwa-level", String(value));
  },
  setLanguage,
  panel: panelShell,
  install: installApp,
  languagePicker,
  startTask,
  reset() {
    progress = resetProgress();
    writeSetting("bwa-decks-v2", "{}");
    scheduler = new TaskScheduler();
  },
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  document.querySelector(".welcome-install")?.remove();
});
const UPDATE_RESUME = "bwa-update-resume-v1";
const updates = "serviceWorker" in navigator && !["localhost", "127.0.0.1"].includes(location.hostname)
  ? watchUpdates({
      canReload: () => Boolean(document.querySelector(".launch-screen, .welcome-screen")) && !document.querySelector("dialog"),
      beforeReload(state = { locale, playing: false, activeGame }) {
        try { sessionStorage.setItem(UPDATE_RESUME, JSON.stringify(state)); } catch {}
      },
    })
  : { applyPending: () => false };
function clear() {
  lifetime?.dispose();
  audio.onStatus = () => {};
  audio.stop();
  app.replaceChildren();
}
function setLanguage(code) {
  locale = code;
  document.documentElement.setAttribute("translate", "no");
  document.documentElement.classList.add("notranslate");
  applyInterfaceLanguage();
}
function applyInterfaceLanguage() {
  document.documentElement.lang = languages.find(({code}) => code === uiLocale).tag;
  document.documentElement.dir = direction(uiLocale);
  document.title = t(uiLocale, "appName");
}
function targetElement(element) {
  element.lang = languages.find(({code}) => code === locale).tag;
  element.dir = direction(locale);
  return element;
}
function languageControls({ refresh = welcome, includeTarget = true } = {}) {
  const panel = node("div", "learning-settings language-settings");
  const add = (id, title, options, value, onChange) => {
    const wrapper = node("div", "language-setting"), label = node("label", "", title), select = node("select", "helper-select");
    select.id = id; label.htmlFor = id;
    for (const option of options) { const entry = node("option", "", option.label); entry.value = option.code; entry.selected = entry.value === value; select.append(entry); }
    select.addEventListener("change", () => { audio.stop(); onChange(select.value); refresh(); });
    wrapper.append(label, select); panel.append(wrapper);
  };
  if (includeTarget) add("learning-language", settingsCopy[uiLocale].learning, languages.map(({code,flag,name}) => ({code, label:`${flag} ${settingsCopy[uiLocale].names[code]} · ${name}`})), locale, setLanguage);
  const choices = supportLanguages.map((code) => ({code, label: settingsCopy[uiLocale].names[code]}));
  add("instruction-language", settingsCopy[uiLocale].instructions, choices, uiLocale, (value) => { uiLocale = saveLanguageSetting("instructions", value); applyInterfaceLanguage(); });
  add("narrator-language", settingsCopy[uiLocale].narrator, choices, narratorLocale, (value) => { narratorLocale = saveLanguageSetting("narrator", value); });
  panel.append(node("p", "language-settings-note", settingsCopy[uiLocale].note));
  return panel;
}
function header({ parent = true, playing = false } = {}) {
  const bar = node("header", "topbar"),
    brand = node("div", "brand");
  brand.innerHTML = '<span class="brand-mark" aria-hidden="true">✦</span>';
  brand.append(node("span", "brand-name", t(uiLocale, "appName")));
  bar.append(brand);
  if (parent) {
    const controls = node("div", "header-controls");
    const home = button("home-button", "⌂", welcome);
    home.setAttribute("aria-label", lessonText(uiLocale, "home"));
    controls.append(home);
    const language = languages.find((entry) => entry.code === locale);
    const change = button("language-switch", "", () => languagePicker({ resumeGame: playing }));
    change.setAttribute("aria-label", t(uiLocale, "choose"));
    change.title = t(uiLocale, "choose");
    change.innerHTML = `<span aria-hidden="true">🌐</span><span dir="auto">${language.name}</span>`;
    controls.append(change);
    const gate = button("parent-gate", "", parents.showGate);
    gate.setAttribute("aria-label", t(uiLocale, "parent"));
    gate.append(
      node("span", "", "⚙"),
      node("span", "menu-label", t(uiLocale, "menu")),
    );
    controls.append(gate);
    bar.append(controls);
  }
  return bar;
}
function languagePicker({ resumeGame = false } = {}) {
  if (updates.applyPending({ safe: true, state: { locale: null, resumeGame } })) return;
  clear();
  locale = null;
  applyInterfaceLanguage();
  const screen = node("main", "screen launch-screen");
  const subtitle = node("p", "launch-subtitle", settingsCopy[uiLocale].choose);
  screen.append(
    node("div", "launch-badge", "✦  ✿  ★"),
    node("h1", "launch-title", lessonText(uiLocale, "appName")),
    subtitle,
    languageControls({ refresh: () => languagePicker({ resumeGame }), includeTarget: false }),
  );
  const choices = node("div", "language-choices");
  for (const lang of languages) {
    const choice = button("language-choice", "", () => {
      setLanguage(lang.code);
      if (resumeGame) startTask();
      else welcome();
    });
    choice.lang = languages.find(({code}) => code === uiLocale).tag;
    choice.dataset.targetLanguage = lang.code;
    choice.innerHTML = `<span class="language-sample" aria-hidden="true">${lang.flag}</span><span dir="auto">${settingsCopy[uiLocale].names[lang.code]} · <span lang="${lang.tag}">${lang.name}</span></span><span class="choice-arrow" aria-hidden="true">↗</span>`;
    choices.append(choice);
  }
  screen.append(choices);
  app.append(screen);
  window.scrollTo(0, 0);
}
function welcome() {
  if (updates.applyPending({ safe: true, state: { locale, playing: false } })) return;
  clear();
  const screen = node("main", "screen welcome-screen");
  screen.append(header());
  const hero = node("section", "word-welcome");
  const intro = node("div", "welcome-intro");
  const language = languages.find(({code}) => code === locale);
  intro.append(node("span", "eyebrow", `${language.flag} ${language.name}`), node("h1", "welcome-heading", lessonText(uiLocale, "appName")), node("p", "welcome-tagline", lessonText(uiLocale, "tagline")));
  intro.append(button("primary-button play-button", `▶ ${t(uiLocale, "play")}`, () => { activeGame = null; void audio.unlock(); startTask(); }));
  hero.append(intro, barGesture("hello")); screen.append(hero);
  screen.append(languageControls());
  const shelves = node("section", "learning-shelves");
  for (const [key, emoji, action] of [["words","🍎",()=>showWords()],["phrases","👋",()=>showPhrases()],["letters","🌱",()=>showLetters()]]) {
    const card=button(`shelf-card shelf-${key}`,"",action);card.append(node("span","shelf-symbol",emoji),node("span","",lessonText(uiLocale,key)),node("span","shelf-arrow","↗"));shelves.append(card);
  }
  screen.append(shelves, starRail());
  const practice = node("div", "activity-picker");
  for(const game of games)practice.append(button("activity-chip",t(uiLocale,"gameNames")[game.id],()=>{activeGame=game.id;void audio.unlock();startTask();}));
  screen.append(practice);
  if (!window.matchMedia("(display-mode: standalone)").matches) screen.append(button("secondary-button welcome-install", `↓ ${t(uiLocale,"install")}`, installApp));
  app.append(screen);window.scrollTo(0,0);
}
function learningScreen(title) {
  clear();
  const screen=node("main","screen explore-screen");screen.append(header(),node("h1","explore-title",title));
  const status=node("div","audio-status");status.setAttribute("role","status");screen.append(status);
  audio.onStatus=(value)=>{const key={loading:"audioLoading",speaking:"audioSpeaking",error:"audioError",muted:"audioMuted"}[value];status.textContent=key?t(uiLocale,key):"";};
  app.append(screen);window.scrollTo(0,0);return screen;
}
function showWords(topic="allTopics") {
  const screen=learningScreen(lessonText(uiLocale,"words"));
  screen.append(node("p","explore-note",lessonText(uiLocale,"tapLearn")));
  const tabs=node("div","topic-tabs");
  for(const id of ["allTopics",...Object.keys(topics)]){const tab=button(`topic-tab${id===topic?" selected":""}`,lessonText(uiLocale,id),()=>showWords(id));tab.setAttribute("aria-pressed",String(id===topic));tabs.append(tab);}screen.append(tabs);
  const gallery=targetElement(node("div","word-gallery"));
  for(const item of topicWords(topic)){
    const card=button("dictionary-card","",()=>{void audio.unlock();void audio.speak(word(item,locale).speech,locale);card.classList.remove("word-pop");void card.offsetWidth;card.classList.add("word-pop");});
    card.innerHTML=art(item.id,word(item,locale).display);card.append(node("strong","dictionary-word",word(item,locale).display));
    if(word(item,locale).reading)card.append(node("small","word-reading",word(item,locale).reading));
    addMeaning(card,item);gallery.append(card);
  }screen.append(gallery);
}
function addMeaning(host,item) {
  if(uiLocale!==locale){const meaning=node("small","word-meaning",word(item,uiLocale).display);meaning.lang=uiLocale;meaning.dir="auto";host.append(meaning);}
}
function showPhrases() {
  const screen=learningScreen(lessonText(uiLocale,"phrases"));screen.append(node("p","explore-note",lessonText(uiLocale,"gestureNote")));
  const gallery=node("div","phrase-gallery");
  for(const phrase of phrases){const card=button("phrase-card","",()=>{void audio.unlock();void audio.speak(phrase.words[locale],locale);card.classList.remove("word-pop");void card.offsetWidth;card.classList.add("word-pop");});
    card.append(barGesture(phrase.gesture),targetElement(node("strong","phrase-word",phrase.words[locale])));
    if(uiLocale!==locale){const meaning=node("small","word-meaning",phrase.words[uiLocale]);meaning.lang=uiLocale;meaning.dir="auto";card.append(meaning);}gallery.append(card);
  }screen.append(gallery);
}
function showLetters() {
  const screen=learningScreen(lessonText(uiLocale,"letters"));
  const preview=node("section","letter-preview");preview.setAttribute("aria-live","polite");
  const gallery=targetElement(node("div","alphabet-gallery"));
  alphabets[locale].forEach((letter,index)=>{const card=button("alphabet-letter",letter,()=>{
    void audio.unlock();void audio.speak(spoken[locale].letters[index],locale);
    for(const item of gallery.querySelectorAll("button"))item.classList.remove("selected");card.classList.add("selected");
    preview.replaceChildren(targetElement(node("h2","big-letter",letter)));
    const examples=concepts.filter((item)=>word(item,locale).initial===letter).slice(0,4), row=targetElement(node("div","letter-examples"));
    for(const item of examples){const example=button("dictionary-card","",()=>audio.speak(word(item,locale).speech,locale));example.innerHTML=art(item.id,word(item,locale).display);example.append(node("strong","",word(item,locale).display));addMeaning(example,item);row.append(example);}preview.append(row);
  });gallery.append(card);});screen.append(preview,gallery);gallery.querySelector("button")?.click();
}
function currentLevel(gameId) {
  return (
    levelOverride ||
    Math.min(
      3,
      1 + Math.floor((progress.skills[`${locale}:${gameId}`] || 0) / 8),
    )
  );
}
function starRail() {
  const stars = Math.floor(progress.correct / 5),
    rail = node("div", "star-rail");
  rail.setAttribute("aria-label", `${stars} ★`);
  for (let i = 0; i < 5; i++)
    rail.append(node("span", i < stars % 5 ? "filled" : "", "★"));
  rail.append(node("span", "star-count", String(stars)));
  const dots = node("span", "progress-dots");
  dots.setAttribute("aria-label", t(uiLocale, "progress", progress.correct % 5));
  for (let i = 0; i < 5; i++)
    dots.append(node("i", i < progress.correct % 5 ? "filled" : ""));
  rail.append(dots);
  return rail;
}
function startTask({ gameId = activeGame, seed = null, practice = false } = {}) {
  if (updates.applyPending({ safe: true, state: { locale, playing: true, activeGame, practice, gameId, seed } })) return;
  clear();
  lifetime = new TaskLifetime();
  const taskLife = lifetime;
  const selected = practice
    ? nextTask(
        games.filter((game) => game.id === gameId),
        locale,
        currentLevel(gameId),
        [],
        seed ?? undefined,
      )
    : scheduler.next(gameId ? games.filter((game) => game.id === gameId) : games, locale, currentLevel);
  const { task } = selected;
  const guidance = taskGuidance(selected.game.id, task, locale, uiLocale, narratorLocale);
  let complete = false,
    misses = 0;
  const screen = node("main", "screen game-screen");
  screen.append(header({ playing: true }));
  const stage = node("section", "stage"),
    meta = node("div", "stage-meta"),
    actions = node("div", "stage-actions");
  meta.append(starRail());
  const replay = button("replay-button", "", () =>
    audio.speak(guidance.speech, narratorLocale),
  );
  replay.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3zM16 8q4 4 0 8m3-11q7 7 0 14"/></svg>';
  replay.append(node("span", "", t(uiLocale, "speaker")));
  actions.append(
    replay,
    volumeControl(audio, uiLocale, "game-volume", () =>
      audio.speak(guidance.speech, narratorLocale),
    ).element,
  );
  if (practice)
    actions.append(button("text-button", t(uiLocale, "debug"), parents.showLab));
  meta.append(actions);
  stage.append(meta);
  const title = node("h1", "task-prompt", guidance.prompt);
  title.tabIndex = -1;
  const reaction = createReaction("thinking", { lifetime: taskLife });
  const questionRow = node("div", "question-row");
  questionRow.append(title, reaction.element);
  stage.append(questionRow);
  if (guidance.targetSound) {
    const sound = targetElement(node("div", "target-sound", guidance.targetSound));
    stage.append(sound);
  }
  const audioStatus = node("div", "audio-status");
  audioStatus.setAttribute("role", "status");
  stage.append(audioStatus);
  audio.onStatus = (status) => {
    if (!taskLife.alive) return;
    const key = {
      loading: "audioLoading",
      speaking: "audioSpeaking",
      error: "audioError",
      muted: "audioMuted",
    }[status];
    audioStatus.textContent = key ? t(uiLocale, key) : "";
    audioStatus.classList.toggle("audio-error", status === "error");
    replay.classList.toggle("speaking", status === "speaking");
  };
  const field = node("div", "task-field"),
    feedback = node("div", "feedback");
  feedback.setAttribute("aria-live", "polite");
  stage.append(field, feedback);
  const api = {
    locale,
    helperLocale: uiLocale,
    instructionLocale: uiLocale,
    audio,
    hint() { misses++; },
    isComplete: () => complete || !taskLife.alive,
    later: (fn, delay) => taskLife.later(fn, delay),
    encourage() {
      if (!complete && taskLife.alive) {
        reaction.set("happy", 2400);
        feedback.textContent = t(uiLocale, "good");
        feedback.className = "feedback success";
      }
    },
    wrong(element) {
      if (complete || !taskLife.alive) return;
      misses++;
      reaction.set(misses % 2 ? "sad" : "oops", 2400);
      audio.effect("wrong");
      feedback.textContent = t(uiLocale, "try");
      feedback.className = "feedback retry";
      if (element) {
        element.classList.remove("wiggle");
        void element.offsetWidth;
        element.classList.add("wiggle");
      }
    },
    complete() {
      if (complete || !taskLife.alive) return;
      complete = true;
      reaction.set("happy");
      audio.effect("right");
      for (const control of field.querySelectorAll("button"))
        control.disabled = true;
      feedback.textContent = t(uiLocale, "good");
      feedback.className = "feedback success";
      if (practice) {
        stage.append(
          button(
            "primary-button next-button",
            t(uiLocale, "debug"),
            parents.showLab,
          ),
        );
        return;
      }
      const result = award(progress, locale, selected.game.id, misses);
      progress = result.progress;
      meta.replaceChild(starRail(), meta.firstChild);
      if (result.star)
        feedback.textContent = `${t(uiLocale, "good")} ★ ${t(uiLocale, "star")}`;
      if (result.star) reaction.set(result.celebrate ? "celebrating" : "surprised");
      stage.append(
        button("primary-button next-button", t(uiLocale, "next"), () =>
          result.star ? showReward(stage, result.celebrate) : startTask(),
        ),
      );
    },
  };
  targetElement(field);
  task.render(field, api);
  for (const control of field.querySelectorAll(".instruction-control")) {
    control.lang = languages.find(({code}) => code === uiLocale).tag;
    control.dir = direction(uiLocale);
  }
  screen.append(stage);
  app.append(screen);
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true });
  void audio.speak(guidance.speech, narratorLocale);
}
function showReward(stage, celebrate) {
  audio.stop();
  audio.effect("star");
  const overlay = node(
    "div",
    `reward-overlay ${celebrate ? "celebration" : ""}`,
  );
  overlay.setAttribute("role", "region");
  overlay.setAttribute("aria-label", t(uiLocale, celebrate ? "party" : "star"));
  overlay.innerHTML =
    '<div class="reward-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="reward-star" aria-hidden="true">★</div>';
  const rewardPortrait = createReaction(celebrate ? "celebrating" : "surprised");
  rewardPortrait.element.classList.add("reward-portrait");
  if (!rewardPortrait.element.hidden) overlay.classList.add("has-portrait");
  overlay.append(rewardPortrait.element);
  overlay.append(
    node("h2", "reward-title", t(uiLocale, celebrate ? "party" : "star")),
  );
  const next = button("primary-button", t(uiLocale, "next"), () => startTask());
  overlay.append(next);
  for (const child of stage.children) child.inert = true;
  stage.append(overlay);
  next.focus();
}
function panelShell(title) {
  clear();
  const screen = node("main", "screen parent-screen");
  screen.append(header({ parent: false }));
  const panel = node("section", "parent-panel"),
    top = node("div", "panel-heading");
  top.append(
    node("h1", "", title),
    button("secondary-button", t(uiLocale, "back"), welcome),
  );
  panel.append(top);
  screen.append(panel);
  app.append(screen);
  return panel;
}
async function installApp() {
  if (window.matchMedia("(display-mode: standalone)").matches)
    return alert(t(uiLocale, "installDone"));
  if (installPrompt) {
    const event = installPrompt;
    installPrompt = null;
    await event.prompt();
  } else {
    const apple = /iPhone|iPad|iPod/.test(navigator.userAgent || "") || (/Mac/.test(navigator.userAgent || "") && navigator.maxTouchPoints > 1);
    alert(apple ? appleInstallHelp[uiLocale] : t(uiLocale, "installHelp"));
  }
}
document.addEventListener("keydown", (event) => {
  if (
    locale &&
    event.altKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "p"
  )
    parents.showGate();
});
let updateResume = null;
try {
  updateResume = JSON.parse(sessionStorage.getItem(UPDATE_RESUME));
  sessionStorage.removeItem(UPDATE_RESUME);
} catch {}
if (languages.some(({ code }) => code === updateResume?.locale)) {
  setLanguage(updateResume.locale);
  if (games.some(({id}) => id === updateResume.activeGame)) activeGame = updateResume.activeGame;
  if (updateResume.playing) startTask(updateResume.practice ? {practice:true,gameId:updateResume.gameId,seed:updateResume.seed} : {});
  else welcome();
} else languagePicker({ resumeGame: Boolean(updateResume?.resumeGame) });
