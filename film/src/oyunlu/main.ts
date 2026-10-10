/**
 * Oyunlu çizgi film deneme sayfası: /oyunlu/kinonun-bir-gunu.html (uygulama menüsünde YOK; Barış görüp onaylayınca
 * eklenir). İlk oynanır parça: Sahne 1-2 + Oyun 1 Kum Saati (film/src/oyunlu/bolum1.ts).
 *
 * Adres seçenekleri: ?yas=3|4|5|6 (yoksa uygulamanın yaş ayarı), ?izle=1 (yalnız izle: oyunu Kino oynar),
 * ?an=kum-saati (an tekrarı: diş oyunu kısa girişle), ?hiz=N (test: saat N kat hızlı), ?kayit=1 (kare kare kayıt:
 * window.oyunluKayit; oyunu sanal parmak oynar).
 */
import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import './oyunlu.css';
import { sesiAc } from '../../../src/audio/ses';
import { durum } from '../../../src/engine/ilerleme';
import { h } from '../../../src/ui/dom';
import icerik from '../../../content/oyunlu/kinonun-bir-gunu.json';
import { bolumKur } from './bolum1';
import { Oynatici, Sozler, type SozTanim } from './oynatici';
import { filmMuzik } from '../muzik';
import { muzikSon, sesDurum, sesiIsle } from './ses';

const q = new URLSearchParams(location.search);
const KAYIT = q.has('kayit');
const HIZ = Math.max(0.1, Number(q.get('hiz') ?? 1) || 1);
const KAYIT_ANAHTARI = 'minkino-oyunlu-v1';

let yas = Number(q.get('yas') ?? durum.i.yas ?? 3);
const sozler = new Sozler(icerik.sozler as Record<string, SozTanim>);
const kok = document.getElementById('oyunlu')!;
const tuval = h('canvas.oy-tuval', { 'aria-label': "Kino'nun Bir Günü" }) as HTMLCanvasElement;
kok.append(tuval);

let oynatici!: Oynatici;
let bolum!: ReturnType<typeof bolumKur>;
let kurulanYas = -1;
function kur() {
  sozler.temizle();
  // yeni bölüm görselleri yüklenmeden çizilmez
  basladi = false;
  kurulanYas = yas;
  bolum = bolumKur({ sozler, saat: () => oynatici.saat, yasBuyuk: yas >= 5, izle: q.has('izle'), simule: KAYIT });
  oynatici = new Oynatici(tuval, bolum.parcalar, sozler);
  oynatici.baslik = { metin: icerik.baslik, ust: icerik.dizi, bas: 0.6, son: 4.6 };
  oynatici.onParca = (ad) => {
    kok.dataset.parca = ad;
    kaydet({ sonParca: ad });
  };
  oynatici.onBitti = () => {
    kok.dataset.parca = 'son';
    const o = bolum.ayna.sonuc;
    const k = oku();
    const kez = (k.oyunlar?.['kum-saati']?.kez ?? 0) + 1;
    kaydet({ sonParca: 'son', oyunlar: { ...k.oyunlar, 'kum-saati': { kez, cocuk: !!o?.cocuk } } });
    muzikSon(1);
    if (!KAYIT) sonEkrani();
  };
  boyutla();
}

// ---------------------------------------------------------------- kayıt (yalnız cihazda)
interface Kayit {
  bolum?: string;
  sonParca?: string;
  oyunlar?: Record<string, { kez: number; cocuk: boolean }>;
}
function oku(): Kayit {
  try {
    return JSON.parse(localStorage.getItem(KAYIT_ANAHTARI) ?? '{}') as Kayit;
  } catch {
    return {};
  }
}
function kaydet(k: Kayit) {
  try {
    localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify({ ...oku(), bolum: icerik.ad, ...k }));
  } catch {
    /* gizli sekme: kayıt yok, oyun sürer */
  }
}

// ---------------------------------------------------------------- boyut
function boyutla() {
  // kayıtta sabit kadraj (?boy=390x844 dikey)
  const [bw, bh] = (q.get('boy') ?? '844x390').split('x').map(Number);
  const W = KAYIT ? bw : window.innerWidth, H = KAYIT ? bh : window.innerHeight;
  const dpr = KAYIT ? Number(q.get('dpr') ?? 2) : Math.min(3, window.devicePixelRatio || 1);
  oynatici.boyutla(W, H, dpr);
  // duraklatılmış / bitmiş filmde döngü yok: yeni boyutta bir kez çiz
  if (!dongu && basladi) oynatici.ciz();
}
window.addEventListener('resize', () => oynatici && boyutla());

// ---------------------------------------------------------------- dokunma
function nokta(e: PointerEvent): [number, number] {
  const r = tuval.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}
let basili: number | null = null;
tuval.addEventListener('pointerdown', (e) => {
  if (basili !== null) return;
  basili = e.pointerId;
  tuval.setPointerCapture?.(e.pointerId);
  oynatici.parca?.dokun?.('bas', ...nokta(e));
});
tuval.addEventListener('pointermove', (e) => {
  if (e.pointerId === basili) oynatici.parca?.dokun?.('kay', ...nokta(e));
});
const birak = (e: PointerEvent) => {
  if (e.pointerId !== basili) return;
  basili = null;
  oynatici.parca?.dokun?.('kalk', ...nokta(e));
};
tuval.addEventListener('pointerup', birak);
tuval.addEventListener('pointercancel', birak);

// ---------------------------------------------------------------- döngü
let dongu = 0;
let onceki = 0;
let basladi = false;
async function oynat(i = 0, t0 = 0) {
  kok.dataset.durum = 'yukleniyor';
  await bolum.yukle();
  oynatici.baslat(i, t0);
  basladi = true;
  kok.dataset.durum = 'oynuyor';
  cancelAnimationFrame(dongu);
  onceki = performance.now();
  const kare = (simdi: number) => {
    const dt = Math.min(0.05, (simdi - onceki) / 1000) * HIZ;
    onceki = simdi;
    // hızlı testte büyük adımı küçük adımlara böl (yaylar kararlı kalsın)
    const n = Math.ceil(dt / (1 / 30));
    for (let k = 0; k < n; k++) oynatici.adim(dt / n);
    oynatici.ciz();
    if (!oynatici.bitti) dongu = requestAnimationFrame(kare);
    else dongu = 0;
  };
  dongu = requestAnimationFrame(kare);
}

// ---------------------------------------------------------------- ekranlar (film dışı)
const duraklatDugme = h('button.oy-duraklat', { type: 'button', 'aria-label': 'Duraklat' }, h('i'), h('i')) as HTMLButtonElement;
duraklatDugme.addEventListener('click', () => {
  oynatici.duraklat = !oynatici.duraklat;
  filmMuzik.duraklat(oynatici.duraklat);
  kok.classList.toggle('oy-durakli', oynatici.duraklat);
  duraklatDugme.setAttribute('aria-label', oynatici.duraklat ? 'Devam' : 'Duraklat');
});

function kapakEkrani() {
  const yasDugme = (etiket: string, deger: number) => {
    const d = h('button.oy-yas', { type: 'button', 'data-yas': String(deger) }, etiket) as HTMLButtonElement;
    d.classList.toggle('secili', (yas >= 5) === deger >= 5);
    d.addEventListener('click', () => {
      yas = deger;
      for (const x of kapak.querySelectorAll('.oy-yas')) x.classList.toggle('secili', x === d);
    });
    return d;
  };
  const oynatD = h('button.oy-oynat', { type: 'button', 'aria-label': 'Oynat' }, h('span.oy-ucgen')) as HTMLButtonElement;
  const kapak = h(
    'div.oy-kapak',
    {},
    h('div.oy-kapak-ust', {}, icerik.dizi),
    h('h1.oy-kapak-baslik', {}, icerik.baslik),
    h('div.oy-kapak-alt', {}, 'Oyunlu çizgi film · deneme (Sahne 1-2, Oyun 1)'),
    oynatD,
    h('div.oy-yaslar', {}, yasDugme('3-4 yaş', 3), yasDugme('5-6 yaş', 5)),
  );
  oynatD.addEventListener('click', () => {
    sesiAc();
    kapak.remove();
    // kapakta yüklenen bölüm kullanılır; yaş değiştiyse yeniden kurulur (görseller tarayıcı önbelleğinden)
    if (kurulanYas !== yas) kur();
    kok.append(duraklatDugme);
    if (q.get('an') === 'kum-saati') void oynat(bolum.anBaslangic.i, bolum.anBaslangic.t);
    else void oynat();
  });
  kok.append(kapak);
  kok.dataset.durum = 'kapak';
}

function sonEkrani() {
  duraklatDugme.remove();
  const bastan = h('button.oy-dugme', { type: 'button' }, 'Baştan izle') as HTMLButtonElement;
  const tekrar = h('button.oy-dugme', { type: 'button' }, 'Diş oyununu tekrar oyna') as HTMLButtonElement;
  const son = h('div.oy-son', {}, h('div.oy-son-baslik', {}, 'Sahne 1-2 bitti'), h('div.oy-son-alt', {}, 'Devamı: Sahne 3 "Kendim giyinirim"'), bastan, tekrar);
  const git = (an: boolean) => {
    son.remove();
    kur();
    kok.append(duraklatDugme);
    if (an) void oynat(bolum.anBaslangic.i, bolum.anBaslangic.t);
    else void oynat();
  };
  bastan.addEventListener('click', () => git(false));
  tekrar.addEventListener('click', () => git(true));
  kok.append(son);
  kok.dataset.durum = 'son';
}

// ---------------------------------------------------------------- test ve kayıt arayüzü
declare global {
  interface Window {
    oyunlu?: { parca: () => string | undefined; kopuk: () => [number, number] | null; kum: () => number; evre: () => string };
    oyunluKayit?: { hazir: Promise<void>; adim: (n: number) => void; bitti: () => boolean; saat: () => number; sesiIsle: (sure: number) => Promise<string>; fps: number };
  }
}
window.oyunlu = {
  parca: () => oynatici?.parca?.ad,
  kopuk: () => bolum?.kopukEkran() ?? null,
  kum: () => bolum?.ayna.kum ?? 0,
  evre: () => bolum?.ayna.evre ?? '',
};

if (KAYIT) {
  sesDurum.kayit = true;
  kur();
  const FPS = 30;
  const hazir = (async () => {
    await document.fonts.load('600 20px Fredoka');
    await document.fonts.load('700 20px Fredoka');
    await bolum.yukle();
    oynatici.baslat(0, 0);
    basladi = true;
  })();
  window.oyunluKayit = {
    hazir,
    fps: FPS,
    adim(n) {
      for (let i = 0; i < n; i++) oynatici.adim(1 / FPS);
      oynatici.ciz();
    },
    bitti: () => oynatici.bitti,
    saat: () => oynatici.saat,
    sesiIsle,
  };
} else {
  void document.fonts.load('600 20px Fredoka').catch(() => undefined);
  kapakEkrani();
  // görseller kapak ekranındayken yüklenir: Oynat'a basınca bekleme olmasın
  kur();
  void bolum.yukle();
}
