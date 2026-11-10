const yiyecekler = ['havuc','bezelye','yaprak'];
const adlar = ['Havuç','Bezelye','Yaprak'];

export function bahceTahtasi(tip, art) {
 const hafiza = tip === 'izbul';
 const kartlar = yiyecekler.map((id,i) =>
  `<button type="button" class="bahce-karti" data-parca="${i}" aria-label="${hafiza ? (i+1)+'. yaprak' : adlar[i]}" draggable="false">
   <span class="icerik">${art(id)}</span>${hafiza ? '<span class="ortu">'+art('yaprak')+'</span>' : ''}
  </button>`).join('');
 return `<div class="oyun-tahtasi bahce-oyunu" data-oyun="${tip}">
  <span class="tur-izleri"><i></i><i></i><i></i></span><output class="tur-puani" aria-live="polite">★ 0 / 10</output>
  <div class="bahce-kartlari">${kartlar}</div>
  <div class="hasat-sepeti">${art('bos-kase')}<span class="siparis">${yiyecekler.map(id=>art(id)).join('')}</span></div>
 </div>`;
}

export function bahceOyna(alan,bitir,ses,signal) {
 const hafiza=alan.dataset.oyun==='izbul';
 const kartlar=[...alan.querySelectorAll('.bahce-karti')], kase=alan.querySelector('.hasat-sepeti');
 const turler=[0,1,2];
 for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[turler[i],turler[j]]=[turler[j],turler[i]];}
 let tur=0, hata=0, toplam=0, acik=false, bekleme, tutulan=null;
 function turAc(){
  hata=0; acik=!hafiza;
  const kaydir=Math.floor(Math.random()*3);
  kartlar.forEach((kart,i)=>{
   kart.style.order=(i+kaydir)%3;
   kart.disabled=false;
   kart.classList.remove('yanlis','buldu','kapali');
  });
  [...kase.querySelector('.siparis').children].forEach((im,i)=>im.hidden=i!==turler[tur]);
  if(hafiza)bekleme=setTimeout(()=>{
   kartlar.forEach(k=>k.classList.add('kapali'));acik=true;
  },1500+tur*170);
 }
 function sec(kart){
  if(!acik||kart.disabled)return;
  if(Number(kart.dataset.parca)!==turler[tur]){
   hata++;kart.classList.add('yanlis');
   if(hafiza){kart.classList.remove('kapali');kart.disabled=true;}
   return;
  }
  acik=false;ses();kart.classList.remove('kapali');kart.classList.add('buldu');
  const net=Math.max(1,(tur===2?4:3)-hata);toplam+=net;
  alan.querySelectorAll('.tur-izleri i')[tur].className='basarili';
  alan.querySelector('output').textContent='★ '+toplam+' / 10';
  bekleme=setTimeout(()=>{if(++tur===3)bitir(toplam);else turAc();},700);
 }
 function temizle(){if(tutulan){tutulan.style.transform='';tutulan.classList.remove('tasiniyor');tutulan=null;}kase.classList.remove('yakin');}
 for(const kart of kartlar){
  kart.addEventListener('click',e=>{if(hafiza||e.detail===0)sec(kart);},{signal});
  if(hafiza)continue;
  let x,y;
  kart.addEventListener('pointerdown',e=>{
   if(!acik||tutulan||!e.isPrimary||e.button!==0)return;
   kart.classList.remove('yanlis');tutulan=kart;x=e.clientX;y=e.clientY;
   kart.setPointerCapture(e.pointerId);kart.classList.add('tasiniyor');
  },{signal});
  const ustunde=e=>{const r=kase.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
  kart.addEventListener('pointermove',e=>{if(tutulan!==kart)return;kart.style.transform='translate('+(e.clientX-x)+'px,'+(e.clientY-y)+'px)';kase.classList.toggle('yakin',ustunde(e));},{signal});
  kart.addEventListener('pointerup',e=>{if(tutulan!==kart)return;temizle();if(ustunde(e))sec(kart);},{signal});
  kart.addEventListener('pointercancel',temizle,{signal});
 }
 signal.addEventListener('abort',()=>{clearTimeout(bekleme);temizle();},{once:true});
 turAc();
}
