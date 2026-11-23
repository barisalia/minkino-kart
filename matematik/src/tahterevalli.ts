// Matematik · Ölçü tezgâhı turu "Bulut'un Tahterevalli Dengesi" (danışman CEVAP-06 C2-2). Ders iskeletinin üstünde.
// Bahçede tahterevalli: sol uçta balkabağı ve üstünde Bulut, tahta sola yatık. Çocuk yığından küpe dokunur, küp tahtanın sağ
// ucuna uçar; tahta her küpte biraz düzelir (yaylanarak, park fiziği gibi). Fazla koyarsa sol uç havalanır, Bulut kıkırdar;
// tahtadaki küpe dokununca küp yığına döner. Tam eşitlenince tahta yaylanıp düzleşir, Lokum alkışlar, Ceren "Dört küp:
// denge!" der. Yanlış yok, ceza yok: tahta kendisi gösterir. 5+ yaşta ikinci tur: balkabağının yanında sulama kabı.
// Astra'nın M13 çizimleri ve sözler tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&tahterevalli=1 ile açılır,
// gelmemiş çizimin yerinde adı yazılı kutu durur. Bağlantı (Ölçü tezgâhının tur sırası) Matematik oturumunda.
import { menuYasiOku } from '../../src/engine/menu-yas';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, hareketler, resimHTML } from './ders-iskelet';
import { GEREKLI_CIZIMLER, GEREKLI_SESLER, aci, dengeSesi, durum, turlar, yasYolu, yayAdimi, yiginBoyu, type Tur } from './tahterevalli-mantik';
import './ceren-ders.css';
import './tahterevalli.css';

const KLASOR = '../../assets/matematik/tahterevalli/';
const cizimler = import.meta.glob<string>('../../assets/matematik/tahterevalli/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler[KLASOR + ad + '.webp'];
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/tahterevalli/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri[KLASOR + 'ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __tahterevalliSesleri?: string[] } }
if (TEST) window.__tahterevalliSesleri = [];
export const tahterevalliHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&tahterevalli=1 ile. */
export const tahterevalliGorunur = TEST ? adres.has('tahterevalli') : tahterevalliHazir;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__tahterevalliSesleri?.push(id) });
const ETIKET: Record<string, string> = {
  bahce: 'bahçe', mesnet: 'ayak', kol: 'tahta', balkabagi: 'balkabağı', 'sulama-kabi': 'sulama kabı', kup: 'küp',
  'bulut-otur': 'Bulut', 'bulut-kikirda': 'Bulut kıkırdıyor', 'lokum-izle': 'Lokum', 'lokum-alkis': 'Lokum alkışlıyor',
};
const resim = (ad: string, sinif: string) => resimHTML(cizim(ad), sinif, ad, '', ETIKET[ad] ?? ad);

/** Tahtadaki küp yuvaları (tahtanın 1500 px'lik ölçeğinde merkezler): üçlü sıralar, alttan yukarı. */
const YUVA_X = [1000, 1116, 1232];
/** Yığındaki küpler (dünyada, 1920 × 1080): çimin dibinde tek sıra, en çok dört tane görünür (fazla küpte aşağı inen tahta ucuna değmez). */
const YIGIN_X = [1204, 1318, 1432, 1546], YIGIN_ALT = 912, KUP = 112;

export type TahterevalliBaglami = {
  kok: HTMLElement; sesiAc: () => void; tekrarDinle: (fn: () => void) => void; bitir: () => void;
  /** Yeniden oynayış sayısı (kayit.ts → Tur.tekrar): 4 yaşta balkabağı 3 ile 4 arasında değişir. */
  tekrar?: number;
};

export function tahterevalliTuru(b: TahterevalliBaglami): () => void {
  const yol = yasYolu(menuYasiOku());
  const sirali = turlar(yol, b.tekrar ?? 0);
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { zipla } = hareketler(sakin, HIZLI);
  let simdikiSoz = sirali[0].soz as string;

  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya tv-dunya';
  dunya.innerHTML =
    resim('bahce', 'cd-sinif') +
    '<div class="tv-lokum">' + resim('lokum-izle', 'tv-poz') + resim('lokum-alkis', 'tv-poz') + '</div>' +
    resim('mesnet', 'tv-mesnet') +
    '<div class="tv-kol"><div class="tv-govde">' + resim('kol', 'tv-govde-resim') + '</div>' +
    '<div class="tv-nesne" data-ad="balkabagi">' + resim('balkabagi', 'tv-nesne-resim') + '</div>' +
    '<div class="tv-nesne" data-ad="sulama-kabi" hidden>' + resim('sulama-kabi', 'tv-nesne-resim') + '</div>' +
    '<div class="tv-bulut" data-poz="otur">' + resim('bulut-otur', 'tv-poz') + resim('bulut-kikirda', 'tv-poz') + '</div>' +
    '<div class="tv-yuvalar" role="group" aria-label="Tahtadaki küpler"></div></div>' +
    '<div class="tv-yigin" role="group" aria-label="Küpler"></div>';
  dunya.querySelectorAll<HTMLElement>('.tv-lokum > .tv-poz, .tv-bulut > .tv-poz').forEach((p, i) => { p.dataset.poz = ['izle', 'alkis', 'otur', 'kikirda'][i]; });
  const kol = dunya.querySelector<HTMLElement>('.tv-kol')!;
  const yuvalar = dunya.querySelector<HTMLElement>('.tv-yuvalar')!;
  const yigin = dunya.querySelector<HTMLElement>('.tv-yigin')!;
  const bulut = dunya.querySelector<HTMLElement>('.tv-bulut')!;
  const lokum = dunya.querySelector<HTMLElement>('.tv-lokum')!;
  lokum.dataset.poz = 'izle';
  b.kok.append(dunya);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  // Test kipi: Ceren konuşurken sahnede işaret (ölçüm betikleri sözün bitişini bekler).
  if (TEST) ses.konusmaDinle = (v) => { dunya.dataset.konusuyor = String(v); };

  // ----- Yaylanan tahta: açı hedefe yay ve sönümle oturur (hareket azaltılmışsa doğrudan) -----
  let yay = { aci: 0, hiz: 0 }, hedefAci = 0, raf = 0, onceki = 0;
  const ciz = () => { kol.style.transform = 'rotate(' + yay.aci.toFixed(2) + 'deg)'; };
  function adimla(t: number) {
    const dt = onceki ? (t - onceki) / 1000 : 0;
    onceki = t;
    yay = yayAdimi(yay, hedefAci, dt);
    ciz();
    if (Math.abs(yay.aci - hedefAci) < 0.02 && Math.abs(yay.hiz) < 0.05) { yay = { aci: hedefAci, hiz: 0 }; ciz(); raf = 0; onceki = 0; return; }
    raf = requestAnimationFrame(adimla);
  }
  function aciyaGit(a: number, itme = 0) {
    hedefAci = a;
    kol.dataset.aci = a.toFixed(1);
    if (sakin || HIZLI) { yay = { aci: a, hiz: 0 }; ciz(); return; }
    yay.hiz += itme;
    if (!raf) { onceki = 0; raf = requestAnimationFrame(adimla); }
  }

  // ----- Küpler -----
  const kupHTML = resim('kup', 'tv-kup-resim');
  function kupDugmesi(sinif: string, etiket: string) {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = sinif;
    d.setAttribute('aria-label', etiket);
    d.innerHTML = kupHTML;
    return d;
  }
  /** Tahtadaki küpleri yuvalara dizer (çıkan küpün yeri kapanır). */
  function tahtayiDiz() {
    Array.from(yuvalar.children).forEach((k, i) => {
      const el = k as HTMLElement;
      el.style.left = ((YUVA_X[i % 3] - KUP / 2) / 1500 * 100).toFixed(3) + '%';
      el.style.top = ((30 - KUP * (Math.floor(i / 3) + 1)) / 120 * 100).toFixed(3) + '%';
    });
  }
  function yiginiDiz(adet: number) {
    yigin.replaceChildren();
    for (let i = 0; i < Math.min(YIGIN_X.length, adet); i++) {
      const d = kupDugmesi('tv-yigin-kup', 'Küpü tahtaya koy');
      d.style.left = ((YIGIN_X[i] - KUP / 2) / 1920 * 100).toFixed(3) + '%';
      d.style.top = ((YIGIN_ALT - KUP) / 1080 * 100).toFixed(3) + '%';
      yigin.append(d);
    }
  }
  /** Öğeyi bir konumdan şimdiki yerine uçurur (tahta dönüyor olsa da yalnız kayma). */
  function ucur(el: HTMLElement, bas: DOMRect | undefined) {
    if (!bas || sakin || HIZLI) return;
    const son = el.getBoundingClientRect();
    el.animate([{ translate: (bas.left - son.left) + 'px ' + (bas.top - son.top) + 'px' }, { translate: '0 0' }], { duration: 380, easing: 'cubic-bezier(.3,.7,.3,1)' });
  }

  async function oyna(t: Tur, a: number) {
    // Nesneler: balkabağı her zaman, sulama kabı ikinci turda.
    dunya.querySelector<HTMLElement>('.tv-nesne[data-ad="sulama-kabi"]')!.hidden = !t.nesneler.some((n) => n.ad === 'sulama-kabi');
    yuvalar.replaceChildren();
    let kalan = yiginBoyu(t.hedef);
    yiginiDiz(kalan);
    bulut.dataset.poz = 'otur';
    lokum.dataset.poz = 'izle';
    dunya.dataset.hedef = String(t.hedef);
    const guncelle = () => {
      const k = yuvalar.childElementCount, d = durum(k, t.hedef);
      dunya.dataset.kup = String(k);
      dunya.dataset.durum = d;
      bulut.dataset.poz = d === 'fazla' ? 'kikirda' : 'otur';
      aciyaGit(aci(k, t.hedef), d === 'denge' ? 0 : yay.aci < aci(k, t.hedef) ? 40 : -40);
      return d;
    };
    guncelle();
    simdikiSoz = t.soz;
    let fazlaDendi = false;
    const tamam = await akis.adim((bitir) => {
      let bitti = false, onay = 0;
      const bos = akis.bostaIzle(() => zipla((dunya.dataset.durum === 'fazla' ? yuvalar.lastElementChild : yigin.firstElementChild) as HTMLElement | null, 0.4), () => 'ipucu');
      const sonuc = () => {
        const d = guncelle();
        if (d === 'fazla') {
          ses.sus();
          if (!fazlaDendi) { fazlaDendi = true; simdikiSoz = 'fazla'; void ses.cal('fazla'); }
        }
        // Denge, tahta oturup çocuk bir an durunca onaylanır (gerçek parktaki gibi): bu arada konan bir küp daha fazlaya geçirir.
        clearTimeout(onay);
        if (d === 'denge') onay = window.setTimeout(() => { if (!bitti && durum(yuvalar.childElementCount, t.hedef) === 'denge') { bitti = true; bos.dur(); bitir(true); } }, HIZLI ? 350 : sakin ? 600 : 1100);
      };
      yigin.addEventListener('pointerdown', (e) => {
        const k = (e.target as Element).closest<HTMLElement>('.tv-yigin-kup');
        if (!k || bitti || !e.isPrimary) return;
        b.sesiAc();
        bos.dokundu();
        const bas = k.getBoundingClientRect();
        const yeni = kupDugmesi('tv-kup', 'Küpü geri al');
        yuvalar.append(yeni);
        tahtayiDiz();
        ucur(yeni, bas);
        kalan--;
        yiginiDiz(kalan);
        oyunSesi('kutu');
        sonuc();
      });
      yuvalar.addEventListener('pointerdown', (e) => {
        const k = (e.target as Element).closest<HTMLElement>('.tv-kup');
        if (!k || bitti || !e.isPrimary) return;
        b.sesiAc();
        bos.dokundu();
        k.remove();
        tahtayiDiz();
        kalan++;
        yiginiDiz(kalan);
        ucur(yigin.lastElementChild as HTMLElement, k.getBoundingClientRect());
        oyunSesi('geri');
        sonuc();
      });
      void ses.cal(t.soz);
      return () => { bos.dur(); clearTimeout(onay); };
    });
    if (!tamam || !akis.canli(a)) return false;
    // Denge: tahta yaylanır, ikisi birlikte zıplar, Lokum alkışlar, Ceren sayıyı söyler.
    ses.sus();
    oyunSesi('birles');
    aciyaGit(0, sakin ? 0 : 22);
    lokum.dataset.poz = 'alkis';
    zipla(bulut, 0.5);
    zipla(dunya.querySelector('.tv-nesne'), 0.25);
    simdikiSoz = dengeSesi(t.hedef);
    if (!(await akis.konus(simdikiSoz, a))) return false;
    return akis.bekle(700, a);
  }

  async function basla() {
    akis.iptal();
    const a = akis.no;
    for (const t of sirali) if (!(await oyna(t, a))) return;
    simdikiSoz = 'bitis';
    if (!(await akis.konus('bitis', a))) return;
    if (!(await akis.bekle(500, a))) return;
    dunya.dataset.bitti = '1';
    b.bitir();
  }
  const tekrarla = () => { if (ses.calan === simdikiSoz && ses.bastan()) return; void ses.cal(simdikiSoz); };
  b.tekrarDinle(tekrarla);
  ses.onYukle([...new Set([...sirali.map((t) => t.soz), ...sirali.map((t) => dengeSesi(t.hedef)), 'fazla', 'ipucu', 'bitis'])]);
  // Açılışta balkabağı tahtayı yere bastırır (düz başlar, sola yaylanarak yatar).
  aciyaGit(aci(0, sirali[0].hedef));
  void basla();

  return () => {
    akis.kapandi = true;
    akis.iptal();
    cancelAnimationFrame(raf);
    dunya.remove();
  };
}
