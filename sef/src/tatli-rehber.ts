import { konus, konusmaMotorunuAc } from '../../src/audio/konusma';
import { dugme, ikon } from './gorsel';
import type { TatliId } from './tatli-atolyesi';
import type cumleler from './tatli-rehber-replikleri.json';
import './tatli-rehber.css';

const adimlar:Record<TatliId,readonly (keyof typeof cumleler)[]>={
  sutlac:['sutlac-sut','sutlac-karistir','sutlac-dok','sutlac-tarcin'],
  kurabiye:['hamur','yildiz-sec','kalip-bas','firin','kalip-krema','sun'],
  dondurma:['cilekli-top','kepce','kulah','sun'],
  'minik-kek':['cirp','kek-dok','firin','kek-krema','kek-cilek','sun'],
  'meyveli-tart':['hamur','tart-bas','firin','tart-krema','tart-meyve','sun'],
};
const sesler=import.meta.glob<string>('../../assets/sef/tatli-rehber/*.mp3',{eager:true,query:'?url',import:'default'});
export async function tatliAdiminiDinle(ad:keyof typeof cumleler){
  const url=sesler['../../assets/sef/tatli-rehber/'+ad+'.mp3'];
  if(url){konusmaMotorunuAc();await konus(url);}
}

export function tatliRehberDugmesi(id:TatliId,adim:()=>number,sesli:()=>boolean,serbest=false,ozelKalip:()=>boolean=()=>false):HTMLElement {
  const tus=dugme('Bu adımı dinle','ta-rehber-sesi',ikon('hoparlor'));
  tus.hidden=!sesli();
  tus.onclick=async()=>{
    if(!sesli()||tus.disabled)return;
    const kalipSesleri={1:'kalip-sec',2:'kalip-bas',4:'kalip-krema'} as const;
    const kalipSesi=id==='kurabiye'&&ozelKalip()?kalipSesleri[adim() as 1|2|4]:undefined;
    const ad=kalipSesi??(id==='meyveli-tart'&&adim()===4?'tart-serbest':serbest&&id==='dondurma'&&adim()===0?'top-sec':adimlar[id][adim()]);
    tus.disabled=true;
    try {await tatliAdiminiDinle(ad);}
    finally {tus.disabled=false;}
  };
  return tus;
}
