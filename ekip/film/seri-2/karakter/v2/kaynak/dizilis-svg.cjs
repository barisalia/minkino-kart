// Aile dizilisi SVG (vektor): her karakter ic ice <svg> olarak, dogru boy oraniyla
const fs=require('fs'),sharp=require('sharp');
const V1='C:/Users/Minkex/Desktop/Minkino Games/ekip/film/seri-2/karakter/v1/';
const OUT=process.argv[2];
const ORAN={kino:1,anne:1.37,baba:1.48,lokum:0.62},AD={kino:'Kino',anne:'Anne Defne',baba:'Baba Murat',lokum:'Lokum'};
function parts(svg){const vb=svg.match(/viewBox="([^"]*)"/)[1].split(/\s+/).map(Number);
 const inner=svg.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');return {vb,inner};}
async function tight(svg,vb){ // gorunur kutu (viewBox biriminde)
 const png=await sharp(Buffer.from(svg)).png().toBuffer();const m=await sharp(png).metadata();
 const t=await sharp(png).trim({threshold:8}).toBuffer({resolveWithObject:true});
 const kx=vb[2]/m.width,ky=vb[3]/m.height;
 return [vb[0]-t.info.trimOffsetLeft*kx,vb[1]-t.info.trimOffsetTop*ky,t.info.width*kx,t.info.height*ky];}
(async()=>{
 let kc=fs.readFileSync(V1+'kino-on-c.svg','utf8').replace(/<metadata>[\s\S]*?<\/metadata>/,'').replace(/fill="[^"]*"/,'fill="none"');
 // Kino C viewBox 2432 kare ama 1792 genislikte cizilir: icerigi 0.7368 ile sikistirip duz viewBox'a cevir
 const kp=parts(kc);kc=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 2432" width="1792" height="2432"><g transform="scale(${1792/2432},1)">${kp.inner}</g></svg>`;
 const src={kino:kc};
 for(const [k,f] of [['anne','anne-defne-on'],['baba','baba-murat-on'],['lokum','lokum-on']])
  src[k]=fs.readFileSync(`${OUT}/${f}.svg`,'utf8').replace(/<rect x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" fill="#ffffff"\/>/,'');
 const H=620,gap=70;let x=gap,items=[];
 for(const k of ['kino','anne','baba','lokum']){const p=parts(src[k]);const tb=await tight(src[k],p.vb);
  const h=H*ORAN[k],w=h*tb[2]/tb[3];items.push({k,p,tb,w,h,x});x+=w+gap;}
 const W=Math.ceil(x),base=Math.ceil(H*1.48)+40,HH=base+90;
 const body=items.map(it=>`<svg x="${it.x.toFixed(1)}" y="${(base-it.h).toFixed(1)}" width="${it.w.toFixed(1)}" height="${it.h.toFixed(1)}" viewBox="${it.tb.map(v=>v.toFixed(1)).join(' ')}" preserveAspectRatio="none" overflow="visible">${it.p.inner}</svg>`+
  `<text x="${(it.x+it.w/2).toFixed(1)}" y="${base+62}" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#401312" text-anchor="middle">${AD[it.k]}</text>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${HH}" width="${W}" height="${HH}"><rect width="${W}" height="${HH}" fill="#ffffff"/><line x1="30" y1="${base+4}" x2="${W-30}" y2="${base+4}" stroke="#DDB4A4" stroke-width="4"/>${body}</svg>`;
 fs.writeFileSync(`${OUT}/aile-dizilis.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`${OUT}/aile-dizilis-svgden.png`);console.log('ok',W,HH);
})();
