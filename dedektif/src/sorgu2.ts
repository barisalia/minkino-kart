/**
 * Vaka 2'nin soru katmanları (sorgu.ts'nin kalıbında: perde iner, delil ortaya gelir, kartlar sürüklenir ya da dokunulur):
 * - yanlış kartların sahneleri (Halka 1: makas ipi gösterir, yağmur bulutu utanır; Halka 2: ayak izi gerçek boyunda
 *   ize konur, taşar ya da aşar, Karabaş ve tavşan karttan çıkıp konuşur);
 * - Halka 4 "ses ipucu": üç çalının fotoğrafı (dokununca sesi), hayvan kartları çalıya sürüklenir;
 * - Halka 5 "sıralama": üç olay kartı üç boş kareye;
 * - "Demek ki…" kartı (sorgusuz halkalar için): ortaya gelir, Mino söyler, dosyaya uçar.
 * Hiçbiri kilitlenmez: 7 sn hareketsizlikte parmak gösterir, 2 yanlıştan sonra doğru yol parlar. Yanlışlar komik ve
 * nazik (ceza yok). Yalnız transform / opacity.
 */
import D from '../../content/dedektif.json';
import { efekt } from '../../src/audio/ses';
import { boyGenislik } from '../../src/karakter/boy';
import { Karakter } from '../../src/karakter/karakter';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { type Efekt, oynat, parmak, pop, salla } from './efekt';
import { M, YARDIM } from './mantik';
import { AYAK_BOYU, CALILAR, G2, IZ_YERI, K2, KARTLAR2, M2, OLAYLAR, olaySirasi, SesSorusu, Siralama, uyum, type Cali } from './mantik2';
import type { Oyuncular } from './oyuncular';
import { resim } from './resimler';
import { ses } from './sesler';
import { geriDon, kartGotur, type YanlisAni } from './sorgu';

export interface Ortak {
  kok: HTMLElement;
  efekt: Efekt;
  oy: Oyuncular;
  rnd: () => number;
  kapandi: () => boolean;
  bekle: (ms: number) => Promise<void>;
  adim: (ad: string) => void;
}

const img = (ad: string, sinif = '') => (sinif ? h(`img.${sinif}`, { src: resim(ad) ?? '', alt: '', draggable: 'false' }) : h('img', { src: resim(ad) ?? '', alt: '', draggable: 'false' }));

// ---------------------------------------------------------------- yanlış kart sahneleri (sorgu.ts → yanlisAni)
/** Kart ipucunun üstüne gelir, oturmaz, yumuşakça seker; sonra köşeye çekilir (sorgu.ts varsayılanı gibi) */
async function yaklasSek(o: Ortak, a: YanlisAni) {
  await kartGotur(a.k, a.ic, 0.5, 0.5, a.ic.width * 0.55, 0, 300);
  ses.sek();
  void salla(a.delil);
  o.oy.minoTepki('kararsiz', 1.2);
  const yan = a.delil.getBoundingClientRect();
  await kartGotur(a.k, yan, 0.84, 0.74, Math.min(yan.width * 0.52, 200), 7, 360);
}

/** Halka 1: makas ipi gösterir (ip parlar, sapasağlam); yağmur bulutu utanıp küçülür (çimler kupkuru) */
export function neYanlis(o: Ortak, ipGoster: () => Promise<void>) {
  return async (a: YanlisAni) => {
    await yaklasSek(o, a);
    if (o.kapandi()) return;
    if (a.id === 'makas') {
      // makas "şıp şıp" eder, perde aralanır: ip boydan boya parlar, kesik yok
      ses.makas();
      const ic = a.k.querySelector<HTMLElement>('.dd-kart-ic');
      if (ic && !AZ_HAREKET) void ic.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0)' }], { duration: sure(520), easing: 'ease-in-out' });
      o.oy.minoTepki('hayir');
      const sorgu = a.k.closest('.dd-sorgu');
      sorgu?.classList.add('dd-perde-aralik');
      await Promise.all([ipGoster(), o.oy.soyle(M2.ip_kesik)]);
      sorgu?.classList.remove('dd-perde-aralik');
    } else if (a.id === 'yagmur') {
      // bulut utanır: kızarır, küçülür, sonra yavaşça toparlanır
      const ic = a.k.querySelector<HTMLElement>('.dd-kart-ic');
      a.k.classList.add('dd-utandi');
      const an = ic && !AZ_HAREKET ? ic.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.72) translateY(6%)', offset: 0.25 }, { transform: 'scale(0.74) translateY(6%) rotate(-4deg)', offset: 0.6 }, { transform: 'scale(0.72) translateY(6%)' }], { duration: sure(1800), easing: 'ease-out', fill: 'forwards' }) : null;
      ses.hmm();
      o.oy.minoTepki('hayir');
      await o.oy.soyle(M2.kupkuru);
      an?.cancel();
      a.k.classList.remove('dd-utandi');
    }
  };
}

/**
 * Halka 2: kart gerçek boyunda izin üstüne konur (çizim esnemez, yalnız eşit ölçek): köpek patisi taşar, tavşan
 * ayağı boydan boya aşar; sonra karttan sahibi çıkar ve konuşur.
 */
export function kimYanlis(o: Ortak) {
  return async (a: YanlisAni) => {
    const oran = AYAK_BOYU[a.id as keyof typeof AYAK_BOYU] ?? 1;
    const iz = IZ_YERI;
    // kartın çerçevesi kalkar: yalnız ayak silüeti izin üstüne iner
    a.k.classList.add('dd-sade', 'dd-olcu');
    await kartGotur(a.k, a.ic, iz.x, iz.y, a.ic.width * iz.w * oran * 1.28, iz.don, 520);
    if (o.kapandi()) return;
    ses.sek();
    void salla(a.delil);
    const u = uyum(oran);
    // taşan kenarlar kısa süre kırmızımsı yanıp söner (büyük: taşar)
    a.k.classList.add(u === 'tasar' ? 'dd-tasti' : 'dd-yuzdu');
    o.oy.minoTepki('kararsiz', 1.4);
    await o.bekle(650);
    a.k.classList.remove('dd-tasti', 'dd-yuzdu');
    const yan = a.delil.getBoundingClientRect();
    a.k.classList.remove('dd-sade', 'dd-olcu');
    await kartGotur(a.k, yan, 0.84, 0.74, Math.min(yan.width * 0.52, 200), 7, 360);
    if (o.kapandi()) return;
    if (a.id === 'kopek-izi') await konukCikar(o, a, 'kopek', G2.karabas, 'patisini');
    else if (a.id === 'tavsan-izi') await konukCikar(o, a, 'tavsan', G2.tavsan, 'zipla');
  };
}

/** İz kendi kenarını bir kez parlatır (2 yanlıştan sonra: şekli gösterir) */
export function izParla(kok: HTMLElement) {
  const ic = kok.querySelector('.dd-sorgu .dd-delil-ic');
  if (!ic) return;
  const p = h('i.dd-iz-kenar', { style: `left:${IZ_YERI.x * 100}%;top:${IZ_YERI.y * 100}%;width:${IZ_YERI.w * 100 * 1.15}%;--don:${IZ_YERI.don}deg` }, img('v2/kart-ordek-izi'));
  ic.append(p);
  window.setTimeout(() => p.remove(), sure(2400));
}

/**
 * Kartın sahibi karttan çıkar (Karakter iskeleti: nefes alır, göz kırpar), boyu Mino'ya göre (src/karakter/boy.ts):
 * Karabaş patisini kaldırıp "Benim ayağım kocaman!"; tavşan iki kez zıplar, arkasında iki uzun iz kalır.
 */
async function konukCikar(o: Ortak, a: YanlisAni, ad: 'kopek' | 'tavsan', soz: string, hareket: 'patisini' | 'zipla') {
  const kk = o.kok.getBoundingClientRect();
  const r = a.k.getBoundingClientRect();
  const dar = kk.width < kk.height * 1.15;
  const minoW = o.oy.minoYer.getBoundingClientRect().width || 120;
  const w = Math.min(boyGenislik(ad, minoW), kk.width * (dar ? 0.62 : 0.34));
  const sx = kk.width * (dar ? 0.5 : 0.6);
  const sy = kk.height * (dar ? 0.985 : 0.99);
  const k = new Karakter(ad, h('div'));
  const kutu = h('div.dd-konuk-kutu', {}, k.el);
  const z = h('div.dd-konuk', { 'data-konuk': ad, style: `left:${sx}px;top:${sy}px;width:${w}px` }, kutu);
  const sahne = a.sahnecik;
  sahne.append(z);
  const dx = r.left - kk.left + r.width / 2 - sx;
  const dy = r.top - kk.top + r.height / 2 - sy;
  const gel = AZ_HAREKET
    ? null
    : z.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 },
          { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - w * 0.35}px) translate(-50%, -100%) scale(0.85)`, opacity: 1, offset: 0.55 },
          { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 },
        ],
        { duration: sure(640), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'forwards' },
      );
  if (AZ_HAREKET) z.style.transform = 'translate(-50%, -100%)';
  ses.pop();
  await gel?.finished.catch(() => undefined);
  if (o.kapandi()) {
    k.kapat();
    return;
  }
  o.oy.konukBagla(k, kutu, 0.12);
  const izler: HTMLElement[] = [];
  if (hareket === 'zipla') {
    // iki zıplama: her inişte arkasında uzun bir iz kalır (Mino güler)
    for (let i = 0; i < 2; i++) {
      const x = (i ? 1 : -1) * w * 0.32;
      if (!AZ_HAREKET)
        await kutu
          .animate(
            [
              { transform: `translate(${i ? -w * 0.32 : 0}px, 0) scale(1.05, 0.95)` },
              { transform: `translate(${(x + (i ? -w * 0.32 : 0)) / 2}px, -${w * 0.42}px) scale(0.97, 1.03)`, offset: 0.5 },
              { transform: `translate(${x}px, 0) scale(1.05, 0.95)`, offset: 0.85 },
              { transform: `translate(${x}px, 0)` },
            ],
            { duration: sure(520), easing: 'cubic-bezier(.4,0,.4,1)', fill: 'forwards' },
          )
          .finished.catch(() => undefined);
      ses.pop();
      const iz = img('v2/kart-tavsan-izi', 'dd-konuk-iz');
      iz.style.cssText = `left:${sx + x}px;top:${sy - 4}px;width:${w * 0.42}px;--don:${i ? 8 : -6}deg`;
      sahne.append(iz);
      izler.push(iz);
    }
    const soz1 = o.oy.soyle(soz, ad);
    await o.bekle(700);
    o.oy.minoTepki('gidik');
    await soz1.catch(() => undefined);
  } else {
    // Karabaş patisini kaldırır: kocaman pati kartı yanında büyür
    const pati = img('v2/kart-kopek-izi', 'dd-konuk-pati');
    pati.style.cssText = `left:${sx + w * 0.42}px;top:${sy - w * 0.62}px;width:${w * 0.5}px`;
    sahne.append(pati);
    izler.push(pati);
    if (!AZ_HAREKET) void pati.animate([{ transform: 'translate(-50%, -50%) scale(0.2) rotate(-20deg)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1.15) rotate(8deg)', opacity: 1, offset: 0.5 }, { transform: 'translate(-50%, -50%) scale(1) rotate(0)', opacity: 1 }], { duration: sure(620), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'both' });
    else pati.style.transform = 'translate(-50%, -50%)';
    if (!AZ_HAREKET) void k.oynat('sevin', 900);
    await o.oy.soyle(soz, ad);
  }
  if (o.kapandi()) {
    k.kapat();
    return;
  }
  // karta geri girer
  const don = AZ_HAREKET
    ? null
    : z.animate(
        [
          { transform: 'translate(-50%, -100%) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) translate(-50%, -60%) scale(0.15)`, opacity: 0 },
        ],
        { duration: sure(420), easing: 'ease-in', fill: 'forwards' },
      );
  for (const x of izler) x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(400), fill: 'forwards' });
  await don?.finished.catch(() => undefined);
  o.oy.konukBagla(null, kutu);
  z.remove();
  izler.forEach((x) => x.remove());
  k.kapat();
}

// ---------------------------------------------------------------- "Demek ki…" (sorgusuz halkalar)
/** Demek ki kartı ortaya gelir (fotoğraf çevrilir), Mino söyler, kart dosyadaki göze uçar */
export async function demekGoster(o: Ortak, resimAd: string, cumle: string, goz: HTMLElement | null) {
  const katman = h('div.dd-sorgu.dd-sorgu-demek');
  const perde = h('div.dd-perde');
  const demek = h('div.dd-demek', {}, h('b', {}, D.yazi.demek_ki), img(resimAd), h('i.dd-tik'));
  const delil = h('div.dd-delil', {}, h('div.dd-delil-ic', {}), h('i.dd-bant'), demek);
  katman.append(perde, delil);
  o.kok.append(katman);
  katman.classList.add('acik');
  if (!AZ_HAREKET) void delil.animate([{ transform: 'translateY(30px) scale(0.6) rotate(-8deg)', opacity: 0 }, { transform: 'scale(1.06) rotate(2deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: sure(520), easing: 'cubic-bezier(.3,.9,.4,1)', fill: 'backwards' });
  demek.style.opacity = '1';
  ses.muhur();
  efekt.ucus();
  await o.bekle(300);
  await o.oy.soyle(cumle);
  if (o.kapandi()) return;
  await dosyayaUcur(o, delil, goz, perde);
  katman.classList.add('kapaniyor');
  await o.bekle(260);
  katman.remove();
}

/** Delili dosyadaki göze uçurur (kopyası uçar, aslı söner) */
async function dosyayaUcur(o: Ortak, delil: HTMLElement, hedef: HTMLElement | null, perde: HTMLElement) {
  if (!hedef) return;
  const [x0, y0] = o.efekt.merkez(delil);
  const [x1, y1] = o.efekt.merkez(hedef);
  const a = delil.getBoundingClientRect();
  const b = hedef.getBoundingClientRect();
  const kopya = delil.cloneNode(true) as HTMLElement;
  kopya.classList.remove('dd-cevir', 'dd-isil', 'dd-uzerinde');
  kopya.querySelector<HTMLElement>('.dd-demek')?.style.setProperty('opacity', '1');
  kopya.style.cssText = `position:relative;left:auto;top:auto;width:${a.width}px;height:${a.height}px;rotate:-2deg`;
  delil.style.opacity = '0';
  perde.classList.add('kalkiyor');
  efekt.ucus();
  await o.efekt.ucur(kopya, [x0, y0], [x1, y1], { ms: 640, kavis: -90, boy1: Math.max(0.12, b.width / a.width), don: -10 });
  ses.yapis();
}

// ---------------------------------------------------------------- Halka 4: ses ipucu
/** Çalının fotoğrafı: gölet resminden kırpım (resim esnemez: yalnız eşit ölçek ve kaydırma, yüzdeyle) */
function caliFoto(c: Cali, url: string): HTMLElement {
  const W = 4096 / 2286; // oda en / boy
  const cx = (c.x0 + c.x1) / 2;
  const cy = (c.y0 + c.y1) / 2 + 0.01;
  // kırpım: çalının ~1.3 katı genişlikte, 4:3 (fotoğraf kutusu da 4:3)
  const cw = (c.x1 - c.x0) * 1.32;
  const ch = (cw * W * 3) / 4;
  const x0 = cx - cw / 2;
  const y0 = cy - ch / 2;
  return h('div.dd-cali-foto-ic', {}, h('img', { src: url, alt: '', draggable: 'false', style: `width:${(100 / cw).toFixed(2)}%;left:${((-x0 / cw) * 100).toFixed(2)}%;top:${((-y0 / ch) * 100).toFixed(2)}%` }));
}

/** Çalının sesi (yüksek: yardım) */
export function caliSesi(s: Cali['ses'], yuksek = false) {
  if (s === 'kurbaga') ses.virak(yuksek);
  else if (s === 'ari') ses.vizz(yuksek);
  else ses.vakvak(yuksek);
}

export interface SesSecenek extends Ortak {
  goz: () => HTMLElement | null;
}

/**
 * "Ördek hangi sesi çıkarır?": üç çalının fotoğrafı (dokununca sesi), üç hayvan kartı. Ördek kartı ördeğin çalısına
 * oturunca çözülür. Kurbağa / arı kartı kendi çalısına uçar ve sesini çıkarır (eşleşme gösterilir); ördek yanlış
 * çalıya konursa o çalı sesini çalar, kart geri seker. 2 yanlıştan sonra doğru çalı bir kez daha, yüksek çalar.
 */
export async function sesSorgu(o: SesSecenek): Promise<void> {
  const soru = new SesSorusu(CALILAR);
  const url = resim('v2/bahce-golet') ?? '';
  const katman = h('div.dd-sorgu.dd-ses-sorgu', { 'data-halka': 'ses' });
  const perde = h('div.dd-perde');
  const fotolar = CALILAR.map((c, i) =>
    h('button.dd-cali-foto', { type: 'button', 'data-cali': String(i), 'data-ses': c.ses, 'aria-label': `Çalı ${i + 1}`, style: `--i:${i}` }, caliFoto(c, url), h('i.dd-bant'), h('i.dd-hoparlor'), h('div.dd-cali-oturan')),
  );
  const sira = ['kurbaga', 'ari', 'ordek'];
  // karışık sıra (test: sabit)
  if (!TEST_MODU) for (let i = sira.length - 1; i > 0; i--) {
    const j = Math.floor(o.rnd() * (i + 1));
    [sira[i], sira[j]] = [sira[j], sira[i]];
  }
  const kartlar = sira.map((id, i) =>
    h('button.dd-kart', { type: 'button', 'data-kart': id, 'aria-label': id, style: `--i:${i};--kr:${KARTLAR2[id].renk}` }, h('span.dd-kart-ic', {}, img(KARTLAR2[id].resim))),
  );
  if (TEST_MODU) kartlar.forEach((k) => k.dataset.kart === 'ordek' && (k.dataset.dogru = '1'));
  const ust = h('div.dd-cali-fotolar', {}, ...fotolar);
  const satir = h('div.dd-kartlar.dd-kartlar-alt', {}, ...kartlar.map((k) => h('div.dd-kart-yer', {}, k)));
  const sahnecik = h('div.dd-sahnecik');
  katman.append(perde, ust, satir, sahnecik);
  o.kok.append(katman);
  katman.classList.add('acik');
  if (!AZ_HAREKET) {
    fotolar.forEach((f, i) => f.animate([{ transform: 'translateY(-40px) scale(0.6) rotate(-6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(460), delay: sure(i * 110), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }));
    kartlar.forEach((k, i) => k.animate([{ transform: 'translateY(60px) scale(0.6) rotate(-10deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(420), delay: sure(420 + i * 120), easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
  }
  efekt.ucus();
  const fotoSalla = (i: number, yuksek = false) => {
    caliSesi(CALILAR[i].ses, yuksek);
    oynat(fotolar[i], 'dd-cali-calar');
  };
  // fotoğrafa dokununca çalının sesi (dinlemek serbest)
  fotolar.forEach((f, i) =>
    f.addEventListener('click', () => {
      if (mesgul) return;
      fotoSalla(i);
      sonHareket = performance.now();
    }),
  );

  let mesgul = false;
  let tanitim = true;
  let sonHareket = performance.now();
  let durParmak: (() => void) | null = null;
  const tanit = (async () => {
    await o.oy.soyle(M2.hangi_ses);
    if (o.kapandi() || soru.cozuldu) return;
    // Kino atılır: "Hav hav!" (kendi sesi); Mino güler: "O senin sesin!"
    o.oy.kinoPoz('kalk');
    o.oy.kinoIfade('heyecan', 1400);
    void o.oy.zipla('kino', 22, 560);
    await o.oy.soyle(K2.hav, 'kino');
    o.oy.kinoPoz(null);
    o.oy.minoTepki('gidik');
    await o.oy.soyle(M2.senin_sesin);
  })().finally(() => {
    tanitim = false;
    sonHareket = performance.now();
    if (!soru.cozuldu && !o.kapandi()) o.adim('ses-kart');
  });
  const yardim = window.setInterval(() => {
    if (o.kapandi() || mesgul || tanitim || durParmak) return;
    if (performance.now() - sonHareket > YARDIM.surukleSn * 1000) {
      // 2 yanlıştan sonra doğrusu (ördek → ördeğin çalısı); öncesinde açık bir karttan bir çalıya
      const acik = kartlar.filter((k) => !k.classList.contains('dd-soluk'));
      const k = soru.yanlis >= 2 ? kartlar.find((x) => x.dataset.kart === 'ordek')! : acik[Math.floor(o.rnd() * acik.length)];
      const f = soru.yanlis >= 2 ? fotolar[soru.dogruCali] : fotolar[Math.floor(o.rnd() * fotolar.length)];
      if (k) durParmak = parmak(o.kok, () => k.getBoundingClientRect(), () => f.getBoundingClientRect());
      void o.oy.soyle(M.surukle);
    }
  }, 1000);
  const parmakDur = () => {
    durParmak?.();
    durParmak = null;
    sonHareket = performance.now();
  };
  const ustundeki = (k: HTMLElement): number => {
    const a = k.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    let en = -1;
    let enD = Infinity;
    fotolar.forEach((f, i) => {
      const b = f.getBoundingClientRect();
      const p = b.width * 0.18;
      if (cx > b.left - p && cx < b.right + p && cy > b.top - p && cy < b.bottom + p) {
        const d = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2));
        if (d < enD) [en, enD] = [i, d];
      }
    });
    return en;
  };

  await new Promise<void>((coz) => {
    for (const k of kartlar) {
      let s: { id: number; x0: number; y0: number; tasindi: boolean } | null = null;
      k.addEventListener('pointerdown', (e) => {
        if (mesgul || o.kapandi() || k.classList.contains('dd-soluk')) return;
        parmakDur();
        s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tasindi: false };
        k.setPointerCapture(e.pointerId);
        k.classList.add('dd-tutulan');
        ses.kart();
      });
      k.addEventListener('pointermove', (e) => {
        if (!s || e.pointerId !== s.id) return;
        const dx = e.clientX - s.x0;
        const dy = e.clientY - s.y0;
        if (Math.hypot(dx, dy) > 8) s.tasindi = true;
        k.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-12, Math.min(12, dx * 0.05))}deg) scale(1.08)`;
        const u = ustundeki(k);
        fotolar.forEach((f, i) => f.classList.toggle('dd-uzerinde', i === u));
        sonHareket = performance.now();
      });
      const birak = async (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const tasindi = s.tasindi;
        s = null;
        k.classList.remove('dd-tutulan');
        fotolar.forEach((f) => f.classList.remove('dd-uzerinde'));
        if (mesgul) return;
        const id = k.dataset.kart!;
        // dokunulduysa: ördek kartı ve hayvan kartları kendi çalısına denenir (ördek: sıradaki dinlenen çalı)
        let cali = tasindi ? ustundeki(k) : -1;
        if (!tasindi) cali = id === 'ordek' ? soru.dogruCali : CALILAR.findIndex((c) => c.ses === id);
        if (cali < 0) {
          await geriDon(k);
          return;
        }
        mesgul = true;
        const sonuc = soru.birak(id, cali);
        const f = fotolar[sonuc.dogru ? cali : (sonuc.kendiCalisi ?? cali)];
        if (sonuc.dogru) {
          await kartiOturt(k, f);
          fotoSalla(cali);
          ses.tik();
          const [x, y] = o.efekt.merkez(f);
          o.efekt.halka(x, y, Math.max(60, f.getBoundingClientRect().width * 0.4));
          void pop(f, 1.08);
          o.oy.minoTepki('zipla');
          o.oy.kinoOynat('sevin', 900);
          o.oy.kinoIfade('heyecan', 1200);
          void o.oy.zipla('kino', 20);
          efekt.dogru();
          await o.bekle(700);
          clearInterval(yardim);
          parmakDur();
          coz();
          return;
        }
        efekt.yanlis();
        if (sonuc.kendiCalisi !== null) {
          // kurbağa / arı kendi çalısına uçar, sesini çıkarır: eşleşme gösterilir (kart orada kalır)
          await kartiOturt(k, f);
          fotoSalla(sonuc.kendiCalisi);
          o.oy.minoTepki('kararsiz', 1.2);
          o.oy.kinoIfade('saskin', 1000);
          await o.bekle(900);
          k.classList.add('dd-soluk', 'dd-eslesti');
        } else {
          // ördek yanlış çalıda: o çalı kendi sesini çalar, kart nazikçe geri seker
          await kartGotur(k, f.getBoundingClientRect(), 0.5, 0.55, f.getBoundingClientRect().width * 0.5, 0, 320);
          fotoSalla(cali);
          ses.sek();
          o.oy.minoTepki('hayir');
          await o.bekle(800);
          await geriDon(k, 460);
        }
        if (sonuc.parla) {
          kartlar.find((x) => x.dataset.kart === 'ordek')?.classList.add('dd-parla');
          fotolar[soru.dogruCali].classList.add('dd-parla');
          await o.bekle(200);
          fotoSalla(soru.dogruCali, true);
        }
        mesgul = false;
        sonHareket = performance.now();
      };
      k.addEventListener('pointerup', (e) => void birak(e));
      k.addEventListener('pointercancel', (e) => void birak(e));
    }
  });
  await tanit;
  if (o.kapandi()) return;
  // "Demek ki…": doğru çalının fotoğrafı çevrilir, dosyaya uçar
  satir.classList.add('dd-gidiyor');
  const dogruF = fotolar[soru.dogruCali];
  fotolar.forEach((f) => f !== dogruF && f.classList.add('dd-cekil'));
  const demek = h('div.dd-demek', {}, h('b', {}, D.yazi.demek_ki), img('v2/kart-ordek'), h('i.dd-tik'));
  dogruF.append(demek);
  dogruF.classList.add('dd-buyu');
  oynat(dogruF, 'dd-cevir');
  await o.bekle(300);
  await o.oy.soyle(M2.demek_cali);
  if (o.kapandi()) return;
  await dosyayaUcur(o, dogruF, o.goz(), perde);
  katman.classList.add('kapaniyor');
  await o.bekle(260);
  katman.remove();
}

/** Kart bir fotoğrafın köşesine küçülüp oturur (fotoğrafla birlikte kalır) */
async function kartiOturt(k: HTMLElement, f: HTMLElement) {
  const b = f.getBoundingClientRect();
  await kartGotur(k, b, 0.78, 0.74, b.width * 0.42, 8, 420);
  k.classList.add('dd-oturdu');
}

// ---------------------------------------------------------------- Halka 5: sıralama
export interface SiraSecenek extends Ortak {
  /** dosyanın ilk üç gözü (yanlışta sırayla parlar: yolu gösterir) */
  gozler: () => HTMLElement[];
  goz: () => HTMLElement | null;
}

/**
 * "Ne oldu? Sırayla diz!": üç olay kartı (roman 1-3) üç boş kareye. Her kareye yalnız kendi olayı oturur; yanlış
 * kart nazikçe geri seker, Mino "Önce ne oldu?" der, dosyadaki "demek ki" kartları sırayla parlar. 7 sn hareket
 * olmazsa sıradaki kartın kendisi parlar ve parmak onu karesine sürükler. Döner: karelerin kabı (roman buradan uçar).
 */
export async function siraSorgu(o: SiraSecenek): Promise<HTMLElement[]> {
  const sira = new Siralama();
  const katman = h('div.dd-sorgu.dd-sira-sorgu', { 'data-halka': 'sira' });
  const perde = h('div.dd-perde');
  const kareler = OLAYLAR.map((_, i) => h('div.dd-sira-kare', { 'data-kare': String(i), style: `--i:${i}` }, h('b.dd-kare-no', {}, String(i + 1))));
  const dizilim = olaySirasi(o.rnd);
  const kartlar = dizilim.map((olay, i) =>
    h('button.dd-olay', { type: 'button', 'data-olay': String(olay), 'aria-label': `Olay ${olay + 1}`, style: `--i:${i}` }, h('span.dd-olay-ic', {}, img(OLAYLAR[olay].resim, 'dd-kare-resim'))),
  );
  const ust = h('div.dd-sira-kareler', {}, ...kareler);
  const alt = h('div.dd-olaylar', {}, ...kartlar.map((k) => h('div.dd-olay-yer', {}, k)));
  katman.append(perde, ust, alt);
  o.kok.append(katman);
  katman.classList.add('acik');
  if (!AZ_HAREKET) {
    kareler.forEach((k, i) => k.animate([{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(380), delay: sure(i * 90), easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }));
    kartlar.forEach((k, i) => k.animate([{ transform: 'translateY(60px) scale(0.6) rotate(-8deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: sure(420), delay: sure(380 + i * 120), easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
  }
  efekt.ucus();
  let mesgul = false;
  let sonHareket = performance.now();
  let durParmak: (() => void) | null = null;
  let tanitim = true;
  void o.oy.soyle(M2.sirala).finally(() => {
    tanitim = false;
    sonHareket = performance.now();
    if (!sira.bitti && !o.kapandi()) o.adim('sira-kart');
  });
  const parmakDur = () => {
    durParmak?.();
    durParmak = null;
    sonHareket = performance.now();
  };
  const yardim = window.setInterval(() => {
    if (o.kapandi() || mesgul || tanitim || durParmak) return;
    if (performance.now() - sonHareket > YARDIM.surukleSn * 1000) {
      const j = sira.siradaki;
      if (j === null) return;
      const k = kartlar.find((x) => Number(x.dataset.olay) === j);
      if (!k) return;
      k.classList.add('dd-parla');
      durParmak = parmak(o.kok, () => k.getBoundingClientRect(), () => kareler[j].getBoundingClientRect());
    }
  }, 1000);
  const hangiKare = (k: HTMLElement): number => {
    const a = k.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    return kareler.findIndex((q) => {
      const b = q.getBoundingClientRect();
      const p = b.width * 0.12;
      return cx > b.left - p && cx < b.right + p && cy > b.top - p && cy < b.bottom + p;
    });
  };
  /** yanlışta: dosyadaki "demek ki" kartları sırayla parlar */
  const yoluGoster = () => o.gozler().forEach((g, i) => window.setTimeout(() => !o.kapandi() && oynat(g, 'dd-hatirla'), sure(i * 380)));

  await new Promise<void>((coz) => {
    for (const k of kartlar) {
      const olay = Number(k.dataset.olay);
      let s: { id: number; x0: number; y0: number; tasindi: boolean } | null = null;
      k.addEventListener('pointerdown', (e) => {
        if (mesgul || o.kapandi() || k.classList.contains('dd-yerinde')) return;
        parmakDur();
        s = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tasindi: false };
        k.setPointerCapture(e.pointerId);
        k.classList.add('dd-tutulan');
        ses.kart();
      });
      k.addEventListener('pointermove', (e) => {
        if (!s || e.pointerId !== s.id) return;
        const dx = e.clientX - s.x0;
        const dy = e.clientY - s.y0;
        if (Math.hypot(dx, dy) > 8) s.tasindi = true;
        k.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-10, Math.min(10, dx * 0.04))}deg) scale(1.06)`;
        const q = hangiKare(k);
        kareler.forEach((x, i) => x.classList.toggle('dd-uzerinde', i === q && !x.classList.contains('dolu')));
        sonHareket = performance.now();
      });
      const birak = async (e: PointerEvent) => {
        if (!s || e.pointerId !== s.id) return;
        const tasindi = s.tasindi;
        s = null;
        k.classList.remove('dd-tutulan');
        kareler.forEach((x) => x.classList.remove('dd-uzerinde'));
        if (mesgul) return;
        const kare = tasindi ? hangiKare(k) : (sira.siradaki ?? -1);
        if (kare < 0 || kareler[kare].classList.contains('dolu')) {
          await geriDon(k);
          return;
        }
        mesgul = true;
        const r = sira.koy(olay, kare);
        const q = kareler[kare];
        if (r.dogru) {
          k.classList.remove('dd-parla');
          const b = q.getBoundingClientRect();
          await kartGotur(k, b, 0.5, 0.5, b.width, 0, 380);
          // kart kareye yapışır (kopyası karenin içinde; aslı gizlenir)
          q.append(h('div.dd-sira-resim', {}, img(OLAYLAR[olay].resim, 'dd-kare-resim')));
          q.classList.add('dolu');
          k.classList.add('dd-yerinde');
          ses.tik();
          ses.kare(kare);
          const [x, y] = o.efekt.merkez(q);
          o.efekt.halka(x, y, Math.max(50, b.width * 0.35));
          void pop(q, 1.06);
          o.oy.minoTepki('evet');
          o.oy.kinoIfade('heyecan', 900);
          if (r.bitti) {
            clearInterval(yardim);
            parmakDur();
            await o.bekle(450);
            coz();
            return;
          }
        } else {
          // oturmaz: karenin üstünde bir an durur, nazikçe geri seker; Mino ipucu verir, dosya yolu gösterir
          const b = q.getBoundingClientRect();
          await kartGotur(k, b, 0.5, 0.5, b.width * 0.9, 0, 300);
          ses.sek();
          void salla(q);
          o.oy.minoTepki('kararsiz', 1.2);
          await geriDon(k, 460);
          yoluGoster();
          if (sira.yanlis >= 2) {
            const j = sira.siradaki;
            kartlar.forEach((x) => x.classList.toggle('dd-parla', Number(x.dataset.olay) === j));
          }
          void o.oy.soyle(M2.once);
        }
        mesgul = false;
        sonHareket = performance.now();
      };
      k.addEventListener('pointerup', (e) => void birak(e));
      k.addEventListener('pointercancel', (e) => void birak(e));
    }
  });
  if (o.kapandi()) return kareler;
  // kareler sırayla parlar ("önce, sonra, en son"), "Demek ki…" ve dosyanın son gözüne uçar
  alt.classList.add('dd-gidiyor');
  for (const [i, q] of kareler.entries()) {
    window.setTimeout(() => !o.kapandi() && (oynat(q, 'dd-kare-zipla'), ses.kare(i)), sure(i * 260));
  }
  await o.bekle(900);
  const demek = h('div.dd-demek.dd-demek-genis', {}, h('b', {}, D.yazi.demek_ki), img('v2/atki-yerde'), h('i.dd-tik'));
  ust.append(demek);
  oynat(ust, 'dd-cevir');
  await o.bekle(300);
  await o.oy.soyle(M2.demek_yanlis);
  if (o.kapandi()) return kareler;
  await dosyayaUcur(o, ust, o.goz(), perde);
  katman.classList.add('kapaniyor');
  await o.bekle(260);
  katman.remove();
  return kareler;
}
