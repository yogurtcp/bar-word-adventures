import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { GameAudio } from "../src/core/audio.js";
import { languages,direction } from "../src/core/i18n.js";
import { concepts } from "../src/core/content.js";
import { games } from "../src/games/index.js";

test("children can explore all words, gestures and letters, switch languages mid-game, and install separately",async()=>{
 const {document,window}=parseHTML('<html><body><div id="app"></div></body></html>');globalThis.document=document;globalThis.window=window;
 Object.defineProperty(globalThis,"navigator",{configurable:true,value:{}});globalThis.location={hostname:"localhost"};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
 const values=new Map();globalThis.localStorage={getItem:(key)=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 globalThis.sessionStorage={getItem:()=>null,removeItem(){},setItem(){}};
 const spoken=[];let stops=0;const originalSpeak=GameAudio.prototype.speak,originalStop=GameAudio.prototype.stop;
 GameAudio.prototype.speak=async(text,locale)=>{spoken.push({text,locale});return true;};GameAudio.prototype.stop=function(){stops++;this.onStatus("idle");};
 try{
  await import('../src/main.js');
  const choose=(code)=>{const buttons=[...document.querySelectorAll('.language-choice')];assert.deepEqual(buttons.map((button)=>button.dataset.targetLanguage),languages.map(({code})=>code));buttons.find((button)=>button.dataset.targetLanguage===code).click();};
  for(const {code} of languages){
   choose(code);assert.ok(document.querySelector('.welcome-screen'));assert.equal(document.documentElement.dir,"rtl");assert.ok(document.querySelector('.welcome-install'));
   assert.equal(document.querySelectorAll('.activity-chip').length,games.length);
   document.querySelector('.shelf-words').click();assert.equal(document.querySelectorAll('.dictionary-card').length,concepts.length);document.querySelector('.dictionary-card').click();assert.equal(spoken.at(-1).locale,code);
   if(code!=='he')assert.equal(document.querySelectorAll('.word-meaning').length,86);
   document.querySelector('.home-button').click();document.querySelector('.shelf-phrases').click();assert.equal(document.querySelectorAll('.phrase-card').length,9);assert.equal(document.querySelectorAll('.bar-gesture').length,9);document.querySelector('.phrase-card').click();assert.equal(spoken.at(-1).locale,code);
   document.querySelector('.home-button').click();document.querySelector('.shelf-letters').click();assert.ok(document.querySelectorAll('.alphabet-letter').length>20);assert.ok(document.querySelector('.big-letter'));
   document.querySelector('.home-button').click();
   document.querySelectorAll('.activity-chip')[games.findIndex(({id})=>id==='letterOrder')].click();
   const opening=spoken.at(-1);assert.equal(opening.text[0].locale,'he');assert.ok(opening.text.length>=4);assert.ok(opening.text.slice(1).every((part)=>part.locale===code));
   document.querySelector('.replay-button').click();assert.deepEqual(spoken.at(-1),opening);
   document.querySelector('.home-button').click();document.querySelector('.play-button').click();assert.ok(document.querySelector('.game-screen'));const oldStops=stops;document.querySelector('.language-switch').click();assert.ok(stops>oldStops);assert.equal(document.querySelectorAll('dialog').length,0);
   choose(code);assert.ok(document.querySelector('.game-screen'),'language selection returns directly to a fresh question');document.querySelector('.home-button').click();document.querySelector('.language-switch').click();
  }
 }finally{GameAudio.prototype.speak=originalSpeak;GameAudio.prototype.stop=originalStop;}
});
