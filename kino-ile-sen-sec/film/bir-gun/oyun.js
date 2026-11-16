'use strict';
const el=id=>document.getElementById(id);
const uygulamada=window.frameElement?.id==='kino-film' && location.search==='?uygulama';
if(uygulamada){
  window.addEventListener('minkino:duraklat',()=>{
    if(['story','reply','choice','end'].includes(state.phase))setPause(true);
  });
  el('oyunlara-don').hidden=false;
  el('oyunlara-don').onclick=()=>window.parent.dispatchEvent(new Event('minkino:oyunlara-don'));
}
const names={kino:'Kino',lokum:'Lokum',mino:'Mino',zipzip:'Zıpzıp',anne:'Anne',dede:'Dede Hasan',baba:'Baba',bulut:'Bulut'};
const storeKey='minkino.bir-gunu.1';
function trace(steps) {
  let id='B1',withLokum=false;
  if(!Array.isArray(steps))throw Error('Yol');
  for(const code of steps){const edge=hikaye[id].choices?.find(s=>s.code===code);if(!edge)throw Error('Karar');id=edge.target;if('withLokum' in edge)withLokum=edge.withLokum}
  return {id,withLokum};
}
let saved=null;
try{const item=JSON.parse((uygulamada?window.parent:window).localStorage.getItem(storeKey));if(item){trace(item.steps);saved=item}}catch{}
const visited={};
for(const [id,steps] of Object.entries(saved?.visited||{})){
  try{if(trace(steps).id===id)visited[id]=steps}catch{}
}
const edgesSeen=new Set(Array.isArray(saved?.edges)?saved.edges:[]);
const state={id:'B1',withLokum:false,steps:[],phase:'cover',endings:new Set((Array.isArray(saved?.endings)?saved.endings:[]).filter(id=>hikaye[id]?.ending))};
let generation=0,paused=false,muted=saved?.muted===true,pendingVoice=null,currentFx=null,currentShot=null,stopOpening=null;
const music=new Audio('bir-gun/ses/sabah.mp3');music.loop=true;music.volume=.075;
let pauseMark=0,pausedTime=0;
const clock=()=> (paused ? pauseMark : performance.now())-pausedTime;
let sceneStart=0,endFrame=0,gesture=null,promptAudio=null;
const sceneSeconds=()=>Math.max(0,(clock()-sceneStart)/1000);
function persist(){try{(uygulamada?window.parent:window).localStorage.setItem(storeKey,JSON.stringify({steps:state.steps,endings:[...state.endings],visited,edges:[...edgesSeen],muted}))}catch{}}
function show(id,on){el(id).hidden=!on}
function sayForReader(text){el('okuyucu').textContent=text}
function setShot(shot){currentShot=shot;paint(shot)}
function audioMix(){music.muted=muted;if(pendingVoice)pendingVoice.audio.muted=muted;if(currentFx)currentFx.muted=muted;if(promptAudio)promptAudio.muted=muted;
 el('ses').textContent=muted?'Ses kapalı':'Ses açık';el('ses').setAttribute('aria-pressed',String(!muted))}
function stopVoice(){if(pendingVoice){const current=pendingVoice;pendingVoice=null;current.stop()}}
function cancelCurrent(){
  cancelAnimationFrame(endFrame);
  ++generation;stopOpening?.();stopVoice();currentFx?.pause();currentFx=null;
  if(paused)setPause(false);
  return generation;
}
function setPause(on){
  if(paused===on)return;
  if(on){pauseMark=performance.now();paused=true;pendingVoice?.audio.pause();promptAudio?.pause();currentFx?.pause();music.pause()}
  else{pausedTime+=performance.now()-pauseMark;paused=false;if(pendingVoice)pendingVoice.audio.play().catch(()=>{});if(currentFx&&!currentFx.ended)currentFx.play().catch(()=>{});if(state.phase!=='end')music.play().catch(()=>{})}
  if(!on&&promptAudio&&!promptAudio.ended)promptAudio.play().catch(()=>{});
  el('dur').textContent=on?'Sürdür':'Duraklat';el('dur').setAttribute('aria-pressed',String(on));
}
function fx(name){currentFx?.pause();currentFx=new Audio('bir-gun/ses/'+name+'.mp3');currentFx.volume=.27;currentFx.muted=muted;currentFx.play().catch(()=>{})}
function showTools(phase){
  state.phase=phase;el('oyun').dataset.phase=phase;el('oyun').dataset.node=state.id;el('oyun').dataset.lokum=String(state.withLokum);
  show('yol',phase==='choice'&&state.steps.length>0);
  show('yeniden',phase==='end');
  show('karar',phase==='choice');show('son',phase==='end');show('arac',phase!=='cover');
  show('atla',['story','reply','end'].includes(phase));el('atla').textContent=phase==='end'?'Sahneyi tekrar oyna':phase==='reply'?'Seçimi uygula':hikaye[state.id].ending?'Sonu göster':'Karara geç';
  show('dur',['story','reply','choice','end'].includes(phase));show('altyazi',false);show('bekle',phase==='loading');
}
function hideGesture(){
  gesture=null;show('hareket',false);
  if(promptAudio){promptAudio.pause();promptAudio=null}
}
const instructionTracks=new Map();
function instructionTrack(voice){
  if(!instructionTracks.has(voice)){
    const track=new Audio();
    track.preload='auto';track.src='bir-gun/ses/yon-'+voice+'.mp3';
    track.load();instructionTracks.set(voice,track);
  }
  return instructionTracks.get(voice);
}
function requestGesture(cue,voice,advance,release){
  const control=el('hareket'),target=el('temas');
  control.style.setProperty('--px',(cue.x*100)+'%');
  control.style.setProperty('--py',(cue.y*100)+'%');
  el('hareket-ad').textContent=cue.label;
  el('hareket-yon').textContent=cue.dy<0?'↑':cue.dx<0?'←':'→';
  target.setAttribute('aria-label',cue.label);
  gesture={cue,advance,release,pointer:null};
  show('hareket',true);target.focus({preventScroll:true});sayForReader(cue.label);
  promptAudio=instructionTrack(voice);promptAudio.currentTime=0;
  promptAudio.muted=muted;promptAudio.volume=.85;promptAudio.play().catch(()=>{});
}
const target=el('temas');
target.onpointerdown=e=>{
  if(!gesture||paused||gesture.pointer!==null||e.button!==0)return;
  gesture.pointer=e.pointerId;gesture.x=e.clientX;gesture.y=e.clientY;
  target.setPointerCapture(e.pointerId);
};
target.onpointermove=e=>{
  if(!gesture||gesture.pointer!==e.pointerId||paused)return;
  const r=mainCanvas.getBoundingClientRect(),c=gesture.cue;
  const change=c.dx*(e.clientX-gesture.x)/r.width+c.dy*(e.clientY-gesture.y)/r.height;
  gesture.advance(clamp(change/.24));
};
target.onpointerup=e=>{if(gesture?.pointer===e.pointerId){gesture.pointer=null;if(!paused)gesture.release()}};
target.onpointercancel=()=>{if(gesture){gesture.pointer=null;gesture.advance(0)}};
target.onclick=el('hareket-dugme').onclick=()=>{if(gesture&&!paused)gesture.release()};
const foleyCues={
  B1:[[1.72,'foley-cirt']], B1_5:[[1.54,'foley-vagon']], B2A:[[.3,'foley-adim']],B2B:[[.77,'sut']],
  B2B_KUS:[[.25,'foley-adim']],B2C:[[1.45,'tahta']],B3B:[[.04,'sut']],
  B3C:[[1.06,'foley-su']],ERKEN1:[[2.56,'tahta'],[4.6,'foley-vagon']],ERKEN2:[[1.55,'foley-adim']],
  ERKEN3:[[1.85,'foley-ortu']],ERKEN4:[[2.88,'camur']],ERKEN5:[[1.9,'sayfa'],[5.6,'foley-ortu']],
  SON1:[[1.78,'foley-adim'],[3.1,'sobe']],SON2:[[6.51,'sut'],[7.55,'cocuklar']],SON3:[[3.05,'cocuklar']]
};
function playOpening(timeline,id,token){
  return new Promise(resolve=>{
    const beats=direction[id].beats||[],sounds=foleyCues[id]||[];
    let frame=0,beatIndex=0,soundIndex=0,position=0,last=clock(),previous=-1;
    const finish=ok=>{cancelAnimationFrame(frame);hideGesture();stopOpening=null;resolve(ok)};
    stopOpening=()=>finish(false);
    function render(){if(token!==generation){finish(false);return}
      const now=clock(),delta=(now-last)/1000;last=now;
      if(!gesture){
        position=Math.min(timeline,position+delta);
        const cue=beats[beatIndex];
        if(cue&&position>=cue.at){
          position=cue.at;
          requestGesture(cue,id+(beatIndex?'b':''),
            fraction=>{position=cue.at+(cue.to-cue.at)*fraction},
            ()=>{hideGesture();beatIndex++;last=clock()});
        }
      }
      while(soundIndex<sounds.length&&position>=sounds[soundIndex][0])fx(sounds[soundIndex++][1]);
      const tick=Math.round(position*30);
      if(tick!==previous){setShot({id,time:position});previous=tick}
      if(position>=timeline){sceneStart=now-timeline*1000;finish(true);return}
      frame=requestAnimationFrame(render)}
    render();
  });
}
function captions(words){
  let block=null;const result=[];
  for(const [start,,word] of words){if(!block||block.text.length+word.length>52||(/[.!?…]$/.test(block.text)&&block.text.length>17)){block={start,text:word};result.push(block)}else block.text+=' '+word}
  return result;
}
function speak(key,line,token){
  const timing=zaman[key],audio=new Audio('bir-gun/ses/'+key+'.mp3');
  audio.muted=muted;music.volume=.045;
  const chunks=captions(timing.words);const start=clock();
  const cues=timing.cues.filter(([at,shape],i,all)=>shape!==0||i===0||!all[i+1]||all[i+1][0]-at>=.08);
  if(line){el('konusan').textContent=names[line.who];el('cumle').textContent=chunks[0]?.text||line.text;show('altyazi',true);sayForReader(names[line.who]+'. '+line.text)}
  return new Promise(resolve=>{
    let finished=false,fallback=false,frame=0,lastShot='',lastText='';
    function end(ok){if(finished)return;finished=true;cancelAnimationFrame(frame);audio.onended=audio.onerror=null;audio.pause();
      if(pendingVoice?.audio===audio)pendingVoice=null;music.volume=.075;resolve(ok)}
    pendingVoice={audio,stop:()=>end(false)};audio.onended=()=>end(true);
    audio.onerror=()=>{fallback=true};audio.play().catch(()=>{fallback=true});
    function render(){if(token!==generation){end(false);return}
      const t=fallback?(clock()-start)/1000:audio.currentTime;
      if(fallback&&t>=timing.duration+.13){end(true);return}
      if(line){
        const mouth=cues.findLast(c=>c[0]<=Math.floor(t*12)/12)?.[1]||0;
        const finale=!!hikaye[state.id].ending;
        const closeup=finale && ['ERKEN1','ERKEN2','ERKEN4','SON1','SON2','SON3'].includes(state.id)
          && t>=.45 && t<timing.duration-.8;
        const tableau=key==='B3A-0';
        const insert=line.insert&&t>Math.max(.5,timing.duration-1.15)?line.insert:null;
        const expression=key==='B3A-1'?'mino-fisilti':
          ['B1-3','B2B-0','B2B_KUS-0','B2B-sec2','ERKEN2-0'].includes(key)?'kino-uzgun':line.who;
        const wideEnding=finale&&!closeup;
        const ticks=wideEnding?Math.floor(sceneSeconds()*18):0;
        const shotKey=insert||(wideEnding?'ending'+ticks:tableau?'count'+Math.floor(t*12):expression+mouth);
        if(lastShot!==shotKey){
          if(insert)setShot({id:state.id,insert});
          else if(wideEnding)setShot({id:state.id,time:ticks/18});
          else if(tableau)setShot({id:state.id,time:Math.min(4.7,t*.82)});
          else setShot({id:state.id,speaker:expression,mouth});
          lastShot=shotKey;
        }
        const current=chunks.findLast(c=>c.start<=t)?.text||chunks[0]?.text;
        if(current!==lastText){el('cumle').textContent=current;lastText=current}
      }
      frame=requestAnimationFrame(render);
    }
    render();
  });
}
async function enter(steps,{decision=false}={}){
  const token=cancelCurrent();state.steps=steps.slice();Object.assign(state,trace(steps));
  visited[state.id]=steps.slice();steps.forEach(code=>edgesSeen.add(code));persist();
  const id=state.id,node=hikaye[id];showTools('loading');
  el('bekle').textContent='Sahne hazırlanıyor…';
  (direction[id].beats||[]).forEach((_,i)=>instructionTrack(id+(i?'b':'')));
  const needed=stageAssets(id,state.withLokum);
  try{await Promise.all([...needed].map(loadPicture))}catch{
    if(token!==generation)return;
    el('bekle').textContent='Sahne yüklenemedi. ';const again=document.createElement('button');again.textContent='Tekrar dene';again.onclick=()=>enter(steps,{decision});el('bekle').append(again);return;
  }
  if(token!==generation)return;
  show('kapak',false);setCanvasSize();
  // The previous scene releases its decoded sheets only after the new scene is ready.
  for(const key of pictures.keys())if(!needed.has(key))pictures.delete(key);
  if(decision){settle();return}
  showTools('story');sceneStart=clock();
  if(!await playOpening(direction[id].length,id,token)||token!==generation)return;
  for(const [i,line] of node.lines.entries()){
    if(line.onlyLokum&&!state.withLokum)continue;
    if(!await speak(id+'-'+i,line,token)||token!==generation)return;
  }
  settle();
}
function narrateEnding(id,node){
  const together=state.withLokum&&!!node.lokumluKapanis;
  const text=together?node.lokumluKapanis:node.kapanis;
  const caption=el('son-anlatim');
  caption.textContent=text;
  caption.focus({preventScroll:true});
  const audio=new Audio('bir-gun/ses/kapanis-'+id+(together?'L':'')+'.mp3');
  audio.muted=muted;
  function stop(){
    audio.onended=audio.onerror=null;
    audio.pause();
    if(pendingVoice?.audio===audio)pendingVoice=null;
  }
  pendingVoice={audio,stop};
  audio.onended=audio.onerror=stop;
  audio.play().catch(stop);
}
let chosenIndex=null;
function settle(){
  const token=cancelCurrent(),node=hikaye[state.id];chosenIndex=null;
  if(node.ending){
    state.endings.add(state.id);persist();showTools('end');music.pause();
    const id=state.id,minTime=direction[id].length;
    // A skipped ending lands on its outcome. Natural playback keeps its animation clock.
    if(sceneSeconds()<minTime)sceneStart=clock()-minTime*1000;
    let previous=-1;
    const render=()=>{
      if(generation!==token||state.phase!=='end')return;
      const tick=Math.floor(sceneSeconds()*18);
      if(tick!==previous&&!el('harita').open){setShot({id,time:tick/18});previous=tick}
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)endFrame=requestAnimationFrame(render);
    };
    render();
    narrateEnding(id,node);return;
  }
  setShot({id:state.id,time:99,decision:true});
  showTools('choice');el('soru').textContent=node.question;const controls=el('secenekler');controls.replaceChildren();controls.classList.toggle('uc',node.choices.length===3);
  const order=state.id==='B3A'?[1,0]:node.choices.map((_,i)=>i);
  for(const i of order){const edge=node.choices[i],button=document.createElement('button');button.textContent=edge.label;button.dataset.code=edge.code;button.title=edge.action;button.onclick=()=>choose(i);controls.append(button)}
  el('soru').focus({preventScroll:true});sayForReader(node.question);
  speak(state.id+'-soru',null,token);
}
function applyChoice(){
  if(chosenIndex===null)return;
  const edge=hikaye[state.id].choices[chosenIndex];chosenIndex=null;
  enter([...state.steps,edge.code]);
}
async function choose(i){
  if(state.phase!=='choice')return;const token=cancelCurrent();chosenIndex=i;showTools('reply');
  const edge=hikaye[state.id].choices[i];
  const nextWithLokum=edge.withLokum??state.withLokum;
  Promise.all([...stageAssets(edge.target,nextWithLokum)].map(loadPicture)).catch(()=>{});
  if(!await speak(state.id+'-sec'+i,{who:'kino',text:edge.say},token)||token!==generation)return;
  const exit=departures[edge.code];
  if(exit){
    show('altyazi',false);fx('foley-adim');
    const start=clock();
    const completed=await new Promise(resolve=>{
      let frame=0,last=-1;
      const finish=ok=>{cancelAnimationFrame(frame);stopOpening=null;resolve(ok)};
      stopOpening=()=>finish(false);
      const render=()=>{
        if(token!==generation){finish(false);return}
        const time=(clock()-start)/1000,index=Math.min(exit.length-1,Math.floor(time/.43));
        if(index!==last){setShot({id:state.id,insert:exit[index]});last=index}
        if(time>=exit.length*.43+.25){finish(true);return}
        frame=requestAnimationFrame(render);
      };
      render();
    });
    if(!completed||token!==generation)return;
  }
  applyChoice();
}
function start(steps){
  music.muted=muted;music.play().catch(()=>{});enter(steps);
}
const mapPositions={
  B1:[70,182],B1_5:[221,255],B2A:[357,44],B2B:[357,191],B2C:[357,405],
  B2B_KUS:[498,313],B3A:[647,47],B3B:[647,173],B3C:[647,396],
  SON1:[884,25],ERKEN3:[884,82],ERKEN4:[884,139],SON2:[884,196],
  ERKEN2:[884,253],ERKEN1:[884,310],ERKEN5:[884,367],SON3:[884,438]
};
function drawMap(){
  const root=el('balonlar');root.replaceChildren();
  const ns='http://www.w3.org/2000/svg',lines=document.createElementNS(ns,'svg');
  lines.setAttribute('width','960');lines.setAttribute('height','490');lines.setAttribute('aria-hidden','true');root.append(lines);
  for(const [id,node] of Object.entries(hikaye)){
    const [x,y]=mapPositions[id];
    for(const edge of node.choices||[]){
      const [tx,ty]=mapPositions[edge.target],p=document.createElementNS(ns,'path');
      const dy=edge.code==='1.5B'?24:edge.code==='1.5A'?-24:0;
      const mx=(x+tx)/2;
      p.setAttribute('d',`M${x} ${y} C${mx} ${y+dy} ${mx} ${ty+dy} ${tx} ${ty}`);
      const active=state.steps.includes(edge.code);
      p.setAttribute('fill','none');p.setAttribute('stroke',active?'#a66623':edgesSeen.has(edge.code)?'#528369':'#bfcbc0');p.setAttribute('stroke-width',active?4:2);
      if(!edgesSeen.has(edge.code))p.setAttribute('stroke-dasharray','5 5');
      lines.append(p);
    }
  }
  for(const [id,[x,y]] of Object.entries(mapPositions)){
    const button=document.createElement('button'),known=Object.hasOwn(visited,id);
    const index=state.steps.findIndex((_,i)=>trace(state.steps.slice(0,i)).id===id);
    button.style.left=x+'px';button.style.top=y+'px';button.disabled=!known;
    button.textContent=known?hikaye[id].title:'?';button.title=known?hikaye[id].title:'Henüz keşfedilmedi';
    button.classList.toggle('bu-yol',index>=0||id===state.id);
    button.onclick=()=>{el('harita').close();music.play().catch(()=>{});enter(index>=0?state.steps.slice(0,index):visited[id],{decision:!hikaye[id].ending})};
    root.append(button);
  }
}
function pathDialog(){
  drawMap();
  const list=el('yollar');list.replaceChildren();let id='B1';
  for(const [index,code] of state.steps.entries()){
    const n=hikaye[id],edge=n.choices.find(c=>c.code===code),li=document.createElement('li'),button=document.createElement('button'),small=document.createElement('small');
    button.textContent=n.title;small.textContent=edge.label;button.append(small);button.title='Bu karara dön';button.onclick=()=>{el('harita').close();music.play().catch(()=>{});enter(state.steps.slice(0,index),{decision:true})};
    li.append(button);list.append(li);id=edge.target;
  }
  el('varis').textContent=hikaye[state.id].title+' · '+state.endings.size+' / 8 son keşfedildi';el('harita').showModal();
}
el('atla').onclick=()=>{if(state.phase==='reply')applyChoice();else if(state.phase==='story')settle();else if(state.phase==='end')start(state.steps)};
el('basla').onclick=()=>start(saved?.steps||[]);el('temiz').onclick=()=>start([]);
el('yeniden').onclick=()=>start([]);el('ses').onclick=()=>{muted=!muted;audioMix();persist()};
el('dur').onclick=()=>setPause(!paused);el('yol').onclick=pathDialog;el('kapat').onclick=()=>el('harita').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['story','reply','choice','end'].includes(state.phase)&&!paused)setPause(true)});
new ResizeObserver(()=>{setCanvasSize();paint(currentShot)}).observe(el('ekran'));
if(saved){
  const last=hikaye[trace(saved.steps).id];
  el('basla').querySelector('span').textContent=last.ending?'Sonu izle':'Devam et';
  show('temiz',true);
}
audioMix();
