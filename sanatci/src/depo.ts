/** Minik Sanatçı galerisi: çizimler ve sihirli sonuçlar yalnızca bu cihazda (IndexedDB) saklanır. */
export interface Eser {
  id: string;
  tarih: number;
  konu: string;
  cizim: Blob;
  sonuc: Blob;
  ornek?: boolean;
}

const VT = 'minik-sanatci';
const DEPO = 'eserler';

function ac(): Promise<IDBDatabase> {
  return new Promise((coz, red) => {
    const r = indexedDB.open(VT, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(DEPO, { keyPath: 'id' });
    r.onsuccess = () => coz(r.result);
    r.onerror = () => red(r.error);
  });
}

async function islem<T>(kip: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const vt = await ac();
  return new Promise((coz, red) => {
    const t = vt.transaction(DEPO, kip);
    const r = fn(t.objectStore(DEPO));
    r.onsuccess = () => coz(r.result);
    r.onerror = () => red(r.error);
  });
}

export async function eserKaydet(e: Eser): Promise<void> {
  try {
    await islem('readwrite', (s) => s.put(e));
  } catch {
    /* gizli sekme vb. — galeri bu oturumla sınırlı */
  }
}

export async function eserler(): Promise<Eser[]> {
  try {
    const hepsi = await islem<Eser[]>('readonly', (s) => s.getAll());
    return hepsi.sort((a, b) => b.tarih - a.tarih);
  } catch {
    return [];
  }
}

export async function eserSil(id: string): Promise<void> {
  try {
    await islem('readwrite', (s) => s.delete(id));
  } catch {
    /* yok say */
  }
}

// Ebeveyn onayı (çizimin sihir için sunucuya gönderilmesi)
const ONAY = 'minik-sanatci-onay-v1';
export function onayVarMi(): boolean {
  try {
    return localStorage.getItem(ONAY) === '1';
  } catch {
    return false;
  }
}
export function onayVer(): void {
  try {
    localStorage.setItem(ONAY, '1');
  } catch {
    /* yok say */
  }
}
