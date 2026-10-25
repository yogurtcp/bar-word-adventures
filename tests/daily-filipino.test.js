import test from "node:test";
import assert from "node:assert/strict";
import {languages} from "../src/core/i18n.js";
import {concepts,byId,word,alphabets} from "../src/core/content.js";
import {phrases,topics,topicWords} from "../src/core/lessons.js";
import {graphemes} from "../src/core/writing.js";
import {unitSpeech,speechCatalog} from "../src/core/speech.js";
import {games} from "../src/games/index.js";
import {seeded} from "../src/core/helpers.js";
import {initial} from "../src/locales/fil.js";
import {audioManifest} from "../src/core/audio-manifest.js";

test("everyday words span people, body, actions, feelings, opposites and objects in all nine languages",()=>{
 assert.equal(languages.at(-1).code,'fil');assert.equal(concepts.length,134);assert.equal(phrases.length,27);
 for(const id of ['child','boy','girl','baby','mother','father','water','head','hand','door','soap','eat','drink','happy','sad','big','small','hot','cold','redColor'])for(const {code} of languages)assert.ok(word(byId[id],code).display,`${id}/${code}`);
 for(const id of ['hello','goodbye','goodMorning','goodNight','sorry','howAreYou','helpMe','waterPlease','imHungry','myNameIs'])for(const {code} of languages)assert.ok(phrases.find((phrase)=>phrase.id===id).words[code]);
 assert.equal(Object.keys(topics).length,13);assert.equal(Object.keys(topics).flatMap((topic)=>topicWords(topic)).length,134);
});
test("Filipino uses the 28-letter alphabet with Ñ and NG, including NG tiles within words",()=>{
 assert.equal(alphabets.fil.length,28);assert.deepEqual(alphabets.fil.slice(13,18),['N','Ñ','NG','O','P']);assert.equal(initial('ngiti'),'NG');assert.deepEqual(graphemes('saging','fil'),['s','a','g','i','ng']);assert.equal(unitSpeech('fil','ng'),'en dyi');
 for(const item of concepts)assert.ok(alphabets.fil.includes(word(item,'fil').initial),item.id);
 for(const text of speechCatalog('fil'))assert.ok(audioManifest.fil[text],text);
});
test("picture-only quizzes avoid ambiguous people, actions and adjective pictures while naming and spelling can teach them",()=>{
 for(const game of games.filter(({id})=>['listenChoose','wordChoice','memoryPairs','initialSet'].includes(id)))for(let seed=1;seed<=50;seed++){
  const task=game.create({locale:'fil',level:3,rng:seeded(seed)}),ids=task.cards?task.cards.map(({id})=>id):task.options;
  for(const id of ids)assert.notEqual(byId[id].quiz,false,`${game.id}/${id}`);
 }
});
