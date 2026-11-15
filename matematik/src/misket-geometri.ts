// Boyuna ölçü iki bağlantı pimi arasındaki açıklıktır. Raf ve pist aynı çizimi kullanır.
export const BIRIM = 78;
export const DUSUS = 5.6;
export const GOZ = 10;
export const KAT = 3;
export const raylar = {
  kisa: { birim: 1, ad: 'Bir birimlik kısa ray', renk: '#ff9b80' },
  uzun: { birim: 2, ad: 'İki birimlik düz ray', renk: '#ffc763' },
  vadi: { birim: 2, ad: 'İki birimlik müzikli vadi', renk: '#ae96e1' },
  halka: { birim: 3, ad: 'Üç birimlik çember', renk: '#6ed3c5' },
} as const;
export type Tip = keyof typeof raylar;
export type Parca = { kat: number; goz: number; tip: Tip };
export type Nokta = { x: number; y: number };
export const yon = (kat: number) => (kat % 2 === 0 ? 1 : -1);
export const pim = (kat: number, goz: number): Nokta => ({
  x: (kat % 2 === 0 ? 168 : 948) + yon(kat) * goz * BIRIM,
  y: 96 + kat * 127 + goz * DUSUS,
});
const ornekle = (adet: number, hesap: (t: number) => Nokta) =>
  Array.from({ length: adet + 1 }, (_, i) => hesap(i / adet));

export function yerelRay(tip: Tip): Nokta[] {
  const en = raylar[tip].birim * BIRIM;
  const nokta = (x: number, dy: number) => ({ x, y: (x * DUSUS) / BIRIM + dy });
  if (tip === 'halka') {
    // Giriş ve çıkışta teğet aynı. Ayrı birimlere bölündüğünde ek yerinde basamak oluşmaz.
    const merkez = en / 2,
      r = 33;
    const halka = ornekle(110, (t) => {
      const aci = 2 * Math.PI * t;
      return nokta(merkez + r * Math.sin(aci), -r * (1 - Math.cos(aci)));
    });
    return [nokta(0, 0), ...halka, nokta(en, 0)];
  }
  return ornekle(tip === 'vadi' ? 48 : 1, (t) =>
    nokta(t * en, tip === 'vadi' ? 23 * Math.sin(t * Math.PI) ** 2 : 0),
  );
}

export function rayYolu(p: Parca): Nokta[] {
  const bas = pim(p.kat, p.goz);
  return yerelRay(p.tip).map((n) => ({ x: bas.x + yon(p.kat) * n.x, y: bas.y + n.y }));
}
export function donus(kat: number) {
  const a = pim(kat, GOZ),
    b = pim(kat + 1, 0),
    uzanti = 98;
  return ornekle(55, (t) => {
    const u = 1 - t,
      kol = (uzanti * DUSUS) / BIRIM;
    return {
      x: a.x + yon(kat) * 3 * u * t * uzanti,
      y: u ** 3 * a.y + 3 * u * u * t * (a.y + kol) + 3 * u * t * t * (b.y - kol) + t ** 3 * b.y,
    };
  });
}
export const giris = [{ x: 104, y: 91.4 }, pim(0, 0)];
const cikisBasi = pim(2, GOZ);
export const cikis = ornekle(25, (t) => ({
  x: cikisBasi.x + 79 * t,
  y: cikisBasi.y + 5.67 * t + 13 * t ** 2,
}));
export function sigar(plan: Parca[], p: Parca) {
  const son = p.goz + raylar[p.tip].birim;
  return (
    Number.isInteger(p.kat) &&
    p.kat >= 0 &&
    p.kat < KAT &&
    Number.isInteger(p.goz) &&
    p.goz >= 0 &&
    son <= GOZ &&
    plan.every((q) => q.kat !== p.kat || q.goz >= son || q.goz + raylar[q.tip].birim <= p.goz)
  );
}
export function planOku(veri: unknown): Parca[] | null {
  if (!Array.isArray(veri) || veri.length > KAT * GOZ) return null;
  const sonuc: Parca[] = [];
  for (const p of veri) {
    if (!p || typeof p.tip !== 'string' || !Object.hasOwn(raylar, p.tip) || !sigar(sonuc, p)) return null;
    sonuc.push({ kat: p.kat, goz: p.goz, tip: p.tip });
  }
  return sonuc;
}
export function ilkPlan(): Parca[] {
  const sablon: Tip[][] = [
    ['uzun', 'kisa', 'vadi', 'kisa', 'halka', 'kisa'],
    ['kisa', 'halka', 'uzun', 'vadi', 'uzun'],
    ['vadi', 'kisa', 'halka', 'uzun', 'uzun'],
  ];
  const boslar = [[2, 3], [4, 6], [3, 6]];
  return sablon.flatMap((tipler, kat) => {
    let goz = 0;
    return tipler.flatMap((tip) => {
      const bas = goz;
      goz += raylar[tip].birim;
      return boslar[kat].includes(bas) ? [] : [{ kat, goz: bas, tip }];
    });
  });
}
export type Isaret = {
  mesafe: number;
  tur: 'ek' | 'vadi' | 'halka' | 'cark' | 'can';
  kat: number;
  goz: number;
};
export function guzergah(plan: Parca[]) {
  const hat: { n: Nokta; mesafe: number }[] = [],
    isaretler: Isaret[] = [];
  let mesafe = 0;
  function ekle(noktalar: Nokta[], yatayYon?: number) {
    for (const [i, temas] of noktalar.entries()) {
      const once = noktalar[Math.max(0, i - 1)],
        sonra = noktalar[Math.min(noktalar.length - 1, i + 1)];
      const dx = sonra.x - once.x,
        dy = sonra.y - once.y,
        uzun = Math.hypot(dx, dy);
      const n =
        yatayYon && uzun
          ? { x: temas.x + (10 * dy * yatayYon) / uzun, y: temas.y - (10 * dx * yatayYon) / uzun }
          : { x: temas.x, y: temas.y - 10 };
      const onceki = hat.at(-1)?.n;
      if (onceki) {
        const fark = Math.hypot(n.x - onceki.x, n.y - onceki.y);
        if (fark < 0.00001) continue;
        mesafe += fark;
      }
      hat.push({ n, mesafe });
    }
  }
  ekle(giris, 1);
  for (let kat = 0; kat < KAT; kat++) {
    let goz = 0;
    while (goz < GOZ) {
      const p = plan.find((q) => q.kat === kat && q.goz === goz);
      if (!p) return { hat, isaretler, mesafe, bos: { kat, goz } };
      const bas = mesafe;
      ekle(rayYolu(p), yon(kat));
      const tur = p.tip === 'kisa' || p.tip === 'uzun' ? 'ek' : p.tip;
      isaretler.push({ mesafe: (bas + mesafe) / 2, kat, goz, tur });
      goz += raylar[p.tip].birim;
    }
    if (kat + 1 < KAT) {
      const bas = mesafe;
      ekle(donus(kat));
      isaretler.push({ mesafe: (bas + mesafe) / 2, kat, goz, tur: kat === 0 ? 'cark' : 'can' });
    }
  }
  ekle(cikis, 1);
  return { hat, isaretler, mesafe, bos: null };
}
