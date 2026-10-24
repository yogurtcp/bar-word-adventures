import test from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {once} from "node:events";
test("the packaged app serves its root, modules, Bar atlas, manifest and audio with correct types",async()=>{
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
  const [output]=await once(child.stdout,'data'),base=String(output).trim();
  assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
  for(const [path,type] of [['/','text/html'],['/src/main.js','text/javascript'],['/manifest.webmanifest','application/manifest+json'],['/assets/bar/gestures-v1.png','image/png']]){const response=await fetch(base+path);assert.equal(response.status,200,path);assert.ok(response.headers.get('content-type').includes(type));}
  assert.equal((await fetch(base+'/%2e%2e%2fREADME.md')).status,404);
 }finally{child.kill('SIGTERM');await once(child,'exit');}
});
