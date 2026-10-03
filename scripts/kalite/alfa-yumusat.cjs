// Boncuklu (kesik kesik) alfa kenarını yumuşatır: yalnız hem saydam hem opak piksele yakın kenar bandında
// alfa = egri(bulanik(alfa)). Kullanım: node alfa-yumusat.cjs <girdi.webp> <cikti.webp> [sigma=3] [egim=2.5]
// smooth beaded alpha edge: in edge zone alpha = curve(blur(alpha, s)); elsewhere unchanged
const sharp=require(require('path').join(process.env.NODE_PATH || process.cwd()+'/node_modules','sharp'));
const [f,out,sg,kz]=process.argv.slice(2);const s=Number(sg||3),K=Number(kz||2.5);
function dil(x,w,h,r){const t=new Uint8Array(x.length),o=new Uint8Array(x.length);
 for(let y=0;y<h;y++){let last=-1e9;for(let X=0;X<w;X++){if(x[y*w+X])last=X;t[y*w+X]=X-last<=r?1:0}last=1e9;for(let X=w-1;X>=0;X--){if(x[y*w+X])last=X;if(last-X<=r)t[y*w+X]=1}}
 for(let X=0;X<w;X++){let last=-1e9;for(let y=0;y<h;y++){if(t[y*w+X])last=y;o[y*w+X]=y-last<=r?1:0}last=1e9;for(let y=h-1;y>=0;y--){if(t[y*w+X])last=y;if(last-y<=r)o[y*w+X]=1}}
 return o}
(async()=>{const {data:d,info}=await sharp(f).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const w=info.width,h=info.height,n=w*h;const a=Buffer.alloc(n);for(let i=0;i<n;i++)a[i]=d[i*4+3];
const b=await sharp(a,{raw:{width:w,height:h,channels:1}}).blur(s).extractChannel(0).raw().toBuffer();
const r=Math.round(s*1.5);
const nt=dil(a.map(v=>v<10?1:0),w,h,r),no=dil(a.map(v=>v>245?1:0),w,h,r);
const o=Buffer.from(d);let m=0;
for(let i=0;i<n;i++){if(nt[i]&&no[i]){const v=Math.round((b[i]-128)*K+128);o[i*4+3]=v<0?0:v>255?255:v;m++}}
await sharp(o,{raw:{width:w,height:h,channels:4}}).webp({quality:86,alphaQuality:100,effort:6}).toFile(out);console.log(out,'kenar px',m);})();
