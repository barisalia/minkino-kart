/** Kino Ne Giysin? görselleri (assets/giysin/**.webp; Vite adresleri). Ad: 'oda-yatay', 'giysi/bere', 'ikon/mont' … */
const DOSYALAR = import.meta.glob('../../assets/giysin/**/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function resim(ad: string): string {
  return DOSYALAR[`../../assets/giysin/${ad}.webp`] ?? '';
}

/** Ekranın resimlerini önceden çöz (geçişte bir anda belirmesin) */
export function onYukle(adlar: string[]) {
  for (const a of adlar) {
    const i = new Image();
    i.src = resim(a);
    void i.decode?.().catch(() => undefined);
  }
}
