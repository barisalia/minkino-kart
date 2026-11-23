/**
 * Açılır kitap sahnesi: 3 boyutlu kitap dünyası (ölçüler ve parçalar: veri.ts; tasarım: ekip/ingilizce/MASAL-GOL-CILEK.md).
 *
 * Kuruluş (dıştan içe):
 *   .ing-kt          ekran; masa rengi zemin
 *   .ing-kt-zum      kamera: yalnız 2 boyutlu kaydırma ve ölçek (perspektifin dışında: her ekranda aynı derinlik hissi)
 *   .ing-kt-mercek   perspektif
 *   .ing-kt-egim     parmakla çevirme (derinlik: katmanlar birbirinin önünden kayar)
 *   .ing-kt-salin    kendi kendine çok hafif salınım
 *   .ing-kt-dunya    masa düzlemi, EGIM kadar yatık; ortası kitabın ortası
 *   .ing-kt-kitap    açık kitabın tabanı (1800 × 1140). Sağ yarı tabandadır; sol yarı kapağın iç yüzüdür: kapak sırttan
 *                    dönerek sola iner. Çizim kırpılmaz; aynı çizimin iki yarısı iki menteşeli panelde gösterilir.
 *   .ing-kt-acilim   dik parçaların durduğu açılım (1600 × 1000)
 *
 * Dik parça: zeminde alt kenarından menteşelidir; yatıkken sayfanın üstündedir, kalkınca kameraya döner (çizim bozulmaz).
 * Kalkış `acilma` değerine bağlıdır (0 kapalı … 1 açık): kapak döner, sonra katmanlar arkadan öne sırayla yaylanır. Aynı
 * değer parmakla da sürülür (kapağı kapatırken katmanlar önce yatar).
 *
 * Oyuncular karton kesimlerdir. Hareketleri çizilmiş pozların sırayla gösterilmesidir (göz kırpma ve konuşan ağız dahil);
 * kod yalnız parçayı taşır, çevirir (kâğıt düzeneği), resmi esnetmez.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { resim } from '../varlik';
import { ACILIM, EGIM, KITAP, KITAP_CIZIMLERI, MASA, acilmaDurumu, yay, type DikKatman, type OyuncuTanimi } from './veri';
import './kitap.css';

const azHareket = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Çizim ya da (çizimi gelmemişse) üstünde adı yazan yer tutucu */
export function parca(yol: string, sinif = ''): HTMLElement {
  const adres = resim(yol);
  const el = adres
    ? h('img', { src: adres, alt: '', draggable: 'false' })
    : h('span.ing-kt-yok', {}, yol.split('/').pop() ?? '');
  el.classList.add('ing-kt-parca');
  if (sinif) el.classList.add(...sinif.split(' ').filter(Boolean));
  return el;
}

export interface Oyuncu {
  /** dik düzlem (konum ve kalkış) */
  el: HTMLElement;
  /** pozların durduğu iç kap (kâğıt hareketleri buna verilir) */
  ic: HTMLElement;
  /** ayakların altındaki temas gölgesi (zemine yatık); yarıktan çıkan oyuncuda yok */
  golge: HTMLElement | null;
  /** pozu değiştirir; çok kareli pozda konuşurken ağız kaydı izler */
  poz(ad: string): void;
  /** poz dizisi: [poz, ms] sırayla; yarıda kesilirse false */
  oyna(adimlar: readonly (readonly [string, number])[]): Promise<boolean>;
  simdiki(): string;
}

export interface Sahne {
  kok: HTMLElement;
  /** ekran katmanı (cümle bandı, etiketler): 3 boyutun dışında, üstte */
  ust: HTMLElement;
  acilim: HTMLElement;
  kitap: HTMLElement;
  kapak: HTMLElement;
  /** kapağın ön yüzü (kapalıyken dokunulan yer buraya konur) */
  kapakOnu: HTMLElement;
  /** kitabın sağ yarısı (kapalı kitabın kapladığı yer; kadraj için) */
  sagYarim: HTMLElement;
  /** açılım zeminini koyar: sağ yarısı tabanda, sol yarısı kapağın iç yüzünde */
  zeminKoy(yol: string): void;
  /** kapağın boş şeridine masalın adını yazar */
  kapakAdiYaz(ad: string): void;
  acilma(): number;
  /** açılmayı doğrudan ayarlar (parmakla sürme) */
  acilmaAyarla(a: number): void;
  /** açılmayı hedefe yürütür; bitince çözülür */
  acilmaYurut(hedef: number, ms: number): Promise<void>;
  /** açılıma dik katman ekler (arkadan öne eklenir; kalkış sırası ekleme sırasıdır) */
  dikEkle(k: DikKatman): HTMLElement;
  /** zeminde bir noktaya dikilmiş boş düzlem (kalkışa bağlı değil; kendi düzeneği olan parçalar için) */
  duzlem(x: number, y: number, en: number, boy: number, taban?: number, ebeveyn?: HTMLElement): HTMLElement;
  /** sayfaya yatık parça (su halkası gibi) */
  yatik(x: number, y: number, en: number, boy: number): HTMLElement;
  /** `kap` verilirse oyuncu o kabın içine kurulur (yarıktan çıkan ördek); yoksa kendi dik düzlemi açılır */
  oyuncu(t: OyuncuTanimi, o?: { ebeveyn?: HTMLElement; kap?: HTMLElement; kalkar?: boolean }): Oyuncu;
  /** kamera: verilen parçalar ekrana sığacak biçimde kadraja alınır */
  kadraj(hedefler: readonly Element[], ms: number, o?: { pay?: number; altPay?: number; enCok?: number }): void;
  sonra(fn: () => void, ms: number): number;
  bekle(ms: number): Promise<boolean>;
  readonly acik: boolean;
  birak(): void;
}

export function sahneKur(alan: HTMLElement): Sahne {
  let acik = true;
  const zamanlar = new Set<number>();
  const sonra = (fn: () => void, ms: number) => {
    const z = window.setTimeout(() => { zamanlar.delete(z); if (acik) fn(); }, TEST_MODU ? Math.min(ms, 20) : ms);
    zamanlar.add(z);
    return z;
  };
  const bekle = (ms: number) => new Promise<boolean>((coz) => { sonra(() => coz(true), ms); });

  // ---- dünya
  const masa = parca(KITAP_CIZIMLERI.masa, 'ing-kt-masa');
  // masanın uzak kenarı görüş alanına girerse ek yeri görünmesin: ekranın zemini masanın kendi kenar rengini alır
  if (masa instanceof HTMLImageElement) {
    const renkAl = () => {
      try {
        const t = document.createElement('canvas'); t.width = t.height = 1;
        const c = t.getContext('2d');
        if (!c) return;
        c.drawImage(masa, 0, 0, 8, 8, 0, 0, 1, 1);
        const [r, g2, b2] = c.getImageData(0, 0, 1, 1).data;
        kok.style.background = `rgb(${r}, ${g2}, ${b2})`;
      } catch { /* renk okunamazsa varsayılan zemin kalır */ }
    };
    if (masa.complete && masa.naturalWidth) window.setTimeout(renkAl, 0); else masa.addEventListener('load', renkAl, { once: true });
  }
  Object.assign(masa.style, { left: `${-MASA.en / 2}px`, top: `${-MASA.boy / 2}px`, width: `${MASA.en}px`, height: `${MASA.boy}px` });

  /** kitabın bir yarısı: aynı taban çiziminin o yarısı ve (verilirse) açılım zemininin o yarısı */
  const yarim = (sol: boolean): HTMLElement => {
    const taban = parca(KITAP_CIZIMLERI.taban, 'ing-kt-taban');
    Object.assign(taban.style, { left: sol ? '0' : `${-KITAP.sirt}px`, top: '0', width: `${KITAP.en}px`, height: `${KITAP.boy}px` });
    return h('div.ing-kt-yarim', { 'data-yarim': sol ? 'sol' : 'sag' }, taban);
  };
  const sag = yarim(false);
  Object.assign(sag.style, { left: `${KITAP.sirt}px`, top: '0', width: `${KITAP.en - KITAP.sirt}px`, height: `${KITAP.boy}px` });

  // kapak: sırttan (sol kenarından) döner. Ön yüzü kapak resmi, iç yüzü kitabın sol yarısı.
  const kapakResmi = parca(KITAP_CIZIMLERI.kapak, 'ing-kt-kapak-resim');
  const kapakAdi = h('strong.ing-kt-kapak-ad', { lang: 'en-US' });
  const onYuz = h('div.ing-kt-yuz.ing-kt-on', {}, kapakResmi, kapakAdi);
  const icYuz = h('div.ing-kt-yuz.ing-kt-ic', {}, yarim(true));
  const kapak = h('div.ing-kt-kapak', {}, onYuz, icYuz);
  Object.assign(kapak.style, { left: `${KITAP.sirt}px`, top: '0', width: `${KITAP.en - KITAP.sirt}px`, height: `${KITAP.boy}px` });

  const acilim = h('div.ing-kt-acilim');
  Object.assign(acilim.style, { left: `${ACILIM.x}px`, top: `${ACILIM.y}px`, width: `${ACILIM.en}px`, height: `${ACILIM.boy}px` });

  // kitabın masaya düşen gölgesi: kapalıyken yalnız sağ yarının altında, kapak açıldıkça sola uzar
  const golge = h('div.ing-kt-golge');
  const kitap = h('div.ing-kt-kitap', {}, golge, sag, kapak, acilim);
  Object.assign(kitap.style, { left: `${-KITAP.en / 2}px`, top: `${-KITAP.boy / 2}px`, width: `${KITAP.en}px`, height: `${KITAP.boy}px` });

  const dunya = h('div.ing-kt-dunya', {}, masa, kitap);
  dunya.style.transform = `rotateX(${EGIM}deg)`;
  const salin = h('div.ing-kt-salin', {}, dunya);
  const egim = h('div.ing-kt-egim', {}, salin);
  const mercek = h('div.ing-kt-mercek', {}, egim);
  const zum = h('div.ing-kt-zum', {}, mercek);
  const ust = h('div.ing-kt-ust');
  const kok = h('section.ing-kt', {}, zum, ust);
  alan.replaceChildren(kok);

  // ---- açılım zemini: sağ yarısı tabanda, sol yarısı kapağın iç yüzünde (aynı çizim, iki panelde)
  function zeminKoy(yol: string) {
    for (const [panel, sol] of [[icYuz.firstElementChild as HTMLElement, true], [sag, false]] as const) {
      panel.querySelector('.ing-kt-zemin')?.remove();
      const z = parca(yol, 'ing-kt-zemin');
      Object.assign(z.style, { left: `${ACILIM.x - (sol ? 0 : KITAP.sirt)}px`, top: `${ACILIM.y}px`, width: `${ACILIM.en}px`, height: `${ACILIM.boy}px` });
      panel.append(z);
    }
  }

  // ---- dik parçalar
  const DIK = -EGIM;
  function duzlem(x: number, y: number, en: number, boy: number, taban = 1, ebeveyn: HTMLElement = acilim): HTMLElement {
    const el = h('div.ing-kt-dik');
    Object.assign(el.style, {
      left: `${x - en / 2}px`, top: `${y - boy * taban}px`, width: `${en}px`, height: `${boy}px`,
      transformOrigin: `50% ${taban * 100}%`, transform: `rotateX(${DIK}deg)`,
    });
    ebeveyn.append(el);
    return el;
  }
  function yatik(x: number, y: number, en: number, boy: number): HTMLElement {
    const el = h('div.ing-kt-yatik');
    Object.assign(el.style, { left: `${x - en / 2}px`, top: `${y - boy / 2}px`, width: `${en}px`, height: `${boy}px` });
    acilim.append(el);
    return el;
  }

  /** kalkışa bağlı parçalar, arkadan öne */
  const kalkanlar: HTMLElement[] = [];
  let a = 0;
  function uygula() {
    const d = acilmaDurumu(a, kalkanlar.length);
    kapak.style.transform = `translateZ(1px) rotateY(${-180 * d.kapak}deg)`;
    const sol = KITAP.sirt * (1 - d.kapak);
    golge.style.left = `${sol}px`;
    golge.style.width = `${KITAP.en - sol}px`;
    // kapak kapanırken açılımın dik parçaları görünmez (kapağın altında kalır)
    acilim.style.visibility = d.kapak < 0.98 ? 'hidden' : 'visible';
    kalkanlar.forEach((el, i) => {
      const k = d.kalkis[i];
      el.style.transform = `translateZ(${(i + 1) * 0.6}px) rotateX(${DIK * yay(k)}deg)`;
      el.style.opacity = String(Math.min(1, k * 5));
    });
    kok.dataset.acik = a >= 1 ? '1' : a <= 0 ? '0' : 'ara';
  }
  function kalkar(el: HTMLElement) { kalkanlar.push(el); uygula(); }

  function dikEkle(k: DikKatman): HTMLElement {
    const el = duzlem(k.x + k.en / 2, k.y, k.en, k.boy);
    el.dataset.dik = k.id;
    el.append(parca(k.resim));
    kalkar(el);
    return el;
  }

  let yurutme = 0;
  function acilmaYurut(hedef: number, ms: number): Promise<void> {
    const no = ++yurutme, bas = a, t0 = performance.now();
    const sure = TEST_MODU || azHareket() ? 0 : ms;
    return new Promise((coz) => {
      const kare = () => {
        if (!acik || no !== yurutme) { coz(); return; }
        const t = sure ? Math.min(1, (performance.now() - t0) / sure) : 1;
        a = bas + (hedef - bas) * t;
        uygula();
        if (t < 1) requestAnimationFrame(kare); else coz();
      };
      kare();
    });
  }

  // ---- oyuncular
  function oyuncu(t: OyuncuTanimi, o: { ebeveyn?: HTMLElement; kap?: HTMLElement; kalkar?: boolean } = {}): Oyuncu {
    const boy = t.en * t.oran;
    const el = o.kap ?? duzlem(t.x, t.y, t.en, boy, t.taban, o.ebeveyn ?? acilim);
    const ic = h('span.ing-kt-oyuncu', { 'data-oyuncu': t.id, 'data-agiz': '0' });
    if (t.kim) { ic.classList.add('ing-kisi'); ic.dataset.kim = t.kim; }
    el.dataset.oyuncuDuzlemi = t.id;
    const kareler = new Map<string, HTMLElement[]>();
    for (const [ad, yollar] of Object.entries(t.pozlar)) {
      kareler.set(ad, yollar.map((yol, i) => {
        const img = parca(yol);
        img.dataset.poz = ad;
        // çok kareli poz: konuşan ağız (ses.ts → agizAyarla bu kareleri gizleyip açar)
        if (yollar.length > 1) img.dataset.kare = `konus-${i}`;
        ic.append(img);
        return img;
      }));
    }
    const kirpKareleri = new Map<string, HTMLElement>();
    for (const [ad, yol] of Object.entries(t.kirp ?? {})) {
      const img = parca(yol, 'ing-kt-kirp');
      ic.append(img);
      kirpKareleri.set(ad, img);
    }
    el.append(ic);
    if (o.kalkar !== false && !o.kap) kalkar(el);
    // temas gölgesi: ayakların bastığı yerde, zemine yatık (karakter havada durmasın)
    let golgesi: HTMLElement | null = null;
    if (!o.kap) {
      golgesi = h('span.ing-kt-temas', { 'aria-hidden': 'true' });
      const en = t.en * 0.62, yuk = t.en * 0.2;
      Object.assign(golgesi.style, { left: `${t.x - en / 2}px`, top: `${t.y - yuk / 2}px`, width: `${en}px`, height: `${yuk}px` });
      (o.ebeveyn ?? acilim).append(golgesi);
    }

    let simdi = '', oyunNo = 0;
    function poz(ad: string) {
      if (!kareler.has(ad)) return;
      simdi = ad;
      ic.dataset.poz = ad;
      const liste = kareler.get(ad)!;
      ic.querySelectorAll<HTMLElement>('.ing-kt-parca').forEach((x) => { delete x.dataset.acik; });
      liste.forEach((x, i) => { x.dataset.acik = ''; x.hidden = i > 0; });
      // ağız karesi sayısı (konuşmayan pozda 1: agizAyarla o pozda hiçbir kareyi değiştirmez)
      ic.dataset.agizSayisi = String(liste.length);
      ic.dataset.agiz = '0';
      kirpKareleri.forEach((x) => { delete x.dataset.acik; });
    }
    async function oyna(adimlar: readonly (readonly [string, number])[]): Promise<boolean> {
      const no = ++oyunNo;
      for (const [ad, ms] of adimlar) {
        poz(ad);
        if (ms > 0 && !(await bekle(ms))) return false;
        if (no !== oyunNo || !acik) return false;
      }
      return true;
    }
    // göz kırpma: pozun gözü kapalı karesi varsa ve o an konuşmuyorsa kısa bir an görünür
    function kirp() {
      const k = kirpKareleri.get(simdi), acikKare = kareler.get(simdi)?.[0];
      if (k && acikKare && !acikKare.hidden && ic.dataset.agiz === '0') {
        k.dataset.acik = ''; delete acikKare.dataset.acik;
        sonra(() => { if (simdi && kareler.get(simdi)?.[0] === acikKare) { acikKare.dataset.acik = ''; } delete k.dataset.acik; }, 130);
      }
      sonra(kirp, 2400 + Math.random() * 2800);
    }
    if (kirpKareleri.size && !TEST_MODU && !azHareket()) sonra(kirp, 900 + Math.random() * 1800);
    poz(t.ilk);
    return { el, ic, golge: golgesi, poz, oyna, simdiki: () => simdi };
  }

  // ---- kamera: parçaların ekrandaki yerinden hesaplanır (perspektifi tarayıcı çözer)
  let kam = { x: 0, y: 0, s: 1 };
  function kameraUygula(k: { x: number; y: number; s: number }, ms: number) {
    kam = k;
    const sure = TEST_MODU || azHareket() ? 0 : ms;
    zum.style.transition = sure ? `transform ${sure}ms cubic-bezier(.45,.05,.3,1)` : 'none';
    zum.style.transform = `translate(${k.x.toFixed(1)}px, ${k.y.toFixed(1)}px) scale(${k.s.toFixed(4)})`;
  }
  let sonKadraj: { hedefler: readonly Element[]; o: { pay?: number; altPay?: number; enCok?: number } } | null = null;
  function kadraj(hedefler: readonly Element[], ms: number, o: { pay?: number; altPay?: number; enCok?: number } = {}) {
    sonKadraj = { hedefler, o };
    const c = kok.getBoundingClientRect();
    if (!c.width || !c.height || !hedefler.length) return;
    // geçiş sürerken ölçüm yanıltmasın: kamerayı geçişsiz hâline sabitleyip ölç
    const gecerli = getComputedStyle(zum).transform;
    zum.style.transition = 'none';
    zum.style.transform = `translate(${kam.x.toFixed(1)}px, ${kam.y.toFixed(1)}px) scale(${kam.s.toFixed(4)})`;
    const mx = c.left + c.width / 2, my = c.top + c.height / 2;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const e of hedefler) {
      const r = e.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      // ekran → kameranın kendi uzayı (kaydırma ve ölçeğin tersi)
      x0 = Math.min(x0, (r.left - mx - kam.x) / kam.s); x1 = Math.max(x1, (r.right - mx - kam.x) / kam.s);
      y0 = Math.min(y0, (r.top - my - kam.y) / kam.s); y1 = Math.max(y1, (r.bottom - my - kam.y) / kam.s);
    }
    if (!Number.isFinite(x0)) { zum.style.transform = gecerli; return; }
    const pay = o.pay ?? 0.94, altPay = o.altPay ?? 0;
    const s = Math.min(o.enCok ?? 4, (c.width * pay) / (x1 - x0), ((c.height - altPay) * pay) / (y1 - y0));
    const hedef = { x: -((x0 + x1) / 2) * s, y: -((y0 + y1) / 2) * s - altPay / 2, s };
    // ölçümden önceki görünüme dön, sonra geçişle hedefe git (tarayıcı iki durumu ayrı çizer)
    zum.style.transform = gecerli;
    void zum.offsetWidth;
    kameraUygula(hedef, ms);
  }
  const boyGozcu = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (sonKadraj) kadraj(sonKadraj.hedefler, 0, sonKadraj.o); }) : null;
  boyGozcu?.observe(kok);

  // ---- derinlik: boş yere basıp gezdirince kitap hafifçe döner, bırakınca yerine yaylanır
  {
    let bas: { x: number; y: number } | null = null;
    kok.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('button, [data-tutulur]')) return;
      bas = { x: e.clientX, y: e.clientY };
      egim.classList.remove('ing-kt-birakildi');
    });
    window.addEventListener('pointermove', (e) => {
      if (!bas || !acik) return;
      const dx = Math.max(-1, Math.min(1, (e.clientX - bas.x) / 260)), dy = Math.max(-1, Math.min(1, (e.clientY - bas.y) / 260));
      egim.style.transform = `rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 9).toFixed(2)}deg)`;
    });
    const birak = () => { if (!bas) return; bas = null; egim.classList.add('ing-kt-birakildi'); egim.style.transform = ''; };
    window.addEventListener('pointerup', birak);
    window.addEventListener('pointercancel', birak);
  }

  uygula();
  return {
    kok, ust, acilim, kitap, kapak, kapakOnu: onYuz, sagYarim: sag,
    zeminKoy, kapakAdiYaz: (ad) => { kapakAdi.textContent = ad; },
    acilma: () => a,
    acilmaAyarla(v) { yurutme++; a = Math.min(1, Math.max(0, v)); uygula(); },
    acilmaYurut,
    dikEkle, duzlem, yatik, oyuncu, kadraj, sonra, bekle,
    get acik() { return acik; },
    birak() { acik = false; zamanlar.forEach((z) => clearTimeout(z)); zamanlar.clear(); boyGozcu?.disconnect(); },
  };
}
