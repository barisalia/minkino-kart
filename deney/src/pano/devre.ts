// Deneyler · Bağla ve Çalıştır (Mucit Panosu, Paket Deney-Y2; yönetici 22 Kasım akşamı; CEVAP-09 Yön 2). DOM'suz kurallar:
// 7 × 4 karelik panoda boru ya da kablo parçaları; her parçanın iki ucu var, kod 90°'lik adımlarla çevirir. Akış kaynaktan
// (depo ya da pil) çıkar, parçaların uçlarını izler; hedefe (çark ya da ampul) ulaşırsa iş tamam, ulaşamazsa açık uçtan
// sızar (su fışkırır, ampul yanmaz). Eksik ya da ters parça ceza değildir, sızıntı yeri gösterilir.

export type Yon = 'K' | 'D' | 'G' | 'B'; // kuzey (yukarı), doğu (sağ), güney (aşağı), batı (sol)
export type ParcaTuru = 'duz' | 'dirsek';
export type Aci = 0 | 90 | 180 | 270;
export type Kare = { i: number; j: number };
export type Parca = { tur: ParcaTuru; aci: Aci };
export type Tur = 'su' | 'isik';
export type Yas = 'minik' | 'dort' | 'bes';

export const SUTUN = 7, SATIR = 4;
const SIRA: Yon[] = ['K', 'D', 'G', 'B'];
export const ters = (y: Yon): Yon => SIRA[(SIRA.indexOf(y) + 2) % 4];
const cevir = (y: Yon, aci: Aci): Yon => SIRA[(SIRA.indexOf(y) + aci / 90) % 4];
/** Parçanın uçları: düz 0°'de batı–doğu, dirsek 0°'de batı–güney (Astra'nın çizimiyle aynı); saat yönünde döner. */
export function uclar(p: Parca): [Yon, Yon] {
  const temel: [Yon, Yon] = p.tur === 'duz' ? ['B', 'D'] : ['B', 'G'];
  return [cevir(temel[0], p.aci), cevir(temel[1], p.aci)];
}
export const sonrakiAci = (a: Aci): Aci => (((a + 90) % 360) as Aci);
export const anahtar = (k: Kare) => k.i + ',' + k.j;
export function komsu(k: Kare, y: Yon): Kare {
  return { i: k.i + (y === 'D' ? 1 : y === 'B' ? -1 : 0), j: k.j + (y === 'G' ? 1 : y === 'K' ? -1 : 0) };
}

/** Bir tur: kaynağın çıkışı, hedefin girişi, sabit parçalar ve boşluklar (doğru parçasıyla). */
export type Duzen = {
  tur: Tur;
  /** Kaynağın son karesi ve akışın çıktığı yön (depo 2 × 2'nin sağ alt karesinin doğusu; pilin artı ucu). */
  kaynak: Kare & { yon: Yon };
  /** Hedefin giriş karesi ve akışın oraya girdiği yön (çarkın sol üst karesine batıdan; ampulün alt karesine güneyden). */
  hedef: Kare & { giris: Yon };
  /** Kaynak ve hedefin kapladığı kareler (parça konmaz). */
  dolu: Kare[];
  sabit: (Kare & Parca)[];
  bosluk: (Kare & Parca)[];
  /** Işık turunda şalter (kapalıyken akım geçmez). */
  salter?: Kare;
};

const k = (i: number, j: number): Kare => ({ i, j });
// Su: depo (0–1, 0–1) → (2,1) (3,1) düz → (4,1) dirsek batı–güney → (4,2) dirsek kuzey–doğu → çark (5–6, 2–3) batıdan.
const SU_YOLU: (Kare & Parca)[] = [
  { i: 2, j: 1, tur: 'duz', aci: 0 }, { i: 3, j: 1, tur: 'duz', aci: 0 },
  { i: 4, j: 1, tur: 'dirsek', aci: 0 }, { i: 4, j: 2, tur: 'dirsek', aci: 180 },
];
// Işık: pil (0–1, 3) → (2,3) düz → şalter (3,3) → (4,3) düz → (5,3) dirsek batı–kuzey → ampul (5, 1–2) güneyden.
const ISIK_YOLU: (Kare & Parca)[] = [
  { i: 2, j: 3, tur: 'duz', aci: 0 }, { i: 4, j: 3, tur: 'duz', aci: 0 }, { i: 5, j: 3, tur: 'dirsek', aci: 90 },
];
/** Yaşa göre boşluklar (yolun kaçıncı parçaları eksik): 2–3 yaş bir düz, 4 yaş iki (biri dirsek), 5+ üç. */
const SU_BOSLUK: Record<Yas, number[]> = { minik: [1], dort: [1, 3], bes: [0, 2, 3] };
const ISIK_BOSLUK: Record<Yas, number[]> = { minik: [1], dort: [0, 2], bes: [0, 1, 2] };

export function duzen(tur: Tur, yas: Yas): Duzen {
  const yol = tur === 'su' ? SU_YOLU : ISIK_YOLU;
  const bos = (tur === 'su' ? SU_BOSLUK : ISIK_BOSLUK)[yas];
  const sabit = yol.filter((_, n) => !bos.includes(n));
  const bosluk = yol.filter((_, n) => bos.includes(n));
  if (tur === 'su') {
    return {
      tur, kaynak: { i: 1, j: 1, yon: 'D' }, hedef: { i: 5, j: 2, giris: 'D' },
      dolu: [k(0, 0), k(1, 0), k(0, 1), k(1, 1), k(5, 2), k(6, 2), k(5, 3), k(6, 3)], sabit, bosluk,
    };
  }
  return {
    tur, kaynak: { i: 1, j: 3, yon: 'D' }, hedef: { i: 5, j: 2, giris: 'K' },
    dolu: [k(0, 3), k(1, 3), k(5, 1), k(5, 2), k(6, 1), k(6, 2)],
    sabit: [...sabit, { i: 3, j: 3, tur: 'duz', aci: 0 }], bosluk, salter: k(3, 3),
  };
}
/** Tepsideki parçalar: boşlukların türleri, 0°'de (çocuk dirseği dokunarak çevirir). */
export const tepsi = (d: Duzen): Parca[] => d.bosluk.map((b) => ({ tur: b.tur, aci: 0 as Aci }));

export type AkisSonucu = {
  /** Akışın sırayla geçtiği kareler (kaynaktan sonra). */
  yol: Kare[];
  ulasti: boolean;
  /** Ulaşamadıysa: suyun fışkırdığı açık uç (son dolu karenin kenarı ve yönü). */
  sizinti: (Kare & { yon: Yon }) | null;
};
/**
 * Akışı izler. `parcalar`: panodaki bütün parçalar (sabit + yerleştirilen), kareye göre. `salterAcik`: ışık turunda şalter
 * indirildi mi (kapalıysa akım şalterde durur ama sızıntı sayılmaz).
 */
export function akis(d: Duzen, parcalar: ReadonlyMap<string, Parca>, salterAcik = true): AkisSonucu {
  const yol: Kare[] = [];
  let yon = d.kaynak.yon;
  let onceki: Kare = d.kaynak;
  const gorulen = new Set<string>();
  for (let adim = 0; adim < SUTUN * SATIR; adim++) {
    const sim = komsu(onceki, yon);
    if (sim.i === d.hedef.i && sim.j === d.hedef.j) {
      // Hedefin girişine doğru yönden geldi mi (çark batıdan, ampul güneyden): akış yönü = girişin tersi değil, aynısı.
      return yon === d.hedef.giris ? { yol, ulasti: true, sizinti: null } : { yol, ulasti: false, sizinti: { ...onceki, yon } };
    }
    const p = parcalar.get(anahtar(sim));
    const giris = ters(yon);
    if (!p || gorulen.has(anahtar(sim)) || sim.i < 0 || sim.j < 0 || sim.i >= SUTUN || sim.j >= SATIR) return { yol, ulasti: false, sizinti: { ...onceki, yon } };
    const [a, b] = uclar(p);
    if (a !== giris && b !== giris) return { yol, ulasti: false, sizinti: { ...onceki, yon } };
    if (d.salter && sim.i === d.salter.i && sim.j === d.salter.j && !salterAcik) return { yol, ulasti: false, sizinti: null };
    gorulen.add(anahtar(sim));
    yol.push(sim);
    yon = a === giris ? b : a;
    onceki = sim;
  }
  return { yol, ulasti: false, sizinti: null };
}

/** Panodaki parçalar: sabitler ve yerleştirilenler. */
export function panodakiler(d: Duzen, yerlesen: ReadonlyMap<string, Parca>): Map<string, Parca> {
  const m = new Map<string, Parca>();
  for (const s of d.sabit) m.set(anahtar(s), { tur: s.tur, aci: s.aci });
  for (const [a, p] of yerlesen) m.set(a, p);
  return m;
}
/** Bir boşluğa parça konabilir mi (boş ve gerçekten boşluk karesi). */
export const bosMu = (d: Duzen, kare: Kare, yerlesen: ReadonlyMap<string, Parca>) =>
  d.bosluk.some((b) => b.i === kare.i && b.j === kare.j) && !yerlesen.has(anahtar(kare));
