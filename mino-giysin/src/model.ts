/**
 * Mino Ne Giysin? · Yardımcı Mino: saf oyun mantığı (DOM yok; tests/unit/mino-giysin.test.ts).
 * Senaryo: ekip/senaryo/MINO-NE-GIYSIN.md (§3 kostüm, §4 dert × alet tablosu, §5 yaş farkı).
 *
 * 4 rol × 3 yer = 12 kostüm parçası. Dertte sonucu yalnız ALET belirler; her dertte 2 çözüm, 2 komik başarısızlık.
 */

export const ROLLER = ['doktor', 'itfaiye', 'asci', 'bahce'] as const;
export type Rol = (typeof ROLLER)[number];
export const YERLER = ['bas', 'ust', 'alet'] as const;
export type Yer = (typeof YERLER)[number];
export type ParcaId = `${Yer}-${Rol}`;

export interface Parca {
  id: ParcaId;
  rol: Rol;
  yer: Yer;
}

/** Dolap ve sepet sırası: şapkalar, üstler, aletler (her biri doktor, itfaiye, aşçı, bahçe) */
export const PARCALAR: Parca[] = YERLER.flatMap((yer) => ROLLER.map((rol) => ({ id: `${yer}-${rol}` as ParcaId, rol, yer })));

export const parca = (id: ParcaId): Parca => PARCALAR.find((p) => p.id === id)!;
export const parcaMi = (id: string): id is ParcaId => PARCALAR.some((p) => p.id === id);

/** Aletin günlük adı (sonuç tablosunun anahtarı) */
export const ALET_ADI: Record<Rol, string> = { doktor: 'stetoskop', itfaiye: 'merdiven', asci: 'kasik', bahce: 'sulama' };
export type Alet = 'stetoskop' | 'merdiven' | 'kasik' | 'sulama';
export const ALETLER: Alet[] = ['stetoskop', 'merdiven', 'kasik', 'sulama'];
export const aletRolu = (a: Alet): Rol => ROLLER.find((r) => ALET_ADI[r] === a)!;
export const aletParcasi = (a: Alet): ParcaId => `alet-${aletRolu(a)}`;
export const parcaAleti = (id: ParcaId | null | undefined): Alet | null => (id && id.startsWith('alet-') ? (ALET_ADI[parca(id).rol] as Alet) : null);

export const DERTLER = ['pamuk', 'kino', 'ege', 'ada'] as const;
export type Dert = (typeof DERTLER)[number];

/**
 * Çözümde çocuğun el hareketi:
 * - surukle: aleti hedefe götür (merdiven ağaca / rafa, stetoskop göğse, kaşık ağza)
 * - vur: hedefe art arda dokun (kaşıkla mama kabına "tın tın tın")
 * - karistir: tencerenin üstünde daire çiz, sonra kaşığı ağza götür
 * - tut: kabı çiçeğin üstünde bir süre tut
 * - tasi: kaşıkla kovadan çiçeğe, her çiçek için bir kez
 */
export type Hareket = 'surukle' | 'vur' | 'karistir' | 'tut' | 'tasi';

/** Komik başarısızlığın taşıdığı dolaylı ipucu (§4): kimse "şunu dene" demez */
export type Ipucu = 'koklar' | 'oksuruk' | 'karin' | 'mama' | 'susamis' | 'gunes' | 'saglikli' | 'ates';

export type Sonuc = { tur: 'cozum'; hareket: Hareket } | { tur: 'komik'; ipucu: Ipucu };

/** §4: 16 sonuç (her dertte 2 çözüm, 2 komik başarısızlık) */
export const SONUC: Record<Dert, Record<Alet, Sonuc>> = {
  pamuk: {
    merdiven: { tur: 'cozum', hareket: 'surukle' },
    kasik: { tur: 'cozum', hareket: 'vur' },
    sulama: { tur: 'komik', ipucu: 'koklar' },
    stetoskop: { tur: 'komik', ipucu: 'saglikli' },
  },
  kino: {
    stetoskop: { tur: 'cozum', hareket: 'surukle' },
    kasik: { tur: 'cozum', hareket: 'surukle' },
    sulama: { tur: 'komik', ipucu: 'oksuruk' },
    merdiven: { tur: 'komik', ipucu: 'ates' },
  },
  ege: {
    kasik: { tur: 'cozum', hareket: 'karistir' },
    merdiven: { tur: 'cozum', hareket: 'surukle' },
    stetoskop: { tur: 'komik', ipucu: 'karin' },
    sulama: { tur: 'komik', ipucu: 'mama' },
  },
  ada: {
    sulama: { tur: 'cozum', hareket: 'tut' },
    kasik: { tur: 'cozum', hareket: 'tasi' },
    stetoskop: { tur: 'komik', ipucu: 'susamis' },
    merdiven: { tur: 'komik', ipucu: 'gunes' },
  },
};

export const sonuc = (d: Dert, a: Alet): Sonuc => SONUC[d][a];
export const cozumAletleri = (d: Dert): Alet[] => ALETLER.filter((a) => SONUC[d][a].tur === 'cozum');

/** Yaş grubu: 3-4 ya da 5-6 */
export type YasGrubu = '34' | '56';
export const yasGrubu = (yas: number | null | undefined): YasGrubu => ((yas ?? 4) >= 5 ? '56' : '34');

/**
 * Çözümde kaç kez (§5): 3-4 tek hareket; 5-6 sayılı (3 basamak, 3 kaşık, 3 çiçek). Kaşıkla kaba vurma her yaşta 3.
 * Ada sulama: 3-4'te 2 çiçek, 5-6'da 3 çiçek (+ gizli mantar).
 */
export function tekrarSayisi(d: Dert, a: Alet, g: YasGrubu): number {
  if (d === 'pamuk' && a === 'kasik') return 3;
  if (d === 'ada') return g === '56' ? 3 : 2;
  return g === '56' ? 3 : 1;
}

/** İpucu merdiveni (sn): bakış, Mino yeniden anlatır, alet sallanır (ilk parlama), parmak (§4, §5) */
export function ipucuSureleri(g: YasGrubu): [number, number, number, number] {
  return g === '56' ? [15, 30, 40, 50] : [12, 25, 35, 45];
}

// ---------------------------------------------------------------- kostüm

export type Giyili = Partial<Record<Yer, ParcaId>>;

/**
 * Parçayı giydirir: aynı yerde başka parça varsa o çıkar (Mino fırlatır). Aynı parça yeniden gelirse değişen yok.
 */
export function yerDegistir(giyili: Giyili, id: ParcaId): { giyili: Giyili; eski: ParcaId | null } {
  const p = parca(id);
  const eski = giyili[p.yer] ?? null;
  if (eski === id) return { giyili: { ...giyili }, eski: null };
  return { giyili: { ...giyili, [p.yer]: id }, eski };
}

/** Parçayı çıkarır (dolaba geri) */
export function cikar(giyili: Giyili, id: ParcaId): Giyili {
  const g = { ...giyili };
  const p = parca(id);
  if (g[p.yer] === id) delete g[p.yer];
  return g;
}

/** Takım: üç parça aynı rolden → 'tam:<rol>'; üç parça karışık → 'karisik'; eksikse 'eksik' */
export type Takim = `tam:${Rol}` | 'karisik' | 'eksik';
export function takimAdi(giyili: Giyili): Takim {
  const ps = YERLER.map((y) => giyili[y]);
  if (ps.some((p) => !p)) return 'eksik';
  const roller = new Set(ps.map((p) => parca(p!).rol));
  return roller.size === 1 ? `tam:${[...roller][0]}` : 'karisik';
}

/** Tam takımın rolü (yoksa null): dert sahnesinde o rolün çözümüne küçük süs */
export const tamRol = (giyili: Giyili): Rol | null => {
  const t = takimAdi(giyili);
  return t.startsWith('tam:') ? (t.slice(4) as Rol) : null;
};

/**
 * Tam takım süsü (§4 son sütun) bu çözümde çıkar mı: takım tam ve rolü bu çözümün aletinin rolüyse.
 * (Komik başarısızlıkta süs yok.)
 */
export function susVar(giyili: Giyili, d: Dert, a: Alet): boolean {
  const r = tamRol(giyili);
  return !!r && r === aletRolu(a) && SONUC[d][a].tur === 'cozum';
}

// ---------------------------------------------------------------- çözüm yıldızları

export type YildizAnahtar = `${Dert}:${Alet}`;
export const yildizAnahtar = (d: Dert, a: Alet): YildizAnahtar => `${d}:${a}`;

/** Dolabın kapağındaki 8 yıldız (4 dert × 2 çözüm), sırası sabit; dolu olanlar kayıttan */
export function yildizlar(kayit: { yildiz: string[] }): { dert: Dert; alet: Alet; dolu: boolean }[] {
  return DERTLER.flatMap((dert) => cozumAletleri(dert).map((alet) => ({ dert, alet, dolu: kayit.yildiz.includes(yildizAnahtar(dert, alet)) })));
}

/** Yıldızı kayda ekler (yalnız çözümler; tekrar eklenmez). Yeni yıldızsa true. */
export function yildizEkle(kayit: { yildiz: string[] }, d: Dert, a: Alet): boolean {
  if (SONUC[d][a].tur !== 'cozum') return false;
  const k = yildizAnahtar(d, a);
  if (kayit.yildiz.includes(k)) return false;
  kayit.yildiz.push(k);
  return true;
}

/** Derdin ikinci çözümü (birini bulduysa öbürü), yoksa null */
export function digerCozum(d: Dert, a: Alet): Alet | null {
  return cozumAletleri(d).find((x) => x !== a) ?? null;
}

// ---------------------------------------------------------------- oturum

/** Oturumda çözülen dertler; parti, açık (kilitsiz) bütün dertler çözülünce açılır */
export function partiAcik(cozulen: readonly Dert[], acikDertler: readonly Dert[]): boolean {
  return acikDertler.length > 0 && acikDertler.every((d) => cozulen.includes(d));
}

/**
 * Uçan şapka (§3.1, sürpriz 7): eski şapka %25 olasılıkla odadaki bir arkadaşın kafasına konar, yoksa dolaba döner.
 * rnd: [0,1) (testte sabit). Arkadaş yoksa hep dolap.
 */
export function sapkaNereye(odadakiler: readonly Dert[], rnd: number): Dert | 'dolap' {
  if (!odadakiler.length || rnd >= 0.25) return 'dolap';
  return odadakiler[Math.min(odadakiler.length - 1, Math.floor((rnd / 0.25) * odadakiler.length))];
}

/** Partide üst üste aynı parça sayacı (sürpriz 8: 5. kez "Yeter ama!") */
export function ayniSayac(onceki: { id: ParcaId | null; kez: number }, id: ParcaId): { id: ParcaId; kez: number } {
  return onceki.id === id ? { id, kez: onceki.kez + 1 } : { id, kez: 1 };
}

/** Sepete hızlı dokunuş (sürpriz 1): son 3 dokunuş 900 ms içinde mi */
export function hizliUc(zamanlar: readonly number[], pencere = 900): boolean {
  if (zamanlar.length < 3) return false;
  const son = zamanlar.slice(-3);
  return son[2] - son[0] <= pencere;
}

/** Karıştırma: dairenin toplam açısı (radyan) yolun ~%70'ine ulaştı mı (§4 D3) */
export function karistirmaTamam(toplamAci: number): boolean {
  return Math.abs(toplamAci) >= Math.PI * 2 * 0.7;
}

/** "Kaç güm?" seçenekleri (D2, 5-6): doğru 3, yanında 2 ve 4 */
export const GUM_SECENEK = [2, 3, 4] as const;
export const GUM_DOGRU = 3;
