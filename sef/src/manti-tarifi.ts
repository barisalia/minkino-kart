export type MantiIci='peynir'|'havuc';
export type MantiSosu='yogurt'|'domates';
export interface Manti {ic?:MantiIci;kat:number[];tencerede:number[];sure:number;tabakta:number[];sos?:MantiSosu;soslar:number[];lokmaSoslari?:Partial<Record<number,MantiSosu>>;evre:'doldur'|'katla'|'hasla'|'tabak'|'sos'|'sun'}
export const yeniManti=():Manti=>({evre:'doldur',kat:[0,0,0],tencerede:[],sure:0,tabakta:[],soslar:[]});
export function mantiIstegi(menu:string):{ic:MantiIci;sos:MantiSosu}{
  return menu==='havuc-manti'?{ic:'havuc',sos:'domates'}:{ic:'peynir',sos:'yogurt'};
}
export const mantiIsimleri={peynir:'Peynir',havuc:'Havuç',yogurt:'Yoğurt',domates:'Domates sosu'};
export const mantiKivami=(sure:number)=>sure<2400?'erken':sure<=8000?'tam':'fazla';
type SosluManti=Pick<Manti,'sos'|'soslar'|'lokmaSoslari'>;
export function lokmaninSosu(t:SosluManti,i:number){
  return t.soslar.includes(i)?t.lokmaSoslari?.[i]??t.sos:undefined;
}
/** Preserve sauce already on the plate when the child picks up the other spoon. */
export function mantiSosunuSec(t:Manti,sos:MantiSosu){
  if(!t.lokmaSoslari){
    t.lokmaSoslari={};
    if(t.sos)for(const i of t.soslar)t.lokmaSoslari[i]=t.sos;
  }
  t.sos=sos;
}
export function mantiyiSosla(t:Manti,i:number,sos:MantiSosu){
  mantiSosunuSec(t,sos);
  t.lokmaSoslari![i]=sos;
  if(!t.soslar.includes(i))t.soslar.push(i);
}
export function mantiDuzeltme(onceki:Manti,id:string):Manti{
  if(onceki.ic!==mantiIstegi(id).ic)return yeniManti();
  if(mantiKivami(onceki.sure)!=='tam')return {...yeniManti(),evre:'hasla',ic:onceki.ic,kat:[...onceki.kat]};
  return {...structuredClone(onceki),evre:'sos'};
}
export function mantiPuan(t:Manti,id:string):1|2|3{
  const hedef=mantiIstegi(id),hata=Number(t.ic!==hedef.ic)+Number([0,1,2].some(i=>lokmaninSosu(t,i)!==hedef.sos))+Number(mantiKivami(t.sure)!=='tam');
  return hata===0?3:hata===1?2:1;
}
export function mantiOku(ham:Partial<Manti>|undefined){
  if(!ham||typeof ham!=='object')return;
  const t=yeniManti();
  if(ham.ic!=='peynir'&&ham.ic!=='havuc')return t;
  t.ic=ham.ic;t.evre='katla';
  if(Array.isArray(ham.kat))t.kat=t.kat.map((_,i)=>Number.isInteger(ham.kat![i])?Math.max(0,Math.min(4,ham.kat![i])):0);
  if(t.kat.some(n=>n!==4))return t;
  t.evre='hasla';
  const benzersiz=(n:unknown)=>Array.isArray(n)?[...new Set<number>(n.filter(i=>[0,1,2].includes(i)))]:[];
  t.tencerede=benzersiz(ham.tencerede);
  if(t.tencerede.length!==3)return t;
  if(Number.isFinite(ham.sure))t.sure=Math.max(0,Math.min(11000,ham.sure!));
  if(!['tabak','sos','sun'].includes(ham.evre!))return t;
  t.evre='tabak';t.tabakta=benzersiz(ham.tabakta);
  if(t.tabakta.length<3)return t;
  t.evre='sos';
  if(ham.sos==='domates'||ham.sos==='yogurt'){t.sos=ham.sos;t.soslar=benzersiz(ham.soslar);}
  if(ham.lokmaSoslari&&typeof ham.lokmaSoslari==='object'&&t.sos){
    t.lokmaSoslari={};
    for(const i of t.soslar){
      const sos=ham.lokmaSoslari[i];
      t.lokmaSoslari[i]=sos==='domates'||sos==='yogurt'?sos:t.sos;
    }
  }
  if(t.sos&&t.soslar.length&&ham.evre==='sun')t.evre='sun';
  return t;
}
