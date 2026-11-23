// Matematik · Ceren Öğretmen dersi 4: Örüntü (yol haritası adım 6). Ders iskeletinin üstünde.
// Örüntü, tekrar eden bir sıra: Ceren diziyi okur (bayraklar ipte sırayla zıplar, taşlar parlar, çalgılar çalar), çocuk
// sıradaki boşlukları seçeneklerden doldurur; dizi dolunca bir kez baştan "çalar". Etkinlikler: renk (bayrak), şekil (taş),
// ses (davul, çıngırak, alkış); 4 yaştan sonra çocuk iki bayrak seçip kendi örüntüsünü kurar, ip onun örüntüsüyle dolar.
// 2–3 yaşta AB ve tek boşluk; 4 yaşta AB/AAB ve iki boşluk; 5+ yaşta ABC ve AAB. Fener tiyatrosuna girerken açılır.
// Astra'nın M5 çizimleri ve Ceren'in sözleri tamam değilse çocuklara hiç görünmez; test kipinde ?test=1&oruntu=1 ile
// açılır, gelmemiş çizimin yerinde adı yazılı kutu durur (uygulama yoluna girmez).
import { menuYasiOku } from '../../src/engine/menu-yas';
import { calgiSesi } from '../../src/audio/bando';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  BAYRAKLAR, CALGI_SESI, ETKINLIK_ADI, GEREKLI_CIZIMLER, GEREKLI_SESLER, ORUNTU_KAYIT_ANAHTARI, YUVA, beklenen, desen, dersEtkinlikleri,
  dogruSesi, gorunen, kaydiCoz, kendiDizisi, siradaki, type Etkinlik, type OYol, type OruntuKaydi,
} from './ders-oruntu-mantik';
import './ceren-ders.css';
import './ders-sekiller.css';
import './ders-oruntu.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ders/oruntu/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler['../../assets/matematik/ders/oruntu/' + ad + '.webp'];
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/ceren-*.webp', { eager: true, query: '?url', import: 'default' });
const POZLAR = ['goster', 'alkis', 'sen-dene', 'sira-goster', 'davul'] as const;
type Poz = (typeof POZLAR)[number] | 'konus';
const pozResmi = (p: string) => cizim('ceren-' + p) ?? cerenCizimleri['../../assets/matematik/ceren/ceren-' + p + '.webp'];
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ders/oruntu/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders/oruntu/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __oruntuSesleri?: string[]; __oruntuKendi?: string[] } }
if (TEST) window.__oruntuSesleri = [];
export const oruntuDersiHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa kendiliğinden açılır; test kipinde yalnız ?test=1&oruntu=1 ile. */
export const oruntuDersiGorunur = TEST ? adres.has('oruntu') : oruntuDersiHazir;
const yolu = (): OYol => { const y = menuYasiOku() ?? 5; return y < 4 ? 'minik' : y === 4 ? 'dort' : 'bes'; };
function kaydiOku(): OruntuKaydi {
  try { return kaydiCoz(localStorage.getItem(ORUNTU_KAYIT_ANAHTARI), dersEtkinlikleri(yolu())); } catch { return kaydiCoz(null, dersEtkinlikleri(yolu())); }
}
export const oruntuDersiBitti = () => kaydiOku().bitti;

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__oruntuSesleri?.push(id) });

/** Test kipinde, çizimi gelmemiş nesnenin kutusunda okunan ad. */
const ETIKET: Record<string, string> = {
  'bayrak-kirmizi': 'kırmızı', 'bayrak-mavi': 'mavi', 'bayrak-sari': 'sarı',
  'tas-kirmizi-daire': 'daire', 'tas-mavi-kare': 'kare', 'tas-sari-ucgen': 'üçgen', 'tas-yesil-yildiz': 'yıldız',
  davul: 'davul', cingirak: 'çıngırak', alkis: 'alkış',
};
const SIMGE: Record<Etkinlik, string> = { renk: 'bayrak-kirmizi', sekil: 'tas-mavi-kare', ses: 'davul', kendi: 'bayrak-sari' };
const sesli = (ad: string) => ad in CALGI_SESI;

export type OruntuDersiBaglami = {
  kok: HTMLElement; sesiAc: () => void; tekrarDinle: (fn: () => void) => void; bitir: () => void;
  /** Bir konuda ilk denemede yanlış ya da yanlışsız doğru (akıllı tekrar, veli sayfası). */
  zorlandi?: (konu: string) => void;
  basardi?: (konu: string) => void;
};

export function oruntuDersi(b: OruntuDersiBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => { try { localStorage.setItem(ORUNTU_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const yol = yolu();
  const etkinlikler = dersEtkinlikleri(yol);
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let simdikiSoz = 'giris';
  let simdiki: Etkinlik = etkinlikler[0];
  let ovgu = 0;

  // ----- Sahne: Ceren solda önde, ip duvarda, seçenekler masanın kenarında -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya dr-dunya';
  dunya.innerHTML =
    resimHTML(cizim('bayram-sinifi'), 'cd-sinif', 'bayram-sinifi') +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.4, h: 0.6 }) +
    '<div class="dr-dizi" role="group" aria-label="Örüntü"></div><div class="dr-secenekler" role="group" aria-label="Seçenekler"></div>';
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const diziEl = dunya.querySelector<HTMLElement>('.dr-dizi')!;
  const secEl = dunya.querySelector<HTMLElement>('.dr-secenekler')!;
  const sira = document.createElement('div');
  sira.className = 'ds-sira dr-sira';
  sira.setAttribute('role', 'group');
  sira.setAttribute('aria-label', 'Örüntüler');
  sira.innerHTML = etkinlikler.map((e) => '<button type="button" class="ds-sira-sekil" data-etkinlik="' + e + '" aria-label="' + ETKINLIK_ADI[e] + '">' +
    resimHTML(cizim(SIMGE[e]), 'ds-sira-resim', SIMGE[e], '', '') + '</button>').join('');
  const siraDugmeleri = Array.from(sira.querySelectorAll<HTMLButtonElement>('.ds-sira-sekil'));
  b.kok.append(dunya, sira);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz: poz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const cerenPoz = (p: Poz) => poz(p);
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
    void etkinlikDersi(e);
  }));

  // ----- Dizi ve seçenekler -----
  const nesneHTML = (ad: string) => resimHTML(cizim(ad), 'dr-resim', ad, '', ETIKET[ad] ?? ad);
  /** Altı yuva: bayraklar ipte asılı, taşlar ve çalgılar duvarın ortasında bir sırada. Boşluklar kesik çizgili. */
  function diziKur(yer: 'ip' | 'orta', dolu: (string | null)[]) {
    diziEl.dataset.sira = yer;
    diziEl.replaceChildren();
    return dolu.map((ad, i) => {
      const y = document.createElement('div');
      y.className = 'dr-yuva' + (ad ? '' : ' bos');
      y.dataset.i = String(i);
      if (ad) { y.dataset.nesne = ad; y.innerHTML = nesneHTML(ad); }
      diziEl.append(y);
      return y;
    });
  }
  function yuvayaKoy(y: HTMLElement, ad: string, kaynak?: Element) {
    y.classList.remove('bos');
    y.dataset.nesne = ad;
    y.innerHTML = nesneHTML(ad);
    if (sesli(ad)) calgiSesi(CALGI_SESI[ad as keyof typeof CALGI_SESI]);
    return ucur(y.firstElementChild as HTMLElement, kaynak?.getBoundingClientRect(), 420);
  }
  function secenekKur(adlar: readonly string[]) {
    secEl.replaceChildren();
    secEl.dataset.adet = String(adlar.length);
    return adlar.map((ad, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dr-secenek';
      d.dataset.nesne = ad;
      d.dataset.i = String(i);
      d.setAttribute('aria-label', ETIKET[ad] ?? ad);
      d.innerHTML = nesneHTML(ad);
      secEl.append(d);
      if (!sakin) d.animate([{ transform: 'translateY(30%) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: HIZLI ? 1 : 360, delay: HIZLI ? 0 : 110 * i, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
      return d;
    });
  }
  /** Diziyi baştan okur: her dolu yuva sırayla zıplar; çalgılar çalar. Ritim: 2–3 yaşta biraz daha yavaş. */
  async function diziyiOku(yuvalar: HTMLElement[], a: number) {
    const ara = HIZLI ? 1 : yol === 'minik' ? 620 : 520;
    for (const y of yuvalar) {
      if (!y.dataset.nesne) break;
      y.classList.add('caliyor');
      zipla(y.firstElementChild, 0.5);
      const ad = y.dataset.nesne;
      if (sesli(ad)) calgiSesi(CALGI_SESI[ad as keyof typeof CALGI_SESI]);
      else oyunSesi('damla');
      const devam = await akis.bekle(ara, a);
      y.classList.remove('caliyor');
      if (!devam) return false;
    }
    return true;
  }

  async function oruntu(e: Exclude<Etkinlik, 'kendi'>, a: number) {
    const d = desen(e, yol);
    const yuvalar = diziKur(e === 'renk' ? 'ip' : 'orta', [...gorunen(d), ...Array<null>(d.bosluk).fill(null)]);
    secEl.replaceChildren();
    isaretle('tanit');
    cerenPoz(e === 'ses' ? 'davul' : 'sira-goster');
    if (!(await akis.bekle(350, a))) return false;
    // Ceren diziyi söyler (renk, şekil) ya da "dinle" der (ses); sonra dizi baştan okunur.
    simdikiSoz = d.tanit;
    if (e === 'ses') {
      if (!(await akis.konus(d.tanit, a))) return false;
      if (!(await diziyiOku(yuvalar, a))) return false;
    } else {
      const okuma = diziyiOku(yuvalar, a);
      if (!(await akis.konus(d.tanit, a))) return false;
      if (!(await okuma)) return false;
    }
    const secenekler = secenekKur(d.secenek);
    isaretle('sor');
    simdikiSoz = d.sor;
    let dolu = 0, yanlis = 0, hataVar = false;
    return akis.adim((bitir) => {
      const dogruEl = () => secenekler.find((s) => s.dataset.nesne === beklenen(d, dolu))!;
      const bos = akis.bostaIzle(() => zipla(dogruEl(), 0.3), () => d.sor);
      let bitti = false, mesgul = false;
      secenekler.forEach((s) => akis.dokununca(s, () => {
        if (bitti || mesgul) return;
        bos.dokundu();
        const ad = s.dataset.nesne!;
        if (ad !== beklenen(d, dolu)) {
          if (++yanlis === 1 && !hataVar) { hataVar = true; b.zorlandi?.(e); }
          salla(s);
          if (sesli(ad)) calgiSesi(CALGI_SESI[ad as keyof typeof CALGI_SESI], undefined, 0.6);
          ses.sus();
          cerenPoz('goster');
          simdikiSoz = 'ipucu';
          mesgul = true;
          void akis.bekle(400, a)
            .then((dv) => (dv && !bitti ? ses.cal('ipucu') : false))
            .then((dv) => (dv && !bitti ? diziyiOku(yuvalar, a) : false))
            .then(() => {
              mesgul = false;
              if (bitti || !akis.canli(a)) return;
              simdikiSoz = d.sor;
              cerenPoz('sen-dene');
              if (yanlis >= 2) { secenekler.forEach((o) => o.classList.remove('ipucu')); dogruEl().classList.add('ipucu'); }
            });
          return;
        }
        secenekler.forEach((o) => o.classList.remove('ipucu'));
        yanlis = 0;
        const y = yuvalar[YUVA - d.bosluk + dolu];
        void yuvayaKoy(y, ad, s);
        zipla(s, 0.4);
        dolu++;
        if (dolu < d.bosluk) return;
        // Dizi tamam: bir kez baştan çalar, Ceren alkışlar ve över.
        bitti = true;
        bos.dur();
        if (!hataVar) b.basardi?.(e);
        oyunSesi('miknatis');
        cerenPoz('alkis');
        simdikiSoz = dogruSesi(ovgu++);
        void akis.bekle(450, a)
          .then((dv) => (dv ? diziyiOku(yuvalar, a) : false))
          .then((dv) => (dv ? ses.cal(simdikiSoz) : false))
          .then(() => akis.bekle(300, a))
          .then((dv) => bitir(dv));
      }));
      cerenPoz('sen-dene');
      void ses.cal(d.sor);
      return () => bos.dur();
    });
  }

  /** Kendi örüntüsü: çocuk iki bayrak seçer; ip onun örüntüsüyle dolar ve çalar. */
  async function kendi(a: number) {
    const yuvalar = diziKur('ip', Array<null>(YUVA).fill(null));
    const secenekler = secenekKur([...BAYRAKLAR]);
    isaretle('kendi');
    cerenPoz('sen-dene');
    simdikiSoz = 'kendi_basla';
    const secim: string[] = [];
    const tamam = await akis.adim((bitir) => {
      const bos = akis.bostaIzle(() => secenekler.forEach((s) => zipla(s, 0.2)), () => 'kendi_basla');
      secenekler.forEach((s) => akis.dokununca(s, () => {
        if (secim.length >= 2) return;
        bos.dokundu();
        const ad = s.dataset.nesne!;
        void yuvayaKoy(yuvalar[secim.length], ad, s);
        zipla(s, 0.4);
        secim.push(ad);
        if (secim.length === 2) { bos.dur(); bitir(true); }
      }));
      void ses.cal('kendi_basla');
      return () => bos.dur();
    });
    if (!tamam || !akis.canli(a)) return false;
    const dizi = kendiDizisi([secim[0], secim[1]]);
    if (TEST) window.__oruntuKendi = dizi;
    for (let i = 2; i < YUVA; i++) {
      if (!(await akis.bekle(260, a))) return false;
      const kaynak = secenekler.find((s) => s.dataset.nesne === dizi[i]);
      void yuvayaKoy(yuvalar[i], dizi[i], kaynak);
      oyunSesi('damla');
    }
    oyunSesi('miknatis');
    cerenPoz('alkis');
    if (!(await akis.bekle(450, a))) return false;
    if (!(await diziyiOku(yuvalar, a))) return false;
    simdikiSoz = 'kendi_bitti';
    if (!(await akis.konus('kendi_bitti', a))) return false;
    return akis.bekle(300, a);
  }

  async function etkinlikDersi(e: Etkinlik) {
    akis.iptal();
    const a = akis.no;
    simdiki = e;
    siraGuncelle();
    ses.onYukle(e === 'kendi' ? ['kendi_basla', 'kendi_bitti'] : [desen(e, yol).tanit, desen(e, yol).sor, 'ipucu', 'dogru_1', 'dogru_2', 'dogru_3']);
    const tamam = e === 'kendi' ? await kendi(a) : await oruntu(e, a);
    if (!tamam || !akis.canli(a)) return;
    if (!kayit.biten.includes(e)) kayit.biten.push(e);
    const sonraki = siradaki(kayit, etkinlikler);
    if (sonraki) kayit.simdi = sonraki;
    sakla();
    siraGuncelle();
    zipla(siraDugmeleri.find((d) => d.dataset.etkinlik === e));
    if (!(await akis.bekle(450, a))) return;
    if (!sonraki) { void hatiraVer(a); return; }
    void etkinlikDersi(sonraki);
  }

  async function hatiraVer(a: number) {
    diziEl.replaceChildren();
    secEl.replaceChildren();
    simdiki = etkinlikler[etkinlikler.length - 1];
    isaretle('hatira');
    cerenPoz('alkis');
    const h = document.createElement('div');
    h.className = 'ds-hatira dr-hatira';
    h.innerHTML = resimHTML(cizim('hatira-bayrak-dizisi'), 'ds-hatira-resim', 'hatira-bayrak-dizisi', '', 'bayrak dizisi');
    dunya.append(h);
    oyunSesi('birles');
    if (!sakin) h.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: HIZLI ? 1 : 560, easing: 'ease-out' });
    simdikiSoz = 'bitis';
    if (!(await akis.bekle(700, a))) return;
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
    const hatiraBekliyor = !kayit.bitti && etkinlikler.every((e) => kayit.biten.includes(e));
    const e = kayit.bitti || hatiraBekliyor ? etkinlikler[0] : kayit.biten.includes(kayit.simdi) ? siradaki(kayit, etkinlikler) ?? etkinlikler[0] : kayit.simdi;
    simdiki = e;
    siraGuncelle();
    isaretle('giris');
    ses.onYukle(['giris', 'devam']);
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
    if (!(await akis.bekle(300, a))) return;
    if (hatiraBekliyor) { void hatiraVer(a); return; }
    void etkinlikDersi(e);
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
