/**
 * Dedektif Mino açılışı ve "Vaka Dosyam" (albüm).
 * Açılış: çalışma odası, dedektif şapkalı ve büyüteçli Mino, masada vaka dosyası (Vaka 1: Devrilen Lamba); dosyaya ya
 * da büyük oynat düğmesine dokununca vaka başlar. Çözülmüş vakanın üstünde "Çözüldü!" mührü.
 * Vaka Dosyam: çözülen vakaların çizgi romanları (kapakta Pamuk'un özür dileyen yüzü); dokununca roman açılır ve Mino
 * hikâyeyi bir kez daha okur. Sonraki vakalar "Yakında".
 */
import D from '../../content/dedektif.json';
import { efekt } from '../../src/audio/ses';
import { Karakter } from '../../src/karakter/karakter';
import { Mino } from '../../src/mino/mino';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { h } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import { konus } from '../../src/audio/ses';
import { kayit } from './kayit';
import { M } from './mantik';
import { filmKatmani, resim } from './resimler';
import { kareleriGetir, romanKur, sirayla } from './roman';
import { ses } from './sesler';

const oda = () =>
  h(
    'div.dd-acilis-oda',
    { 'aria-hidden': 'true' },
    ...(['arka-uzak', 'arka-orta', 'arka-on'] as const).map((ad) => h('img', { src: filmKatmani('ev', ad), alt: '', draggable: 'false' })),
  );

function sesKucuk() {
  const s = sesDugmesi();
  s.classList.add('kucuk');
  return s;
}

/** Vaka 1'in dosyası (kraft klasör, fotoğraf ataşlı) */
function vakaDosyasi(cozuldu: boolean, tik: () => void): HTMLElement {
  const b = h(
    'button.dd-klasor',
    { type: 'button', 'aria-label': D.vaka, 'data-vaka': 'vaka1' },
    h('span.dd-klasor-sekme', {}, '1'),
    h('span.dd-klasor-foto', {}, h('img', { src: resim('lamba-devrik') ?? '', alt: '', draggable: 'false' }), h('i.dd-atac')),
    h('img.dd-klasor-iz', { src: resim('kart-kedi-pati-izi') ?? '', alt: '', draggable: 'false' }),
    h('span.dd-klasor-ad', {}, D.vaka.replace(/^Vaka 1:\s*/, '')),
    h('span.dd-oynat', { html: IKON.oyna }),
    cozuldu ? h('span.dd-muhur.dd-muhur-kucuk.bas', {}, D.yazi.cozuldu) : null,
  );
  b.addEventListener('click', () => {
    efekt.dokunma();
    tik();
  });
  return b;
}

export function acilisEkrani(app: Uygulama): Ekran {
  const mino = new Mino();
  const kino = new Karakter('kino', h('div'));
  void mino.dedektif({ sapka: true, buyutec: true });
  const cikis = app.secenekler.cikis;
  const geri = cikis ? yuvarlakDugme(IKON.geri, 'Minkino’ya dön', () => cikis(), 'kucuk') : h('div', { style: 'width:56px' });
  const dosyaD = yuvarlakDugme(IKON.album, D.yazi.dosya, () => app.git('dosya'), 'kucuk dd-dosya-dugme');
  if (kayit.cozulen.length) dosyaD.append(h('span.rozet', {}, String(kayit.cozulen.length)));
  const basla = () => {
    ses.vaka();
    app.git('vaka', { adim: 'giris' });
  };
  const el = h(
    'div.dd-acilis',
    {},
    oda(),
    h('div.dd-acilis-los'),
    h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.baslik)), h('div.dd-ust-sag', {}, dosyaD, sesKucuk())),
    h('div.dd-acilis-sahne', {}, h('div.dd-acilis-mino', {}, mino.el), h('div.dd-acilis-kino', {}, kino.el), vakaDosyasi(kayit.cozulen.includes('vaka1'), basla)),
  );
  mino.el.addEventListener('pointerdown', () => {
    mino.tepki('gidik');
    efekt.dokunma();
  });
  // açılışta Mino selam verir (ses ilk dokunuştan sonra açılır; açılmadıysa sessiz geçer)
  const z = window.setTimeout(() => {
    mino.tepki('selam');
    void konus(M.selam);
  }, 600);
  return {
    el,
    kapat: () => {
      clearTimeout(z);
      mino.kapat();
      kino.kapat();
    },
  };
}

/** Vaka Dosyam: çözülen vakalar (çizgi roman), sonrakiler yakında */
export function dosyaEkrani(app: Uygulama): Ekran {
  const kapatilacak: (() => void)[] = [];
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis'), 'kucuk');
  const cozuldu = kayit.cozulen.includes('vaka1');
  const kartlar: HTMLElement[] = [];
  // Vaka 1: kapakta Pamuk'un özür dileyen yüzü
  if (cozuldu) {
    const pamuk = new Karakter('pamuk', h('img', { src: resim('pamuk-b') ?? '', alt: '', draggable: 'false' }));
    pamuk.ifade('utanmis');
    kapatilacak.push(() => pamuk.kapat());
    const k = h(
      'button.dd-vaka-kart.dd-cozulmus',
      { type: 'button', 'data-vaka': 'vaka1', 'aria-label': D.vaka },
      h('span.dd-vk-kapak', {}, h('span.dd-vk-pamuk', {}, pamuk.el)),
      h('span.dd-vk-ad', {}, D.vaka),
      h('span.dd-muhur.dd-muhur-kucuk.bas', {}, D.yazi.cozuldu),
    );
    k.addEventListener('click', () => {
      efekt.dokunma();
      romanAc();
    });
    kartlar.push(k);
  } else {
    const k = h('button.dd-vaka-kart.dd-bos', { type: 'button', 'data-vaka': 'vaka1', 'aria-label': D.vaka }, h('span.dd-vk-kapak', {}, h('b', {}, '?')), h('span.dd-vk-ad', {}, D.vaka));
    k.addEventListener('click', () => app.git('vaka', { adim: 'giris' }));
    kartlar.push(k);
  }
  for (const n of [2, 3]) kartlar.push(h('div.dd-vaka-kart.dd-yakinda', { 'aria-label': D.yazi.yakinda }, h('span.dd-vk-kapak', {}, h('b', {}, '?')), h('span.dd-vk-ad', {}, `Vaka ${n}`), h('span.dd-vk-yakinda', {}, D.yazi.yakinda)));
  const el = h('div.dd-dosya-ekran', {}, oda(), h('div.dd-acilis-los'), h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.yazi.dosya)), h('div.dd-ust-sag', {}, sesKucuk())), h('div.dd-vaka-izgara', {}, ...kartlar));

  function romanAc() {
    const r = romanKur();
    r.muhur.classList.add('bas');
    el.append(r.el);
    const kapat = h('button.dd-roman-dugme.dd-rd-kapat', { type: 'button' }, h('span.dd-rd-ikon', { html: IKON.kapat }), h('span', {}, D.yazi.dosya));
    kapat.addEventListener('click', () => {
      efekt.dokunma();
      r.el.remove();
    });
    r.alt.append(kapat);
    r.alt.classList.add('acik');
    void kareleriGetir(r, [], (i) => ses.kare(i)).then(() => {
      const dur = sirayla(r, 5200);
      void konus(M.hikaye).then(dur);
    });
  }
  return { el, kapat: () => kapatilacak.forEach((f) => f()) };
}
