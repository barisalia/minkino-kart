import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const root='assets/pati-yeni';
const species={kedi:'tarcin',tavsan:'pofuduk',hamster:'fistik',balik:'piril',kus:'limon',kaplumbaga:'tospik',geko:'zumrut',civciv:'cucuk',ordek:'vakvak',kirpi:'diken'};
function silhouette(data,w,h){
 const n=w*h, outside=new Uint8Array(n), queue=new Int32Array(n);
 let read=0,write=0;
 function visit(p){
   if(outside[p])return;
   const i=p*4,r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b);
   if(data[i+3]>128 && (hi<100 || hi-Math.min(r,g,b)>75))return;
   outside[p]=1;queue[write++]=p;
 }
 for(let x=0;x<w;x++){visit(x);visit(n-w+x);}
 for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}
 while(read<write){const p=queue[read++];if(p%w)visit(p-1);if(p%w<w-1)visit(p+1);if(p>=w)visit(p-w);if(p<n-w)visit(p+w);}
 let largest=[];
 for(let p=0;p<n;p++){
   if(outside[p]||data[p*4+3]<32)continue;
   read=0;write=1;queue[0]=p;outside[p]=1;
   while(read<write){
     const q=queue[read++];
     for(const z of [q%w?q-1:-1,q%w<w-1?q+1:-1,q-w,q+w]){
       if(z<0||z>=n||outside[z]||data[z*4+3]<32)continue;
       outside[z]=1;queue[write++]=z;
     }
   }
   if(write>largest.length)largest=queue.slice(0,write);
 }
 const keep=new Uint8Array(n);for(const p of largest)keep[p]=1;
 for(let p=0;p<n;p++)if(!keep[p])data[p*4+3]=0;
}
for(const [id,source] of Object.entries(species)){
 const dir=root+'/parcalar/'+id;
 await mkdir(dir,{recursive:true});
 const file=root+'/hayvanlar/'+source+'/'+(id==='balik'?'butun.png':'atlas.png');
 const {width,height}=await sharp(file).metadata();
 if(id==='balik'){
   for(const [index,pose] of ['normal','uyku','sevin'].entries()){
     const left=Math.round(width*index/3);
     const bounds={left,top:0,width:Math.round(width*(index+1)/3)-left,height};
     const sprite=await sharp(file).extract(bounds).png().toBuffer();
     await sharp(sprite).trim({background:'#00000000'}).resize({width:640,withoutEnlargement:true}).webp({quality:96}).toFile(dir+'/tam-'+pose+'.webp');
   }
   continue;
 }
 for(const [index,name] of ['normal','uyku','sevin','govde'].entries()){
   const splitX=Math.floor(width/2);
   const splitY=id==='tavsan'?640:Math.floor(height/2);
   const left=index%2?splitX:0,top=index>1?splitY:0;
   const bounds={left,top,width:left?width-left:splitX,height:top?height-top:splitY};
   const {data,info}=await sharp(file).extract(bounds).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   silhouette(data,info.width,info.height);
   const sprite=await sharp(data,{raw:info}).png().toBuffer();
   await sharp(sprite).trim({background:'#00000000',threshold:8}).resize({width:420,height:420,fit:'inside',withoutEnlargement:true}).webp({quality:95}).toFile(dir+'/'+name+'.webp');
 }
}
