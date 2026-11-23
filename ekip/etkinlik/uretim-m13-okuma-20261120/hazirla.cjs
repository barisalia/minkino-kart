const fs=require('node:fs'),path=require('node:path'),s=require('sharp');
const rawDir=path.join(__dirname,'kaynak'), reviewDir=path.join(__dirname,'prova');
fs.mkdirSync(reviewDir,{recursive:true});
const transparent={r:0,g:0,b:0,alpha:0};
function source(k){return path.join(rawDir,k+'.png')}
function dest(k){return path.join('assets',k.startsWith('cumle-')?'alfabe/cumle':k.startsWith('oyku-')?'alfabe/oyku':'matematik/tahterevalli',k+'.webp')}
async function crop(k,half){
 let src=s(source(k)).ensureAlpha();
 if(half!==undefined){const m=await src.metadata(),w=Math.floor(m.width/2);src=src.extract({left:half*w,top:0,width:w,height:m.height});}
 const {data,info}=await src.raw().toBuffer({resolveWithObject:true});let x0=info.width,y0=info.height,x1=-1,y1=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  let i=(y*info.width+x)*4;
  if(k==='kup' && Math.min(data[i],data[i+2])-data[i+1]>20)data[i+3]=0;
  if(data[i+3]>247)data[i+3]=255;
  if(data[i+3]<96)continue;
  x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
 }
 return s(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).png().toBuffer();
}
async function onCanvas(buf,w,h,aw,ah,bottom){
 const {data,info}=await s(buf).resize(aw,ah,{fit:'inside'}).png().toBuffer({resolveWithObject:true});
 return s({create:{width:w,height:h,channels:4,background:transparent}}).composite([{input:data,left:Math.round((w-info.width)/2),top:bottom-info.height}]).png().toBuffer();
}
async function remapY(buf,w,h,inEdges,outEdges){
 const m=await s(buf).metadata(),layers=[];
 for(let i=1;i<inEdges.length;i++){
  const a=Math.round(inEdges[i-1]*m.height),b=Math.round(inEdges[i]*m.height);
  const part=await s(buf).extract({left:0,top:a,width:m.width,height:b-a}).resize(w,outEdges[i]-outEdges[i-1],{fit:'fill'}).png().toBuffer();
  layers.push({input:part,left:0,top:outEdges[i-1]});
 }
 return s({create:{width:w,height:h,channels:4,background:transparent}}).composite(layers).png().toBuffer();
}
async function m13(){
 const q=path.dirname(dest('bahce'));fs.mkdirSync(q,{recursive:true});
 async function put(k,buf){await s(buf).webp({lossless:true}).toFile(dest(k));}
 await put('bahce',await remapY(await s(source('bahce')).png().toBuffer(),1920,1080,[0,.942,1],[0,930,1080]));
 const support=await remapY(await crop('mesnet'),360,300,[0,.196,1],[0,30,300]);
 await put('mesnet',await remapY(support,360,300,[0,19/300,57/300,1],[0,12,49,300]));
 const board=await crop('kol');const bm=await s(board).metadata();
 const {data:b,info}=await s(board).raw().toBuffer({resolveWithObject:true});const rows=[];for(let y=0;y<info.height;y++){let i=(y*info.width+Math.floor(info.width*.3))*4;if(b[i+3]>100)rows.push(y);}
 const beam=await remapY(board,1500,120,[0,rows[0]/bm.height,1],[3,30,90]);
 const cuts=[0,54,145,729,772,1352,1448,1500],destX=[0,60,110,720,780,1390,1440,1500],sections=[];
 for(let i=1;i<cuts.length;i++){
   const input=await s(beam).extract({left:cuts[i-1],top:0,width:cuts[i]-cuts[i-1],height:120}).resize(destX[i]-destX[i-1],120,{fit:'fill'}).png().toBuffer();
   sections.push({input,left:destX[i-1],top:0});
 }
 await put('kol',await s({create:{width:1500,height:120,channels:4,background:transparent}}).composite(sections).png().toBuffer());
 for(const [k,w,h] of [['balkabagi',380,330],['kup',150,150],['sulama-kabi',260,230]]){
  const b=await crop(k);
  if(k==='balkabagi') await put(k,await remapY(b,w,h,[0,.178,1],[0,27,h]));
  else await put(k,k==='kup'?await s(b).resize(w,h,{fit:'fill'}).png().toBuffer():await onCanvas(b,w,h,w,h,h));
 }
 for(const [i,k] of ['lokum-izle','lokum-alkis'].entries())await put(k,await onCanvas(await crop('lokum-sheet',i),420,520,400,490,510));
 if(fs.existsSync(source('bulut-oturus-sheet')))for(const [i,k] of ['bulut-otur','bulut-kikirda'].entries())await put(k,await onCanvas(await crop('bulut-oturus-sheet',i),420,460,405,430,436+i));
}
const round=Buffer.from('<svg width="800" height="560"><rect width="800" height="560" rx="22" fill="white"/></svg>');
async function cards(){
 const files=fs.readdirSync(rawDir).filter(x=>/^(oyku|cumle)-.*\.png$/.test(x));
 for(const f of files){const out=path.join(reviewDir,f.replace('.png','.webp')),p=path.join(rawDir,f);if(fs.existsSync(out)&&fs.statSync(out).mtimeMs>=fs.statSync(p).mtimeMs)continue;
 const buf=await s(p).resize(800,560,{fit:'cover',position:'centre'}).removeAlpha().png().toBuffer();
 await s(buf).ensureAlpha().composite([{input:round,blend:'dest-in'}]).webp({quality:95,alphaQuality:100}).toFile(out);}
}
async function publish(keys){for(const k of keys){const target=dest(k);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(reviewDir,k+'.webp'),target);}}
(async()=>{const [op,...args]=process.argv.slice(2);if(op==='math')await m13();if(op==='cards')await cards();if(op==='publish')await publish(args);})().catch(e=>{console.error(e);process.exitCode=1});
