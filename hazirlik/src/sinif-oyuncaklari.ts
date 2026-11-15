import { efekt } from '../../src/audio/efekt';

const hareketler = {
  yuvarlan: ['translateX(-4%) rotate(-9deg)', 'translateX(11%) rotate(19deg)', 'translateX(3%) rotate(5deg)'],
  sek: ['translateY(-16%) rotate(-5deg)', 'translateY(1%)', 'translateY(-4%)'],
  egil: ['rotate(-12deg)', 'rotate(7deg)', 'rotate(-3deg)'],
  salla: ['rotate(-18deg)', 'rotate(15deg)', 'rotate(-8deg)'],
  yuz: ['translate(-6%,3%) rotate(-6deg)', 'translate(10%,-7%) rotate(8deg)', 'translate(5%,-4%)'],
  ac: ['rotate(-5deg) translateY(-2%)', 'rotate(10deg) translateY(-7%)', 'rotate(3deg)'],
  vur: ['translateY(3%) scale(.98,.94)', 'translateY(-10%)', 'translateY(0)'],
};
type Hareket = keyof typeof hareketler;
type Ses = 'pof'|'dokunma'|'dagit'|'cevir'|'sayfa'|'tink'|'sicrama'|'ovala'|'secim';
type Oyuncak = readonly [Hareket, Ses|number];

// Sıralar ders-programi.ts içindeki resim sırasını izler.
const oyuncaklar: Record<string, readonly Oyuncak[]> = {
  meyve: [['egil','pof'],['yuvarlan','pof'],['sek','dokunma'],['yuvarlan','dokunma'],['yuvarlan','pof'],['egil','pof']],
  yuvarlak: [['salla','dokunma'],['sek','secim'],['yuvarlan','ovala'],['ac','pof'],['egil','dagit'],['ac','sayfa']],
  bahce: [['egil','dagit'],['salla','dagit'],['egil','ovala'],['egil','cevir'],['salla','ovala'],['egil','dagit']],
  muzik: [['vur',0],['salla',1],['vur',2],['salla',3],['vur',4],['egil',5]],
  ucgen: [['egil','pof'],['salla','tink'],['egil','dokunma'],['yuvarlan','tink'],['sek','pof'],['egil','tink']],
  deniz: [['egil','dokunma'],['sek','sicrama'],['yuvarlan','ovala'],['yuz','sicrama'],['yuz','sicrama'],['salla','dokunma']],
  kalemlik: [['yuvarlan','ovala'],['egil','ovala'],['ac','secim'],['sek','pof'],['vur','ovala'],['egil','cevir']],
  kare: [['ac','dagit'],['egil','sayfa'],['salla','dokunma'],['yuvarlan','tink'],['sek','pof'],['ac','sayfa']],
  orman: [['egil','dagit'],['yuvarlan','dokunma'],['salla','sayfa'],['yuvarlan','cevir'],['sek','pof'],['yuvarlan','dokunma']],
};

export function oyuncagiOynat(set:string, i:number, resim:Element|null) {
  const oyuncak=oyuncaklar[set]?.[i];
  if(!oyuncak)return;
  const [hareket,ses]=oyuncak;
  if(typeof ses==='number')efekt.sinifCalgisi(ses);
  else efekt[ses]();
  if(!resim || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  resim.getAnimations().forEach(a=>a.cancel());
  resim.animate(['none',...hareketler[hareket],'none'].map(transform=>({transform,transformOrigin:'50% 80%'})),{
    duration:hareket==='yuz'?540:420,easing:'ease-in-out',
  });
}
