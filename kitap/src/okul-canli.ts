/**
 * "Kino Okula Başlıyor": her sayfanın canlanan anları (senaryo §2.5 "Canlanan" maddeleri) ve saklı uğur böceği.
 *
 * Katmanlar ve poz numaraları ekip/antigravity/KITAP-DOSYA-ADLARI.md ile birebir: poz N = hareket sayfasının N. pozu.
 * Hareket yalnız çizilmiş kare değişimi + ezilme/esneme + kayma; döndürme yok. "Şuna dokun" yönlendirmesi yok: çocuk
 * keşfeder, 20 sn boşta kalırsa bulunmamış bir şey çok hafif kıpırdar (canli.ts).
 *
 * yer: yer tutucunun konumu (resmin oranı). Resim gelince kitap-isle.cjs'in ölçtüğü yer (yerlesim.json) geçer.
 * tam: yalnız tam sayfa çizimi varken dokunma bölgeleri ve çizimdeki uğur böceği (merkezi); ölçüler çizimlerden elle
 * (sayfa resminin oranı). 2026-10-17: Gemini'nin yeniden çizdiği 2752×1536 sayfalara göre yeniden ölçüldü (01, 05-14
 * eskisinin aynası; karakterler yer değiştirdi). s04 Zıpzıp ve s11 Tombi çizimde yok: o anlar tam sayfada oynamaz.
 */
import type { Adim, KatmanTanim, Kutu, SayfaCanli } from './tipler';

const K = (id: string, ad: string, yer: Kutu, pozlar: number, ek: Partial<KatmanTanim> = {}): KatmanTanim => ({ id, ad, yer, pozlar, ...ek });

/** Kuyruk pervanesi: kuyruksuz poz + kuyruk dizisi 2-3-4-1 hızlı döngü, sonra ana poz */
function pervane(k: string, kuyruksuz: number, tur = 3, ana = 1): Adim[] {
  const a: Adim[] = [{ k, poz: kuyruksuz, parca: ['kuyruk', 1], ms: 60 }];
  for (let t = 0; t < tur; t++) for (const kare of [2, 3, 4, 1]) a.push({ k, parca: ['kuyruk', kare], ms: 70 });
  a.push({ k, poz: ana, parca: ['kuyruk', 0], ms: 10 });
  return a;
}

export const OKUL_CANLI: Record<number, SayfaCanli> = {
  // Kapak: Kino el sallar; kuyruğu pervane gibi döner. Uğur: kapı tabelasının köşesi.
  0: {
    katmanlar: [K('kino', 'Kino', [0.34, 0.3, 0.32, 0.62], 4, { parcalar: { kuyruk: 4 } })],
    anlar: [
      { id: 'el', dokun: ['kino'], adimlar: [{ k: 'kino', poz: 2, ef: 'esne', ms: 170 }, { k: 'kino', poz: 3, ms: 170 }, { k: 'kino', poz: 2, ms: 170 }, { k: 'kino', poz: 3, ms: 170 }, { k: 'kino', poz: 1, ms: 120 }, ...pervane('kino', 4, 2)] },
      { id: 'kuyruk', dokun: [], bosta: 6500, adimlar: pervane('kino', 4) },
    ],
    ugur: [0.71, 0.2],
    tam: { ugur: [0.602, 0.057], yerler: { kino: [0.37, 0.33, 0.27, 0.63] } },
  },
  // s01: kuyruk pervane; düğmeleri ararken kendi etrafında döner; Lokum esner. Uğur: pencere pervazı.
  1: {
    katmanlar: [K('kino', 'Kino', [0.16, 0.3, 0.3, 0.6], 6, { parcalar: { kuyruk: 4 } }), K('lokum', 'Lokum', [0.6, 0.36, 0.26, 0.3], 4)],
    anlar: [
      { id: 'kuyruk', dokun: [], bosta: 7000, adimlar: pervane('kino', 6) },
      {
        id: 'dugme',
        dokun: ['kino'],
        adimlar: [{ k: 'kino', poz: 2, ms: 300 }, { k: 'kino', poz: 3, ms: 190 }, { k: 'kino', poz: 4, ms: 260 }, { k: 'kino', poz: 5, ms: 190 }, { k: 'kino', poz: 2, ms: 220 }, { k: 'kino', poz: 3, ms: 170 }, { k: 'kino', poz: 4, ms: 200 }, { k: 'kino', poz: 5, ms: 170 }, { k: 'kino', poz: 1, ef: 'ez', ms: 380 }],
      },
      { id: 'esne', dokun: ['lokum'], adimlar: [{ k: 'lokum', poz: 2, ms: 300 }, { k: 'lokum', poz: 3, ef: 'esne', ms: 900 }, { k: 'lokum', poz: 4, ms: 600 }, { k: 'lokum', poz: 1, ms: 10 }] },
    ],
    ugur: [0.83, 0.22],
    tam: { ugur: [0.333, 0.227], yerler: { kino: [0.64, 0.15, 0.24, 0.8], lokum: [0.06, 0.28, 0.22, 0.5] } },
  },
  // s02: Baba horlar, "Çay?" deyince sıçrar; Lokum çantayla popo üstü oturur; gizli: çantaya dokununca "Şşş!".
  2: {
    katmanlar: [K('baba', 'Baba', [0.08, 0.28, 0.34, 0.4], 4), K('lokum', 'Lokum', [0.56, 0.52, 0.24, 0.4], 6)],
    bolgeler: { canta: [0.6, 0.55, 0.14, 0.15] },
    anlar: [
      {
        id: 'horla',
        dokun: ['baba'],
        adimlar: [{ k: 'baba', poz: 2, ef: 'nefes', ms: 650 }, { k: 'baba', poz: 1, ms: 450 }, { k: 'baba', poz: 2, ef: 'nefes', ms: 650 }, { soz: { kim: 'anne', metin: 'Çay?' }, ms: 500 }, { k: 'baba', poz: 3, ef: 'esne', efekt: 'sicrama', ms: 650 }, { k: 'baba', poz: 4, ms: 900 }, { k: 'baba', poz: 1, ms: 10 }],
      },
      { id: 'otur', dokun: ['lokum'], adimlar: [{ k: 'lokum', poz: 2, kay: [0.025, 0], ms: 320 }, { k: 'lokum', poz: 3, ef: 'ez', efekt: 'pof', ms: 450 }, { k: 'lokum', poz: 4, ef: 'kipir', ms: 1100 }, { k: 'lokum', poz: 1, kay: [0, 0], ms: 10 }] },
      { id: 'sir', dokun: ['bolge:canta'], adimlar: [{ k: 'lokum', poz: 5, ms: 800 }, { k: 'lokum', poz: 6, soz: { kim: 'lokum', metin: '[whispers] Şşş!' }, ms: 1300 }, { k: 'lokum', poz: 1, ms: 10 }] },
    ],
    ugur: [0.45, 0.5],
    tam: { ugur: [0.523, 0.525], yerler: { baba: [0.1, 0.17, 0.25, 0.7], lokum: [0.8, 0.62, 0.1, 0.32], 'bolge:canta': [0.69, 0.66, 0.11, 0.26] } },
  },
  // s03: Mino hoplar; Kino göğsünü gerer, sendeler; çantadan sarkan kulak sallanır.
  3: {
    katmanlar: [K('anne-kino', 'Anne ve Kino', [0.12, 0.18, 0.46, 0.76], 4, { parcalar: { 'kuzu-kulak': 3 }, hep: ['kuzu-kulak'] }), K('mino', 'Mino', [0.62, 0.4, 0.22, 0.48], 4)],
    anlar: [
      { id: 'hop', dokun: ['mino'], bosta: 5200, adimlar: [{ k: 'mino', poz: 2, ef: 'ez', ms: 200 }, { k: 'mino', poz: 3, kay: [0, -0.08], efekt: 'sicrama', ms: 280 }, { k: 'mino', poz: 4, kay: [0, 0], ef: 'ez', ms: 220 }, { k: 'mino', poz: 1, ms: 10 }] },
      {
        id: 'boburlen',
        dokun: ['anne-kino'],
        adimlar: [
          { k: 'anne-kino', poz: 2, ef: 'esne', ms: 650 },
          { k: 'anne-kino', parca: ['kuzu-kulak', 2], birlikte: true },
          { k: 'anne-kino', poz: 3, kay: [0.03, 0], ms: 180 },
          { k: 'anne-kino', parca: ['kuzu-kulak', 3], ms: 180 },
          { k: 'anne-kino', parca: ['kuzu-kulak', 2], ms: 180 },
          { k: 'anne-kino', poz: 4, kay: [0, 0], parca: ['kuzu-kulak', 1], ms: 700 },
          { k: 'anne-kino', poz: 1, ms: 10 },
        ],
      },
      { id: 'kulak', dokun: [], bosta: 4300, adimlar: [{ k: 'anne-kino', parca: ['kuzu-kulak', 2], ms: 200 }, { k: 'anne-kino', parca: ['kuzu-kulak', 3], ms: 200 }, { k: 'anne-kino', parca: ['kuzu-kulak', 1], ms: 10 }] },
    ],
    ugur: [0.85, 0.12],
    tam: { ugur: [0.089, 0.104], yerler: { mino: [0.1, 0.36, 0.22, 0.57], 'anne-kino': [0.65, 0.36, 0.22, 0.57] } },
  },
  // s04: kuyruk yavaşça iner; Kino tek gözle bakar, saklanır, kulak kıpırdar; Zıpzıp zıplayarak geçer.
  4: {
    katmanlar: [
      K('zipzip', 'Zıpzıp', [0.04, 0.22, 0.14, 0.24], 4),
      K('kino', 'Kino', [0.4, 0.4, 0.26, 0.52], 4, { parcalar: { kuyruk: 4 }, hep: ['kuyruk'] }),
      K('anne', 'Anne', [0.46, 0.1, 0.3, 0.86], 1),
    ],
    anlar: [
      { id: 'kuyruk-iner', dokun: [], acilista: true, adimlar: [{ k: 'kino', parca: ['kuyruk', 1], ms: 700 }, { k: 'kino', parca: ['kuyruk', 2], ms: 700 }, { k: 'kino', parca: ['kuyruk', 3], ms: 700 }, { k: 'kino', parca: ['kuyruk', 4], ms: 10 }] },
      { id: 'bak', dokun: ['kino', 'anne'], adimlar: [{ k: 'kino', poz: 2, ms: 800 }, { k: 'kino', poz: 3, ef: 'esne', ms: 450 }, { k: 'kino', poz: 1, ef: 'ez', ms: 350 }, { k: 'kino', poz: 4, ms: 220 }, { k: 'kino', poz: 1, ms: 10 }] },
      {
        id: 'zipzip',
        dokun: ['zipzip'],
        adimlar: [
          ...[1, 2, 3, 4, 1, 2, 3, 4].map((p, i): Adim => ({ k: 'zipzip', poz: p, kay: [0.1 * (i + 1), p === 2 ? -0.03 : 0], ms: 170 })),
          { k: 'zipzip', gor: false, ms: 500 },
          { k: 'zipzip', poz: 1, kay: [0, 0], ms: 30 },
          { k: 'zipzip', gor: true, ms: 10 },
        ],
      },
    ],
    ugur: [0.2, 0.16],
    tam: { ugur: [0.554, 0.109], yerler: { kino: [0.32, 0.53, 0.16, 0.41], anne: [0.2, 0.05, 0.12, 0.88] } },
  },
  // s05: her dokunuşta bir parmak (bir, iki, üç); sonra Anne burnuna dokunur, kulaklar bir an kalkar.
  5: {
    katmanlar: [K('anne-kino', 'Anne ve Kino', [0.12, 0.12, 0.72, 0.84], 5)],
    anlar: [
      {
        id: 'parmak',
        dokun: ['anne-kino'],
        adimlar: [],
        sirali: [[{ k: 'anne-kino', poz: 2, ms: 10 }], [{ k: 'anne-kino', poz: 3, ms: 10 }], [{ k: 'anne-kino', poz: 4, ms: 900 }, { k: 'anne-kino', poz: 5, ef: 'esne', ms: 700 }, { k: 'anne-kino', poz: 4, ms: 10 }], [{ k: 'anne-kino', poz: 1, ms: 10 }]],
      },
    ],
    ugur: [0.3, 0.64],
    tam: { ugur: [0.288, 0.652], yerler: { 'anne-kino': [[0.54, 0.3, 0.2, 0.65], [0.44, 0.47, 0.1, 0.2], [0.27, 0.08, 0.23, 0.37]] } },
  },
  // s06: ayağıyla daire çizer; askıdaki resme bakar; çanta sallanır, içinden Kuzu "pat" diye düşer.
  6: {
    katmanlar: [
      K('kino', 'Kino', [0.34, 0.38, 0.26, 0.54], 6, { parcalar: { kuyruk: 3 } }),
      K('canta', 'Çanta', [0.66, 0.18, 0.14, 0.24], 4),
      K('kuzu', 'Kuzu', [0.67, 0.36, 0.1, 0.1], 2, { gizli: true, dokunulmaz: true }),
    ],
    bolgeler: { resim: [0.64, 0.04, 0.14, 0.12] },
    anlar: [
      { id: 'daire', dokun: ['kino'], adimlar: [2, 3, 4, 2, 3, 4].map((p): Adim => ({ k: 'kino', poz: p, ms: 230 })).concat([{ k: 'kino', poz: 1, ms: 10 }]) },
      { id: 'resim', dokun: ['bolge:resim'], adimlar: [{ k: 'kino', poz: 5, ms: 500 }, { k: 'kino', poz: 6, parca: ['kuyruk', 1], ms: 120 }, { k: 'kino', parca: ['kuyruk', 2], ms: 220 }, { k: 'kino', parca: ['kuyruk', 3], ms: 160 }, { k: 'kino', parca: ['kuyruk', 1], ms: 500 }, { k: 'kino', poz: 1, parca: ['kuyruk', 0], ms: 10 }] },
      {
        id: 'canta',
        dokun: ['canta'],
        adimlar: [
          { k: 'canta', poz: 2, ms: 200 },
          { k: 'canta', poz: 3, ms: 200 },
          { k: 'canta', poz: 2, ms: 200 },
          { k: 'canta', poz: 4, ms: 10 },
          { k: 'kuzu', poz: 1, gor: true, ms: 10 },
          { k: 'kuzu', kay: [0, 0.4], ms: 400 },
          { k: 'kuzu', poz: 2, ef: 'ez', efekt: 'pof', ms: 2800 },
          { k: 'kuzu', gor: false, ms: 300 },
          { k: 'kuzu', kay: [0, 0], ms: 10 },
          { k: 'canta', poz: 1, ms: 10 },
        ],
      },
    ],
    ugur: [0.14, 0.14],
    tam: { ugur: [0.313, 0.269], yerler: { kino: [0.39, 0.3, 0.17, 0.64], canta: [0.575, 0.32, 0.165, 0.46], 'bolge:resim': [0.46, 0.05, 0.075, 0.14] } },
  },
  // s07: Kino Kuzu'ya fısıldar, dikişli kulağını kaldırır; kuyruğu yavaşça kalkar.
  7: {
    katmanlar: [K('kino-kuzu', 'Kino ve Kuzu', [0.14, 0.2, 0.68, 0.74], 3, { parcalar: { kuyruk: 4 }, hep: ['kuyruk'] })],
    anlar: [
      { id: 'kuyruk', dokun: [], acilista: true, adimlar: [{ k: 'kino-kuzu', parca: ['kuyruk', 1], ms: 900 }, { k: 'kino-kuzu', parca: ['kuyruk', 2], ms: 800 }, { k: 'kino-kuzu', parca: ['kuyruk', 3], ms: 380 }, { k: 'kino-kuzu', parca: ['kuyruk', 4], ms: 380 }, { k: 'kino-kuzu', parca: ['kuyruk', 3], ms: 380 }, { k: 'kino-kuzu', parca: ['kuyruk', 4], ms: 380 }, { k: 'kino-kuzu', parca: ['kuyruk', 3], ms: 10 }] },
      { id: 'fisilda', dokun: ['kino-kuzu'], adimlar: [{ k: 'kino-kuzu', poz: 2, soz: { kim: 'kino', metin: '[whispers] Korkma, Kuzu. Bak.' }, ms: 1100 }, { k: 'kino-kuzu', poz: 3, ef: 'kipir', ms: 1000 }, { k: 'kino-kuzu', poz: 1, ms: 10 }] },
    ],
    ugur: [0.31, 0.9],
    tam: { ugur: [0.558, 0.826], yerler: { 'kino-kuzu': [0.37, 0.08, 0.51, 0.85] } },
  },
  // s08: Bulut'un kulakları bir an kalkar; Kino ilk bloğu uzatır; Bulut utanarak gülümser, yünü kabarır.
  8: {
    katmanlar: [K('kino', 'Kino', [0.14, 0.28, 0.3, 0.62], 4), K('bulut', 'Bulut', [0.62, 0.42, 0.26, 0.46], 4)],
    anlar: [
      { id: 'kulak', dokun: ['bulut'], adimlar: [{ k: 'bulut', poz: 2, ef: 'esne', ms: 700 }, { k: 'bulut', poz: 1, ms: 10 }] },
      {
        id: 'blok',
        dokun: ['kino'],
        adimlar: [{ k: 'kino', poz: 4, kay: [0.02, 0], ms: 220 }, { k: 'kino', poz: 2, kay: [0.04, 0], ms: 550 }, { k: 'kino', poz: 3, ms: 300 }, { k: 'bulut', poz: 3, ms: 600 }, { k: 'bulut', poz: 4, ef: 'esne', efekt: 'tink', ms: 800 }, { k: 'bulut', poz: 1, ms: 10, birlikte: true }, { k: 'kino', poz: 1, kay: [0, 0], ms: 10 }],
      },
    ],
    ugur: [0.5, 0.82],
    tam: { ugur: [0.473, 0.652], yerler: { kino: [0.59, 0.17, 0.23, 0.66], bulut: [0.2, 0.25, 0.24, 0.59] } },
  },
  // s09: kule bir sağa bir sola sallanır, devrilir (GÜM); Kino'nun kulakları dikilir; bloklar saçılır; sınıf döner.
  9: {
    katmanlar: [
      K('cocuklar', 'Sınıf', [0.6, 0.04, 0.36, 0.3], 2),
      K('kule', 'Kule', [0.4, 0.04, 0.18, 0.82], 3),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => K(`blok${i + 1}`, 'Blok', [0.42 + (i % 2) * 0.07, 0.08 + i * 0.09, 0.08, 0.08], 1, { kaynak: ['bloklar', i + 1], gizli: true, dokunulmaz: true, yerSabit: true })),
      K('kino', 'Kino', [0.06, 0.34, 0.28, 0.58], 3),
      K('bulut', 'Bulut', [0.66, 0.46, 0.26, 0.46], 2),
    ],
    anlar: [
      {
        id: 'gum',
        dokun: ['kule'],
        adimlar: [
          { k: 'kule', poz: 2, kay: [0.012, 0], ms: 230 },
          { k: 'kule', poz: 3, kay: [-0.012, 0], ms: 230 },
          { k: 'kule', poz: 2, kay: [0.012, 0], ms: 210 },
          { k: 'kule', poz: 3, kay: [-0.012, 0], ms: 210 },
          { k: 'kule', gor: false, kay: [0, 0], birlikte: true },
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Adim => ({ k: `blok${i + 1}`, gor: true, birlikte: true })),
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Adim => ({ k: `blok${i + 1}`, kay: [(i % 2 ? 1 : -1) * (0.06 + i * 0.035), 0.84 - 0.09 * i - 0.08], ms: 480, birlikte: true })),
          { k: 'ugur', kay: [-0.1, 0.5], ms: 480, birlikte: true },
          { ms: 480, efekt: 'pof' },
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Adim => ({ k: `blok${i + 1}`, ef: 'ez', birlikte: true })),
          { k: 'kino', poz: 2, birlikte: true },
          { k: 'bulut', poz: 2, birlikte: true },
          { k: 'cocuklar', poz: 2, ms: 350 },
          { k: 'kino', poz: 3, ef: 'esne', ms: 3000 },
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Adim => ({ k: `blok${i + 1}`, gor: false, birlikte: true })),
          { k: 'ugur', kay: [0, 0], birlikte: true },
          { k: 'kule', poz: 1, gor: true, birlikte: true },
          { k: 'kino', poz: 1, birlikte: true },
          { k: 'bulut', poz: 1, birlikte: true },
          { k: 'cocuklar', poz: 1, ms: 400 },
          ...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Adim => ({ k: `blok${i + 1}`, kay: [0, 0], birlikte: true })),
        ],
      },
    ],
    ugur: [0.49, 0.42],
    tam: { ugur: [0.393, 0.331], yerler: { kule: [[0.32, 0.07, 0.395, 0.85], [0.715, 0.13, 0.21, 0.79], [0.06, 0.37, 0.25, 0.57]] } },
  },
  // s10: çocuklar "Bir daha!" diye zıplar; Kino'nun kuyruğu pervane; Tombi bloğu ısırmaya kalkar, geri bırakır.
  10: {
    katmanlar: [
      K('zipzip', 'Zıpzıp', [0.16, 0.1, 0.18, 0.32], 2),
      K('tombi', 'Tombi', [0.62, 0.08, 0.24, 0.38], 4),
      K('mino', 'Mino', [0.06, 0.4, 0.22, 0.44], 2),
      K('kino', 'Kino', [0.38, 0.34, 0.24, 0.54], 3, { parcalar: { kuyruk: 4 } }),
      K('bulut', 'Bulut', [0.72, 0.44, 0.22, 0.42], 2),
    ],
    anlar: [
      {
        id: 'birdaha',
        dokun: ['mino', 'bulut', 'zipzip'],
        adimlar: [
          { soz: { kim: 'cocuklar', metin: 'Bir daha! Bir daha!' }, birlikte: true },
          { k: 'mino', poz: 2, ef: 'zipla', efekt: 'sicrama', ms: 140 },
          { k: 'bulut', poz: 2, ef: 'zipla', ms: 140 },
          { k: 'zipzip', poz: 2, ef: 'zipla', ms: 600 },
          { k: 'mino', poz: 2, ef: 'zipla', efekt: 'sicrama', ms: 140 },
          { k: 'bulut', poz: 2, ef: 'zipla', ms: 140 },
          { k: 'zipzip', poz: 2, ef: 'zipla', ms: 650 },
          { k: 'mino', poz: 1, birlikte: true },
          { k: 'bulut', poz: 1, birlikte: true },
          { k: 'zipzip', poz: 1, ms: 10 },
        ],
      },
      { id: 'kino', dokun: ['kino'], adimlar: [{ k: 'kino', poz: 2, ef: 'esne', ms: 500 }, { k: 'kino', poz: 1, ms: 80 }, ...pervane('kino', 3)] },
      { id: 'kuyruk', dokun: [], bosta: 6800, adimlar: pervane('kino', 3) },
      { id: 'tombi', dokun: ['tombi'], adimlar: [{ k: 'tombi', poz: 2, ms: 700 }, { k: 'tombi', poz: 3, ms: 800 }, { k: 'tombi', poz: 4, ef: 'ez', ms: 800 }, { k: 'tombi', poz: 1, ms: 10 }] },
    ],
    ugur: [0.52, 0.08],
    tam: { ugur: [0.41, 0.769], yerler: { mino: [0.22, 0.21, 0.18, 0.49], bulut: [0.74, 0.23, 0.2, 0.61], kino: [0.42, 0.22, 0.2, 0.54], tombi: [0.05, 0.42, 0.17, 0.46] } },
  },
  // s11: Kino iki parmağını kaldırır, kuyruğu sallanır; pişiler tek tek arkadaşların eline geçer; Tombi tek lokmada.
  11: {
    katmanlar: [
      K('tombi', 'Tombi', [0.74, 0.04, 0.22, 0.3], 4),
      K('bulut', 'Bulut', [0.06, 0.34, 0.24, 0.38], 2),
      K('kino', 'Kino', [0.36, 0.3, 0.28, 0.42], 3, { parcalar: { kuyruk: 3 } }),
      K('mino', 'Mino', [0.7, 0.34, 0.24, 0.38], 2),
      ...[0, 1, 2].map((i) => K(`pisi${i + 1}`, 'Pişi', [0.47, 0.66, 0.07, 0.06], 1, { kaynak: ['pisi', 1], gizli: true, dokunulmaz: true, yerSabit: true })),
    ],
    bolgeler: { kutu: [0.4, 0.64, 0.2, 0.16] },
    anlar: [
      { id: 'parmak', dokun: ['kino'], adimlar: [{ k: 'kino', poz: 2, ef: 'esne', ms: 500 }, { k: 'kino', poz: 3, parca: ['kuyruk', 1], ms: 200 }, ...[2, 3, 2, 1, 2, 3].map((p): Adim => ({ k: 'kino', parca: ['kuyruk', p], ms: 190 })), { k: 'kino', poz: 1, parca: ['kuyruk', 0], ms: 10 }] },
      {
        id: 'pisi',
        dokun: ['bolge:kutu'],
        adimlar: [],
        sirali: [
          [{ k: 'pisi1', gor: true, ms: 10 }, { k: 'pisi1', kay: [-0.3, -0.12], efekt: 'ucus', ms: 450 }, { k: 'pisi1', gor: false, birlikte: true }, { k: 'bulut', poz: 2, ef: 'esne', ms: 10 }],
          [{ k: 'pisi2', gor: true, ms: 10 }, { k: 'pisi2', kay: [0.32, -0.12], efekt: 'ucus', ms: 450 }, { k: 'pisi2', gor: false, birlikte: true }, { k: 'mino', poz: 2, ef: 'esne', ms: 10 }],
          [{ k: 'pisi3', gor: true, ms: 10 }, { k: 'pisi3', kay: [0.36, -0.46], efekt: 'ucus', ms: 500 }, { k: 'pisi3', gor: false, birlikte: true }, { k: 'tombi', poz: 2, ms: 500 }, { k: 'tombi', poz: 3, ef: 'ez', efekt: 'vicik', ms: 700 }, { k: 'tombi', poz: 4, ms: 260 }, { k: 'tombi', poz: 3, ms: 200 }, { k: 'tombi', poz: 4, ms: 260 }, { k: 'tombi', poz: 1, ms: 10 }],
          [...[1, 2, 3].map((i): Adim => ({ k: `pisi${i}`, kay: [0, 0], birlikte: true })), { k: 'bulut', poz: 1, birlikte: true }, { k: 'mino', poz: 1, ms: 10 }],
        ],
      },
    ],
    ugur: [0.46, 0.82],
    tam: { ugur: [0.508, 0.406], yerler: { kino: [[0.69, 0.18, 0.18, 0.7], [0.615, 0.33, 0.075, 0.09]], 'bolge:kutu': [0.48, 0.42, 0.21, 0.25] } },
  },
  // s12: Anne el sallar, Kino dönmez; Kino son bloğu koyar (kule yıkılmaz), döner ve kulakları uçuşarak Anne'ye koşar.
  12: {
    katmanlar: [K('anne', 'Anne', [0.02, 0.12, 0.28, 0.84], 3), K('kino', 'Kino', [0.56, 0.18, 0.24, 0.66], 6), K('blok', 'Blok', [0.6, 0.12, 0.08, 0.07], 1, { gizli: true, dokunulmaz: true, yerSabit: true })],
    anlar: [
      { id: 'el', dokun: ['anne'], adimlar: [2, 3, 2, 3].map((p): Adim => ({ k: 'anne', poz: p, ms: 230 })).concat([{ k: 'anne', poz: 1, ms: 10 }]) },
      {
        id: 'blok',
        dokun: ['kino'],
        adimlar: [
          { k: 'blok', gor: true, ms: 10 },
          { k: 'blok', kay: [0.04, -0.06], ms: 420 },
          { k: 'blok', ef: 'ez', efekt: 'tink', birlikte: true },
          { k: 'kino', poz: 2, ef: 'esne', ms: 700 },
          { k: 'kino', poz: 3, ms: 500 },
          { k: 'kino', poz: 4, kay: [-0.1, 0], ms: 190 },
          { k: 'kino', poz: 5, kay: [-0.2, 0], ms: 190 },
          { k: 'kino', poz: 4, kay: [-0.3, 0], ms: 190 },
          { k: 'kino', poz: 5, kay: [-0.38, 0], ms: 190 },
          { k: 'kino', poz: 6, ef: 'ez', ms: 2600 },
          { k: 'kino', poz: 1, kay: [0, 0], birlikte: true },
          { k: 'blok', gor: false, ms: 10 },
          { k: 'blok', kay: [0, 0], ms: 10 },
        ],
      },
    ],
    ugur: [0.67, 0.06],
    tam: { ugur: [0.242, 0.369], yerler: { anne: [0.64, 0.2, 0.28, 0.67], kino: [[0.33, 0.36, 0.21, 0.53], [0.21, 0.39, 0.065, 0.53]] } },
  },
  // s13: Lokum Kuzu'ya sarılır; her dokunuşta Kino bir parmağını açar; Lokum her parmakta kıkırdar.
  13: {
    katmanlar: [K('kino-lokum', 'Kino ve Lokum', [0.14, 0.2, 0.66, 0.76], 6)],
    anlar: [
      {
        id: 'parmak',
        dokun: ['kino-lokum'],
        adimlar: [],
        sirali: [
          [{ k: 'kino-lokum', poz: 2, ef: 'kipir', ms: 10 }],
          [{ k: 'kino-lokum', poz: 3, ef: 'kipir', ms: 10 }],
          [{ k: 'kino-lokum', poz: 4, ef: 'kipir', ms: 900 }, { k: 'kino-lokum', poz: 5, ef: 'ez', ms: 1000 }, { k: 'kino-lokum', poz: 6, ms: 10 }],
          [{ k: 'kino-lokum', poz: 1, ms: 10 }],
        ],
      },
    ],
    ugur: [0.86, 0.72],
    tam: { ugur: [0.865, 0.53], yerler: { 'kino-lokum': [0.29, 0.18, 0.46, 0.74] } },
  },
  // s14: Kino'nun burnu nefesle kıpırdar, sarkık kulağı sallanır; Baba hırka örter; Lokum bir gözünü açıp kapar.
  14: {
    katmanlar: [
      K('baba', 'Baba', [0.02, 0.16, 0.3, 0.58], 3),
      K('kino', 'Kino', [0.28, 0.44, 0.36, 0.26], 2, { parcalar: { kulak: 3 }, hep: ['kulak'], ana: 2 }),
      K('hirka', 'Hırka', [0.36, 0.42, 0.18, 0.14], 1, { gizli: true, dokunulmaz: true, yerSabit: true }),
      K('lokum', 'Lokum', [0.7, 0.32, 0.24, 0.34], 2),
    ],
    anlar: [
      { id: 'nefes', dokun: [], bosta: 3800, adimlar: [{ k: 'kino', ef: 'nefes', parca: ['kulak', 2], ms: 700 }, { k: 'kino', parca: ['kulak', 1], ms: 500 }, { k: 'kino', parca: ['kulak', 3], ms: 500 }, { k: 'kino', parca: ['kulak', 1], ms: 10 }] },
      { id: 'mirilda', dokun: ['kino'], adimlar: [{ k: 'kino', ef: 'nefes', soz: { kim: 'kino', metin: '[sleepy] Önce oyun...' }, ms: 1600 }] },
      { id: 'ort', dokun: ['baba'], adimlar: [{ k: 'baba', poz: 2, ms: 800 }, { k: 'hirka', gor: true, ef: 'ez', ms: 600 }, { k: 'baba', poz: 3, ms: 3500 }, { k: 'hirka', gor: false, birlikte: true }, { k: 'baba', poz: 1, ms: 10 }] },
      { id: 'goz', dokun: ['lokum'], adimlar: [{ k: 'lokum', poz: 2, ms: 550 }, { k: 'lokum', poz: 1, ms: 300 }, { k: 'lokum', poz: 2, ms: 450 }, { k: 'lokum', poz: 1, ms: 10 }] },
    ],
    ugur: [0.5, 0.05],
    tam: { ugur: [0.448, 0.131], yerler: { kino: [0.44, 0.46, 0.19, 0.49], baba: [0.66, 0.25, 0.25, 0.7], lokum: [0.285, 0.5, 0.12, 0.42] } },
  },
};
