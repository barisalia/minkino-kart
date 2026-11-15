import type { Cesit } from './pizza-tabagi';

const dilimler=import.meta.glob<string>('../../assets/sef/firin/dilimler/*.webp',{
  eager:true,query:'?url',import:'default'
});

export function pizzaDilimResmi(cesit:Cesit,erimis=false) {
  const ad=erimis&&cesit==='peynir'?'peynir-erimis':cesit;
  return dilimler['../../assets/sef/firin/dilimler/'+ad+'.webp'];
}
