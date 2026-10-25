import test from "node:test";
import assert from "node:assert/strict";
import {parseHTML} from "linkedom";
import {TaskLifetime} from "../src/core/lifecycle.js";
import {createMistakePause,MISTAKE_PAUSE_MS} from "../src/ui/mistake-pause.js";
import {GameAudio} from "../src/core/audio.js";

function clock(){let now=0,index=0;const tasks=new Map(),oldSet=globalThis.setTimeout,oldClear=globalThis.clearTimeout;globalThis.setTimeout=(fn,delay)=>{tasks.set(++index,{fn,at:now+delay});return index;};globalThis.clearTimeout=(id)=>tasks.delete(id);return{tick(ms){now+=ms;for(const [id,entry] of [...tasks])if(entry.at<=now){tasks.delete(id);entry.fn();}},restore(){globalThis.setTimeout=oldSet;globalThis.clearTimeout=oldClear;}};}
test("a mistake immediately locks the entire game for three seconds, then restores the same screen",()=>{
 const time=clock();try{
  const {document}=parseHTML('<div id="app"><main><button>answer</button></main></div>');globalThis.document=document;
  const host=document.querySelector('#app'),screen=document.querySelector('main'),lifetime=new TaskLifetime(),effects=[];let resumed=0;
  const pause=createMistakePause({host,screen,lifetime,audio:{effect:(kind)=>effects.push(kind)},locale:'he',onResume:()=>resumed++});
  assert.equal(pause.start(),true);assert.equal(screen.inert,true);assert.equal(pause.active,true);assert.ok(host.querySelector('.bar-crying'));assert.equal(host.querySelector('.mistake-overlay').getAttribute('aria-modal'),'true');
  assert.equal(pause.start(),false);assert.deepEqual(effects,['crying']);assert.equal(host.querySelectorAll('.mistake-overlay').length,1);
  time.tick(MISTAKE_PAUSE_MS-1);assert.equal(pause.active,true);assert.equal(screen.inert,true);time.tick(1);assert.equal(pause.active,false);assert.equal(screen.inert,false);assert.equal(resumed,1);assert.equal(host.querySelector('.mistake-overlay'),null);
  assert.equal(pause.start(),true);time.tick(MISTAKE_PAUSE_MS);assert.equal(resumed,2);assert.deepEqual(effects,['crying','crying']);lifetime.dispose();
 }finally{time.restore();}
});
test("leaving a task removes its crying overlay and cancels its timer without changing a newer task",()=>{
 const time=clock();try{
  const {document}=parseHTML('<div id="app"><main></main></div>');globalThis.document=document;
  const host=document.querySelector('#app'),screen=document.querySelector('main'),lifetime=new TaskLifetime();let resumed=0;
  const pause=createMistakePause({host,screen,lifetime,audio:{effect(){}},locale:'en',onResume:()=>resumed++});pause.start();lifetime.dispose();
  assert.equal(pause.active,false);assert.equal(screen.inert,false);assert.equal(host.querySelector('.mistake-overlay'),null);host.append(document.createElement('main'));time.tick(10000);assert.equal(resumed,0);assert.equal(pause.start(),false);
 }finally{time.restore();}
});
test("sad sounds last through the pause, respect mute and volume, and stop with a screen change",()=>{
 const oldWindow=globalThis.window;globalThis.window={};try{
  const audio=new GameAudio(),notes=[],stopped=[];
  audio.context={state:'running',currentTime:1};audio.tone=(frequency,at,duration,gain)=>notes.push({frequency,at,duration,gain});audio.muted=false;audio.effect('crying');assert.ok(notes.length>=7);assert.ok(Math.max(...notes.map(({at,duration})=>at+duration))-1>=2.5);assert.ok(notes.every(({gain})=>gain<=.04));
  notes.length=0;audio.muted=true;audio.effect('crying');assert.equal(notes.length,0);audio.effects.add({stop:()=>stopped.push(true)});audio.stop();assert.equal(stopped.length,1);assert.equal(audio.effects.size,0);
 }finally{globalThis.window=oldWindow;}
});
