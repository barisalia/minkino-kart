// Nihai müzik beklenirken yükleme, bölme ve yedek besteyi gerçek ses motorunda
// sınar. Üretim varlıklarına kılavuz kopyalamaz ve sunucu açmaz.
import {build} from 'vite';
import {chromium,webkit} from 'playwright';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
const root=process.cwd(),entry='virtual:konser-ses-prova',dosya=ad=>resolve(root,ad).replaceAll('\\','/');
const kapsul=await build({configFile:false,publicDir:false,logLevel:'error',plugins:[{
  name:'testte-beklenen-miksler',enforce:'pre',
  resolveId(id){if(id.endsWith(entry))return '\0'+entry},
  load(id){if(id==='\0'+entry)return [
    'import {sesMotorunuAc} from '+JSON.stringify(dosya('src/audio/motor.ts'))+';',
    'import {kaydiHazirla,sahneMuzigi} from '+JSON.stringify(dosya('hazirlik/src/gosteri-muzigi.ts'))+';',
    'window.prova={sesMotorunuAc,kaydiHazirla,sahneMuzigi};'
  ].join('\n')},
  transform(code,id){if(!id.endsWith('/hazirlik/src/gosteri-muzigi.ts'))return;
    const kalip=/const dosyalar=import\.meta\.glob[^\n]*;/;
    assert.match(code,kalip);
    return code.replace(kalip,'const dosyalar={"sahne-bizim.wav":"/sahne-bizim.wav","pati-pati-dans.wav":"/pati-pati-dans.wav"};');
  }
}],build:{target:'es2020',write:false,minify:false,assetsInlineLimit:0,rollupOptions:{input:entry,output:{format:'iife',name:'TestSesi'}}}});
const js=(Array.isArray(kapsul)?kapsul[0]:kapsul).output.find(x=>x.type==='chunk').code;
try{new Script(js)}catch(e){console.error(String(e.stack).split('\n').slice(0,4).map(s=>s.slice(0,220)).join('\n'));process.exit(1)}
const musik=new Map();
for(const [ad,d] of [['sahne-bizim','Sahne-Bizim-96BPM-kilavuz.wav'],['pati-pati-dans','Pati-Pati-Dans-150BPM-kilavuz.wav']])
  musik.set('/'+ad+'.wav',await readFile(resolve(root,'output/hazirlik/Gemini-kayit-seti',d)));
const tar=process.argv.includes('--webkit')?await webkit.launch():await chromium.launch({channel:'msedge'});
try{
  for(const dal of ['sarki','dans'])for(const kosul of ['zamaninda','yanlis-sure','okunamiyor']){
    const p=await tar.newPage({hasTouch:true}),hata=[],istek=[];
    p.on('pageerror',e=>{hata.push(e.message);console.error(e.stack?.slice(0,380)??e.message)});
    await p.route('http://prova.local/**',async route=>{
      const yol=new URL(route.request().url()).pathname;
      if(yol==='/')return route.fulfill({contentType:'text/html',body:'<button id="ac">Ses</button><script src="/ses.js"></script><script>ac.onclick=()=>window.prova.sesMotorunuAc()</script>'});
      if(yol==='/ses.js')return route.fulfill({contentType:'application/javascript; charset=utf-8',body:Buffer.from(js)});
      const sesVer=(body,mime)=>{
        const range=route.request().headers()['range']?.match(/^bytes=(\d+)-(\d*)$/);
        if(!range)return route.fulfill({contentType:mime,headers:{'accept-ranges':'bytes'},body});
        const bas=+range[1],son=range[2]?Math.min(body.length-1,+range[2]):body.length-1;
        return route.fulfill({status:206,contentType:mime,headers:{'accept-ranges':'bytes','content-range':'bytes '+bas+'-'+son+'/'+body.length},body:body.subarray(bas,son+1)});
      };
      if(yol.endsWith('.mp3')){
        const f=(Array.isArray(kapsul)?kapsul[0]:kapsul).output.find(x=>x.type==='asset'&&'/'+x.fileName===yol);
        if(f)return sesVer(Buffer.from(f.source),'audio/mpeg');
      }
      if(!musik.has(yol))return route.fulfill({status:404});
      istek.push(yol);
      if(kosul==='okunamiyor')return route.fulfill({contentType:'audio/wav',body:'bozuk'});
      return sesVer(musik.get(kosul==='zamaninda'?yol:yol.includes('sahne-bizim')?'/pati-pati-dans.wav':'/sahne-bizim.wav'),'audio/wav');
    });
    await p.addInitScript(webAudioKapali=>{
      // Hangi cihazın ses çıktısına hangi saniyeden ne çalındığı izlenir.
      if(webAudioKapali){Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});Object.defineProperty(window,'webkitAudioContext',{value:undefined,configurable:true})}
      window.medyaSaat=[];window.uzun=[];window.sentez=0;
      const onceki=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...a){
        window.medyaSaat.push({ses:this,asil:this.src.endsWith('.wav')});return onceki.apply(this,a);
      };
      if(!window.AudioBufferSourceNode||!window.OscillatorNode)return;
      const kayit=AudioBufferSourceNode.prototype.start,osc=OscillatorNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer?.duration>15)window.uzun.push(args.slice(1));return kayit.apply(this,args)};
      OscillatorNode.prototype.start=function(...args){window.sentez++;return osc.apply(this,args)};
    },process.argv.includes('--medya'));
    await p.goto('http://prova.local/');assert.deepEqual(hata,[]);await p.waitForFunction(()=>!!window.prova);await p.locator('#ac').tap();
    const r=await p.evaluate(async dal=>{
      const api=window.prova;
      await Promise.all([api.kaydiHazirla(dal),api.kaydiHazirla(dal)]);
      const saat=[];
      async function olc(k){
        if(window.medyaSaat.length){await new Promise(r=>setTimeout(r,200));const x=window.medyaSaat.at(-1);saat.push({t:x.ses.currentTime,asil:x.asil})}k.durdur();
      }
      const a=api.sahneMuzigi(dal,0,32);await olc(a);a.durdur();
      const b=api.sahneMuzigi(dal,32,64);await olc(b);
      await api.kaydiHazirla(dal);
      const c=api.sahneMuzigi(dal,40,56);await olc(c);
      return {uzun:window.uzun,sentez:window.sentez,saat,web:!!api.sesMotorunuAc(),destek:new Audio().canPlayType('audio/mpeg'),sure:[a.sure,b.sure,c.sure]};
    },dal);
    const v=60/(dal==='dans'?150:96),yakin=(n,m)=>assert.ok(Math.abs(n-m)<.00001,n+' ≠ '+m);
    assert.deepEqual(hata,[]);[32,32,16].forEach((o,i)=>yakin(r.sure[i],o*v));
    if(!r.web){
      if((!r.destek||!istek.length)&&r.saat.length===0){assert.equal(process.argv.includes('--webkit'),true);console.log(dal,kosul,'· medya kaynağını açmayan WebKit çalışma ortamında sessiz zaman yolu geçti');await p.close();continue}
      assert.ok(istek.length>=1);
      assert.equal(r.saat.length,3,JSON.stringify(r));[0,32,40].forEach((a,i)=>{assert.ok(Math.abs(r.saat[i].t-a*v)<.35,JSON.stringify(r));assert.equal(r.saat[i].asil,kosul==='zamaninda')});
    }else if(kosul==='zamaninda'){
      assert.equal(istek.length,1);
      assert.equal(r.uzun.length,3);assert.equal(r.sentez,0);
      [[0,32],[32,32],[40,16]].forEach(([a,b],i)=>{yakin(r.uzun[i][0],a*v);yakin(r.uzun[i][1],b*v)});
    }else{assert.equal(r.uzun.length,0);assert.ok(r.sentez>0)}
    console.log(dal,kosul,'· ilk bölüm, nakarat ve albüm geçti');await p.close();
  }
}finally{await tar.close()}
