import { atolyeKaydi } from './atolye-kaydi';
import { h } from '../../src/ui/dom';
import suzmeSesi from '../../assets/sef/mucver/kabak-sik.mp3?url';
import { konus, sus } from '../../src/audio/konusma';
import { efekt } from '../../src/audio/efekt';
import { baglam, efektCikisi } from '../../src/audio/motor';
import { geriDinle } from '../../src/kabuk/yon';
import { dugme, ikon, type Simge } from './gorsel';
import { hareket, icinde, jest, merkez, zaman, type Nokta } from './hareket';
import { karistirmaSesi } from './mutfak-ses';
import type { AtolyeAyar } from './yemekler';
import { yildizlar } from './salata-sosu';
import './mucver.css';
import {mucverIstegi} from './firin-izgara-fisi';
import {misafirCumlesi} from './misafir';

const dosyalar = import.meta.glob<string>('../../assets/sef/mucver/*.webp', { eager: true, query: '?url', import: 'default' });
const adres = (id: string) => dosyalar[`../../assets/sef/mucver/${id}.webp`];
const resim = (id: string, sinif = '') => h('img', { class: sinif, src: adres(id), alt: '', draggable: 'false' });
const ANAHTAR = 'minkino-sef-mucver-v1';
const GARNITUR = ['yogurt', 'dereotu', 'limon'] as const;
const GARNITUR_AD = { yogurt: 'Yoğurt', dereotu: 'Dereotu', limon: 'Limon' };
type Garnitur = typeof GARNITUR[number];
type Sebze = 'kabak' | 'havuc';
type Asama = 'rende' | 'harc' | 'harman' | 'tepsi' | 'firina' | 'pisiyor' | 'cikar' | 'servis' | 'susle' | 'son';
interface Tarif {
  aktif: boolean;
  servis: number;
  sebze: Sebze;
  kabak: number;
  havuc: number;
  harc: number;
  sikma: number;
  tur: number;
  kasikDolu: boolean;
  yerler: Nokta[];
  bitis: number;
  siparis?: number;
  kizarma: number;
  cikti: boolean;
  sunulan: number[];
  spatulada?: number;
  sus?: Garnitur;
  damga?: string;
}
const FIRIN_SURESI = 4400;
const yeni = (servis = 0): Tarif => ({
  aktif: true, servis, sebze: 'kabak', kabak: 0, havuc: 0, sikma: 0, harc: 0, tur: 0,
  kasikDolu: false, yerler: [], bitis: 0, kizarma:0, cikti: false, sunulan: [],
});
const sinir = (n: number, enAz: number, enCok: number) => Math.min(enCok, Math.max(enAz, n));
const say = (n: unknown, max: number) => typeof n === 'number' && Number.isFinite(n) ? sinir(Math.floor(n), 0, max) : 0;
const tepsiNoktasi = (yer: Nokta): Nokta => ({ x: sinir(yer.x, 19, 81), y: sinir(yer.y, 22, 71) });
const gecerli = (ham: unknown): ham is Nokta => {
  if (!ham || typeof ham !== 'object') return false;
  const n = ham as Partial<Nokta>;
  return Number.isFinite(n.x) && Number.isFinite(n.y);
};
const kayit = atolyeKaydi<Tarif>(ANAHTAR);
function oku(masa = ''): Tarif | undefined {
  try {
    const ham: unknown = kayit.oku(masa);
    if (!ham || typeof ham !== 'object') return undefined;
    const o = ham as Partial<Tarif>, p = yeni(say(o.servis, 999999));
    p.aktif = o.aktif === true;
    p.sebze = o.sebze === 'havuc' ? 'havuc' : 'kabak';
    p.kabak = say(o.kabak, 3); p.havuc = say(o.havuc, 3);
    if (p.kabak === 3 && p.havuc === 3) p.harc = say(o.harc, 6);
    p.sikma = o.sikma === undefined && p.harc > 0 ? 100 : say(o.sikma, 100);
    if (p.harc === 6) p.tur = say(o.tur, 3);
    if (p.tur === 3 && Array.isArray(o.yerler)) p.yerler = o.yerler.filter(gecerli).slice(0,3).map(tepsiNoktasi);
    p.kasikDolu = p.tur === 3 && p.yerler.length < 3 && o.kasikDolu === true;
    if (p.yerler.length === 3) p.bitis = Math.min(say(o.bitis, Number.MAX_SAFE_INTEGER), Date.now() + 4500);
    p.cikti = p.bitis > 0 && o.cikti === true;
    if(Number.isInteger(o.siparis)&&o.siparis!>=0&&o.siparis!<6)p.siparis=o.siparis;
    if(p.bitis)p.kizarma=say(o.kizarma,2);
    if (p.cikti && Array.isArray(o.sunulan)) p.sunulan = [...new Set(o.sunulan.filter(i => Number.isInteger(i) && i >= 0 && i < 3))];
    if (p.cikti && Number.isInteger(o.spatulada) && o.spatulada! >= 0 && o.spatulada! < 3 && !p.sunulan.includes(o.spatulada!)) p.spatulada = o.spatulada;
    if (p.sunulan.length === 3 && GARNITUR.includes(o.sus as Garnitur)) p.sus = o.sus;
    if (p.sus && typeof o.damga === 'string' && o.damga) p.damga = o.damga;
    return p;
  } catch { return undefined; }
}

function asama(p: Tarif): Asama {
  if (p.kabak < 3 || p.havuc < 3) return 'rende';
  if (p.harc < 6) return 'harc';
  if (p.tur < 3) return 'harman';
  if (p.yerler.length < 3) return 'tepsi';
  if (!p.bitis) return 'firina';
  if (!p.cikti) return p.bitis > Date.now() ? 'pisiyor' : 'cikar';
  if (p.sunulan.length < 3) return 'servis';
  return p.damga ? 'son' : 'susle';
}
export const mucverDevamEdiyor = (masa = '') => oku(masa)?.aktif === true;
export function mucverDurumu(masa = '') {
  const p = oku(masa);
  return { suruyor: !!p && asama(p) !== 'son', servis: p?.servis ?? 0 };
}

const hedefler: Nokta[] = [{ x: 27, y: 48 }, { x: 50, y: 45 }, { x: 73, y: 49 }];
const tabakYerleri: Nokta[] = [{ x: 34, y: 51 }, { x: 51, y: 34 }, { x: 68, y: 55 }];
const harcGorseli = ['', 'kase-kabak', 'kase-havuc', 'kase-havuc', 'kase-yumurta', 'kase-un', 'karisim-ilk'];
const turGorseli = ['karisim-ilk', 'karisim-orta', 'karisim-dalga', 'karisim-son'];
const eklenen = ['kabak-rende', 'havuc-rende', 'yumurta', 'yumurta-catlak', 'un', 'dereotu'];
const harcAd = ['Rendelenmiş kabağı ekle', 'Rendelenmiş havucu ekle', 'Yumurtayı çatlat', 'Yumurtayı kâseye kır', 'Unu ekle', 'Dereotunu ekle'];
const harcSes = ['Çıtır mücver için bezi sık. Sonra kabağı kâseye aktar.', 'Havucu da ekle.', 'Yumurtayı hafifçe çatlat.', 'Yumurtayı kâseye kır.', 'Bir ölçü un ekle.', 'Biraz dereotu ekle.'];
function bilgi(p: Tarif) {
  switch (asama(p)) {
    case 'rende': return p.sebze === 'kabak' ? 'Kabağı rende üzerinde aşağı yukarı kaydır.' : 'Havucu da rendeleyelim.';
    case 'harc': return harcSes[p.harc];
    case 'harman': return 'Sebzeleri kaşıkla karıştır.';
    case 'tepsi': return 'Kaşıkla harç al. Tepside boş bir yere bırak.';
    case 'firina': return 'Tepsiyi fırına sür.';
    case 'pisiyor': return 'Mücverler fırında pişiyor.';
    case 'cikar': return 'Eldiveni tak, tepsiyi dışarı al.';
    case 'servis': return 'Mücverleri spatulayla tabağa al.';
    case 'susle': return 'Mücverin yanına bir eşlikçi seç.';
    case 'son': return 'Afiyet olsun!';
  }
}
function yerlestir(el: HTMLElement, yer: Nokta) {
  el.style.left = yer.x + '%'; el.style.top = yer.y + '%';
}
function yuzde(el: Element, yer: Nokta): Nokta {
  const r = el.getBoundingClientRect();
  return { x: (yer.x-r.left)*100/r.width, y: (yer.y-r.top)*100/r.height };
}
function kase(ic?: string) {
  const el = h('span.mv-kase-cizim', {}, resim('kase', 'mv-kap'));
  if (ic) el.append(resim(ic,'mv-harc'), resim('kase', 'mv-kap mv-on'));
  return el;
}
type Pisiklik = 'cig' | 'isinan' | 'yari' | 'kizaran' | 'pismis';
const firinRenkleri=['mucver-pismis','mucver-citir','mucver-fazla'] as const;
function tepsi(p: Tarif, durum: Pisiklik, kap = 'tepsi', sec?: (i: number, el: HTMLButtonElement) => void,kizarma=p.kizarma) {
  const el = h('span.mv-tepsi-cizim', {}, resim(kap, 'mv-kap'));
  p.yerler.forEach((yer,i) => {
    if (p.sunulan.includes(i)) return;
    const nesne = resim(durum==='pismis'?firinRenkleri[kizarma]:'mucver-'+durum, 'mv-koftesi');
    if (!sec) { yerlestir(nesne, yer); el.append(nesne); return; }
    const b = dugme('Mücver ' + (i + 1) + ' al', 'mv-parca', nesne);
    b.dataset.parca = String(i);
    yerlestir(b, yer); el.append(b); sec(i,b);
  });
  return el;
}
function tabak(p: Tarif) {
  const el = h('span.mv-tabak-cizim', {}, resim('tabak','mv-kap'));
  p.sunulan.forEach((_i, sira) => {
    const k = resim(firinRenkleri[p.kizarma],'mv-tabak-mucver');
    yerlestir(k,tabakYerleri[sira]); el.append(k);
  });
  if (p.sus) el.append(resim(p.sus+'-sus','mv-tabak-sus'));
  return el;
}
function tik(b: HTMLButtonElement, fn: () => void) {
  jest(b, { birak: (yer,_ilk,kisa) => { if (kisa && icinde(b,yer,10)) fn(); }, klavye: fn });
}

let rendeDokusu: AudioBuffer | undefined;
function rendeSesi(sebze: Sebze) {
  const ctx = baglam(), cikis = efektCikisi();
  if (!ctx || !cikis || ctx.state !== 'running') return;
  if (!rendeDokusu || rendeDokusu.sampleRate !== ctx.sampleRate) {
    rendeDokusu = ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.22),ctx.sampleRate);
    const ses = rendeDokusu.getChannelData(0);
    for(let i=0;i<ses.length;i++){
      const zaman=i/ctx.sampleRate;
      const dis=Math.pow(.5+.5*Math.cos(zaman*2*Math.PI*54),2.4);
      ses[i]=(Math.random()*2-1)*(.18+.82*dis);
    }
  }
  const kaynak=ctx.createBufferSource(), filtre=ctx.createBiquadFilter(), gain=ctx.createGain();
  kaynak.buffer=rendeDokusu;
  kaynak.playbackRate.value=sebze==='havuc'?1.12:.9;
  filtre.type='bandpass'; filtre.Q.value=.8;
  filtre.frequency.setValueAtTime(sebze==='havuc'?2900:2150,ctx.currentTime);
  filtre.frequency.exponentialRampToValueAtTime(1050,ctx.currentTime+.16);
  gain.gain.setValueAtTime(.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.25,ctx.currentTime+.014);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.20);
  kaynak.connect(filtre).connect(gain).connect(cikis);
  kaynak.onended=()=>{kaynak.disconnect();filtre.disconnect();gain.disconnect();};
  kaynak.start();
}

export function mucverAc(kok: HTMLElement, ayar: AtolyeAyar) {
  if (kok.querySelector('.mucver-oyunu')) return;
  const masaId = ayar.masa ?? '';
  const yaz = (durum: Tarif) => kayit.yaz(masaId, durum);
  const eski = oku(masaId); const p = eski && (!eski.damga || eski.aktif) ? eski : yeni(eski?.servis ?? ayar.oncekiServis);
  const siparisNo=p.siparis??(p!==eski&&ayar.tekrarTercihi?.tarifId==='mucver'?ayar.tekrarTercihi.tur:Math.max(0,p.servis-(p.damga?1:0))%6);
  p.siparis=siparisNo;
  const istenen=GARNITUR[siparisNo%GARNITUR.length];
  const istekCumlesi=mucverIstegi(siparisNo);
  const hedefKizarma=siparisNo%2;
  const garniturPuani=():2|3=>p.sus===istenen?3:2;
  const firinPuani=():1|2|3=>p.kizarma===2?1:p.kizarma!==hedefKizarma||hedefKizarma===1&&p.sikma<55?2:3;
  const tadim=()=>Math.min(garniturPuani(),firinPuani()) as 1|2|3;
  p.aktif = true; yaz(p);
  const onceki = Array.from(kok.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
    .map(el => ({ el, gizli: el.hidden, inert: el.inert }));
  for (const {el} of onceki) { el.hidden = true; el.inert = true; }
  const alan = h('section.mucver-oyunu', { 'aria-label':'Fırın Mücver' });
  const dekor = h('img.mv-dekor', { alt:'', draggable:'false' });
  const oyun = h('div.mv-oyun'), ust = h('header.ust.mv-ust');
  const duyuru = h('span.yalniz-okuyucu', {'aria-live':'polite'});
  alan.append(dekor,oyun,ust,duyuru); kok.append(alan);
  let saat: number | undefined, kapandi = false, mesgul = false;
  let arac: HTMLElement | undefined;
  let sonAsama = '';
  const ses = (fn:()=>void) => { if (ayar.sesli() && !document.hidden) fn(); };
  function soyle(s: string) {
    duyuru.textContent=s;if(!ayar.sesli()||document.hidden)return;
    if(s===harcSes[0])void konus(suzmeSesi,{cihazSesi:false});
    else if(s===istekCumlesi)void misafirCumlesi('corba',s);else ayar.soyle(s);
  }
  function kaydet() { yaz(p); }
  function kapat() {
    if (kapandi) return;
    kapandi=true; window.clearTimeout(saat); arac?.remove(); sus();
    p.aktif=false; kaydet(); geriBirak(); window.removeEventListener('keydown', esc, true);
    document.removeEventListener('visibilitychange', gorunur);
    alan.remove(); for(const {el,gizli,inert} of onceki){ el.hidden=gizli; el.inert=inert; }
    ayar.cikis();
  }
  function esc(e: KeyboardEvent) {
    if (e.key==='Escape' && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); kapat(); }
  }
  const geriBirak=geriDinle(()=>{kapat(); return true;});
  window.addEventListener('keydown',esc,true);
  function gorunur() { if (!document.hidden && p.bitis && !p.cikti) ciz(); }
  document.addEventListener('visibilitychange',gorunur);
  function dug(ad: string, simge: Simge, fn:()=>void, sinif='') {
    const b=dugme(ad,'dugme '+sinif,ikon(simge)); tik(b,fn); return b;
  }
  function ustCiz() {
    const fis=dugme('Fırın mücver siparişini dinle','mv-fis',resim('mucver-fis'));
    const ist = asama(p);
    const id = ist === 'rende' ? p.sebze : ist === 'harc' ? eklenen[p.harc] : ist === 'harman' ? 'kasik' : ist === 'tepsi' ? 'kasik-dolu' : ist === 'cikar' || ist === 'firina' || ist === 'pisiyor' ? 'eldiven' : 'spatula-dolu';
    fis.append(h('i'),resim(istenen),resim(firinRenkleri[hedefKizarma],'mv-istenen-renk'));
    if(ist!=='susle'&&ist!=='son')fis.append(h('i'),resim(id));
    tik(fis,()=>soyle(istekCumlesi));
    const sesDugme=dug(ayar.sesli()?'Sesi kapat':'Sesi aç',ayar.sesli()?'hoparlor':'sessiz',()=>{ayar.sesDegistir();ustCiz()});
    ust.replaceChildren(dug('Siparişlere dön','geri',kapat),fis,sesDugme);
  }
  function hareketliArac(id: string, yer: Nokta, genislik: number) {
    if (!arac) { arac=id==='spatula-dolu'?spatula(true,'mv-tasinan'):resim(id,'mv-tasinan'); document.body.append(arac); }
    arac.style.width=genislik+'px'; arac.style.left=yer.x+'px'; arac.style.top=yer.y+'px';
  }
  function araciBirak() { arac?.remove(); arac=undefined; }
  function spatula(dolu:boolean,sinif=''){
    const el=h('span.mv-spatula-cizimi',{class:'mv-spatula-cizimi '+sinif},resim('spatula','mv-spatula-metal'));
    if(dolu)el.append(resim(firinRenkleri[p.kizarma],'mv-spatula-lokma'));
    return el;
  }
  function rendeleme() {
    if (p[p.sebze] === 3) p.sebze = p.sebze === 'kabak' ? 'havuc' : 'kabak';
    const id=p.sebze, b=dugme(id==='kabak'?'Kabağı rendele':'Havucu rendele','mv-rende-alan');
    b.dataset.rende=id;
    const grater=resim('rende','mv-rende');
    const sebze=resim(id,'mv-rendelenen');
    const yigin=resim(id+'-rende','mv-rende-yigin');
    const yon=h('i.mv-yon',{},ikon('asagi')); b.append(grater,yigin,sebze,yon); oyun.append(b);
    const secenek=h('div.mv-sebzeler');
    for (const sebzeId of ['kabak','havuc'] as const) {
      const tab=dugme(sebzeId==='kabak'?'Kabak seç':'Havuç seç','mv-sebze',resim(sebzeId));
      tab.dataset.sec=sebzeId; tab.setAttribute('aria-pressed',String(id===sebzeId));
      if(p[sebzeId]===3) { tab.disabled=true;tab.append(h('i.mv-tik',{},ikon('onay'))); }
      tik(tab,()=>{p.sebze=sebzeId;kaydet();ciz();soyle(bilgi(p));});
      secenek.append(tab);
    }
    oyun.append(secenek);
    function guncelle() {
      const n = p[id];
      sebze.src=adres(n===0?id:id+(n===1?'-yarim':'-uc'));
      sebze.style.setProperty('--mc-boy',String(1-n*.17));
      yigin.style.setProperty('--mc-boy',String(.52+n*.16));
      yigin.hidden=n===0;
    }
    guncelle();
    function izBirak() {
      if(!b.isConnected||p[id]>=3)return;
      p[id]++; kaydet(); ses(()=>rendeSesi(id));
      const talaş=resim(id+'-rende-iz','mv-rende-izi');
      alan.append(talaş);
      void hareket(talaş,[{translate:'0 -50%',rotate:'-6deg',opacity:.95},{translate:'-13% 42%',rotate:'8deg',opacity:1},{translate:'-19% 100%',rotate:'12deg',opacity:0}],300).then(()=>talaş.remove());
      if(p[id]===3){p.sebze=id==='kabak'?'havuc':'kabak';kaydet();ciz();if(asama(p)==='rende')soyle(bilgi(p));}
      else {guncelle();void hareket(yigin,[{translate:'0 -10%'},{translate:'0 0'}],220);}
    }
    let son=0, yonu: -1|1=1, mesafe=0, hareketYapildi=false;
    const bek = () => {sebze.style.translate='';};
    jest(b,{
      basla:yer=>{son=yer.y;yonu=1;mesafe=0;hareketYapildi=false;},
      tasi:(yer,ilk)=>{
        const d=yer.y-son;son=yer.y;mesafe=Math.max(0,mesafe+d*yonu);
        sebze.style.translate=`0 ${sinir(yer.y-ilk.y,-b.clientHeight*.13,b.clientHeight*.26)}px`;
        if(mesafe>b.clientHeight*.12){mesafe=0;yonu=yonu===1?-1:1;hareketYapildi=true;izBirak();}
      },
      birak:(_yer,_ilk,kisa)=>{bek();if(kisa&&!hareketYapildi&&b.isConnected){void hareket(sebze,[{translate:'0 -5%'},{translate:'0 24%'},{translate:'0 0'}],250);izBirak();}},
      iptal:bek,klavye:izBirak,
    });
  }
  function suzgec() {
    const bez = dugme('Kabağın suyunu sık', 'mv-sik', resim('kabak-bezi'), h('i.mv-sik-sol',{},ikon('ileri')), h('i.mv-sik-sag',{},ikon('geri')));
    const su = h('span.mv-suzulen-su');
    const kap = h('div.mv-suzme-kabi', {}, kase(), su, resim('kase','mv-kap mv-on'), h('i.mv-damla'), h('i.mv-damla'));
    oyun.append(kap,bez);
    let kare = 0, kayitli = p.sikma;
    function goster() {
      bez.style.setProperty('--bez-en', String(1 - p.sikma / 550));
      su.style.scale = String(Math.sqrt(p.sikma / 100));
      bez.dataset.sikma = String(p.sikma);
      bez.classList.toggle('mv-suzuldu', p.sikma === 100);
    }
    function dur() {
      cancelAnimationFrame(kare); kare = 0;
      kap.classList.remove('mv-akiyor');
      bez.classList.remove('mv-sikiliyor');
      kaydet();
    }
    function basla() {
      if (p.sikma >= 100 || mesgul) return;
      const bas = performance.now(), once = p.sikma;
      bez.classList.add('mv-sikiliyor'); kap.classList.add('mv-akiyor');
      function akit(an: number) {
        if (!bez.isConnected) return;
        if (mesgul || document.hidden) { dur(); return; }
        p.sikma = Math.min(100, once + Math.floor((an - bas) / 12));
        goster();
        if (p.sikma >= kayitli + 10) { kayitli = p.sikma; kaydet(); }
        if (p.sikma < 100) kare = requestAnimationFrame(akit);
        else { dur(); ses(efekt.tink); }
      }
      kare = requestAnimationFrame(akit);
    }
    jest(bez,{basla,birak:()=>dur(),iptal:dur,klavye:()=>{
      if(mesgul)return;
      p.sikma=Math.min(100,p.sikma+25);goster();kaydet();ses(efekt.tink);
    }});
    goster();
  }
  function harc() {
    const n=p.harc, kaseEl=h('div.mv-harc-kase',{},kase(harcGorseli[n]));
    oyun.append(kaseEl);
    const malzeme=dugme(harcAd[n],'mv-harc-malzeme',resim(eklenen[n]));malzeme.dataset.ekle=String(n);
    if(n===0){
      suzgec();
      malzeme.classList.add('mv-kabak-aktar');
    }
    if(n===1)malzeme.append(resim('kazinti','mv-kazinti'));
    const ok=h('i.mv-malzeme-ok',{},ikon('ileri'));malzeme.append(ok);oyun.append(malzeme);
    async function ekle() {
      if(mesgul||!malzeme.isConnected)return;
      mesgul=true; const r=merkez(kaseEl);
      const ara = n===3?'yumurta-acik':n===4?'un-serp':eklenen[n];
      const hayalet=resim(ara,'mv-birakilan'); kaseEl.append(hayalet);
      const bas=merkez(malzeme);
      if(n===2) {
        hayalet.style.opacity='0';
        await hareket(malzeme,[{rotate:'0deg'},{rotate:'13deg'},{rotate:'-6deg'},{rotate:'0deg'}],260);
      } else if(n===3){
        hayalet.classList.add('mv-kirilma');
        const acik=hayalet as HTMLImageElement;
        await hareket(acik,[{translate:'0 -12%',rotate:'-9deg'},{translate:'0 2%',rotate:'0deg'}],180);
        acik.src=adres('yumurta-kirik');
        ses(efekt.yapis);
        await hareket(acik,[{translate:'0 2%',opacity:1},{translate:'0 18%',opacity:1},{translate:'0 23%',opacity:0}],380);
      } else {
        ses(n===3?efekt.yapis:efekt.pof);
        await hareket(hayalet,[{transform:`translate(calc(-50% + ${bas.x-r.x}px),calc(-50% + ${bas.y-r.y}px)) scale(.85)`},{transform:'translate(-50%,-48%) scale(.62)'}],340);
      }
      if(kapandi||!malzeme.isConnected)return;
      p.harc++;kaydet();mesgul=false;ciz();
      if(asama(p)==='harc')soyle(bilgi(p));
    }
    jest(malzeme,{
      tasi:(yer,ilk)=>{if(!mesgul&&Math.hypot(yer.x-ilk.x,yer.y-ilk.y)>7){hareketliArac(eklenen[n],yer,malzeme.clientWidth*.75);malzeme.classList.add('mv-elde');}},
      birak:(yer,_ilk,kisa)=>{araciBirak();malzeme.classList.remove('mv-elde');if(kisa||icinde(kaseEl,yer,20))void ekle();},
      iptal:()=>{araciBirak();malzeme.classList.remove('mv-elde');},klavye:()=>void ekle(),
    });
  }
  function harman() {
    const b=dugme('Mücver harcını karıştır','mv-harman-alani',kase(turGorseli[p.tur]));b.dataset.karistir='';
    const kasik=resim('kasik','mv-karistirici');b.append(kasik,h('i.mv-harman-ok',{},ikon('karistir')));oyun.append(b);
    let once:number|undefined, toplam=0, turYapildi=false;
    const aci=(yer:Nokta)=>{const m=merkez(b);return Math.atan2((yer.y-m.y)/b.clientHeight,(yer.x-m.x)/b.clientWidth)};
    function birTur(){
      if(!b.isConnected||p.tur>=3)return;
      p.tur++;kaydet();ses(()=>karistirmaSesi(false));
      if(p.tur===3){ciz();return;}
      b.querySelector<HTMLImageElement>('.mv-harc')!.src=adres(turGorseli[p.tur]);
      kasik.src=adres(p.tur===1?'kasik-karistir':'kasik-cek');
      void hareket(kasik,[{rotate:'0deg'},{rotate:'-13deg',translate:'-18% 4%'},{rotate:'12deg',translate:'7% 6%'},{rotate:'0deg'}],350);
    }
    jest(b,{basla:yer=>{once=aci(yer);toplam=0;turYapildi=false;},tasi:yer=>{
      const yeni=aci(yer);if(once!==undefined)toplam+=Math.atan2(Math.sin(yeni-once),Math.cos(yeni-once));once=yeni;
      kasik.style.translate=`${Math.cos(yeni)*25}% ${Math.sin(yeni)*10}%`;kasik.style.rotate=`${Math.sin(yeni)*13}deg`;
      if(Math.abs(toplam)>Math.PI*1.4){toplam=0;turYapildi=true;birTur();}
    },birak:(_son,_ilk,kisa)=>{kasik.style.translate='';kasik.style.rotate='';if(!turYapildi&&(kisa||Math.abs(toplam)>.5*Math.PI))birTur();},
    iptal:()=>{kasik.style.translate='';kasik.style.rotate='';},klavye:birTur});
  }
  function bosYer(yer?:Nokta) {
    const hedef = yer ? tepsiNoktasi(yer) : undefined;
    const aralik = (n:Nokta)=>p.yerler.every(y=>Math.hypot(y.x-n.x,(y.y-n.y)*.7)>22);
    if(hedef&&aralik(hedef))return hedef;
    const adaylar=[...hedefler,...[26,54,69].flatMap(y=>[19,39,60,81].map(x=>({x,y})))];
    return adaylar.filter(aralik).sort((a,b)=>hedef?Math.hypot(a.x-hedef.x,a.y-hedef.y)-Math.hypot(b.x-hedef.x,b.y-hedef.y):0)[0]??hedefler[p.yerler.length];
  }
  function paylastir(){
    const hedef=dugme('Tepsiye bir mücver bırak','mv-tepsi-hedef',tepsi(p,'cig'));hedef.dataset.pay='tepsi';
    const kap=dugme('Kaşıkla bir porsiyon al','mv-harc-kaynak',kase('karisim-son'),resim(p.kasikDolu?'kasik-dolu':'kasik','mv-pay-kasik'));kap.dataset.pay='harc';
    kap.style.setProperty('--mc-doluluk',String(1 - (p.yerler.length + Number(p.kasikDolu))*.17));
    hedef.classList.toggle('mv-bekliyor', p.kasikDolu);
    oyun.append(hedef,kap);
    const isaret=h('i.mv-bos-yer',{},ikon('asagi'));yerlestir(isaret,bosYer());hedef.firstElementChild!.append(isaret);
    function al(){
      if (p.kasikDolu || mesgul) return;
      p.kasikDolu=true; kaydet();
      kap.querySelector<HTMLImageElement>('.mv-pay-kasik')!.src=adres('kasik-dolu');
      kap.style.setProperty('--mc-doluluk',String(1 - (p.yerler.length+1)*.17));
      hedef.classList.add('mv-bekliyor'); ses(efekt.secim);
    }
    async function koy(yer?:Nokta){
      if(mesgul||!hedef.isConnected||p.yerler.length>=3)return;
      if(!p.kasikDolu){void hareket(kap,[{scale:'1'},{scale:'1.07'},{scale:'1'}],300);return;}
      mesgul=true;
      const nokta=bosYer(yer?yuzde(hedef,yer):undefined);
      const dok=resim('kasik-bosalt','mv-dok');yerlestir(dok,nokta);hedef.firstElementChild!.append(dok);
      await hareket(dok,[{translate:'-30% -95%',rotate:'-8deg'},{translate:'-32% -78%',rotate:'8deg'}],230);
      if(kapandi||!hedef.isConnected)return;
      p.yerler.push(nokta); p.kasikDolu=false;mesgul=false;kaydet();ses(efekt.yapis);ciz();
    }
    jest(kap,{tasi:(yer,ilk)=>{if(Math.hypot(yer.x-ilk.x,yer.y-ilk.y)>7)hareketliArac('kasik-dolu',yer,kap.clientWidth*.74);},
      birak:(yer,_ilk,kisa)=>{araciBirak();if(kisa)al();else if(icinde(hedef,yer,12)){p.kasikDolu=true;void koy(yer);}},
      iptal:araciBirak,klavye:al});
    jest(hedef,{birak:(yer,_ilk,kisa)=>{if(kisa)void koy(yer);},klavye:()=>void koy()});
  }
  function firina(){
    const giris=dugme('Fırının rafına yerleştir','mv-raf',h('i.mv-firin-oku',{},ikon('asagi')));giris.dataset.raf='';
    const tasiyici=dugme('Tepsiyi fırına sür','mv-firin-tepsi',tepsi(p,'cig','tepsi-firin'));tasiyici.dataset.firina='';
    oyun.append(giris,tasiyici);
    async function pisir(){
      if(mesgul||p.bitis)return;
      mesgul=true;const bas=merkez(tasiyici), son=merkez(giris);
      const hareketMiktari={x:son.x-bas.x,y:son.y-bas.y};
      await hareket(tasiyici,[{transform:'translate(0,0) scale(1)'},{transform:'translate('+hareketMiktari.x+'px,'+hareketMiktari.y+'px) scale(.77)'}],370);
      if(kapandi)return;
      p.bitis=Date.now()+zaman(FIRIN_SURESI);kaydet();ses(efekt.tink);mesgul=false;ciz();
    }
    tik(giris,()=>void pisir());
    const sifirla=()=>{tasiyici.style.translate='';};
    jest(tasiyici,{tasi:(yer,ilk)=>tasiyici.style.translate=`${yer.x-ilk.x}px ${yer.y-ilk.y}px`,
      birak:(yer,_ilk,kisa)=>{if(kisa||icinde(giris,yer,18))void pisir();else sifirla();},iptal:sifirla,klavye:()=>void pisir()});
  }
  function firin(al: boolean){
    const kalan=Math.max(0,p.bitis-Date.now());
    const asamalar:[number,Pisiklik][]=[[3250,'cig'],[2100,'isinan'],[950,'yari'],[0,'kizaran']];
    const [sinir,poz]=asamalar.find(([esik])=>kalan>esik)??[0,'pismis'];
    const goruntu=tepsi(p,al||p.kizarma>0?'pismis':poz,'tepsi-firin',undefined,!al&&p.kizarma>0?p.kizarma-1:p.kizarma);
    const firindaki=h('div.mv-firindaki',{},goruntu);oyun.append(firindaki);
    if(!al){
      saat=window.setTimeout(ciz,Math.max(20,kalan-sinir+15));
      return;
    }
    const mitt=dugme('Eldivenle pişmiş tepsiyi çıkar','mv-eldiven',resim('eldiven'));mitt.dataset.cikar='';
    oyun.append(mitt);
    if(p.kizarma<2){
      const kizart=dugme('Mücverleri biraz daha kızart','mv-kizart',resim(firinRenkleri[p.kizarma+1]),h('i',{},ikon('ileri')));
      tik(kizart,()=>{
        if(mesgul||asama(p)!=='cikar')return;
        p.kizarma++;p.bitis=Date.now()+zaman(1500);kaydet();ses(efekt.secim);ciz();
      });
      oyun.append(kizart);
    }
    const sicak=resim('buhar','mv-buhar');firindaki.append(sicak);
    async function cikar(){
      if(p.cikti||mesgul)return;
      mesgul=true;mitt.hidden=true;
      goruntu.append(resim('firin-tut','mv-tutan-eldiven'));
      await hareket(firindaki,[{transform:'translateY(0) scale(1)'},{transform:'translateY(68%) scale(1.35)'}],420);
      if(kapandi)return;
      p.cikti=true;mesgul=false;kaydet();ses(efekt.tink);ciz();
    }
    jest(mitt,{tasi:(yer,ilk)=>{if(Math.hypot(yer.x-ilk.x,yer.y-ilk.y)>7)hareketliArac('eldiven',yer,mitt.clientWidth);},
      birak:(yer,_ilk,kisa)=>{araciBirak();if(kisa||icinde(firindaki,yer,28))void cikar();},iptal:araciBirak,klavye:()=>void cikar()});
    const cek=dugme('Pişmiş tepsiyi al','mv-rafa-dokun');tik(cek,()=>void cikar());firindaki.append(cek);
  }
  function servis(){
    const hedef=dugme('Mücveri servis tabağına bırak','mv-servis-tabagi',tabak(p));hedef.dataset.tabaga='';
    const kaynak=h('div.mv-servis-tepsisi');
    const arac=spatula(p.spatulada!==undefined,'mv-servis-spatula');
    async function birak(i:number){
      if(mesgul||p.sunulan.includes(i)||!hedef.isConnected)return;
      mesgul=true;
      const tas=spatula(true,'mv-tasinan');const bas=merkez(kaynak),son=merkez(hedef);
      Object.assign(tas.style,{width:kaynak.clientWidth*.45+'px',left:bas.x+'px',top:bas.y+'px'});document.body.append(tas);
      await hareket(tas,[{translate:'0 0'},{translate:`${son.x-bas.x}px ${son.y-bas.y}px`}],260);tas.remove();
      if(!hedef.isConnected)return;
      p.sunulan.push(i);p.spatulada=undefined;mesgul=false;kaydet();ses(efekt.yapis);ciz();
    }
    const tepsiCizim=tepsi(p,'pismis','tepsi-sunum',(i,b)=>{
      b.classList.toggle('mv-elde',p.spatulada===i);
      const sec=()=>{p.spatulada=i;kaydet();if(!arac.querySelector('.mv-spatula-lokma'))arac.append(resim(firinRenkleri[p.kizarma],'mv-spatula-lokma'));kaynak.querySelectorAll('.mv-parca').forEach(el=>el.classList.toggle('mv-elde',el===b));hedef.classList.add('mv-bekliyor');};
      jest(b,{tasi:(yer,ilk)=>{if(Math.hypot(yer.x-ilk.x,yer.y-ilk.y)>7)hareketliArac('spatula-dolu',yer,kaynak.clientWidth*.5);},
        birak:(yer,_ilk,kisa)=>{araciBirak();if(kisa)sec();else if(icinde(hedef,yer,14))void birak(i);},
        iptal:araciBirak,klavye:sec});
    });
    kaynak.append(tepsiCizim,arac);oyun.append(kaynak,hedef);
    tik(hedef,()=>{if(p.spatulada!==undefined)void birak(p.spatulada);else void hareket(kaynak,[{scale:'1'},{scale:'1.045'},{scale:'1'}],280);});
  }
  function sunum(son: boolean){
    const masa=h('div.mv-son-tabak',{},resim('bez','mv-bez'),tabak(p));oyun.append(masa);
    if(son){const b=dug('Siparişlere dön','tekrar',kapat,'mv-ileri');oyun.append(b,yildizlar(tadim()));return;}
    const secimler=h('div.mv-susler');
    for(const id of GARNITUR){
      const b=dugme(GARNITUR_AD[id]+' ile sun','mv-sus',resim(id==='yogurt'?'yogurt-kasik':id));
      b.dataset.sus=id;b.setAttribute('aria-pressed',String(p.sus===id));
      if(id==='yogurt')b.prepend(resim('yogurt','mv-yogurt-kabi'));
      const sec=()=>{p.sus=id;kaydet();ses(efekt.yapis);ciz();};
      jest(b,{tasi:(yer,ilk)=>{if(Math.hypot(yer.x-ilk.x,yer.y-ilk.y)>7)hareketliArac(id+'-sus',yer,b.clientWidth*.68);},
        birak:(yer,_ilk,kisa)=>{araciBirak();if(kisa||icinde(masa,yer,12))sec();},iptal:araciBirak,klavye:sec});
      secimler.append(b);
    }
    oyun.append(secimler);
    if(p.sus){
      const onay=dug('Fırın mücveri servis et','onay',async()=>{
        if(mesgul||p.damga)return;
        mesgul=true;
        const damga=await tabakDamgasi(p);
        if(kapandi)return;
        p.servis++;p.damga=damga;kaydet();
        ayar.teslim(damga,tadim(),garniturPuani(),firinPuani(),undefined,{tarifId:'mucver',tur:siparisNo,garnitur:p.sus!,kizarma:p.kizarma,sikma:p.sikma});
        ses(tadim()===3?efekt.dogru:efekt.tink);mesgul=false;kapat();
      },'mv-ileri');
      onay.dataset.teslim='';oyun.append(onay);
    }
  }
  function ciz(){
    if(kapandi)return;
    window.clearTimeout(saat); const a=asama(p); const degisti=a!==sonAsama;
    const klavye=document.activeElement instanceof HTMLButtonElement&&document.activeElement.matches(':focus-visible');
    const odak=klavye?document.activeElement?.getAttribute('aria-label'):null;
    alan.style.setProperty('--mv-genislik', String(1+(100-p.sikma)*.0018));
    alan.style.setProperty('--mv-yukseklik', String(1-(100-p.sikma)*.002));
    alan.dataset.asama=a;oyun.replaceChildren();ustCiz();
    dekor.src=adres(a==='firina'||a==='cikar'?'firin':a==='pisiyor'?'firin-kapali':a==='servis'||a==='susle'||a==='son'?'servis':'tezgah');
    switch(a){
      case 'rende':rendeleme();break;
      case 'harc':harc();break;
      case 'harman':harman();break;
      case 'tepsi':paylastir();break;
      case 'firina':firina();break;
      case 'pisiyor':case 'cikar':firin(a==='cikar');break;
      case 'servis':servis();break;
      case 'susle':case 'son':sunum(a==='son');break;
    }
    if(klavye){const ayni=odak?alan.querySelector<HTMLButtonElement>(`button[aria-label="${CSS.escape(odak)}"]`):null;(ayni??oyun.querySelector<HTMLButtonElement>('button:not([disabled])'))?.focus({preventScroll:true});}
    sonAsama=a;
    if(degisti)soyle(a==='susle'?istekCumlesi:a==='son'&&garniturPuani()<3?'Müşteri mücverin yanında başka bir şey istemişti.':bilgi(p));
  }
  ciz();
}

async function tabakDamgasi(p: Tarif): Promise<string> {
  try {
    const c=document.createElement('canvas'); c.width=400;c.height=280;
    const ctx=c.getContext('2d');if(!ctx)return 'mucver/mucver';
    const yukle=async(id:string)=>{const im=new Image();im.src=adres(id);await im.decode();return im;};
    const [tabakG,pismis,susG]=await Promise.all([yukle('tabak'),yukle(firinRenkleri[p.kizarma]),yukle(p.sus+'-sus')]);
    ctx.drawImage(tabakG,0,0,400,280);
    const en=110*(1+(100-p.sikma)*.0018),boy=70*(1-(100-p.sikma)*.002);
    for(const n of tabakYerleri)ctx.drawImage(pismis,n.x*4-en/2,n.y*2.8-boy/2,en,boy);
    ctx.drawImage(susG,157,158,78,61);
    return c.toDataURL('image/webp',.9);
  }catch{return 'mucver/mucver';}
}
