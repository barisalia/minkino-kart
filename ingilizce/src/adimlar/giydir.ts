/**
 * Kino'yu Giydir (Kıyafetler adasına özel): Polly "Put on the hat!" der, çocuk askıdaki şapkaya dokunur, şapka Kino'nun
 * başına oturur. Yanlış giysiye dokununca Kino başını sallar, çocuk o giysinin adını duyar. Bütün giysiler giyilince
 * Polly "Wow! Kino is ready!" der, "Say cheese!" ile fotoğraf çekilir.
 *
 * Çizimler (Astra, Paket 12): `oyun/giydir/kino-0|1` ve sekiz giysi katmanı, hepsi aynı 1000 × 1400 tuvalde; kod
 * katmanları üst üste koyar. Elbise tişört ve pantolonun yerine giyilir (biri giyilince öbürü çıkar).
 * Çizimi ve sesi gelmeden ders bu oyunu açmaz (`ders.ts` → hazirAdimlar); taslakta yer tutucuyla oynanır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla } from '../kit';
import { tik } from '../ses';
import { resim, sahneResmi } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';

/** Katman sırası: alttan üste */
export const GIYSI_SIRASI = ['socks', 'shoes', 'pants', 't-shirt', 'dress', 'jacket', 'scarf', 'hat'] as const;
/** Birlikte giyilmeyenler: elbise tişört ile pantolonun yerine geçer */
const CAKISAN: Record<string, readonly string[]> = { dress: ['t-shirt', 'pants'], 't-shirt': ['dress'], pants: ['dress'] };

export const giydirHazir = (hedefler: readonly Kelime[]): boolean =>
  !!resim('oyun/giydir/kino-0') && hedefler.every((w) => !!resim(`oyun/giydir/${w.id}`));

export const giydirKur: AdimKurucu<'giydir'> = (b, a) => {
  const y = yasam();
  let no = 0, kilit = true, yanlis = 0;
  const hedef = () => a.hedefler[no];
  const komut = () => `en/g-put-on-${hedef().id}`;
  const sor = () => { if (!kilit) void y.soyle(komut()); };
  const { masa } = oyunDuzeni(b.alan, 'ing-giydir', sor);

  // ---- oda ve Kino: gövde iki kare (0 gülümser, 1 sevinir), giysiler aynı tuvalde katman katman
  const fon = sahneResmi('giyinme');
  const oda = h('div.ing-giydir-oda');
  if (fon) oda.style.backgroundImage = `url("${fon}")`;
  const kino = h('div.ing-giydir-kino');
  const govde0 = cizim('oyun/giydir/kino-0', 'ing-giydir-govde');
  const govde1 = cizim('oyun/giydir/kino-1', 'ing-giydir-govde ing-giydir-sevinc');
  if (govde0) kino.append(govde0); else kino.append(h('span.ing-giydir-yer', {}, 'Kino'));
  if (govde1) { govde1.hidden = true; kino.append(govde1); }
  const katmanlar = new Map<string, HTMLElement>();
  GIYSI_SIRASI.forEach((id, z) => {
    const kat = cizim(`oyun/giydir/${id}`, 'ing-giydir-kat') ?? h('span.ing-giydir-kat.ing-giydir-kat-yer', {}, kelimeResmi({ id, en: id, tr: id, tur: 'tekil' } as Kelime));
    kat.style.zIndex = String(2 + z);
    kat.dataset.giysi = id;
    kino.append(kat);
    katmanlar.set(id, kat);
  });
  oda.append(kino);

  // ---- askı: giysi kartları (derste öğrenilen giysiler)
  const aski = h('div.ing-giydir-aski', { 'data-adet': a.raf.length });
  const kartlar = a.raf.map((w, i) => {
    const d = dugme('ing-secim ing-giydir-kart', w.tr, () => void sec(w, d), kelimeResmi(w));
    d.dataset.kelime = w.id;
    d.style.setProperty('--n', String(i));
    return d;
  });
  aski.append(...kartlar);
  masa.append(h('div.ing-giydir-sahne', {}, oda, aski));

  const sevin = async (ms: number) => {
    if (!govde0 || !govde1) return;
    govde0.hidden = true; govde1.hidden = false;
    await y.dur(ms);
    govde0.hidden = false; govde1.hidden = true;
  };

  function giy(id: string) {
    for (const c of CAKISAN[id] ?? []) {
      const k = katmanlar.get(c);
      if (k?.classList.contains('ing-giyili')) {
        k.classList.remove('ing-giyili');
        kartlar.find((d) => d.dataset.kelime === c)?.classList.remove('ing-giyildi');
      }
    }
    const kat = katmanlar.get(id);
    if (!kat) return;
    kat.classList.remove('ing-giyili'); void kat.offsetWidth; kat.classList.add('ing-giyili');
  }

  async function soruGoster() {
    kilit = true; yanlis = 0;
    if (TEST_MODU) aski.dataset.hedef = hedef().id;
    if (!(await y.dur(300)) || !(await y.soyle(komut()))) return;
    kilit = false;
    ipucuKur(() => (yanlis >= 2 ? kartlar.find((d) => d.dataset.kelime === hedef().id) : null), 5000);
  }

  async function sec(w: Kelime, d: HTMLButtonElement) {
    if (kilit) return;
    const istenen = hedef();
    if (w.id !== istenen.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kino.classList.remove('ing-hayir'); void kino.offsetWidth; kino.classList.add('ing-hayir');
      kilit = true;
      // dokunduğu giysinin adını duyar, sonra komut yinelenir
      if (!(await y.soyle(`en/w-${w.id}`, komut()))) return;
      if (yanlis >= 2) kartlar.find((x) => x.dataset.kelime === istenen.id)?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    tik.yapis();
    d.classList.remove('ing-parla');
    d.classList.add('ing-giyildi');
    giy(w.id);
    kutla(kino);
    void sevin(700);
    if (no % 2 === 1) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/w-${w.id}`))) return;
    no++;
    if (no < a.hedefler.length) { void soruGoster(); return; }
    await fotograf();
  }

  /** Kino hazır: "Wow! Kino is ready!" → çerçeve gelir → "Say cheese!" → flaş */
  async function fotograf() {
    void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-kino-ready'))) return;
    const cerceve = cizim('oyun/foto-cerceve', 'ing-foto-cerceve');
    oda.classList.add('ing-foto');
    if (cerceve) oda.append(cerceve);
    if (!(await y.soyle('en/g-say-cheese'))) return;
    tik.yapis();
    if (govde0 && govde1) { govde0.hidden = true; govde1.hidden = false; }
    const flas = h('div.ing-flas');
    oda.append(flas);
    kutla(kino);
    if (!(await y.dur(1300))) return;
    b.bitti();
  }

  b.tekrarla(sor);
  void (async () => {
    if (!a.hedefler.length) { b.bitti(); return; }
    if (b.ilkKez('giydir') && !(await y.soyle('tr/c-giydir-giris'))) return;
    void soruGoster();
  })();
  return () => y.kapat();
};
