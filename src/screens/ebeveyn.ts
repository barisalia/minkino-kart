import { ayarDegistir, efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { albumKartlari, TEMALAR } from '../engine/katalog';
import { durum, kaydetDurum, sifirla } from '../engine/ilerleme';
import { YASLAR, type Yas } from '../engine/types';
import { h, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { sinifOynat } from '../ui/hareket';
import { yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';

const SURUM = '0.1.0';

/** Ebeveyn kapısı: basit bir toplama sorusu (ör. 12 + 7). Doğruysa true. */
export function ebeveynKapisi(app: Uygulama): Promise<boolean> {
  return new Promise((coz) => {
    const a = 11 + Math.floor(Math.random() * 9);
    const b = 3 + Math.floor(Math.random() * 7);
    let girdi = '';
    const cevap = h('div.kapi-cevap', { 'aria-live': 'polite' }, '');
    const tuslar = h('div.tus-takimi');
    const bitir = (sonuc: boolean) => {
      perde.remove();
      coz(sonuc);
    };
    const kontrol = () => {
      if (Number(girdi) === a + b) {
        efekt.dogru();
        bitir(true);
      } else {
        efekt.yanlis();
        void sinifOynat(cevap, 'hata', 400);
        void konus(metin('ebeveyn_yanlis'));
        girdi = '';
        cevap.textContent = '';
      }
    };
    const tus = (etiket: string | Node, fn: () => void, sinif = '') => {
      const t = h(`button.tus${sinif}`, { type: 'button', 'aria-label': typeof etiket === 'string' ? etiket : 'sil' }, etiket);
      t.addEventListener('click', () => {
        efekt.dokunma();
        fn();
      });
      tuslar.append(t);
    };
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      tus(String(n), () => {
        if (girdi.length < 3) girdi += n;
        cevap.textContent = girdi;
      });
    }
    tus(svg(IKON.sil), () => {
      girdi = girdi.slice(0, -1);
      cevap.textContent = girdi;
    });
    tus('0', () => {
      if (girdi.length < 3) girdi += '0';
      cevap.textContent = girdi;
    });
    tus(svg(IKON.onay), kontrol, '.tamam');

    const kapat = yuvarlakDugme(IKON.kapat, 'Kapat', () => bitir(false), 'kucuk kapat-dugme');
    const perde = h(
      'div.perde',
      { role: 'dialog', 'aria-label': 'Ebeveyn kapısı' },
      h(
        'div.pencere.ebeveyn-kapisi',
        {},
        kapat,
        h('h2', {}, 'Ebeveyn Köşesi'),
        h('p', {}, 'Devam etmek için soruyu yanıtlayın.'),
        h('div.kapi-soru', { 'data-toplam': TEST_ICIN(a + b) }, `${a} + ${b} = ?`),
        cevap,
        tuslar,
      ),
    );
    perde.addEventListener('click', (e) => e.target === perde && bitir(false));
    app.kok.append(perde);
    void konus(metin('ebeveyn'));
  });
}

// Uçtan uca testlerin kapıyı geçebilmesi için (yalnızca ?test=1 modunda görünür)
function TEST_ICIN(n: number): string | undefined {
  return new URLSearchParams(location.search).has('test') ? String(n) : undefined;
}

function anahtar(acik: boolean, fn: (v: boolean) => void, etiket: string): HTMLButtonElement {
  const b = h('button.anahtar', { type: 'button', role: 'switch', 'aria-label': etiket, 'aria-checked': String(acik) });
  b.classList.toggle('acik', acik);
  b.addEventListener('click', () => {
    acik = !acik;
    b.classList.toggle('acik', acik);
    b.setAttribute('aria-checked', String(acik));
    efekt.dokunma();
    fn(acik);
  });
  return b;
}

export function ebeveynEkrani(app: Uygulama): Ekran {
  const i = durum.i;

  // Yaş
  const yasSec = h('div.bolumlu', { role: 'radiogroup', 'aria-label': 'Çocuğun yaşı' });
  YASLAR.forEach((y) => {
    const b = h('button', { type: 'button', role: 'radio', 'data-yas': y, 'aria-checked': String(i.yas === y) }, `${y}`);
    b.classList.toggle('secili', i.yas === y);
    b.addEventListener('click', () => {
      i.yas = y as Yas;
      kaydetDurum();
      efekt.secim();
      [...yasSec.children].forEach((c) => {
        c.classList.toggle('secili', c === b);
        c.setAttribute('aria-checked', String(c === b));
      });
    });
    yasSec.append(b);
  });

  // Ses
  const a = i.ayarlar;
  const seviye = h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(a.seviye), 'aria-label': 'Ses seviyesi' }) as HTMLInputElement;
  seviye.addEventListener('input', () => ayarDegistir({ seviye: Number(seviye.value) }));

  // İlerleme
  const toplamKart = TEMALAR.reduce((t, tm) => t + albumKartlari(tm.id).length, 0);
  const ilerleme = h(
    'div',
    {},
    h(
      'div.ozet',
      {},
      h('div', {}, h('b', {}, String(i.album.length)), h('small', {}, `/ ${toplamKart} kart`)),
      h('div', {}, h('b', {}, String(i.toplamYildiz)), h('small', {}, 'yıldız')),
      h('div', {}, h('b', {}, String(i.turSayisi)), h('small', {}, 'tur')),
    ),
    ...TEMALAR.map((t) => {
      const kartlar = albumKartlari(t.id);
      const alinan = kartlar.filter((k) => i.album.includes(k.id)).length;
      return h(
        'div.ilerleme-satir',
        { style: `--r:${t.renk}` },
        h('span', {}, t.ad),
        h('small', {}, `${alinan}/${kartlar.length}`),
        h('div.cubuk', {}, h('i', { style: `width:${(alinan / Math.max(1, kartlar.length)) * 100}%` })),
      );
    }),
  );

  const sifirlaDugme = h('button.ince-dugme.tehlike', { type: 'button' }, 'İlerlemeyi sıfırla');
  let onay = false;
  sifirlaDugme.addEventListener('click', () => {
    if (!onay) {
      onay = true;
      sifirlaDugme.textContent = 'Emin misiniz? Tekrar dokunun';
      setTimeout(() => {
        onay = false;
        sifirlaDugme.textContent = 'İlerlemeyi sıfırla';
      }, 4000);
      return;
    }
    const ayarlar = durum.i.ayarlar;
    durum.i = sifirla();
    durum.i.ayarlar = ayarlar;
    kaydetDurum();
    app.git('acilis');
  });

  const cikis = app.secenekler.cikis;
  const el = h(
    'div.ebeveyn',
    {},
    h(
      'div.ust-cubuk',
      {},
      yuvarlakDugme(IKON.geri, 'Geri', () => app.git(durum.i.yas ? 'temalar' : 'acilis')),
      h('div.orta', {}, h('h1', {}, 'Ebeveyn Köşesi')),
      h('div', { style: 'width:72px' }),
    ),
    h(
      'div.kaydir',
      {},
      h('section.panel', {}, h('h2', {}, 'Çocuğun yaşı'), yasSec, h('p', { style: 'font-size:.9rem;opacity:.75' }, 'Sorular, seçenek sayısı ve oyun türleri yaşa göre ayarlanır.')),
      h(
        'section.panel',
        {},
        h('h2', {}, 'Ses'),
        h('div.satir', {}, h('span', {}, 'Müzik'), anahtar(a.muzik, (v) => ayarDegistir({ muzik: v }), 'Müzik')),
        h('div.satir', {}, h('span', {}, 'Ses efektleri'), anahtar(a.efekt, (v) => ayarDegistir({ efekt: v }), 'Ses efektleri')),
        h('div.satir', {}, h('span', {}, 'Sesli anlatım'), anahtar(a.konusma, (v) => ayarDegistir({ konusma: v }), 'Sesli anlatım')),
        h('div.satir', {}, h('span', {}, 'Ses seviyesi'), seviye),
      ),
      h('section.panel', {}, h('h2', {}, 'İlerleme'), ilerleme),
      h(
        'section.panel.premium',
        {},
        h('h2', {}, svg(IKON.tac), 'Minkino Premium ', h('span.etiket', {}, 'Yakında')),
        h('p', {}, 'Tek abonelikle Minkino’nun tüm eğitici oyunları ve kart paketleri.'),
        h('ul', {}, h('li', {}, 'Tüm kart paketleri ve yaş seviyeleri'), h('li', {}, 'Düzenli eklenen yeni oyunlar ve paketler'), h('li', {}, 'Reklamsız, güvenli, çevrimdışı oyun')),
        h('button.dugme', { type: 'button', disabled: true }, 'Aboneliği başlat'),
      ),
      h(
        'section.panel',
        {},
        h('h2', {}, 'Gizlilik ve güvenlik'),
        h('p', {}, 'Reklam yok. Dış bağlantı yok. Çocuğunuzdan hiçbir veri toplanmaz; ilerleme yalnızca bu cihazda saklanır. İnternet bağlantısı gerekmez.'),
      ),
      h('section.panel', {}, h('h2', {}, 'Veriler'), sifirlaDugme, cikis ? h('button.ince-dugme', { type: 'button', style: 'margin-left:8px', onclick: () => cikis() }, 'Minkino’ya dön') : null),
      h('div.dipnot', {}, `Minkino Kartlar · sürüm ${SURUM}`),
    ),
  );
  return { el };
}
