/**
 * Mino'nun istasyon köşesi (sol alt, ekran yüksekliğinin en çok %30'u; yıldız yiyecektir).
 * R-Gün 2'de `mino-mutfak-sayfasi` (8 poz: mutlu, göz kapalı, ağlar, tadar, ekşi, hapşırır, sevinir, aşağıdan bakar)
 * gelince `assets/restoran/kisi/mino/<poz>.webp` kullanılır; o gelene kadar ortak kod çizimi Mino (src/mino/mino.ts,
 * vektör: her ölçekte net) + şef şapkası yok. Gözyaşı ve damla efektleri kodla (efekt sayfası gelince resim).
 * Pozlarla canlanma (R-Gün 2 geldi): poz değişiminde ezilme-esneme, boşta ara sıra göz kırpar (mutlu → kirp),
 * konuşurken hafif sallanır; ağlarken gözyaşı çizimin kendisinde (kod gözyaşı gizli).
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
    kutu.dataset.resim = '1';
    // bütün pozlar önceden yüklenir (değişimde boş kare olmasın)
    for (const p of ['kirp', 'agla', 'tat', 'eksi', 'hapsir', 'sevin', 'bak']) {
      const u = varlik(`kisi/mino/${p}`);
      if (u) new Image().src = u;
    }
  } else {
    mino = new Mino();
    kutu.append(mino.el);
  }
  const yas = h('div.rs-gozyasi', { 'aria-hidden': 'true' }, h('i'), h('i'));
  kutu.append(yas, balon);
  kap.append(kutu);

  let bitis = 0;
  let zaman = 0;
  const pozKoy = (ad: string, esnet = true) => {
    const onceki = kutu.dataset.poz;
    kutu.dataset.poz = ad;
    const u = varlik(`kisi/mino/${ad}`) ?? varlik('kisi/mino/mutlu');
    if (!resim || !u) return;
    resim.src = u;
    if (esnet && onceki !== ad && !TEST_MODU) {
      try {
        resim.animate([{ transform: 'scale(1.07, 0.92)' }, { transform: 'scale(0.97, 1.04)', offset: 0.55 }, { transform: 'none' }], { duration: 240, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
    }
  };
  // boşta göz kırpma: yalnız 'mutlu' duruşta, konuşmuyorken
  let kirpZaman = 0;
  let kapali = false;
  const kirpPlanla = () => {
    if (!resim || TEST_MODU || kapali) return;
    kirpZaman = window.setTimeout(() => {
      if (kapali) return;
      if (kutu.dataset.poz === 'mutlu' && varlik('kisi/mino/kirp')) {
        pozKoy('kirp', false);
        window.setTimeout(() => {
          if (!kapali && kutu.dataset.poz === 'kirp') pozKoy('mutlu', false);
        }, 170);
      }
      kirpPlanla();
    }, 2400 + Math.random() * 2600);
  };
  kirpPlanla();
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
      // resimli Mino konuşurken hafifçe sallanır (ağız çizimde yok; gövdeyle konuşur)
      let sallan: Animation | null = null;
      if (resim && !TEST_MODU) {
        try {
          sallan = resim.animate([{ transform: 'none' }, { transform: 'translateY(-2.5%) scale(0.985, 1.02)' }, { transform: 'none' }], { duration: 420, iterations: Infinity, easing: 'ease-in-out' });
        } catch {
          sallan = null;
        }
      }
      try {
        await konus(metin, { cihazSesi: false });
      } finally {
        sallan?.cancel();
        mino?.agizOyna(false);
        kutu.classList.remove('konusuyor');
      }
    },
    kapat() {
      kapali = true;
      clearTimeout(kirpZaman);
      clearTimeout(zaman);
      mino?.kapat();
    },
  };
}
