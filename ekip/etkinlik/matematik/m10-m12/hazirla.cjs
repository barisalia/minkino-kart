const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const qa = 'ekip/etkinlik/matematik/m10-m12';
const assets = 'assets/matematik';
const clear = {r:0,g:0,b:0,alpha:0};
const sets = [
  ['iki-kase', ['piknik-masasi'], ['kase-kino','kase-lokum','mandalina'], ['kino-kase-0','kino-kase-1'], ['lokum-kase-0','lokum-kase-1']],
  ['takim-cantasi', ['baba-atolyesi'], ['takim-kutusu','kirmizi-daire-buyuk','kirmizi-daire-kucuk','kirmizi-kare-buyuk','kirmizi-kare-kucuk'], ['mavi-daire-buyuk','mavi-daire-kucuk','mavi-kare-buyuk','mavi-kare-kucuk'], ['baba-takim-0','baba-takim-1']],
  ['sakli-findik', ['agac-dibi'], ['hasir-sepet','findik'], ['zipzip-sakla-0','zipzip-sakla-1','zipzip-sakla-2']]
];
function spec(k){
  if (k.startsWith('kase-')) return [420,260,394,218,240];
  if (k === 'mandalina') return [120,120,110,110,115];
  if (k === 'findik') return [110,110,98,98,104];
  if (k === 'hasir-sepet') return [420,300,404,276,290];
  if (k === 'takim-kutusu') return [480,360,460,320,340];
  if (/^(kirmizi|mavi)-/.test(k)) {const s=k.endsWith('buyuk')?260:150;return [300,300,s,s,null];}
  if (k.startsWith('baba-takim')) return [600,700,580,630,680];
  if (k.startsWith('kino-')) return [500,600,482,520,580];
  if (k.startsWith('lokum-')) return [500,600,482,328,580];
  return [500,600,490,510,580];
}
async function backdrop(file,k){
  const width=1672, height=941;
  let img=await sharp(file).resize(width,height,{fit:'fill'}).removeAlpha().png().toBuffer();
  const edges=k==='baba-atolyesi'?[[0,562,855,941],[0,446,839,941]]:k==='agac-dibi'?[[0,482,765,941],[0,475,825,941]]:null;
  if(edges){
    const [s,d]=edges, layers=[];
    for(let i=1;i<s.length;i++){
      const part=await sharp(img).extract({left:0,top:s[i-1],width,height:s[i]-s[i-1]}).resize(width,d[i]-d[i-1],{fit:'fill'}).png().toBuffer();
      layers.push({input:part,left:0,top:d[i-1]});
    }
    img=await sharp({create:{width,height,channels:3,background:'#ffffff'}}).composite(layers).png().toBuffer();
  }
  const {data,info}=await sharp(img).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const swatch=Array.from(data.subarray((650*width+835)*3,(650*width+835)*3+3));
  for(let i=0;i<data.length;i+=3){
    if(swatch.every((v,j)=>Math.abs(v-data[i+j])<=16)) data.set(swatch,i);
  }
  return sharp(data,{raw:info}).png({palette:true,colours:96,dither:0}).toBuffer();
}
async function alphaCrop(file, key){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(key.startsWith('mavi-kare-')){
   for(let i=0;i<data.length;i+=4){
     const spill=Math.min(data[i],data[i+2])-data[i+1];
     if(spill<=4)continue;
     data[i+3]=spill>170?0:255-spill;
     data[i]=data[i+1];
     data[i+2]=data[i+1];
   }
 }
 for(let i=3;i<data.length;i+=4){
   if(data[i]>=248)data[i]=255;
 }
 let xmin=info.width,xmax=-1,ymin=info.height,ymax=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];if(a<110)continue;
    xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);
 }
 if(xmax<xmin)throw Error('Empty sprite '+file);
 return sharp(data,{raw:info}).extract({left:xmin,top:ymin,width:xmax-xmin+1,height:ymax-ymin+1}).png().toBuffer();
}
async function sprite(file,k){
  const [w,h,mw,mh,base]=spec(k);
  let crop=await alphaCrop(file,k);
  if(k==='takim-kutusu'){
    const {width,height}=await sharp(crop).metadata();
    const source=[0,Math.round(height*0.475),Math.round(height*0.88),height];
    const target=[0,116,253,320];
    const layers=[];
    for(let i=1;i<source.length;i++){
      const input=await sharp(crop).extract({left:0,top:source[i-1],width,height:source[i]-source[i-1]}).resize(460,target[i]-target[i-1],{fit:'fill'}).png().toBuffer();
      layers.push({input,left:0,top:target[i-1]});
    }
    crop=await sharp({create:{width:460,height:320,channels:4,background:clear}}).composite(layers).png().toBuffer();
  }
  const {data,info}=await sharp(crop).resize(mw,mh,{fit:'inside'}).png().toBuffer({resolveWithObject:true});
  return sharp({create:{width:w,height:h,channels:4,background:clear}}).composite([{input:data,left:Math.floor((w-info.width)/2),top:base===null?Math.floor((h-info.height)/2):base-info.height}]).png().toBuffer();
}
async function render(srcs){
  for(const [folder,...pages] of sets) {
    const dir=path.join(assets,folder);
    fs.mkdirSync(dir,{recursive:true});
    for (const [i,keys] of pages.entries()) for(const k of keys){
      if(!srcs[k])continue;
      const output=await(i===0?backdrop(srcs[k],k):sprite(srcs[k],k));
      await sharp(output).webp({lossless:true}).toFile(path.join(dir,k+'.webp'));
    }
  }
}
if(require.main===module) render(JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''))).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={qa,assets,sets,spec};
