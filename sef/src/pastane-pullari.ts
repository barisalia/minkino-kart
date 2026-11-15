import type {TatliCesidi} from './tatli-ekonomi';
import {sutlacDesenleri,sutlacDesenAdi} from './sutlac-tarifi';
import {sutlacSrc} from './sutlac-gorseli';
const isimler:Record<Exclude<TatliCesidi,'sutlac'>,string[]>={
  'kurabiye':["taçlı yıldız kurabiye","damalı kurabiye","reçel pencereli kurabiye","panda yüzü kurabiye","yaprak damar baskılı kurabiye","pembe şemsiye kurabiye","sarı ay kurabiye","bal peteği kurabiye","uçurtma kurabiye","mektup kurabiye","fiyonk makas kurabiye","kardan adam kurabiye","çizgili balık kurabiye","kuğu kurabiye","yüzük kurabiye","mini ev kurabiye","papatya kurabiye","çiçek saksısı kurabiye","bulut kurabiye","gül kurabiye","yelkenli kurabiye","güneş kurabiye","minik tren kurabiye","kelebek kurabiye","pastacı şapkası kurabiye"],
  'dondurma':["çilek külah","kakao külah","limon külah","fıstık külah","karadut külah","üç top renkli külah","şeftali dondurma kupu","çilekli sandviç dondurma","mavi buzlu çubuk","kavun buzlu çubuk","vişneli dondurma kupu","mango buzlu çubuk","karpuz buzlu çubuk","muzlu dondurma kupu","portakal sorbe kupu","pembe soft külah","vanilya soft külah","lavanta dondurma fincanı","şemsiyeli dondurma kupu","balıklı gofret dondurma","kivili sorbe","yarım hindistancevizinde dondurma","napoliten dilim dondurma","rulo dondurma kupu","armut buzlu çubuk"],
  'minik-kek':["kirazlı cupcake","limon kremalı cupcake","yaban mersinli cupcake","çikolata damgalı cupcake","vanilya kremalı cupcake","gül kremalı cupcake","fıstıklı cupcake","havuçlu minik kek","kakaolu halka kek","mermer dilim kek","zebra dilim kek","üçgen limon keki","dilim çilekli rulo kek","dilim kakaolu rulo kek","muzlu dilim kek","çikolata kaplı mini kek","ahududulu mini kek","mandalina dilimli kek","yıldız süslü cupcake","çilek katlı dilim pasta","damla süslü cupcake","dilim vişneli kek","kremalı tekli ekler","damalı dilim kek","tek mumlu küçük doğum günü keki"],
  'meyveli-tart':["elmalı tart","incirli tart","kirazlı tart","armutlu tart","limon tartı","ahududu tartı","karadut tartı","mango tartı","kivili tart","ananas tartı","şeftalili tart","kayısılı tart","mandalinalı tart","yaban mersinli tart","dilimli muz tartı","ormanmeyveli tart","çilekli tart","kafes kapaklı turta","papatya biçimli tart","kalpli mini tart","dikdörtgen erik tartı","narlı tart","üzümlü tart","örgü kenarlı portakal tartı","üçgen böğürtlenli tart dilimi"],
};
const gorseller=import.meta.glob<string>('../../assets/sef/pullar/*.webp',{eager:true,import:'default',query:'?url'});
const koleksiyon=new Map<TatliCesidi,{id:string,ad:string,resim:string}[]>();
let sira=0;
for(const [tarif,adlar] of Object.entries(isimler)){
  const sayfa=adlar.map(ad=>{
    const id='pul-'+String(++sira).padStart(3,'0');
    return {id,ad,resim:gorseller['../../assets/sef/pullar/'+id+'.webp']??''};
  });
  koleksiyon.set(tarif as TatliCesidi,sayfa);
}
koleksiyon.set('sutlac',sutlacDesenleri.map(d=>({id:'sutlac-'+d,ad:sutlacDesenAdi[d]+' desenli sütlaç',resim:sutlacSrc('pul-'+d)})));
export function pullar(tarif:TatliCesidi){return koleksiyon.get(tarif)??[];}
