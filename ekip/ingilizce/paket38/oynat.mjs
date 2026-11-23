import { chromium } from 'playwright';
import { readFile,copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const names=process.argv.slice(2), archive=resolve('ekip/ingilizce/paket38'),target=resolve('assets/ingilizce/kelime');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files']});
try{
 const page=await browser.newPage();await page.goto(pathToFileURL(resolve(archive,'kontrol',names[0]+'-poz.jpg')).href);
 for(let j=0;j<names.length;j+=4){
  const batch=names.slice(j,j+4).map(n=>[0,1,2,3].map(k=>pathToFileURL(resolve(archive,'stage',n,n+'-z'+k+'.webp')).href));
  await page.evaluate(async batch=>{
   document.body.replaceChildren();
   const sets=await Promise.all(batch.map(async urls=>Promise.all(urls.map(async url=>{const im=new Image();im.src=url;await im.decode();return im}))));
   const c=document.createElement('canvas');c.width=800;c.height=200;document.body.append(c);const ctx=c.getContext('2d');
   const seen=new Set();await new Promise(done=>{const start=performance.now();function tick(now){let t=now-start;const k=[0,1,2,3,0][Math.floor(t/120)%5]??0;seen.add(k);ctx.clearRect(0,0,800,200);sets.forEach((images,i)=>{let im=images[k],s=Math.min(190/im.width,190/im.height);ctx.drawImage(im,i*200+(200-im.width*s)/2,(200-im.height*s)/2,im.width*s,im.height*s)});if(t<2500)requestAnimationFrame(tick);else done()}requestAnimationFrame(tick)});
   if(seen.size!==4)throw Error('Oynatımda kare eksik');
  },batch);
 }
 for(const n of names)for(let k=0;k<4;k++){
  const file=n+'-z'+k+'.webp';await copyFile(resolve(archive,'stage',n,file),resolve(target,file));
 }
 console.log(names.join(', ')+' — gerçek süre ve dört kare doğrulandı');
}finally{await browser.close()}
