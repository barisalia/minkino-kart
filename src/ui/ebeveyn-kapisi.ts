/**
 * Ebeveyn kapısı (mağaza kuralı: satın alma, dış bağlantı ve ayarlar öncesi): rastgele iki basamaklı bir toplama
 * YAZIYLA sorulur ("On dört artı yedi kaç eder?"), sayı tuşlarıyla cevaplanır. Okuma bilmeyen çocuk geçemez.
 * Bütün oyunlarda aynı kapı (Kartlar, Minik Sanatçı, ana menü, abonelik).
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

/**
 * Kapıyı `kok`un üstünde açar (kok `.mk-kok` içinde olmalı: stiller ana.css'te). Doğru cevapta true,
 * kapatılırsa false. `sesli`: "Anne ve babalar için." kaydı (Kartlar'da vardı) çalınır.
 */
export function ebeveynKapisiAc(kok: HTMLElement, o: { sesli?: boolean } = {}): Promise<boolean> {
  return new Promise((coz) => {
    let soru = kapiSorusu();
    let girdi = '';
    const soruEl = h('div.kapi-soru.yazi', { 'aria-live': 'polite' });
    const soruYaz = () => {
      soruEl.textContent = soru.yazi;
      // uçtan uca testlerin kapıyı geçebilmesi için (yalnız ?test=1)
      if (TEST_MODU) soruEl.dataset.toplam = String(soru.a + soru.b);
    };
    soruYaz();
    const cevap = h('div.kapi-cevap', { 'aria-live': 'polite' }, '');
    const tuslar = h('div.tus-takimi');
    const bitir = (sonuc: boolean) => {
      perde.remove();
      document.removeEventListener('keydown', klavye);
      coz(sonuc);
    };
    const yaz = (s: string) => {
      girdi = s;
      cevap.textContent = girdi;
    };
    const kontrol = () => {
      if (!girdi) return;
      if (Number(girdi) === soru.a + soru.b) {
        efekt.dogru();
        bitir(true);
        return;
      }
      efekt.yanlis();
      void sinifOynat(cevap, 'hata', 400);
      if (o.sesli) void konus(metin('ebeveyn_yanlis'));
      // yanlışta yeni soru (tahminle geçilmesin)
      soru = kapiSorusu();
      soruYaz();
      yaz('');
    };
    const tus = (etiket: string | Node, fn: () => void, sinif = '', ad?: string) => {
      const t = h(`button.tus${sinif}`, { type: 'button', 'aria-label': ad ?? (typeof etiket === 'string' ? etiket : '') }, etiket);
      t.addEventListener('click', () => {
        efekt.dokunma();
        fn();
      });
      tuslar.append(t);
    };
    const rakam = (n: number) => () => {
      if (girdi.length < 3) yaz(girdi + n);
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
    const perde = h(
      'div.perde.kapi-perde',
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ebeveyn kapısı' },
      h('div.pencere.ebeveyn-kapisi', {}, kapat, h('h2', {}, 'Büyüğünü çağır!'), h('p', {}, 'Devam etmek için bu soruyu cevapla:'), soruEl, cevap, tuslar),
    );
    perde.addEventListener('click', (e) => e.target === perde && bitir(false));
    kok.append(perde);
    if (o.sesli) void konus(metin('ebeveyn'));
  });
}
