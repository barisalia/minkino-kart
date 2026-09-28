/**
 * Pazar şarkısı (Gemini kaydı, assets/muzik/pazar.json): "Bir elma, iki armut / Üç çilek, dört de üzüm /
 * Mino'nun pazarı / Hadi gel, say bizimle". Pazar açılırken bir kez çalar. Oyun kaydın notalarına ve ritmine göre
 * ilerler: sayı sözü söylenince tezgâhta o grubun sayı rozeti çıkar, meyvenin adı söylenince o meyveler sırayla
 * zıplar (1 elma, 2 armut, 3 çilek, 4 üzüm); heceler başlık balonunda karaoke gibi yanar. Çocuk ekrana dokunarak
 * ritme alkışlar (pazarda mikrofon yok; vuruşa yakın dokunuş parıltı + meyve zıplaması, ceza yok, geçme koşulu yok).
 */
import SARKI_SESI from '../../assets/muzik/pazar-sozlu.mp3?url';
import { efekt } from '../../src/audio/ses';
import { KayitCalar, kelimeBaslari, vurusaYakin } from '../../src/audio/sarki-kayit';
import type { Mino } from '../../src/mino/mino';
import { h, sure } from '../../src/ui/dom';
import { parilti, resim } from './gorsel';
import { urunAdi } from './istek';
import { PAZAR_SARKI, PAZAR_SOZ, sayimPlani } from './sarki-plan';

const KELIME_BASI = kelimeBaslari(PAZAR_SOZ);

export interface PazarSarkisi {
  bitti: Promise<void>;
  durdur(): void;
}

/**
 * Şarkıyı çalar. urunler: tezgâhtaki ürün alanı (sayım sırası buraya konur, bitince kalkar); yazi: başlık balonunun
 * yazısı (karaoke); ekran: dokunma (alkış) alanı.
 */
export function pazarSarkisi(p: { urunler: HTMLElement; yazi: HTMLElement; ekran: HTMLElement; mino: Mino }): PazarSarkisi {
  const T = PAZAR_SARKI;
  const plan = sayimPlani(T);
  // tezgâhta sayım sırası: her grup kendi rozetiyle
  const gruplar = plan.map((s) => {
    const meyveler = Array.from({ length: s.adet }, (_, k) => h('span.pz-sarki-meyve', { style: `--k:${k}` }, resim(`meyveler/${s.meyve}`, '', urunAdi(s.meyve))));
    const rozet = h('b.pz-sarki-rozet', { 'aria-hidden': 'true' }, String(s.adet));
    return { s, el: h('div.pz-sarki-grup', { 'data-meyve': s.meyve }, rozet, h('span.pz-sarki-meyveler', {}, ...meyveler)), meyveler };
  });
  const sira = h('div.pz-sarki-sira', {}, ...gruplar.map((g) => g.el));
  p.urunler.append(sira);
  p.ekran.dataset.sarki = 'caliyor';

  // karaoke: balonda o anki satır, heceler sırayla yanar
  const eskiYazi = p.yazi.textContent;
  const heceEl = T.heceler.map((x) => h('span.pz-hece', {}, x.hece));
  let satir = -1;
  const satirGoster = (s: number) => {
    satir = s;
    const parcalar: (HTMLElement | string)[] = [];
    T.heceler.forEach((x, i) => {
      if (x.satir !== s) return;
      if (parcalar.length && KELIME_BASI.has(i)) parcalar.push(' ');
      parcalar.push(heceEl[i]);
    });
    p.yazi.replaceChildren(...parcalar);
  };

  const zipla = (e: HTMLElement, gecikme = 0) =>
    setTimeout(() => {
      e.classList.remove('zipla');
      void e.offsetWidth;
      e.classList.add('zipla');
    }, sure(gecikme));

  const sayiSirasi = new Map(plan.map((s, i) => [s.sayiHece, i]));
  const adSirasi = new Map(plan.map((s, i) => [s.adHece, i]));
  let isabet = 0;
  let sonVurus = -1;
  const calar = new KayitCalar({
    url: SARKI_SESI,
    tablo: T,
    yedekNota: (x) => efekt.nota(Math.max(0, Math.round((x.midi - 60) / 2))),
    onHece: (i) => {
      const x = T.heceler[i];
      if (x.satir !== satir) satirGoster(x.satir);
      heceEl.forEach((e, k) => e.classList.toggle('simdi', k === i));
      const sy = sayiSirasi.get(i);
      if (sy !== undefined) gruplar[sy].el.classList.add('sayildi');
      const ad = adSirasi.get(i);
      if (ad !== undefined) {
        const g = gruplar[ad];
        const ara = Math.min(240, g.s.adet > 1 ? plan[ad].sureMs / g.s.adet : 0);
        g.meyveler.forEach((m, k) => zipla(m, k * ara));
      }
      // "Mino'nun pazarı": Mino sevinir; "Hadi gel": el sallar
      if (x.satir === 2 && T.heceler[i - 1]?.satir === 1) p.mino.tepki('dans');
      if (x.satir === 3 && T.heceler[i - 1]?.satir === 2) p.mino.tepki('selam');
    },
    onVurus: (i) => {
      // son iki satırda ("Mino'nun pazarı / Hadi gel, say bizimle") bütün meyveler vuruşta sırayla zıplar
      const t = T.vuruslar[i];
      if (t >= T.satirlar[2][0].basMs - 100) {
        const g = gruplar[i % gruplar.length];
        g.meyveler.forEach((m, k) => zipla(m, k * 60));
      }
    },
  });

  // alkış = ekrana dokunuş (vuruşa yakınsa parıltı ve o anki grup zıplar)
  const alkis = (e: PointerEvent) => {
    const y = vurusaYakin(T.vuruslar, calar.zaman, 260);
    const r = p.ekran.getBoundingClientRect();
    if (y && y.sira !== sonVurus) {
      sonVurus = y.sira;
      isabet++;
      p.ekran.dataset.alkis = String(isabet);
      parilti(p.ekran, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 6);
      const g = gruplar[y.sira % gruplar.length];
      g.meyveler.forEach((m, k) => zipla(m, k * 50));
    } else parilti(p.ekran, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 2);
  };
  p.ekran.addEventListener('pointerdown', alkis);

  let temiz = false;
  const kapat = () => {
    if (temiz) return;
    temiz = true;
    p.ekran.removeEventListener('pointerdown', alkis);
    p.ekran.dataset.sarki = 'bitti';
    p.yazi.textContent = eskiYazi;
    sira.classList.add('gidiyor');
    setTimeout(() => sira.remove(), sure(400));
  };
  const bitti = calar.cal().then(async () => {
    if (!temiz) {
      p.mino.tepki('sevinc');
      await new Promise((r) => setTimeout(r, sure(500)));
    }
    kapat();
  });
  return {
    bitti,
    durdur() {
      calar.durdur();
      kapat();
    },
  };
}
