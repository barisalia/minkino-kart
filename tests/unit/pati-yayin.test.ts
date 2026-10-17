import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { CEKMECELER, hayvanBilgi, susBilgi, type IhtiyacAdi } from '../../pati/src/katalog';
import { esyaResmi, hayvanGorseliVar, KOSE_ARKA, pozVar, susResmi } from '../../pati/src/varliklar';
import { YAYIN_KAPSAMI } from '../../pati/src/yayin';
import { hayvanSonucu, SAHNELER, type ZiyaretId } from '../../pati/src/ziyaret-sahneleri';

/**
 * Pati Dükkânı yayın kapsamı (pati/src/yayin.ts): listede olan her şeyin gerçek çizimi var, gizlenenler olmadan da
 * oyun eksiksiz (her hayvanın her ihtiyacında kapsam içinden ★ ve ✗ var; hayvan isteyen ziyaretçiye uygun bir yavru var).
 * Birim testleri tam içerikle çalışır (YAYIN kapalı); burada kapsam listeleri doğrudan denetlenir.
 */
const ESYA = new Set<string>(YAYIN_KAPSAMI.esyalar);

describe('Pati yayın kapsamı', () => {
  it('kapsamdaki her hayvanın çizimi var; Tarçın ve Fındık tam poz sayfalı', () => {
    for (const id of YAYIN_KAPSAMI.hayvanlar) expect(hayvanGorseliVar(id), id).toBe(true);
    for (const id of ['tarcin', 'findik']) for (const p of ['bos', 'ac', 'yiyor', 'uyku', 'begenmedi', 'dans-a', 'dans-b', 'dans-c'] as const) expect(pozVar(id, p), `${id}-${p}`).toBe(true);
  });

  it('kapsamdaki hayvanlar yalnız kapsamdaki köşelerde; köşelerin arka planı çizili (salon hariç)', () => {
    for (const id of YAYIN_KAPSAMI.hayvanlar) expect(YAYIN_KAPSAMI.koseler as readonly string[]).toContain(hayvanBilgi(id).kose);
    for (const k of YAYIN_KAPSAMI.koseler) if (k !== 'salon') expect(KOSE_ARKA[k], k).toBeTruthy();
  });

  it('kapsamdaki her eşyanın ve süsün çizimi var; çizimi olmayan eşya kapsamda değil', () => {
    for (const e of YAYIN_KAPSAMI.esyalar) expect(esyaResmi(e), e).toBeTruthy();
    for (const e of Object.keys(P.v2.esyalar)) if (!esyaResmi(e)) expect(ESYA.has(e), e).toBe(false);
    for (const s of YAYIN_KAPSAMI.susler) expect(susResmi(s, susBilgi(s).resim), s).toBeTruthy();
  });

  it('her hayvanın her ihtiyacında kapsam içinden en az bir ★ ve bir ✗ (ya da ✓) var; ders ve gizli sevgi kapsamda', () => {
    for (const id of YAYIN_KAPSAMI.hayvanlar) {
      const b = hayvanBilgi(id);
      for (const ih of b.ihtiyaclar as IhtiyacAdi[]) {
        const s = b.sevgi[ih]!;
        expect(s.s.filter((e) => ESYA.has(e)).length, `${id} ${ih} ★`).toBeGreaterThan(0);
        // ✗ yoksa çekmece aynı çekmeceden kapsamdaki başka bir eşyayla doldurur: o çekmecede kapsamda ≥ 3 eşya olmalı
        const c = Object.entries(CEKMECELER).find(([, v]) => v.ihtiyac === ih)![0];
        const cekmecede = YAYIN_KAPSAMI.esyalar.filter((e) => (P.v2.esyalar as Record<string, { cekmece: string }>)[e].cekmece === c);
        expect(cekmecede.length, `${c} çekmecesi`).toBeGreaterThanOrEqual(3);
      }
      if (b.ders) expect(ESYA.has(b.ders.esya), `${id} ders`).toBe(true);
      if (b.gizli) expect(ESYA.has(b.gizli), `${id} gizli`).toBe(true);
    }
  });

  it('hayvan isteyen ziyaretçiler: kapsamda uygun yavrusu olmayan (Elif: kuş) yayında gelmez, ötekilerin uygunu var', () => {
    const uygunVar = (z: ZiyaretId) => YAYIN_KAPSAMI.hayvanlar.some((id) => hayvanSonucu(z, id).uygun);
    const hayvanIsteyen = (Object.keys(SAHNELER) as ZiyaretId[]).filter((z) => SAHNELER[z].bekleyis === 'hayvan');
    expect(hayvanIsteyen.filter((z) => !uygunVar(z))).toEqual(['elif']);
  });
});
