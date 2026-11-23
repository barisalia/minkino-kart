import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KINO_DOSYALARI, ORTAK_DOSYALAR, cizimKlasoru } from '../../doktor/src/vaka-kit/ortak';
import { VAKA, VAKA_DOSYALAR } from '../../doktor/src/vaka/veri';
import { ATES_DOSYALAR } from '../../doktor/src/vaka-ates/veri';
import { BOYA_DOSYALAR } from '../../doktor/src/vaka-boya/veri';
import { HAPSU_DOSYALAR } from '../../doktor/src/vaka-hapsu/veri';
import { KANAT_DOSYALAR } from '../../doktor/src/vaka-kanat/veri';
import { KARIN_DOSYALAR } from '../../doktor/src/vaka-karin/veri';
import { BOCEK_DOSYALAR, PAYLASILAN } from '../../doktor/src/vaka-bocek/veri';
import { KUZU_DOSYALAR } from '../../doktor/src/vaka-kuzu/veri';
import { CINGIRAK_DOSYALAR } from '../../doktor/src/vaka-cingirak/veri';

// Minik Doktor · her vaka yalnız kendi çizimini yükler (yöneticinin 23 Kasım uyarısı). Dikenli Pati'nin klasörüne
// (assets/doktor/vaka/) yalnız adı açıkça verilen ortak parçalar için gidilir. A1 bağlandığı için orada kalp-0, su-akis-0,
// parilti-0 gibi genel adlar da var; aynı adı kullanan bir vaka o çizimi açmamalı, eksik çizim denetimini de geçmemeli.

const VAKALAR = [
  { ad: 'Y3 ateş', klasor: 'ates', dosyalar: ATES_DOSYALAR, sahne: 'doktor/src/vaka-ates/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y4 boya', klasor: 'boya', dosyalar: BOYA_DOSYALAR, sahne: 'doktor/src/vaka-boya/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y5 hapşırık', klasor: 'hapsu', dosyalar: HAPSU_DOSYALAR, sahne: 'doktor/src/vaka-hapsu/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y6 kanat', klasor: 'kanat', dosyalar: KANAT_DOSYALAR, sahne: 'doktor/src/vaka-kanat/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y7 karın', klasor: 'karin', dosyalar: KARIN_DOSYALAR, sahne: 'doktor/src/vaka-karin/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y8 kuzu', klasor: 'kuzu', dosyalar: KUZU_DOSYALAR, sahne: 'doktor/src/vaka-kuzu/sahne.ts', paylasilan: [] as readonly string[] },
  { ad: 'Y9 böcek', klasor: 'bocek', dosyalar: BOCEK_DOSYALAR, sahne: 'doktor/src/vaka-bocek/sahne.ts', paylasilan: PAYLASILAN },
  { ad: 'Y10 çıngırak', klasor: 'cingirak', dosyalar: CINGIRAK_DOSYALAR, sahne: 'doktor/src/vaka-cingirak/sahne.ts', paylasilan: [] as readonly string[] },
];
const y1Klasoru = existsSync('assets/doktor/vaka') ? readdirSync('assets/doktor/vaka').filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)) : [];

describe('çizim klasörü: her vaka yalnız kendi çizimini yükler', () => {
  it('ortak parçalar ve Kino Dikenli Pati\'den; geri kalan her ad vakanın kendi klasöründen', () => {
    for (const ad of [...ORTAK_DOSYALAR, ...KINO_DOSYALARI]) expect(cizimKlasoru(ad, 'ates'), ad).toBe('vaka');
    // A1'in genel adları (Dikenli Pati'nin klasöründe olsa da) başka vakaya açılmaz
    for (const ad of ['kalp-0', 'su-akis-0', 'parilti-0', 'buyutec', 'stetoskop']) expect(cizimKlasoru(ad, 'karin'), ad).toBe('karin');
    // yalnız açıkça paylaşılan çizim: Y9'da Y1'in büyüteci
    expect(cizimKlasoru(VAKA.buyutec, 'bocek', PAYLASILAN)).toBe('vaka');
  });
  for (const v of VAKALAR) {
    it(`${v.ad}: bütün çizimleri kendi klasöründen (${v.klasor}); Dikenli Pati'de aynı adlı çizim olsa da`, () => {
      const yanlis = v.dosyalar.filter(ad => cizimKlasoru(ad, v.klasor, v.paylasilan) !== v.klasor);
      expect(yanlis, 'ortak sayılan kendi çizimi').toEqual([]);
      // aynı ad Dikenli Pati'nin klasöründe de varsa: eskiden yanlışlıkla oradan açılırdı; artık açılmaz (bilgi için listelenir)
      const ayniAd = v.dosyalar.filter(ad => y1Klasoru.includes(ad) || VAKA_DOSYALAR.includes(ad));
      for (const ad of ayniAd) expect(cizimKlasoru(ad, v.klasor, v.paylasilan), ad).toBe(v.klasor);
    });
  }
  it('çözümleyiciler cizimKlasoru\'nu kullanır; koşulsuz "?? vaka/" yedeği yok', () => {
    const iskelet = readFileSync('doktor/src/vaka-kit/iskelet.ts', 'utf8');
    expect(iskelet).toMatch(/const gercekAdres = [^\n]*cizimKlasoru\(ad, klasor, paylasilan\)/);
    expect(iskelet).not.toMatch(/\?\? vakaDosyalari\[`\.\.\/\.\.\/\.\.\/assets\/doktor\/vaka\//);
    for (const yol of ['doktor/src/vaka-ates/sahne.ts', 'doktor/src/vaka-boya/sahne.ts']) {
      const s = readFileSync(yol, 'utf8');
      expect(s, yol).toMatch(/const gercek = [^\n]*cizimKlasoru\(ad, '(ates|boya)'\) === 'vaka'/);
      expect(s, yol).not.toMatch(/\?\? ortakDosyalar\[/);
    }
    // iskeletli vakalar eksik denetimini ve yüklemeyi iskeletten alır (kendi yedekleri yok)
    for (const v of VAKALAR.slice(2)) expect(readFileSync(v.sahne, 'utf8'), v.ad).toContain(`eksikCizimleri('${v.klasor}'`);
  });
});
