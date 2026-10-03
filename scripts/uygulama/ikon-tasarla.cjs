const s=require(process.cwd()+'/node_modules/sharp');
const T=process.env.TEMP+'/claude/C--Users-Minkex-Desktop-Minkino-Games/b846a7fa-0718-460c-97d5-3b5baeb64a7d/scratchpad/';
(async()=>{
const N=1024;
let rays='';for(let i=0;i<16;i++){const a1=i*22.5*Math.PI/180,a2=(i*22.5+11.25)*Math.PI/180,cx=512,cy=430,R=1100;
 rays+=`<path d="M${cx},${cy} L${cx+R*Math.cos(a1)},${cy+R*Math.sin(a1)} L${cx+R*Math.cos(a2)},${cy+R*Math.sin(a2)} Z" fill="#ffffff" fill-opacity="0.10"/>`;}
const bg=`<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}"><defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#bfe8ff"/><stop offset="0.55" stop-color="#6cc4ff"/><stop offset="1" stop-color="#2f95ea"/></radialGradient></defs><rect width="${N}" height="${N}" fill="url(#g)"/>${rays}</svg>`;
const mino=await s('ekip/mino/mino-final.png').trim({threshold:1}).resize({height:780}).toBuffer();
const kino=await s('ekip/kino/kino-final.png').trim({threshold:1}).resize({height:750}).toBuffer();
const mm=await s(mino).metadata(),km=await s(kino).metadata();
const logo=await s('assets/uygulama/logo-minkino-asil-kenarli.png').resize({width:930}).toBuffer();const lm=await s(logo).metadata();
await s(Buffer.from(bg)).composite([
 {input:kino,left:Math.round(N*0.415),top:150},
 {input:mino,left:Math.round(N*0.025),top:110},
 {input:logo,left:Math.round((N-930)/2),top:Math.round(N*0.635)},
]).flatten({background:'#2f95ea'}).png().toFile('assets/uygulama/ikon-magaza-1024.png');
})();
