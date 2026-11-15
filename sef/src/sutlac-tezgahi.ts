import {h} from '../../src/ui/dom';
import {efekt} from '../../src/audio/efekt';
import {sus} from '../../src/audio/konusma';
import {dugme,ikon} from './gorsel';
import {icinde,jest,sahnedenAyrilinca,type Nokta} from './hareket';
import {bardagaDokmeSesi,karistirmaSesi,tezgahiSustur} from './mutfak-ses';
import {tatliAdiminiDinle} from './tatli-rehber';
import {slResim,sutlacKasesi,sutlacIstegiRozeti} from './sutlac-gorseli';
import {sutlacDesenAdi,sutlacDesenleri,sutlacKivami,sutlacOrnegi,sutlacTaslaginiOku,type SutlacTaslagi,type SutlacPorsiyonu,type SutlacDeseni} from './sutlac-tarifi';
import {arkaPlanDinle} from '../../src/kabuk/yon';

const rehberler=['sutlac-sut','sutlac-karistir','sutlac-dok','sutlac-tarcin','sun'] as const;
interface Ayar {taslak?:SutlacTaslagi;istek?:SutlacDeseni;sesli:()=>boolean;kaydet:(t:SutlacTaslagi)=>void;teslim:(p:SutlacPorsiyonu)=>void;geri:()=>void}
export function sutlacTezgahi(a:Ayar){
  const t=sutlacTaslaginiOku(a.taslak);
  const sahne=h('section.tatli-tezgahi.sl-tezgah',{'aria-label':'Tarçınlı Sütlaç','data-tatli':'sutlac'}),alan=h('div.sl-calisma');
  const geri=dugme(a.istek?'Tepsiye dön':'Pastaneye dön','sl-geri',ikon('geri'));
  const fis=h('div.sl-fis',{},sutlacKasesi(sutlacOrnegi(a.istek)),...(a.istek?[sutlacIstegiRozeti(a.istek)]:[]));
  const dinle=dugme('Bu adımı dinle','sl-dinle',ikon('hoparlor'));
  const adimlar=h('div.sl-adimlar',{'aria-label':'Tarif adımları'});
  dinle.hidden=!a.sesli();dinle.onclick=()=>{if(a.sesli())void tatliAdiminiDinle(rehberler[t.adim]);};
  const yaz=()=>a.kaydet({...t});
  const cal=(fn:()=>void)=>{if(a.sesli()&&!document.hidden)fn();};
  let ara=()=>{},saatiSifirla=()=>{},bitti=false,arkada=false;
  const arkayiBirak=arkaPlanDinle(v=>{arkada=v;saatiSifirla();if(v)yaz();});
  const gorunurluk=()=>{saatiSifirla();if(document.hidden)yaz();};
  document.addEventListener('visibilitychange',gorunurluk);
  // Both standalone pâtisserie and restaurant may remove this station using the shell back button.
  let izlemeyiBirak=()=>{};
  function temizle(){if(bitti)return;bitti=true;ara();arkayiBirak();izlemeyiBirak();document.removeEventListener('visibilitychange',gorunurluk);tezgahiSustur();}
  geri.onclick=()=>{yaz();temizle();sus();a.geri();};
  sahne.append(alan,geri,fis,dinle,adimlar);
  function sonraki(){if(t.adim===4)return;t.adim=(t.adim+1) as SutlacTaslagi['adim'];yaz();ciz();}
  function ileri(ad:string,fn:()=>void){const b=dugme(ad,'sl-ileri',ikon('ileri'));jest(b,{birak:(_,__,tik)=>{if(tik)fn();},klavye:fn});alan.append(b);return b;}
  function tencere(sut:number,pirinc:boolean,kivam?:SutlacPorsiyonu['kivam']){
    const dis=h('span.sl-tencere',{},slResim('tencere','sl-tencere-dis'));
    if(sut>0){
      if(kivam&&sut>=.999)dis.append(slResim('tencere-'+kivam,'sl-dolu-tencere'));
      else{
        const ic=h('span.sl-tencere-ici'),yuzey=h('span.sl-tencere-sivisi');
        // The inside rim of the 720 x 497 pot is x=110..602, y=23..328.
        // As the depth decreases, the far edge falls while the front wall hides the lower ellipse.
        yuzey.style.top=(14+37*(1-sut))+'%';
        yuzey.style.width=(91+11*sut)+'%';
        if(kivam)yuzey.append(slResim(kivam==='ipeksi'?'sutlac':kivam,'sl-karisim-yuzeyi'));
        else yuzey.classList.add('sl-sade-sut');
        ic.append(yuzey);dis.append(ic);
      }
    }
    if(pirinc&&!kivam){
      const pir=slResim('pirinc-taneleri','sl-islak-pirinc');
      pir.style.top=(42-12*sut)+'%';dis.append(pir);
    }
    return dis;
  }
  function baslangic(){
    const kap=h('div.sl-ana-tencere',{},tencere(t.sut,t.pirinc));
    const surahi=dugme('Sütü tencereye dök','sl-surahi',slResim('sut'),h('span.sl-surahi-agzi',{'aria-hidden':true}));
    const pir=dugme('Pişmiş pirinci tencereye ekle','sl-pirinc',slResim('pirinc'));
    const akim=h('i.sl-sut-akimi',{'aria-hidden':true});akim.hidden=true;
    alan.append(kap,surahi,pir,akim);
    surahi.disabled=t.sut>=.98;pir.disabled=t.pirinc;
    const goster=()=>{
      kap.replaceChildren(tencere(t.sut,t.pirinc));surahi.disabled=t.sut>=.98;pir.disabled=t.pirinc;
      sonrasi.disabled=t.sut<.98||!t.pirinc;
    };
    const sonrasi=ileri('Sütlacı pişirmeye geç',sonraki);
    let aralik=0,bas=0,suruklendi=false,dokuyor=false,giris=0;
    function dur(){clearInterval(aralik);aralik=0;dokuyor=false;akim.hidden=true;surahi.style.transform='';surahi.classList.remove('sl-dokuyor');yaz();}
    function doldur(oran:number){t.sut=Math.min(1,t.sut+oran);goster();if(t.sut>=.98){t.sut=1;dur();goster();}}
    function akit(){
      if(dokuyor||t.sut>=.98)return;
      dokuyor=true;akim.hidden=false;surahi.classList.add('sl-dokuyor');
      surahi.style.transform='none';
      const s=surahi.getBoundingClientRect(),p=kap.getBoundingClientRect(),zemin=alan.getBoundingClientRect();
      const x=p.x+p.width*.54,y=p.y-p.height*.10;
      // The milk jug's spout faces left. Rotate about its physical tip.
      surahi.style.transformOrigin='1.5% 19%';
      surahi.style.transform='translate('+(x-s.x-s.width*.015)+'px,'+(y-s.y-s.height*.19)+'px) rotate(-57deg)';
      const uc=surahi.querySelector('.sl-surahi-agzi')!.getBoundingClientRect();
      akim.style.left=(uc.x-zemin.x)+'px';akim.style.top=(uc.y-zemin.y)+'px';
      akim.style.height=(p.y+p.height*.44-uc.y)+'px';
      giris=performance.now();cal(()=>bardagaDokmeSesi(false));
      aralik=window.setInterval(()=>{
        if(arkada||document.hidden||!sahne.isConnected){dur();return;}
        const simdi=performance.now(),delta=Math.min(80,simdi-giris);giris=simdi;doldur(delta/1050);
      },40);
    }
    const baslat=()=>{bas=performance.now();suruklendi=false;};
    const tasi=(n:Nokta,ilk:Nokta)=>{
      if(Math.hypot(n.x-ilk.x,n.y-ilk.y)<5)return;suruklendi=true;
      if(icinde(kap,n,8)){akit();return;}
      if(dokuyor)dur();surahi.style.transform='translate('+(n.x-ilk.x)+'px,'+(n.y-ilk.y)+'px)';
    };
    const klavye=()=>{cal(()=>bardagaDokmeSesi(true));doldur(.34);yaz();};
    jest(surahi,{basla:baslat,tasi,birak:(n,_,tik)=>{if(tik&&!suruklendi&&performance.now()-bas<850)klavye();else if(!dokuyor&&icinde(kap,n))klavye();dur();},iptal:dur,klavye});
    const ekle=()=>{if(t.pirinc)return;t.pirinc=true;cal(efekt.pof);yaz();goster();};
    jest(pir,{tasi:(n,ilk)=>{pir.style.transform='translate('+(n.x-ilk.x)+'px,'+(n.y-ilk.y)+'px) rotate(-22deg)';},birak:(n,_,tik)=>{pir.style.transform='';if(tik||icinde(kap,n,8))ekle();},iptal:()=>{pir.style.transform='';},klavye:ekle});
    ara=()=>{clearInterval(aralik);};goster();
  }
  function pisir(){
    const pot=dugme('Sütlacı kaşıkla karıştır','sl-karistir',tencere(1,true,sutlacKivami(t)));
    const kasik=h('img.sl-karistirma-kasigi',{src:new URL('../../assets/sef/nesneler/kasik.webp',import.meta.url).href,alt:'',draggable:false});
    const yay=h('i.sl-donus',{},ikon('karistir'));pot.append(kasik,yay);alan.append(slResim('ocak','sl-portatif-ocak'),pot);
    const isi=h('div.sl-kivamlar',{role:'group','aria-label':'Tenceredeki kıvam'});
    for(const k of ['sulu','ipeksi','koyu'] as const){const ornek=h('span',{'data-kivam':k},slResim(k==='ipeksi'?'sutlac':k));if(k==='ipeksi')ornek.append(h('i',{},ikon('yildiz')));isi.append(ornek);}
    alan.append(isi);
    const kapat=ileri('Ateşi kapat ve kâseye geç',sonraki);
    let onceki='',enSon=0,kare=0,sesAni=0,sonKayit=0;
    saatiSifirla=()=>{enSon=0;};
    function boya(){
      const kivam=sutlacKivami(t);
      if(onceki!==kivam){pot.firstElementChild!.replaceWith(tencere(1,true,kivam));onceki=kivam;for(const k of isi.children)k.setAttribute('data-secili',String((k as HTMLElement).dataset.kivam===kivam));}
      kapat.disabled=t.isi<.14||t.karistirma<.12;pot.dataset.kivam=kivam;
    }
    const dongu=(simdi:number)=>{
      if(!sahne.isConnected||bitti)return;
      if(!arkada&&!document.hidden&&enSon)t.isi=Math.min(1,t.isi+Math.min(180,simdi-enSon)/19000);
      enSon=simdi;boya();
      if(simdi-sonKayit>=650){sonKayit=simdi;yaz();}
      if(t.isi<1)kare=requestAnimationFrame(dongu);
    };
    let once:Nokta|undefined;
    function cevir(n:Nokta){
      const r=pot.getBoundingClientRect();const x=(n.x-r.x)/r.width,y=(n.y-r.y)/r.height;
      if(Math.hypot((x-.5)/.38,(y-.40)/.32)>1){once=undefined;return;}
      kasik.style.left=x*100+'%';kasik.style.top=y*100+'%';
      if(once){
        const yol=Math.hypot(x-once.x,y-once.y);
        t.karistirma=Math.min(1,t.karistirma+Math.min(yol,.13)/2.35);
        if(yol>.02&&performance.now()-sesAni>320){sesAni=performance.now();cal(()=>karistirmaSesi(false));}
      }
      once={x,y};boya();
    }
    jest(pot,{basla:n=>{once=undefined;cevir(n);},tasi:cevir,birak:()=>{once=undefined;yaz();},iptal:()=>{once=undefined;},klavye:()=>{t.karistirma=Math.min(1,t.karistirma+.2);cal(()=>karistirmaSesi(false));boya();yaz();}});
    boya();kare=requestAnimationFrame(dongu);ara=()=>{cancelAnimationFrame(kare);};
  }
  function kaseDoldur(){
    const kivam=sutlacKivami(t),kalan=()=>Math.max(0,1-t.doluluk-(t.kepcede ? .25 : 0));
    const pot=h('div.sl-kepce-pot',{},tencere(kalan(),true,kivam));
    const hedef=dugme('Kepçedeki sütlacı kâseye dök','sl-hedef-kase',sutlacKasesi({kivam,doluluk:t.doluluk}));
    const kepce=dugme('Kepçeyi tencereden doldur','sl-kepce',h('img',{src:new URL('../../assets/sef/nesneler/kepce.webp',import.meta.url).href,alt:''}),slResim(kivam==='ipeksi'?'sutlac':kivam,'sl-kepce-yuku'));
    alan.append(pot,hedef,kepce);
    const tamam=ileri('Tarçın kalıbını seçmeye geç',sonraki);
    const yenile=()=>{hedef.replaceChildren(sutlacKasesi({kivam,doluluk:t.doluluk}));pot.replaceChildren(tencere(kalan(),true,kivam));pot.dataset.kalan=String(kalan());kepce.dataset.dolu=String(!!t.kepcede);kepce.disabled=t.doluluk>=1;hedef.disabled=!t.kepcede;tamam.disabled=t.doluluk<.35;};
    const al=()=>{if(t.doluluk>=1||t.kepcede)return;t.kepcede=true;cal(efekt.dalga);yenile();yaz();};
    const aktar=()=>{if(!t.kepcede||t.doluluk>=1)return;t.kepcede=false;t.doluluk=Math.min(1,t.doluluk+.25);cal(()=>bardagaDokmeSesi(true));yenile();yaz();};
    jest(kepce,{basla:al,tasi:(n,ilk)=>{kepce.style.transform='translate('+(n.x-ilk.x)+'px,'+(n.y-ilk.y)+'px) rotate('+(icinde(hedef,n)?-28:0)+'deg)';},birak:(n,_,tik)=>{kepce.style.transform='';if(!tik&&icinde(hedef,n,10))aktar();},iptal:()=>{kepce.style.transform='';},klavye:al});
    hedef.onclick=aktar;yenile();
  }
  function tarcin(){
    const k=sutlacKivami(t),calisma=h('div.sl-kalip-alani'),raf=h('div.sl-kalip-rafi',{role:'group','aria-label':'Tarçın kalıpları'});
    const kase=sutlacKasesi({kivam:k,doluluk:t.doluluk,desen:t.desen,toz:t.toz});calisma.append(kase);alan.append(calisma,raf);
    const tamam=ileri('Kalıbı kaldır',sonraki);tamam.disabled=t.toz<.18;
    for(const d of sutlacDesenleri){
      const b=dugme(sutlacDesenAdi[d]+' kalıbı','sl-kalip-sec',slResim('kalip-'+d));b.setAttribute('aria-pressed',String(t.desen===d));
      const sec=()=>{if(t.desen===d)return;t.desen=d;t.toz=0;yaz();ciz();};
      jest(b,{birak:(_,__,tik)=>{if(tik)sec();},klavye:sec});raf.append(b);
    }
    if(!t.desen)return;
    const kalip=slResim('kalip-'+t.desen,'sl-kalip-ust');
    kalip.style.width=(kase.querySelector<HTMLElement>('.sl-ic')?.style.width??'88%');
    kalip.style.top=(24-17*t.doluluk)+'%';calisma.append(kalip);
    const elek=dugme('Eleği kâsenin üzerinde sağa sola salla','sl-elek',slResim('elek'));
    calisma.append(elek);
    let once:Nokta|undefined,sesAni=0;
    function serp(m:number){
      t.toz=Math.min(1,t.toz+m);
      kase.replaceChildren(...Array.from(sutlacKasesi({kivam:k,doluluk:t.doluluk,desen:t.desen,toz:t.toz}).children));
      tamam.disabled=t.toz<.18;elek.dataset.tamam=String(t.toz===1);
      if(performance.now()-sesAni>220){sesAni=performance.now();cal(efekt.ovala);}
    }
    const hareket=(n:Nokta,ilk:Nokta)=>{
      const p=calisma.getBoundingClientRect(),x=(n.x-p.x)/p.width,y=(n.y-p.y)/p.height;
      elek.style.transform='translate('+(n.x-ilk.x)+'px,'+(n.y-ilk.y)+'px)';
      if(x<.12||x>.94||y<-.08||y>.68){once=undefined;return;}
      if(once)serp(Math.min(.13,Math.abs(x-once.x))*.65);
      once={x,y};
    };
    jest(elek,{basla:()=>{once=undefined;},tasi:hareket,birak:(_,__,tik)=>{elek.style.transform='';once=undefined;if(tik)serp(.14);yaz();},iptal:()=>{elek.style.transform='';once=undefined;yaz();},klavye:()=>{serp(.2);yaz();}});
  }
  function porsiyon():SutlacPorsiyonu{return {desen:t.desen!,toz:t.toz,kivam:sutlacKivami(t),doluluk:t.doluluk};}
  function ciz(){
    ara();ara=()=>{};saatiSifirla=()=>{};sahne.dataset.adim=String(t.adim);alan.replaceChildren();
    adimlar.replaceChildren(...[0,1,2,3].map(i=>h('i',{'data-bitti':String(i<=t.adim)})));
    if(t.adim===0)baslangic();
    if(t.adim===1)pisir();
    if(t.adim===2)kaseDoldur();
    if(t.adim===3)tarcin();
    if(t.adim===4){
      const tabak=dugme(a.istek?'Tatlıyı tepsiye koy':'Vitrine koy','sl-sun',sutlacKasesi(porsiyon()),h('i',{},ikon('servis'),ikon('onay')));
      const sun=()=>{if(bitti)return;temizle();sus();a.teslim(porsiyon());};
      jest(tabak,{birak:(_,__,tik)=>{if(tik)sun();},klavye:sun});alan.append(tabak);
      const duzelt=dugme('Tarçın desenini değiştir','sl-duzelt',ikon('tekrar'));duzelt.onclick=()=>{t.adim=3;yaz();ciz();};alan.append(duzelt);
    }
  }
  ciz();
  requestAnimationFrame(()=>{if(!bitti&&sahne.isConnected)izlemeyiBirak=sahnedenAyrilinca(sahne,temizle);else temizle();});
  return sahne;
}

