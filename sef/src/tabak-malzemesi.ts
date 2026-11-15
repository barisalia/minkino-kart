import {h} from '../../src/ui/dom';
const tabakGorselleri=import.meta.glob<string>([
  '../../assets/sef/makarna/{kirmizi-sos,pesto,tereyagi,altin-pismis,altin-*-lokma}.webp',
  '../../assets/sef/sis/{*-taze,*-pismis,sos-yogurt,sos-domates,sos-feslegen}.webp',
  '../../assets/sef/mucver/{kabak-bezi,kabak-rende,yogurt,dereotu,limon,mucver-pismis,mucver-citir,mucver-fazla}.webp',
  '../../assets/sef/krep/{cilek,muz,yabanmersini,kivi,seftali,frambuaz,armut,kiraz,mandalina}.webp',
],{eager:true,import:'default',query:'?url'});
export function tabakMalzemesi(yol:string,ad=''){return h('img',{src:tabakGorselleri['../../assets/sef/'+yol+'.webp'],alt:ad,draggable:false});}
