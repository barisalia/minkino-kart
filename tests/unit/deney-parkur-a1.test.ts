import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// Deneyler · Top Parkuru, Paket Deney-A1: kodun istediği her çizim ya Y1'den mevcut ya da Astra'nın brief'inde; brief'teki her
// çizimi kod kullanır (boşa çizim yok, gelen çizim kendiliğinden bağlanır). Brief: CLAUDE-ASTRA-MESAJLAR.md → "Paket Deney-A1".
const KOD = ['sahne.ts', 'harita.ts', 'bolumler.ts', 'cizimler.ts', 'main.ts'].map((f) => readFileSync('deney/src/parkur/' + f, 'utf8')).join('\n');
const mesajlar = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = mesajlar.indexOf('Paket Deney-A1 "Top Parkuru elit');
const son = mesajlar.indexOf('\n## ', bas + 10);
const BRIEF = mesajlar.slice(bas, son < 0 ? undefined : son);
const mevcut = (ad: string) => existsSync('assets/deney/parkur/' + ad + '.webp');

/** Brief'teki çizim adları (`ad`, `ad-0…3` dizileri açılır; anahtar kare dosyaları ve klasörler hariç). */
function briefAdlari() {
  const adlar = new Set<string>();
  for (const m of BRIEF.matchAll(/`([a-z0-9][a-z0-9-]*?)(?:-(\d)…(\d))?`/g)) {
    const [, ad, a, b] = m;
    if (a !== undefined) for (let i = Number(a); i <= Number(b); i++) adlar.add(ad + '-' + i);
    else adlar.add(ad);
  }
  // Metin içinde "ve" ile sayılanlar (`yildiz-bos` ve `yildiz-dolu`) yukarıda zaten tek tek yakalanır.
  return adlar;
}
/** Kodun istediği çizim adları (sabit adlar, diziler, bölüm parçaları, karakter pozları, haritanın durakları). */
function kodAdlari() {
  const adlar = new Set<string>();
  for (const m of KOD.matchAll(/(?:resimEl|var_|cizim)\('([a-z0-9-]+)'/g)) adlar.add(m[1]);
  for (const m of KOD.matchAll(/dizi\('([a-z0-9-]+)',\s*(\d)/g)) for (let i = 0; i < Number(m[2]); i++) adlar.add(m[1] + '-' + i);
  for (const m of KOD.matchAll(/efektGoster\('([a-z0-9-]+)',\s*(\d)/g)) {
    if (m[2] === '1') adlar.add(m[1]); else for (let i = 0; i < Number(m[2]); i++) adlar.add(m[1] + '-' + i);
  }
  for (const m of KOD.matchAll(/(?:cizim|fon): '([a-z0-9-]+)'/g)) adlar.add(m[1]);
  for (const m of KOD.matchAll(/new Kareler\(\[([^\]]+)\]/g)) for (const s of m[1].matchAll(/'([a-z0-9-]+)'/g)) adlar.add(s[1]);
  for (const m of KOD.matchAll(/'((?:kino|ceren)-[a-z0-9-]+)': '/g)) adlar.add(m[1]);
  for (let i = 1; i <= 6; i++) adlar.add('durak-' + i);
  for (let g = 1; g <= 3; g++) adlar.add('yay-ayar-' + g);
  adlar.delete('mega-fon');
  // Birleştirerek kurulan adların gövdesi ("'durak-' + no") ayrıca sayıldı; kendisi çizim değil.
  for (const ad of [...adlar]) if (ad.endsWith('-')) adlar.delete(ad);
  return adlar;
}

describe('Top parkuru · Deney-A1 çizimleri', () => {
  const brief = briefAdlari(), kod = kodAdlari();
  it('brief bulundu ve 150 çizim adı taşıyor', () => {
    expect(BRIEF.length).toBeGreaterThan(2000);
    expect(brief.size).toBeGreaterThanOrEqual(140);
  });
  it('kodun istediği her çizim Y1\'den mevcut ya da A1 brief\'inde', () => {
    const eksik = [...kod].filter((ad) => !mevcut(ad) && !brief.has(ad));
    expect(eksik).toEqual([]);
  });
  it('brief\'teki her çizimi kod kullanır (anahtar kareler ve mevcutlar hariç)', () => {
    // Kod adı değişkenle de kurabilir (kare dizisi tablosu, koşullu ad): adın ya da dizinin gövdesi kodda dize olarak geçmeli.
    const kodda = (ad: string) => kod.has(ad) || KOD.includes("'" + ad + "'") || KOD.includes("'" + ad.replace(/-\d+$/, '') + "'");
    const bos = [...brief].filter((ad) => !kodda(ad) && !/^anahtar-/.test(ad) && !mevcut(ad) && !ad.includes('/') && !ad.endsWith('.png'));
    expect(bos).toEqual([]);
  });
});
