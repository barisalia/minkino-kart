import {misafirAdi} from './restoran-karakterleri';
import { h } from '../../src/ui/dom';
import { dugme, ikon, resim } from './gorsel';
import { yildizlar } from './salata-sosu';
import type { ServisKaydi } from './kayit';
import {aniFotografi} from './sofra-fotografi';
import {menuBul,panoyaUygun,type SofraAni} from './tepsi-fisleri';
import { adlar,sisSebzeleri } from './yemekler';
import {krepMeyveAdlari} from './krep-fisi';
import {tabakMalzemesi} from './tabak-malzemesi';
import { ISIM } from './pizza-tabagi';
import adimlar from './tarif-adimlari.json';
import {tarifKaresi} from './tarif-kitabi';
import './tabak-albumu.css';

interface Ayar {
  pano?:{secili?:SofraAni;sec:(ani:SofraAni)=>void};
  anilar:readonly SofraAni[];
  gecmis:readonly ServisKaydi[];
  cizim:(tabak:ServisKaydi)=>HTMLElement;
  soyle:(metin:string)=>void;
  kapat:()=>void;
}
function yildiz(tabak:ServisKaydi){
  const puan=tabak.puan??(tabak.tarifId==='pizza'?tabak.pisirme:undefined);
  if(puan)return yildizlar(puan);
  if('ozel' in tabak&&tabak.ozel)return h('i.defter-yildizi',{'aria-label':'Özel sipariş'},ikon('yildiz'));
}
export function albumuAc(sahne:HTMLElement,ayar:Ayar){
  const kayitlar=[...ayar.gecmis].reverse();
  const kitap=h('dialog.tabak-defteri.sef-albumu',{'aria-label':'Hazırladığım tabaklar'});
  const anilar=[...ayar.anilar].reverse();
  let sayfa=-1,adim=-1,ani=-1,sofralar=!kayitlar.length&&anilar.length>0;
  function kapat(){kitap.close();ayar.kapat();}
  function geri(){
    if(ani>=0){const once=ani;ani=-1;goster();odak('[data-ani="'+once+'"]');}
    else if(adim>=0){adim=-1;goster();odak('.album-yapilis button');}
    else if(sayfa>=0){const once=sayfa;sayfa=-1;goster();odak('[data-kayit="'+once+'"]');}
    else kapat();
  }
  function odak(secici:string){kitap.querySelector<HTMLButtonElement>(secici)?.focus({preventScroll:true});}
  function buton(ad:string,stil:string,icerik:Node,bas:()=>void){
    const b=dugme(ad,stil,icerik);b.onclick=bas;return b;
  }
  function ok(yon:-1|1){
    const b=buton(yon<0?'Önceki tabak':'Sonraki tabak','dugme album-ok',ikon(yon<0?'geri':'ileri'),()=>{
      sayfa+=yon;adim=-1;goster();odak('.album-buyutec');
    });
    b.disabled=sayfa+yon<0 || sayfa+yon>=kayitlar.length;
    return b;
  }
  function resimliAdim(tabak:ServisKaydi,i:number){
    return h('img',{alt:'',src:tarifKaresi(tabak.tarifId,i),draggable:'false'});
  }
  function goster(){
    const ust=h('header.album-ust');
    const kapak=buton('Şefin albüm kapağı','album-kapak',ikon('sef'),()=>{
      if(sayfa<0&&ani<0){kapat();return;}sayfa=-1;adim=-1;ani=-1;goster();odak(sofralar?'.ani-karti':'.defter-tabagi');
    });
    ust.append(kapak);
    if(anilar.length&&kayitlar.length&&sayfa<0&&ani<0){
      const sekmeler=h('div.ani-sekmeleri',{'aria-label':'Albüm sayfaları'});
      for(const [id,ad] of [[false,'Hazırladığım tabaklar'],[true,'Müşteri sofraları']] as const){
        const b=buton(ad,'ani-sekmesi',ikon(id?'album':'kase'),()=>{sofralar=id;goster();odak('.ani-sekmesi[aria-pressed=true]');});
        b.setAttribute('aria-pressed',String(sofralar===id));sekmeler.append(b);
      }
      ust.append(sekmeler);
    }
    ust.append(buton(ani>=0?'Sofra fotoğraflarına dön':sayfa<0?'Tabak defterini kapat':adim<0?'Tabaklara dön':'Büyük tabağa dön','dugme',ikon('geri'),geri));
    kitap.replaceChildren(ust);
    kitap.dataset.gorunum=sayfa<0?'kapak':'tabak';
    if(sofralar){
      if(ani>=0){
        const yemek=anilar[ani],buyuk=h('div.ani-buyuk',{},aniFotografi(yemek,ayar.cizim));
        if(ayar.pano&&panoyaUygun(yemek)){
          const sec=ayar.pano.secili,asili=sec?.menuId===yemek.menuId&&sec.gun===yemek.gun&&sec.sira===yemek.sira;
          const pim=dugme(asili?'Restoran panosunda asılı':'Restoran panosuna as','ani-as',ikon(asili?'onay':'yildiz'));
          pim.setAttribute('aria-pressed',String(asili));pim.onclick=()=>{
            if(asili)return;
            ayar.pano!.sec(yemek);ayar.pano!.secili=yemek;goster();odak('.ani-as');
          };buyuk.append(pim);
        }
        kitap.append(buyuk);return;
      }
      const raf=h('div.ani-raflari',{'aria-label':'Müşteri sofraları'});
      anilar.forEach((a,i)=>{
        const kim=misafirAdi(a.masa.teslimAlan??menuBul(a.menuId)!.misafir);
        const kart=buton(kim+', '+a.gun+'. gün, sofra fotoğrafı','ani-karti',aniFotografi(a,ayar.cizim),()=>{ani=i;goster();odak('.album-ust .dugme');});
        kart.dataset.ani=String(i);raf.append(kart);
      });
      kitap.append(raf);return;
    }
    if(sayfa<0){
      const raf=h('div.defter-tabaklar');
      raf.style.setProperty('--sutun',String(Math.min(4,kayitlar.length)));
      kitap.dataset.az=String(kayitlar.length<=2);
      kayitlar.forEach((tabak,i)=>{
        const kart=buton(adlar[tabak.tarifId],'defter-tabagi',ayar.cizim(tabak),()=>{
          sayfa=i;adim=-1;goster();odak('.album-buyutec');ayar.soyle(adlar[tabak.tarifId]);
        });
        kart.dataset.kayit=String(i);const puan=yildiz(tabak);if(puan)kart.append(puan);
        raf.append(kart);
      });
      kitap.append(raf);return;
    }
    const tabak=kayitlar[sayfa],isim=adlar[tabak.tarifId];
    const sahifeler=h('div.album-sahifeler');
    const buyuk=h('div.album-buyuk');
    const odakli=buton(adim<0?isim+' büyütülmüş tabak':adimlar[tabak.tarifId][adim],'album-buyutec',adim<0?ayar.cizim(tabak):resimliAdim(tabak,adim),()=>{
      if(adim>=0){geri();return;}ayar.soyle(isim);
    });
    buyuk.append(odakli);
    const rozet=yildiz(tabak);if(rozet&&adim<0)buyuk.append(rozet);
    const yan=h('div.album-yapilis',{'aria-label':'Yemeğin hazırlanışı'});
    adimlar[tabak.tarifId].forEach((metin,i)=>{
      const b=buton(metin,'album-adim',resimliAdim(tabak,i),()=>{
        adim=i;goster();odak('.album-buyutec');ayar.soyle(metin);
      });
      b.setAttribute('aria-pressed',String(i===adim));yan.append(b);
    });
    if(tabak.tarifId==='pizza'){
      const malzemeler=h('div.album-secimler',{'aria-label':'Kullandığım malzemeler'});
      const parcalar=ayar.cizim(tabak);
      for(const id of new Set(tabak.ust.map(p=>p.cesit))){
        const r=parcalar.querySelector<HTMLImageElement>('[data-cesit="'+id+'"]');
        if(r)malzemeler.append(h('img',{src:r.src,alt:ISIM[id]}));
      }
      yan.append(malzemeler);
    }else if(tabak.tarifId==='corba'||tabak.tarifId==='salata'){
      const malzemeler=tabak[tabak.tarifId]?.aktarilan??[];
      if(malzemeler.length)yan.append(h('div.album-secimler',{'aria-label':'Kullandığım sebzeler'},...malzemeler.map(id=>resim(id))));
    }else if('tercih' in tabak&&tabak.tercih){
      const secim=tabak.tercih;
      const kullanilan=h('div.album-secimler',{'aria-label':'Kullandığım malzemeler'});
      if(secim.tarifId==='krep'){
        for(const v of secim.meyveler)kullanilan.append(tabakMalzemesi('krep/'+v,krepMeyveAdlari[v]));
      }else if(secim.tarifId==='sis'){
        for(const v of secim.lokmalar)kullanilan.append(tabakMalzemesi('sis/'+v+'-taze',sisSebzeleri[v]));
        kullanilan.append(tabakMalzemesi('sis/sos-'+secim.sos,({yogurt:'Yoğurt',domates:'Domates',feslegen:'Fesleğen'})[secim.sos]+' sosu'));
      }else{
        kullanilan.append(tabakMalzemesi('mucver/mucver-'+['pismis','citir','fazla'][secim.kizarma],['Altın renkli','Çıtır','Fazla kızarmış'][secim.kizarma]),
          tabakMalzemesi('mucver/'+secim.garnitur,({yogurt:'Yoğurt',dereotu:'Dereotu',limon:'Limon'})[secim.garnitur]));
      }
      yan.append(kullanilan);
    }else if(tabak.tarifId==='makarna'&&tabak.makarna){
      const sos={yesil:['pesto','Fesleğen'],kirmizi:['kirmizi-sos','Domates'],sari:['tereyagi','Tereyağı']} as const;
      const [id,ad]=sos[tabak.makarna.sos];
      yan.append(h('div.album-secimler',{'aria-label':'Kullandığım malzemeler'},tabakMalzemesi('makarna/'+id,ad)));
    }
    sahifeler.append(buyuk,yan);kitap.append(sahifeler);
    if(kayitlar.length>1)kitap.append(h('nav.album-gezinme',{},ok(-1),ok(1)));
  }
  kitap.addEventListener('cancel',e=>{e.preventDefault();geri();});
  kitap.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();geri();}
    else if(sayfa>=0&&adim<0&&['ArrowLeft','ArrowRight'].includes(e.key)){
      const yeni=sayfa+(e.key==='ArrowLeft'?-1:1);
      if(kayitlar[yeni]){e.preventDefault();sayfa=yeni;goster();odak('.album-buyutec');}
    }
  });
  goster();sahne.append(kitap);kitap.showModal();
}
