import {pizzaKesimTahtasi,kesimCizgisi} from './pizza-paylas';
import {pizzaKesiminiOku,type PizzaKesimi} from './pizza-kesimi';
import { h } from '../../src/ui/dom';
import { geriDinle } from '../../src/kabuk/yon';
import { efekt } from '../../src/audio/efekt';
import { konus,sus } from '../../src/audio/konusma';
import { dugme, ikon, kaynak } from './gorsel';
import { icinde, jest, zaman, type Nokta } from './hareket';
import { misafirCumlesi, misafirKonus, misafirResmi, sefKonus } from './misafir';
import { CESITLER, CESIT_BASINA_DILIM, FISLER, ISIM, SIPARISLER, fisCumlesi, fisiOku, pizzaFarki, pizzaMiktarFarki, fisPuani, TARAFLAR, pizzaTarafi, yanlisYaridakiMalzemeler, type Taraf, pizzaToplamPuani, kenaraAl, parcalariOku, pizzaKivami, pizzaPuani, type PizzaFisi, type PizzaMisafiri, type PizzaKivami, type Cesit, type PizzaParcasi, type PizzaTabagi } from './pizza-tabagi';
import { pizzaDilimResmi } from './pizza-dilimleri';
import {babaPizzaYorumu} from './baba-pizzasi';
import { porsiyonKoy,sosAdi,type PizzaSosu } from './pizza-tabagi';
import './firin.css';

const resimler = import.meta.glob<string>('../../assets/sef/firin/*.webp', {
  eager: true, query: '?url', import: 'default',
});
export const pizzaResmi = (id: string) => resimler[`../../assets/sef/firin/${id}.webp`];
const resim = (id: string, sinif = '') => h('img', {
  src: CESITLER.includes(id as Cesit)?pizzaDilimResmi(id as Cesit):pizzaResmi(id),
  alt: '', draggable: 'false', class: sinif,
});
const servisResimleri=import.meta.glob<string>('../../assets/sef/ikon-atolyesi/servis/*.webp',{eager:true,query:'?url',import:'default'});
const servisSrc=(ad:string)=>servisResimleri['../../assets/sef/ikon-atolyesi/servis/'+ad+'.webp'];
const servisResmi=(ad:string)=>h('img',{src:servisSrc(ad),alt:'',draggable:false});
const ASAMALAR = ['hamur', 'sos', 'malzeme', 'firin', 'pisiyor', 'hazir', 'kes', 'servis', 'son'] as const;
type Asama = typeof ASAMALAR[number];
interface Pizza {
  asama: Asama;
  tur: number;
  servis: number;
  hamur: number;
  sos: number[];
  sosCesidi?:PizzaSosu;
  sosSecildi?:boolean;
  ust: PizzaParcasi[];
  pismeMs: number;
  aktif: boolean;
  fis:PizzaFisi;
  misafir:PizzaMisafiri;
  porsiyon?:1|3;
  kesim?:PizzaKesimi;
}
const ANAHTAR = 'minkino-sef-pizza-v1';
const TURLAR = 4;
const SOS_ALANLARI = [
  { x: 35, y: 30 }, { x: 65, y: 30 }, { x: 76, y: 56 },
  { x: 57, y: 74 }, { x: 33, y: 70 }, { x: 25, y: 48 },
];
const YERLER = [{ x: 33, y: 40 }, { x: 66, y: 39 }, { x: 50, y: 66 }, {x:48,y:24}, {x:25,y:59},{x:74,y:57},{x:50,y:47}];
const CUMLE: Record<Asama, string> = {
  hamur: 'Merdaneyi ileri geri yuvarla.',
  sos: 'Sosu kaşığınla hamura yay.',
  malzeme: 'Fişteki malzemeleri pizzanın üzerine koy.',
  firin: 'Tepsiyi fırına sür.',
  pisiyor: 'Pizza fırında.',
  hazir: 'Pizzan pişti! Tepsiyi dışarı al.',
  kes: 'Ruleti pizzanın bir kenarından karşı kenarına sür. Sonra öbür yönden kes.',
  servis: 'Pizzanı tabağa kaydır.',
  son: 'Afiyet olsun!',
};
const sinir = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const sayi = (n: unknown, max: number) => typeof n === 'number' && Number.isFinite(n) ? sinir(Math.floor(n), 0, max) : 0;
const misafirSirasi:readonly PizzaMisafiri[]=['pizza','salata','corba'];
const yeni = (servis = 0, masadaki?:PizzaMisafiri): Pizza => {
  const tur=(servis+(masadaki==='corba'?2:0))%FISLER.length;
  return {asama:'hamur',tur,servis,hamur:0,sos:[],ust:[],pismeMs:0,aktif:true,
    fis:FISLER[tur],misafir:masadaki??misafirSirasi[servis%misafirSirasi.length]};
};
const kayitAnahtari=(tepsiId?:string)=>tepsiId ? ANAHTAR+'-masa-'+encodeURIComponent(tepsiId) : ANAHTAR;
const bellek=new Map<string,Pizza>();
let sonNumara=0;
function teslimSayisi(){
  try{return Math.max(sonNumara,sayi(Number(localStorage.getItem(ANAHTAR+'-son-no')),Number.MAX_SAFE_INTEGER),oku()?.servis??0);}
  catch{return sonNumara;}
}
function numaraAyir(enAz:number){
  sonNumara=Math.max(teslimSayisi(),enAz)+1;
  try{localStorage.setItem(ANAHTAR+'-son-no',String(sonNumara));}catch{/* Oturumda bellekte ilerle. */}
  return sonNumara;
}
function oku(anahtar=ANAHTAR): Pizza | undefined {
  const bellekte=bellek.get(anahtar);
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(anahtar) ?? 'null');
    if (!raw || typeof raw !== 'object') return bellekte;
    const data = raw as Partial<Pizza>;
    const durum = yeni(sayi(data.servis, 999999));
    durum.aktif = data.aktif === true;
    durum.tur = sayi(data.tur, FISLER.length - 1);
    durum.fis = fisiOku(data.fis) ?? {malzemeler:SIPARISLER[durum.tur%SIPARISLER.length]};
    durum.misafir = (data.misafir==='baba'||misafirSirasi.includes(data.misafir as PizzaMisafiri))?data.misafir!:'pizza';
    durum.hamur = sayi(data.hamur, TURLAR);
    durum.sos = [...new Set(Array.isArray(data.sos) ? data.sos.filter(i => Number.isInteger(i) && i >= 0 && i < SOS_ALANLARI.length) : [])];
    durum.sosCesidi=data.sosCesidi==='feslegen'?'feslegen':'domates';
    durum.sosSecildi=data.sosSecildi===true||durum.sos.length>0;
    durum.ust = parcalariOku(data.ust);
    durum.kesim=pizzaKesiminiOku(data.kesim);
    if(data.porsiyon===1||data.porsiyon===3)durum.porsiyon=data.porsiyon;
    durum.asama = ASAMALAR.includes(data.asama as Asama) ? data.asama as Asama : 'hamur';
    durum.pismeMs = typeof data.pismeMs==='number'?sayi(data.pismeMs,26500):
      ['hazir','kes','servis','son'].includes(durum.asama)?3400:durum.asama==='pisiyor'
        ?sinir(3400-(sayi((data as {pismeSonu?:number}).pismeSonu,Number.MAX_SAFE_INTEGER)-Date.now()),0,3400):0;
    if (durum.hamur < TURLAR) durum.asama = 'hamur';
    else if (durum.sos.length < SOS_ALANLARI.length) durum.asama = 'sos';
    else if (!durum.ust.length) durum.asama = 'malzeme';
    return durum;
  } catch { return bellekte; }
}
function saklananPizzayiYaz(anahtar:string,p: Pizza) {
  bellek.set(anahtar,p);
  try { localStorage.setItem(anahtar, JSON.stringify(p)); } catch { /* Bu oturum bellekte ilerler. */ }
}
export function pizzaDurumu(tepsiId?:string) {
  const p = oku(kayitAnahtari(tepsiId));
  return { suruyor: !!p && p.asama !== 'son', servis: p?.servis ?? 0 };
}
export const pizzaDevamEdiyor = (tepsiId?:string) => oku(kayitAnahtari(tepsiId))?.aktif === true;

export function pizzaTaslaginiSil(masa:string){
  if(!masa||!pizzaDurumu(masa).suruyor)return;
  const key=kayitAnahtari(masa);
  bellek.delete(key);
  try { localStorage.removeItem(key); } catch { /* Oturumdaki taslak silindi. */ }
}

function yuzde(el: HTMLElement, yer: Nokta): Nokta {
  const r = el.getBoundingClientRect();
  return { x: (yer.x - r.left) * 100 / r.width, y: (yer.y - r.top) * 100 / r.height };
}
function konum(el: HTMLElement, n: Nokta) {
  el.style.left = n.x + '%';
  el.style.top = n.y + '%';
}
function dilimResmi(parca:PizzaParcasi,erimis=false) {
  const r=h('img.pz-parca',{src:pizzaDilimResmi(parca.cesit,erimis),alt:'',draggable:'false','data-cesit':parca.cesit});
  r.style.setProperty('--pz-aci',(Math.round(parca.x*3+parca.y*2)%82-41)+'deg');
  konum(r,parca);
  return r;
}
function pizzaGorseli(parcalar: readonly PizzaParcasi[], taban: string,erimis=false,sos:PizzaSosu='domates') {
  const zemin=sos==='feslegen'&&taban==='soslu-taban'?'hamur-acik':taban;
  const gorunum = h('span.pz-pizza', {}, resim(zemin, 'pz-taban'));
  gorunum.dataset.sos=sos;
  if(sos==='feslegen')gorunum.append(resim('pesto-taban','pz-pesto'));
  for (const [i,parca] of parcalar.entries()) {
    const r = dilimResmi(parca,erimis);
    r.dataset.parca = String(i);
    gorunum.append(r);
  }
  return gorunum;
}
const tabanResmi = (k:PizzaKivami) => k==='tam'?'pizza-pismis':'pizza-'+k;
export const pizzaTabakResmi = (ust: readonly PizzaParcasi[],kivam:PizzaKivami='tam',sos:PizzaSosu='domates',kesim?:PizzaKesimi) => {
  const pizza=pizzaGorseli(ust,tabanResmi(kivam),kivam!=='erken',sos);
  pizza.dataset.kivam=kivam;
  if(kesim?.kesikler.length===2){pizza.dataset.dilim='4';pizza.append(kesimCizgisi('dikey'),kesimCizgisi('yatay'));}
  return pizza;
};
// Hamuru ve üzerindeki dilimleri aynı düzlemde yatır; her dilim kendi yönünü korur.
function tepsideGoster(pizza:HTMLElement){
  const ns='http://www.w3.org/2000/svg';
  const duzlem=document.createElementNS(ns,'svg');
  duzlem.classList.add('pz-tepsi-duzlemi');
  duzlem.setAttribute('viewBox','0 0 512 512');
  duzlem.setAttribute('preserveAspectRatio','none');
  duzlem.setAttribute('aria-hidden','true');
  const yuzey=document.createElementNS(ns,'foreignObject');
  yuzey.setAttribute('width','512');yuzey.setAttribute('height','512');
  yuzey.append(pizza);duzlem.append(yuzey);
  return duzlem;
}
function tikla(b: HTMLButtonElement, fn: () => void) {
  jest(b, { birak: (yer, _ilk, tik) => { if (tik && icinde(b, yer, 8)) fn(); }, klavye: fn });
}
interface FirinSecenekleri {
  misafir?:PizzaMisafiri;
  tepsiId?:string;
  tekrarFisi?:PizzaFisi;
  cikis: () => void;
  sesli: () => boolean;
  sesDegistir?: () => void;
  soyle?: (metin: string) => void;
  teslim?: (p: PizzaTabagi) => void;
}
export function pizzaAc(kok: HTMLElement, ayar: FirinSecenekleri) {
  if (kok.querySelector('.firin-oyunu')) return;
  const anahtar=kayitAnahtari(ayar.tepsiId);
  const yaz=(pizza:Pizza)=>saklananPizzayiYaz(anahtar,pizza);
  const eski = oku(anahtar);
  const devam = eski && (eski.asama !== 'son' || eski.aktif);
  const p = devam ? eski : yeni(teslimSayisi(),ayar.misafir);
  p.sosCesidi??='domates';
  if(!devam && ayar.tepsiId && ayar.tekrarFisi) p.fis=fisiOku(ayar.tekrarFisi)??p.fis;
  let teslimBekliyor=false;
  if(ayar.misafir)p.misafir=ayar.misafir;
  p.aktif = true;
  yaz(p);
  const onceki = Array.from(kok.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
  const sakli = onceki.map(el => ({ el, hidden: el.hidden, inert: el.inert }));
  for (const el of onceki) { el.hidden = true; el.inert = true; }
  const alan = h('section.firin-oyunu', { 'aria-label': 'Mini Pizza' });
  const dekor = h('img.pz-dekor', { alt: '', draggable: 'false' });
  const govde = h('div.pz-govde');
  const ust = h('header.ust.pz-ust');
  const duyuru = h('span.yalniz-okuyucu', { 'aria-live': 'polite' });
  alan.append(dekor, govde, ust, duyuru);
  kok.append(alan);
  let secili: Cesit | undefined;
  let porsiyon:1|3=p.porsiyon??(p.fis.miktarlar?1:3);
  let saat: ReturnType<typeof setTimeout> | undefined;
  let oncekiAn=performance.now(), kayitAni=0;
  let firinAcik=!document.hidden;
  const iceride=()=>p.asama==='pisiyor'||p.asama==='hazir';
  function sureyiAl(){
    const simdi=performance.now();
    if(firinAcik && iceride())p.pismeMs=Math.min(26500,p.pismeMs+Math.max(0,simdi-oncekiAn));
    oncekiAn=simdi;
  }
  function gorunurluk(){sureyiAl();firinAcik=!document.hidden;yaz(p);}
  function sakla(){sureyiAl();firinAcik=false;yaz(p);}
  function geriGeldi(){oncekiAn=performance.now();firinAcik=!document.hidden;}
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sakla);window.addEventListener('pageshow',geriGeldi);
  let gecti = false;
  const ses = (fn: () => void) => { if (ayar.sesli() && !document.hidden) fn(); };
  const konusma = (metin: string) => {
    duyuru.textContent = metin;
    if (ayar.sesli() && !document.hidden) {
      if(metin===CUMLE.kes){void konus(new URL('../../assets/sef/firin/pizza-kes.mp3',import.meta.url).href);return;}
      if (ayar.soyle) ayar.soyle(metin);
      else void sefKonus(metin);
    }
  };
  let istek = p.fis.malzemeler;
  const siparisiOku=()=>{
    const cumle=fisCumlesi(p.fis);
    duyuru.textContent=cumle;
    if(ayar.sesli()&&!document.hidden)void misafirCumlesi(p.misafir,cumle);
  };
  function kapat() {
    if (gecti) return;
    sureyiAl();gecti = true;
    clearTimeout(saat);
    sus();
    p.aktif = false;
    yaz(p);
    geriBirak();
    document.removeEventListener('keydown', tus);
    document.removeEventListener('visibilitychange',gorunurluk);window.removeEventListener('pagehide',sakla);window.removeEventListener('pageshow',geriGeldi);
    alan.remove();
    for (const s of sakli) { s.el.hidden = s.hidden; s.el.inert = s.inert; }
    ayar.cikis();
  }
  function tus(e: KeyboardEvent) {
    if (e.key === 'Escape' && !e.repeat) { e.preventDefault(); kapat(); }
  }
  const geriBirak = geriDinle(() => { kapat(); return true; });
  document.addEventListener('keydown', tus);
  function gec(adim: Asama) {
    p.asama = adim;
    yaz(p);
    ciz();
    if (adim === 'son') {
      duyuru.textContent = 'Mini Pizza hazır!';
      const uyum=fisPuani(p.ust,p.fis,p.sosCesidi), firin=pizzaPuani(pizzaKivami(p.pismeMs));
      if(p.misafir==='baba'){
        const cumle=babaPizzaYorumu(p.ust,p.fis,pizzaKivami(p.pismeMs));
        duyuru.textContent=cumle;
        if(ayar.sesli())void misafirCumlesi('baba',cumle,'tesekkur');
      }else if(uyum<=firin && p.fis.sos && p.fis.sos!==p.sosCesidi){
        const cumle='Sosunun rengine bak! Ben başka bir sos istemiştim.';
        duyuru.textContent=cumle;
        if(ayar.sesli())void misafirCumlesi(p.misafir,cumle);
      }else if(uyum<=firin && pizzaMiktarFarki(p.ust,p.fis).length){
        const cumle='Dilimleri birlikte sayalım mı? Fişimde başka bir sayı vardı.';
        duyuru.textContent=cumle;
        if(ayar.sesli()&&!document.hidden)void misafirCumlesi(p.misafir,cumle);
      }else if(uyum<3 && uyum<=firin && yanlisYaridakiMalzemeler(p.ust,p.fis).length) konusma('Pizzanın iki yarısındaki malzemelerin yerlerine bir daha bakalım.');
      else if(uyum<3 && uyum<firin) konusma('Müşteri pizzasında başka malzemeler istemişti.');
      else if(firin<3) konusma(({erken:'Pizza biraz erken çıkmış.',fazla:'Pizza fazla kızarmış.',yanik:'Pizzanın kenarları yanmış.',tam:'Afiyet olsun!'})[pizzaKivami(p.pismeMs)]);
      else if (ayar.sesli()) void misafirKonus(p.misafir, 'tesekkur');
    } else if(adim==='malzeme')siparisiOku();
    else if (adim !== 'pisiyor') konusma(CUMLE[adim]);
  }
  function yuvarlak(ad: string, simge: Parameters<typeof ikon>[0], fn: () => void) {
    const b = dugme(ad, 'dugme', ikon(simge));
    tikla(b, fn);
    return b;
  }
  function ustCiz() {
    const bilet = dugme('Pizza siparişini dinle', 'pz-fis', misafirResmi(p.misafir,'istek'));
    bilet.setAttribute('aria-description',fisCumlesi(p.fis));
    if(p.fis.sos)bilet.append(h('span.pz-fis-sos',{'role':'img','aria-label':sosAdi[p.fis.sos]},resim('sos-'+p.fis.sos)));
    function malzemeIsareti(cesit:Cesit,taraf?:Taraf) {
      const konan=p.ust.filter(i=>i.cesit===cesit&&(!taraf||pizzaTarafi(i.x)===taraf)).length;
      const adet=p.fis.miktarlar?.[cesit];
      const yanlisTarafta=taraf&&p.fis.yarilar&&p.ust.some(d=>d.cesit===cesit&&!p.fis.yarilar![pizzaTarafi(d.x)].includes(cesit));
      const varMi=(adet?konan===adet:konan>0)&&!yanlisTarafta;
      const s = h('span.pz-fis-malzeme', { 'data-cesit':cesit,'data-hazir': varMi ? '1' : '0' }, resim(cesit));
      if(adet){
        s.classList.add('pz-adetli');s.dataset.adet=String(adet);
        s.setAttribute('aria-label',ISIM[cesit]+': '+konan+' / '+adet);
        const pul=h('span.pz-adet-pulu',{'data-fazla':String(konan>adet)});
        for(let i=0;i<adet;i++)pul.append(h('b',{'data-dolu':String(i<konan)}));
        s.append(pul);
      }
      if (varMi) s.append(h('i', {}, ikon('onay')));
      return s;
    }
    if(p.fis.yarilar) {
      for(const taraf of TARAFLAR){
        const grup=h('span.pz-fis-yari',{'data-taraf':taraf,'aria-label':taraf==='sol'?'Sol yarı':'Sağ yarı'});
        grup.append(h('i.pz-yari-isareti'),...p.fis.yarilar[taraf].map(id=>malzemeIsareti(id,taraf)));
        bilet.append(grup);
      }
    } else bilet.append(...istek.map(id=>malzemeIsareti(id)));
    if(p.fis.haric)bilet.append(h('span.pz-haric',{'aria-label':ISIM[p.fis.haric]+' istemiyor'},resim(p.fis.haric),h('i',{},ikon('kapat'))));
    tikla(bilet,siparisiOku);
    const yardim = yuvarlak('Bu adımı dinle', 'hoparlor', () => konusma(CUMLE[p.asama]));
    ust.replaceChildren(yuvarlak('Siparişlere dön', 'geri', kapat), bilet, yardim);
    if (ayar.sesDegistir) {
      const sesDugme = yuvarlak(ayar.sesli() ? 'Sesi kapat' : 'Sesi aç', ayar.sesli() ? 'muzik' : 'sessiz', () => {
        ayar.sesDegistir?.();
        if (!ayar.sesli()) sus();
        ustCiz();
      });
      ust.append(sesDugme);
    }
  }
  function sayac(suAn: number, hedef: number) {
    const d = h('div.pz-sayac', { 'aria-hidden': 'true' });
    for (let i = 0; i < hedef; i++) d.append(h('i', { 'data-dolu': i < suAn ? '1' : '0' }));
    return d;
  }
  function sonraki(ad: string, islem: () => void, gorsel:Node = ikon('ileri')) {
    const b = dugme(ad, 'pz-ileri dugme', gorsel);
    tikla(b, islem);
    govde.append(b);
  }
  function fisSecenekleri() {
    const secimler=h('nav.pz-siparis-sec',{'aria-label':'Pizza fişini seç'});
    const tur=(f:PizzaFisi)=>f.yarilar?'yari':f.miktarlar?'sayili':'klasik';
    const adlar={klasik:'Klasik pizza siparişi',yari:'İki yarılı pizza siparişi',sayili:'Sayılı pizza siparişi'};
    function fisDegistir(fis:PizzaFisi){
      p.fis=fis;
      p.porsiyon=porsiyon=fis.miktarlar?1:3;
      p.tur=FISLER.indexOf(fis);
      istek=fis.malzemeler;yaz(p);ciz();siparisiOku();
    }
    for(const cesit of ['klasik','yari','sayili'] as const){
      const adaylar=FISLER.filter(f=>tur(f)===cesit);
      const fiş=tur(p.fis)===cesit?p.fis:adaylar[p.servis%adaylar.length];
      const ornek=h('span.pz-ornek-fis',{'data-tip':cesit});
      if(cesit==='yari')ornek.append(h('i.pz-kart-bolme'));
      const ornekMalzemeler=fiş.yarilar?[fiş.yarilar.sol[0],fiş.yarilar.sag[0]]:fiş.malzemeler.slice(0,2);
      for(const id of ornekMalzemeler){
        const parca=h('span',{},resim(id));
        if(fiş.miktarlar?.[id])parca.append(h('b',{},String(fiş.miktarlar[id])));
        ornek.append(parca);
      }
      const b=dugme(adlar[cesit],'pz-fis-karti',ornek);
      b.setAttribute('aria-pressed',String(tur(p.fis)===cesit));
      tikla(b,()=>{if(tur(p.fis)===cesit)siparisiOku();else fisDegistir(fiş);});
      secimler.append(b);
    }
    const grup=FISLER.filter(f=>tur(f)===tur(p.fis));
    const sira=grup.findIndex(f=>fisCumlesi(f)===fisCumlesi(p.fis));
    const gez=h('span.pz-fis-gez',{'role':'group','aria-label':'Aynı türdeki pizza siparişleri'});
    for(const yon of [-1,1]){
      const b=dugme(yon<0?'Önceki pizza fişi':'Sonraki pizza fişi','pz-fis-ok',ikon(yon<0?'geri':'ileri'));
      tikla(b,()=>fisDegistir(grup[(sira+yon+grup.length)%grup.length]));
      gez.append(b);
    }
    secimler.append(gez);
    return secimler;
  }
  function hamur() {
    const b = dugme('Merdaneyi ileri geri yuvarla', 'pz-tahta pz-yuvarla');
    const hamurResmi = resim(p.hamur < 2 ? 'hamur' : 'hamur-acik', 'pz-hamur-resmi');
    const goruntu = h('span.pz-hamur', {}, hamurResmi);
    const merdane = resim('merdane', 'pz-merdane');
    b.append(goruntu, merdane);
    const ipucu = h('span.pz-yol-oku', { 'aria-hidden': 'true' }, ikon('asagi'));
    b.append(ipucu);
    govde.append(b, sayac(p.hamur, TURLAR));
    if(!ayar.tepsiId&&!ayar.tekrarFisi&&!p.hamur)govde.append(fisSecenekleri());
    const tusOdak = () => { if (p.asama === 'hamur') b.focus({ preventScroll: true }); };
    function gor() {
      b.style.setProperty('--aciklik', String(p.hamur / TURLAR));
      hamurResmi.src = pizzaResmi(p.hamur < 2 ? 'hamur' : 'hamur-acik');
      govde.querySelector('.pz-sayac')?.replaceWith(sayac(p.hamur, TURLAR));
    }
    let sonY = 0, enUzak = 0, yon = 0;
    function tur() {
      if (p.asama !== 'hamur' || p.hamur >= TURLAR) return;
      p.hamur++;
      govde.querySelector('.pz-siparis-sec')?.remove();
      yaz(p); gor(); ses(() => efekt.nota(p.hamur));
      if (p.hamur >= TURLAR) gec('sos');
    }
    jest(b, {
      basla: yer => { sonY = yer.y; enUzak = yer.y; yon = 0; b.classList.add('pz-elde'); },
      tasi: yer => {
        const r = b.getBoundingClientRect();
        const y = sinir((yer.y - r.top) / r.height, .17, .82);
        b.style.setProperty('--merdane-y', y * 100 + '%');
        const fark = yer.y - sonY;
        if (Math.abs(fark) < 2) return;
        const isaret = Math.sign(fark);
        if (isaret !== yon) { enUzak = sonY; yon = isaret; }
        sonY = yer.y;
        if (Math.abs(yer.y - enUzak) >= r.height * .25) { tur(); enUzak = yer.y; }
      },
      birak: (_yer, _ilk, tik) => { b.classList.remove('pz-elde'); if (tik) { b.style.setProperty('--merdane-y', p.hamur % 2 ? '27%' : '68%'); tur(); } },
      iptal: () => b.classList.remove('pz-elde'),
      klavye: () => { b.style.setProperty('--merdane-y', p.hamur % 2 ? '27%' : '68%'); tur(); tusOdak(); },
    });
    gor();
  }
  function sos() {
    const b = dugme('Sosu hamurun üzerine yay', 'pz-tahta pz-sos');
    const taban = resim('hamur-acik', 'pz-taban');
    const kirmizi=resim('soslu-taban','pz-taban');
    const katman = h('span.pz-sos-katman',{},kirmizi);
    const pesto=resim('pesto-taban','pz-pesto');katman.append(pesto);
    const kasik = h('img.pz-sos-kasigi', { src: kaynak('nesneler', 'kasik'), alt: '', draggable: 'false' });
    const iz = h('span.pz-sos-iz', { 'aria-hidden': 'true' });
    b.append(taban, katman, iz, kasik);
    govde.append(b, sayac(p.sos.length, SOS_ALANLARI.length));
    const kaseler=h('div.pz-sos-kaseleri',{'role':'group','aria-label':'Pizza sosunu seç'});
    const soslar=['domates','feslegen'] as const;
    function kaseSecimi(){
      pesto.hidden=p.sosCesidi!=='feslegen';
      kirmizi.hidden=!pesto.hidden;
      const hazir=!p.fis.sos||p.sosSecildi;
      kaseler.dataset.bekliyor=String(!hazir);
      for(const el of kaseler.querySelectorAll('button'))el.setAttribute('aria-pressed',String(!!hazir&&el.dataset.sos===(p.sosCesidi??'domates')));
    }
    for(const sos of soslar){
      const kase=dugme(sosAdi[sos]+' seç','pz-sos-kasesi',resim('sos-'+sos));
      kase.dataset.sos=sos;
      tikla(kase,()=>{
        if((p.sosCesidi??'domates')!==sos){p.sosCesidi=sos;p.sos=[];gor();}
        p.sosSecildi=true;yaz(p);
        kaseSecimi();ses(efekt.secim);
      });
      kaseler.append(kase);
    }
    govde.append(kaseler);kaseSecimi();
    const sonrakiIz = () => SOS_ALANLARI.findIndex((_v, i) => !p.sos.includes(i));
    function gor() {
      const mask = p.sos.map(i => `radial-gradient(ellipse 27% 27% at ${SOS_ALANLARI[i].x}% ${SOS_ALANLARI[i].y}%, black 96%, transparent 100%)`).join(',');
      katman.style.maskImage = mask || 'linear-gradient(transparent,transparent)';
      const hedef = SOS_ALANLARI[sonrakiIz()];
      if (hedef) konum(iz, hedef);
      govde.querySelector('.pz-sayac')?.replaceWith(sayac(p.sos.length, SOS_ALANLARI.length));
    }
    function sur(n: Nokta) {
      if (p.asama !== 'sos') return;
      if(p.fis.sos&&!p.sosSecildi){
        kaseler.animate([{translate:'0 0'},{translate:'0 -3px'},{translate:'0 0'}],zaman(250));
        return;
      }
      konum(kasik, { x: sinir(n.x, 8, 92), y: sinir(n.y, 8, 92) });
      let yakin = -1, uzak = Infinity;
      SOS_ALANLARI.forEach((hedef, i) => {
        const d = Math.hypot(n.x - hedef.x, n.y - hedef.y);
        if (!p.sos.includes(i) && d < uzak) { uzak = d; yakin = i; }
      });
      if (yakin < 0 || uzak > 24) return;
      p.sos.push(yakin); yaz(p); ses(() => efekt.nota(p.sos.length)); gor();
      if (p.sos.length === SOS_ALANLARI.length) gec('malzeme');
    }
    jest(b, {
      basla: yer => sur(yuzde(b, yer)), tasi: yer => sur(yuzde(b, yer)),
      birak: () => {}, klavye: () => { const n = SOS_ALANLARI[sonrakiIz()]; if (n) sur(n); },
    });
    gor();
  }
  function malzeme() {
    const pizza = dugme('Malzemeyi pizzaya yerleştir', 'pz-tahta pz-diz', pizzaGorseli(p.ust, 'soslu-taban',false,p.sosCesidi));
    if(p.fis.yarilar){
      pizza.append(h('i.pz-bolme-cizgisi',{'aria-hidden':'true'}));
      for(const taraf of TARAFLAR)pizza.append(h('i.pz-kenar-yari',{'data-taraf':taraf,'aria-hidden':'true'},h('i.pz-yari-isareti')));
    }
    pizza.setAttribute('aria-description', 'Malzeme seçtikten sonra yön tuşlarıyla yerini seçip Enter tuşuna basabilirsin.');
    const raf = h('div.pz-raf', { role: 'group', 'aria-label': 'Pizza malzemeleri' });
    govde.append(pizza, raf);
    let hedefNokta = { x: 50, y: 50 };
    let tutulan: PizzaParcasi | undefined;
    const onizleme=h('span.pz-serpme-onizleme',{'aria-hidden':'true'});
    pizza.append(onizleme);
    function iziGoster(){
      const dilimler=secili?porsiyonKoy(p.ust,secili,hedefNokta,porsiyon,!!p.fis.yarilar):[];
      onizleme.replaceChildren(...dilimler.map(d=>dilimResmi(d)));
    }
    function kaldir(parca:PizzaParcasi) {
      p.ust=p.ust.filter(v=>v!==parca);
      secili=undefined; yaz(p); ses(efekt.secim); ciz();
    }
    function birak(cesit: Cesit, n: Nokta, tasinan?:PizzaParcasi) {
      if(!tasinan && p.ust.filter(v=>v.cesit===cesit).length>=CESIT_BASINA_DILIM)return;
      const eklenen=tasinan?[{cesit,...kenaraAl(n)}]:porsiyonKoy(p.ust,cesit,n,porsiyon,!!p.fis.yarilar);
      p.ust = [...p.ust.filter(v => v !== tasinan), ...eklenen];
      secili = undefined;
      yaz(p); ses(efekt.yapis); ciz();
      const resimler=govde.querySelectorAll<HTMLElement>('.pz-diz [data-parca]');
      Array.from(resimler).slice(-eklenen.length).forEach((el,i)=>el.animate(
        [{translate:'0 -18%',opacity:.55},{translate:'0 2%',opacity:1},{translate:'0 0'}],
        {duration:zaman(220),delay:zaman(i*45),easing:'ease-out'}));
    }
    const sec = (cesit: Cesit) => {
      secili = cesit;
      const bos=(n:Nokta)=>p.ust.every(v=>Math.hypot(v.x-n.x,v.y-n.y)>14);
      hedefNokta=YERLER.find(bos)??{x:50,y:50};
      raf.querySelectorAll<HTMLButtonElement>('.pz-malzeme').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cesit === cesit)));
      for(const simge of olcu.querySelectorAll('img'))simge.src=pizzaDilimResmi(cesit);
      iziGoster();
      pizza.classList.add('pz-bekliyor');
      ses(efekt.secim);
    };
    pizza.addEventListener('keydown', e => {
      if (!secili) return;
      const yonler: Record<string, Nokta> = {
        ArrowLeft: { x: -7, y: 0 }, ArrowRight: { x: 7, y: 0 },
        ArrowUp: { x: 0, y: -7 }, ArrowDown: { x: 0, y: 7 },
      };
      const yon = yonler[e.key];
      if (!yon) return;
      e.preventDefault();
      hedefNokta = kenaraAl({ x: hedefNokta.x + yon.x, y: hedefNokta.y + yon.y });
      iziGoster();
    });
    jest(pizza, {
      basla: yer => {
        if (secili) {hedefNokta=kenaraAl(yuzde(pizza,yer));iziGoster();return;}
        const n = yuzde(pizza, yer);
        let mesafe=12;
        for(const d of p.ust){
          const uzaklik=Math.hypot(d.x-n.x,d.y-n.y);
          if(uzaklik<=mesafe){mesafe=uzaklik;tutulan=d;}
        }
      },
      tasi: yer => {
        if(secili){hedefNokta=kenaraAl(yuzde(pizza,yer));iziGoster();return;}
        if (!tutulan) return;
        const el = pizza.querySelector<HTMLElement>(`.pz-parca[data-parca="${p.ust.indexOf(tutulan)}"]`);
        if (el) konum(el, kenaraAl(yuzde(pizza, yer)));
      },
      birak: (yer, _ilk, tik) => {
        if (secili && icinde(pizza,yer)) birak(secili, yuzde(pizza, yer));
        else if (tutulan && !tik) { if(icinde(raf,yer,10)) kaldir(tutulan); else birak(tutulan.cesit, yuzde(pizza, yer),tutulan); }
        tutulan = undefined;
      },
      iptal: () => {
        if (tutulan) {
          const el = pizza.querySelector<HTMLElement>(`.pz-parca[data-parca="${p.ust.indexOf(tutulan)}"]`);
          if (el) konum(el, tutulan);
        }
        tutulan = undefined;
      },
      klavye: () => { if (secili) birak(secili, hedefNokta); },
    });
    if(p.sos.length){
      const geri=yuvarlak('Sos tezgâhına dön','geri',()=>{secili=undefined;p.sos=[];gec('sos');});
      geri.classList.add('pz-geri-islem');govde.append(geri);
    }
    const olcu=h('div.pz-porsiyon',{'role':'group','aria-label':'Yerleştirilecek dilim sayısı'});
    const olcuDugmeleri=([1,3] as const).map(adet=>{
      const simge=h('span.pz-porsiyon-simge',{'data-adet':String(adet),'aria-hidden':'true'});
      for(let i=0;i<adet;i++)simge.append(resim('domates'));
      const b=dugme(adet===1?'Tek dilim koy':'Üç dilim serp','pz-olcu',simge);
      b.setAttribute('aria-pressed',String(porsiyon===adet));
      tikla(b,()=>{
        p.porsiyon=porsiyon=adet;yaz(p);
        for(const el of olcuDugmeleri)el.setAttribute('aria-pressed',String(el===b));
        iziGoster();ses(efekt.secim);
      });
      return b;
    });
    olcu.append(...olcuDugmeleri);govde.append(olcu);
    for (const cesit of CESITLER) {
      const b = dugme(ISIM[cesit] + ' seç', 'pz-malzeme', resim(cesit));
      const dilimler=p.ust.filter(v=>v.cesit===cesit);
      b.disabled=dilimler.length>=CESIT_BASINA_DILIM;
      b.dataset.cesit = cesit;
      b.setAttribute('aria-pressed', String(secili === cesit));
      let kopya: HTMLImageElement | undefined;
      const temizle = () => { kopya?.remove(); kopya = undefined; iziGoster(); };
      jest(b, {
        tasi: (yer, ilk) => {
          if (Math.hypot(yer.x - ilk.x, yer.y - ilk.y) < 6) return;
          if (!kopya) { kopya = resim(cesit, 'pz-tasinan'); alan.append(kopya); }
          const pos = yuzde(alan, yer); konum(kopya, pos);
          const tahtada=icinde(pizza,yer);
          kopya.hidden=tahtada;
          if(tahtada){
            const dilimler=porsiyonKoy(p.ust,cesit,yuzde(pizza,yer),porsiyon,!!p.fis.yarilar);
            onizleme.replaceChildren(...dilimler.map(d=>dilimResmi(d)));
          }else iziGoster();
        },
        birak: (yer, _ilk, tik) => {
          temizle();
          if (tik) sec(cesit);
          else if (icinde(pizza, yer)) birak(cesit, yuzde(pizza, yer));
        },
        iptal: temizle,
        klavye: () => { sec(cesit); if (secili) pizza.focus({ preventScroll: true }); },
      });
      const hucre=h('div.pz-raf-hucre',{},b); raf.append(hucre);
      const sonDilim=dilimler.at(-1);
      if(sonDilim){
        const sil=dugme(ISIM[cesit]+' kaldır','pz-geri-al',h('span',{'aria-hidden':'true'},'−'));
        tikla(sil,()=>kaldir(sonDilim)); hucre.append(sil);
      }
    }
    if (p.ust.length > 0) sonraki('Fırına git', () => gec('firin'),servisResmi('firin'));
  }
  function firin() {
    const firinda = iceride();
    let kivam = pizzaKivami(p.pismeMs);
    const hedef = h('div.pz-firin-hedef', { 'aria-hidden': 'true' });
    const park = h('div.pz-park', { 'aria-hidden': 'true' });
    const gorunum = firinda?pizzaTabakResmi(p.ust,kivam,p.sosCesidi):pizzaGorseli(p.ust,'soslu-taban',false,p.sosCesidi);
    const tepsi = dugme(firinda ? 'Pizzayı fırından çıkar' : 'Tepsiyi fırına sür', 'pz-tepsi', resim('tepsi', 'pz-tepsi-resmi'), tepsideGoster(gorunum));
    tepsi.classList.toggle('pz-iceride', firinda);
    govde.append(hedef, park, tepsi);
    if (firinda) {
      const gorev=h('div.pz-firin-kivam',{'aria-label':'Fırında pişme derecesi'});
      const durumlar=['erken','tam','fazla','yanik'] as const;
      for(const durum of durumlar){
        const durak=h('span',{'data-derece':durum},resim(tabanResmi(durum)));
        if(durum==='tam')durak.append(h('i',{},ikon('onay')));
        gorev.append(durak);
      }
      const imlec=h('i.pz-isi-imleci');gorev.append(imlec);govde.append(gorev);
      const cik=yuvarlak('Tepsiyi şimdi al','asagi',()=>koy());
      cik.classList.add('pz-firindan-al');govde.append(cik);
      const vurgula=()=>{
        alan.dataset.kivam=kivam;gorunum.dataset.kivam=kivam;
        gorunum.querySelector<HTMLImageElement>('.pz-taban')!.src=pizzaResmi(tabanResmi(kivam));
        for(const peynir of gorunum.querySelectorAll<HTMLImageElement>('[data-cesit=peynir]'))peynir.src=pizzaDilimResmi('peynir',kivam!=='erken');
        for(const el of gorev.querySelectorAll<HTMLElement>('[data-derece]'))el.classList.toggle('pz-derece-etkin',el.dataset.derece===kivam);
      };
      vurgula();
      const zamanlama=()=>{
        if(gecti||!iceride()||!tepsi.isConnected)return;
        sureyiAl();
        const simdi=pizzaKivami(p.pismeMs);
        if(simdi!==kivam){
          kivam=simdi;vurgula();yaz(p);
          if(kivam==='tam'){p.asama='hazir';alan.dataset.asama='hazir';ses(efekt.tink);konusma(CUMLE.hazir);yaz(p);}
        }
        const esikler=[0,3400,16500,26500];
        const i=durumlar.indexOf(kivam),mesafe=i===3?0:(p.pismeMs-esikler[i])/(esikler[i+1]-esikler[i]);
        imlec.style.left=(12.5+25*Math.min(3,i+mesafe))+'%';
        if(performance.now()-kayitAni>600){kayitAni=performance.now();yaz(p);}
        if(kivam!=='yanik')saat=setTimeout(zamanlama,100);
      };
      if(p.asama==='pisiyor'&&kivam!=='erken'){p.asama='hazir';alan.dataset.asama='hazir';yaz(p);}
      zamanlama();
    }
    const varis = firinda ? park : hedef;
    varis.classList.add('pz-hedef-etkin');
    if (!firinda) {
      const don = yuvarlak('Pizza tezgâhına dön', 'geri', () => gec('malzeme'));
      don.classList.add('pz-geri-islem');
      govde.append(don);
    }
    function koy() {
      if (firinda) {
        sureyiAl();
        if(ayar.tepsiId==='paylasilan-pizza'&&pizzaKivami(p.pismeMs)==='tam'&&!p.kesim){p.kesim={kesikler:[]};gec('kes');}
        else gec('servis');
        return;
      }
      oncekiAn=performance.now();firinAcik=!document.hidden;
      ses(efekt.yapis);
      gec('pisiyor');
    }
    jest(tepsi, {
      tasi: (yer, ilk) => {
        tepsi.style.translate = `${yer.x-ilk.x}px ${yer.y-ilk.y}px`;
        varis.classList.toggle('pz-yakin', icinde(varis, yer, 16));
      },
      birak: (yer, _ilk, tik) => { tepsi.style.translate = ''; if (tik || icinde(varis, yer, 16)) koy(); },
      iptal: () => { tepsi.style.translate = ''; }, klavye: koy,
    });
  }
  function servis() {
    const bitti = p.asama === 'son';
    const kivam=pizzaKivami(p.pismeMs), puan=pizzaPuani(kivam);
    const uyum=fisPuani(p.ust,p.fis,p.sosCesidi), toplam=pizzaToplamPuani(puan,uyum);
    alan.dataset.kivam=kivam;
    const tabak = h('div.pz-tabak', { 'aria-label': 'Servis tabağı' });
    const pizza = dugme('Pizzayı servis tabağına koy', 'pz-sun', tepsideGoster(pizzaTabakResmi(p.ust,kivam,p.sosCesidi,p.kesim)));
    const misafir = h('div.pz-misafir', {}, misafirResmi(p.misafir, bitti ? toplam===3?'tesekkur':'tadim' : 'istek'));
    tabak.append(servisResmi('tabak'));
    const zil=dugme('Servis zilini çal','pz-servis-zili',servisResmi('zil'));
    zil.disabled=bitti;
    if(!bitti)tikla(zil,()=>{ses(efekt.tink);ver();});
    govde.append(misafir,tabak,pizza,zil);
    if (bitti) {
      pizza.disabled = true; pizza.classList.add('pz-sunuldu');
      const karnem=h('div.pz-son-ozeti');
      const satir=(ad:string,deger:number,isaret:string)=>{
        const rozet=h('span.pz-kivam-puani',{'aria-label':ad+' '+deger+' / 3',role:'img'});
        if(isaret==='odul'){
          rozet.classList.add('pz-puan-toplami');
          for(let i=1;i<=3;i++){
            const yildiz=servisResmi('odul');yildiz.classList.toggle('pz-bos-yildiz',i>deger);rozet.append(yildiz);
          }
        }else{
          rozet.append(servisResmi(isaret),h('b',{},String(deger)),h('small',{},'/3'));
        }
        karnem.append(rozet);
      };
      satir('Pişirme puanı',puan,'firin');
      satir('Sipariş uyumu',uyum,'fis');
      if(p.fis.sos&&p.fis.sos!==(p.sosCesidi??'domates')){
        karnem.append(h('span.pz-dilim-farki',{'aria-label':'İstenen sos: '+sosAdi[p.fis.sos]},resim('sos-'+(p.sosCesidi??'domates')),ikon('ileri'),resim('sos-'+p.fis.sos)));
      }
      const fark=pizzaFarki(p.ust,istek);
      if(fark.eksik.length||fark.fazla.length){
        const farklar=h('div.pz-farklar');
        for(const [tur,liste] of [['eksik',fark.eksik],['fazla',fark.fazla]] as const){
          if(!liste.length)continue;
          const grup=h('span',{'data-fark':tur,'aria-label':(tur==='eksik'?'Eksik':'Fazla')+': '+liste.map(id=>ISIM[id]).join(', ')});
          grup.append(ikon(tur==='eksik'?'sepet':'kapat'),...liste.map(id=>resim(id)));
          farklar.append(grup);
        }
        karnem.append(farklar);
      }
      if(p.fis.yarilar){
        const yanlis=yanlisYaridakiMalzemeler(p.ust,p.fis);
        for(const taraf of TARAFLAR){
          const hedef=p.fis.yarilar[taraf].filter(id=>yanlis.includes(id));
          if(!hedef.length)continue;
          const ad=taraf==='sol'?'Sol':'Sağ';
          const grup=h('span.pz-fis-yari',{'data-taraf':taraf,'aria-label':ad+' yarıya istenen: '+hedef.map(id=>ISIM[id]).join(', ')});
          grup.append(h('i.pz-yari-isareti'),...hedef.map(id=>resim(id)));karnem.append(grup);
        }
      }
      for(const {cesit,istenen,konan} of pizzaMiktarFarki(p.ust,p.fis)){
        const fark=h('span.pz-dilim-farki',{'aria-label':ISIM[cesit]+': '+istenen+' istendi, '+konan+' kondu'});
        fark.append(resim(cesit),h('b',{},String(konan)),ikon('ileri'),h('b',{},String(istenen)));karnem.append(fark);
      }
      satir('Toplam puan',toplam,'odul');
      govde.append(karnem);
      sonraki('Yeni sipariş seç', kapat);
      return;
    }
    if(p.kesim?.kesikler.length!==2){
      const kes=dugme('Pizzayı dört dilime kes','pz-paylas-ac',resim('pizza-ruleti'));
      tikla(kes,()=>{p.kesim??={kesikler:[]};gec('kes');});govde.append(kes);
    }
    if(kivam==='erken'){
      const sur=dugme('Pizzayı tekrar fırına sür','pz-pisme-sec',resim('firin'),ikon('tekrar'));
      tikla(sur,()=>{oncekiAn=performance.now();firinAcik=!document.hidden;gec('pisiyor');});govde.append(sur);
    }
    if(kivam==='fazla'||kivam==='yanik'){
      const yenile=dugme('Taze pizzayla yeniden başla','pz-pisme-sec',resim('hamur'),ikon('tekrar'));
      tikla(yenile,()=>{p.hamur=0;p.sos=[];p.sosSecildi=false;p.sosCesidi='domates';p.ust=[];p.pismeMs=0;delete p.kesim;secili=undefined;gec('hamur');});govde.append(yenile);
    }
    function ver() {
      if (p.asama !== 'servis' || teslimBekliyor) return;
      teslimBekliyor=true;
      const kaydet=()=>{
        if(gecti)return;
        p.servis=numaraAyir(p.servis);
        ses(toplam===3?efekt.dogru:efekt.secim); p.asama='son';
        ayar.teslim?.({tarifId:'pizza',no:p.servis,...(p.kesim?.kesikler.length===2?{kesim:{kesikler:[...p.kesim.kesikler]}}:{}),fis:p.fis,sosCesidi:p.sosCesidi??'domates',ust:p.ust.map(parca=>({...parca})),pisirme:puan,kivam,istekPuani:uyum,puan:toplam});
        kapat();
      };
      if(navigator.locks)void navigator.locks.request(ANAHTAR+'-numara',kaydet);
      else kaydet();
    }
    jest(pizza, {
      tasi: (yer, ilk) => { pizza.style.translate = `${yer.x-ilk.x}px ${yer.y-ilk.y}px`; tabak.classList.toggle('pz-yakin', icinde(tabak, yer, 12)); },
      birak: (yer, _ilk, tik) => { pizza.style.translate = ''; if (tik || icinde(tabak, yer, 12)) ver(); },
      iptal: () => { pizza.style.translate = ''; }, klavye: ver,
    });
  }
  function ciz() {
    clearTimeout(saat);
    const once = alan.dataset.asama, odak = document.activeElement;
    const klavye = odak instanceof HTMLButtonElement && odak.matches(':focus-visible');
    const ad = klavye ? odak.getAttribute('aria-label') : null;
    alan.dataset.asama = p.asama;
    const firinda = p.asama === 'firin' || p.asama === 'pisiyor' || p.asama === 'hazir';
    const sunum = p.asama === 'servis' || p.asama === 'son';
    const src = firinda ? pizzaResmi('firin') : sunum ? servisSrc('fon') : pizzaResmi('tezgah');
    if (src && dekor.getAttribute('src') !== src) dekor.src = src;
    govde.replaceChildren();
    ustCiz();
    if (p.asama === 'hamur') hamur();
    else if (p.asama === 'sos') sos();
    else if (p.asama === 'malzeme') malzeme();
    else if(p.asama==='kes'){
      p.kesim??={kesikler:[]};
      govde.append(pizzaKesimTahtasi(pizzaTabakResmi(p.ust,pizzaKivami(p.pismeMs),p.sosCesidi),p.kesim,()=>yaz(p),()=>ses(efekt.yapis),()=>gec('servis')));
    }
    else if (firinda) firin();
    else servis();
    if (klavye) {
      const yeniOdak = once === p.asama && ad ? alan.querySelector<HTMLButtonElement>(`button[aria-label="${CSS.escape(ad)}"]`) : null;
      (yeniOdak ?? govde.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus({ preventScroll: true });
    }
  }
  ciz();
  if ((p.asama==='hamur' && !p.hamur)||p.asama==='malzeme')siparisiOku();
  else konusma(CUMLE[p.asama]);
}
