// Aile dizilisi (dogru boy oranlari) + Kino B/C karsilastirmali temas sayfasi
const fs=require('fs'),sharp=require('sharp');
const V1='C:/Users/Minkex/Desktop/Minkino Games/ekip/film/seri-2/karakter/v1/';
const [OUTDIR,SHEET]=process.argv.slice(2);
const ORAN={kino:1,anne:1.37,baba:1.48,lokum:0.62};
async function trimmed(buf){const t=await sharp(buf).trim({threshold:8}).png().toBuffer();return t;}
async function kinoSeffaf(name){let s=fs.readFileSync(V1+name,'utf8');s=s.replace(/<metadata>[\s\S]*?<\/metadata>/,'');
 let i=0;s=s.replace(/fill="[^"]*"/,()=>'fill="none"');return trimmed(await sharp(Buffer.from(s)).png().toBuffer());}
async function fit(buf,h){return sharp(buf).resize({height:Math.round(h)}).png().toBuffer();}
const txt=(x,y,t,size=34,anchor='middle',w='700')=>`<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${w}" fill="#401312" text-anchor="${anchor}">${t}</text>`;
(async()=>{
 const kc=await kinoSeffaf('kino-on-c.svg');
 const fam={anne:await trimmed(fs.readFileSync(OUTDIR+'/anne-defne-on-seffaf.png')),baba:await trimmed(fs.readFileSync(OUTDIR+'/baba-murat-on-seffaf.png')),lokum:await trimmed(fs.readFileSync(OUTDIR+'/lokum-on-seffaf.png'))};
 // --- dizilis (tek basina) ---
 async function lineup(H,gap){const order=[['kino',kc],['anne',fam.anne],['baba',fam.baba],['lokum',fam.lokum]];
  const items=[];for(const [k,b] of order){const r=await fit(b,H*ORAN[k]);const m=await sharp(r).metadata();items.push({k,r,w:m.width,h:m.height});}
  const W=items.reduce((a,b)=>a+b.w,0)+gap*(items.length+1),Hh=Math.ceil(H*1.48)+40;
  let x=gap;const comp=items.map(it=>{const o={input:it.r,left:x,top:Hh-it.h};it.cx=x+it.w/2;x+=it.w+gap;return o;});
  return {W,H:Hh,comp,items};}
 const L=await lineup(620,70);
 const ad={kino:'Kino',anne:'Anne Defne',baba:'Baba Murat',lokum:'Lokum'};
 // dizilis PNG + SVG (SVG: dort ayri SVG'nin <image> ile degil, PNG gomulu degil; dogrudan vektor dizilis icin ayri dosya)
 await sharp({create:{width:L.W,height:L.H+90,channels:4,background:'#ffffff'}}).composite([...L.comp,
  {input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${L.W}" height="${L.H+90}"><line x1="30" y1="${L.H+4}" x2="${L.W-30}" y2="${L.H+4}" stroke="#DDB4A4" stroke-width="4"/>${L.items.map(it=>txt(it.cx,L.H+62,ad[it.k])).join('')}</svg>`),left:0,top:0}]).png().toFile(OUTDIR+'/aile-dizilis.png');
 // --- temas sayfasi ---
 const SW=Math.max(L.W+120,2400),top=150,row1=L.H+90;
 const kb=await trimmed(fs.readFileSync(V1+'kino-on-b.png')),kcp=await trimmed(fs.readFileSync(V1+'kino-on-c.png'));
 const RH=560,b1=await fit(kb,RH),c1=await fit(kcp,RH);const bm=await sharp(b1).metadata(),cm=await sharp(c1).metadata();
 const y2=top+row1+150;const SH=y2+RH+120;
 const xB=SW/2-60-bm.width,xC=SW/2+60;
 const over=`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}">${txt(SW/2,80,'Kino ve Ailesi · v2 (Kino B/C stilinde, doğru boy oranı)',52)}
  ${txt(SW/2,y2-60,'Karşılaştırma: Barış’ın beğendiği v1 Kino B ve Kino C',38,'middle','600')}
  ${txt(xB+bm.width/2,y2+RH+60,'Kino B (v1)',32)}${txt(xC+cm.width/2,y2+RH+60,'Kino C (v1)',32)}
  <line x1="80" y1="${y2-120}" x2="${SW-80}" y2="${y2-120}" stroke="#EADFD3" stroke-width="3"/></svg>`;
 const lineBuf=await sharp(OUTDIR+'/aile-dizilis.png').png().toBuffer();
 await sharp({create:{width:SW,height:SH,channels:4,background:'#ffffff'}}).composite([
  {input:lineBuf,left:Math.round((SW-L.W)/2),top},{input:b1,left:Math.round(xB),top:y2},{input:c1,left:Math.round(xC),top:y2},{input:Buffer.from(over),left:0,top:0}]).flatten({background:'#ffffff'}).png().toFile(SHEET);
 console.log('ok',L.W,L.H,SW,SH);
})();
