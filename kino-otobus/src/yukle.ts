/**
 * Görselleri ve karakter iskeletlerini önceden indirip çözer: ekran ancak hepsi hazırken açılır (yüklenirken boş
 * tezgâh, boş balon görünmez; Pasta'nın dersi). Otobüs gelirken arka planda yapılır.
 */
import { iskeletVar, svgGetir } from '../../src/karakter/karakter';

/** Elemanların (ve içlerinin) kullandığı görsel adresleri: <img src>, SVG <image href>, stil içindeki url("…") */
export function resimleriTopla(...kokler: (Element | null | undefined)[]): string[] {
  const s = new Set<string>();
  const ekle = (u: string | null | undefined) => {
    if (u && !u.startsWith('data:') && !u.startsWith('#')) s.add(u);
  };
  for (const k of kokler) {
    if (!k) continue;
    for (const e of [k, ...k.querySelectorAll('*')]) {
      if (e instanceof HTMLImageElement) ekle(e.getAttribute('src'));
      else if (e.localName === 'image') ekle(e.getAttribute('href'));
      const st = e.getAttribute('style');
      if (st) for (const m of st.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) ekle(m[2]);
    }
  }
  return [...s];
}

/**
 * Görselleri indirip çözer (img.decode) ve iskelet SVG'lerini getirir: hepsi hazır olunca (ya da en çok `enCok` ms
 * sonra) biter. Dönen Image nesneleri tutuldukça çözülmüş hâl bellekte kalır.
 */
export function onYukle(urls: readonly string[], iskeletler: readonly string[] = [], enCok = 7000): { hazir: Promise<void>; resimler: HTMLImageElement[] } {
  const resimler = [...new Set(urls)].map((u) => {
    const i = new Image();
    i.decoding = 'async';
    i.src = u;
    return i;
  });
  const hepsi = Promise.all([...resimler.map((i) => i.decode().catch(() => undefined)), ...[...new Set(iskeletler)].filter(iskeletVar).map((a) => svgGetir(a).catch(() => null))]).then(() => undefined);
  const hazir = Promise.race([hepsi, new Promise<void>((r) => setTimeout(r, enCok))]);
  return { hazir, resimler };
}
