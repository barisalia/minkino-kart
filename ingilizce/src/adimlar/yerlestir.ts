/**
 * Sahneye Taşı (Odam · Kino's Room, Yiyecekler · Mino's Lunch, Vahşi · Zıpzıp's Safari). Veri: yerlestir-veri.ts.
 *
 * Polly bir kelime söyler; çocuk o eşyayı raftan tutup sahneye sürükler. Doğru eşya tuvaldeki yerine oturur ve kendi küçük
 * hareketiyle canlanır (lamba yanar, saat tıklar, balık sıçrar; hayvanın sesi varsa o da duyulur), karakter sevinir, Polly
 * cümlesini söyler. Yanlış eşya rafa geri döner, adı söylenir. Hepsi yerleşince sahnenin tamamı birlikte canlanır.
 *
 * Dokunma: sürüklemeden dokunan çocuğa önce yön gösterilir (kart sahneye doğru kıpırdar); doğru karta ikinci dokunuşta
 * (2–3 yaşta ilk dokunuşta) eşya kendisi uçup yerine konur. Asıl iş sürüklemedir; küçükler takılıp kalmaz.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import type { Kelime } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kutla, salla, ucur } from '../kit';
import { efektCal, tik } from '../ses';
import { sesAdresi } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';
import { YERLESTIR_SAHNELERI, sahneYolu, type Kutu } from './yerlestir-veri';
import './yerlestir.css';

const yuzde = (k: Kutu) => ({ left: `${k[0]}%`, top: `${k[1]}%`, width: `${k[2]}%`, height: `${k[3]}%` });

/**
 * Katman kendi kutusunun boyunda gelir (22 Kasım 2026: tam tuval katmanlar açılışta ~70 MB bellek tutuyordu); kutusuna
 * konur. Yanlışlıkla tam tuval (1600 geniş) gelirse tuvali kaplar. Hareket kutunun tabanından (asılan üstten) döner.
 */
function kutuyaKoy(img: HTMLImageElement, k: Kutu, ust = false) {
  const yerles = () => {
    const tam = img.naturalWidth >= 1500;
    Object.assign(img.style, tam ? { inset: '0', left: '0', top: '0', width: '100%', height: '100%' } : { inset: 'auto', ...yuzde(k) });
    img.style.transformOrigin = tam ? `${k[0] + k[2] / 2}% ${ust ? k[1] : k[1] + k[3]}%` : (ust ? '50% 0' : '50% 100%');
  };
  yerles();
  if (!img.complete) img.addEventListener('load', yerles, { once: true });
}

export const yerlestirKur: AdimKurucu<'yerlestir'> = (b, a) => {
  const y = yasam();
  const s = YERLESTIR_SAHNELERI.find((x) => x.ad === a.plan.sahne)!;
  const kucuk = b.yas === '2-3';
  let no = 0, kilit = true, yanlis = 0, dokunus = 0;
  const hedef = () => a.plan.hedefler[no];
  const sor = () => { if (!kilit) void y.soyle(`en/w-${hedef().id}`); };
  const { masa } = oyunDuzeni(b.alan, `ing-yr ing-yr-${s.ad}`, sor);

  // ---- sahne: fon, karakter (iki poz), eşya katmanları; hepsi aynı tuvalde, çizimi yoksa (taslak) yer tutucu
  const sahne = h('div.ing-yr-sahne', { 'data-sahne': s.ad });
  const fon = cizim(sahneYolu(s, 'fon'), 'ing-yr-katman ing-yr-fon');
  if (fon) sahne.append(fon); else sahne.style.background = s.renk;
  const poz = (n: 0 | 1) => {
    const c = cizim(sahneYolu(s, `${s.kim}-${n}`), 'ing-yr-katman ing-yr-kim');
    if (c) { kutuyaKoy(c, s.kimKutu); return c; }
    const yer = h('span.ing-yr-yer.ing-yr-kim', {}, `${s.kim} · ${n === 0 ? 'bekler' : 'sevinir'}`);
    Object.assign(yer.style, yuzde(s.kimKutu));
    return yer;
  };
  const kim0 = poz(0), kim1 = poz(1);
  kim1.hidden = true;
  sahne.append(kim0, kim1);
  const katmanlar = new Map<string, HTMLElement>();
  // yalnız raftaki eşyaların katmanı yüklenir (öbürleri bu turda hiç görünmez)
  for (const w of a.plan.raf) {
    const id = w.id, yer = s.yerler[id];
    if (!yer) continue;
    const resimKat = cizim(sahneYolu(s, id), 'ing-yr-katman ing-yr-esya');
    let kat: HTMLElement;
    if (resimKat) { kutuyaKoy(resimKat, yer.kutu, yer.hareket === 'sallan'); kat = resimKat; }
    else {
      kat = h('span.ing-yr-yer.ing-yr-esya', {}, kelimeResmi(w));
      Object.assign(kat.style, yuzde(yer.kutu));
      kat.style.transformOrigin = yer.hareket === 'sallan' ? '50% 0' : '50% 100%';
    }
    kat.dataset.esya = id;
    kat.dataset.hareket = yer.hareket;
    sahne.append(kat);
    katmanlar.set(id, kat);
  }

  // ---- raf: taşınacak eşyaların kartları
  const raf = h('div.ing-yr-raf', { 'data-adet': a.plan.raf.length });
  const kartlar = a.plan.raf.map((w) => {
    const d = dugme('ing-secim ing-yr-kart', w.en, () => {}, kelimeResmi(w));
    d.dataset.kelime = w.id;
    surukle(d, w);
    return d;
  });
  raf.append(...kartlar);
  masa.append(h('div.ing-yr-duzen', {}, sahne, raf));

  const sevin = async (ms: number) => { kim0.hidden = true; kim1.hidden = false; await y.dur(ms); if (no < a.plan.hedefler.length) { kim0.hidden = false; kim1.hidden = true; } };
  const canlan = (kat: HTMLElement) => { kat.classList.remove('ing-yr-canli'); void kat.offsetWidth; kat.classList.add('ing-yr-canli'); };

  /** Sürükleme: kartın görüntüsü parmağı izler; sahnenin üstünde bırakılırsa taşınmış sayılır */
  function surukle(d: HTMLButtonElement, w: Kelime) {
    let basla: { x: number; y: number; id: number } | null = null, hayalet: HTMLElement | null = null;
    const birak = () => { hayalet?.remove(); hayalet = null; d.classList.remove('ing-yr-tutuluyor'); };
    d.addEventListener('pointerdown', (e) => {
      if (kilit || d.classList.contains('ing-yr-kondu')) return;
      basla = { x: e.clientX, y: e.clientY, id: e.pointerId };
      d.setPointerCapture?.(e.pointerId);
    });
    d.addEventListener('pointermove', (e) => {
      if (!basla || e.pointerId !== basla.id) return;
      if (!hayalet && Math.hypot(e.clientX - basla.x, e.clientY - basla.y) < 8) return;
      if (!hayalet) {
        const r = d.getBoundingClientRect();
        hayalet = h('div.ing-yr-hayalet', {}, kelimeResmi(w));
        hayalet.style.width = `${r.width}px`; hayalet.style.height = `${r.height}px`;
        document.body.append(hayalet);
        d.classList.add('ing-yr-tutuluyor');
        tik.dokun();
      }
      hayalet.style.left = `${e.clientX}px`; hayalet.style.top = `${e.clientY}px`;
      const r = sahne.getBoundingClientRect();
      sahne.classList.toggle('ing-yr-ustunde', e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
    });
    const bitir = (e: PointerEvent) => {
      if (!basla || e.pointerId !== basla.id) return;
      const surukledi = !!hayalet;
      basla = null;
      const r = sahne.getBoundingClientRect();
      const ustunde = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      sahne.classList.remove('ing-yr-ustunde');
      birak();
      if (surukledi && ustunde && e.type === 'pointerup') void tasi(w, d, true);
      else if (!surukledi && e.type === 'pointerup') void dokundu(w, d);
    };
    d.addEventListener('pointerup', bitir);
    d.addEventListener('pointercancel', bitir);
  }

  /** Sürüklemeden dokundu: adını duyar; doğru kartta önce yön gösterilir, sonra (küçükte hemen) eşya kendisi gider */
  async function dokundu(w: Kelime, d: HTMLButtonElement) {
    if (kilit) return;
    if (w.id === hedef().id && (kucuk || dokunus >= 1)) { await tasi(w, d, false); return; }
    if (w.id === hedef().id) dokunus++;
    d.classList.remove('ing-yr-yon'); void d.offsetWidth; d.classList.add('ing-yr-yon');
    void y.soyle(`en/w-${w.id}`);
  }

  async function soruGoster() {
    kilit = true; yanlis = 0; dokunus = 0;
    if (TEST_MODU) raf.dataset.hedef = hedef().id;
    if (!(await y.dur(300)) || !(await y.soyle(`en/w-${hedef().id}`))) return;
    kilit = false;
    ipucuKur(() => kartlar.find((d) => d.dataset.kelime === hedef().id), yanlis >= 2 ? 2500 : 6000);
  }

  async function tasi(w: Kelime, d: HTMLButtonElement, surukledi: boolean) {
    if (kilit) return;
    const istenen = hedef();
    if (w.id !== istenen.id) {
      if (yanlis === 0) b.hata();
      yanlis++;
      salla(d);
      kilit = true;
      // taşıdığı eşyanın adını duyar, sonra istenen yinelenir
      if (!(await y.soyle(`en/w-${w.id}`, `en/w-${istenen.id}`))) return;
      if (yanlis >= 2) d.parentElement?.querySelector(`[data-kelime="${istenen.id}"]`)?.classList.add('ing-parla');
      kilit = false;
      return;
    }
    kilit = true;
    ipucuKur(undefined);
    b.cevap(w.id, yanlis === 0);
    d.classList.remove('ing-parla');
    const kat = katmanlar.get(w.id)!;
    if (!surukledi) await ucur(d, kat, { sure: 650 });
    if (!y.acik) return;
    d.classList.add('ing-yr-kondu');
    tik.yapis();
    kat.classList.add('ing-yr-konuldu');
    canlan(kat);
    kutla(kat);
    void sevin(900);
    if (no % 2 === 1) void hareket('polly', 'sevin');
    if (sesAdresi(`efekt/${w.id}`)) await efektCal(`efekt/${w.id}`);
    if (!(await y.soyle('en/g-yes', `en/c-${w.id}`))) return;
    no++;
    if (no < a.plan.hedefler.length) { void soruGoster(); return; }
    await son();
  }

  /** Hepsi yerinde: karakter sevinir, yerleşen eşyalar sırayla canlanır, Polly sahneyi över */
  async function son() {
    kim0.hidden = true; kim1.hidden = false;
    sahne.classList.add('ing-yr-tamam');
    a.plan.hedefler.forEach((w, i) => y.sonra(() => canlan(katmanlar.get(w.id)!), 180 * i));
    kutla(sahne);
    void hareket('polly', 'sevin');
    if (!(await y.soyle(s.son.id))) return;
    if (!(await y.dur(700))) return;
    b.bitti();
  }

  b.tekrarla(sor);
  void (async () => {
    if (!(await y.soyle(s.giris.id))) return;
    await soruGoster();
  })();
  return () => { document.querySelectorAll('.ing-yr-hayalet').forEach((x) => x.remove()); y.kapat(); };
};
