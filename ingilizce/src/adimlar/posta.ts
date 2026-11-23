/**
 * Polly'nin Postası (Seviye 2): sokakta üç ya da dört ev var; her evin penceresinde dersin bir cümlesinin resmi durur.
 * Polly elindeki mektubu okur ("A small cow."), çocuk mektubu sürükleyip o cümlenin evine götürür (ya da eve dokunur).
 * Doğru evde mektup posta yuvasına girer, ev yanar; yanlış evde o evin cümlesi duyulur ve mektup geri gelir (ceza yok).
 * Teslim edilen ev yanık kalır: oyun bitince sokak ışıl ışıldır.
 *
 * Çizimler (Astra, Paket 11): `oyun/posta-ev-0…3` (pencere saydam), `oyun/zarf`, `kisi/polly-posta-0`. Gelene kadar ev
 * düz bir kart, mektup üstünde cümlesi yazan bir karttır; çizim gelince kendiliğinden yerine oturur.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Ifade } from '../icerik2';
import { gorselCiz } from '../gorsel';
import { cizim, dugme, hareket, ipucuKur, kutla, pozBirak, pozTut, salla } from '../kit';
import { tik } from '../ses';
import { resim } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

/** Parmak bu kadar kaymadan bırakılırsa dokunuş sayılır (mektuba dokunmak cümleyi yeniden okutur) */
const SURUKLEME_ESIGI = 10;

export const postaKur: AdimKurucu<'posta'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0;
  const onaylanan = new Set<string>();
  const mektup = () => a.mektuplar[no];
  const oku = () => { if (!kilit) { tik.dokun(); void y.soyle(mektup().ses); } };
  const { masa } = oyunDuzeni(b.alan, 'ing-posta', oku);

  // ---- mektup: zarf çizimi geldiyse zarf, gelene kadar üstünde cümlesi yazan krem kart
  const zarfCizimi = resim('oyun/zarf');
  const yazi = h('span.ing-zarf-yazi', { lang: 'en-US' });
  const zarf = h('div.ing-zarf', { role: 'button', tabindex: '0', 'aria-label': 'Mektup' }, ...(zarfCizimi ? [cizim('oyun/zarf', 'ing-zarf-cizim')!] : []), yazi);
  if (zarfCizimi) zarf.classList.add('ing-zarf-cizimli');
  const zarfYeri = h('div.ing-zarf-yeri', {}, zarf);

  // ---- evler: pencerede cümlenin resmi; ev çizimi geldiyse resim pencerenin arkasından görünür
  const sokak = h('div.ing-posta-evler', { 'data-adet': a.evler.length });
  const evler = a.evler.map((f, i) => {
    const evCizimi = resim(`oyun/posta-ev-${i % 4}`);
    const pencere = h('span.ing-posta-pencere', {}, gorselCiz(f.g));
    // ev çizimi, pencere ve onay işareti aynı 4:5 iç kutuda durur (düğme dar ya da basık kalsa da pencere evin dışına taşmaz)
    const ic = h('span.ing-posta-ic', {}, pencere, ...(evCizimi ? [cizim(`oyun/posta-ev-${i % 4}`, 'ing-posta-ev-cizim')!] : []), h('span.ing-posta-onay', { 'aria-hidden': 'true' }, '✓'));
    const d = dugme('ing-posta-ev', f.tr, () => void teslim(f, d), ic);
    if (evCizimi) d.classList.add('ing-posta-cizimli');
    d.dataset.ifade = f.id;
    d.style.setProperty('--n', String(i));
    return d;
  });
  sokak.append(...evler);
  masa.append(zarfYeri, h('div.ing-posta-sokak', {}, sokak));
  const dogruEv = () => evler.find((d) => d.dataset.ifade === mektup().id) ?? null;

  // ---- sürükleme: mektup parmağı izler; bırakıldığı yerin altındaki eve gider, ev yoksa yerine döner
  let surukle: { id: number; x: number; y: number; kaydi: boolean } | undefined;
  const altindakiEv = (x: number, yy: number) => evler.find((d) => {
    const r = d.getBoundingClientRect();
    return x >= r.left && x <= r.right && yy >= r.top && yy <= r.bottom;
  });
  const isaretle = (ev?: HTMLElement) => evler.forEach((d) => d.classList.toggle('ing-ustunde', d === ev));
  const geriGel = () => { zarf.style.translate = ''; zarf.classList.remove('ing-tasiniyor'); isaretle(); };
  zarf.addEventListener('pointerdown', (e) => {
    if (kilit || surukle) return;
    surukle = { id: e.pointerId, x: e.clientX, y: e.clientY, kaydi: false };
    zarf.setPointerCapture(e.pointerId);
  });
  zarf.addEventListener('pointermove', (e) => {
    if (!surukle || e.pointerId !== surukle.id) return;
    const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
    if (!surukle.kaydi && Math.hypot(dx, dy) < SURUKLEME_ESIGI) return;
    if (!surukle.kaydi) { surukle.kaydi = true; zarf.classList.add('ing-tasiniyor'); ipucuKur(undefined); tik.sec(); }
    zarf.style.translate = `${dx}px ${dy}px`;
    isaretle(altindakiEv(e.clientX, e.clientY));
  });
  const birak = (e: PointerEvent) => {
    if (!surukle || e.pointerId !== surukle.id) return;
    const { kaydi } = surukle;
    surukle = undefined;
    if (!kaydi) { geriGel(); oku(); return; }
    const ev = altindakiEv(e.clientX, e.clientY);
    const f = ev && a.evler.find((x) => x.id === ev.dataset.ifade);
    if (ev && f) void teslim(f, ev as HTMLButtonElement, true);
    else geriGel();
  };
  zarf.addEventListener('pointerup', birak);
  zarf.addEventListener('pointercancel', (e) => { if (surukle?.id === e.pointerId) { surukle = undefined; geriGel(); } });
  zarf.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oku(); } });

  /** Mektubu eve uçurur (sürüklenmediyse evin üstüne doğru süzülür) */
  async function ucur(ev: HTMLElement) {
    const z = zarf.getBoundingClientRect(), r = ev.getBoundingClientRect();
    const [ox, oy] = (zarf.style.translate || '0px 0px').split(' ').map((s) => parseFloat(s) || 0);
    zarf.classList.add('ing-ucuyor');
    zarf.style.translate = `${ox + r.left + r.width / 2 - (z.left + z.width / 2)}px ${oy + r.top + r.height * 0.72 - (z.top + z.height / 2)}px`;
    await y.dur(420);
  }

  async function mektupGoster() {
    kilit = true; yanlis = 0;
    const m = mektup();
    zarf.classList.remove('ing-ucuyor', 'ing-tasiniyor', 'ing-gitti');
    zarf.style.translate = '';
    yazi.textContent = m.en;
    zarf.setAttribute('aria-label', `Mektup: ${m.en}`);
    zarf.classList.remove('ing-geldi'); void zarf.offsetWidth; zarf.classList.add('ing-geldi');
    if (TEST_MODU) sokak.dataset.hedef = m.id;
    pozBirak('polly');
    if (!(await y.soyle(m.ses))) return;
    // Polly mektubu uzatır (çizimi geldiyse: kisi/polly-posta-0)
    pozTut('polly', 'posta-0');
    kilit = false;
    // ilk mektupta çocuk ne yapacağını görsün: mektup evlere doğru kısa bir dürtü yapar
    if (no === 0) window.setTimeout(() => { if (!kilit && !surukle) zarf.classList.add('ing-durt'); }, 3500);
    ipucuKur(() => (yanlis >= 2 ? dogruEv() : null), 5000);
  }

  async function teslim(f: Ifade, ev: HTMLButtonElement, suruklendi = false) {
    if (kilit) { if (suruklendi) geriGel(); return; }
    kilit = true;
    zarf.classList.remove('ing-durt');
    ipucuKur(undefined);
    const m = mektup();
    if (f.id !== m.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      geriGel();
      salla(ev);
      // yanlış evin cümlesi duyulur, sonra mektup yeniden okunur
      pozBirak('polly');
      if (!(await y.soyle(f.ses, m.ses))) return;
      pozTut('polly', 'posta-0');
      if (yanlis >= 2) dogruEv()?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    isaretle();
    tik.yapis();
    // Polly mektubu uzatır (çizimi geldiyse: kisi/polly-posta-1), mektup eve uçar
    pozTut('polly', 'posta-1');
    await ucur(ev);
    if (!y.acik) return;
    zarf.classList.add('ing-gitti');
    ev.classList.remove('ing-parla');
    ev.classList.add('ing-teslim');
    kutla(ev);
    pozBirak('polly');
    if (no % 2 === 0) void hareket('polly', 'sevin');
    const ilk = !onaylanan.has(m.id);
    onaylanan.add(m.id);
    if (!(await y.soyle('en/g-yes', ...(ilk ? [m.ses] : [])))) return;
    if (!(await y.dur(200))) return;
    no++;
    if (no >= a.mektuplar.length) { b.bitti(); return; }
    void mektupGoster();
  }

  b.tekrarla(oku);
  void (async () => {
    if (!a.mektuplar.length) { b.bitti(); return; }
    if (b.ilkKez('posta') && !(await y.soyle('tr/c-posta-giris'))) return;
    void mektupGoster();
  })();
  return () => { pozBirak('polly'); y.kapat(); };
};
