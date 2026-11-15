export const kremalar=['vanilya','cilekli','kakao'] as const;
export const meyveler=['cilek','kivi','cikolata'] as const;
export type Krema=typeof kremalar[number];
export type Meyve=typeof meyveler[number];
export interface PastaMeyvesi {tur:Meyve;x:number;y:number}
export interface Kutlama {krema?:Krema;meyveler:PastaMeyvesi[];mum:boolean;uflendi:boolean;sunulan:number[];dilimlendi:boolean;kesikler?:number[];paylar?:Record<number,number>}
export const yeniKutlama=():Kutlama=>({meyveler:[],mum:false,uflendi:false,sunulan:[],dilimlendi:false});
export function kutlamaOku(k?:Partial<Kutlama>){
  const yeni=yeniKutlama();
  if(!k||!kremalar.includes(k.krema!))return yeni;
  yeni.krema=k.krema;
  if(Array.isArray(k.meyveler))yeni.meyveler=k.meyveler.filter(m=>m&&meyveler.includes(m.tur)&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Math.hypot(m.x-50,m.y-50)<=43).slice(0,9);
  yeni.mum=!!yeni.meyveler.length&&k.mum===true;
  yeni.uflendi=yeni.mum&&k.uflendi===true;
  if(yeni.uflendi&&Array.isArray(k.kesikler))yeni.kesikler=[...new Set(k.kesikler.filter(n=>[0,1,2].includes(n)))];
  yeni.dilimlendi=yeni.uflendi&&(k.dilimlendi===true||yeni.kesikler?.length===3);
  if(yeni.dilimlendi&&Array.isArray(k.sunulan))yeni.sunulan=[...new Set(k.sunulan.filter(n=>[0,1,2].includes(n)))];
  if(yeni.sunulan.length){
    yeni.paylar={};
    const kalan=new Set([0,1,2]);
    for(const kisi of yeni.sunulan){
      const secim=k.paylar?.[kisi]??kisi;
      const no=kalan.has(secim)?secim:[...kalan][0];
      yeni.paylar[kisi]=no;kalan.delete(no);
    }
  }
  return yeni;
}
