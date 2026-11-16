/* All coordinates describe the original 1600 × 900 camera. Poses are registered at the feet. */
const settings = {
  B1: ["antre","ic-yakin",2.3,"kapi"], B1_5:["ray","ic-yakin",5.2,"tahta"],
  B2A:["park-duz","park-yakin",2.4,"cocuklar"], B2B:["mac-sahasi","park-yakin",1.6,"sut"],
  B2B_KUS:["kapi","ic-yakin",1.6,"kapi"], B2C:["mutfak","ic-yakin",2.2,"tahta"],
  B3A:["sakla","park-yakin",2.4,"cocuklar"], B3B:["camur","park-yakin",2.25,"sut"],
  B3C:["bahce","bahce-yakin",2.1,"cocuklar"],
  ERKEN1:["son-tren","ic-yakin",3.0,"tahta"], ERKEN2:["son-pencere","ic-yakin",3.9,"kapi"],
  ERKEN3:["salincak-iskelet","park-yakin",7.1,"cocuklar"], ERKEN4:["son-kopuk","banyo-yakin",5.1,"camur"],
  ERKEN5:["ERKEN5","bahce-yakin",4.4,"sayfa"], SON1:["SON1","park-yakin",3.8,"sobe"],
  SON2:["karpuz","park-yakin",7.2,"cocuklar"], SON3:["son-bahcetop","bahce-yakin",4.5,"kapi"]
};
const extraSets = {
  B1:["konusma-kino-uzgun"],B1_5:["ray-on","ray-it","ray-hatirla","birlikte-cik","yalniz-cik"],
  B2B:["konusma-kino-uzgun"],B2B_KUS:["konusma-kino-uzgun"],
  B3A:["sakla-on","konusma-mino-fisilti"],B3B:["camur-top"],
  ERKEN1:["mutfak"], ERKEN2:["pencereye","konusma-kino-uzgun"], ERKEN3:["salincak-yakin"],
  ERKEN4:["camur","camurSicra","kucak"], ERKEN5:["masal","ara-ortu","son-ortu"], SON1:["sobe-yolu","ara-sobe","son-sobe"],
  SON2:["golDal","park-duz","SON2","ara-dilim","son-dilim"], SON3:["bahce","kapi-davet"]
};
const sheetsFor = {
  B1:["kino-ev","lokum-ev","lokum-yuruyus"],B1_5:["kino-ev","lokum-ev","oyuncaklar"],
  B2A:["kino-ev","kino-kosu","arkadaslar","tilki"],B2B:["kino-ev","arkadaslar","tilki","sut-hareket","oyuncaklar","lokum-park"],
  B2B_KUS:["kino-park"],B2C:["kino-ev","lokum-ev"],B3A:["kino-park","arkadaslar","tilki","lokum-park"],
  B3B:["kino-ev","tilki","oyuncaklar","lokum-park"],B3C:["kino-ev","lokum-ev","arkadaslar"],
  ERKEN1:["kino-ev","lokum-ev","son-oyuncaklar"],ERKEN2:["oyuncaklar"],ERKEN3:["salincak-hareket"],ERKEN4:["kino-park","oyuncaklar","son-oyuncaklar"],
  ERKEN5:[],SON1:["kino-kosu","kino-park","tilki","lokum-park","arkadaslar"],
  SON2:["kino-park","tilki","arkadaslar","oyuncaklar","lokum-park"],SON3:["kino-ev","lokum-ev","arkadaslar","son-oyuncaklar"]
};
const pictures = new Map();
function loadPicture(key) {
  if (!pictures.has(key)) {
    const image = new Image();
    image.src = 'bir-gun/medya/' + key + '.webp' + (key === 'konusma-kino-uzgun' ? '?v=agiz2' : key.startsWith('oyna-') ? '?v=6' : '');
    const ready = image.decode().catch(error => { pictures.delete(key); throw error; });
    pictures.set(key,{image,ready});
  }
  return pictures.get(key).ready;
}
function stageAssets(id,withLokum) {
  const speakers = hikaye[id].lines.filter(l => withLokum || !l.onlyLokum).map(l => 'konusma-'+l.who);
  if(hikaye[id].choices) speakers.push('konusma-kino');
  return new Set([...settings[id].slice(0,2),...(extraSets[id]||[]),...sheetsFor[id],...speakers,...direction[id].assets]);
}
const mainCanvas=document.getElementById('film'), sisterCanvas=document.getElementById('lokum');
const ink=mainCanvas.getContext('2d',{alpha:false}), sisterInk=sisterCanvas.getContext('2d');
function setCanvasSize() {
  const box=mainCanvas.getBoundingClientRect();
  const width=Math.max(1,Math.min(1920,Math.round(box.width*devicePixelRatio)));
  for(const canvas of [mainCanvas,sisterCanvas]){canvas.width=width;canvas.height=Math.round(width*9/16)}
}
function setScale(ctx) {ctx.setTransform(ctx.canvas.width/1600,0,0,ctx.canvas.height/900,0,0);ctx.imageSmoothingQuality='high'}
function bg(key) {const art=pictures.get(key)?.image;if(art?.naturalWidth)ink.drawImage(art,0,0,1600,900)}
function cel(key,x,feet,h,ctx=ink) {
  const frame=cizimler[key];if(!frame)return;
  const [atlas,sx,sy,sw,sh]=frame, art=pictures.get(atlas)?.image;
  if(!art?.naturalWidth)return;
  const w=h*sw/sh;ctx.drawImage(art,sx,sy,sw,sh,x-w/2,feet-h,w,h);
}
const clamp = x=>Math.max(0,Math.min(1,x));
function between(t,start,end,a,b) {return a+(b-a)*clamp((t-start)/(end-start))}
const runKeys=['kino-kos1','kino-pas','kino-kos2','kino-contact'];
function run(t,x,feet,h){cel(runKeys[Math.floor(Math.max(0,t)*7.5)%4],x,feet,h)}
function parkSister(key,x,feet,h){if(state.withLokum)cel(key,x,feet,h,sisterInk)}
function handInHand(){
  const height=420, x=445, ground=725;
  cel('kino-dusun',x,ground,height);
  // Registered to the centres of the two drawn palms on the untrimmed pose.
  const contactX=x-(.5-.075)*height*cizimler['kino-dusun'][3]/cizimler['kino-dusun'][4];
  const babyH=height*(1-.648)/(1-.384);
  const babyX=contactX-(.935-.5)*babyH*cizimler['lokum-el'][3]/cizimler['lokum-el'][4];
  parkSister('lokum-el',babyX,ground,babyH);
}
function gardenKids(){cel('bulut-davet',1120,706,370);cel('kino-otur',665,751,345);cel('lokum-otur',381,745,230)}
function kitchenKids(){cel('kino-otur',585,738,341);cel('lokum-tren',966,748,277)}
function swing(t){
  const seconds=t-2.15,angle=Math.sin(seconds*2.3)*(.043+.032*Math.exp(-seconds/5));
  const length=374,dx=length*Math.sin(angle),lift=length*(1-Math.cos(angle));
  const [atlas,sx,sy,sw,sh]=cizimler['salincak-aski'];
  for(const x of [240,1018]){
    ink.save();ink.translate(x,190);ink.rotate(-angle);
    ink.drawImage(pictures.get(atlas).image,sx,sy,sw,sh,-5,0,10,length);ink.restore();
  }
  cel('uyku-oturak',629+dx,722-lift,396);
}
function rollingBall(key,x,feet,diameter,angle){
  ink.save();ink.translate(x,feet-diameter/2);ink.rotate(angle);
  cel(key,0,diameter/2,diameter);ink.restore();
}
function windowPass(t){
  const pass=(1-Math.cos(t*2.4))/2;
  ink.save();ink.beginPath();
  // The ball passes behind the wooden mullion between the two panes.
  ink.rect(739,361,254,230);ink.rect(1031,349,200,232);ink.clip();
  rollingBall('top',1159-231*pass,550-31*Math.sin(Math.PI*pass),62,-pass*5.8);
  ink.restore();
}
function bathBubbles(t){
  for(const [x,floor,size,offset] of [[125,588,62,0],[248,481,45,.63],[800,547,76,.28],[854,506,42,.85]]){
    const u=(t/4.6+offset)%1;
    ink.save();ink.globalAlpha=Math.min(1,u*9,(1-u)*8);
    cel('obj-baloncuk',x+14*Math.sin(u*6),floor-315*u,size);ink.restore();
  }
}
function actingPose(t,labels,durations){
  let at=t%durations.reduce((sum,n)=>sum+n,0);
  for(let i=0;i<durations.length;i++){if(at<durations[i])return labels[i];at-=durations[i]}
  return labels[0];
}
function drawWide(id,t,decision=false) {
  if(!decision&&performScene(id,t))return;
  bg(settings[id][0]);
  switch(id){
    case 'B1':{
      cel('kino-dinle',632,732,434);
      const arrive=['lokum-yaklas','lokum-tren-adim','lokum-tren-temas','lokum-tren'];
      const step=Math.min(3,Math.floor(t/.22));
      cel(arrive[step],1135-21*step,738,301);break;}
    case 'B1_5':{
      if(t<1.45){bg('ray-it');break}
      if(t>=3.8&&t<6){bg('ray-hatirla');break}
      t-=1.45;
      cel('kino-otur',545,653,337);
      const clap=t<1.65&&Math.floor(t*4)%2===0;
      const q=clamp(t/2.15);
      cel('tren-kirmizi',between(q,0,1,430,1090),756-81*q+21*Math.sin(Math.PI*q),104);
      bg('ray-on');
      cel(t>2?'lokum-ray':clap?'lokum-alkis':'lokum-otur',1370,748,253);break;}
    case 'B2A':
      cel('mino-bekle',770,678,344);cel('zipzip-yuvarlak',1225,710,377);
      if(t<1.1)run(t,between(t,0,1.1,15,417),727,373);else cel('kino-soyle',425,725,394);break;
    case 'B2B':
      cel('mino-kale',1350,622,297);
      if(t<3){
        cel(t<.35?'mac-hazir':'mac-vurus',966,715,371);
        const u=clamp((t-.35)/.9);
        cel('top',between(u,0,1,1101,1350),700-85*Math.sin(Math.PI*u)-70*u,81);
      }else cel('zipzip-bekle',960,717,371);
      handInHand();break;
    case 'B2B_KUS': cel('kino-uzul',685,726,428);break;
    case 'B2C': kitchenKids();break;
    case 'B3A':
      cel('mino-saklan',1370,594,278);bg('sakla-on');cel('zipzip-say',990,638,314);
      cel('kino-saklan',515,744,327);parkSister('lokum-izle',274,744,222);break;
    case 'B3B':
      if(t>=1.15)bg('camur-top');
      cel('tilki-golcuk',760,592,274);cel('kino-dusun',1180,719,377);
      if(t<1.15)cel('top',between(t,0,1.15,865,630),between(t,0,1.15,625,686),83);
      parkSister('lokum-sol',1490,715,240);break;
    case 'B3C': gardenKids();break;
    case 'ERKEN1':
      if(t<1.05){bg('mutfak');kitchenKids()}
      else cel('obj-vagon',796+56*Math.cos((t-1.05)*1.5),788,174);break;
    case 'ERKEN2': if(t<1.85)bg('pencereye');else windowPass(t-1.85);break;
    case 'ERKEN3': if(t<2.15)bg('salincak-yakin');else swing(t);break;
    case 'ERKEN4':
      if(t<.58){bg('camur');cel('kino-sut',595,695,375);cel('top',between(t,0,.58,747,974),654-90*clamp(t/.58),88)}
      else if(t<2.0)bg('camurSicra');
      else if(t<3.6)bg('kucak');else bathBubbles(t-3.6);break;
    case 'ERKEN5':
      if(t<2.4)bg('masal');
      else if(t>=3.25)bg(actingPose(t-3.25,['ara-ortu','son-ortu','ara-ortu','ERKEN5'],[.3,3.8,.32,2.1]));break;
    case 'SON1':
      if(t<2.15){
        bg('sobe-yolu');cel('mino-saklan',260,658,249);
        if(t<1.45)run(t,between(t,0,1.45,319,908),679,343);
        else cel('kino-sobe',951,672,333);
        parkSister(t<1.45?(Math.floor(t*6)%2?'lokum-kos':'lokum-adim'):'lokum-izle',between(t,0,1.45,175,740),698,217);
      }else{
        bg(actingPose(t-2.15,['SON1','ara-sobe','son-sobe','ara-sobe','SON1'],[.85,.16,.32,.18,.86]));
        parkSister('lokum-sol',1240,760,242);
      }break;
    case 'SON2':
      if(t<1.85){bg('golDal');parkSister('lokum-sol',1460,711,217)}
      else if(t<3.9){bg('park-duz');cel('mino-kale',1330,624,293);cel('kino-sut',694,704,365);
        const u=clamp((t-2.08)/1.05);cel('top',between(u,0,1,832,1402),688-115*Math.sin(u*Math.PI)-80*u,78);parkSister('lokum-izle',260,710,221);
      }else if(t<5.5){bg('SON2');parkSister('lokum-sol',1255,753,256)}
      else{
        bg(actingPose(t-5.5,['karpuz','ara-dilim','son-dilim','ara-dilim'],[1.1,.21,2.5,.22]));
        parkSister('lokum-karpuz',1190,777,238);
      }break;
    case 'SON3':
      if(t<1.15){bg('bahce');gardenKids()}else if(t<2.95)bg('kapi-davet');
      else{
        const roll=(1-Math.cos((t-2.95)*1.32))/2;
        rollingBall('obj-plajtopu',289+220*roll,872,140,roll*3.14);
      }break;
  }
}
function paint(shot) {
  if(!shot)return;
  setScale(ink);setScale(sisterInk);sisterInk.clearRect(0,0,1600,900);
  if(shot.insert){bg(shot.insert)}
  else if(shot.speaker){
    bg(settings[shot.id][1]);
    cel(shot.speaker+'-ses'+shot.mouth,800,908,792);
  }else drawWide(shot.id,shot.time,shot.decision);
}
