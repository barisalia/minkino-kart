'use strict';
const el=id=>document.getElementById(id);
const gomulu=window!==window.parent&&new URLSearchParams(location.search).has('uygulama');
const durum={adimlar:[],sonlar:{},yollar:{},cifte:false,sessiz:false,bitti:false};
try{
  const kayit=JSON.parse(localStorage.getItem(yolKaydi)||'null');
  if(kayit){
    for(const [ad,yol] of Object.entries(kayit.sonlar||{})){
      if(!sahneler[ad]?.choices&&sahneler[ad]&&Array.isArray(yol)&&yolOku(yol,true).id===ad)durum.sonlar[ad]=yol;
    }
    for(const [ad,yol] of Object.entries(kayit.yollar||{})){
      if(Array.isArray(yol)&&yolOku(yol,true).id===ad)durum.yollar[ad]=yol;
    }
    const konum=yolOku(kayit.adimlar||[],Object.keys(durum.sonlar).length>0);
    durum.adimlar=kayit.adimlar||[];durum.bitti=!!kayit.bitti&&!!durum.sonlar[konum.id];
    durum.sessiz=!!kayit.sessiz;durum.cifte=!!kayit.cifte;
  }
}catch{/* A new route can still be played with storage disabled. */}
const acik=()=>Object.keys(durum.sonlar).length>0;
const konum=()=>yolOku(durum.adimlar,acik());
function kaydet(){try{localStorage.setItem(yolKaydi,JSON.stringify(durum))}catch{}}
let asama='kapak',durdu=false,islem=new AbortController(),once=performance.now(),animasyon=0;
const sesButonu=document.createElement('button');sesButonu.textContent='Sesle devam et ▶';
const kesildi=new DOMException('Sahne değişti','AbortError');
function sag(s){if(s.aborted)throw kesildi}
function sayfa(ad){
  asama=ad;el('oyun').dataset.asama=ad;el('oyun').dataset.dugum=konum().id;
  el('oyun').classList.toggle('secim',ad==='karar');
  el('kapak').hidden=ad!=='kapak';el('karar').hidden=ad!=='karar';el('dokun').hidden=ad!=='dokun';
  el('son').hidden=ad!=='son';el('dur').hidden=['kapak','son','yukleniyor'].includes(ad);
  el('ileri').hidden=!['film','yanit'].includes(ad);el('haritaAc').hidden=ad!=='son';
  el('ileri').textContent=sahneler[konum().id].choices?'Karara geç':'Sabaha geç';
  el('bekle').hidden=ad!=='yukleniyor';if(ad==='yukleniyor')el('bekle').textContent='Sahne hazırlanıyor…';
  if(ad==='kapak'){el('basla').textContent=durum.bitti?'Yeniden oyna ▶':durum.adimlar.length?'Devam et ▶':'Başla ▶';el('sifir').hidden=!durum.adimlar.length||durum.bitti}
  if(ad==='son'||ad==='kapak')el('rozet').hidden=true;
}
function yurut(fn){
  islem.abort();islem=new AbortController();const s=islem.signal;
  Promise.resolve().then(()=>fn(s)).catch(e=>{
    if(s.aborted||e===kesildi)return;
    console.error(e);muzik.pause();ortam?.pause();sayfa('kapak');el('bekle').hidden=false;
    el('bekle').textContent='Sahne yüklenemedi. Tekrar başlatabilirsin.';
  });
}
const sesler=new Set();
const muzik=new Audio();muzik.preload='none';muzik.src='ses/muzik.mp3';muzik.loop=true;let ortam=null,ortamAd='',konusan=null;
function cal(a){if(!durdu)a.play().catch(()=>{})}
function karisim(){
  const diyalog=konusan && !konusan.paused;
  muzik.muted=durum.sessiz;muzik.volume=diyalog ? .065 : .14;
  if(ortam){ortam.muted=durum.sessiz;const camArdinda=ortamAd!=='birds'&&(icMekan()||!disMekan(plan.id));ortam.volume=(diyalog ? .09 : .17)*(camArdinda ? .55 : 1)}
  for(const a of sesler)a.muted=durum.sessiz;
  el('ses').textContent=durum.sessiz?'Ses kapalı':'Ses açık';
  el('ses').setAttribute('aria-label',durum.sessiz?'Sesi aç':'Sesi kapat');
}
function atmosfer(ad){
  if(ortamAd!==ad){ortam?.pause();ortam=ad?new Audio('ses/fx-'+ad+'.mp3'):null;ortamAd=ad;if(ortam)ortam.loop=true}
  karisim();if(ortam)cal(ortam);cal(muzik);
}
function efekt(ad,s,volume=.32){
  const a=new Audio('ses/fx-'+ad+'.mp3');a.volume=volume;a.muted=durum.sessiz;sesler.add(a);
  const bit=()=>{a.pause();sesler.delete(a);s.removeEventListener('abort',bit)};
  a.addEventListener('ended',bit,{once:true});a.addEventListener('error',bit,{once:true});s.addEventListener('abort',bit,{once:true});cal(a);
}
function ara(ms,s,herKare){
  sag(s);return new Promise((resolve,reject)=>{
    let n=0,prev=performance.now(),rid;
    function iptal(){cancelAnimationFrame(rid);reject(kesildi)}
    function ilerle(now){
      if(!durdu)n+=Math.min(100,now-prev);prev=now;
      const p=aralik(n/ms);herKare?.(p);
      if(p===1){s.removeEventListener('abort',iptal);resolve()}else rid=requestAnimationFrame(ilerle);
    }
    s.addEventListener('abort',iptal,{once:true});rid=requestAnimationFrame(ilerle);
  });
}
async function sesOynat(ad,s,who,text,yakin=false,sonPozuTut=false){
  sag(s);if(text)el('okuma').textContent=text;
  const a=new Audio('ses/'+ad+'.mp3');a.preload='auto';a.muted=durum.sessiz;a.volume=.96;
  sesler.add(a);konusan=a;
  if(plan.mod==='oyunculuk'&&plan.filmPoz?.take.cue===ad)plan.filmPoz.audio=a;
  if(yakin || plan.mod==='acilis' || masaSahnesi(plan.id) || ['C1-result-1','A2-result-1','A1-result-1','B1-result-2','B2-result-1','B2-result-2','B2-result-3','C2-result-1','C2-result-2'].includes(ad)){if(yakin)plan.mod='close';plan.konus={who,audio:ad,player:a}}
  try{
    await new Promise((resolve,reject)=>{
      const temiz=()=>{
        s.removeEventListener('abort',iptal);a.onended=null;a.onerror=null;
        if(sesButonu.parentElement){sesButonu.remove();el('bekle').hidden=true}
      };
      const iptal=()=>{temiz();reject(kesildi)};
      a.onended=()=>{temiz();resolve()};a.onerror=()=>{temiz();reject(Error('Kayıt okunamadı: '+ad))};
      s.addEventListener('abort',iptal,{once:true});
      function baslat(){
    if(durdu||s.aborted)return;
        a.play().then(()=>{
          karisim();
          if(sesButonu.parentElement){sesButonu.remove();el('bekle').hidden=true;cal(muzik);if(ortam)cal(ortam)}
        }).catch(e=>{
          if(s.aborted||e.name==='AbortError')return;
          if(e.name==='NotAllowedError'){
            el('bekle').replaceChildren(sesButonu);el('bekle').hidden=false;sesButonu.onclick=baslat;
          }else{temiz();reject(e)}
        });
      }
      baslat();
    });
  }finally{
    a.pause();sesler.delete(a);if(konusan===a)konusan=null;
    if(plan.konus?.player===a&&!(sonPozuTut&&a.ended))plan.konus=null;
    karisim();
  }
}
function dondur(v){
  if(v===durdu)return;
  durdu=v;el('dur').textContent=v?'Devam et':'Duraklat';el('dur').setAttribute('aria-pressed',String(v));
  el('hedef').disabled=v;el('eylem').disabled=v;el('ileri').disabled=v;
  for(const b of el('kartlar').children)b.disabled=v;
  if(v){sesler.forEach(a=>a.pause());muzik.pause();ortam?.pause()}
  else{sesler.forEach(cal);if(asama!=='kapak'){cal(muzik);if(ortam)cal(ortam)}}
}
function ciz(now){
  if(!durdu&&asama!=='kapak'&&asama!=='yukleniyor'){
    plan.t+=Math.min(.07,(now-once)/1000);
    // Paint at animation exposure rate; sound and input run on their own clocks.
    if(now-animasyon>=1000/30){kareCiz();animasyon=now}
  }
  once=now;requestAnimationFrame(ciz);
}
const havaSvg=[
  '<circle cx="13" cy="12" r="6" fill="#ffd35a"/><path stroke="#ffd35a" stroke-width="2" d="M13 1v3m0 16v3M1 12h3m18 0h3M4 3l3 3m12 12 3 3M22 3l-3 3M7 18l-3 3"/>',
  '<path fill="#ccc0fe" d="M4 19C-1 16 1 9 7 9c2-8 13-8 15 1 6 0 6 10 0 10H5z"/>',
  '<path fill="#b8c8e8" d="M3 15C0 11 2 6 7 6c3-7 12-6 14 1 7 0 7 9 0 9H3z"/><path fill="#ffd35a" d="m14 12-5 8h4l-2 5 9-11h-5z"/>'
];
function gok(id){
  const n=id==='F1'?0:disMekan(id)||id==='F3'?1:2;
  el('gok').innerHTML=havaSvg.map((svg,i)=>'<svg aria-hidden="true" viewBox="0 0 27 26" class="'+(i<=n?'aktif':'')+'">'+svg+'</svg>').join('');
  el('gok').setAttribute('aria-label',['Rüzgâr çıkıyor','Yağmur başladı','Fırtına'][n]);
}
function rozetlerCiz(list,host){
  host.replaceChildren();
  for(const [ad,yazi] of list){const im=document.createElement('img');im.src='medya/'+ad+'.webp';im.alt=yazi;im.title=yazi;host.append(im)}
}
async function rozetGoster(kod,d,s){
  let list=hatiralar(d);
  const kart={A:[['kuzy','Kuzu kurtuldu']],B:[['bread','Ekmek kurtuldu']],C:[['gunaydin','Kaptan Lokum']],
    A1:[['bread','Ekmek tam'],['kedi-mont','Mino evde']],A2:[['halfbread','Ekmek yarım']],A3:[['hat','Şapka ağaçta']],
    C1:[['halfbread','Ekmek yarım'],['gunaydin','Kaptan Lokum']],C2:[['kuzy','Kuzu kuru'],['bread','Ekmek tam']],
    P1:[['torch','Fener hazır']],P2:[['minder','Minderler hazır']],P3:[['kuzy','Kuzu kurudu']]};
  list=kart[kod]||list.slice(0,1);
  rozetlerCiz(list,el('rozet'));el('rozet').hidden=false;
  try{await ara(1550,s)}finally{el('rozet').hidden=true}
}
const sahneMedya={
  F1:'bahce anne-havlu masa bread hat kum kuzy lokum-sol kino-dusun',F2A:'bahce kum masa bread kedi-mont emine kino-dusun hat lokum-sol',
  F2B:'bahce masa kum wety kino-tepsi bebek-agla lokum-sol kuzy',F2C:'bahce sayi bebek-kork kuzy kino-tepsi',
  F3:'salon askilik kuruluk kapikuzu masa bread halfbread havlu kino-dinle gunaydin emine lokum-izle mino-bekle',
  F4:'salon askilik kuruluk kapikuzu minder masa bebek-kork kaptan-el kino-dusun torch kedi-gece',
  F5A:'masa-alti sayi kaptan-el kino-otur bebek-kork kedi-gece',F5B:'salon askilik kuruluk kapikuzu minder masa bebek-kork gece-kino isaret torch kedi-gece',
  E1:'bahce hat masa halfbread kino-uzul',E2:'bahce kum wety saril sabah-bahce kino-dinle emine',
  E3:'masa-alti saril baba-lamba kedi-gece',
  S1:'golge-duvar askilik gece-kino isaret lokum-alkis baba-lamba kedi-gece kapikuzu',
  S2:'salon anne-havlu baba-lamba kino-otur lokum-otur iki-dilim ekmek-dilim mino-bekle',
  S3:'salon bebek-kasik mino-bekle kuruluk kapikuzu',S4:'salon askilik kino-otur'
};
const ekPlanlar={
  F2A:'kuzuyu-ver',F2B:'pencere-kuzu',F3:'masa hazir-masa hazir-minder cekmece-kapali',F4:'masa lokum-kuvv cekmece-kapali',
  F5A:'salon kuruluk kapikuzu',F5B:'fener-elde lokum-kuvv cekmece-kapali cekmece-acik',
  E1:'yagmur-semsiye',E2:'pencere-kuzu kuruluk kapikuzu lokum-alkis',S1:'fener-elde kuzy',
  S2:'masa-alti masa lokum-kuvv handlight yalniz-fener kale-aile-buyuk kale-aile-kucuk',
  S3:'aile-orkestra',S4:'baba-sigorta cap-mini golge-duvar'
};
const oyuncuDizileri={E3:['kucak',8],S1:['tavsan',6],S3:['vurus',8],S4:['aktar',10]};
async function hazir(id,d,s){
  if(id==='F1')await pozlariHazirla(['acilis-anne','acilis-anne-sus','acilis-lokum','acilis-lokum-sus','acilis-kino','acilis-kino-sus']);
  if(masaSahnesi(id)) await masaHazirla(id,d);
  if(id==='S3') await pozlariHazirla(['orkestra-kino','orkestra-lokum']);
  if(id==='S4') await pozlariHazirla(['kaptan-isik']);
  if(id==='E2') await pozlariHazirla(['sabah-kuzu']);
  if(id==='F2C')await pozlariHazirla(['kaptan-bekle']);
  const liste=sahneMedya[id].split(' ');
  if(masaSahnesi(id))liste.push('kuzy','anne-havlu','baba-lamba','handlight','yalniz-fener','iki-dilim','ekmek-dilim','minder');
  if(['F2A','F2B','F2C','E1','E2'].includes(id))liste.push('antre-pluie','kino-dinle','lokum-sol');
  if(id==='E2')liste.push('pencere-ic','kum');
  if(id==='F3'||id==='F2B')liste.push('lavabo');
  if(id==='F2B')liste.push('anne-havlu','bread','pencere-ic');
  const cues=['idle-sag','idle-sol','idle-lokum','idle-mino','morning'];
  if(id==='F2B')cues.push('E1-2');
  if(id==='F3'&&d.kuzu==='çamurlu')cues.push('wash-start','wash-rub','wash-rinse');
  eskiPlanlariBirak(cues);
  if(d.kaptan)liste.push('kaptan-sapka');
  if(ekPlanlar[id])liste.push(...ekPlanlar[id].split(' '));
  if(oyuncuDizileri[id]){
    const [ad,n]=oyuncuDizileri[id];for(let i=0;i<n;i++)liste.push(siraAdi(ad,i));
  }
  const grup={F2A:'lift',F2B:'carry',S2:'ger',S3:'clang'}[id];
  if(grup)for(let i=0;i<10;i++)liste.push(pozAdi(grup,i));
  if(id==='F1')for(let i=0;i<8;i++)liste.push('adim-'+i);
  for(const kisi of new Set(sahneler[id].lines.filter(l=>uygun(l.when,d,acik())).map(l=>l.who).concat(['kino']))){
    if(kisi==='anlatici')continue;
    const ad=kisi==='kino'&&['E1','E2','F4'].includes(id)?'kino-uzgun':kisi;
    for(let i=0;i<3;i++)liste.push(ad+'-ses'+i);
  }
  for(const sec of sahneler[id].choices||[])if(uygun(sec.when,d,acik()))liste.push(sec.art);
  // Release decoded cels from the previous take before opening another full-resolution sequence.
  const gerekli=new Set(liste.map(ad=>pozSayfalari[ad]?.[0]||ad));for(const ad of imgCache.keys())if(!gerekli.has(ad))imgCache.delete(ad);
  await Promise.all([goruntuleriHazirla(liste),...cues.map(filmiYukle)]);sag(s);
}
const dokunlar={
  lift:['Kuzu’yu kaldır ↑','cue-lift',44,65],carry:['Tepsiyi kaldır ↑','cue-tray',46,66],
  ger:['Battaniyeyi ger →','cue-blanket',54,57],clang:['Kapakları vur','cue-beat',49,59],
  lamp:['Gölgeyi aydınlat','cue-lamp',74,32]
};
async function hareket(kod,s){
  const [etiket,kayit,x,y]=dokunlar[kod];yeniPlan({mod:'gesture',kod});
  const alan=el('dokun'),hedef=el('hedef'),buton=el('eylem');
  alan.classList.toggle('isik',kod==='lamp');hedef.setAttribute('aria-label',etiket);buton.textContent=etiket;
  hedef.style.setProperty('--x',x+'%');hedef.style.setProperty('--y',y+'%');sayfa('dokun');
  const sesIslem=new AbortController();const sustur=()=>sesIslem.abort();
  s.addEventListener('abort',sustur,{once:true});
  sesOynat(kayit,sesIslem.signal,'anlatici',etiket).catch(e=>{if(e!==kesildi)console.error(e)});
  try{
    await new Promise((resolve,reject)=>{
      let bas=null;
      const tamam=()=>{if(durdu)return;temiz();resolve()};
      const iptal=()=>{temiz();reject(kesildi)};
      function temiz(){hedef.onpointerdown=hedef.onpointermove=hedef.onpointerup=hedef.onpointercancel=hedef.onkeydown=buton.onclick=null;s.removeEventListener('abort',iptal)}
      function nokta(ev){const r=filmTuvali.getBoundingClientRect();return {x:(ev.clientX-r.left)*1600/r.width,y:(ev.clientY-r.top)*900/r.height}}
      const gez=p=>{plan.nokta=p;if(Math.hypot(p.x-1230,p.y-287)<142)tamam()};
      hedef.onpointerdown=e=>{
        if(durdu)return;bas=nokta(e);hedef.setPointerCapture(e.pointerId);
        if(kod==='lamp')gez(bas);if(kod==='clang')tamam();
      };
      hedef.onpointermove=e=>{
        if(!bas||durdu)return;const p=nokta(e);if(kod==='lamp'){gez(p);return}
        const a=kod==='ger'?(p.x-bas.x)/190:(bas.y-p.y)/148;
        plan.oran=aralik(a)*.67;if(a>=1)tamam();
      };
      hedef.onpointerup=hedef.onpointercancel=()=>{bas=null;if(kod!=='lamp')plan.oran=0};
      function kolay(){if(kod==='lamp')plan.nokta={x:1230,y:287};tamam()}
      hedef.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();kolay()}};
      buton.onclick=kolay;s.addEventListener('abort',iptal,{once:true});
    });
  }finally{sustur();s.removeEventListener('abort',sustur)}
  sag(s);sayfa('film');plan.mod='action';
  if(kod==='lamp'){efekt('click',s);await ara(2500,s)}
  else{
    const start=plan.oran;let contact=false;
    await ara((kod==='clang'?1900:kod==='ger'?4050:3000)*(1-start),s,p=>{
      plan.oran=start+(1-start)*p;
      if(kod==='clang'&&plan.oran>=.5&&!contact){contact=true;efekt('lids',s,.52)}
    });
    await ara(600,s);
  }
}
async function replik(line,s){
  const {who,text,audio}=line;
  if(!masaSahnesi(plan.id)&&cekimler.has(audio))await filmiYukle(audio);
  sag(s);plan.satir=audio;
  if(plan.id==='F1'){
    plan.mod='acilis';plan.an=plan.t;plan.acilisKisi=who;
    await Promise.all([sesOynat(audio,s,who,text),ara(2500,s)]);
    await ara(300,s);return;
  }
  if(audio==='F2A-5'){
    await filmiYukle(audio);sag(s);
    plan.mod='sapkaRuzgari';plan.oran=0;
    await Promise.all([sesOynat(audio,s,who,text),ara(3100,s,p=>{plan.oran=p})]);
    plan.sapkaUctu=true;await ara(500,s);return;
  }
  if(masaSahnesi(plan.id)){
    if(plan.mod==='action')plan.mod='wide';
    if(plan.id==='S2'){
      plan.kalePoz=0;
      const sure={'S2-2':2750,'S2-3':3100,'S2-4':3100,'S2-5':2450,'S2-6':2750,'S2-7':2400,'S2-11':3950}[audio];
      await Promise.all([sesOynat(audio,s,who,text),sure?ara(sure,s,p=>{plan.kalePoz=p}):Promise.resolve()]);
    }else await Promise.all([sesOynat(audio,s,who,text),ara(2500,s)]);
    await ara(340,s);return;
  }
  if(audio==='S4-3'){
    plan.mod='kaptan';plan.oran=0;
    await Promise.all([sesOynat(audio,s,who,text),ara(2600,s,p=>{plan.oran=p})]);
    await ara(450,s);return;
  }
  if(audio==='S3-5'){
    plan.mod='konser';plan.oran=0;
    let once=-1;
    await Promise.all([sesOynat(audio,s,who,text),ara(4900,s,p=>{
      plan.oran=p;
      const v=Math.floor(p*6-.42);
      if(v>=0&&v!==once){once=v;efekt(v%2?'spoon':'lids',s,.25)}
    })]);
    await ara(500,s);return;
  }
  if(audio==='E2-3'||audio==='E2-4'){
    plan.mod='kuzuSabahi';plan.oran=audio==='E2-3'?0:.58;
    const start=plan.oran,end=audio==='E2-3'?.58:1;
    await Promise.all([sesOynat(audio,s,who,text),ara(audio==='E2-3'?2050:3500,s,p=>{plan.oran=start+(end-start)*p})]);
    await ara(400,s);return;
  }
  if(audio==='F3-5'){
    await Promise.all(['wash-start','wash-rub','wash-rinse'].map(filmiYukle));sag(s);
    await oynaCekim('wash-start',s,1450);
    await oynaCekim('wash-rub',s,1650,'washcloth');
    const havluHazir=filmiYukle('F3-5');
    await Promise.all([oynaCekim('wash-rinse',s,1700,'rinse'),havluHazir]);
  }
  if(audio==='E1-3'&&!plan.iceri){await oynaCekim('in-home',s,1910,'door');plan.iceri=true}
  const take=cekimler.get(audio);
  const birlikte=take&&(take.plate||who==='anlatici'||['F2A-3','F2A-5','F2B-3','F3-3','F3-4','F3-5','F3-6','F3-7','F3-8','E2-2','S2-3','S2-4','S2-5','S2-6','S2-7','S1-1','S4-4'].includes(audio));
  const golge=/^S1-[3-7]$/.test(audio);
  if(audio==='F2C-3'||audio==='S3-1')efekt('thunder',s,.24);
  if(audio==='F5B-4'||audio==='S4-5')efekt('click',s,.44);
  if(audio==='F5B-3')efekt('door',s,.12);
  if(audio==='S3-4')efekt('drop',s,.38);
  const detay=['F2A-3','F2A-5','F2B-3','E2-2','F3-3','F3-4','F3-7','F3-8','F5A-3','S1-3','S1-4','S1-5','S1-6','S2-3','S2-4','S2-5','S3-4','S4-3'].includes(audio);
  if(audio==='S3-2'){
    plan.mod='acting';
    const vuruslar=async()=>{for(let i=0;i<3;i++){
      let vurdu=false;
      await ara(900,s,p=>{plan.oran=p;if(p>=.375&&!vurdu){efekt('spoon',s,.39);vurdu=true}});
    }};
    await Promise.all([sesOynat(audio,s,who,text),vuruslar()]);return;
  }
  // First stage the discovery in the wide shot, then cut to its speaker on the first syllable.
  if(birlikte||golge){
    await filmiYukle(audio);sag(s);
    plan.mod='oyunculuk';plan.konus=null;plan.filmPoz={take,p:0};
    const sonraki=audio==='F3-5'?'F3-6':null;
    await Promise.all([sesOynat(audio,s,who,text),ara(2500,s),...(sonraki?[filmiYukle(sonraki)]:[])]);
    plan.filmPoz={take,p:1};
    await ara(260,s);
  }else{
    if(detay){plan.mod='insert';plan.an=plan.t}
    const yakin=!detay&&who!=='anlatici';
    if(!detay&&!yakin)plan.mod='wide';
    await Promise.all([sesOynat(audio,s,who,text,yakin,yakin),ara(2500,s)]);
  }
  if(audio==='F2A-5')plan.sapkaUctu=true;
  if(!birlikte&&!golge&&!detay&&who!=='anlatici'){
    plan.konus={who,audio,player:null};plan.mod='close';
  }
  await ara(who==='anlatici'?490:330,s);
}
function nom(c,d){return c.readyLabel&&d.hazirlik==='fener'?c.readyLabel:c.label}
async function karar(s){
  const {id,d}=konum(),sc=sahneler[id];
  if(id==='F2B')plan.iceri=true;
  if(id==='F5A')plan.masaGiris=1;
  yeniPlan({id,d,satir:'q'});el('kartlar').replaceChildren();el('soru').textContent=sc.question;
  const secimler=sc.choices.filter(c=>uygun(c.when,d,acik()));
  for(const c of secimler){
    const b=document.createElement('button');b.className='kart'+(c.when==='unlocked'||c.when==='captain'?' altin':'');b.dataset.secim=c.c;
    const im=document.createElement('img');
    const hazirSecim=c.c==='4B'&&d.hazirlik==='fener';
    const kapak='secim-'+c.c+(hazirSecim?'-ready':'');
    b.classList.add('sahneli');im.onerror=()=>{im.onerror=null;b.classList.remove('sahneli');im.src='medya/'+c.art+'.webp'};im.src='medya/'+kapak+'.webp';im.alt='';
    const label=document.createElement('span');label.textContent=nom(c,d);b.append(im,label);b.onclick=()=>{
      if(asama!=='karar'||durdu)return;sayfa('yanit');yurut(ns=>sec(c,ns));
    };el('kartlar').append(b);
  }
  sayfa('karar');el('soru').focus({preventScroll:true});
  const bahcede=disMekan(id)&&!icMekan();
  const havaDegis=bahcede?ara(8000,s).then(()=>{plan.acele=true;atmosfer('downpour')}).catch(()=>{}):null;
  await sesOynat(id+'-q',s,'anlatici',sc.question);
  for(const [i,c] of secimler.entries()){
    const b=el('kartlar').children[i];b.classList.add('okunan');
    try{await sesOynat(c.c==='4B'&&d.hazirlik==='fener'?'4B-readyn':c.c+'-name',s,'anlatici',nom(c,d))}
    finally{b.classList.remove('okunan')}
    await ara(180,s);
  }
  if(bahcede){await havaDegis;sag(s);await sesOynat('cue-rush',s,'kino','Çabuk, yağmur geliyor!')}
}
async function gir(s,hemen=false){
  const {id,d}=konum(),devam=asama==='yanit'||asama==='film';
  sayfa('yukleniyor');if(devam)el('bekle').hidden=true;
  await hazir(id,d,s);
  yeniPlan({id,d,masaGiris:(id==='F5A'&&!hemen)?0:1,masaSarilma:id==='E3'?0:1,sapkaUctu:false,iceri:id==='E2'||(hemen&&id==='F2B'),filmPoz:null});gok(id);durum.yollar[id]=[...durum.adimlar];kaydet();
  atmosfer(disMekan(id)?id==='F1'?'wind':'rain':'rain');
  if(hemen&&sahneler[id].choices){await karar(s);return}
  sayfa('film');
  if(id==='F1'){
    plan.mod='walk';await ara(3050,s);
  }else if(id==='F2A'||id==='F2B'){
    await hareket(id==='F2A'?'lift':'carry',s);
    await rozetGoster(id==='F2A'?'A':'B',d,s);
    if(id==='F2B'){await oynaCekim('in-B',s,2260,'door');plan.iceri=true}
  }
  else if(id==='F5A'){await ara(3000,s,p=>{plan.masaGiris=p});plan.masaGiris=1}
  else if(id==='E3'){await ara(sarilmaSuresi(d),s,p=>{plan.masaSarilma=p});plan.masaSarilma=1}
  else if(id==='E2')await oynaCekim('rain-E2',s,1820,'drop');
  else if(id==='S1'||id==='S2'){
    await hareket(id==='S1'?'lamp':'ger',s);
    if(id==='S2'&&d.kaleIsigi==='fener')efekt('click',s,.27);
  }
  else if(id==='S4'||id==='E3'){
    plan.mod='acting';await ara(id==='S4'?3650:2700,s,p=>{plan.oran=p});await ara(750,s);plan.mod='wide';
  }else{
    if(id==='F3')efekt('door',s,.31);
    if(id==='F4')efekt('thunder',s,.31);
    await ara(2500,s);
  }
  for(const l of sahneler[id].lines){
    if(!uygun(l.when,d,acik()))continue;
    await replik(l,s);
    if(id==='S3'&&l.audio==='S3-1')await hareket('clang',s);
  }
  if(sahneler[id].choices)await karar(s);else await sabahGoster(s);
}
async function sec(c,s){
  const eski=konum();
  const hazirFener=c.c==='4B'&&eski.d.hazirlik==='fener';
  yeniPlan({id:eski.id,d:eski.d});sayfa('yanit');el('ileri').hidden=true;
  await Promise.all([sesOynat(hazirFener?'4B-ready':c.c+'-say',s,'kino',hazirFener?c.readySay:c.say,true,true),ara(2500,s)]);
  const pozlar=[0,1,2].map(i=>'secim-'+(hazirFener?'P1':c.c)+'-'+i);
  // These actions continue in their staged group shot, with the same tray, hat or table.
  const grupPlaninda=['A','B','A2','A3','C2','5A1','5A2','5A3'].includes(c.c);
  if(!grupPlaninda && pozlar.every(ad=>masaKareleri[ad])){
    const fon=masaKareleri[pozlar[0]].background;
    await Promise.all([pozlariHazirla(pozlar),goruntuleriHazirla([fon])]);sag(s);
    plan.mod='secimHareketi';plan.secimPozlari=pozlar;plan.oran=0;
    await ara(4200,s,p=>{plan.oran=p});
  }
  durum.adimlar.push(c.c);const {d,id}=konum();durum.bitti=false;durum.yollar[id]=[...durum.adimlar];
  if(d.cifte)durum.cifte=true;kaydet();
  const eylem=sahneMedya[eski.id].split(' ');
  if(c.c==='A3')for(let i=0;i<8;i++)eylem.push('adim-'+i);
  const ek={A1:'birlikte-tepsi',A2:'somun',B1:'salon anne-havlu wety',B2:'yagmurluk mudy',C1:'kaptan-el masa bread',C2:'kapidan-takim kino-tepsi',P1:'hazir-masa',P2:'hazir-minder',P3:'kurut anne-havlu'};
  if(c.c==='A1')await pozlariHazirla(['birlikte-tut','birlikte-say','birlikte-yari','birlikte-kaldir','tasima-esik','tasima-adim','tasima-birak']);
  if(c.c==='B1')await pozlariHazirla(['kuzu-yagmurdan-al','kuzu-ile-kos','kuzu-teslim','havlu-ver','havlu-sar','havlu-otur','kino-havlu-kurulan','kuzu-islak-kontrol']);
  if(c.c==='B2')await pozlariHazirla(['cizme-duzelt','camur-bahce','camur-teslim','camurlu-kuzu-soz','camurlu-kuzu-adim','camur-anne-soz','camur-anne-dinle','camur-lokum-bekle','camur-lokum-soz']);
  if(c.c==='C2')await pozlariHazirla(['kaptan-kuzuyla-adim','tepsi-dort-adim','kaptan-evde','kaptan-dinlen','kaptan-konustu','tepsi-konustu']);
  if(c.c==='P3')await pozlariHazirla(['kino-kurutucu-yay','lokum-kuzu-kurutma']);
  if(c.c==='A2')await pozlariHazirla(['tepsi-denge','tepsi-sessiz','tepsi-esik-iki']);
  if(c.c==='C1')await pozlariHazirla(['tepsi-birak','kaptana-yaklas','kaptan-bekle','el-uzat','el-temas','el-sik','abi-dinle','eve-el-ele','esik-gecis','esik-adim']);
  const diziler={B2:['cizme',6]};
  if(diziler[c.c]){const [ad,n]=diziler[c.c];for(let i=0;i<n;i++)eylem.push(siraAdi(ad,i))}
  if(ek[c.c])eylem.push(...ek[c.c].split(' '));
  if(['A1','A2','B1','C1','C2'].includes(c.c))eylem.push('salon');
  for(const l of sonuclar[c.c]||[])for(let i=0;i<3;i++)eylem.push(l.who+'-ses'+i);
  if(['A1','A2','B1','B2','C1','C2'].includes(c.c))eylem.push('antre-pluie','kino-dinle','lokum-sol','lavabo');
  await goruntuleriHazirla(eylem);sag(s);
  if(ek[c.c])yeniPlan({id:eski.id,d,kod:c.c,iceri:false,mod:'result'});
  if(c.c==='A3'){
    yeniPlan({id:eski.id,d,kod:c.c,mod:'sapkaTakip',sapkaUctu:true});
    await ara(3600,s,p=>{plan.oran=p});
  }
  const hareketli=['A1','A2','B1','B2','C1','C2'].includes(c.c);
  if(c.c==='P1'||c.c==='P2')await oynaCekim('hazir-'+c.c,s,1850);
  if(c.c==='P3'){plan.mod='kuzuKurut';await ara(4200,s,p=>{plan.oran=p})}
  if(hareketli&&c.c!=='A1')await ara(({C1:9000,A2:3750,B1:10400,B2:5700,C2:9200})[c.c]||3250,s,p=>{
    if(c.c==='C2'&&plan.oran<.72&&p>=.72)efekt('door',s,.25);
    plan.oran=p;
  });
  for(const [i,l] of (sonuclar[c.c]||[]).entries()){
    plan.satir=l.audio;
    if(c.c==='B1'&&i===0)plan.iceri=true;
    if((['A1','A2','B2','C1'].includes(c.c)&&i===1)||(c.c==='C2'&&i===0)){
      if(c.c==='A1'){
        plan.mod='ortakEsik';plan.oran=0;efekt('door',s,.25);
        await ara(8800,s,p=>{plan.oran=p});
      }else if(c.c==='C1'){
        plan.mod='kaptanEsik';plan.oran=0;efekt('door',s,.25);
        await ara(8200,s,p=>{plan.oran=p});
      }else if(c.c==='A2'){
        plan.mod='tepsiEsik';plan.oran=0;efekt('door',s,.25);
        await ara(2600,s,p=>{plan.oran=p});
      }else if(c.c==='B2'){
        plan.mod='camurDonus';plan.oran=0;
        await ara(8000,s,p=>{
          if(plan.oran<.34&&p>=.34)efekt('door',s,.24);
          plan.oran=p;
        });
      }
      plan.iceri=true;
    }
    const take=cekimler.get(l.audio);
    if(c.c==='P3'){
      plan.mod='kuzuKurut';plan.oran=1;
      await Promise.all([sesOynat(l.audio,s,l.who,l.text),ara(2500,s)]);
    }else if(c.c==='C2'||c.c==='B2'){
      plan.mod=c.c==='C2'?'kaptanEvde':['camurSoz','camurAnne','camurLokum'][i];
      await Promise.all([sesOynat(l.audio,s,l.who,l.text),ara(2500,s)]);
    }else if(c.c==='B1'){
      plan.mod=i===0?'havluVer':'islakKuzu';plan.oran=0;
      await Promise.all([sesOynat(l.audio,s,l.who,l.text),ara(i===0?2800:2930,s,p=>{plan.oran=p})]);
      if(i===0){plan.mod='kurulan';plan.oran=0;await ara(2600,s,p=>{plan.oran=p})}
    }else if(['A1','A2','C1'].includes(c.c)&&i===0){
      await Promise.all([sesOynat(l.audio,s,l.who,l.text),ara(2500,s)]);
      plan.oran=1;
    }else if(take){
      await filmiYukle(l.audio);sag(s);
      plan.mod='oyunculuk';plan.filmPoz={take,p:0};
      await Promise.all([sesOynat(l.audio,s,l.who,l.text),ara(2500,s)]);
      plan.filmPoz={take,p:1};
    }else{
      await Promise.all([sesOynat(l.audio,s,l.who,l.text,true,true),ara(2500,s)]);
    }
    await ara(830,s);
  }
  if(!['A','B'].includes(c.c))await rozetGoster(c.c,d,s);
  await gir(s);
}
async function sabahGoster(s){
  const {id,d}=konum();await goruntuleriHazirla(['sabah-bahce','kino-dinle',d.kaptan?'gunaydin':d.kuzu==='kuru'||id==='E2'||id==='S2'?'emine':'lokum-alkis',
    ...(id==='E1'?['baba-merdiven']:[]),...(d.mino?['kedi-sabah','kedi-el2','kedi-el3']:[]),...(d.ekmek==='yarım'?['serce','istanbul-serce1','istanbul-serce2']:[]),...(d.kuzu!=='kuru'?['kuruluk','kapikuzu']:[])]);sag(s);
  await pozlariHazirla([d.kuzu==='kuru'||id==='E2'||id==='S2'?'sabah-kuzu':'sabah-selam',...(id==='E1'?['sabah-sapka']:[])]);
  sag(s);yeniPlan({id,d,mod:'morning'});atmosfer('birds');sayfa('son');gok('F1');
  durum.sonlar[id]=[...durum.adimlar];durum.bitti=true;kaydet();await ara(6300,s);
  if(!el('harita').open)haritaGoster();
}
function haritaGoster(){
  if(el('harita').open)return;
  const {id,nodes,d}=konum();const n=Object.keys(durum.sonlar).length;
  el('sayac').textContent='7 sondan '+n+' tanesini keşfettin.'+(n===1?' Altın seçim artık bahçede açık.':'');
  const badges=Object.keys(durum.sonlar).filter(k=>rozetler[k]).map(k=>[rozetler[k][1],rozetler[k][0]]);
  if(durum.cifte)badges.push(['birlikte-tepsi','Çifte Kurtarma']);
  const sabahDurumu=['E2','S2'].includes(id)?{...d,kuzu:'kuru'}:d;
  rozetlerCiz([...hatiralar(sabahDurumu),...badges],el('haritaRozet'));el('ag').replaceChildren();
  for(const ids of [['F1'],['F2A','F2B','F2C'],['F3','E1','E2'],['F4'],['F5A','F5B'],['E3','S1','S2','S3','S4']]){
    const row=document.createElement('div');row.className='sira';
    for(const ad of ids){
      const yol=nodes.includes(ad)?durum.adimlar.slice(0,nodes.indexOf(ad)):durum.yollar[ad];
      const b=document.createElement('button');b.dataset.balon=ad;b.textContent=yol?sahneler[ad].title:'?';b.disabled=!yol;
      if(!yol)b.setAttribute('aria-label','Henüz keşfedilmemiş sahne');
      if(nodes.includes(ad))b.className='simdi';if(ad===id)b.setAttribute('aria-current','step');
      b.onclick=()=>{el('harita').close();durum.adimlar=[...yol];durum.bitti=false;kaydet();yurut(s=>gir(s,true))};
      row.append(b);
    }el('ag').append(row);
  }
  el('harita').showModal();el('kapat').focus();haritaCiz();
}
function haritaCiz(){
  const ag=el('ag');if(!el('harita').open)return;
  ag.querySelector('svg')?.remove();
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('class','yollar');
  const al=ad=>ag.querySelector('[data-balon="'+ad+'"]').getBoundingClientRect();
  const r=ag.getBoundingClientRect(),aktif=konum().nodes;
  svg.setAttribute('viewBox','0 0 '+r.width+' '+r.height);
  const bulundu=new Set();
  for(const adimlar of [...Object.values(durum.sonlar),...Object.values(durum.yollar)]){
    const {nodes}=yolOku(adimlar,acik());
    for(let i=1;i<nodes.length;i++)bulundu.add(nodes[i-1]+' '+nodes[i]);
  }
  for(const [ad,sc] of Object.entries(sahneler)){
    if(!durum.yollar[ad])continue;
    for(const hedef of new Set((sc.choices||[]).map(c=>c.to))){
      const a=al(ad),z=al(hedef),x=a.left+a.width/2-r.left,y=a.bottom-r.top,xx=z.left+z.width/2-r.left,yy=z.top-r.top;
      const p=document.createElementNS(ns,'path'),oynandi=bulundu.has(ad+' '+hedef);
      p.setAttribute('class',aktif.some((v,i)=>v===ad&&aktif[i+1]===hedef)?'bu-yol':oynandi?'bilinen':'gizli');
      // Split decisions on the same row use the space above their two nodes.
      p.setAttribute('d',Math.abs(a.top-z.top)<3?'M '+x+' '+(a.top-r.top)+' Q '+((x+xx)/2)+' '+(a.top-r.top-23)+' '+xx+' '+yy:
        'M '+x+' '+y+' C '+x+' '+(y+(yy-y)*.5)+' '+xx+' '+(yy-(yy-y)*.5)+' '+xx+' '+yy);
      svg.append(p);
    }
  }
  ag.prepend(svg);
}
new ResizeObserver(haritaCiz).observe(el('ag'));
function bastan(){el('harita').close();durum.adimlar=[];durum.bitti=false;kaydet();dondur(false);yurut(s=>gir(s))}
el('basla').onclick=()=>{if(durum.bitti)bastan();else{dondur(false);yurut(s=>gir(s))}};
el('sifir').onclick=el('tekrar').onclick=el('yenioyun').onclick=bastan;
el('dur').onclick=()=>dondur(!durdu);
el('ses').onclick=()=>{durum.sessiz=!durum.sessiz;karisim();kaydet()};
el('ileri').onclick=()=>{if(durdu)return;yurut(s=>sahneler[konum().id].choices?karar(s):sabahGoster(s))};
el('haritaAc').onclick=()=>{islem.abort();haritaGoster()};
el('kapat').onclick=()=>el('harita').close();
el('geri').hidden=!gomulu;el('geri').onclick=()=>window.parent.dispatchEvent(new Event('minkino:oyunlara-don'));
function arkada(){if(asama!=='kapak'&&asama!=='son')dondur(true);else{muzik.pause();ortam?.pause()}}
window.addEventListener('minkino:duraklat',arkada);
document.addEventListener('visibilitychange',()=>{if(document.hidden)arkada();else if(asama==='son'){cal(muzik);if(ortam)cal(ortam)}});
window.addEventListener('pagehide',()=>{islem.abort();muzik.pause();ortam?.pause()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el('harita').open&&!el('dur').hidden){e.preventDefault();dondur(!durdu)}});
sayfa('kapak');gok('F1');karisim();requestAnimationFrame(ciz);
