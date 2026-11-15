import {sutlacSrc} from './sutlac-gorseli';
import {h} from '../../src/ui/dom';
import type {TatliCesidi,DondurmaTadi,KurabiyeSekli} from './tatli-ekonomi';

const resimler=import.meta.glob<string>(['../../assets/sef/tatli/{kurabiye,kurabiye-kalp-pembe,kurabiye-yuvarlak-pembe,meyveli-tart}.webp','../../assets/sef/dondurma-tezgahi/dondurma-*.webp'],
  {eager:true,query:'?url',import:'default'});
const kekOrnegi=new URL('../../assets/sef/minik-kek/ornek.webp',import.meta.url).href;
export function tatliResmi(id:TatliCesidi,tat:DondurmaTadi='cilek',sekil:KurabiyeSekli='yildiz'){
  if(id==='sutlac')return h('img',{src:sutlacSrc('ornek'),alt:'',draggable:false});
  const dosya=id==='kurabiye'&&sekil!=='yildiz'?'kurabiye-'+sekil+'-pembe':id;
  const kaynak=id==='dondurma'?resimler['../../assets/sef/dondurma-tezgahi/dondurma-'+tat+'.webp']:id==='minik-kek'?kekOrnegi:resimler['../../assets/sef/tatli/'+dosya+'.webp'];
  return h('img',{src:kaynak,alt:'',draggable:false});
}
