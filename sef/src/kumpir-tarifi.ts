export const kumpirAd={misir:'Mısır',tursu:'Turşu',zeytin:'Zeytin',kasar:'Kaşar','koz-biber':'Köz biber',bezelye:'Bezelye'};
export type KumpirMal=keyof typeof kumpirAd;
export const kumpirFisleri={
  'misirli-kumpir':['misir','tursu'],'kumpir-tursu-zeytin':['tursu','zeytin'],'kumpir-misir-zeytin':['misir','zeytin'],
  'kumpir-kasar-bezelye':['kasar','bezelye'],
  'kumpir-koz-zeytin':['koz-biber','zeytin'],
  'kumpir-uc-renk':['kasar','bezelye','koz-biber']
} satisfies Record<string,KumpirMal[]>;
export type KumpirFisi=keyof typeof kumpirFisleri;
export const kumpirIstegi:readonly KumpirMal[]=kumpirFisleri['misirli-kumpir'];
export const kumpirFisiniOku=(id:unknown):KumpirFisi=>typeof id==='string'&&Object.hasOwn(kumpirFisleri,id)?id as KumpirFisi:'misirli-kumpir';
export type KumpirKat={id:KumpirMal;x:number;y:number};
export interface KumpirTaslak{evre:'ac'|'ez'|'koy';yarik:number;ezme:number;katlar:KumpirKat[]}
export const yeniKumpir=():KumpirTaslak=>({evre:'ac',yarik:0,ezme:0,katlar:[]});
export function kumpirdeYer(x:number,y:number){
  const dx=(x-50)/32,dy=(y-43)/23,olcek=Math.max(1,Math.hypot(dx,dy));
  return {x:50+32*dx/olcek,y:43+23*dy/olcek};
}
export function kumpirOku(eski:Partial<KumpirTaslak>|undefined){
  if(!eski||typeof eski!=='object')return;
  const t=yeniKumpir();
  t.yarik=typeof eski.yarik==='number'&&Number.isFinite(eski.yarik)?Math.min(1,Math.max(0,eski.yarik)):0;
  t.ezme=Number.isInteger(eski.ezme)?Math.max(0,Math.min(7,eski.ezme!)):0;
  if(Array.isArray(eski.katlar))for(const k of eski.katlar.slice(0,7)){
    if(k&&Object.hasOwn(kumpirAd,k.id)&&Number.isFinite(k.x)&&Number.isFinite(k.y))t.katlar.push({id:k.id,...kumpirdeYer(k.x,k.y)});
  }
  t.evre=t.yarik<1?'ac':t.ezme!==7?'ez':'koy';
  return t;
}
export function kumpirPuani(t:KumpirTaslak,istek:readonly KumpirMal[]=kumpirIstegi):1|2|3{
  const sec=new Set(t.katlar.map(k=>k.id));
  const fark=istek.filter(id=>!sec.has(id)).length+[...sec].filter(id=>!istek.includes(id)).length;
  return fark===0?3:fark===1?2:1;
}
