import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import vm from "node:vm";
const read=(path)=>readFileSync(new URL(`../dist/${path}`,import.meta.url),'utf8');
test("standalone metadata, dedicated identity, iOS icon and all offline learning assets are packaged",async()=>{
 const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.name,'Bar’s Word Adventures');assert.equal(manifest.id,'./');assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 for(const icon of manifest.icons){const png=readFileSync(new URL(`../dist/${icon.src}`,import.meta.url));const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
 const touchIcon=read('index.html').match(/rel="apple-touch-icon" href="([^"]+)"/)[1];
 const ios=readFileSync(new URL(`../dist/${touchIcon}`,import.meta.url));assert.equal(ios.readUInt32BE(16),180);assert.equal(ios.readUInt32BE(20),180);
 const handlers={},cached=[],deleted=[];let pending,skipped=false,claimed=false;
 vm.runInNewContext(read('sw.js'),{URL,Request,Promise,self:{registration:{scope:'https://yogurtcp.github.io/bar-word-adventures/'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{skipped=true;},clients:{claim:async()=>{claimed=true;}}},caches:{open:async()=>({addAll:async(requests)=>cached.push(...requests)}),keys:async()=>['little-language-quest-shell-v20','bar-journey-cache','bar-word-adventures-audio-v1','bar-word-adventures-shell-old'],delete:async(name)=>deleted.push(name)}});
 handlers.install({waitUntil:(promise)=>pending=promise});await pending;assert.ok(skipped);assert.ok(cached.length>50);
 for(const request of cached){assert.equal(request.cache,'reload');const path=new URL(request.url).pathname.replace('/bar-word-adventures/','');assert.ok(existsSync(new URL(`../dist/${path}`,import.meta.url)),path);}
 for(const required of ['assets/bar/gestures-v1.png','assets/bar/crying-v1.png','assets/objects/daily-people.png','src/ui/mistake-pause.js','src/locales/fil.js','src/core/lessons.js','src/games/language.js','src/core/updates.js',...manifest.icons.map(({src})=>src.replace('./','')),touchIcon.replace('./','')])assert.ok(cached.some(({url})=>url.endsWith(required)),required);
 handlers.activate({waitUntil:(promise)=>pending=promise});await pending;assert.deepEqual(deleted,['bar-word-adventures-shell-old']);assert.ok(claimed);
});
test("a failed shell download never replaces a working offline installation",async()=>{
 const handlers={};let pending,activated=false;
 vm.runInNewContext(read('sw.js'),{URL,Request,Promise,self:{registration:{scope:'https://example.com/bar-word-adventures/'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{activated=true;}},caches:{open:async()=>({addAll:async()=>{throw Error('offline');}})}});
 handlers.install({waitUntil:(promise)=>pending=promise});await assert.rejects(pending,/offline/);assert.equal(activated,false);
});
test("the new Bar atlas has true transparency and all eight animations have two frames",()=>{
 const png=readFileSync(new URL('../assets/bar/gestures-v1.png',import.meta.url));assert.equal(png.readUInt32BE(16),png.readUInt32BE(20));assert.equal(png[25],6,'RGBA PNG');
 const css=read('styles.css');assert.match(css,/background-size:400% 400%/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/gentle-motion/);
});
