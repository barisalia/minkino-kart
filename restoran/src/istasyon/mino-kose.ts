/**
 * Mino'nun istasyon köşesi (sol alt, ekran yüksekliğinin en çok %30'u; yıldız yiyecektir).
 * R-Gün 2'de `mino-mutfak-sayfasi` (8 poz: mutlu, göz kapalı, ağlar, tadar, ekşi, hapşırır, sevinir, aşağıdan bakar)
 * gelince `assets/restoran/kisi/mino/<poz>.webp` kullanılır; o gelene kadar ortak kod çizimi Mino (src/mino/mino.ts,
 * vektör: her ölçekte net) + şef şapkası yok. Gözyaşı ve damla efektleri kodla (efekt sayfası gelince resim).
 */
import { konus } from '../../../src/audio/ses';
import { Mino, type Tepki } from '../../../src/mino/mino';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import type { MinoKose, MinoTepki } from '../mini/arayuz';
import { varlik } from '../varliklar';

const POZ: Record<MinoTepki, string> = {
  agla: 'agla',
  tat: 'tat',
  eksi: 'eksi',
  sevin: 'sevin',
  sasir: 'mutlu',
  hapsir: 'hapsir',
  zipla: 'sevin',
  bak: 'bak',
};
const KOD_TEPKI: Record<MinoTepki, Tepki> = {
  agla: 'zorlan',
  tat: 'ham',
  eksi: 'zorlan',
  sevin: 'sevinc',
  sasir: 'sasir',
  hapsir: 'hapsu',
  zipla: 'zipla',
  bak: 'mir',
};

export interface MinoKoseEl extends MinoKose {
  kapat(): void;
}

export function minoKoseKur(kap: HTMLElement): MinoKoseEl {
  const resimVar = !!varlik('kisi/mino/mutlu');
  const kutu = h('div.rs-mino-kose', { 'data-poz': 'mutlu' });
  const balon = h('div.rs-mino-balon', { 'aria-live': 'polite' });
  let mino: Mino | null = null;
  let resim: HTMLImageElement | null = null;
  if (resimVar) {
    resim = h('img.rs-mino-resim', { src: varlik('kisi/mino/mutlu')!, alt: '', draggable: 'false' }) as HTMLImageElement;
    kutu.append(resim);
  } else {
    mino = new Mino();
    kutu.append(mino.el);
  }
  const yas = h('div.rs-gozyasi', { 'aria-hidden': 'true' }, h('i'), h('i'));
  kutu.append(yas, balon);
  kap.append(kutu);

  let bitis = 0;
  let zaman = 0;
  const pozKoy = (ad: string) => {
    kutu.dataset.poz = ad;
    const u = varlik(`kisi/mino/${ad}`) ?? varlik('kisi/mino/mutlu');
    if (resim && u) resim.src = u;
  };
  const dur = () => {
    clearTimeout(zaman);
    kutu.classList.remove('agliyor');
    pozKoy('mutlu');
  };
  const hop = () => {
    try {
      kutu.animate(
        [{ transform: 'none' }, { transform: 'scale(1.05,0.92)', offset: 0.2 }, { transform: 'translateY(-10%) scale(0.97,1.05)', offset: 0.5 }, { transform: 'none' }],
        { duration: sure(380), easing: 'ease-out' },
      );
    } catch {
      /* yok say */
    }
  };

  return {
    el: kutu,
    tepki(ad, ms = 1400) {
      clearTimeout(zaman);
      pozKoy(POZ[ad]);
      kutu.classList.toggle('agliyor', ad === 'agla');
      mino?.tepki(KOD_TEPKI[ad], Number.isFinite(ms) ? ms / 1000 : 4);
      if (ad === 'sevin' || ad === 'zipla' || ad === 'sasir') hop();
      bitis = performance.now() + ms;
      if (!Number.isFinite(ms)) return Promise.resolve();
      return new Promise<void>((coz) => {
        zaman = window.setTimeout(
          () => {
            if (performance.now() >= bitis - 5) dur();
            coz();
          },
          TEST_MODU ? 30 : ms,
        );
      });
    },
    dur,
    async soyle(metin) {
      balon.textContent = metin.replace(/\[[^\]]*\]\s*/g, '');
      kutu.classList.add('konusuyor');
      mino?.agizOyna(true);
      try {
        await konus(metin, { cihazSesi: false });
      } finally {
        mino?.agizOyna(false);
        kutu.classList.remove('konusuyor');
      }
    },
    kapat() {
      clearTimeout(zaman);
      mino?.kapat();
    },
  };
}
