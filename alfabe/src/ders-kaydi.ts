import { tamDers, yasGrubu } from './yas-grubu';
// Önceki tam derslerin kayıt anahtarları 5+ grubunda korunur.
function grupAnahtari(anahtar:string){return tamDers?anahtar:anahtar+'-yas-'+yasGrubu;}
const oturumdakiKayitlar=new Map<string,string|null>();

export function dersKaydiniOku(anahtar:string):string|null {
  anahtar=grupAnahtari(anahtar);
  // Yazma reddedilmişse diskte bu anahtarın daha eski sürümü kalmış olabilir.
  if(oturumdakiKayitlar.has(anahtar))return oturumdakiKayitlar.get(anahtar)??null;
  try{return localStorage.getItem(anahtar);}
  catch{return null;}
}

export function dersKaydiniYaz(anahtar:string, deger:string|null){
  anahtar=grupAnahtari(anahtar);
  try{
    if(deger===null)localStorage.removeItem(anahtar);
    else localStorage.setItem(anahtar,deger);
    oturumdakiKayitlar.delete(anahtar);
  }catch{
    // Depolama kapalı veya dolu olsa bile rafa dönünce aynı yerden devam et.
    oturumdakiKayitlar.set(anahtar,deger);
  }
}
