/** Room visits never count as care or change the animal's sleep state. */
export function odaMeraki(scene,species,bedKey,signal,chime,sleepFace){
 const body=scene.querySelector('.buyuk'), prop=scene.querySelector('.oda-dekor');
 const tent=species==='kedi'&&bedKey==='cadir'?scene.querySelector('.yatak'):null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let timer,visiting=false,nextTent=!!tent;
 const tracks=new Set();
 let restoreFace;
 function play(node,frames,duration,delay=0){
  const motion=node.animate(frames,{duration,delay,easing:'ease-in-out',fill:'both'});
  tracks.add(motion);
  return motion;
 }
 function reset(){
  clearTimeout(timer);
  restoreFace?.();restoreFace=undefined;
  for(const motion of tracks)motion.cancel();
  tracks.clear();
  scene.querySelectorAll('.merak-kabarcik').forEach(node=>node.remove());
  visiting=false;
 }
 function schedule(delay){
  clearTimeout(timer);
  if((prop||tent)&&!signal.aborted&&!reduced.matches)timer=setTimeout(()=>{
   if(document.hidden||scene.matches(':has(:active)')){schedule(3000);return;}
   const target=nextTent?tent:prop||tent;
   nextTent=!!tent&&!nextTent;
   visit(target,false);
  },delay);
 }
 function visit(target,manual=true){
  if(!target||visiting||signal.aborted)return;
  clearTimeout(timer);
  const key=target===tent?'cadir':target.dataset.key;
  const fish=key==='denizotu', nesting=key==='cadir';
  if(reduced.matches){
   if(manual&&key==='cangirak')chime();
   play(target,[{opacity:.68},{opacity:1}],180).onfinish=reset;
   return;
  }
  visiting=true;
  const pet=body.getBoundingClientRect(),item=target.getBoundingClientRect();
  const dir=Math.sign(item.left+item.width/2-pet.left-pet.width/2)||1;
  const scale=nesting?Math.min(.48,item.width*.64/pet.width):fish?.69:.72;
  const x=item.left+item.width*.5-pet.left-pet.width*.5-(nesting?0:dir*pet.width*scale*.23);
  const y=item.bottom-pet.bottom-(nesting?item.height*.20:fish?item.height*.30:0);
  const frame=(offset,dx,dy,s,angle=0,flatten=1)=>({offset,transformOrigin:'50% 100%',transform:'translate('+dx+'px,'+dy+'px) rotate('+angle+'deg) scale('+s+','+s*flatten+')'});
  const duration=nesting?4100:fish?3200:2650;
  const motion=play(body,[frame(0,0,0,1),frame(.10,x*.18,y*.18-5,.95,dir*3),
   frame(.23,x*.60,y*.60-8,(1+scale)/2,dir*2),frame(.38,x,y,scale),
   frame(.48,x+dir*(nesting?0:7),y+(fish?-7:3),scale,dir*(nesting?8:9),nesting?.70:.94),
   frame(.61,x+(fish?dir*17:0),y+(fish?-13:2),scale,dir*(nesting?8:2),nesting?.69:1),
   frame(.71,x,y,scale),frame(.85,x*.55,y*.55-6,(1+scale)/2,-dir*3),frame(1,0,0,1)],duration);
  if(nesting){
   const face=body.querySelector('img.yuz');
   if(face){
    const awake=face.src,closed=sleepFace();
    timer=setTimeout(()=>{
     face.src=closed;
     restoreFace=()=>{face.src=awake;};
     timer=setTimeout(()=>{restoreFace?.();restoreFace=undefined;},duration*.28);
    },duration*.39);
   }
  }else{
   play(target,[{rotate:'0deg'},{rotate:dir*(fish?6:12)+'deg'},{rotate:-dir*7+'deg'},{rotate:dir*3+'deg'},{rotate:'0deg'}],610,duration*.46);
   if(fish)for(let i=0;i<4;i++){
    const bubble=document.createElement('i');bubble.className='dekor-kopuk merak-kabarcik';target.append(bubble);
    play(bubble,[{opacity:0,transform:'scale(.4)'},{opacity:.85,offset:.2},{opacity:0,transform:'translate('+(i%2?10:-7)+'px,-45px) scale(1.15)'}],800,duration*.38+i*140);
   }
   if(key==='cangirak')timer=setTimeout(()=>{if(!document.hidden)chime();},duration*.46);
  }
  motion.onfinish=()=>{reset();schedule(15000+Math.random()*5500);};
 }
 // A child's gesture takes priority over an idle visit.
 scene.addEventListener('pointerdown',()=>{reset();schedule(18000);},{signal,capture:true});
 signal.addEventListener('abort',reset,{once:true});
 schedule(6200);
 return visit;
}
