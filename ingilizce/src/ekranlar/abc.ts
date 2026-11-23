/**
 * Polly's ABC (21 Kasım 2026): İngilizce harfler ve sesleri. Oturumda üç harf, kaldığı yerden sürer.
 * Her harf: Polly adını ve sesini söyler ("B. /b/ /b/. B is for ball."), büyük ve küçük harf görünür, o harfle başlayan
 * resim gelir. 4 yaş: üç resimden o sesle başlayanı bul. 5+: büyük harfin küçüğünü bul. 2–3 yaş: yalnız tanıtım
 * (harfe ve resme dokununca yeniden duyar).
 * Çizimler (Astra, İngilizce Paket 27 → assets/ingilizce/abc/): resimli harfler, beş yeni sözcük, Polly'nin iki pozu,
 * fon. Çizimler ve sesler tamam olmadan ana ekranda görünmez; taslak ve test kipinde yer tutucuyla açılır.
 * Veri ve kurallar: abc-veri.ts (DOM'suz).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { bekle, cizim, dugme, hareket, kisi, kutla, noktalar, salla, simgeDugme } from '../kit';
import { konus, sesHazirla, sus, tik } from '../ses';
import { resim, sesAdresi, TASLAK } from '../varlik';
import type { Yas } from '../plan';
import { ABC, abcBul, abcPlani, abcSesleri, abcSesMetinleri, sesKaydi, sozKaydi, type AbcHarf, type AbcTuru } from './abc-veri';
import './abc.css';
import { alfabeTreni, trenHazir } from './abc-tren';

const KAYIT = 'minkino-ingilizce-abc-v1';
const OTURUM = 3;
const yeniResimler = ['igloo', 'quilt', 'umbrella', 'van', 'yo-yo'];

/** Ana ekranda görünür mü: Paket 27'nin çizimleri ve bütün kayıtlar diskte (taslak ve testte her zaman) */
export function abcHazir(): boolean {
  if (TASLAK || TEST_MODU) return true;
  return ABC.every((x) => !!resim(`abc/harf-${x.id}`) && !!resim(x.resim) && !!sesAdresi(sesKaydi(x)) && !!sesAdresi(sozKaydi(x))) &&
    yeniResimler.every((w) => !!resim(`abc/${w}`)) && abcSesMetinleri().every((s) => !!sesAdresi(s.id));
}

function siradakiHarf(): number {
  try { const k = JSON.parse(localStorage.getItem(KAYIT) ?? '{}'); return Number.isInteger(k.sonraki) ? k.sonraki % ABC.length : 0; } catch { return 0; }
}
function kaydet(sonraki: number) { try { localStorage.setItem(KAYIT, JSON.stringify({ sonraki: sonraki % ABC.length })); } catch { /* kayıt kapalı */ } }

/** Harfin büyük görüntüsü: Astra'nın resimli harfi, yoksa yazı */
function harfGorseli(x: AbcHarf, sinif: string): HTMLElement {
  const img = cizim(`abc/harf-${x.id}`, 'ing-abc-harf-resim');
  return h(`span.${sinif}`, { 'aria-hidden': 'true' }, img ?? h('b.ing-abc-harf-yazi', {}, x.id.toUpperCase()));
}
function sozResmi(x: AbcHarf, sinif = 'ing-abc-soz-resim'): HTMLElement {
  const img = cizim(x.resim, sinif);
  return img ?? h(`span.${sinif}.ing-abc-yer`, {}, x.soz);
}

export interface AbcGezinme { ana(): void; yas: Yas }

export function abcEkrani(kok: HTMLElement, git: AbcGezinme): () => void {
  // ?ekran=abc&tren=1: doğrudan Alphabet Train
  if (new URLSearchParams(location.search).get('tren') === '1' && trenHazir()) return alfabeTreni(kok, git);
  let acik = true;
  const bas = siradakiHarf();
  const turlar: AbcTuru[] = abcPlani(git.yas, bas, OTURUM);
  sesHazirla(abcSesleri(turlar));
  const soyle = async (...idler: string[]) => { if (!acik) return false; await konus(...idler); return acik; };
  const dur = async (ms: number) => { await bekle(ms); return acik; };
  const iz = (x: string) => { if (TEST_MODU) ((window as unknown as { __abc?: string[] }).__abc ??= []).push(x); };

  const ilerleme = h('div.ing-ust-sag');
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => { tik.dokun(); git.ana(); }, 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Polly’s ABC')),
    ilerleme);
  // Paket 27 fonu (abc/fon) kullanılmıyor: ekranın kendi panosu var; fonun düzeltilmişi gelince yeniden bakılır.
  const sahne = h('section.ing-abc');
  const pollyResmi = cizim('abc/polly-goster', 'ing-abc-polly-resim') ?? kisi('polly');
  const polly = dugme('ing-abc-polly', 'Polly’yi yeniden dinle', () => { tik.dokun(); void tekrar?.(); }, pollyResmi);
  const pano = h('div.ing-abc-pano', {}, h('div.ing-abc-acilis', { 'aria-hidden': 'true' }, h('b', {}, 'A'), h('b', {}, 'B'), h('b', {}, 'C')));
  sahne.append(polly, pano);
  kok.append(ust, sahne);
  let tekrar: (() => Promise<unknown>) | undefined;

  const sevin = () => { void hareket('polly', 'sevin'); };

  let ilk = true;
  async function tanit(x: AbcHarf) {
    pano.dataset.evre = 'tanit';
    const harf = harfGorseli(x, 'ing-abc-harf');
    const ikili = h('span.ing-abc-ikili', { 'aria-label': `${x.id.toUpperCase()} ${x.id}` }, h('b', {}, x.id.toUpperCase()), h('b', {}, x.id));
    const resimKutusu = dugme('ing-abc-soz', x.soz, () => { tik.dokun(); void soyle(sozKaydi(x)); }, sozResmi(x), h('span.ing-abc-soz-yazi', { lang: 'en' }, x.soz));
    resimKutusu.hidden = true;
    const harfDugmesi = dugme('ing-abc-harf-dugme', `${x.id.toUpperCase()} harfi`, () => { tik.dokun(); void soyle(`en/abc-ad-${x.id}`, sesKaydi(x)); }, harf, ikili);
    pano.replaceChildren(harfDugmesi, resimKutusu);
    tekrar = () => soyle(`en/abc-ad-${x.id}`, sesKaydi(x), sesKaydi(x), `en/abc-cumle-${x.id}`);
    const acilis = ilk ? ['en/g-abc-hello'] : [];
    ilk = false;
    if (!(await soyle(...acilis, `en/abc-ad-${x.id}`))) return false;
    if (!(await dur(250)) || !(await soyle(sesKaydi(x)))) return false;
    if (!(await dur(200)) || !(await soyle(sesKaydi(x)))) return false;
    resimKutusu.hidden = false;
    kutla(resimKutusu);
    if (!(await soyle(`en/abc-cumle-${x.id}`))) return false;
    iz('tanit ' + x.id);
    return dur(600);
  }

  /** Bir seçim turu: doğruya dokununca biter; yanlışta sallanır, adı duyulur, soru yinelenir; ikinci ıskada doğru parlar */
  function sec(secenekler: { id: string; el: HTMLButtonElement; ses: string }[], dogru: string, soru: () => Promise<unknown>): Promise<boolean> {
    return new Promise((coz) => {
      let yanlis = 0, kilit = false;
      for (const s of secenekler) {
        s.el.onclick = async () => {
          if (kilit) return;
          if (s.id !== dogru) {
            kilit = true; yanlis++; pano.dataset.bekliyor = 'false';
            salla(s.el); tik.dokun();
            await soyle('en/g-no', s.ses);
            if (yanlis >= 2) secenekler.find((x) => x.id === dogru)?.el.classList.add('ing-parla');
            await soru(); kilit = false; pano.dataset.bekliyor = 'true';
            return;
          }
          kilit = true; pano.dataset.bekliyor = 'false';
          tik.yapis(); kutla(s.el); sevin();
          s.el.classList.add('ing-abc-dogru');
          await soyle('en/g-yes', s.ses);
          coz(acik);
        };
      }
      pano.dataset.bekliyor = 'true';
    });
  }

  async function bul(x: AbcHarf, t: AbcTuru) {
    pano.dataset.evre = 'bul';
    pano.dataset.bekliyor = 'false';
    const soruId = x.sonda ? 'en/g-abc-which-x' : 'en/g-abc-which';
    const secenekler = t.bul!.map((id) => {
      const y = abcBul(id)!;
      const el = dugme('ing-abc-secenek', y.soz, () => {}, sozResmi(y), h('span.ing-abc-soz-yazi', { lang: 'en' }, y.soz));
      el.dataset.harf = id;
      return { id, el, ses: sozKaydi(y) };
    });
    pano.replaceChildren(h('div.ing-abc-ses-tasi', {}, harfGorseli(x, 'ing-abc-kucuk-harf')), h('div.ing-abc-secenekler', {}, ...secenekler.map((s) => s.el)));
    const soru = () => soyle(soruId, sesKaydi(x), sesKaydi(x));
    tekrar = soru;
    if (!(await soru())) return false;
    iz('bul ' + x.id);
    return sec(secenekler, x.id, soru);
  }

  async function eslestir(x: AbcHarf, t: AbcTuru) {
    pano.dataset.evre = 'eslestir';
    pano.dataset.bekliyor = 'false';
    const secenekler = t.eslestir!.map((id) => {
      const el = dugme('ing-abc-kucuk', `küçük ${id}`, () => {}, h('b', {}, id));
      el.dataset.harf = id;
      return { id, el, ses: `en/abc-ad-${id}` };
    });
    pano.replaceChildren(h('div.ing-abc-buyuk', { 'aria-label': `büyük ${x.id.toUpperCase()}` }, h('b', {}, x.id.toUpperCase())), h('div.ing-abc-secenekler.ing-abc-harfler', {}, ...secenekler.map((s) => s.el)));
    const soru = () => soyle('en/g-abc-small', `en/abc-ad-${x.id}`);
    tekrar = soru;
    if (!(await soru())) return false;
    iz('eslestir ' + x.id);
    return sec(secenekler, x.id, soru);
  }

  function bitir() {
    pano.dataset.evre = 'bitti';
    kaydet(bas + OTURUM);
    const harfler = turlar.map((t) => abcBul(t.harf)!);
    const yeniden = dugme('ing-ana-dugme', 'Sonraki harfler', () => { tik.sec(); kok.replaceChildren(); birak(); birak = abcEkrani(kok, git); });
    yeniden.append('Sonraki harfler ', h('span.ing-ok', { 'aria-hidden': 'true' }, '▶'));
    pano.replaceChildren(
      h('h2.ing-abc-bitti', {}, 'Harika! Üç harf öğrendin.'),
      h('div.ing-abc-ozet', {}, ...harfler.map((x) => dugme('ing-abc-ozet-harf', `${x.id.toUpperCase()}, ${x.soz}`, () => { tik.dokun(); void soyle(`en/abc-ad-${x.id}`, sesKaydi(x), sozKaydi(x)); }, harfGorseli(x, 'ing-abc-mini'), h('small', { lang: 'en' }, x.soz)))),
      h('div.ing-abc-dugmeler', {}, yeniden, ...(trenHazir() ? [dugme('ing-ana-dugme ing-abc-tren-ac', 'Alphabet Train', () => { tik.sec(); kok.replaceChildren(); birak(); birak = alfabeTreni(kok, git); }, 'Alphabet Train')] : []), dugme('ing-ana-dugme ing-ikincil', 'Ana ekran', () => { tik.sec(); git.ana(); }, h('span', { html: IKON.ev }), ' Ana ekran')));
    sevin();
    void soyle('en/g-great-job');
    iz('bitti');
  }

  void (async () => {
    // Açılış kısa: ilk harf hemen ekranda, Polly "Let's learn the ABC!" cümlesini onun üstünde söyler (Ceren'in uzun girişi yok).
    for (let i = 0; i < turlar.length; i++) {
      ilerleme.replaceChildren(noktalar(turlar.length, i));
      const t = turlar[i], x = abcBul(t.harf)!;
      if (!(await tanit(x))) return;
      if (t.bul && !(await bul(x, t))) return;
      if (t.eslestir && !(await eslestir(x, t))) return;
      if (!(await dur(400))) return;
    }
    ilerleme.replaceChildren(noktalar(turlar.length, turlar.length));
    bitir();
  })();
  let birak = () => { acik = false; sus(); };
  return () => birak();
}

/** Ana ekran başlığındaki giriş düğmesi ("ABC"); ana.ts bunu tek satırla koyar */
export function abcGirisi(ac: () => void): HTMLButtonElement {
  // Ağaç Evi düğmesiyle aynı boy ve biçim: solda üç renkli harf (simge yerinde), yanında "ABC"
  const d = dugme('ing-abc-giris', 'Polly’s ABC', () => { tik.sec(); ac(); },
    h('span.ing-abc-giris-simge', { 'aria-hidden': 'true' }, h('b', {}, 'A'), h('b', {}, 'B'), h('b', {}, 'C')), 'ABC');
  d.dataset.bolum = 'abc';
  return d;
}
