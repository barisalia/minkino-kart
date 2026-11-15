import { yazilar,yolNoktalari,type Isaret } from './yazi-yollari';
import { bosLimon,limonuOku,meyveKarti,type LimonKarti } from './serbest-yazi';
import type { Nokta } from './defter';

export const sergi = [
  { ad:'armut', sanat:'sergi-armut', isim:'Armut', sayi:'1', harf:'A' },
  { ad:'elma', sanat:'sergi-elma', isim:'Elma', sayi:'2', harf:'E' },
  { ad:'marakas', sanat:'sergi-marakas', isim:'Marakas', sayi:'3', harf:'M' }
] as const;
const lale={ad:'lale',sanat:'bahce-0',isim:'Lale',sayi:'1',harf:'L'} as const;
export const rafKarti=(d:SergiDefteri,i:number)=>i===0&&d.ilkRaf==='lale'?lale:sergi[i];
export const sesCiftleri=[
  [{ad:'Armut',sanat:'sergi-armut',ses:'armut',ilk:'A',es:true},{ad:'Elma',sanat:'sergi-elma',ses:'elma',ilk:'E',es:false}],
  [{ad:'Limon',sanat:'meyve-5',ses:'limon',ilk:'L',es:false},{ad:'Elma',sanat:'sergi-elma',ses:'elma',ilk:'E',es:true}],
  [{ad:'Marakas',sanat:'sergi-marakas',ses:'marakas',ilk:'M',es:true},{ad:'Davul',sanat:'muzik-0',ses:'davul',ilk:'D',es:false}]
] as const;
export const tepsiler=[[2,1],[2,1],[2,3]] as const;
export interface SergiDefteri {
  kart:number;
  ilkRaf:'armut'|'lale';
  donus:'muzik'|'kalemlik'|'album'|null;
  limon:LimonKarti;
  sayilan:number[];
  dagitim:boolean;
  kalem:boolean;
  asili:boolean;
  sesBulundu:boolean;
  izler:Partial<Record<Isaret,Nokta[][]>>;
}
export const bosSergi=():SergiDefteri=>({kart:0,ilkRaf:'armut',donus:null,limon:bosLimon(),sayilan:[],dagitim:false,kalem:false,asili:false,sesBulundu:false,izler:{}});
export function sergiyiOku(g?:Partial<SergiDefteri>):SergiDefteri{
  const d=bosSergi();if(!g)return d;
  d.limon=limonuOku(g.limon);
  d.donus=g.donus==='muzik'||g.donus==='kalemlik'||g.donus==='album'?g.donus:null;
  if(Number.isInteger(g.kart)&&g.kart!>=0&&g.kart!<=sergi.length)d.kart=g.kart!;
  // Eski sergide asılan L etiketini çocuğun yazdığı biçimiyle sakla.
  if(g.ilkRaf==='lale'||(!g.ilkRaf&&(d.kart>0||g.asili)))d.ilkRaf='lale';
  if(Array.isArray(g.sayilan))d.sayilan=[...new Set(g.sayilan.filter(n=>Number.isInteger(n)&&n>=0&&n<=d.kart&&n<3))];
  d.kalem=g.kalem===true&&d.sayilan.length===d.kart+1;
  d.dagitim=g.dagitim===true&&d.sayilan.length<d.kart+1;
  d.asili=g.asili===true&&d.kalem;
  d.sesBulundu=g.sesBulundu===true&&(g.ilkRaf!==undefined||d.kart>0||d.asili);
  for(const key of Object.keys(yazilar) as Isaret[]){
    const cizgiler=g.izler?.[key];if(!Array.isArray(cizgiler))continue;
    d.izler[key]=[];
    for(const [i,yol] of yazilar[key].yollar.entries()){
      const n=cizgiler[i];if(!Array.isArray(n))break;
      const limit=yolNoktalari(yol).length;
      const temiz:Nokta[]=[];
      for(const p of n.slice(0,limit)){
        if(!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isFinite(v)&&v>=0&&v<=240))break;
        temiz.push([p[0],p[1]]);
      }
      d.izler[key]!.push(temiz);
      if(temiz.length<limit)break;
    }
  }
  return d;
}
export function siradakiCizgi(d:SergiDefteri,key:Isaret){
  return yazilar[key].yollar.findIndex((yol,i)=>(d.izler[key]?.[i]?.length??0)<yolNoktalari(yol).length);
}
export function sergiAsamasi(d:SergiDefteri){
  const kart=rafKarti(d,d.kart);if(!kart)return d.limon.asama==='sayi'||d.limon.asama==='harf'?'serbest':'sergi';
  if(!d.sesBulundu)return 'ses';
  if(siradakiCizgi(d,kart.harf)!==-1)return 'harf';
  if(!d.kalem)return 'say';
  if(siradakiCizgi(d,kart.sayi)!==-1)return 'sayi';
  return d.asili?'asildi':'yerlestir';
}
export function sergiSozu(d:SergiDefteri){
  const asama=sergiAsamasi(d),kart=rafKarti(d,d.kart);
  const meyve=meyveKarti(d.limon);
  if(asama==='sergi')return d.limon.asama==='bitti'?'yazi_sergi':'mino_sergi_'+d.limon.meyve;
  if(asama==='serbest')return 'yazi_'+meyve.ses+'_'+(d.limon.asama==='sayi'?'iki':meyve.harfSesi);
  if(asama==='say')return d.dagitim?'say_dokun':'yazi_'+kart.ad+(d.sayilan.length===d.kart+1?'_toplam':'_say');
  if(asama==='ses')return 'yazi_'+kart.ad+'_ses';
  if(asama==='yerlestir')return 'yazi_raflar';
  if(asama==='asildi')return d.kart===1?'zip_yazi_elma':'mino_yazi_'+kart.ad;
  if(asama==='harf'){
    const i=siradakiCizgi(d,kart.harf);
    if(kart.harf==='A'&&i===1)return 'yazi_a_orta';
    if(kart.harf==='E'&&i>0)return ['','yazi_e_ust','yazi_e_orta','yazi_e_alt'][i];
  }
  return 'yazi_'+yazilar[asama==='sayi'?kart.sayi:kart.harf].ses;
}
export function murekkep(noktalar:Nokta[]){
  return noktalar.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' ');
}
