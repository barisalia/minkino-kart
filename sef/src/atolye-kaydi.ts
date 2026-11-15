import type { YeniTarif } from './yemekler';

export function masaAnahtari(anahtar: string, masa = '') {
  return masa ? anahtar + '-masa-' + encodeURIComponent(masa) : anahtar;
}

const bellek = new Map<string, unknown>();

export function atolyeTaslaginiSil(id: YeniTarif, masa: string) {
  if(!masa)return;
  const key=masaAnahtari('minkino-sef-'+id+'-v1',masa);
  bellek.delete(key);
  try { localStorage.removeItem(key); } catch { /* Oturumdaki taslak silindi. */ }
}

export function atolyeKaydi<T>(anahtar: string) {
  return {
    oku(masa: string): unknown {
      const key = masaAnahtari(anahtar, masa);
      try {
        const ham = localStorage.getItem(key);
        if (ham !== null) return JSON.parse(ham);
      } catch { /* Kayıt açılamazsa bu masanın son oturumunu kullan. */ }
      return bellek.get(key);
    },
    yaz(masa: string, durum: T) {
      const key = masaAnahtari(anahtar, masa);
      bellek.set(key, durum);
      try { localStorage.setItem(key, JSON.stringify(durum)); } catch { /* Bellekte devam et. */ }
    }
  };
}

// Eski bir oturum masa açıkken güncellenirse açık tarifin sahibi bellidir.
// Diğer eski tarifler serbest mutfağın aynı kayıt anahtarını kullanmaya devam eder.
export function eskiAcikMasayiTasi(id: YeniTarif, masa: string) {
  if (!masa) return;
  const eski = 'minkino-sef-' + id + '-v1';
  const hedef = masaAnahtari(eski, masa);
  try {
    if (localStorage.getItem(hedef) !== null) return;
    const ham = localStorage.getItem(eski);
    if (!ham || JSON.parse(ham)?.aktif !== true) return;
    localStorage.setItem(hedef, ham);
    localStorage.removeItem(eski);
    localStorage.removeItem('minkino-sef-ozet-' + id);
  } catch { /* Yazılamayan kayıt kaynakta kalır. */ }
}
