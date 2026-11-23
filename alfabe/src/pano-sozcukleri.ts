import { heceler as temel, parcaSesi as temelParcaSesi } from './hece-sozlugu';
import { oburResimleri } from './obur-resimleri';
import { baskaOrnekler } from './harf-kutusu-kartlari';
import { acikHeceSesi, hecele } from './posta-kutusu-secim';
import { resim } from './resimler';
import dersler from './harfler.json';
import { ekKutuKartlari } from './kutu-ek-resimler';
import kiraz from '../../assets/meyveler/kiraz.webp';
import karpuz from '../../assets/meyveler/karpuz.webp';
import patates from '../../assets/meyveler/patates.webp';
import domates from '../../assets/meyveler/domates.webp';
import kelebek from '../../assets/canlan/kelebek.webp';
import { havuzSozcukleri as havuzYasa } from './sozcuk-havuzu';
import { yasGrubu } from './yas-grubu';

// Yalnız hece birleştirmeye uygun sözcükler (en az iki hece, Pano kullanımı); tek heceli jip, kuş, mum derste kalır.
const havuzSozcukleri=havuzYasa(yasGrubu).filter(s=>s.pano);
export const heceler:Record<string,string[]>={...temel,
  '13':['je', 'ton'],
  '21':['ra', 'ket'],
  'kiraz':['ki', 'raz'],
  'karpuz':['kar', 'puz'],
  'patates':['pa', 'ta', 'tes'],
  'domates':['do', 'ma', 'tes'],
  'kelebek':['ke', 'le', 'bek'],
  'havlu':['hav', 'lu'],
  'lamba':['lam', 'ba'],
  'rende':['ren', 'de'],
  'vagon':['va', 'gon'],
  'civciv':['civ', 'civ'],
  'ucurtma':['u', 'çurt', 'ma'],
  // Sözcük havuzu (Astra Harf-H6): yalnız resmi gelmiş ve bu yaşa uygun sözcükler (sozcuk-havuzu.ts).
  ...Object.fromEntries(havuzSozcukleri.map(s=>[s.id,s.heceler])),
};
const nesneler:Record<string,string>={kiraz,karpuz,patates,domates,kelebek,...Object.fromEntries(ekKutuKartlari.map(k=>[k.id,k.gorsel])),
  ...Object.fromEntries(havuzSozcukleri.map(s=>[s.id,s.gorsel]))};
export const panoResmi=(id:string)=>nesneler[id]??resim(id);
// Ses kayıtları yalnız var mı diye (dosya yüklenmez).
const kayitlar=import.meta.glob('../../assets/alfabe/ses/*.mp3');
const kayitVar=(id:string)=>!!kayitlar['../../assets/alfabe/ses/'+id+'.mp3'];
const UNLU=/[aeıioöuü]/;
/** Hecenin Ceren kaydı: Pano/havuz kaydı; yoksa açık hecede Hece Evleri kaydı (ev-k-a gibi). */
export function parcaSesi(h:string):string{
  const p=temelParcaSesi(h);
  if(kayitVar(p))return p;
  if(h.length===2&&!UNLU.test(h[0])&&UNLU.test(h[1])){const e=acikHeceSesi(h[0],h[1]);if(kayitVar(e))return e;}
  return p;
}
// Çizim gerektirmeyen ek sözcükler (21 Kasım, yönetici: Trambolin, Pano ve Hece Kulağı'na yeni sözcükler): Obur ve
// Harf Kutusu kartlarının resimli, Ceren kayıtlı sözcükleri. Yalnız tek sözcüklü, 2–3 heceli ve bütün hecelerinin kaydı olanlar;
// listede zaten olan ad bir kez. Kaydı olmayan hece sözcüğü dışarıda bırakır, tahmin edilmez.
const ekAdlar=new Map<string,string>(),ekAdSesleri=new Map<string,string>();
{
  const ad0=(id:string)=>(dersler.find(d=>d.id===id)?.example??havuzSozcukleri.find(s=>s.id===id)?.ad??heceler[id].join('')).toLocaleLowerCase('tr');
  const gorulen=new Set(Object.keys(heceler).map(ad0));
  const adaylar=[...oburResimleri.map(k=>({id:k.id,ad:k.ad,gorsel:k.resim,ses:k.ses})),...ekKutuKartlari,...baskaOrnekler];
  for(const k of adaylar){
    const ad=k.ad.toLocaleLowerCase('tr');
    if(!k.gorsel||!kayitVar(k.ses)||ad.includes(' ')||gorulen.has(ad)||Object.hasOwn(heceler,k.id))continue;
    const hc=hecele(ad);
    if(hc.length<2||hc.length>3||!hc.every(h=>kayitVar(parcaSesi(h))))continue;
    gorulen.add(ad);heceler[k.id]=hc;nesneler[k.id]=k.gorsel;
    ekAdlar.set(k.id,k.ad[0].toLocaleUpperCase('tr')+k.ad.slice(1));ekAdSesleri.set(k.id,k.ses);
  }
}
export const panoAdi=(id:string)=>dersler.find(d=>d.id===id)?.example??havuzSozcukleri.find(s=>s.id===id)?.ad??ekAdlar.get(id)??heceler[id].join('');
// Sözcüğün Ceren kaydı: havuz sözcüğünde listedeki `ses` ("ağaç" kutu-ad-agac gibi), öbürlerinde pano-ad-<id>.
const havuzAdSesleri=new Map(havuzSozcukleri.map(s=>[s.id,s.ses]));
export const adSesi=(id:string)=>havuzAdSesleri.get(id)??ekAdSesleri.get(id)??'pano-ad-'+id;
// Çalan kayıt bir hece ya da sözcük kaydı mı (Pano parmak hareketiyle kesmesin diye).
const panoSesleri=new Set([...havuzAdSesleri.values(),...havuzSozcukleri.flatMap(s=>s.heceSesleri),...ekAdSesleri.values(),
  ...[...ekAdlar.keys()].flatMap(id=>heceler[id].map(parcaSesi))]);
export const panoSesiMi=(id:string)=>id.startsWith('pano-hece-')||id.startsWith('pano-ad-')||panoSesleri.has(id);
