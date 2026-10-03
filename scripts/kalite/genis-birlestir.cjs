// Kullanim: node genis-birlestir.cjs <genis.webp> <asil.webp> <x> <y> <w> <h> <cikti.webp> [yanKenar=24] [altKenar=0]
// paste original (sharp) into the outpainted wide image: colour-match wide to original on overlap, feather L/R/(B/T)
const sharp=require(require('path').join(process.env.NODE_PATH || process.cwd()+'/node_modules','sharp'));
const [g,a,X,Y,Wd,Hd,out,kL,kB]=process.argv.slice(2);const x=+X,y=+Y,w=+Wd,h=+Hd,fl=+(kL||24),fb=+(kB||0);
(async()=>{const mg=await sharp(g).metadata();const GW=mg.width,GH=mg.height;
let G=await sharp(g).removeAlpha().raw().toBuffer();
const A=await sharp(a).removeAlpha().resize(w,h,{fit:'fill',kernel:'lanczos3'}).raw().toBuffer();
// colour gains: mean of overlap
const sg=[0,0,0],sa=[0,0,0];let n=0;
for(let yy=0;yy<h;yy+=2)for(let xx=0;xx<w;xx+=2){const gi=((y+yy)*GW+x+xx)*3,ai=(yy*w+xx)*3;for(let c=0;c<3;c++){sg[c]+=G[gi+c];sa[c]+=A[ai+c]}n++}
const k=sa.map((v,c)=>v/sg[c]);console.log('kazanc',k.map(v=>v.toFixed(3)).join(','));
const O=Buffer.alloc(G.length);for(let i=0;i<G.length;i++){const v=G[i]*k[i%3];O[i]=v>255?255:v}
const ss=t=>t*t*(3-2*t);
for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){let m=1;
 if(fl){const d=Math.min(xx,w-1-xx);m=Math.min(m,ss(Math.min(1,d/fl)))}
 if(fb&&y+h<GH){m=Math.min(m,ss(Math.min(1,(h-1-yy)/fb)))}
 if(fb&&y>0){m=Math.min(m,ss(Math.min(1,yy/fb)))}
 const gi=((y+yy)*GW+x+xx)*3,ai=(yy*w+xx)*3;for(let c=0;c<3;c++)O[gi+c]=Math.round(A[ai+c]*m+O[gi+c]*(1-m))}
await sharp(O,{raw:{width:GW,height:GH,channels:3}}).webp({quality:86,effort:6}).toFile(out);console.log('yazildi',out,GW+'x'+GH);})();
