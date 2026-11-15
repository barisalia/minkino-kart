"""Validate the stage production archive and rebuild its portable index."""
from pathlib import Path
import json
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ARCHIVE=ROOT/'ekip/film/ortak-poz-arsivi/karakter-hareketleri/yil-sonu'
refs=json.loads((ROOT/'ekip/film/youtube-referans-2026-11-06/referans-envanteri.json').read_text(encoding='utf-8-sig'))['frames']
items=[]
def klip(kullan,pozlar,ms,tur=1):
    return dict(kullan=kullan,kare_sirasi=pozlar,kare_ms=ms,tekrar=tur)
def kurgu(key):
    if 'patiler' in key:return [klip('iki patiyi havaya kaldırıp ritme katılır',[0,1,2,3,4,4,2,5],130)]
    if key=='anne-sohbet' or key.startswith('kino-sohbet-'): return [dict(kullan='gerçek repliği dinleyerek konuşma',kare_ms=80,agizlar={'0':'kapalı','1':'az açık','2':'açık','3':'yuvarlak','4':'dar','5':'kapalı, göz kırpma'},zaman_kaynagi='hazirlik/src/ev-konusma-ritmi.json')]
    if key=='anne-karsilama':return [klip('kapıda karşılama',[0,1,2,3,4],220)]
    if key=='anne-alkis':return [klip('evde dinlerken alkış',[0,1,2,3,4,3,4,3,4,5],220)]
    if key=='anne-adim':return [klip('çocuğun yana adımına karşılık',list(range(6)),180)]
    if key=='zip-sese-don':return [klip('davulu duyup Kino’ya dönme',[0,1,3,4,2,5],155)]
    if key=='zip-selam':return [klip('final selamı',[0,1,2,3,3,4,5],250)]
    if key=='zip-sahneye-yuru':return [klip('sağ kulisten sahneye doğru yürür',list(range(8)),99)]
    if key=='mino-davul':return [klip('bir güçlü, iki yumuşak vuruş',[1,2,3,4,5,4,5,0],175,4),klip('bitiş',[0,6,6,7],220)]
    if key in ('mino-davulla-yuru','lokum-kurdeleyle-yuru'):return [klip('kulisten kendi eşyasıyla giriş',list(range(8)),100)]
    if key=='mino-dinlemeye-calis':return [klip('duymak için kulağına pati götürür',[0,1,2,3,4,4],225)]
    if key=='lokum-kurdele':return [klip('kurdele oyunu',[0,1,2,3,4,5,6,7],215,3),klip('bitiş',[6,7,7,7],220)]
    if key.endswith('-seyirci'):return [klip('ön sıradan alkış',[0,1,2,3,4,3,4,5],155 if key.startswith('mino') else 190)]
    if key.startswith('kino-kupayla-'):return [klip('kupayı iki sapından taşırken çantalı yürüyüş',list(range(8)),102)]
    if key.startswith('kino-zil-'):return [dict(**klip('kapı zilini çalma',list(range(8)),135),temas_karesi=4,ses_ms=540)]
    if key.startswith('kino-esikte-don-'):return [klip('kapı açılınca annesine dönüp bakma',list(range(8)),155)]
    if key.startswith('kino-sola-yuru-'):return [klip('sınıftan sol kulise yürür',list(range(8)),95)]
    if key.startswith('kino-kupa'):return [klip('kupayı kaldırma',[0,1,2,3,4,4,5],235)]
    if key.startswith('kino-davul-'):return [dict(**klip('dansın başlama vuruşu',[0,1,2,3,4,5],155),temas_karesi=3,ses_ms=465)]
    if key.startswith('kino-kurdele-'):return [klip('işitilmeyen kurdele işareti',[0,1,2,3,4,5],155)]
    if key.startswith('kino-ev-'):return [klip('selam',[0,1,0],205),klip('hatırayı anlatma',[1,2,3,4,5],195)]
    if key.startswith('kino-selam-'):return [klip('gösteri bitince seyirciye eğilerek selam',[0,1,2,3,3,4,5],240)]
    if key.startswith('kino-') and key.endswith('-dans'):return [klip('alkış',[4,5,6,5,7],155),klip('yan adım',[1,2,3,4,7],155)]
    if key.startswith('kino-') and key.endswith('-sarki'):return [klip('güneş ezgisi',[1,2,3,4,5,6,7],155),klip('dinleme',[0,1,1,7],155)]
    if key=='zip-dans':return [klip('alkış',[0,1,2,3,2,7],155),klip('yan adım',[0,1,3,4,5,6,7],155)]
    if key=='zip-sarki':return [klip('ay ezgisi',[1,2,3,4,5,6,7],155),klip('dinleme',[0,1,1,7],155)]
    raise ValueError(key)
for manifest in sorted(ARCHIVE.glob('*/hareket.json')):
    meta=json.loads(manifest.read_text(encoding='utf-8-sig'))
    key=manifest.parent.name;paths=meta['kareler']
    meta['oyundaki_hareketler']=kurgu(key)
    if key.startswith('anne-') or key.startswith('zip-') and key!='zip-sahneye-yuru' or key=='lokum-seyirci':meta['yon']='sola üç çeyrek' if key!='zip-sese-don' else 'sağdan sola dönüş'
    if key in ('zip-selam','mino-seyirci','lokum-seyirci','kino-kupa-yesil'):meta['zemin']='Ham sheet korunur; zemine çizili oval oyundaki saydam karelerden ayrılmıştır.'
    for kl in meta['oyundaki_hareketler']:
        assert all(0<=i<len(paths) for i in kl.get('kare_sirasi',[])),key
    manifest.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
    assert len(paths) in (6,8) and (manifest.parent/'sheet.png').is_file(),key
    for path in paths:
        with Image.open(ROOT/path) as im:
            assert list(im.size)==meta['tuval'] and im.mode=='RGBA',path
            low,hi=im.getchannel('A').getextrema()
            assert low==0 and hi>=250,path
    source=next(s for s in refs if s['file']==Path(meta['referans']).name)
    items.append(dict(id=key,kare=len(paths),kaynak=source['url']+'&t='+str(source['seconds'])+'s',hareket=manifest.relative_to(ARCHIVE).as_posix()))
index={'hareketler':items}
(ARCHIVE/'katalog.json').write_text(json.dumps(index,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(f"{len(items)} sheets, {sum(v['kare'] for v in items)} usable frames")
