/**
 * Lokantadaki (mutfak tezgâhındaki) anlatıcı Mino: Gemini `mino-mutfak-sayfasi` pozları geldiyse (kisi/mino/*: şef
 * şapkalı) kod çizimi Mino'nun yerine resim gösterilir; aynı Mino nesnesinin tepki / ağız / otur çağrıları pozlara
 * çevrilir (personel yemeği dahil hiçbir çağıranın değişmesi gerekmez):
 *  - tepki → poz (sevinç: sevin, ham: tat, zorlan: eksi, hapşu: hapsir, ...), ezilme-esneme; süre bitince 'mutlu'
 *  - konuşurken gövde hafifçe sallanır (çizimde ağız yok)
 *  - boşta ara sıra göz kırpar (mutlu → kirp)
 *  - otur(true) (personel yemeği, masada): pozlarda oturuş yok → o sırada kod çizimi Mino görünür
 */
import type { Mino, Tepki } from '../../../src/mino/mino';
import { TEST_MODU } from '../../../src/ui/dom';
import { varlik } from '../varliklar';

const TEPKI_POZ: Partial<Record<Tepki, string>> = {
  sevinc: 'sevin',
  zipla: 'sevin',
  dans: 'sevin',
  evet: 'kirp',
  ham: 'tat',
  zorlan: 'eksi',
  hayir: 'eksi',
  sersem: 'eksi',
  hapsu: 'hapsir',
  sasir: 'bak',
  mir: 'kirp',
  esne: 'kirp',
  gidik: 'sevin',
};

export function salonMinoPozla(minoEl: HTMLElement, mino: Mino): () => void {
  if (!varlik('kisi/mino/mutlu')) return () => undefined;
  const resim = document.createElement('img');
  resim.className = 'rs-salon-mino-resim';
  resim.alt = '';
  resim.draggable = false;
  resim.src = varlik('kisi/mino/mutlu')!;
  minoEl.prepend(resim);
  minoEl.dataset.resim = '1';
  for (const p of ['kirp', 'tat', 'eksi', 'hapsir', 'sevin', 'bak', 'agla']) {
    const u = varlik(`kisi/mino/${p}`);
    if (u) new Image().src = u;
  }
  let poz = 'mutlu';
  let donus = 0;
  let kirp = 0;
  let kapali = false;
  let sallan: Animation | null = null;
  const goster = (ad: string, esnet = true) => {
    const u = varlik(`kisi/mino/${ad}`) ?? varlik('kisi/mino/mutlu')!;
    const onceki = poz;
    poz = ad;
    resim.src = u;
    if (esnet && onceki !== ad && !TEST_MODU) {
      try {
        resim.animate([{ transform: 'scale(1.07, 0.92)' }, { transform: 'scale(0.97, 1.04)', offset: 0.55 }, { transform: 'none' }], { duration: 240, easing: 'ease-out' });
      } catch {
        /* yok say */
      }
    }
  };
  const kirpPlanla = () => {
    if (TEST_MODU || kapali) return;
    kirp = window.setTimeout(() => {
      if (kapali) return;
      if (poz === 'mutlu' && !sallan && varlik('kisi/mino/kirp')) {
        goster('kirp', false);
        window.setTimeout(() => {
          if (!kapali && poz === 'kirp') goster('mutlu', false);
        }, 170);
      }
      kirpPlanla();
    }, 2400 + Math.random() * 2600);
  };
  kirpPlanla();

  const tepki = mino.tepki.bind(mino);
  mino.tepki = (t: Tepki, sure?: number) => {
    tepki(t, sure);
    const p = TEPKI_POZ[t];
    if (!p) return;
    goster(p);
    clearTimeout(donus);
    donus = window.setTimeout(() => !kapali && goster('mutlu'), TEST_MODU ? 40 : Math.max(500, (sure ?? 1) * 1000));
  };
  const agiz = mino.agizOyna.bind(mino);
  mino.agizOyna = (acik: boolean, ...r: unknown[]) => {
    (agiz as (a: boolean, ...x: unknown[]) => void)(acik, ...r);
    sallan?.cancel();
    sallan = null;
    if (acik && !TEST_MODU) {
      try {
        sallan = resim.animate([{ transform: 'none' }, { transform: 'translateY(-2.5%) scale(0.985, 1.02)' }, { transform: 'none' }], { duration: 420, iterations: Infinity, easing: 'ease-in-out' });
      } catch {
        sallan = null;
      }
    }
  };
  const otur = mino.otur.bind(mino);
  mino.otur = (acik: boolean) => {
    // oturuş pozu yok: masada otururken kod çizimi Mino görünür
    if (acik) delete minoEl.dataset.resim;
    else minoEl.dataset.resim = '1';
    return otur(acik);
  };
  return () => {
    kapali = true;
    clearTimeout(kirp);
    clearTimeout(donus);
    sallan?.cancel();
  };
}
