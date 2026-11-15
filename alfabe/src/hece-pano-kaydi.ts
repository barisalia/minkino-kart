import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { heceler } from './pano-sozcukleri';
import { tamDers } from './yas-grubu';

export type PanoTuru = {
  ileri?: boolean;
  kartlar: string[];
  taslar: string[];
  dolu: string[];
  yardim: string[];
  bitti: boolean;
};
type Gecmis = { tur: number; sozler: Record<string, { kez:number; son:number; tekrar:boolean }> };
const turAnahtari='minkino-hece-pano-tur-v1';
const gecmisAnahtari='minkino-hece-pano-kelimeler-v1';

function oku(anahtar:string){
  try{return JSON.parse(dersKaydiniOku(anahtar)||'null');}catch{return null;}
}
function gecmisOku():Gecmis{
  const veri=oku(gecmisAnahtari);
  const sonuc:Gecmis={tur:0,sozler:{}};
  if(!Number.isSafeInteger(veri?.tur)||veri.tur<0)return sonuc;
  sonuc.tur=veri.tur;
  for(const id of Object.keys(heceler)){
    const kayit=veri.sozler?.[id];
    if(kayit&&Number.isSafeInteger(kayit.kez)&&kayit.kez>0&&Number.isSafeInteger(kayit.son)&&kayit.son>=0&&kayit.son<=sonuc.tur){
      sonuc.sozler[id]={kez:kayit.kez,son:kayit.son,tekrar:kayit.tekrar===true};
    }
  }
  return sonuc;
}

export function karistir<T>(liste: T[]):T[] {
  const kopya=[...liste];
  for(let i=kopya.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [kopya[i],kopya[j]]=[kopya[j],kopya[i]];
  }
  return kopya;
}
export function turuGetir():PanoTuru|undefined{
  const k=oku(turAnahtari);
  if(!k||!Array.isArray(k.kartlar)||k.kartlar.length!==3||new Set(k.kartlar).size!==3||
    !k.kartlar.every((id:unknown)=>typeof id==='string'&&Object.hasOwn(heceler,id)))return;
  const boylar=k.kartlar.map((id:string)=>heceler[id].length);
  if(!boylar.includes(2)||(tamDers?!boylar.includes(3):boylar.includes(3)))return;
  const taslar=k.kartlar.flatMap((id:string)=>heceler[id]);
  if(!Array.isArray(k.taslar))return;
  const kalan=[...k.taslar];
  for(const h of taslar){
    const i=kalan.indexOf(h);if(i<0)return;kalan.splice(i,1);
  }
  const fazla=k.ileri===true?(tamDers?2:1):0;
  if(kalan.length!==fazla||new Set(kalan).size!==fazla||
    kalan.some(h=>taslar.includes(h)||!Object.values(heceler).some(s=>s.includes(h))))return;
  const yuvalar=k.kartlar.flatMap((id:string)=>heceler[id].map((_,i)=>id+'-'+i));
  if(!Array.isArray(k.dolu)||new Set(k.dolu).size!==k.dolu.length||!k.dolu.every((s:unknown)=>yuvalar.includes(s)))return;
  if(!Array.isArray(k.yardim)||!k.yardim.every((id:unknown)=>k.kartlar.includes(id)))return;
  return {ileri:k.ileri===true,kartlar:k.kartlar,taslar:k.taslar,dolu:k.dolu,yardim:k.yardim,bitti:k.dolu.length===taslar.length};
}
export function turuSakla(t:PanoTuru){dersKaydiniYaz(turAnahtari,JSON.stringify(t));}
export function panoyuBirak(){dersKaydiniYaz(turAnahtari,null);}
export function yeniPano(ileri=false):PanoTuru{
  const gecmis=gecmisOku();
  // Yardım alınan sözcük bir pano arayla yeni bir bağlamda tekrar gelir.
  function oncelik(id:string){
    const kayit=gecmis.sozler[id];
    if(!kayit)return 1;
    if(kayit.son===gecmis.tur)return 1000;
    if(kayit.tekrar)return 0;
    return 2+kayit.kez;
  }
  const adaylar=karistir(Object.keys(heceler)).sort((a,b)=>oncelik(a)-oncelik(b));
  const ucAdet=tamDers?(gecmis.tur%2===0?1:2):0;
  const kartlar=karistir([...adaylar.filter(id=>heceler[id].length===2).slice(0,3-ucAdet),
    ...adaylar.filter(id=>heceler[id].length===3).slice(0,ucAdet)]);
  const parcalar=kartlar.flatMap(id=>heceler[id]);
  const bosta=ileri?karistir([...new Set(Object.values(heceler).flat())].filter(h=>!parcalar.includes(h))).slice(0,tamDers?2:1):[];
  const taslar=karistir([...parcalar,...bosta]);
  if(taslar.every((h,i)=>h===parcalar[i]))taslar.push(taslar.shift()!);
  return {ileri,kartlar,taslar,dolu:[],yardim:[],bitti:false};
}
export function panoyuTamamla(t:PanoTuru){
  if(t.bitti)return;
  const g=gecmisOku();
  g.tur++;
  for(const id of t.kartlar)g.sozler[id]={kez:(g.sozler[id]?.kez??0)+1,son:g.tur,tekrar:t.yardim.includes(id)};
  t.bitti=true;
  dersKaydiniYaz(gecmisAnahtari,JSON.stringify(g));
  turuSakla(t);
}
