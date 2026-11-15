import type { Nokta } from './defter';
export const yazilar = {
  '1': { ses:'bir', yollar:['M87 82 L122 49 V186'] },
  'A': { ses:'a', yollar:['M66 184 L120 48 L174 184','M89 127 H151'] },
  'L': { ses:'le', yollar:['M83 48 V185 H162'] },
  '2': { ses:'iki', yollar:['M72 84 C78 36 158 32 164 75 C170 109 124 137 74 184 H170'] },
  'E': { ses:'e', yollar:['M82 48 V184','M82 48 H161','M82 114 H146','M82 184 H161'] },
  '3': { ses:'uc', yollar:['M74 64 C116 31 166 47 159 82 C156 103 136 114 107 115 C144 110 168 124 162 156 C155 194 101 203 73 176'] },
  'M': { ses:'me', yollar:['M54 184 V49 L120 126 L186 49 V184'] }
} as const;
export type Isaret = keyof typeof yazilar;
const ornekler=new Map<string,Nokta[]>();
export function yolNoktalari(yol:string):Nokta[]{
  let noktalar=ornekler.get(yol);
  if(!noktalar){
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',yol);
    const uzunluk=p.getTotalLength(),adet=Math.ceil(uzunluk/5);
    noktalar=Array.from({length:adet+1},(_,i)=>{const n=p.getPointAtLength(i*uzunluk/adet);return [n.x,n.y]});
    ornekler.set(yol,noktalar);
  }
  return noktalar;
}
