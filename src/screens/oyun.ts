import { efekt, konus } from '../audio/ses';
import { metin } from '../audio/metin';
import { durum, kaydetDurum } from '../engine/ilerleme';
import { sorular as tumSorular, temaBul } from '../engine/katalog';
import { odulKartiSec, yildizHesapla, yeniAcilanlar } from '../engine/odul';
import { soruHazirla, turOlustur } from '../engine/tur';
import type { Soru, Yas } from '../engine/types';
import { bekle, h, sure, TEST_MODU } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { kartEl } from '../ui/kart';
import { konfetiPatlat } from '../ui/konfeti';
import { merkez, sinifOynat, ucur } from '../ui/hareket';
import { albumDugmesi, yuvarlakDugme } from '../ui/ortak';
import type { Ekran, Uygulama } from '../uygulama';
import { eslestirCiz } from './sorular/eslestir';
import { hafizaCiz } from './sorular/hafiza';
import { secmeliCiz } from './sorular/secmeli';

export interface SoruBaglam {
  app: Uygulama;
  soru: Soru;
  yas: Yas;
  alan: HTMLElement;
  gosterge: HTMLElement;
  secenek: HTMLElement;
  /** Doğru cevap. `el`: ödül kartının uçacağı yer; `aciklama`: övgüden sonra söylenecek cümle. */
  dogru(el: HTMLElement | null, aciklama: string): void;
  /** Yanlış cevap. `el` sallanır, `dogruEl` ışıldar. */
  yanlis(el: HTMLElement, dogruEl: HTMLElement | null, soldur?: boolean): void;
  temizlik(fn: () => void): void;
}

const CIZICILER: Record<Soru['tip'], (b: SoruBaglam) => void> = {
  BUL: secmeliCiz,
  SAY: secmeliCiz,
  FARKLI: secmeliCiz,
  SIRADAKI: secmeliCiz,
  ESLESTIR: eslestirCiz,
  HAFIZA: hafizaCiz,
};

export interface TurSonucu {
  tema: string;
  yildiz: 1 | 2 | 3;
  yeniKartlar: string[];
  acilanTemalar: string[];
}

export function oyunEkrani(app: Uygulama, param: { tema: string }): Ekran {
  const yas = (durum.i.yas ?? 3) as Yas;
  const tema = temaBul(param.tema) ?? temaBul('hayvanlar')!;
  const sorular = turOlustur(yas, tema.id);
  // Test kısayolu: ?test=1&tip=SAY → tur o tipteki bir soruyla başlar
  const testTip = TEST_MODU ? new URLSearchParams(location.search).get('tip') : null;
  if (testTip) {
    const havuz = tumSorular(yas, tema.id).filter((q) => q.tip === testTip);
    if (havuz.length) sorular[0] = soruHazirla(havuz[Number(new URLSearchParams(location.search).get('n') ?? 0) % havuz.length]);
  }
  const albumOnce = durum.i.album.length;

  let sira = 0;
  let ilkDenemede = 0;
  const yeniKartlar: string[] = [];
  let temizlikler: (() => void)[] = [];
  let kapandi = false;
  let bosta: number | undefined;

  const album = albumDugmesi(() => app.git('album', { tema: tema.id }));
  const ilerleme = h('div.ilerleme', { 'aria-hidden': 'true' });
  sorular.forEach(() => ilerleme.append(h('i')));

  const hop = yuvarlakDugme(IKON.hoparlor, 'Soruyu tekrar dinle', () => void soruyuSoyle());
  hop.classList.add('soru-hop');
  const balon = h('div.soru-balon', {}, hop);
  const alan = h('div.oyun-alan');

  const el = h(
    'div.oyun',
    { style: `--tema:${tema.renk}`, 'data-tema': tema.id },
    h('div.ust-cubuk', {}, yuvarlakDugme(IKON.ev, 'Paketlere dön', () => app.git('temalar')), h('div.orta', {}, ilerleme), album.el),
    balon,
    alan,
  );

  async function soruyuSoyle() {
    const s = sorular[sira];
    if (!s) return;
    balon.classList.add('konusuyor');
    await konus(s.soru_ses ?? s.soru_metni);
    balon.classList.remove('konusuyor');
  }

  function bostaSayaci() {
    clearTimeout(bosta);
    if (TEST_MODU) return;
    bosta = window.setTimeout(() => {
      if (!kapandi) void soruyuSoyle();
    }, 16000);
  }
  el.addEventListener('pointerdown', bostaSayaci);

  function temizle() {
    temizlikler.forEach((f) => f());
    temizlikler = [];
  }

  function soruGoster() {
    temizle();
    const s = sorular[sira];
    [...ilerleme.children].forEach((n, i) => n.classList.toggle('simdi', i === sira));

    // Balon: hoparlör + (ikon) + metin (5-6 yaş) ya da ses dalgaları
    balon.replaceChildren(hop);
    if (s.ikon) balon.append(kartEl(s.ikon, { sinif: 'soru-ikon' }));
    if (yas >= 5) balon.append(h('div.soru-metin', {}, s.soru_metni));
    else {
      const d = h('div.soru-dalgalar', { 'aria-label': s.soru_metni });
      for (let i = 0; i < 7; i++) d.append(h('i', { style: `--i:${i}` }));
      balon.append(d);
    }

    const gosterge = h('div.gosterge-alan');
    const secenek = h('div.secenek-alan');
    alan.className = 'oyun-alan';
    alan.dataset.tip = s.tip;
    alan.replaceChildren(gosterge, secenek);

    let yanlisVar = false;
    let yanlisSayisi = 0;
    let cozuldu = false;
    const b: SoruBaglam = {
      app,
      soru: s,
      yas,
      alan,
      gosterge,
      secenek,
      temizlik: (f) => temizlikler.push(f),
      dogru: (hedefEl, aciklama) => {
        if (cozuldu || kapandi) return;
        cozuldu = true;
        if (!yanlisVar) ilkDenemede++;
        void dogruAkisi(s, hedefEl, aciklama);
      },
      yanlis: (yEl, dogruEl, soldur = true) => {
        if (cozuldu || kapandi) return;
        yanlisVar = true;
        yanlisSayisi++;
        efekt.yanlis();
        void sinifOynat(yEl, 'sallan', 500).then(() => soldur && yEl.classList.add('soluk'));
        dogruEl?.classList.add('isilti');
        const ipucu = s.ipucu && yanlisSayisi === 1 ? s.ipucu : `${metin('tekrar_dene')} ${metin('ipucu_genel')}`;
        void konus(ipucu);
      },
    };
    CIZICILER[s.tip](b);
    void soruyuSoyle();
    bostaSayaci();
  }

  async function dogruAkisi(s: Soru, hedefEl: HTMLElement | null, aciklama: string) {
    efekt.dogru();
    const m = merkez(hedefEl ?? alan);
    konfetiPatlat(app.kok, m.x, m.y, 80);
    setTimeout(() => efekt.konfeti(), 120);
    const nokta = ilerleme.children[sira];
    nokta?.classList.add('tamam');

    const sahip = new Set([...durum.i.album, ...yeniKartlar]);
    const odul = odulKartiSec(s, tema.id, sahip);
    const konusma = konus(`${metin('dogru')} ${aciklama}`.trim());
    let ucus: Promise<void> = Promise.resolve();
    if (odul) {
      yeniKartlar.push(odul);
      durum.i.album.push(odul);
      kaydetDurum();
      ucus = bekle(sure(650)).then(async () => {
        if (kapandi) return;
        efekt.ucus();
        const kaynak = hedefEl ?? alan;
        await ucur(app.kok, kartEl(odul, { ornek: true }), kaynak, album.el, 0.3, 800);
        if (kapandi) return;
        efekt.yapis();
        album.artir();
      });
    }
    await Promise.all([konusma, ucus, bekle(sure(1500))]);
    if (kapandi) return;
    sira++;
    if (sira < sorular.length) {
      alan.style.transition = 'opacity .2s';
      alan.style.opacity = '0';
      await bekle(sure(220));
      alan.style.opacity = '';
      soruGoster();
    } else bitir();
  }

  function bitir() {
    const yildiz = yildizHesapla(ilkDenemede, sorular.length);
    const i = durum.i;
    const anahtar = `${yas}-${tema.id}`;
    i.enIyi[anahtar] = Math.max(i.enIyi[anahtar] ?? 0, yildiz);
    i.toplamYildiz += yildiz;
    i.turSayisi++;
    i.album = [...new Set(i.album)];
    const acilan = yeniAcilanlar(albumOnce, i.album.length, i.premium).map((t) => t.id);
    kaydetDurum();
    const sonuc: TurSonucu = { tema: tema.id, yildiz, yeniKartlar, acilanTemalar: acilan };
    app.git('turSonu', sonuc);
  }

  if (sorular.length === 0) {
    alan.append(h('div.yukleniyor', {}, 'Bu paket yakında!'));
  } else {
    requestAnimationFrame(() => soruGoster());
  }

  return {
    el,
    kapat() {
      kapandi = true;
      clearTimeout(bosta);
      temizle();
    },
  };
}
