// "Zıpzıp'ın Dizi" baştan sona: sekiz sahne tek akışta. Sahne bitince perde kararır, sıradaki sahne çizimlerini
// yükleyip ilk karesini çizince perde açılır. Çocuğun seçtiği bant ve yıldız sahneden sahneye taşınır (motor/oyun.ts).
// Bütün çizimler (319) klasöre gelmeden oyun açılmaz; ekranda yer tutucu olmaz.
import { menuYasiOku } from '../../src/engine/menu-yas';
import { TEST_MODU } from '../../src/ui/dom';
import { oyunuSifirla, type Yas } from './motor/oyun';
import { cizimAdresi, eksikGoster, type Secenek } from './motor/yurutucu';
import { SAHNE_SIRASI, TUM_DOSYALAR, sonrakiSahne, type SahneAdi } from './zincir-veri';

export function yasOku(): Yas {
  const p = new URLSearchParams(location.search).get('yas');
  if (p === '2-3' || p === '4' || p === '5+') return p;
  const y = menuYasiOku();
  if (y === 2 || y === 3) return '2-3';
  return y === 4 ? '4' : '5+';
}

/** Tek bir sahneyi başlatır (modülü o an yüklenir). */
export async function sahneBaslat(kok: HTMLElement, ad: SahneAdi, yas: Yas, secenek: Secenek = {}): Promise<void> {
  if (ad === 'bahce') (await import('./bahce/sahne')).baslatDusus(kok, secenek);
  else if (ad === 'kapi') { const m = await import('./kapi/sahne'); (await import('./motor/yurutucu')).sahneyiBaslat(kok, m.KAPI_SAHNESI, secenek); }
  else if (ad === 'bekleme') { const m = await import('./bekleme/sahne'); (await import('./motor/yurutucu')).sahneyiBaslat(kok, m.BEKLEME_SAHNESI, secenek); }
  else if (ad === 'once-kuzu') (await import('./once-kuzu/sahne')).baslat(kok, secenek);
  else if (ad === 'diz') (await import('./diz/sahne')).baslat(kok, yas, secenek);
  else if (ad === 'odul') (await import('./odul/sahne')).baslat(kok, yas, secenek);
  else (await import('./bahce/sahne')).baslatKapanis(kok, secenek);
}

/** Oyunu baştan sona oynatır. */
export function oyunuBaslat(kok: HTMLElement, ilk: SahneAdi = SAHNE_SIRASI[0]) {
  const eksik = TUM_DOSYALAR.filter(ad => !cizimAdresi(ad));
  if (eksik.length) { eksikGoster(kok, 'zipzip-diz', eksik); return; }
  const yas = yasOku();
  oyunuSifirla();
  kok.dataset.oyun = 'zipzip-diz';
  const perde = document.createElement('div');
  perde.className = 'dk-gecis';
  perde.style.opacity = '1';
  document.body.append(perde);
  const sure = TEST_MODU || matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 320;
  const ac = () => { perde.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure, fill: 'forwards' }); };
  const kapat = () => perde.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sure, fill: 'forwards' }).finished.catch(() => undefined);
  const oynat = (ad: SahneAdi) => {
    kok.dataset.zincir = ad;
    const sonra = sonrakiSahne(ad);
    // son sahnede bitince verilmez: Zıpzıp topunu sektirmeyi sürdürür, "yeniden oyna" düğmesi çıkar
    void sahneBaslat(kok, ad, yas, { hazir: ac, bitince: sonra ? () => { void kapat().then(() => oynat(sonra)); } : undefined });
  };
  oynat(ilk);
}
