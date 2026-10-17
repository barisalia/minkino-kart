/**
 * Mino Ne Giysin? kaydı (cihazda, localStorage): bulunan çözüm yıldızları ('dert:alet'), uygun kostümle
 * bulunanlar (tam: parlak yıldız) ve son yaş.
 * Puan ve kilit yok; yıldızlar "ikinci yolu bulabilir miyim?" davetidir.
 */
export const KAYIT_ANAHTARI = 'minkino-mino-giysin-v1';

export interface Kayit {
  yildiz: string[];
  /** uygun kostümle (itfaiyeci + merdiven …) bulunan çözümler: dolaptaki yıldız parlar */
  tam: string[];
  yas: number | null;
  /** ıslak şaka (sulama kabı ilk kez) bu oturumda oldu mu: oturumluk, kaydedilmez */
}

function oku(): Kayit {
  try {
    const v = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? 'null') as Partial<Kayit> | null;
    return { yildiz: Array.isArray(v?.yildiz) ? v.yildiz.filter((x) => typeof x === 'string') : [], tam: Array.isArray(v?.tam) ? v.tam.filter((x) => typeof x === 'string') : [], yas: typeof v?.yas === 'number' ? v.yas : null };
  } catch {
    return { yildiz: [], tam: [], yas: null };
  }
}

export const kayit: Kayit = oku();

export function kaydet() {
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kayit));
  } catch {
    /* gizli sekme / dolu depo: oyun yine oynar */
  }
}

export function sifirla() {
  kayit.yildiz = [];
  kayit.tam = [];
  kayit.yas = null;
  kaydet();
}
