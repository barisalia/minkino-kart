const fs=require('fs'),path=require('path'),sharp=require('sharp')
const dir=__dirname,assets=path.resolve(dir,'../../../assets/kitap/doktor'),scale=2048/840
// Retain the original inked fingers in front of the food. The supplied rectangles
// bound individual paws only. One-pixel expansions recover their dark outline.
async function foreground(base,rect){
 const [x,y,w,h]=rect.map(v=>Math.round(v*scale)),{data,info}=await sharp(base).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 const mask=Buffer.alloc(w*h)
 for(let i=0;i<mask.length;i++){const r=data[i*4],g=data[i*4+1],b=data[i*4+2];mask[i]=(r>196&&g>175&&b>152&&r-g<46&&g-b<45)?255:0}
 const k=5,expanded=await sharp(mask,{raw:{width:w,height:h,channels:1}}).greyscale().dilate(k).raw().toBuffer()
 for(let i=0;i<mask.length;i++){const dark=data[4*i]<105&&data[4*i+1]<94&&data[4*i+2]<90;data[4*i+3]=mask[i]||dark&&expanded[i]?255:0}
 return {input:await sharp(data,{raw:info}).png().toBuffer(),left:x,top:y}
}
;(async()=>{for(const [plate,prop,out,hands] of [
 ['kahvalti-zemin','kahvalti','s02-yemek',[[143,263,50,41]]],
 ['bahce-zemin','pisi','s09-yemek',[[103,274,34,38],[145,274,31,38],[231,264,28,37],[271,265,21,34],[474,202,42,40]]],
 ['corba-zemin','corba','s12-yemek',[]]]){
 const base=path.join(dir,'kaynak',plate+'.webp'),layers=[{input:path.join(dir,prop+'.svg'),left:0,top:0}]
 for(const hand of hands)layers.push(await foreground(base,hand))
 await sharp(base).composite(layers).webp({quality:97}).toFile(path.join(assets,out+'.webp'))
}})().catch(e=>{console.error(e);process.exitCode=1})
