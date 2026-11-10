/* Each throw has a different release window. The disc crosses the stage in an arc. */
export function frizbiBagla({scene,asset,signal,onFinish,sound}){
 const panel=document.createElement('div');
 panel.className='frizbi-kontrol';
 panel.innerHTML=`<span class="ses-etiketi" id="atis-tarifi">İbre yeşile gelince frizbiyi fırlat.</span><div class="atis-izleri" aria-hidden="true"><i></i><i></i><i></i></div><div class="atis-seridi"><i></i><em></em></div><button type="button" class="firlat" aria-label="Fırlat" aria-describedby="atis-tarifi"><img src="${asset('frizbi')}" alt=""></button><span class="atis-skor ses-etiketi" role="status">0 / 3</span>`;
 scene.append(panel);
 const disc=document.createElement('img');disc.className='ucan-frizbi';disc.src=asset('frizbi');disc.alt='';scene.append(disc);
 const btn=panel.querySelector('.firlat'),needle=panel.querySelector('.atis-seridi em'),zone=panel.querySelector('.atis-seridi i');
 const pet=scene.querySelector('.buyuk');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const targets=[.55,.35,.68];
 let tries=0,hits=0,aim=0,frame,start=performance.now(),flight;
 function tick(time){
  if(reduced){
   // Leave each position readable for a beat, including the centre of this throw's band.
   const step=Math.floor((time-start)/450)%8;
   const index=step<=4?step:8-step;
   const centre=targets[tries];
   aim=index<=2?centre*index/2:centre+(1-centre)*(index-2)/2;
  }else aim=(1-Math.cos((time-start)/1000*2.7))/2;
  needle.style.left=aim*100+'%';frame=requestAnimationFrame(tick);
 }
 function round(){
  zone.style.left=(targets[tries]-.2)*100+'%';
  aim=0;needle.style.left='0%';
  btn.disabled=false;disc.hidden=false;start=performance.now();frame=requestAnimationFrame(tick);
 }
 btn.addEventListener('click',async()=>{
  if(btn.disabled)return;
  cancelAnimationFrame(frame);btn.disabled=true;
  const hit=Math.abs(aim-targets[tries])<=.2;
  const from=disc.getBoundingClientRect(),to=pet.getBoundingClientRect();
  const dx=to.x+to.width*(hit?.5:.88)-from.x-from.width*.5;
  const dy=to.y+to.height*(hit?.4:.12)-from.y;
  const arrival=`translate(${dx}px,${dy}px) rotate(300deg) scale(.65)`;
  const frames=reduced?[{opacity:.2,transform:arrival},{opacity:1,transform:arrival}]
   :[{transform:'none'},{transform:`translate(${dx*.55}px,${dy-34}px) rotate(160deg)`,offset:.52},{transform:arrival}];
  flight=disc.animate(frames,{duration:reduced?240:660,easing:'ease-out',fill:'forwards'});
  try{await flight.finished;}catch{return;}
  if(signal.aborted)return;
  tries++;hits+=Number(hit);sound(hit);
  panel.querySelectorAll('.atis-izleri i')[tries-1].className=hit?'dolu':'kacti';
  panel.querySelector('.atis-skor').textContent=(hit?'Yakaladı! ':'Kaçtı! ')+hits+' / '+tries;
  if(hit)pet.animate([{transform:'none'},{transform:'translateY(-5%) rotate(2deg)'},{transform:'none'}],reduced?100:300);
  flight.cancel();
  if(tries===3){onFinish(hits);return;}
  round();
 },{signal});
 signal.addEventListener('abort',()=>{cancelAnimationFrame(frame);flight?.cancel();},{once:true});
 round();
}
