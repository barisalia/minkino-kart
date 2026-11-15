import { resim } from './resimler';
import dersler from './harfler.json';
import { kucukGrup } from './yas-grubu';
import './trambolin.css';

// Platformlar oyunun dokunulabilir kontrolleridir. Etiket ve esnek yüzey birlikte çöker.
const eldivenSVG='<svg class="tr-eldiven" aria-hidden="true" viewBox="0 0 48 54"><path d="m23 50 8-4-13-4 13-4-11-4 7-4" fill="none" stroke="#354941" stroke-width="3"/><path d="M15 34 11 26C3 17 8 8 14 8c2-5 8-6 11-3 7-4 14 2 14 10 6 0 8 8 2 13l-6 6z" fill="#ee7566" stroke="#29332d" stroke-width="2"/><path d="M15 30h20v7H15z" fill="#f9bf75" stroke="#29332d" stroke-width="2"/></svg>';


export function trambolinKur(kok:HTMLElement, kelime:string, parcalar:string[], yer:number, yardim:boolean,
  sec:(i:number)=>void, bitir:()=>void){
  const adet=Math.max(3,parcalar.length);
  kok.innerHTML='<div class="tr-saha"><span class="tr-cikis" aria-hidden="true"></span><span class="tr-golge" aria-hidden="true"></span>'+
    '<div class="tr-yolcu"><img class="tr-nesne" alt="'+dersler.find(d=>d.id===kelime)!.example+'" src="'+resim(kelime)+'"></div></div>'+
    '<div class="tr-alt"><span role="status">Her hecede sıradaki tramboline dokun.</span><button type="button" class="tr-ileri" hidden aria-label="Devam et"><svg viewBox="0 0 48 36" aria-hidden="true"><path d="M5 11h18V4q0-3 3-1l16 12q4 3 0 6L26 33q-3 2-3-1v-7H5q-2 0-2-2V13q0-2 2-2Z" fill="#fff4ce" stroke="#203a33" stroke-width="2.4" stroke-linejoin="round"/></svg></button></div>';
  const saha=kok.querySelector<HTMLElement>('.tr-saha')!;
  const yolcu=saha.querySelector<HTMLElement>('.tr-yolcu')!;
  const golge=saha.querySelector<HTMLElement>('.tr-golge')!;
  const mesaj=kok.querySelector<HTMLElement>('[role=status]')!;
  const ileri=kok.querySelector<HTMLButtonElement>('.tr-ileri')!;
  const basamak=(i:number)=>i<0?9:31+i*53/(adet-1);
  const kisa=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kapali=false,kilit=false,klavye=false,sira=yer;
  let inis:Promise<unknown>=Promise.resolve();
  const animasyonlar=new Set<Animation>();
  function oynat(el:Element,kareler:Keyframe[],ayarlar:KeyframeAnimationOptions){
    const anim=el.animate(kareler,ayarlar);animasyonlar.add(anim);
    const bitis=anim.finished.catch(()=>{}).then(()=>animasyonlar.delete(anim));
    return bitis;
  }
  const dugmeler=Array.from({length:adet},(_,i)=>{
    const b=document.createElement('button');
    b.type='button';b.className='tr-yay';b.style.left=basamak(i)+'%';
    b.setAttribute('aria-label',(i+1)+'. trambolin');
    b.innerHTML=eldivenSVG+'<img alt="" draggable="false" class="tr-ayaklar" src="'+resim('hece-yay')+'">'+'<span class="tr-zemin"><b></b></span>';
    b.onclick=e=>{if(!kilit&&!kapali){klavye=e.detail===0;sec(i);}};saha.append(b);return b;
  });
  function goster(){
    yolcu.style.left=golge.style.left=basamak(sira-1)+'%';
    dugmeler.forEach((b,i)=>{
      b.disabled=kilit||i<sira;
      const sonraki=i===sira&&i<parcalar.length;
      b.classList.toggle('tr-siradaki',yardim&&sonraki);
      b.classList.toggle('tr-gecti',i<sira);
      b.querySelector('b')!.textContent=i<sira||(kucukGrup&&sonraki)?parcalar[i]:String(i+1);
      if(sonraki&&yardim)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
    });
    ileri.hidden=kilit||sira<parcalar.length;
    if(!kilit&&sira===parcalar.length)mesaj.textContent='Sözcük tamam!';
    else if(!kilit&&sira>0)mesaj.textContent=parcalar.slice(0,sira).join(' · ');
  }
  goster();
  ileri.onclick=()=>{if(!kilit&&!kapali)bitir();};
  return {
    hazirlan(){kilit=true;goster();},
    zipla(i:number){
      sira=i+1;goster();
      const dx=(basamak(i-1)-basamak(i))*saha.clientWidth/100;
      const ac=kelime==='23'&&i===parcalar.length-1;
      const yukseklik=saha.clientHeight-parseFloat(getComputedStyle(yolcu).bottom)-yolcu.offsetHeight*(ac?1.57:1)-6;
      const yuk=Math.max(0,Math.min(saha.clientHeight*.39,yukseklik,100));
      const sure=kisa?1:ac?860:620;
      const ayarlar={duration:sure,easing:'linear'};
      const konum=(x:number,y:number)=>'translate(calc(-50% + '+x+'px), '+y+'px)';
      const kareler=Array.from({length:29},(_,n)=>{
        const t=n/28;
        return {transform:konum(dx*(1-t),-4*yuk*t*(1-t))};
      });
      void oynat(golge,Array.from({length:15},(_,n)=>{
        const t=n/14,h=4*t*(1-t);
        return {transform:konum(dx*(1-t),0)+' scaleX('+(1-h*.55)+')',opacity:.50-h*.31};
      }),ayarlar);
      const zemin=dugmeler[i].querySelector('.tr-zemin')!, yay=dugmeler[i].querySelector('.tr-ayaklar')!;
      const basma={duration:kisa?1:210,delay:kisa?0:sure-70,easing:'ease-out'};
      const tepkiler=[oynat(zemin,[{translate:'0 0'},{translate:'0 6px',offset:.38},{translate:'0 0'}],basma),
        oynat(yay,[{scale:'1 1'},{scale:'1 .62',offset:.38},{scale:'1 1'}],basma)];
      // Oyuncağın altı da inişte yatağın indiği kadar iner.
      inis=Promise.all([oynat(yolcu,[...kareler.map((k,n)=>({...k,offset:n/28*sure/(sure+(kisa?0:140))})),
        ...(!kisa?[{transform:konum(0,6),offset:(sure+10)/(sure+140)},{transform:konum(0,0),offset:1}]:[])],
        {duration:sure+(kisa?0:140),easing:'linear'}),...tepkiler]);
      mesaj.textContent=parcalar.slice(0,sira).join(' · ');
    },
    inince(fn:()=>void){void inis.then(()=>{if(kapali)return;kilit=false;goster();
      if(klavye)(sira===parcalar.length?ileri:dugmeler[sira]).focus({preventScroll:true});fn();});},
    yanlis(i:number,fazla:boolean){
      mesaj.textContent=fazla?parcalar.join(' · ')+' bitti. Üçüncü hece yok!':'Önce '+(sira+1)+'. tramboline dokun.';
      if(fazla){
        const el=dugmeler[i].querySelector<HTMLElement>('.tr-eldiven')!;
        void oynat(el,[{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(-12px)',offset:.35},{opacity:1,offset:.75},{opacity:0,transform:'translateY(6px)'}],{duration:kisa?220:690});
      } else if(dugmeler[sira]){
        dugmeler[sira].classList.add('tr-siradaki');
      }
    },
    kapat(){kapali=true;animasyonlar.forEach(a=>a.cancel());animasyonlar.clear();}
  };
}
