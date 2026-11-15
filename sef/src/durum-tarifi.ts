export const icler=['marul','domates','peynir','salatalik','zeytin'] as const;
export type DurumIci=typeof icler[number];
export const icAdi:Record<DurumIci,string>={marul:'Marul',domates:'Domates',peynir:'Kaşar',salatalik:'Salatalık',zeytin:'Zeytin'};
export type Kat={tur:DurumIci;x:number;y:number};
export type Durum={evre:'diz'|'sar'|'kes'|'sun';katlar:Kat[];sarma:number;kesimler:number[]};
export const yeniDurum=():Durum=>({evre:'diz',katlar:[],sarma:0,kesimler:[]});
export const durumIstegi=(id:string):readonly DurumIci[]=>id==='zeytinli-durum'?['peynir','salatalik','zeytin']:['marul','domates','peynir'];
export const durumBolgesi=(x:number,kesimler:readonly number[])=>kesimler.reduce((n,kes)=>n+Number(x>=kes),0);
export function dilimIcleri(t:Durum,i:number){
  return t.katlar.filter(k=>durumBolgesi(k.x,t.kesimler)===i);
}
export function durumYorumu(t:Durum,id:string):'tam'|'eksik'|'fazla'|'dagilim'{
  const hedef=durumIstegi(id);
  if(t.katlar.some(k=>!hedef.includes(k.tur)))return 'fazla';
  if(hedef.some(tur=>!t.katlar.some(k=>k.tur===tur)))return 'eksik';
  if([0,1,2].some(i=>!dilimIcleri(t,i).length))return 'dagilim';
  return 'tam';
}
export const durumPuani=(t:Durum,id:string):1|2|3=>{
  const hedef=durumIstegi(id);
  const fark=icler.filter(tur=>hedef.includes(tur)!==t.katlar.some(k=>k.tur===tur)).length;
  const bos=[0,1,2].some(i=>!dilimIcleri(t,i).length);
  return Math.max(1,3-fark-Number(bos)) as 1|2|3;
};
export function durumOku(raw?:Partial<Durum>){
  if(!raw||typeof raw!=='object')return;
  const t=yeniDurum();
  if(Array.isArray(raw.katlar))t.katlar=raw.katlar.slice(0,18).filter(k=>k&&icler.includes(k.tur)&&Number.isFinite(k.x)&&Number.isFinite(k.y)&&Math.hypot((k.x-50)/44,(k.y-50)/43)<=1.001).map(k=>({tur:k.tur,x:k.x,y:k.y}));
  if(!t.katlar.length||!['sar','kes','sun'].includes(String(raw.evre)))return t;
  t.evre='sar';t.sarma=Number.isFinite(raw.sarma)?Math.max(0,Math.min(1,raw.sarma!)):0;
  if(t.sarma<1)return t;
  t.evre='kes';
  if(Array.isArray(raw.kesimler)){
    const [a,b]=raw.kesimler;
    if(Number.isFinite(a)&&a>=19&&a<=46)t.kesimler.push(a);
    if(t.kesimler.length&&Number.isFinite(b)&&b>=54&&b<=81)t.kesimler.push(b);
  }
  if(t.kesimler.length===2)t.evre='sun';
  return t;
}
