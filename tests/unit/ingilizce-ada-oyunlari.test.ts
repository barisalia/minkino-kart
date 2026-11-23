import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITELER } from '../../ingilizce/src/icerik';
import { dersPlani, type Adim, type Yas } from '../../ingilizce/src/plan';
import {
  ADA_OYUNU, DERTLER, HAVALAR, adaOyunuPlani, adaOyunuSesMetinleri, adaOyunuSesleri, adaOyunuSoruSayisi, piknikKimligi, type AdaOyunu,
} from '../../ingilizce/src/adimlar/ada-oyunlari-veri';

// 13–24. adalara özel oyunlar (20 Kasım 2026): Evim, Duygular, Hava, Günüm, Sofra (6. derste Dürbün'ün yerine)
const YASLAR: Yas[] = ['2-3', '4', '5+'];
const tohum = (n: number) => () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
const plan = (ada: string, yas: Yas, t = 1) => adaOyunuPlani(ada, yas, tohum(t))!;

describe('ingilizce · ada oyunları', () => {
  it('13–24. adaların on ikisinin de 6. dersinde kendi oyunu var (yedeği Dürbün, sayılı adalarda Say ve Koy); başka adalarda ders değişmez', () => {
    for (const u of UNITELER) {
      const adimlar = dersPlani({ unite: u, no: 5, yas: '4', bilinen: [], isinma: [], ilk: false }, tohum(3));
      const oyun = adimlar.find((a): a is Extract<Adim, { tip: 'adaoyunu' }> => a.tip === 'adaoyunu');
      if (ADA_OYUNU[u.id]) {
        expect(oyun?.oyun.ad, u.id).toBe(ADA_OYUNU[u.id]);
        expect(['yakala', 'saykoy']).toContain(oyun?.yedek.tip);
      } else expect(oyun, u.id).toBeUndefined();
    }
    expect(Object.keys(ADA_OYUNU).sort()).toEqual(['doga', 'duygular', 'evim', 'gunum', 'hava', 'meyve', 'okul', 'park', 'sayilar2', 'sekiller', 'sofra', 'vucudum']);
  });

  it('Evim: oda sayısı ve tur yaşa göre; aynı oda iki kez sorulmaz', () => {
    for (const t of [1, 2, 3, 4]) for (const yas of YASLAR) {
      const o = plan('evim', yas, t) as Extract<AdaOyunu, { ad: 'nerede' }>;
      expect(o.odalar).toHaveLength(yas === '2-3' ? 3 : 4);
      expect(o.turlar).toHaveLength(yas === '5+' ? 4 : 3);
      expect(new Set(o.turlar).size).toBe(o.turlar.length);
      expect(o.turlar.every((d) => o.odalar.includes(d))).toBe(true);
    }
  });

  it('Duygular: doğru şey her turda seçeneklerde, dert tekrarlanmaz', () => {
    for (const t of [1, 2, 3]) for (const yas of YASLAR) {
      const o = plan('duygular', yas, t) as Extract<AdaOyunu, { ad: 'yardim' }>;
      expect(o.turlar).toHaveLength(yas === '2-3' ? 2 : yas === '4' ? 3 : 4);
      for (const x of o.turlar) {
        expect(x.secenekler).toContain(DERTLER[x.dert]);
        expect(x.secenekler).toHaveLength(yas === '2-3' ? 2 : 3);
        expect(new Set(x.secenekler).size).toBe(x.secenekler.length);
      }
    }
  });

  it('Hava: iki hava; giyilecekler o havanın giysileri, askıda başka havanın giysisi de var', () => {
    for (const t of [1, 2, 3]) for (const yas of YASLAR) {
      const o = plan('hava', yas, t) as Extract<AdaOyunu, { ad: 'pencere' }>;
      expect(o.turlar).toHaveLength(2);
      expect(o.turlar[0].hava).not.toBe(o.turlar[1].hava);
      for (const x of o.turlar) {
        expect(x.giysiler).toHaveLength(yas === '2-3' ? 1 : 2);
        for (const g of x.giysiler) expect(HAVALAR[x.hava].giysiler).toContain(g);
        expect(x.raf.some((g) => !(HAVALAR[x.hava].giysiler as readonly string[]).includes(g))).toBe(true);
      }
      expect(adaOyunuSoruSayisi(o)).toBe(yas === '2-3' ? 2 : 4);
    }
  });

  it('Günüm: dört kare günün sırasıyla (uyan → sabah işi → oyun → kitap)', () => {
    const o = plan('gunum', '4') as Extract<AdaOyunu, { ad: 'gun' }>;
    expect(o.turlar.map((x) => x.is)[0]).toBe('wake-up');
    expect(['wash', 'brush']).toContain(o.turlar[1].is);
    expect(['play', 'draw', 'sing']).toContain(o.turlar[2].is);
    expect(o.turlar[3].is).toBe('read');
    const gunun = o.turlar.map((x) => x.is);
    for (const x of o.turlar) {
      expect(x.secenekler).toContain(x.is);
      expect(x.secenekler.filter((s) => gunun.includes(s as never))).toEqual([x.is]);
    }
  });

  it('Sofra: 2–3 yaş boysuz; büyüklerde aynı yiyeceğin iki boyu kartlarda, hedef tek', () => {
    const k = plan('sofra', '2-3') as Extract<AdaOyunu, { ad: 'piknik' }>;
    expect(k.turlar.every((x) => !x.hedef.boy && x.secenekler.length === 2)).toBe(true);
    for (const yas of ['4', '5+'] as Yas[]) for (const t of [1, 2, 3]) {
      const o = plan('sofra', yas, t) as Extract<AdaOyunu, { ad: 'piknik' }>;
      for (const x of o.turlar) {
        const idler = x.secenekler.map(piknikKimligi);
        expect(new Set(idler).size).toBe(idler.length);
        expect(idler.filter((id) => id === piknikKimligi(x.hedef))).toHaveLength(1);
        expect(x.secenekler.filter((s) => s.yiyecek === x.hedef.yiyecek)).toHaveLength(2);
        expect(x.secenekler).toHaveLength(yas === '4' ? 3 : 4);
      }
    }
  });

  it('bütün kayıtlar diskte: yeni sözler ve oyunların çaldığı eski kayıtlar', () => {
    expect(adaOyunuSesMetinleri().filter((s) => !existsSync(`assets/ingilizce/ses/${s.id}.mp3`)).map((s) => s.id)).toEqual([]);
    const eksik = new Set<string>();
    for (const ada of Object.keys(ADA_OYUNU)) for (const yas of YASLAR) for (const t of [1, 2, 3, 4, 5]) {
      for (const id of adaOyunuSesleri(plan(ada, yas, t))) if (!existsSync(`assets/ingilizce/ses/${id}.mp3`)) eksik.add(id);
    }
    expect([...eksik]).toEqual([]);
  });

  it('Ceren’in girişlerinde İngilizce söz yok', () => {
    for (const s of adaOyunuSesMetinleri().filter((x) => x.dil === 'tr')) expect(s.metin, s.id).not.toMatch(/\b(the|is|let|please|kitchen|hungry|picnic)\b/i);
  });
});
