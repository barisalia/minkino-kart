import modeller from './ses-modelleri.json';
import sikistirilmis from './ses-araliklari.json';

// Kayıtlardan çıkarılmış, 120 ile ölçeklenmiş mel bantları. “diger”, çocuğun
// aynı derste duyduğu ama bu turda istenmeyen sözcükleri temsil eder.
type SesBankasi=Record<string,number[][][]>;
let hazir:SesBankasi|undefined;
export function sesOrnekleriniAl():SesBankasi{
  if(hazir)return hazir;
  const ornekler:SesBankasi={};
  for(const [id,kayitlar] of Object.entries(sikistirilmis)){
    const ana=(modeller as Record<string,number[][]>)[id];
    ornekler[id]=(ana?[ana,...kayitlar]:kayitlar).map(kayit=>kayit.map(kare=>kare.map(x=>x/120)));
  }
  hazir=ornekler;
  return ornekler;
}
