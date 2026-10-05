/**
 * Dedektif Mino açılışı (vaka seçimi) ve "Vaka Dosyam" (albüm).
 * Açılış: çalışma odası, dedektif şapkalı ve büyüteçli Mino, masada iki vaka dosyası: Vaka 1 "Devrilen Lamba" ve
 * Vaka 2 "Kino'nun Kayıp Atkısı" (Vaka 1 çözülünce açılır; kapalıyken üstünde kilit, dokununca Mino "Önce ilk vakayı
 * çözelim!" der, Vaka 1'in dosyası parlar). Her dosyanın kendi kapak fotoğrafı; çözülmüşün üstünde "Çözüldü!" mührü.
 * Vaka Dosyam: çözülen vakaların çizgi romanları (Vaka 1 kapağında Pamuk'un özür dileyen yüzü, Vaka 2'de atkılı
 * yavrular); dokununca roman açılır ve Mino hikâyeyi bir kez daha okur. Sonraki vaka "Yakında".
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
import { oynat } from './efekt';
import { kayit } from './kayit';
import { M } from './mantik';
import { M2, ROMAN2, V2 } from './mantik2';
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

type VakaId = 'vaka1' | 'vaka2';
/** Vaka 2 açık mı: Vaka 1 çözülünce */
export const vaka2Acik = () => kayit.cozulen.includes('vaka1');

interface DosyaKapak {
  id: VakaId;
  no: string;
  ad: string;
  foto: string;
  /** dosyanın köşesindeki küçük ipucu süsü */
  sus: string;
}
const KAPAKLAR: DosyaKapak[] = [
  { id: 'vaka1', no: '1', ad: D.vaka.replace(/^Vaka 1:\s*/, ''), foto: 'lamba-devrik', sus: 'kart-kedi-pati-izi' },
  { id: 'vaka2', no: '2', ad: V2.vaka.replace(/^Vaka 2:\s*/, ''), foto: 'v2/roman-1', sus: 'v2/iplik-kirmizi' },
];

/** Bir vakanın dosyası (kraft klasör, fotoğraf ataşlı) */
function vakaDosyasi(k: DosyaKapak, cozuldu: boolean, kilitli: boolean, tik: () => void): HTMLElement {
  const b = h(
    `button.dd-klasor${kilitli ? '.dd-kilitli' : ''}`,
    { type: 'button', 'aria-label': k.id === 'vaka1' ? D.vaka : V2.vaka, 'data-vaka': k.id },
    h('span.dd-klasor-sekme', {}, k.no),
    h(`span.dd-klasor-foto${k.id === 'vaka2' ? '.dd-foto-genis' : ''}`, {}, h('img', { src: resim(k.foto) ?? '', alt: '', draggable: 'false' }), h('i.dd-atac')),
    h('img.dd-klasor-iz', { src: resim(k.sus) ?? '', alt: '', draggable: 'false' }),
    h('span.dd-klasor-ad', {}, k.ad),
    kilitli ? h('span.dd-kilit', { html: IKON.kilit }) : h('span.dd-oynat', { html: IKON.oyna }),
    kilitli ? h('span.dd-kilit-yazi', {}, V2.yazi.kilitli) : null,
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
  const acik2 = vaka2Acik();
  // Vaka 2 açıksa bahçenin büyük resimleri şimdiden yüklenmeye başlar (vaka açılınca beklemesin)
  if (acik2) for (const b of ['bahce-ip', 'bahce-yol', 'bahce-golet']) new Image().src = resim(`v2/${b}`) ?? '';
  let dosya1: HTMLElement | null = null;
  const dosyalar = KAPAKLAR.map((k) => {
    const kilitli = k.id === 'vaka2' && !acik2;
    const d = vakaDosyasi(k, kayit.cozulen.includes(k.id), kilitli, () => {
      if (kilitli) {
        // kilitli: dosya sallanır, Mino Vaka 1'i gösterir
        oynat(d, 'dd-kilit-salla');
        if (dosya1) oynat(dosya1, 'dd-hatirla');
        mino.tepki('hayir');
        void konus(M2.kilitli);
        return;
      }
      ses.vaka();
      app.git(k.id === 'vaka1' ? 'vaka' : 'vaka2', { adim: 'giris' });
    });
    if (k.id === 'vaka1') dosya1 = d;
    return d;
  });
  const el = h(
    'div.dd-acilis',
    {},
    oda(),
    h('div.dd-acilis-los'),
    h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.baslik)), h('div.dd-ust-sag', {}, dosyaD, sesKucuk())),
    h('div.dd-acilis-sahne', {}, h('div.dd-acilis-mino', {}, mino.el), h('div.dd-acilis-kino', {}, kino.el), h('div.dd-dosyalar', {}, ...dosyalar)),
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

/** Vaka Dosyam: çözülen vakalar (çizgi roman), çözülmeyenler soru işaretli, sonraki yakında */
export function dosyaEkrani(app: Uygulama): Ekran {
  const kapatilacak: (() => void)[] = [];
  const geri = yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis'), 'kucuk');
  const kartlar: HTMLElement[] = [];
  // Vaka 1: kapakta Pamuk'un özür dileyen yüzü
  if (kayit.cozulen.includes('vaka1')) {
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
      romanAc('vaka1');
    });
    kartlar.push(k);
  } else {
    const k = h('button.dd-vaka-kart.dd-bos', { type: 'button', 'data-vaka': 'vaka1', 'aria-label': D.vaka }, h('span.dd-vk-kapak', {}, h('b', {}, '?')), h('span.dd-vk-ad', {}, D.vaka));
    k.addEventListener('click', () => app.git('vaka', { adim: 'giris' }));
    kartlar.push(k);
  }
  // Vaka 2: kapakta atkılı yavrular
  if (kayit.cozulen.includes('vaka2')) {
    const k = h(
      'button.dd-vaka-kart.dd-cozulmus',
      { type: 'button', 'data-vaka': 'vaka2', 'aria-label': V2.vaka },
      h('span.dd-vk-kapak.dd-vk-bahce', {}, h('img.dd-vk-yavru', { src: resim('v2/yavru-atki') ?? '', alt: '', draggable: 'false' })),
      h('span.dd-vk-ad', {}, V2.vaka),
      h('span.dd-muhur.dd-muhur-kucuk.bas', {}, D.yazi.cozuldu),
    );
    k.addEventListener('click', () => {
      efekt.dokunma();
      romanAc('vaka2');
    });
    kartlar.push(k);
  } else {
    const acik = vaka2Acik();
    const k = h(
      `button.dd-vaka-kart.dd-bos${acik ? '' : '.dd-kilitli'}`,
      { type: 'button', 'data-vaka': 'vaka2', 'aria-label': V2.vaka },
      h('span.dd-vk-kapak', {}, acik ? h('b', {}, '?') : h('span.dd-kilit', { html: IKON.kilit })),
      h('span.dd-vk-ad', {}, V2.vaka),
    );
    k.addEventListener('click', () => {
      efekt.dokunma();
      if (acik) app.git('vaka2', { adim: 'giris' });
      else {
        oynat(k, 'dd-kilit-salla');
        void konus(M2.kilitli);
      }
    });
    kartlar.push(k);
  }
  kartlar.push(h('div.dd-vaka-kart.dd-yakinda', { 'aria-label': D.yazi.yakinda }, h('span.dd-vk-kapak', {}, h('b', {}, '?')), h('span.dd-vk-ad', {}, 'Vaka 3'), h('span.dd-vk-yakinda', {}, D.yazi.yakinda)));
  const el = h('div.dd-dosya-ekran', {}, oda(), h('div.dd-acilis-los'), h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.yazi.dosya)), h('div.dd-ust-sag', {}, sesKucuk())), h('div.dd-vaka-izgara', {}, ...kartlar));

  function romanAc(vaka: VakaId) {
    const r = vaka === 'vaka1' ? romanKur() : romanKur(ROMAN2, V2.vaka, 'vaka2');
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
      const dur = sirayla(r, vaka === 'vaka1' ? 5200 : 4200);
      void konus(vaka === 'vaka1' ? M.hikaye : M2.hikaye).then(dur);
    });
  }
  return { el, kapat: () => kapatilacak.forEach((f) => f()) };
}
