export const tatliKademeler = [
  {ad:'Tatlı Atölyesi', fiyat:6, simge:'atolye'},
  {ad:'Kalıplı Kurabiye', fiyat:3, simge:'kurabiye'},
  {ad:'Çilekli Dondurma', fiyat:24, simge:'dondurma'},
  {ad:'Minik Kek', fiyat:72, simge:'minik-kek'},
  {ad:'Meyveli Tart', fiyat:144, simge:'meyveli-tart'},
  {ad:'Tarçınlı Sütlaç', fiyat:240, simge:'sutlac'},
] as const;
export type TatliCesidi = Exclude<typeof tatliKademeler[number]['simge'],'atolye'>;
export const tatliCarpan = {kurabiye:2,dondurma:3,'minik-kek':5,'meyveli-tart':8,sutlac:10} as const;
export type DondurmaTadi='cilek'|'vanilya'|'cikolata';
export type KurabiyeSekli='yildiz'|'kalp'|'yuvarlak';
export const kurabiyeSekliniOku=(v:unknown):KurabiyeSekli=>v==='kalp'||v==='yuvarlak'?v:'yildiz';
export const kalipAdi={yildiz:'Yıldız',kalp:'Kalp',yuvarlak:'Yuvarlak'} as const;
export const dondurmaTadiniOku=(deger:unknown):DondurmaTadi=>deger==='vanilya'||deger==='cikolata'?deger:'cilek';
export function tatliMi(id:string):id is TatliCesidi {return Object.hasOwn(tatliCarpan,id);}
export interface Cuzdan {jeton:number;tatliSeviye:number}
export function kilitAc(c:Cuzdan){
  const kademe=tatliKademeler[c.tatliSeviye+1];
  if(!kademe||c.jeton<kademe.fiyat)return false;
  c.jeton-=kademe.fiyat;c.tatliSeviye++;
  return true;
}

export type TabakRengi = 'nane'|'sari'|'beyaz';
export function tabakRengi(deger:unknown):TabakRengi {
  return deger==='beyaz'||deger==='sari'?deger:'nane';
}
