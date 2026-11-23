'use strict';
const cekimler = new Map(Object.entries(oyunculuk).map(([ad,k])=>[k.cue,{ad,...k}]));
const filmSayfalari = new Map();
async function filmiYukle(cue) {
  const take=cekimler.get(cue);
  if(!take)throw Error('Hareket bulunamadı: '+cue);
  let im=filmSayfalari.get(take.page);
  if(!im){
    im=new Image();
    im.src='medya/'+take.page+'.webp';
    filmSayfalari.set(take.page,im);
    if(filmSayfalari.size>9){
      const pinned=new Set(['idle-sag','idle-sol','idle-lokum','idle-mino','morning'].map(k=>cekimler.get(k).page));
      if(plan.id==='F2B')pinned.add(cekimler.get('E1-2').page);
      const oldest=[...filmSayfalari.keys()].find(k=>!pinned.has(k)&&k!==take.page);
      if(oldest)filmSayfalari.delete(oldest);
    }
  }
  try{
    if(!im.hazirSozu)im.hazirSozu=im.decode();
    await im.hazirSozu;
  }catch(e){filmSayfalari.delete(take.page);throw e}
}
function eskiPlanlariBirak(cues){
  const keep=new Set(cues.map(k=>cekimler.get(k)?.page));
  for(const key of filmSayfalari.keys())if(!keep.has(key))filmSayfalari.delete(key);
}
function filmPoza(cue,i,x,y,h){
  const take=cekimler.get(cue);
  const im=take&&filmSayfalari.get(take.page);
  if(!im?.complete||!im.naturalWidth)return false;
  const [sx,sy,w,sh]=take.frames[Math.min(i,take.frames.length-1)];
  const screenW=h*w/sh;
  ctx.drawImage(im,sx,sy,w,sh,x-screenW/2,y-h,screenW,h);
  return true;
}
function canli(cue,yedek,x,y,h,phase=0){
  const t=(plan.t+phase)%4.9;
  // A held neutral drawing, an inhale, one brief blink and a settling drawing.
  const i=t<2.55?0:t<3.18?1:t<3.33?2:t<4.30?3:0;
  if(!filmPoza(cue,i,x,y,h))parca(yedek,x,y,h);
}
function icMekan(){
  const {id,kod}=plan;
  if(['F2B','E2'].includes(id)&&plan.iceri)return true;
  if(plan.iceri&&['A1','A2','A3','B1','B2','B3','C1','C2'].includes(kod))return true;
  return id==='E1'&&plan.iceri;
}
function cekimFonu(cue){
  const {id,d}=plan;
  if(['E2-3','E2-4','morning'].includes(cue))return 'sabah-bahce';
  if(cue==='rain-E2')return 'bahce';
  if(cue.startsWith('wash-')||['B2-result-2','B2-result-3','F3-5','F3-6'].includes(cue))return 'lavabo';
  if(cue.startsWith('in-'))return 'antre-pluie';
  if(cue==='kale-5B2')return 'salon';
  if(id==='E2'&&cue==='E2-2')return 'pencere-ic';
  if(icMekan())return 'antre-pluie';
  if(disMekan(id))return 'bahce';
  if(id==='F5A'||id==='E3')return 'masa-alti';
  if(id==='S1')return 'golge-duvar';
  if(id==='S2')return d.hazirlik==='minder'?'salon':'masa-alti';
  return 'salon';
}
function antrePlani(){
  tabanResmi('antre-pluie');
  const {id,kod,d}=plan;
  if(id==='F2B'&&!kod){
    parca('masa',1150,800,174);parca('bread',1150,648,70);
    if(!filmPoza('E1-2',0,1325,785,495))parca('anne-havlu',1325,785,495);
    canli('idle-sol','kino-dinle',715,831,401);
    canli('idle-lokum','lokum-sol',479,825,302);
  }else{
    canli('idle-sag','kino-dinle',691,828,446);
    if(d.kaptan)parca('gunaydin',965,830,319);
    else canli('idle-lokum','lokum-sol',965,830,319,1.2);
    if(d.mino)canli('idle-mino','mino-bekle',1176,808,322,.8);
  }
}
function oyunculukPlani(){
  const {take,p}=plan.filmPoz;
  const cue=take.cue, fon=cekimFonu(cue);
  tabanResmi(fon);
  if(gece(plan.id)&&cue!=='S4-5'&&cue!=='S4-6')boya('rgba(35,44,99,.36)');
  if(fon==='bahce'){yapraklar(plan.t);if(plan.id!=='F1')yagmur(plan.t,47,false)}
  const banyo=fon==='lavabo', esik=cue.startsWith('in-');
  const playback=plan.filmPoz.audio;
  const progress=playback?(playback.duration>0?playback.currentTime/playback.duration:0):p;
  const i=Math.min(take.frames.length-1,Math.floor(aralik(progress)*take.frames.length));
  if(take.plate){
    const [sx,sy,w,h]=take.frames[i],im=filmSayfalari.get(take.page);
    if(im?.naturalWidth)ctx.drawImage(im,sx,sy,w,h,0,0,1600,900);
    return;
  }
  // Play the profile contact cycle twice, then leave the last foot planted on the mat.
  if(esik){
    const v=aralik(p),adim=Math.min(take.frames.length*2-1,Math.floor(v*take.frames.length*2));
    const k=adim%take.frames.length, [,,sw,sh,left,right]=take.frames[k];
    const half=Math.floor(adim/3), support=half%2===0?right:left;
    const foot=176+half*116, h=312+half*33;
    filmPoza(cue,k,foot-(support-.5)*h*sw/sh,604+half*44,h);return;
  }
  if(cue==='E2-2'||cue==='F2B-3'){
    tabanResmi('pencere-ic');parca('wety',236,459,65);
    filmPoza(cue,i,151,798,411);return;
  }
  if(cue==='rain-E2'){parca('kum',797,851,254);filmPoza(cue,i,790,755,338);yagmur(plan.t,95,false);return}
  if(['S1-3','S1-4','S1-5','S1-6','S1-7'].includes(cue)){
    const toy=cue==='S1-5', shape=cue==='S1-4'?'kedi':cue==='S1-6'?'kurt':'tavsan';
    const raise=[0,-10,-18,-8][Math.min(i,3)];
    leke(1095,371,300,249,'#ffedb1');
    if(toy)cizimGolgesi('kuzy',1095,545+raise,300);
    else {ctx.save();ctx.translate(1095,395+raise);ctx.scale(1.15,1.15);siluet(shape,0,0,i*.55);ctx.restore()}
    const [,,w,h]=take.frames[i],size=Math.min(toy?586:615,780*h/w);
    filmPoza(cue,i,496,toy?904:846,size);return;
  }
  if(cue==='F5B-4'){
    const [, ,w,h]=take.frames[i],height=Math.min(780,1400*h/w);
    filmPoza(cue,i,800,906,height);return;
  }
  if(cue==='F3-3'){
    // The hand enters from the right; its wrist always meets the edge of the shot.
    const [,,w,h]=take.frames[i],height=655,width=height*w/h,edge=1603-width;
    const attachment=[.102,.101,.033,.038][i], joinY=235, top=joinY-height*attachment;
    canli('idle-lokum','lokum-sol',455,850,380);
    ctx.save();
    for(const [ink,lw] of [['#141b1c',11],['#42ad95',6]]){
      ctx.beginPath();ctx.moveTo(-9,121);ctx.quadraticCurveTo(edge*.49,172,edge+3,joinY);
      ctx.strokeStyle=ink;ctx.lineWidth=lw;ctx.stroke();
    }
    ctx.restore();
    filmPoza(cue,i,edge+width/2,top+height,height);return;
  }
  if(cue==='S3-4'){
    const [, ,w,h]=take.frames[i],height=Math.min(790,1450*h/w);
    filmPoza(cue,i,800,height-4,height);return;
  }
  const prop=['tepsi-ilk-damla','anne-dort-ekmek','baba-paylas','sapka-ucus','kino-dugme','kuzu-gunes','kuzu-damla-ritim','kuzu-ipe'].includes(take.ad);
  const bodyScale={
    'S2-1':[1,.98,.87,.62], 'E3-3':[1,.95,.75,.72], 'S2-6':[1,.84,.96,1],
    'S2-7':[1,.99,.78,1], 'F5A-1':[1,.88,.76,.75], 'F4-1':[1,.99,.82,1]
  }[cue];
  const h=(banyo?515:prop?395:611)*(bodyScale?.[i]||1);
  const maxWidth=banyo?1020:1250, wh=take.frames[i];
  filmPoza(cue,i,800,banyo?815:830,Math.min(h,maxWidth*wh[3]/wh[2]));
}
async function oynaCekim(cue,s,ms,fx){
  const take=cekimler.get(cue);if(!take)return;
  await filmiYukle(cue);sag(s);
  const restore=plan.mod;
  plan.mod='oyunculuk';plan.konus=null;plan.filmPoz={take,p:0};
  let sesVerildi=false;
  try{
    const hareketMs=ms||take.frames.length*265+260;
    const planMs=Math.max(2500,hareketMs);
    await ara(planMs,s,zaman=>{
      const p=aralik(zaman*planMs/hareketMs);
      plan.filmPoz.p=p;
      if(fx&&p>=.45&&!sesVerildi){sesVerildi=true;efekt(fx,s,.31)}
    });
  }finally{if(s.aborted&&plan.filmPoz?.take===take){plan.filmPoz=null;plan.mod=restore}}
}
