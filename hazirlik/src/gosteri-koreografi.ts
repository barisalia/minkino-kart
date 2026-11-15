// Canlı sahne ve aile albümü AYNI resim sırasını oynatır. Puanlama bu
// alkış/adım dizilerinin dışında kalır.
import type {Dal,Dokunus} from './gosteri-kaydi';
import siirAgiz from './siir-agiz.json';
import vokalRitmi from './sahne-vokal-ritmi.json';
export const dansAdlari=['Alkış','Yana adım','Patiler yukarı','Eğilerek selam','Kurdele yayı'];
export const dansKartlari=['zip-dans-2','zip-dans-4','zip-patiler-4','zip-selam-3','zip-kurdele-3'];
export function kendiDansKesiti(dizi:readonly number[]){
  const bas=62-2*dizi.length;
  return {bas,iz:dizi.map((el,i)=>({el,vurus:bas+i*2}))};
}
export function kinoDansKartlari(renk:'sari'|'yesil'){
  const set=renk==='sari'?'kino-sari-dans':'kino-dans';
  return [set+'-6',set+'-3','kino-patiler-'+renk+'-4','kino-selam-'+renk+'-3','kino-kurdele-'+renk+'-3'];
}
export function dansPozlari(oyuncu:'kino'|'zip',renk:'sari'|'yesil'){
  return oyuncu==='zip'?['zip-patiler','zip-selam','zip-kurdele']:['kino-patiler-'+renk,'kino-selam-'+renk,'kino-kurdele-'+renk];
}
// Her sütun aynı müzik anıdır. İki farklı sheet'te temas pozunun indeksi farklıdır.
const esliDans=[
  {kino:[5,6,6,5,4,7],zip:[1,2,2,3,1,7],ses:'alkis'},
  {kino:[2,3,3,4,4,7],zip:[3,4,4,5,5,7],ses:'adim'},
  {kino:[9,10,11,12,10,13],zip:[9,10,11,12,10,13],ses:null},
  {kino:[15,16,17,17,18,19],zip:[15,16,17,17,18,19],ses:null},
  {kino:[20,21,22,23,24,25],zip:[20,21,22,23,24,25],ses:null}
] as const;
export function dansOrnegi(el:number){
  const pozlar:readonly number[]=ikiliHareketi('dans',el,true).zip;
  const tepe=[2,4,12,17,23][el];
  return pozlar.slice(0,pozlar.indexOf(tepe)+1);
}
export function dansCumlesi(el:number,bpm:number){
  const hareket=esliDans[el];
  return {...hareket,kinoTepe:[6,3,12,17,23][el],zipTepe:[2,4,12,17,23][el],ms:60000/bpm/4,temas:el===1?3:1};
}
export function sonDansAdimlari(desen:readonly number[],iz:readonly Dokunus[]){
  const secilen:number[]=[];
  for(const d of [...iz].sort((a,b)=>b.sira-a.sira)){
    if(desen[d.sira]===d.el&&!secilen.includes(d.el))secilen.unshift(d.el);
    if(secilen.length===2)break;
  }
  // Bir çocuk tek hareket yakaladıysa aynısını iki kez dans edebilir.
  if(!secilen.length)return [0,1,2,3];
  return [secilen[0],secilen.at(-1)!,2,3];
}
export function sarkiSelami(desen:readonly number[],iz:readonly Dokunus[]){
  const son=iz.filter(d=>desen[d.sira]===d.el).sort((a,b)=>a.sira-b.sira).slice(-2);
  if(!son.length)return [];
  const notalar=[son[0].el,son[son.length-1].el];
  return [...notalar,...notalar].map((el,i)=>({el,vurus:60+i,kim:i<2?'zip' as const:'kino' as const}));
}
export function kinoVokali(oyuncu:Element,renk:'sari'|'yesil',kim?:'kino'|'zip'){
  const kareler=[...oyuncu.querySelectorAll('img')];
  const iz=kim?siirAgiz[kim]:vokalRitmi.pozlar;
  const agiz=kim&&kareler.length===4?[0,1,2]:kim==='zip'?[0,2,3]:renk==='sari'?[0,5,3]:[0,1,3];
  const sakin=matchMedia('(prefers-reduced-motion: reduce)');
  kareler.forEach(im=>{im.style.visibility='hidden'});
  let son=-1;
  return (saniye:number,yankiYasi=Infinity)=>{
    const i=Math.floor(saniye*1000/(kim?siirAgiz.adimMs:vokalRitmi.adimMs));
    const aciklik=yankiYasi>=0&&yankiYasi<.53?(yankiYasi<.09||yankiYasi>.40?1:2):Number(iz[i]??0);
    const poz=sakin.matches?0:agiz[aciklik];
    if(poz===son)return;
    if(son>=0)kareler[son].style.visibility='hidden';
    kareler[poz].style.visibility='visible';son=poz;
  };
}
export function ikiliHareketi(dal:Dal,el:number,ornek=false){
  const dans=dal==='dans';
  if(dans&&el===4)return {kino:ornek?[0]:esliDans[4].kino,zip:esliDans[4].zip,ms:100};
  if(dans&&el>=2){
    const pozlar=el===2?[8,9,10,11,12,12,10,13]:[14,15,16,17,17,16,15,19];
    return {kino:ornek?[0]:pozlar,zip:pozlar,ms:130};
  }
  return {
    kino:ornek?[0]:dans?(el?[1,2,3,4,7]:[4,5,6,5,7]):el?[0,1,1,7]:[1,2,3,4,5,6,7],
    zip:dans?(el?[0,1,3,4,5,6,7]:[0,1,2,3,2,7]):el?[1,2,3,4,5,6,7]:[0,1,1,7],
    ms:155,
  };
}
export function birlikteKapanis(dal:Dal,boluk:number,bpm:number){
  const adim=boluk===1||boluk===3,son=boluk===3;
  return dal==='dans'?{
    kino:adim?[0,1,2,3,4,7]:[4,5,6,5,6,7],
    zip:adim?[0,1,3,4,5,7]:[0,1,2,3,2,7],
    ms:20000/bpm,ses:adim?'adim' as const:'alkis' as const,
  }:{
    kino:son?[2,3,4,5,6,7]:[1,2,3,3,4,5],
    zip:son?[2,3,4,5,6,7]:[1,2,3,4,4,5],
    ms:20000/bpm,ses:null,
  };
}
