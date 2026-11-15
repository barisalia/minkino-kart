// Real browser gameplay, including its original dialogue and Web Audio mix.
// A local route serves the checked release assets. Does not open another dev server.
import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {performance} from 'node:perf_hooks';
const out=resolve('output/hazirlik/gosteri-kontrol/oynanis');await mkdir(out,{recursive:true});
const exe=resolve('node_modules/ffmpeg-static/ffmpeg.exe'),dal=process.argv[2]==='sarki'?'sarki':'dans';
const aile=process.argv.includes('--aile'),tamSabah=dal==='dans'||aile,saveKey='minkino-hazirlik-'+(tamSabah?'sabah':'kres')+'-v1',etiket=dal+(aile?'-aile':'');
const video=join(out,etiket+'-sessiz.mp4'),ses=join(out,etiket+'.webm'),son=resolve('output/hazirlik/Yil-Sonu-'+(aile?'Eve-Donus':dal==='dans'?'Dans':'Sarki')+'-Oynanis.mp4');
const tar=await chromium.launch({channel:'msedge',args:['--autoplay-policy=no-user-gesture-required']});
let enc;
try{
 const p=await tar.newPage({viewport:{width:1280,height:720},hasTouch:true});p.setDefaultTimeout(23000);
 const hata=[];p.on('pageerror',e=>hata.push(e.message));
 const mime={'.js':'application/javascript','.html':'text/html','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp'};
 await p.route('http://minkino-oyun.local/**',async r=>{const q=new URL(r.request().url()).pathname;try{
   await r.fulfill({body:await readFile(resolve('output/hazirlik/kres-ci/paket','.'+q+(q.endsWith('/')?'index.html':''))),contentType:mime[extname(q)]});
 }catch{await r.fulfill({status:404})}});
 await p.addInitScript(()=>{
   const original=AudioContext.prototype.createDynamicsCompressor,paket=[];
   let ak,mix,rec;
   function bagla(c){
     if(!mix){ak=c;mix=c.createMediaStreamDestination();rec=new MediaRecorder(mix.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:192000});rec.ondataavailable=e=>paket.push(e.data)}
     return mix;
   }
   AudioContext.prototype.createDynamicsCompressor=function(){const comp=original.call(this);comp.connect(bagla(this));return comp};
   const oynat=HTMLMediaElement.prototype.play,baglanan=new WeakSet();
   HTMLMediaElement.prototype.play=function(){
     if(this instanceof HTMLAudioElement&&ak&&!baglanan.has(this)){
       const src=ak.createMediaElementSource(this);src.connect(mix);src.connect(ak.destination);baglanan.add(this);
     }
     return oynat.call(this);
   };
   window.kaydiBaslat=()=>{if(!rec)return false;rec.start(1000);return true};
   window.kaydiAl=()=>new Promise(r=>{rec.onstop=async()=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(paket,{type:rec.mimeType}))};rec.stop()});
 });
 await p.goto('http://minkino-oyun.local/hazirlik/'+(tamSabah?'':'?ders=kres'));
 const n=id=>p.locator('[data-kres="'+id+'"]'),b=ad=>p.getByRole('button',{name:ad,exact:true});
 if(tamSabah){
   const sec=id=>p.locator('#sahne:not([inert]) [data-action="'+id+'"]').tap();
   for(const id of ['basla','sari','mutfaga','peynir','marul','ekmek','paket','armut','kapak'])await sec(id);
   await b('Musluğu aç, matarayı doldur').tap();
   for(const id of ['matara-kapat','cebe','cantaya'])await sec(id);
   const kapak=await p.locator('[data-action=cantayi-kapat]').boundingBox(),x=kapak.x+kapak.width*.5,y=kapak.y+kapak.height*.2;
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x,y+kapak.height*.45,{steps:8});await p.mouse.up();
   await n('kapi-zili').tap();
   for(const id of ['as','beslenme','pecete-ser','ac','meyve-servis','servis'])await sec(id);
   await b('Mataradan bardağa su doldur').tap();
   for(const id of ['ye','bir-yudum','meyve-isir','kalani-sakla','okul-kutusu-kapat','kutuyu-kaldir','derse-gir'])await sec(id);
 }
 await n('sola').waitFor();const t=async(id)=>n(id).tap();
 await b('Sesi kapat').tap();await b('Sesi aç').tap();
 await p.waitForTimeout(1300);
 const c=await p.context().newCDPSession(p);
 enc=spawn(exe,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','2',video],{stdio:['pipe','ignore','inherit'],windowsHide:true});
 let last,frames=0,t0=performance.now(),done=false;
 c.on('Page.screencastFrame',f=>{last=Buffer.from(f.data,'base64');void c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
 await c.send('Page.startScreencast',{format:'jpeg',quality:93,maxWidth:1280,maxHeight:720,everyNthFrame:1});
 while(!last)await new Promise(r=>setTimeout(r,20));
 if(!await p.evaluate(()=>window.kaydiBaslat()))throw Error('Ses kayıt yolu hazır değil');
 t0=performance.now();
 function yaz(){if(done)return;const hedef=Math.floor((performance.now()-t0)*24/1000);while(frames<hedef){enc.stdin.write(last);frames++}}
 const anim=setInterval(yaz,23);const bekle=t=>p.waitForTimeout(t);
 try{
   await bekle(900);await t('sola');await bekle(2200);await b('Perdeyi aç').tap();
   await p.locator('.gosteri-oyunu[data-sahne=mino]').waitFor();await bekle(3700);await b('Arkadaşını alkışla').tap();
   await p.locator('.gosteri-oyunu[data-sahne=bulut]').waitFor();await bekle(4300);await b('Arkadaşını alkışla').tap();
   const secim=b(dal==='dans'?'Birlikte dans et':'Birlikte şarkı söyle');await secim.waitFor();await bekle(3100);await secim.tap();await bekle(4300);
   const pads=p.locator('.gosteri-ped');await pads.first().waitFor();await bekle(3700);for(let i=0;i<await pads.count();i++){await pads.nth(i).tap();await bekle(1100)}
   await b('Final gösterisini başlat').waitFor();await bekle(2000);await b('Final gösterisini başlat').tap();
   for(let i=0;i<10;i++){
     await p.waitForFunction(()=>{const r=document.querySelector('.gosteri-ray');return r?.firstElementChild&&Number(r.style.getPropertyValue('--inis'))>.83});
     const el=await p.locator('.gosteri-dusen').evaluate(e=>Number(e.className.match(/iz-(\d)/)[1]));
     if(aile&&i===3)await pads.nth((el+1)%4).tap();
     if(dal==='dans'&&el===1){const z=await p.locator('.gosteri-ikili').boundingBox(),x=z.x+z.width*.31,y=z.y+z.height*.62;
       await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
       await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+67,y:y+2,id:1}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     }else await pads.nth(el).tap();
     await p.waitForFunction(({i,key})=>JSON.parse(localStorage[key]).kres.gosteri.isaretler.length>i,{i,key:saveKey});
   }
   await b('Gösteriden eve dön').waitFor();
   const puan=await p.evaluate(key=>JSON.parse(localStorage[key]).kres.gosteri.sonuc.puan,saveKey);
   if(puan!==(aile?9:10))throw Error('Beklenmeyen gösteri puanı: '+puan);
   await bekle(3500);await b('Gösteriden eve dön').tap();await bekle(1200);await t('yolda-kino');await n('ev-zili').waitFor();await bekle(1500);await t('ev-zili');
   await n('ev-aski').waitFor();await bekle(2700);await t('ev-aski');await bekle(4600);await t('hatirla-gosteri');
   if(aile){await bekle(3400);await t('ev-goster-1')}
   await bekle(3900);await t('ev-hatira');await bekle(2200);await t('anne');await n('ev-sarilma').waitFor();await bekle(4000);
   if(hata.length)throw Error(hata.join('; '));
 }finally{clearInterval(anim);yaz();done=true;enc.stdin.end();await c.send('Page.stopScreencast')}
 const veri=await p.evaluate(()=>window.kaydiAl());await writeFile(ses,Buffer.from(veri,'base64'));
 if(enc.exitCode===null)await once(enc,'exit');if(enc.exitCode)throw Error('Görüntü kodlanmadı');
 const mux=spawn(exe,['-loglevel','error','-y','-i',video,'-i',ses,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',son],{stdio:'inherit',windowsHide:true});
 const [code]=await once(mux,'exit');if(code)throw Error('Ses ve görüntü birleştirilemedi');console.log(son,frames+' kare');
}finally{if(enc&&enc.exitCode===null)enc.kill();await tar.close()}
