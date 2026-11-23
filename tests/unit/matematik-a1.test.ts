import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// Matematik · Paket Matematik-A1: brief'teki her kare ya kaynağı mevcut bir resmin a1-kareler.ts ad kuralına uyan karesi
// (`<resim>-goz`, `-saskin`, `-sevinc`, `-hop-0…2`, `-bos-0…1`; kod kaynağın üstünde kendiliğinden bağlar), ya cila.ts'in efekt
// karesi, ya da Top Şelalesi'nin topu. Boşa kare yok; sayfa başına en çok 8.
const mesajlar = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = mesajlar.indexOf('Paket Matematik-A1 "Matematik canlı');
const son = mesajlar.indexOf('\n## ', bas + 10);
const BRIEF = bas < 0 ? '' : mesajlar.slice(bas, son < 0 ? undefined : son);
const KOD = ['a1-kareler.ts', 'cila.ts', 'misket-cizim.ts'].map((f) => readFileSync('matematik/src/' + f, 'utf8')).join('\n');

/** Brief'in sayfalarındaki kare adları (`ad-0…2` açılır). */
function kareler() {
  const adlar: string[] = [];
  const govde = BRIEF.slice(BRIEF.indexOf('### Sayfa 0'));
  for (const m of govde.matchAll(/^- `([a-z0-9][a-z0-9/-]*?)(?:-(\d)…(\d))?`/gm)) {
    const [, ad, a, b] = m;
    if (a !== undefined) for (let i = Number(a); i <= Number(b); i++) adlar.push(ad + '-' + i);
    else adlar.push(ad);
  }
  return adlar;
}
const KURAL = /^(.*)-(goz|saskin|sevinc|hop-[0-2]|bos-[01])$/;
const kaynak = (ad: string) => 'assets/matematik/' + ad + '.webp';

describe('Matematik-A1 kareleri', () => {
  const adlar = kareler();
  it('brief bulundu; Deney-Y3\'ten sonra; yüzlerce kare; sayfa başına en çok 8 ve toplam tutuyor', () => {
    expect(BRIEF).toContain("Deney-Y3'ten sonra");
    expect(adlar.length).toBeGreaterThanOrEqual(200);
    expect(new Set(adlar).size).toBe(adlar.length);
    const sayfalar = [...BRIEF.matchAll(/^### Sayfa \d+ · .*\((\d+)\)$/gm)].map((m) => Number(m[1]));
    for (const n of sayfalar) expect(n).toBeLessThanOrEqual(8);
    expect(sayfalar.reduce((a, b) => a + b, 0)).toBe(adlar.length);
    expect(BRIEF).toContain('(' + adlar.length + ' kare');
  });
  it('her karenin kaynağı var ya da kodun bildiği yeni bir kare (efekt, top)', () => {
    const sahipsiz = adlar.filter((ad) => {
      if (ad.startsWith('efekt/')) return !/^efekt\/(yildiz-[0-2]|pof-[01]|nokta-[01])$/.test(ad);
      if (ad.startsWith('top-selalesi/')) return !KOD.includes("topCizimi('" + ad.split('/')[1] + "')");
      const m = KURAL.exec(ad);
      return !m || !existsSync(kaynak(m[1]));
    });
    expect(sahipsiz).toEqual([]);
  });
  it('kod ad kuralını ve efektleri tanıyor', () => {
    for (const ek of ["'-goz'", "'-sevinc'", "'-saskin'", "'-hop'", "'-bos'"]) expect(KOD).toContain(ek);
    for (const e of ["efektDizi('yildiz', 3)", "efektDizi('pof', 2)", "efektDizi('nokta', 2)"]) expect(KOD).toContain(e);
  });
});
