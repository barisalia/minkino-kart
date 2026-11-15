import {baglam,muzikCikisi,konusmaCikisi} from '../../src/audio/motor';
import siirKaydi from '../../assets/hazirlik/gosteri-muzik/cebimdeki-tohum.flac?url';
import kinoVokal from '../../assets/hazirlik/gosteri-muzik/kino-sahne-vokal.flac?url';
import {gosteriTaslagi,sarkiCevabi,calgiSesi,type BandoKaydi} from '../../src/audio/bando';
import {kisaKlavuz} from '../../src/audio/sahne-ortami';
import type {Dal} from './gosteri-kaydi';
import {durum} from '../../src/engine/ilerleme';
import sarkiTaslak from '../../assets/hazirlik/gosteri-muzik/gecici/sahne-bizim-gecici.mp3';
import dansTaslak from '../../assets/hazirlik/gosteri-muzik/gecici/pati-pati-dans-gecici.mp3';

// BPM sabit: Gemini kaydı geldiğinde notaların zamanı ve çocuğun puanı değişmez.
export const tempo:Record<Dal,number>={sarki:96,dans:150};
const dosyalar=import.meta.glob<string>('../../assets/hazirlik/gosteri-muzik/*.{wav,mp3,m4a,ogg}',{eager:true,query:'?url',import:'default'});
const hazir=new Map<Dal,AudioBuffer>(),bekleyen=new Map<Dal,Promise<void>>();
const medya=new Map<Dal,{ses:HTMLAudioElement;asil:boolean}>();
const buOturumdaGecici=new Set<Dal>();
// Son vokal geldiğinde ona rakip ikinci bir melodi çalma. Evde ve sessiz
// provada ise arkadaşın bütün cümlesi duyulmaya devam eder.
export function cevapNotasi(ay:boolean,vurus=0,eslikVar=false,aile=false){
  const kisa=eslikVar&&(hazir.has('sarki')||medya.get('sarki')?.asil===true);
  if(baglam()){sarkiCevabi(ay,vurus,kisa,aile);return}
  const bar=Math.min(15,Math.max(0,Math.floor(vurus/4))),akor=[0,1,0,1,2,3,0,1,0,1,3,0,0,2,3,0][bar];
  kisaKlavuz('nota-'+(ay?'ay':'gunes')+'-'+(aile?'aile':kisa?'kisa-'+akor:'cocuk-'+akor));
}
export function konserCalgisi(i:number,n=i===0?48:i===3?79:76,vurgu=1){
  if(baglam())calgiSesi(i,n,vurgu);else kisaKlavuz('calgi-'+i+'-'+n,vurgu);
}
export function ritimTusu(el:number,guc=1){
  const [calgi,nota]=[[4,72],[3,76],[4,79],[3,79]][el];
  konserCalgisi(calgi,nota,guc*.82);
}
const vokaller=new Map<string,AudioBuffer>();
const yuklemeler=new Map<string,Promise<void>>();
export function kaydiHazirla(dal:Dal,siir=false){
  const c=baglam(),kaynak=siir?siirKaydi:kinoVokal;
  if(dal==='sarki'&&c&&!vokaller.has(kaynak)&&!yuklemeler.has(kaynak)){
    const yukle=fetch(kaynak).then(r=>r.arrayBuffer()).then(a=>c.decodeAudioData(a))
      .then(k=>{vokaller.set(kaynak,k)}).catch(()=>{}).finally(()=>yuklemeler.delete(kaynak));
    yuklemeler.set(kaynak,yukle);
  }
  return Promise.all([esligiHazirla(dal),dal==='sarki'?yuklemeler.get(kaynak):undefined]);
}
function esligiHazirla(dal:Dal){
  const ctx=baglam(),ad=dal==='sarki'?'sahne-bizim':'pati-pati-dans';
  const kaynak=Object.entries(dosyalar).find(([yol])=>yol.split('/').pop()?.split('.')[0]===ad)?.[1];
  if(hazir.has(dal)||medya.has(dal)||buOturumdaGecici.has(dal))return;
  if(bekleyen.has(dal))return bekleyen.get(dal);
  if(!ctx){
    // Kısayoldan kayıtlı finali açan tarayıcı henüz ilk dokunuşu almamış
    // olabilir. Desteklenen asıl mikseri sırf bu yüzden değiştirme.
    if(typeof window.AudioContext==='function'&&navigator.userActivation?.hasBeenActive===false)return;
    // Safari, gömülü oynatıcı veya sistem Web Audio bağlamı açamazsa aynı
    // düzenleme normal ses dosyasından çalar. Burada son miksi de sınarız.
    const oynatici=new Audio();
    if(!oynatici.canPlayType('audio/mpeg')&&!oynatici.canPlayType('audio/wav')){buOturumdaGecici.add(dal);return}
    const ac=(url:string)=>new Promise<HTMLAudioElement>((kabul,ret)=>{
      const ses=new Audio();ses.preload='auto';
      const kes=()=>{clearTimeout(saat);ses.onloadedmetadata=null;ses.onerror=null};
      const olmadi=()=>{kes();ses.removeAttribute('src');ses.load();ret(new Error('Ses açılamadı'))};
      const saat=window.setTimeout(olmadi,3000);
      ses.onloadedmetadata=()=>{if(!Number.isFinite(ses.duration)||Math.abs(ses.duration-64*60/tempo[dal])>.18){olmadi();return}kes();kabul(ses)};
      ses.onerror=olmadi;ses.src=url;ses.load();
    });
    const taslak=dal==='sarki'?sarkiTaslak:dansTaslak;
    const is=(async()=>{if(kaynak){try{medya.set(dal,{ses:await ac(kaynak),asil:true});return}catch{/* iki yarı aynı taslakta kalır */}}
      medya.set(dal,{ses:await ac(taslak),asil:false});
    })().catch(()=>{buOturumdaGecici.add(dal)}).finally(()=>bekleyen.delete(dal));
    bekleyen.set(dal,is);return is;
  }
  if(!kaynak)return;
  const denetim=new AbortController();let saat=0;
  const yukle=fetch(kaynak,{signal:denetim.signal}).then(r=>{if(!r.ok)throw Error();return r.arrayBuffer()}).then(a=>ctx.decodeAudioData(a));
  const sinir=new Promise<never>((_,reddet)=>{saat=window.setTimeout(()=>{denetim.abort();reddet(new Error('Kayıt yüklenemedi'))},4200)});
  const is=Promise.race([yukle,sinir]).then(k=>{
    // İlk yarısı taslak, ikinci yarısı başka bir kayıttan çalınmasın. Hatalı
    // kaynak bu oturum boyunca iki bölümü ve albümü de aynı bestede bırakır.
    if(Math.abs(k.duration-64*60/tempo[dal])>.18)throw Error();
    hazir.set(dal,k);
  }).catch(()=>{buOturumdaGecici.add(dal)}).finally(()=>{clearTimeout(saat);bekleyen.delete(dal)});
  bekleyen.set(dal,is);
  return is;
}
export function sahneMuzigi(dal:Dal,ilk:number,son=64,kinoSoyler=false,siir=false):BandoKaydi{
  const eslik=esligiOynat(dal,ilk,son,siir?.48:1);
  if(dal!=='sarki'||!kinoSoyler)return eslik;
  const kaynak=siir?siirKaydi:kinoVokal,vokal=vokaller.get(kaynak);
  const c=baglam(),out=konusmaCikisi(),bas=ilk*60/tempo.sarki;
  if(c&&out&&vokal){
    const t=eslik.gecen(),ses=c.createBufferSource();
    const kanal=c.createGain();kanal.gain.value=durum.i.ayarlar.konusma ? .85 : 0;
    ses.buffer=vokal;ses.connect(kanal).connect(out);ses.onended=()=>{ses.disconnect();kanal.disconnect()};
    ses.start(c.currentTime+Math.max(0,-t),bas+Math.max(0,t),eslik.sure-Math.max(0,t));
    return {...eslik,gecen:()=>{kanal.gain.value=durum.i.ayarlar.konusma ? .85 : 0;return eslik.gecen()},durdur:()=>{ses.stop();eslik.durdur()}};
  }
  const ses=new Audio(kaynak);
  let bitti=false;
  const ayarla=()=>{ses.muted=!durum.i.ayarlar.konusma;ses.volume=durum.i.ayarlar.seviye};
  const durdur=()=>{bitti=true;ses.pause();eslik.durdur()};
  ses.onloadedmetadata=()=>{if(bitti)return;ses.currentTime=bas+Math.max(0,eslik.gecen());ayarla();void ses.play().catch(()=>{})};
  return {sure:eslik.sure,durdur,gecen:()=>{
    const t=eslik.gecen();ayarla();
    if(!bitti&&!ses.paused&&Math.abs(ses.currentTime-bas-t)>.18)ses.currentTime=bas+Math.max(0,t);
    if(!bitti&&t>=eslik.sure)durdur();
    return t;
  }};
}
function esligiOynat(dal:Dal,ilk:number,son:number,seviye:number):BandoKaydi{
  const c=baglam(),out=muzikCikisi(),buffer=hazir.get(dal),b=60/tempo[dal];
  const eski=medya.get(dal);
  if(eski&&!buffer){
    const ses=eski.ses,bas=ilk*b,sure=(son-ilk)*b,t0=performance.now();
    let sonAn=0,kapatildi=false,sessizBas:number|null=null,ilerledi=t0;
    const carpan=(eski.asil ? .8 : 1)*seviye;
    function ayar(){const a=durum.i.ayarlar;ses.muted=!a.muzik;ses.volume=Math.max(0,Math.min(1,a.seviye*carpan))}
    function durdur(){if(kapatildi)return;kapatildi=true;ses.pause();ses.removeEventListener('error',duyulmuyor);document.removeEventListener('visibilitychange',gizlen);window.removeEventListener('pagehide',durdur)}
    function duyulmuyor(){if(sessizBas===null&&!kapatildi){sessizBas=performance.now()-sonAn*1000;ses.pause()}}
    const gizlen=()=>{if(document.hidden)durdur()};
    const gecen=()=>{
      if(kapatildi)return sonAn;ayar();
      if(sessizBas!==null)sonAn=(performance.now()-sessizBas)/1000;
      else{
        const simdi=performance.now(),t=ses.currentTime-bas;if(t>sonAn+.005)ilerledi=simdi;
        sonAn=Math.max(sonAn,t);
        // Medya oynatıcı “oynuyor” görünürken aygıt sesi kilitlenebilir.
        // İlerlemeyen iki saniye puana yazılmaz. Bu oturumda geç gelen
        // müzik işaretlerin arkasından yetişmeye çalışmasın.
        if(!document.hidden&&!ses.ended&&simdi-ilerledi>2100)duyulmuyor();
      }
      if(ses.ended&&bas+sure>ses.duration-.2)sonAn=Math.max(sonAn,sure);
      if(sonAn>=sure){sonAn=sure;durdur()}return sonAn;
    };
    ses.pause();ses.currentTime=bas;ayar();ses.addEventListener('error',duyulmuyor);document.addEventListener('visibilitychange',gizlen);window.addEventListener('pagehide',durdur);
    void ses.play().catch(duyulmuyor);
    return {gecen,sure,durdur};
  }
  if(!c||!out||!buffer)return gosteriTaslagi(dal,tempo[dal],ilk,son,seviye);
  const kaynak=c.createBufferSource(),g=c.createGain(),bas=c.currentTime+.065,sure=(son-ilk)*b;
  kaynak.buffer=buffer;kaynak.connect(g).connect(out);g.gain.value=.8*seviye;
  const durdur=()=>{if(bitti)return;bitti=true;g.gain.cancelScheduledValues(c.currentTime);g.gain.setTargetAtTime(.00001,c.currentTime,.012);kaynak.stop(c.currentTime+.06)};
  let bitti=false;
  kaynak.onended=()=>{bitti=true;kaynak.disconnect();g.disconnect()};
  g.gain.setValueAtTime(.00001,bas);g.gain.linearRampToValueAtTime(.8*seviye,bas+.012);
  g.gain.setValueAtTime(.8*seviye,bas+sure-.025);g.gain.linearRampToValueAtTime(.00001,bas+sure);
  kaynak.start(bas,ilk*b,sure);
  return {gecen:()=>c.currentTime-bas,sure,durdur};
}
