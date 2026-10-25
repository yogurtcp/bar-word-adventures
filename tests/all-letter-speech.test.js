import test from "node:test";
import assert from "node:assert/strict";
import {parseHTML} from "linkedom";
import {languages} from "../src/core/i18n.js";
import {concepts,word,byId} from "../src/core/content.js";
import {letterSpeech,unitSpeech} from "../src/core/speech.js";
import {graphemes} from "../src/core/writing.js";
import {firstLetter} from "../src/games/firstLetter.js";
import {buildWord} from "../src/games/language.js";
import {taskGuidance} from "../src/core/guidance.js";
import {audioManifest} from "../src/core/audio-manifest.js";
import {seeded} from "../src/core/helpers.js";

function fixture(game,locale,level,seed){
 const {document}=parseHTML('<main></main>');globalThis.document=document;
 const host=document.querySelector('main'),task=game.create({locale,level,rng:seeded(seed)}),speech=[];let done=false,mistakes=0;
 task.render(host,{locale,audio:{speak:(text,language)=>speech.push({text,locale:language})},isComplete:()=>done,complete:()=>{done=true;},wrong:()=>mistakes++});
 return{host,task,speech,get done(){return done;},get mistakes(){return mistakes;}};
}
test("first-letter choices pronounce wrong answers and queue the correct letter before its full word",()=>{
 for(const {code:locale} of languages)for(const level of [1,2,3])for(let seed=1;seed<=12;seed++){
  const f=fixture(firstLetter,locale,level,seed),buttons=[...f.host.querySelectorAll('button')];
  const wrong=f.task.options.find((letter)=>letter!==f.task.answer);buttons[f.task.options.indexOf(wrong)].click();
  assert.deepEqual(f.speech.at(-1),{text:letterSpeech(locale,wrong),locale});assert.equal(f.mistakes,1);assert.equal(f.done,false);
  buttons[f.task.options.indexOf(f.task.answer)].click();assert.equal(f.done,true);
  assert.deepEqual(f.speech.at(-1),{text:[letterSpeech(locale,f.task.answer),word(byId[f.task.key],locale).speech],locale});
  const count=f.speech.length;buttons.forEach((button)=>button.click());assert.equal(f.speech.length,count);
 }
});
test("word-building tiles pronounce each letter or character, including mistakes, and keep the last letter audible before the whole word",()=>{
 for(const {code:locale} of languages)for(const level of [1,2,3])for(let seed=1;seed<=12;seed++){
  const f=fixture(buildWord,locale,level,seed),buttons=[...f.host.querySelectorAll('[data-part]')],part=(button)=>f.task.options.find(({index})=>String(index)===button.dataset.part).text;
  const wrong=buttons.find((button)=>part(button)!==f.task.answer[0]);if(wrong){wrong.click();assert.deepEqual(f.speech.at(-1),{text:unitSpeech(locale,part(wrong)),locale});assert.equal(f.done,false);}
  f.task.answer.forEach((unit,index)=>{const button=buttons.find((button)=>!button.disabled&&part(button)===unit);assert.ok(button);button.click();assert.deepEqual(f.speech.at(-1),{text:index===f.task.answer.length-1?[unitSpeech(locale,unit),word(byId[f.task.key],locale).speech]:unitSpeech(locale,unit),locale});});
  assert.equal(f.done,true);const count=f.speech.length;buttons.forEach((button)=>button.click());assert.equal(f.speech.length,count);
 }
});
test("every actual writing tile has a nonempty, bundled native pronunciation",()=>{
 for(const {code:locale} of languages)for(const item of concepts)for(const unit of graphemes(word(item,locale).display,locale)){
  const name=unitSpeech(locale,unit);assert.equal(typeof name,'string');assert.ok(name.trim(),`${locale}/${unit}`);assert.ok(audioManifest[locale][name],`${locale}/${unit}/${name}`);
 }
 assert.equal(unitSpeech('tr','i'),letterSpeech('tr','İ'));assert.equal(unitSpeech('tr','ı'),letterSpeech('tr','I'));
 assert.equal(unitSpeech('es','ñ'),letterSpeech('es','Ñ'));assert.equal(unitSpeech('es','á'),'a con tilde');
 assert.equal(unitSpeech('he','כֶּ'),letterSpeech('he','כ'));assert.equal(unitSpeech('he','ך'),'כָּף סוֹפִית');assert.equal(unitSpeech('ar','ة'),'تَاء مَرْبُوطَة');
 assert.equal(unitSpeech('ja','っ'),'ちいさい つ');assert.equal(unitSpeech('en',' '),'space');
});
test("first-letter and word-building prompts read all displayed choices in the learning language",()=>{
 for(const {code:locale} of languages)for(const game of [firstLetter,buildWord]){
  const task=game.create({locale,level:3,rng:seeded(10)}),guidance=taskGuidance(game.id,task,locale,'he','en');
  assert.equal(guidance.speech[0].locale,'en');assert.equal(guidance.speech[1].text,word(byId[task.key],locale).speech);
  assert.deepEqual(guidance.speech.slice(2),task.options.map((option)=>({text:game.id==='firstLetter'?letterSpeech(locale,option):unitSpeech(locale,option.text),locale})));
 }
});
