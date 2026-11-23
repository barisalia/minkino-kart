// Ayrı üretilen karakterin kendi mürekkepli ağzını, özgün çözünürlükte ayır.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, 'medya');
const seeds={kneel:[182,143],carry:[172,109],pass:[174,109]};
async function split(name, seed) {
  const {data,info:{width:w,height:h}} = await sharp(path.join(dir,name+'.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const seen = new Uint8Array(w*h), queue = [Math.floor(seed[1]*h/300)*w+Math.floor(seed[0]*w/300)];
  let left=w,top=h,right=0,bottom=0;
  for(let i=0;i<queue.length;i++){
    const n=queue[i];if(n<0||n>=w*h||seen[n])continue;seen[n]=1;
    const offset=n*4;
    if(data[offset+3]<128 || data[offset+1]>196)continue;
    seen[n]=2;const x=n%w,y=Math.floor(n/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    queue.push(n-1,n+1,n-w,n+w);
  }
  const mw=right-left+1,mh=bottom-top+1;
  if(mw<w*.035||mw>w*.34||mh<h*.004||mh>h*.20)throw Error(name+' mouth bounds invalid '+[left,top,mw,mh]);
  const mask=Buffer.alloc(mw*mh*4);
  for(let y=top;y<=bottom;y++){
    for(let x=left;x<=right;x++){
      const n=y*w+x;
      if(seen[n]!==2)continue;
      const dst=((y-top)*mw+x-left)*4;
      data.copy(mask,dst,n*4,n*4+4);
    }
  }
  // Replace only mouth ink and its antialias fringe with neighbouring white muzzle color.
  for(let y=top-3;y<=bottom+3;y++)for(let x=left-3;x<=right+3;x++){
    let inside=false;
    for(let dy=-3;dy<=3&&!inside;dy++)for(let dx=-3;dx<=3;dx++)if(seen[(y+dy)*w+x+dx]===2){inside=true;break}
    if(!inside)continue;
    const t=(x-left+4)/(mw+8);
    for(let c=0;c<3;c++)data[(y*w+x)*4+c]=Math.round((1-t)*data[(y*w+left-5)*4+c]+t*data[(y*w+right+5)*4+c]);
  }
  await sharp(data,{raw:{width:w,height:h,channels:4}}).webp({lossless:true}).toFile(path.join(dir,name+'-govde.webp'));
  await sharp(mask,{raw:{width:mw,height:mh,channels:4}}).png().toFile(path.join(dir,name+'-agiz.png'));
  return [left/w,top/h,mw/w,mh/h];
}
(async()=>{const rig={};for(const [name,seed] of Object.entries(seeds)){rig[name]=await split(name,seed);console.log(name,rig[name].map(v=>v.toFixed(3)).join(' '))}fs.writeFileSync(path.join(__dirname,'yuz.json'),JSON.stringify(rig))})().catch(e=>{console.error(e);process.exitCode=1});


