/**
 * Hafıza Oyunu (yan dal): temanın kartlarından ters çevrilmiş çiftler. 3 yaş 2×2, 4 yaş 2×3, 5 yaş 3×4, 6 yaş 4×4.
 * Mino kartları dağıtır, eşleşmede sevinir; bulunan çift albüme uçar (yeni kartsa albüme eklenir).
 */
import { eslestiCumlesi } from '../audio/cumleler';
import { onYukle } from '../audio/kayit';
import { buyukHarfBas, metin, sayiAdi } from '../audio/metin';
import { efekt, konus } from '../audio/ses';
import { HAFIZA_DUZEN, hafizaDestesi, hafizaKartlariSec, HafizaDurumu, hafizaYildiz, type CevirSonucu } from '../engine/hafiza';
import { durum, kaydetDurum } from '../engine/ilerleme';
import { albumKartlari, kart, temaBul } from '../engine/katalog';
import { yeniAcilanlar } from '../engine/odul';
import type { Yas } from '../engine/types';
import { bekle, h, sure, svg, TEST_MODU } from '../ui/dom';
import { cevir, eslesmeyenSallan, eslesmeZipla, hafizaKartiEl } from '../ui/hafizaKart';
import { azHareket, dagit, izgaraSigdir, merkez, parlat, ucurKavis, yapisEsne } from '../ui/hareket';
import { IKON } from '../ui/ikonlar';
import { gorselVarMi, kartEl } from '../ui/kart';
import { konfetiPatlat } from '../ui/konfeti';
import { albumDugmesi, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';
import { paketKutla } from './turSonu';
import { minoYoldas } from './yoldas';

export function hafizaOyunuEkrani(app: Uygulama, param: { tema?: string } = {}): Ekran {
  const yas = (durum.i.yas ?? 3) as Yas;
  const tema = temaBul(param.tema ?? '') ?? temaBul('hayvanlar')!;
  // bulunan çift albüme uçar: yalnız albümde yeri olan ve görseli bulunan kartlar
  const uygun = (id: string) => {
    const k = kart(id);
    return !!k && k.album !== false && (k.tur !== 'resim' || gorselVarMi(k));
  };
  const oyun = new HafizaDurumu(hafizaDestesi(hafizaKartlariSec(yas, tema.id, Math.random, uygun)));
  const albumdekiler = new Set(albumKartlari(tema.id).map((k) => k.id));
  const albumOnce = durum.i.album.length;
  let kapandi = false;
  let kilit = true;
  /** Çift karara bağlanırken dokunuşlar beklemede (durum test için ekranda da işaretli) */
  const kilitle = (v: boolean) => {
    kilit = v;
    el.dataset.kilit = v ? '1' : '0';
  };
  let bosta: number | undefined;
  const ucuslar: Promise<void>[] = [];

  const album = albumDugmesi(() => app.git('album', { tema: tema.id }));
  const ilerleme = h('div.ilerleme', { 'aria-hidden': 'true' });
  for (let i = 0; i < oyun.ciftSayisi; i++) ilerleme.append(h('i'));
  const yoldas = minoYoldas();

  const soyle = () => void konus(metin('hafiza_sor'));
  const hop = yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', soyle);
  hop.classList.add('soru-hop');
  const balon = h('div.soru-balon', {}, hop);
  if (yas >= 5) balon.append(h('div.soru-metin', {}, metin('hafiza_sor')));
  else {
    const d = h('div.soru-dalgalar', { 'aria-label': metin('hafiza_sor') });
    for (let i = 0; i < 7; i++) d.append(h('i', { style: `--i:${i}` }));
    balon.append(d);
  }

  const izgara = h('div.izgara.hafiza.ho-izgara', { 'data-yas': yas });
  const alan = h('div.ho-alan', {}, izgara);
  const elemanlar = oyun.deste.map((id, i) => {
    const el = hafizaKartiEl(id, id);
    el.dataset.sira = String(i);
    el.addEventListener('click', () => void dokun(i));
    izgara.append(el);
    return el;
  });

  const el = h(
    'div.hafiza-oyun',
    { style: `--tema:${tema.renk}`, 'data-tema': tema.id },
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Paketlere dön', () => app.git('temalar', { mod: 'hafiza' })), h('div.orta', {}, ilerleme), album.el),
    h('div.soru-satir', {}, yoldas.el, balon),
    alan,
  );

  el.addEventListener('pointerdown', (e) => {
    yoldas.bakNokta(e.clientX);
    bostaKur();
    const k = (e.target as Element).closest<HTMLElement>('.hafiza-kart');
    if (!k || k.classList.contains('acik')) return;
    k.classList.add('basili');
    const birak = () => {
      k.classList.remove('basili');
      window.removeEventListener('pointerup', birak);
      window.removeEventListener('pointercancel', birak);
    };
    window.addEventListener('pointerup', birak);
    window.addEventListener('pointercancel', birak);
  });

  function bostaKur() {
    clearTimeout(bosta);
    if (TEST_MODU) return;
    bosta = window.setTimeout(() => {
      if (kapandi || oyun.bitti) return;
      yoldas.cesaret(null);
      soyle();
      bostaKur();
    }, 16000);
  }

  async function dokun(i: number) {
    if (kilit || kapandi) return;
    const r = oyun.cevir(i);
    if (r.tur === 'gecersiz') return;
    const k = elemanlar[i];
    efekt.cevir();
    k.setAttribute('aria-label', kart(oyun.deste[i])?.ad ?? 'Kart');
    const donus = cevir(k, true);
    if (r.tur === 'ilk') return;
    kilitle(true);
    await donus;
    if (kapandi) return;
    if (r.tur === 'eslesti') await eslesti(r);
    else if (r.tur === 'eslesmedi') await eslesmedi(r);
    if (!kapandi && !oyun.bitti) kilitle(false);
  }

  async function eslesti(r: Extract<CevirSonucu, { tur: 'eslesti' }>) {
    const [a, b] = r.cift.map((i) => elemanlar[i]);
    await bekle(sure(120));
    if (kapandi) return;
    a.classList.add('eslesti');
    b.classList.add('eslesti');
    eslesmeZipla(a);
    eslesmeZipla(b, 70);
    efekt.eslesti();
    for (const x of [a, b]) {
      const m = merkez(x);
      parlat(app.kok, m.x, m.y, 8, m.w * 0.7);
    }
    ilerleme.children[oyun.bulunan.size / 2 - 1]?.classList.add('tamam');
    yoldas.sevin(r.bitti);
    if (!r.bitti) void konus(eslestiCumlesi(kart(r.id)?.ad ?? ''));

    const yeni = albumdekiler.has(r.id) && !durum.i.album.includes(r.id);
    if (yeni) {
      durum.i.album.push(r.id);
      kaydetDurum();
    }
    // Çift albüme uçar (oyun beklemeden devam eder; kartın yerinde silik bir yuva kalır)
    ucuslar.push(
      bekle(sure(620)).then(async () => {
        if (kapandi) return;
        efekt.ucus();
        const uc = [
          ucurKavis(app.kok, kartEl(r.id, { ornek: true }), a, album.el, { sonOlcek: 0.3, ms: 900, iz: true }),
          ucurKavis(app.kok, kartEl(r.id, { ornek: true }), b, album.el, { sonOlcek: 0.3, ms: 900, gecikme: 110 }),
        ];
        a.classList.add('alindi');
        b.classList.add('alindi');
        await Promise.all(uc);
        if (kapandi) return;
        efekt.yapis();
        if (yeni) album.artir(app.kok);
        else yapisEsne(album.el, app.kok);
      }),
    );
    if (r.bitti) await bitir();
    else await bekle(sure(350));
  }

  async function eslesmedi(r: Extract<CevirSonucu, { tur: 'eslesmedi' }>) {
    const [a, b] = r.cift.map((i) => elemanlar[i]);
    await bekle(sure(750));
    if (kapandi) return;
    await Promise.all([eslesmeyenSallan(a), eslesmeyenSallan(b)]);
    if (kapandi) return;
    yoldas.cesaret(null);
    efekt.cevir();
    oyun.kapat();
    a.setAttribute('aria-label', 'Kapalı kart');
    b.setAttribute('aria-label', 'Kapalı kart');
    await Promise.all([cevir(a, false), cevir(b, false, 60)]);
    if (oyun.hata % 3 === 0) void konus(metin('tekrar_dene'));
  }

  async function bitir() {
    clearTimeout(bosta);
    await Promise.all(ucuslar);
    if (kapandi) return;
    const yildiz = hafizaYildiz(oyun.hata, oyun.ciftSayisi);
    durum.i.album = [...new Set(durum.i.album)];
    kaydetDurum();
    const acilan = yeniAcilanlar(albumOnce, durum.i.album.length, durum.i.premium).map((t) => t.id);

    const yildizEl = [0, 1, 2].map(() => h('div.buyuk-yildiz', {}, svg(IKON.yildiz)));
    const tekrar = yuvarlakDugme(IKON.tekrar, 'Tekrar oyna', () => app.git('hafiza', { tema: tema.id }));
    tekrar.style.setProperty('--r', '#FF8A2B');
    const paketler = yuvarlakDugme(IKON.izgara, 'Paketler', () => app.git('temalar', { mod: 'hafiza' }));
    paketler.style.setProperty('--r', '#3E9DF2');
    const son = h(
      'div.ho-son',
      { role: 'dialog', 'aria-label': 'Hepsini buldun' },
      h('div.ho-son-ic', {}, h('div.yildizlar', {}, ...yildizEl), h('div.ho-son-baslik', {}, metin('hafiza_bitti')), h('div.alt-dugmeler', {}, tekrar, paketler)),
    );
    el.append(son);
    if (!TEST_MODU && !azHareket()) {
      son.firstElementChild?.animate(
        [{ transform: 'translateY(60px) scale(.8)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.03)', opacity: 1, offset: 0.7 }, { transform: 'none' }],
        { duration: 520, easing: 'cubic-bezier(.3,.8,.4,1)' },
      );
    }
    const r = izgara.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width / 2, r.top + r.height / 2, 130, 1.2);
    efekt.konfeti();
    const konusma = konus([metin('hafiza_bitti'), buyukHarfBas(metin('yildiz', { yildiz: sayiAdi(yildiz) }))]);
    for (let i = 0; i < yildiz; i++) {
      await bekle(sure(380));
      if (kapandi) return;
      yildizEl[i].classList.add('dolu');
      efekt.yildiz(i);
    }
    await konusma;
    for (const id of acilan) {
      if (kapandi || durum.i.kutlananTemalar.includes(id)) continue;
      durum.i.kutlananTemalar.push(id);
      kaydetDurum();
      await paketKutla(app, id);
    }
  }

  // Açılış: kartlar yerleşir, Mino dağıtır; küçükler için kısa bir süre açık gösterilir
  let kapatSigdir: () => void = () => undefined;
  onYukle([metin('hafiza_oyunu'), metin('hafiza_sor'), metin('hafiza_bitti'), ...oyun.deste.map((id) => `${kart(id)?.ad ?? ''}!`)]);
  void (async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    if (kapandi) return;
    // ekran sahnedeyken ölç: kartların son yeri dağıtmadan önce belli olsun
    // yaşın düzeni (2×2, 2×3, 3×4, 4×4); geniş ekranda yan yatırılmış hâli de olur
    const d = HAFIZA_DUZEN[yas];
    // yatay telefonda (alçak ekran) iki sıra ya da tek sıra da olabilir; yoksa 6 yaşın kartları parmak ucundan küçük kalıyordu
    const n = oyun.deste.length;
    const kolonlar = [d.kolon, d.satir, n / 2, ...(n <= 6 ? [n] : [])];
    kapatSigdir = izgaraSigdir(alan, izgara, n, { enBuyuk: yas === 3 ? 230 : 190, bosluk: yas >= 5 ? 10 : 16, kolonlar });
    const konusma = konus([metin('hafiza_oyunu'), metin('hafiza_sor')]);
    yoldas.dagit();
    await dagit(elemanlar, yoldas.patiNoktasi(), { bas: 150, aralik: elemanlar.length > 8 ? 55 : 90, arkaDon: false, ses: () => efekt.dagit() });
    if (kapandi) return;
    if (yas <= 4) {
      await bekle(sure(250));
      efekt.cevir();
      await Promise.all(elemanlar.map((e, i) => cevir(e, true, i * 50)));
      await bekle(TEST_MODU ? 10 : 1300 + elemanlar.length * 160);
      if (kapandi) return;
      efekt.cevir();
      await Promise.all(elemanlar.map((e, i) => cevir(e, false, i * 50)));
    }
    if (kapandi) return;
    kilitle(false);
    el.dataset.hazir = '1';
    void konusma;
    bostaKur();
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      clearTimeout(bosta);
      kapatSigdir();
      yoldas.kapat();
      app.kok.querySelector('.kutlama')?.remove();
    },
  };
}
