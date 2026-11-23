// Resimde Bul sahneleri (29 SVG, toplam ~5,7 MB) ana koda gömülmez: her sahne kendi parçasıdır (19 Kasım 2026,
// Harf Atölyesi açılış hızı; önceden alfabe-*.js 6,15 MB'tı). Ders açılınca bu harfin akışında Resimde Bul varsa
// sahne önceden indirilir (main.ts → dersAc); adıma gelindiğinde inmiş sahne beklemeden, aynı karede çizilir.
// Uygulamada (Capacitor) parçalar paketin içindeki aynı klasörden okunur.
const yukleyiciler = import.meta.glob<string>('../../assets/alfabe/resimde-bul/*.svg', { query: '?raw', import: 'default' });
const inenler = new Map<string, string>();
const yuklemeler = new Map<string, Promise<string>>();
const yol = (id: string) => '../../assets/alfabe/resimde-bul/' + id + '.svg';

export function sahneVarMi(id: string): boolean {
  return Boolean(yukleyiciler[yol(id)]);
}

/** İnmiş sahne (yoksa undefined): beklemeden çizmek için. */
export function inmisSahne(id: string): string | undefined {
  return inenler.get(id);
}

/** Sahneyi indirir; aynı sahne için tek indirme yapılır, başarısız olursa sonraki çağrı yeniden dener. */
export function sahneyiYukle(id: string): Promise<string> {
  const inmis = inenler.get(id);
  if (inmis !== undefined) return Promise.resolve(inmis);
  let yukleme = yuklemeler.get(id);
  if (!yukleme) {
    const yukle = yukleyiciler[yol(id)];
    yukleme = yukle ? yukle() : Promise.reject(new Error('Resimde Bul sahnesi yok: ' + id));
    yuklemeler.set(id, yukleme);
    yukleme.then(svg => { inenler.set(id, svg); }, () => {}).finally(() => yuklemeler.delete(id));
  }
  return yukleme;
}
