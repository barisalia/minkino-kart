export const tostMalzemeleri=['kasar','domates','biber','mantar','zeytin','salatalik'] as const;
export type TostMalzemesi=typeof tostMalzemeleri[number];
export type TostKizarmasi='acik'|'altin'|'citir'|'fazla';
export type TostFisi='peynirli-tost'|'yesil-tost'|'bahce-tostu'|'cift-kasar'|'cift-domates';
export const tostFisleri:Record<TostFisi,{icindekiler:readonly TostMalzemesi[];kizartma:TostKizarmasi;adetli?:boolean}>={
  'cift-kasar':{icindekiler:['kasar','kasar','domates'],kizartma:'citir',adetli:true},
  'cift-domates':{icindekiler:['domates','domates','kasar'],kizartma:'altin',adetli:true},
  'peynirli-tost':{icindekiler:['kasar','domates'],kizartma:'altin'},
  'yesil-tost':{icindekiler:['kasar','biber'],kizartma:'citir'},
  'bahce-tostu':{icindekiler:['mantar','kasar','zeytin'],kizartma:'altin'},
};
export const tostMalzemeAdi={kasar:'Kaşar peyniri',domates:'Domates',biber:'Biber',mantar:'Mantar',zeytin:'Zeytin',salatalik:'Salatalık'};
export const tostKivamAdi={acik:'Az kızarmış',altin:'Altın renginde',citir:'Çıtır',fazla:'Fazla kızarmış'};
export interface TostKati {tur:TostMalzemesi;x:number;y:number}
export interface TostTaslak {evre:'ac'|'diz'|'kapat'|'pres'|'sun';katlar:TostKati[];kizartma:TostKizarmasi;gecen:number}
export function yeniTost():TostTaslak{return {evre:'ac',katlar:[],kizartma:'acik',gecen:0};}
export function tostFisi(id:string):TostFisi{if(id==='kino-tost-molasi')return 'yesil-tost';return Object.hasOwn(tostFisleri,id)?id as TostFisi:'peynirli-tost';}
export function tostKaydiniOku(eski:Partial<TostTaslak>|undefined):TostTaslak|undefined{
  if(!eski||!Array.isArray(eski.katlar))return;
  const t=yeniTost();
  for(const k of eski.katlar.slice(0,8)){
    if(k&&tostMalzemeleri.includes(k.tur)&&Number.isFinite(k.x)&&Number.isFinite(k.y))t.katlar.push({tur:k.tur,x:Math.max(15,Math.min(85,k.x)),y:Math.max(18,Math.min(80,k.y))});
  }
  if(eski.evre&&['ac','diz','kapat','pres','sun'].includes(eski.evre))t.evre=eski.evre;
  t.kizartma=eski.kizartma&&Object.hasOwn(tostKivamAdi,eski.kizartma)?eski.kizartma:'acik';
  if(Number.isFinite(eski.gecen))t.gecen=Math.max(0,Math.min(9000,eski.gecen!));
  return t;
}
export function tostPisme(ms:number):TostKizarmasi{return ms<2500?'acik':ms<5100?'altin':ms<7600?'citir':'fazla';}
export function tostKalitesi(t:TostTaslak,fis:TostFisi):1|2|3{
  const hedef=tostFisleri[fis];
  const sapma=tostMalzemeleri.reduce((toplam,tur)=>{
    const istenen=hedef.icindekiler.filter(i=>i===tur).length;
    const eklenen=t.katlar.filter(k=>k.tur===tur).length;
    const fark=hedef.adetli?Math.abs(istenen-eklenen):Number(!!istenen!==!!eklenen);
    return toplam+fark;
  },0);
  const kayip=sapma+(t.kizartma===hedef.kizartma?0:t.kizartma==='fazla'?2:1);
  return kayip===0?3:kayip===1?2:1;
}
