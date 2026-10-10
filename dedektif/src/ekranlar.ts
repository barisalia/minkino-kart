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
import { M3, ROMAN3, V3, vaka3Gorunur } from './mantik3';
import { hazirla3 } from './resimler3';
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

type VakaId = 'vaka1' | 'vaka2' | 'vaka3';
/** Vaka 2 açık mı: Vaka 1 çözülünce */
export const vaka2Acik = () => kayit.cozulen.includes('vaka1');
/** Vaka 3 açık mı: Vaka 2 çözülünce (görünmesi ayrıca mantik3.ts → vaka3Gorunur: yayın bayrağı ya da ?vaka3=1) */
export const vaka3Acik = () => kayit.cozulen.includes('vaka2');
const VAKA_ADI: Record<VakaId, string> = { vaka1: D.vaka, vaka2: V2.vaka, vaka3: V3.vaka };
const EKRAN: Record<VakaId, string> = { vaka1: 'vaka', vaka2: 'vaka2', vaka3: 'vaka3' };
/** Vaka 3'ün görselleri (yer tutucular tarayıcıda kurulur): img hazır olunca yerine konur */
function sonraYukle(i: HTMLImageElement, ad: string) {
  const u = resim(ad);
  if (u) i.src = u;
  else void hazirla3().then(() => (i.src = resim(ad) ?? ''));
}

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
  { id: 'vaka3', no: '3', ad: V3.vaka.replace(/^Vaka 3:\s*/, ''), foto: 'v3/kapak', sus: 'v3/palamut' },
];

/** Bir vakanın dosyası (kraft klasör, fotoğraf ataşlı) */
function vakaDosyasi(k: DosyaKapak, cozuldu: boolean, kilitli: boolean, tik: () => void): HTMLElement {
  const b = h(
    `button.dd-klasor${kilitli ? '.dd-kilitli' : ''}`,
    { type: 'button', 'aria-label': VAKA_ADI[k.id], 'data-vaka': k.id },
    h('span.dd-klasor-sekme', {}, k.no),
    h(`span.dd-klasor-foto${k.id !== 'vaka1' ? '.dd-foto-genis' : ''}`, {}, h('img', { alt: '', draggable: 'false' }), h('i.dd-atac')),
    h('img.dd-klasor-iz', { alt: '', draggable: 'false' }),
    h('span.dd-klasor-ad', {}, k.ad),
    kilitli ? h('span.dd-kilit', { html: IKON.kilit }) : h('span.dd-oynat', { html: IKON.oyna }),
    kilitli ? h('span.dd-kilit-yazi', {}, k.id === 'vaka3' ? V3.yazi.kilitli : V2.yazi.kilitli) : null,
    cozuldu ? h('span.dd-muhur.dd-muhur-kucuk.bas', {}, D.yazi.cozuldu) : null,
  );
  sonraYukle(b.querySelector<HTMLImageElement>('.dd-klasor-foto img')!, k.foto);
  sonraYukle(b.querySelector<HTMLImageElement>('img.dd-klasor-iz')!, k.sus);
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
  const once: Partial<Record<VakaId, HTMLElement>> = {};
  // Vaka 3 henüz yayında değil: yalnız bayrak ya da adres (?vaka3=1) açıksa üçüncü dosya görünür
  const gorunen = KAPAKLAR.filter((k) => k.id !== 'vaka3' || vaka3Gorunur());
  const dosyalar = gorunen.map((k) => {
    const kilitli = (k.id === 'vaka2' && !acik2) || (k.id === 'vaka3' && !vaka3Acik());
    const d = vakaDosyasi(k, kayit.cozulen.includes(k.id), kilitli, () => {
      if (kilitli) {
        // kilitli: dosya sallanır, Mino bir önceki vakayı gösterir
        oynat(d, 'dd-kilit-salla');
        oynat(once[k.id === 'vaka3' ? 'vaka2' : 'vaka1'], 'dd-hatirla');
        mino.tepki('hayir');
        void konus(k.id === 'vaka3' ? M3.kilitli : M2.kilitli);
        return;
      }
      ses.vaka();
      app.git(EKRAN[k.id], { adim: 'giris' });
    });
    once[k.id] = d;
    return d;
  });
  const el = h(
    'div.dd-acilis',
    {},
    oda(),
    h('div.dd-acilis-los'),
    h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.baslik)), h('div.dd-ust-sag', {}, dosyaD, sesKucuk())),
    h('div.dd-acilis-sahne', {}, h('div.dd-acilis-mino', {}, mino.el), h('div.dd-acilis-kino', {}, kino.el), h(`div.dd-dosyalar${dosyalar.length > 2 ? '.dd-uc' : ''}`, {}, ...dosyalar)),
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
  // Vaka 3 (görünürse): kapakta yanakları şiş Fındık
  if (vaka3Gorunur()) {
    if (kayit.cozulen.includes('vaka3')) {
      const resimEl = h('img.dd-vk-yavru', { alt: '', draggable: 'false' }) as HTMLImageElement;
      sonraYukle(resimEl, 'v3/findik-yanak');
      const k = h('button.dd-vaka-kart.dd-cozulmus', { type: 'button', 'data-vaka': 'vaka3', 'aria-label': V3.vaka }, h('span.dd-vk-kapak.dd-vk-agac', {}, resimEl), h('span.dd-vk-ad', {}, V3.vaka), h('span.dd-muhur.dd-muhur-kucuk.bas', {}, D.yazi.cozuldu));
      k.addEventListener('click', () => {
        efekt.dokunma();
        void romanAc3(k);
      });
      kartlar.push(k);
    } else {
      const acik = vaka3Acik();
      const k = h(`button.dd-vaka-kart.dd-bos${acik ? '' : '.dd-kilitli'}`, { type: 'button', 'data-vaka': 'vaka3', 'aria-label': V3.vaka }, h('span.dd-vk-kapak', {}, acik ? h('b', {}, '?') : h('span.dd-kilit', { html: IKON.kilit })), h('span.dd-vk-ad', {}, V3.vaka));
      k.addEventListener('click', () => {
        efekt.dokunma();
        if (acik) app.git('vaka3', { adim: 'giris' });
        else {
          oynat(k, 'dd-kilit-salla');
          void konus(M3.kilitli);
        }
      });
      kartlar.push(k);
    }
  }
  kartlar.push(h('div.dd-vaka-kart.dd-yakinda', { 'aria-label': D.yazi.yakinda }, h('span.dd-vk-kapak', {}, h('b', {}, '?')), h('span.dd-vk-ad', {}, vaka3Gorunur() ? 'Vaka 4' : 'Vaka 3'), h('span.dd-vk-yakinda', {}, D.yazi.yakinda)));
  const el = h('div.dd-dosya-ekran', {}, oda(), h('div.dd-acilis-los'), h('div.dd-ust', {}, geri, h('h1.dd-baslik', {}, h('span', {}, D.yazi.dosya)), h('div.dd-ust-sag', {}, sesKucuk())), h('div.dd-vaka-izgara', {}, ...kartlar));

  /**
   * Vaka 3'ün romanı: kareler Gemini çizimi (assets/dedektif3/roman-1..4); vakanın tuval bileşimleri (hazirla3) ilk açılışta biraz sürer. Hazır olmadan
   * açılırsa kareler boş kalırdı: o arada kapak "yükleniyor" diye nabız atar, ikinci dokunuş yok sayılır.
   */
  let romanBekliyor = false;
  let kapandi = false;
  kapatilacak.push(() => (kapandi = true));
  async function romanAc3(kart: HTMLElement) {
    if (romanBekliyor) return;
    romanBekliyor = true;
    kart.classList.add('dd-yukleniyor');
    try {
      await hazirla3();
    } finally {
      romanBekliyor = false;
      kart.classList.remove('dd-yukleniyor');
    }
    if (kapandi || el.querySelector('.dd-roman')) return;
    romanAc('vaka3');
  }
  function romanAc(vaka: VakaId) {
    const r = vaka === 'vaka1' ? romanKur() : vaka === 'vaka2' ? romanKur(ROMAN2, V2.vaka, 'vaka2') : romanKur(ROMAN3, V3.vaka, 'vaka3');
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
      void konus(vaka === 'vaka1' ? M.hikaye : vaka === 'vaka2' ? M2.hikaye : M3.hikaye).then(dur);
    });
  }
  return { el, kapat: () => kapatilacak.forEach((f) => f()) };
}
