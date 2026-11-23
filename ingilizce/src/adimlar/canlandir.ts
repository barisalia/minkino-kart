/**
 * Söyle, Canlansın (Yüzüm · Kardan Adam, Renkler · Boyama Bahçesi, Taşıtlar · Uyanan Taşıtlar). Veri: canlandir-veri.ts.
 *
 * Sahnede bir yer parlar, Polly sorar ("What is it?", "What color?"). Çocuk kelimeyi kendi hatırlayıp söyler (söz tanıma
 * düz söyleme adımıyla aynı: soylet). Söyleyince o yer canlanır: kardan adamın parçası gelir, eşya renge boyanır, taşıt
 * sesini çıkarıp yola çıkar. Bilemezse ipucu: Polly kelimeyi söyler, yazısı görünür; sonra yavaş örnek; sonra yıldız.
 * Hepsi bitince sahnenin tamamı birlikte canlanır.
 */
import { h } from '../../../src/ui/dom';
import { cizim, harfleriYak, hareket, kelimeBandi, kelimeResmi, kutla } from '../kit';
import { efektCal, tik } from '../ses';
import { oyunDuzeni, soylet, yasam, type AdimKurucu } from './ortak';
import { CANLANDIR_SAHNELERI, TUVAL, scYolu, type Kutu } from './canlandir-veri';
import './canlandir.css';

const yuzde = (k: Kutu) => ({ left: `${(k[0] / TUVAL.en) * 100}%`, top: `${(k[1] / TUVAL.boy) * 100}%`, width: `${(k[2] / TUVAL.en) * 100}%`, height: `${(k[3] / TUVAL.boy) * 100}%` });

/** Birden çok kutulu parçanın (kulaklık, eldiven, çizme) çizimi iki kutuyu birlikte saran kutunun boyundadır */
const sarankutu = (l: readonly Kutu[]): Kutu => {
  const x0 = Math.min(...l.map((k) => k[0])), y0 = Math.min(...l.map((k) => k[1]));
  return [x0, y0, Math.max(...l.map((k) => k[0] + k[2])) - x0, Math.max(...l.map((k) => k[1] + k[3])) - y0];
};

/** Katman kutusunun boyunda gelir (açılışta bellek az kalsın); yanlışlıkla tam tuval gelirse tuvali kaplar */
function kutuyaKoy(img: HTMLImageElement, k: Kutu) {
  const yerles = () => {
    const tam = img.naturalWidth >= TUVAL.en - 100;
    Object.assign(img.style, tam ? { inset: '0', left: '0', top: '0', width: '100%', height: '100%' } : { inset: 'auto', ...yuzde(k) });
    img.style.transformOrigin = tam ? `${((k[0] + k[2] / 2) / TUVAL.en) * 100}% ${((k[1] + k[3]) / TUVAL.boy) * 100}%` : '50% 100%';
  };
  yerles();
  if (!img.complete) img.addEventListener('load', yerles, { once: true });
}

export const canlandirKur: AdimKurucu<'canlandir'> = (b, a) => {
  const y = yasam();
  const s = CANLANDIR_SAHNELERI.find((x) => x.ad === a.plan.sahne)!;
  let no = 0;
  const kelime = () => a.plan.kelimeler[no];
  const { masa } = oyunDuzeni(b.alan, `ing-sc ing-sc-${s.ad}`, () => { void y.soyle(s.soru(kelime())); });

  // ---- sahne: fon ve her yerin katmanı (aynı tuval); çizimi yoksa (taslak) yer tutucu kutular
  const sahne = h('div.ing-sc-sahne', { 'data-sahne': s.ad, 'data-canlanma': s.canlanma });
  const fon = cizim(scYolu(s, 'fon'), 'ing-sc-katman ing-sc-fon');
  if (fon) sahne.append(fon); else sahne.style.background = s.renk;
  const katmanlar = new Map<string, HTMLElement[]>();
  // taşıtlar baştan sahnede durur (hepsi yüklenir); kardan adam ve bahçede yalnız bu turda söylenecekler
  const yuklenecek = s.canlanma === 'yola' ? Object.keys(s.yerler) : a.plan.kelimeler.map((w) => w.id);
  for (const id of yuklenecek) {
    const yer = s.yerler[id];
    if (!yer) continue;
    const c = cizim(scYolu(s, id), 'ing-sc-katman ing-sc-parca');
    if (c) kutuyaKoy(c, sarankutu(yer.kutular));
    const parcalar: HTMLElement[] = c ? [c] : yer.kutular.map((k) => {
      const yt = h('span.ing-sc-yer.ing-sc-parca', {}, id);
      Object.assign(yt.style, yuzde(k));
      return yt;
    });
    for (const p of parcalar) {
      if (!c) p.style.transformOrigin = '50% 100%';
      p.dataset.parca = id;
      p.dataset.hareket = yer.hareket;
      sahne.append(p);
    }
    katmanlar.set(id, parcalar);
  }

  // ---- yan: (renklerde) renk kartı, kelimenin yazısı (ipucunda), mikrofon
  const kartYeri = h('div.ing-sc-kart');
  const bantYeri = h('div.ing-bant-yeri');
  const altlik = h('div.ing-tanis-alt.ing-sc-altlik');
  masa.append(h('div.ing-sc-duzen', {}, sahne, h('div.ing-sc-yan', {}, kartYeri, bantYeri, altlik)));

  const isiklar: HTMLElement[] = [];
  const isikKaldir = () => { isiklar.splice(0).forEach((x) => x.remove()); };
  const canlan = (p: HTMLElement) => { p.classList.remove('ing-sc-canli'); void p.offsetWidth; p.classList.add('ing-sc-canli'); };

  async function sor() {
    const w = kelime();
    const yer = s.yerler[w.id];
    sahne.dataset.hedef = w.id;
    for (const k of yer.kutular) {
      const isik = h('span.ing-sc-isik', { 'aria-hidden': 'true' });
      Object.assign(isik.style, yuzde(k));
      sahne.append(isik);
      isiklar.push(isik);
    }
    kartYeri.replaceChildren(...(s.kartGoster ? [kelimeResmi(w, 'ing-sc-renk-karti')] : []));
    const bant = kelimeBandi(w);
    bant.hidden = true;
    const bantAc = () => { if (bant.hidden) { bant.hidden = false; harfleriYak(bant, 600); } };
    bantYeri.replaceChildren(bant);
    if (!(await y.dur(250)) || !(await y.soyle(s.soru(w)))) return;
    await soylet(altlik, y, {
      beklenen: w.en,
      rakipler: Object.keys(s.yerler).filter((id) => id !== w.id),
      ornek: `en/w-${w.id}-yavas`,
      ipucu: ['en/g-listen', `en/w-${w.id}`],
      ipucuOncesi: bantAc,
    });
    if (!y.acik) return;
    isikKaldir();
    bantAc();
    tik.yapis();
    const parcalar = katmanlar.get(w.id) ?? [];
    for (const p of parcalar) { p.classList.add('ing-sc-geldi'); canlan(p); }
    if (parcalar[0]) kutla(parcalar[0]);
    void hareket('polly', 'sevin');
    if (s.canlanma === 'yola') await efektCal(`efekt/${w.id}`);
    if (!(await y.soyle('en/g-yes', `en/w-${w.id}`))) return;
    no++;
    if (no < a.plan.kelimeler.length) { void sor(); return; }
    await son();
  }

  /** Hepsi tamam: söylenen parçalar sırayla bir daha canlanır, Polly sahneyi selamlar */
  async function son() {
    kartYeri.replaceChildren();
    bantYeri.replaceChildren();
    delete sahne.dataset.hedef;
    sahne.classList.add('ing-sc-tamam');
    a.plan.kelimeler.forEach((w, i) => y.sonra(() => (katmanlar.get(w.id) ?? []).forEach(canlan), 200 * i));
    kutla(sahne);
    if (!(await y.soyle(s.son.id))) return;
    if (!(await y.dur(800))) return;
    b.bitti();
  }

  b.tekrarla(() => { if (no < a.plan.kelimeler.length) void y.soyle(s.soru(kelime())); });
  void (async () => {
    if (!(await y.soyle(s.giris.id))) return;
    await sor();
  })();
  return () => { isikKaldir(); y.kapat(); };
};
