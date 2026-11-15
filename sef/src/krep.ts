import type { AtolyeAyar } from './yemekler';
import { atolyeKaydi } from './atolye-kaydi';
import { h } from '../../src/ui/dom';
import { arkaPlanDinle, geriDinle } from '../../src/kabuk/yon';
import { efekt } from '../../src/audio/efekt';
import { sus } from '../../src/audio/konusma';
import { dugme, ikon, type Simge } from './gorsel';
import { icinde, jest, merkez, zaman, type Nokta } from './hareket';
import { yildizlar } from './salata-sosu';
import { misafirCumlesi } from './misafir';
import { krepIstekleri as ISTEKLER, krepDilimEslesmeleri, servisKompozisyonu } from './krep-fisi';
import './krep.css';

const kaynaklar = import.meta.glob<string>('../../assets/sef/krep/*.webp', { eager: true, query: '?url', import: 'default' });
export function krepResmi(ad: string) {
  return kaynaklar['../../assets/sef/krep/' + ad.replace(/^krep\//, '') + '.webp'];
}

const MEYVELER = [
  ['cilek', 'Çilek', 'cilekli'], ['muz', 'Muz', 'muzlu'], ['yabanmersini', 'Yaban mersini', 'mersinli'],
  ['kivi', 'Kivi', 'kivili'], ['seftali', 'Şeftali', 'seftalili'], ['frambuaz', 'Ahududu', 'frambuazli'],
  ['armut', 'Armut', 'armutlu'], ['kiraz', 'Kiraz', 'kirazli'], ['mandalina', 'Mandalina', 'mandalinali'],
] as const;
type Meyve = typeof MEYVELER[number][0];
const HAM_MALZEMELER = [['un','Un ölçeği','un-olcek'],['sut','Süt','sut-sise'],['yumurta','Yumurta','yumurta']] as const;
type HamMalzeme = typeof HAM_MALZEMELER[number][0];
const ADIMLAR = ['karisim','dok', 'yay', 'cevir', 'meyve', 'katla', 'servis', 'son'] as const;
type Adim = typeof ADIMLAR[number];
const CUMLE: Record<Adim, string> = {
  karisim: 'Unu, sütü ve yumurtayı kâseye koy. Çırpıcıyı çevir.',
  dok: 'Sürahiyi tavaya götür ve krep hamurunu dök.',
  yay: 'Tavayı tut. Hamuru üç yana yay.',
  cevir: 'Spatulayı krebin altına kaydır, yukarı kaldır ve çevir.',
  meyve: 'Hangi meyveyi seversin? Üç parça alıp krebin üzerine yerleştir.',
  katla: 'Yemeğin hazır!',
  servis: 'Krep hazır! Tabağı servis ziline götür.',
  son: 'Afiyet olsun!',
};
const ANAHTAR = 'minkino-sef-krep-v1';
interface MeyveParcasi extends Nokta { meyve: Meyve }
const DERECELER=['erken','iyi','fazla','yanik'] as const;
type Derece=typeof DERECELER[number];
const derece=(ms:number):Derece=>ms<4200?'erken':ms<14500?'iyi':ms<22000?'fazla':'yanik';
const poz=(resim:string,d:Derece)=>d==='iyi'?resim:resim+'-'+d;
const puan=(d:Derece)=>d==='yanik'?1:d==='iyi'?3:2;
const sonDerece=(d:Durum):Derece=>puan(d.ilkYuz)<puan(d.sonYuz)?d.ilkYuz:d.sonYuz;
interface Durum {
  istek?:number;
  sunum?: 'acik'|'yarim';
  isiMs:number; ikinci:boolean; ilkYuz:Derece; sonYuz:Derece; spatulada?:boolean;
  adim: Adim; aktif: boolean; servis: number; yon: number; kat: number;
  meyve?: Meyve; parcalar: MeyveParcasi[]; icerik: HamMalzeme[]; cirpma: number;
}
const yeni = (servis = 0,masa=''): Durum => ({ adim: 'karisim', istek:masa?0:servis%ISTEKLER.length, isiMs:0, ikinci:false, ilkYuz:'iyi', sonYuz:'iyi', icerik: [], cirpma: 0, aktif: true, servis, yon: 0, kat: 0, parcalar: [] });
const kayit = atolyeKaydi<Durum>(ANAHTAR);
const tam = (n: unknown, son: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(son, Math.floor(n))) : 0;
function oku(masa = ''): Durum | undefined {
  try {
    const raw = kayit.oku(masa) as Partial<Durum> | null;
    if (!raw || !ADIMLAR.includes(raw.adim as Adim)) return undefined;
    const d = yeni(tam(raw.servis, Number.MAX_SAFE_INTEGER));
    // Önceki sürümün serbest meyveli siparişi, aynı kuralla bitirilebilir.
    d.istek=typeof raw.istek==='number'&&Number.isInteger(raw.istek)&&ISTEKLER[raw.istek]?raw.istek:undefined;
    d.adim = raw.adim!; d.aktif = raw.aktif === true; d.yon = tam(raw.yon, 3); d.kat = tam(raw.kat, 2);
    d.isiMs=tam(raw.isiMs,45000);d.ikinci=raw.ikinci===true;
    if(d.adim==='cevir'&&!d.ikinci&&raw.spatulada)d.spatulada=true;
    d.ilkYuz=DERECELER.includes(raw.ilkYuz as Derece)?raw.ilkYuz!:'iyi';d.sonYuz=DERECELER.includes(raw.sonYuz as Derece)?raw.sonYuz!:'iyi';
    d.icerik = Array.isArray(raw.icerik) ? [...new Set(raw.icerik.filter(id=>HAM_MALZEMELER.some(m=>m[0]===id)))] : [];
    d.cirpma = tam(raw.cirpma,2);
    if(d.adim==='karisim' && d.cirpma===2 && d.icerik.length===3) d.adim='dok';
    d.meyve = MEYVELER.find(m => m[0] === raw.meyve)?.[0];
    if(raw.sunum==='acik'||raw.sunum==='yarim')d.sunum=raw.sunum;
    if (d.meyve && Array.isArray(raw.parcalar)) d.parcalar = raw.parcalar.filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, 3).map(p => ({ ...kenaraAl(p), meyve: MEYVELER.find(m => m[0] === p.meyve)?.[0] || d.meyve! }));
    if (ADIMLAR.indexOf(d.adim) >= ADIMLAR.indexOf('katla') && d.parcalar.length < 3) d.adim = 'meyve';
    return d;
  } catch { return undefined; }
}

export const krepDevamEdiyor = (masa = '') => oku(masa)?.aktif === true;
export function krepDurumu(masa = '') { const d = oku(masa); return { suruyor: !!d && d.adim !== 'son', servis: d?.servis || 0 }; }
function kenaraAl(p: Nokta): Nokta {
  const x = p.x - 50, y = p.y - 50, katsayi = Math.min(1, 31 / Math.max(1, Math.hypot(x, y)));
  return { x: 50 + x * katsayi, y: 50 + y * katsayi };
}
const bosYerde = (p: Nokta, merkezler: readonly Nokta[], enAz: number) => merkezler.every(m => Math.hypot(p.x-m.x,p.y-m.y)>=enAz);
const img = (ad: string, sinif = '') => h('img', { class: sinif, src: krepResmi(ad), alt: '', draggable: 'false' });
const renkli = (etiket: string, sinif: string, simge: Simge) => dugme(etiket, sinif, ikon(simge));
const DOLGU: Nokta[] = [{x: 35, y: 45}, {x: 61, y: 40}, {x: 52, y: 62}];
const YONLER = [{x: -1,y: 0}, {x: 0,y: -1}, {x: 1,y: 0}];
function karisikTabak(parcalar: readonly MeyveParcasi[],kizarma:Derece,sunum?:Durum['sunum']) {
  const resim = h('span.kr-karisik-tabak');
  for(const k of servisKompozisyonu(parcalar,kizarma,sunum)) {
    const parca = img(k.id);
    Object.assign(parca.style,{left:k.x*100+'%',top:k.y*100+'%',width:k.boy*100+'%',height:k.boy*100+'%',rotate:k.don+'deg'});
    resim.append(parca);
  }
  return resim;
}
async function tabakFotografi(parcalar: readonly MeyveParcasi[],kizarma:Derece,sunum?:Durum['sunum']) {
  const tuval = document.createElement('canvas');
  const cap=390;
  tuval.width=tuval.height=cap;
  const c=tuval.getContext('2d');
  if(!c) throw new Error('Krep fotoğrafı oluşturulamadı');
  const katmanlar=servisKompozisyonu(parcalar,kizarma,sunum);
  const resimler=await Promise.all(katmanlar.map(async k=>{
    const image=new Image();image.src=krepResmi(k.id);await image.decode();return image;
  }));
  katmanlar.forEach((k,i)=>{
    const image=resimler[i], oran=k.boy*cap/Math.max(image.naturalWidth,image.naturalHeight);
    const en=image.naturalWidth*oran, boy=image.naturalHeight*oran;
    c.save(); c.translate(k.x*cap,k.y*cap); c.rotate(k.don*Math.PI/180);c.drawImage(image,-en/2,-boy/2,en,boy);c.restore();
  });
  return tuval.toDataURL('image/webp',.93);
}


export function krepAc(kok: HTMLElement, ayar: AtolyeAyar) {
  if (kok.querySelector('.krep-oyunu')) return;
  const masaId = ayar.masa ?? '';
  const yaz = (durum: Durum) => kayit.yaz(masaId, durum);
  const eski = oku(masaId);
  const devam = eski && (eski.adim !== 'son' || eski.aktif);
  const d = devam ? eski : yeni(eski?.servis ?? ayar.oncekiServis,masaId);
  const tekrar=ayar.tekrarTercihi;
  if(!devam&&tekrar?.tarifId==='krep'&&Number.isInteger(tekrar.tur)&&ISTEKLER[tekrar.tur])d.istek=tekrar.tur;
  const istek=d.istek===undefined?undefined:ISTEKLER[d.istek];
  const sakli = Array.from(kok.children).filter((el): el is HTMLElement => el instanceof HTMLElement).map(el => ({ el, hidden: el.hidden, inert: el.inert }));
  sakli.forEach(({el}) => { el.hidden = true; el.inert = true; });
  d.aktif = true; yaz(d);
  const alan = h('section.krep-oyunu', {'aria-label':'Meyveli Krep'});
  const fon = img('tezgah', 'kr-fon');
  const govde = h('div.kr-govde');
  const ust = h('header.ust.kr-ust');
  const duyu = h('span.yalniz-okuyucu', { 'aria-live':'polite' });
  alan.append(fon, govde, ust, duyu); kok.append(alan);
  let kapali = false, mesgul = false, secili = false;
  let isiSaati:ReturnType<typeof setInterval>|undefined;
  let sonAn:number|undefined, sonKayit=0, arkada=false;
  let isiGoster:(()=>void)|undefined;
  function zamanAl() {
    const simdi=performance.now();
    if(sonAn!==undefined) d.isiMs=Math.min(45000,d.isiMs+Math.max(0,simdi-sonAn));
    sonAn=simdi;
  }
  function ocagiDurdur() {
    if(sonAn!==undefined)zamanAl();
    clearInterval(isiSaati);isiSaati=undefined;sonAn=undefined;isiGoster=undefined;
  }
  function termometre(){
    if(arkada||document.hidden||!isiGoster)return;
    zamanAl();isiGoster();
    if(Math.abs(d.isiMs-sonKayit)>600){sonKayit=d.isiMs;yaz(d);}
  }
  function ocagiBaslat(goster:()=>void){
    ocagiDurdur();isiGoster=goster;
    sonAn=arkada||document.hidden?undefined:performance.now();sonKayit=d.isiMs;
    isiSaati=setInterval(termometre,110);
  }
  function duraklama(){
    if(!isiGoster)return;
    if(arkada||document.hidden){if(sonAn!==undefined)zamanAl();sonAn=undefined;yaz(d);}
    else if(sonAn===undefined)sonAn=performance.now();
  }
  const arkaBirak=arkaPlanDinle(v=>{arkada=v;duraklama();});
  const gorunurluk=()=>duraklama();
  const sayfaKapanis=()=>{if(isiGoster){if(sonAn!==undefined)zamanAl();sonAn=undefined;yaz(d);}};
  const sayfaDonus=()=>duraklama();
  document.addEventListener('visibilitychange',gorunurluk);
  window.addEventListener('pagehide',sayfaKapanis);window.addEventListener('pageshow',sayfaDonus);

  let zamanlayicilar: ReturnType<typeof setTimeout>[] = [];
  const sil = () => { zamanlayicilar.forEach(clearTimeout); zamanlayicilar = []; };
  const sonra = (ms: number, f: () => void) => { zamanlayicilar.push(setTimeout(() => { if (!kapali) f(); }, zaman(ms))); };
  const ses = (f: () => void) => { if (!document.hidden && ayar.sesli()) f(); };
  const konus = () => {
    const meyveFis=d.adim==='meyve'&&istek;
    const not=meyveFis?meyveFis.cumle:d.adim==='cevir'&&d.ikinci?'İkinci yüzü de pişir. Hazır olduğunda spatulayla tabağa al.':CUMLE[d.adim];
    duyu.textContent=not;
    if(document.hidden||!ayar.sesli())return;
    if(meyveFis)void misafirCumlesi('salata',not);else ayar.soyle(not);
  };
  function kapat() {
    if (kapali) return;
    ocagiDurdur();arkaBirak();document.removeEventListener('visibilitychange',gorunurluk);window.removeEventListener('pagehide',sayfaKapanis);window.removeEventListener('pageshow',sayfaDonus);
    kapali = true; sil(); sus(); d.aktif = false; yaz(d);
    geriBirak(); document.removeEventListener('keydown', tus); alan.remove();
    sakli.forEach(s => { s.el.hidden = s.hidden; s.el.inert = s.inert; }); ayar.cikis();
  }
  const geriBirak = geriDinle(() => { kapat(); return true; });
  const tus = (e: KeyboardEvent) => { if(e.key === 'Escape' && !e.repeat) { e.preventDefault(); kapat(); } };
  document.addEventListener('keydown', tus);
  function gec(adim: Adim) { sil(); mesgul = false; secili = false; d.adim = adim; yaz(d); ciz(); konus(); }
  function bas(btn: HTMLButtonElement, is: () => void) { jest(btn, { birak: (yer,_ilk,tik) => {if (tik && icinde(btn, yer, 8)) is();}, klavye: is }); }
  function denetim() {
    const geri = renkli('Siparişlere dön', 'dugme kr-geri', 'geri');
    const sesDugmesi = renkli(ayar.sesli() ? 'Sesi kapat' : 'Sesi aç', 'dugme kr-ses', ayar.sesli() ? 'hoparlor' : 'sessiz');
    bas(geri, kapat); bas(sesDugmesi, () => { ayar.sesDegistir(); denetim(); });
    const fis = dugme('Tarifi dinle', 'kr-fis');
    const bolum = d.adim === 'karisim' ? 0 : d.adim === 'dok' || d.adim === 'yay' ? 1 : d.adim === 'cevir' ? 2 : d.adim === 'meyve' || d.adim === 'katla' ? 3 : 4;
    const secim = d.meyve || 'meyve-sepeti';
    if(istek&&['meyve','katla','servis','son'].includes(d.adim)){
      const eslesen=krepDilimEslesmeleri(istek.meyveler,d.parcalar.map(p=>p.meyve));
      fis.classList.add('kr-meyve-fisi');
      fis.setAttribute('aria-label',istek.cumle);
      for(const [i,id] of istek.meyveler.entries())fis.append(h('span.kr-istek-dilimi',{'data-tamam':String(eslesen[i])},img(id),...(eslesen[i]?[ikon('onay')]:[])));
      bas(fis,()=>{duyu.textContent=istek.cumle;ses(()=>void misafirCumlesi('salata',istek.cumle));});
      ust.replaceChildren(geri,fis,sesDugmesi);return;
    }
    ['kavanoz-fis','krep-adim-tava', 'cevir-el', secim, 'krep-adim-tabak'].forEach((id,i) => { const isaret = h('span', {class: i === bolum ? 'simdi' : i < bolum ? 'bitti' : ''},img(id)); fis.append(isaret); });
    bas(fis, konus); ust.replaceChildren(geri, fis, sesDugmesi);
  }
  function tezgah(kap: 'tava' | 'tabak') {
    const temel = h('div.kr-tezgah', {'data-kap': kap});
    if (kap === 'tava') temel.append(img('firin-gozu','kr-ocak'), img('tava','kr-tava'));
    else temel.append(img('pecete','kr-pecete'), img('tabak','kr-tabak'));
    const yuz = h('div.kr-yuz'); temel.append(yuz); govde.append(temel);
    return {temel,yuz};
  }
  function hamur(yuz: HTMLElement, id: string, sinif = '') {
    const nesne = img(id, 'kr-hamur ' + sinif); yuz.append(nesne); return nesne;
  }
  function hedef(yuz: HTMLElement, ad: string, is: () => void) {
    const hedef = dugme(ad, 'kr-hedef'); hedef.dataset.krepHedef = '';
    bas(hedef, () => { if (!mesgul) is(); }); yuz.append(hedef); return hedef;
  }
  function arac(ad: string, varlik: string) {
    const kulp = dugme(ad, 'kr-arac', img(varlik)); kulp.dataset.krepArac = varlik;
    const alt = h('div.kr-araclik',{},kulp); govde.append(alt); return kulp;
  }
  function izi(hedef: HTMLElement, ad: Simge, sinif='') {
    const isaret = h('span.kr-iz', {class:'kr-iz '+sinif},ikon(ad)); hedef.append(isaret);
    return isaret;
  }
  function surukle(b: HTMLButtonElement, hedef: HTMLElement, basar: (p?: Nokta) => void, sec: () => void) {
    let ort: Nokta | undefined;
    const temiz = () => { b.classList.remove('elde'); b.style.transform = ''; hedef.classList.remove('kr-yakin'); ort=undefined; };
    jest(b, {
      basla: () => { ort = merkez(b); },
      tasi: (p,ilk) => { if(mesgul || !ort || Math.hypot(p.x-ilk.x,p.y-ilk.y)<6) return; b.classList.add('elde'); b.style.transform='translate('+(p.x-ilk.x)+'px,'+(p.y-ilk.y)+'px)'; hedef.classList.toggle('kr-yakin',icinde(hedef,p,8)); },
      birak: (p,_ilk,tik) => { temiz(); if(mesgul) return; if(tik) sec(); else if(icinde(hedef,p,8)) basar(p); },
      iptal:temiz, klavye: () => {if(!mesgul)sec();},
    });
  }
  function secim(b: HTMLButtonElement, yuva: HTMLElement) {
    secili = true; b.classList.add('kr-secili'); yuva.classList.add('kr-secili-hedef'); ses(efekt.secim);
  }
  function karistir() {
    const temel=h('div.kr-tezgah.kr-karisim', {}, img('karisim-kasesi','kr-tabak'));
    const yuz=h('div.kr-yuz'); temel.append(yuz); govde.append(temel);
    const hazir = d.icerik.length===3;
    if(d.cirpma>0) {
      hamur(yuz,'karisim-once');
    } else {
      d.icerik.forEach(id=>yuz.append(img(id+'-kasede','kr-ham-icerik kr-icerik-'+id)));
    }
    if(hazir) {
      const firca=img('cirpici','kr-cirpici-elde');
      yuz.append(firca);
      const cember=dugme('Hamuru çırp','kr-cirp',ikon('karistir')); cember.dataset.krepCirp=''; yuz.append(cember);
      let aci: number | undefined;
      let toplam=0;
      const aciAl=(p:Nokta)=>{const m=merkez(yuz);return Math.atan2(p.y-m.y,p.x-m.x);};
      const dinlendir=()=>{firca.style.transform='';aci=undefined;toplam=0;};
      function tur() {
        if(mesgul || d.cirpma>=2) return;
        d.cirpma++; yaz(d); ses(efekt.ovala);
        yuz.querySelectorAll('.kr-ham-icerik,.kr-hamur').forEach(n=>n.remove());
        const yemek=hamur(yuz,d.cirpma===1?'karisim-once':'karisim-son'); yemek.classList.add('kr-girdap');
        firca.src=krepResmi('cirpici-hamurlu'); firca.classList.add('kr-vurus');
        if(d.cirpma===1)sonra(480,()=>{if(d.cirpma===1)firca.classList.remove('kr-vurus');});
        if(d.cirpma===2){mesgul=true;sonra(520,()=>gec('dok'));}
      }
      jest(cember,{
        basla:p=>{aci=aciAl(p);toplam=0;},
        tasi:p=>{
          if(mesgul)return;
          const an=aciAl(p);
          if(aci!==undefined){
            const fark=an-aci;
            toplam+=Math.atan2(Math.sin(fark),Math.cos(fark));
            if(Math.abs(toplam)>=Math.PI*1.8){tur();toplam=0;}
          }
          aci=an;firca.style.transform='translate('+Math.cos(an)*9+'%,'+Math.sin(an)*9+'%) rotate('+Math.sin(an)*14+'deg)';
        },
        birak:(_p,_ilk,tik)=>{const yeterli=Math.abs(toplam)>Math.PI*.8;dinlendir();if(tik||yeterli)tur();},iptal:dinlendir,klavye:tur,
      }); return;
    }
    let secimId: HamMalzeme | undefined;
    const yuva=hedef(yuz,'Malzemeyi kâseye koy',()=>{ if(secimId) ekle(secimId); else konus(); });
    izi(yuva,'asagi');
    const raf=h('div.kr-ham-raf');
    function ekle(id:HamMalzeme) {
      if(mesgul || d.icerik.includes(id)) return;
      mesgul=true; d.icerik.push(id); yaz(d);
      const res=id==='yumurta'?'yumurta-kirik':id==='sut'?'sut-sise':'un-olcek';
      const el=img(res,'kr-ham-ekleniyor'); yuz.append(el);
      const cikti=img(id+'-kasede','kr-ham-icerik kr-icerik-'+id); yuz.insertBefore(cikti,el);
      ses(id==='yumurta'?efekt.pof:id==='sut'?efekt.vicik:efekt.yapis);
      sonra(460,()=>{mesgul=false;ciz();});
    }
    for(const [id,ad,nesne] of HAM_MALZEMELER) {
      const b=dugme(ad,'kr-ham-malzeme',img(nesne)); b.dataset.krepIcerik=id;
      if(d.icerik.includes(id)) { b.disabled=true; b.classList.add('kr-eklendi'); b.append(ikon('onay')); }
      surukle(b,yuva,()=>ekle(id),()=>{secimId=id;raf.querySelectorAll('.kr-secili').forEach(el=>el.classList.remove('kr-secili'));secim(b,yuva);});
      raf.append(b);
    }
    govde.append(raf);
  }

  function dok() {
    const {yuz} = tezgah('tava');
    const surahi = arac('Hamur sürahisini tut', 'surahi');
    const yuva = hedef(yuz, 'Hamuru tavaya dök', () => { if(secili) doldur(); else { secim(surahi,yuva); konus(); } });
    izi(yuva,'asagi');
    function doldur() {
      if(mesgul) return; mesgul = true; yuva.hidden=true; surahi.style.visibility='hidden';
      const el = img('surahi-egik','kr-doken'); yuz.append(el);
      const akinti = hamur(yuz,'hamur-az','kr-dokulen'); ses(efekt.vicik);
      sonra(430,()=>{ el.src=krepResmi('surahi-son'); akinti.classList.add('kr-buyudu'); });
      sonra(860,()=>gec('yay'));
    }
    surukle(surahi,yuva,doldur,()=>secim(surahi,yuva));
  }
  function yay() {
    const {temel,yuz} = tezgah('tava');
    const krep=hamur(yuz,d.yon ? 'hamur-yayilan' : 'hamur-az','kr-yay-'+d.yon);
    const kol = dugme('Tavayı eğ', 'kr-tava-tut'); kol.dataset.krepYay=''; temel.append(kol);
    const yon = YONLER[Math.min(d.yon,2)];
    const rozet = renkli(['Sola eğ','Yukarı eğ','Sağa eğ'][Math.min(d.yon,2)],'kr-yon','ileri');
    rozet.prepend(img('bez','kr-yon-bez')); rozet.dataset.krepYon=String(d.yon); rozet.style.setProperty('--aci',d.yon===0?'180deg':d.yon===1?'-90deg':'0deg');
    govde.append(rozet);
    function eg() {
      if(mesgul) return; mesgul=true; ses(efekt.dalga);
      temel.style.setProperty('--egim', (yon.x || -0.35)*8+'deg'); temel.classList.add('kr-egiliyor');
      krep.className='kr-hamur kr-yay-'+(d.yon+1); krep.src=krepResmi(d.yon===2?'hamur-tam':'hamur-yayilan');
      sonra(350,()=>{ d.yon++; yaz(d); if(d.yon<3) { mesgul=false; ciz(); } else {
        krep.src=krepResmi('hamur-kabarcik'); ses(efekt.ovala);
        sonra(370,()=>{krep.src=krepResmi('hamur-kenar');}); sonra(850,()=>gec('cevir'));
      }});
    }
    bas(rozet,eg);
    jest(kol,{tasi:(p,ilk)=>{if(!mesgul)temel.style.rotate=Math.max(-7,Math.min(7,(p.x-ilk.x)/12))+'deg';},birak:(p,ilk,tik)=>{temel.style.rotate=''; if(tik || (p.x-ilk.x)*yon.x+(p.y-ilk.y)*yon.y>16)eg();},iptal:()=>{temel.style.rotate='';},klavye:eg});
  }
  function cevir() {
    const {yuz}=tezgah('tava');
    const taban=hamur(yuz,'hamur-kenar');
    const spatula=arac(d.ikinci?'Krebi spatulayla tabağa al':'Spatulayı tut','spatula');
    if(d.ikinci)spatula.dataset.krepAl='';
    const rehber=h('div.kr-kizarma',{'aria-label':'Krebin pişme rengi'});
    for(const n of DERECELER){ const numune=img(poz('krep-pismis',n));numune.dataset.seviye=n;rehber.append(numune); }
    govde.append(rehber);
    let gosterilen:Derece|undefined, kalkti=false;
    function goster(){
      const seviye=derece(d.isiMs);
      if(gosterilen===seviye)return;
      gosterilen=seviye;alan.dataset.krepIsisi=seviye;
      taban.src=krepResmi(poz(kalkti?'krep-kalkis':'krep-pismis',seviye));
      rehber.querySelectorAll('img').forEach(el=>el.classList.toggle('secili',el.dataset.seviye===seviye));
      if(seviye==='iyi')ses(efekt.tink);
    }
    goster();if(!d.spatulada)ocagiBaslat(goster);
    function al(){
      if(mesgul)return;
      ocagiDurdur();d.sonYuz=derece(d.isiMs); yaz(d);
      ses(efekt.pof);gec('meyve');
    }
    const yuva=hedef(yuz,d.ikinci?'Krebi tavadan tabağa al':'Spatulayı krebin altına sok',()=>{
      if(secili){if(d.ikinci)al();else kaldir();}else secim(spatula,yuva);
    });
    izi(yuva,d.ikinci?'ileri':'asagi');
    function kaldir() {
      if(mesgul) return; mesgul=true; secili=false; yuva.remove(); spatula.style.visibility='hidden';kalkti=true;
      ocagiDurdur();d.spatulada=true;yaz(d);alan.dataset.krepIsisi=derece(d.isiMs);
      const spat = img('spatula-yan','kr-spatula-altta'); yuz.append(spat);
      taban.src=krepResmi(poz('krep-kalkis',derece(d.isiMs))); taban.classList.add('kr-kalkis');
      const tut = dugme('Krebi yukarı çevir','kr-kaldir',ikon('asagi')); tut.dataset.krepAt=''; yuz.append(tut);
      const indir=dugme('Aynı yüzü biraz daha pişir','kr-geri-indir',img('spatula'),ikon('asagi'));govde.append(indir);
      bas(indir,()=>{if(atildi)return;delete d.spatulada;mesgul=false;yaz(d);ciz();});
      let atildi=false;
      function at(yukseklik=.47,yan=0) {
        if(atildi) return; atildi=true;
        const ilk=derece(d.isiMs);d.ilkYuz=ilk;d.ikinci=true;d.isiMs=0;delete d.spatulada;yaz(d);
        tut.remove();indir.remove();ses(efekt.ucus);
        taban.style.setProperty('--krep-ucus-y',-yukseklik*100+'%');
        taban.style.setProperty('--krep-ucus-x',yan*100+'%');
        spat.classList.add('kr-kaldirdi');taban.className='kr-hamur kr-ucus';taban.src=krepResmi(poz('krep-hava',ilk));
        sonra(150,()=>{taban.src=krepResmi(poz('krep-havayuksek',ilk));});
        sonra(340,()=>{taban.src=krepResmi(poz('krep-inis',ilk));});
        sonra(590,()=>{taban.className='kr-hamur';spat.remove();ses(efekt.pof);});
        sonra(800,()=>{mesgul=false;secili=false;ciz();konus();});
      }
      jest(tut,{birak:(p,ilk,tik)=>{
        if(tik){at();return;}
        const boy=yuz.clientHeight;
        if(ilk.y-p.y<Math.max(13,boy*.09))return;
        at(Math.max(.30,Math.min(.72,(ilk.y-p.y)/boy)),Math.max(-.15,Math.min(.15,(p.x-ilk.x)/yuz.clientWidth)));
      },klavye:()=>at()});
    }
    surukle(spatula,yuva,()=>{if(d.ikinci)al();else kaldir();},()=>secim(spatula,yuva));
    if(d.spatulada)kaldir();
  }
  function tekrarDoku(){
    const b=dugme('Taze hamurla yeniden pişir','kr-yeniden',img('surahi'),ikon('tekrar'));b.dataset.krepTekrar='';
    bas(b,()=>{d.yon=0;d.ikinci=false;d.ilkYuz='iyi';d.sonYuz='iyi';d.isiMs=0;d.kat=0;d.sunum=undefined;d.meyve=undefined;d.parcalar=[];gec('dok');});
    govde.append(b);
  }

  function tabakParcalari(yuz: HTMLElement) {
    if(!d.meyve) return;
    d.parcalar.forEach((p,i) => {
      const nesne=img(p.meyve,'kr-parca');
      nesne.style.left=p.x+'%'; nesne.style.top=p.y+'%'; nesne.style.setProperty('--don',(i-1)*12+'deg'); yuz.append(nesne);
    });
  }
  function meyve() {
    const {yuz}=tezgah('tabak'); hamur(yuz,poz('krep-pismis',sonDerece(d))); tabakParcalari(yuz);
    let secimId: Meyve | undefined = d.meyve;
    let degisecek:number|undefined;
    const liste = h('div.kr-meyvelik');
    function birak(p?: Nokta) {
      if(!secimId || mesgul || (d.parcalar.length>=3&&degisecek===undefined)) return;
      d.meyve=secimId;
      const i=degisecek??d.parcalar.length;
      if(degisecek!==undefined)d.parcalar[i]={...d.parcalar[i],meyve:secimId};
      else{
        const r=yuz.getBoundingClientRect();
        const ilkYer = p ? kenaraAl({x:(p.x-r.left)*100/r.width,y:(p.y-r.top)*100/r.height}) : DOLGU[i];
        const yer = bosYerde(ilkYer,d.parcalar,10) ? ilkYer : DOLGU.find(n=>bosYerde(n,d.parcalar,15)) || ilkYer;
        d.parcalar.push({ ...yer, meyve: secimId });
      }
      yaz(d); ses(efekt.yapis);
      ciz();
      const son=govde.querySelectorAll('.kr-parca')[i];
      son?.animate([{translate:'-50% -75%'},{translate:'-50% -45%'},{translate:'-50% -50%'}],zaman(220));
    }
    const yuva=hedef(yuz,'Meyveyi krep üzerine bırak',()=>birak());
    const rehber = DOLGU[d.parcalar.length];
    if(rehber) { const nokta=h('i.kr-nokta'); nokta.style.left=rehber.x+'%'; nokta.style.top=rehber.y+'%'; yuz.append(nokta); }
    if(d.parcalar.length===3){
      yuva.tabIndex=-1;
      for(const [i,parca] of d.parcalar.entries()){
        const ad=MEYVELER.find(m=>m[0]===parca.meyve)![1];
        const dokun=dugme(ad+' dilimini değiştir','kr-dilim-sec');
        dokun.dataset.dilim=String(i);dokun.style.left=parca.x+'%';dokun.style.top=parca.y+'%';
        dokun.setAttribute('aria-pressed','false');
        bas(dokun,()=>{
          degisecek=degisecek===i?undefined:i;
          for(const tus of yuz.querySelectorAll<HTMLButtonElement>('.kr-dilim-sec'))tus.setAttribute('aria-pressed',String(tus.dataset.dilim===String(degisecek)));
          for(const tus of liste.querySelectorAll('button'))tus.disabled=degisecek===undefined;
          if(degisecek!==undefined&&dokun.matches(':focus-visible'))liste.querySelector('button')?.focus({preventScroll:true});
          ses(efekt.secim);
        });
        yuz.append(dokun);
      }
    }
    for(const [id,ad] of MEYVELER) {
      const b=dugme(ad,'kr-meyve',img(id)); b.dataset.krepMeyve=id;
      b.disabled=d.parcalar.length===3;
      b.setAttribute('aria-pressed',String(id===secimId));
      if(d.meyve===id) b.classList.add('kr-secili');
      surukle(b,yuva,p=>{secimId=id;birak(p);},()=>{
        secimId=id;
        if(degisecek!==undefined){birak();return;}
        for(const tus of liste.querySelectorAll('button')){
          tus.setAttribute('aria-pressed',String(tus===b));tus.classList.toggle('kr-secili',tus===b);
        }
        secim(b,yuva);
      });
      liste.append(b);
    }
    const duzelt=renkli('Son meyve dilimini geri al','kr-dolgu-dugme','geri');
    duzelt.disabled=!d.parcalar.length;
    bas(duzelt,()=>{d.parcalar.pop();d.meyve=d.parcalar.at(-1)?.meyve;yaz(d);ses(efekt.secim);ciz();});
    const onay=renkli('Meyveleri onayla ve krebi katla','kr-dolgu-dugme kr-onay','onay');
    onay.disabled=d.parcalar.length!==3;
    bas(onay,()=>{if(d.parcalar.length===3)gec('katla');});
    govde.append(h('div.kr-meyve-rafi',{},liste),h('div.kr-dolgu-islemleri',{},duzelt,onay));
  }
  function katla() {
    const {yuz}=tezgah('tabak');
    const taban=hamur(yuz,poz(d.kat===0?'krep-pismis':'krep-yari',sonDerece(d)),d.kat===0?'':'kr-yarim');
    tabakParcalari(yuz); if(d.kat) yuz.classList.add('kr-ic-dolgu');
    const sunum=d.kat?'yarim':'acik';
    const tabagaAl=dugme(d.kat?'Yarım ay krebi tabağa al':'Açık meyveli krebi tabağa al','kr-tabaga-al',
      karisikTabak(d.parcalar,sonDerece(d),sunum),ikon('ileri'));
    tabagaAl.dataset.krepSunum=sunum;
    bas(tabagaAl,()=>{if(mesgul)return;d.sunum=sunum;ses(efekt.yapis);gec('servis');});
    govde.append(tabagaAl);
    const kat=dugme(d.kat ? 'Krebi bir daha katla' : 'Krebi ikiye katla','kr-kat',ikon('ileri'));
    kat.classList.toggle('ikinci',!!d.kat); kat.dataset.krepKat=String(d.kat); yuz.append(kat);
    function kapan() {
      if(mesgul) return; mesgul=true; kat.remove(); ses(efekt.sayfa);
      yuz.querySelectorAll('.kr-parca').forEach(el=>el.classList.add('kr-gizlen'));
      taban.src=krepResmi(poz(d.kat?'kat-iki':'kat-ilk',sonDerece(d))); taban.className='kr-hamur kr-katlanir';
      sonra(360,()=>{ d.kat++; yaz(d); taban.src=krepResmi(poz(d.kat===1?'krep-yari':'krep-katli',sonDerece(d))); });
      sonra(730,()=>{if(d.kat===2)gec('servis');else{mesgul=false;ciz();}});
    }
    jest(kat,{birak:(p,ilk,tik)=>{if(tik || (d.kat?ilk.x-p.x:p.y-ilk.y)>12)kapan();},klavye:kapan});
  }
  function servis(bitti: boolean) {
    const sonuc=MEYVELER.find(m=>m[0]===d.meyve)?.[2] || 'cilekli';
    govde.append(img('sunum-bezi','kr-sunum-bezi'));
    const karisik = new Set(d.parcalar.map(p=>p.meyve)).size > 1;
    const kizarma=sonDerece(d), ozelCizim=!!istek||!!d.sunum||karisik||kizarma!=='iyi';
    const tabak=dugme('Meyveli krep tabağını tut','kr-sunum',ozelCizim ? karisikTabak(d.parcalar,kizarma,d.sunum) : img(sonuc));tabak.dataset.krepPisme=kizarma;
    tabak.dataset.sunum=d.sunum??'katli';
    tabak.dataset.krepTabak=karisik ? 'karisik' : sonuc; govde.append(tabak);
    if(bitti) {
      tabak.disabled=true;const oy=yildizlar(krepPuani());oy.classList.add('kr-musteri-yildizi');govde.append(oy);
      const tamam=renkli('Siparişlere dön','kr-zil kr-tamam','onay');
      tamam.dataset.krepBitti=''; bas(tamam,kapat); govde.append(tamam); return;
    }
    const zil=dugme('Servis zilini çal','kr-zil kr-servis-zili',img('krep-adim-tabak')); zil.dataset.krepZil=''; govde.append(zil);
    async function sun() {
      if(mesgul || d.adim!=='servis') return;
      mesgul=true; let fotograf='krep/'+sonuc;
      if(ozelCizim) {
        try { fotograf=await tabakFotografi(d.parcalar,kizarma,d.sunum); }
        catch { mesgul=false; ses(efekt.hayir); return; }
      }
      if(kapali) return;
      const tercih=istek&&d.istek!==undefined?{tarifId:'krep' as const,tur:d.istek,meyveler:d.parcalar.map(p=>p.meyve),porsiyon:{kizarma,sunum:d.sunum,parcalar:d.parcalar.map(p=>({...p}))}}:undefined;
      d.servis++; d.adim='son'; yaz(d);
      ayar.teslim(fotograf,krepPuani(),meyvePuani(),puan(kizarma),undefined,tercih);
      ses(efekt.tink); kapat();
    }
    bas(zil,sun); surukle(tabak,zil,sun,()=>secim(tabak,zil));
  }
  function meyvePuani():1|2|3|undefined{
    if(!istek)return;
    const eslesen=krepDilimEslesmeleri(istek.meyveler,d.parcalar.map(p=>p.meyve)).filter(Boolean).length;
    return eslesen===3?3:eslesen===2?2:1;
  }
  function krepPuani():1|2|3{
    const pisme=puan(sonDerece(d));
    return Math.min(pisme,meyvePuani()??3) as 1|2|3;
  }
  function ciz() {
    govde.replaceChildren(); alan.dataset.krepAdim=d.adim;
    fon.src=krepResmi(d.adim==='karisim' ? 'hazirlik' : d.adim==='servis' || d.adim==='son' ? 'servis-penceresi' : d.adim==='meyve' || d.adim==='katla' ? 'meyve-tezgahi' : 'tezgah'); denetim();
    if(d.adim==='meyve'||d.adim==='katla'||d.adim==='servis')tekrarDoku();
    switch(d.adim) {
      case 'karisim': karistir(); break; case 'dok': dok(); break; case 'yay': yay(); break; case 'cevir': cevir(); break;
      case 'meyve': meyve(); break; case 'katla': katla(); break;
      case 'servis': servis(false); break; case 'son': servis(true); break;
    }
  }
  // Devam ettirilen hazırlıkta son meyve veya son katın animasyonu yarıda kapanmış olabilir.
  if(d.adim==='karisim' && d.cirpma===2) d.adim='dok';
  if(d.adim==='yay' && d.yon===3) d.adim='cevir';
  if(d.adim==='katla' && d.kat===2) d.adim='servis';
  yaz(d); ciz(); konus();
}
