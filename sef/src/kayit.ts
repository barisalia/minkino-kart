import { bosTepsiler, tepsileriOku, menuler, type Tepsiler } from './tepsi-fisleri';
import { makarnaPorsiyonunuOku, fotografGecerli, makarnaSosuMu, yeniTarifMi, tercihOku, type DefterFotografi } from './yemekler';
import {
  SEBZELER, KESIM_BOYLARI, kesimHedefi, dograndi, KARISTIRMA_HEDEFI, siparisBaslat, malzemeAl, kes, aktar, karistir, sebzeyiEz,servisEt,
  type MalzemeId, type Siparis, type TarifId,
} from './tarif';
import { pizzaTabaginiOku, type PizzaTabagi } from './pizza-tabagi';
import {sosMu,type SosId,type Puan,type SosNoktasi} from './salata-sosu';

export const EKRANLAR = ['siparis', 'mutfak', 'dolap', 'tahta', 'ocak', 'kase', 'servis'] as const;
export type Ekran = typeof EKRANLAR[number];
import type {CorbaBitisi} from './corba-bitisi';
export type SusId = CorbaBitisi | 'domates' | 'havuc' | 'salatalik' | SosId;
export interface Susleme { id: SusId; x: number; y: number; iz?: SosNoktasi[]; oncekiIzler?: SosNoktasi[][] }
export interface Porsiyon { adet: number; yuklu: boolean }
interface SebzeTezgahi { siparis:Siparis; sus?:Susleme; istek?:SusId; porsiyon:Porsiyon; pismeAni:number }
export type SebzeTabagi = { tarifId: TarifId; sus: Susleme; ozel?: boolean; salata?:Siparis; corba?:Siparis; istenenSus?:SusId; puan?:Puan };
export type ServisKaydi = SebzeTabagi | PizzaTabagi | DefterFotografi;
export interface Defter {
  tepsiler: Tepsiler;
  secili: TarifId;
  ekran: Ekran;
  siparisler: Partial<Record<TarifId, Siparis>>;
  tezgahSahibi:Partial<Record<TarifId,string>>;
  sakliTezgahlar:Record<string,SebzeTezgahi>;
  tabaklar: Record<TarifId, number>;
  pismeAni: number;
  susler: Partial<Record<TarifId, Susleme>>;
  porsiyonlar: Record<TarifId, Porsiyon>;
  ozelIstekler: Partial<Record<TarifId, SusId>>;
  gecmis: ServisKaydi[];
  sessiz: boolean;
}
const ANAHTAR = 'minkino-sef-v1';
const sayi = (deger: unknown, max: number) =>
  typeof deger === 'number' && Number.isFinite(deger) ? Math.max(0, Math.min(Math.floor(deger), max)) : 0;
export const susSecenekleri = (id: TarifId): readonly SusId[] =>
  id === 'corba' ? ['nane','kruton','sade','havuc','domates'] : ['limon', 'yogurt', 'feslegen'];
/** Çeşniler sırayla gelir. Çocuk hangisini sunacağına karar verir. */
export function yeniOzelIstek(id: TarifId, servisSayisi: number): SusId | undefined {
  if(id==='salata')return (['limon','yogurt','feslegen'] as const)[servisSayisi%3];
  return (['kruton','sade','nane'] as const)[servisSayisi%3];
}
function susuOku(tarifId: TarifId, deger: unknown): Susleme | undefined {
  if (!deger || typeof deger !== 'object') return;
  const s = deger as Partial<Susleme>;
  if (!s.id || !(susSecenekleri(tarifId).includes(s.id)||tarifId==='salata'&&['salatalik','domates'].includes(s.id)) || !Number.isFinite(s.x) || !Number.isFinite(s.y)) return;
  const nokta=(n:number)=>Math.max(0,Math.min(1,n));
  const sus:Susleme={id:s.id,x:nokta(s.x!),y:nokta(s.y!)};
  if(tarifId==='salata'&&sosMu(s.id)&&Array.isArray(s.iz)){
    const oku=(iz:SosNoktasi[])=>iz.slice(0,48).filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)).map(p=>({x:nokta(p.x),y:nokta(p.y)}));
    const iz=oku(s.iz);
    if(iz.length)sus.iz=iz;
    if(iz.length&&Array.isArray(s.oncekiIzler)){
      const onceki=s.oncekiIzler.slice(0,5).filter(Array.isArray).map(oku).filter(p=>p.length);
      if(onceki.length)sus.oncekiIzler=onceki;
    }
  }
  return sus;
}

function siparisiOku(id: TarifId, ham: unknown): Siparis | undefined {
  if (typeof ham !== 'object' || !ham) return;
  const kayit = ham as Partial<Siparis>;
  const kivam=kayit.istenenKivam;
  let siparis = siparisBaslat(id,kivam==='puruzsuz'||kivam==='taneli'||kivam==='patates'?kivam:undefined);
  if(id==='salata'&&(kayit.salatalikBoyu===2||kayit.salatalikBoyu===6))siparis={...siparis,salatalikBoyu:kayit.salatalikBoyu};
  for (const m of Array.isArray(kayit.alinan) ? kayit.alinan : []) {
    if (SEBZELER.includes(m as MalzemeId)) siparis = malzemeAl(siparis, m);
  }
  const malzemeler=siparis.alinan;
  // Önceki sürümde tamamlanıp tabağa alınmış sebzeler kendi kesitlerini korur.
  const eskiHazir = malzemeler.filter(m => Array.isArray(kayit.eskiHazir)
    ? kayit.eskiHazir.includes(m) : sayi(kayit.kesimler?.[m], 2) === 2);
  const kesimBoylari:Siparis['kesimBoylari']={};
  for(const id of malzemeler){
    const boy=kayit.kesimBoylari?.[id];
    if(boy && KESIM_BOYLARI.includes(boy))kesimBoylari[id]=boy;
  }
  const yikama:Siparis['yikama']={};
  if(id==='salata')for(const m of malzemeler){
    const n=kayit.yikama?.[m];if(typeof n==='number'&&Number.isInteger(n)&&n>0&&n<=7)yikama[m]=n;
  }
  const bahceden=malzemeler.filter(m=>Array.isArray(kayit.bahceden)&&kayit.bahceden.includes(m));
  siparis = { ...siparis, eskiHazir, kesimBoylari, yikama,...(bahceden.length?{bahceden,sulanan:bahceden.filter(m=>Array.isArray(kayit.sulanan)&&kayit.sulanan.includes(m))}:{}) };
  for (const m of malzemeler) {
    for (let n = 0; n < sayi(kayit.kesimler?.[m], kesimHedefi(siparis,m)); n++) siparis = kes(siparis, m, kayit.kesitler?.[m]?.[n]);
  }
  for (const m of Array.isArray(kayit.aktarilan) ? kayit.aktarilan : []) {
    if (malzemeler.includes(m as MalzemeId)) siparis = aktar(siparis, m);
  }
  for (let n = 0; n < sayi(kayit.karistirma, KARISTIRMA_HEDEFI); n++) siparis = karistir(siparis);
  if(Array.isArray(kayit.ezilen))for(const id of kayit.ezilen)siparis=sebzeyiEz(siparis,id);
  const durak=kayit.bekleyenIstasyon;
  if(durak==='dolap'||durak==='tahta'||durak==='servis'||durak===(id==='corba'?'ocak':'kase'))siparis={...siparis,bekleyenIstasyon:durak};
  const tahta = kayit.tahtadaki;
  siparis = { ...siparis, tahtadaki: tahta && siparis.alinan.includes(tahta) &&
    dograndi(siparis,tahta) && !siparis.aktarilan.includes(tahta) ? tahta : undefined };
  return kayit.servisEdildi === true ? servisEt(siparis) : siparis;
}

/** Müşteri masasının ve serbest mutfağın yarım kalan hazırlıkları birbirine karışmaz. */
export function tezgahSiparisi(d:Defter,id:TarifId,masa='') {
  if((d.tezgahSahibi[id]??'')===masa)return d.siparisler[id];
  return d.sakliTezgahlar[id+'/'+masa]?.siparis;
}

export function sebzeTaslaginiSil(d:Defter,id:TarifId,masa:string){
  if(!masa)return;
  if(d.tezgahSahibi[id]!==masa){
    delete d.sakliTezgahlar[id+'/'+masa];
    return;
  }
  delete d.siparisler[id];
  delete d.susler[id];
  delete d.ozelIstekler[id];
  d.porsiyonlar[id]={adet:0,yuklu:false};
  if(id==='corba')d.pismeAni=0;
}

export function tezgahSec(d:Defter,id:TarifId,masa='') {
  const eski=d.tezgahSahibi[id]??'';
  if(eski===masa)return;
  const once=d.siparisler[id],anahtar=id+'/'+eski;
  if(once&&!once.servisEdildi){
    d.sakliTezgahlar[anahtar]={siparis:once,sus:d.susler[id],istek:d.ozelIstekler[id],porsiyon:d.porsiyonlar[id],pismeAni:id==='corba'?d.pismeAni:0};
  }else delete d.sakliTezgahlar[anahtar];
  const hedef=id+'/'+masa, kayit=d.sakliTezgahlar[hedef];
  d.siparisler[id]=kayit?.siparis;d.susler[id]=kayit?.sus;d.ozelIstekler[id]=kayit?.istek;
  d.porsiyonlar[id]=kayit?.porsiyon??{adet:0,yuklu:false};
  if(id==='corba')d.pismeAni=kayit?.pismeAni??0;
  d.tezgahSahibi[id]=masa;delete d.sakliTezgahlar[hedef];
}
function servisiOku(s:ServisKaydi):ServisKaydi|undefined{
  if(!s||typeof s!=='object')return;
  if('resim' in s && yeniTarifMi(s.tarifId)){
    if(!fotografGecerli(s.tarifId,s.resim))return;
    const foto:DefterFotografi={tarifId:s.tarifId,resim:s.resim};
    const tercih=tercihOku(s.tercih,s.tarifId);
    if(tercih)foto.tercih=tercih;
    for(const alan of ['puan','istekPuani','pisirmePuani'] as const){
      const deger=s[alan];
      if(deger===1||deger===2||deger===3)foto[alan]=deger;
    }
    if(s.tarifId==='makarna'&&makarnaSosuMu(s.makarna?.istenenSos)&&makarnaSosuMu(s.makarna?.sos)){
      foto.makarna={istenenSos:s.makarna.istenenSos,sos:s.makarna.sos};
      if((s.makarna.istenenSosAdedi===1||s.makarna.istenenSosAdedi===3)&&Number.isInteger(s.makarna.soslanan)&&s.makarna.soslanan!>=0&&s.makarna.soslanan!<=7){
        foto.makarna.istenenSosAdedi=s.makarna.istenenSosAdedi;foto.makarna.soslanan=s.makarna.soslanan;
      }
      const porsiyon=makarnaPorsiyonunuOku(s.makarna.porsiyon);
      if(porsiyon)foto.makarna.porsiyon=porsiyon;
      if(s.makarna.sos==='yesil'&&Number.isInteger(s.makarna.pestoMaskesi)&&s.makarna.pestoMaskesi!>=0&&s.makarna.pestoMaskesi!<=7)foto.makarna.pestoMaskesi=s.makarna.pestoMaskesi;
    }
    return foto;
  }
  if(s.tarifId==='pizza')return pizzaTabaginiOku(s)??undefined;
  if(s.tarifId!=='corba'&&s.tarifId!=='salata')return;
  const sus=susuOku(s.tarifId,s.sus);if(!sus)return;
  const hazirlik=siparisiOku(s.tarifId,s[s.tarifId]);
  const tabak:SebzeTabagi={tarifId:s.tarifId,sus};
  if(s.ozel===true)tabak.ozel=true;
  if(hazirlik?.servisEdildi)tabak[s.tarifId]=hazirlik;
  if(s.istenenSus&&susSecenekleri(s.tarifId).includes(s.istenenSus))tabak.istenenSus=s.istenenSus;
  if(s.puan&&[1,2,3].includes(s.puan))tabak.puan=s.puan;
  return tabak;
}
export function defteriAc(): Defter {
  const defter: Defter = {
    tepsiler: bosTepsiler(), secili: 'corba', ekran: 'siparis', siparisler: {}, tezgahSahibi:{},sakliTezgahlar:{},tabaklar: { corba: 0, salata: 0 }, pismeAni: 0,
    sessiz: false, susler: {}, gecmis: [], ozelIstekler: {},
    porsiyonlar: { corba: { adet: 0, yuklu: false }, salata: { adet: 0, yuklu: false } },
  };
  try {
    const k = kaydiCoz(localStorage.getItem(ANAHTAR) ?? 'null');
    if (!k || typeof k !== 'object') return defter;
    for (const id of ['corba', 'salata'] as const) {
      defter.siparisler[id] = siparisiOku(id, k.siparisler?.[id]);
      const masalar=['',...menuler.filter(m=>m.parcalar.includes(id)).map(m=>m.id)];
      const eskiSahip=k.tezgahSahibi?.[id]??(k.tepsiler?.oynanan===id?k.tepsiler.secili:'');
      if(masalar.includes(eskiSahip))defter.tezgahSahibi[id]=eskiSahip;
      for(const masa of masalar){
        const yol=id+'/'+masa, ham=k.sakliTezgahlar?.[yol];
        if(!ham||masa===(defter.tezgahSahibi[id]??''))continue;
        const siparis=siparisiOku(id,ham.siparis);
        if(!siparis||siparis.servisEdildi)continue;
        const adet=siparis.karistirma===KARISTIRMA_HEDEFI?sayi(ham.porsiyon?.adet,2):0;
        defter.sakliTezgahlar[yol]={siparis,porsiyon:{adet,yuklu:siparis.karistirma===KARISTIRMA_HEDEFI&&adet<2&&ham.porsiyon?.yuklu===true},
          sus:susuOku(id,ham.sus),istek:ham.istek&&susSecenekleri(id).includes(ham.istek)?ham.istek:undefined,pismeAni:sayi(ham.pismeAni,Date.now()+2400)};
      }
      defter.tabaklar[id] = sayi(k.tabaklar?.[id], 99999);
      defter.susler[id] = susuOku(id, k.susler?.[id]);
      const istek = k.ozelIstekler?.[id];
      if (istek && susSecenekleri(id).includes(istek)) defter.ozelIstekler[id] = istek;
      const siparis = defter.siparisler[id];
      if(id==='salata' && siparis && !siparis.servisEdildi){
        if(!sosMu(defter.ozelIstekler.salata))defter.ozelIstekler.salata=yeniOzelIstek('salata',defter.tabaklar.salata);
        if(!sosMu(defter.susler.salata?.id))delete defter.susler.salata;
      }
      if (siparis?.karistirma === KARISTIRMA_HEDEFI) {
        const p = k.porsiyonlar?.[id];
        // Önceki sürümde servis tezgâhına gelmiş yemek zaten tabağa konmuştu.
        const eskidenTabakta = !p && (k.secili === id && k.ekran === 'servis' || !!defter.susler[id]);
        const adet = siparis.servisEdildi || eskidenTabakta ? 2 : sayi(p?.adet, 2);
        defter.porsiyonlar[id] = { adet, yuklu: adet < 2 && p?.yuklu === true };
      }
    }
    for (const kayit of Array.isArray(k.gecmis) ? k.gecmis.slice(-8) : []) {
      const servis=servisiOku(kayit);
      if(servis && !(servis.tarifId==='pizza' && defter.gecmis.some(v=>v.tarifId==='pizza' && v.no===servis.no)))defter.gecmis.push(servis);
    }
    defter.tepsiler=tepsileriOku(k.tepsiler,servisiOku);
    defter.secili = k.secili === 'salata' ? 'salata' : 'corba';
    defter.sessiz = k.sessiz === true;
    defter.pismeAni = sayi(k.pismeAni, Date.now() + 2400);
    const siparis = defter.siparisler[defter.secili];
    if (siparis && k.ekran && EKRANLAR.includes(k.ekran)) defter.ekran = k.ekran;
    if (siparis?.servisEdildi && defter.ekran !== 'siparis') defter.ekran = 'servis';
  } catch { /* Cihaz kayıt saklamıyorsa tezgâh yine oynanabilir. */ }
  return defter;
}
interface FotografliKayit {surum:'fotograf-1';fotograflar:string[];defter:Partial<Defter>}
function kaydiCoz(metin:string):Partial<Defter>|null{
  const ham=JSON.parse(metin);
  if(ham?.surum!=='fotograf-1')return ham;
  const {fotograflar,defter}=ham as FotografliKayit;
  if(!Array.isArray(fotograflar)||!defter)return null;
  // The stored tree has only photograph indices in fields named resim.
  function ac(deger:unknown){
    if(!deger||typeof deger!=='object')return;
    for(const [alan,icerik] of Object.entries(deger)){
      if(alan==='resim'&&typeof icerik==='number'&&Number.isSafeInteger(icerik))
        (deger as Record<string,unknown>)[alan]=fotograflar[icerik];
      else ac(icerik);
    }
  }
  ac(defter);return defter;
}
function fotograflariBirlestir(defter:Defter){
  const fotograflar:string[]=[];
  const sira=new Map<string,number>();
  const metin=JSON.stringify(defter,(ad,icerik)=>{
    if(ad!=='resim'||typeof icerik!=='string'||!icerik.startsWith('data:image/'))return icerik;
    let no=sira.get(icerik);
    if(no===undefined){no=fotograflar.length;fotograflar.push(icerik);sira.set(icerik,no);}
    return no;
  });
  return '{"surum":"fotograf-1","fotograflar":'+JSON.stringify(fotograflar)+',"defter":'+metin+'}';
}
export function kaydet(defter: Defter) {
  try { localStorage.setItem(ANAHTAR,JSON.stringify(defter)); }
  catch(hata){
    if(hata instanceof DOMException&&hata.name==='QuotaExceededError'){
      try{localStorage.setItem(ANAHTAR,fotograflariBirlestir(defter));}
      catch{/* Cihaz tamamen doluysa son başarılı kayıt korunur. */}
    }
  }
}
