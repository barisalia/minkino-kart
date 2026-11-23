// Matematik · Ceren Öğretmen dersi 6: Toplama ve çıkarma başlangıcı (5+ yaş; yol haritası adım 8). Ders iskeletinin üstünde.
// Durağa otobüs gelir; beş penceresi beşlik çerçevedir. Çocuk yolcuyu bindirir ya da indirir, sonucu hemen görür (pencere dolar,
// boşalır), sonra kaç olduğunu rakam bloğundan seçer. Dört iş, her biri bir kez: bir fazla (2 + 1), beşe tamamla (3 + 2),
// eksilme (5 − 2), ona tamamla (iki otobüs: 8 + ? = 10; önce tahmin, sonra yolcular biner). Yanlışta Ceren yolcuları (ya da
// boş pencereleri) tek tek saydırır; ikinci yanlışta doğru blok kıpırdar. Sonda hatıra: otobüs bileti.
// Astra'nın M7 çizimleri ve Ceren'in sözleri tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&toplama=1 ile açılır,
// gelmemiş çizimin yerinde adı yazılı kutu durur (uygulama yoluna girmez).
import { menuYasiOku } from '../../src/engine/menu-yas';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  ETKINLIKLER, ETKINLIK_ADI, GEREKLI_CIZIMLER, GEREKLI_SESLER, PENCERE, SORULAR, TOPLAMA_KAYIT_ANAHTARI, kaydiCoz, siradaki, yasUygun,
  yerlesim, type Etkinlik, type ToplamaKaydi,
} from './ders-toplama-mantik';
import './ceren-ders.css';
import './ders-sekiller.css';
import './ders-toplama.css';

const KLASOR = '../../assets/matematik/ders/topla/';
const cizimler = import.meta.glob<string>('../../assets/matematik/ders/topla/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler[KLASOR + ad + '.webp'];
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/{ceren-*,rakam-*}.webp', { eager: true, query: '?url', import: 'default' });
const cerenCizimi = (ad: string) => cerenCizimleri['../../assets/matematik/ceren/' + ad + '.webp'];
const POZLAR = ['goster', 'alkis', 'sen-dene', 'el-salla', 'bir-fazla'] as const;
type Poz = (typeof POZLAR)[number] | 'konus';
const pozResmi = (p: string) => cizim('ceren-' + p) ?? cerenCizimi('ceren-' + p);
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ders/topla/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders/topla/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __toplamaSesleri?: string[] } }
if (TEST) window.__toplamaSesleri = [];
export const toplamaDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&toplama=1 ile. */
export const toplamaDersiGorunur = TEST ? adres.has('toplama') : toplamaDersiHazir;
/** Ders 5 yaş ve üzeri içindir. */
export const toplamaYasiUygun = () => yasUygun(menuYasiOku());
function kaydiOku(): ToplamaKaydi {
  try { return kaydiCoz(localStorage.getItem(TOPLAMA_KAYIT_ANAHTARI)); } catch { return kaydiCoz(null); }
}
export const toplamaDersiBitti = () => kaydiOku().bitti;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__toplamaSesleri?.push(id) });

/** Test kipinde, çizimi gelmemiş yolcunun kutusunda okunan ad. */
const ETIKET: Record<string, string> = { 'yolcu-ayicik': 'ayıcık', 'yolcu-kedi': 'kedi', 'yolcu-kopek': 'köpek', 'yolcu-penguen': 'penguen', 'yolcu-koala': 'koala' };
const SIMGE: Record<Etkinlik, string> = { fazla: 'yolcu-ayicik', doldur: 'yolcu-kedi', eksik: 'yolcu-kopek', on: 'yolcu-penguen' };

export type ToplamaDersiBaglami = { kok: HTMLElement; sesiAc: () => void; tekrarDinle: (fn: () => void) => void; bitir: () => void };

export function toplamaDersi(b: ToplamaDersiBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(TOPLAMA_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  let simdiki: Etkinlik = ETKINLIKLER[0];
  let guleDendi = false;

  // ----- Sahne: Ceren solda önde, durakta bekleyenler yanında, otobüs yolda, rakam blokları gökyüzünde -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya dt-dunya';
  dunya.innerHTML =
    resimHTML(cizim('durak'), 'cd-sinif', 'durak') +
    '<div class="dt-yol"></div><div class="dt-durak" role="group" aria-label="Durakta bekleyenler"></div>' +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.4, h: 0.6 }) +
    '<div class="dt-sayilar" role="group" aria-label="Sayılar"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const yolEl = dunya.querySelector<HTMLElement>('.dt-yol')!;
  const durakEl = dunya.querySelector<HTMLElement>('.dt-durak')!;
  const sayiEl = dunya.querySelector<HTMLElement>('.dt-sayilar')!;
  const sira = document.createElement('div');
  sira.className = 'ds-sira dt-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Dersin işleri');
  sira.innerHTML = ETKINLIKLER.map((e) => '<button type="button" class="ds-sira-sekil" data-etkinlik="' + e + '" aria-label="' + ETKINLIK_ADI[e] + '">' +
    resimHTML(cizim(SIMGE[e]), 'ds-sira-resim', SIMGE[e], '', '') + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.ds-sira-sekil'));
  b.kok.append(dunya, sira);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz: poz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const cerenPoz = (p: Poz) => poz(p);
  // Test kipi: Ceren konuşurken sahnede işaret (ölçüm betikleri sözün bitişini bekler; poz çizimi gelmeden yüz hep konuşma karesindedir).
  if (TEST) { const dinle = ses.konusmaDinle; ses.konusmaDinle = (v) => { dunya.dataset.konusuyor = String(v); dinle(v); }; }
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);
  const isaretle = (adim: string) => { dunya.dataset.adim = adim; dunya.dataset.etkinlik = simdiki; };

  function siraGuncelle() {
    siraDugmeleri.forEach((d) => {
      const e = d.dataset.etkinlik as Etkinlik, bitti = kayit.biten.includes(e);
      d.classList.toggle('bitti', bitti);
      d.classList.toggle('simdi', e === simdiki);
      d.setAttribute('aria-label', ETKINLIK_ADI[e] + (bitti ? ', öğrenildi' : e === simdiki ? ', şimdi' : ''));
      if (e === simdiki) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
  }
  siraDugmeleri.forEach((d) => akis.dokununca(d, () => {
    const e = d.dataset.etkinlik as Etkinlik;
    if (e === simdiki) { zipla(d); return; }
    if (!kayit.biten.includes(e)) { salla(d); return; }
    zipla(d);
    void isDersi(e);
  }));

  // ----- Otobüs, pencereler, yolcular -----
  const yolcuHTML = (ad: string) => resimHTML(cizim(ad), 'dt-yolcu-resim', ad, '', ETIKET[ad] ?? ad);
  const otobusVar = !!cizim('otobus');
  /** Otobüsler: her biri beş pencere (yuva). Yolcu pencerenin arkasında, belden yukarısı görünür. */
  function otobusleriKur(yolcular: string[][]) {
    yolEl.replaceChildren();
    yolEl.dataset.adet = String(yolcular.length);
    return yolcular.map((dolu, o) => {
      const otobus = document.createElement('div');
      otobus.className = 'dt-otobus' + (otobusVar ? '' : ' iskelet');
      otobus.dataset.o = String(o);
      const pencereler = Array.from({ length: PENCERE }, (_, i) => {
        const p = document.createElement('div');
        p.className = 'dt-pencere';
        p.dataset.i = String(i);
        if (dolu[i]) { p.dataset.yolcu = dolu[i]; p.innerHTML = yolcuHTML(dolu[i]); }
        return p;
      });
      otobus.append(...pencereler);
      otobus.insertAdjacentHTML('beforeend', resimHTML(cizim('otobus'), 'dt-govde', 'otobus', '', otobusVar ? 'otobüs' : ''));
      yolEl.append(otobus);
      return pencereler;
    });
  }
  function bekleyenleriKur(adlar: string[]) {
    durakEl.replaceChildren();
    durakEl.dataset.adet = String(adlar.length);
    return adlar.map((ad, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dt-bekleyen';
      d.dataset.yolcu = ad;
      d.dataset.i = String(i);
      d.setAttribute('aria-label', (ETIKET[ad] ?? ad) + ' otobüse binsin');
      d.innerHTML = yolcuHTML(ad);
      durakEl.append(d);
      return d;
    });
  }
  const doluSayisi = (pencereler: HTMLElement[][]) => pencereler.flat().filter((p) => p.dataset.yolcu).length;
  /** Yolcuyu bekleyenden ilk boş pencereye uçurur (son otobüsten başlar: onlukta ikinci otobüs dolar). */
  function bindir(pencereler: HTMLElement[][], ad: string, kaynak?: Element) {
    const p = [...pencereler].reverse().flat().find((x) => !x.dataset.yolcu) ?? pencereler.flat().find((x) => !x.dataset.yolcu);
    if (!p) return undefined;
    const bas = kaynak?.getBoundingClientRect();
    p.dataset.yolcu = ad;
    p.innerHTML = yolcuHTML(ad);
    p.classList.add('yeni');
    oyunSesi('damla');
    void ucur(p.firstElementChild as HTMLElement, bas, 480);
    return p;
  }
  async function otobusGelsin(a: number) {
    oyunSesi('korna');
    if (sakin || HIZLI) return akis.bekle(60, a);
    const anim = yolEl.animate([{ transform: 'translateX(-115%)' }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' });
    await Promise.race([anim.finished.catch(() => undefined), akis.bekle(1100, a)]);
    return akis.canli(a);
  }
  async function otobusGitsin(a: number) {
    if (sakin || HIZLI) return akis.bekle(60, a);
    const anim = yolEl.animate([{ transform: 'none' }, { transform: 'translateX(115%)' }], { duration: 800, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
    await Promise.race([anim.finished.catch(() => undefined), akis.bekle(1000, a)]);
    anim.cancel();
    return akis.canli(a);
  }
  /** İpucu: sayılacak olanlar (yolcular ya da boş pencereler) tek tek parlar. */
  async function sayarakGoster(hedefler: HTMLElement[], a: number) {
    for (const h of hedefler) {
      h.classList.add('sayiliyor');
      zipla(h.firstElementChild ?? h, 0.4);
      oyunSesi('damla');
      const devam = await akis.bekle(HIZLI ? 1 : 560, a);
      h.classList.remove('sayiliyor');
      if (!devam) return false;
    }
    return true;
  }
  function sayilariKur(secenek: readonly number[]) {
    sayiEl.replaceChildren();
    sayiEl.dataset.adet = String(secenek.length);
    return secenek.map((n, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dt-sayi';
      d.dataset.n = String(n);
      d.dataset.i = String(i);
      d.setAttribute('aria-label', String(n));
      d.innerHTML = resimHTML(cerenCizimi('rakam-' + n), 'dt-sayi-resim', 'rakam-' + n, '', String(n));
      sayiEl.append(d);
      if (!sakin) d.animate([{ transform: 'translateY(-30%) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: HIZLI ? 1 : 360, delay: HIZLI ? 0 : 110 * i, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
      return d;
    });
  }

  /** Bir iş: otobüs gelir, çocuk bindirir / indirir (ya da önce tahmin eder), sayıyı seçer, Ceren söyler, otobüs gider. */
  async function is_(e: Etkinlik, a: number) {
    const s = SORULAR[e], y = yerlesim(e);
    sayiEl.replaceChildren();
    const pencereler = otobusleriKur(y.otobusler);
    const bekleyenler = bekleyenleriKur(y.durakta);
    isaretle('gel');
    cerenPoz('goster');
    if (!(await otobusGelsin(a))) return false;
    const binenler: HTMLElement[] = [];

    if (s.is !== 'tahmin') {
      // Çocuğun eylemi: bekleyene dokununca biner, otobüstekine dokununca iner; sonuç anında görünür.
      isaretle('eylem');
      simdikiSoz = s.tanit;
      cerenPoz(e === 'fazla' ? 'bir-fazla' : 'sen-dene');
      let yapilan = 0;
      const tamam = await akis.adim((bitir) => {
        const hedefler = () => (s.is === 'bin' ? bekleyenler.filter((d) => d.isConnected) : pencereler.flat().filter((p) => p.dataset.yolcu));
        const bos = akis.bostaIzle(() => hedefler().forEach((h) => zipla(h.firstElementChild ?? h, 0.3)), () => s.tanit);
        const bitti = () => {
          bos.dur();
          dunya.dataset.yolcu = String(doluSayisi(pencereler));
          void akis.bekle(HIZLI ? 1 : 500, a).then((dv) => bitir(dv));
        };
        if (s.is === 'bin') {
          bekleyenler.forEach((d) => akis.dokununca(d, () => {
            if (yapilan >= s.adet || !d.isConnected) return;
            bos.dokundu();
            const p = bindir(pencereler, d.dataset.yolcu!, d);
            if (p) binenler.push(p);
            d.remove();
            yapilan++;
            dunya.dataset.yolcu = String(doluSayisi(pencereler));
            if (yapilan >= s.adet) bitti();
          }));
        } else {
          pencereler.flat().forEach((p) => {
            p.setAttribute('role', 'button');
            p.tabIndex = 0;
            akis.dokununca(p, () => {
              if (yapilan >= s.adet || !p.dataset.yolcu) return;
              bos.dokundu();
              // İnen yolcu durağa doğru süzülür ve kaybolur; Ceren el sallar.
              const img = p.firstElementChild as HTMLElement | null;
              delete p.dataset.yolcu;
              p.removeAttribute('role');
              p.tabIndex = -1;
              oyunSesi('geri');
              if (img && !sakin && !HIZLI) {
                img.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(-60%, 40%) scale(.8)', opacity: 0 }], { duration: 520, easing: 'ease-in', fill: 'forwards' })
                  .finished.then(() => { if (!p.dataset.yolcu) p.replaceChildren(); }, () => undefined);
              } else p.replaceChildren();
              yapilan++;
              dunya.dataset.yolcu = String(doluSayisi(pencereler));
              cerenPoz('el-salla');
              if (!guleDendi) { guleDendi = true; void ses.cal('gule'); }
              if (yapilan >= s.adet) bitti();
            });
          });
        }
        void ses.cal(s.tanit);
        return () => bos.dur();
      });
      if (!tamam || !akis.canli(a)) return false;
    } else {
      // Önce bak: iki otobüs, on pencere; Ceren gösterir.
      isaretle('tanit');
      simdikiSoz = s.tanit;
      cerenPoz('goster');
      if (!(await akis.konus(s.tanit, a))) return false;
    }

    // Soru: kaç? Rakam bloklarından biri.
    const sayilar = sayilariKur(s.secenek);
    isaretle('sor');
    simdikiSoz = s.sor;
    const ipucuHedefleri = () =>
      e === 'doldur' ? binenler : e === 'on' ? pencereler.flat().filter((p) => !p.dataset.yolcu) : pencereler.flat().filter((p) => p.dataset.yolcu);
    let yanlis = 0;
    const dogru = await akis.adim((bitir) => {
      const dogruEl = () => sayilar.find((d) => Number(d.dataset.n) === s.cevap)!;
      const bos = akis.bostaIzle(() => zipla(dogruEl(), 0.3), () => s.sor);
      let bitti = false, mesgul = false;
      sayilar.forEach((d) => akis.dokununca(d, () => {
        if (bitti || mesgul) return;
        bos.dokundu();
        if (Number(d.dataset.n) !== s.cevap) {
          yanlis++;
          salla(d);
          oyunSesi('geri');
          ses.sus();
          cerenPoz('goster');
          simdikiSoz = s.ipucu;
          mesgul = true;
          void akis.bekle(300, a)
            .then((dv) => (dv && !bitti ? ses.cal(s.ipucu) : false))
            .then((dv) => (dv && !bitti ? sayarakGoster(ipucuHedefleri(), a) : false))
            .then(() => {
              mesgul = false;
              if (bitti || !akis.canli(a)) return;
              simdikiSoz = s.sor;
              cerenPoz('sen-dene');
              if (yanlis >= 2) { sayilar.forEach((o) => o.classList.remove('ipucu')); dogruEl().classList.add('ipucu'); }
            });
          return;
        }
        bitti = true;
        bos.dur();
        sayilar.forEach((o) => { o.classList.remove('ipucu'); if (o !== d) o.classList.add('soluk'); });
        d.classList.add('dogru');
        zipla(d, 0.5);
        oyunSesi('miknatis');
        bitir(true);
      }));
      cerenPoz('sen-dene');
      void ses.cal(s.sor);
      return () => bos.dur();
    });
    if (!dogru || !akis.canli(a)) return false;

    // Tahminden sonra yolcular biner: çocuk sonucu görür (on pencere doldu).
    if (s.is === 'tahmin') {
      for (const d of bekleyenler) {
        if (!(await akis.bekle(HIZLI ? 1 : 420, a))) return false;
        bindir(pencereler, d.dataset.yolcu!, d);
        d.remove();
      }
      dunya.dataset.yolcu = String(doluSayisi(pencereler));
    }
    isaretle('dogru');
    cerenPoz('alkis');
    simdikiSoz = s.dogru;
    pencereler.flat().forEach((p) => p.classList.toggle('parla', !!p.dataset.yolcu));
    if (!(await akis.konus(s.dogru, a))) return false;
    if (!(await akis.bekle(300, a))) return false;
    sayiEl.replaceChildren();
    return otobusGitsin(a);
  }

  async function isDersi(e: Etkinlik) {
    akis.iptal();
    const a = akis.no;
    simdiki = e;
    siraGuncelle();
    const s = SORULAR[e];
    ses.onYukle([s.tanit, s.sor, s.dogru, s.ipucu, ...(e === 'eksik' ? ['gule'] : [])]);
    const tamam = await is_(e, a);
    if (!tamam || !akis.canli(a)) return;
    if (!kayit.biten.includes(e)) kayit.biten.push(e);
    const sonraki = siradaki(kayit);
    if (sonraki) kayit.simdi = sonraki;
    sakla();
    siraGuncelle();
    zipla(siraDugmeleri.find((d) => d.dataset.etkinlik === e));
    if (!sonraki) { void hatiraVer(a); return; }
    void isDersi(sonraki);
  }

  async function hatiraVer(a: number) {
    yolEl.replaceChildren();
    durakEl.replaceChildren();
    sayiEl.replaceChildren();
    simdiki = ETKINLIKLER[ETKINLIKLER.length - 1];
    isaretle('hatira');
    cerenPoz('alkis');
    const h = document.createElement('div');
    h.className = 'ds-hatira dt-hatira';
    h.innerHTML = resimHTML(cizim('hatira-bilet'), 'ds-hatira-resim', 'hatira-bilet', '', 'otobüs bileti');
    dunya.append(h);
    oyunSesi('birles');
    if (!sakin) h.animate([{ transform: 'scale(.2) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: HIZLI ? 1 : 560, easing: 'ease-out' });
    simdikiSoz = 'bitis';
    if (!(await akis.bekle(600, a))) return;
    if (!(await akis.konus('bitis', a))) return;
    simdikiSoz = 'hatira';
    if (!(await akis.konus('hatira', a))) return;
    kayit.bitti = true;
    sakla();
    if (!(await akis.bekle(600, a))) return;
    b.bitir();
  }

  let karsilandi = false;
  async function basla() {
    akis.iptal();
    const a = akis.no;
    const hatiraBekliyor = !kayit.bitti && ETKINLIKLER.every((e) => kayit.biten.includes(e));
    const e = kayit.bitti || hatiraBekliyor ? ETKINLIKLER[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit) ?? ETKINLIKLER[0] : kayit.simdi;
    simdiki = e;
    siraGuncelle();
    isaretle('giris');
    ses.onYukle(['giris', 'devam', SORULAR[e].tanit]);
    cerenPoz('konus');
    if (!kayit.tanitildi) {
      simdikiSoz = 'giris';
      if (!(await akis.konus('giris', a))) return;
      kayit.tanitildi = true;
      sakla();
    } else if (!karsilandi) {
      karsilandi = true;
      simdikiSoz = 'devam';
      if (!(await akis.konus('devam', a))) return;
    }
    if (!(await akis.bekle(250, a))) return;
    if (hatiraBekliyor) { void hatiraVer(a); return; }
    void isDersi(e);
  }

  akis.dokununca(ceren, () => { zipla(ceren, 0.25); tekrarla(); });
  function tekrarla() {
    if (!simdikiSoz) return;
    if (ses.calan === simdikiSoz && ses.bastan()) return;
    void ses.cal(simdikiSoz);
  }
  b.tekrarDinle(tekrarla);
  void basla();

  return () => {
    akis.kapandi = true;
    akis.iptal();
    cereniBirak();
    sira.remove();
    dunya.remove();
  };
}
