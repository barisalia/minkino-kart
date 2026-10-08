/**
 * Meyve Suyu Köşesi ekranı (pazarın yan dalı). Mino'nun standında şeffaf bir blender durur.
 * Müşteri bir renk meyve suyu ister (balonda o renkte bardak). Çocuk meyveleri blender'a sürükler,
 * "Karıştır"a (ya da blender'a) basar: blender döner, renk sıvıda oluşur, bardağa dökülür, Mino bardağı uzatır,
 * müşteri içer. Doğru renkte sevinir (yıldız); yanlış renkte yüzünü buruşturur, ceza yok, bir daha denenir.
 * 3-4 yaş: tek meyve = tek renk. 5-6 yaş: iki ana rengi karıştırır (kırmızı + sarı = turuncu …).
 */
import P from '../../content/pazar.json';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { efekt, konus } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import type { Yas } from '../../src/engine/types';
import { Mino } from '../../src/mino/mino';
import { bekle, h, karistir, sure, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { konfetiPatlat } from '../../src/ui/konfeti';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { AZ, Bardak, Blender, YABANMERSINI } from './blender';
import { canliSahne } from './canli';
import { gorselStil, musteriKutusu, odulAni, onTezgah, oran, oyunKamerasi, stand } from './ekranlar';
import { Kamera } from './kamera';
import { flamaYerlestir, parilti, resim } from './gorsel';
import { kaydet, kayit } from './ilerleme';
import { urunAdi } from './istek';
import { brrSesi, icmeSesi } from './meyvesuyu-ses';
import { dogruSecim, karisim, karisimCumlesi, KAPASITE, MEYVE_RENGI, MS_MUSTERI, msIstekUret, SU_KODU, tarif, type MsIstek, type SuRengi } from './meyvesuyu';
import { MinoCanli } from './mino-canli';
import { Musteri, musteriHazirla } from './musteri';
import { geriGonder, surukle, tasi } from './surukle';

const A = P.arayuz;
const M = P.meyvesuyu;
const yas = (): Yas => durum.i.yas ?? 4;
const rastgele = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const onizleme = () => TEST_MODU || !!document.body.dataset.onizleme;

/** Meyvenin resmi: mevcut görseller, yaban mersini kodla çizim */
function meyveResmi(id: string): HTMLElement {
  if (id === 'yabanmersini') return h('div.pz-resim.ms-mersin', { role: 'img', 'aria-label': A.yabanmersini, html: YABANMERSINI });
  return resim(`meyveler/${id}`, '', urunAdi(id));
}
const meyveAdi = (id: string) => (id === 'yabanmersini' ? A.yabanmersini : urunAdi(id));

/** Renk noktası (ipucu formülünde) */
const nokta = (r: SuRengi) => h('i.ms-nokta', { style: `--r:${SU_KODU[r]}`, role: 'img', 'aria-label': r });

/** Balonda istenen bardak; ipucu açıkken altında karışım formülü (● + ● =) */
function istekGorseli(ist: MsIstek, formul: boolean): HTMLElement {
  const b = new Bardak(SU_KODU[ist.hedef]);
  b.dolu(1);
  b.el.classList.add('ms-pipetli');
  const kap = h('div.pz-istek.ms-istek', {}, b.el);
  if (formul && ist.karisik) {
    const [x, y] = tarif(ist.hedef);
    kap.prepend(h('div.ms-formul', {}, nokta(x), h('b', {}, '+'), nokta(y), h('b', {}, '=')));
  }
  return kap;
}

export function meyveSuyuEkrani(app: Uygulama): Ekran {
  const y = yas();
  const q = new URLSearchParams(location.search);
  const secili = onizleme() ? (q.get('musteriler') ?? '').split(',').filter((x) => P.musteriler.includes(x)) : [];
  const musteriler = [...secili, ...karistir(P.musteriler.filter((x) => !secili.includes(x)))].slice(0, MS_MUSTERI);
  musteriler.forEach((ad) => {
    resimSesiHazirla(ad);
    musteriHazirla(ad);
  });

  const yazi = h('span', {}, M.giris);
  let sonSoz: string[] = [M.giris];
  const balon = h('div.baslik-balon.pz-baslik', {}, yuvarlakDugme(IKON.hoparlor, 'Tekrar dinle', () => void konus(sonSoz), 'kucuk'), yazi);
  const yildizlar = h('div.pz-yildizlar', { 'aria-label': 'Yıldızlar' }, ...Array.from({ length: MS_MUSTERI }, () => h('i.pz-yildiz', {}, svg(IKON.yildiz))));
  const musteriKap = h('div.pz-musteri-kap');
  const mino = new Mino();
  mino.el.addEventListener('pointerdown', () => mino.tepki('gidik'));
  const blender = new Blender();
  const urunler = h('div.pz-urunler.ms-urunler');
  let aktif = false;
  const minoCanli = new MinoCanli(mino, { urunVar: () => true, musteriVar: () => aktif });
  const karYazi = h('span', {}, A.karistir);
  const karDugme = h('button.dugme.pz-ver.ms-karistir', { type: 'button', hidden: true }, svg(IKON.tekrar), karYazi);

  const canli = canliSahne();
  canli.gun(0);
  const kamera = h('div.pz-kamera', {}, stand([h('div.pz-mino', {}, mino.el)], [blender.el]), musteriKap);
  const sahne = h('div.pz-sahne', {}, canli.ufuk, kamera);
  const tezgah = onTezgah(h('div.pz-tezgah-ust', {}, karDugme), urunler);
  const zemin = h('div.pz-zemin', { 'aria-hidden': 'true' });
  const el = h(
    'div.pz-pazar.ms-ekran',
    { style: gorselStil('pazar/arkaplan'), 'data-yas': y },
    zemin,
    canli.arka,
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.geri, 'Geri', () => app.git('acilis')), h('div.orta', {}, balon), sesDugmesi()),
    yildizlar,
    sahne,
    tezgah,
  );
  const flamaKapat = flamaYerlestir(el, kamera);
  const kam = oyunKamerasi(el, sahne, kamera, tezgah, zemin, canli.arka, canli.ufuk);
  // istek yakın çekimi sürerken çocuk tezgâha dokunursa kadraj hemen açılır (beklemeden oynar)
  tezgah.addEventListener('pointerdown', () => aktif && kam.yakin && kam.genis(450));
  /** blender'ın yakın çekim kutusu (kolu ve bardağıyla) */
  const blenderKutu = () => kam.kutu(blender.el, { ust: 0.08, alt: 0.04, sol: 0.55, sag: 0.08 });

  let ist: MsIstek = msIstekUret(y, 0);
  let kapandi = false;
  let hata = 0;
  let ipucu = false;
  let dolduDendi = false;
  let basDendi = false;
  let sonHareket = performance.now();
  let sonBirakma = 0;
  let musteri: Musteri | null = null;
  let istekBalon: HTMLElement | null = null;
  let basildi: () => void = () => undefined;
  const sokuler: (() => void)[] = [];
  const soyle = (soz: string | string[]) => {
    sonSoz = [soz].flat();
    return konus(sonSoz);
  };

  /** Karıştır düğmesi ve motor düğmesi: blender'da meyve varken */
  const dugmeGuncelle = () => {
    const var_ = blender.icindekiler.length > 0 && aktif && !blender.calisiyor;
    karDugme.hidden = !var_;
    blender.hazir(var_);
  };

  /** Doğru meyveler parlar (ipucu) */
  function parlat() {
    const dogru = dogruSecim(ist) ?? [];
    for (const e of urunler.querySelectorAll<HTMLElement>('.pz-urun')) e.classList.toggle('pz-parla', dogru.includes(e.dataset.urun ?? ''));
  }

  function koy(e: HTMLElement, id: string) {
    sonHareket = performance.now();
    if (!aktif || blender.calisiyor) {
      geriGonder(e);
      return;
    }
    if (blender.icindekiler.length >= KAPASITE) {
      geriGonder(e);
      efekt.yanlis();
      if (!dolduDendi) void soyle(M.doldu);
      dolduDendi = true;
      return;
    }
    e.classList.remove('pz-parla');
    tasi(e, blender.meyveler);
    setTimeout(() => blender.dustu(SU_KODU[MEYVE_RENGI[id]]), sure(260));
    efekt.yapis();
    dugmeGuncelle();
    // ilk meyvede (3-4 yaş) ya da ikincide (5-6 yaş) düğmeyi hatırlat
    const n = blender.icindekiler.length;
    if (!basDendi && n >= (ist.karisik ? 2 : 1)) {
      basDendi = true;
      void soyle(M.bas);
    }
  }

  function meyveEl(id: string, i: number): HTMLElement {
    const e = h('div.pz-urun', { 'data-urun': id, role: 'img', 'aria-label': meyveAdi(id) }, h('i.pz-urun-golge'), meyveResmi(id));
    const yuva = h('div.pz-yuva', { style: `--i:${i}` }, e);
    sokuler.push(
      surukle({
        el: e,
        hedef: () => blender.el,
        aktif: () => aktif && !blender.calisiyor && e.parentElement === yuva,
        basla: () => {
          sonHareket = performance.now();
          efekt.secim();
          minoCanli.izleBasla();
        },
        tasi: (x) => minoCanli.izle(x),
        birak: (hedefte) => {
          sonBirakma = performance.now();
          minoCanli.izleBitti();
          if (hedefte) koy(e, id);
          else geriGonder(e);
        },
      }),
    );
    // blender'daki meyveye dokununca (karıştırmadan önce) tezgâha geri döner
    e.addEventListener('click', (ev) => {
      // blender'a dokunmak karıştırır: meyveye dokunmak ona sayılmasın
      ev.stopPropagation();
      if (!aktif || blender.calisiyor || e.parentElement !== blender.meyveler || performance.now() - sonBirakma < 400) return;
      efekt.dokunma();
      tasi(e, yuva);
      dugmeGuncelle();
    });
    return yuva;
  }

  /** Tezgâhı (yeniden) dizer: meyveler sırayla düşer */
  function tezgahDiz() {
    sokuler.splice(0).forEach((f) => f());
    urunler.replaceChildren(...ist.tezgah.map((id, k) => meyveEl(id, k)));
    urunler.dataset.adet = String(ist.tezgah.length);
  }

  /** İstek balonunu yeniler (ipucu formülü açılınca) */
  function balonYenile(formul: boolean) {
    if (!istekBalon) return;
    istekBalon.replaceChildren(istekGorseli(ist, formul));
  }

  const basla = (blenderdan: boolean) => {
    // bırakmanın hemen ardından gelen tıklama karıştırmayı başlatmasın
    if (!aktif || blender.calisiyor || blender.icindekiler.length === 0 || (blenderdan && performance.now() - sonBirakma < 400)) return;
    efekt.secim();
    basildi();
  };
  karDugme.addEventListener('click', () => basla(false));
  blender.el.addEventListener('click', () => basla(true));

  // uzun süre hareket yoksa: doğru meyveler parlar, "Meyveyi blendere at!"
  const ipucuSayaci = setInterval(() => {
    if (!aktif || ipucu || TEST_MODU || performance.now() - sonHareket < 12000) return;
    ipucu = true;
    if (blender.icindekiler.length) void soyle(M.bas);
    else {
      parlat();
      void soyle(M.at);
    }
  }, 1000);

  /** Bardak blender'dan müşterinin ağzına uçar (Mino uzatır) */
  async function bardakUcur(renk: string, mu: Musteri) {
    const kaynak = blender.bardak.el;
    const a = kaynak.getBoundingClientRect();
    const b = mu.el.getBoundingClientRect();
    const [ax, ay] = mu.karakter.k.agiz;
    const hedefW = b.width * 0.3;
    const x1 = b.left + b.width * ax;
    const y1 = b.top + b.height * ay + hedefW * 0.2;
    const uc = new Bardak(renk);
    uc.dolu(1);
    uc.el.classList.add('ms-pipetli', 'ms-ucan');
    uc.el.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    app.kok.append(uc.el);
    kaynak.classList.add('ms-gitti');
    const dx = x1 - (a.left + a.width / 2);
    const dy = y1 - (a.top + a.height / 2);
    const s = hedefW / Math.max(1, a.width);
    await uc.el
      .animate(
        [
          { transform: 'translate(0, 0) scale(1) rotate(0)' },
          { transform: `translate(${dx * 0.12}px, ${-a.height * 0.5}px) scale(${(1 + (s - 1) * 0.3).toFixed(2)}) rotate(6deg)`, offset: 0.3, easing: 'cubic-bezier(.3,0,.4,1)' },
          { transform: `translate(${dx}px, ${dy}px) scale(${s.toFixed(2)}) rotate(-4deg)` },
        ],
        { duration: sure(AZ ? 300 : 750), easing: 'ease-in-out', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    uc.el.remove();
  }

  const tur = async (i: number) => {
    ist = msIstekUret(y, i, Math.random, i > 0 ? ist.hedef : undefined);
    hata = 0;
    ipucu = false;
    dolduDendi = false;
    basDendi = false;
    canli.gun(i / (MS_MUSTERI - 1));
    blender.bosalt();
    blender.yeniBardak();
    tezgahDiz();
    el.dataset.hedef = ist.hedef;
    if (onizleme()) el.dataset.istek = JSON.stringify({ hedef: ist.hedef, tezgah: ist.tezgah, dogru: dogruSecim(ist) });

    const ad = musteriler[i];
    musteri?.kapat();
    istekBalon = h('div.pz-istek-balon', {}, istekGorseli(ist, false));
    const mu = new Musteri(ad, resim(`hayvanlar/${ad}`, 'pz-musteri-resim', ad), istekBalon);
    const m = mu.el;
    musteri = mu;
    musteriKap.replaceChildren(m);
    void resimSesi(ad);
    setTimeout(() => minoCanli.karsila(), sure(450));
    kamera.classList.add('pz-yakin');
    sahne.classList.add('pz-yakin');
    await mu.gel();
    if (kapandi) return;
    mu.bekle(true);
    yazi.textContent = ist.yazi;
    mu.konus(true);

    // doğru renk gelene kadar: meyve at → karıştır → dök → iç
    let ilk = true;
    for (;;) {
      // karıştıra basılınca girdi hemen kapanır (istek cümlesi sürerken blender boşaltılamasın)
      const basti = new Promise<void>((r) => (basildi = () => ((aktif = false), r())));
      aktif = true;
      el.classList.add('pz-aktif');
      sonHareket = performance.now();
      dugmeGuncelle();
      if (ilk) {
        ilk = false;
        await soyle(ist.soz);
        mu.konus(false);
      }
      await basti;
      if (kapandi) return;
      aktif = false;
      el.classList.remove('pz-aktif');
      urunler.querySelectorAll('.pz-parla').forEach((e) => e.classList.remove('pz-parla'));
      const icerik = blender.icindekiler;
      const sonuc = karisim(icerik) ?? 'kahverengi';
      el.dataset.sonuc = '';
      // Mino blender'a bakar; blender döner, renk oluşur, bardağa dökülür
      minoCanli.bakin(1, 2800);
      dugmeGuncelle();
      await blender.karistir(
        icerik.map((x) => SU_KODU[MEYVE_RENGI[x]]),
        SU_KODU[sonuc],
      );
      if (kapandi) return;
      await blender.dok(SU_KODU[sonuc]);
      if (kapandi) return;
      // Mino bardağı hazırlık-takip hareketiyle uzatır; bardak müşteriye uçar, müşteri içer
      mino.tepki('sun');
      minoCanli.bakin(-0.9, 2000);
      await bekle(sure(260));
      await bardakUcur(SU_KODU[sonuc], mu);
      if (kapandi) return;
      const icilen = new Bardak(SU_KODU[sonuc]);
      icilen.dolu(1);
      icilen.el.classList.add('ms-pipetli');
      icmeSesi(3, 0.36);
      await mu.ic(icilen.el, icilen.sivi);
      if (kapandi) return;
      const dogru = sonuc === ist.hedef;
      el.dataset.sonuc = dogru ? 'tamam' : 'yanlis';
      if (dogru) break;

      // yanlış renk: komik yüz buruşturma, ceza yok; blender temizlenir, meyveler tezgâha döner
      hata++;
      m.classList.add('pz-burus');
      brrSesi();
      mino.tepki('sasir');
      const soz = [sonuc === 'kahverengi' ? M.kahverengi : rastgele(M.yanlis), M.tekrar];
      await Promise.all([mu.burus(), soyle(soz)]);
      m.classList.remove('pz-burus');
      if (kapandi) return;
      yazi.textContent = ist.yazi;
      blender.bosalt();
      blender.yeniBardak();
      tezgahDiz();
      basDendi = false;
      // ipucu: 5-6 yaşta karışım formülü balonda; iki hatadan sonra (6 yaşta üç) doğru meyveler parlar
      if (ist.karisik) balonYenile(true);
      if (hata >= (y >= 6 ? 3 : 2)) {
        parlat();
        if (ist.karisik) void soyle(M.karistir);
      }
    }

    // doğru renk: müşteri sevinir, kalpler, yıldız
    m.classList.add('sevindi');
    mu.kalpler();
    efekt.dogru();
    void resimSesi(ad);
    parilti(sahne, 0.2, 0.5, 10);
    const r = sahne.getBoundingClientRect();
    konfetiPatlat(app.kok, r.left + r.width * 0.2, r.top + r.height * 0.5, 36);
    void odulAni(app.kok, m, yildizlar.children[i] as HTMLElement | undefined, i, mino);
    kayit.yildiz++;
    kaydet();
    const tesekkur = rastgele(M.dogru);
    yazi.textContent = tesekkur;
    const aciklama = ist.karisik ? karisimCumlesi(ist.hedef) : undefined;
    await Promise.all([soyle(aciklama ? [tesekkur, aciklama] : tesekkur), mu.dans()]);
    if (kapandi) return;
    m.classList.add('gidiyor');
    minoCanli.ugurla();
    kamera.classList.remove('pz-yakin');
    sahne.classList.remove('pz-yakin');
    await mu.git();
  };

  void (async () => {
    await bekle(sure(300));
    if (kapandi) return;
    await soyle(M.giris);
    for (let i = 0; i < MS_MUSTERI && !kapandi; i++) await tur(i);
    if (kapandi) return;
    kayit.senlik++;
    kaydet();
    app.git('senlik', { musteriler, kaynak: 'meyvesuyu', yildiz: MS_MUSTERI });
  })();

  return {
    el,
    kapat() {
      kapandi = true;
      aktif = false;
      basildi();
      clearInterval(ipucuSayaci);
      sokuler.splice(0).forEach((f) => f());
      minoCanli.kapat();
      mino.kapat();
      canli.kapat();
      flamaKapat();
      blender.kapat();
      musteri?.kapat();
    },
  };
}
