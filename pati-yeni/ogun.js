const foods = {
 kopek:['biskuvi','Bisküvi'], kedi:['kedi-lokmasi','Balık bisküvisi'], tavsan:['havuc','Havuç'],
 hamster:['dari','Darı'], kus:['dari','Darı'], civciv:['dari','Yem'], kirpi:['cekirge','Çekirge'],
 geko:['cekirge','Çekirge'], kaplumbaga:['yaprak','Yeşillik'], balik:['balik-yemi','Balık yemi'], ordek:['yaprak','Yeşillik']
};
export function item(pet,key){
 return key==='mama'?foods[pet]:{oyun:['','Oyna'],su:['surahi','Su sürahisi'],firca:['firca','Fırça'],uyku:['uyku','Minder']}[key];
}

// Coordinates inside each registered head sprite (ears and beaks have different bounds).
const mouths={kopek:[.5,.8],kedi:[.65,.8],tavsan:[.63,.87],hamster:[.67,.8],kus:[.7,.69],civciv:[.61,.77],kirpi:[.55,.84],geko:[.67,.76],kaplumbaga:[.74,.81],ordek:[.72,.75]};
export async function meal({scene,pet,key,food,favorite=false,outcome=favorite?'favorite':'fresh',url,part,origin,signal}){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const scale=reduce ? 0.22 : 1;
 const wait=async ms=>{await new Promise(r=>setTimeout(r,ms*scale));signal.throwIfAborted();};
 const animate=(node,frames,ms,extras={})=>node.animate(frames,{duration:ms*scale,easing:'ease-in-out',fill:'forwards',...extras});
 const dog=pet==='kopek';
 const head=scene.querySelector(dog?'.buyuk .kafa-grup':'.buyuk .yuz');
 const faceSprite=scene.querySelector(dog?'.buyuk .kafa.normal':'.buyuk .yuz');
 const face=faceSprite.getBoundingClientRect(),rect=scene.getBoundingClientRect();
 const style=getComputedStyle(faceSprite);
 const mx=Number(style.getPropertyValue('--agiz-x').trim()||mouths[pet][0]);
 const my=Number(style.getPropertyValue('--agiz-y').trim()||mouths[pet][1]);
 const mouth={x:face.left-rect.left+face.width*mx,y:face.top-rect.top+face.height*my};
 const size=Math.min(rect.width*.22,Math.max(46,Math.min(face.width*.72,rect.height*.24)));
 function prop(name,x,y,w){
  const el=document.createElement('div');el.className='oyuncak';el.style.cssText=`left:${x}px;top:${y}px;width:${w}px`;
  const img=document.createElement('img');img.src=url(name);img.alt='';el.append(img);scene.append(el);return el;
 }
 function smile(open){
  if(dog)scene.classList.toggle('agzi-acik',open);
  else head.src=part(pet,open?'sevin':'normal');
 }
 function nod(amount,ms){animate(head,[{transform:'translateY(0)'},{transform:'translateY('+amount+'px) rotate(3deg)'},{transform:'translateY(0)'}],ms);}
 scene.classList.add('ogun');
 if(key==='mama'){
  const treat=prop(food,mouth.x,mouth.y+size*.06,size);
  const dx=origin?origin.x-rect.left-mouth.x:size*1.7;
  const dy=origin?origin.y-rect.top-mouth.y:size*.8;
  smile(true);
  animate(treat,[{transform:`translate(${dx}px,${dy}px) rotate(16deg)`},{transform:'rotate(-8deg)'}],460);
  await wait(460);
  for(let bite=0;bite<3;bite++){
   smile(false);nod(size*.09,340);
   const image=treat.firstChild;
   // A stepped bite removes the end at the mouth; the remainder advances for the next bite.
   const edge=(bite+1)*32;
   image.style.clipPath=`polygon(${edge}% 0,100% 0,100% 100%,${edge}% 100%,${edge+3}% 85%,${edge}% 73%,${edge+6}% 60%,${edge+4}% 50%,${edge}% 44%,${edge+4}% 28%,${edge+2}% 14%)`;
   image.style.transform=`translateX(-${(bite+1)*14}%)`;
   for(let n=0;n<4;n++){
    const crumb=document.createElement('i');crumb.className='kirinti';crumb.style.left=mouth.x+'px';crumb.style.top=mouth.y+'px';scene.append(crumb);
    crumb.style.width=crumb.style.height=Math.max(3,size*.065)+'px';
    animate(crumb,[{transform:'translate(0,0)',opacity:1},{transform:`translate(${(n-1.5)*size*.21}px,${size*(.22+.08*n)}px)`,opacity:0}],380);
   }
   await wait(290);smile(true);await wait(200);
  }
  treat.remove();
 }else{
  const dip=Math.min(face.height*.31,rect.height*.14);
  const bowl=prop('bos-kase',mouth.x,mouth.y+dip+size*.15,size*1.25);
  const water=document.createElement('i');water.className='su-yuzeyi';bowl.append(water);
  const jug=prop('surahi',0,0,size*.96);
  await Promise.all([jug,bowl].map(object=>object.firstElementChild.decode()));
  signal.throwIfAborted();
  const rim=bowl.getBoundingClientRect(),pitcher=jug.getBoundingClientRect();
  const surface=rim.top-rect.top+rim.height*.22;
  const lip={x:mouth.x+size*.13,y:surface-size*.57};
  const x=lip.x+pitcher.width*.44,y=lip.y+pitcher.height*.43;
  Object.assign(jug.style,{left:x+'px',top:y+'px',transformOrigin:'6% 7%'});
  const dx=origin?origin.x-rect.left-x:size*.34;
  const dy=origin?origin.y-rect.top-y:size*.16;
  animate(jug,[{transform:`translate(${dx}px,${dy}px) rotate(2deg)`},{transform:'rotate(-52deg)'}],410);
  await wait(410);
  const stream=document.createElement('i');
  stream.className='su-akisi';
  const thickness=Math.max(3,size*.065);
  Object.assign(stream.style,{left:(lip.x-thickness/2)+'px',top:lip.y+'px',width:thickness+'px',height:(surface-lip.y)+'px',transform:'none'});
  scene.append(stream);
  animate(stream,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],100);
  animate(water,[{transform:'scale(.12)'},{transform:'scale(1)'}],620);
  await wait(650);stream.remove();
  animate(jug,[{transform:'rotate(-52deg)',opacity:1},{transform:`translate(${size*.3}px,0) rotate(-4deg)`,opacity:0}],250);
  for(let sip=0;sip<3;sip++){
   smile(true);
   animate(head,[{transform:'translateY(0)'},{transform:`translateY(${dip}px) rotate(2deg)`,offset:.46},{transform:`translateY(${dip}px) rotate(2deg)`,offset:.73},{transform:'translateY(0)'}],680);
   await wait(325);smile(false);
   const before=1-sip*.3,after=before-.3;
   animate(water,[{transform:`scale(${before})`},{transform:`scale(${after})`}],290);
   const ring=document.createElement('i');ring.className='su-halkasi';bowl.append(ring);
   animate(ring,[{transform:'scale(.2)',opacity:1},{transform:'scale(1)',opacity:0}],360);
   await wait(370);ring.remove();
  }
 }
 if(outcome==='unsuitable'){smile(false);return;}
 smile(true);
 if(outcome==='favorite'){
  const body=scene.querySelector('.buyuk');
  if(!reduce)animate(body,[{transform:'translateY(0)'},{transform:'translateY(-9%) rotate(-3deg)'},{transform:'translateY(0)'},{transform:'translateY(-4%) rotate(2deg)'},{transform:'translateY(0)'}],650);
  for(const side of [-1,1]){
   const extra=prop('kalp',mouth.x+side*size*.94,mouth.y-size*.7,size*.31);
   animate(extra,[{opacity:0},{opacity:1,offset:.25},{transform:'translateY(-30px)',opacity:0}],700);
  }
 }
 const heart=prop('kalp',mouth.x+size*.85,mouth.y-size*.72,size*.45);
 animate(heart,[{transform:'scale(.5)',opacity:0},{transform:'scale(1.05)',opacity:1,offset:.32},{transform:'translateY(-16px)',opacity:0}],670);
 await wait(680);
}
