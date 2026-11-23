// Matematik · cila katmanı (yönetici, 22 Kasım gecesi: Top Parkuru'nun cilası Matematik'in açık turlarına). Yalnız kod ve ses;
// yeni çizim yok. Dokununca anında yumuşak "pıt" ve küçük basılma; doğruda parıltı tanecikleri; yanlışta yumuşak, komik bir
// "boyoyoy" ve sallanma. Sesler WebAudio'yla o an üretilir (dosya yok, gecikme yok); hareketler yalnız transform ve opaklık.
// Hareketler alttaki dönüşüme eklenir (composite: add): öğenin kendi konumu, ölçüsü ve CSS hareketleri bozulmaz.
import { efektCikisi, sesMotorunuAc } from '../../src/audio/motor';

const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** [gecikme, başlangıç Hz, bitiş Hz, süre, şiddet, dalga, titreşim Hz, titreşim derinliği Hz] */
type Nota = [number, number, number, number, number, OscillatorType, number?, number?];
function cal(notalar: Nota[]) {
  const ctx = sesMotorunuAc(), cikis = efektCikisi();
  if (!ctx || !cikis) return;
  for (const [gecikme, frekans, bitis, sure, siddet, tip, titresim, derinlik] of notalar) {
    const ton = ctx.createOscillator(), seviye = ctx.createGain(), bas = ctx.currentTime + gecikme;
    ton.type = tip;
    ton.frequency.setValueAtTime(frekans, bas);
    ton.frequency.exponentialRampToValueAtTime(bitis, bas + sure);
    seviye.gain.setValueAtTime(0.0001, bas);
    seviye.gain.exponentialRampToValueAtTime(siddet, bas + 0.008);
    seviye.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
    let lfo: OscillatorNode | undefined, lfoKazanc: GainNode | undefined;
    if (titresim && derinlik) {
      lfo = ctx.createOscillator();
      lfoKazanc = ctx.createGain();
      lfo.frequency.value = titresim;
      lfoKazanc.gain.value = derinlik;
      lfo.connect(lfoKazanc).connect(ton.frequency);
      lfo.start(bas);
      lfo.stop(bas + sure);
    }
    ton.connect(seviye).connect(cikis);
    ton.onended = () => { ton.disconnect(); seviye.disconnect(); lfo?.disconnect(); lfoKazanc?.disconnect(); };
    ton.start(bas);
    ton.stop(bas + sure);
  }
}

/** Dokunma: kısa, yumuşak, yukarı kalkan "pıt" (her dokunuşta tekrar edilebilecek kadar hafif). */
export const dokunmaSesi = () => cal([[0, 540, 820, 0.06, 0.05, 'sine'], [0, 1600, 1150, 0.022, 0.012, 'triangle']]);
/** Yanlış: yumuşak, komik "boyoyoy" (iner ve titrer); başında küçük bir "pıt". Kızmaz, güldürür. */
export const komikSes = () => cal([
  [0, 980, 620, 0.035, 0.02, 'triangle'],
  [0.02, 560, 240, 0.42, 0.085, 'sine', 15, 38],
  [0.02, 1120, 480, 0.25, 0.012, 'sine', 15, 70],
]);

/** Kaydıraktan kayış: aşağı kayan, hafif titreyen düdük "vııı" (0,8 sn). */
export const kaymaSesi = () => cal([
  [0, 980, 420, 0.8, 0.045, 'sine', 7, 18],
  [0, 1960, 840, 0.5, 0.008, 'sine'],
]);

/** Basılma: öğe parmağın altında kısa bir an içe göçüp yaylanır (0,22 sn). */
export function dokunmaCanlan(el: Element) {
  if (azHareket()) return;
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.92)', offset: 0.35 }, { transform: 'scale(1.04)', offset: 0.7 }, { transform: 'scale(1)' }],
    { duration: 220, easing: 'ease-out', composite: 'add' },
  );
}
/** Yanlış: öğe "boing" diye ezilip iki yana sallanır (0,48 sn). */
export function komikSalla(el: Element) {
  if (azHareket()) return;
  el.animate(
    [
      { transform: 'rotate(0deg) scale(1, 1)' },
      { transform: 'rotate(-5deg) scale(1.05, 0.93)', offset: 0.2 },
      { transform: 'rotate(4deg) scale(0.97, 1.03)', offset: 0.45 },
      { transform: 'rotate(-2deg) scale(1, 1)', offset: 0.7 },
      { transform: 'rotate(0deg) scale(1, 1)' },
    ],
    { duration: 480, easing: 'ease-out', composite: 'add' },
  );
}

/**
 * Astra'nın efekt kareleri (Paket Matematik-A1 → assets/matematik/efekt/): doğruda yıldız patlaması (yildiz-0…2), yanlışta komik
 * pof bulutu (pof-0…1), boş dokunuşta pırıltı (nokta-0…1). Gelene dek eski tanecikler sürer; gelince onların yerine kare oynar.
 */
const efektKareleri = import.meta.glob<string>('../../assets/matematik/efekt/*.webp', { eager: true, query: '?url', import: 'default' });
function efektDizi(ad: string, n: number): string[] {
  const a = Array.from({ length: n }, (_, i) => efektKareleri['../../assets/matematik/efekt/' + ad + '-' + i + '.webp']);
  return a.every(Boolean) ? (a as string[]) : [];
}
export const EFEKT = { yildiz: efektDizi('yildiz', 3), pof: efektDizi('pof', 2), nokta: efektDizi('nokta', 2) };
for (const u of [...EFEKT.yildiz, ...EFEKT.pof, ...EFEKT.nokta]) { const on = new Image(); on.src = u; void on.decode?.().catch(() => undefined); }
/** Kare efekti: (x, y) ortasında `boy` piksellik kutuda kareler sırayla bir kez oynar, sonra kendini siler. */
function kareEfekti(kok: HTMLElement, x: number, y: number, boy: number, kareler: string[], ms = 95) {
  const e = document.createElement('div');
  e.className = 'cila-efekt';
  e.setAttribute('aria-hidden', 'true');
  e.style.cssText = 'position:absolute;pointer-events:none;z-index:30;left:' + (x - boy / 2) + 'px;top:' + (y - boy / 2) + 'px;width:' + boy + 'px;height:' + boy + 'px';
  const resim = document.createElement('img');
  resim.alt = '';
  resim.draggable = false;
  resim.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
  resim.src = kareler[0];
  e.append(resim);
  kok.append(e);
  kareler.forEach((u, i) => { if (i) setTimeout(() => { resim.src = u; }, i * ms); });
  setTimeout(() => e.remove(), kareler.length * ms + 40);
}
/** Öğenin sahnedeki ortası ve ölçeği (kök ölçeklenmiş olabilir). */
function ortasi(kok: HTMLElement, el: Element) {
  const k = kok.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (!k.width || !r.width) return null;
  const olcek = k.width / (kok.offsetWidth || k.width);
  return { x: (r.left + r.width / 2 - k.left) / olcek, y: (r.top + r.height / 2 - k.top) / olcek, boy: Math.max(r.width, r.height) / olcek };
}
/** Yanlış: öğenin üstünde komik pof bulutu (kareler gelince; yoksa yalnız sallanma). */
export function pofEfekti(kok: HTMLElement, el: Element) {
  if (azHareket() || !EFEKT.pof.length || !el.isConnected) return;
  const o = ortasi(kok, el);
  if (o) kareEfekti(kok, o.x, o.y, Math.min(260, Math.max(110, o.boy * 1.3)), EFEKT.pof, 120);
}

/** Doğru: öğenin ortasından dışa saçılan küçük altın yıldız ve pırıltılar (0,6 sn; sahnede iz bırakmaz). */
export function parilti(kok: HTMLElement, el: Element, adet = 7) {
  if (azHareket() || !el.isConnected) return;
  const k = kok.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (!k.width || !r.width) return;
  const olcek = k.width / (kok.offsetWidth || k.width);
  const x = (r.left + r.width / 2 - k.left) / olcek, y = (r.top + r.height / 2 - k.top) / olcek;
  // Tanecikler öğenin boyuna göre açılır (küçük benekte dar, büyük kartta geniş).
  const yaricap = Math.min(110, Math.max(44, Math.max(r.width, r.height) / olcek * 0.62));
  // Astra'nın yıldız patlaması geldiyse tanecikler yerine o (boş dokunuşun küçük pırıltısı da kendi karesiyle).
  if (adet <= 5 && EFEKT.nokta.length) { kareEfekti(kok, x, y, 96, EFEKT.nokta, 90); return; }
  // Doğruda (büyük patlama) önce öğenin arkasından sıcak bir ışık halkası açılır.
  if (adet > 5) isikHalkasi(kok, x, y, yaricap * 2.2);
  if (EFEKT.yildiz.length) { kareEfekti(kok, x, y, yaricap * 2.6, EFEKT.yildiz); return; }
  const bas = Math.random() * Math.PI * 2;
  for (let i = 0; i < adet; i++) {
    const p = document.createElement('i');
    // Yazı karakteri yıldız yok (denetim 23 Kasım): CSS ile çizilmiş parlak beş köşe ya da ışık noktası.
    p.className = 'cila-parilti' + (i % 3 === 2 ? ' nokta' : ' yildiz');
    p.setAttribute('aria-hidden', 'true');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    kok.append(p);
    const a = bas + (i / adet) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const d = yaricap * (0.75 + Math.random() * 0.35);
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
    const anim = p.animate(
      [
        { transform: 'translate(-50%, -50%) translate(0, 0) scale(0.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-50%, -50%) translate(' + dx * 0.7 + 'px, ' + dy * 0.7 + 'px) scale(1.1) rotate(40deg)', opacity: 1, offset: 0.55 },
        { transform: 'translate(-50%, -50%) translate(' + dx + 'px, ' + dy + 'px) scale(0.5) rotate(70deg)', opacity: 0 },
      ],
      { duration: 560 + Math.random() * 120, easing: 'cubic-bezier(.2,.7,.3,1)' },
    );
    anim.onfinish = anim.oncancel = () => p.remove();
  }
}

/** Doğrunun ışık halkası: öğenin ortasından açılıp sönen sıcak, yumuşak bir parıltı (0,55 sn). */
function isikHalkasi(kok: HTMLElement, x: number, y: number, cap: number) {
  const h = document.createElement('i');
  h.className = 'cila-isik';
  h.setAttribute('aria-hidden', 'true');
  h.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + cap + 'px;height:' + cap + 'px';
  kok.append(h);
  const a = h.animate([{ transform: 'translate(-50%, -50%) scale(.3)', opacity: 0.95 }, { transform: 'translate(-50%, -50%) scale(1.45)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)' });
  a.onfinish = a.oncancel = () => h.remove();
}

/** Boş yere dokunuş: parmağın değdiği noktada küçük pırıltı (ekran pikseli). */
export function pariltiNokta(kok: HTMLElement, x: number, y: number) {
  const k = kok.getBoundingClientRect();
  const nokta = document.createElement('i');
  nokta.style.cssText = 'position:absolute;width:1px;height:1px;left:' + (x - k.left) + 'px;top:' + (y - k.top) + 'px;pointer-events:none';
  kok.append(nokta);
  parilti(kok, nokta, 5);
  nokta.remove();
}
/** Karakter küçük bir hop yapar (alttaki konumu ve CSS hareketlerini bozmadan). */
export function zipla(el: Element) {
  if (azHareket()) return;
  el.animate(
    [{ transform: 'translate(0, 0)' }, { transform: 'translate(0, -5%)', offset: 0.4 }, { transform: 'translate(0, 0)', offset: 0.75 }, { transform: 'translate(0, -1%)', offset: 0.88 }, { transform: 'translate(0, 0)' }],
    { duration: 420, easing: 'ease-out', composite: 'add' },
  );
}

/** Ceren'in kısa övgüleri (sozler.json; 318 "Evet!", 358–363) ve yanlışta ipucunun yerine geçen yumuşak sözleri (364–367). */
export const OVGULER: readonly number[] = [318, 358, 359, 360, 361, 362, 363];
export const YANLIS_YEDEK: readonly number[] = [364, 365, 366, 367];
/** Havuzdan, son ikisinden farklı bir söz seçer (art arda aynı söz olmaz). */
export function sec<T>(havuz: readonly T[], son: T[]): T {
  const uygun = havuz.filter((x) => !son.slice(-2).includes(x));
  const x = (uygun.length ? uygun : havuz)[Math.floor(Math.random() * (uygun.length || havuz.length))];
  son.push(x);
  if (son.length > 4) son.shift();
  return x;
}
