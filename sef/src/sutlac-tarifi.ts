export const sutlacDesenleri=['yildiz','kalp','cicek'] as const;
export type SutlacDeseni=typeof sutlacDesenleri[number];
export const sutlacDesenAdi={yildiz:'Yıldız',kalp:'Kalp',cicek:'Çiçek'} as const;
export type SutlacKivami='sulu'|'ipeksi'|'koyu';
export interface SutlacPorsiyonu {desen:SutlacDeseni;toz:number;kivam:SutlacKivami;doluluk:number}
export interface SutlacTaslagi {
  adim:0|1|2|3|4; sut:number;pirinc:boolean;isi:number;karistirma:number;doluluk:number;
  desen?:SutlacDeseni;toz:number;kepcede?:boolean;
}
export const sutlacDeseniOku=(v:unknown):SutlacDeseni=>v==='kalp'||v==='cicek'?v:'yildiz';
const birim=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.min(1,Math.max(0,v)):0;
export const yeniSutlac=():SutlacTaslagi=>({adim:0,sut:0,pirinc:false,isi:0,karistirma:0,doluluk:0,toz:0});
export function sutlacTaslaginiOku(v?:Partial<SutlacTaslagi>):SutlacTaslagi{
  const t=yeniSutlac();if(!v||typeof v!=='object')return t;
  const adim=Number.isInteger(v.adim)?Math.min(4,Math.max(0,v.adim!)):0;
  t.sut=birim(v.sut);t.pirinc=v.pirinc===true;
  if(!adim||t.sut<.98||!t.pirinc)return t;
  t.adim=1;t.isi=birim(v.isi);t.karistirma=birim(v.karistirma);
  if(adim===1||t.isi<.14||t.karistirma<.12)return t;
  t.adim=2;t.doluluk=birim(v.doluluk);t.kepcede=t.doluluk<1&&v.kepcede===true;
  if(adim===2||t.doluluk<.35)return t;
  t.adim=3;if(sutlacDesenleri.includes(v.desen!)){t.desen=v.desen;t.toz=birim(v.toz);}
  if(adim===4&&t.desen&&t.toz>=.18)t.adim=4;
  return t;
}
export function sutlacKivami(t:Pick<SutlacTaslagi,'isi'|'karistirma'>):SutlacKivami{
  if(t.isi>.87)return 'koyu';
  return t.isi>=.36&&t.karistirma>=.53?'ipeksi':'sulu';
}
export const sutlacOrnegi=(desen:SutlacDeseni='yildiz'):SutlacPorsiyonu=>({desen,toz:1,kivam:'ipeksi',doluluk:.89});
export function sutlacPorsiyonunuOku(v:unknown):SutlacPorsiyonu|undefined{
  if(!v||typeof v!=='object')return;
  const p=v as Partial<SutlacPorsiyonu>;
  if(!sutlacDesenleri.includes(p.desen!)||!['ipeksi','sulu','koyu'].includes(p.kivam??'')||
      !Number.isFinite(p.toz)||!Number.isFinite(p.doluluk)||birim(p.toz)<.18||birim(p.doluluk)<.35)return;
  return {desen:p.desen!,kivam:p.kivam!,toz:birim(p.toz),doluluk:birim(p.doluluk)};
}
export function sutlacHazirlamaPuani(p:SutlacPorsiyonu):1|2|3{
  return Math.max(1,3-Number(p.kivam!=='ipeksi')-Number(p.toz<.65)-Number(p.doluluk<.72)) as 1|2|3;
}
