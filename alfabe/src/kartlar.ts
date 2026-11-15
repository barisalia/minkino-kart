import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import type dersler from './harfler.json';
import { kalemYollari } from './yollar';

export type Ders = typeof dersler[number];
export const murekkepler = [
  { ad:'Deniz yeşili', renk:'#087466' },
  { ad:'Mercan', renk:'#bc4539' },
  { ad:'Menekşe', renk:'#7551a2' },
] as const;
export type Kalemler = { buyuk: number; kucuk: number };
export type ParmakIzi = [number, number][][];
type Yazi = { kalem:number; iz:ParmakIzi };
const izDeposu = 'minkino-alfabe-el-yazisi-v1-';

function kayitAnahtari(id:string,kucuk:boolean) {
  return izDeposu + id + (kucuk ? '-k' : '-b');
}
export function iziSakla(id:string,kucuk:boolean,kalem:number,iz:ParmakIzi) {
  dersKaydiniYaz(kayitAnahtari(id,kucuk),JSON.stringify({kalem:kalemNo(kalem),iz}));
}
function iziOku(id:string,kucuk:boolean):Yazi|undefined {
  try {
    const ham=dersKaydiniOku(kayitAnahtari(id,kucuk));
    if(!ham || ham.length>48000)return;
    const y=JSON.parse(ham);
    if(!gecerliIz(y.iz))return;
    return {kalem:kalemNo(y.kalem),iz:y.iz};
  } catch { return; }
}

export function gecerliIz(iz:unknown):iz is ParmakIzi {
  return Array.isArray(iz) && iz.length>0 && iz.length<=512 && iz.every(c =>
    Array.isArray(c) && c.length>0 && c.length<=128 && c.every(p =>
      Array.isArray(p) && p.length===2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) &&
      p[0]>=0 && p[0]<=100 && p[1]>=0 && p[1]<=132));
}

export function parmakYolu(noktalar:[number,number][]) {
  const [x,y]=noktalar[0];
  return 'M'+x+' '+y+(noktalar.length>1?' L'+noktalar.slice(1).map(p=>p.join(' ')).join(' '):' l0 .1');
}

export function kalemNo(deger: unknown) {
  return typeof deger === 'number' && Number.isInteger(deger) && deger >= 0 && deger < murekkepler.length ? deger : 0;
}
export function harfYazisi(ders: Ders, kalem?: Partial<Kalemler>) {
  const sekil = (harf:string,secim:unknown,kucuk:boolean) => {
    const onceki=iziOku(ders.id,kucuk);
    const yollar=onceki?onceki.iz.map(parmakYolu):kalemYollari(harf);
    return '<g fill="none" stroke="'+murekkepler[onceki?.kalem??kalemNo(secim)].renk+
      '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">'+
      yollar.map(d=>'<path d="'+d+'"/>').join('')+'</g>';
  };
  return '<svg class="ka-yazi" viewBox="0 0 191 132" aria-hidden="true">' + sekil(ders.upper, kalem?.buyuk,false) +
    '<g transform="translate(93 0)">' + sekil(ders.lower, kalem?.kucuk,true) + '</g></svg>';
}
