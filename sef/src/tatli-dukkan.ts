import {sutlacKasesi,sutlacSrc} from './sutlac-gorseli';
import type {SutlacPorsiyonu} from './sutlac-tarifi';
import {minikKek,type KekPorsiyonu} from './minik-kek';
import {kurabiyeDizisi,type KurabiyeTepsisi} from './kurabiye-tepsisi';
import { h } from '../../src/ui/dom';
import {meyveliTartGorseli,type TartDilimi} from './tart-tarifi';
import { ikon } from './gorsel';
import { tatliResmi } from './tatli-gorsel';
import { tatliKademeler, tatliMi, type KurabiyeSekli,type DondurmaTadi } from './tatli-ekonomi';
import './tatli-dukkan.css';

type TatliId = Parameters<typeof tatliResmi>[0];

export function jetonSimge() {
  return h('span.tatli-jeton', {'aria-hidden': true}, ikon('yildiz'));
}

const kase = new URL('../../assets/sef/krep/karisim-kasesi.webp', import.meta.url).href;
const cirpici = new URL('../../assets/sef/krep/cirpici.webp', import.meta.url).href;
const aletler: Record<TatliId,string> = {
  sutlac:sutlacSrc('elek'),
  kurabiye:new URL('../../assets/sef/firin/merdane.webp',import.meta.url).href,
  dondurma:new URL('../../assets/sef/dondurma-tezgahi/kepce.webp',import.meta.url).href,
  'minik-kek':new URL('../../assets/sef/tatli/krema-torbasi.webp',import.meta.url).href,
  'meyveli-tart':new URL('../../assets/sef/krep/spatula-yan.webp',import.meta.url).href,
};

export function tatliDukkan(bakiye: number, seviye: number, al: () => void, geri: () => void, pisir?: (id: TatliId) => void, stok:Partial<Record<TatliId,number>>={},sonKurabiye?:KurabiyeSekli,sonTart?:TartDilimi[],kurabiye?:KurabiyeTepsisi,kek?:KekPorsiyonu,sonDondurma?:DondurmaTadi,sonTartKavruk=false,sonSutlac?:SutlacPorsiyonu): HTMLElement {
  const sahne = h('section.tatli-dukkan', {'aria-label': 'Tatlı Atölyesi','data-pastane':seviye<0?'kapali':'acik'});
  const raf = h('div.tatli-raf');
  const baslik = h('header.tatli-vitrin-ust', {},
    h('button.tatli-geri', {type:'button','aria-label':'Mutfağa dön',onclick:geri}, ikon('geri')),
    h('h2', {}, 'Tatlı Atölyesi'),
    h('span.tatli-cuzdan', {'aria-label': bakiye+' jeton',role:'status'}, jetonSimge(), String(bakiye)));
  for (const [i, kademe] of tatliKademeler.entries()) {
    if (i===0 && seviye>=0) continue;
    const tarif = tatliMi(kademe.simge) ? kademe.simge : undefined;
    const acik = i <= seviye;
    const sirada = i === seviye + 1;
    const alinabilir = sirada && bakiye >= kademe.fiyat;
    const denenebilir = acik && !!tarif && !!pisir;
    const durum = acik ? 'acik' : sirada ? 'sirada' : 'kilitli';
    const adet=tarif && acik ? stok[tarif]??0 : 0;
    const bas = acik ? (denenebilir ? 'Hazırla' : 'Açık')
      : sirada ? (alinabilir ? 'Kilidi aç' : (kademe.fiyat-bakiye)+' jeton eksik')
      : 'Önce '+tatliKademeler[i-1].ad+' açılmalı';
    const kart = h('button.tatli-vitrin-karti', {
      type:'button', disabled:!alinabilir&&!denenebilir, 'data-durum':durum, 'data-kademe': i,
      'aria-label': kademe.ad+' · '+bas+(acik?' · rafta '+adet+' tane':' · '+kademe.fiyat+' jeton'),
    });
    const durumIsareti = h('span.tatli-raf-isaret', {}, ikon(acik?'onay':'kilit'));
    const cizim = !tarif
      ? h('div.tatli-raf-atolye', {}, h('img.tatli-vitrin-cirpici',{src:cirpici,alt:'',draggable:false}), h('img.tatli-vitrin-kase',{src:kase,alt:'',draggable:false}))
      : h('span.tatli-raf-istasyon',{},h('img.tatli-raf-arac',{src:aletler[tarif],alt:'',draggable:false}),tarif==='sutlac'&&sonSutlac?sutlacKasesi(sonSutlac):tarif==='minik-kek'&&kek?minikKek(kek):tarif==='kurabiye'&&kurabiye?kurabiyeDizisi(sonKurabiye??'yildiz',kurabiye):tarif==='meyveli-tart'&&sonTart?meyveliTartGorseli(sonTart,sonTartKavruk):tatliResmi(tarif,tarif==='dondurma'?sonDondurma:undefined,sonKurabiye));
    const rozet = h('span.tatli-vitrin-rozet', {}, acik
      ? ikon(denenebilir?'oyna':'onay') : jetonSimge(), acik ? '' : String(kademe.fiyat));
    kart.append(durumIsareti,h('strong',{},tarif ? kademe.ad : 'Atölyeyi aç'),h('span.tatli-vitrin-cizim',{},cizim),rozet);
    if (acik && tarif) kart.append(h('span.tatli-raf-adet',{'aria-hidden':true},'×'+adet));
    if (sirada && !alinabilir) {
      const ilerleme=h('progress.tatli-birikim',{value:bakiye,max:kademe.fiyat,'aria-label':kademe.ad+' için biriken jeton'});
      kart.append(ilerleme);
    }
    if (alinabilir) kart.addEventListener('click',()=>{kart.disabled=true; al();},{once:true});
    if (denenebilir && tarif) kart.addEventListener('click',()=>pisir?.(tarif));
    raf.append(kart);
  }
  sahne.append(baslik, raf);
  return sahne;
}
