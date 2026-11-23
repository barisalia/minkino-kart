// Ceren Öğretmen ile Deneyler · menü bayrağı. Yalnız bu dosyada; vite.config.ts de buradan okur (Node'da çalışır,
// import.meta.glob kullanmaz). false iken sayfa uygulama derlemesine girmez, menü kartı görünmez. Astra'nın Paket D
// çizimleri %100 boyda sayılıp kenar taramasından geçince ve iPad videosu onaylanınca true yapılır (yönetici, 22 Kasım).
// Kilit (abonelik) kararı Barış'ta: şimdilik kilit yok.
export const DENEY_MENUDE = true;
/** Ana menüdeki Dersler kartının kimliği ve adresi (Minik Şef oturumu bağlar). */
export const DENEY_KARTI = { id: 'deney', adres: 'deney/index.html', kapak: 'assets/uygulama/oyun-kapaklari/deney.webp' } as const;
