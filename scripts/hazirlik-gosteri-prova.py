"""Two original metrical reference tracks for the musicians (never game assets)."""
import io, wave, zipfile
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parents[1]
dir=root/'output/hazirlik/Gemini-kayit-seti'
dir.mkdir(exist_ok=True,parents=True)
brief=root/'assets/hazirlik/gosteri-muzik/Gemini-kayitlari.md'
paket=dir.parent/'Gemini-Yil-Sonu-Kayit-Seti.zip'
sr=48000

def kilavuz(bpm):
    vur=60/bpm
    pcm=np.zeros((round(64*vur*sr),2),dtype='float64')
    for i in range(64):
        # Very short soft wooden taps; the low tonic marks downbeats. A soft
        # 2-note rising reply distinguishes the chorus without changing duration.
        zaman=round(i*vur*sr);kisa=.13 if i%4==0 else .075
        t=np.arange(round(kisa*sr))/sr
        def tok(f,a):
            return a*np.minimum(t/.003,1)*np.exp(-t*(37 if i%4==0 else 65))*(np.sin(2*np.pi*f*t)+.18*np.sin(2*np.pi*f*2.94*t))
        ses=tok(392 if i%4==0 else 610,.265 if i%4==0 else .15)
        if i in (0,32):ses+=tok(784 if i==0 else 988,.11)
        pcm[zaman:zaman+len(ses),0]+=ses;pcm[zaman:zaman+len(ses),1]+=ses
    mem=io.BytesIO()
    with wave.open(mem,'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr)
        w.writeframes(np.rint(pcm*32767).astype('<i2').tobytes())
    return mem.getvalue()

with zipfile.ZipFile(paket.with_suffix('.yaziliyor'),'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    z.write(brief,'Gemini-kayitlari.md')
    z.write(brief.parent/'kino-sahne-vokal.flac','kino-sahne-vokal.flac')
    for ad,bpm in [('Sahne-Bizim',96),('Pati-Pati-Dans',150)]:
        name=f'{ad}-{bpm}BPM-kilavuz.wav'
        veri=kilavuz(bpm);(dir/name).write_bytes(veri);z.writestr(name,veri)
        with wave.open(io.BytesIO(veri)) as w:
            assert abs(w.getnframes()/w.getframerate()-64*60/bpm)<1/sr
        # Çocuğun duyduğu geçici eşlik, ayrı klasörde ve olduğu gibi.
        # Kılavuz ile demoyu karıştırma; MP3'ü yeniden sıkıştırma.
        demo=brief.parent/'gecici'/(ad.lower()+'-gecici.mp3')
        z.write(demo,'Oyundaki-gecici-eslik/'+demo.name)
    z.writestr('Kullanimi.txt',"""Bu iki kılavuz yalnızca kayıt hazırlamak içindir.
Müzik programında kılavuzu 0:00'a koyun. Her dört seste bir kalın ahşap vuruş yeni ölçüyü gösterir.
İlk vuruş giriş, ortadaki daha ince çift ses nakaratın başlangıcıdır (9. ölçü).
Oyun burada nakarata kesintisiz geçer.
Çıktıyı aynı uzunlukta alın; sessizlik veya sayarak giriş eklemeyin.
Teslim ettiğiniz müziğe bu kılavuz kanalını katmayın.
Tempo kılavuzları şarkı veya nihai seslendirme değildir.
Oyundaki-gecici-eslik klasöründeki iki MP3 üretim örneğidir. Güncel oyun ile aynı süreyi, cümle yerlerini ve iki bölüm arasındaki geçişi dinleyebilirsiniz.
Bu örnekleri son mikse eklemeyin; kendi bestenizi ses ve çizim için bırakılan boşluklara göre kurun.
""".encode('utf-8-sig'))
paket.with_suffix('.yaziliyor').replace(paket)
print(paket.name,paket.stat().st_size)
