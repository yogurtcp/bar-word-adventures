"""Generate the free voice audition locally with BlueTTS 2.5 (no paid API).
Use a checkout of https://github.com/maxmelichov/BlueTTS and its documented ONNX bundle.
Build dependencies: numpy, soundfile, onnxruntime, num2words. No runtime app dependency.
"""
import argparse,json,os,sys,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--engine-path',type=Path,required=True)
 parser.add_argument('--model-dir',type=Path,required=True)
 args=parser.parse_args()
 os.environ.setdefault('ORT_NUM_THREADS','2')
 sys.path.insert(0,str(args.engine_path/'src'))
 import numpy as np
 import soundfile as sf
 from blue_onnx import load_text_to_speech,load_voice_style,limit_peak
 config=json.loads((ROOT/'scripts/free-hebrew-preview.json').read_text())
 output=ROOT/'assets/voice-preview';output.mkdir(parents=True,exist_ok=True)
 tts=load_text_to_speech(str(args.model_dir))
 records={}
 for name,voice in [('female','libri_female_6147'),('male','libri_male_6209')]:
  style=load_voice_style([str(args.model_dir/'voices'/f'{voice}.json')])
  pieces=[]
  for kind,text in config['phonemes'].items():
   np.random.seed(20261025)
   audio,_=tts(text,lang='he',style=style,total_step=16,cfg_scale=4.0,speed=.8,text_is_phonemes=True,normalize_text=False)
   audio=limit_peak(audio).reshape(-1)
   duration=len(audio)/tts.sample_rate
   if not (np.isfinite(audio).all() and .2<duration<40 and np.std(audio)>.001):
    raise ValueError(f'Invalid sample: {name}/{kind}')
   pieces.extend([audio,np.zeros(round(tts.sample_rate*.65),dtype=np.float32)])
  sf.write(output/f'blue-{name}.mp3',np.concatenate(pieces),tts.sample_rate,format='MP3',subtype='MPEG_LAYER_III')
  decoded,sr=sf.read(output/f'blue-{name}.mp3')
  if len(decoded)/sr<5 or np.max(np.abs(decoded))>=1:raise ValueError('Invalid encoded audio')
  records[name]={'voice':voice,'seconds':len(decoded)/sr,'sampleRate':sr}
  print(name,round(len(decoded)/sr,2),'seconds',flush=True)
 metadata={'engine':'BlueTTS 2.5','engineCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=args.engine_path,text=True).strip(),
  'modelRevision':(args.model_dir/'revision.txt').read_text().strip(),'steps':16,'cfgScale':4.0,'speed':.8,**config,'records':records}
 (output/'preview.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
 print('Free preview ready; game narration unchanged.',flush=True)

if __name__=='__main__':main()
