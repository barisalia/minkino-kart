import { hedefDuyuldu, konusmaVar, ozellikler, sesPenceresi } from './ses-esleme';

type Sonuc = 'dogru'|'yeniden'|'erisim';
/** İzin ve ses bağlamını çocuğun ilk dokunuşunda aç. Öğretmenin örneği sırasında
 * yalnız oda seviyesini ölç; çocuk sırası gelene kadar ses örneklerini saklama. */
export function mikrofonHazirla(tekrarDenemesi=false){
  let soylemeyeCalisti=tekrarDenemesi;
  let kapali=false, istek=false, hazir=false, hata=false, zaman=0;
  let baglam:AudioContext|undefined, akim:MediaStream|undefined;
  let ornekler:ReturnType<typeof import('./mikrofon-ornekleri').sesOrnekleriniAl>|undefined;
  let isleyici:ScriptProcessorNode|undefined, kaynak:MediaStreamAudioSourceNode|undefined, sessiz:GainNode|undefined;
  let oturum:{id:string;seviye:(n:number)=>void;sonuc:(s:Sonuc)=>void;acildi:()=>void}|undefined;
  const parcalar:Float32Array[]=[], kareler:ReturnType<typeof sesPenceresi>[]=[];
  const ortam:number[]=[];
  let taban=.0002, sonEtkin=0, baslangic=0, konustu=false;
  let odaSessizMs=0, alinanMs=0, cevapAcik=false;
  function kapat(){
    if(kapali)return;
    kapali=true;clearTimeout(zaman);oturum=undefined;
    if(isleyici)isleyici.onaudioprocess=null;
    kaynak?.disconnect();isleyici?.disconnect();sessiz?.disconnect();
    akim?.getTracks().forEach(t=>t.stop());
    if(baglam && baglam.state!=='closed')void baglam.close().catch(()=>{});
    parcalar.length=0;kareler.length=0;
  }
  function bitir(s:Sonuc){
    const sonuc=oturum?.sonuc;kapat();sonuc?.(s);
  }
  function degerlendir(sonDeneme=true){
    if(!oturum || !baglam || !ornekler || !kareler.length){bitir('yeniden');return;}
    const boy=parcalar[0].length, ms=boy*1000/baglam.sampleRate;
    if(!konustu || (!sonDeneme && kareler.length*ms-sonEtkin<220) || !konusmaVar(kareler,ms,taban)){bitir('yeniden');return;}
    if(soylemeyeCalisti){bitir('dogru');return;}
    soylemeyeCalisti=true;
    const esik=Math.max(.00035,taban*1.8);
    const sesliKare=(k:typeof kareler[number])=>k.rms>esik&&(k.sesli||k.surtunme);
    const ilk=kareler.findIndex(sesliKare);
    let son=kareler.length-1;
    while(son>ilk&&!sesliKare(kareler[son]))son--;
    if(ilk>=0){
      // Beklerken alınan oda sesini kelimenin başı veya sonu gibi eşleştirme.
      const kesit=parcalar.slice(Math.max(0,ilk-3),son+4);
      const pcm=new Float32Array(kesit.length*boy);
      kesit.forEach((p,i)=>pcm.set(p,i*boy));
      if(hedefDuyuldu(ozellikler(pcm,baglam.sampleRate),oturum.id,ornekler)){bitir('dogru');return;}
    }
    if(sonDeneme){bitir('yeniden');return;}
    // Dinleme süresi içindeki ikinci söyleyişi önceki denemeyle birleştirme.
    konustu=false;sonEtkin=0;parcalar.length=0;kareler.length=0;
    oturum.seviye(0);
  }
  function dinlemeyiAc(){
    if(!oturum || !hazir || kapali)return;
    clearTimeout(zaman);
    const dizi=[...ortam].sort((a,b)=>a-b);
    // Öğretmenin hoparlörden dönüşünü oda gürültüsü olarak kalibre etme.
    taban=Math.max(.00025,dizi[Math.floor(dizi.length*.18)]??.00025);
    baslangic=performance.now();zaman=window.setTimeout(degerlendir,7600);

  }
  async function izinAl(){
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('mikrofon');
      baglam=new AudioContext();
      void baglam.resume().catch(()=>{});
      const izin=navigator.mediaDevices.getUserMedia({audio:{channelCount:1,autoGainControl:true,noiseSuppression:true,echoCancellation:true}});
      // Çocuk hece veya piknik oynarken ses tanıma bankasına ihtiyaç yok.
      // Derste kayıtlar, öğretmenin örneği ve mikrofon izniyle aynı anda hazırlanır.
      const banka=import('./mikrofon-ornekleri').then(m=>m.sesOrnekleriniAl()).catch(()=>undefined);
      // Askıdaki bağlam veya geç gelen izin dersi ve açık mikrofonu geride bırakmasın.
      const gelen=await izin;
      if(kapali){gelen.getTracks().forEach(t=>t.stop());return;}
      akim=gelen;
      [ornekler]=await Promise.all([banka,baglam.resume()]);
      if(kapali)return;
      if(!ornekler)throw new Error('Ses örnekleri açılamadı');
      const ctx=baglam;
      kaynak=ctx.createMediaStreamSource(gelen);
      const boy=ctx.sampleRate>32000?1024:512;
      isleyici=ctx.createScriptProcessor(boy,1,1);
      sessiz=ctx.createGain();sessiz.gain.value=0;
      kaynak.connect(isleyici);isleyici.connect(sessiz);sessiz.connect(ctx.destination);
      isleyici.onaudioprocess=e=>{
        if(kapali)return;
        const p=e.inputBuffer.getChannelData(0), k=sesPenceresi(p,ctx.sampleRate);
        if(!oturum || !baslangic){
          ortam.push(k.rms);if(ortam.length>180)ortam.shift();
          // İzin verilmiş olsa da ses hattı henüz veri taşımıyor olabilir.
          // Çocuğa sırasını ancak gerçekten tampon almaya başlayınca göster.
          if(!hazir && ortam.length>=3){hazir=true;dinlemeyiAc();}
          return;
        }
        const ms=boy*1000/ctx.sampleRate;
        const esik=Math.max(.00035,taban*1.8);
        if(!cevapAcik){
          // Öğretmenin son sesi ve sürücünün sırada beklettiği tamponlar cevaba girmez.
          alinanMs+=ms;
          odaSessizMs=k.rms<esik?odaSessizMs+ms:0;
          if(alinanMs>=190 && (odaSessizMs>=150 || alinanMs>=650)){
            cevapAcik=true;
            clearTimeout(zaman);
            zaman=window.setTimeout(degerlendir,7600);
            oturum.acildi();
          }
          return;
        }
        parcalar.push(p.slice());kareler.push(k);
        const an=kareler.length*ms;
        const hareket=k.rms>esik && (k.sesli||k.surtunme);
        oturum.seviye(hareket?Math.min(100,17+22*Math.log2(k.rms/esik)):0);
        if(hareket){sonEtkin=an;konustu=true;}
        if(konustu && an-sonEtkin>=220 && konusmaVar(kareler,boy*1000/ctx.sampleRate,taban))degerlendir(false);
      };
    }catch{hata=true;if(oturum)bitir('erisim');else{akim?.getTracks().forEach(t=>t.stop());}}
  }
  return {
    hazirla(){if(!istek){istek=true;void izinAl();}},
    dinle(id:string,seviye:(n:number)=>void,sonuc:(s:Sonuc)=>void,acildi:()=>void=()=>{}){
      if(kapali||hata){kapat();sonuc('erisim');return;}
      oturum={id,seviye,sonuc,acildi};
      zaman=window.setTimeout(()=>bitir('erisim'),9500);
      this.hazirla();dinlemeyiAc();
    },
    kapat,
  };
}

export function dinle(id:string,seviye:(n:number)=>void,sonuc:(s:Sonuc)=>void){
  const mikrofon=mikrofonHazirla();mikrofon.dinle(id,seviye,sonuc);return mikrofon.kapat;
}
