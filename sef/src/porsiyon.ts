import { h } from '../../src/ui/dom';
import { dugme, ikon, resim } from './gorsel';
import { hareket, icinde, jest, type Nokta } from './hareket';
import type { Porsiyon } from './kayit';
import type { Siparis } from './tarif';
import { salataKasesi,corbaKasesi,corbaRengi } from './kap-ici';

function alet(s: Siparis, dolu: boolean,alinan:number) {
  const id=s.tarifId;
  const el = h('span.porsiyon-aleti', { 'data-alet': id }, resim(id === 'corba' ? 'kepce' : 'masa', 'alet-cizimi'));
  if (dolu) {
    if(id==='corba'){
      const sivi=h('span.alet-icindeki.kepce-corba');sivi.style.backgroundColor=corbaRengi(s);
      const id=s.aktarilan.find(sebze=>!s.ezilen.includes(sebze));
      if(id)sivi.append(resim(id+(id==='marul'?'-parca':'-dilim')));
      el.append(sivi);
    }else{
      const lokmalar=h('span.alet-icindeki.masa-lokmalari');
      // İkinci maşada kabın öteki yanından alınan sebze önde görünür.
      const secim=s.aktarilan.slice(alinan).concat(s.aktarilan.slice(0,alinan));
      for(const m of secim){
        const yuz=resim(m+(m==='marul'?'-parca':'-dilim'));yuz.dataset.malzeme=m;lokmalar.append(yuz);
      }
      el.append(lokmalar);
    }
    if (id === 'salata') el.append(resim('masa', 'masa-on'));
  }
  return el;
}
function kucukKase(s: Siparis, adet: number) {
  const id=s.tarifId;
  const el = h('span.porsiyon-kasesi', { 'data-yemek': id, 'data-doluluk': String(adet) });
  if(adet){el.append(id==='corba'?corbaKasesi(s,adet):salataKasesi(s,adet));return el;}
  el.append(resim(id + '-kasesi', 'porsiyon-kap-cizimi'));
  return el;
}
export interface PorsiyonIsleri {
  yukle: () => void;
  aktar: () => void;
  yonlendir: () => void;
}
export function porsiyonTezgahi(
  sahne: HTMLElement, kap: HTMLElement, s: Siparis, p: Porsiyon, is: PorsiyonIsleri,
) {
  const tarif=s.tarifId;
  const hedef = dugme('Küçük kâseye bırak', 'porsiyon-hedef', kucukKase(s, p.adet));
  hedef.dataset.porsiyonBirak = '';
  sahne.append(hedef);
  const cikanPorsiyon=(elde:boolean)=>{sahne.dataset.kaptanAlinan=String(Math.min(2,p.adet+Number(elde)));};
  cikanPorsiyon(p.yuklu);
  if (p.adet >= 2) { hedef.disabled = true; return; }
  const kepce = alet(s, p.yuklu,p.adet);
  const kaynak = dugme(tarif === 'corba' ? 'Kepçeyle çorba al' : 'Maşayla salata al', 'porsiyon-kaynak', kepce);
  kaynak.dataset.porsiyonAl = '';
  if (p.yuklu) {
    hedef.classList.add('bekleyen');
    hedef.append(h('span.porsiyon-ok', { 'aria-hidden': 'true' }, ikon('asagi')));
  }
  kap.append(kaynak);
  function hedefeDokun() {
    if (p.yuklu) is.aktar();
    else {
      is.yonlendir();
      void hareket(kepce, [{ rotate: '0deg' }, { rotate: '-11deg' }, { rotate: '0deg' }], 380);
    }
  }
  jest(hedef, { birak: (_yer, _ilk, tik) => { if (tik) hedefeDokun(); }, klavye: hedefeDokun });
  let elde: HTMLElement | undefined;
  function eldeGoster(yer: Nokta) {
    if (!elde) {
      elde = alet(s, true,p.adet);
      elde.classList.add('elde-alet');
      const r = kepce.getBoundingClientRect();
      elde.style.width = r.width + 'px';
      elde.style.height = r.height + 'px';
      document.body.append(elde);
      kaynak.classList.add('havada');
      cikanPorsiyon(true);
    }
    elde.style.left = yer.x + 'px';
    elde.style.top = yer.y + 'px';
    hedef.classList.toggle('yaklas', icinde(hedef, yer, 14));
  }
  function temizle() {
    elde?.remove(); elde = undefined;
    hedef.classList.remove('yaklas');
    kaynak.classList.remove('havada');
    cikanPorsiyon(p.yuklu);
  }
  function yukle() {
    if (!p.yuklu) is.yukle();
    else {
      void hareket(hedef, [{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], 320);
      is.yonlendir();
    }
  }
  jest(kaynak, {
    tasi: (yer, ilk) => {
      if (Math.hypot(yer.x - ilk.x, yer.y - ilk.y) > 6) eldeGoster(yer);
    },
    birak: (yer, _ilk, tik) => {
      temizle();
      if (tik) yukle();
      else if (icinde(hedef, yer, 14)) is.aktar();
    },
    klavye: yukle, iptal: temizle,
  });
}
