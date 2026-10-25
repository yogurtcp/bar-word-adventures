import test from "node:test";
import assert from "node:assert/strict";
import {parseHTML} from "linkedom";
import {firstLetter} from "../src/games/firstLetter.js";
import {buildWord} from "../src/games/language.js";
import {games} from "../src/games/index.js";
import {seeded} from "../src/core/helpers.js";
import {GameAudio} from "../src/core/audio.js";

test("every wrong answer in both selected games immediately pauses input for exactly three seconds and preserves the question",async()=>{
 const {document,window}=parseHTML('<html><body><div id="app"></div></body></html>');globalThis.document=document;globalThis.window=window;Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});globalThis.location={hostname:'localhost'};window.matchMedia=()=>({matches:false});window.scrollTo=()=>{};
 const saved=new Map();globalThis.localStorage={getItem:(key)=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};globalThis.sessionStorage={getItem:()=>null,removeItem(){}};
 const oldSpeak=GameAudio.prototype.speak,oldEffect=GameAudio.prototype.effect,oldSet=globalThis.setTimeout,oldClear=globalThis.clearTimeout,originalFirst=firstLetter.create,originalBuild=buildWord.create;
 const effects=[],speech=[],timers=new Map();let now=0,next=0;
 globalThis.setTimeout=(fn,delay)=>{timers.set(++next,{fn,at:now+delay});return next;};globalThis.clearTimeout=(id)=>timers.delete(id);
 const tick=(ms)=>{now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}};
 GameAudio.prototype.speak=async(text,locale)=>{speech.push({text,locale});return true;};GameAudio.prototype.effect=(kind)=>effects.push(kind);
 const knownFirst=originalFirst({locale:'en',level:1,rng:seeded(11)}),knownBuild=originalBuild({locale:'en',level:1,rng:seeded(12)});
 firstLetter.create=()=>knownFirst;buildWord.create=()=>knownBuild;
 try{
  await import('../src/main.js');document.querySelector('[data-target-language="en"]').click();
  for(const game of [firstLetter,buildWord]){
   document.querySelectorAll('.activity-chip')[games.findIndex(({id})=>id===game.id)].click();const screen=document.querySelector('.game-screen'),field=document.querySelector('.task-field'),initialText=field.textContent;
   const task=game.id==='firstLetter'?knownFirst:knownBuild;
   const buttons=[...field.querySelectorAll('.letter-tile')];
   const text=(button)=>game.id==='firstLetter'?button.textContent:task.options.find(({index})=>String(index)===button.dataset.part).text;
   const answer=game.id==='firstLetter'?task.answer:task.answer[0],wrong=buttons.find((button)=>text(button)!==answer),correct=buttons.find((button)=>text(button)===answer);
   for(let attempt=0;attempt<2;attempt++){
    const before=effects.filter((kind)=>kind==='crying').length;wrong.click();assert.ok(document.querySelector('.mistake-overlay'));assert.equal(screen.inert,true);assert.equal(effects.filter((kind)=>kind==='crying').length,before+1);
    document.dispatchEvent(Object.assign(new window.Event('keydown'),{altKey:true,shiftKey:true,key:'p'}));assert.equal(document.querySelector('dialog'),null);
    const count=speech.length;correct.click();wrong.click();assert.equal(speech.length,count);assert.equal(field.textContent,initialText);assert.equal(document.querySelectorAll('.mistake-overlay').length,1);
    tick(2999);assert.ok(document.querySelector('.mistake-overlay'));assert.equal(screen.inert,true);tick(1);assert.equal(document.querySelector('.mistake-overlay'),null);assert.equal(screen.inert,false);assert.equal(field.textContent,initialText);
   }
   correct.click();assert.ok(speech.length>0);assert.equal(document.querySelector('.mistake-overlay'),null);document.querySelector('.home-button').click();tick(5000);assert.equal(document.querySelector('.mistake-overlay'),null);
  }
 }finally{GameAudio.prototype.speak=oldSpeak;GameAudio.prototype.effect=oldEffect;globalThis.setTimeout=oldSet;globalThis.clearTimeout=oldClear;firstLetter.create=originalFirst;buildWord.create=originalBuild;}
});
