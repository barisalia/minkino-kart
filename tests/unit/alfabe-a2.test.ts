import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { ARAYUZ, SAKLANMA_YERLERI, YAZMA_EFEKT, arayuzKareleri, kapiKareAdlari } from '../../alfabe/src/a2-kareler';
import { A2_POZLARI, TEPKI_POZLARI } from '../../alfabe/src/ceren-tepki';
import { aileler, hareketAdi, yasamAlani } from '../../alfabe/src/hayvan-aileleri';

// Paket Harf-A2 (23 Kasım): Mıknatıslar, Hayvan çağır, Oku ve bul, Hece Evleri ve Yazma için çizilmiş kareler. Kareler gelene
// kadar eski hâl; kod beklediği adları brief'ten alır, yarım grup açılmaz.
const brief = () => { const t = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8'); return t.slice(t.lastIndexOf('Paket Harf-A2 ·')); };

describe('Paket Harf-A2', () => {
  it('hayvan adından hareket karesi adı (Türkçe harfler sadeleşir, boşluk tire)', () => {
    expect(hareketAdi('Nil timsahı')).toBe('nil-timsahi');
    expect(hareketAdi('Çita')).toBe('cita');
    expect(hareketAdi('İnek')).toBe('inek');
    expect(hareketAdi('Istakoz')).toBe('istakoz');
    expect(hareketAdi('Üveyik')).toBe('uveyik');
    expect(hareketAdi('Şahin')).toBe('sahin');
    expect(hareketAdi('Aslan')).toBe('aslan');
  });
  it('arayüz grubu ancak bütün parçaları varsa açılır', () => {
    expect(arayuzKareleri('okubul', (a) => (a === 'okubul-kart' ? 'u/' + a : undefined))).toBeUndefined();
    expect(arayuzKareleri('okubul', (a) => 'u/' + a)).toEqual(ARAYUZ.okubul.map((a) => 'u/' + a));
    expect(ARAYUZ.miknatis).toHaveLength(8);
  });
  it('Ceren\'in kalem pozları A1 pozlarıyla çakışmaz', () => {
    for (const p of A2_POZLARI) expect(TEPKI_POZLARI as readonly string[]).not.toContain(p);
  });
  it('kodun beklediği bütün dosya adları brief\'te; her hayvan ya oyunda ya brief\'te', () => {
    const b = brief();
    for (const ad of [...ARAYUZ.miknatis, ...ARAYUZ.okubul, ...YAZMA_EFEKT, ...A2_POZLARI]) expect(b, ad).toContain('`' + ad + '.webp`');
    for (let n = 1; n <= 8; n++) for (const ad of kapiKareAdlari(n)) expect(b, ad).toContain('`' + ad + '`');
    for (const k of ['assets/alfabe/a2-arayuz/', 'assets/alfabe/yazma-efekt/', 'assets/alfabe/ceren-tepki/', 'assets/alfabe/hece-evleri/', 'assets/alfabe/hayvan-cagirma/hareket/', '627×627', '640×800']) expect(b, k).toContain(k);
    for (const [ad] of Object.values(aileler)) {
      const slug = hareketAdi(ad);
      if (existsSync('assets/alfabe/hayvan-cagirma/hareket/' + slug + '-0.webp')) continue;
      expect(b, slug).toContain('| `' + slug + '` |');
    }
  });
  it('A2-ek: saklanma yerleri her yaşam alanını karşılar ve adları brief’te; dinleyen Ceren pozu brief’te', () => {
    const t = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const ek = t.slice(t.lastIndexOf('Paket Harf-A2-ek ·'));
    const alanlar = new Set(Object.keys(aileler).map((h) => yasamAlani(h)));
    for (const a of alanlar) expect(SAKLANMA_YERLERI as readonly string[], a).toContain(a);
    for (const y of SAKLANMA_YERLERI) { expect(ek, y).toContain('| `' + y + '` |'); expect(ek).toContain('`' + y + '-0`'); expect(ek).toContain('`' + y + '-2`'); }
    for (const k of ['assets/alfabe/hayvan-sakla/', '600×300', '`dinliyor.webp`', '627×627']) expect(ek, k).toContain(k);
  });
});
