import { cp, mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root=fileURLToPath(new URL("../",import.meta.url));
const dist=path.join(root,"dist");
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ["src","assets","icons","index.html","styles.css","manifest.webmanifest","update.html","voice-preview.html"])await cp(path.join(root,name),path.join(dist,name),{recursive:true});
// Bundle active recordings only. Obsolete source-game math audio is never shipped.
const {audioManifest}=await import("../src/core/audio-manifest.js");
const voiceRelease=JSON.parse(await readFile(path.join(root,"scripts/hebrew/blue-recordings.json"),"utf8"));
// Previous Hebrew URLs stay usable while an active old question waits for a safe update boundary.
const audioPaths=[...new Set([...Object.values(audioManifest).flatMap(Object.values),...voiceRelease.previousPaths])];
for(const name of audioPaths){await mkdir(path.dirname(path.join(dist,name)),{recursive:true});await cp(path.join(root,name),path.join(dist,name));}
async function list(directory,prefix="") {
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){const relative=prefix+entry.name;if(entry.isDirectory())result.push(...await list(path.join(directory,entry.name),relative+"/"));else result.push(relative);}
 return result.sort();
}
const files=await list(dist),shell=files.filter((name)=>(!name.startsWith("audio/")||name.startsWith("audio/he/"))&&name!=="update.html");
const hash=createHash("sha256");
for(const name of shell)hash.update(name).update(await readFile(path.join(dist,name)));
const template=await readFile(path.join(root,"sw.js"),"utf8");hash.update(template);
const release=hash.digest("hex").slice(0,12);
const worker=template.replace('bar-word-adventures-shell-development',`bar-word-adventures-shell-${release}`).replace('const CORE = []; // Filled by scripts/build.mjs.',`const CORE = ${JSON.stringify(["./",...shell.map((name)=>`./${name}`)],null,2)};`);
await writeFile(path.join(dist,"sw.js"),worker);await writeFile(path.join(dist,".nojekyll"),"");
console.log(JSON.stringify({release,shellFiles:shell.length,recordings:audioPaths.length,directory:dist}));
