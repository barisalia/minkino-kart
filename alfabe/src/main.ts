import { erisimVarMi, kilitGoster } from '../../src/abonelik/kilit';
import { harfKutusuKur } from './harf-kutusu';
import { hayvanOyunuKur } from './harf-hayvan';
import { hecePanoKur } from './hece-pano';
import { kucukGrup, tamDers, yasGrubu } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import dersler from './harfler.json';
import { IKON } from '../../src/ui/ikonlar';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { geriDinle } from '../../src/kabuk/yon';
import { cerenKonus, cerenSustur, cerenYuzu, sesDersiKur } from './konusma-dersi';
import { kurulYazma } from './yazma';
import { miknatisKur } from './miknatis';
import { resim } from './resimler';
import { albumKur } from './album';
import { harfYazisi, kalemNo, type Kalemler } from './kartlar';
import { harfiKesfetKur } from './harfi-kesfet';
import { harfBoyamaKur } from './harf-boyama';
import { heceOyunuKur } from './hece-oyunu';
import './stil.css';

const alan = document.querySelector<HTMLElement>('#atolye')!;
const depo = 'minkino-alfabe-v1';
// Kayıtlı derslerde basamak kimlikleri sıralamadan bağımsızdır.
const tumAdimlar = [
  {id:5, ad:'Harfi keşfet'}, {id:0, ad:'Dinle ve söyle'},
  {id:1, ad:'Büyük harf'}, {id:6, ad:'Harfi boya'}, {id:2, ad:'Küçük harf'},
  {id:7, ad:'Yaz ve hayvanı çağır'}, {id:3, ad:'Obur’un tabağı'}, {id:4, ad:'Mıknatıslar'},
];
const adimlar=tumAdimlar.filter(a=>tamDers || (kucukGrup ? [6,7,3].includes(a.id) : a.id!==2 && a.id!==4));
const renkler = ['#f7c964', '#f4ab97', '#a9d8c4', '#a5d2e7', '#c8bbe1'];
type Ilerleme = { biten: string[]; son: string; adimlar: Record<string,number>; renkler: Record<string,Kalemler>; bekleyen: string[] };
const gecerli = (id: string) => dersler.some(h => h.id === id);
const adimMi = (i: unknown): i is number => adimlar.some(a => a.id === i);
function kaydiOku(): Ilerleme {
  const kayit: Ilerleme = { biten:[], son:'01', adimlar:{}, renkler:{}, bekleyen:[] };
  try {
    const eski = JSON.parse(dersKaydiniOku(depo) || 'null');
    if (!eski) return kayit;
    if (Array.isArray(eski.biten)) kayit.biten = [...new Set<string>(eski.biten.filter(gecerli))];
    if (gecerli(eski.son)) kayit.son = eski.son;
    if (Array.isArray(eski.bekleyen)) kayit.bekleyen = kayit.biten.filter(id => eski.bekleyen.includes(id));
    const basamaklar = { [kayit.son]: eski.adim, ...eski.adimlar };
    for (const [id, i] of Object.entries(basamaklar)) {
      if (!gecerli(id)) continue;
      if (adimMi(i)) kayit.adimlar[id] = i;

    }
    // Eski sürüm bu işareti ancak mıknatısları tamamlayınca yazıyordu.
    let aktarildi = false;
    for (const [id, yarim] of Object.entries(eski.yarimAlistirma || {})) {
      if (!gecerli(id) || yarim !== true || kayit.adimlar[id] !== 4) continue;
      if (!kayit.biten.includes(id)) kayit.biten.push(id);
      if (!kayit.bekleyen.includes(id)) kayit.bekleyen.push(id);
      delete kayit.adimlar[id];
      aktarildi = true;
    }
    for (const [id, c] of Object.entries(eski.renkler || {})) {
      if (!gecerli(id) || !c || typeof c !== 'object') continue;
      kayit.renkler[id] = {buyuk:kalemNo('buyuk' in c && c.buyuk), kucuk:kalemNo('kucuk' in c && c.kucuk)};
    }
    if (aktarildi) dersKaydiniYaz(depo, JSON.stringify(kayit));
  } catch { /* Depolama kapalıysa ders bu oturumda çalışır. */ }
  return kayit;
}
const kayit = kaydiOku();
function sakla() { dersKaydiniYaz(depo, JSON.stringify(kayit)); }
let ders = dersler[0], adim = 0, birak: (() => void) | undefined;
let ekran: 'raf' | 'ders' | 'son' | 'album' | 'hece' | 'trambolin' | 'pano' = 'raf';
function temizle() { birak?.(); birak = undefined; cerenSustur(); }
function isaretle() {
  alan.dataset.yas=yasGrubu;
  alan.dataset.ekran = ekran;
  alan.dataset.adim = String(adim);
  alan.dataset.harf = ders.upper;
}
function odak() {
  alan.querySelector<HTMLElement>('.at-ust-baslik')?.focus({preventScroll:true});
  window.scrollTo(0, 0);
}
const dosyada = location.protocol === 'file:';
function ust(baslik: string, durum: string) {
  const geri = ekran === 'raf'
    ? dosyada ? '' : '<a class="at-geri" href="' + sayfaAdresi('../') + '">' + IKON.geri + '<span>Etkinlikler</span></a>'
    : '<button type="button" class="at-geri" aria-label="Harflere dön">' + IKON.geri + '<span>Harfler</span></button>';
  return '<header class="at-ust"><div class="at-yon">' + geri + '</div><strong class="at-ust-baslik" tabindex="-1">' + baslik +
    '</strong><div class="at-ilerleme">' + durum + '</div></header>';
}
const rafSayaci = () => '<span aria-label="' + kayit.biten.length + ' harf tamamlandı">' + kayit.biten.length + ' / 29</span>';
function rafGoster() {
  const onceki = ekran;
  temizle(); ekran = 'raf'; isaretle();
  let onerilen = dersler.find(h => h.id === kayit.son)!;
  if (kayit.biten.includes(onerilen.id) && !kayit.bekleyen.includes(onerilen.id) && kayit.adimlar[onerilen.id] === undefined) {
    onerilen = dersler.find(h=>kayit.bekleyen.includes(h.id)) ?? dersler.find(h=>kayit.adimlar[h.id]!==undefined) ?? dersler.find(h=>!kayit.biten.includes(h.id)) ?? dersler[0];
  }
  const suruyor = kayit.adimlar[onerilen.id] !== undefined;
  const kartBekliyor=kayit.bekleyen.includes(onerilen.id);
  const bitmisRaf=kayit.biten.length===dersler.length;
  alan.innerHTML = ust('Harf Atölyesi', rafSayaci()) +
    '<section class="at-raf"><div class="at-karsila"><div class="at-portre">' + cerenYuzu() + '</div>' +
    '<div class="at-karsila-metin"><h1>'+(bitmisRaf?'29 harfi tamamladın!':'Bir harf seç!')+'</h1><p>'+
    (kartBekliyor?onerilen.upper+' kartın albümünü bekliyor.':suruyor?onerilen.upper+' dersinde '+adimlar.find(a=>a.id===kayit.adimlar[onerilen.id])!.ad.toLocaleLowerCase('tr')+' bölümündesin.':bitmisRaf?'Bugün hangi harfi tekrarlayalım?':'Bugün hangi sesi öğrenelim?')+'</p>' +
    '<button type="button" class="at-basla">' + (kartBekliyor ? 'Kartımı yapıştır' : suruyor ? onerilen.upper + ' dersine devam et' : bitmisRaf ? onerilen.upper+' ile tekrar et' : onerilen.upper + ' ile başla') +
    ' ' + IKON.oyna + '</button></div><button class="at-ses at-tanitim" type="button" aria-label="Ceren Öğretmen’i dinle">' + IKON.hoparlor +
    '</button></div><div class="at-album-sira"><h2>Harfler</h2><button type="button" class="at-album-ac" aria-label="Harf albümümü aç"><img src="' + resim('album-dugmesi') + '" alt="" draggable="false"></button></div><div class="at-harfler" role="group" aria-label="Türk alfabesinin harfleri">' +
    dersler.map((h, i) => {
      const bitmis = kayit.biten.includes(h.id);
      const yarim = kayit.adimlar[h.id] !== undefined;
      return '<button type="button" class="at-harf" data-id="' + h.id + '" style="--renk:' + renkler[i % renkler.length] +
        '" aria-label="' + h.upper + ' harfi' + (bitmis ? ', tamamlandı' : yarim ? ', devam et' : '') +
        '"><b>' + h.upper + '</b><span>' + h.lower + '</span>' + (bitmis ? '<i class="at-biten" aria-hidden="true">' + IKON.onay + '</i>' : yarim ? '<i class="at-yarim" aria-hidden="true"></i>' : '') + '</button>';
    }).join('') + '</div><div class="at-hece-karti"><button type="button" class="at-oyun-karti at-hece-ac">' +
      '<span class="at-hece-ornek" aria-hidden="true"><img src="' + resim('06') + '" alt=""><span><b>el</b><b>ma</b></span></span>' +
      '<span class="at-hece-yazi"><strong>Hece Oyunu</strong><small>'+(kucukGrup?'Dinle, her hecede bir kez zıpla.':'Trambolinde zıpla, heceleri panoya tak.')+'</small></span>' +
      '<span class="at-hece-oyna" aria-hidden="true">' + IKON.oyna + '</span></button>' +
      '<button type="button" class="at-hece-dinle at-ses" aria-label="Ceren’den Hece Oyunu’nu dinle">' + IKON.hoparlor +
      '</button></div></section>';
  alan.querySelector<HTMLButtonElement>('.at-basla')!.onclick = () => dersAc(onerilen.id);
  alan.querySelector<HTMLButtonElement>('.at-tanitim')!.onclick = () => cerenKonus('sinif-giris');
  alan.querySelector<HTMLButtonElement>('.at-hece-ac')!.onclick = heceGoster;
  alan.querySelector<HTMLButtonElement>('.at-hece-dinle')!.onclick = () => cerenKonus('hece-kart-tanitim');
  alan.querySelector<HTMLButtonElement>('.at-album-ac')!.onclick = () => albumGoster();
  alan.querySelectorAll<HTMLButtonElement>('.at-harf').forEach(b => b.onclick = () => dersAc(b.dataset.id!));
  // ilk 4 harf ücretsiz, diğerleri premium (src/engine/erisim.ts → alfabe/harf-NN): kilit rozeti
  alan.querySelectorAll<HTMLButtonElement>('.at-harf').forEach(b => kilitGoster(b, 'alfabe/harf-' + b.dataset.id));
  if(dosyada){
    const sec=document.createElement('select');
    sec.className='at-yas-sec';sec.setAttribute('aria-label','Yaş grubu');
    for(const grup of ['2-3','4','5+']){
      const option=new Option((grup==='2-3'?'2–3':grup)+' yaş',grup);
      option.selected=grup===yasGrubu;sec.add(option);
    }
    sec.onchange=()=>{
      const yeni=new URL(location.href);
      try{
        localStorage.setItem('minkino-atolye-dosya-yasi',sec.value);
        yeni.searchParams.delete('yas');
      }catch{yeni.searchParams.set('yas',sec.value);}
      if(yeni.href===location.href)location.reload();else location.replace(yeni.href);
    };
    alan.querySelector('.at-yon')!.append(sec);
  }
  if (onceki === 'raf') odak();
  else {
    const secici = ['hece','pano','trambolin'].includes(onceki) ? '.at-hece-ac' : onceki === 'album' ? '.at-album-ac' : '[data-id="' + ders.id + '"]';
    const donus = alan.querySelector<HTMLButtonElement>(secici);
    donus?.focus({preventScroll:true});
    donus?.scrollIntoView({block:'nearest'});
  }
}
function dersAc(id: string) {
  if (!erisimVarMi('alfabe/harf-' + id, document.body)) return;
  ders = dersler.find(h => h.id === id)!;
  kayit.son = id;
  if (kayit.bekleyen.includes(id)) { sonucGoster(); return; }
  adim = kayit.adimlar[id] ?? adimlar[0].id;
  dersGoster();
}
function ilerle() {
  const sonraki = adimlar[adimlar.findIndex(a => a.id === adim) + 1];
  if (sonraki) { adim = sonraki.id; dersGoster(); }
  else dersiBitir();
}
function dersiBitir() {
  if (!kayit.biten.includes(ders.id)) kayit.biten.push(ders.id);
  if (!kayit.bekleyen.includes(ders.id)) kayit.bekleyen.push(ders.id);
  delete kayit.adimlar[ders.id];
  sakla(); sonucGoster();
}
function dersGoster() {
  temizle(); ekran = 'ders'; isaretle();
  kayit.adimlar[ders.id] = adim; sakla();
  const sira = adimlar.findIndex(a => a.id === adim);
  const gosterge = '<span class="at-adim" aria-label="' + (sira+1) + '. adım, ' + adimlar[sira].ad + '">' +
    adimlar.map((_,i) => '<i class="' + (i <= sira ? 'at-dolu' : '') + '"></i>').join('') + '</span>';
  const yazma = adim === 1 || adim === 2;
  alan.innerHTML = ust(ders.upper + ' ' + ders.lower, gosterge) +
    '<section class="at-sahne at-sahne-' + (adim === 5 ? 'kesif' : adim) + '">' +
    '<div class="at-oyun"></div></section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick = rafGoster;
  const oyun = alan.querySelector<HTMLElement>('.at-oyun')!;
  if (adim === 7) birak = hayvanOyunuKur(oyun, cerenKonus, {harf:ders.upper, ilerle});
  else if (adim === 5) birak = harfiKesfetKur(oyun, ders, cerenKonus, ilerle);
  else if (adim === 0) birak = sesDersiKur(oyun, ders, cerenKonus, ilerle);
  else if (adim === 6) birak = harfBoyamaKur(oyun, ders, cerenKonus, ilerle, kayit.renkler[ders.id]?.buyuk);
  else if (yazma) {
    const renk = kayit.renkler[ders.id] ??= {buyuk:0,kucuk:0};
    const boy = adim === 2 ? 'kucuk' : 'buyuk';
    birak = kurulYazma(oyun, ders, adim === 2, cerenKonus, ilerle, renk[boy], i=>{renk[boy]=i;sakla();},()=>{
      kayit.adimlar[ders.id]=adimlar[sira+1].id;
      sakla();
    });
  }
  else if (adim === 3) birak = harfKutusuKur(oyun, ders, cerenKonus, ilerle);
  else birak = miknatisKur(oyun, ders, cerenKonus, ilerle);
  odak();
}
function heceGoster() {
  if(kucukGrup){heceDali('trambolin');return;}
  temizle();ekran='hece';isaretle();
  alan.innerHTML=ust('Hece Oyunu','')+'<section class="hm-menu"><button type="button" data-dal="trambolin" aria-label="Hece Trambolini"><img src="'+resim('hece-trambolin-kart')+'" alt=""></button><button type="button" data-dal="pano" aria-label="Manyetik Hece Bulmacası"><img src="'+resim('hece-pano-kart')+'" alt=""></button></section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  alan.querySelector<HTMLButtonElement>('[data-dal=trambolin]')!.onclick=()=>heceDali('trambolin');
  alan.querySelector<HTMLButtonElement>('[data-dal=pano]')!.onclick=()=>heceDali('pano');
  kilitGoster(alan.querySelector<HTMLButtonElement>('[data-dal=pano]')!, 'alfabe/hece-pano');
  odak();
}
function heceDali(dal:'pano'|'trambolin'){
  if(!erisimVarMi('alfabe/hece-'+dal,document.body))return;
  temizle();ekran=dal;isaretle();
  alan.innerHTML=ust(dal==='pano'?'Manyetik Hece Bulmacası':'Hece Trambolini','')+'<section class="at-hece-oyun-alani"></section>';
  const don=kucukGrup?rafGoster:heceGoster;
  const geri=alan.querySelector<HTMLButtonElement>('.at-geri')!;
  if(!kucukGrup){geri.setAttribute('aria-label','Hece Oyunu’na dön');geri.querySelector('span')!.textContent='Hece Oyunu';}
  geri.onclick=don;
  const hedef=alan.querySelector<HTMLElement>('.at-hece-oyun-alani')!;
  birak=dal==='pano'?hecePanoKur(hedef,cerenKonus,don):heceOyunuKur(hedef,cerenKonus,don);
  odak();
}
function albumGoster(id = '') {
  temizle(); ekran = 'album'; isaretle();
  alan.innerHTML = ust('Harf Atölyesi', rafSayaci()) + '<div class="at-album-icerik"></div>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick = rafGoster;
  const gorunen = kayit.biten.filter(d => !kayit.bekleyen.includes(d));
  birak = albumKur(alan.querySelector('.at-album-icerik')!, gorunen, kayit.renkler, id, cerenKonus, cerenSustur, rafGoster);
  odak();
}
function sonucGoster() {
  temizle(); ekran = 'son'; isaretle();
  const i = dersler.indexOf(ders);
  const siradaki = [...dersler.slice(i + 1), ...dersler.slice(0, i)].find(h => !kayit.biten.includes(h.id));
  alan.innerHTML = ust('Harf Atölyesi', rafSayaci()) +
    '<section class="ka-son"><h1>' + ders.upper + ' harfini tamamladın!</h1>' +
    '<div class="ka-kitap"><div class="ka-sayfalar"><button type="button" class="ka-cikartma" aria-label="' + ders.example + ' kartını yapıştır">' +
    harfYazisi(ders,kayit.renkler[ders.id]) + '<img src="' + resim(ders.id) + '" alt="" draggable="false"><span>' + ders.example +
    '</span></button><button type="button" class="ka-yer">' + IKON.resim + 'Buraya yapıştır</button></div></div>' +
    '<div class="ka-kumanda" hidden><button type="button" class="at-sec">Albümümü aç</button>' +
    (siradaki ? '<button type="button" class="at-basla">' + siradaki.upper + ' harfine geç ' + IKON.oyna + '</button>' : '') + '</div></section>';
  const kart = alan.querySelector<HTMLButtonElement>('.ka-cikartma')!;
  const yer = alan.querySelector<HTMLButtonElement>('.ka-yer')!;
  let hareket: Animation | undefined, parmak: {id:number;x:number;y:number} | undefined, suruklendi=false, yapisti=false;
  let yerDokunusuIptal=false;
  const olaylar=new AbortController();
  function vazgec(){
    if(!parmak)return;
    const id=parmak.id;parmak=undefined;suruklendi=true;kart.style.translate='';
    if(kart.hasPointerCapture(id))kart.releasePointerCapture(id);
  }
  window.addEventListener('resize',vazgec,{signal:olaylar.signal});
  document.addEventListener('pointerdown',e=>{if(!e.isPrimary)vazgec();},{capture:true,signal:olaylar.signal});
  function yerlestir() {
    if (yapisti) return;
    yapisti=true;
    const a = kart.getBoundingClientRect();
    kart.style.translate='';
    kart.style.gridColumn='2'; kart.style.gridRow='1'; yer.style.gridColumn='1'; yer.style.gridRow='1';
    yer.disabled=true; yer.textContent=''; yer.append(Object.assign(document.createElement('strong'),{textContent:ders.upper+' '+ders.lower}));
    yer.append(Object.assign(document.createElement('span'),{textContent:'Albümümde!'}));
    alan.querySelector('.ka-sayfalar')!.classList.add('yapisti');
    const hedef=kart.getBoundingClientRect();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hareket=kart.animate([{transform:'translate('+(a.left-hedef.left)+'px,'+(a.top-hedef.top)+'px) rotate(-3deg)'},{transform:'translate(0,0) rotate(0)'}],{duration:340,easing:'ease-out'});
    }
    kayit.bekleyen=kayit.bekleyen.filter(d => d!==ders.id); sakla();
    if (kayit.biten.length === dersler.length) alan.querySelector('.ka-son h1')!.textContent='29 harfi de tamamladın!';
    const kumanda=alan.querySelector<HTMLElement>('.ka-kumanda')!;
    kumanda.hidden=false;
    kumanda.querySelector<HTMLButtonElement>('.at-sec')!.onclick=()=>albumGoster(ders.id);
    if (siradaki) kumanda.querySelector<HTMLButtonElement>('.at-basla')!.onclick=()=>dersAc(siradaki.id);
    kart.setAttribute('aria-label',ders.example+' kelimesini dinle');
    kart.onclick=()=>cerenKonus(ders.id+'-label');
    cerenKonus(ders.id+'-label');
  }
  yer.onpointerdown=e=>{yerDokunusuIptal=!e.isPrimary;};
  yer.onclick=e=>{if(e.detail===0||!yerDokunusuIptal)yerlestir();};
  kart.onclick=e=>{if(!suruklendi || e.detail===0)yerlestir();};
  kart.onpointerdown=e=>{
    if(!e.isPrimary){suruklendi=true;return;}
    if(yapisti||e.button!==0||parmak)return;
    suruklendi=false;parmak={id:e.pointerId,x:e.clientX,y:e.clientY};kart.setPointerCapture(e.pointerId);
  };
  kart.onpointermove=e=>{
    if(parmak?.id!==e.pointerId)return;
    const x=e.clientX-parmak.x,y=e.clientY-parmak.y;
    if(Math.hypot(x,y)<7 && !suruklendi)return;
    suruklendi=true;kart.style.translate=x+'px '+y+'px';
  };
  kart.onpointerup=e=>{
    if(parmak?.id!==e.pointerId)return;
    parmak=undefined;
    if(!suruklendi)return;
    const r=yer.getBoundingClientRect();
    if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom)yerlestir();
    else kart.style.translate='';
  };
  kart.onlostpointercapture=kart.onpointercancel=e=>{if(parmak?.id===e.pointerId)vazgec();};
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  birak=()=>{olaylar.abort();vazgec();hareket?.cancel();}; odak(); cerenKonus('album-done');
}

geriDinle(() => { if (ekran === 'raf') return false; if(!kucukGrup&&(ekran==='pano'||ekran==='trambolin'))heceGoster();else rafGoster(); return true; });
window.addEventListener('pagehide', temizle);
window.addEventListener('pageshow', e => {
  if(!e.persisted)return;
  if(ekran==='ders')dersAc(ders.id);
  else if(ekran==='pano'||ekran==='trambolin')heceDali(ekran);
  else if(ekran==='hece')heceGoster();
  else if(ekran==='son' && kayit.bekleyen.includes(ders.id))sonucGoster();
});
// Ortak önizlemede başka bir oyunun dosyaları değiştiğinde Vite sayfanın
// tamamını yenileyebilir. Yalnız bu durumda açık etkinliğe geri dön.
const onizlemeAnahtari='minkino-alfabe-onizleme-ekrani';
function onizlemeyiSurdur(){
  if(!import.meta.hot)return false;
  import.meta.hot.on('vite:beforeFullReload',olay=>{
    if(olay.path?.endsWith('.html')&&olay.path!=='/index.html'&&olay.path!=='/alfabe/index.html')return;
    try{sessionStorage.setItem(onizlemeAnahtari,JSON.stringify({ekran,id:ders.id,zaman:Date.now()}));}catch{}
  });
  try{
    const ham=sessionStorage.getItem(onizlemeAnahtari);
    sessionStorage.removeItem(onizlemeAnahtari);
    if(!ham)return false;
    const eski=JSON.parse(ham);
    if(!Number.isFinite(eski.zaman)||Date.now()-eski.zaman>15000)return false;
    if(eski.ekran==='pano'||eski.ekran==='trambolin'){heceDali(eski.ekran);return true;}
    if(eski.ekran==='hece'){heceGoster();return true;}
    if(eski.ekran==='album'){albumGoster();return true;}
    if((eski.ekran==='ders'||eski.ekran==='son')&&gecerli(eski.id)){
      if(eski.ekran==='son'&&!kayit.bekleyen.includes(eski.id)){albumGoster(eski.id);return true;}
      dersAc(eski.id);return true;
    }
  }catch{}
  return false;
}
if(!onizlemeyiSurdur())rafGoster();

