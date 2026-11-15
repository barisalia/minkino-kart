export type Tarif='salata'|'sis';
export type Kesit=[number,number,number,number];
export type MutfakAsamasi='sec'|'yika'|'kes'|'diz'|'karistir'|'sun'|'bitti';
export interface MeyveMutfagi {
  tarif:Tarif|null;
  secili:number;
  temiz:number[];
  kesitler:(Kesit|null)[];
  tepsi:number[];
  dizilen:number[];
  karisim:number;
  sunuldu:boolean;
  hatira:{tarif:Tarif;dizilen:number[];kesitler:Kesit[]}|null;
}
export const yeniMutfak=():MeyveMutfagi=>({tarif:null,secili:0,temiz:[0,0,0],kesitler:[null,null,null],tepsi:[],dizilen:[],karisim:0,sunuldu:false,hatira:null});
export function mutfakAsamasi(d:MeyveMutfagi):MutfakAsamasi{
  if(!d.tarif)return 'sec';
  if(d.temiz.some(n=>n<3))return 'yika';
  if(d.tepsi.length<6)return 'kes';
  if(d.dizilen.length<6)return 'diz';
  if(d.tarif==='salata'&&d.karisim<4)return 'karistir';
  return d.sunuldu?'bitti':'sun';
}
export function mutfakSozu(d:MeyveMutfagi){
  return {sec:'kres_mutfak_sec',yika:'kres_mutfak_yika',kes:d.kesitler[d.secili]?'kres_mutfak_tepsi':'kres_mutfak_kes',
    diz:'kres_mutfak_'+d.tarif,karistir:'kres_mutfak_karistir',sun:'kres_mutfak_sun',bitti:d.tarif==='sis'?'zip_mutfak_son':'mino_mutfak_son'}[mutfakAsamasi(d)];
}
const tam=(n:unknown,en:number)=>typeof n==='number'&&Number.isInteger(n)?Math.max(0,Math.min(en,n)):0;
const secilenler=(a:unknown)=>Array.isArray(a)?[...new Set<number>(a.filter(i=>Number.isInteger(i)&&i>=0&&i<6))]:[];
const kesit=(a:unknown):a is Kesit=>Array.isArray(a)&&a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=160)&&Math.hypot(a[0]-a[2],a[1]-a[3])>35;
export function mutfagiOku(a?:Partial<MeyveMutfagi>):MeyveMutfagi{
  const d=yeniMutfak();if(!a)return d;
  const h=a.hatira;
  if(h&&(h.tarif==='salata'||h.tarif==='sis')&&secilenler(h.dizilen).length===6&&Array.isArray(h.kesitler)&&h.kesitler.length===3&&h.kesitler.every(kesit))d.hatira=h;
  if(a.tarif!=='salata'&&a.tarif!=='sis')return d;
  d.tarif=a.tarif;d.secili=tam(a.secili,2);
  d.temiz=[0,1,2].map(i=>tam(a.temiz?.[i],3));
  d.kesitler=[0,1,2].map(i=>{const k=a.kesitler?.[i];return d.temiz[i]===3&&kesit(k)?k:null});
  d.tepsi=secilenler(a.tepsi).filter(i=>d.kesitler[i>>1]);
  d.dizilen=secilenler(a.dizilen).filter(i=>d.tepsi.includes(i));
  d.karisim=d.dizilen.length===6?tam(a.karisim,4):0;
  d.sunuldu=a.sunuldu===true&&mutfakAsamasi(d)==='sun';
  return d;
}
