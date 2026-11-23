// "Dikenli Pati" · lavabo sahnesi: doktor önce ellerini yıkar. Zıpzıp'ı karşılarken çamurlanan Kino'nun patileri:
// musluk açılır → patiler suyun altına götürülür → sabun köpürtülür → patiler ovuşturulur → durulanır → musluk kapanır
// → havluyla kurulanır. Her adım çocuğun gerçek bir el hareketidir ve iz bırakır: çamur sabunun geçtiği yerden çözülür,
// köpük kabarır, su köpüğü söndürür, damlalar havlunun geçtiği yerden silinir.
// Çizimler: Paket Doktor-A1, B grubu (assets/doktor/vaka/). Biri eksikse sahne oyunda yoktur.
import {
  A1, KOPURME, KOPUK_SEVIYE, KOPUK_YERLERI, KURU_ALAN, LAVABO, LAVABO_ZORLUK, OVMA_MERKEZI, SU_GENISLIGI, dongudekiKare, islananPati, kopukDegistir, kopukToplami,
  kuruHucre, kuruOrani, patiUstunde, vurusAdimi, vurusBaslangici, type LavaboAdimi,
} from './a1';
import { golgeYap } from './etki';
import { SuKatmani } from './his';
import { KareDizisi, Pozlar, Surukle, belir, el, hop, koy, ortala, salla, ziplat, type AltSahne, type Ortam } from './parca';
import type { Nokta } from './veri';

type Ayna = keyof typeof A1.ayna;

export function lavaboKur(o: Ortam): AltSahne & { ust: HTMLElement; ipucu(): void } {
  const Z = LAVABO_ZORLUK[o.yas];
  const gorunum = el('div', 'vk-gorunum vk-lavabo vk-altta');
  const ust = el('div', 'vk-katman vk-ust');

  // ——— durum
  let adim: LavaboAdimi = 'ac';
  let suAcik = false, islak = 0, sabunYolu = 0, sabunAdimi = 0, vurus = vurusBaslangici(), durulama = 0, sonSu = 0, sonSes = 0, sonKabarcik = 0;
  const kopuk = KOPUK_YERLERI.map(() => 0);
  const kuru = new Set<number>();
  let bitti: (() => void) | null = null;
  let aynaTepkisi: Ayna | null = null, aynaSonu = 0;

  // ——— sahne
  const fon = o.resim(A1.lavaboFon, 'vk-fon');
  const dipSu = A1.lavaboSu.every(o.varMi) ? new KareDizisi(o, A1.lavaboSu, 'vk-fon lv-dipsu') : null;
  if (dipSu) koy(dipSu.kutu, o.kutu(A1.lavaboSu[0]));
  // aynadaki Kino: altı poz. "Merak" ve "gıdık" daha gelmediyse yerlerinde "mutlu" ve "kahkaha" durur (ayna boş kalmaz).
  const aynaAdlari: Record<Ayna, string> = { ...A1.ayna, merak: o.varMi(A1.ayna.merak) ? A1.ayna.merak : A1.ayna.mutlu, gidik: o.varMi(A1.ayna.gidik) ? A1.ayna.gidik : A1.ayna.kahkaha };
  const ayna = Object.values(aynaAdlari).every(o.varMi) ? new Pozlar<Ayna>(o, aynaAdlari, 'vk-katman lv-ayna') : null;
  if (ayna) { ortala(ayna.kutu, LAVABO.ayna, 480, 480); ayna.kutu.style.clipPath = `ellipse(${LAVABO.ayna.camX}px ${LAVABO.ayna.camY}px at 50% 50%)`; }      // Kino camın içinde görünür
  const kol = el('button', 'vk-katman lv-kol'); kol.type = 'button'; kol.setAttribute('aria-label', 'Musluk kolu'); koy(kol, LAVABO.kol);
  const kolKare = new KareDizisi(o, A1.kol, 'lv-kol-kare'); kol.append(kolKare.kutu);
  // akan su: ağızdan çarptığı yere uzar (kareler döner); çarptığı yerde sıçrama
  const su = el('div', 'vk-katman lv-su'); su.style.left = LAVABO.agiz.x - 70 + 'px'; su.style.top = LAVABO.agiz.y + 'px'; su.style.width = '140px';
  const suKare = new KareDizisi(o, A1.suAkis, 'lv-su-kare'); su.append(suKare.kutu);
  const sicrama = new KareDizisi(o, A1.suSicrama, 'vk-katman lv-sicrama'); sicrama.kutu.style.width = '320px'; sicrama.kutu.style.height = '208px';
  const damlaKare = A1.suDamla.every(o.varMi) ? new KareDizisi(o, A1.suDamla, 'vk-katman lv-damla') : null;
  // sıçrayan damlalar gerçekten uçar (yerçekimiyle iner): akışı ve çarpmayı Astra'nın kareleri, damlaları bu katman çizer
  const damlalar = new SuKatmani(A1.suDamla.every(o.varMi) ? o.cozulmus(A1.suDamla[0]) : undefined, { sutun: false });
  let sudaydi = false;
  const akanKati = el('div', 'vk-katman lv-akan-kati');
  if (damlaKare) koy(damlaKare.kutu, { sol: LAVABO.agiz.x - 40, ust: LAVABO.agiz.y, g: 80, y: 100 });

  // ——— patiler: sürüklenen tek parça (iki pati birlikte)
  const pati = el('div', 'vk-katman lv-pati');
  const temiz = o.resim(A1.patiler.temiz, 'lv-pati-resim');
  const goster = o.resim(A1.patiler.goster, 'lv-pati-resim lv-gizli');
  const ovma = new KareDizisi(o, A1.ovma, 'lv-pati-resim lv-gizli');
  // çamur: temiz patiyle çamurlu patinin farkı (yalnız lekeler); sabunun geçtiği yerden silinir
  const camur = el('canvas', 'lv-pati-resim'); camur.width = 450; camur.height = 350;
  const cg = camur.getContext('2d', { willReadFrequently: true })!;
  {
    const c = o.cozulmus(A1.patiler.camurlu), t = o.cozulmus(A1.patiler.temiz);
    if (c && t && c.naturalWidth) {
      cg.drawImage(c, 0, 0, 450, 350);
      const k = el('canvas', ''); k.width = 450; k.height = 350;
      const kg = k.getContext('2d', { willReadFrequently: true })!; kg.drawImage(t, 0, 0, 450, 350);
      const a = cg.getImageData(0, 0, 450, 350), b = kg.getImageData(0, 0, 450, 350);
      for (let i = 0; i < a.data.length; i += 4) {
        const fark = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
        a.data[i + 3] = Math.round(a.data[i + 3] * Math.max(0, Math.min(1, (fark - 40) / 50)));
      }
      cg.putImageData(a, 0, 0);
    }
  }
  /** pati tuvali koordinatında (900 × 700) bir yeri siler: çamur ya da damla tuvali */
  const sil = (g: CanvasRenderingContext2D, p: Nokta, yaricap: number, guc: number) => {
    const r = yaricap / 2, gr = g.createRadialGradient(p.x / 2, p.y / 2, r * 0.4, p.x / 2, p.y / 2, r);
    gr.addColorStop(0, `rgba(0,0,0,${guc})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gr; g.beginPath(); g.arc(p.x / 2, p.y / 2, r, 0, Math.PI * 2); g.fill(); g.restore();
  };
  sil(cg, { x: -40, y: -40 }, 10, 0.01);                       // ısınma
  // damlalar: durulamadan sonra patilerin üstünde; havlunun geçtiği yerden silinir
  const damla = el('canvas', 'lv-pati-resim lv-gizli'); damla.width = 450; damla.height = 350;
  const dg = damla.getContext('2d')!;
  const damlalariCiz = () => { const r = o.cozulmus(A1.patiler.damla); dg.clearRect(0, 0, 450, 350); if (r && r.naturalWidth) dg.drawImage(r, 0, 0, 450, 350); };
  // köpük yuvaları: her yuvada köpürme kareleri (seviye arttıkça kabarır)
  const kopukKati = el('div', 'lv-kopuk-kati');
  const kopukEl = KOPUK_YERLERI.map(y => {
    const k = new KareDizisi(o, A1.kopurme, 'lv-kopuk lv-gizli');
    koy(k.kutu, { sol: y.x - KOPURME.merkez.x * KOPURME.olcek, ust: y.y - KOPURME.merkez.y * KOPURME.olcek, g: 420 * KOPURME.olcek, y: 320 * KOPURME.olcek });       // öbeğin merkezi yuvada
    kopukKati.append(k.kutu);
    return k;
  });
  const kopukGoster = () => kopukEl.forEach((k, i) => { k.kutu.classList.toggle('lv-gizli', kopuk[i] === 0); if (kopuk[i] > 0) k.goster(kopuk[i] - 1); });
  pati.append(ovma.kutu, temiz, camur, goster, damla, kopukKati);
  const patiSurukle = new Surukle(o, pati, LAVABO.patiYeri, {
    izin: () => adim === 'islat' || adim === 'durula',
    reddedildi: () => { if (adim === 'ov') return; hop(o, pati, 10, 180); o.ses('e-tik', 0.5, 0.8); ipucu(); },
    sinir: LAVABO.patiSiniri, egim: false,
    birakildi: () => true,                                    // patiler bırakıldığı yerde kalır (suyun altında tutulabilir)
  });

  // ——— sabun ve havlu
  const sabunKutu = { sol: LAVABO.sabunluk.x - LAVABO.sabunBoyu / 2, ust: LAVABO.sabunluk.y - LAVABO.sabunBoyu / 2, g: LAVABO.sabunBoyu, y: LAVABO.sabunBoyu };
  const sabunKare = new KareDizisi(o, A1.sabun, 'vk-katman lv-alet');
  const sabunGolge = golgeYap(o.cozulmus(A1.sabun[0]) ?? new Image(), LAVABO.sabunBoyu, LAVABO.sabunBoyu);
  const sabun = new Surukle(o, sabunKare.kutu, sabunKutu, {
    izin: () => adim === 'sabun', reddedildi: () => yanlis(sabunKare.kutu, 'sabun'), golge: sabunGolge, kaldir: 30,
    basladi: () => { o.ses('e-tik', 0.7, 1.2); },
    tutulurken: (m, _dt, yol) => {
      if (adim !== 'sabun' || !patiUstunde(m, patiSurukle.sol, patiSurukle.ust, 20) || yol < 0.5) return;
      const yerel = { x: m.x - patiSurukle.sol, y: m.y - patiSurukle.ust };
      sabunYolu += Math.min(60, yol);
      sil(cg, yerel, 170, 0.5);                               // çamur sabunun geçtiği yerden çözülür
      if (Math.floor(sabunYolu / 70) > sabunAdimi) {
        sabunAdimi = Math.floor(sabunYolu / 70);
        if (kopukDegistir(kopuk, yerel, 140, 1)) kopukGoster();
        const an = performance.now();
        if (an - sonSes > 170) { sonSes = an; o.ses('l-sabun', 0.7, 0.9 + Math.random() * 0.3); }
        aynaTepki('gidik', 500);
      }
      sabunKare.goster(Math.min(2, Math.floor((sabunYolu / Z.sabun) * 3)));
      if (sabunYolu >= Z.sabun) { sabun.birak(); adimGec('ov'); }
    },
  });
  const havluKutu = { sol: LAVABO.havluYeri.x - LAVABO.havluBoyu / 2, ust: LAVABO.havluYeri.y - LAVABO.havluBoyu / 2, g: LAVABO.havluBoyu, y: LAVABO.havluBoyu };
  const havluKare = new KareDizisi(o, A1.havlu, 'vk-katman lv-alet');
  const havluGolge = golgeYap(o.cozulmus(A1.havlu[0]) ?? new Image(), LAVABO.havluBoyu, LAVABO.havluBoyu);
  const havlu = new Surukle(o, havluKare.kutu, havluKutu, {
    izin: () => adim === 'kurula', reddedildi: () => yanlis(havluKare.kutu, 'havlu'), golge: havluGolge, kaldir: 30,
    basladi: () => { o.ses('e-tik', 0.7, 1.1); },
    tutulurken: (m, _dt, yol) => {
      if (adim !== 'kurula' || yol < 0.5) return;
      const h = kuruHucre(m, patiSurukle.sol, patiSurukle.ust);
      if (h < 0) return;
      sil(dg, { x: m.x - patiSurukle.sol, y: m.y - patiSurukle.ust }, 190, 1);
      const an = performance.now();
      if (an - sonSes > 150) { sonSes = an; o.ses('l-havlu', 0.7, 0.9 + Math.random() * 0.25); }
      if (kuru.has(h)) return;
      kuru.add(h);
      const oran = kuruOrani(kuru) / Z.kurula;
      havluKare.goster(Math.min(2, Math.floor(oran * 3)));
      if (oran >= 1) { havlu.birak(); void bitir(); }
    },
  });

  gorunum.append(fon, ...(dipSu ? [dipSu.kutu] : []), ...(ayna ? [ayna.kutu] : []), kol, su, pati, akanKati, sicrama.kutu, damlalar.tuval, ...(damlaKare ? [damlaKare.kutu] : []), sabunGolge, havluGolge, sabunKare.kutu, havluKare.kutu, ust);
  su.classList.add('lv-gizli'); sicrama.kutu.classList.add('lv-gizli'); damlaKare?.kutu.classList.add('lv-gizli'); dipSu?.kutu.classList.add('lv-gizli');
  const yildizlar = o.yildizHavuzu(ust, 12);

  // ——— yardımcılar
  const aynaTepki = (poz: Ayna, ms: number) => { aynaTepkisi = poz; aynaSonu = performance.now() + ms; };
  const sirada = (): HTMLElement | null => (adim === 'ac' || adim === 'kapat' ? kol : adim === 'islat' || adim === 'durula' || adim === 'ov' ? pati : adim === 'sabun' ? sabunKare.kutu : adim === 'kurula' ? havluKare.kutu : null);
  function ipucu() { const s = sirada(); if (s) ziplat(o, s); }
  /**
   * Sırası gelmemiş parçaya dokunuldu: parça şakasını yapar, aynadaki Kino güler, ardından sıradaki zıplar (ceza yok).
   * Sabun elden kayıp havada döner, yerine "pat" diye düşer; havlu çırpınır; musluk kolu su sıçratır ya da bir damla düşürür.
   */
  function yanlis(e: HTMLElement, hangi: 'sabun' | 'havlu' | 'kol') {
    const T = o.sure(460);
    if (hangi === 'sabun') {
      e.animate([{ translate: '0 0', rotate: '0deg' }, { translate: '-40px -150px', rotate: '-200deg', offset: 0.45 }, { translate: '0 0', rotate: '-360deg', offset: 0.85 }, { translate: '0 -14px', rotate: '-360deg', offset: 0.92 }, { translate: '0 0', rotate: '-360deg' }], { duration: T, easing: 'ease-in-out' });
      o.ses('e-vuu', 0.5, 1.7); setTimeout(() => o.ses('e-pat', 0.5, 1.3), T * 0.85);
      aynaTepki('kahkaha', 800);
    } else if (hangi === 'havlu') {
      e.animate([{ rotate: '0deg', scale: '1' }, { rotate: '-12deg', scale: '1.08' }, { rotate: '11deg', scale: '1.08' }, { rotate: '-8deg', scale: '1.04' }, { rotate: '6deg' }, { rotate: '0deg', scale: '1' }], { duration: T, easing: 'ease-in-out' });
      o.ses('l-havlu', 0.6, 1.4);
      aynaTepki('gidik', 800);
    } else {
      salla(o, e);
      if (suAcik) {
        sicrama.kutu.animate([{ scale: '1' }, { scale: '1.5 1.7', offset: 0.35 }, { scale: '1' }], { duration: T, easing: 'ease-out' });
        o.ses('l-su', 0.8, 1.4); aynaTepki('gidik', 800);
      } else if (damlaKare) {
        damlaKare.kutu.classList.remove('lv-gizli'); damlaKare.goster(0);
        const a = damlaKare.kutu.animate([{ translate: '0 0' }, { translate: `0 ${LAVABO.dip - LAVABO.agiz.y - 60}px` }], { duration: o.sure(260), easing: 'ease-in' });
        void a.finished.then(() => { damlaKare.kutu.classList.add('lv-gizli'); o.ses('l-damla', 0.7, 1.3); });
        aynaTepki('merak', 700);
      } else { o.ses('e-tik', 0.5, 0.8); aynaTepki('merak', 500); }
    }
    setTimeout(() => { if (o.calisiyor()) ipucu(); }, o.sure(420));
  }
  function adimGec(a: LavaboAdimi) {
    adim = a;
    o.asamaYaz('lavabo-' + a);
    for (const e of [kol, pati, sabunKare.kutu, havluKare.kutu]) e.classList.remove('vk-sirada');
    sirada()?.classList.add('vk-sirada');
    if (a === 'sabun') { o.ses('e-cin', 0.4, 1.3); aynaTepki('merak', 700); }
    if (a === 'ov') {
      // patiler ortada buluşur: ovuşturma kareleri; kalan çamur köpüğün altında çözülür
      patiSurukle.konumla(LAVABO.patiYeri.sol, LAVABO.patiYeri.ust);
      temiz.classList.add('lv-gizli'); camur.classList.add('lv-gizli'); ovma.kutu.classList.remove('lv-gizli');
      cg.clearRect(0, 0, 450, 350);
      kopukKati.classList.add('lv-ortada'); ovma.kutu.style.zIndex = '2'; kopukKati.style.scale = '.86';       // ovuşan patiler köpüğün üstünde görünür
      vurus = vurusBaslangici();
      o.soyle('k-kopuk');
    }
    if (a === 'durula') {
      ovma.kutu.classList.add('lv-gizli'); temiz.classList.remove('lv-gizli');
      kopukKati.classList.remove('lv-ortada'); ovma.kutu.style.zIndex = ''; kopukKati.style.scale = '';
      aynaTepki('mutlu', 700);
    }
    if (a === 'kurula') { damlalariCiz(); damla.classList.remove('lv-gizli'); belir(o, havluKare.kutu, 200); }
  }
  kol.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (adim === 'ac') {
      suAcik = true; o.ses('l-su-ac', 0.9);
      [1, 2].forEach((k, i) => setTimeout(() => kolKare.goster(k), o.sure(70 * (i + 1))));
      su.classList.remove('lv-gizli'); sicrama.kutu.classList.remove('lv-gizli'); dipSu?.kutu.classList.remove('lv-gizli');
      aynaTepki('merak', 600);
      adimGec('islat');
    } else if (adim === 'kapat') {
      suAcik = false; o.ses('l-su-ac', 0.7, 1.25);
      [1, 0].forEach((k, i) => setTimeout(() => kolKare.goster(k), o.sure(70 * (i + 1))));
      su.classList.add('lv-gizli'); sicrama.kutu.classList.add('lv-gizli');
      // musluk kapanınca iki damla düşer
      if (damlaKare) [0, 1].forEach(i => setTimeout(() => {
        if (!o.calisiyor()) return;
        damlaKare.kutu.classList.remove('lv-gizli'); damlaKare.goster(0);
        const a = damlaKare.kutu.animate([{ translate: '0 0' }, { translate: `0 ${LAVABO.dip - LAVABO.agiz.y - 60}px` }], { duration: o.sure(260), easing: 'ease-in' });
        setTimeout(() => damlaKare.goster(1), o.sure(90));
        void a.finished.then(() => { damlaKare.kutu.classList.add('lv-gizli'); o.ses('l-damla', 0.7, 1 + i * 0.2); });
      }, o.sure(240 + i * 420)));
      adimGec('kurula');
    } else yanlis(kol, 'kol');
  });
  // ovuşturma: patilerin üstünde parmağı ileri geri sürt (patiler bu adımda yerinden oynamaz)
  let ovuyor = -1;
  pati.addEventListener('pointerdown', e => { if (adim === 'ov' && e.button === 0) { ovuyor = e.pointerId; vurus = vurusAdimi(vurus, o.noktaya(e).x); } });
  addEventListener('pointermove', e => {
    if (adim !== 'ov' || e.pointerId !== ovuyor) return;
    const onceki = vurus.sayi;
    vurus = vurusAdimi(vurus, o.noktaya(e).x);
    if (vurus.sayi === onceki) return;
    ovma.goster(vurus.sayi % A1.ovma.length);
    if (kopukDegistir(kopuk, OVMA_MERKEZI, 2000, 1)) kopukGoster();
    o.ses('l-ov', 0.75, 0.9 + (vurus.sayi % 4) * 0.08);
    pati.animate([{ scale: '1' }, { scale: '1.03 .98', offset: 0.4 }, { scale: '1' }], { duration: o.sure(120) });
    aynaTepki(vurus.sayi % 3 === 0 ? 'kahkaha' : 'gidik', 420);
    if (vurus.sayi % 2 === 0) kabarcikUcur();
    if (vurus.sayi >= Z.ov) { ovuyor = -1; o.ses('e-cin', 0.4, 1.4); adimGec('durula'); }
  }, { signal: o.sinyal });
  addEventListener('pointerup', e => { if (e.pointerId === ovuyor) ovuyor = -1; }, { signal: o.sinyal });

  /** köpükten bir kabarcık yükselir, patlar (A1 kabarcık kareleri varsa onlarla; yoksa küçük parıltı) */
  const kabarcikVar = [...A1.kabarcik, ...A1.kabarcikPat].every(o.varMi);
  const kabarcikHavuzu = kabarcikVar ? Array.from({ length: 6 }, () => { const k = new KareDizisi(o, [...A1.kabarcik, ...A1.kabarcikPat], 'vk-katman lv-kabarcik lv-gizli'); ust.append(k.kutu); return k; }) : [];
  function kabarcikUcur() {
    const yer = { x: patiSurukle.sol + 300 + Math.random() * 300, y: patiSurukle.ust + 180 + Math.random() * 160 };
    const k = kabarcikHavuzu.pop();
    if (!k) { o.parilti(yer, 90, ust); return; }
    const boy = 70 + Math.random() * 50, dx = (Math.random() - 0.5) * 120, dy = -(120 + Math.random() * 120);
    ortala(k.kutu, yer, boy, boy); k.kutu.classList.remove('lv-gizli');
    // büyüme kareleri yükselirken, patlama kareleri sonda
    const n = A1.kabarcik.length, t0 = performance.now(), sure = o.sure(700);
    const adimla = () => {
      const t = (performance.now() - t0) / Math.max(1, sure);
      if (t >= 1 || !o.calisiyor()) { k.kutu.classList.add('lv-gizli'); kabarcikHavuzu.push(k); return; }
      k.goster(t < 0.72 ? Math.min(n - 1, Math.floor((t / 0.72) * n)) : n + Math.min(2, Math.floor(((t - 0.72) / 0.28) * 3)));
      const yol = Math.min(1, t / 0.72);
      k.kutu.style.translate = `${(dx * yol).toFixed(1)}px ${(dy * yol).toFixed(1)}px`;
      requestAnimationFrame(adimla);
    };
    setTimeout(() => o.ses('e-pof', 0.14, 1.9 + Math.random() * 0.5), sure * 0.72);
    requestAnimationFrame(adimla);
  }
  /** durulamada köpük suyla akıp gider: yuvasından gidere doğru süzülür, üç karede küçülür (A1 `kopuk-akan`; yoksa yalnız söner) */
  const akanHavuzu = A1.kopukAkan.every(o.varMi) ? Array.from({ length: 8 }, () => { const k = new KareDizisi(o, A1.kopukAkan, 'vk-katman lv-akan lv-gizli'); akanKati.append(k.kutu); return k; }) : [];
  let akan = 0;
  function kopukAksin(i: number) {
    const k = akanHavuzu.pop();
    if (!k) return;
    akan++;
    const y = KOPUK_YERLERI[i], bas = { x: patiSurukle.sol + y.x, y: patiSurukle.ust + y.y };
    const dx = (LAVABO.gider.x - bas.x) * 0.35 + (Math.random() - 0.5) * 40, dy = Math.max(120, (LAVABO.gider.y - bas.y) * 0.6);
    ortala(k.kutu, bas, 216, 120); k.goster(0); k.kutu.classList.remove('lv-gizli');
    const T = Math.max(1, o.sure(520));
    setTimeout(() => k.goster(1), T * 0.4); setTimeout(() => k.goster(2), T * 0.75);
    const geri = () => { k.kutu.classList.add('lv-gizli'); akanHavuzu.push(k); };
    void k.kutu.animate([{ translate: '0 0', opacity: 1 }, { translate: `${(dx * 0.8).toFixed(0)}px ${(dy * 0.8).toFixed(0)}px`, opacity: 1, offset: 0.8 }, { translate: `${dx.toFixed(0)}px ${dy.toFixed(0)}px`, opacity: 0 }],
      { duration: T, easing: 'ease-in' }).finished.then(geri, geri);
  }
  async function bitir() {
    adimGec('bitti');
    damla.classList.add('lv-gizli'); temiz.classList.add('lv-gizli'); goster.classList.remove('lv-gizli');
    belir(o, pati, 240);
    o.ses('l-parla', 0.9); o.soyle('k-tertemiz');
    aynaTepki('mutlu', 2000);
    o.yildizSac(yildizlar, { x: patiSurukle.sol + 450, y: patiSurukle.ust + 280 }, 10, 300, 70);
    await o.bekle(560);
    bitti?.(); bitti = null;
  }

  // ——— her karede
  function kare(an: number, dt: number) {
    sabun.kare(dt); havlu.kare(dt); patiSurukle.kare(dt);
    if (ayna) {
      if (an >= aynaSonu) aynaTepkisi = null;
      // boşta göz kırpar: 2,8 sn'de bir 140 ms
      const bos: Ayna = adim === 'bitti' || adim === 'kurula' ? 'mutlu' : 'merak';
      ayna.goster(aynaTepkisi ?? (an % 2800 < 140 ? 'kirp' : bos));
    }
    if (!suAcik) { damlalar.kes(); damlalar.kare(dt); sudaydi = false; return; }
    // su: ağızdan, altındaki patiye ya da lavabonun dibine
    const hedef = islananPati(patiSurukle.sol, patiSurukle.ust);
    const dip = hedef ? hedef.y - 70 : LAVABO.dip;
    // patiye çarpan su bol sıçrar, lavabonun dibine düşen az; pati suya girdiği an bir avuç damla
    damlalar.aralik = hedef ? 70 : 130; damlalar.adet = hedef ? 2 : 1;
    damlalar.ak(LAVABO.agiz, dip);
    if (hedef && !sudaydi) { damlalar.sicrat({ x: LAVABO.agiz.x, y: dip }, 10); o.ses('l-su', 0.5, 1.3); }
    sudaydi = !!hedef;
    damlalar.kare(dt);
    su.style.height = Math.max(40, dip - LAVABO.agiz.y) + 'px';
    suKare.goster(dongudekiKare(an, A1.suAkis.length, 85));
    sicrama.goster(dongudekiKare(an, A1.suSicrama.length, 80));
    sicrama.kutu.style.transform = `translate3d(${LAVABO.agiz.x - 160}px, ${dip - 200}px, 0)`;
    dipSu?.goster(dongudekiKare(an, A1.lavaboSu.length, 320));
    if (an - sonSu > 620) { sonSu = an; o.ses('l-su', hedef ? 0.55 : 0.4, hedef ? 1.12 : 1); }
    if (!hedef) return;
    if (adim === 'islat') {
      islak += dt;
      if (islak >= Z.islat) { o.ses('e-pof', 0.4, 1.3); aynaTepki('gidik', 600); hop(o, pati, 12, 200); adimGec('sabun'); }
    } else if (adim === 'durula') {
      durulama += dt;
      // suyun değdiği yuvaların köpüğü söner (140 ms'de bir basamak)
      if (Math.floor(durulama / 140) > Math.floor((durulama - dt) / 140)) {
        const yerelX = LAVABO.agiz.x - patiSurukle.sol;
        let degisti = 0;
        KOPUK_YERLERI.forEach((y, i) => { if (Math.abs(y.x - yerelX) <= SU_GENISLIGI + 40 && kopuk[i] > 0) { kopuk[i]--; degisti++; kopukAksin(i); } });
        if (degisti) { kopukGoster(); if (an - sonKabarcik > 300) { sonKabarcik = an; kabarcikUcur(); } }
      }
      if (kopukToplami(kopuk) === 0 || durulama >= Z.durula * 2.2) {
        kopuk.fill(0); kopukGoster();
        o.ses('e-cin', 0.4, 1.5); aynaTepki('mutlu', 700);
        adimGec('kapat');
      }
    }
  }

  return {
    gorunum, ust, ipucu, kare,
    oyna: () => new Promise<void>(r => { bitti = r; adimGec('ac'); o.soyle('k-eller'); }),
    nokta: (ad: string): Nokta | null => {
      if (ad === 'kol') return { x: LAVABO.kol.sol + LAVABO.kol.g / 2, y: LAVABO.kol.ust + LAVABO.kol.y / 2 };
      if (ad === 'pati') return { x: patiSurukle.sol + 450, y: patiSurukle.ust + 300 };
      if (ad === 'sol-pati-suda') return { x: LAVABO.agiz.x + 150, y: LAVABO.patiYeri.ust + 300 };     // patilerin ortası buraya gelince sol pati akışın altında
      if (ad === 'sag-pati-suda') return { x: LAVABO.agiz.x - 150, y: LAVABO.patiYeri.ust + 300 };
      if (ad === 'sabun') return sabun.merkez;
      if (ad === 'havlu') return havlu.merkez;
      if (ad === 'sol-pati') return { x: patiSurukle.sol + 300, y: patiSurukle.ust + 300 };
      if (ad === 'sag-pati') return { x: patiSurukle.sol + 600, y: patiSurukle.ust + 300 };
      if (ad === 'kuru-bas') return { x: patiSurukle.sol + KURU_ALAN.sol, y: patiSurukle.ust + KURU_ALAN.ust };
      return null;
    },
    sayim: () => ({ damla: damlalar.damlaSayisi, akan, ayna: ayna ? ayna.simdi : null, adim, suAcik, islak: Math.round(islak), sabun: Math.round(sabunYolu), vurus: vurus.sayi, kopuk: kopukToplami(kopuk), kopukEnCok: KOPUK_SEVIYE * KOPUK_YERLERI.length, kuru: kuruOrani(kuru), hedef: Z }),
  };
}
