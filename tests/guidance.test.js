import test from "node:test";
import assert from "node:assert/strict";
import { games } from "../src/games/index.js";
import { languages, t } from "../src/core/i18n.js";
import { seeded } from "../src/core/helpers.js";
import { taskGuidance } from "../src/core/guidance.js";
import { readLanguageSettings, saveLanguageSetting, settingsCopy } from "../src/core/language-settings.js";
import { lessonText } from "../src/core/lessons.js";
import { audioManifest } from "../src/core/audio-manifest.js";
import { GameAudio } from "../src/core/audio.js";
import { downloadLanguage } from "../src/core/offline.js";

test("Hebrew is the default instruction and narrator language, including after upgrading old helper settings",()=>{
 const saved=new Map([["bwa-helper","en"],["bar-word-adventures-progress-v1",'{"correct":40}']]);
 globalThis.localStorage={getItem:(key)=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
 assert.deepEqual(readLanguageSettings(),{instructions:'he',narrator:'he'});
 saveLanguageSetting('instructions','en');assert.deepEqual(readLanguageSettings(),{instructions:'en',narrator:'he'});
 saveLanguageSetting('narrator','en');assert.deepEqual(readLanguageSettings(),{instructions:'en',narrator:'en'});
 saveLanguageSetting('instructions','he');assert.deepEqual(readLanguageSettings(),{instructions:'he',narrator:'en'});
 assert.equal(saved.get('bar-word-adventures-progress-v1'),'{"correct":40}');assert.throws(()=>saveLanguageSetting('narrator','es'),RangeError);
});
test("every activity keeps written instructions and narrated guidance independent of all eight learning languages",()=>{
 for(const {code:target} of languages)for(const instructions of ['he','en'])for(const narrator of ['he','en'])for(const game of games)for(const level of [1,2,3])for(let seed=1;seed<=8;seed++){
  const task=game.create({locale:target,level,rng:seeded(seed)}),guidance=taskGuidance(game.id,task,target,instructions,narrator);
  assert.ok(guidance.prompt.length>0);assert.equal(guidance.speech[0].locale,narrator);
  for(const {locale,text} of guidance.speech)assert.ok(audioManifest[locale]?.[text],`${game.id}/${target}/${instructions}/${narrator}/${text}`);
  if(instructions==='he')assert.match(guidance.prompt,/\p{Script=Hebrew}/u);else assert.doesNotMatch(guidance.prompt,/[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Cyrillic}]/u);
  if(['wordCards','buildWord','firstLetter','listenChoose','gestureChoose','initialSet'].includes(game.id))assert.equal(guidance.speech[1].locale,target);
  else if(game.id==='letterOrder'){assert.equal(guidance.speech.length,task.answer.length+1);assert.ok(guidance.speech.slice(1).every((part)=>part.locale===target));}
  else assert.equal(guidance.speech.length,1);
  if(game.id==='initialSet'){assert.equal(guidance.prompt,settingsCopy[instructions].initialSound);assert.equal(guidance.targetSound,task.key);}
 }
});
test("mixed-language playback fetches each segment in its own language and plays one ordered, cancellable sequence",async()=>{
 const originalWindow=globalThis.window,originalFetch=globalThis.fetch,urls=[],played=[];
 class Context{
  constructor(){this.state='running';this.currentTime=0;}
  async decodeAudioData(){const samples=new Float32Array(24000).fill(.2);return{sampleRate:24000,duration:1,getChannelData:()=>samples};}
  createBufferSource(){return{playbackRate:{value:1},connect(){},start(at){played.push(at);queueMicrotask(()=>this.onended());},stop(){this.onended?.();}};}
 }
 globalThis.window={AudioContext:Context};globalThis.fetch=async(url)=>{urls.push(String(url));return{ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};};
 const originalStorage=globalThis.localStorage;globalThis.localStorage={getItem:()=>null};
 try{
  const task=games.find(({id})=>id==='listenChoose').create({locale:'es',level:1,rng:seeded(2)}),guidance=taskGuidance('listenChoose',task,'es','he','en'),audio=new GameAudio();
  assert.equal(await audio.speak(guidance.speech,'en'),true);assert.equal(urls.length,2);
  assert.ok(urls[0].endsWith(audioManifest.en[t('en','listenChoose')]));assert.ok(urls[1].includes('/audio/es/'));
  assert.equal(played.length,2);assert.ok(played[1]>played[0]);assert.equal(audio.status,'idle');
 }finally{globalThis.window=originalWindow;globalThis.fetch=originalFetch;globalThis.localStorage=originalStorage;}
});
test("offline preparation includes the learning language and the independently selected narrator",async()=>{
 const originalCaches=globalThis.caches,originalFetch=globalThis.fetch,paths=[];let progress;
 globalThis.caches={open:async()=>({match:async(url)=>{paths.push(url);return true;}})};
 globalThis.fetch=async()=>{throw Error('cached recordings must not be fetched again');};
 try{
  await downloadLanguage(['es','he'],(done,total)=>{progress={done,total};});
  const expected=new Set([...Object.values(audioManifest.es),...Object.values(audioManifest.he)]);
  assert.equal(paths.length,expected.size);assert.equal(progress.done,expected.size);assert.equal(progress.total,expected.size);
  assert.ok(paths.some((path)=>path.endsWith(audioManifest.he[lessonText('he','sayIt')])));
 }finally{globalThis.caches=originalCaches;globalThis.fetch=originalFetch;}
});

test("cancelled mixed-language downloads cannot play an old instruction or word over a new screen",async()=>{
 const originalWindow=globalThis.window,originalFetch=globalThis.fetch,originalStorage=globalThis.localStorage;
 const finishes=[];let played=0;
 class Context{constructor(){this.state='running';this.currentTime=0;}async decodeAudioData(){const samples=new Float32Array(24000).fill(.2);return{sampleRate:24000,duration:1,getChannelData:()=>samples};}createBufferSource(){played++;}}
 globalThis.window={AudioContext:Context};globalThis.localStorage={getItem:()=>null};globalThis.fetch=()=>new Promise((resolve)=>finishes.push(()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)})));
 try{
  const audio=new GameAudio(),promise=audio.speak([{locale:'he',text:lessonText('he','sayIt')},{locale:'es',text:Object.keys(audioManifest.es)[0]}],'he');
  await new Promise((resolve)=>setImmediate(resolve));assert.equal(finishes.length,2);audio.stop();finishes.forEach((finish)=>finish());assert.equal(await promise,false);assert.equal(played,0);
 }finally{globalThis.window=originalWindow;globalThis.fetch=originalFetch;globalThis.localStorage=originalStorage;}
});
