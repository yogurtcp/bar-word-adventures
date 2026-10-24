import { concepts, word } from "../core/content.js";
import { lessonText, phrases } from "../core/lessons.js";
import { pick, sample, shuffle, node, button } from "../core/helpers.js";
import { picture, grid, tile, appendWord, revealWord } from "./shared.js";
import { art } from "../core/art.js";
import { barGesture } from "../ui/bar.js";
import { direction } from "../core/i18n.js";
export function graphemes(text, locale) {
  return typeof Intl.Segmenter === "function" ? [...new Intl.Segmenter(locale, {granularity: "grapheme"}).segment(text)].map(({segment}) => segment) : text.match(/\P{M}\p{M}*/gu) || [];
}
const chooseWord = (choose, rng) => choose ? choose("words", concepts) : pick(concepts, rng);
export const wordCards = {
 id: "wordCards",
 create({locale, rng, choose}) {
  const item = chooseWord(choose, rng);
  return {key: item.id, answer: item.id, prompt: lessonText(locale,"sayIt"), speech: [lessonText(locale,"sayIt"), word(item,locale).speech],
   render(host,api) {
    const card = picture(item,locale,() => api.audio.speak(word(item,locale).speech,locale),true);
    card.classList.add("study-card"); host.append(card);
    if(api.helperLocale && api.helperLocale !== locale) { const helper=node("p","word-meaning",word(item,api.helperLocale).display);helper.lang=api.helperLocale;helper.dir="auto";host.append(helper); }
    host.append(button("primary-button said-button",lessonText(locale,"heard"),()=>{if(!api.isComplete?.())api.complete();}));
   }
  };
 }
};
export const wordChoice = {
 id: "wordChoice",
 create({locale,rng,choose}) {
  const item=chooseWord(choose,rng), options=shuffle([item,...sample(concepts.filter((entry)=>entry.id!==item.id),3,rng)],rng);
  return {key:item.id,answer:item.id,options:options.map(({id})=>id),prompt:lessonText(locale,"wordChoice"),speech:lessonText(locale,"wordChoice"),
   render(host,api) {
    const hero=node("div","hero-art");hero.innerHTML=art(item.id,word(item,locale).display);host.append(hero);
    const area=grid(host,"word-grid");
    for(const entry of options) {const element=tile(word(entry,locale).display,()=>{
     if(api.isComplete?.())return;
     api.audio.speak(word(entry,locale).speech,locale);
     if(entry.id!==item.id)return api.wrong(element);
     revealWord(hero,item,api);api.complete();
    },"word-tile");if(word(entry,locale).reading)element.append(node("small","word-reading",word(entry,locale).reading));area.append(element);}
   }
  };
 }
};
export const buildWord = {
 id:"buildWord",
 create({locale,rng,choose,level}) {
  const pool=concepts.filter((item)=>graphemes(word(item,locale).display,locale).length <= (level===1?6:level===2?10:24));
  const item=choose?choose("words",pool):pick(pool,rng), parts=graphemes(word(item,locale).display,locale), options=shuffle(parts.map((text,index)=>({text,index})),rng);
  return {key:item.id,answer:parts,options,prompt:lessonText(locale,"buildWord"),speech:[lessonText(locale,"buildWord"),word(item,locale).speech],
   render(host,api) {
    const hero=node("div","hero-art");hero.innerHTML=art(item.id,word(item,locale).display);host.append(hero);
    const scaffold=node("p","spelling-scaffold",word(item,locale).display);scaffold.hidden=level!==1;host.append(scaffold);
    const answer=node("div","assembled-word");answer.dir=direction(locale);answer.setAttribute("aria-live","polite");host.append(answer);
    const area=grid(host,"word-pieces");area.dir=direction(locale);let placed=[];
    for(const option of options){const element=tile(option.text===" "?"␣":option.text,()=>{
      if(api.isComplete?.()||element.disabled)return;
      if(option.text!==parts[placed.length])return api.wrong(element);
      placed.push({element,text:option.text});element.disabled=true;answer.textContent=placed.map(({text})=>text).join("");
      if(placed.length===parts.length){revealWord(hero,item,api);api.complete();}
    },"letter-tile");element.dataset.part=option.index;area.append(element);}
    host.append(button("text-button",lessonText(locale,"hint"),()=>{scaffold.hidden=false;api.hint?.();}),button("text-button",lessonText(locale,"backspace"),()=>{if(api.isComplete?.())return;const last=placed.pop();if(last)last.element.disabled=false;answer.textContent=placed.map(({text})=>text).join("");}));
   }
  };
 }
};
export const gestureChoose = {
 id:"gestureChoose",
 create({locale,rng,choose}) {
  const pool=phrases.filter(({id})=>id!=="goodbye"), target=choose?choose("phrases",pool):pick(pool,rng), options=shuffle([target,...sample(pool.filter(({id})=>id!==target.id),3,rng)],rng);
  return {key:target.id,answer:target.id,options:options.map(({id})=>id),prompt:lessonText(locale,"gesturePrompt"),speech:[lessonText(locale,"gesturePrompt"),target.words[locale]],
   render(host,api) {
    const area=grid(host,"gesture-grid");
    for(const phrase of options){const element=button("choice gesture-choice","",()=>{
     if(api.isComplete?.())return;
     if(phrase.id!==target.id)return api.wrong(element);
     element.classList.add("selected");element.append(node("span","picture-word",phrase.words[locale]));
     if(api.helperLocale&&api.helperLocale!==locale){const meaning=node("small","word-meaning",phrase.words[api.helperLocale]);meaning.dir="auto";element.append(meaning);}
     api.audio.speak(phrase.words[locale],locale);api.complete();
    });element.setAttribute("aria-label",phrase.words[locale]);element.append(barGesture(phrase.gesture));area.append(element);}
   }
  };
 }
};
