// Gemini arka plan setini film arka planına çevirir (park biçimi): uzak = opak, orta/on = beyaz zemin silinmiş şeffaf; hepsi 2752x1536'ya lanczos3 ile büyütülür, webp.
// node arkaplan-seti.cjs <ad> <sahne klasörü> [uzak=uzak-1 orta=orta-1 on=on-1]   (dosyası olmayan katman atlanır)
const sharp = require(require.resolve('sharp', { paths: ['C:/Users/Minkex/Desktop/Minkino Games'] }));
const fs = require('fs');
const OPT={T:+(process.env.T||238), SAT:+(process.env.SAT||14), BAND:4, DARK:90, DR:7, HOLEFRAC:+(process.env.HOLEFRAC||0.8), MINSPECK:+(process.env.MINSPECK||60)};
async function kes(name, yol){
 const {data,info}=await sharp(yol).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const W=info.width,H=info.height,N=W*H;
 const lum=new Uint8Array(N), cand=new Uint8Array(N);
 for(let i=0;i<N;i++){const r=data[i*3],g=data[i*3+1],b=data[i*3+2];const mn=Math.min(r,g,b),mx=Math.max(r,g,b);
  lum[i]=(r*0.3+g*0.59+b*0.11)|0; cand[i]=(mn>=OPT.T && mx-mn<=OPT.SAT)?1:0;}
 // components of cand
 const comp=new Int32Array(N).fill(-1); const comps=[]; const q=new Int32Array(N);
 for(let s=0;s<N;s++){ if(!cand[s]||comp[s]>=0)continue; const id=comps.length; let h=0,t=0; q[t++]=s; comp[s]=id;
  let area=0,border=false,bnd=0,bndDark=0,minx=W,miny=H,maxx=0,maxy=0;
  while(h<t){const p=q[h++];area++;const x=p%W,y=(p/W)|0; if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
   if(x==0||y==0||x==W-1||y==H-1)border=true;
   let isB=false;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;
    if(cand[n]){if(comp[n]<0){comp[n]=id;q[t++]=n;}} else if(!isB){isB=true;
      // step outward to look for dark outline
      let dark=false;for(let k=1;k<=OPT.DR;k++){const mx=x+dx*k,my=y+dy*k;if(mx<0||my<0||mx>=W||my>=H)break;if(lum[my*W+mx]<OPT.DARK && data[(my*W+mx)*3]<140){dark=true;break;}}
      bnd++; if(dark)bndDark++; }}
  }
  comps.push({id,area,border,bnd,bndDark,frac:bnd?bndDark/bnd:0,bbox:[minx,miny,maxx,maxy]});
 }
 // decide bg
 const isBgComp=comps.map(c=>c.border || (c.frac>=OPT.HOLEFRAC && c.area>=10));
 const holes=comps.filter(c=>!c.border && c.area>=1).sort((a,b)=>b.area-a.area);
 const bg=new Uint8Array(N); for(let i=0;i<N;i++) if(comp[i]>=0&&isBgComp[comp[i]]) bg[i]=1;
 // distance band from bg
 const dist=new Uint8Array(N).fill(255); let h=0,t=0;
 for(let i=0;i<N;i++) if(bg[i]){dist[i]=0;q[t++]=i;}
 while(h<t){const p=q[h++];const d=dist[p];if(d>=OPT.BAND)continue;const x=p%W,y=(p/W)|0;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(dist[n]>d+1){dist[n]=d+1;q[t++]=n;}}}
 const out=Buffer.alloc(N*4);
 for(let i=0;i<N;i++){let r=data[i*3],g=data[i*3+1],b=data[i*3+2],a=255;
  if(bg[i]){r=g=b=0;a=0;}
  else if(dist[i]<=OPT.BAND){ // color to alpha against white
   const al=Math.max(255-r,255-g,255-b)/255;
   if(al<=0.004){a=0;r=g=b=0;} else {a=Math.round(al*255);
    r=Math.max(0,Math.min(255,Math.round((r-255*(1-al))/al)));g=Math.max(0,Math.min(255,Math.round((g-255*(1-al))/al)));b=Math.max(0,Math.min(255,Math.round((b-255*(1-al))/al)));}
  }
  out[i*4]=r;out[i*4+1]=g;out[i*4+2]=b;out[i*4+3]=a;}
 // remove tiny specks (alpha>0 components small)
 const seen=new Uint8Array(N); let removed=0;
 for(let s=0;s<N;s++){ if(seen[s]||out[s*4+3]===0)continue; let h=0,t=0;q[t++]=s;seen[s]=1;
  while(h<t){const p=q[h++];const x=p%W,y=(p/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(!seen[n]&&out[n*4+3]>0){seen[n]=1;q[t++]=n;}}}
  if(t<OPT.MINSPECK){for(let k=0;k<t;k++){out[q[k]*4+3]=0;}removed+=t;}}
 console.log(name,'speck px removed',removed);
 return {out,W,H};
}

// tek parça eşya modu: node arkaplan-seti.cjs tek <ad=yol>...  → assets/film/esya/<ad>.webp (büyütmeden; T=200 HOLEFRAC=2 ile gölge silinir, iç beyaz korunur)
if (process.argv[2] === "tek") { (async () => { const O = "C:/Users/Minkex/Desktop/Minkino Games/assets/film/esya/"; fs.mkdirSync(O, { recursive: true });
  for (const c of process.argv.slice(3)) { const [n, yol] = c.split("="); const { out, W, H } = await kes(n, yol); const k = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true }); await sharp(k.data).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(O + n + ".webp"); console.log(n, k.info.width + "x" + k.info.height); } })(); return; }
const [ad, kl] = process.argv.slice(2); const S = `C:/Users/Minkex/Desktop/minkino-film-gemini/sahne/${kl}/`; const OUT = `C:/Users/Minkex/Desktop/Minkino Games/assets/film/${ad}/`; fs.mkdirSync(OUT, { recursive: true });
const TW = 2752, TH = 1536, W9 = { quality: 90, alphaQuality: 100, effort: 6, exact: false };
(async () => {
  const buyut = (buf, w, h, raw) => sharp(buf, raw ? { raw: { width: w, height: h, channels: 4 } } : undefined).resize(TW, TH, { kernel: 'lanczos3', fit: 'fill' });
  const yaz = [];
  if (fs.existsSync(S + 'uzak-1.png')) { await sharp(S + 'uzak-1.png').removeAlpha().resize(TW, TH, { kernel: 'lanczos3', fit: 'fill' }).webp({ quality: 90, effort: 6 }).toFile(OUT + 'arka-uzak.webp'); yaz.push('arka-uzak'); }
  for (const [n, f] of [['orta', 'orta-1'], ['on', 'on-1']]) { if (!fs.existsSync(S + f + '.png')) continue;
    const { out, W, H } = await kes(n, S + f + '.png'); await buyut(out, W, H, true).webp(W9).toFile(OUT + `arka-${n}.webp`); yaz.push('arka-' + n); }
  // önizleme: birleşik + katmanlar koyu/kırmızı zeminde
  const w = 960, h = 536, g = 16, lab = 34; const kat = fs.readdirSync(OUT).filter((f) => /^arka-.*\.webp$/.test(f));
  const rs = (b) => sharp(b).resize(w, h).png().toBuffer();
  const bg = async (f, c) => sharp({ create: { width: w, height: h, channels: 3, background: c } }).composite([{ input: await sharp(OUT + f).resize(w, h).png().toBuffer() }]).png().toBuffer();
  const hücre = [];
  if (kat.includes('arka-uzak.webp')) { const ust = ['arka-orta.webp', 'arka-on.webp'].filter((f) => kat.includes(f)).map((f) => ({ input: OUT + f })); hücre.push([await rs(await sharp(OUT + 'arka-uzak.webp').composite(ust).png().toBuffer()), `${ad}: birleşik`]); }
  for (const f of kat.filter((f) => f !== 'arka-uzak.webp')) { hücre.push([await bg(f, '#1F1A28'), f + ' / koyu']); hücre.push([await bg(f, '#E0202A'), f + ' / kırmızı']); }
  const sut = 2, sat = Math.ceil(hücre.length / sut), CW = sut * w + (sut + 1) * g, CH = sat * (h + lab) + (sat + 1) * g; const L = [];
  hücre.forEach(([b, t], i) => { const x = g + (i % sut) * (w + g), y = g + Math.floor(i / sut) * (h + lab + g);
    L.push({ input: Buffer.from(`<svg width="${w}" height="${lab}" xmlns="http://www.w3.org/2000/svg"><text x="4" y="24" font-family="Segoe UI, Arial" font-size="22" fill="#EDE6F5">${t}</text></svg>`), left: x, top: y }); L.push({ input: b, left: x, top: y + lab }); });
  await sharp({ create: { width: CW, height: CH, channels: 3, background: '#3A3444' } }).composite(L).png().toFile(`C:/Users/Minkex/Desktop/Minkino Games/ekip/film/${ad}-onizleme.png`);
  for (const f of fs.readdirSync(OUT)) { const m = await sharp(OUT + f).metadata(); console.log(ad, f, m.width + 'x' + m.height, m.hasAlpha ? 'alfa' : 'opak', (fs.statSync(OUT + f).size / 1024 | 0) + ' KB'); }
})();
