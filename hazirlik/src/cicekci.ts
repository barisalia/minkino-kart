import {buketAdedi,tamamla,type KresKaydi} from './kres-kaydi';
import {efekt,sesiAc} from '../../src/audio/ses';
import {simge} from './cizim';
import './cicekci.css';

const adlar=['Lale','Papatya','Çiğdem','Ayçiçeği','Gelincik','Unutmabeni'];
const svg=(ic:string)=>'<svg viewBox="0 0 100 100" fill="none" stroke="#29242a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic+'</svg>';
const kurdele=svg('<path fill="#eb8d78" d="M47 47Q17 17 12 34t4 31q12 7 34-11l-14 25 13-3 5-15 9 16 13 1-19-26q31 19 34 0t-6-23q-10-7-31 14Z"/><ellipse cx="51" cy="50" rx="8" ry="9" fill="#ffca77"/>');
const kagit=svg('<path d="M9 35 36 26 58 33 88 24 57 95H45Z" fill="#f4c582"/><path d="m9 35 39 31 40-42-34 60Z" fill="#ffe8af"/><path d="m29 60 28 11" stroke="#b78952"/>');
const vazo=svg('<path fill="#8cccb9" d="M22 54h56l-5 33q-1 7-9 7H36q-8 0-9-7Z"/><rect x="19" y="49" width="62" height="10" rx="4" fill="#bce2cf"/>');
const noktalar=[[],[[50,72]],[[40,72],[60,72]],[[31,72],[50,72],[69,72]],[[40,65],[60,65],[40,82],[60,82]],[[31,65],[50,65],[69,65],[40,82],[60,82]],[[31,64],[50,64],[69,64],[31,81],[50,81],[69,81]]];
export function sayiEtiketi(n:number){
  return svg('<path fill="#fff4d6" d="M17 16q0-7 7-7h53q7 0 7 7v70q0 7-7 7H24q-7 0-7-7Z"/><text x="50" y="55" text-anchor="middle" stroke="none" fill="#344c55" font-family="system-ui,sans-serif" font-weight="700" font-size="45">'+n+'</text>'+noktalar[n].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="5" fill="#63ad9f"/>').join(''));
}
export function buketiGoster(cicekler:number[],res:(id:string)=>string,bagli=true){
  const duzen=[
    [],[[50,31]],[[34,31],[66,31]],[[23,39],[50,24],[77,39]],
    [[18,40],[39,23],[61,23],[82,40]],
    [[16,44],[31,24],[50,14],[69,24],[84,44]],
    [[13,44],[25,26],[42,14],[58,14],[75,26],[87,44]]
  ][cicekler.length];
  const en=[0,36,30,26,22,19,16][cicekler.length],boy=[0,50,47,43,38,34,31][cicekler.length];
  const saplar='<svg class="buket-saplar" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+duzen.map(([x,y])=>{
    const yol='M'+x+' '+(y+boy*.25)+'Q'+x+' '+(y+boy*.49)+' 50 83';
    return '<path d="'+yol+'" fill="none" stroke="#2e342a" stroke-width="1.35"/><path d="'+yol+'" fill="none" stroke="#83b461" stroke-width=".72"/>';
  }).join('')+'</svg>';
  return '<span class="buket-demet" style="--en:'+en+'%;--boy:'+boy+'%">'+saplar+cicekler.map((n,i)=>{
    const [x,y]=duzen[i];
    return '<i style="--x:'+x+'%;--y:'+y+'%">'+res('etkinlik/bahce-'+n)+'</i>';
  }).join('')+'<span class="buket-kagit">'+kagit+'</span>'+(bagli?'<span class="buket-bag">'+kurdele+'</span>':'')+'</span>';
}
export const buketSiparisi=(tur:number)=>(tur%2?'zip':'mino')+'_buket_'+buketAdedi(tur);
export function buketSozu(k:KresKaydi){return {topla:'kres_cicekci',say:'kres_buket_kart',ver:'kres_buket_ver',hediye:k.buket.tur%2?'zip_buket_son':'mino_buket_son'}[k.buket.asama]}
export function cicekciAc(alan:HTMLElement,k:KresKaydi,res:(id:string)=>string,kaydet:()=>void,soyle:(id:string,sonra?:()=>void)=>void,don:()=>void){
  const b=k.buket,masa=document.createElement('section');masa.className='cicekci-masa';masa.setAttribute('aria-label','Sınıfın çiçekçisi');alan.append(masa);
  let vakit=0,deneme=0;
  function tus(ad:string,art:string,eylem:()=>void,yer:HTMLElement,cls:string){
    const el=document.createElement('button');el.type='button';el.className=cls;el.setAttribute('aria-label',ad);el.innerHTML=art;
    el.onclick=()=>{sesiAc();eylem()};yer.append(el);return el;
  }
  function tazele(){clearTimeout(vakit);deneme++;kaydet();ciz()}
  function cicekAl(n:number){
    if(b.asama!=='topla')return;
    if(b.cicekler.length===6){soyle('kres_buket_fazla');return}
    b.cicekler.push(n);efekt.dokunma();tazele();soyle('say_'+b.cicekler.length);
  }
  function kontrol(){
    const fark=b.cicekler.length-buketAdedi(b.tur);
    if(fark){soyle(fark>0?'kres_buket_fazla':'kres_buket_eksik');return}
    b.asama='say';tazele();soyle('kres_buket_kart');
  }
  function hediye(){
    b.asama='hediye';b.sonBuket=[...b.cicekler];b.teslim=Math.min(999,b.teslim+1);tamamla(k,'cicekci');efekt.yildiz(1);tazele();soyle(buketSozu(k));
  }
  function ciz(){
    masa.replaceChildren();masa.dataset.asama=b.asama;
    const adet=buketAdedi(b.tur),kim=b.tur%2?'Zıpzıp':'Mino',teslim=b.asama==='hediye';
    const ark=tus(kim+' ile konuş',res('etkinlik/'+(b.tur%2?'zipzip':'mino')+'-'+Number(teslim)),()=>{
      clearTimeout(vakit);deneme++;
      if(b.asama==='ver')hediye();else soyle(b.asama==='topla'?buketSiparisi(b.tur):buketSozu(k));
    },masa,'buket-arkadas');
    if(teslim)ark.insertAdjacentHTML('beforeend',buketiGoster(b.cicekler,res));
    tus(kim+' siparişini tekrarlasın',sayiEtiketi(adet),()=>soyle(buketSiparisi(b.tur)),masa,'buket-siparis').hidden=b.asama!=='topla';
    const tepsi=document.createElement('div');tepsi.className='buket-tepsi';masa.append(tepsi);
    if(!teslim){
      tepsi.innerHTML=buketiGoster(b.cicekler,res,b.asama!=='topla');
      if(b.asama==='topla'){
        // Çiçeğin başına dokunmak o çiçeği çıkarır. Kardeş saplar dokunmayı kesmez.
        tepsi.querySelectorAll<HTMLElement>('.buket-demet>i').forEach((el,i)=>{
          tus(adlar[b.cicekler[i]]+' buketten çıkar','',()=>{b.cicekler.splice(i,1);tazele();efekt.dokunma()},el,'buket-geri');
        });
      }
    }
    const raf=document.createElement('div');raf.className='buket-raf';masa.append(raf);
    if(b.asama==='topla'){
      for(const n of [[0,1,2],[2,3,4],[0,3,5],[1,4,5]][b.tur]){
        const el=tus(adlar[n]+' bukete ekle',res('etkinlik/bahce-'+n)+vazo,()=>cicekAl(n),raf,'buket-vazo');
        let bas:{id:number;x:number;y:number}|undefined,hayalet:HTMLElement|undefined,suruk=false;
        const sil=()=>{hayalet?.remove();hayalet=undefined;bas=undefined};
        el.onpointerdown=e=>{if(e.button!==0||bas)return;sesiAc();suruk=false;bas={id:e.pointerId,x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId)};
        el.onpointermove=e=>{
          if(!bas||bas.id!==e.pointerId)return;
          if(!suruk&&Math.hypot(e.clientX-bas.x,e.clientY-bas.y)>8){suruk=true;hayalet=document.createElement('span');hayalet.className='buket-tasinan';hayalet.innerHTML=res('etkinlik/bahce-'+n);masa.append(hayalet)}
          if(hayalet){hayalet.style.left=e.clientX+'px';hayalet.style.top=e.clientY+'px'}
        };
        el.onpointerup=e=>{
          if(!bas||bas.id!==e.pointerId)return;
          const r=tepsi.getBoundingClientRect();sil();
          if(suruk&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)cicekAl(n);
        };
        el.onpointercancel=el.onlostpointercapture=e=>{if(bas?.id===e.pointerId){suruk=true;sil()}};
        el.onclick=e=>{if(!e.detail||!suruk){sesiAc();cicekAl(n)}};
      }
      tus('Buketi kurdeleyle bağla',kurdele,kontrol,masa,'buket-islem');
    }else if(b.asama==='say'){
      const secimler=[[3,1,2],[3,4,2],[3,4,5],[6,4,5]][b.tur];
      secimler.forEach(n=>tus(n+' çiçek kartı',sayiEtiketi(n),()=>{
        if(n!==adet){
          clearTimeout(vakit);const d=++deneme;
          const cicekler=tepsi.querySelectorAll('.buket-demet>i');
          function goster(i:number){
            if(d!==deneme||!masa.isConnected||document.hidden)return;
            cicekler.forEach((c,j)=>c.classList.toggle('buket-sayilan',i===j));
            if(i<cicekler.length){soyle('say_'+(i+1));vakit=window.setTimeout(()=>goster(i+1),960)}
          }
          // Konuşma kapalıysa da görsel sayım ilerlesin.
          let basladi=false;
          const basla=()=>{if(d!==deneme||basladi)return;basladi=true;clearTimeout(vakit);goster(0)};
          vakit=window.setTimeout(basla,5200);soyle('kres_buket_yeniden',basla);return;
        }
        b.asama='ver';tazele();soyle('kres_buket_ver');
      },raf,'buket-etiket'));
    }else if(b.asama==='ver'){
      tepsi.insertAdjacentHTML('beforeend','<span class="buket-son-etiket">'+sayiEtiketi(adet)+'</span>');
      tus('Buketi '+kim+' için ver',simge('tamam'),hediye,raf,'buket-son');
    }else{
      tus('Sonraki arkadaşın buketini hazırla',simge('yenile'),()=>{
        b.tur=(b.tur+1)%4;b.cicekler=[];b.asama='topla';tazele();soyle(buketSiparisi(b.tur));
      },raf,'buket-son');
      tus('Sınıfa dön',simge('tamam'),don,raf,'buket-son');
    }
  }
  ciz();return ()=>{clearTimeout(vakit);deneme++};
}
