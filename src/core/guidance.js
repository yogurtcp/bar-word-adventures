import { t } from "./i18n.js";
import { lessonText, phrases } from "./lessons.js";
import { clues } from "./clues.js";
import { byId, word, alphabets } from "./content.js";
import { spoken, letterSpeech, unitSpeech } from "./speech.js";
import { settingsCopy, supportLanguage } from "./language-settings.js";

// Guidance uses a known language. The item being taught keeps its native recording.
export function taskGuidance(gameId, task, target, instructions = "he", narrator = "he") {
  instructions = supportLanguage(instructions);
  narrator = supportLanguage(narrator);
  const cue = (text, locale = narrator) => ({ text, locale });
  const lessonKeys = { wordCards:"sayIt", wordChoice:"wordChoice", buildWord:"buildWord", gestureChoose:"gesturePrompt" };
  let prompt, introduction;
  if (lessonKeys[gameId]) {
    prompt = lessonText(instructions, lessonKeys[gameId]);
    introduction = lessonText(narrator, lessonKeys[gameId]);
  } else if (gameId === "describe") {
    const clue = clues.find(({id}) => id === task.key);
    prompt = clue.prompts[instructions];
    introduction = clue.prompts[narrator];
  } else if (gameId === "initialSet") {
    prompt = settingsCopy[instructions].initialSound;
    introduction = settingsCopy[narrator].initialSound;
  } else {
    const key = gameId === "firstLetter" ? "firstLetterPicture" : gameId;
    prompt = t(instructions, key);
    introduction = gameId === "firstLetter" ? spoken[narrator].first : t(narrator, key);
  }
  const speech = [cue(introduction)];
  if (["wordCards", "buildWord", "firstLetter", "listenChoose"].includes(gameId)) speech.push(cue(word(byId[task.key], target).speech, target));
  if (gameId === "gestureChoose") speech.push(cue(phrases.find(({id}) => id === task.key).words[target], target));
  if (gameId === "initialSet") speech.push(cue(spoken[target].letters[alphabets[target].indexOf(task.key)], target));
  if (gameId === "firstLetter") speech.push(...task.options.map((letter) => cue(letterSpeech(target, letter), target)));
  if (gameId === "buildWord") speech.push(...task.options.map(({ text }) => cue(unitSpeech(target, text), target)));
  if (gameId === "letterOrder") speech.push(...task.answer.map((letter) => cue(letterSpeech(target, letter), target)));
  return { prompt, speech, targetSound: gameId === "initialSet" ? task.key : null };
}
