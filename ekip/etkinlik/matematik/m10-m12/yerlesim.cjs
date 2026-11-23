const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const {qa,assets,sets,spec} = require('./hazirla.cjs');
const lookup=new Map(sets.flatMap(([dir,...pages])=>pages.flat().map(k=>[k,path.join(assets,dir,k+'.webp')])));
function art(k){return sharp(lookup.get(k));}
async function layer(k,x,y,width){
  const source=art(k);
  if(width) source.resize({width});
  return {input:await source.png().toBuffer(),left:x,top:y};
}
async function region(k,box,x,y){
  return {input:await art(k).extract(box).png().toBuffer(),left:x,top:y};
}
async function proof(k,bg,layers){
  const file=path.join(qa,k+'.webp');
  await art(bg).composite(await Promise.all(layers)).webp({lossless:true}).toFile(file);
}
async function picnic(pose,full=false){
  const layers=[];
  // Both pairs of paws meet the back of the table at y=413. Lower bodies are behind it.
  layers.push(region('kino-kase-'+pose,{left:0,top:0,width:500,height:379},258,35));
  layers.push(region('lokum-kase-'+pose,{left:0,top:223,width:500,height:287},900,127));
  for (const [i,key] of ['kase-kino','kase-lokum'].entries()) {
    const x=i?940:310;
    layers.push(layer(key,x,400));
    const positions=full?(i?[]:Array.from({length:10},(_,n)=>[46+62*(n%5)+(n<5?22:0),n<5?7:43])):(i?[[103,35],[186,28]]:[[78,32],[155,20],[235,32]]);
    for(const [dx,dy] of positions) layers.push(layer('mandalina',x+dx,400+dy,full?54:69));
  }
  await proof(full?'m10-on-mandalina':'m10-'+pose,'piknik-masasi',layers);
}
async function workshop(){
  const layers=[region('baba-takim-0',{left:0,top:0,width:600,height:429},510,18)];
  const ks=['kirmizi-kare-buyuk','mavi-daire-kucuk','kirmizi-daire-kucuk','mavi-kare-buyuk'];
  for(let i=0;i<ks.length;i++) layers.push(layer(ks[i],716+114*(i%2),470+90*Math.floor(i/2),86));
  for(const [i,x] of [329,959].entries()){
    const sc=.8; layers.push(layer('takim-kutusu',x,528,384));
    const middle=x+240*sc; layers.push(layer(i?'mavi-daire-buyuk':'kirmizi-daire-buyuk',Math.round(middle)-41,650,82));
  }
  await proof('m11','baba-atolyesi',layers);
}
async function forest(){
  const bg='agac-dibi';
  const cover='zipzip-sakla-0';
  const x=765,y=122;
  const {data,info}=await art(bg).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Use the actual back edge of the stump, including its black contour.
  const color=Array.from(data.subarray((650*info.width+835)*4,(650*info.width+835)*4+3));
  for(let col=0;col<info.width;col++){
    let row=400;
    while(row<760 && !color.every((v,j)=>Math.abs(v-data[(row*info.width+col)*4+j])<5))row++;
    for(let iy=0;iy<row-3;iy++)data[(iy*info.width+col)*4+3]=0;
  }
  const edge={input:await sharp(data,{raw:info}).png().toBuffer(),left:0,top:0};
  const {data:arm,info:ai}=await art(cover).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let iy=0;iy<ai.height;iy++)for(let ix=0;ix<ai.width;ix++){
    if(iy<347 || iy>445 || ix>Math.max(218,274-(iy-347)*.83))arm[(iy*ai.width+ix)*4+3]=0;
  }
  const arms={input:await sharp(arm,{raw:ai}).png().toBuffer(),left:x,top:y};
  const layers=[layer(cover,x,y),edge,layer('hasir-sepet',630,450),arms,layer('findik',465,645,72),layer('findik',558,681,73)];
  await proof('m12-temas',bg,layers);
  const base=[layer('zipzip-sakla-1',1140,83),edge,layer('hasir-sepet',630,450),layer('findik',465,645,72),layer('findik',558,681,73)];
  await proof('m12-bekleme',bg,base);
}
function catalog(){
 const tr=['Lokum’un İki Kâsesi','Baba’nın Takım Çantası','Zıpzıp’ın Saklı Fındıkları'];
 let html='<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Matematik · M10–M12</title><style>*{box-sizing:border-box}body{margin:0;background:#e7f0f2;color:#243741;font:16px system-ui}main{max-width:1150px;margin:auto}section{background:#fff;border-radius:1rem;padding:1rem 1.4rem;margin:1rem}h2{font-size:1.1rem}article{display:flex;gap:.75rem;flex-wrap:wrap}figure{margin:0;text-align:center;flex:1 1 150px;min-width:0}img{width:100%;max-height:410px;object-fit:contain;background:#c6e3f1;border-radius:.6rem}figcaption{margin:.4rem 0;font-size:.9rem}a{color:inherit}@media print{section{break-after:page}}</style><main>';
 for(const [i,[dir,...pages]] of sets.entries())for(const [j,keys] of pages.entries()){
   html+='<section><h2>'+tr[i]+' · '+(j+1)+'/'+pages.length+'</h2><article>';
   for(const key of keys){
     const src='../../../../assets/matematik/'+dir+'/'+key+'.webp';
     html+='<figure><a href="'+src+'"><img src="'+src+'" alt="'+key+'"></a><figcaption>'+key+'</figcaption></figure>';
   }
   html+='</article></section>';
 }
 fs.writeFileSync(path.join(qa,'Katalog.html'),html+'</main></html>');
}
(async()=>{catalog();await picnic(0);await picnic(1);await picnic(0,true);await forest();await workshop();})().catch(e=>{console.error(e);process.exitCode=1;});
