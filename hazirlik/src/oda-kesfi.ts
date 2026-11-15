import type {Kose,KresKaydi} from './kres-kaydi';
import {sesiAc} from '../../src/audio/ses';

type Oda='anasinifi'|'oyun-odasi';
type KoseIpucu={id:string;is?:Kose;ses?:string};
const koseler:Record<Oda,KoseIpucu[]>={
  anasinifi:[
    {id:'boya',is:'boyahane'},{id:'meyve',is:'meyve-mutfagi',ses:'mutfak'},{id:'sola',is:'gosteri',ses:'perde'},{id:'tahta-harf',is:'harf',ses:'tahta'},
    {id:'saksi',is:'bahce'},{id:'pano',is:'pano'},{id:'hali',is:'cember'},
    {id:'lavabo',is:'lavabo'},{id:'beslenme',is:'beslenme'}
  ],
  'oyun-odasi':[
    {id:'blok',is:'blok'},{id:'muzik',is:'muzik'},{id:'su',is:'su-masasi'},
    {id:'oyku',is:'oyku'},{id:'kagit',is:'kagit'},{id:'kolye',is:'kolye'},
    {id:'raftaki-araba',is:'blok',ses:'araba'}
  ]
};
// Aynı okul gününde bir köşeden dönüldüğünde sıradaki davete geç.
const gosterilenler=new WeakMap<KresKaydi,Set<string>>();
const pati='<svg viewBox="0 0 60 66" fill="none" aria-hidden="true" stroke="#241f24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><g class="kesif-temas" stroke="#4a382c"><path d="m5 13-3-1m8-6-1-4m8 6 2-3"/></g><g class="kesif-el"><path fill="#fff7e7" d="m30 52-13-12c-5-4-7-9-4-11 3-3 7 1 12 4L11 17c-4-5 2-10 6-6l14 14c-1-5 4-7 7-4l3 3c0-5 5-6 8-2l5 7c4 6 2 13-2 20l-5 7Z"/><path d="m31 25 4 4m6-5 4 4"/><path fill="#70c5b6" d="m27 51 19 10 7-12-20-11Z"/><path d="m31 51 14 7" stroke="#3e897e"/></g></svg>';

export function odaKesfiniAc(alan:HTMLElement,oda:Oda,k:KresKaydi,soyle:(ses:string)=>void){
  const gorulen=gosterilenler.get(k)??new Set<string>();
  gosterilenler.set(k,gorulen);
  const teklifler:KoseIpucu[]=[...koseler[oda]];
  if(oda==='anasinifi'&&k.biten.length>=2)teklifler.push({id:'zil'});
  const secenekler=teklifler.flatMap(kose=>{
    const tus=alan.querySelector<HTMLButtonElement>('[data-kres="'+kose.id+'"]');
    return tus?[{...kose,tus}]:[];
  });
  const im=document.createElement('span');
  im.className='kres-kesif-patisi';im.setAttribute('aria-hidden','true');im.innerHTML=pati;im.hidden=true;
  alan.append(im);
  let bekle=0,kaldir=0,davet=0,sonSes='',sonSesAni=0;
  const uygun=()=>alan.isConnected&&!document.hidden&&!alan.closest('[inert]')&&!document.querySelector('dialog[open]');
  function gizle(){clearTimeout(bekle);clearTimeout(kaldir);im.hidden=true;delete im.dataset.hedef}
  function teklif(x?:number,y?:number){
    gizle();
    if(!uygun())return;
    const adaylar=secenekler.map(kose=>{
      const r=kose.tus.getBoundingClientRect();
      const cx=r.left+r.width*.5,cy=r.top+r.height*.5;
      const puan=x!==undefined&&y!==undefined?Math.hypot(cx-x,cy-y):
        (gorulen.has(kose.id)?2:0)+(kose.is&&k.biten.includes(kose.is)?1:0);
      return {kose,cx,cy,puan};
    }).sort((a,b)=>a.puan-b.puan);
    const aday=adaylar[0];if(!aday)return;
    const r=alan.getBoundingClientRect();
    im.style.left=(aday.cx-r.left)/r.width*100+'%';im.style.top=(aday.cy-r.top)/r.height*100+'%';
    im.dataset.hedef=aday.kose.id;im.hidden=false;
    gorulen.add(aday.kose.id);
    if(secenekler.every(s=>gorulen.has(s.id)))secenekler.forEach(s=>gorulen.delete(s.id));
    if(x!==undefined&&(sonSes!==aday.kose.id||performance.now()-sonSesAni>6500)){
      sonSes=aday.kose.id;sonSesAni=performance.now();
      sesiAc();soyle('kres_kesif_'+(aday.kose.ses??aday.kose.id));
    }
    kaldir=window.setTimeout(()=>{im.hidden=true;delete im.dataset.hedef},3400);
    if(++davet<2)bekle=window.setTimeout(()=>teklif(),14000);
  }
  let baslangic:{id:number;x:number;y:number}|undefined;
  function bas(ev:PointerEvent){
    gizle();
    baslangic=ev.isPrimary&&ev.button===0&&ev.target===alan?{id:ev.pointerId,x:ev.clientX,y:ev.clientY}:undefined;
  }
  function bosDokunus(ev:PointerEvent){
    const ilk=baslangic;baslangic=undefined;
    if(!ilk||ilk.id!==ev.pointerId||ev.target!==alan||Math.hypot(ev.clientX-ilk.x,ev.clientY-ilk.y)>16)return;
    teklif(ev.clientX,ev.clientY);
  }
  alan.addEventListener('pointerdown',bas);
  alan.addEventListener('pointerup',bosDokunus);
  alan.addEventListener('focusin',gizle);
  bekle=window.setTimeout(()=>teklif(),5200);
  return ()=>{
    gizle();im.remove();
    alan.removeEventListener('pointerdown',bas);alan.removeEventListener('pointerup',bosDokunus);
    alan.removeEventListener('focusin',gizle);
  };
}
