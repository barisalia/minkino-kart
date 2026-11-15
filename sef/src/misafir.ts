import {restoranKarakterleri as misafirler,karakterAdlari} from './restoran-karakterleri';
import {arkadasPozu} from './restoran-oyuncusu';
import sutlacReplikleri from './sutlac-replikleri.json';
import menemenReplikleri from './menemen-replikleri.json';
import durumReplikleri from './durum-replikleri.json';
import salonRitimleri from './salon-ritimleri.json';
import masaRitimleri from './masa-ritimleri.json';
import masaReplikleri from './masa-sesleri.json';
import salonReplikleri from './salon-replikleri.json';
import mantiReplikleri from './manti-replikleri.json';
import tadimKararlari from './tadim-kararlari.json';
import kumpirReplikleri from './kumpir-replikleri.json';
import simitReplikleri from './simit-replikleri.json';
import tostReplikleri from './tost-replikleri.json';
import { konus, konusmaAni } from '../../src/audio/konusma';
import { h } from '../../src/ui/dom';
import type { TarifId } from './tarif';
import replikler from './replikler.json';
import atolyeReplikleri from './atolye-replikler.json';
import ritimler from './agiz-ritmi.json';
import sayiliPizzaReplikleri from './sayili-pizza-replikleri.json';
import krepSiparisleri from './krep-siparisleri.json';
import corbaBitisSesleri from './corba-bitis-sesleri.json';
import makarnaMiktari from './makarna-sos-replikleri.json';
import firinIzgaraSiparisleri from './firin-izgara-siparisleri.json';
import sebzeReplikleri from './sebze-tercihleri.json';
import sebzeRitimleri from './sebze-ritimleri.json';
import musteriRitimleri from './musteri-ritmi.json';
import restoranReplikleri from './restoran-replikleri.json';
import './misafir.css';

type Poz = 'istek' | 'tesekkur';
const dosyalar = import.meta.glob<string>('../../assets/sef/{ses,misafir}/*.{mp3,webp}', {
  eager: true, query: '?url', import: 'default',
});
const sesler = new Map(Object.entries({...replikler,...atolyeReplikleri}).map(([id, cumle]) =>
  [cumle, dosyalar['../../assets/sef/ses/' + id + '.mp3']] as const));
sesler.set('Bardaktaki renk siparişteki renkten farklı.',new URL('../../assets/sef/smoothie/yorum-meyve.mp3',import.meta.url).href);
sesler.set('Bardağı çizgiye kadar doldurabilirsin.',new URL('../../assets/sef/smoothie/yorum-doluluk.mp3',import.meta.url).href);
sesler.set('Bu bardak için buz istemişti.',new URL('../../assets/sef/smoothie/yorum-buzlu.mp3',import.meta.url).href);
sesler.set('Müşteri içeceğini buzsuz istemişti.',new URL('../../assets/sef/smoothie/yorum-buzsuz.mp3',import.meta.url).href);
const tostSesleri=import.meta.glob<string>('../../assets/sef/tost/*.mp3',{eager:true,query:'?url',import:'default'});
for(const [id,metin] of Object.entries(tostReplikleri))sesler.set(metin,tostSesleri['../../assets/sef/tost/'+id+'.mp3']);
const simitSesleri=import.meta.glob<string>('../../assets/sef/simit/*.mp3',{eager:true,query:'?url',import:'default'});
for(const [id,metin] of Object.entries(simitReplikleri))sesler.set(metin,simitSesleri['../../assets/sef/simit/'+id+'.mp3']);
const mantiSesleri=import.meta.glob<string>('../../assets/sef/manti/*.mp3',{eager:true,query:'?url',import:'default'});
for(const [id,metin] of Object.entries(mantiReplikleri))sesler.set(metin,mantiSesleri['../../assets/sef/manti/'+id+'.mp3']);
const kumpirSesleri=import.meta.glob<string>('../../assets/sef/kumpir/*.mp3',{eager:true,query:'?url',import:'default'});
for(const [id,metin] of Object.entries(kumpirReplikleri))sesler.set(metin,kumpirSesleri['../../assets/sef/kumpir/'+id+'.mp3']);
type Siparis = keyof typeof misafirler;
const kisi = (tarif: Siparis) => misafirler[tarif];
const agizlar = import.meta.glob<string>('../../assets/sef/agiz/*.webp', {
  eager: true, query: '?url', import: 'default',
});
let konusmaSirasi = 0;

export function sefKonus(cumle: string) {
  return konus(sesler.get(cumle) || cumle);
}

export function misafirKonus(tarif: TarifId|'pizza', poz: Poz) {
  return sesliPoz(tarif, poz, `${misafirler[tarif]}-${poz}`);
}

export function misafirOzelKonus(tarif: TarifId, malzeme: 'havuc' | 'salatalik' | 'domates') {
  const replik = tarif === 'corba' ? (malzeme === 'domates' ? 'lokum-domates' : 'lokum-havuc')
    : (malzeme === 'domates' ? 'mino-domates' : 'mino-salatalik');
  return sesliPoz(tarif, 'istek', replik);
}

const aktorSesleri = import.meta.glob<string>('../../assets/sef/musteri-sesi/*.mp3', {
  eager:true, query:'?url', import:'default',
});
const replikKimligi = new Map(Object.entries({...atolyeReplikleri,...corbaBitisSesleri,...makarnaMiktari,...durumReplikleri,...menemenReplikleri,...sutlacReplikleri,...sayiliPizzaReplikleri,...krepSiparisleri,...firinIzgaraSiparisleri,...tadimKararlari,...sebzeReplikleri}).map(([id,metin])=>[metin,id]));
const ritimTablosu:Record<string,string>={...musteriRitimleri,...salonRitimleri,...sebzeRitimleri,...masaRitimleri};
const salonSesleri=import.meta.glob<string>('../../assets/sef/salon/*.mp3',{eager:true,query:'?url',import:'default'});
const salonKimligi=new Map(Object.entries(salonReplikleri).map(([id,cumle])=>[id.split('-')[0]+'|'+cumle,id]));
const masaKimligi=new Map(Object.entries(masaReplikleri).map(([cumle,ses])=>[cumle,ses.id]));
export function salonSesiniCal(kim:'anne'|'kino'|'baba'|'babaanne',id:string,poz:Poz='istek'){
  const ses=salonSesleri['../../assets/sef/salon/'+id+'.mp3'];
  return ses?sesleOynat(kim,poz,ses,ritimTablosu[id]):Promise.resolve();
}
export function restoranSiparisiniSoyle(misafir:Siparis,menuId:string):Promise<void> {
  if(!Object.hasOwn(restoranReplikleri,menuId))return Promise.resolve();
  const id=kisi(misafir)+'-restoran-'+menuId;
  if(misafir==='babaanne'||misafir==='baba'||misafir==='anne'||misafir==='kino')return salonSesiniCal(misafir,id);
  const ses=aktorSesleri['../../assets/sef/musteri-sesi/'+id+'.mp3'];
  if(!ses)return Promise.resolve();
  return sesleOynat(misafir,'istek',ses,ritimTablosu[id]);
}
function misafirinKaydi(tarif:Siparis,cumle:string){
  const kim=kisi(tarif);
  const salon=salonKimligi.get(kim+'|'+cumle);
  if(salon)return {ses:salonSesleri['../../assets/sef/salon/'+salon+'.mp3'],ritim:ritimTablosu[salon]};
  const ad=masaKimligi.get(cumle)??replikKimligi.get(cumle);
  const id=kim+'-'+ad;
  const ses=aktorSesleri['../../assets/sef/musteri-sesi/'+id+'.mp3'];
  if(ses)return {ses,ritim:ritimTablosu[id]};
  const temel=Object.entries(replikler).find(([id,metin])=>id.startsWith(kim+'-')&&metin===cumle);
  if(temel)return {ses:dosyalar['../../assets/sef/ses/'+temel[0]+'.mp3'],ritim:(ritimler as Record<string,string>)[temel[0]]};
}
export function misafirKaydiVar(tarif:Siparis,cumle:string){return !!misafirinKaydi(tarif,cumle)?.ses;}
export function servisTepkisiniCal(misafir:Siparis,durum:'yanlis'|'begendi'){
  const id=kisi(misafir)+'-servis-'+durum;
  const ses=salonSesleri['../../assets/sef/salon/'+id+'.mp3'];
  if(!ses)return false;
  void sesleOynat(misafir,'tesekkur',ses,ritimTablosu[id]);return true;
}
export function misafirCumlesi(tarif:Siparis,cumle:string,poz:Poz='istek') {
  const kayit=misafirinKaydi(tarif,cumle);
  if(kayit?.ses)return sesleOynat(tarif,poz,kayit.ses,kayit.ritim);
  return Promise.resolve();
}
function sesliPoz(tarif:Siparis,poz:Poz,replik:keyof typeof ritimler) {
  const metin=replikler[replik];
  const ses=sesler.get(metin);
  return ses ? sesleOynat(tarif,poz,ses,ritimler[replik]) : sefKonus(metin);
}
let pozuBirak:(()=>void)|undefined;
async function sesleOynat(tarif:Siparis,poz:Poz,ses:string,ritim?:string) {
  pozuBirak?.();
  const sira=++konusmaSirasi;
  const oynatma=konus(ses);
  if(!ritim || matchMedia('(prefers-reduced-motion: reduce)').matches)return oynatma;
  const kim=kisi(tarif);
  if(kim==='tavsan'||kim==='zipzip'||kim==='bulut')return oynatma;
  const yeni=kim==='babaanne'||kim==='baba'||kim==='kino'||kim==='anne';
  const kareler=['kapali','yuvarlak','acik'].map((agiz,i)=>{
    const img=new Image(); img.src=kim==='seftali'?seftaliPortreleri[i]:yeni?yeniPortre(kim,agiz==='kapali'?0:agiz==='yuvarlak'?3:1):agizlar[`../../assets/sef/agiz/${kim}-${poz}-${agiz}.webp`];return img;
  });
  let raf=0;
  let hedef:HTMLImageElement|null=null;
  let asil='';
  let balon:HTMLImageElement|undefined;
  const oyuncu=document.querySelector<HTMLElement>('.tepsi-sahnesi[data-salon] .restoran-oyuncusu[data-karakter="'+kim+'"]');
  let sonYuz='';
  const oyuncuYuzu=(poz:string)=>{
    if(!oyuncu||poz===sonYuz)return;
    sonYuz=poz;oyuncu.dispatchEvent(new CustomEvent('restoran-yuz',{detail:poz}));
  };
  function temizle() {
    cancelAnimationFrame(raf);
    oyuncuYuzu('kapali');
    if(hedef?.isConnected&&asil)hedef.src=asil;
    balon?.remove();
  }
  pozuBirak=temizle;
  function ciz() {
    if(sira!==konusmaSirasi||document.hidden)return;
    const an=konusmaAni();
    if(an?.metin===ses){
      if(!oyuncu?.isConnected&&!hedef?.isConnected){
        const kapsam=document.querySelector('dialog[open]')??document;
        const portreler=kapsam.querySelectorAll<HTMLImageElement>(`img[data-misafir="${kim}"][data-poz="${poz}"]`+(poz==='tesekkur'?',img[data-misafir="'+kim+'"][data-poz="tadim"]':''));
        hedef=[...portreler].find(img=>img.getClientRects().length && !img.closest('[inert],[hidden]'))??null;
        if(!hedef){
          const fis=document.querySelector<HTMLElement>('.fis:not([hidden]),.pz-fis');
          if(fis&&fis.getClientRects().length){
            balon=misafirResmi(tarif,poz);balon.classList.add('isteyen-misafir');
            balon.alt='';fis.append(balon);hedef=balon;
          }
        }
        asil=hedef?.src??'';
      }
      const indeks=Math.floor((performance.now()-an.bas)/90);
      const kare=kareler[Number(ritim?.[indeks]??'0')];
      oyuncuYuzu((['kapali','konus','acik'] as const)[Number(ritim?.[indeks]??'0')]);
      if(hedef&&kare.complete&&kare.naturalWidth&&hedef.src!==kare.src)hedef.src=kare.src;
    }
    raf=requestAnimationFrame(ciz);
  }
  raf=requestAnimationFrame(ciz);
  try{await oynatma;}
  finally{if(sira===konusmaSirasi){temizle();pozuBirak=undefined;}}
}

const yeniPortreler=import.meta.glob<string>('../../assets/sef/salon/{anne,kino,baba,babaanne}-portre-*.webp',{eager:true,query:'?url',import:'default'});
const seftaliKonus=import.meta.glob<string>('../../assets/sef/salon/arkadaslar/seftali-konus-*.webp',{eager:true,query:'?url',import:'default'});
const seftaliPortreleri=[0,1,2].map(i=>seftaliKonus['../../assets/sef/salon/arkadaslar/seftali-konus-'+i+'.webp']);
export const yeniPortre=(kim:'anne'|'kino'|'baba'|'babaanne',i:number)=>yeniPortreler['../../assets/sef/salon/'+kim+'-portre-'+i+'.webp'];
export function misafirResmi(tarif: Siparis, poz: Poz|'tadim') {
  const kim=kisi(tarif);
  return h('img.misafir', {
    alt: karakterAdlari[kim], draggable: 'false',
    'data-misafir': kisi(tarif), 'data-poz': poz,
    src: kim==='seftali'?seftaliPortreleri[0]:kim==='tavsan'||kim==='bulut'?arkadasPozu(kim):kim==='zipzip'?new URL('../../assets/hazirlik/kres/cember-zipzip-0.webp',import.meta.url).href:kim==='babaanne'||kim==='baba'||kim==='anne'||kim==='kino'?yeniPortre(kim,poz==='tesekkur'?2:0):dosyalar[`../../assets/sef/misafir/${kisi(tarif)}-${poz}.webp`]??dosyalar[`../../assets/sef/misafir/${kisi(tarif)}-istek.webp`],
  });
}
