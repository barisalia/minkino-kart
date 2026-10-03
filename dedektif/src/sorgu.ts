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
import { KARTLAR, kartSirasi, M, Soru, YARDIM, type Halka, type KartId, type KartTepki } from './mantik';
import D from '../../content/dedektif.json';
import { KART_TON, type Oyuncular } from './oyuncular';
import { resim } from './resimler';
import { ses } from './sesler';

const KT = D.kart;

/** Doğru kartın ipucunun fotoğrafında oturduğu yer (fotoğrafın oranı) ve yalnız resmiyle mi oturduğu */
const OTURMA: Record<string, { x: number; y: number; w: number; sade: boolean; don?: number }> = {
  // pati izi halıdaki izin tam üstüne (çerçevesiz, izin rengine karışır)
  iz: { x: 0.5, y: 0.52, w: 0.36, sade: true, don: 0 },
  // beyaz kedi kartı tüyün yanına (aynı renk, yan yana)
  tuy: { x: 0.74, y: 0.7, w: 0.48, sade: false, don: 8 },
  // kelebek sarı tozun üstüne konar
  neden: { x: 0.5, y: 0.5, w: 0.62, sade: true, don: -6 },
};

export interface SorguSecenek {
  kok: HTMLElement;
  efekt: Efekt;
  oy: Oyuncular;
  halka: Halka;
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
  const kartlar = sira.map((id, i) => kartEl(id, i));
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
  await oy.soyle(halka.soru);
  if (o.kapandi()) return;

  // 3) Kino atılır: yanlış bir kartı gösterir, patisiyle damgalar
  const kinoKart = kartlar.find((k) => k.dataset.kart === halka.kinoKart);
  if (halka.kino && kinoKart) {
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
    if (o.kapandi()) return;
  }
  if (o.ilk) await oy.soyle(M.surukle);

  // 4) seçim: sürükle ya da dokun
  let mesgul = false;
  let durdurParmak: (() => void) | null = null;
  let sonHareket = performance.now();
  const ipucuZaman = window.setInterval(() => {
    if (o.kapandi() || mesgul || durdurParmak) return;
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
  o.adim('kart');

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
          const id = k.dataset.kart as KartId;
          const sonuc = soru.sec(id);
          if (sonuc.dogru) {
            await dogruOturt(o, k, delil, yuva, kartlar);
            bitir();
            return;
          }
          await yanlis(o, k, delil, sahnecik, KARTLAR[id].tepki);
          if (sonuc.parla) for (const x of kartlar) if (x.dataset.kart === halka.dogru) x.classList.add('dd-parla');
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
    kopya.style.width = `${a.width}px`;
    kopya.style.height = `${a.height}px`;
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

function kartEl(id: KartId, i: number): HTMLElement {
  const t = KARTLAR[id];
  return h(
    'button.dd-kart',
    { type: 'button', 'data-kart': id, 'aria-label': id, style: `--i:${i};--kr:${t.renk}` },
    h('span.dd-kart-ic', {}, h('img', { src: resim(t.resim) ?? '', alt: '', draggable: 'false' })),
  );
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
async function kartGotur(k: HTMLElement, hedef: DOMRect, x: number, y: number, boy: number, don = 0, ms = 420) {
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

async function geriDon(k: HTMLElement, ms = 420) {
  const simdi = k.style.transform || 'none';
  const an = k.animate([{ transform: simdi }, { transform: 'translate(0, 0) rotate(0) scale(1.04)', offset: 0.8 }, { transform: 'none' }], { duration: sure(ms), easing: 'cubic-bezier(.3,1.3,.5,1)' });
  k.style.transform = '';
  await an.finished.catch(() => undefined);
}

/** Doğru kart ipucuna tam oturur: tık, ışık halkası, parıltı, herkes sevinir */
async function dogruOturt(o: SorguSecenek, k: HTMLElement, delil: HTMLElement, yuva: HTMLElement, kartlar: HTMLElement[]) {
  const ot = OTURMA[o.halka.id] ?? { x: 0.5, y: 0.5, w: 0.5, sade: false };
  const ic = delil.querySelector('.dd-delil-foto')!.getBoundingClientRect();
  kartlar.forEach((x) => x !== k && x.classList.add('dd-cekil'));
  k.classList.add('dd-oturuyor');
  if (ot.sade) k.classList.add('dd-sade');
  await kartGotur(k, ic, ot.x, ot.y, ic.width * ot.w, ot.don ?? 0, 460);
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
async function yanlis(o: SorguSecenek, k: HTMLElement, delil: HTMLElement, sahnecik: HTMLElement, tepki?: KartTepki) {
  const { oy } = o;
  const ic = delil.querySelector('.dd-delil-foto')!.getBoundingClientRect();
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

/** Zürafa: karttan çıkar, "Benim ayağım toynak!"; boynu uzar, tavana "tok" çarpar: "Hem bu odaya sığmam!" */
async function zurafa(o: SorguSecenek, k: HTMLElement, sahnecik: HTMLElement) {
  const url = resim('zurafa');
  if (!url) {
    await o.oy.soyle(KT.zurafa_toynak, 'kart', KART_TON.zurafa);
    await o.oy.soyle(KT.zurafa_sigmam, 'kart', KART_TON.zurafa);
    return;
  }
  const r = k.getBoundingClientRect();
  const kk = o.kok.getBoundingClientRect();
  const boy = r.height * 1.35;
  // üç dilim: baş (üstte), boyun (uzayan), gövde (yerinde)
  const dilim = (sinif: string) => h(`div.dd-zurafa-dilim.${sinif}`, {}, h('img', { src: url, alt: '', draggable: 'false' }));
  const bas = dilim('dd-zd-bas');
  const boyun = dilim('dd-zd-boyun');
  const govde = dilim('dd-zd-govde');
  const z = h('div.dd-zurafa', { style: `left:${r.left - kk.left + r.width / 2}px;top:${r.top - kk.top + r.height * 0.55}px;width:${boy}px;height:${boy}px` }, govde, boyun, bas);
  sahnecik.append(z);
  ses.pop();
  await z.animate([{ transform: 'translate(-50%, -100%) scale(0.2)', opacity: 0 }, { transform: 'translate(-50%, -100%) scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 }], { duration: sure(420), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
  await o.oy.soyle(KT.zurafa_toynak, 'kart', KART_TON.zurafa);
  if (o.kapandi()) return;
  // boyun uzar: başın tepesi ekranın üstüne değene kadar
  const tepe = r.top - kk.top + r.height * 0.55 - boy + boy * 0.07;
  const uza = Math.max(30, tepe - 6);
  const boyunH = boy * 0.1;
  ses.uza();
  const ms = sure(700);
  const egri = 'cubic-bezier(.5,0,.75,0)';
  const a1 = bas.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-uza}px)` }], { duration: ms, easing: egri, fill: 'forwards' });
  const a2 = boyun.animate([{ transform: 'scaleY(1)' }, { transform: `scaleY(${(boyunH + uza) / boyunH})` }], { duration: ms, easing: egri, fill: 'forwards' });
  await Promise.all([a1.finished.catch(() => undefined), a2.finished.catch(() => undefined)]);
  // tok!
  ses.tok();
  o.efekt.sars(5);
  const [bx] = o.efekt.merkez(bas, 0.38, 0.1);
  o.efekt.yildizlar(bx, 18);
  void bas.animate([{ transform: `translateY(${-uza}px)` }, { transform: `translateY(${-uza + 14}px) rotate(-6deg)`, offset: 0.3 }, { transform: `translateY(${-uza + 6}px) rotate(4deg)`, offset: 0.6 }, { transform: `translateY(${-uza + 8}px)` }], { duration: sure(500), fill: 'forwards' });
  await o.oy.soyle(KT.zurafa_sigmam, 'kart', KART_TON.zurafa);
  // boyun kısalır, zürafa karta geri girer
  bas.getAnimations().forEach((a) => a.cancel());
  a2.cancel();
  await z.animate([{ transform: 'translate(-50%, -100%) scale(1)', opacity: 1 }, { transform: 'translate(-50%, -100%) scale(0.2)', opacity: 0 }], { duration: sure(300), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
  z.remove();
}

/** Ördek: karttan çıkar, paytak paytak sallanır, ayaklarını açar: "Benim ayağım perdeli. Vak!" */
async function ordek(o: SorguSecenek, k: HTMLElement, sahnecik: HTMLElement) {
  const url = resim('ordek');
  if (!url) {
    ses.vak();
    await o.oy.soyle(KT.ordek, 'kart', KART_TON.ordek);
    return;
  }
  const r = k.getBoundingClientRect();
  const kk = o.kok.getBoundingClientRect();
  const boy = r.height * 1.05;
  const d = h('div.dd-ordek', { style: `left:${r.left - kk.left + r.width / 2}px;top:${r.top - kk.top + r.height * 0.5}px;width:${boy}px;height:${boy}px` }, h('img', { src: url, alt: '', draggable: 'false' }));
  sahnecik.append(d);
  ses.pop();
  await d.animate([{ transform: 'translate(-50%, -100%) scale(0.2)', opacity: 0 }, { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 }], { duration: sure(380), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' }).finished.catch(() => undefined);
  const img = d.querySelector('img')!;
  if (!AZ_HAREKET) void img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg) translateX(-6%)' }, { transform: 'rotate(9deg) translateX(6%)' }, { transform: 'rotate(0)' }], { duration: sure(520), iterations: 4, easing: 'ease-in-out' });
  ses.vak();
  setTimeout(() => !o.kapandi() && ses.vak(), sure(900));
  await o.oy.soyle(KT.ordek, 'kart', KART_TON.ordek);
  await d.animate([{ transform: 'translate(-50%, -100%) scale(1)', opacity: 1 }, { transform: 'translate(-50%, -100%) scale(0.2)', opacity: 0 }], { duration: sure(280), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
  d.remove();
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
