// Keşfet · sözcüğe göre canlanan resim (yönetici, 23 Kasım: "harf sesi duyulunca resim canlansın: balon şişsin, balık
// zıplasın"). Yalnız Astra'nın resmine CSS/WAAPI dönüşümü (ölçek, kayma, dönme, ezilme); yeni çizim yok. Her sözcüğün
// kendi hareketi vardır; listede olmayan sözcük "hop" yapar. Hareket alttaki süzülmeye eklenir (composite: add).
// Astra'nın Paket Harf-A1 sözcük kareleri (assets/alfabe/kesfet-hareket/<sozcuk>-1.webp) gelince o sözcük, hareketin
// tepe anında kendi pozuna geçer (keşfet-canlanma → poz).

export type Hareket = 'zipla' | 'uc' | 'sis' | 'yuz' | 'yuvarlan' | 'salla' | 'sur' | 'titre' | 'parla' | 'don' | 'agir' | 'sarkac' | 'kay' | 'hop';

const SOZCUK: Record<string, Hareket> = {
  // zıplayanlar
  tavşan: 'zipla', kedi: 'zipla', fare: 'zipla', horoz: 'zipla', zebra: 'zipla', jaguar: 'zipla', panda: 'zipla', ördek: 'zipla', yumurta: 'zipla',
  // uçanlar
  arı: 'uc', kuş: 'uc', leylek: 'uc', papağan: 'uc', 'uğur böceği': 'uc', uçak: 'uc', roket: 'uc', uydu: 'uc', kelebek: 'uc',
  // şişenler, kabaranlar
  balon: 'sis', ekmek: 'sis', pasta: 'sis', simit: 'sis', şeker: 'sis', lolipop: 'sis',
  // suda
  balık: 'yuz', ıstakoz: 'yuz', uskumru: 'yuz', ırmak: 'yuz', yelkenli: 'yuz', gemi: 'yuz', nilüfer: 'yuz', iskele: 'yuz',
  // yuvarlananlar (meyve, top gibi)
  armut: 'yuvarlan', elma: 'yuvarlan', ayva: 'yuvarlan', erik: 'yuvarlan', vişne: 'yuvarlan', zeytin: 'yuvarlan', incir: 'yuvarlan',
  nar: 'yuvarlan', ceviz: 'yuvarlan', limon: 'yuvarlan', üzüm: 'yuvarlan', çilek: 'yuvarlan', inci: 'parla', muz: 'salla',
  // rüzgârda sallananlar
  ağaç: 'salla', çiçek: 'salla', orkide: 'salla', havuç: 'salla', ıspanak: 'salla', şemsiye: 'salla', etek: 'salla', ceket: 'salla',
  üniforma: 'salla', çorap: 'salla', eldiven: 'salla', iplik: 'salla', zürafa: 'salla', yağmur: 'salla',
  // yolda
  otobüs: 'sur', tren: 'sur', jip: 'sur', valiz: 'sur', robot: 'sur', okul: 'hop',
  // ses çıkaranlar
  davul: 'titre', gitar: 'titre', düdük: 'titre', ukulele: 'titre', nota: 'titre', saat: 'titre', tencere: 'titre', zil: 'titre',
  // parlayanlar
  yıldız: 'parla', jeton: 'parla', ödül: 'parla', mum: 'parla', şişe: 'parla', vazo: 'parla', bardak: 'parla', gözlük: 'parla', cüzdan: 'parla',
  // dönenler
  raket: 'don', fırça: 'don', kalem: 'don', ütü: 'kay', masa: 'hop', pil: 'titre', su: 'yuz', bal: 'sis', at: 'zipla',
  // ağır adımlılar
  fil: 'agir', inek: 'agir', dinozor: 'agir', hamak: 'sarkac', maymun: 'sarkac', örümcek: 'sarkac', salyangoz: 'kay', dağ: 'agir',
};

/** Sözcüğün hareketi (büyük/küçük harf ve sondaki noktalama önemsiz). */
export function hareketi(sozcuk: string): Hareket {
  const s = sozcuk.toLocaleLowerCase('tr').replace(/[.!?,]/g, '').trim();
  return SOZCUK[s] ?? 'hop';
}

type Kare = Keyframe[];
/** Her hareketin kareleri (transform yalnız; yüzde ölçüler resmin kendi boyuna göre). */
export const KARELER: Record<Hareket, Kare> = {
  zipla: [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(4%) scale(1.08,.9)', offset: .15 }, { transform: 'translateY(-20%) scale(.94,1.08)', offset: .45 },
    { transform: 'translateY(0) scale(1.08,.92)', offset: .72 }, { transform: 'translateY(-5%) scale(.98,1.02)', offset: .86 }, { transform: 'translateY(0) scale(1,1)' }],
  uc: [{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(-6%,-10%) rotate(-8deg)', offset: .25 }, { transform: 'translate(7%,-16%) rotate(7deg)', offset: .5 },
    { transform: 'translate(-4%,-8%) rotate(-5deg)', offset: .75 }, { transform: 'translate(0,0) rotate(0)' }],
  sis: [{ transform: 'scale(1)' }, { transform: 'scale(.92,.95)', offset: .15 }, { transform: 'scale(1.22)', offset: .5 }, { transform: 'scale(1.12,1.16)', offset: .65 },
    { transform: 'scale(1.18,1.1)', offset: .8 }, { transform: 'scale(1)' }],
  yuz: [{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(-6%,3%) rotate(-6deg)', offset: .25 }, { transform: 'translate(6%,-6%) rotate(7deg)', offset: .5 },
    { transform: 'translate(-3%,2%) rotate(-3deg)', offset: .75 }, { transform: 'translate(0,0) rotate(0)' }],
  yuvarlan: [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-8%) rotate(-24deg)', offset: .3 }, { transform: 'translateX(8%) rotate(24deg)', offset: .65 },
    { transform: 'translateX(-2%) rotate(-6deg)', offset: .85 }, { transform: 'translateX(0) rotate(0)' }],
  salla: [{ transform: 'rotate(0)', transformOrigin: '50% 95%' }, { transform: 'rotate(-9deg)', transformOrigin: '50% 95%', offset: .25 }, { transform: 'rotate(7deg)', transformOrigin: '50% 95%', offset: .55 },
    { transform: 'rotate(-3deg)', transformOrigin: '50% 95%', offset: .8 }, { transform: 'rotate(0)', transformOrigin: '50% 95%' }],
  sur: [{ transform: 'translateX(0) translateY(0)' }, { transform: 'translateX(-5%) translateY(0)', offset: .2 }, { transform: 'translateX(9%) translateY(-1.5%)', offset: .5 },
    { transform: 'translateX(9%) translateY(0)', offset: .6 }, { transform: 'translateX(0) translateY(-1%)', offset: .85 }, { transform: 'translateX(0) translateY(0)' }],
  titre: [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.06) rotate(-4deg)', offset: .1 }, { transform: 'scale(1.06) rotate(4deg)', offset: .2 }, { transform: 'scale(1.06) rotate(-4deg)', offset: .3 },
    { transform: 'scale(1.06) rotate(4deg)', offset: .4 }, { transform: 'scale(1.04) rotate(-2deg)', offset: .55 }, { transform: 'scale(1) rotate(0)' }],
  parla: [{ transform: 'scale(1) rotate(0)', filter: 'brightness(1)' }, { transform: 'scale(1.14) rotate(-6deg)', filter: 'brightness(1.25)', offset: .4 },
    { transform: 'scale(1.06) rotate(4deg)', filter: 'brightness(1.12)', offset: .7 }, { transform: 'scale(1) rotate(0)', filter: 'brightness(1)' }],
  don: [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-20deg) scale(1.05)', offset: .25 }, { transform: 'rotate(340deg) scale(1.08)', offset: .8 }, { transform: 'rotate(360deg) scale(1)' }],
  agir: [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(-6%) scale(.98,1.02)', offset: .3 }, { transform: 'translateY(0) scale(1.06,.93)', offset: .45 },
    { transform: 'translateY(-3%) scale(.99,1.01)', offset: .7 }, { transform: 'translateY(0) scale(1.03,.97)', offset: .82 }, { transform: 'translateY(0) scale(1,1)' }],
  sarkac: [{ transform: 'rotate(0)', transformOrigin: '50% 0%' }, { transform: 'rotate(12deg)', transformOrigin: '50% 0%', offset: .3 }, { transform: 'rotate(-9deg)', transformOrigin: '50% 0%', offset: .6 },
    { transform: 'rotate(4deg)', transformOrigin: '50% 0%', offset: .85 }, { transform: 'rotate(0)', transformOrigin: '50% 0%' }],
  kay: [{ transform: 'translateX(0) scale(1,1)' }, { transform: 'translateX(-4%) scale(1.04,.97)', offset: .3 }, { transform: 'translateX(6%) scale(.97,1.03)', offset: .65 }, { transform: 'translateX(0) scale(1,1)' }],
  hop: [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-12%) scale(1.06)', offset: .4 }, { transform: 'translateY(0) scale(.97,1.03)', offset: .7 }, { transform: 'translateY(0) scale(1)' }],
};
const SURE: Record<Hareket, number> = { zipla: 760, uc: 1100, sis: 900, yuz: 1100, yuvarlan: 900, salla: 1000, sur: 1000, titre: 700, parla: 850, don: 850, agir: 900, sarkac: 1100, kay: 1000, hop: 600 };

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sonCanlanma = new WeakMap<Element, Animation>();

const zamanlayicilar = new WeakMap<Element, number[]>();
/**
 * Resmi sözcüğüne göre canlandırır (bir öncekini keser). guclu: doğru bulununca daha büyük ve iki kez.
 * poz: Astra'nın iki hareket karesi (Paket Harf-A1, a1-kareler.ts → sozcukKareleri); varsa resim hareketin ortasında
 * kendi pozlarına geçer, sonunda asıl resmine döner.
 */
export function resmiCanlandir(img: Element | null | undefined, sozcuk: string, guclu = false, poz?: readonly string[]) {
  if (!img || azHareket() || !(img instanceof HTMLElement || img instanceof SVGElement)) return;
  const h = hareketi(sozcuk);
  sonCanlanma.get(img)?.cancel();
  const tekrar = guclu ? 2 : 1;
  const a = img.animate(KARELER[h], { duration: SURE[h], easing: 'ease-in-out', composite: 'add', iterations: tekrar });
  sonCanlanma.set(img, a);
  if (poz && img instanceof HTMLImageElement) {
    (zamanlayicilar.get(img) ?? []).forEach(clearTimeout);
    const asil = img.dataset.asil ?? img.src;
    img.dataset.asil = asil;
    const t: number[] = [];
    for (let i = 0; i < tekrar; i++) {
      const bas = i * SURE[h];
      t.push(window.setTimeout(() => { img.src = poz[0]; }, bas + SURE[h] * .22));
      t.push(window.setTimeout(() => { img.src = poz[1]; }, bas + SURE[h] * .5));
      t.push(window.setTimeout(() => { img.src = asil; }, bas + SURE[h] * .82));
    }
    zamanlayicilar.set(img, t);
  }
  return a;
}
