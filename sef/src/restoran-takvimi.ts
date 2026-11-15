import {kutlamaOku,type Kutlama} from './kutlama-kaydi';
export const GUNDEKI_MUSTERI=3;
export interface RestoranGunu {
  no:number;
  ziyaret:number;
  kazanc:number;
  kapandi:boolean;
  oneri?:string;
  kutlama?:Kutlama;
  kutlamada?:boolean;
}
export function yeniGun(no=1):RestoranGunu{return {no,ziyaret:0,kazanc:0,kapandi:false};}
export function gunuOku(eski?:Partial<RestoranGunu>):RestoranGunu {
  if(!eski||!Number.isSafeInteger(eski.no)||eski.no!<1)return yeniGun();
  const gun=yeniGun(eski.no);
  if(Number.isInteger(eski.ziyaret))gun.ziyaret=Math.max(0,Math.min(GUNDEKI_MUSTERI,eski.ziyaret!));
  if(Number.isSafeInteger(eski.kazanc)&&eski.kazanc!>=0)gun.kazanc=eski.kazanc!;
  gun.kapandi=gun.ziyaret===GUNDEKI_MUSTERI&&eski.kapandi===true;
  if(gun.kapandi&&typeof eski.oneri==='string'&&eski.oneri.length<50)gun.oneri=eski.oneri;
  if(gun.kapandi&&eski.kutlama){gun.kutlama=kutlamaOku(eski.kutlama);gun.kutlamada=eski.kutlamada===true;}
  return gun;
}
