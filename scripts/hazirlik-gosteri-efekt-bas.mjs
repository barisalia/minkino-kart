// Asıl sentezden tek seferlik PCM üret: HTML ses yolunda elin cevabı da
// Web Audio ile aynı armoni ve aynı tınıda kalsın. Sunucu başlatmaz.
import {build} from 'vite';
import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const dosya=n=>resolve(n).replaceAll('\\','/'),ana='virtual:konser-tinilari',out=resolve('assets/hazirlik/gosteri-muzik/efekt');
const pak=await build({configFile:false,publicDir:false,logLevel:'error',plugins:[{
 name:'sadece-studyo',enforce:'pre',resolveId(id){if(id.endsWith(ana))return '\0'+ana},
 load(id){if(id==='\0'+ana)return [
   ['sahne-ortami','ciz'],['bando','sarkiCevabi,calgiSesi'],['motor','baglamiDegistir']
 ].map(([n,ad])=>'import {'+ad+'} from '+JSON.stringify(dosya('src/audio/'+n+'.ts'))+';').join('\n')+'\nwindow.S={ciz,sarkiCevabi,calgiSesi,baglamiDegistir};'}
}],build:{write:false,target:'es2020',rollupOptions:{input:ana,output:{format:'iife'}}}});
const js=(Array.isArray(pak)?pak[0]:pak).output.find(x=>x.type==='chunk').code;
await mkdir(out,{recursive:true});
const tar=await chromium.launch({channel:'msedge'});try{
 const p=await tar.newPage();
 await p.route('http://localhost:5173/**',r=>r.fulfill(r.request().url().endsWith('ses.js')?{contentType:'application/javascript; charset=utf-8',body:Buffer.from(js)}:{contentType:'text/html',body:'<script src="/ses.js"></script>'}));
 await p.goto('http://localhost:5173/');
 const kayitlar=await p.evaluate(async()=>{
   const items=[],sr=48000;
   const wav=(ad,buf)=>{
     const channels=buf.numberOfChannels,bytes=BufferOlustur(buf.length*channels*2+44),v=new DataView(bytes.buffer);
     function yaz(i,s){for(let k=0;k<s.length;k++)bytes[i+k]=s.charCodeAt(k)}
     yaz(0,'RIFF');v.setUint32(4,bytes.length-8,true);yaz(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2*channels,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);yaz(36,'data');v.setUint32(40,bytes.length-44,true);
     const d=Array.from({length:channels},(_,i)=>buf.getChannelData(i));let tepe=0;
     for(let i=0;i<buf.length;i++)for(let j=0;j<channels;j++){const say=d[j][i];tepe=Math.max(tepe,Math.abs(say));v.setInt16(44+(i*channels+j)*2,Math.round(Math.max(-1,Math.min(1,say))*32767),true)}
     if(tepe<.007||tepe>=1)throw Error(ad+' düzey '+tepe);
     let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));items.push([ad,btoa(str)]);
   };
   function BufferOlustur(n){return new Uint8Array(n)}
   const tek=async(ad,sure,fn)=>{const c=new OfflineAudioContext(1,Math.ceil(sure*sr),sr),geri=S.baglamiDegistir(c);try{fn();wav(ad,await c.startRendering())}finally{geri()}};
   const temiz=new OfflineAudioContext(2,sr*2,sr);
   for(const n of ['pati-a','pati-b','taban-a','taban-b','perde','salon'])wav(n,S.ciz(temiz,n));
   for(const a of [false,true]){
     const id='nota-'+(a?'ay':'gunes')+'-';
     for(const [i,bas] of [0,4,16,20].entries()){
       await tek(id+'cocuk-'+i,.97,()=>S.sarkiCevabi(a,bas,false,false));
       await tek(id+'kisa-'+i,.23,()=>S.sarkiCevabi(a,bas,true,false));
     }
     await tek(id+'aile',.97,()=>S.sarkiCevabi(a,0,false,true));
   }
   for(const [i,n] of [[0,48],[3,72],[3,76],[3,79],...[72,74,76,78,79,81,83].map(n=>[4,n])])
     await tek('calgi-'+i+'-'+n,i===0?.34:.70,()=>S.calgiSesi(i,n));
   return items;
 });
 for(const [ad,base] of kayitlar)await writeFile(resolve(out,ad+'.wav'),Buffer.from(base,'base64'));
 console.log(kayitlar.length+' ses; 48 kHz PCM. Alkış, adım, perde, seyirci, ev ve sahne cevabı.');
}finally{await tar.close()}
