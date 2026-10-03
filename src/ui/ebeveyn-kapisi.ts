/**
 * Ebeveyn kapısı (mağaza kuralı: satın alma, dış bağlantı ve ayarlar öncesi): rastgele iki basamaklı bir toplama
 * YAZIYLA sorulur ("On dört artı yedi kaç eder?"), sayı tuşlarıyla cevaplanır. Okuma bilmeyen çocuk geçemez.
 * Bütün oyunlarda aynı kapı (Kartlar, ana menü, abonelik).
 */
import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { h, svg, TEST_MODU } from './dom';
import { sinifOynat } from './hareket';
import { IKON } from './ikonlar';
import { yuvarlakDugme } from './ortak';

const BIRLER = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const ONLAR = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];

/** 0-99 arası sayının Türkçe yazılışı: 47 → "kırk yedi" */
export function sayiYazi(n: number): string {
  if (n === 0) return 'sıfır';
  return [ONLAR[Math.floor(n / 10) % 10], BIRLER[n % 10]].filter(Boolean).join(' ');
}

/** Soru: iki basamaklı (11-39) + tek basamaklı (3-9); cevap 14-48 */
export function kapiSorusu(rnd: () => number = Math.random): { a: number; b: number; yazi: string } {
  const a = 11 + Math.floor(rnd() * 29);
  const b = 3 + Math.floor(rnd() * 7);
  const yazi = `${sayiYazi(a)} artı ${sayiYazi(b)} kaç eder?`;
  return { a, b, yazi: yazi.charAt(0).toLocaleUpperCase('tr') + yazi.slice(1) };
}

/** Cevap her zaman iki basamaklı (14-48): en çok iki rakam yazılır */
export const KAPI_BASAMAK = 2;
/** Üst üste bu kadar yanlıştan sonra kapı bir süre dinlenir (rastgele tuşa basan çocuk deneye deneye geçemesin) */
export const KAPI_HAK = 3;

/**
 * Üst üste `yanlis` yanlıştan sonra bekleme (ms): her 3 yanlışta bir, giderek uzar (20, 40, en çok 60 sn); arada 0.
 * Rastgele iki rakam doğru cevabı ~%1 bulur: 3 denemede bir 20+ sn beklemeyle tuşa basarak geçmek ~15 dakika sürer.
 */
export function kapiBeklemesi(yanlis: number): number {
  if (yanlis <= 0 || yanlis % KAPI_HAK) return 0;
  return Math.min(60_000, (yanlis / KAPI_HAK) * 20_000);
}

// kapı kapatılıp yeniden açılınca sayaç sıfırlanmaz (sayfa boyunca); doğru cevapta sıfırlanır
let ustUsteYanlis = 0;
let dinlenmeBitis = 0;
/** Test modunda bekleme kısa (uçtan uca test görebilsin diye 0 değil) */
const bekleme = (ms: number) => (TEST_MODU ? Math.min(ms, 1500) : ms);

/**
 * Kapıyı `kok`un üstünde açar (kok `.mk-kok` içinde olmalı: stiller ana.css'te). Doğru cevapta true,
 * kapatılırsa false. `sesli`: "Anne ve babalar için." kaydı (Kartlar'da vardı) çalınır.
 */
export function ebeveynKapisiAc(kok: HTMLElement, o: { sesli?: boolean } = {}): Promise<boolean> {
  return new Promise((coz) => {
    let soru = kapiSorusu();
    let girdi = '';
    let saat = 0;
    const soruEl = h('div.kapi-soru.yazi', { 'aria-live': 'polite' });
    const soruYaz = () => {
      soruEl.textContent = soru.yazi;
      // uçtan uca testlerin kapıyı geçebilmesi için (yalnız ?test=1)
      if (TEST_MODU) soruEl.dataset.toplam = String(soru.a + soru.b);
    };
    soruYaz();
    // iki kutucuk: kaç rakam yazılacağı belli (sakin, okunaklı)
    const kutular = Array.from({ length: KAPI_BASAMAK }, () => h('span.kapi-kutu'));
    const cevap = h('div.kapi-cevap', { 'aria-live': 'polite', 'aria-label': 'Cevap' }, ...kutular);
    const tuslar = h('div.tus-takimi');
    const not = h('p.kapi-not', { role: 'status' });
    const bitir = (sonuc: boolean) => {
      window.clearInterval(saat);
      perde.remove();
      document.removeEventListener('keydown', klavye);
      coz(sonuc);
    };
    const yaz = (s: string) => {
      girdi = s;
      kutular.forEach((k, i) => {
        k.textContent = girdi[i] ?? '';
        k.classList.toggle('dolu', i < girdi.length);
      });
      cevap.dataset.girdi = girdi;
    };
    /** Dinlenme: tuşlar uyur, geri sayım görünür; bitince yeni soru */
    const dinlen = () => {
      const kalan = () => Math.max(0, Math.ceil((dinlenmeBitis - Date.now()) / 1000));
      const guncelle = () => {
        if (Date.now() >= dinlenmeBitis) {
          window.clearInterval(saat);
          pencere.classList.remove('dinleniyor');
          not.textContent = '';
          soru = kapiSorusu();
          soruYaz();
          return;
        }
        not.textContent = `Biraz bekleyelim… ${kalan()} sn`;
      };
      pencere.classList.add('dinleniyor');
      guncelle();
      window.clearInterval(saat);
      saat = window.setInterval(guncelle, 250);
    };
    const dinleniyor = () => Date.now() < dinlenmeBitis;
    const kontrol = () => {
      if (!girdi || dinleniyor()) return;
      if (Number(girdi) === soru.a + soru.b) {
        ustUsteYanlis = 0;
        efekt.dogru();
        bitir(true);
        return;
      }
      ustUsteYanlis++;
      efekt.hayir();
      // yumuşak sallanma (korkutmayan): yalnız cevap kutusu, küçük
      void sinifOynat(cevap, 'hata', 520);
      if (o.sesli) void konus(metin('ebeveyn_yanlis'));
      // yanlışta yeni soru (tahminle geçilmesin)
      soru = kapiSorusu();
      soruYaz();
      yaz('');
      const ms = kapiBeklemesi(ustUsteYanlis);
      if (ms) {
        dinlenmeBitis = Date.now() + bekleme(ms);
        dinlen();
      } else not.textContent = 'Olmadı, yeni soru geldi.';
    };
    const tus = (etiket: string | Node, fn: () => void, sinif = '', ad?: string) => {
      const t = h(`button.tus${sinif}`, { type: 'button', 'aria-label': ad ?? (typeof etiket === 'string' ? etiket : '') }, etiket);
      t.addEventListener('click', () => {
        if (dinleniyor()) return;
        efekt.dokunma();
        fn();
      });
      tuslar.append(t);
    };
    const rakam = (n: number) => () => {
      if (dinleniyor()) return;
      if (girdi.length < KAPI_BASAMAK) yaz(girdi + n);
      if (not.textContent && !dinleniyor()) not.textContent = '';
    };
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) tus(String(n), rakam(n));
    tus(svg(IKON.sil), () => yaz(girdi.slice(0, -1)), '', 'sil');
    tus('0', rakam(0));
    tus(svg(IKON.onay), kontrol, '.tamam', 'tamam');

    // klavye (büyükler bilgisayarda): rakamlar, silme, Enter, Esc
    const klavye = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) rakam(Number(e.key))();
      else if (e.key === 'Backspace') yaz(girdi.slice(0, -1));
      else if (e.key === 'Enter') kontrol();
      else if (e.key === 'Escape') bitir(false);
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', klavye);

    const kapat = yuvarlakDugme(IKON.kapat, 'Kapat', () => bitir(false), 'kucuk kapat-dugme');
    const pencere = h(
      'div.pencere.ebeveyn-kapisi',
      {},
      kapat,
      h('div.kapi-rozet', { 'aria-hidden': 'true' }, svg(IKON.ebeveyn)),
      h('h2', {}, 'Büyüğünü çağır!'),
      h('p', {}, 'Devam etmek için bu soruyu cevapla:'),
      h('p.kapi-en', { lang: 'en' }, 'For grown-ups: answer to continue'),
      soruEl,
      cevap,
      not,
      tuslar,
    );
    const perde = h('div.perde.kapi-perde', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ebeveyn kapısı' }, pencere);
    perde.addEventListener('click', (e) => e.target === perde && bitir(false));
    kok.append(perde);
    yaz('');
    // önceki açılışta dinlenmeye girildiyse süre bitene kadar sürer
    if (dinleniyor()) dinlen();
    if (o.sesli) void konus(metin('ebeveyn'));
  });
}
