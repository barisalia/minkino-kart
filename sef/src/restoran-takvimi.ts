export const GUNDEKI_MUSTERI=3;
export interface RestoranGunu {
  no:number;
  ziyaret:number;
  kazanc:number;
  kapandi:boolean;
}
export function yeniGun(no=1):RestoranGunu{return {no,ziyaret:0,kazanc:0,kapandi:false};}
export function gunuOku(eski?:Partial<RestoranGunu>):RestoranGunu {
  if(!eski||!Number.isSafeInteger(eski.no)||eski.no!<1)return yeniGun();
  const gun=yeniGun(eski.no);
  if(Number.isInteger(eski.ziyaret))gun.ziyaret=Math.max(0,Math.min(GUNDEKI_MUSTERI,eski.ziyaret!));
  if(Number.isSafeInteger(eski.kazanc)&&eski.kazanc!>=0)gun.kazanc=eski.kazanc!;
  gun.kapandi=gun.ziyaret===GUNDEKI_MUSTERI&&eski.kapandi===true;
  // Eski kayıttaki kutlama ve öneri alanları (19 Kasım'da kaldırıldı) okunmaz.
  return gun;
}
