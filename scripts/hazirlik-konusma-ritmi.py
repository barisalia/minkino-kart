"""Derive silence and openness cues from the actual home dialogue recordings."""
import json, subprocess
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parents[1]
ffmpeg=root/'node_modules/ffmpeg-static/ffmpeg.exe'
folder=root/'assets/hazirlik/ses'
items={}
ev_sesleri=set(folder.glob('anne_eve_*.mp3'))|set(folder.glob('kino_eve_*.mp3'))|set(folder.glob('kino_gunum_*.mp3'))
for filename in sorted(ev_sesleri):
    data=subprocess.run([str(ffmpeg),'-loglevel','error','-i',str(filename),'-ac','1','-ar','16000','-f','s16le','pipe:1'],capture_output=True,check=True).stdout
    sig=np.frombuffer(data,dtype='<i2').astype(np.float32)/32768
    ms=80
    pad=(-len(sig))%1280
    windows=np.pad(sig,(0,pad)).reshape((-1,1280))
    energy=np.sqrt(np.mean(windows**2,axis=1))
    # Relative cutoffs preserve the breathing room in warm quiet replies.
    ref=max(.035,np.percentile(energy,85))
    values=[]
    for i,(w,e) in enumerate(zip(windows,energy)):
        ratio=e/ref
        if ratio<.105 or e<.008: v=0
        elif ratio<.4:v=1
        else:
            crosses=np.mean((w[1:]>0)!=(w[:-1]>0))
            v=4 if crosses>.117 and ratio<1.3 else 3 if crosses<.061 and ratio<.9 else 2
        values.append(v)
    # Göz kırpışını bir hecenin ortasına koyma. Doğal cümle arasında sessiz
    # en az dört pencere bul; ortadaki 160 ms kapalı ağızlı göz kırpışıdır.
    son=-32
    for i in range(3,len(values)-3):
        if i-son>=34 and values[i-1:i+3]==[0,0,0,0] and any(values[:i]):
            values[i:i+2]=[5,5];son=i
    items[filename.stem]=''.join(str(v) for v in values)
(root/'hazirlik/src/ev-konusma-ritmi.json').write_text(json.dumps({'adimMs':80,'sesler':items},indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(len(items),'recordings,',round(sum(len(v) for v in items.values())*.08,1),'seconds')

# Sahnedeki iki kıyafetin ağız çizimleri farklı. Burada yalnız üç açıklık
# derecesini sakla; oyun her kıyafet için gerçek sheet pozunu seçer.
stem=root/'assets/hazirlik/gosteri-muzik/kino-sahne-vokal.flac'
pcm=subprocess.run([str(ffmpeg),'-loglevel','error','-i',str(stem),'-ac','1','-ar','16000','-f','s16le','pipe:1'],capture_output=True,check=True).stdout
samples=np.frombuffer(pcm,dtype='<i2').astype(np.float32)/32768
windows=samples.reshape(-1,1280)
rms=np.sqrt(np.mean(windows**2,axis=1))
reference=np.percentile(rms[rms>.012],80)
poses=''.join('0' if amp<.013 else '1' if amp<reference*.52 else '2' for amp in rms)
(root/'hazirlik/src/sahne-vokal-ritmi.json').write_text(json.dumps({'adimMs':80,'pozlar':poses})+'\n',encoding='utf8')
