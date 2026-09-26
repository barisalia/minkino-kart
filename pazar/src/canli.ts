/**
 * Yaşayan pazar: arka plan görselinin (pazar/arkaplan.webp) üstünde ayrı katmanlar.
 * Kayan bulutlar, rüzgârda dalgalanan flamalar, ara sıra geçen kuş sürüsü, uzakta yürüyen siluet yayalar,
 * güneş ışını; gün ilerledikçe ışık tonu (sabah → öğle → akşamüstü). Şenlikte fenerler, uçan balonlar, havai fişek.
 * Hepsi yalnız transform / opacity ile hareket eder; hareketi azalt tercihinde ve test modunda sade.
 */
import { h, TEST_MODU } from '../../src/ui/dom';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SADE = AZ_HAREKET || TEST_MODU;
const ras = (a: number, b: number) => a + Math.random() * (b - a);
const sec = <T>(l: T[]) => l[Math.floor(Math.random() * l.length)];

export const RENKLER = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
const KONTUR = '#5a3617';

/** Arka plandaki bulutlarla aynı dil: yuvarlak tepecikler, altta açık mavi gölge, üstte parlak vurgu, kontursuz */
const BULUT =
  '<svg viewBox="0 0 240 120" aria-hidden="true"><g fill="#fff"><circle cx="70" cy="72" r="34"/><circle cx="116" cy="54" r="44"/><circle cx="166" cy="72" r="32"/><circle cx="196" cy="86" r="20"/><rect x="36" y="72" width="180" height="34" rx="17"/></g><path d="M40 94h172a17 17 0 0 1-16 12H56a17 17 0 0 1-16-12z" fill="#d7e7f8"/><ellipse cx="100" cy="36" rx="20" ry="9" fill="#fff" opacity=".95"/><ellipse cx="96" cy="44" rx="30" ry="12" fill="#eef6ff" opacity=".7"/></svg>';
const KUS = '<svg viewBox="0 0 40 16" aria-hidden="true"><path d="M2 12Q10 2 20 11Q30 2 38 12" fill="none" stroke="#3b3a5a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/** Uzak yaya siluetleri (yetişkin, çocuk, sepetli, balonlu çocuk) */
const SILUETLER = [
  '<svg viewBox="0 0 40 90"><circle cx="20" cy="12" r="9"/><path d="M8 34q12-14 24 0l4 30h-8l-2 24h-6l-1-20-1 20h-6l-2-24H4z"/></svg>',
  '<svg viewBox="0 0 30 60"><circle cx="15" cy="10" r="8"/><path d="M5 28q10-12 20 0l3 18h-6l-1 14h-5l-1-10-1 10H9l-1-14H2z"/></svg>',
  '<svg viewBox="0 0 56 90"><circle cx="20" cy="12" r="9"/><path d="M8 34q12-14 24 0l4 30h-8l-2 24h-6l-1-20-1 20h-6l-2-24H4z"/><path d="M36 44h16l-3 14H39z"/><path d="M38 44q6-10 12 0" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  '<svg viewBox="0 0 40 80"><circle cx="15" cy="30" r="8"/><path d="M5 48q10-12 20 0l3 18h-6l-1 14h-5l-1-10-1 10H9l-1-14H2z"/><path d="M24 40L32 16" stroke="currentColor" stroke-width="1.5"/><ellipse cx="33" cy="9" rx="7" ry="9"/></svg>',
];
const BALON = (renk: string) =>
  `<svg viewBox="0 0 60 110" aria-hidden="true"><path d="M30 76q-4 14 2 22t-2 12" fill="none" stroke="${KONTUR}" stroke-width="2"/><path d="M30 4C14 4 4 18 4 34c0 20 16 36 26 42 10-6 26-22 26-42C56 18 46 4 30 4z" fill="${renk}" stroke="${KONTUR}" stroke-width="3.5"/><path d="M26 76h8l-4 6z" fill="${renk}" stroke="${KONTUR}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="19" cy="22" rx="6" ry="9" fill="#fff" opacity=".55" transform="rotate(-20 19 22)"/></svg>`;

/** Bir ipe asılı, rüzgârda sallanan süsler (flama ya da fener) */
function ip(sinif: string, adet: number, sarkma: number, suslu: (i: number) => HTMLElement): HTMLElement {
  const el = h(`div.${sinif}`, { 'aria-hidden': 'true' });
  // ip: ekran genişliğinde, ortası sarkık yay
  el.innerHTML = `<svg class="pz-ip" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 2Q50 ${2 + sarkma * 2} 100 2" fill="none" stroke="${KONTUR}" stroke-width="2.4" vector-effect="non-scaling-stroke"/></svg>`;
  for (let i = 0; i < adet; i++) {
    const t = (i + 0.5) / adet;
    const y = 4 * t * (1 - t) * sarkma; // ipin o noktadaki sarkması (%)
    const s = suslu(i);
    s.style.left = `${t * 100}%`;
    s.style.top = `${10 + y * 1.9}%`;
    s.style.setProperty('--g', `${-ras(0, 2).toFixed(2)}s`);
    s.style.setProperty('--d', `${ras(1.6, 2.6).toFixed(2)}s`);
    el.append(s);
  }
  return el;
}

export interface Canli {
  /** ekranın arkası: bulutlar, güneş, flamalar, kuşlar, ışık tonu */
  arka: HTMLElement;
  /** sahnenin tabanı (standın arkası): uzak yayalar */
  ufuk: HTMLElement;
  /** 0 sabah … 1 akşamüstü */
  gun(t: number): void;
  kapat(): void;
}

export function canliSahne(secenek: { senlik?: boolean } = {}): Canli {
  const zamanlar: number[] = [];
  const sonra = (ms: number, f: () => void) => zamanlar.push(window.setTimeout(f, ms));

  // bulutlar: üç katman, farklı hız ve boyda (uzaktaki küçük ve yavaş)
  const bulutlar = h('div.pz-bulutlar', { 'aria-hidden': 'true' });
  [
    { top: 14, w: 34, sure: 95, o: 0.75 },
    { top: 30, w: 22, sure: 140, o: 0.55 },
    { top: 46, w: 44, sure: 75, o: 0.85 },
  ].forEach((b, i) => {
    const el = h('div.pz-bulut', { style: `top:${b.top}%;width:${b.w}vw;--sure:${b.sure}s;--g:${-ras(0.1, 0.9) * b.sure}s;opacity:${b.o};--i:${i}`, html: BULUT });
    bulutlar.append(el);
  });

  const gunes = h('div.pz-gunes', { 'aria-hidden': 'true' }, h('i.pz-gunes-isin'), h('i.pz-gunes-parilti'));
  const sabah = h('div.pz-isik.pz-isik-sabah', { 'aria-hidden': 'true' });
  const aksam = h('div.pz-isik.pz-isik-aksam', { 'aria-hidden': 'true' });

  // öndeki flamalar (arka plandakilerden daha yakın: daha büyük, rüzgârda sallanır)
  const flamalar = ip('pz-flamalar', 9, 16, (i) =>
    h('i.pz-flama', { html: `<svg viewBox="0 0 30 40"><path d="M2 2h26L15 38z" fill="${RENKLER[i % RENKLER.length]}" stroke="${KONTUR}" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 6h8L10 18z" fill="#fff" opacity=".35"/></svg>` }),
  );

  const kuslar = h('div.pz-kus-katman', { 'aria-hidden': 'true' });
  const arka = h('div.pz-canli', {}, sabah, aksam, gunes, bulutlar, kuslar, flamalar);
  const ufuk = h('div.pz-ufuk', { 'aria-hidden': 'true' });

  if (secenek.senlik) {
    arka.classList.add('pz-canli-senlik');
    flamalar.remove();
    const fenerler = ip('pz-fenerler', 7, 22, (i) =>
      h('i.pz-fener', { style: `--r:${RENKLER[(i * 2) % RENKLER.length]}` }, h('b'), h('span.pz-fener-isik')),
    );
    arka.append(fenerler);
    // fenerler teker teker yanar
    [...fenerler.querySelectorAll<HTMLElement>('.pz-fener')].forEach((f, i) => sonra(SADE ? 0 : 300 + i * 180, () => f.classList.add('yandi')));
  }

  // ---------------------------------------------------------------- ara sıra olanlar
  const kusSurusu = () => {
    const yon = Math.random() < 0.5 ? 1 : -1;
    const suru = h('div.pz-kuslar', { style: `top:${ras(8, 26)}%;--yon:${yon}` });
    const adet = Math.floor(ras(3, 6));
    for (let i = 0; i < adet; i++) {
      suru.append(h('i.pz-kus', { style: `--x:${(i % 2 ? 1 : -1) * Math.ceil(i / 2) * 26}px;--y:${Math.ceil(i / 2) * 14}px;--g:${-ras(0, 0.4).toFixed(2)}s`, html: KUS }));
    }
    kuslar.append(suru);
    sonra(12000, () => suru.remove());
    sonra(ras(14000, 26000), kusSurusu);
  };
  const yaya = () => {
    const yon = Math.random() < 0.5 ? 1 : -1;
    const boy = ras(0.75, 1.1);
    const y = h('div.pz-yaya', { style: `--yon:${yon};--boy:${boy.toFixed(2)};--sure:${ras(22, 34).toFixed(1)}s`, html: sec(SILUETLER) });
    ufuk.append(y);
    sonra(36000, () => y.remove());
    sonra(ras(7000, 14000), yaya);
  };
  if (!SADE) {
    sonra(ras(3000, 6000), kusSurusu);
    sonra(800, yaya);
    sonra(ras(4000, 8000), yaya);
  }

  return {
    arka,
    ufuk,
    gun(t) {
      sabah.style.opacity = String(Math.max(0, 1 - t * 2.2));
      aksam.style.opacity = String(Math.max(0, Math.min(1, (t - 0.45) * 1.9)));
      gunes.style.setProperty('--gun', String(t));
    },
    kapat() {
      zamanlar.forEach(clearTimeout);
    },
  };
}

// ---------------------------------------------------------------- şenlik: uçan balonlar ve havai fişek
/** Alttan yükselen balonlar (sürekli, azalan sıklıkla); dönen fonksiyon durdurur */
export function balonlar(kap: HTMLElement): () => void {
  if (SADE) return () => undefined;
  let n = 0;
  let z = 0;
  const bir = () => {
    const b = h('div.pz-ucan-balon', { style: `left:${ras(4, 92)}%;--sure:${ras(6, 9).toFixed(1)}s;--sal:${ras(2.2, 3.4).toFixed(2)}s;--boy:${ras(0.8, 1.25).toFixed(2)}`, html: BALON(sec(RENKLER)) });
    kap.append(b);
    setTimeout(() => b.remove(), 9500);
    n++;
    z = window.setTimeout(bir, n < 14 ? 260 : ras(900, 1600));
  };
  bir();
  return () => clearTimeout(z);
}

/** Havai fişek: rastgele yerlerde renkli patlamalar; dönen fonksiyon durdurur */
export function havaiFisek(kap: HTMLElement): () => void {
  if (SADE) return () => undefined;
  let z = 0;
  const bir = () => {
    const renk = sec(RENKLER);
    const f = h('div.pz-fisek', { style: `left:${ras(12, 88)}%;top:${ras(10, 42)}%;--r:${renk};--boy:${ras(0.8, 1.3).toFixed(2)}` }, h('i.pz-fisek-flas'));
    for (let i = 0; i < 16; i++) f.append(h('i.pz-fisek-kivilcim', { style: `--a:${(i / 16) * 360}deg;--u:${(0.75 + (i % 3) * 0.18).toFixed(2)}` }));
    kap.append(f);
    setTimeout(() => f.remove(), 1600);
    z = window.setTimeout(bir, ras(700, 1500));
  };
  z = window.setTimeout(bir, 400);
  return () => clearTimeout(z);
}
