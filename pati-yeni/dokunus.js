import './dokunus.css';

// Sample the alpha of the actual game sprites, including the dog's coloured masks.
// Only opaque parts of the displayed animal contribute to its coverage score.
const masks=new Map();
function readMask(url){
 if(!masks.has(url)){
  masks.set(url,(async()=>{
   const image=new Image();
   image.src=url;
   await image.decode();
   const canvas=document.createElement('canvas');
   canvas.width=56;canvas.height=56;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   context.drawImage(image,0,0,56,56);
   return context.getImageData(0,0,56,56).data;
  })().catch(error=>{masks.delete(url);throw error;}));
 }
 return masks.get(url);
}

async function animalParts(pet){
 const images=[...pet.querySelectorAll('.kukla img')];
 if(images.length){
  return Promise.all(images.map(async image=>({el:image,mask:await readMask(image.currentSrc||image.src)})));
 }
 const pieces=[...pet.querySelectorAll('.govde,.kafa.normal,.kulak,.kuyruk')];
 return Promise.all(pieces.map(async el=>{
  const urls=[...el.querySelectorAll('.boya')].map(layer=>layer.style.getPropertyValue('--resim').match(/url\(['"]?(.*?)['"]?\)/)?.[1]).filter(Boolean);
  const layers=await Promise.all(urls.map(readMask));
  const mask=new Uint8Array(56*56*4);
  for(const layer of layers){
   for(let i=3;i<mask.length;i+=4)mask[i]=Math.max(mask[i],layer[i]);
  }
  return {el,mask};
 }));
}

function measuredPart({el,mask}){
 const bounds=el.getBoundingClientRect();
 const style=getComputedStyle(el);
 const angle=(parseFloat(style.rotate)||0)*Math.PI/180;
 const flipped=style.scale.startsWith('-')?-1:1;
 const cosine=Math.cos(angle),sine=Math.sin(angle);
 const width=el.offsetWidth,height=el.offsetHeight;
 return {
  bounds,
  contains(x,y){
   const dx=x-bounds.left-bounds.width/2,dy=y-bounds.top-bounds.height/2;
   const u=.5+flipped*(dx*cosine+dy*sine)/width;
   const v=.5+(-dx*sine+dy*cosine)/height;
   if(u<0||v<0||u>=1||v>=1)return false;
   return mask[(Math.floor(v*56)*56+Math.floor(u*56))*4+3]>105;
  }
 };
}

const columns=12,rows=14;
function hitMap(parts,face){
 const shapes=parts.map(measuredPart);
 const left=Math.min(...shapes.map(p=>p.bounds.left)),right=Math.max(...shapes.map(p=>p.bounds.right));
 const top=Math.min(...shapes.map(p=>p.bounds.top)),bottom=Math.max(...shapes.map(p=>p.bounds.bottom));
 const width=right-left,height=bottom-top,cells=[];
 for(let row=0;row<rows;row++){
  for(let col=0;col<columns;col++){
   const id=row*columns+col;
   // Keep traces attached to the same patch of fur across viewport resizes.
   const dx=((id*73+row*13)%31/30-.5)*.48;
   const dy=((id*47+col*11)%37/36-.5)*.46;
   const x=left+width*(col+.5+dx)/columns,y=top+height*(row+.5+dy)/rows;
   if(face){
    const u=(x-face.left)/face.width,v=(y-face.top)/face.height;
    // On all four furry pets the eyes, nose and mouth sit inside this band.
    // Spare it both from lather and from the amount required for a full rinse.
    if(u>.12&&u<.90&&v>.33&&v<.91)continue;
   }
   if(shapes.some(shape=>shape.contains(x,y)))cells.push({id,x,y});
  }
 }
 return {cells,left,top,width,height,radius:Math.max(6,Math.min(width/columns,height/rows)*1.15)};
}

function segmentDistance(x,y,from,to,lengthSquared){
 const fraction=Math.max(0,Math.min(1,((x-from.x)*(to.x-from.x)+(y-from.y)*(to.y-from.y))/lengthSquared));
 return Math.hypot(x-from.x-fraction*(to.x-from.x),y-from.y-fraction*(to.y-from.y));
}

const starsFor=ratio=>Number(ratio>=.22)+Number(ratio>=.52)+Number(ratio>=.84);
const instructions={firca:'Tüyleri tara',sabun:'Köpükle kapla',durula:'Köpükleri durula'};

export function baglaDokunus({scene,type,asset,relaxedFace,actionsHost,onProgress,onFinish,signal}){
 if(signal?.aborted)return;
 const washing=type==='yikama'||type==='yika';
 let phase=washing?'sabun':'firca';
 const rubbed=new Set(),rinsed=new Set();
 let parts,map,pointerId,previous,cursor,keyboardDown=false,closed=false;
 const pet=scene.querySelector('.buyuk');
 const face=pet.querySelector('.yuz'),normalFace=face?.src;
 let relaxTimer,lastMark=-Infinity;
 const layer=document.createElement('div');
 layer.className='dokunus';
 layer.dataset.phase=phase;
 layer.innerHTML=`<div class="dok-yuzey" tabindex="0" role="group" aria-label="Bakım alanı. Ok tuşlarıyla ilerle, bakım yapmak için boşluk tuşunu basılı tut."></div>
 <div class="dok-izler" aria-hidden="true"></div>
 <img class="dok-gerec" draggable="false" alt="">
 <div class="dok-gosterge"><img class="dok-isaret" alt=""><strong class="dok-yon ses-etiketi"></strong>
 <progress class="dok-ilerleme" value="0" max="100"></progress><span class="dok-ses" role="status"></span></div>
 <div class="dok-dugmeler"><button type="button" class="dok-durula" aria-label="Durula" hidden><img src="${asset('el-dusu')}" alt=""></button><button type="button" class="dok-bitir" aria-label="Bitir"><i aria-hidden="true"></i></button></div>`;
 scene.classList.add('serbest-bakim');
 scene.append(layer);
 const surface=layer.querySelector('.dok-yuzey'),tool=layer.querySelector('.dok-gerec');
 const marks=layer.querySelector('.dok-izler'),label=layer.querySelector('.dok-yon'),voice=layer.querySelector('.dok-ses');
 const meter=layer.querySelector('progress'),rinse=layer.querySelector('.dok-durula'),end=layer.querySelector('.dok-bitir');
 const controls=layer.querySelector('.dok-dugmeler');
 if(actionsHost)actionsHost.append(controls);
 const badge=layer.querySelector('.dok-isaret');
 function equip(name){
  tool.src=asset(name);
  badge.src=tool.src;
 }
 const controller=new AbortController();
 const options={signal:controller.signal};
 const foam=new Map();
 const resize=new ResizeObserver(layout);

 function snapshot(){
  const total=map?.cells.length||1;
  const fraction=(phase==='durula'?rinsed:rubbed).size/total;
  return {stars:phase==='sabun'?0:starsFor(fraction),progress:Math.min(100,Math.round(fraction*100)),phase};
 }
 let savedPoints=0;
 function update(){
  const score=snapshot();
  const points=score.phase==='sabun'?0:Math.round(score.progress*(washing?10:5)/100);
  if(points>savedPoints){
   savedPoints=points;
   onProgress?.(score.progress);
  }
  label.textContent=instructions[phase];
  meter.value=score.progress;
  meter.setAttribute('aria-label',instructions[phase]);
  layer.dataset.phase=phase;
  const wasDisabled=rinse.disabled;
  rinse.hidden=phase!=='sabun';
  rinse.disabled=phase==='sabun'&&score.progress<22;
  if(phase==='sabun'&&wasDisabled&&!rinse.disabled)voice.textContent='Artık durulayabilirsin.';

 }
 function put(node,x,y){
  const bounds=layer.getBoundingClientRect();
  node.style.left=(x-bounds.left)+'px';
  node.style.top=(y-bounds.top)+'px';
 }
 function moveTo(point){
  cursor=point;put(tool,point.x,point.y);
 }
 function layout(){
  if(!parts||closed)return;
  const head=washing?pet.querySelector('.yuz,.kafa.normal'):null;
  map=hitMap(parts,head?.getBoundingClientRect());
  const live=new Set(map.cells.map(cell=>cell.id));
  for(const id of rubbed)if(!live.has(id))rubbed.delete(id);
  for(const id of rinsed)if(!live.has(id))rinsed.delete(id);
  for(const [id,bubble] of foam){
   const cell=map.cells.find(candidate=>candidate.id===id);
   if(cell)put(bubble,cell.x,cell.y);
   else{bubble.remove();foam.delete(id);}
  }
  const at=map.cells[Math.floor(map.cells.length*.7)];
  if(at&&!cursor)moveTo(at);
  update();
 }
 function effect(cell){
  if(phase==='sabun'){
   const bubble=document.createElement('i');
   bubble.className='dok-kopuk';
   bubble.style.backgroundImage=`url("${asset('kopuk')}")`;
   bubble.style.width=map.radius*(1.28+(cell.id*19%23)/19)+'px';
   bubble.style.rotate=(cell.id*37%99-49)+'deg';
   put(bubble,cell.x,cell.y);marks.append(bubble);foam.set(cell.id,bubble);
   return;
  }
  if(phase==='durula'){
   foam.get(cell.id)?.remove();
   foam.delete(cell.id);
  }
 }
 function sweep(from,to){
  const dx=to.x-from.x,dy=to.y-from.y;
  const lengthSquared=dx*dx+dy*dy;
  if(!map||lengthSquared<2)return;
  if(phase==='firca')tool.style.setProperty('--firca-egim',(dx/Math.sqrt(lengthSquared)*13).toFixed(1)+'deg');
  let touched,contact;
  for(const cell of map.cells){
   const used=phase==='durula'?rinsed:rubbed;
   if(segmentDistance(cell.x,cell.y,from,to,lengthSquared)>map.radius)continue;
   if(!contact||Math.hypot(to.x-cell.x,to.y-cell.y)<Math.hypot(to.x-contact.x,to.y-contact.y))contact=cell;
   if(used.has(cell.id)||(phase==='durula'&&!rubbed.has(cell.id)))continue;
   used.add(cell.id);effect(cell);touched=cell;
  }
  const now=performance.now();
  if(phase==='durula'&&contact&&now-lastMark>=48){
   lastMark=now;
   const spray=document.createElement('i');
   spray.className='dok-puskurtu';spray.innerHTML='<i></i><i></i><i></i>';
   put(spray,contact.x,contact.y);marks.append(spray);
   const effect=spray.animate([{opacity:.3},{opacity:1,offset:.35},{opacity:0}],{duration:230});
   effect.finished.then(()=>spray.remove()).catch(()=>spray.remove());
  }
  if(!touched)return;
  if(phase==='firca'){
   scene.classList.add('taraniyor');
   if(face&&relaxedFace&&face.src!==relaxedFace)face.src=relaxedFace;
   clearTimeout(relaxTimer);
   relaxTimer=setTimeout(relax,420);
  }
  if(phase==='firca'&&now-lastMark>=85){
   lastMark=now;
   const spark=document.createElement('i');
   spark.className='dok-parilti';spark.textContent='✦';
   put(spark,touched.x,touched.y);marks.append(spark);
   spark.animate([{opacity:1,transform:'scale(.7)'},{opacity:0,transform:'translateY(-12px) scale(.35)'}],{duration:340}).finished.then(()=>spark.remove()).catch(()=>spark.remove());
  }
  update();
  if((phase==='durula'&&rinsed.size===rubbed.size)||(phase==='firca'&&rubbed.size===map.cells.length))finish();
 }
 function relax(){
  scene.classList.remove('taraniyor');
  if(face&&normalFace&&face.src!==normalFace)face.src=normalFace;
 }
 function start(event){
  if(pointerId!==undefined||!event.isPrimary||event.button!==0||!map)return;
  pointerId=event.pointerId;
  previous={x:event.clientX,y:event.clientY};
  moveTo(previous);
  surface.focus({preventScroll:true});
  surface.setPointerCapture(pointerId);tool.classList.add('temas');
 }
 function track(event){
  if(!map||closed)return;
  if(pointerId===undefined){
   if(event.pointerType==='mouse')moveTo({x:event.clientX,y:event.clientY});
   return;
  }
  if(event.pointerId!==pointerId)return;
  const samples=event.getCoalescedEvents?.();
  for(const sample of samples?.length?samples:[event]){
   if(closed)return;
   const next={x:sample.clientX,y:sample.clientY};
   moveTo(next);
   if(Math.hypot(next.x-previous.x,next.y-previous.y)<2)continue;
   sweep(previous,next);
   previous=next;
  }
 }
 function release(event){
  if(event.pointerId!==pointerId)return;
  pointerId=undefined;previous=undefined;tool.classList.remove('temas');
 }
 function keyboard(event){
  if(!map||!cursor)return;
  if(event.code==='Space'){
   event.preventDefault();keyboardDown=true;tool.classList.add('temas');return;
  }
  const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  const direction=directions[event.key];
  if(!direction)return;
  event.preventDefault();
  const next={
   x:Math.max(map.left,Math.min(map.left+map.width,cursor.x+direction[0]*map.width/columns)),
   y:Math.max(map.top,Math.min(map.top+map.height,cursor.y+direction[1]*map.height/rows))
  };
  if(keyboardDown)sweep(cursor,next);
  if(!closed)moveTo(next);
 }
 function keyRelease(){
  keyboardDown=false;tool.classList.remove('temas');
 }
 function cleanup(){
  if(closed)return;
  closed=true;
  clearTimeout(relaxTimer);relax();
  controller.abort();resize.disconnect();controls.remove();layer.remove();
  scene.classList.remove('serbest-bakim');
  signal?.removeEventListener('abort',cleanup);
 }
 function finish(){
  if(closed)return;
  const score=snapshot();
  cleanup();
  onFinish?.(score);
 }
 surface.addEventListener('pointerdown',start,options);
 surface.addEventListener('pointermove',track,options);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,release,options);
 surface.addEventListener('keydown',keyboard,options);
 surface.addEventListener('keyup',event=>{if(event.code==='Space')keyRelease();},options);
 surface.addEventListener('blur',keyRelease,options);
 rinse.addEventListener('click',()=>{
  if(phase!=='sabun'||rinse.disabled)return;
  phase='durula';equip('el-dusu');
  voice.textContent='Köpükleri suyla durula.';
  update();surface.focus({preventScroll:true});
 },options);
 end.addEventListener('click',finish,options);
 signal?.addEventListener('abort',cleanup,{once:true});
 equip(washing?'sunger':'firca');
 update();
 resize.observe(pet);
 animalParts(pet).then(loaded=>{
  if(closed)return;
  parts=loaded;layout();surface.dataset.ready='true';
 }).catch(error=>{
  if(closed)return;
  label.classList.remove('ses-etiketi');
  label.textContent='Bakım çizimi yüklenemedi';
  console.error('Bakım alanı açılamadı',error);
 });
 return cleanup;
}
