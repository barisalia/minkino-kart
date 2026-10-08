/**
 * Test için sahte satın alma (yalnız ?test=1&uygulama=ios|android). Mağazaya ya da RevenueCat'e hiç gitmez.
 * Seçenekler (adres): &satin=iptal (kullanıcı vazgeçer), &satin=hata, &magaza=yok (planlar yüklenemez),
 * &deneme=yok (deneme hakkı yok), &kurulum=hata (sağlayıcı kurulamaz), &premium=1 (açılışta abone).
 * Çağrılar window.__sahteSatin.cagrilar'a yazılır (e2e denetler).
 */
import type { PlanId, Saglayici } from './satin';

export function sahteSaglayici(): Saglayici {
  const q = new URLSearchParams(location.search);
  if (q.get('kurulum') === 'hata') throw new Error('kurulum hatası (sahte)');
  // sahte mağazanın "hesabı" bu sekmede sayfalar arası sürer (gerçekte mağaza hesabı gibi)
  const oturum = (): boolean => {
    try {
      return sessionStorage.getItem('sahte-premium') === '1';
    } catch {
      return false;
    }
  };
  const kayit = { cagrilar: [] as string[], premium: q.get('premium') === '1' || oturum() };
  (window as unknown as { __sahteSatin: typeof kayit }).__sahteSatin = kayit;
  const bekle = (ms = 60) => new Promise((r) => setTimeout(r, ms));
  return {
    async planlar() {
      kayit.cagrilar.push('planlar');
      await bekle();
      if (q.get('magaza') === 'yok') throw new Error('mağaza yok (sahte)');
      // mağazanın döndüreceği biçimde (yerel fiyat metni); değerler Barış'ın fiyatları
      // &deneme=yok: bu kullanıcının deneme hakkı yok (iOS'ta denemeyi daha önce kullanmış Apple Kimliği)
      const denemeGun = q.get('deneme') === 'yok' ? null : 7;
      return [
        { id: 'aylik', fiyat: '₺99,00', ayBasi: null, denemeGun },
        { id: 'yillik', fiyat: '₺499,00', ayBasi: '₺41,58', denemeGun },
      ];
    },
    async satinAl(id: PlanId) {
      kayit.cagrilar.push(`satinAl:${id}`);
      await bekle(120);
      const s = q.get('satin');
      if (s === 'iptal') return 'iptal';
      if (s === 'hata') return 'hata';
      kayit.premium = true;
      try {
        sessionStorage.setItem('sahte-premium', '1');
      } catch {
        /* yok say */
      }
      return 'tamam';
    },
    async geriYukle() {
      kayit.cagrilar.push('geriYukle');
      await bekle();
      return kayit.premium;
    },
    async durumSor() {
      kayit.cagrilar.push('durumSor');
      await bekle(20);
      return kayit.premium;
    },
  };
}
