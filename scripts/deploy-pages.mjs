import {execFileSync} from "node:child_process";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
const project=fileURLToPath(new URL('../',import.meta.url)),site=join(project,'dist');
const repository='yogurtcp/bar-word-adventures',remote=`https://github.com/${repository}.git`;
const run=(command,args,options={})=>execFileSync(command,args,{cwd:project,encoding:'utf8',...options});
const auth=['-c','credential.helper=','-c','credential.helper=!gh auth git-credential'];
run('npm',['test'],{stdio:'inherit'});
const work=mkdtempSync(join(tmpdir(),'bar-words-pages-'));
try{
 const env={...process.env,GIT_DIR:join(project,'.git'),GIT_WORK_TREE:site,GIT_INDEX_FILE:join(work,'index')};
 const git=(args)=>run('git',['-c','user.name=Codex','-c','user.email=codex@users.noreply.github.com',...args],{cwd:site,env});
 const parents=[];
 if(run('git',[...auth,'ls-remote','--heads',remote,'gh-pages']).trim()){
  run('git',[...auth,'fetch',remote,'gh-pages'],{stdio:'inherit'});parents.push('-p',run('git',['rev-parse','FETCH_HEAD']).trim());
 }
 git(['read-tree','--empty']);git(['add','--all','--force']);
 const tree=git(['write-tree']).trim(),revision=run('git',['rev-parse','--short','HEAD']).trim();
 const commit=git(['commit-tree',tree,...parents,'-m',`Publish Bar Words ${revision}`]).trim();
 run('git',[...auth,'push',remote,`${commit}:refs/heads/gh-pages`],{stdio:'inherit'});
 const configuration={build_type:'legacy',source:{branch:'gh-pages',path:'/'}};
 let method='PUT';try{run('gh',['api',`repos/${repository}/pages`]);}catch{method='POST';}
 run('gh',['api','--method',method,`repos/${repository}/pages`,'--input','-'],{input:JSON.stringify(configuration)});
 console.log('Published branch: https://yogurtcp.github.io/bar-word-adventures/');
}finally{rmSync(work,{recursive:true,force:true});}
