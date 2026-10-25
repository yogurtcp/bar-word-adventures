import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { GameAudio } from "../src/core/audio.js";
import { lessonText } from "../src/core/lessons.js";
import { t } from "../src/core/i18n.js";
import { games } from "../src/games/index.js";

test("instruction and narrator controls stay independent while learning or switching foreign languages",async()=>{
 const {document,window}=parseHTML('<html><body><div id="app"></div></body></html>');globalThis.document=document;globalThis.window=window;
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});globalThis.location={hostname:'localhost'};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
 const saved=new Map([['bwa-helper','en'],['bar-word-adventures-progress-v1',JSON.stringify({correct:15,byLocale:{es:15},skills:{'es:listenChoose':9}})]]);
 globalThis.localStorage={getItem:(key)=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};globalThis.sessionStorage={getItem:()=>null,removeItem(){}};
 const speech=[],oldSpeak=GameAudio.prototype.speak,oldStop=GameAudio.prototype.stop;
 GameAudio.prototype.speak=async(text,locale)=>{speech.push({text,locale});return true;};GameAudio.prototype.stop=function(){this.onStatus('idle');};
 const change=(id,value)=>{const select=document.getElementById(id);assert.ok(select,id);for(const option of select.querySelectorAll('option'))option.selected=false;select.querySelector(`option[value="${value}"]`).selected=true;select.dispatchEvent(new window.Event('change'));};
 const startWords=()=>document.querySelectorAll('.activity-chip')[games.findIndex(({id})=>id==='wordCards')].click();
 try{
  await import('../src/main.js');
  assert.equal(document.documentElement.lang,'he-IL');assert.equal(document.getElementById('instruction-language').value,'he');assert.equal(document.getElementById('narrator-language').value,'he');
  document.querySelector('[data-target-language="es"]').click();
  assert.equal(document.getElementById('learning-language').value,'es');assert.equal(document.querySelector('.welcome-heading').textContent,lessonText('he','appName'));
  change('instruction-language','en');assert.equal(document.documentElement.lang,'en-US');assert.equal(document.getElementById('narrator-language').value,'he');
  startWords();assert.equal(document.querySelector('.task-prompt').textContent,lessonText('en','sayIt'));assert.equal(document.querySelector('.said-button').textContent,lessonText('en','heard'));
  assert.equal(document.querySelector('.task-field').lang,'es-ES');assert.equal(document.querySelector('.task-field').dir,'ltr');assert.equal(speech.at(-1).text[0].locale,'he');assert.equal(speech.at(-1).text[1].locale,'es');
  document.querySelector('.study-card').click();assert.equal(speech.at(-1).locale,'es');
  document.querySelector('.home-button').click();change('narrator-language','en');change('instruction-language','he');assert.equal(document.getElementById('narrator-language').value,'en');
  startWords();assert.equal(document.querySelector('.task-prompt').textContent,lessonText('he','sayIt'));assert.equal(document.querySelector('.said-button').textContent,lessonText('he','heard'));assert.equal(speech.at(-1).text[0].locale,'en');assert.equal(speech.at(-1).text[1].locale,'es');
  document.querySelector('.language-switch').click();document.querySelector('[data-target-language="ar"]').click();assert.equal(document.documentElement.lang,'he-IL');assert.equal(document.querySelector('.task-field').lang,'ar-SA');assert.equal(document.querySelector('.task-field').dir,'rtl');assert.equal(speech.at(-1).text[0].locale,'en');assert.equal(speech.at(-1).text[1].locale,'ar');
  assert.equal(document.querySelector('.next-button'),null);assert.equal(document.querySelector('.star-count').textContent,'3');
  assert.equal(saved.get('bwa-instruction-language'),'he');assert.equal(saved.get('bwa-narrator-language'),'en');assert.equal(JSON.parse(saved.get('bar-word-adventures-progress-v1')).correct,15);
  const create=document.createElement.bind(document);document.createElement=(tag)=>{const element=create(tag);if(tag==='dialog'){element.showModal=()=>{};element.close=()=>{};}return element;};
  document.querySelector('.parent-gate').click();assert.equal(document.querySelector('#gate-title').textContent,t('he','parentQuestion'));document.querySelector('.parent-answer').value='19';[...document.querySelectorAll('dialog button')].find((button)=>button.textContent==='✓').click();
  assert.ok(document.querySelector('.parent-panel'));assert.equal(document.getElementById('learning-language').value,'ar');assert.equal(document.getElementById('instruction-language').value,'he');assert.equal(document.getElementById('narrator-language').value,'en');
  change('instruction-language','en');assert.equal(document.documentElement.lang,'en-US');assert.equal(document.querySelector('.panel-heading h1').textContent,t('en','parentTitle'));assert.equal(document.getElementById('learning-language').value,'ar');
 }finally{GameAudio.prototype.speak=oldSpeak;GameAudio.prototype.stop=oldStop;}
});
