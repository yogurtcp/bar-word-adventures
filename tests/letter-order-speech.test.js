import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { languages, t } from "../src/core/i18n.js";
import { alphabets } from "../src/core/content.js";
import { spoken } from "../src/core/speech.js";
import { letterOrder } from "../src/games/letterOrder.js";
import { taskGuidance } from "../src/core/guidance.js";
import { audioManifest } from "../src/core/audio-manifest.js";
import { seeded } from "../src/core/helpers.js";

test("letter-order autoplay and replay say native letter names in answer order after the chosen narrator",()=>{
 for(const {code:locale} of languages)for(const narrator of ['he','en'])for(const level of [1,2,3])for(let seed=1;seed<=25;seed++){
  const task=letterOrder.create({locale,level,rng:seeded(seed)}),guidance=taskGuidance('letterOrder',task,locale,'he',narrator);
  assert.equal(guidance.prompt,t('he','letterOrder'));
  assert.deepEqual(guidance.speech,[{text:t(narrator,'letterOrder'),locale:narrator},...task.answer.map((letter)=>({text:spoken[locale].letters[alphabets[locale].indexOf(letter)],locale}))]);
  for(const part of guidance.speech)assert.ok(audioManifest[part.locale][part.text],`${part.locale}/${part.text}`);
 }
});
test("correct and mistaken letter taps say that letter; completed and already placed letters stay silent",()=>{
 for(const {code:locale} of languages)for(const level of [1,2,3]){
  const {document}=parseHTML('<main></main>');globalThis.document=document;
  const host=document.querySelector('main'),task=letterOrder.create({locale,level,rng:seeded(6)}),said=[];let complete=false,wins=0,mistakes=0;
  task.render(host,{audio:{speak:(text,language)=>said.push({text,locale:language})},isComplete:()=>complete,wrong:()=>mistakes++,complete:()=>{complete=true;wins++;}});
  const buttons=[...host.querySelectorAll('button')],buttonFor=(letter)=>buttons.find((button)=>button.textContent===letter);
  const wrong=task.answer[1];buttonFor(wrong).click();assert.equal(mistakes,1);assert.equal(host.querySelectorAll('.placed-letter').length,0);
  assert.deepEqual(said.at(-1),{text:spoken[locale].letters[alphabets[locale].indexOf(wrong)],locale});
  for(const letter of task.answer){buttonFor(letter).click();assert.deepEqual(said.at(-1),{text:spoken[locale].letters[alphabets[locale].indexOf(letter)],locale});const count=said.length;buttonFor(letter).click();assert.equal(said.length,count);}
  assert.equal(wins,1);const count=said.length;for(const button of buttons)button.click();assert.equal(said.length,count);assert.equal(mistakes,1);
 }
});
