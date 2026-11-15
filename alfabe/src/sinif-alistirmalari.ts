import type { Ders } from './kartlar';
import { heceTreniKur } from './hece-treni';
import { kelimeSahnesiKur } from './kelime-sahnesi';
import { sesKoprusuKur } from './ses-koprusu';
import kasaba from '../../assets/alfabe/macera/kasaba.webp';
import './sinif-alistirmalari.css';

const yerler = {
  kopru:{ad:'Ses Köprüsü', ses:'yer-kopru', kur:sesKoprusuKur,merkez:[.20,.63]},
  tren:{ad:'Hece Treni', ses:'yer-tren', kur:heceTreniKur,merkez:[.47,.24]},
  sahne:{ad:'Kelime Sahnesi', ses:'yer-sahne', kur:kelimeSahnesiKur,merkez:[.83,.52]}
} as const;
export type Yer = keyof typeof yerler;
export const yerBilgisi = (yer:Yer)=>yerler[yer];

export function dersAlistirmasi(ders:Ders): Yer | undefined {
  if (['29','20','22','23','24'].includes(ders.id)) return 'sahne';
  if (['02','06','15','18','19','26','28'].includes(ders.id)) return 'tren';
  if (['01','04','05','07','10','12','14','16','17','21'].includes(ders.id)) return 'kopru';
  return undefined;
}

export function kasabayiKur(alan:HTMLElement, oku:(id:string,bitince?:()=>void)=>void, sec:(yer:Yer)=>void){
  alan.innerHTML='<section class="sa-kasaba" aria-label="Kasabada bir oyun yeri seç"><div class="sa-merkez"><img class="sa-harita" src="'+kasaba+'" alt="">'+
    '<canvas class="sa-hareket" hidden aria-hidden="true"></canvas>'+
    (Object.keys(yerler) as Yer[]).map(yer=>'<button class="sa-git sa-'+yer+'" type="button" data-yer="'+yer+
      '" aria-label="'+yerler[yer].ad+'"></button>').join('')+'</div></section>';
  const resim=alan.querySelector('img')!,cizim=alan.querySelector('canvas')!;
  const dugmeler=Array.from(alan.querySelectorAll<HTMLButtonElement>('.sa-git'));
  let kapali=false,secildi=false,kare=0;
  function sicra(yer:Yer,bitti:()=>void){
    const ctx=cizim.getContext('2d');
    if(!ctx||!resim.naturalWidth||matchMedia('(prefers-reduced-motion: reduce)').matches){bitti();return;}
    const genislik=resim.clientWidth,yukseklik=resim.clientHeight;
    const dpr=Math.min(devicePixelRatio,2);
    cizim.width=Math.round(genislik*dpr);cizim.height=Math.round(yukseklik*dpr);
    const w=cizim.width,h=cizim.height;
    const [mx,my]=yerler[yer].merkez;
    // Aynı haritanın komşu koordinatları birlikte hareket eder. Bu sayede
    // zıplayan yerin altında ikinci bir çatı veya eski bir köprü görünmez.
    const dilim=32,sira=20,bas=performance.now();
    const x=Array.from({length:dilim+1},(_,i)=>Math.round(i*w/dilim));
    const y=Array.from({length:sira+1},(_,i)=>Math.round(i*h/sira));
    const agirlik=Array.from({length:dilim},(_,i)=>y.map((_,j)=>{
      const uzaklik=((i+.5)/dilim-mx)**2/.033+(j/sira-my)**2/.068;
      return (j===0||j===sira)?0:Math.exp(-2.5*uzaklik);
    }));
    function oyna(an:number){
      if(kapali)return;
      const t=Math.min(1,(an-bas)/440);
      if(t>=1){cizim.hidden=true;bitti();return;}
      const hareket=(t<.72?-Math.sin(Math.PI*t/.72):.18*Math.sin(Math.PI*(t-.72)/.28))*Math.min(13,h*.03);
      for(let i=0;i<dilim;i++){
        const dx=x[i],dw=x[i+1]-dx,sx=dx*resim.naturalWidth/w,sw=dw*resim.naturalWidth/w;
        const ys=y.map((kenar,j)=>Math.round(kenar+hareket*agirlik[i][j]));
        for(let j=0;j<sira;j++)ctx!.drawImage(resim,sx,y[j]*resim.naturalHeight/h,sw,(y[j+1]-y[j])*resim.naturalHeight/h,dx,ys[j],dw,ys[j+1]-ys[j]);
      }
      cizim.hidden=false;kare=requestAnimationFrame(oyna);
    }
    kare=requestAnimationFrame(oyna);
  }
  for(const b of dugmeler)b.onclick=()=>{
    if(secildi||kapali)return;
    secildi=true;
    const yer=b.dataset.yer as Yer;
    let sesBitti=false,oynadi=false;
    function ac(){if(!kapali&&sesBitti&&oynadi){kapali=true;sec(yer);}}
    for(const d of dugmeler)d.setAttribute('aria-disabled','true');
    sicra(yer,()=>{oynadi=true;ac();});
    oku(yerler[yer].ses,()=>{sesBitti=true;ac();});
  };
  oku('ada-giris');
  return ()=>{kapali=true;cancelAnimationFrame(kare);for(const b of dugmeler)b.onclick=null;};
}
