'use strict';
const filmTuvali = document.querySelector('#film');
const ctx = filmTuvali.getContext('2d', {alpha:false});
const imgCache = new Map();
function gorsel(ad) {
  if (!resimler[ad]) throw new Error('Eksik çizim: '+ad);
  const dosya=pozSayfalari[ad]?.[0]||ad;
  if (!imgCache.has(dosya)) {
    const im = new Image();
    im.src = 'medya/'+dosya+'.webp';
    imgCache.set(dosya,im);
  }
  return imgCache.get(dosya);
}
async function goruntuleriHazirla(adlar) {
  await Promise.all([...new Set(adlar.map(gorsel))].map(async im=>{
    try{await im.decode()}catch(e){throw new Error('Çizim açılamadı: '+im.src,{cause:e})}
  }));
}
const pozDizileri = {
  lift:[1,2,3,4,5,8,9,6,7,10], carry:[1,2,4,5,3,6,7,8,9,10],
  ger:[10,3,0,2,4,7,6,8,11,12], clang:[1,2,3,4,5,6,7,8,9,10]
};
function siraAdi(ad,i){return ad+'-'+String(i+1).padStart(2,'0')}
function pozAdi(ad,i){return ad==='clang'&&i===9?'son-kapak':ad+'-'+String(pozDizileri[ad][i]).padStart(2,'0')}
function tabanResmi(ad){const im=gorsel(ad);if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,1600,900)}
function parca(ad,x,ayak,h) {
  const im=gorsel(ad);
  if(!im.complete||!im.naturalWidth)return;
  const [sw,sh]=resimler[ad],w=h*sw/sh;
  const bolge=pozSayfalari[ad];
  if(bolge)ctx.drawImage(im,bolge[1],bolge[2],sw,sh,x-w/2,ayak-h,w,h);
  else ctx.drawImage(im,x-w/2,ayak-h,w,h);
}
function leke(x,y,w,h,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill()}
function boya(c){ctx.fillStyle=c;ctx.fillRect(0,0,1600,900)}
function aralik(x){return Math.max(0,Math.min(1,x))}
function yumusak(x){x=aralik(x);return x*x*(3-2*x)}
let plan={id:'F1',d:ilkDurum(),mod:'wide',t:0,an:0,dt:0,oran:0,nokta:null,konus:null,kod:'',satir:'',acele:false};
function yeniPlan(deger){Object.assign(plan,{mod:'wide',an:plan.t,oran:0,nokta:null,konus:null,kod:'',satir:'',acele:false},deger)}
function eylemPozunuCiz(ad,p){
  const i=Math.min(9,Math.floor(aralik(p)*10));
  if(ad==='ger'){const cel=pozAdi(ad,i),h=Math.min(980,resimler[cel][1]);parca(cel,778,180+h,h);return}
  const cel=pozAdi(ad,i),[span,center]=basKaydi[cel],w=(ad==='clang'?293:277)/span;
  const h=w*resimler[cel][1]/resimler[cel][0];
  const head=ad==='lift'?690+148*yumusak((p-.63)/.37):ad==='carry'?715:790;
  parca(cel,head+(.5-center)*w,822,h);
}
function yagmur(t,n,ic){
  ctx.save();
  if(ic){ctx.beginPath();ctx.rect(101,145,190,120);ctx.clip()}
  ctx.strokeStyle=ic?'rgba(197,228,252,.87)':'rgba(211,234,255,.83)';
  ctx.lineWidth=ic?2.1:3.1;ctx.lineCap='round';ctx.beginPath();
  for(let i=0;i<n;i++){
    const y=(i*151+t*(ic?315:510))%(ic?180:1010);
    const x=(i*211-y*.31+1900)%(ic?245:1810);
    const xx=ic?x+73:x-30,yy=ic?y+112:y-45;
    ctx.moveTo(xx,yy);ctx.lineTo(xx-4,yy+13);
  }ctx.stroke();ctx.restore();
}
function yapraklar(t) {
  for(let i=0;i<6;i++){
    const x=(i*307+t*(96+i*6))%1790-90, y=100+i*70+21*Math.sin(t*1.6+i);
    ctx.save();ctx.translate(x,y);ctx.rotate(.6*Math.sin(t*2+i));ctx.beginPath();
    ctx.moveTo(-13,0);ctx.quadraticCurveTo(1,-15,17,-2);ctx.quadraticCurveTo(3,10,-13,0);
    ctx.fillStyle=i%2?'#eac24d':'#abbc4f';ctx.fill();ctx.strokeStyle='#342c29';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  }
}
function disMekan(id){return ['F1','F2A','F2B','F2C','E1','E2'].includes(id)}
function gece(id){return ['F4','F5A','F5B','E3','S1','S2','S3','S4'].includes(id)}
function asiliKuzu(x,y,h) {
  parca('kuruluk',x,y,h);
  // The fixture has two pegs on the left quarter of its clothesline.
  parca('kapikuzu',x-h*.32,y-h*.91+h*.56,h*.56);
}
function yuruyen(x0,x1,t,h,y) {
  const n=Math.floor(t*6.7), k=n%8;
  const x=x0+(adimKaydi.lead+Math.floor(n/4)*adimKaydi.stride*.5-adimKaydi.cels[k].supportOffset)*h;
  parca('adim-'+k,Math.min(x1,x),y,h);
}
function sabah(d,id,kuruyor=false){
  tabanResmi('sabah-bahce');
  const morning=plan.mod==='morning', elapsed=plan.t-plan.an;
  if(id==='E1'&&morning)ciziliHareket('sabah-sapka',hareketKaresi(elapsed/4.2),263,786,518);
  else if(id==='E1')parca('baba-merdiven',295,665,548);
  if(d.ekmek==='yarım'){
    const beat=Math.floor(plan.t*1.7)%6;
    parca(beat===2?'istanbul-serce1':beat===4?'istanbul-serce2':'serce',1235,850,100);
  }
  const kuru=!kuruyor&&(d.kuzu==='kuru'||id==='E2'||id==='S2');
  if(!kuru)asiliKuzu(1150,685,285);
  if(d.mino)parca(['kedi-sabah','kedi-el2','kedi-el3','kedi-el2'][Math.floor(plan.t*2)%4],338,788,390);
  const gulumse=(plan.t-plan.an)%7.3;
  if(gulumse<1.9)filmPoza('morning',Math.min(3,Math.floor(gulumse/.47)),d.mino?670:680,821,487)||parca('kino-dinle',680,821,487);
  else canli('idle-sag','kino-dinle',d.mino?670:680,821,487);
  if(morning){
    const ust=ciziliHareket(kuru?'sabah-kuzu':'sabah-selam',hareketKaresi((elapsed-.52)/3.95),948,829,325);
    if(d.kaptan)parca('kaptan-sapka',954,ust+11,74);
  }else parca(d.kaptan?'gunaydin':kuru?'emine':'lokum-alkis',948,829,325);
}
function bahceKaresi(ad) {
  ctx.drawImage(masaResimleri.get(ad).im,0,0,1600,900);
}
function ortakTepsiCiz(){
  const s=plan.konus?.player;
  // “Kaldır” starts at 2.64 s in Mino's recorded count.
  const t=s?.currentTime ?? (plan.oran===1?3.6:0);
  const key=t>=3.00?'birlikte-kaldir':t>=2.64?'birlikte-yari':masaAgzi('mino')?'birlikte-say':'birlikte-tut';
  bahceKaresi(key);yagmur(plan.t,30,false);
}
function kayitliAdimCiz(ad,p,baslangic,taban,h,adimSayisi){
  const sheet=masaKareleri[ad],scale=h/sheet.referenceHeight;
  const n=Math.min(adimSayisi-1,Math.floor(aralik(p)*adimSayisi)),i=n%8;
  const stride=(Math.max(...sheet.support)-Math.min(...sheet.support))*scale;
  const cyclePlants=sheet.plants[7]+Number(sheet.support[0]-sheet.support[7]>35);
  const foot=baslangic+(Math.floor(n/8)*cyclePlants+sheet.plants[i])*stride;
  ciziliHareket(ad,i,foot-sheet.support[i]*scale,taban,h);
}
function yagmurluklaAl(p){
  const hazirlik=2320/5010;
  if(p<hazirlik){
    tabanResmi('antre-pluie');
    ciziliHareket('cizme-duzelt',hareketKaresi(p/hazirlik),570,805,426);
    return;
  }
  bahceKaresi('camur-bahce');
  yagmur(plan.t,43,false);
  const poz=Math.min(5,Math.floor(6*(p-hazirlik)/(1-hazirlik)));
  const boy=[456,443,389,455,463,463][poz];
  parca(siraAdi('cizme',poz),780,805,boy);
}
function camurluKuzuylaDon(p){
  if(p<.34){
    bahceKaresi('camur-bahce');yagmur(plan.t,43,false);
    kayitliAdimCiz('camurlu-kuzu-adim',p/.34,795,824,450,16);
  }else if(p<.68){
    tabanResmi('antre-pluie');
    kayitliAdimCiz('camurlu-kuzu-adim',(p-.34)/.34,215,675,350,16);
  }else bahceKaresi('camur-teslim');
}
function kaptanlaKapiya(p){
  if(p>=.72){bahceKaresi('kaptan-evde');return}
  if(p>=.44){tabanResmi('kapidan-takim');return}
  tabanResmi('bahce');yagmur(plan.t,38,false);
  kayitliAdimCiz('tepsi-dort-adim',p/.44,765,764,406,16);
  kayitliAdimCiz('kaptan-kuzuyla-adim',p/.44,365,820,320,24);
}
function kuzuyuKurtar(p){
  if(p<.31){
    tabanResmi('bahce');yagmur(plan.t,57,false);
    parca('kum',738,792,142);
    ciziliHareket('kuzu-yagmurdan-al',hareketKaresi(p/.31),777,846,482);
  }else if(p<.50){
    tabanResmi('bahce');yagmur(plan.t,57,false);
    parca('kum',738,792,142);
    kayitliAdimCiz('kuzu-ile-kos',(p-.31)/.19,820,846,451,16);
  }else if(p<.75){
    tabanResmi('antre-pluie');
    kayitliAdimCiz('kuzu-ile-kos',(p-.50)/.25,195,621,306,16);
  }else bahceKaresi('kuzu-teslim');
}
function havluPlani(){
  const p=plan.oran;
  if(plan.mod==='havluVer') {
    bahceKaresi(p<.32?'havlu-ver':p<.68?'havlu-sar':'havlu-otur');
    return;
  }
  tabanResmi('salon');
  const kurulan=plan.mod==='kurulan';
  ciziliHareket('kino-havlu-kurulan',kurulan?hareketKaresi(p):7,650,819,482);
  ciziliHareket('kuzu-islak-kontrol',kurulan?0:hareketKaresi(p),1020,829,353);
}
function tekTepsi(p){
  const ad='tepsi-denge',sheet=masaKareleri[ad];
  const beats=[.14,.26,.36,.49,.64,.76,.88,1.01];
  const i=beats.findIndex(end=>p<end), scale=545/sheet.referenceHeight;
  const [,,w,h]=sheet.frames[i],center=858,base=827;
  if(i===7&&!masaAgzi('kino')){
    ctx.drawImage(masaResimleri.get('tepsi-sessiz').im,center-w*scale/2,base-h*scale,w*scale,h*scale);
  }else ciziliHareket(ad,i,center,base,545);
  const [left,y1,right,y2]=sheet.tray[i];
  function ekmek(j){
    const f=[.19,.4,.60,.80][j];
    const x=left+(right-left)*f,y=y1+(y2-y1)*f;
    return [center+(x-w/2)*scale,base+(y-h)*scale+(j%2?4:-8)];
  }
  for(const j of [1,3,0,2]){
    const ayril=j===0?.37:j===1?.49:2;
    let [x,y]=ekmek(j);
    if(p>=ayril){
      const contact= j===0?3:4;
      const [,,sw,sh]=sheet.frames[contact],[l,ly,r,ry]=sheet.tray[contact];
      const f=j===0?.19:.4;
      const x0=center+(l+(r-l)*f-sw/2)*scale;
      const y0=base+(ly+(ry-ly)*f-sh)*scale+(j?4:-8);
      const t=aralik((p-ayril)/.29),goal=j===0?562:662;
      x=x0+(goal-x0)*t;y=y0+(837-y0)*t*t-23*Math.sin(Math.PI*t);
    }
    parca('somun',x,y,31);
  }
}
function kaptanTemasi(p){
  if(p<.34){
    const a=aralik(p/.34);
    parca('masa',595,845,80);
    ciziliHareket('tepsi-birak',hareketKaresi(a),491,823,417);
    ciziliHareket('kaptan-bekle',0,1010,823,309);
  }else if(p<.71){
    const a=aralik((p-.34)/.37);
    parca('masa',595,845,80);
    parca('bread',595,766,61);
    ciziliHareket('kaptana-yaklas',hareketKaresi(a),465+318*yumusak(aralik(a/.65)),823,418);
    ciziliHareket('kaptan-bekle',hareketKaresi(a),1010,823,309);
  }else{
    const son=masaAgzi('lokum')?'el-sik':'abi-dinle';
    bahceKaresi(p<.80?'el-uzat':p<.90?'el-temas':son);
    yagmur(plan.t,31,false);
  }
}
function sapkaRuzgari(){
  const p=yumusak((plan.oran-.10)/.76);
  const x=1120-930*p, y=508-164*p-195*Math.sin(Math.PI*p)+36*Math.sin(2*Math.PI*p);
  const z=1.52-.43*Math.sin(Math.PI*p);
  const left=Math.max(0,Math.min(1600-1600/z,x-800/z));
  const top=Math.max(0,Math.min(900-900/z,y-430/z));
  ctx.save();ctx.scale(z,z);ctx.translate(-left,-top);
  tabanResmi('bahce');
  parca('masa',951,678,184);parca('bread',934,508,78);
  parca('emine',468,821,341);canli('idle-sag','kino-dusun',743,833,473);
  parca('kedi-mont',1327,705,365);
  yapraklar(plan.t);yagmur(plan.t,32,false);
  ctx.translate(x,y-32);ctx.rotate(-.52*Math.sin(2*Math.PI*p)-.13*p);
  filmPoza('F2A-5',p<.10?0:p<.32?1:p<.63?3:p<.83?2:0,0,32,64);
  ctx.restore();
}
function acilisPlani(){
  const kisi=plan.acilisKisi;
  if(kisi!=='anlatici'){
    bahceKaresi('acilis-'+kisi+(masaAgzi(kisi)?'':'-sus'));
    return;
  }
  const p=yumusak((plan.t-plan.an)/4.4),z=1+.14*p;
  ctx.save();ctx.translate(-640*(z-1),-470*(z-1));ctx.scale(z,z);
  bahcePlani();boya('rgba(53,44,83,'+(.10*p)+')');ctx.restore();
}
function bahcePlani(){
  const {id,t,mod,kod,satir,oran}=plan, dt=t-plan.an;
  tabanResmi('bahce');
  if(id!=='F1'||plan.acele)yagmur(t,plan.acele?49:29,false);
  if(['F1','F2A','E1'].includes(id))yapraklar(t);
  const sonKod=mod==='result'?kod:'';
  const hatOn=id==='E1'||(id==='F2A'&&['F2A-5','q'].includes(satir));
  if(hatOn){const inTree=id==='E1'||satir==='q'||plan.sapkaUctu;parca('hat',inTree?190:1120,inTree?344:508,64)}
  const action=mod==='gesture'||mod==='action';
  if(action&&(kod==='lift'||kod==='carry')){
    if(kod==='lift'){
      parca('kum',884,867,134);parca('masa',1150,626,173);parca('bread',1150,472,68);
    }else{
      parca('kum',302,705,150);parca('kuzy',301,659,142);parca('masa',872,938,135);
    }
    eylemPozunuCiz(kod,oran);
    parca('lokum-sol',kod==='lift'?372:426,803,313);
  } else if(sonKod){
    if(sonKod==='A1')ortakTepsiCiz();
    if(sonKod==='A2'){
      tekTepsi(oran);
    }
    if(sonKod==='B1')kuzuyuKurtar(oran);
    if(sonKod==='B2')yagmurluklaAl(oran);
    if(sonKod==='C1')kaptanTemasi(oran);
    if(sonKod==='C2')kaptanlaKapiya(oran);
  } else if(id==='F1'){
    parca('anne-havlu',1450,578,315);
    parca('masa',1030,656,157);parca('bread',996,510,67);parca('hat',1163,510,58);
    parca('kum',341,744,155);parca('kuzy',340,697,127);
    canli('idle-lokum','lokum-sol',1250,779,316,1.4);
    if(mod==='walk')yuruyen(28,594,dt,420,843);else canli('idle-sag','kino-dusun',658,851,467);
  } else if(id==='F2A'){
    parca('masa',951,678,184);parca('bread',934,508,78);
    if(!hatOn)parca('hat',1120,508,61);
    parca('kedi-mont',1327,705,365);
    if(satir==='F2A-1'){parca('kuzuyu-ver',693,833,463)}
    else {parca('emine',468,821,341);canli('idle-sag','kino-dusun',743,833,473)}
  } else if(id==='F2B'){
    parca('kum',357,716,178);parca('wety',355,662,164);
    parca('kino-tepsi',846,825,501);parca('bebek-agla',1194,819,357);
  } else if(id==='F2C'){
    if(satir==='F2C-1'||satir==='F2C-2')parca('sayi',811,826,543);
    else {ciziliHareket('kaptan-bekle',0,1010,823,309);parca('kino-tepsi',491,823,417)}
  } else if(id==='E1'){
    parca('masa',975,688,191);parca('halfbread',987,506,62);
    parca(satir==='E1-2'||satir==='E1-3'?'yagmur-semsiye':'kino-uzul',253,780,satir==='E1-2'||satir==='E1-3'?594:446);
  } else {
    if(satir==='E2-2'){tabanResmi('pencere-kuzu');return}
    parca('kum',575,714,196);parca('wety',580,650,175);parca('saril',1172,818,425);
  }
}
function merkezIsik(x,y,r,karanlik) {
  const grad=ctx.createRadialGradient(x,y,r*.78,x,y,r*1.16);
  grad.addColorStop(0,'rgba(255,240,168,.13)');grad.addColorStop(1,'rgba(24,32,84,'+karanlik+')');
  ctx.fillStyle=grad;ctx.fillRect(0,0,1600,900);
}
const golgeler={
  tavsan:'M-100 102 Q-145 45 -94 9 Q-86 -3 -80 -15 Q-134 -138 -102 -150 Q-76 -158 -39 -57 Q-38 -176 -9 -174 Q18 -170 8 -59 Q86 -65 98 -20 L120 -9 Q128 5 101 15 Q96 64 53 69 L42 101Z',
  kedi:'M-93 94 Q-124 47 -102 11 L-107 -88 L-41 -49 Q0 -57 39 -49 L100 -91 L93 8 Q112 52 76 81 Q35 110 -10 103Z',
  kurt:'M-114 96 Q-87 28 -73 -9 L-92 -94 L-29 -53 L-15 -106 L21 -54 Q56 -35 72 -5 L133 6 L120 33 Q63 58 32 61 L20 96Z'
};
function siluet(ad,x,y,t){
  ctx.save();ctx.translate(x,y+4*Math.sin(t*2));ctx.fillStyle='#383959';ctx.fill(new Path2D(golgeler[ad]));
  if(ad==='tavsan')leke(118+3*Math.sin(t*8),-6,11,7,'#383959');
  ctx.restore();
}
// The shadow and the object share one registration. The beam reveals the actual drawing underneath.
const golgeKaliplari=new Map();
function cizimGolgesi(ad,x,ayak,h){
  const im=gorsel(ad);
  if(!im.complete||!im.naturalWidth)return;
  if(!golgeKaliplari.has(ad)){
    const maske=document.createElement('canvas');maske.width=im.naturalWidth;maske.height=im.naturalHeight;
    const m=maske.getContext('2d');m.drawImage(im,0,0);m.globalCompositeOperation='source-in';
    m.fillStyle='#343951';m.fillRect(0,0,im.naturalWidth,im.naturalHeight);
    golgeKaliplari.set(ad,maske);
  }
  const w=h*im.naturalWidth/im.naturalHeight;
  ctx.drawImage(golgeKaliplari.get(ad),x-w/2,ayak-h,w,h);
}
function karanlikAskilik(x,ayak,h,isik){
  cizimGolgesi('askilik',x,ayak,h);
  if(isik){ctx.save();ctx.beginPath();ctx.arc(isik.x,isik.y,202,0,2*Math.PI);ctx.clip();parca('askilik',x,ayak,h);ctx.restore()}
}
function salonPlani(){
  const {id,d,t,mod,kod,satir,oran,nokta}=plan;
  const dt=t-plan.an, alt=id==='F5A'||id==='E3', duvar=id==='S1';
  tabanResmi(alt?'masa-alti':duvar?'golge-duvar':'salon');
  if(!alt&&!duvar)yagmur(t,34,true);
  const soguk=gece(id)&&!(id==='S4'&&['S4-5','S4-6'].includes(satir))&&!(id==='E3'&&satir==='E3-4');
  if(soguk)boya('rgba(31,44,103,.48)');
  if(id==='F4'&&dt<1&&mod==='wide'){const a=Math.max(0,1-Math.abs(dt-.25)*5);if(a)boya('rgba(249,236,191,'+(a*.32)+')')}
  if(id==='S1'){
    if(['S1-3','S1-4','S1-5','S1-6','S1-7'].includes(satir)){
      const o=satir==='S1-4'?'kedi':satir==='S1-6'?'kurt':'tavsan';
      ctx.fillStyle='#ffefaf';ctx.beginPath();ctx.ellipse(1001,347,283,242,0,0,Math.PI*2);ctx.fill();
      if(satir==='S1-5'){cizimGolgesi('kuzy',1009,512,255)}else siluet(o,1005,395,t);
      const kare=mod==='acting'?Math.min(5,Math.floor(oran*6)):5;
      parca(satir==='S1-6'?'baba-lamba':siraAdi('tavsan',kare),524,854,454);
      parca('lokum-alkis',790,853,315);
      if(d.mino)parca('kedi-gece',1360,801,350);
    }else{
      const pt=nokta||((mod==='gesture')?{x:490,y:565}:{x:1170,y:346});
      if(mod==='gesture')karanlikAskilik(1150,720,582,pt);else parca('askilik',1150,720,582);
      parca('fener-elde',479,852,477);parca('isaret',761,858,312);
      if(d.mino)parca('kedi-gece',229,771,276);
      merkezIsik(pt.x,pt.y,202,.77);
    }return;
  }
  if(id==='S2'){
    if(mod==='action'||mod==='gesture'){eylemPozunuCiz('ger',oran);return}
    const buyuk=d.hazirlik==='minder';
    parca(buyuk?'kale-aile-buyuk':'kale-aile-kucuk',808,812,buyuk?566:475);
    parca(d.kaleIsigi==='lamba'?'handlight':'yalniz-fener',806,buyuk?482:552,80);
    parca('kino-otur',692,785,buyuk?284:230);
    parca(d.kuzu==='kuru'||['S2-7','S2-8','S2-9','S2-10','S2-11'].includes(satir)?'lokum-kuvv':'lokum-otur',904,788,buyuk?244:203);
    parca(d.ekmek==='tam'?'iki-dilim':'ekmek-dilim',827,845,67);
    if(d.mino)canli('idle-mino','mino-bekle',1112,817,264,.7);
    return;
  }
  if(id==='S3'){
    const konser=mod==='konser', gong=mod==='action' || mod==='gesture';
    const v=konser?Math.min(5.999,oran*6):0, beat=Math.floor(v),phase=v-beat;
    const kino=konser?(beat%2===0?phase:0):gong?oran:0;
    const lokum=konser?(beat%2?phase:0):mod==='acting'?oran:0;
    ciziliHareket('orkestra-kino',hareketKaresi(kino),680,818,450);
    const ust=ciziliHareket('orkestra-lokum',hareketKaresi(lokum),1030,839,280);
    if(d.kaptan)parca('kaptan-sapka',1051,ust+9,66);
    if(d.mino)canli('idle-mino','mino-bekle',382,793,331,1.1);
    if(d.kuzu!=='kuru')asiliKuzu(1370,602,193);
    return;
  }
  if(id==='S4'){
    parca('askilik',1270,665,458);
    if(mod==='kaptan'){
      canli('idle-sag','kino-dinle',460,834,433);
      ciziliHareket('kaptan-isik',hareketKaresi(oran),845,838,348);
      merkezIsik(1270,526-166*yumusak(oran),184,.29);
      return;
    }
    if(mod==='acting'){parca(siraAdi('aktar',Math.min(9,Math.floor(oran*10))),780,835,491);return}
    parca('kino-otur',583,834,429);parca('cap-mini',897,841,345);
    if(['S4-4','S4-5','S4-6'].includes(satir))parca('baba-sigorta',1180,763,482);
    if(soguk)merkezIsik(satir==='S4-4'?1201:1250,350+8*Math.sin(t),256,.28);
    return;
  }
  if(alt){
    parca(mod==='acting'?siraAdi('kucak',Math.min(7,Math.floor(oran*8))):id==='E3'?'saril':d.kaptan?'kaptan-el':'sayi',784,858,536);
    if(!d.kaptan&&d.kuzu!=='kuru'&&id!=='E3'){tabanResmi('masa-alti');boya('rgba(34,43,95,.36)');parca('kino-otur',663,843,424);parca('bebek-kork',970,841,302)}
    if(d.mino)parca('kedi-gece',400,821,318);
    if(id==='E3'&&['E3-3','E3-4'].includes(satir))parca('baba-lamba',1227,823,497);
    return;
  }
  if(mod==='result'&&kod==='P3'){parca('kurut',784,828,485);parca('anne-havlu',1113,805,542);return}
  if(mod==='result'&&(kod==='P1'||kod==='P2')){parca(kod==='P1'?'hazir-masa':'hazir-minder',780,833,457);parca(d.kaptan?'gunaydin':d.kuzu==='kuru'?'emine':'lokum-izle',1175,829,307);return}
  const ariyor=id==='F5B'&&!['F5B-4','F5B-5','q'].includes(satir)&&d.hazirlik!=='fener';
  parca(ariyor&&satir?'cekmece-acik':'cekmece-kapali',1235,624,131);
  if(id==='F4'||id==='F5B')karanlikAskilik(1399,637,423);else parca('askilik',1399,637,423);
  const bakimOncesi=id==='F3'&&(!satir||['F3-1','F3-2'].includes(satir));
  if(d.kuzu!=='kuru'&&!bakimOncesi)asiliKuzu(411,666,256);
  if(d.hazirlik==='minder')parca('minder',361,814,124);
  if(id==='F3'){
    parca('masa',1125,767,175);parca(d.ekmek==='tam'?'bread':'halfbread',1124,605,69);
    if(d.mino)canli('idle-mino','mino-bekle',344,804,343,1.1);
    if(d.islak)parca('havlu',635,842,387);else canli('idle-sol','kino-dinle',635,842,456);
    if(d.kaptan||d.kuzu==='kuru')parca(d.kaptan?'gunaydin':'emine',891,844,321);
    else canli('idle-lokum','lokum-izle',891,844,321,.75);
  }else{
    parca('masa',1037,835,288);
    if(!d.kaptan)parca(d.kuzu==='kuru'?'lokum-kuvv':'bebek-kork',988,830,208);
    if(d.kaptan&&id==='F4')parca('kaptan-el',756,838,455);
    else parca(id==='F5B'?(ariyor?'gece-kino':'fener-elde'):'kino-dusun',648,843,465);
    if(id==='F5B'&&d.kaptan)parca('isaret',949,840,292);
    if(d.mino)parca('kedi-gece',358,808,351);
    if(d.hazirlik==='fener'&&id!=='F5B')parca('torch',1100,556,66);
    if(id==='F5B'&&['F5B-4','F5B-5','q'].includes(satir))merkezIsik(1264,375,248,.29);
  }
}
function yakinPlan(){
  const {id,d,konus,t}=plan, {who,audio,player}=konus;
  const endMorning=id==='E2'&&['E2-3','E2-4'].includes(plan.satir);
  const eveGeldi=plan.kod==='B1'||plan.kod==='C2'||['A1-result-2','A2-result-2','C1-result-2'].includes(plan.satir);
  const indoor=icMekan(),outdoor=disMekan(id)&&!endMorning&&!eveGeldi&&!indoor,alt=['E3','F5A'].includes(id);
  const banyo=['F3-5','F3-6','B2-result-2','B2-result-3'].includes(plan.satir);
  const tepsiSehpada=audio==='A1-result-2';
  if(tepsiSehpada)bahceKaresi('tasima-birak');
  else{
    const fon=endMorning?'sabah-bahce':banyo?'lavabo':indoor?'antre-pluie':outdoor?'bahce':alt?'masa-alti':id==='S1'?'golge-duvar':'salon';
    const merkez={anne:1340,mino:1230,lokum:620,baba:1110,kino:735}[who]||800;
    const z=1.75,left=Math.max(0,Math.min(1600-1600/z,merkez-800/z));
    ctx.save();ctx.scale(z,z);ctx.translate(-left,-198);tabanResmi(fon);ctx.restore();
  }
  if(!outdoor&&gece(id)&&!(id==='S4'&&plan.satir==='S4-5'))boya('rgba(32,45,101,.47)');
  if(outdoor){yapraklar(t);if(id!=='F1')yagmur(t,26,false)}
  if(!outdoor&&!alt&&!endMorning&&!indoor&&!banyo)yagmur(t,28,true);
  const punto=(sesPozlari[audio]||[]),time=player?.currentTime||0;
  let k=0;for(const pos of punto){if(pos[0]>time)break;k=pos[1]}
  const triste=who==='kino'&&['E1','E2','F4'].includes(id);
  const yakinMino=who==='mino'&&outdoor;
  parca((triste?'kino-uzgun':who)+'-ses'+k,tepsiSehpada?407:who==='lokum'||who==='mino'?889:748,yakinMino?1060:948,yakinMino?955:775);
  if(who==='lokum'&&d.kaptan)parca('kaptan-sapka',916,231,151);
}
function ayrinti(){
  const {id,satir,d,t,an}=plan,dt=t-an;
  if(satir==='E2-2'||satir==='F2B-3'){tabanResmi('pencere-kuzu');return}
  if(['F2A-3','F3-7','F3-8','S2-3','S2-4','S2-5'].includes(satir)){
    const bahce=id==='F2A',piknik=id==='S2';
    tabanResmi(bahce?'bahce':piknik?'masa-alti':'salon');
    if(piknik)boya('rgba(37,43,92,.23)');
    parca('masa',798,1000,570);
    const yemek=piknik?(d.ekmek==='tam'?'iki-dilim':'ekmek-dilim'):(d.ekmek==='tam'?'bread':'halfbread');
    parca(yemek,804,490,piknik?229:yemek==='bread'?247:165);
    if(bahce)yagmur(t,65,false);
    return;
  }
  if(satir==='F2A-5'){
    tabanResmi('bahce');const p=yumusak(dt/2.2);
    parca('hat',1075-743*p,380-206*Math.sin(p*Math.PI)-70*p,129);
    yapraklar(t);return;
  }
  if(['F3-3','F3-4','F5A-3','S3-4'].includes(satir)){
    tabanResmi('salon');if(id!=='F3')boya('rgba(40,46,100,.35)');
    asiliKuzu(816,822,596);
    const drop=(t%1.15)/1.15;leke(746,615+drop*132,3,7,'#6aaac3');return;
  }
  if(id==='S1'){
    tabanResmi('golge-duvar');boya('rgba(42,48,100,.51)');
    const ad=satir==='S1-4'?'kedi':satir==='S1-6'?'kurt':'tavsan';
    leke(854,439,378,325,'#fff0ad');
    if(satir==='S1-5'){cizimGolgesi('kuzy',854,660,397)}
    else {ctx.save();ctx.translate(855,459);ctx.scale(1.6,1.6);siluet(ad,0,0,t);ctx.restore()}
    return;
  }
  if(satir==='S4-3'){
    tabanResmi('golge-duvar');parca('askilik',922,875,788);
    merkezIsik(991,372+8*Math.sin(t),302,.78);
  }
}
function kareCiz() {
  const {id,mod,konus,satir}=plan;
  if(mod==='secimHareketi'){
    const zaman=Math.min(4199,Math.max(0,plan.oran*4200));
    const ad=plan.secimPozlari[Math.floor(zaman/1400)],kayit=masaKareleri[ad];
    tabanResmi(kayit.background);
    const i=[380,700,1040,1400].findIndex(son=>zaman%1400<son),[x,y,w,h]=kayit.frames[i];
    const [merkez,bas]=kayit.headAnchors?.[i]||[w/2,kayit.referenceHeight*.57];
    const olcek=(kayit.actor==='Lokum'?258:285)/bas;
    ctx.drawImage(masaResimleri.get(ad).im,x,y,w,h,800-merkez*olcek,820-h*olcek,w*olcek,h*olcek);
    if(kayit.background==='bahce'){
      yapraklar(plan.t);if(id!=='F1')yagmur(plan.t,32,false);
    }else if(gece(id))boya('rgba(32,45,101,.47)');
    return;
  }
  if(masaSahnesi(id) && mod!=='morning'){masaCiz();return}
  ctx.save();
  if(mod==='kuzuKurut'){
    tabanResmi('salon');
    ciziliHareket('kino-kurutucu-yay',hareketKaresi(plan.oran),680,808,425);
    ciziliHareket('lokum-kuzu-kurutma',hareketKaresi(plan.oran),1000,810,319);
  }else if(mod==='sapkaTakip'){
    tabanResmi('bahce');
    parca('hat',190,344,64);parca('masa',951,678,184);parca('bread',934,508,78);
    parca('kedi-mont',1327,705,365);
    const p=Math.min(1,plan.oran/.82),adim=Math.min(15,Math.floor(p*16)),k=adim%8;
    ctx.save();ctx.translate(743-490*p,0);ctx.scale(-1,1);
    parca('adim-'+k,0,833-53*p,473-27*p);ctx.restore();
    parca('emine',468,821,341);
    yapraklar(plan.t);yagmur(plan.t,32,false);
  }else if(mod==='acilis')acilisPlani();
  else if(mod==='sapkaRuzgari')sapkaRuzgari();
  else if(mod==='kaptanEvde'){
    const ad=masaAgzi('kino')?'tepsi-konustu':masaAgzi('lokum')?'kaptan-konustu':'kaptan-dinlen';
    bahceKaresi(ad);
  }else if(mod==='camurAnne')bahceKaresi(masaAgzi('anne')?'camur-anne-soz':'camur-anne-dinle');
  else if(mod==='camurLokum')bahceKaresi(masaAgzi('lokum')?'camur-lokum-soz':'camur-lokum-bekle');
  else if(mod==='camurDonus')camurluKuzuylaDon(plan.oran);
  else if(mod==='camurSoz'){
    bahceKaresi('camur-bahce');yagmur(plan.t,43,false);
    const agiz=masaAgzi('kino'),poz=plan.konus?(agiz===3?2:agiz):3;
    ciziliHareket('camurlu-kuzu-soz',poz,795,847,555);
  }else if(mod==='ortakEsik'){
    bahceKaresi(plan.oran<.29?'tasima-esik':plan.oran<.68?'tasima-adim':'tasima-birak');
  }else if(['havluVer','kurulan','islakKuzu'].includes(mod)){
    havluPlani();
  }else if(mod==='kaptanEsik'){
    bahceKaresi(plan.oran<.31?'eve-el-ele':plan.oran<.62?'esik-gecis':'esik-adim');
  }else if(mod==='tepsiEsik'){
    tabanResmi('antre-pluie');
    const floor=608+22*plan.oran, h=302+12*plan.oran;
    kayitliAdimCiz('tepsi-esik-iki',plan.oran,190,floor,h,16);
  }else if(mod==='kuzuSabahi'){
    tabanResmi('sabah-bahce');
    canli('idle-sag','kino-dinle',641,832,426);
    ciziliHareket('sabah-kuzu',hareketKaresi(plan.oran),944,832,328);
  }else if(mod==='oyunculuk'&&plan.filmPoz)oyunculukPlani();
  else if(mod==='insert')ayrinti();
  else if(mod==='morning'||(id==='E2'&&['E2-3','E2-4'].includes(satir)&&!konus))sabah(plan.d,id,mod!=='morning'&&satir==='E2-3');
  else if(konus&&mod==='close'&&konus.who!=='anlatici')yakinPlan();
  else if(icMekan()&&mod!=='action'&&mod!=='gesture')antrePlani();
  else if(disMekan(id))bahcePlani();else salonPlani();
  if(gece(id)&&mod!=='morning'&&!(id==='S4'&&['S4-5','S4-6'].includes(satir))&&!(id==='E3'&&satir==='E3-4'))boya('rgba(44,52,112,.105)');
  ctx.restore();
}
