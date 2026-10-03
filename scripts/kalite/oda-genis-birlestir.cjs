// wide room: generated floor warped vertically so plank lines meet the original's; original box pasted with feathers
const sharp=require(require('path').join(process.env.NODE_PATH || process.cwd()+'/node_modules','sharp'));
const [g,a,out]=process.argv.slice(2);const X=922,Y=0,w=2260,h=2260;
const P=[[1700,1700],[1717,1725],[1788,1797],[1837,1844],[1901,1912],[1978,1994],[2073,2095],[2168,2197]];
const f=y=>{if(y<=P[0][0])return y;for(let i=1;i<P.length;i++)if(y<=P[i][0]){const [a0,b0]=P[i-1],[a1,b1]=P[i];return b0+(y-a0)*(b1-b0)/(a1-a0)}const [a0,b0]=P[P.length-1];return b0+(y-a0)*102/95};
(async()=>{const mg=await sharp(g).metadata();const GW=mg.width,GH=mg.height;
const G=await sharp(g).removeAlpha().raw().toBuffer();
const A=await sharp(a).removeAlpha().resize(w,h,{fit:'fill',kernel:'lanczos3'}).raw().toBuffer();
const sg=[0,0,0],sa=[0,0,0];for(let yy=0;yy<1700;yy+=3)for(let xx=0;xx<w;xx+=3){const gi=((Y+yy)*GW+X+xx)*3,ai=(yy*w+xx)*3;for(let c=0;c<3;c++){sg[c]+=G[gi+c];sa[c]+=A[ai+c]}}
const k=sa.map((v,c)=>v/sg[c]);console.log('kazanc',k.map(v=>v.toFixed(3)).join(','));
const O=Buffer.alloc(G.length);
for(let y=0;y<GH;y++){const yg=Math.min(GH-1,f(y));const y0=Math.floor(yg),y1=Math.min(GH-1,y0+1),t=yg-y0;
 for(let x=0;x<GW;x++)for(let c=0;c<3;c++){const v=(G[(y0*GW+x)*3+c]*(1-t)+G[(y1*GW+x)*3+c]*t)*k[c];O[(y*GW+x)*3+c]=v>255?255:v}}
console.log('alt kenar kaynak y', f(GH-1).toFixed(0));
const ss=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){let m=ss(Math.min(xx,w-1-xx)/28);
 if(Y+h<GH)m=Math.min(m,ss((h-1-yy)/22));
 const gi=((Y+yy)*GW+X+xx)*3,ai=(yy*w+xx)*3;for(let c=0;c<3;c++)O[gi+c]=Math.round(A[ai+c]*m+O[gi+c]*(1-m))}
await sharp(O,{raw:{width:GW,height:GH,channels:3}}).webp({quality:86,effort:6}).toFile(out);console.log('ok')})();
