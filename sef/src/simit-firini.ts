import rehber from './simit-replikleri.json';
import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {ikon,dugme} from './gorsel';
import {kaplamaResmi,hamuruGoster,hamurUcu,simitBirlesimi,simitResmi,simitSunumu,sicakSimit} from './simit-gorseli';
import {yeniSimit,simitOku,simitFisleri,simitRengi,simitRenkAdi,kaplamaAdi,type SimitTaslak,type SimitFisi,type Kaplama,type Tohum} from './simit-tarifi';
import './simit-firini.css';
import {pisirmeSaati} from './pisirme-saati';

interface Ayarlar {taslak?:SimitTaslak;kaydet:(t:SimitTaslak)=>void;teslim:(t:SimitTaslak)=>void;geri:()=>void;sesli:()=>boolean;soyle:(cumle:string)=>void;siparisiDinle?:()=>void}
export function simitFirini(id:SimitFisi,a:Ayarlar){
  const t=simitOku(a.taslak)??yeniSimit(),istek=simitFisleri[id];
  const sahne=h('section.simit-atolye',{'aria-label':'Simit fırını'});
  const geri=dugme('Sipariş tepsisine dön','simit-tus simit-geri',ikon('geri'));
  const dinle=dugme('Bu adımı dinle','simit-tus simit-geri simit-dinle',ikon('hoparlor'));
  dinle.hidden=!a.sesli();dinle.onclick=()=>a.soyle(t.evre==='kapla'&&t.yarili&&!t.kaplama?(t.ilkYari?rehber['sag-yari']:rehber['sol-yari']):rehber[t.evre]);
  const fis=h('div.simit-fis',{'aria-label':'Sipariş'},simitSunumu(istek.kaplama,istek.renk));
  if(istek.kaplama==='susam'||istek.kaplama==='hashas')fis.append(kaplamaResmi(istek.kaplama));
  if(a.siparisiDinle){
    const tekrar=dugme('Babaanne’nin simit siparişini dinle','simit-fis-sesi',ikon('hoparlor'));
    tekrar.hidden=!a.sesli();tekrar.onclick=a.siparisiDinle;fis.append(tekrar);
  }
  const alan=h('div.simit-alan');
  const alt=h('div.simit-alt');
  sahne.append(geri,dinle,fis,alan,alt);
  const saat=pisirmeSaati();
  let bitmis=false,acik=false;
  const ses=(fn:()=>void)=>{if(a.sesli())fn();};
  const yaz=()=>a.kaydet({...t});
  const gec=(evre:SimitTaslak['evre'])=>{t.evre=evre;yaz();ciz();};
  const dur=()=>{acik=false;saat.dur();};
  geri.onclick=()=>{dur();yaz();a.geri();};
  function dug(ad:string,simge:Parameters<typeof ikon>[0],fn:()=>void){
    const b=dugme(ad,'simit-tus',ikon(simge));b.onclick=fn;return b;
  }
  function tezgah(){
    const el=h('canvas.simit-hamur',{width:680,height:430,'aria-hidden':true});
    const raf=h('div.simit-sekillendir');raf.append(el);alan.append(raf);
    const uclar=new Map<-1|1,HTMLButtonElement>();
    const birlesim=h('span.simit-hedef',{'aria-hidden':true},ikon('onay'));
    let yogur:HTMLButtonElement|undefined;
    const cizHamur=()=>{
      hamuruGoster(t,el);
      for(const [yon,b] of uclar){const p=hamurUcu(yon,t);b.style.left=p.x+'%';b.style.top=p.y+'%';b.dataset.bagli=String((yon===-1?t.sol:t.sag)>=1);}
      if(yogur)yogur.style.width=(32+46*t.uzunluk)+'%';
    };
    const bitis=()=>{
      yaz();
      if(t.evre==='uzat'&&t.uzunluk>=1){ses(efekt.dogru);gec('bagla');}
      else if(t.evre==='bagla'&&t.sol===1&&t.sag===1){ses(efekt.pof);gec('kapla');}
    };
    function parmak(b:HTMLButtonElement,yon?:-1|1){
      let bas:{x:number;y:number;son:number;ilk:number;w:number;h:number}|undefined;
      b.onpointerdown=e=>{
        if(!e.isPrimary||e.button!==0||b.dataset.bagli==='true')return;
        const r=raf.getBoundingClientRect();
        bas={x:e.clientX,y:e.clientY,son:e.clientX,ilk:yon===-1?t.sol:t.sag,w:r.width,h:r.height};b.setPointerCapture(e.pointerId);
      };
      b.onpointermove=e=>{
        if(!bas)return;
        if(!yon){const mesafe=Math.abs(e.clientX-bas.son);bas.son=e.clientX;t.uzunluk=Math.min(1,t.uzunluk+mesafe/(bas.w*1.22));}
        else{
          const dx=(e.clientX-bas.x)/bas.w*100,dy=(e.clientY-bas.y)/bas.h*100;
          const oran=Math.min(1,Math.max(0,bas.ilk+(dx*(-yon*38)+dy*(-30))/(38*38+30*30)));
          const son=oran>.92?1:oran;if(yon===-1)t.sol=son;else t.sag=son;
        }
        cizHamur();
      };
      const birak=()=>{if(!bas)return;bas=undefined;bitis();};
      b.onpointerup=b.onpointercancel=b.onlostpointercapture=birak;
      b.onkeydown=e=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','Enter',' '].includes(e.key))return;
        e.preventDefault();
        if(!yon)t.uzunluk=Math.min(1,t.uzunluk+.26);
        else if(yon===-1)t.sol=Math.min(1,t.sol+.34);else t.sag=Math.min(1,t.sag+.34);
        cizHamur();bitis();
      };
    }
    if(t.evre==='uzat'){
      yogur=dugme('Hamuru sağa sola yuvarla','simit-yuvarla');parmak(yogur);raf.append(yogur);
      const yon=h('div.simit-yonler',{'aria-hidden':true},ikon('geri'),ikon('el'),ikon('ileri'));alt.append(yon);
    }else{
      raf.append(birlesim);birlesim.style.left=simitBirlesimi.x+'%';birlesim.style.top=simitBirlesimi.y+'%';
      for(const yon of [-1,1] as const){
        const b=dugme((yon===-1?'Sol':'Sağ')+' hamur ucunu birleştir','simit-ucu',ikon('el'));
        b.dataset.yon=String(yon);uclar.set(yon,b);parmak(b,yon);raf.append(b);
      }
    }
    cizHamur();
  }
  function kapla(){
    const halka=simitSunumu(t.kaplama??'sade','acik',t.ilkYari);
    halka.classList.add('simit-buyuk');halka.hidden=!t.kaplama;
    const ham=h('canvas.simit-halka-hamuru',{width:680,height:430});
    hamuruGoster(t,ham);ham.hidden=!!t.kaplama||!!t.ilkYari;
    const surukle=dugme('Simidi kaplama kabına batır','simit-batir',ham,halka);
    if(t.yarili&&!t.kaplama){
      surukle.dataset.yari=t.ilkYari?'sag':'sol';
      if(t.ilkYari){
        const taban=simitSunumu('sade','acik');
        const sol=simitSunumu(t.ilkYari,'acik');
        surukle.append(h('span.simit-yarim-onizleme',{},taban,sol));
      }
      surukle.append(h('span.simit-yari-eli',{'aria-hidden':true},ikon('el')));
      surukle.setAttribute('aria-label',(t.ilkYari?'Sağ':'Sol')+' yarıyı seçtiğin kaba batır');
    }
    alan.append(surukle);
    function bula(k:Tohum|'sade'){
      if(t.yarili&&k==='sade')return;
      if(t.yarili&&k!=='sade'){
        if(!t.ilkYari){t.ilkYari=k;if(a.sesli())a.soyle(rehber['sag-yari']);}
        else{t.kaplama=t.ilkYari===k?k:'karisik';t.yarili=false;}
      }else{
        t.kaplama=k;delete t.ilkYari;t.yarili=false;
      }
      ses(efekt.pof);yaz();ciz();
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches)alan.querySelector('.simit-buyuk')?.animate(
        [{transform:'scale(.91) rotate(-11deg)'},{transform:'scale(1) rotate(0)'}],{duration:250});
    }
    let bas:{x:number;y:number}|undefined;
    const temizle=()=>{bas=undefined;surukle.style.transform='';for(const b of alt.querySelectorAll('.simit-kap'))b.removeAttribute('data-ustunde');};
    const hedef=(x:number,y:number)=>document.elementsFromPoint(x,y).find(e=>e instanceof HTMLButtonElement&&e.classList.contains('simit-kap')) as HTMLButtonElement|undefined;
    surukle.onpointerdown=e=>{if(e.button!==0||!e.isPrimary)return;bas={x:e.clientX,y:e.clientY};surukle.setPointerCapture(e.pointerId);};
    surukle.onpointermove=e=>{
      if(!bas)return;
      const x=e.clientX-bas.x,y=e.clientY-bas.y;
      surukle.style.transform='translate('+x+'px,'+y+'px) scale(.82)';
      const sec=hedef(e.clientX,e.clientY);for(const b of alt.querySelectorAll('.simit-kap'))b.toggleAttribute('data-ustunde',b===sec);
    };
    surukle.onpointerup=e=>{if(!bas)return;const sec=hedef(e.clientX,e.clientY)?.dataset.kaplama;temizle();if(sec==='sade'||sec==='susam'||sec==='hashas')bula(sec);};
    surukle.onpointercancel=surukle.onlostpointercapture=temizle;
    surukle.onclick=e=>{if(e.detail===0)(alt.querySelector('.simit-kap') as HTMLButtonElement)?.focus();};
    for(const k of ['sade','susam','hashas'] as const){
      const b=dugme(k==='sade'?'Simidi sade bırak':kaplamaAdi[k]+'a bula','simit-kap',kaplamaResmi(k));b.dataset.kaplama=k;
      b.disabled=!!t.yarili&&k==='sade';
      b.setAttribute('aria-pressed',String(k===t.kaplama));b.onclick=()=>bula(k);alt.append(b);
    }
    const bol=dugme('Yarıları ayrı kapla','simit-kap simit-iki-yari',simitResmi('karisik'));
    bol.setAttribute('aria-pressed',String(!!t.yarili||t.kaplama==='karisik'));
    bol.onclick=()=>{
      t.yarili=!t.yarili;delete t.ilkYari;delete t.kaplama;
      ses(efekt.secim);yaz();ciz();if(t.yarili&&a.sesli())a.soyle(rehber['sol-yari']);
    };
    alt.append(bol);
    const firin=dug('Simidi fırına ver','ileri',()=>gec('firin'));firin.disabled=!t.kaplama;alt.append(firin);
  }
  function firin(){
    const ekmek=sicakSimit(t);ekmek.classList.add('simit-firinda');alan.append(ekmek);
    const meter=h('div.simit-saat',{role:'meter','aria-label':'Simidin kızarması','aria-valuemin':0,'aria-valuemax':100},h('b'));
    for(const renk of ['acik','altin','koyu'] as const){meter.append(simitSunumu(t.kaplama as Kaplama,renk,t.ilkYari));}
    const b=dug('Simidi pişirmeye başla','oyna',()=>{});
    const boya=()=>{const renk=simitRengi(t.isi);ekmek.dataset.renk=renk;meter.style.setProperty('--isi',t.isi/82+'%');meter.setAttribute('aria-valuenow',String(Math.round(t.isi/82)));meter.setAttribute('aria-valuetext',simitRenkAdi[renk]);};
    b.onclick=()=>{
      if(acik){dur();ses(efekt.cevir);gec('sun');return;}
      acik=true;b.setAttribute('aria-label','Simidi fırından çıkar');b.replaceChildren(ikon('el'));ses(efekt.cevir);
      let son=t.isi;
      saat.baslat(gecen=>{
        t.isi=Math.min(8200,t.isi+gecen);
        boya();
        if(t.isi-son>=350||t.isi===8200){yaz();son=t.isi;}
        return t.isi<8200;
      },yaz);
    };
    boya();alt.append(meter,b);
  }
  function ciz(){
    sahne.dataset.evre=t.evre;alan.replaceChildren();alt.replaceChildren();
    if(t.evre==='uzat'||t.evre==='bagla')tezgah();
    else if(t.evre==='kapla')kapla();
    else if(t.evre==='firin')firin();
    else{
      const sicak=sicakSimit(t);sicak.classList.add('simit-buyuk');alan.append(sicak);
      if(simitRengi(t.isi)==='acik')alt.append(dug('Biraz daha pişir','tekrar',()=>gec('firin')));
      alt.append(dug('Simidi tepsiye koy','onay',()=>{if(bitmis)return;bitmis=true;ses(efekt.dogru);a.teslim({...t});}));
    }
  }
  ciz();return {sahne,temizle:saat.temizle};
}
