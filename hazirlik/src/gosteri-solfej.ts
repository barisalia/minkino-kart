import {baglam,konusmaCikisi} from '../../src/audio/motor';
import {durum} from '../../src/engine/ilerleme';
import {konserCalgisi} from './gosteri-muzigi';
import ritim from './sahne-vokal-ritmi.json';

type Oyuncu='kino'|'zip';
const dosyalar=import.meta.glob<string>('../../assets/hazirlik/gosteri-muzik/solfej/*.wav',{eager:true,query:'?url',import:'default'});
const kaynak=(kim:Oyuncu,el:number)=>dosyalar['../../assets/hazirlik/gosteri-muzik/solfej/'+kim+'-'+el+'.wav'];
const notalar=[72,76,79,81];

// Aktif sözün heceleri arasındaki kısa boşluklar ikinci bir Kino sesi için yer sayılmaz.
export function sozleCakisiyor(vurus:number){
  const i=Math.max(0,Math.floor(vurus*.625*1000/ritim.adimMs)-2);
  const son=Math.ceil((vurus*.625+.60)*1000/ritim.adimMs);
  return /[12]/.test(ritim.pozlar.slice(i,son));
}

/** Her ses tek hecedir. Geçerli notayı, tur kapanmadan önce susturabiliriz. */
export function sahneSolfeji(){
  const kayitlar=new Map<string,AudioBuffer>();
  const kanallar=new Map<Oyuncu,()=>void>();
  let yukleme:Promise<void>|undefined;
  function hazirla(){
    const ctx=baglam();if(!ctx)return;
    yukleme??=Promise.allSettled(Object.values(dosyalar).map(async url=>{
      const yanit=await fetch(url);if(!yanit.ok)return;
      kayitlar.set(url,await ctx.decodeAudioData(await yanit.arrayBuffer()));
    })).then(()=>{});
    return yukleme;
  }
  function soyle(kim:Oyuncu,el:number,vurus?:number){
    kanallar.get(kim)?.();
    if(!durum.i.ayarlar.konusma||vurus!==undefined&&sozleCakisiyor(vurus)){
      konserCalgisi(4,notalar[el],kim==='zip'?.64:1);return;
    }
    const url=kaynak(kim,el),ses=kayitlar.get(url),ctx=baglam(),out=konusmaCikisi();
    if(ctx&&ses&&out){
      const n=ctx.createBufferSource(),g=ctx.createGain();
      n.buffer=ses;g.gain.value=kim==='zip'?.73:.88;n.connect(g).connect(out);
      const dur=()=>{n.stop();kanallar.delete(kim)};
      n.onended=()=>{n.disconnect();g.disconnect();if(kanallar.get(kim)===dur)kanallar.delete(kim)};
      kanallar.set(kim,dur);n.start();return;
    }
    const n=new Audio(url);n.volume=durum.i.ayarlar.seviye*(kim==='zip'?.73:.88);
    const dur=()=>{n.pause();kanallar.delete(kim)};
    kanallar.set(kim,dur);n.onended=()=>{if(kanallar.get(kim)===dur)kanallar.delete(kim)};
    void n.play().catch(()=>{if(kanallar.get(kim)===dur){kanallar.delete(kim);konserCalgisi(4,notalar[el])}});
  }
  function durdur(){kanallar.forEach(dur=>dur());kanallar.clear()}
  return {hazirla,soyle,durdur};
}
