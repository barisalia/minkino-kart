// Minik Doktor · Minkino Kliniği (ilk örnek "Zıpzıp'ın Dizi") · menü bayrağı. Yalnız bu dosyada; vite.config.ts de
// buradan okur (Node'da çalışır, import.meta.glob kullanmaz). false iken sayfa uygulama derlemesine girmez, menüde
// kartı yoktur; web'de /doktor/ açılır. Barış 1.2'nin yeni oyunu olarak seçti (yönetici, 22 Kasım 2026); 1.1'e girmez.
// 23 Kasım 2026, Barış: "evet açılsın ama tamamen kilitli premium şekilde". Menüde açık; kartı ve bütün vakaları abonelikle
// (src/engine/erisim.ts → doktor, doktor/*). Açılış bekleme odası (giris.ts); odada yalnız çizimi tamam olan vaka oynanır.
export const DOKTOR_MENUDE = true;
/** Ana menüdeki kartın kimliği, adresi ve kapağı (uygulama/src/menu-bolumleri.ts bağlar). */
export const DOKTOR_KARTI = { id: 'doktor', adres: 'doktor/index.html', kapak: 'assets/uygulama/oyun-kapaklari/doktor.webp' } as const;
