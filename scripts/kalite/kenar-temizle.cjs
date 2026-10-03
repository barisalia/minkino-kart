// Saydam katman kenarında açık renkli saçak (eski beyaz zemin kırıntısı) temizliği: saydamlığa r px yakın, koyu konturdan
// belirgin açık pikseller kontur rengini alır. Kullanım: node kenar-temizle.cjs <girdi.webp> <cikti.webp|-> [r=6] [esik=18]
// edge fringe removal: pixels within r px of transparency that are much lighter than the dark outline nearby take the outline colour
const sharp=require(require('path').join(process.env.NODE_PATH || process.cwd()+'/node_modules','sharp'));
const [f,out,rr,esik]=process.argv.slice(2);const E=Number(esik||40);
function dil(x,w,h,r){const t=new Uint8Array(x.length),o=new Uint8Array(x.length);
 for(let y=0;y<h;y++){let last=-1e9;for(let X=0;X<w;X++){if(x[y*w+X])last=X;t[y*w+X]=X-last<=r?1:0}last=1e9;for(let X=w-1;X>=0;X--){if(x[y*w+X])last=X;if(last-X<=r)t[y*w+X]=1}}
 for(let X=0;X<w;X++){let last=-1e9;for(let y=0;y<h;y++){if(t[y*w+X])last=y;o[y*w+X]=y-last<=r?1:0}last=1e9;for(let y=h-1;y>=0;y--){if(t[y*w+X])last=y;if(last-y<=r)o[y*w+X]=1}}
 return o}
(async()=>{const {data:d,info}=await sharp(f).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const w=info.width,h=info.height,n=w*h;const r=Number(rr||6);
const L=i=>0.3*d[i*4]+0.59*d[i*4+1]+0.11*d[i*4+2];
const tr=new Uint8Array(n);for(let i=0;i<n;i++)tr[i]=d[i*4+3]<10?1:0;
const band=dil(tr,w,h,r);const o=Buffer.from(d);let c=0;const R2=r*2;
for(let y=R2;y<h-R2;y++)for(let x=R2;x<w-R2;x++){const i=y*w+x;if(!band[i]||tr[i])continue;
 let mi=-1,ml=1e9;for(let dy=-R2;dy<=R2;dy+=1)for(let dx=-R2;dx<=R2;dx+=1){const j=(y+dy)*w+x+dx;if(d[j*4+3]<230)continue;const l=L(j);if(l<ml){ml=l;mi=j}}
 if(mi<0||ml>90)continue;if(L(i)>ml+E){o[i*4]=d[mi*4];o[i*4+1]=d[mi*4+1];o[i*4+2]=d[mi*4+2];c++}}
if(out!=='-')await sharp(o,{raw:{width:w,height:h,channels:4}}).webp({quality:86,alphaQuality:100,effort:6}).toFile(out);
console.log(f.split('/').slice(-2).join('/'),'duzeltilen',c,'band',band.reduce((s,v)=>s+v,0));})();
