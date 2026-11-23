/* Exposure times in seconds. Each named cel comes from a separate full-size drawing. */
const cels=(name,count)=>Array.from({length:count},(_,i)=>'oyna-'+name+'-'+(i+1));
const beat=(at,to,label,x,y,dx,dy)=>({at,to,label,x,y,dx,dy});
const direction={
  B1:{length:5.6,assets:['oyna-ayakkabi','oyna-kalk','yalniz-cik',...cels('veda',2)],beats:[beat(1.0,2.6,'Cırt cırtı kapat',.475,.755,1,0)]},
  B1_5:{length:7.6,assets:[...cels('ray',4),...cels('veda',2),...cels('cikis',3)],beats:[beat(.95,2.45,'Treni it',.53,.73,1,0)]},
  B2A:{length:4.0,assets:['oyna-say']},
  B2B:{length:4.6,assets:['oyna-kaleci','oyna-say']},
  B2B_KUS:{length:3.5,assets:['oyna-uzgun']},
  B2C:{length:4.1,assets:['oyna-lokum']},
  B3A:{length:4.9,assets:['oyna-say','oyna-sobe']},
  B3B:{length:4.1,assets:['oyna-bak']},
  B3C:{length:4.4,assets:cels('sula',3)},
  ERKEN1:{length:8.3,assets:[...cels('kurabiye',5),'oyna-ara-kurabiye'],beats:[beat(1.3,3.25,'Kurabiyeyi yükle',.73,.68,-1,0)]},
  ERKEN2:{length:7.9,assets:cels('pencere',4),beats:[beat(1.05,3.8,'Pencereye bak',.62,.72,0,-1)]},
  ERKEN3:{length:9.2,assets:[...cels('salincak',5),'oyna-ara-salincak'],beats:[beat(1.45,3.7,'Örtüyü çek',.41,.63,0,-1)]},
  ERKEN4:{length:9.0,assets:['oyna-atla','oyna-golcuk-1','oyna-sicra','kino-kosu','tilki'],beats:[beat(1.8,2.63,'Çamura zıpla',.24,.73,0,-1)]},
  ERKEN5:{length:10.2,assets:[...cels('masal',5),'oyna-ara-masal'],beats:[beat(1.3,3.25,'Sayfayı çevir',.52,.57,-1,0)]},
  SON1:{length:8.6,assets:['oyna-sobe'],beats:[beat(1.4,3.0,'Sobe yap',.74,.47,1,0)]},
  SON2:{length:13.1,assets:[...cels('dal',4),'oyna-ara-dal','oyna-kaleci','oyna-sut','oyna-kale-1','kino-kosu'],
    beats:[beat(1.2,2.9,'Topu dalla çek',.69,.82,-1,0),beat(5.8,6.65,'Şut çek',.48,.71,1,0)]},
  SON3:{length:9.5,assets:cels('davet',4),beats:[beat(1.35,3.1,'Arkadaşlarını çağır',.24,.45,0,-1)]}
};

function exposure(t,times){
  let i=0;
  while(i<times.length&&t>=times[i])i++;
  return i+1;
}
function drawnShot(name,t,times,between23){
  const inbetween=between23!==undefined&&t>=between23&&t<times[1];
  bg(inbetween?'oyna-ara-'+name:'oyna-'+name+'-'+exposure(t,times));
}
function actor(name,pose,x,ground,height,ctx=ink){cel('oyna-'+name+'-'+pose,x,ground,height,ctx)}
const ease=u=>{u=clamp(u);return u*u*(3-2*u)};
function travel(t,start,end,a,b){return a+(b-a)*ease((t-start)/(end-start))}
function tuckIn(t){
  if(t<4.7){drawnShot('masal',t,[1.6,1.94,2.28,2.78],1.77);return}
  bg(t<5.6?'ERKEN5':t<5.88?'ara-ortu':'son-ortu');
}

function performScene(id,t){
  // Decision screens have their own original composition.
  switch(id){
    case 'B1':{
      bg('antre');
      if(t<3.1){
        const pose=exposure(t,[1.27,1.72,2.35]);
        actor('ayakkabi',pose,625,758,[405,405,405,410][pose-1]);
      }else if(t<3.85){const first=t<3.48;actor('kalk',first?1:2,627,travel(t,3.1,3.85,758,739),first?393:414)}
      else cel('kino-dinle',632,739,434);
      const arrive=['lokum-yaklas','lokum-tren-adim','lokum-tren-temas','lokum-tren'];
      if(t<2.5)return true;
      const step=clamp((t-2.5)/2.25);
      cel(step===1?'lokum-tren':arrive[Math.floor(step*10)%3],travel(t,2.5,4.75,1750,1072),738,301);
      return true}
    case 'B1_5':
      if(t<2.95)drawnShot('ray',t,[1.1,1.54,2.13]);
      else if(t<5.75){
        bg('ray');cel('kino-otur',545,653,337);
        cel('tren-kirmizi',travel(t,2.95,5.1,720,1320),between(t,2.95,5.1,723,702),104);
        bg('ray-on');cel(t<5?'lokum-alkis':'lokum-ray',1390,748,245);
      }else bg('ray-hatirla');
      return true;
    case 'B2A':
      bg('park-duz');cel('mino-bekle',770,678,344);
      actor('say',t<2?1:3,1225,710,377);
      if(t<2.1)run(t,between(t,0,2.1,-145,420),727,373);
      else cel(t<2.65?'kino-dinle':'kino-soyle',425,725,394);
      return true;
    case 'B2B':{
      bg('mac-sahasi');handInHand();
      if(t<1.8)cel(t<.76?'mac-hazir':'mac-vurus',966,715,371);
      else actor('say',1,966,715,371);
      const caught=t>=1.44;
      actor('kaleci',t<1.02?1:caught?(t<2.55?3:4):2,travel(t,1.08,1.45,1345,1290),643,309);
      if(!caught){const u=clamp((t-.77)/.67);rollingBall('top',1104+168*u,697-107*u-45*Math.sin(Math.PI*u),73,u*3.1)}
      return true}
    case 'B2B_KUS':
      bg('kapi');
      if(t<2.2)actor('uzgun',1+Math.floor(t*4.3)%3,between(t,0,2.2,374,680),727,425);
      else cel('kino-uzul',683,727,427);
      return true;
    case 'B2C':
      bg('mutfak');cel('kino-otur',585,738,341);
      if(t<.9)cel('lokum-tren',966,748,277);
      else{const p=exposure(t,[1.42,2.0]);actor('lokum',p,966,748,[264,238,225][p-1])}
      return true;
    case 'B3A':
      bg('sakla');cel('mino-saklan',1370,594,278);bg('sakla-on');
      if(t<1.5)actor('say',t<.85?1:2,990,638,314);
      else if(t>3.65)actor('say',3,990,638,314);
      else cel('zipzip-say',990,638,314);
      actor('sobe',1,512,744,312);
      parkSister('lokum-izle',274,744,222);return true;
    case 'B3B':
      bg(t<1.85?'camur':'camur-top');cel('tilki-golcuk',760,592,274);
      const reaction=exposure(t,[.68,2.27]);
      actor('bak',reaction,1195,719,reaction===2?330:377);
      if(t<1.85){const u=ease(t/1.85);rollingBall('top',1150-520*u,645+41*u-65*Math.abs(Math.sin(u*Math.PI*2))*(1-u),83,-u*11)}
      parkSister('lokum-sol',1490,715,240);return true;
    case 'B3C':
      drawnShot('sula',t,[.95,2.94]);gardenKids();return true;
    case 'ERKEN1':
      if(t<4.5){drawnShot('kurabiye',t,[1.5,1.98,2.45,3.15],1.74);return true}
      bg('son-tren');cel('obj-vagon',travel(t,4.5,6.2,856,735)+26*Math.sin(Math.max(0,t-6.2)*1.4),788,174);return true;
    case 'ERKEN2':
      if(t<.88)bg('pencereye');
      else if(t<4.8)drawnShot('pencere',t,[1.55,2.18,3.25]);
      else{bg('son-pencere');windowPass(t-4.8)}return true;
    case 'ERKEN3':
      if(t<4.95){drawnShot('salincak',t,[1.68,2.12,2.8,3.6],1.9);return true}
      bg('salincak-iskelet');swing(t-4.95+2.15);return true;
    case 'ERKEN4':{
      if(t>=4.18){
        if(t<5.65)bg('camurSicra');else if(t<7.12)bg('kucak');else{bg('son-kopuk');bathBubbles(t-7.12)}
        return true
      }
      bg('oyna-golcuk-1');cel('tilki-golcuk',1100,570,281);
      if(t<1.25)run(t,between(t,0,1.25,30,378),713,346);
      else{
        const p=exposure(t,[2.01,2.21,2.59,2.86]),u=clamp((t-2)/.88);
        actor('atla',p,375+447*u,713-141*Math.sin(u*Math.PI),[285,332,300,351,285][p-1]);
      }
      const ball=clamp((t-2.87)/.83);
      rollingBall('top',880+445*ball,696-162*Math.sin(Math.PI*ball)-74*ball,75,ball*7);
      if(t>=2.85&&t<3.36)actor('sicra',t<3.04?1:2,825,725,t<3.04?51:76);
      return true}
    case 'ERKEN5':
      if(t<7.15){tuckIn(t);return true}return false;
    case 'SON1':
      if(t>=5.4)return false;
      bg('sobe-yolu');cel('mino-saklan',232,666,265);
      if(t<1.55)actor('sobe',1,318,688,305);
      else if(t<1.78)actor('sobe',2,between(t,1.55,1.78,318,420),690,320);
      else if(t<2.83)run(t,between(t,1.78,2.83,420,966),690,352);
      else if(t<3.09)actor('sobe',3,travel(t,2.83,3.09,966,1022),691,347);
      else if(t<4.04)actor('sobe',4,1050,690,346);
      else actor('sobe',5,1010,688-49*Math.sin(Math.PI*clamp((t-4.04)/.58)),338);
      parkSister(t<1.55||t>=3.3?'lokum-izle':Math.floor(t*7)%2?'lokum-kos':'lokum-adim',travel(t,1.55,3.3,175,751),706,220);
      return true;
    case 'SON2':{
      if(t<4.15){drawnShot('dal',t,[1.48,1.99,2.65],1.73);parkSister('lokum-sol',1470,602,205);return true}
      if(t>=8.95){if(t<10.4){bg('SON2');parkSister('lokum-sol',1255,753,256);return true}return false}
      bg('oyna-kale-1');
      const u=clamp((t-6.51)/.94);
      const p=exposure(t,[5.97,6.24,6.51,6.91,7.35]);
      if(t<5.4)run(t,between(t,4.15,5.4,200,598),727,362);
      else if(p===4)cel('kino-sut',627,725,362);
      else actor('sut',p>4?p-1:p,620,725,p===6?398:357);
      if(t<6.7)actor('kaleci',1,1270,653,282);
      else if(t<7.65)actor('kaleci',2,travel(t,6.7,7.25,1270,1175),653-24*Math.sin(Math.PI*clamp((t-6.7)/.75)),217);
      else cel('mino-kale',1175,653,280);
      rollingBall('top',762+620*u,721-108*Math.sin(Math.PI*u)-104*u,78,u*11);
      parkSister('lokum-izle',120,759,210);return true}
    case 'SON3':
      if(t<.9){bg('bahce');gardenKids();return true}
      if(t<5.25){drawnShot('davet',t,[1.63,2.23,3.01]);return true}
      return false;
  }
  return false;
}

const departures={
  '1A':['oyna-veda-1','yalniz-cik','oyna-veda-2'],
  '1.5A':['oyna-veda-1','yalniz-cik','oyna-veda-2'],
  '1.5B':['oyna-cikis-1','birlikte-cik','oyna-cikis-2','oyna-cikis-3']
};
