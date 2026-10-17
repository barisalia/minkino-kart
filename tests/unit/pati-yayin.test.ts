import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { CEKMECELER, hayvanBilgi, susBilgi, type IhtiyacAdi } from '../../pati/src/katalog';
import { KOSE_PLANI } from '../../pati/src/kose';
import { esyaResmi, hayvanGorseliVar, KOSE_ARKA, KOSE_H, KOSE_W, pozVar, susResmi } from '../../pati/src/varliklar';
import { YAYIN_KAPSAMI } from '../../pati/src/yayin';
import { hayvanSonucu, SAHNELER, type ZiyaretId } from '../../pati/src/ziyaret-sahneleri';

/**
 * Pati Dükkânı yayın kapsamı (pati/src/yayin.ts): listede olan her şeyin gerçek çizimi var, gizlenenler olmadan da
 * oyun eksiksiz (her hayvanın her ihtiyacında kapsam içinden ★ ve ✗ var; hayvan isteyen ziyaretçiye uygun bir yavru var).
 * Birim testleri tam içerikle çalışır (YAYIN kapalı); burada kapsam listeleri doğrudan denetlenir.
 */
const ESYA = new Set<string>(YAYIN_KAPSAMI.esyalar);
/** Yayında açılmayan ihtiyaçlar: ★'ları esya-2 / esya-6 sayfalarında (ayçekirdeği, kırmızı biber, akvaryum kalesi …) */
const KAPANAN: Record<string, IhtiyacAdi[]> = { fistik: ['ac'], kurabiye: ['ac'], piril: ['sikildi'], limon: ['ac', 'susuz'], tospik: ['susuz'] };
/** Gizli sevgisi çizilmemiş (yayında gizli sevgi yok) */
const GIZLI_YOK = ['fistik', 'tospik'];

describe('Pati yayın kapsamı', () => {
  it('kapsamdaki her hayvanın çizimi var; Tarçın ve Fındık tam poz sayfalı, köşe hayvanları hareket sayfalı', () => {
    for (const id of YAYIN_KAPSAMI.hayvanlar) expect(hayvanGorseliVar(id), id).toBe(true);
    for (const p of ['bos', 'goz', 'ac', 'yiyor', 'uyku', 'sevinc'] as const) expect(pozVar('piril', p), `piril-${p}`).toBe(true);
    expect(hayvanGorseliVar('diken')).toBe(true);
    // Fıstık, Kurabiye, Limon, Tospik: GPT Image hareket sayfası (dur, otur, yürü, sevinç, ye, uyu, şaşır, dans)
    for (const id of ['fistik', 'kurabiye', 'limon', 'tospik']) for (const p of ['bos', 'rahat', 'ozel', 'sevinc', 'yiyor', 'uyku', 'saskin', 'dans-a'] as const) expect(pozVar(id, p), `${id}-${p}`).toBe(true);
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
      // yayında ★'ı çizilmemiş ihtiyaç açılmaz (katalog.ts turBilgi); kalanların hepsinde ★ var
      const acik = (b.ihtiyaclar as IhtiyacAdi[]).filter((ih) => b.sevgi[ih]!.s.some((e) => ESYA.has(e)));
      const kapali = (b.ihtiyaclar as IhtiyacAdi[]).filter((ih) => !acik.includes(ih));
      expect(kapali, `${id} kapanan ihtiyaçlar`).toEqual(KAPANAN[id] ?? []);
      // 3-4'te de en az iki ihtiyaç kalır (aç, susuz, sıkılmış, uykulu içinden)
      expect(acik.filter((ih) => ['ac', 'susuz', 'sikildi', 'uykulu'].includes(ih)).length, `${id} 3-4`).toBeGreaterThanOrEqual(2);
      for (const ih of acik) {
        // ✗ yoksa çekmece aynı çekmeceden kapsamdaki başka bir eşyayla doldurur: o çekmecede kapsamda ≥ 3 eşya olmalı
        const c = Object.entries(CEKMECELER).find(([, v]) => v.ihtiyac === ih)![0];
        const cekmecede = YAYIN_KAPSAMI.esyalar.filter((e) => (P.v2.esyalar as Record<string, { cekmece: string }>)[e].cekmece === c);
        expect(cekmecede.length, `${c} çekmecesi`).toBeGreaterThanOrEqual(3);
      }
      // ders ve gizli sevgi kapsamda; değilse yayında hiç yok (turBilgi null yapar)
      if (b.ders) expect(ESYA.has(b.ders.esya), `${id} ders`).toBe(true);
      if (b.gizli && !ESYA.has(b.gizli)) expect(GIZLI_YOK, `${id} gizli`).toContain(id);
    }
  });

  it('hayvan isteyen her ziyaretçinin kapsamda uygun yavrusu var (Elif: Limon)', () => {
    const uygunVar = (z: ZiyaretId) => YAYIN_KAPSAMI.hayvanlar.some((id) => hayvanSonucu(z, id).uygun);
    const hayvanIsteyen = (Object.keys(SAHNELER) as ZiyaretId[]).filter((z) => SAHNELER[z].bekleyis === 'hayvan');
    expect(hayvanIsteyen.filter((z) => !uygunVar(z))).toEqual([]);
  });

  it('köşe planı: hayvanlar kendi habitatının kesitinde, balık suyun içinde, Diken bahçe kesitinde; kesitler çizimin içinde', () => {
    for (const [k, plan] of Object.entries(KOSE_PLANI)) {
      for (const [i, y] of plan.yuva.entries()) {
        const c = y.kesit;
        expect(c.x0 >= 0 && c.y0 >= 0 && c.x1 <= KOSE_W && c.y1 <= KOSE_H, `${k} ${i} kesit`).toBe(true);
        expect(y.x > c.x0 && y.x < c.x1 && y.y > c.y0 && y.y <= c.y1, `${k} ${i} ayak`).toBe(true);
        expect(y.y - y.boy, `${k} ${i} baş`).toBeGreaterThanOrEqual(c.y0);
        if (y.su) expect(y.su.x0 >= c.x0 && y.su.x1 <= c.x1 && y.su.y0 - y.boy >= c.y0 && y.su.y1 <= c.y1, `${k} ${i} su`).toBe(true);
      }
      if (plan.diken) {
        const c = plan.yuva[1].kesit;
        expect(plan.diken.x > c.x0 && plan.diken.x < c.x1 && plan.diken.y - plan.diken.boy >= c.y0 && plan.diken.y <= c.y1).toBe(true);
      }
    }
    expect(Object.keys(KOSE_PLANI).sort()).toEqual([...YAYIN_KAPSAMI.koseler].filter((k) => k !== 'salon').sort());
  });
});
