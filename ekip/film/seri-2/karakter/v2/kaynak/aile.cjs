// Kino C (v1) vektorunden aile: renk degisimi + vektor bindirme + ayri kafa katmani + bant olcekleme (tamamen SVG)
const fs=require('fs'),sharp=require('sharp');
const SRC='C:/Users/Minkex/Desktop/Minkino Games/ekip/film/seri-2/karakter/v1/kino-on-c.svg';
const OUT=process.argv[2]||'.';
const src=fs.readFileSync(SRC,'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/,'');
const body=src.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const W=1792,OL='#401312',WH='rgb(252,251,249)',WS='rgb(221,180,164)',SX=(W/2432).toFixed(6);
const set=(ids,c)=>Object.fromEntries(ids.map(i=>[i,c]));
const DS=[...body.matchAll(/<path[^>]*d="([^"]*)"/g)].map(m=>m[1]);
const HEADD=[2,30,31,35,36,37].map(k=>DS[k]);
const EL=[836,651],ER=[1314,663]; // goz merkezleri (kaynak SVG birimi)
const sc=(c,s)=>`<g transform="translate(${c[0]},${c[1]}) scale(${s}) translate(${-c[0]},${-c[1]})">`;
function recolor(map,eye){let i=0;
 return body.replace(/<path([^>]*)fill="([^"]*)"([^>]*)>/g,(m,a,f,b)=>{const k=i++;let out=m;
  if(k===0||map[k]===null)out=`<path${a}fill="none"${b}>`;else if(k in map)out=`<path${a}fill="${map[k]}"${b}>`;
  if(k===7)out=sc(ER,eye)+out; if(k===10)out+='</g>'; if(k===12)out=sc(EL,eye)+out; if(k===17)out+='</g>';
  return out;});}
function build(id,map,ov,bands,o={}){
 const hs=o.head||1,ey=o.eye||1,PV=o.pivot||[800,1150];
 const hov=(o.hov||'')+sc([616,651],ey)+(o.eyeL||'')+'</g>'+sc([968,663],ey)+(o.eyeR||'')+'</g>';
 const hshape=c=>`<g transform="scale(${SX},1)">${HEADD.map(d=>`<path d="${d}" fill="${c}" stroke="${c}" stroke-width="34" stroke-linejoin="round"/>`).join('')}</g>`;
 const base=`<g transform="scale(${SX},1)">${recolor(map,ey)}</g>`;
 let T=0;const info=bands.map(([y0,y1,sy])=>{const h=(y1-y0)*sy,r={y0,y1,sy,T,h};T+=h;return r;});
 const OW=W,OH=Math.ceil(T);
 const M=`maskUnits="userSpaceOnUse" x="-500" y="-500" width="3000" height="3500"`;
 const defs=`<clipPath id="${id}-top"><rect x="-500" y="-500" width="3000" height="${500+1182}"/></clipPath>`+
  `<mask id="${id}-inv" ${M}><rect x="-500" y="-500" width="3000" height="3500" fill="#fff"/><g clip-path="url(#${id}-top)">${hshape('#000')}</g></mask>`+
  `<mask id="${id}-hm" ${M}>${hshape('#fff')}</mask>`+
  `<g id="${id}-fig"><g mask="url(#${id}-inv)">${base}${ov}</g>${sc(PV,hs)}<g mask="url(#${id}-hm)">${base}</g>${hov}</g></g>`;
 let clips='',uses='';
 info.forEach((b,i)=>{const pad=i<info.length-1?4:0;
  clips+=`<clipPath id="${id}-c${i}"><rect x="-200" y="${b.T.toFixed(2)}" width="${OW+400}" height="${(b.h+pad).toFixed(2)}"/></clipPath>`;
  uses+=`<g clip-path="url(#${id}-c${i})"><use xlink:href="#${id}-fig" transform="translate(0,${(b.T-b.sy*b.y0).toFixed(2)}) scale(1,${b.sy})"/></g>`;});
 return {OW,OH,inner:`<defs>${defs}${clips}</defs>${uses}`};}
async function save(name,{OW,OH,inner}){
 const head=(vb)=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">`;
 const png=await sharp(Buffer.from(`${head([-100,0,OW+200,OH])}${inner}</svg>`)).png().toBuffer();
 const t=await sharp(png).trim({threshold:5}).toBuffer({resolveWithObject:true});
 const x=-100-t.info.trimOffsetLeft,y=-t.info.trimOffsetTop,w=t.info.width,h=t.info.height,P=Math.round(h*0.04);
 const vb=[x-P,y-P,w+2*P,h+2*P];
 const svg=`${head(vb)}<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#ffffff"/>${inner}</svg>`;
 fs.writeFileSync(`${OUT}/${name}.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`);
 await sharp(Buffer.from(`${head(vb)}${inner}</svg>`)).png().toFile(`${OUT}/${name}-seffaf.png`);
 console.log(name,vb.join(' '));}
const NAVY=[60,61,63,68,69,80],GREEN=[24],DGREEN=[25,26,78,79],SHOE=[47,51,64,66],SHOESH=[48,52,65,84,85,86],LACE=[72,73,74,75,76,77],PATCH=[5,6];
const lash=(x,y,dx,dy)=>`<path d="M${x} ${y} q ${dx*0.5} ${dy*0.2} ${dx} ${dy}" stroke="${OL}" stroke-width="11" stroke-linecap="round" fill="none"/>`;
const lid=(cx,cy,rx,ry,id)=>{const y0=cy-ry*0.55,yc=cy-ry*0.95;return `<clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx+16}" ry="${ry+16}"/></clipPath><path d="M${cx-rx-30} ${y0} Q ${cx} ${yc} ${cx+rx+30} ${y0} L ${cx+rx+30} ${cy-ry-30} L ${cx-rx-30} ${cy-ry-30} Z" fill="${WH}" clip-path="url(#${id})"/><path d="M${cx-rx-8} ${y0+4} Q ${cx} ${yc} ${cx+rx+8} ${y0+4}" stroke="${OL}" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="${cx-rx*0.3}" cy="${cy-ry*0.12}" r="20" fill="${WH}"/><circle cx="${cx+rx*0.25}" cy="${cy+ry*0.35}" r="11" fill="${WH}"/>`};
const KAFA=+(process.env.KAFA||0.7),GOZ=+(process.env.GOZ||0.82);
(async()=>{
 // ANNE (Defne)
 {const M='rgb(227,169,59)',MS='rgb(190,128,38)';
  const map={...set(GREEN,M),...set(DGREEN,MS),...set(NAVY,WH),...set(PATCH,null),...set(SHOE,'rgb(96,60,42)'),...set(SHOESH,'rgb(64,38,27)'),...set(LACE,'rgb(96,60,42)')};
  const ov=[`<path d="M672 1206 L1002 1206 L1002 1432 L672 1432 Z" fill="${M}"/>`,
   `<path d="M600 1225 C640 1150 720 1095 800 1085 L980 1085 C1060 1095 1120 1150 1165 1225 Z" fill="${M}"/><path d="M600 1225 C640 1150 720 1095 800 1085 M980 1085 C1060 1095 1120 1150 1165 1225" stroke="${OL}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M745 1060 L1015 1060 L1015 1100 L745 1100 Z" fill="${WH}"/><path d="M745 1095 L880 1425 L1015 1095" stroke="${OL}" stroke-width="12" fill="${WH}" stroke-linejoin="round"/>`,
   `<path d="M880 1425 L880 1702" stroke="${OL}" stroke-width="10"/>`,
   ...[1475,1560,1645].map(y=>`<circle cx="907" cy="${y}" r="24" fill="rgb(150,90,50)" stroke="${OL}" stroke-width="9"/>`)].join('');
  await save('anne-defne-on',build('a',map,ov,[[150,1185,1],[1185,1862,1.22],[1862,1950,5.0],[1950,2330,0.8]],
   {head:KAFA,eye:GOZ,eyeL:lash(540,600,-40,-18)+lash(552,572,-34,-34)+lash(575,552,-20,-42),eyeR:lash(1058,600,40,-18)+lash(1046,572,34,-34)+lash(1023,552,20,-42)}));}
 // BABA (Murat)
 {const B='rgb(158,47,63)',BS='rgb(112,28,42)',E='rgb(118,68,42)',ES='rgb(74,40,26)';
  const map={...set(GREEN,B),...set(DGREEN,BS),...set(NAVY,B),...set(PATCH,null),30:E,35:E,56:E,31:ES,36:ES,57:ES,
   ...set(SHOE,'rgb(150,100,62)'),...set(SHOESH,'rgb(110,70,42)'),...set(LACE,'rgb(150,100,62)')};
  const hov=`<path d="M705 302 L720 291 L760 277 L800 269 L840 263 L880 260 L920 260 L960 264 L1000 272 L1040 282 L1070 292 Q 1050 360 960 372 Q 890 382 820 372 Q 730 360 705 302 Z" fill="${E}"/><path d="M705 302 Q 730 360 820 372 Q 890 382 960 372 Q 1050 360 1072 290" stroke="${OL}" stroke-width="12" fill="none" stroke-linecap="round"/>`+
   `<clipPath id="b-m"><path d="M640 922 Q 719 1050 798 922 Z"/></clipPath><path d="M640 922 Q 719 1050 798 922 Z" fill="rgb(90,30,30)"/><ellipse cx="719" cy="1000" rx="48" ry="26" fill="rgb(240,138,138)" clip-path="url(#b-m)"/><path d="M640 922 Q 719 1050 798 922 Z" fill="none" stroke="#401312" stroke-width="10" stroke-linejoin="round"/>`+`<path d="M719 880 C690 870 640 880 625 915 C650 935 700 930 719 905 C738 930 788 935 813 915 C798 880 748 870 719 880 Z" fill="${E}" stroke="${OL}" stroke-width="10" stroke-linejoin="round"/>`;
  const ov=[`<path d="M690 1215 L1010 1215 L1000 1430 L700 1430 Z" fill="${B}"/><ellipse cx="885" cy="1200" rx="130" ry="80" fill="${B}"/>`,
   `<path d="M600 1420 C560 1560 600 1700 700 1745 Q880 1800 1060 1745 C1170 1700 1200 1560 1150 1420 Z" fill="${B}"/><path d="M1150 1420 C1200 1560 1170 1700 1060 1745 Q1000 1765 950 1772 C1080 1700 1120 1560 1090 1420 Z" fill="${BS}"/><path d="M600 1420 C560 1560 600 1700 700 1745 Q880 1800 1060 1745 C1170 1700 1200 1560 1150 1420" stroke="${OL}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M700 1745 Q880 1700 1060 1745" stroke="${OL}" stroke-width="9" fill="none"/>`].join('');
  await save('baba-murat-on',build('b',map,ov,[[150,1185,1],[1185,1862,1.32],[1862,1950,4.6],[1950,2330,1]],
   {head:KAFA,eye:GOZ,hov,eyeL:lid(616,652,88,120,'b-l'),eyeR:lid(975,660,90,124,'b-r')}));}
 // LOKUM
 {const P='rgb(244,175,192)',PS='rgb(214,128,152)';
  const map={...set(GREEN,P),...set(DGREEN,PS),...set(NAVY,P),...set(PATCH,null),35:WH,36:WS,...set(SHOE,WH),...set(SHOESH,WS),...set(LACE,WH)};
  const paw=(cx)=>{const cy=2150,rx=215,ry=165;return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${WH}" stroke="${OL}" stroke-width="14"/><path d="M${cx+rx*0.45} ${cy-ry*0.85} C${cx+rx*0.95} ${cy-ry*0.5} ${cx+rx} ${cy+ry*0.4} ${cx+rx*0.55} ${cy+ry*0.8} C${cx+rx*0.8} ${cy+ry*0.2} ${cx+rx*0.8} ${cy-ry*0.4} ${cx+rx*0.45} ${cy-ry*0.85} Z" fill="${WS}"/>`+
   [-80,0,80].map(d=>`<path d="M${cx+d} ${cy+ry-8} L${cx+d} ${cy+ry*0.45}" stroke="${OL}" stroke-width="11" stroke-linecap="round"/>`).join('')};
  const ov=[`<path d="M672 1206 L1002 1206 L1002 1432 L672 1432 Z" fill="${P}"/>`,
   ...[1460,1570].map(y=>`<circle cx="880" cy="${y}" r="26" fill="${WH}" stroke="${OL}" stroke-width="9"/>`),
   paw(560),paw(1128)].join('');
  await save('lokum-on',build('l',map,ov,[[150,1185,1],[1185,1862,0.66],[1862,1950,0.3],[1950,2330,0.7]],{head:1.0,eye:1.06}));}
})();
