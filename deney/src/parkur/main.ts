// Deneyler · Zincirleme Top Parkuru (Paket Deney-Y1, Deney-A1; yönetici 22–23 Kasım). Altı bölüm: her biri yeni bir parçayla
// (trambolin, kaykay, yay ve pota, su değirmeni, körük ve balon), sonda mega zincir ve çan kulesi. Bölümler küçük bir haritadan
// seçilir (harita.ts); sahne sahne.ts'te, fizik motor.ts ve mekanizmalar.ts'te, bölümlerin ölçüleri bolumler.ts'te.
// Çizimleri tamam olmayan bölüm uygulamada açılmaz; test kipinde (?test=1) çizimsiz denetim görünümüyle her şey açık.
// Adresler: ?bolum=N doğrudan bölüm; ?harita=1 harita (test). Test kipinde bölüm verilmezse 1. bölüm açılır.
import { sesiAc } from '../../../src/audio/ses';
import { menuYasiOku } from '../../../src/engine/menu-yas';
import { geriDinle } from '../../../src/kabuk/yon';
import { anaMenuyeDon } from '../../../src/uygulama';
import { BOLUM_SAYISI, bolum } from './bolumler';
import { var_ } from './cizimler';
import { haritaCizimleri, haritaKur, ilerleme } from './harita';
import { bolumCizimleri, dugmeResmi, sahneKur, type Sahne } from './sahne';
import { sesKaydi, sesleriYukle } from './ses';
import type { Yas } from './motor';
import './stil.css';

const ARAMA = new URLSearchParams(location.search);
const TEST = ARAMA.has('test');
function yasi(): Yas {
  const a = ARAMA.get('yas');
  const y = a ? Number(a) : menuYasiOku() ?? 4;
  return y <= 3 ? 'minik' : y === 4 ? 'dort' : 'bes';
}
const YAS = yasi();
const kok = document.querySelector<HTMLElement>('#sahne')!;
/** Bölümün çizimleri tamam mı (uygulamada yalnız hazır bölüm açılır; test kipinde hepsi). */
export const bolumHazir = (no: number) => TEST || bolumCizimleri(bolum(no)).every(var_);
const haritaHazir = () => TEST || haritaCizimleri().every(var_);
if (!bolumHazir(1) && !TEST) anaMenuyeDon();

// Üst düğmeler: ev (haritaya, harita yoksa ana menüye) ve "tekrar dinle".
const dugme = (ad: 'ev' | 'dinle', etiket: string, sinif: string) => {
  const b = document.createElement('button');
  b.className = 'pk-nav ' + sinif;
  b.setAttribute('aria-label', etiket);
  b.innerHTML = '<img src="' + (dugmeResmi(ad) ?? '') + '" alt="" draggable="false">';
  document.body.append(b);
  return b;
};
const ev = dugme('ev', 'Ana menü', 'pk-ev');
const dinle = dugme('dinle', 'Tekrar dinle', 'pk-dinle');

let sahne: Sahne | null = null;
let haritaKapat: (() => void) | null = null;
let ekran: 'harita' | 'bolum' = 'bolum';
/** Bölümü açar; dokunuşla açıldıysa (haritadan) Ceren hemen tanıtır. */
function bolumAc(no: number, hemen = false) {
  haritaKapat?.(); haritaKapat = null;
  sahne?.kapat();
  ekran = 'bolum';
  document.body.dataset.ekran = 'bolum';
  sahne = sahneKur(kok, {
    no, yas: YAS, test: TEST, haritaVar: haritaHazir(),
    sonraki: () => {
      // Sıradaki: harita varsa haritaya (yeni durak açılır), yoksa sıradaki hazır bölüme.
      if (haritaHazir()) { haritaAc(no + 1); return; }
      const s = no + 1 <= BOLUM_SAYISI && bolumHazir(no + 1) ? no + 1 : 1;
      bolumAc(s);
    },
  });
  if (hemen) void sahne.basla();
  if (TEST) window.__parkur = testKancasi();
}
function haritaAc(yeniAcilan?: number) {
  sahne?.kapat(); sahne = null;
  ekran = 'harita';
  document.body.dataset.ekran = 'harita';
  haritaKapat = haritaKur(kok, { test: TEST, hazir: bolumHazir, ac: (no) => bolumAc(no, true), yeniAcilan });
  if (TEST) window.__parkur = testKancasi();
}
ev.onclick = () => { sesiAc(); if (ekran === 'bolum' && haritaHazir()) haritaAc(); else anaMenuyeDon(); };
dinle.onclick = () => { sesiAc(); void sesleriYukle()?.then(() => sahne?.tekrarDinle()); };
geriDinle(() => { if (ekran === 'bolum' && haritaHazir()) { haritaAc(); return true; } return false; });

// Başlangıç: ?bolum=N; test kipinde bölüm yoksa 1 (harita ?harita=1 ile); uygulamada harita hazırsa harita, değilse 1. bölüm.
const istenen = Number(ARAMA.get('bolum'));
if (istenen >= 1 && istenen <= BOLUM_SAYISI && bolumHazir(istenen)) bolumAc(istenen);
// Harita yalnız çizimleri tamamsa (uygulamada adresle de açılmaz); test kipinde ?harita=1 ile.
else if ((ARAMA.has('harita') && haritaHazir()) || (!TEST && haritaHazir())) haritaAc();
else bolumAc(1);
// Uygulamanın web görünümünde ses dokunuş beklemeden açılabilir: sahne kendisi tanıtır; tarayıcıda ilk dokunuşu bekler.
kok.addEventListener('pointerdown', () => { void sahne?.basla(); }, { capture: true });

declare global { interface Window { __parkur?: unknown } }
function testKancasi() {
  return {
    get parkur() { return sahne?.motor; },
    sesKaydi,
    basla: () => sahne?.basla(),
    kolCek: () => sahne?.kolCek(),
    yerlestir: (id: string) => sahne?.yerlestir(id),
    durum: () => (ekran === 'harita' ? 'harita' : sahne?.durum()),
    bolumAc, haritaAc, ilerleme,
    /** Video eşitleme işareti: sol üstte 150 ms siyah kare; zamanı döner. */
    isaret: () => {
      const e = document.createElement('div');
      e.style.cssText = 'position:fixed;left:0;top:0;width:80px;height:80px;background:#000;z-index:99';
      document.body.append(e);
      setTimeout(() => e.remove(), 150);
      return performance.now();
    },
    cizimHazir: sahne?.hazir ?? false,
  };
}
if (TEST) window.__parkur = testKancasi();
