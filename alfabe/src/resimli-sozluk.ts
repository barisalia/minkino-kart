// Resimli Sözlük (yönetici, 21 Kasım): Harf Albümü'nün içinde her harfin sözlük sayfası. Yeni çizim yok; sözcük havuzunun
// resimleri ve Ceren kayıtları (sozcuk-kaynagi.ts). Harf bitince sayfası açılır; bitmemiş harfin sayfası kapalı görünür.
// Karta dokununca Ceren sözcüğü söyler, heceler sırayla yanar ("ba-lon"), harfin kendisi harfin renginde parlar.
// Her harfte bir kez "bul" anı: Ceren bir sözcük söyler, çocuk resmini bulur (sozluk-secim.ts → bulHedefleri).
// 2–3 yaş yalnız dokunup dinler (hece ve "bul" yok); 4 ve 5+ hecelerle. Albümün yapıştırma akışı değişmez.
import dersler from './harfler.json';
import { HARF_SIRASI } from './harf-sirasi';
import { kalemNo, murekkepler, type Kalemler } from './kartlar';
import { cerenKaydiVar } from './konusma-dersi';
import { resimliSozcukler } from './sozcuk-kaynagi';
import { bulHedefleri, hecelere, parlayanYer, sayfaSozcukleri, type SozlukSozcugu } from './sozluk-secim';
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { oyunSesi } from './oyun-sesi';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { kucukGrup, tamDers } from './yas-grubu';
import { IKON } from '../../src/ui/ikonlar';
import './resimli-sozluk.css';

type Oku = (id: string, sonra?: () => void, oynarken?: (saniye: number) => void) => void;
type Ders = (typeof dersler)[number];
const KAYIT = 'minkino-sozluk-v1';
const HECE_ADIMI = 300;

let onbellek: { sayfalar: Record<string, SozlukSozcugu[]>; hedefler: Record<string, string> } | undefined;
/** Bütün harflerin sayfaları ve bul hedefleri (bir kez hesaplanır). */
export function sozlukVerisi() {
  if (onbellek) return onbellek;
  const liste = resimliSozcukler(tamDers ? '5+' : '4').filter(s => s.gorsel && cerenKaydiVar(s.ses))
    .map(s => ({ id: s.id, ad: s.ad, gorsel: s.gorsel, ses: s.ses }));
  const sayfalar: Record<string, SozlukSozcugu[]> = {};
  for (const d of dersler) sayfalar[d.id] = sayfaSozcukleri(d, liste);
  onbellek = { sayfalar, hedefler: bulHedefleri(HARF_SIRASI, sayfalar, dersler) };
  return onbellek;
}

function bulunanlar(): string[] {
  try { const k = JSON.parse(dersKaydiniOku(KAYIT) || 'null'); if (Array.isArray(k?.bulundu)) return k.bulundu.filter((x: unknown) => typeof x === 'string'); } catch { /* baştan */ }
  return [];
}
function bulunduYaz(id: string) {
  const b = bulunanlar();
  if (!b.includes(id)) b.push(id);
  try { dersKaydiniYaz(KAYIT, JSON.stringify({ bulundu: b })); } catch { /* kayıt yazılamasa da sözlük çalışır */ }
}

const buyukBas = (s: string) => s[0].toLocaleUpperCase('tr') + s.slice(1);
/** Uzun sözcükte yazı küçülür (en uzun sözcük parçasının harf ve hece noktası sayısına göre). */
const yaziOlcek = (ad: string) => { const en = Math.max(...hecelere(ad).map(s => s.join('').length + (kucukGrup ? 0 : s.length - 1))); return Math.min(1, 8 / en).toFixed(2); };

/** Sözcüğün yazısı: hece hece span; parlayan harf ayrı span (Ğ'de ilk ğ, öbürlerinde ilk harf). */
function yaziHtml(d: Ders, s: SozlukSozcugu) {
  const heceler = hecelere(s.ad);
  const [ps, pc, pi] = parlayanYer(d, s.ad);
  return heceler.map((soz, si) => '<span class="sz-soz">' + soz.map((h, ci) => {
    let metin = si === 0 && ci === 0 ? buyukBas(h) : h;
    if (si === ps && ci === pc) metin = metin.slice(0, pi) + '<b class="sz-ilk">' + metin[pi] + '</b>' + metin.slice(pi + 1);
    return '<span class="sz-hece">' + metin + '</span>';
  }).join('') + '</span>').join(' ');
}

export function sozlukKur(alan: HTMLElement, baslangic: string, biten: string[], renkler: Record<string, Kalemler>,
  oku: Oku, sustur: () => void): () => void {
  const an = new An();
  const { sayfalar, hedefler } = sozlukVerisi();
  let sira = Math.max(0, HARF_SIRASI.indexOf(baslangic));
  let girisCalindi = false, kapali = false, sesNo = 0;
  const zamanlar = new Set<number>();
  const zaman = (ms: number, is: () => void) => { const z = window.setTimeout(() => { zamanlar.delete(z); if (!kapali) is(); }, ms); zamanlar.add(z); };
  const temizleZaman = () => { for (const z of zamanlar) clearTimeout(z); zamanlar.clear(); };

  const kok = document.createElement('section');
  kok.className = 'sz';
  kok.setAttribute('aria-label', 'Resimli Sözlük');
  alan.replaceChildren(kok);

  function ciz(yon = 0) {
    temizleZaman(); sustur(); sesNo++;
    const id = HARF_SIRASI[sira], d = dersler.find(x => x.id === id)!;
    const acik = biten.includes(id);
    const sozcukler = sayfalar[id] ?? [];
    const renk = murekkepler[kalemNo(renkler[id]?.buyuk)].renk;
    const hedef = hedefler[id];
    const bulBekliyor = acik && !kucukGrup && !!hedef && !bulunanlar().includes(id);
    const onceki = HARF_SIRASI[(sira + HARF_SIRASI.length - 1) % HARF_SIRASI.length], sonraki = HARF_SIRASI[(sira + 1) % HARF_SIRASI.length];
    const harfAdi = (x: string) => dersler.find(y => y.id === x)!.upper;
    const kart = (s: SozlukSozcugu) => '<button type="button" class="sz-kart" data-sozcuk="' + s.id + '" aria-label="' + s.ad + '">' +
      '<span class="sz-resim"><img src="' + s.gorsel + '" alt="" draggable="false"></span><span class="sz-yazi' + (kucukGrup ? '' : ' sz-heceli') + '" style="--k:' + yaziOlcek(s.ad) + '">' + yaziHtml(d, s) + '</span></button>';
    const bos = '<span class="sz-bos" aria-hidden="true"></span>';
    const harfKutusu = '<div class="sz-harf"><span>' + d.upper + d.lower + '</span>' + (acik ? '' : '<i class="sz-kilit">' + IKON.kilit + '</i>') + '</div>';
    const kartlar = acik ? sozcukler.map(kart) : sozcukler.map(() => bos);
    const sol = [harfKutusu, ...kartlar.slice(0, 3)], sag = kartlar.slice(3, 6);
    kok.dataset.harf = id; kok.dataset.durum = acik ? 'acik' : 'kapali'; kok.dataset.evre = bulBekliyor ? 'bul' : 'dinle';
    kok.style.setProperty('--harf', renk);
    kok.innerHTML = '<div class="sz-ust"><h1>Resimli Sözlük</h1>' +
      (acik ? '<button type="button" class="at-ses sz-dinle" aria-label="Yeniden dinle">' + IKON.hoparlor + '</button>' : '') + '</div>' +
      '<div class="sz-kitap"><div class="sz-sayfalar"><div class="sz-sayfa">' + sol.join('') + '</div><div class="sz-sayfa">' + sag.join('') + '</div></div></div>' +
      '<div class="sz-kumanda"><button type="button" class="at-geri sz-once" aria-label="Önceki harf: ' + harfAdi(onceki) + '">' + IKON.geri + '<span>' + harfAdi(onceki) + '</span></button>' +
      '<span class="sz-sira">' + (sira + 1) + ' / ' + HARF_SIRASI.length + '</span>' +
      '<button type="button" class="at-geri sz-sonra" aria-label="Sonraki harf: ' + harfAdi(sonraki) + '"><span>' + harfAdi(sonraki) + '</span>' + IKON.geri + '</button></div>';
    kok.querySelector<HTMLButtonElement>('.sz-once')!.onclick = () => { sira = (sira + HARF_SIRASI.length - 1) % HARF_SIRASI.length; ciz(-1); };
    kok.querySelector<HTMLButtonElement>('.sz-sonra')!.onclick = () => { sira = (sira + 1) % HARF_SIRASI.length; ciz(1); };
    if (yon && !azHareket()) an.hareket(kok.querySelector('.sz-sayfalar')!, [{ opacity: 0, transform: 'translateX(' + 4 * yon + '%)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'ease-out' });
    if (!acik) {
      for (const b of kok.querySelectorAll<HTMLElement>('.sz-bos, .sz-harf')) b.onclick = () => oyunSesi('geri');
      return;
    }
    const kartEl = (sid: string) => kok.querySelector<HTMLButtonElement>('.sz-kart[data-sozcuk="' + sid + '"]')!;
    /** Sözcüğü söyler; heceler sırayla yanar (4 ve 5+), harf harfin renginde parlar. */
    function soyle(s: SozlukSozcugu, sonra?: () => void) {
      const b = kartEl(s.id);
      const no = ++sesNo;
      b.classList.remove('sz-parla'); void b.offsetWidth; b.classList.add('sz-parla');
      if (!azHareket()) an.hareket(b, [{ transform: 'none' }, { transform: 'translateY(-4%) scale(1.04)', offset: .35 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
      const heceler = [...b.querySelectorAll<HTMLElement>('.sz-hece')];
      heceler.forEach(h => h.classList.remove('sz-yanik'));
      let basladi = false;
      oku(s.ses, () => { if (no === sesNo) { heceler.forEach(h => h.classList.remove('sz-yanik')); sonra?.(); } }, saniye => {
        if (basladi || saniye <= 0 || kucukGrup || no !== sesNo) return;
        basladi = true;
        heceler.forEach((h, i) => zaman(i * HECE_ADIMI, () => { if (no === sesNo) { heceler.forEach(x => x.classList.remove('sz-yanik')); h.classList.add('sz-yanik'); } }));
      });
    }
    const hedefSoz = sozcukler.find(s => s.id === hedef);
    function bulSor() { if (hedefSoz) oku('sozluk-bul', () => { if (kok.dataset.evre === 'bul') soyle(hedefSoz); }); }
    for (const s of sozcukler) {
      kartEl(s.id).onclick = () => {
        if (kok.dataset.evre === 'bul' && hedefSoz) {
          if (s.id !== hedef) {
            // Yanlış resim: hafifçe sallanır, Ceren sözcüğü yeniden söyler; ceza yok.
            oyunSesi('geri');
            if (!azHareket()) an.hareket(kartEl(s.id), [{ transform: 'none' }, { transform: 'translateX(-5px) rotate(-3deg)' }, { transform: 'translateX(5px) rotate(3deg)' }, { transform: 'none' }], { duration: 320 });
            sustur(); soyle(hedefSoz);
            return;
          }
          kok.dataset.evre = 'dinle'; bulunduYaz(id);
          const b = kartEl(s.id);
          b.classList.add('sz-bulundu');
          oyunSesi('parilti');
          const r = kabaGore(kok, b);
          isikSac(an, kok, r.cx, r.cy, { adet: 8, uzaklik: r.w * .6, boy: Math.max(16, r.w * .14) });
          sustur(); soyle(s, () => oku('good'));
          return;
        }
        sustur(); soyle(s);
      };
    }
    kok.querySelector<HTMLButtonElement>('.sz-dinle')!.onclick = () => { sustur(); if (kok.dataset.evre === 'bul') bulSor(); else oku('sozluk-giris'); };
    if (!girisCalindi) { girisCalindi = true; oku('sozluk-giris', () => { if (kok.dataset.evre === 'bul' && kok.dataset.harf === id) bulSor(); }); }
    else if (bulBekliyor) bulSor();
  }
  ciz();
  return () => { kapali = true; temizleZaman(); an.durdur(); sustur(); };
}
