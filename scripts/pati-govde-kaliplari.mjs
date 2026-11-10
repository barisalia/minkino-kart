import {chromium} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {kaliplar} from './pati-govde-cizgileri.mjs';

const root=new URL('../assets/pati-yeni/',import.meta.url);
const keys=['atki','fular','yelek','papatya','cilekli','ormanci','pelerin','gece-pelerini','imza'];
const folderNames=['zeytin','pamuk','golge'];
const load=async file=>(await readFile(new URL(file,root))).toString('base64');
const browser=await chromium.launch({channel:'msedge'});
try{
 const page=await browser.newPage();
 for(const [species,shapes] of Object.entries(kaliplar)){
  if(process.argv[2] && process.argv[2]!==species)continue;
  for(const [index,path] of shapes.entries()){
   if(!path)continue;
   const bodyDir=index?'cesitler/'+species+'-'+(index+1):'parcalar/'+species;
   const bodies=species==='kopek'
    ?await Promise.all(['tuy','acik','cizgi'].map(k=>load('kopek/cizim/'+folderNames[index-3]+'-govde-'+k+'.png')))
    :[await load(bodyDir+'/govde.webp')];
   const dest=new URL('giyilen/'+species+'-'+index+'/',root);
   await mkdir(dest,{recursive:true});
   for(const key of keys){
    const item=key==='imza'?'imza-'+index:key;
    const art=await load('dolap/'+species+'/'+item+'.webp');
    const file=await page.evaluate(async({path,bodies,art})=>{
     async function decode(bytes){
      const im=new Image();im.src='data:image/png;base64,'+bytes;await im.decode();return im;
     }
     function canvas(w,h){
      const c=document.createElement('canvas');c.width=w;c.height=h;return c;
     }
     const layers=await Promise.all(bodies.map(decode));
     const image=await decode(art);
     const height=384,width=Math.round(height*layers[0].width/layers[0].height);
     const pattern=canvas(width,height),pen=pattern.getContext('2d');
     pen.scale(width/100,height/100);pen.fill(new Path2D(path));
     const outline=canvas(width,height),body=outline.getContext('2d');
     for(const layer of layers)body.drawImage(layer,0,0,width,height);
     // All interior colour separations are opaque cloth. Only the outside of
     // the body constrains the sewing pattern.
     const skin=body.getImageData(0,0,width,height);
     const outside=new Uint8Array(width*height),queue=new Int32Array(width*height);
     let tail=0;
     function visit(i){if(!outside[i]&&skin.data[i*4+3]<70){outside[i]=1;queue[tail++]=i;}}
     for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}
     for(let y=1;y<height-1;y++){visit(y*width);visit((y+1)*width-1);}
     for(let head=0;head<tail;head++){
      const i=queue[head],x=i%width;
      if(x)visit(i-1);if(x<width-1)visit(i+1);
      if(i>=width)visit(i-width);if(i<width*(height-1))visit(i+width);
     }
     for(let i=0;i<outside.length;i++)if(!outside[i])skin.data[4*i+3]=255;
     body.putImageData(skin,0,0);
     pen.resetTransform();pen.globalCompositeOperation='destination-in';pen.drawImage(outline,0,0);
     const mask=pen.getImageData(0,0,width,height).data;
     const left=new Int32Array(height).fill(width),right=new Int32Array(height).fill(-1);
     let top=height,bottom=-1;
     for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(mask[(width*y+x)*4+3]>32){
      left[y]=Math.min(left[y],x);right[y]=x;top=Math.min(top,y);bottom=y;
     }
     const tex=canvas(image.width,image.height),tc=tex.getContext('2d');
     tc.drawImage(image,0,0);const px=tc.getImageData(0,0,image.width,image.height).data;
     const histogram=new Map();
     for(let i=0;i<px.length;i+=16){
      if(px[i+3]<245||Math.max(px[i],px[i+1],px[i+2])<55)continue;
      const k=(px[i]>>4)*256+(px[i+1]>>4)*16+(px[i+2]>>4);
      histogram.set(k,(histogram.get(k)||0)+1);
     }
     const primary=[...histogram].sort((a,b)=>b[1]-a[1])[0][0];
     const result=canvas(width,height),ctx=result.getContext('2d');
     ctx.fillStyle='rgb('+[(primary>>8)*16+7,((primary>>4)&15)*16+7,(primary&15)*16+7].join(',')+')';
     ctx.fillRect(0,0,width,height);
     const l=Math.min(...left),r=Math.max(...right);
     // Project the front artwork across the pattern as a whole; wing and paw
     // cut-outs trim the print without pulling it into those cut-outs.
     for(let y=top;y<=bottom;y++){
      const t=(y-top)/(bottom-top);
      const sy=Math.min(image.height-1,Math.floor((.09+.78*t)*image.height));
      const row=sy*image.width*4;
      let a=0,b=image.width-1;
      while(a<b&&px[row+4*a+3]<170)a++;
      while(b>a&&px[row+4*b+3]<170)b--;
      const seam=Math.max(2,Math.round((b-a)*.085));
      if(b-a>2*seam)ctx.drawImage(image,a+seam,sy,b-a-2*seam,1,l,y,r-l+1,1);
     }
     ctx.globalCompositeOperation='destination-in';ctx.drawImage(pattern,0,0);
     // Ink the cut edge after clipping, including edges against the silhouette.
     const ink=canvas(width,height),ic=ink.getContext('2d');
     const radius=Math.max(1,Math.round(Math.min(width,height)*.006));
     for(let i=0;i<12;i++){const angle=Math.PI*i/6;ic.drawImage(pattern,Math.cos(angle)*radius,Math.sin(angle)*radius);}
     ic.globalCompositeOperation='source-in';ic.fillStyle='#191717';ic.fillRect(0,0,width,height);
     ic.globalCompositeOperation='source-over';ic.drawImage(result,0,0);
     return ink.toDataURL('image/webp',.96).split(',')[1];
    },{path,bodies,art});
    await writeFile(new URL(item+'.webp',dest),Buffer.from(file,'base64'));
   }
  }
 }
}finally{await browser.close();}
