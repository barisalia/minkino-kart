import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';

const root=new URL('../assets/pati-yeni/',import.meta.url);
const pattern=await readFile(new URL('kopek/on-govde-kalibi.svg',root),'utf8');
const folder=new URL('giyilen/on-govde/',root);
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
try{
 const page=await browser.newPage();
 for(const item of ['atki','papatya','cilekli','yelek','ormanci','fular','pelerin','gece-pelerini','imza-0','imza-1','imza-2']){
  const source=await readFile(new URL('dolap/kopek/'+item+'.webp',root));
  const png=await page.evaluate(async({pattern,source,item})=>{
   const img=new Image();
   img.src='data:image/webp;base64,'+source;
   await img.decode();
   const svg=new DOMParser().parseFromString(pattern,'image/svg+xml');
   const shape=new Path2D(svg.querySelector('#beden').getAttribute('d'));
   const seams=new Path2D(svg.querySelector('#dikis').getAttribute('d'));
   const canvas=document.createElement('canvas');
   canvas.width=758;canvas.height=656;
   const ctx=canvas.getContext('2d');
   ctx.scale(2,2);ctx.lineCap='round';ctx.lineJoin='round';
   const art=document.createElement('canvas');art.width=img.width;art.height=img.height;
   const tex=art.getContext('2d',{willReadFrequently:true});tex.drawImage(img,0,0);
   const pixels=tex.getImageData(0,0,art.width,art.height);
   ctx.save();ctx.clip(shape);
   if(item==='atki'){
    // Keep a single opaque cloth surface and transfer only the illustrated knot.
    ctx.fillStyle='#0b9d59';ctx.fillRect(0,0,379,328);
    const scarf=document.createElement('canvas');scarf.width=art.width;scarf.height=art.height;
    const sc=scarf.getContext('2d');const cut=sc.createImageData(art.width,art.height);
    let x0=art.width,x1=0,y0=art.height,y1=0;
    for(let i=0;i<pixels.data.length;i+=4){
     const [r,g,b,a]=pixels.data.subarray(i,i+4);
     if(a<96||r<80||r<g*1.7||r<b*1.4)continue;
     cut.data.set([236,46,52,255],i);
     const x=i/4%art.width,y=Math.floor(i/4/art.width);
     x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
    }
    // Keep the ink surrounding the knot, excluding the green stock-shirt pixels.
    for(let y=Math.max(0,y0-4);y<=Math.min(art.height-1,y1+4);y++){
     for(let x=Math.max(0,x0-4);x<=Math.min(art.width-1,x1+4);x++){
      const i=4*(y*art.width+x);
      if(cut.data[i+3]||pixels.data[i+3]<80||Math.max(...pixels.data.subarray(i,i+3))>98)continue;
      let near=false;
      for(let dy=-4;dy<=4&&!near;dy++)for(let dx=-4;dx<=4;dx++){
       if(dx*dx+dy*dy>16)continue;
       const j=4*((y+dy)*art.width+x+dx);
       if(cut.data[j]===236){near=true;break;}
      }
      if(near)cut.data.set([25,22,22,255],i);
     }
    }
    sc.putImageData(cut,0,0);
    const width=158,height=width*(y1-y0+9)/(x1-x0+9);
    ctx.drawImage(scarf,x0-4,y0-4,x1-x0+9,y1-y0+9,190-width/2,151-height,width,height);
   }else{
    // Texture coordinates follow the continuous chest panel. The catalogue's
    // outer contour and sleeves do not determine where the dressed body ends.
    for(let y=0;y<198;y++){
     const sy=Math.min(art.height-1,Math.floor((.07+.84*y/198)*art.height));
     const row=sy*art.width*4;
     let l=0,r=art.width-1;
     while(l<r&&pixels.data[row+l*4+3]<180)l++;
     while(r>l&&pixels.data[row+r*4+3]<180)r--;
     const inset=Math.max(3,Math.round((r-l)*.065));
     l+=inset;r-=inset;
     if(r<=l)continue;
     const half=78+Math.min(y,132)*.44;
     ctx.drawImage(img,l,sy,r-l,1,189-half,y,2*half,1);
    }
   }
   ctx.restore();
   ctx.strokeStyle='#191717';ctx.lineWidth=4.5;ctx.stroke(shape);
   ctx.lineWidth=3.5;ctx.stroke(seams);
   return canvas.toDataURL('image/webp',.98).split(',')[1];
  },{pattern,source:source.toString('base64'),item});
  await writeFile(new URL(item+'.webp',folder),Buffer.from(png,'base64'));
 }
}finally{await browser.close();}
