/**
 * Soru ve 3 kart (her halkada aynı): ipucunun fotoğrafı dosyadan çıkıp ortaya gelir, Mino soruyu sorar, kartlar açılır,
 * Kino atılıp yanlış bir kartı gösterir (patisiyle damgalar). Çocuk kartı ipucunun üstüne SÜRÜKLER (dokunmak da olur).
 * - Doğru: kart ipucuna tam oturur ("tık", ışık halkası, parıltı), herkes sevinir; "Demek ki…" kartına dönüşür.
 * - Yanlış: kart oturmaz, yumuşakça seker; sonra kendini anlatır (zürafanın boynu tavana çarpar, ördek vaklar, turuncu
 *   kedi tüyün yanında: uymuyor, yastıktaki kedi horlar …) ve soluklaşır. Ceza yok. 2 yanlıştan sonra doğru kart parlar.
 * - 7 sn kart seçilmezse parmak, kartlardan ipucuna sürüklemeyi gösterir (hangi kartın doğru olduğunu söylemeden).
 */
import { efekt } from '../../src/audio/ses';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { Efekt, oynat, parmak, pop, salla } from './efekt';
import { KARTLAR, kartSirasi, M, Soru, YARDIM, type KartTepki, type SorguHalkasi } from './mantik';
import D from '../../content/dedektif.json';
import { KART_TON, type Oyuncular } from './oyuncular';
import { resim } from './resimler';
import { ses } from './sesler';

const KT = D.kart;

/** Doğru kartın ipucunun fotoğrafında oturduğu yer (fotoğrafın oranı) ve yalnız resmiyle mi oturduğu */
export interface Oturma {
  x: number;
  y: number;
  w: number;
  sade: boolean;
  don?: number;
}
const OTURMA: Record<string, Oturma> = {
  // kedi kartı halıdaki izin yanına (izi bırakan hayvan, yan yana)
  iz: { x: 0.74, y: 0.7, w: 0.48, sade: false, don: 8 },
  // beyaz kedi kartı tüyün yanına (aynı renk, yan yana)
  tuy: { x: 0.74, y: 0.7, w: 0.48, sade: false, don: 8 },
  // kelebeği kovalayan kedi sarı tozun yanına
  neden: { x: 0.72, y: 0.68, w: 0.52, sade: false, don: -6 },
};

/** Kartın görünüşü (Vaka 1: mantik.ts → KARTLAR; Vaka 2 kendi tablosunu verir) */
export interface KartGorunus {
  resim: string;
  /** ölçüde (kart ipucunun üstüne inince) görünen resim: hayvan kartı izin üstünde kendi ayak izine dönüşür */
  olcu?: string;
  renk: string;
  tepki?: string;
}
/** Yanlış kartın kendi sahnesi (Vaka 2): kart ipucunun üstüne gelir, kendini anlatır; sonra sorgu kartı yerine döndürür */
export interface YanlisAni {
  k: HTMLElement;
  id: string;
  delil: HTMLElement;
  /** ipucu fotoğrafının ekrandaki kutusu */
  ic: DOMRect;
  sahnecik: HTMLElement;
}

export interface SorguSecenek {
  kok: HTMLElement;
  efekt: Efekt;
  oy: Oyuncular;
  halka: SorguHalkasi;
  /** kart görünüşleri (yoksa Vaka 1'in KARTLAR'ı) */
  kartlar?: Record<string, KartGorunus>;
  /** doğru kartın fotoğrafta oturduğu yer (yoksa Vaka 1'in tablosu) */
  oturma?: Oturma;
  /** yanlış kartın sahnesi (verilirse varsayılan "seker, köşeye çekilir, kendini anlatır" yerine) */
  yanlisAni?: (a: YanlisAni) => Promise<void>;
  /** doğru kart oturduktan sonra (ör. rüzgâr esip Kino'nun kulaklarını havalandırır) */
  dogruAni?: () => Promise<void>;
  /** 2 yanlıştan sonra (doğru kart zaten parlar; ör. iz kenarını bir kez parlatır) */
  parlaAni?: () => void;
  /** ipucunun fotoğrafı ve (Halka 3) ikinci fotoğraf */
  foto: string;
  ekFoto?: string | null;
  /** dosyadaki gözü (fotoğraf buradan çıkar, "demek ki" kartı buraya döner) */
  goz: () => HTMLElement | null;
  /** ilk soru mu (sürükleme bir kez anlatılır) */
  ilk: boolean;
  rnd: () => number;
  kapandi: () => boolean;
  bekle: (ms: number) => Promise<void>;
  /** yardım zamanlayıcıları için: kart seçimi bekleniyor */
  adim: (ad: string) => void;
}

/** Sorgu: doğru kart ipucuna oturana kadar sürer; "demek ki" kartı dosyaya girince çözülür */
export async function sorgu(o: SorguSecenek): Promise<void> {
  const { halka, oy, efekt: fx } = o;
  const soru = new Soru(halka);
  const sira = kartSirasi(halka, o.rnd);
  const katman = h('div.dd-sorgu', { 'data-halka': halka.id });
  const perde = h('div.dd-perde');
  const foto = h('img.dd-delil-foto', { src: o.foto, alt: '', draggable: 'false' });
  const ek = o.ekFoto ? h('img.dd-delil-ek', { src: o.ekFoto, alt: '', draggable: 'false' }) : null;
  const yuva = h('div.dd-delil-yuva');
  const delil = h('div.dd-delil', {}, h('div.dd-delil-ic', {}, foto, yuva), h('i.dd-bant'), ek ? h('div.dd-delil-ekk', {}, ek, h('i.dd-bant')) : null);
  const tablo: Record<string, KartGorunus> = o.kartlar ?? KARTLAR;
  const kartlar = sira.map((id, i) => kartEl(id, i, tablo));
  const satir = h('div.dd-kartlar', {}, ...kartlar.map((k) => h('div.dd-kart-yer', {}, k)));
  const sahnecik = h('div.dd-sahnecik');
  katman.append(perde, delil, satir, sahnecik);
  o.kok.append(katman);
  if (TEST_MODU) kartlar.forEach((k) => k.dataset.kart === halka.dogru && (k.dataset.dogru = '1'));

  // 1) fotoğraf dosyadan çıkıp ortaya gelir; perde iner
  katman.classList.add('acik');
  const goz = o.goz();
  if (goz && !AZ_HAREKET) {
    const a = goz.getBoundingClientRect();
    const b = delil.getBoundingClientRect();
    const k = Math.max(0.15, a.width / Math.max(1, b.width));
    void delil.animate(
      [
        { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${k}) rotate(-8deg)`, opacity: 0.6 },
        { transform: 'translate(0, 0) scale(1.08) rotate(3deg)', opacity: 1, offset: 0.7 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: sure(560), easing: 'cubic-bezier(.3,.9,.4,1)', fill: 'backwards' },
    );
  }
  efekt.ucus();

  // 2) soru; kartlar sırayla açılır
  kartlar.forEach((k, i) => k.animate([{ transform: 'translateY(60px) scale(0.6) rotate(-10deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(420), delay: sure(420 + i * 120), easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
  setTimeout(() => !o.kapandi() && ses.kart(), sure(420));
  o.oy.mino.bak(0.4);
  // kartlar açılır açılmaz tutulabilir (dokunuş beklemez); soru ve Kino'nun tahmini bu arada sürer
  let mesgul = false;
  let tanitim = true;
  let durdurParmak: (() => void) | null = null;
  let sonHareket = performance.now();
  const tanit = (async () => {
    // 2) soru
    await oy.soyle(halka.soru);
    if (o.kapandi() || soru.cozuldu) return;
    // 3) Kino atılır: yanlış bir kartı gösterir, patisiyle damgalar
    const kinoKart = kartlar.find((k) => k.dataset.kart === halka.kinoKart);
    if (halka.kino && kinoKart && !kinoKart.classList.contains('dd-soluk')) {
      oy.kinoPoz('isaret');
      oy.kinoIfade('heyecan', 1600);
      oy.kinoOynat('sevin', 700);
      void oy.zipla('kino', 22, 560);
      const damga = h('img.dd-damga', { src: resim('ipucu-kopek-pati') ?? '', alt: '', draggable: 'false' });
      setTimeout(() => {
        if (o.kapandi()) return;
        kinoKart.append(damga);
        oynat(damga, 'dd-damga-bas');
        void salla(kinoKart);
        ses.pop();
      }, sure(380));
      await oy.soyle(halka.kino, 'kino');
      oy.kinoPoz(null);
      if (o.kapandi() || soru.cozuldu) return;
      if (halka.kinoCevap) {
        oy.minoTepki('gidik');
        await oy.soyle(halka.kinoCevap);
        if (o.kapandi() || soru.cozuldu) return;
      }
    }
    if (o.ilk && !soru.yanlislar.length) await oy.soyle(M.surukle);
  })().finally(() => {
    tanitim = false;
    sonHareket = performance.now();
    if (!soru.cozuldu && !o.kapandi()) o.adim('kart');
  });

  // 4) seçim: sürükle ya da dokun
  const ipucuZaman = window.setInterval(() => {
    if (o.kapandi() || mesgul || tanitim || durdurParmak) return;
    if (performance.now() - sonHareket > YARDIM.surukleSn * 1000) {
      // hangisinin doğru olduğunu söylemeden: açık kartlardan birinden ipucuna
      const acik = kartlar.filter((k) => !k.classList.contains('dd-soluk'));
      const k = acik[Math.floor(o.rnd() * acik.length)];
      if (k) durdurParmak = parmak(o.kok, () => k.getBoundingClientRect(), () => delil.getBoundingClientRect());
      void oy.soyle(M.surukle);
    }
  }, 1000);
  const parmakDur = () => {
    durdurParmak?.();
    durdurParmak = null;
    sonHareket = performance.now();
  };

  await new Promise<void>((coz) => {
    const bitir = () => {
      clearInterval(ipucuZaman);
      parmakDur();
      coz();
    };
    for (const k of kartlar) {
      let s: { id: number; x0: number; y0: number; t0: number; tasindi: boolean } | null = null;
      k.addEventListener('pointerdown', (e) => {
        if (mesgul || o.kapandi() || k.classList.contains('dd-soluk')) return;
        parmakDur();
        s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), tasindi: false };
        k.setPointerCapture(e.pointerId);
        k.classList.add('dd-tutulan');
        ses.kart();
      });
      k.addEventListener('pointermove', (e) => {
        if (!s || e.pointerId !== s.id) return;
        const dx = e.clientX - s.x0;
        const dy = e.clientY - s.y0;
        if (Math.hypot(dx, dy) > 8) s.tasindi = true;
        k.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-12, Math.min(12, dx * 0.05))}deg) scale(1.08)`;
        delil.classList.toggle('dd-uzerinde', ustunde(k, delil));
        sonHareket = performance.now();
      });
      const birak = async (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const tasindi = s.tasindi;
        s = null;
        k.classList.remove('dd-tutulan');
        delil.classList.remove('dd-uzerinde');
        if (mesgul) return;
        // sürüklenip ipucunun üstüne bırakıldı ya da dokunuldu: kart ipucuna gider
        if (!tasindi || ustunde(k, delil)) {
          mesgul = true;
          const id = k.dataset.kart!;
          const sonuc = soru.sec(id);
          if (sonuc.dogru) {
            await dogruOturt(o, k, delil, yuva, kartlar);
            if (o.dogruAni && !o.kapandi()) await o.dogruAni();
            bitir();
            return;
          }
          await yanlis(o, k, delil, sahnecik, id, tablo[id]?.tepki as KartTepki | undefined);
          if (sonuc.parla) {
            for (const x of kartlar) if (x.dataset.kart === halka.dogru) x.classList.add('dd-parla');
            if (!o.kapandi()) o.parlaAni?.();
          }
          mesgul = false;
          sonHareket = performance.now();
        } else {
          // ipucunun dışında bırakıldı: yaylanarak yerine döner
          await geriDon(k);
        }
      };
      k.addEventListener('pointerup', (e) => void birak(e));
      k.addEventListener('pointercancel', (e) => void birak(e));
    }
  });
  // doğru kart erkenden bulunduysa Kino'nun sözü bitsin (konuşmalar üst üste binmesin)
  await tanit;
  if (o.kapandi()) return;

  // 5) "Demek ki…": fotoğraf ve kart birleşip sonuç kartına döner; Mino söyler; kart dosyaya uçar
  satir.classList.add('dd-gidiyor');
  const demek = h('div.dd-demek', {}, h('b', {}, D.yazi.demek_ki), h('img', { src: resim(halka.demekResim) ?? '', alt: '', draggable: 'false' }), h('i.dd-tik'));
  delil.append(demek);
  oynat(delil, 'dd-cevir');
  await o.bekle(260);
  await oy.soyle(halka.demekKi);
  if (o.kapandi()) return;
  const hedef = o.goz();
  if (hedef) {
    const [x0, y0] = fx.merkez(delil);
    const [x1, y1] = fx.merkez(hedef);
    const a = delil.getBoundingClientRect();
    const b = hedef.getBoundingClientRect();
    const kopya = delil.cloneNode(true) as HTMLElement;
    // uçan kopya: çevirme / ışık animasyonları ve ikinci fotoğraf kopyalanmaz, kendi yerleşimi yok (uçuş kabında durur)
    kopya.classList.remove('dd-cevir', 'dd-isil', 'dd-uzerinde');
    kopya.querySelector('.dd-delil-ekk')?.remove();
    kopya.querySelector<HTMLElement>('.dd-demek')?.style.setProperty('opacity', '1');
    kopya.style.cssText = `position:relative;left:auto;top:auto;width:${a.width}px;height:${a.height}px;rotate:-2deg`;
    delil.style.opacity = '0';
    perde.classList.add('kalkiyor');
    efekt.ucus();
    await fx.ucur(kopya, [x0, y0], [x1, y1], { ms: 640, kavis: -90, boy1: Math.max(0.12, b.width / a.width), don: -10 });
    ses.yapis();
  }
  katman.classList.add('kapaniyor');
  await o.bekle(260);
  katman.remove();
}

function kartEl(id: string, i: number, tablo: Record<string, KartGorunus>): HTMLElement {
  const t = tablo[id];
  return h(
    'button.dd-kart',
    { type: 'button', 'data-kart': id, 'aria-label': id, 'data-olcu': t.olcu ? (resim(t.olcu) ?? undefined) : undefined, style: `--i:${i};--kr:${t.renk}` },
    h('span.dd-kart-ic', {}, h('img', { src: resim(t.resim) ?? '', alt: '', draggable: 'false' })),
  );
}

/** Kart ölçüye geçer (ayak izine dönüşür) ya da kendi resmine döner; ölçü resmi yoksa bir şey olmaz */
export function olcuResmi(k: HTMLElement, olcu: boolean) {
  const img = k.querySelector<HTMLImageElement>('.dd-kart-ic img');
  const u = k.dataset.olcu;
  if (!img || !u) return;
  if (olcu && !k.dataset.asil) {
    k.dataset.asil = img.src;
    img.src = u;
  } else if (!olcu && k.dataset.asil) {
    img.src = k.dataset.asil;
    delete k.dataset.asil;
  }
}

/** Kartın ortası ipucunun (biraz genişletilmiş) kutusunda mı */
function ustunde(k: HTMLElement, delil: HTMLElement): boolean {
  const a = k.getBoundingClientRect();
  const b = delil.getBoundingClientRect();
  const cx = a.left + a.width / 2;
  const cy = a.top + a.height / 2;
  const p = Math.min(b.width, b.height) * 0.22;
  return cx > b.left - p && cx < b.right + p && cy > b.top - p && cy < b.bottom + p;
}

/** Kartın şu anki görünen yerinden ipucunun bir noktasına (WAAPI); dönüş: kartın o anki dönüşümü */
export async function kartGotur(k: HTMLElement, hedef: DOMRect, x: number, y: number, boy: number, don = 0, ms = 420) {
  const simdi = k.style.transform || 'none';
  // kartın yerleşik (dönüşümsüz) kutusu: şimdiki dönüşüm geçici olarak kaldırılıp ölçülür
  k.style.transform = '';
  const yer = k.getBoundingClientRect();
  k.style.transform = simdi;
  const tx = hedef.left + hedef.width * x - (yer.left + yer.width / 2);
  const ty = hedef.top + hedef.height * y - (yer.top + yer.height / 2);
  const s = boy / Math.max(1, yer.width);
  const son = `translate(${tx}px, ${ty}px) rotate(${don}deg) scale(${s})`;
  const an = k.animate([{ transform: simdi }, { transform: son }], { duration: sure(ms), easing: 'cubic-bezier(.3,.9,.4,1.05)', fill: 'forwards' });
  await an.finished.catch(() => undefined);
  k.style.transform = son;
  an.cancel();
}

export async function geriDon(k: HTMLElement, ms = 420) {
  const simdi = k.style.transform || 'none';
  const an = k.animate([{ transform: simdi }, { transform: 'translate(0, 0) rotate(0) scale(1.04)', offset: 0.8 }, { transform: 'none' }], { duration: sure(ms), easing: 'cubic-bezier(.3,1.3,.5,1)' });
  k.style.transform = '';
  await an.finished.catch(() => undefined);
}

/** Doğru kart ipucuna tam oturur: tık, ışık halkası, parıltı, herkes sevinir */
async function dogruOturt(o: SorguSecenek, k: HTMLElement, delil: HTMLElement, yuva: HTMLElement, kartlar: HTMLElement[]) {
  const ot = o.oturma ?? OTURMA[o.halka.id] ?? { x: 0.5, y: 0.5, w: 0.5, sade: false };
  const ic = delil.querySelector('.dd-delil-foto')!.getBoundingClientRect();
  kartlar.forEach((x) => x !== k && x.classList.add('dd-cekil'));
  k.classList.add('dd-oturuyor');
  if (ot.sade) {
    k.classList.add('dd-sade');
    olcuResmi(k, true);
  }
  // sade kartın resmi kartın içinde %78 (kenar boşluğu): resim tam oturacağı boyda insin (yerine geçerken sıçramasın)
  await kartGotur(k, ic, ot.x, ot.y, (ic.width * ot.w) / (ot.sade ? 0.78 : 1), ot.don ?? 0, 460);
  // kart yerine fotoğrafın içindeki yuvaya yapışır (aynı yer, artık fotoğrafla birlikte döner)
  const img = h('img.dd-oturan', { src: k.querySelector('img')?.getAttribute('src') ?? '', alt: '', draggable: 'false' });
  const kart = h(`div.dd-oturan-kap${ot.sade ? '.dd-sade' : ''}`, { style: `left:${ot.x * 100}%;top:${ot.y * 100}%;width:${ot.w * 100}%;--don:${ot.don ?? 0}deg` }, img);
  yuva.append(kart);
  k.style.visibility = 'hidden';
  ses.tik();
  const [x, y] = o.efekt.merkez(kart);
  o.efekt.halka(x, y, Math.max(50, ic.width * 0.3));
  void pop(delil, 1.08);
  oynat(delil, 'dd-isil');
  o.oy.minoTepki('zipla');
  o.oy.kinoOynat('sevin', 900);
  o.oy.kinoIfade('heyecan', 1200);
  void o.oy.zipla('kino', 20);
  efekt.dogru();
  await o.bekle(650);
}

/** Yanlış kart: oturmaz, seker; kendini anlatır; soluklaşır */
async function yanlis(o: SorguSecenek, k: HTMLElement, delil: HTMLElement, sahnecik: HTMLElement, id: string, tepki?: KartTepki) {
  const { oy } = o;
  const ic = delil.querySelector('.dd-delil-foto')!.getBoundingClientRect();
  if (o.yanlisAni) {
    // Vaka 2: kartın kendi sahnesi (ör. ayak izi gerçek boyunda ize konur: taşar ya da aşar)
    efekt.yanlis();
    oy.kinoIfade('saskin', 1000);
    await o.yanlisAni({ k, id, delil, ic, sahnecik });
    if (o.kapandi()) return;
    await geriDon(k, 460);
    k.classList.add('dd-soluk');
    o.oy.mino.bak(0.4);
    return;
  }
  // ipucunun üstüne gelir, oturmaz: yumuşakça seker
  await kartGotur(k, ic, 0.5, 0.5, ic.width * 0.55, 0, 300);
  ses.sek();
  efekt.yanlis();
  void salla(delil);
  oy.minoTepki('kararsiz', 1.2);
  oy.kinoIfade('saskin', 1000);
  const yan = delil.getBoundingClientRect();
  // ipucunun köşesine çekilir (yan yana kıyas; dar ekranda da ekranda kalır)
  await kartGotur(k, yan, 0.84, 0.74, Math.min(yan.width * 0.52, 200), 7, 360);
  if (o.kapandi()) return;
  switch (tepki) {
    case 'zurafa':
      await zurafa(o, k, sahnecik);
      break;
    case 'ordek':
      await ordek(o, k, sahnecik);
      break;
    case 'turuncu':
      // turuncu tüy beyaz tüyün yanında: uymuyor. Mino rahat bir nefes alır.
      void pop(k, 1.12);
      oy.minoTepki('sevinc');
      oy.mino.bak(0.6);
      await oy.soyle(M.turuncu);
      break;
    case 'siyah':
      void pop(k, 1.18);
      ses.hmm();
      await oy.soyle(KT.siyah, 'kart', KART_TON.siyah);
      break;
    case 'sut':
      // süt kasesi masaya bakar (eğilir): masada süt yok
      if (!AZ_HAREKET) void k.animate([{ transform: k.style.transform }, { transform: `${k.style.transform} rotate(-16deg) translateX(-10px)`, offset: 0.4 }, { transform: k.style.transform }], { duration: sure(1300), easing: 'ease-in-out' });
      oy.minoTepki('hayir');
      await oy.soyle(M.sut_yok);
      break;
    case 'yastik':
      await yastik(o, k);
      break;
  }
  if (o.kapandi()) return;
  // yerine döner, soluklaşır (yeniden denenmez)
  await geriDon(k, 460);
  k.classList.add('dd-soluk');
  o.oy.mino.bak(0.4);
}

/**
 * Kartın içinden çıkan hayvanın sahnesi: kart noktasından büyüyüp sahnenin önüne (ipucunun önü, ekranın altına yakın)
 * zıplar. Döner: hayvanın kabı (ayak tabanı left/top noktasında) ve geri dönüş.
 */
function hayvanSahnesi(o: SorguSecenek, k: HTMLElement, sahnecik: HTMLElement, sinif: string, boyOran: number, ...icerik: HTMLElement[]) {
  const kk = o.kok.getBoundingClientRect();
  const r = k.getBoundingClientRect();
  const dar = kk.width < kk.height * 1.15;
  const boy = Math.min(kk.height * boyOran, kk.width * (dar ? 0.7 : 0.42));
  // sahne: dikeyde ortada, kartların hizasında; yatayda fotoğrafla kartların arasında, yerde
  const sx = kk.width * (dar ? 0.5 : 0.56);
  const sy = kk.height * (dar ? 0.78 : 0.97);
  const z = h(`div.${sinif}`, { style: `left:${sx}px;top:${sy}px;width:${boy}px;height:${boy}px` }, ...icerik);
  sahnecik.append(z);
  const dx = r.left - kk.left + r.width / 2 - sx;
  const dy = r.top - kk.top + r.height / 2 - sy;
  const gel = z.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - boy * 0.35}px) translate(-50%, -100%) scale(0.85)`, opacity: 1, offset: 0.55 },
      { transform: 'translate(-50%, -100%) scale(1.04, 0.97)', opacity: 1, offset: 0.82 },
      { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 },
    ],
    { duration: sure(620), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'forwards' },
  );
  const don = () =>
    z
      .animate(
        [
          { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - boy * 0.25}px) translate(-50%, -100%) scale(0.5)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 },
        ],
        { duration: sure(420), easing: 'ease-in', fill: 'forwards' },
      )
      .finished.catch(() => undefined)
      .then(() => z.remove());
  return { z, boy, sy, gel: gel.finished.catch(() => undefined), don };
}

/**
 * Zürafa: karttan çıkar, "Benim ayağım toynak!"; sonra gerçek boyuna doğru büyür (çizim hiç esnemez, orantısı aynı):
 * başı ekranın tepesine "tok" diye çarpar, başının üstünde yıldızlar döner, sersemce sallanır: "Hem bu odaya sığmam!";
 * küçülüp karta geri girer.
 */
async function zurafa(o: SorguSecenek, k: HTMLElement, sahnecik: HTMLElement) {
  const url = resim('zurafa');
  if (!url) {
    await o.oy.soyle(KT.zurafa_toynak, 'kart', KART_TON.zurafa);
    await o.oy.soyle(KT.zurafa_sigmam, 'kart', KART_TON.zurafa);
    return;
  }
  const img = h('img', { src: url, alt: '', draggable: 'false' });
  const govde = h('div.dd-zurafa-govde', {}, img);
  const s = hayvanSahnesi(o, k, sahnecik, 'dd-zurafa', 0.42, govde);
  ses.pop();
  await s.gel;
  await o.oy.soyle(KT.zurafa_toynak, 'kart', KART_TON.zurafa);
  if (o.kapandi()) return;
  // gerçek boyuna büyür (eşit ölçek, ayaklar yerde): başın tepesi (tuvalin ~%6'sı) ekranın üstüne değene kadar
  const buyu = Math.max(1.15, Math.min(3, (s.sy - 2) / (s.boy * 0.94)));
  ses.uza();
  const ms = sure(750);
  const egri = 'cubic-bezier(.5,0,.75,0)';
  await govde.animate([{ transform: 'scale(1)' }, { transform: `scale(${buyu})` }], { duration: ms, easing: egri, fill: 'forwards' }).finished.catch(() => undefined);
  if (o.kapandi()) return;
  // tok! hafifçe geri seker, sersem sersem sallanır (yalnız dönme, esneme yok)
  ses.tok();
  o.efekt.sars(6);
  const [bx, by] = o.efekt.merkez(img, 0.36, 0.08);
  o.efekt.yildizlar(bx, Math.max(14, by));
  void govde.animate(
    [
      { transform: `scale(${buyu})` },
      { transform: `scale(${buyu * 0.97}) rotate(-4deg)`, offset: 0.25 },
      { transform: `scale(${buyu * 0.97}) rotate(3deg)`, offset: 0.5 },
      { transform: `scale(${buyu * 0.97}) rotate(-2deg)`, offset: 0.75 },
      { transform: `scale(${buyu * 0.97}) rotate(0deg)` },
    ],
    { duration: sure(1400), easing: 'ease-in-out', fill: 'forwards' },
  );
  await o.oy.soyle(KT.zurafa_sigmam, 'kart', KART_TON.zurafa);
  // küçülür, karta geri girer
  await govde.animate([{ transform: `scale(${buyu * 0.97})` }, { transform: 'scale(1)' }], { duration: sure(420), easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
  await s.don();
}


/** Ördek: karttan çıkar, paytak paytak sallanır, ayaklarını açar: "Benim ayağım perdeli. Vak!" */
async function ordek(o: SorguSecenek, k: HTMLElement, sahnecik: HTMLElement) {
  const url = resim('ordek');
  if (!url) {
    ses.vak();
    await o.oy.soyle(KT.ordek, 'kart', KART_TON.ordek);
    return;
  }
  const img = h('img', { src: url, alt: '', draggable: 'false' });
  const ayak = h('img.dd-ordek-ayak', { src: resim('kart-ordek-ayagi') ?? '', alt: '', draggable: 'false' });
  const s = hayvanSahnesi(o, k, sahnecik, 'dd-ordek', 0.42, img, ayak);
  ses.pop();
  await s.gel;
  if (!AZ_HAREKET) void img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg) translateX(-7%)' }, { transform: 'rotate(10deg) translateX(7%)' }, { transform: 'rotate(0)' }], { duration: sure(520), iterations: 4, easing: 'ease-in-out' });
  // perdeli ayağını gösterir (ayak izi büyür, açılır)
  if (!AZ_HAREKET) void ayak.animate([{ transform: 'translate(-50%, 0) scale(0.2) rotate(-20deg)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1.15) rotate(8deg)', opacity: 1, offset: 0.4 }, { transform: 'translate(-50%, 0) scale(1) rotate(0)', opacity: 1 }], { duration: sure(700), delay: sure(500), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'both' });
  ses.vak();
  setTimeout(() => !o.kapandi() && ses.vak(), sure(900));
  await o.oy.soyle(KT.ordek, 'kart', KART_TON.ordek);
  await s.don();
}


/** Yastık: karttaki uykucu kedi horlar (z harfleri yükselir): "Uyuyan kedi zıplamaz!" */
async function yastik(o: SorguSecenek, k: HTMLElement) {
  const z = h('div.dd-zzz', { 'aria-hidden': 'true' }, h('span', {}, 'z'), h('span', {}, 'z'), h('span', {}, 'Z'));
  k.append(z);
  ses.horla();
  const nefes = AZ_HAREKET ? null : k.querySelector('.dd-kart-ic')?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.96)' }, { transform: 'scale(1)' }], { duration: sure(1100), iterations: 3, easing: 'ease-in-out' });
  o.oy.minoTepki('hayir');
  await o.oy.soyle(M.uyuyan);
  nefes?.cancel();
  z.remove();
}
