// Hece Evleri: ünsüz + sesli harf = hece. Sesli harfler sekiz küçük evde oturur;
// çocuk ünsüzü kapıya götürür, kapı açılır, iki harf yan yana gelir ve Ceren heceyi okur.
// Ders kalıbı: Ceren gösterir → birlikte → sen bul (4 ve 5+ yaş) → hatıra anahtarı.
import veri from './hece-evleri-veri.json';
import olcu from './hece-evleri-olcu.json';
import { kucukGrup, yasGrubu } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { cerenYuzu } from './konusma-dersi';
import { erisimVarMi, kilitGoster } from '../../src/abonelik/kilit';
import { efektCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { IKON } from '../../src/ui/ikonlar';
import { TEST_MODU } from '../../src/ui/dom';
import { kutlamaHazirMi, kutlamaKur } from './kutlama';
import { kapiKareAdlari } from './a2-kareler';
import { hepsiVarsa } from './a1-kareler';
import { oyunSesi } from './oyun-sesi';
import { bitisKutla, cerenSevinsin, parilti } from './cila';
import './hece-evleri.css';

type Oku = (id: string, sonra?: () => void) => void;
export type HeceEvleriBaglami = {
  oku: Oku; sustur: () => void; cikis: () => void;
  geri: HTMLButtonElement; baslik: HTMLElement; ilerleme: HTMLElement;
};
type Asama = 'goster' | 'birlikte' | 'tekerleme' | 'sen' | 'hatira';
type Kutu = { sol: number; ust: number; sag: number; alt: number };

export const UNSUZLER: readonly string[] = veri.unsuzler;
export const UNLULER: readonly string[] = veri.unluler;
const BELIRTEC: Record<string, string> = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu' };
const belirtec = (harf: string) => BELIRTEC[harf] ?? harf;
export const heceSesi = (unsuz: string, unlu: string) => 'ev-' + belirtec(unsuz) + '-' + belirtec(unlu);
export const kilitKimligi = (unsuz: string) => 'alfabe/hece-evleri-' + belirtec(unsuz);
const buyuk = (harf: string) => harf.toLocaleUpperCase('tr');
const sakin = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const yuzde = (oran: number) => (oran * 100).toFixed(2) + '%';

const cizimler = import.meta.glob<string>('../../assets/alfabe/hece-evleri/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
function cizim(ad: string): string | undefined {
  const yol = '../../assets/alfabe/hece-evleri/' + ad;
  return cizimler[yol + '.webp'] ?? cizimler[yol + '.png'];
}
const GEREKLI = [1, 2, 3, 4, 5, 6, 7, 8].flatMap(n => ['ev-' + n, 'kapi-' + n]).concat('anahtar', 'raf');
/** Astra'nın çizimleri tamam mı? Değilse bölüm çocuklara gösterilmez. */
export const heceEvleriHazir = GEREKLI.every(ad => cizim(ad));
/** Test modunda (?test=1) çizimler gelmeden de akış iskeletle denenebilir. */
export const heceEvleriGorunur = heceEvleriHazir || TEST_MODU;

function resimVeyaIskelet(ad: string, sinif: string) {
  const src = cizim(ad);
  return src ? '<img class="' + sinif + '" src="' + src + '" alt="" draggable="false">'
    : '<span class="' + sinif + ' he-iskelet" data-ad="' + ad + '"></span>';
}
function evCercevesi(i: number) {
  const { kapi: [x0, y0, x1, y1], levha: [lx, ly, lw] } = olcu.evler[i];
  const stil = '--kx:' + yuzde(x0) + ';--ky:' + yuzde(y0) + ';--kw:' + yuzde(x1 - x0) + ';--kh:' + yuzde(y1 - y0) +
    ';--lx:' + yuzde(lx) + ';--ly:' + yuzde(ly) + ';--lw:' + yuzde(lw);
  return '<span class="he-cerceve" style="' + stil + '">' + resimVeyaIskelet('ev-' + (i + 1), 'he-govde') +
    resimVeyaIskelet('kapi-' + (i + 1), 'he-kapi') +
    '<span class="he-ic" aria-hidden="true"><b>' + UNLULER[i] + '</b></span>' +
    '<span class="he-levha" aria-hidden="true">' + UNLULER[i] + '</span></span>';
}
function anahtarResmi(unsuz: string) {
  const [x, y, w] = olcu.anahtar.etiket;
  return resimVeyaIskelet('anahtar', 'he-anahtar-resim') +
    '<span class="he-etiket" style="left:' + yuzde(x) + ';top:' + yuzde(y) + ';--ew:' + yuzde(w) + '">' + unsuz + '</span>';
}

/** Ana ekrandaki giriş kartı (Hece Oyunu'nun altında). Çizimler yoksa boş döner. */
export function heceEvleriKarti() {
  if (!heceEvleriGorunur) return '';
  return '<div class="at-hece-karti at-evler-karti"><button type="button" class="at-oyun-karti at-evler-ac">' +
    '<span class="at-hece-ornek at-evler-ornek" aria-hidden="true"><span class="he-ev acik okundu he-kart-evi">' + evCercevesi(0) +
    '</span><span><b>m</b><b>a</b></span></span>' +
    '<span class="at-hece-yazi"><strong>Hece Evleri</strong><small>' +
    (kucukGrup ? 'Kapıyı çal, heceyi dinle.' : 'Harfi kapıya götür, heceyi oku.') + '</small></span>' +
    '<span class="at-hece-oyna" aria-hidden="true">' + IKON.oyna + '</span></button>' +
    '<button type="button" class="at-hece-dinle at-ses at-evler-dinle" aria-label="Ceren’den Hece Evleri’ni dinle">' +
    IKON.hoparlor + '</button></div>';
}

const KAYIT = 'minkino-hece-evleri-v1';
type Kayit = { biten: string[]; son: string; tanitildi: boolean };
function kaydiOku(): Kayit {
  const kayit: Kayit = { biten: [], son: UNSUZLER[0], tanitildi: false };
  try {
    const eski = JSON.parse(dersKaydiniOku(KAYIT) || 'null');
    if (!eski || typeof eski !== 'object') return kayit;
    if (Array.isArray(eski.biten)) kayit.biten = UNSUZLER.filter(u => eski.biten.includes(u));
    if (UNSUZLER.includes(eski.son)) kayit.son = eski.son;
    kayit.tanitildi = eski.tanitildi === true;
  } catch { /* Okunamayan kayıtta bölüm baştan açılır. */ }
  return kayit;
}

/** Yumuşak iki "tok": kapıya vurma. Konuşmayla çakışmasın diye kısa ve alçak. */
function tokTok(gecikmeler: number[]) {
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  for (const gecikme of gecikmeler) {
    const bas = ctx.currentTime + gecikme;
    for (const [frekans, bitis, sure, siddet, tip] of [[230, 92, .1, .34, 'triangle'], [1250, 700, .018, .05, 'square']] as const) {
      const ton = ctx.createOscillator(), seviye = ctx.createGain();
      ton.type = tip;
      ton.frequency.setValueAtTime(frekans, bas);
      ton.frequency.exponentialRampToValueAtTime(bitis, bas + sure);
      seviye.gain.setValueAtTime(.0001, bas);
      seviye.gain.exponentialRampToValueAtTime(siddet, bas + .004);
      seviye.gain.exponentialRampToValueAtTime(.0001, bas + sure);
      ton.connect(seviye).connect(cikis);
      ton.onended = () => { ton.disconnect(); seviye.disconnect(); };
      ton.start(bas); ton.stop(bas + sure + .01);
    }
  }
}

export function heceEvleriKur(alan: HTMLElement, s: HeceEvleriBaglami): () => void {
  const kayit = kaydiOku();
  const sakla = () => dersKaydiniYaz(KAYIT, JSON.stringify(kayit));
  // Önceden ücretsiz olan M evi (ücretsizler L, K, N, M → N, T, L, K; Barış 20 Kasım): bu cihazda M'ye başlamış ya da
  // M'yi bitirmiş çocukta açık kalır, kilit rozeti görünmez. Erişim sorgusundan önce bakılır; erisim.ts değişmez.
  const evAcikKaldi = (u: string) => u === 'm' && (kayit.biten.includes('m') || kayit.son === 'm');
  const eveErisim = (u: string) => evAcikKaldi(u) || erisimVarMi(kilitKimligi(u), document.body);
  /** Her ekran değişiminde ve gösterim atlandığında artar; eski akışlar kendiliğinden durur. */
  let akis = 0;
  let bekleyenSes: ((tamam: boolean) => void) | undefined;
  let zamanlayicilar: number[] = [];
  let ekranBirak: (() => void) | undefined;

  /** Ceren'in kayıtlarını sırayla okur; başka bir okuma ya da ekran değişimi gelince false ile biter. */
  function soyle(ids: string[]): Promise<boolean> {
    bekleyenSes?.(false);
    return new Promise(coz => {
      let bitti = false;
      const bitir = (tamam: boolean) => {
        if (bitti) return;
        bitti = true;
        if (bekleyenSes === bitir) bekleyenSes = undefined;
        coz(tamam);
      };
      bekleyenSes = bitir;
      const cal = (k: number) => {
        if (bitti) return;
        if (k === ids.length) { bitir(true); return; }
        s.oku(ids[k], () => cal(k + 1));
      };
      cal(0);
    });
  }
  function bekle(ms: number) {
    return new Promise<void>(coz => { zamanlayicilar.push(window.setTimeout(coz, ms)); });
  }
  /** Hareket bitince devam eder; çizim durmuş olsa bile (arka plan, yavaş cihaz) akış takılmaz. */
  function bitince(hareket: Animation, ms: number) {
    return Promise.race([hareket.finished.then(() => undefined, () => undefined), bekle(ms + 300)]).then(() => {
      if (hareket.playState === 'running') hareket.finish();
    });
  }
  function temizle() {
    akis++;
    zamanlayicilar.forEach(clearTimeout); zamanlayicilar = [];
    bekleyenSes?.(false); s.sustur();
    ekranBirak?.(); ekranBirak = undefined;
  }
  function geriAyarla(etiket: string, yazi: string, git: () => void) {
    s.geri.setAttribute('aria-label', etiket);
    const span = s.geri.querySelector('span');
    if (span) span.textContent = yazi;
    s.geri.onclick = git;
  }
  const siradaki = (sonra?: string) => {
    const bas = sonra ? UNSUZLER.indexOf(sonra) + 1 : 0;
    return [...UNSUZLER.slice(bas), ...UNSUZLER.slice(0, bas)].find(u => !kayit.biten.includes(u));
  };
  function anahtarSayaci() {
    const sayi = kayit.biten.length;
    return '<span class="he-sayac" aria-label="' + sayi + ' anahtar toplandı">' + resimVeyaIskelet('anahtar', 'he-sayac-resim') +
      sayi + ' / ' + UNSUZLER.length + '</span>';
  }

  // ---------- Sahnenin ortak parçaları ----------
  function evlerHTML(unsuz: string) {
    return '<div class="he-evler" role="group" aria-label="Sesli harflerin evleri" style="--raf-ust:' + yuzde(olcu.raf.ust) + '">' +
      UNLULER.map((v, i) => '<button type="button" class="he-ev" data-i="' + i + '" aria-label="' + buyuk(v) + ' evi">' +
        '<span class="he-hece" aria-hidden="true"><b>' + unsuz + '</b><b>' + v + '</b></span>' + evCercevesi(i) + '</button>').join('') +
      resimVeyaIskelet('raf', 'he-raf') + '</div>';
  }
  /** Duvardaki anahtarlık: her bitirilen harfin anahtarı kendi kancasında asılı. Çizim yoksa hiç görünmez. */
  const kancalar = olcu.anahtarlik.kancalar as number[][];
  const anahtarlikVar = () => !!cizim('anahtarlik') && !!cizim('anahtar') && kancalar.length >= UNSUZLER.length;
  function asiliAnahtar(u: string, yeni = false) {
    const i = UNSUZLER.indexOf(u), [hx, hy] = olcu.anahtarlik.halka;
    return '<span class="he-asili' + (yeni ? ' yeni' : '') + '" data-unsuz-anahtar="' + u + '" style="left:' + yuzde(kancalar[i][0]) +
      ';top:' + yuzde(kancalar[i][1]) + ';--hx:' + yuzde(hx) + ';--hy:' + yuzde(hy) + '"><img src="' + cizim('anahtar') + '" alt="" draggable="false"></span>';
  }
  function anahtarlikHTML() {
    if (!anahtarlikVar()) return '';
    return '<div class="he-anahtarlik" role="img" aria-label="' + kayit.biten.length + ' anahtar asılı">' +
      '<img src="' + cizim('anahtarlik') + '" alt="" draggable="false">' +
      UNSUZLER.filter(u => kayit.biten.includes(u)).map(u => asiliAnahtar(u)).join('') + '</div>';
  }
  /** Sesli harfin adı (Harf Atölyesi'nin kendi kayıtları: "A.", "E." …). */
  const UNLU_KAYDI = ['01', '06', '11', '12', '18', '19', '25', '26'].map(id => id + '-model');
  function evKipirdat(el: HTMLElement) {
    if (sakin()) return;
    el.animate([{ transform: 'none' }, { transform: 'translateY(-4%) rotate(-2deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'none' }],
      { duration: 320, easing: 'ease-out' });
  }

  // ---------- Giriş: aynı sahne, masada harf taşları ----------
  function secimGoster() {
    temizle();
    const onceki = alan.querySelector<HTMLElement>('.he-ders')?.dataset.unsuz;
    s.baslik.textContent = 'Hece Evleri';
    s.ilerleme.innerHTML = anahtarSayaci();
    geriAyarla('Harflere dön', 'Harfler', s.cikis);
    const onerilen = kayit.biten.includes(kayit.son) ? siradaki(kayit.son) ?? kayit.son : kayit.son;
    alan.innerHTML = '<section class="he-ders he-giris" data-asama="secim"><div class="he-sahne">' + anahtarlikHTML() +
      '<div class="he-ceren">' + cerenYuzu() + '</div><div class="he-masa"></div>' + evlerHTML('') +
      '<div class="he-tepsi" role="group" aria-label="Ünsüz harfler. Birini seç.">' +
      UNSUZLER.map(u => {
        const bitti = kayit.biten.includes(u);
        return '<button type="button" class="he-tas he-secim-harf' + (u === onerilen ? ' oneri' : '') + (bitti ? ' bitti' : '') + '" data-unsuz="' + u + '" aria-label="' +
          buyuk(u) + ' harfi' + (bitti ? ', anahtarı alındı' : '') + '"><span>' + u + '</span>' +
          (bitti ? '<i class="he-rozet" aria-hidden="true">' + resimVeyaIskelet('anahtar', 'he-rozet-resim') + '</i>' : '') + '</button>';
      }).join('') + '</div>' +
      '<button type="button" class="at-ses he-dinle he-tanitim" aria-label="Ceren Öğretmen’i dinle">' + IKON.hoparlor + '</button>' +
      '</div></section>';
    const kok = alan.querySelector<HTMLElement>('.he-giris')!;
    const n = akis;
    kok.querySelector<HTMLButtonElement>('.he-tanitim')!.onclick = () => { void soyle(['ev-giris']); };
    kok.querySelectorAll<HTMLButtonElement>('.he-ev').forEach((ev, i) => {
      ev.onclick = () => { evKipirdat(ev.querySelector('.he-cerceve')!); void soyle([UNLU_KAYDI[i]]); };
    });
    kok.querySelectorAll<HTMLButtonElement>('.he-tas').forEach(b => {
      if (!evAcikKaldi(b.dataset.unsuz!)) kilitGoster(b, kilitKimligi(b.dataset.unsuz!));
      b.onclick = async () => {
        const unsuz = b.dataset.unsuz!;
        if (kok.classList.contains('secildi') || !eveErisim(unsuz)) return;
        kok.classList.add('secildi'); b.classList.add('secilen');
        await bekle(sakin() ? 0 : 280);
        if (simdiGiris(n)) dersGoster(unsuz);
      };
    });
    if (!kayit.tanitildi) {
      kayit.tanitildi = true; sakla();
      void soyle(['ev-giris']);
    }
    const donus = alan.querySelector<HTMLButtonElement>('.he-tas[data-unsuz="' + (onceki ?? onerilen) + '"]');
    donus?.focus({ preventScroll: true });
  }
  const simdiGiris = (n: number) => n === akis;

  // ---------- Ders ----------
  function dersGoster(unsuz: string) {
    if (!eveErisim(unsuz)) return;
    temizle();
    const ders = akis;
    kayit.son = unsuz; sakla();
    const U = buyuk(unsuz);
    const adimlar: Asama[] = kucukGrup ? ['goster', 'birlikte', 'hatira'] : ['goster', 'birlikte', 'sen', 'hatira'];
    s.baslik.textContent = U + ' ' + unsuz;
    geriAyarla('Hece Evleri’ne dön', 'Hece Evleri', secimGoster);
    alan.innerHTML = '<section class="he-ders" data-unsuz="' + unsuz + '" data-asama="goster"><div class="he-sahne">' +
      anahtarlikHTML() + '<div class="he-ceren">' + cerenYuzu() + '</div><div class="he-masa"></div>' + evlerHTML(unsuz) +
      '<span class="he-yuva" aria-hidden="true"></span>' +
      '<button type="button" class="he-harf" aria-label="' + U + ' harfi. Bir kapıya götür.">' + unsuz + '</button>' +
      '<button type="button" class="at-ses he-dinle" aria-label="Ceren’i yeniden dinle">' + IKON.hoparlor + '</button>' +
      '<p class="he-durum" role="status"></p></div></section>';
    const kok = alan.querySelector<HTMLElement>('.he-ders')!;
    const sahne = kok.querySelector<HTMLElement>('.he-sahne')!;
    const harf = kok.querySelector<HTMLButtonElement>('.he-harf')!;
    const yuva = kok.querySelector<HTMLElement>('.he-yuva')!;
    const dinle = kok.querySelector<HTMLButtonElement>('.he-dinle')!;
    const durum = kok.querySelector<HTMLElement>('.he-durum')!;
    const evler = Array.from(kok.querySelectorAll<HTMLButtonElement>('.he-ev'));
    const acik = new Set<number>();
    let asama: Asama = 'goster';
    let mesgul = false, sorular: number[] = [], soruNo = 0, yanlis = 0, bosZaman = 0, hatirlatma = 0, siradakiEvler: number[] = [], sonYonerge: string[] = ['ev-goster'];
    let harfX = 0, harfY = 0, harfOlcek = 1;
    let surukleme: { id: number; dx: number; dy: number; hareket: boolean; x: number; y: number } | undefined;

    function asamaYaz(yeni: Asama) {
      asama = yeni; kok.dataset.asama = yeni;
      const sira = adimlar.indexOf(yeni === 'tekerleme' ? 'birlikte' : yeni);
      const adlar: Record<Asama, string> = { goster: 'Ceren gösteriyor', birlikte: 'Birlikte', tekerleme: 'Birlikte', sen: 'Sen bul', hatira: 'Hatıra' };
      s.ilerleme.innerHTML = '<span class="at-adim" aria-label="' + (sira + 1) + '. adım, ' + adlar[yeni] + '">' +
        adimlar.map((_, i) => '<i class="' + (i <= sira ? 'at-dolu' : '') + '"></i>').join('') + '</span>';
    }
    const simdi = (n: number) => n === akis;
    const hece = (i: number) => heceSesi(unsuz, UNLULER[i]);

    // --- Harf taşının yeri: sahnenin içinde, merkezden ---
    function sahneKutusu(el: Element): Kutu {
      const a = sahne.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { sol: r.left - a.left, ust: r.top - a.top, sag: r.right - a.left, alt: r.bottom - a.top };
    }
    const tasBoyu = () => harf.offsetWidth || 56;
    function harfDonusumu(x: number, y: number, olcek: number) {
      const b = tasBoyu();
      return 'translate(' + (x - b / 2).toFixed(1) + 'px,' + (y - b / 2).toFixed(1) + 'px) scale(' + olcek.toFixed(3) + ')';
    }
    function harfiKoy(x: number, y: number, olcek = 1) {
      harfX = x; harfY = y; harfOlcek = olcek;
      harf.style.transform = harfDonusumu(x, y, olcek);
    }
    function evNoktasi() {
      const k = sahneKutusu(yuva);
      return { x: (k.sol + k.sag) / 2, y: (k.ust + k.alt) / 2 };
    }
    function eveKoy() { const { x, y } = evNoktasi(); harfiKoy(x, y, 1); }
    async function harfiTasi(x: number, y: number, olcek: number, ms: number, zipla = 0) {
      const bas = harfDonusumu(harfX, harfY, harfOlcek);
      const ortaX = (harfX + x) / 2, ortaY = Math.min(harfY, y) - zipla;
      const orta = harfDonusumu(ortaX, ortaY, (harfOlcek + olcek) / 2);
      harfiKoy(x, y, olcek);
      if (sakin() || ms <= 0) return;
      const kare = zipla ? [{ transform: bas }, { transform: orta }, { transform: harf.style.transform }] : [{ transform: bas }, { transform: harf.style.transform }];
      await bitince(harf.animate(kare, { duration: ms, easing: 'cubic-bezier(.33,.72,.3,1)' }), ms);
    }
    /** Kapının önünde, kapı boşluğunun solunda; taş, kapıdaki sesli harfle aynı boya küçülür. */
    function kapiOnu(i: number) {
      const ic = evler[i].querySelector<HTMLElement>('.he-ic')!;
      const sesli = ic.querySelector<HTMLElement>('b')!;
      const k = sahneKutusu(ic), boy = sesli.offsetWidth || tasBoyu();
      const olcek = Math.min(1, boy / tasBoyu());
      const merkezX = (k.sol + k.sag) / 2, merkezY = k.alt - boy / 2;
      return { kapiX: merkezX - boy * 1.25, eleX: merkezX - boy + 1, y: merkezY, olcek };
    }

    function evDurumunuCiz() {
      evler.forEach((ev, i) => {
        ev.classList.toggle('acik', acik.has(i));
        ev.classList.toggle('okundu', acik.has(i));
        ev.classList.remove('el-ele', 'soyluyor', 'salla');
        ev.setAttribute('aria-label', buyuk(UNLULER[i]) + ' evi' + (acik.has(i) && asama !== 'sen' ? ', ' + unsuz + UNLULER[i] : ''));
      });
    }

    /** Ünsüz kapıya gider, "tık tık" çalar, kapı açılır, iki harf yan yana gelir ve hece okunur. */
    async function kapiyiCal(i: number, kim: 'ceren' | 'cocuk'): Promise<boolean> {
      const n = akis, ev = evler[i];
      mesgul = true; bosBeklemeyiDurdur();
      evler.forEach(e => e.classList.remove('salla'));
      const yer = kapiOnu(i);
      await harfiTasi(yer.kapiX, yer.y, yer.olcek, kim === 'ceren' ? 760 : 460, Math.max(26, tasBoyu() * .7));
      if (!simdi(n)) return false;
      if (!sakin()) {
        tokTok([.07, .25]);
        const kapi = ev.querySelector<HTMLElement>('.he-kapi')!;
        const vurus = 'perspective(600px) rotateY(-9deg)';
        kapi.animate([{ transform: 'none' }, { transform: vurus }, { transform: 'none' }, { transform: vurus }, { transform: 'none' }], { duration: 380 });
        // Konumu taşıyan transform'un sonuna eklenir; taş kendi ortasında sallanır.
        const taban = harf.style.transform, egik = taban + ' translate(5%,0) rotate(9deg)';
        await bitince(harf.animate([{ transform: taban }, { transform: egik }, { transform: taban }, { transform: egik }, { transform: taban }],
          { duration: 380 }), 380);
      } else tokTok([0, .18]);
      if (!simdi(n)) return false;
      ev.classList.add('acik');
      kapiKareleriniOynat(i, true);
      await bekle(sakin() ? 0 : 300);
      if (!simdi(n)) return false;
      const ses = soyle([hece(i)]);
      ev.classList.add('okundu', 'el-ele');
      durum.textContent = unsuz + UNLULER[i];
      await harfiTasi(yer.eleX, yer.y, yer.olcek, 200);
      await ses;
      if (!simdi(n)) return false;
      ev.classList.remove('el-ele');
      await bekle(120);
      if (!simdi(n)) return false;
      const { x, y } = evNoktasi();
      await harfiTasi(x, y, 1, 420, Math.max(20, tasBoyu() * .5));
      if (!simdi(n)) return false;
      mesgul = false;
      return true;
    }
    // Paket Harf-A2: kapının çizilmiş açılış kareleri (kapi-N-yari, kapi-N-acik) gelince 3B dönüş yerine onlar oynar;
    // kapanırken ters sırayla. Kareler yoksa eski dönüş.
    function kapiKareleriniOynat(i: number, ac: boolean) {
      const kare = hepsiVarsa(kapiKareAdlari(i + 1), cizim), kapali = cizim('kapi-' + (i + 1));
      const img = evler[i]?.querySelector<HTMLImageElement>('img.he-kapi');
      if (!kare || !kapali || !img) return;
      evler[i].classList.add('he-kareli');
      if (sakin()) { img.src = ac ? kare[1] : kapali; return; }
      img.src = kare[0];
      setTimeout(() => { if (img.isConnected) img.src = ac ? kare[1] : kapali; }, 130);
    }
    async function kapilariKapat() {
      if (!evler.some(ev => ev.classList.contains('acik'))) return;
      evler.forEach((ev, i) => { if (ev.classList.contains('acik')) kapiKareleriniOynat(i, false); });
      evler.forEach(ev => ev.classList.remove('acik', 'okundu', 'el-ele', 'soyluyor'));
      await bekle(sakin() ? 0 : 480);
    }

    // --- Boşta kalınca Ceren nazikçe hatırlatır, taş kapıya doğru bir kez zıplar ---
    function bosBeklemeyiDurdur() { clearTimeout(bosZaman); }
    /** Boşta kalan çocuğa en fazla iki kez hatırlatır (11 sn, sonra 18 sn); dokununca sayaç sıfırlanır. */
    function bosBekle(devam = false) {
      bosBeklemeyiDurdur();
      if (!devam) hatirlatma = 0;
      if (hatirlatma >= 2) return;
      const n = akis;
      bosZaman = window.setTimeout(() => {
        if (!simdi(n) || mesgul || surukleme || document.hidden) return;
        if (asama !== 'birlikte' && asama !== 'sen') return;
        hatirlatma++;
        void soyle(sonYonerge);
        if (!sakin()) {
          const taban = harf.style.transform;
          harf.animate([{ transform: taban }, { transform: taban + ' translate(14%,-28%)' }, { transform: taban }], { duration: 520, easing: 'ease-out' });
        }
        bosBekle(true);
      }, hatirlatma ? 18000 : 11000);
    }

    // --- 1. Ceren gösterir ---
    async function goster() {
      asamaYaz('goster');
      const n = akis;
      sonYonerge = ['ev-goster'];
      await bekle(sakin() ? 0 : 450);
      if (!simdi(n)) return;
      // Kapı çalmanın anlatımı yalnız ilk harfte; bir harfi bitirmiş çocuğa her derste yinelenmez,
      // Ceren doğrudan iki kapıyı çalıp yeni harfin sesini gösterir.
      if (!kayit.biten.length) await soyle(['ev-goster']);
      for (const i of [0, 1]) {
        if (!simdi(n)) return;
        acik.add(i);
        if (!(await kapiyiCal(i, 'ceren'))) return;
        await bekle(220);
      }
      if (simdi(n)) birlikte();
    }
    function gosterimiAtla() {
      akis++;
      zamanlayicilar.forEach(clearTimeout); zamanlayicilar = [];
      bekleyenSes?.(false); s.sustur();
      harf.getAnimations().forEach(a => a.cancel());
      kok.querySelectorAll<HTMLElement>('.he-kapi').forEach(k => k.getAnimations().forEach(a => a.cancel()));
      for (const i of [...acik]) if (!evler[i].classList.contains('acik')) acik.delete(i);
      mesgul = false;
      eveKoy();
      asamaYaz('birlikte');
      evDurumunuCiz();
      sonYonerge = ['ev-birlikte'];
    }

    // --- 2. Birlikte ---
    function birlikte() {
      asamaYaz('birlikte');
      sonYonerge = ['ev-birlikte'];
      void soyle(sonYonerge);
      bosBekle();
    }
    async function birlikteAc(i: number) {
      const n = akis;
      if (acik.has(i)) {
        evler[i].classList.remove('soyluyor'); void evler[i].offsetWidth; evler[i].classList.add('soyluyor');
        await soyle([hece(i)]);
        if (simdi(n)) evler[i].classList.remove('soyluyor');
        return;
      }
      acik.add(i);
      if (!(await kapiyiCal(i, 'cocuk'))) return;
      evDurumunuCiz();
      if (acik.size === UNLULER.length) { siradakiEvler = []; void birlikteBitti(); return; }
      // Kapı açılırken dokunulan ev sırada bekler; boşa giden dokunuş olmaz.
      siradakiEvler = siradakiEvler.filter(e => !acik.has(e));
      const sira = siradakiEvler.shift();
      if (sira !== undefined) { void birlikteAc(sira); return; }
      const cocugun = acik.size - 2;
      if (cocugun === 2) void soyle(['ev-devam-1']);
      else if (cocugun === 4) void soyle(['ev-devam-2']);
      bosBekle();
    }

    // Bütün kapılar açılınca doğrudan sonraki bölüm (18 Kasım 2026, Barış: "aşırı tekrar sıkar").
    // Sekiz hecenin arka arkaya okunması (tekerleme) artık yalnız anahtara dokununca: çocuk az önce hepsini tek tek duydu.
    async function birlikteBitti() {
      const n = akis;
      mesgul = true; bosBeklemeyiDurdur();
      await bekle(sakin() ? 0 : 650);
      if (!simdi(n)) return;
      mesgul = false;
      if (kucukGrup) void hatira();
      else void senBul();
    }

    // --- Tekerleme: ma me mı mi / mo mö mu mü (anahtara dokununca) ---
    async function tekerleme(sonra = true) {
      const n = akis;
      if (sonra) asamaYaz('tekerleme');
      mesgul = true; bosBeklemeyiDurdur();
      await bekle(sakin() ? 0 : 380);
      if (sonra) await soyle(['ev-tekerleme']);
      for (let i = 0; i < UNLULER.length; i++) {
        if (!simdi(n)) return;
        evler[i].classList.add('soyluyor');
        const tamam = await soyle([hece(i)]);
        evler[i].classList.remove('soyluyor');
        if (!tamam) break;
        // İki dize: düz sesliler (a e ı i) ve yuvarlak sesliler (o ö u ü).
        await bekle(i === 3 ? 320 : 70);
      }
      if (!simdi(n)) return;
      mesgul = false;
      if (!sonra) return;
      if (kucukGrup) void hatira();
      else void senBul();
    }

    // --- 3. Sen bul ---
    function soruSec() {
      const adaylar = yasGrubu === '4' ? [0, 1, 3, 4, 6] : UNLULER.map((_, i) => i);
      const karisik = [...adaylar].sort(() => Math.random() - .5);
      return karisik.slice(0, yasGrubu === '4' ? 3 : 4);
    }
    async function senBul() {
      asamaYaz('sen');
      const n = akis;
      mesgul = true;
      await kapilariKapat();
      acik.clear(); evDurumunuCiz();
      if (!simdi(n)) return;
      await soyle(['ev-sen']);
      if (!simdi(n)) return;
      sorular = soruSec(); soruNo = 0;
      soruSor();
    }
    function soruSor() {
      yanlis = 0; mesgul = false;
      sonYonerge = ['ev-bul-' + (soruNo % 3 + 1), hece(sorular[soruNo])];
      durum.textContent = (soruNo + 1) + '. soru';
      if (TEST_MODU) kok.dataset.hedef = String(sorular[soruNo]);
      void soyle(sonYonerge);
      bosBekle();
    }
    async function cevapla(i: number) {
      const n = akis, hedef = sorular[soruNo];
      evler.forEach(ev => ev.classList.remove('salla'));
      if (!(await kapiyiCal(i, 'cocuk'))) return;
      if (i === hedef) {
        mesgul = true;
        // Doğru ev: evden pırıltı saçılır, Ceren sevinir.
        parilti(evler[i], 8); cerenSevinsin();
        evler[i].classList.add('soyluyor');
        await soyle(['ev-dogru-' + (soruNo % 3 + 1)]);
        if (!simdi(n)) return;
        evler[i].classList.remove('soyluyor');
        soruNo++;
        if (soruNo >= sorular.length) { void hatira(); return; }
        await kapilariKapat();
        if (simdi(n)) soruSor();
        return;
      }
      yanlis++;
      mesgul = true;
      // Yanlış ev: ceza yok; komik ses, ev sallanır, Ceren düşünür (cila.ts → cilaVurus('geri')).
      oyunSesi('geri');
      evler[i].classList.remove('acik', 'okundu');
      await soyle(['ev-baska', hece(hedef)]);
      if (!simdi(n)) return;
      mesgul = false;
      if (yanlis >= (yasGrubu === '4' ? 1 : 2)) {
        evler[hedef].classList.add('salla');
        void soyle(['ev-ipucu']);
      }
      bosBekle();
    }

    // --- 4. Hatıra: o harfin anahtarı ---
    async function hatira() {
      asamaYaz('hatira');
      const n = akis;
      mesgul = true; bosBeklemeyiDurdur();
      if (!kayit.biten.includes(unsuz)) kayit.biten.push(unsuz);
      const sonraki = siradaki(unsuz);
      kayit.son = sonraki ?? unsuz; sakla();
      acik.clear(); UNLULER.forEach((_, i) => acik.add(i)); evDurumunuCiz();
      harf.hidden = true;
      const anahtar = document.createElement('button');
      anahtar.type = 'button'; anahtar.className = 'he-anahtar';
      anahtar.setAttribute('aria-label', U + ' anahtarı. Heceleri yeniden dinle.');
      anahtar.innerHTML = anahtarResmi(unsuz);
      sahne.append(anahtar);
      // Anahtar kazanıldı: sahnede kutlama (pırıltılar, Ceren alkışlar).
      requestAnimationFrame(() => { if (simdi(n)) bitisKutla(sahne); });
      anahtar.onclick = () => { if (!mesgul) void tekerleme(false); };
      const son = document.createElement('div');
      son.className = 'he-son'; son.hidden = true;
      son.innerHTML = '<button type="button" class="at-sec he-listeye">Harfler</button>' +
        (sonraki ? '<button type="button" class="at-basla he-sonraki">' + buyuk(sonraki) + ' harfine geç ' + IKON.oyna + '</button>' : '');
      sahne.append(son);
      son.querySelector<HTMLButtonElement>('.he-listeye')!.onclick = secimGoster;
      const ileri = son.querySelector<HTMLButtonElement>('.he-sonraki');
      if (ileri && sonraki) {
        ileri.onclick = () => dersGoster(sonraki);
        if (!evAcikKaldi(sonraki)) kilitGoster(ileri, kilitKimligi(sonraki));
      }
      s.ilerleme.innerHTML = anahtarSayaci();
      sonYonerge = ['ev-bitis'];
      await soyle(kayit.biten.length === UNSUZLER.length ? ['ev-bitis', 'ev-hepsi'] : ['ev-bitis']);
      if (!simdi(n)) return;
      // Kazanılan anahtar duvardaki anahtarlıkta kendi kancasına asılır (ilk kez kazanıldıysa).
      const pano = kok.querySelector<HTMLElement>('.he-anahtarlik');
      if (pano && !pano.querySelector('[data-unsuz-anahtar="' + unsuz + '"]')) {
        pano.insertAdjacentHTML('beforeend', asiliAnahtar(unsuz, true));
        pano.setAttribute('aria-label', kayit.biten.length + ' anahtar asılı');
        await bekle(sakin() ? 0 : 700);
        if (!simdi(n)) return;
      }
      son.hidden = false;
      mesgul = false;
      // Bütün anahtarlar toplandı: kutlama (Astra Harf-H5 çizimleri gelince; kutlama.ts).
      if (kayit.biten.length === UNSUZLER.length && kutlamaHazirMi()) {
        const kapat = kutlamaKur(kok, { tur: 'anahtarlar', parcalar: UNSUZLER.map(u => buyuk(u)), oku: s.oku, donusYazisi: 'Hece Evleri’ne dön',
          bitti: () => { kapat(); s.sustur(); secimGoster(); } });
        const onceki = ekranBirak; ekranBirak = () => { kapat(); onceki?.(); };
      }
      (ileri ?? son.querySelector<HTMLButtonElement>('.he-listeye'))!.focus({ preventScroll: true });
    }

    // --- Dokunma ve sürükleme ---
    // Ceren konuşurken ya da bir kapı açılırken gelen dokunuş da karşılıksız kalmaz: ev hafifçe kıpırdar.
    const durt = evKipirdat;
    function evSecildi(i: number) {
      if (asama === 'goster') gosterimiAtla();
      if (asama === 'hatira' && !mesgul) {
        // Hatırada evler açık: dokunulan evin hecesi yeniden okunur.
        evler[i].classList.remove('soyluyor'); void evler[i].offsetWidth; evler[i].classList.add('soyluyor');
        void soyle([hece(i)]).then(() => evler[i].classList.remove('soyluyor'));
        return;
      }
      if (mesgul || asama === 'tekerleme' || asama === 'hatira') {
        if (asama === 'birlikte' && !acik.has(i) && !siradakiEvler.includes(i)) siradakiEvler.push(i);
        durt(evler[i].querySelector('.he-cerceve')!);
        return;
      }
      if (asama === 'birlikte') void birlikteAc(i);
      else if (asama === 'sen') void cevapla(i);
    }
    evler.forEach((ev, i) => { ev.onclick = () => evSecildi(i); });
    function altindakiEv(x: number, y: number) {
      harf.style.pointerEvents = 'none';
      const el = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('.he-ev');
      harf.style.pointerEvents = '';
      return el && evler.includes(el) ? evler.indexOf(el) : -1;
    }
    function suruklemeyiBirak() {
      const eski = surukleme; surukleme = undefined;
      if (eski && harf.hasPointerCapture(eski.id)) harf.releasePointerCapture(eski.id);
      harf.classList.remove('tutuldu');
    }
    harf.onpointerdown = e => {
      if (!e.isPrimary || e.button !== 0) return;
      if (asama === 'goster') gosterimiAtla();
      if (mesgul || asama === 'tekerleme' || asama === 'hatira' || surukleme) {
        if (!surukleme && !harf.getAnimations().length && !sakin()) {
          const taban = harf.style.transform;
          harf.animate([{ transform: taban }, { transform: taban + ' scale(1.08)' }, { transform: taban }], { duration: 220 });
        }
        return;
      }
      e.preventDefault();
      bosBeklemeyiDurdur();
      surukleme = { id: e.pointerId, dx: harfX - e.clientX, dy: harfY - e.clientY, hareket: false, x: e.clientX, y: e.clientY };
      harf.setPointerCapture(e.pointerId);
      harf.classList.add('tutuldu');
    };
    harf.onpointermove = e => {
      if (surukleme?.id !== e.pointerId) return;
      if (!surukleme.hareket && Math.hypot(e.clientX - surukleme.x, e.clientY - surukleme.y) < 6) return;
      surukleme.hareket = true;
      harfiKoy(e.clientX + surukleme.dx, e.clientY + surukleme.dy, 1);
      const alttaki = altindakiEv(e.clientX, e.clientY);
      evler.forEach((ev, i) => ev.classList.toggle('hedef', i === alttaki));
    };
    harf.onpointerup = e => {
      if (surukleme?.id !== e.pointerId) return;
      const { hareket } = surukleme;
      suruklemeyiBirak();
      evler.forEach(ev => ev.classList.remove('hedef'));
      const i = hareket ? altindakiEv(e.clientX, e.clientY) : -1;
      if (i >= 0) { evSecildi(i); return; }
      if (hareket) { const { x, y } = evNoktasi(); void harfiTasi(x, y, 1, 260); }
      else void soyle(sonYonerge);
      bosBekle();
    };
    harf.onpointercancel = harf.onlostpointercapture = e => {
      if (surukleme?.id !== e.pointerId) return;
      suruklemeyiBirak();
      evler.forEach(ev => ev.classList.remove('hedef'));
      if (!mesgul) eveKoy();
    };
    harf.onclick = e => { if (e.detail === 0 && !mesgul) void soyle(sonYonerge); };
    dinle.onclick = () => {
      if (asama === 'goster' || mesgul) { durt(dinle); return; }
      void soyle(sonYonerge);
      bosBekle();
    };

    const gozlemci = new ResizeObserver(() => { if (!mesgul && !surukleme) eveKoy(); });
    gozlemci.observe(sahne);
    ekranBirak = () => {
      gozlemci.disconnect(); bosBeklemeyiDurdur(); suruklemeyiBirak();
      harf.getAnimations().forEach(a => a.cancel());
    };
    eveKoy();
    s.baslik.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    if (ders === akis) void goster();
  }

  secimGoster();
  return () => { temizle(); alan.replaceChildren(); };
}
