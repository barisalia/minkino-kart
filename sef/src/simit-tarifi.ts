export type SimitFisi='susamli-simit'|'hashasli-simit'|'sade-simit'|'iki-renk-simit';
export type Tohum='susam'|'hashas';
export type Kaplama=Tohum|'sade'|'karisik';
export type SimitRengi='acik'|'altin'|'koyu';
export const simitFisleri:Record<SimitFisi,{kaplama:Kaplama;renk:SimitRengi}>={
  'susamli-simit':{kaplama:'susam',renk:'altin'},
  'hashasli-simit':{kaplama:'hashas',renk:'altin'},
  'iki-renk-simit':{kaplama:'karisik',renk:'altin'},
  'sade-simit':{kaplama:'sade',renk:'altin'}
};
export const kaplamaAdi={karisik:'Susam ve haşhaş',sade:'Sade',susam:'Susam',hashas:'Haşhaş'};
export const simitRenkAdi={acik:'Az pişmiş',altin:'Altın renginde',koyu:'Fazla kızarmış'};
export interface SimitTaslak {evre:'uzat'|'bagla'|'kapla'|'firin'|'sun';uzunluk:number;sol:number;sag:number;kaplama?:Kaplama;ilkYari?:Tohum;yarili?:boolean;isi:number}
export function simitFisi(id:string):SimitFisi{if(id==='babaanne-simidi'||id==='babaanne-simit-tart')return 'hashasli-simit';if(id==='anne-kahvaltisi')return 'iki-renk-simit';return Object.hasOwn(simitFisleri,id)?id as SimitFisi:'susamli-simit';}
export function yeniSimit():SimitTaslak{return {evre:'uzat',uzunluk:0,sol:0,sag:0,isi:0};}
export function simitRengi(isi:number):SimitRengi{return isi<2600?'acik':isi<6400?'altin':'koyu';}
export function simitPuani(t:SimitTaslak,id:SimitFisi):1|2|3{
  const hedef=simitFisleri[id];
  const kayip=(t.kaplama===hedef.kaplama?0:1)+(simitRengi(t.isi)===hedef.renk?0:1);
  return kayip===0?3:kayip===1?2:1;
}
export function simitOku(eski:Partial<SimitTaslak>|undefined){
  if(!eski||typeof eski!=='object')return;
  const t=yeniSimit(),sinir=(n:unknown,ust:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(ust,Math.max(0,n)):0;
  t.uzunluk=sinir(eski.uzunluk,1);t.sol=sinir(eski.sol,1);t.sag=sinir(eski.sag,1);t.isi=sinir(eski.isi,8200);
  if(eski.ilkYari==='susam'||eski.ilkYari==='hashas')t.ilkYari=eski.ilkYari;
  if(eski.yarili===true)t.yarili=true;
  if(eski.kaplama==='karisik'||eski.kaplama==='sade'||eski.kaplama==='susam'||eski.kaplama==='hashas')t.kaplama=eski.kaplama;
  if(eski.evre&&['uzat','bagla','kapla','firin','sun'].includes(eski.evre))t.evre=eski.evre;
  if(t.evre!=='uzat'&&t.uzunluk<1)t.evre='uzat';
  if(t.evre!=='uzat'&&t.evre!=='bagla'&&(t.sol<1||t.sag<1))t.evre='bagla';
  if((t.evre==='firin'||t.evre==='sun')&&!t.kaplama)t.evre='kapla';
  return t;
}
