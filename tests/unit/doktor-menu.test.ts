// Minik Doktor menüde ve tamamen premium (Barış, 23 Kasım 2026: "evet açılsın ama tamamen kilitli premium şekilde").
// Menü kartı, bölümü ve kilit kuralı; giriş yönlendirmesinin kaynağı (parametresiz açılış bekleme odası, girişte kilit).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DOKTOR_KARTI, DOKTOR_MENUDE } from '../../doktor/src/bayrak';
import { ERISIM, erisimTuru, kilitliMi } from '../../src/engine/erisim';
import { menuOyunlari, type OyunKarti } from '../../uygulama/src/oyunlar';
import { DOKTOR_OYUN_KARTI, bolumKartlari, deneyliKartlar, doktorluKartlar } from '../../uygulama/src/menu-bolumleri';

const ids = (l: OyunKarti[]) => l.map(k => k.id);
const hepsi = menuOyunlari(true);

describe('Minik Doktor: menü kartı', () => {
  it('bayrak açık; kartın kimliği, adresi ve kapak yolu', () => {
    expect(DOKTOR_MENUDE).toBe(true);
    expect(DOKTOR_KARTI).toEqual({ id: 'doktor', adres: 'doktor/index.html', kapak: 'assets/uygulama/oyun-kapaklari/doktor.webp' });
    expect(DOKTOR_OYUN_KARTI.id).toBe('doktor'); expect(DOKTOR_OYUN_KARTI.ad).toBe('Minik Doktor'); expect(DOKTOR_OYUN_KARTI.adres).toBe('./doktor/');
    // menü adresi parametresizdir: açılışı giriş belirler (bekleme odası)
    expect(DOKTOR_OYUN_KARTI.adres).not.toContain('?');
  });
  it('bayrak kapalıyken eklenmez; açıkken bir kez, Minik Şef\'in ardına', () => {
    expect(ids(doktorluKartlar(hepsi, false))).toEqual(ids(hepsi));
    const l = doktorluKartlar(hepsi, true);
    expect(l.filter(k => k.id === 'doktor')).toHaveLength(1);
    expect(l[l.findIndex(k => k.id === 'sef') + 1].id).toBe('doktor');
    expect(doktorluKartlar(l, true)).toHaveLength(l.length);
    // Şef yoksa sona
    expect(ids(doktorluKartlar(hepsi.filter(k => k.id !== 'sef'), true)).at(-1)).toBe('doktor');
    // öbür kartların sırası değişmez
    expect(ids(l.filter(k => k.id !== 'doktor'))).toEqual(ids(hepsi));
  });
  it('Oyunlar bölümünde durur (Dersler kapalı ya da açık); Dersler\'de ve Etkinlikler\'de yok', () => {
    const l = doktorluKartlar(deneyliKartlar(hepsi, true), true);
    for (const dersler of [false, true]) {
      expect(ids(bolumKartlari('oyun', l, dersler))).toContain('doktor');
      expect(ids(bolumKartlari('etkinlik', l, dersler))).not.toContain('doktor');
      expect(ids(bolumKartlari('ders', l, dersler))).not.toContain('doktor');
    }
  });
});

describe('Minik Doktor: tamamen premium', () => {
  it('kart ve bütün vakalar abonelikle; ücretsiz tek bir Doktor satırı yok', () => {
    expect(ERISIM.doktor).toBe('abonelik'); expect(ERISIM['doktor/*']).toBe('abonelik');
    for (const id of ['doktor', 'doktor/vaka', 'doktor/klinik', 'doktor/disler', 'doktor/yeni-bir-vaka']) expect(erisimTuru(id), id).toBe('abonelik');
    expect(Object.entries(ERISIM).filter(([k, v]) => (k === 'doktor' || k.startsWith('doktor/')) && v === 'ucretsiz')).toEqual([]);
    // "Kino Doktora Gidiyor" kitabı ayrı içerik: ücretsiz kalır
    expect(erisimTuru('kitap/doktor')).toBe('ucretsiz');
  });
  it('abonesi olmayan uygulamada kilitli; abonede ve web sitesinde açık', () => {
    expect(kilitliMi('doktor', { etkin: true, premium: false })).toBe(true);
    expect(kilitliMi('doktor/vaka', { etkin: true, premium: false })).toBe(true);
    expect(kilitliMi('doktor', { etkin: true, premium: true })).toBe(false);
    expect(kilitliMi('doktor', { etkin: false, premium: false })).toBe(false);
  });
});

describe('Minik Doktor: giriş', () => {
  const giris = readFileSync('doktor/src/giris.ts', 'utf8');
  it('parametresiz açılış bekleme odası; reddedilen ilk örnek menüden açılmaz', () => {
    expect(giris).toContain("const oyun = p.get('oyun') ?? (sahne ? null : 'klinik');");
    expect(giris).toContain("if (oyun === 'klinik')");
    expect(giris).not.toContain("p.get('oyun') === ");          // bütün dallar aynı değişkenden okur
  });
  it('hiçbir vaka kilit sorulmadan açılmaz: yönlendirme tek kapıdan geçer', () => {
    expect(giris).toContain("if (kilitli('doktor')) kilitliGiris(); else ac();");
    // vaka modülleri yalnız ac() içinde çağrılır: kilit satırından sonra import yok
    expect(giris.slice(giris.indexOf("if (kilitli('doktor'))"))).not.toContain('import(');
    expect(giris).toContain('kilitliIcerik(katman)');
  });
});
