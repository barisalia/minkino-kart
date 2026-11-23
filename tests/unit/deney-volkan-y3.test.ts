import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Deneyler · Köpüren Renk Volkanı, Paket Deney-Y3 ikinci yazım: kodun istediği her çizim Astra'nın brief'inde; brief'teki her
// çizimi kod kullanır (boşa çizim yok, gelen çizim kendiliğinden bağlanır); sayfa başına en çok 8 çizim.
// Brief: CLAUDE-ASTRA-MESAJLAR.md → 'Paket Deney-Y3 "Köpüren Renk Volkanı" ikinci yazım'.
const KOD = ['main.ts', 'cizimler.ts'].map((f) => readFileSync('deney/src/volkan/' + f, 'utf8')).join('\n');
const mesajlar = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = mesajlar.indexOf('Paket Deney-Y3 "Köpüren Renk Volkanı" ikinci yazım');
const son = mesajlar.indexOf('\n## ', bas + 10);
const BRIEF = bas < 0 ? '' : mesajlar.slice(bas, son < 0 ? undefined : son);

const aralik = (ad: string, n: number) => Array.from({ length: n }, (_, i) => ad + '-' + i);
/** Brief'teki çizim adları (`ad`, `ad-0…2` dizileri açılır; dosya yolları hariç). */
function briefAdlari() {
  const adlar = new Set<string>();
  for (const m of BRIEF.matchAll(/`([a-z0-9][a-z0-9-]*?)(?:-(\d)…(\d))?`/g)) {
    const [, ad, a, b] = m;
    if (a !== undefined) for (let i = Number(a); i <= Number(b); i++) adlar.add(ad + '-' + i);
    else adlar.add(ad);
  }
  return adlar;
}
/** Kodun istediği çizim adları. */
function kodAdlari() {
  const adlar = new Set<string>();
  for (const m of KOD.matchAll(/(?:resimEl|cizim|var_)\('([a-z0-9-]+)'/g)) adlar.add(m[1]);
  for (const m of KOD.matchAll(/dizi\('([a-z0-9-]+)',\s*(\d)/g)) for (const a of aralik(m[1], Number(m[2]))) adlar.add(a);
  for (const m of KOD.matchAll(/new Efekt\('([a-z0-9-]+)',\s*(\d)/g)) {
    if (m[2] === '1') adlar.add(m[1]); else for (const a of aralik(m[1], Number(m[2]))) adlar.add(a);
  }
  // Köpük dizileri, giyinme dizileri.
  const kopuk = /KOPUK_DIZI = \{([^}]+)\}/.exec(KOD)![1];
  for (const m of kopuk.matchAll(/(\w+): (\d)/g)) for (const a of aralik('kopuk-' + m[1], Number(m[2]))) adlar.add(a);
  const giyinme = /GIYINME = \{([^}]+)\}/.exec(KOD)![1];
  for (const m of giyinme.matchAll(/'([a-z-]+)': (\d)/g)) for (const a of aralik(m[1], Number(m[2]))) adlar.add(a);
  // Pozlar ve yedekleri, açık listeler (sünger, defter, temel takım).
  for (const m of KOD.matchAll(/'((?:kino|lokum)-[a-z0-9-]+)'/g)) adlar.add(m[1]);
  for (const liste of [/\['sunger', 'sunger-ez'\]/, /DEFTER_KARE = \[([^\]]+)\]/, /TEMEL = \[([^\]]+)\]/]) {
    const m = liste.exec(KOD);
    if (m) for (const s of m[0].matchAll(/'([a-z0-9-]+)'/g)) adlar.add(s[1]);
  }
  // Birleştirerek kurulan adlar.
  for (const r of ['kirmizi', 'sari', 'mavi']) adlar.add('sise-' + r);
  for (const a of [...aralik('birikinti', 3), ...aralik('kabarcik', 3)]) adlar.add(a);
  for (const ad of [...adlar]) if (ad.endsWith('-')) adlar.delete(ad);
  // Giyinme dizilerinin gövdesi (kino-onluk → kino-onluk-0…2) kendisi çizim değil.
  for (const m of giyinme.matchAll(/'([a-z-]+)': \d/g)) adlar.delete(m[1]);
  return adlar;
}

describe('Köpüren Renk Volkanı · Deney-Y3 ikinci yazım çizimleri', () => {
  const brief = briefAdlari(), kod = kodAdlari();
  it('brief bulundu; 1 anahtar kare + 119 parça; sayfa başına en çok 8', () => {
    expect(BRIEF.length).toBeGreaterThan(5000);
    expect(BRIEF).toContain("00:24 kaydının yerine geçer");
    expect(BRIEF).toContain("Deney-A1'den sonra");
    expect(brief.size).toBe(119);
    const sayfalar = [...BRIEF.matchAll(/^### Sayfa (\d+) · [^\n]*?\((\d+)(?:,[^)]*)?\)/gm)].map((m) => Number(m[2]));
    expect(sayfalar).toHaveLength(19);
    for (const n of sayfalar) expect(n).toBeLessThanOrEqual(8);
    expect(sayfalar.reduce((a, b) => a + b, 0)).toBe(120);
  });
  it('kodun istediği her çizim brief\'te', () => {
    expect([...kod].filter((ad) => !brief.has(ad))).toEqual([]);
  });
  it('brief\'teki her çizimi kod kullanır', () => {
    expect([...brief].filter((ad) => !kod.has(ad))).toEqual([]);
  });
});
