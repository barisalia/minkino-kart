// Render both score arrangements from the same code as the interactive mixer.
import {build} from 'vite';
import {chromium} from 'playwright';
import {resolve,join} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const out=resolve('output/hazirlik/gosteri-kontrol/muzik'),asillar=resolve('assets/hazirlik/gosteri-muzik/gecici');
await mkdir(out,{recursive:true});await mkdir(asillar,{recursive:true});
const cfg=await build({configFile:false,publicDir:false,logLevel:'error',build:{target:'es2020',write:false,lib:{entry:resolve('src/audio/bando.ts'),name:'Konser',formats:['iife']}}});
const js=(Array.isArray(cfg)?cfg[0]:cfg).output.find(f=>f.type==='chunk').code;
const browser=await chromium.launch({channel:'msedge'});
try{
 const p=await browser.newPage();
 await p.route('http://localhost:5173/**',r=>r.fulfill(r.request().url().endsWith('ses.js')?{contentType:'application/javascript',body:js}:{contentType:'text/html',body:'<script src="/ses.js"></script>'}));
 await p.goto('http://localhost:5173/');
 for(const [dal,bpm,ad] of [['sarki',96,'sahne-bizim'],['dans',150,'pati-pati-dans']]){
  const pcm=await p.evaluate(async({dal,bpm})=>{
    const b=await Konser.konserEsliginiBas(dal,bpm),L=b.getChannelData(0),R=b.getChannelData(1);
    let peak=0;for(let i=0;i<b.length;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
    if(peak<.03||peak>=.999)throw Error('Miks tepe seviyesi '+peak);
    const data=new Int16Array(b.length*2);for(let i=0;i<b.length;i++){data[2*i]=Math.round(L[i]*32767);data[2*i+1]=Math.round(R[i]*32767)}
    const bytes=new Uint8Array(data.buffer),pieces=[];for(let i=0;i<bytes.length;i+=16384)pieces.push(btoa(String.fromCharCode(...bytes.subarray(i,i+16384))));
    return {pieces,sr:b.sampleRate,peak};
  },{dal,bpm});
  const raw=Buffer.concat(pcm.pieces.map(s=>Buffer.from(s,'base64'))),bin=join(out,ad+'-48k.s16');
  await writeFile(bin,raw);
  const enc=spawnSync(resolve('node_modules/ffmpeg-static/ffmpeg.exe'),['-hide_banner','-loglevel','error','-y','-f','s16le','-ar',String(pcm.sr),'-ac','2','-i',bin,'-c:a','libmp3lame','-b:a','256k',join(asillar,ad+'-gecici.mp3')],{stdio:'inherit',windowsHide:true});
  if(enc.status!==0)throw Error('Kodlayıcı '+enc.status);
  console.log(ad,raw.length/4/pcm.sr+' sn',20*Math.log10(pcm.peak)+' dBFS');
 }
}finally{await browser.close()}
