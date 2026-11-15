import {h} from '../../src/ui/dom';
import {dugme,ikon} from './gorsel';
import {kalipAdi,type KurabiyeSekli} from './tatli-ekonomi';
import {jest,merkez,icinde,hareket,type Nokta} from './hareket';
import './kurabiye-tepsisi.css';

export const kremalar={cilek:{ad:'Çilek',renk:'#f47896'},kakao:{ad:'Kakao',renk:'#77442e'},vanilya:{ad:'Vanilya',renk:'#fff4ca'}} as const;
export type Krema=keyof typeof kremalar;
interface Cizgi {tat:Krema;noktalar:Nokta[]}
const eskiKesimYerleri=[{x:.25,y:.47},{x:.51,y:.62},{x:.76,y:.40}];
export interface KurabiyeTepsisi {kesimler?:Nokta[];adet:number;aktarilan:number;secili:number;krema:Krema;izler:Cizgi[][]}
export const istenenKrema=(sekil:KurabiyeSekli):Krema=>({yildiz:'cilek',kalp:'kakao',yuvarlak:'vanilya'})[sekil] as Krema;
export function kurabiyeTepsisiniOku(v:Partial<KurabiyeTepsisi>|undefined,adet=0):KurabiyeTepsisi{
  const say=(n:unknown,tavan:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(tavan,Math.max(0,Math.round(n))):0;
  const gecerli=(k:unknown):k is Krema=>typeof k==='string'&&Object.hasOwn(kremalar,k);
  const adetSayisi=v?say(v.adet,3):adet;
  const kesimler=Array.from({length:adetSayisi},(_,i)=>{
    const p=v?.kesimler?.[i];
    return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1?{x:p.x,y:p.y}:{...eskiKesimYerleri[i]};
  });
  return {kesimler,adet:adetSayisi,aktarilan:v?say(v.aktarilan,7):0,secili:say(v?.secili,2),krema:gecerli(v?.krema)?v.krema:'cilek',
    izler:Array.from({length:3},(_,i)=>Array.isArray(v?.izler?.[i])?v.izler[i].slice(0,12).flatMap(c=>{
      if(!c||!gecerli(c.tat)||!Array.isArray(c.noktalar))return [];
      const noktalar=c.noktalar.slice(0,72).filter(n=>n&&Number.isFinite(n.x)&&Number.isFinite(n.y)).map(n=>({x:say(n.x,100),y:say(n.y,100)}));
      return noktalar.length?[{tat:c.tat,noktalar}]:[];
    }):[])};
}
export function kremaEksigi(t:KurabiyeTepsisi,sekil:KurabiyeSekli){
  const tat=istenenKrema(sekil);
  return t.izler.every(cizgiler=>cizgiler.some(c=>c.tat===tat))?0:1;
}
export function kurabiyeOrnegi(sekil:KurabiyeSekli){
  const t=kurabiyeTepsisiniOku(undefined,3);
  // The order shows a small piping example on each cookie. The child's own strokes stay in the draft.
  const ornekler=[
    [[29,52],[39,48],[49,48],[59,52],[70,52]],
    [[38,46],[45,51],[50,57],[57,50],[64,44]],
    [[31,55],[40,50],[50,48],[60,50],[69,55]],
  ];
  t.izler=ornekler.map(iz=>[{tat:istenenKrema(sekil),noktalar:iz.map(([x,y])=>({x,y}))}]);
  return t;
}
export function kremaFisi(sekil:KurabiyeSekli){
  const k=istenenKrema(sekil);
  return h('span.kb-fis',{role:'img','aria-label':kremalar[k].ad+' kreması'},kremaTorbasi(k));
}
const dosyalar=import.meta.glob<string>(['../../assets/sef/kurabiye/*.webp','../../assets/sef/tatli/{krema-torbasi,kurabiye-*-cig,kurabiye-*-altin}.webp','../../assets/pasta/kalip-*-1.webp'],{eager:true,query:'?url',import:'default'});
const adres=(yol:string)=>dosyalar['../../assets/'+yol+'.webp'];
const img=(yol:string,sinif='')=>h('img',{src:adres(yol),class:sinif,alt:'',draggable:'false'});
const zemini=(sekil:KurabiyeSekli,cig:boolean)=>(sekil==='yildiz'?'sef/kurabiye/yildiz-':'sef/tatli/kurabiye-'+sekil+'-')+(cig?'cig':'altin');
const torbaYolu=(k:Krema)=>k==='cilek'?'sef/tatli/krema-torbasi':'sef/kurabiye/'+k;
export const kremaTorbasi=(k:Krema)=>img(torbaYolu(k));
function izKatmani(cizgiler:Cizgi[]){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  for(const c of cizgiler){
    const iz=document.createElementNS(svg.namespaceURI,'polyline');
    const noktalar=c.noktalar.map(n=>n.x+','+n.y);
    if(noktalar.length===1)noktalar.push((c.noktalar[0].x+.05)+','+c.noktalar[0].y);
    iz.setAttribute('points',noktalar.join(' '));iz.setAttribute('fill','none');iz.setAttribute('stroke',kremalar[c.tat].renk);
    iz.setAttribute('stroke-width','6');iz.setAttribute('stroke-linecap','round');iz.setAttribute('stroke-linejoin','round');svg.append(iz);
  }
  return svg;
}
export function tekKurabiye(sekil:KurabiyeSekli,cig=false,izler:Cizgi[]=[]){
  const yol=zemini(sekil,cig);
  const kap=h('span.kb-tane',{'data-sekil':sekil},img(yol,'kb-biskuvi'));
  const desen=h('span.kb-desen',{},izKatmani(izler));desen.style.maskImage='url("'+adres(yol)+'")';kap.append(desen);
  return kap;
}
export function kurabiyeDizisi(sekil:KurabiyeSekli,tepsi:KurabiyeTepsisi,cig=false){
  return h('span.kb-dizi',{'aria-label':'Üç '+kalipAdi[sekil].toLocaleLowerCase('tr')+' kurabiye'},...Array.from({length:3},(_,i)=>tekKurabiye(sekil,cig,tepsi.izler[i])));
}
export function kalipBas(sekil:KurabiyeSekli,t:KurabiyeTepsisi,kaydet:()=>void,ileri:()=>void){
  const hamur=img('sef/kurabiye/hamur','kb-hamur-resmi');
  const kesit=img(zemini(sekil,true));
  const katman=h('canvas.kb-hamur-resmi',{'aria-hidden':'true',width:1110,height:600});
  const ciz=katman.getContext('2d');
  const zemin=h('div.kb-hamur',{},hamur,katman);
  const tepsi=h('div.kb-bos-tepsi',{role:'group','aria-label':'Fırın tepsisi'},img('sef/kurabiye/firin-tepsisi','kb-metal'));
  const istasyon=h('div.kb-kesim',{},zemin,tepsi);
  const yerler=t.kesimler??eskiKesimYerleri.slice(0,t.adet).map(p=>({...p}));
  t.kesimler=yerler;
  const parcaEni=.24;
  const hamurTepsiOrani=1.35;
  istasyon.style.setProperty('--kb-hamur-orani',hamurTepsiOrani+'fr');
  istasyon.style.setProperty('--kb-kesit-eni',100*parcaEni+'%');
  istasyon.style.setProperty('--kb-tepsi-parcasi',100*parcaEni*hamurTepsiOrani+'%');
  let basiliyor=false,elde=-1;
  let kesimKenari:HTMLCanvasElement|undefined;
  const ornekler:Nokta[]=[];
  let hamurAlfasi:ImageData|undefined;
  function kullanilabilir(p:Nokta):'kenar'|'kesik'|undefined{
    // Inspect the actual raw cookie silhouette against the dough rather than rejecting its bounding square.
    const en=parcaEni,boy=en*katman.width/katman.height;
    for(const o of ornekler){
      const x=p.x+(o.x-.5)*en,y=p.y+(o.y-.5)*boy;
      if(x<0||x>=1||y<0||y>=1)return 'kenar';
      if(hamurAlfasi){
        const w=hamurAlfasi.width,h=hamurAlfasi.height;
        if(hamurAlfasi.data[(Math.floor(y*h)*w+Math.floor(x*w))*4+3]<185)return 'kenar';
      }
      for(const eski of yerler){
        const sx=(x-eski.x)/en+.5,sy=(y-eski.y)/boy+.5;
        if(sx>=0&&sx<1&&sy>=0&&sy<1&&kalipAlfasi&&kalipAlfasi.data[(Math.floor(sy*48)*48+Math.floor(sx*48))*4+3]>120)return 'kesik';
      }
    }
    return;
  }
  let kalipAlfasi:ImageData|undefined;
  function sonrakiBosYer(){
    const onerilen=eskiKesimYerleri[t.adet];
    if(!kullanilabilir(onerilen))return onerilen;
    for(let y=.25;y<.8;y+=.05)for(let x=.16;x<.87;x+=.04)if(!kullanilabilir({x,y}))return {x,y};
    return onerilen;
  }
  function hamuruGoster(){
    const kenarResmi=kesimKenari;
    if(!ciz||!kenarResmi)return;
    const {width:w,height:h}=katman;
    ciz.clearRect(0,0,w,h);
    ciz.drawImage(hamur,0,0,w,h);
    const en=w*parcaEni;
    const kenar=en*.013;
    yerler.forEach(({x,y},i)=>{
      if(i!==elde&&!(t.aktarilan&(1<<i)))return;
      const sol=x*w-en/2,ust=y*h-en/2;
      ciz.drawImage(kenarResmi,sol-kenar,ust-kenar*.5,en+kenar*2,en+kenar*2);
      ciz.globalCompositeOperation='destination-out';
      ciz.drawImage(kesit,sol,ust,en,en);
      ciz.globalCompositeOperation='source-over';
    });
  }
  void Promise.all([hamur.decode(),kesit.decode()]).then(()=>{
    const maske=document.createElement('canvas');
    maske.width=kesit.naturalWidth;maske.height=kesit.naturalHeight;
    const kenar=maske.getContext('2d');
    if(!ciz||!kenar)return;
    const ornek=h('canvas',{width:192,height:104});
    const k=ornek.getContext('2d',{willReadFrequently:true});
    if(k){
      k.drawImage(hamur,0,0,192,104);hamurAlfasi=k.getImageData(0,0,192,104);
      ornek.width=ornek.height=48;k.drawImage(kesit,0,0,48,48);kalipAlfasi=k.getImageData(0,0,48,48);
      for(let y=0;y<48;y++)for(let x=0;x<48;x++){
        if(kalipAlfasi.data[(y*48+x)*4+3]>130)ornekler.push({x:(x+.5)/48,y:(y+.5)/48});
      }
    }
    kenar.drawImage(kesit,0,0);
    kenar.globalCompositeOperation='source-in';
    kenar.fillStyle='#3b3029';kenar.fillRect(0,0,maske.width,maske.height);
    kesimKenari=maske;hamuruGoster();hamur.hidden=true;
    const kalip=zemin.querySelector<HTMLButtonElement>('.kb-bas');
    if(kalip){konumla(kalip,t.adet,sonrakiBosYer());kalip.disabled=false;}
  }).catch(()=>{});
  function konumla(el:HTMLElement,i:number,p=yerler[i]){
    el.dataset.yer=String(i);
    el.style.left=p.x*100+'%';
    el.style.top=p.y*100+'%';
  }
  function aktarimiBagla(al:HTMLButtonElement,yuva:HTMLElement,i:number){
    let parca:HTMLElement|undefined,ilkMerkez:Nokta,son:Nokta,yerlesiyor=false;
    function kaldir(){
      if(elde!==-1||!al.isConnected)return;
      elde=i;
      const r=al.getBoundingClientRect();
      ilkMerkez=merkez(al);son=ilkMerkez;
      parca=tekKurabiye(sekil,true);
      parca.classList.add('kb-eldeki-parca');
      Object.assign(parca.style,{left:al.style.left,top:al.style.top,width:r.width+'px',height:r.height+'px'});
      zemin.append(parca);al.classList.add('kb-elde');hamuruGoster();
    }
    function tasi(yer:Nokta,ilk:Nokta){
      if(!parca||yerlesiyor)return;
      const x=yer.x-ilk.x,y=yer.y-ilk.y;
      parca.style.transform='translate('+x+'px,'+y+'px)';
      son={x:ilkMerkez.x+x,y:ilkMerkez.y+y};
      tepsi.classList.toggle('yaklas',icinde(tepsi,yer));
    }
    async function birak(kabul:boolean){
      if(!parca||yerlesiyor)return;
      yerlesiyor=true;
      const hedef=merkez(kabul?yuva:al);
      for(const dugme of zemin.querySelectorAll('button'))dugme.disabled=true;
      tepsi.classList.remove('yaklas');
      await hareket(parca,[{transform:'translate('+(son.x-ilkMerkez.x)+'px,'+(son.y-ilkMerkez.y)+'px)'},
        {transform:'translate('+(hedef.x-ilkMerkez.x)+'px,'+(hedef.y-ilkMerkez.y)+'px)'}],kabul?245:170);
      parca.remove();parca=undefined;elde=-1;yerlesiyor=false;
      if(!istasyon.isConnected)return;
      if(kabul)t.aktarilan|=1<<i;
      if(t.aktarilan===7){ileri();return;}
      if(kabul)kaydet();
      goster();
    }
    jest(al,{basla:kaldir,tasi,birak:(yer,ilk,tik)=>{tasi(yer,ilk);void birak(tik||icinde(tepsi,yer,5));},
      iptal:()=>void birak(false),klavye:()=>{kaldir();void birak(true);}});
  }
  function goster(){
    zemin.querySelectorAll('button,.kb-kesik').forEach(el=>el.remove());
    tepsi.querySelectorAll('.kb-yuva').forEach(el=>el.remove());
    hamuruGoster();
    const aktar=t.adet===3;
    for(let i=0;i<3;i++){
      const tasindi=!!(t.aktarilan&(1<<i));
      const yuva=h('span.kb-yuva',{'data-yer':i});
      if(tasindi)yuva.append(tekKurabiye(sekil,true));
      tepsi.append(yuva);
      if(i<t.adet){
        if(tasindi)continue;
        if(aktar){
          const al=dugme((i+1)+'. kurabiyeyi tepsiye taşı','kb-kesik kb-aktar',tekKurabiye(sekil,true));
          konumla(al,i);zemin.append(al);aktarimiBagla(al,yuva,i);
        }else{
          const kesik=tekKurabiye(sekil,true);kesik.classList.add('kb-kesik');konumla(kesik,i);zemin.append(kesik);
        }
        continue;
      }
      if(i!==t.adet)continue;
      const b=dugme(kalipAdi[sekil]+' kalıbı hamura bastır','kb-bas',img('pasta/kalip-'+sekil+'-1'));
      const baslangic=sonrakiBosYer();
      konumla(b,i,baslangic);b.dataset.is='kalip';b.disabled=!kesimKenari;
      let hedef={...baslangic},ilkMerkez:Nokta;
      function yerSec(p:Nokta){
        hedef=p;konumla(b,i,p);
        const neden=kullanilabilir(p);
        if(neden)b.dataset.engel=neden;else delete b.dataset.engel;
      }
      const bas=async()=>{
        const odak=b.matches(':focus-visible');
        if(basiliyor||!b.isConnected||b.disabled)return;
        const neden=kullanilabilir(hedef);
        basiliyor=true;b.disabled=true;
        if(neden){
          b.dataset.engel=neden;
          if(neden==='kesik'){
            for(const once of zemin.querySelectorAll<HTMLElement>('.kb-kesik')){
              const e=yerler[Number(once.dataset.yer)];
              if(Math.abs(e.x-hedef.x)<parcaEni&&Math.abs(e.y-hedef.y)<parcaEni*1.85)once.classList.add('kb-cakisti');
            }
          }
          await hareket(b,[{transform:'translateX(0)'},{transform:'translateX(-5%)'},{transform:'translateX(5%)'},{transform:'translateX(0)'}],320);
          if(!b.isConnected)return;
          zemin.querySelectorAll('.kb-cakisti').forEach(el=>el.classList.remove('kb-cakisti'));
          yerSec(sonrakiBosYer());b.disabled=false;basiliyor=false;return;
        }
        await hareket(b,[{transform:'translateY(-4%) scale(1.04)'},{transform:'translateY(3%) scale(.94)'},{transform:'translateY(-6%) scale(1.02)'}],280);
        if(!b.isConnected)return;
        yerler.push({...hedef});t.adet++;kaydet();basiliyor=false;
        goster();if(odak)zemin.querySelector('button')?.focus();
      };
      const noktaya=(p:Nokta)=>{
        const r=zemin.getBoundingClientRect();
        return {x:(p.x-r.left)/r.width,y:(p.y-r.top)/r.height};
      };
      const surukle=(p:Nokta,ilk:Nokta)=>{
        yerSec(noktaya({x:ilkMerkez.x+p.x-ilk.x,y:ilkMerkez.y+p.y-ilk.y}));
      };
      jest(b,{basla:()=>{ilkMerkez=merkez(b);},tasi:surukle,birak:(p,ilk,tik)=>{if(tik)yerSec(noktaya(p));else surukle(p,ilk);void bas();},
        iptal:()=>yerSec(sonrakiBosYer()),klavye:()=>void bas()});
      b.onkeydown=e=>{
        const yonler:Record<string,Nokta>={ArrowLeft:{x:-.035,y:0},ArrowRight:{x:.035,y:0},ArrowUp:{x:0,y:-.06},ArrowDown:{x:0,y:.06}};
        const yon=yonler[e.key];if(!yon)return;
        e.preventDefault();yerSec({x:Math.min(.98,Math.max(.02,hedef.x+yon.x)),y:Math.min(.98,Math.max(.02,hedef.y+yon.y))});
      };
      zemin.onpointerup=e=>{
        if(e.isPrimary&&e.button===0&&!(e.target as Element).closest('button')&&!b.disabled&&b.isConnected){yerSec(noktaya({x:e.clientX,y:e.clientY}));void bas();}
      };
      zemin.append(b);
    }
  }
  goster();return istasyon;
}
export function kurabiyeSusle(alan:HTMLElement,raf:HTMLElement,sekil:KurabiyeSekli,t:KurabiyeTepsisi,kaydet:()=>void,ileri:()=>void){
  const secimler=h('div.kb-secimler',{role:'group','aria-label':'Süsleyeceğin kurabiye'});
  const tuslar:Array<HTMLButtonElement>=[];
  const editor=dugme('Kurabiyeye krema çiz','kb-editor');
  const uc=h('span.kb-elde-torba',{'aria-hidden':'true'});uc.hidden=true;
  const geri=dugme('Son krema çizgisini geri al','kb-geri',ikon('tekrar'));
  const bitir=dugme('Kurabiyeleri tabağa diz','ta-sun',ikon('onay'));
  const depo=h('div.kb-torbalar',{role:'group','aria-label':'Krema seçimi'});
  function guncelle(){
    editor.replaceChildren(tekKurabiye(sekil,false,t.izler[t.secili]),uc);
    uc.replaceChildren(kremaTorbasi(t.krema));
    editor.setAttribute('aria-label',kremalar[t.krema].ad+' kremasını kurabiyeye çiz');
    editor.style.setProperty('--krema',kremalar[t.krema].renk);
    geri.disabled=!t.izler[t.secili].length;
    for(let i=0;i<tuslar.length;i++){
      tuslar[i].replaceChildren(tekKurabiye(sekil,false,t.izler[i]));
      tuslar[i].setAttribute('aria-pressed',String(i===t.secili));
    }
    for(const b of depo.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.krema===t.krema));
  }
  for(let i=0;i<3;i++){
    const sec=dugme((i+1)+'. kurabiyeyi süsle','kb-sec');
    sec.onclick=()=>{t.secili=i;kaydet();guncelle();};tuslar.push(sec);secimler.append(sec);
  }
  for(const k of Object.keys(kremalar) as Krema[]){
    const b=dugme(kremalar[k].ad+' kreması','kb-torba',kremaTorbasi(k));b.dataset.krema=k;
    b.onclick=()=>{t.krema=k;kaydet();guncelle();};depo.append(b);
  }
  geri.onclick=()=>{t.izler[t.secili].pop();kaydet();guncelle();};
  bitir.onclick=ileri;
  let cizgi:Cizgi|undefined;
  const nokta=(yer:Nokta)=>{
    const r=editor.getBoundingClientRect();return {x:Math.max(0,Math.min(100,Math.round((yer.x-r.left)*100/r.width))),y:Math.max(0,Math.min(100,Math.round((yer.y-r.top)*100/r.height)))};
  };
  const ekle=(yer:Nokta)=>{
    const n=nokta(yer);
    uc.hidden=false;uc.style.left=n.x+'%';uc.style.top=n.y+'%';
    if(!kalibaDegiyor(n)){cizgi=undefined;return;}
    if(!cizgi){
      if(t.izler[t.secili].length>=12)return;
      cizgi={tat:t.krema,noktalar:[]};t.izler[t.secili].push(cizgi);
    }
    if(cizgi.noktalar.length>=72)return;
    const son=cizgi.noktalar.at(-1);if(son&&Math.hypot(n.x-son.x,n.y-son.y)<2.5)return;
    cizgi.noktalar.push(n);
    const kap=editor.querySelector('.kb-desen');
    if(kap)kap.replaceChildren(izKatmani(t.izler[t.secili]));
  };
  const kontrol=document.createElement('canvas');kontrol.width=kontrol.height=101;
  const maske=kontrol.getContext('2d',{willReadFrequently:true});
  const biskuvi=new Image();biskuvi.src=adres(zemini(sekil,false));
  let alfa:Uint8ClampedArray|undefined;
  function kalibaDegiyor(n:Nokta){
    if(!alfa&&maske&&biskuvi.complete&&biskuvi.naturalWidth){
      maske.drawImage(biskuvi,0,0,101,101);alfa=maske.getImageData(0,0,101,101).data;
    }
    return alfa?alfa[(n.y*101+n.x)*4+3]>110:Math.hypot(n.x-50,n.y-50)<25;
  }
  function bas(yer:Nokta){cizgi=undefined;ekle(yer);}
  function son(){cizgi=undefined;uc.hidden=true;kaydet();guncelle();}
  jest(editor,{basla:bas,tasi:ekle,birak:(yer)=>{ekle(yer);son();},iptal:son,klavye:()=>{bas(merkez(editor));son();}});
  alan.append(secimler,editor,geri);raf.append(depo,bitir);guncelle();
}
