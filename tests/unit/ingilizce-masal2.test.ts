import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { kelimeBul } from '../../ingilizce/src/icerik';
import { MASAL_SORULARI, masalSorusuSesi } from '../../ingilizce/src/masal-oyun';
import { GOL_MASALI, GOL2_MASALI, KUMSAL_MASALI, M2_TUVAL, masal2Cizimleri, masal2Sesleri, kutuda, type Dokunus } from '../../ingilizce/src/adimlar/masal2-veri';

// Masal 2.0 · Kino at the Lake (22 Kasım 2026, ingilizce/src/adimlar/masal2-veri.ts; çizimler Paket 31 S1–S2)
describe('ingilizce · Masal 2.0 göl masalı', () => {
  const m = GOL_MASALI;
  const hepsi = (): [string, Dokunus][] => m.sayfalar.flatMap((s) => [...s.dokunuslar.map((d): [string, Dokunus] => [s.resim, d]), ...Object.entries(s.sonraki ?? {}).flatMap(([r, l]) => l.map((d): [string, Dokunus] => [r, d]))]);

  it('altı sayfa, sekiz çizim (-4b ve -saka geçişle), hepsi diskte', () => {
    expect(m.sayfalar).toHaveLength(6);
    const c = masal2Cizimleri(m);
    expect(c.sort()).toEqual(['1', '2', '3', '4', '4b', '5', '6', 'saka'].map((x) => `masal2/gol-${x}`).sort());
    for (const y of c) expect(existsSync(`assets/ingilizce/${y}.webp`), y).toBe(true);
  });

  it('her sayfanın bir ana dokunuşu var; kutular tuvalin içinde; geçişler göl → şaka → şapkalı ördek', () => {
    for (const s of m.sayfalar) expect(s.dokunuslar.some((d) => d.ana), s.resim).toBe(true);
    for (const [r, d] of hepsi()) expect(d.kutu[0] >= 0 && d.kutu[1] >= 0 && d.kutu[0] + d.kutu[2] <= M2_TUVAL.en && d.kutu[1] + d.kutu[3] <= M2_TUVAL.boy, `${r}/${d.id}`).toBe(true);
    const gol = m.sayfalar[3];
    expect(gol.dokunuslar[0].gecis).toBe('masal2/gol-saka');
    expect(gol.sonraki?.['masal2/gol-saka']?.[0].gecis).toBe('masal2/gol-4b');
    // ölçülen yerler: ineğin gövdesi, gölün ortasındaki halka, muzlu ördek, gün batımında inek önündeki ördek
    expect(kutuda(m.sayfalar[1].dokunuslar[0].kutu, 1150, 700)).toBe(true);
    expect(kutuda(gol.dokunuslar[0].kutu, 880, 830)).toBe(true);
    expect(kutuda(gol.dokunuslar[0].kutu, 200, 700)).toBe(false); // Kino'ya dokunmak göl sayılmaz
    expect(kutuda(gol.sonraki!['masal2/gol-saka'][0].kutu, 870, 610)).toBe(true);
    expect(m.sayfalar[5].dokunuslar[0].id).toBe('ordek'); // ördek ineğin önünde: önce o
  });

  it('bütün sesler diskte; Masal Oyunu soruları resimli ve kayıtlı', () => {
    for (const id of masal2Sesleri(m)) expect(existsSync(`assets/ingilizce/ses/${id}.mp3`), id).toBe(true);
    const sorular = MASAL_SORULARI.gol;
    expect(sorular.length).toBe(3);
    sorular.forEach((q, i) => {
      expect(existsSync(`assets/ingilizce/ses/${masalSorusuSesi('gol', i)}.mp3`)).toBe(true);
      for (const w of q.secenekler) { expect(kelimeBul(w), w).toBeTruthy(); expect(existsSync(`assets/ingilizce/kelime/${w}.webp`), w).toBe(true); }
      expect(q.sayfa).toBeLessThan(m.sayfalar.length);
    });
  });
});

// Masal 2.0 tam ekran motoru (22 Kasım akşamı): kamera, sözcükler, seç ve söyle etkileşimleri
describe('ingilizce · Masal 2.0 etkileşim verisi', () => {
  for (const m of [GOL_MASALI, KUMSAL_MASALI]) {
    it(`${m.ad}: her kelime gerçek ve resimli; seç/söyle hedefleri sayfada; kamera tuvalde; her sayfada etkileşim`, () => {
      for (const s of m.sayfalar) {
        const hepsi = [...s.dokunuslar, ...Object.values(s.sonraki ?? {}).flat()];
        for (const d of hepsi) if (d.kelime) { expect(kelimeBul(d.kelime), `${s.resim}/${d.id}`).toBeTruthy(); expect(existsSync(`assets/ingilizce/ses/en/w-${d.kelime}.mp3`), d.kelime).toBe(true); }
        if (s.sec) expect(s.dokunuslar.some((d) => d.id === s.sec!.dogru), s.resim).toBe(true);
        if (s.soyle) { expect(s.dokunuslar.some((d) => d.id === s.soyle!.hedef), s.resim).toBe(true); expect(existsSync(`assets/ingilizce/ses/en/w-${s.soyle.kelime}-yavas.mp3`)).toBe(true); }
        for (const k of [s.kamera?.bas, s.kamera?.son].filter(Boolean)) expect(k!.x >= 0 && k!.x <= M2_TUVAL.en && k!.y >= 0 && k!.y <= M2_TUVAL.boy && k!.yakin >= 1 && k!.yakin <= 1.6, s.resim).toBe(true);
        expect(s.dokunuslar.length + (s.sec ? 1 : 0) + (s.soyle ? 1 : 0) + (s.surukle ? 1 : 0), s.resim).toBeGreaterThan(0);
      }
    });
  }
  it('göl masalı: 2. sayfada "cow" söyletilir, son sayfada "Where is the duck?" seçtirilir', () => {
    expect(GOL_MASALI.sayfalar[1].soyle).toEqual({ kelime: 'cow', hedef: 'inek' });
    expect(GOL_MASALI.sayfalar[5].sec).toEqual({ soru: 'en/q-duck', dogru: 'ordek' });
    expect(masal2Sesleri(GOL_MASALI)).toEqual(expect.arrayContaining(['en/g-say-it', 'en/w-cow-yavas', 'en/q-duck', 'en/w-hat']));
  });
});

// Masal C · Lokum at the Beach (22 Kasım 2026, Paket 37; çizimleri henüz gelmedi: yalnız yapı, ses ve sorular denetlenir)
describe('ingilizce · Masal 2.0 kumsal masalı', () => {
  const m = KUMSAL_MASALI;
  it('Renkler adasında; altı sayfa, dokuz çizim (+ kapak); her sayfada ana yer; kutular tuvalde', () => {
    expect(m.uniteId).toBe('renkler');
    expect(m.sayfalar).toHaveLength(6);
    // 5. sayfanın deniz yıldızı ayrı bir katmandır (sürüklenir)
    expect(masal2Cizimleri(m).sort()).toEqual(['1', '2', '3', '4', '4b', '5', '6', '6b', 'saka', 'yildiz'].map((x) => `masal2/kumsal-${x}`).sort());
    expect(m.sayfalar[4].surukle).toEqual({ nesne: 'yildiz', hedef: [850, 280, 160, 150], sonra: 'yildiz' });
    for (const s of m.sayfalar) {
      expect(s.dokunuslar.some((d) => d.ana), s.resim).toBe(true);
      for (const d of [...s.dokunuslar, ...Object.values(s.sonraki ?? {}).flat()]) {
        expect(d.kutu[0] >= 0 && d.kutu[1] >= 0 && d.kutu[0] + d.kutu[2] <= M2_TUVAL.en && d.kutu[1] + d.kutu[3] <= M2_TUVAL.boy, `${s.resim}/${d.id}`).toBe(true);
      }
    }
  });

  it('kum → kovalı yengeç (şaka) → yardımcı yengeç kendiliğinden; son sayfada yengeç kovayı Lokum\'a geçirir (sondaki şaka)', () => {
    const kum = m.sayfalar[3];
    expect(kum.dokunuslar[0].gecis).toBe('masal2/kumsal-saka');
    const saka = kum.sonraki!['masal2/kumsal-saka'][0];
    expect(saka.gecis).toBe('masal2/kumsal-4b');
    expect(saka.oto).toBe(true);
    const son = m.sayfalar[5].dokunuslar[0];
    expect(son.oto && son.gecis).toBe('masal2/kumsal-6b');
  });

  it('bütün sesler diskte; Masal Oyunu soruları resimli ve kayıtlı; Renkler adasının sorusu renk', () => {
    for (const id of masal2Sesleri(m)) expect(existsSync(`assets/ingilizce/ses/${id}.mp3`), id).toBe(true);
    const sorular = MASAL_SORULARI.kumsal;
    expect(sorular).toHaveLength(3);
    expect(sorular[0].cevap).toBe('yellow');
    sorular.forEach((q, i) => {
      expect(existsSync(`assets/ingilizce/ses/${masalSorusuSesi('kumsal', i)}.mp3`)).toBe(true);
      for (const w of q.secenekler) { expect(kelimeBul(w), w).toBeTruthy(); expect(existsSync(`assets/ingilizce/kelime/${w}.webp`), w).toBe(true); }
    });
  });
});

// Masal A v2 · Kino at the Lake güçlü hâli (22 Kasım gecesi; ekip/ingilizce/MASAL-GOL-V2.md). Çizimleri henüz yok.
describe('ingilizce · Masal 2.0 göl masalı v2', () => {
  const m = GOL2_MASALI;
  it('yedi sayfa; her sayfada sırayla etkileşim; her etkileşimin yeri, katmanı ve sesi var', () => {
    expect(m.sayfalar).toHaveLength(7);
    expect(m.uniteId).toBe('ciftlik');
    for (const s of m.sayfalar) {
      const e = s.etkilesimler ?? [];
      expect(e.length, s.resim).toBeGreaterThan(0);
      const yerler = new Set([...s.dokunuslar, ...Object.values(s.sonraki ?? {}).flat()].map((d) => d.id));
      const katmanlar = new Set((s.katmanlar ?? []).map((k) => k.id));
      for (const x of e) {
        if (x.tip === 'dokun') expect(yerler.has(x.yer), `${s.resim} ${x.yer}`).toBe(true);
        if (x.tip === 'hepsi') for (const yer of x.yerler) expect(yerler.has(yer), `${s.resim} ${yer}`).toBe(true);
        if (x.tip === 'evethayir' || x.tip === 'soyle') expect(yerler.has(x.tip === 'soyle' ? x.hedef : x.sonra), s.resim).toBe(true);
        if (x.tip === 'yakala' || x.tip === 'surukle') { expect(katmanlar.has(x.nesne), s.resim).toBe(true); expect(yerler.has(x.sonra), s.resim).toBe(true); }
      }
    }
    for (const id of masal2Sesleri(m)) expect(existsSync(`assets/ingilizce/ses/${id}.mp3`), id).toBe(true);
  });

  it('komik kalıp üç kez: muz (No seç), yaprak (No söyle), şapka (Yes seç, sonra sürükle); şapka kaçar ve göle düşer', () => {
    const tipler = m.sayfalar.map((s) => (s.etkilesimler ?? []).map((e) => e.tip).join('+'));
    expect(tipler).toEqual(['dokun', 'soyle', 'yakala', 'dokun+evethayir', 'dokun+soyle', 'dokun+evethayir+surukle', 'hepsi']);
    const e4 = m.sayfalar[3].etkilesimler![1], e5 = m.sayfalar[4].etkilesimler![1], e6 = m.sayfalar[5].etkilesimler![1];
    expect(e4.tip === 'evethayir' && e4.dogru).toBe('no');
    expect(e5.tip === 'soyle' && e5.kelime).toBe('no');
    expect(e6.tip === 'evethayir' && e6.dogru).toBe('yes');
    const yakala = m.sayfalar[2].etkilesimler![0];
    expect(yakala.tip === 'yakala' && yakala.kacis.length).toBe(2);
    // şapka katmanı 6. sayfada yalnız şapkalı ördek sudan çıkınca görünür
    expect(m.sayfalar[5].katmanlar?.[0].cizimde).toBe('masal2/gol2-6b');
  });

  it('Masal Oyunu soruları resimli ve kayıtlı; Çiftlik kitabı çizimi gelene kadar v1 masalını açar', () => {
    const sorular = MASAL_SORULARI.gol2;
    expect(sorular.map((q) => q.cevap)).toEqual(['blue', 'duck', 'leaf']);
    sorular.forEach((q, i) => {
      expect(existsSync(`assets/ingilizce/ses/${masalSorusuSesi('gol2', i)}.mp3`)).toBe(true);
      for (const w of q.secenekler) expect(existsSync(`assets/ingilizce/kelime/${w}.webp`), w).toBe(true);
    });
    expect(masal2Cizimleri(m).some((y) => existsSync(`assets/ingilizce/${y}.webp`))).toBe(false);
  });
});
