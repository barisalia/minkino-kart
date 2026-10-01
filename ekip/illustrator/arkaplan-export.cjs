const sharp=require(require.resolve('sharp',{paths:['C:/Users/Minkex/Desktop/Minkino Games']}));
const fs=require('fs');
const OUT='C:/Users/Minkex/Desktop/Minkino Games/assets/film/park/';
const U='C:/Users/Minkex/Desktop/minkino-film-gemini/sahne/park/uzak-1.png';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 await sharp(U).removeAlpha().webp({quality:90,effort:6}).toFile(OUT+'arka-uzak.webp');
 const W={quality:90,alphaQuality:100,effort:6,exact:false};
 await sharp('cut-orta-1.png').webp(W).toFile(OUT+'arka-orta.webp');
 await sharp('cut-orta-2.png').webp(W).toFile(OUT+'arka-orta-2.webp');
 await sharp('cut-on-1.png').webp(W).toFile(OUT+'arka-on.webp');
 for(const f of fs.readdirSync(OUT)){const m=await sharp(OUT+f).metadata();console.log(f,m.width+'x'+m.height,m.hasAlpha?'alfa':'opak',(fs.statSync(OUT+f).size/1024|0)+' KB');}
 // preview from the delivered webp files
 const w=960,h=536,g=16,lab=34;
 const L=async f=>sharp(await sharp(OUT+f).png().toBuffer());
 const rs=async (buf)=>sharp(buf).resize(w,h).png().toBuffer();
 const comp=async o=>rs(await sharp(OUT+'arka-uzak.webp').composite([{input:OUT+o},{input:OUT+'arka-on.webp'}]).png().toBuffer());
 const onBg=async (f,c)=>{const b=await sharp(OUT+f).resize(w,h).png().toBuffer();return sharp({create:{width:w,height:h,channels:3,background:c}}).composite([{input:b}]).png().toBuffer();};
 const cells=[
  [await comp('arka-orta.webp'),'Birlesik: uzak + orta (ANA, orta-1) + on'],[await comp('arka-orta-2.webp'),'Birlesik: uzak + orta-2 (yedek) + on'],
  [await onBg('arka-orta.webp','#1F1A28'),'arka-orta (ana) / koyu #1F1A28'],[await onBg('arka-orta.webp','#E0202A'),'arka-orta (ana) / kirmizi'],
  [await onBg('arka-orta-2.webp','#1F1A28'),'arka-orta-2 / koyu #1F1A28'],[await onBg('arka-orta-2.webp','#E0202A'),'arka-orta-2 / kirmizi'],
  [await onBg('arka-on.webp','#1F1A28'),'arka-on / koyu #1F1A28'],[await onBg('arka-on.webp','#E0202A'),'arka-on / kirmizi'],
 ];
 const CW=2*w+3*g, CH=4*(h+lab)+5*g; const layers=[];
 cells.forEach(([buf,t],i)=>{const x=g+(i%2)*(w+g), y=g+Math.floor(i/2)*(h+lab+g);
  layers.push({input:Buffer.from(`<svg width="${w}" height="${lab}" xmlns="http://www.w3.org/2000/svg"><text x="4" y="24" font-family="Segoe UI, Arial" font-size="22" fill="#EDE6F5">${t}</text></svg>`),left:x,top:y});
  layers.push({input:buf,left:x,top:y+lab});});
 await sharp({create:{width:CW,height:CH,channels:3,background:'#3A3444'}}).composite(layers).png().toFile('C:/Users/Minkex/Desktop/Minkino Games/ekip/film/park-onizleme.png');
 console.log('onizleme',CW+'x'+CH);
})();
