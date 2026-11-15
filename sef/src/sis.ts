import { atolyeKaydi } from './atolye-kaydi';
import { h } from '../../src/ui/dom';
import {izgaraKivami,izgaraPuani,kavurmaRengi,servisYuzu,type IzgaraPismesi} from './sis-pisme';
import { arkaPlanDinle, geriDinle } from '../../src/kabuk/yon';
import { efekt } from '../../src/audio/efekt';
import { sus } from '../../src/audio/konusma';
import { dugme, ikon } from './gorsel';
import { icinde, jest, zaman, type Nokta } from './hareket';
import { karistirmaSesi } from './mutfak-ses';
import {sisSebzeleri as MALZEME,sisFisleri as SIPARISLER,sisSoslari as SOS_ISTEKLERI,type AtolyeAyar,type SisSebzesi as Malzeme} from './yemekler';
import './sis.css';
import {sisIstegi} from './firin-izgara-fisi';
import {misafirCumlesi} from './misafir';
import {yildizlar} from './salata-sosu';

const gorseller = import.meta.glob<string>('../../assets/sef/sis/*.webp', {
  eager: true, query: '?url', import: 'default',
});
const adres = (id: string) => gorseller[`../../assets/sef/sis/${id}.webp`];
function resim(id: string, sinif = '') {
  return h('img', { class: sinif, src: adres(id), alt: '', draggable: 'false' });
}
const SOS = {
  yogurt: { ad: 'Yoğurt', damla: 'sos-cizgi-beyaz', renk: '#fff3ce' },
  domates: { ad: 'Domates', damla: 'sos-cizgi-kirmizi', renk: '#d9442f' },
  feslegen: { ad: 'Fesleğen', damla: 'sos-cizgi-yesil', renk: '#61b259' },
} as const;
type Sos = keyof typeof SOS;
const SOS_REPLIKLERI: Record<Sos,string> = {
  feslegen: 'Fesleğen sosunu şişe sür.',
  yogurt: 'Yoğurt sosunu şişe sür.',
  domates: 'Domates sosunu şişe sür.',
};
const sosMaskesi = (adet: number) => (1 << adet) - 1;
function uyumPuani(d: Sis): 1|2|3 {
  const sebzeler = SIPARISLER[d.tur].filter((id,i)=>d.lokmalar[i]===id).length;
  const sosDogru = d.sos===SOS_ISTEKLERI[d.tur] && d.kaplama===sosMaskesi(d.dizilen);
  const uyum = sebzeler + Number(sosDogru);
  return uyum===5 ? 3 : uyum>=3 ? 2 : 1;
}
const TABAK = { tabak: 'Krem', 'tabak-nane': 'Nane', 'tabak-sari': 'Sarı' } as const;
type Tabak = keyof typeof TABAK;
type Durak = 'islat' | 'diz' | 'izgara' | 'sos' | 'servis' | 'son';
const DURAKLAR: readonly Durak[] = ['islat', 'diz', 'izgara', 'sos', 'servis', 'son'];
type Yan = 'taze' | 'donuk' | 'donus' | 'pismis';
interface Sis {
  durak: Durak; aktif: boolean; servis: number; tur: number;
  lokmalar: Malzeme[]; suyaGirdi: boolean; suVakti: number; dizilen: number; ateste: boolean;
  isinma: [number,number]; alt: 0|1; cevrildi: boolean; pismeVakti: number; sos?: Sos; kaplama: number; tabak?: Tabak;
}
const ANAHTAR = 'minkino-sef-sis-v1';
const FIRIN_SURESI = 1450;
const ISLATMA_SURESI = 1250;
const HEPSI_SOSLU = 15;
const DUYURU = {
  islat: 'Tahta çubuğu suya bırak.', kaldir: 'Islanan çubuğu tezgâha al.',
  diz: 'Fişteki sırayla sebzeleri çubuğa geçir.',
  izgara: 'Şişi ızgaraya taşı.', cevir: 'Şişi çevir, diğer yanı da pişsin.',
  sogut: 'Şişi maşayla servis tabağına al.',
  sos: 'Bir sos seç, şişin üzerine gezdir.',
  servis: 'Şişin hazır. Hangi tabakta sunalım?', son: 'Afiyet olsun!',
};
const yenile = (servis = 0): Sis => ({
  durak: 'islat', aktif: true, servis, tur: servis % SIPARISLER.length,
  lokmalar: [], suyaGirdi: false, suVakti: 0, dizilen: 0, ateste: false, cevrildi: false,
  isinma:[0,0],alt:0,pismeVakti: 0, kaplama: 0,
});
const sayi = (n: unknown, max: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(Math.floor(n), max)) : 0;
const kayit = atolyeKaydi<Sis>(ANAHTAR);
function oku(masa = ''): Sis | undefined {
  try {
    const raw: unknown = kayit.oku(masa);
    if (!raw || typeof raw !== 'object') return undefined;
    const k = raw as Partial<Sis>;
    const d = yenile(sayi(k.servis, 999999));
    d.aktif = k.aktif === true;
    d.tur = sayi(k.tur, SIPARISLER.length - 1);
    d.suyaGirdi = k.suyaGirdi === true;
    d.suVakti = sayi(k.suVakti, Date.now() + ISLATMA_SURESI);
    // Eski sürüm yalnızca tam fiş sırasına izin verdiği için eski sayacı güvenle dönüştürebiliriz.
    d.lokmalar = Array.isArray(k.lokmalar)
      ? k.lokmalar.filter((id): id is Malzeme => typeof id==='string' && Object.hasOwn(MALZEME,id)).slice(0,4)
      : SIPARISLER[d.tur].slice(0,sayi(k.dizilen,4));
    d.dizilen = d.lokmalar.length;
    d.ateste = k.ateste === true;
    d.cevrildi = d.ateste && k.cevrildi === true;
    d.pismeVakti = sayi(k.pismeVakti, Date.now() + FIRIN_SURESI);
    if(Array.isArray(k.isinma)&&k.isinma.length===2){
      d.isinma=[sayi(k.isinma[0],18000),sayi(k.isinma[1],18000)];d.alt=k.alt===1?1:0;
    }else if(d.ateste){
      const gecen=Math.max(0,Math.min(1,1-(d.pismeVakti-Date.now())/FIRIN_SURESI));
      const sure=Math.round(2000*gecen);d.alt=d.cevrildi?1:0;d.isinma=d.cevrildi?[2000,sure]:[sure,0];
    }
    d.sos = k.sos && Object.hasOwn(SOS,k.sos) ? k.sos : undefined;
    d.kaplama = d.sos ? sayi(k.kaplama, HEPSI_SOSLU) & sosMaskesi(d.dizilen) : 0;
    d.tabak = k.tabak && Object.hasOwn(TABAK,k.tabak) ? k.tabak : undefined;
    d.durak = k.durak && DURAKLAR.includes(k.durak) ? k.durak : 'islat';
    if (!d.suyaGirdi) d.durak = 'islat';
    else if (DURAKLAR.indexOf(d.durak)>1 && !d.dizilen) d.durak = 'diz';
    else if (DURAKLAR.indexOf(d.durak)>2 && !d.cevrildi) d.durak = 'izgara';
    else if (DURAKLAR.indexOf(d.durak)>3 && d.kaplama !== sosMaskesi(d.dizilen)) d.durak = 'sos';
    return d;
  } catch { return undefined; }
}

export const sisDevamEdiyor = (masa = '') => oku(masa)?.aktif === true;
export function sisDurumu(masa = '') {
  const d = oku(masa);
  return { suruyor: !!d && d.durak !== 'son', servis: d?.servis ?? 0 };
}
function tikla(b: HTMLButtonElement, fn: () => void) {
  jest(b, { birak: (yer, _ilk, tik) => { if (tik && icinde(b,yer,8)) fn(); }, klavye: fn });
}
const yuzde = (n: number) => n + '%';
// Tahta, tek tek sebzeler ve sosun maskesi aynı koordinat sistemiyle albüme de çizilir.
const YERLER = [23, 39, 55, 71];
function lokmaResmi(d: Sis, i: number, yan: Yan) {
  const temel = d.lokmalar[i] + '-' + yan;
  return yan === 'pismis' && d.sos && (d.kaplama & (1 << i)) ? temel + '-' + d.sos : temel;
}
function ciziliSis(d: Sis, yan: Yan) {
  const kap = h('span.sk-cubuklu', {}, resim('cubuk', 'sk-cubuk'));
  for (let i=0; i<d.dizilen; i++) {
    const sebze = d.lokmalar[i];
    const img = resim(lokmaResmi(d, i, yan), 'sk-dilim');
    img.style.left = yuzde(YERLER[i]);
    img.dataset.malzeme = sebze;
    if(d.durak!=='izgara'&&yan==='pismis')img.style.filter=kavurmaRengi(servisYuzu(ikiYuz(d)));
    kap.append(img);
  }
  return kap;
}
const ikiYuz=(d:Sis):IzgaraPismesi=>[izgaraKivami(d.isinma[0]),izgaraKivami(d.isinma[1])];
const toplamPuan=(d:Sis)=>Math.min(uyumPuani(d),izgaraPuani(ikiYuz(d))) as 1|2|3;
const resimTamponu = new Map<string, Promise<HTMLImageElement>>();
function resmiOku(id: string) {
  let p = resimTamponu.get(id);
  if (!p) {
    const r = new Image();
    r.src = adres(id);
    p = r.decode().then(() => r).catch(e => { resimTamponu.delete(id); throw e; });
    resimTamponu.set(id,p);
  }
  return p;
}
/** Albümün küçük resmi, yalnızca oyunda görülen çizimlerden yeniden birleştirilir. */
async function albumResmi(d: Sis): Promise<string> {
  const canvas = document.createElement('canvas'); canvas.width = 420; canvas.height = 252;
  const ctx = canvas.getContext('2d');
  if (!ctx || !d.sos || !d.tabak) throw new Error('Servis çizimi hazır değil.');
  const urunler = d.lokmalar;
  const ids = [d.tabak,'cubuk',...urunler.map((_v,i)=>lokmaResmi(d,i,'pismis'))];
  const g = await Promise.all(ids.map(resmiOku));
  function oturt(img: HTMLImageElement,x:number,y:number,w:number,h:number) {
    const oran = Math.min(w/img.width,h/img.height);
    const en=img.width*oran,boy=img.height*oran;
    ctx!.drawImage(img,x+(w-en)/2,y+(h-boy)/2,en,boy);
  }
  ctx.drawImage(g[0],6,29,408,197);
  ctx.save();
  ctx.translate(210,127); ctx.rotate(-.08);
  ctx.drawImage(g[1],-183,-3,366,6);
  ctx.filter=kavurmaRengi(servisYuzu(ikiYuz(d)));
  urunler.forEach((_v,i)=>oturt(g[i+2],-183+YERLER[i]*3.66-35,-41,70,82));
  ctx.restore();
  return canvas.toDataURL('image/webp',.92);
}
export function sisAc(kok: HTMLElement, ayar: AtolyeAyar) {
  if (kok.querySelector('.sis-oyunu')) return;
  const masaId = ayar.masa ?? '';
  const yaz = (durum: Sis) => kayit.yaz(masaId, durum);
  const oncekiKayit = oku(masaId);
  const d = oncekiKayit && (oncekiKayit.durak !== 'son' || oncekiKayit.aktif) ? oncekiKayit : yenile(oncekiKayit?.servis ?? ayar.oncekiServis);
  if(d!==oncekiKayit&&ayar.tekrarTercihi?.tarifId==='sis')d.tur=ayar.tekrarTercihi.tur;
  d.aktif = true; yaz(d);
  const onceki = Array.from(kok.children).filter((v):v is HTMLElement=>v instanceof HTMLElement).map(el=>({el,hidden:el.hidden,inert:el.inert}));
  for (const {el} of onceki) { el.hidden=true; el.inert=true; }
  const alan = h('section.sis-oyunu', { 'aria-label': 'Renkli Şişler' });
  const dekor = h('img.sk-dekor',{alt:'',draggable:'false'});
  const govde = h('div.sk-govde');
  const ust = h('header.sk-ust');
  const duyuru = h('span.yalniz-okuyucu', {'aria-live':'polite','aria-atomic':'true'});
  alan.append(dekor,govde,ust,duyuru); kok.append(alan);
  let kapandi=false, mesgul=false, timer: ReturnType<typeof setTimeout> | undefined;
  let sonAn:number|undefined,saat:number|undefined,arkada=false,gizli=false,izgaraGoster:(()=>void)|undefined,sonYaz=0;
  function ateşZamani(){
    const an=performance.now();
    if(sonAn!==undefined)d.isinma[d.alt]=Math.min(18000,d.isinma[d.alt]+Math.max(0,an-sonAn));
    sonAn=an;
  }
  function isiDurdur(){
    if(sonAn!==undefined)ateşZamani();
    sonAn=undefined;clearInterval(saat);saat=undefined;
  }
  function saatKur(){
    isiDurdur();
    if(kapandi||d.durak!=='izgara'||!d.ateste||arkada||gizli||document.hidden){yaz(d);return;}
    sonAn=performance.now();
    saat=window.setInterval(()=>{
      ateşZamani();izgaraGoster?.();
      if(performance.now()-sonYaz>400){yaz(d);sonYaz=performance.now();}
    },90);
  }
  const arkaBirak=arkaPlanDinle(v=>{arkada=v;saatKur();});
  const gizle=()=>{gizli=true;saatKur();},ac=()=>{gizli=false;saatKur();};
  window.addEventListener('pagehide',gizle);window.addEventListener('pageshow',ac);
  document.addEventListener('visibilitychange',saatKur);
  const secim = SIPARISLER[d.tur];
  function konus(metin: string) {
    duyuru.textContent = metin;
    if (ayar.sesli() && !document.hidden) ayar.soyle(metin);
  }
  function cal(fn:()=>void) { if (ayar.sesli() && !document.hidden) fn(); }
  function rehber() {
    if (d.durak === 'islat') return d.suyaGirdi ? DUYURU.kaldir : DUYURU.islat;
    if (d.durak === 'izgara') return !d.ateste ? DUYURU.izgara : d.cevrildi ? DUYURU.sogut : DUYURU.cevir;
    if (d.durak === 'sos') return SOS_REPLIKLERI[SOS_ISTEKLERI[d.tur]];
    return DUYURU[d.durak];
  }
  function kapat() {
    if (kapandi) return;
    isiDurdur();arkaBirak();window.removeEventListener('pagehide',gizle);window.removeEventListener('pageshow',ac);document.removeEventListener('visibilitychange',saatKur);
    kapandi=true; clearTimeout(timer); sus(); d.aktif=false; yaz(d);
    geriBirak(); document.removeEventListener('keydown',klavye);
    alan.remove(); for (const v of onceki) { v.el.hidden=v.hidden; v.el.inert=v.inert; }
    ayar.cikis();
  }
  const geriBirak=geriDinle(()=>{kapat();return true;});
  function klavye(e:KeyboardEvent){if(e.key==='Escape'&&!e.repeat){e.preventDefault();kapat();}}
  document.addEventListener('keydown',klavye);
  function git(hedef:Durak) { isiDurdur();d.durak=hedef; yaz(d); ciz(); konus(rehber()); }
  function tus(ad:string,simge:Parameters<typeof ikon>[0],fn:()=>void,sinif='') {
    const b=dugme(ad,'sk-dugme '+sinif,ikon(simge)); tikla(b,fn);return b;
  }
  function ileri(ad:string,fn:()=>void) { govde.append(tus(ad,'ileri',fn,'sk-ileri')); }
  function ustCiz(){
    const fis=dugme('Renkli Şişler siparişini dinle','sk-fis',resim('sis','sk-fis-yemek'));
    for(let i=0;i<secim.length;i++){
      const img=resim(secim[i]+'-taze');
      const varMi=i<d.dizilen;
      const dogru=d.lokmalar[i]===secim[i];
      const hucre=h('span.sk-fis-goz',{'data-sira':String(d.durak==='diz'&&d.dizilen===i)},img);
      if(varMi || ['izgara','sos','servis','son'].includes(d.durak)){
        hucre.dataset.uyum=dogru?'dogru':'eksik';
        hucre.append(h('i',{},ikon(dogru?'onay':'tekrar')));
      }
      fis.append(hucre);
    }
    const siparisSosu=SOS_ISTEKLERI[d.tur];
    const sosGoz=h('span.sk-fis-goz.sk-fis-sos',{'aria-label':SOS[siparisSosu].ad+' sosu isteniyor'},resim('sos-'+siparisSosu));
    if(d.sos){
      const tam=d.sos===siparisSosu && d.kaplama===sosMaskesi(d.dizilen);
      sosGoz.dataset.uyum=tam?'dogru':'eksik';
      sosGoz.append(h('i',{},ikon(tam?'onay':'tekrar')));
    }
    fis.append(sosGoz);
    tikla(fis,()=>{
      const cumle=sisIstegi(d.tur);duyuru.textContent=cumle;
      if(ayar.sesli()&&!document.hidden)void misafirCumlesi('pizza',cumle);
    });
    ust.replaceChildren(tus('Siparişlere dön','geri',kapat),fis,tus(ayar.sesli()?'Sesi kapat':'Sesi aç',ayar.sesli()?'hoparlor':'sessiz',()=>{ayar.sesDegistir();ustCiz();}));
  }
  function saateKadar(son:number,fn:()=>void) { 
    const kalan=Math.max(0,son-Date.now());clearTimeout(timer);
    timer=setTimeout(()=>{if(!kapandi)fn();},kalan+12);
  }
  function tasi(b:HTMLButtonElement,hedef:HTMLElement,onay:()=>void,aninda=false) {
    const sifirla=()=>{b.style.translate='';b.classList.remove('sk-elde'); hedef.classList.remove('sk-yakin');};
    jest(b,{
      tasi:(yer,ilk)=>{b.classList.add('sk-elde');b.style.translate=`${yer.x-ilk.x}px ${yer.y-ilk.y}px`;hedef.classList.toggle('sk-yakin',icinde(hedef,yer,12));},
      birak:(yer,_ilk,tik)=>{sifirla();if(tik||icinde(hedef,yer,14))onay();else if(aninda)kalp(hedef);},
      iptal:sifirla,klavye:onay,
    });
  }
  function kalp(el:Element) { el.animate([{scale:'1'},{scale:'1.08'},{scale:'1'}],{duration:zaman(350)}); }
  function islat(){
    const kap=h('div.sk-su',{'aria-label':'Çubuğu ıslatmak için su kabı'},resim('su-kabi'));
    govde.append(kap);
    if(!d.suyaGirdi){
      const kuru=dugme('Tahta çubuğu suya bırak','sk-kuru',resim('igne-kuru'));
      govde.append(kuru);
      tasi(kuru,kap,()=>{d.suyaGirdi=true;d.suVakti=Date.now()+zaman(ISLATMA_SURESI);yaz(d);cal(efekt.yapis);ciz();});
      return;
    }
    const bekle = Date.now() < d.suVakti;
    const cubuk=dugme('Islanan çubuğu tezgâha al','sk-islak',resim('igne-islak'));
    kap.append(cubuk);
    if(bekle){cubuk.disabled=true;kap.classList.add('sk-dalga');saateKadar(d.suVakti,()=>{ciz();konus(DUYURU.kaldir);});return;}
    kap.append(resim('su-damla','sk-su-izi'));
    const yer=h('div.sk-kuru-yer',{'aria-hidden':'true'},ikon('ileri'));
    govde.append(yer);tasi(cubuk,yer,()=>git('diz'));
  }
  function pisirmeyiSifirla(){
    d.isinma=[0,0];d.alt=0;d.ateste=false;d.cevrildi=false;d.pismeVakti=0;d.sos=undefined;d.kaplama=0;
  }
  function diz(){
    const tut=h('div.sk-tut',{'aria-label':'Sebzeleri geçirilecek çubuk'},ciziliSis(d,'taze'));
    govde.append(tut);
    for(const [i,img] of Array.from(tut.querySelectorAll<HTMLElement>('.sk-dilim')).entries()){
      const cikar=dugme(MALZEME[d.lokmalar[i]]+' parçasını şişten çıkar','sk-lokma-cikar',ikon('geri'));
      cikar.style.left=yuzde(YERLER[i]);
      const yenile=()=>{d.dizilen=d.lokmalar.length;pisirmeyiSifirla();yaz(d);ciz();};
      const cikarLokma=()=>{d.lokmalar.splice(i,1);yenile();};
      const kaydir=(hedef:number)=>{
        if(hedef===i||hedef<0||hedef>=d.dizilen)return;
        const [parca]=d.lokmalar.splice(i,1);d.lokmalar.splice(hedef,0,parca);
        cal(efekt.yapis);yenile();
      };
      jest(cikar,{
        tasi:(yer,ilk)=>{img.style.translate=(yer.x-ilk.x)+'px 0';img.style.zIndex='3';},
        birak:(yer,ilk,kisa)=>{
          img.style.translate='';img.style.zIndex='';
          if(kisa){cikarLokma();return;}
          const aralik=tut.getBoundingClientRect().width*.16;
          kaydir(Math.max(0,Math.min(d.dizilen-1,i+Math.round((yer.x-ilk.x)/aralik))));
        },
        iptal:()=>{img.style.translate='';img.style.zIndex='';},klavye:cikarLokma,
      });
      cikar.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const hedef=i+(e.key==='ArrowRight'?1:-1);kaydir(hedef);govde.querySelectorAll<HTMLButtonElement>('.sk-lokma-cikar')[hedef]?.focus();}};
      img.after(cikar);
    }
    if(d.dizilen){
      ileri('Izgaraya git',()=>git('izgara'));
      govde.append(tus('Son malzemeyi çıkar','tekrar',()=>{
        d.lokmalar.pop();d.dizilen=d.lokmalar.length;pisirmeyiSifirla();yaz(d);ciz();
      },'sk-duzelt'));
    }
    if(d.dizilen===4)return;
    const yuva=h('span.sk-siradaki',{'aria-hidden':'true'});
    yuva.style.left=yuzde(YERLER[d.dizilen]);tut.append(yuva);
    const raf=h('div.sk-sebzeler',{role:'group','aria-label':'Izgara malzemeleri'});
    const ids=(Object.keys(MALZEME) as Malzeme[]);
    for(const id of ids){
      const b=dugme(MALZEME[id]+' geçir','sk-sebze',resim(id+'-taze'));
      b.dataset.malzeme=id;
      tasi(b,tut,()=>{
        d.lokmalar.push(id);d.dizilen=d.lokmalar.length;pisirmeyiSifirla();yaz(d);
        cal(()=>efekt.nota(d.dizilen));ciz();
        const son = govde.querySelectorAll('.sk-dilim')[d.dizilen-1];
        son?.animate([{translate:'7cqw 0',opacity:.4},{translate:'0',opacity:1}],{duration:zaman(300),easing:'ease-out'});
      });
      raf.append(b);
    }
    govde.append(raf);
  }
  function izgara(){
    const mangal=h('div.sk-mangal-hedef',{'aria-hidden':'true'});
    const servisYeri=h('div.sk-sogut',{'aria-label':'Sıcak şişin dinlenme tabağı'},resim('sogutma'));
    const b=dugme(d.ateste?'Şişi çevir':'Şişi ızgaraya taşı','sk-mangal-sis',ciziliSis(d,'taze'));
    b.dataset.ateste=String(d.ateste);govde.append(mangal);
    if(!d.ateste){
      govde.append(h('span.sk-al-ver',{},resim('servis-masasi')),b);
      tasi(b,mangal,()=>{d.ateste=true;yaz(d);cal(()=>karistirmaSesi(true));ciz();});
      return;
    }
    const isaret=h('span.sk-sicaklik',{},resim('izgara-alev'));
    const donus=h('span.sk-cevir-ok',{},ikon('tekrar'));
    const masa=dugme('Maşayla şişi tabağa al','sk-masa',resim('sis-cek'),resim('eldiven','sk-masa-eldiven'));
    govde.append(b,isaret,servisYeri,masa);
    let once='';
    izgaraGoster=()=>{
      const k=izgaraKivami(d.isinma[d.alt]),imza=d.alt+'-'+k;
      if(imza===once)return;once=imza;
      const cubuk=ciziliSis(d,k==='az'?'taze':'pismis');b.replaceChildren(cubuk,donus);
      cubuk.style.filter=kavurmaRengi(k);
      b.dataset.yuz=String(d.alt);b.dataset.kivam=k;
      isaret.replaceChildren(resim(k==='tam'?'izgara-hazir':'izgara-alev'));isaret.dataset.kivam=k;
      if(k==='tam')cal(efekt.tink);
      if(k==='kavruk'||k==='yanik')b.append(h('span.sk-buhar.sk-duman',{},h('i'),h('i'),h('i')));
    };
    const al=()=>{if(!d.cevrildi)return;cal(efekt.yapis);git('sos');};
    const cevir=()=>{
      ateşZamani();d.alt=d.alt===0?1:0;d.cevrildi=true;masa.disabled=false;yaz(d);cal(()=>karistirmaSesi(true));izgaraGoster?.();
      b.firstElementChild?.animate([{scale:'1 1'},{scale:'1 .23'},{scale:'1 1'}],{duration:zaman(190)});
    };
    jest(b,{birak:(yer,ilk,tik)=>{if(d.cevrildi&&icinde(servisYeri,yer,8))al();else if(tik||Math.abs(yer.y-ilk.y)>b.clientHeight*.24)cevir();},klavye:cevir});
    masa.disabled=!d.cevrildi;tasi(masa,b,al);izgaraGoster();saatKur();
  }
  function sos(){
    const altlik=resim('servis-masasi','sk-sos-altlik');govde.append(altlik);
    const b=dugme('Sosu şişin üzerine sür','sk-sos-sis',ciziliSis(d,'pismis'));
    govde.append(b);
    const raf=h('div.sk-soslar',{'aria-label':'Sos seçimi'});
    for(const id of Object.keys(SOS) as Sos[]){
      const s=dugme(SOS[id].ad+' sosunu seç','sk-sos-kabi',resim('sos-'+id));
      if(id==='domates' && d.sos===id)s.append(resim('sos-kasik','sk-sos-kasik'));
      s.dataset.sos=id;s.setAttribute('aria-pressed',String(d.sos===id));
      tikla(s,()=>{if(d.sos!==id){d.sos=id;d.kaplama=0;yaz(d);cal(efekt.secim);ciz();}});raf.append(s);
    }
    govde.append(raf);
    if(ikiYuz(d).includes('az')){
      const tekrar=dugme('Az pişen yüzü tekrar ızgaraya koy','sk-dugme sk-yeniden-izgara',resim('izgara-alev'));
      tikla(tekrar,()=>{d.alt=d.isinma[0]<=d.isinma[1]?0:1;git('izgara');});
      govde.append(tekrar);
    }
    if(!d.sos){b.disabled=true;return;}
    if(d.kaplama===sosMaskesi(d.dizilen)){ileri('Servis tabağı seç',()=>git('servis'));return;}
    const fircalar: Record<Sos,string> = {yogurt:'firca',domates:'sos-kirmizi-firca',feslegen:'sos-rehber'};
    const firca=resim(fircalar[d.sos],'sk-firca');b.append(firca);
    const cizgiler=h('span.sk-sos-noktalar');
    for(let i=0;i<d.dizilen;i++){
      const n=h('i',{'data-dolu':String(Boolean(d.kaplama&(1<<i)))});
      n.style.left=yuzde(YERLER[i]);cizgiler.append(n);
    }
    b.append(cizgiler);
    function boya(i:number) {
      if(i<0||i>=d.dizilen||(d.kaplama&(1<<i)))return;
      d.kaplama|=1<<i;yaz(d);cal(()=>efekt.nota(i+1));
      b.querySelector('.sk-cubuklu')?.replaceWith(ciziliSis(d,'pismis'));
      const n=cizgiler.children[i] as HTMLElement;n.dataset.dolu='true';
      if(d.kaplama===sosMaskesi(d.dizilen))ciz();
    }
    let sonX: number | undefined;
    function dokun(yer: Nokta) {
      const r = b.getBoundingClientRect();
      const x = (yer.x-r.left)*100/r.width;
      const y = (yer.y-r.top)*100/r.height;
      if (y < 0 || y > 100 || x < 10 || x > 84) { sonX=undefined; return; }
      firca.style.left=yuzde(x);
      firca.style.top=yuzde(y);
      for (let i=0; i<d.dizilen; i++) {
        const min=Math.min(sonX??x,x), max=Math.max(sonX??x,x);
        if (YERLER[i]+7 >= min && YERLER[i]-7 <= max) boya(i);
      }
      sonX=x;
    }
    jest(b, {
      basla:yer=>{sonX=undefined;dokun(yer);}, tasi:dokun,
      birak:yer=>{dokun(yer);sonX=undefined;}, iptal:()=>{sonX=undefined;},
      klavye:()=>boya(YERLER.findIndex((_v,i)=>!(d.kaplama&(1<<i)))),
    });
  }
  function servis(){
    const tepsi=resim(d.tabak??'tabak','sk-son-tabak');
    const pecete=resim('peçete','sk-pecete');
    const yemek=dugme('Renkli şişi servis et','sk-son-sis',ciziliSis(d,'pismis'));
    govde.append(pecete,tepsi,yemek);
    if(d.durak==='son'){
      yemek.disabled=true;
      const puan=yildizlar(toplamPuan(d));puan.classList.add('sk-odul');govde.append(puan);
      ileri('Yeni sipariş seç',kapat);return;
    }
    const raf=h('div.sk-tabaklar',{'aria-label':'Servis tabakları'});
    for(const id of Object.keys(TABAK) as Tabak[]){
      const t=dugme(TABAK[id]+' tabak seç','sk-tabak-sec',resim(id));
      t.setAttribute('aria-pressed',String(id===d.tabak));t.dataset.tabak=id;
      tikla(t,()=>{d.tabak=id;yaz(d);cal(efekt.tink);ciz();});raf.append(t);
    }
    govde.append(raf);
    const degistir=dugme('Şişteki malzemeleri düzenle','sk-dugme sk-duzelt',ikon('tekrar'));
    tikla(degistir,()=>git('diz'));
    const sosuDegistir=dugme('Sosu değiştir','sk-dugme sk-sos-duzelt',resim('sos-'+d.sos));
    tikla(sosuDegistir,()=>git('sos'));
    govde.append(degistir,sosuDegistir);
    yemek.disabled=!d.tabak;
    async function ver(){
      if(mesgul||d.durak!=='servis')return;
      mesgul=true;
      try{
        const kayit=await albumResmi(d);
        if(kapandi)return;
        const yuzler=ikiYuz(d),puan=toplamPuan(d);ayar.teslim(kayit,puan,uyumPuani(d),izgaraPuani(yuzler),undefined,{tarifId:'sis',yuzler,tur:d.tur,tabak:d.tabak,lokmalar:[...d.lokmalar],sos:d.sos!});d.servis++;d.durak='son';cal(puan===3?efekt.dogru:efekt.tink);kapat();
      }catch{duyuru.textContent='Servis tabağı hazırlanıyor.';}
      finally{mesgul=false;}
    }
    if(d.tabak){tikla(yemek,()=>void ver());ileri('Siparişi sun',()=>void ver());}
  }
  function ciz(){
    clearTimeout(timer);
    const eskiOdak=document.activeElement;
    const klavyeOdak=eskiOdak instanceof HTMLButtonElement&&eskiOdak.matches(':focus-visible');
    const oncekiAd=klavyeOdak?eskiOdak.ariaLabel:null;
    alan.dataset.sisAsama=d.durak;
    const fon = d.durak==='islat'||d.durak==='diz'?'tezgah':d.durak==='izgara'?'izgara':'servis';
    if(dekor.getAttribute('src')!==adres(fon))dekor.src=adres(fon);
    govde.replaceChildren(); ustCiz();
    switch(d.durak){case 'islat':islat();break;case 'diz':diz();break;case 'izgara':izgara();break;case 'sos':sos();break;default:servis();}
    if(klavyeOdak){
      const ayni=oncekiAd?alan.querySelector<HTMLButtonElement>(`button:not(:disabled)[aria-label="${CSS.escape(oncekiAd)}"]`):null;
      (ayni??govde.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus({preventScroll:true});
    }
  }
  ciz();konus(rehber());
}
