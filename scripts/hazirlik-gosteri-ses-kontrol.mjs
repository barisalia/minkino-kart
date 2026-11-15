// Gerçek Web Audio çıkışından iki referans miks çıkarır; dosyalara çevrimiçi
// bir servisten ses indirmez. Üretim oyununa veya çocuğun kayıtlarına dokunmaz.
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const cikis=resolve('output/hazirlik/gosteri-kontrol/muzik'), kok=resolve('output/hazirlik/kres-ci/paket');
const tarayici=await chromium.launch({channel:'msedge'});
try{
  await mkdir(cikis,{recursive:true});
  for(const [dal,ad] of [['sarki','Sahne-Bizim'],['dans','Pati-Pati-Dans']]){
    const sayfa=await tarayici.newPage({viewport:{width:960,height:540}});
    await sayfa.addInitScript(()=>{
      const AC=window.AudioContext;
      window.AudioContext=class extends AC{
        constructor(...args){super(...args);window.sahneAudio=this}
        createDynamicsCompressor(){const node=super.createDynamicsCompressor();window.sahneMiks=node;return node}
      };
    });
    await sayfa.route('http://minkino.local/**',async route=>{
      const p=new URL(route.request().url()).pathname, dosya=resolve(kok,'.'+p+(p.endsWith('/')?'index.html':''));
      try{await route.fulfill({body:await readFile(dosya),contentType:({'.js':'application/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg'})[extname(dosya)]})}catch{await route.fulfill({status:404,body:'missing'})}
    });
    await sayfa.goto('http://minkino.local/hazirlik/?ders=kres');
    await sayfa.locator('[data-kres=sola]').waitFor();
    await sayfa.evaluate(d=>{
      const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
      Object.assign(s.kres.gosteri,{bolum:'final',dal:d,kararlar:[true,true],prova:2,isaretler:[]});localStorage[key]=JSON.stringify(s);
    },dal);
    await sayfa.reload();
    await sayfa.evaluate(()=>{
      // Gerçek kare hızında stereo miks; clipping, uzun sessizlik ve baştaki
      // gecikme kayıtta görülebilir. İşlemci bu kontrol sayfasına özeldir.
      document.addEventListener('click',e=>{
        if(!(e.target instanceof Element)||!e.target.closest('.gosteri-baslat'))return;
        setTimeout(()=>{
          const c=window.sahneAudio,mix=window.sahneMiks;if(!c||!mix)return;
          const capture=c.createScriptProcessor(2048,2,2),silent=c.createGain();silent.gain.value=0;
          mix.connect(capture);capture.connect(silent).connect(c.destination);
          window.pcm=[];window.pcmRate=c.sampleRate;
          capture.onaudioprocess=e=>{
            const l=e.inputBuffer.getChannelData(0),r=e.inputBuffer.getChannelData(1),buf=new Int16Array(l.length*2);
            for(let i=0;i<l.length;i++){buf[2*i]=Math.round(Math.max(-1,Math.min(1,l[i]))*32767);buf[2*i+1]=Math.round(Math.max(-1,Math.min(1,r[i]))*32767)}
            window.pcm.push(buf);
          };
        },0);
      },true);
    });
    await sayfa.getByRole('button',{name:'Final gösterisini başlat'}).click();
    await sayfa.locator('[data-sahne=sonuc].gosteri-oyunu').waitFor({timeout:53000});
    const kayit=await sayfa.evaluate(()=>{
      const d=window.pcm;if(!d?.length)throw Error('Miks kaydedilmedi');const paket=d.map(b=>{const bytes=new Uint8Array(b.buffer);return btoa(String.fromCharCode(...bytes))});
      return {rate:window.pcmRate,paket};
    });
    const pcm=Buffer.concat(kayit.paket.map(p=>Buffer.from(p,'base64')));
    const header=Buffer.alloc(44),rate=kayit.rate;header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
    let max=0,toplam=0;for(let i=0;i<pcm.length;i+=2){const n=Math.abs(pcm.readInt16LE(i))/32768;max=Math.max(max,n);toplam+=n*n}
    if(max<.012||max>=.995)throw Error(ad+': tepe düzeyi beklenmiyor '+max);
    await writeFile(resolve(cikis,ad+'-gecici.wav'),Buffer.concat([header,pcm]));
    console.log(ad,{sn:(pcm.length/(4*rate)).toFixed(2),tepeDB:(20*Math.log10(max)).toFixed(2),rmsDB:(10*Math.log10(toplam/(pcm.length/2))).toFixed(2)});
    await sayfa.close();
  }
}finally{await tarayici.close()}
