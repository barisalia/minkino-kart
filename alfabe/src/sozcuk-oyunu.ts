import { kucukGrup, tamDers } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import okumaZamanlari from './okuma-zamanlari.json';
import sepetResmi from '../../assets/sef/bahce/sepet.webp';
import tabakResmi from '../../assets/sef/ikon-atolyesi/servis/tabak.webp';
import './sozcuk-oyunu.css';

const meyveler = {
  elma: {ad:'Elma', id:'06'}, armut: {ad:'Armut', id:'01'}, muz: {ad:'Muz', id:'16'},
};
type Meyve = keyof typeof meyveler;
type Yer = 'tabak' | 'sepet';
type Konum = 'raf' | Yer;
type Gorev = { meyve: Meyve; yer: Yer; ses: string; cumle: string };
type Oku = (id:string, sonra?:()=>void, oynarken?:(saniye:number)=>void) => void;

const gorevler: Record<string, Gorev> = {
  elmaTabak: {meyve:'elma', yer:'tabak', ses:'elma-tabak', cumle:'Elmayı tabağa koy.'},
  armutSepet: {meyve:'armut', yer:'sepet', ses:'armut-sepet', cumle:'Armudu sepete koy.'},
  muzTabak: {meyve:'muz', yer:'tabak', ses:'muz-tabak', cumle:'Muzu tabağa koy.'},
  muzSepet: {meyve:'muz', yer:'sepet', ses:'muz-sepet', cumle:'Muzu sepete koy.'},
  elmaTasi: {meyve:'elma', yer:'sepet', ses:'elma-tasi', cumle:'Elmayı tabaktan sepete taşı.'},
  muzTasi: {meyve:'muz', yer:'tabak', ses:'muz-tasi', cumle:'Muzu sepetten tabağa taşı.'},
};

const rotalar = {
  elma: [gorevler.elmaTabak, gorevler.armutSepet, gorevler.muzTabak, gorevler.elmaTasi],
  muz: [gorevler.muzSepet, gorevler.elmaTabak, gorevler.armutSepet, gorevler.muzTasi],
};
const gorevSayisi=kucukGrup?2:tamDers?4:3;
type PiknikKaydi = { rota: keyof typeof rotalar; tamamlanan: number };
const kayitAnahtari = 'minkino-alfabe-piknik-v1';
const sonPiknikAnahtari = 'minkino-alfabe-son-piknik-v1';
function piknikKaydiniOku(): PiknikKaydi {
  const ham=dersKaydiniOku(kayitAnahtari);
  try {
    const kayit = JSON.parse(ham ?? 'null');
    if (kayit && (kayit.rota === 'elma' || kayit.rota === 'muz')) {
      const rota: keyof typeof rotalar = kayit.rota;
      const sayi = kayit.tamamlanan;
      if (Number.isInteger(sayi) && sayi >= 0 && sayi <= gorevSayisi) {
        return {rota, tamamlanan: sayi};
      }
    }
  } catch { /* Eski veya okunamayan kayıtta boş bir masa açılır. */ }
  const son=dersKaydiniOku(sonPiknikAnahtari);
  const rota=son==='elma'?'muz':son==='muz'?'elma':Math.random()<.5?'elma':'muz';
  return {rota,tamamlanan:0};
}

function piknikKaydet(kayit: PiknikKaydi | null) {
  dersKaydiniYaz(kayitAnahtari,kayit ? JSON.stringify(kayit) : null);
}

export function sozcukOyunuKur(alan: HTMLElement, oku: Oku, bitir: () => void) {
  const kayit = piknikKaydiniOku();
  const rota = rotalar[kayit.rota].slice(0,gorevSayisi);
  piknikKaydet(kayit);
  const konumlar: Record<Meyve, Konum> = {elma:'raf', armut:'raf', muz:'raf'};
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ekran = document.createElement('section');
  ekran.className = 'okm';
  ekran.setAttribute('aria-label','Oku ve Yerine Koy');
  ekran.innerHTML = '<div class="okm-tahta"><div class="okm-ogretmen">'+cerenYuzu()+'</div>'+
    '<div class="okm-okuma"><div class="okm-noktalar" aria-hidden="true"></div><p class="okm-cumle" aria-live="polite"></p></div>'+
    '<button class="okm-dinle" type="button" aria-label="Cümleyi Ceren’den dinle">'+IKON.hoparlor+'</button></div>'+
    '<div class="okm-masa"><div class="okm-raf" aria-label="Meyveler"></div><div class="okm-yerler"></div></div>'+
    '<div class="okm-bitis" hidden><button class="okm-bitir" type="button">Bitir '+IKON.onay+'</button></div>';
  const bul = <T extends HTMLElement>(sinif:string) => ekran.querySelector<T>(sinif)!;
  const cumle = bul<HTMLParagraphElement>('.okm-cumle'), tekrar = bul<HTMLButtonElement>('.okm-dinle');
  const raf = bul<HTMLElement>('.okm-raf'), hedefler = bul<HTMLElement>('.okm-yerler');
  const bitis = bul<HTMLElement>('.okm-bitis'), son = bul<HTMLButtonElement>('.okm-bitir');
  const noktalar = bul<HTMLElement>('.okm-noktalar');
  const meyveTuslari = new Map<Meyve,HTMLButtonElement>();
  const yerTuslari = new Map<Yer,HTMLButtonElement>();
  const yerYukleri = new Map<Yer,HTMLElement>();
  const hareketler = new Set<Animation>();
  let tur = Math.min(kayit.tamamlanan, rota.length - 1), kapali = false, kilit = false, sesSira = 0, zaman = 0, ilkIpucu = 0;
  let secili: Meyve | undefined;
  let parmak: {id:number; x:number; y:number; tus:HTMLButtonElement} | undefined;
  let iptalEdilen:HTMLButtonElement|undefined;
  const olaylar=new AbortController();
  let suruklenen: HTMLImageElement | undefined;
  const g = () => rota[tur];
  let okunan:Element|undefined;
  function kelimeyiIsaretle(yeni?:Element) {
    if(yeni===okunan)return;
    okunan?.classList.remove('okm-okunan');
    okunan=yeni;okunan?.classList.add('okm-okunan');
  }
  function konus(ids:string[], ardindan?:()=>void) {
    clearTimeout(ilkIpucu);
    const s = ++sesSira;
    function devam(i:number) {
      if (kapali || s !== sesSira) return;
      kelimeyiIsaretle();
      if(i===ids.length){ardindan?.();return;}
      const sureler=ids[i]==='oku-masa-'+g().ses?(okumaZamanlari as Record<string,number[][]>)[g().ses]:undefined;
      oku(ids[i],()=>devam(i+1),sureler?saniye=>{
        if(kapali||s!==sesSira)return;
        const no=sureler.findIndex(([bas,son])=>saniye>=bas&&saniye<son);
        kelimeyiIsaretle(cumle.children[no]);
      }:undefined);
    }
    devam(0);
  }
  function gorunum() {
    for (const [m,tus] of meyveTuslari) tus.setAttribute('aria-pressed', String(m === secili));
    ekran.dataset.secim = secili ?? '';
  }
  function oynat(el:HTMLElement, kareler:Keyframe[], sure:number) {
    if (sakin) return;
    const a = el.animate(kareler,{duration:sure,easing:'ease-out'});
    hareketler.add(a);
    void a.finished.then(()=>hareketler.delete(a),()=>hareketler.delete(a));
  }
  function cumleyiYaz() {
    cumle.replaceChildren();
    for (const [i,kelime] of g().cumle.split(' ').entries()) {
      if (i) cumle.append(' ');
      const span=document.createElement('span');
      span.textContent=kelime;
      cumle.append(span);
    }
    noktalar.innerHTML = rota.map((_,i)=>'<i class="'+(i<=tur?'okm-dolu':'')+'"></i>').join('');
    ekran.dataset.tur = String(tur+1);
    ekran.dataset.ses = g().ses;
  }
  function yanlis(tus:HTMLButtonElement, yerMi:boolean) {
    secili = yerMi ? g().meyve : undefined;
    gorunum(); oyunSesi('geri');
    const vurgula = yerMi ? cumle.children[cumle.children.length - 2] : cumle.children[0];
    cumle.querySelectorAll('.okm-vurgu').forEach(s => s.classList.remove('okm-vurgu'));
    vurgula.classList.add('okm-vurgu');
    oynat(tus,[{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'none'}],230);
    konus([yerMi?'oku-masa-yer':'oku-masa-nesne', 'oku-masa-'+g().ses]);
  }
  function meyveSec(m:Meyve) {
    if (kapali || kilit) return;
    const tus=meyveTuslari.get(m)!;
    if (m!==g().meyve) {yanlis(tus,false);return;}
    secili=m;gorunum();
    cumle.querySelectorAll('.okm-vurgu').forEach(s=>s.classList.remove('okm-vurgu'));
    oyunSesi('kagit');
    konus([meyveler[m].id+'-label','oku-masa-nereye']);
  }
  function bitirGoster() {
    kilit = true;
    ekran.dataset.tamam = 'evet';
    noktalar.querySelectorAll('i').forEach(p=>p.classList.add('okm-dolu'));
    cumle.textContent='Piknik hazır!';
    bitis.hidden=false;
    tekrar.setAttribute('aria-label','Ceren’in kapanışını dinle');
    tekrar.disabled=false;
    son.focus({preventScroll:true});
    konus(['oku-masa-son']);
  }
  function birak(y: Yer, m = secili) {
    if (kapali || kilit) return;
    const dugme=yerTuslari.get(y)!;
    if (!m) {konus(['oku-masa-al', 'oku-masa-'+g().ses]);return;}
    if (m!==g().meyve) {yanlis(meyveTuslari.get(m)!,false);return;}
    if (y!==g().yer) {yanlis(dugme,true);return;}

    kilit=true;sesSira++;kelimeyiIsaretle();cerenSustur();
    const tus=meyveTuslari.get(m)!, bas=tus.getBoundingClientRect();
    piknikKaydet({rota: kayit.rota, tamamlanan: tur + 1});
    konumlar[m]=y;secili=undefined;gorunum();
    const kaynak=yerYukleri.get(y)!;kaynak.append(tus);
    tus.dataset.yer=y;
    const hedef=tus.getBoundingClientRect();
    oynat(tus,[{transform:'translate('+(bas.x+bas.width/2-hedef.x-hedef.width/2)+'px,'+
      (bas.y+bas.height/2-hedef.y-hedef.height/2)+'px) scale('+Math.min(1.7,bas.width/hedef.width)+')'},{transform:'none'}],360);
    oyunSesi('kutu');
    const nesne = cumle.querySelector('span');
    nesne?.classList.remove('okm-vurgu');
    zaman=window.setTimeout(()=>{
      if(kapali)return;
      if(tur===rota.length-1) {bitirGoster();return;}
      tur++;kilit=false;cumleyiYaz();
      konus(['oku-masa-'+g().ses]);
      if (document.activeElement===tus || document.activeElement===dugme) tekrar.focus({preventScroll:true});
    },sakin?180:640);
  }
  function iptalParmak() {
    const bas=parmak;
    parmak=undefined;
    suruklenen?.remove();suruklenen=undefined;
    ekran.classList.remove('okm-surukleniyor');
    if(bas?.tus.hasPointerCapture(bas.id))bas.tus.releasePointerCapture(bas.id);
  }
  function vazgec(){if(parmak){iptalEdilen=parmak.tus;iptalParmak();}}
  window.addEventListener('resize',vazgec,{signal:olaylar.signal});
  document.addEventListener('pointerdown',e=>{if(!e.isPrimary)vazgec();},{capture:true,signal:olaylar.signal});
  function hedefBul(x:number,y:number):Yer|undefined {
    for (const [yer, dugme] of yerTuslari) {
      const r=dugme.getBoundingClientRect();
      if(x>=r.left && x<=r.right && y>=r.top && y<=r.bottom)return yer;
    }
  }
  for (const y of ['tabak','sepet'] as const) {
    const ad=y==='sepet'?'Sepet':'Tabak';
    const yer=document.createElement('div');yer.className='okm-yer';
    const tus=document.createElement('button');tus.type='button';tus.className='okm-hedef';
    tus.dataset.yer=y; tus.setAttribute('aria-label',y==='sepet'?'Sepete bırak':'Tabağa bırak');
    const cisim=document.createElement('div');cisim.className='okm-kap-alani';
    const kap=document.createElement('div');kap.className='okm-kap okm-kap-'+y;
    const resim=document.createElement('img');resim.alt='';resim.draggable=false;
    resim.src=y==='sepet'?sepetResmi:tabakResmi;
    const ici=document.createElement('div');ici.className='okm-ic okm-ic-'+y;
    const etiket=document.createElement('span');etiket.className='okm-yer-adi';etiket.textContent=ad;etiket.setAttribute('aria-hidden','true');
    kap.append(resim,ici);
    if(y==='sepet'){
      const on=resim.cloneNode() as HTMLImageElement;on.className='okm-sepet-on';kap.append(on);
    }
    cisim.append(kap);
    yerTuslari.set(y,tus);yerYukleri.set(y,ici);
    let yerDokunusuIptal=false;
    tus.onpointerdown=e=>{yerDokunusuIptal=!e.isPrimary;};
    tus.onclick=e=>{if(e.detail===0||!yerDokunusuIptal)birak(y);};
    yer.append(tus,cisim,etiket);hedefler.append(yer);
  }
  const masadakiMeyveler = kucukGrup ? [...new Set(rota.map(g=>g.meyve))] : Object.keys(meyveler) as Meyve[];
  for (const m of masadakiMeyveler) {
    const tus=document.createElement('button');tus.type='button';tus.className='okm-meyve';tus.dataset.meyve=m;tus.dataset.yer=konumlar[m];
    tus.setAttribute('aria-label',meyveler[m].ad);tus.setAttribute('aria-pressed','false');
    tus.innerHTML='<img src="'+resim(meyveler[m].id)+'" draggable="false" alt="">';
    const ad=document.createElement('span');
    ad.className='okm-meyve-adi';ad.textContent=meyveler[m].ad;
    tus.append(ad);
    meyveTuslari.set(m,tus);raf.append(tus);
    let surudu=false;
    tus.onclick=e=>{
      if ((surudu||iptalEdilen===tus) && e.detail!==0) {surudu=false;return;}
      if (!kapali && !kilit && secili && konumlar[m]!=='raf' && m!==secili) birak(konumlar[m] as Yer);
      else meyveSec(m);
    };
    tus.onpointerdown=e=>{
      if(!e.isPrimary){surudu=true;return;}
      if(kapali||kilit||e.button!==0||parmak)return;
      iptalEdilen=undefined;
      surudu=false;parmak={id:e.pointerId,x:e.clientX,y:e.clientY,tus};
      tus.setPointerCapture(e.pointerId);
    };
    tus.onpointermove=e=>{
      if(parmak?.id!==e.pointerId || parmak.tus!==tus)return;
      if(!suruklenen && Math.hypot(e.clientX-parmak.x,e.clientY-parmak.y)<7)return;
      if(!suruklenen) {
        surudu=true;
        ekran.classList.add('okm-surukleniyor');
        suruklenen=tus.querySelector('img')!.cloneNode() as HTMLImageElement;
        suruklenen.className='okm-surukle';suruklenen.alt='';document.body.append(suruklenen);
      }
      suruklenen.style.left=e.clientX+'px';suruklenen.style.top=e.clientY+'px';
    };
    tus.onpointerup=e=>{
      if(parmak?.id!==e.pointerId)return;
      const y=hedefBul(e.clientX,e.clientY);const tasindi=surudu;
      iptalParmak();
      if(tasindi&&y)birak(y,m);
    };
    tus.onpointercancel=tus.onlostpointercapture=e=>{if(parmak?.id===e.pointerId)vazgec();};
  }
  tekrar.onclick=()=>konus([ekran.dataset.tamam==='evet'?'oku-masa-son':'oku-masa-'+g().ses]);
  son.onclick=()=>{
    if (kapali || bitis.hidden) return;
    dersKaydiniYaz(sonPiknikAnahtari,kayit.rota);
    piknikKaydet(null);
    bitir();
  };
  // Aynı kaptaki meyveler de ilk kondukları sırayla geri gelsin.
  for (const {meyve, yer} of rota.slice(0, kayit.tamamlanan)) {
    konumlar[meyve] = yer;
    const tus = meyveTuslari.get(meyve)!;
    tus.dataset.yer = yer;
    yerYukleri.get(yer)!.append(tus);
  }
  alan.replaceChildren(ekran);cumleyiYaz();
  if (kayit.tamamlanan === rota.length) bitirGoster();
  else konus(['oku-masa-'+g().ses],()=>{
    if(kayit.tamamlanan || dersKaydiniOku(sonPiknikAnahtari))return;
    // Önce çocuk kartta gördüğü isteği duysun. İlk masada beklerse nasıl oynandığını göster.
    ilkIpucu=window.setTimeout(()=>{
      if(!kapali&&!kilit&&!parmak&&tur===0&&!document.hidden)konus(['oku-masa-giris','oku-masa-'+g().ses]);
    },5500);
  });
  return ()=>{kapali=true;sesSira++;clearTimeout(zaman);clearTimeout(ilkIpucu);olaylar.abort();iptalParmak();for(const a of hareketler)a.cancel();cerenSustur();ekran.remove();};
}
