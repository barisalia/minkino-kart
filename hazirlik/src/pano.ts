import { simge } from './cizim';
import { en,boy,palet,bosPano,resimAtolyesi,ucuBirlestir,panoGalerisi,panoyaAs,resminKopyasi,type PanoKaydi,type Arac,type Hamle,type Nokta } from './pano-resmi';
import kalem from '../../assets/hazirlik/etkinlik/kalemlik-0.webp';
import firca from '../../assets/hazirlik/etkinlik/kalemlik-1.webp';
import kova from '../../assets/giysin/ikon/kova.webp';
import masaFonu from '../../assets/hazirlik/ders-ekranlari/senlik-masa.webp';
import panoFonu from '../../assets/hazirlik/ders-ekranlari/senlik-pano.webp';
import './pano.css';

export const panoSozu=(d:PanoKaydi)=>d.durum==='inceleme'?'pano_'+d.eksik:d.durum==='kazandi'?'pano_kazandi':d.durum==='diger'?'pano_diger':'pano_basla';
const svg=(ic:string)=>'<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+ic+'</svg>';
const geri=svg('<path d="m17 12-10 9 10 8"/><path d="M9 21h18c14 0 15 16 2 16"/>');
const iz=svg('<ellipse cx="23" cy="17" rx="11" ry="13" stroke-dasharray="2 5"/><path d="m23 30-2 4h4l-2-4m0 5c-3 4 4 5 0 9"/>');
const ipucu=svg('<ellipse cx="14" cy="16" rx="8" ry="10" fill="#f46350"/><ellipse cx="34" cy="18" rx="8" ry="10" fill="#4e9ee0"/><path d="M14 27c-4 8 5 8 1 15m19-12c4 5-4 5-3 12"/>');
const kosullar=[
  svg('<ellipse cx="14" cy="22" rx="9" ry="12"/><ellipse cx="34" cy="21" rx="9" ry="12"/>'),
  svg('<path d="M15 7Q0 23 6 31c7 8 18 2 17-5 0-5-4-12-8-19Z" fill="#f46350"/><path d="M34 12Q20 29 26 36c7 8 18 2 17-5 0-5-5-14-9-19Z" fill="#4e9ee0"/>'),
  svg('<ellipse cx="24" cy="14" rx="11" ry="12" fill="#ffcc54"/><path d="m24 26-2 3h4l-2-3m0 4c-9 7 9 6 0 15"/>')
];
export const panoTahtasi=()=>ipucu;
// sınıf panosu: çerçeve ve iki asılı kâğıt
const panoIkon=svg('<rect x="5" y="8" width="38" height="30" rx="4" fill="#74dbd2"/><path d="M10 14h12v10H10zM26 17h12v10H26z" fill="#fffaf0"/><circle cx="16" cy="14" r="2" fill="#f46350"/><circle cx="32" cy="17" r="2" fill="#4e9ee0"/><path d="M15 38v4m18-4v4"/>');
const renkAdlari=['Mercan','Güneş sarısı','Yeşil','Mavi','Mor'];
const gorsel=(adres:string)=>'<img alt="" draggable="false" src="'+adres+'">';
const tus=(id:string,ad:string,ic:string,stil='')=>'<button type="button" data-pano="'+id+'" aria-label="'+ad+'" class="'+stil+'">'+ic+'</button>';
const tablo='<canvas class="pano-tuval" role="img" aria-label="Balon şenliği resmi"></canvas>';
const rehber='<svg class="pano-kilavuz" viewBox="0 0 600 400" aria-hidden="true"><g fill="none" stroke="#99aaac" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"><ellipse cx="183" cy="144" rx="62" ry="78"/><ellipse cx="401" cy="125" rx="59" ry="74"/><path d="M183 222q-18 30 0 53t-4 54m222-130q20 29 0 56t6 69"/></g></svg>';

function minonunResmi():Hamle[]{
  const hamleler:Hamle[]=[];
  for(const [x,y,rx,ry,renk] of [[202,152,65,79,1],[381,112,55,68,4]]){
    const noktalar:Nokta[]=Array.from({length:51},(_,i)=>[Math.round(x+rx*Math.cos(i*Math.PI/25)),Math.round(y+ry*Math.sin(i*Math.PI/25))]);
    hamleler.push({arac:'kalem',renk,noktalar},{arac:'kova',renk,noktalar:[[x,y]]},
      {arac:'kalem',renk,noktalar:[[x,y+ry],[x-8,y+ry+24],[x+15,y+ry+52],[x,y+ry+82]]});
  }
  return hamleler;
}
interface Baglar { konus:(ad:string)=>void; kaydet:()=>void; dokun:()=>void; eve:()=>void; deftere?:()=>void }
export function panoyuAc(masa:HTMLElement,d:PanoKaydi,is:Baglar){
  let atelier:ReturnType<typeof resimAtolyesi>,aktif:{id:number;h:Hamle}|null=null;
  // panoAcik: çizerken panoya bakılıyor; yeniAsildi: az önce asılan resim (asılma hareketi); buyuk: büyütülen resim
  let panoAcik=false,yeniAsildi=false,buyuk:number|null=null;
  masa.dataset.tur='pano';masa.classList.add('pano-atolye');
  const secici=(key:string)=>masa.querySelector<HTMLButtonElement>('[data-pano="'+key+'"]')!;
  function araclariGoster(){
    for(const b of masa.querySelectorAll<HTMLButtonElement>('[data-pano]')){
      const ad=b.dataset.pano!;
      if(['kalem','firca','kova'].includes(ad))b.setAttribute('aria-pressed',String(ad===d.arac));
      if(ad.startsWith('renk-'))b.setAttribute('aria-pressed',String(Number(ad.slice(5))===d.renk));
    }
    secici('geri').disabled=!d.hamleler.length;
    secici('rehber').setAttribute('aria-pressed',String(d.rehber));
    masa.dataset.rehber=String(d.rehber);
  }
  function degistir(durum:PanoKaydi['durum']){
    d.durum=durum;is.kaydet();goster();is.konus(panoSozu(d));
  }
  function cizimiBagla(c:HTMLCanvasElement){
    const nokta=(e:PointerEvent):Nokta=>{
      const r=c.getBoundingClientRect();
      return [Math.max(0,Math.min(en-1,Math.round((e.clientX-r.left)*en/r.width))),Math.max(0,Math.min(boy-1,Math.round((e.clientY-r.top)*boy/r.height)))];
    };
    const al=(e:PointerEvent)=>{
      if(!aktif||aktif.id!==e.pointerId)return;
      const pts=aktif.h.noktalar,p=nokta(e),son=pts[pts.length-1];
      if(Math.hypot(son[0]-p[0],son[1]-p[1])>=2){
        if(pts.length>=595)aktif.h.noktalar=pts.filter((_,i)=>!(i%2));
        aktif.h.noktalar.push(p);
      }
    };
    c.onpointerdown=e=>{
      if(aktif||e.button!==0)return;e.preventDefault();is.dokun();
      if(d.hamleler.length>=180){is.konus('pano_dolu');return}
      const h:Hamle={arac:d.arac,renk:d.renk,noktalar:[nokta(e)]};
      aktif={id:e.pointerId,h};c.setPointerCapture(e.pointerId);if(h.arac!=='kova')atelier.goster(h);
    };
    c.onpointermove=e=>{
      if(!aktif||aktif.id!==e.pointerId||aktif.h.arac==='kova')return;
      for(const p of e.getCoalescedEvents?.()??[])al(p);
      al(e);atelier.goster(aktif.h);
    };
    c.onpointerup=e=>{
      if(!aktif||aktif.id!==e.pointerId)return;
      const h=aktif.h;if(h.arac!=='kova')al(e);aktif=null;
      ucuBirlestir(h,d.hamleler);
      if(atelier.uygula(h)){d.hamleler.push(h);is.kaydet()}else is.konus('pano_acik');
      atelier.goster();araclariGoster();
    };
    c.onpointercancel=c.onlostpointercapture=e=>{if(aktif?.id===e.pointerId){aktif=null;atelier.goster()}};
  }
  function goster(){
    const galeri=panoGalerisi(),duvar=(d.durum==='kazandi'||panoAcik)&&galeri.length>0;
    const pano=d.durum==='kazandi'||d.durum==='diger'||duvar,cizim=d.durum==='cizim'&&!duvar;
    if(buyuk!==null&&!galeri[buyuk])buyuk=null;
    masa.dataset.durum=d.durum;masa.style.backgroundImage='url("'+(pano?panoFonu:masaFonu)+'")';
    const araclar=tus('kalem','Çizgi kalemi',gorsel(kalem))+tus('firca','Boya fırçası',gorsel(firca))+tus('kova','İçini doldur',gorsel(kova));
    const renkler=palet.map((r,i)=>tus('renk-'+i,renkAdlari[i]+' boya','<i style="background:'+r+'"></i>','pano-renk')).join('');
    const sira=d.eksik==='sekil'?0:d.eksik==='ip'?2:1;
    const kontrol=d.durum==='inceleme'?'<div class="pano-inceleme" role="img" aria-label="Öğretmenin gösterdiği eksik adım">'+kosullar.map((ikon,i)=>'<span class="'+(i===sira?'bak':i<sira?'tam':'')+'">'+ikon+'</span>').join('')+'</div>':'';
    const sonuc=panoAcik&&duvar?tus('ciz','Çizimime dön',gorsel(kalem))+tus('ev','Ana menüye dön',simge('ev')):d.durum==='inceleme'?tus('onar','Çizimime dön',gorsel(kalem))+tus('gec','Bu haliyle bitir, panoyu gör',simge('ileri')):
      (is.deftere?tus('defter','Ders defterime dön',geri):'')+tus('yenile',d.durum==='diger'?'Resmimi tamamla':'Yeni resim çiz',d.durum==='diger'?gorsel(kalem):simge('yenile'))+tus('ev','Ana menüye dön',simge('ev'));
    masa.dataset.duvar=String(duvar);
    const asili=(r:{resim:string},i:number)=>tus('resim-'+i,i===buyuk?'Panoya geri as':'Asılı resim '+(i+1)+', büyüt','<img alt="" draggable="false" src="'+r.resim+'"><i class="pano-raptiye"></i>','pano-asili'+(i===0&&yeniAsildi?' yeni':'')+(i===buyuk?' tek':''));
    const sutun=galeri.length<2?1:galeri.length<5?2:3,satir=Math.ceil(galeri.length/sutun);
    const alan=duvar?'<div class="pano-calisma"><div class="pano-duvar" style="--s:'+(buyuk===null?sutun:1)+';--r:'+(buyuk===null?satir:1)+'">'+(buyuk===null?galeri.map(asili).join(''):asili(galeri[buyuk],buyuk))+'</div></div>':
      '<div class="pano-calisma"><div class="pano-kagit">'+tablo+(cizim?rehber:'')+(pano?'<i class="pano-raptiye"></i>':'')+'</div></div>';
    const panoTusu=galeri.length?tus('pano','Sınıf panosunu gör',panoIkon+'<b class="pano-sayi">'+galeri.length+'</b>'):'';
    masa.innerHTML=alan+
      (cizim?'<div class="pano-araclar"><div class="pano-alet">'+araclar+tus('geri','Son işlemi geri al',geri)+tus('rehber','Noktalı çizim yardımını aç veya kapat',iz)+panoTusu+'</div><div class="pano-palet">'+renkler+tus('goster','Resmi Ceren Öğretmene göster',simge('ileri'),'pano-teslim')+'</div></div>':
      '<div class="pano-panel">'+kontrol+'<div class="pano-son">'+(d.durum==='inceleme'?tus('dinle','Öğretmenin önerisini tekrar dinle',simge('ses')):'')+sonuc+'</div></div>');
    yeniAsildi=false;
    // en büyük kâğıdı veren sütun sayısı (yatay telefonda 3×2, tablette 2×3 gibi)
    const duvarEl=masa.querySelector<HTMLElement>('.pano-duvar');
    if(duvarEl&&buyuk===null){
      const W=duvarEl.clientWidth,H=duvarEl.clientHeight,n=galeri.length;let eniyi=0;
      for(let s=1;s<=n;s++){const r=Math.ceil(n/s),g=Math.min(W/s-W*.02,(H/r-H*.03)*1.5);if(g>eniyi*1.04){eniyi=g;duvarEl.style.setProperty('--s',String(s));duvarEl.style.setProperty('--r',String(r))}}
    }
    const c=masa.querySelector('canvas');if(!c)return;
    atelier=resimAtolyesi(c);atelier.yukle(d.durum==='diger'?minonunResmi():d.hamleler);
    if(cizim){araclariGoster();cizimiBagla(c)}
  }
  let basilan:HTMLButtonElement|null=null,baslangic:Nokta=[0,0];
  const sec=(ev:Event)=>(ev.target as Element).closest<HTMLButtonElement>('[data-pano]');
  masa.onpointerdown=ev=>{basilan=sec(ev);baslangic=[ev.clientX,ev.clientY]};
  masa.onpointercancel=()=>{basilan=null};
  masa.onpointerup=ev=>{
    if(ev.pointerType==='mouse')return;
    const b=sec(ev),ayni=b===basilan;basilan=null;
    if(b&&ayni&&Math.hypot(ev.clientX-baslangic[0],ev.clientY-baslangic[1])<18)uygula(b);
  };
  masa.onclick=ev=>{
    const b=sec(ev),ayni=b===basilan;basilan=null;
    if(b&&(!ev.detail||ayni))uygula(b);
  };
  function uygula(b:HTMLButtonElement){
    if(b.disabled||aktif)return;
    is.dokun();const id=b.dataset.pano!;
    if(id==='ev'){is.eve();return}
    if(id==='pano'){panoAcik=true;buyuk=null;goster();return}
    if(id==='ciz'){panoAcik=false;buyuk=null;goster();return}
    if(id.startsWith('resim-')){const i=Number(id.slice(6));buyuk=buyuk===i?null:i;goster();return}
    if(id==='defter'){is.deftere?.();return}
    if(id==='onar'||id==='yenile'){
      if(d.durum==='kazandi')Object.assign(d,bosPano());
      d.durum='cizim';panoAcik=false;buyuk=null;is.kaydet();goster();is.konus(id==='onar'?'pano_'+d.eksik:'pano_basla');return;
    }
    if(id==='gec'){degistir('diger');return}
    if(id==='dinle'){is.konus(panoSozu(d));return}
    if(id==='goster'){
      const eksik=atelier.degerlendir();if(eksik)d.eksik=eksik;
      else{panoyaAs(resminKopyasi(masa.querySelector('canvas')!));yeniAsildi=true;buyuk=null}
      degistir(eksik?'inceleme':'kazandi');return;
    }
    if(id==='geri'){d.hamleler.pop();atelier.yukle(d.hamleler)}
    else if(id==='rehber'){d.rehber=!d.rehber;if(d.rehber)is.konus('pano_ciz')}
    else if(id.startsWith('renk-')){d.renk=Number(id.slice(5));if(d.arac==='kalem')d.arac='firca'}
    else {d.arac=id as Arac;if(id==='kova')is.konus('pano_boya')}
    is.kaydet();araclariGoster();
  }
  goster();
}
