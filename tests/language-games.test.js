import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { statSync,readFileSync } from "node:fs";
import { languages,copy } from "../src/core/i18n.js";
import { lessonCopy,phrases,topics,topicWords } from "../src/core/lessons.js";
import { concepts,byId,word,alphabets } from "../src/core/content.js";
import { games } from "../src/games/index.js";
import { graphemes } from "../src/games/language.js";
import { seeded } from "../src/core/helpers.js";
import { speechCatalog } from "../src/core/speech.js";
import { audioManifest } from "../src/core/audio-manifest.js";
import { TaskScheduler } from "../src/core/scheduler.js";
import { readProgress,award } from "../src/core/rewards.js";

function fixture(task,locale) {
 const {document}=parseHTML("<main></main>");globalThis.document=document;
 const host=document.querySelector("main");let done=false,wins=0,misses=0;
 const later=[];
 task.render(host,{locale,helperLocale:locale==="en"?"he":"en",audio:{speak(){}},isComplete:()=>done,later:(fn)=>later.push(fn),wrong:()=>misses++,complete:()=>{if(!done){done=true;wins++;}},hint(){}});
 return {host,later,get wins(){return wins;},get misses(){return misses;}};
}
test("ten language-only activities and complete content in the requested language order",()=>{
 assert.deepEqual(languages.map(({code})=>code),["es","ru","he","en","zh","ja","ar","tr","fil"]);
 assert.equal(games.length,10);
 assert.ok(games.every(({id})=>!['arithmetic','compare','countGroup','makeAmount','missingNumber','patternNext'].includes(id)));
 for(const {code} of languages){for(const key of Object.keys(lessonCopy.en))assert.equal(typeof lessonCopy[code][key],"string",`${code}/${key}`);for(const game of games)assert.ok(copy[code].gameNames[game.id]);for(const item of concepts)assert.ok(alphabets[code].includes(word(item,code).initial));}
 assert.equal(phrases.length,27);
 const categorized=Object.keys(topics).flatMap((topic)=>topicWords(topic).map(({id})=>id));
 assert.equal(categorized.length,134);assert.equal(new Set(categorized).size,134);assert.deepEqual(new Set(categorized),new Set(concepts.map(({id})=>id)));
});
test("all games can be solved at three difficulties in all nine languages; mistakes never block a retry",()=>{
 for(const game of games)for(const {code:locale} of languages)for(const level of [1,2,3])for(let seed=1;seed<=8;seed++){
  const task=game.create({locale,level,rng:seeded(seed)}),f=fixture(task,locale),buttons=[...f.host.querySelectorAll("button")];
  if(game.id==="wordCards")f.host.querySelector(".said-button").click();
  else if(game.id==="buildWord"){
   let current=0;
   while(current<task.answer.length){const wrong=buttons.find((button)=>button.dataset.part!==undefined&&task.options.find(({index})=>String(index)===button.dataset.part).text!==task.answer[current]);if(current===0&&wrong){wrong.click();assert.equal(f.misses,1);}
    const button=buttons.find((button)=>button.dataset.part!==undefined&&!button.disabled&&task.options.find(({index})=>String(index)===button.dataset.part).text===task.answer[current]);assert.ok(button,`${locale}/${task.key}/${current}`);button.click();current++;
   }
   assert.equal(f.host.querySelector(".assembled-word").textContent,word(byId[task.key],locale).display);
  }
  else if(["wordChoice","gestureChoose","describe","listenChoose"].includes(game.id)){
   const wrong=task.options.findIndex((id)=>id!==task.answer);buttons[wrong].click();assert.equal(f.misses,1);buttons[task.options.indexOf(task.answer)].click();
  } else if(game.id==="initialSet")for(const id of task.answers)buttons[task.options.indexOf(id)].click();
  else if(game.id==="letterOrder")for(const text of task.answer)buttons.find((button)=>button.textContent===text).click();
  else if(game.id==="firstLetter")buttons.find((button)=>button.textContent===task.answer).click();
  else if(game.id==="memoryPairs")for(const id of new Set(task.cards.map(({id})=>id)))task.cards.forEach((card,i)=>{if(card.id===id)buttons[i].click();});
  assert.equal(f.wins,1,`${game.id}/${locale}/${level}/${seed}`);
 }
});
test("every reachable learning instruction, phrase, letter and picture word has a bundled recording",()=>{
 for(const {code:locale} of languages){for(const text of speechCatalog(locale))assert.ok(audioManifest[locale][text],`${locale}/${text}`);for(const game of games)for(const level of [1,2,3])for(let seed=1;seed<70;seed++){const task=game.create({locale,level,rng:seeded(seed)});for(const text of [task.speech||task.prompt].flat())assert.ok(audioManifest[locale][text],`${game.id}/${locale}/${text}`);}}
 for(const recordings of Object.values(audioManifest))for(const file of Object.values(recordings))assert.ok(statSync(new URL(`../${file}`,import.meta.url)).size>1000,file);
});
test("word construction preserves Arabic/Hebrew vowel marks, Turkish letters, Chinese characters and Japanese kana",()=>{
 for(const locale of ['ar','he','tr','zh','ja','es'])for(const item of concepts)assert.equal(graphemes(word(item,locale).display,locale).join(''),word(item,locale).display);
 assert.equal(graphemes('כֶּלֶב','he').length,3);assert.equal(graphemes('كَلْب','ar').length,3);
});
test("activity switching resets only the activity bag and maintains independent content histories",()=>{
 globalThis.localStorage={getItem:()=>null,setItem(){}};const scheduler=new TaskScheduler();
 for(const {code} of languages){const seen=new Set();for(let i=0;i<games.length;i++)seen.add(scheduler.next(games,code,1).game.id);assert.equal(seen.size,games.length);for(const game of games)assert.equal(scheduler.next([game],code,1).game.id,game.id);}
});
test("saves, settings, and updates are isolated from both existing apps",()=>{
 const values=new Map([["little-language-quest-progress-v1",'{"correct":100}'],["bar-journey-v6",'{"passed":[1]}'],["llq-volume","50"]]);
 globalThis.localStorage={getItem:(key)=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 const progress=readProgress();assert.equal(progress.correct,0);award(progress,"es","listenChoose");assert.equal(readProgress().correct,1);
 assert.equal(values.get("little-language-quest-progress-v1"),'{"correct":100}');assert.equal(values.get("bar-journey-v6"),'{"passed":[1]}');assert.equal(values.get("llq-volume"),"50");
 const worker=readFileSync(new URL('../sw.js',import.meta.url),'utf8');assert.ok(!worker.includes('little-language-quest'));assert.ok(!worker.includes('bar-journey'));
});
