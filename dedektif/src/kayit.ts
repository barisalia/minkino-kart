/**
 * Dedektif Mino kaydı (yalnız cihazda, localStorage; uygulamada @capacitor/preferences'a da yansır: src/kabuk/yerel.ts).
 * "Vaka Dosyam": çözülen vakalar (çizgi romanları albümde durur).
 */
export const KAYIT_ANAHTARI = 'minkino-dedektif-v1';

export interface Kayit {
  /** çözülen vakalar (ör. 'vaka1') */
  cozulen: string[];
  /** kaç kez çözüldü (vaka → sayı) */
  sayi: Record<string, number>;
}

const bos = (): Kayit => ({ cozulen: [], sayi: {} });

function oku(): Kayit {
  try {
    const o = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? 'null') as Partial<Kayit> | null;
    return { cozulen: Array.isArray(o?.cozulen) ? o.cozulen.filter((x) => typeof x === 'string') : [], sayi: o?.sayi && typeof o.sayi === 'object' ? o.sayi : {} };
  } catch {
    return bos();
  }
}

export const kayit: Kayit = oku();

export function kaydet() {
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit));
  } catch {
    /* gizli sekme */
  }
}

/** Vaka çözüldü: dosyaya girer (tekrar çözülünce sayı artar) */
export function vakaCozuldu(id: string) {
  if (!kayit.cozulen.includes(id)) kayit.cozulen.push(id);
  kayit.sayi[id] = (kayit.sayi[id] ?? 0) + 1;
  kaydet();
}

export function sifirla() {
  kayit.cozulen = [];
  kayit.sayi = {};
  kaydet();
}
