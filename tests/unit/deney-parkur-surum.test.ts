// Deneyler · bugünkü sürüm (yönetici 23 Kasım 18:10): parkur yalnız Deney-Y1 çizimleriyle açılır. Astra'nın Deney-A1 teslimi
// sürüm commit'ine kadar ekip/deney/a1-bekleyen/ altında bekler (bağlanmadı). Klasöre A1 dosyası düşerse harita ve öbür
// bölümler kendiliğinden açılırdı: bu test onu yakalar. Sürümden sonra A1 bağlanınca bu test güncellenir.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { var_ } from '../../deney/src/parkur/cizimler';
import { BOLUM_SAYISI, bolum } from '../../deney/src/parkur/bolumler';

const Y1 = ['ceren-alkis', 'ceren-bekle', 'ceren-gul', 'domino-kirmizi', 'domino-mavi', 'domino-sari', 'domino-yesil', 'kino-bekle-0', 'kino-bekle-1',
  'kino-saskin', 'kino-sevin', 'kol-sap', 'kol-taban', 'konfeti', 'parca-huni', 'parca-rampa', 'parca-trambolin', 'parkur-fon', 'top', 'yuva', 'zil-calar', 'zil'];
// sahne.ts → bolumCizimleri ile aynı kural (sahne.ts tarayıcı nesnelerine dokunduğu için burada kaynaktan denetlenir).
const TEMEL = ['top', 'kol-taban', 'kol-sap', 'yuva', 'domino-kirmizi', 'domino-sari', 'domino-yesil', 'domino-mavi', 'zil', 'zil-calar', 'konfeti',
  'kino-bekle-0', 'kino-bekle-1', 'kino-saskin', 'kino-sevin', 'ceren-bekle', 'ceren-alkis', 'ceren-gul'];
const bolumCizimleri = (no: number) => {
  const b = bolum(no);
  return [...TEMEL, ...(no === 6 ? ['mega-fon-1', 'mega-fon-2', 'can-kulesi'] : [b.fon]), ...b.parcalar.map((p) => p.cizim)];
};

describe('Deneyler · bu sürümde parkur yalnız Y1', () => {
  it('assets/deney/parkur içinde yalnız Y1\'in 22 çizimi var (A1 bekleme klasöründe)', () => {
    const adlar = readdirSync('assets/deney/parkur').filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')).sort();
    expect(adlar).toEqual([...Y1].sort());
  });
  it('testteki bölüm çizimi kuralı sahne.ts ile aynı', () => {
    const sahne = readFileSync('deney/src/parkur/sahne.ts', 'utf8');
    for (const ad of TEMEL) expect(sahne).toContain("'" + ad + "'");
    expect(sahne).toContain("b.no === 6 ? ['mega-fon-1', 'mega-fon-2', 'can-kulesi'] : [b.fon]");
  });
  it('1. bölüm açık; 2.–6. bölüm ve harita kapalı (çizimleri yok)', () => {
    expect(bolumCizimleri(1).every(var_)).toBe(true);
    for (let no = 2; no <= BOLUM_SAYISI; no++) expect(bolumCizimleri(no).every(var_), 'bölüm ' + no).toBe(false);
    expect(var_('harita-fon')).toBe(false);
  });
  it('A1 görünüş değişiklikleri devreye girmez (tepsisiz fon, iri kol, dönen top, çekmece yok)', () => {
    for (const ad of ['parkur-fon-1b', 'kol-buyuk-sap', 'kol-buyuk-taban', 'top-don-0', 'cekmece-ic']) expect(var_(ad), ad).toBe(false);
  });
});
