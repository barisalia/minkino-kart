// Minik Doktor · "Mino'nun Kayıp Çıngırağı" (sekiz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler, kapanış)
// vaka-kit'te; burada yakın planın katmanları, el hareketleri, topun yolları ve Mino'nun tepkileri.
// Çizimler Astra'dan (Paket Doktor-Y10, assets/doktor/cingirak/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './cingirak.css';
import { beklemeKaresi } from '../vaka/veri';
import { ortalamaHiz } from '../vaka-kit/ortak';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ALETLER, BOYUN, CEP, CEP_DUGMESI, CINGIRAK, CINGIRAK_DOSYALAR, EFEKTLER, FERMUAR, GERI_AL, KAPANIS, KARE_MS, MASA, MINO_DUGMESI, TOKA, TOKA_DUGMESI,
  PATILER, SOZLER, TASMA_YARICAPI, TOP_BOYU, TOP_CEPTE, TOP_DUGMESI, TOP_YERI, TUTAMAK_DUGMESI, ZORLUK, acikDis, atis, basilma, basPozu, cekmeBoyu, cepKademesi, cepteMi,
  dusmeYeri, fermuarIlerleme, sesYeri, sonrakiAsama, takipAdimi, tokaDolumu, uzak, vurusta, VURUS, yakaladiMi, yakinlik, yayNoktasi, ziplayis,
  type Asama, type BasPozu, type SozAdi,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('cingirak', CINGIRAK_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'cingirak', klasor: 'cingirak', dosyalar: CINGIRAK_DOSYALAR,
    hasta: { ad: 'Mino\'nun cebi', kutu: MASA.mino, bekleme: [CINGIRAK.uzgun[0], CINGIRAK.uzgun[1]], kirp: CINGIRAK.uzgunKirp, sevinc: [CINGIRAK.sevinc[0], CINGIRAK.sevinc[1]], son: [...CINGIRAK.son],
      dokunma: MASA.cep, dugme: CEP_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [CINGIRAK.steto, CINGIRAK.eldiven, CINGIRAK.top], seritAletleri: [CINGIRAK.steto, CINGIRAK.eldiven],
    yakinFon: CINGIRAK.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER],
    // Mino'nun klonu yok: girişte cebinden "tıngır", kapanışta boynundaki çıngırak
    sozler: { giris: 'c-tingir', canta: 'mn-tingir-canta', son: 'mn-tingir-son', sonSonra: 'c-tingir' },
    kapanis: KAPANIS,
  }, I => kurCingirak(I));
}

function kurCingirak(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, kinoTepki, oynat, parilti } = I;
  const soyle = (ad: SozAdi) => I.soyle(ad);
  // ——————————————————————————— durum
  let zipla = 0, bas: { id: number; y: number } | null = null, dinle = 0, dinleBas = 0, sesHedef = sesYeri(0), bulundu = false;
  let fermuar = 0, fermuarTut: { id: number; t: number; x: number } | null = null, fermuarHizi = 0, sikisik: number | null = null, sonDis = 0;
  let cek: { id: number; t: number; y: number } | null = null, cekHizi = 0, cepTers = false, topCikti = false;
  let ritimBitti = false, ritimBas = 0, isabet = 0, atisNo = 0, firlat: { id: number; p: Nokta; t: number } | null = null, topUcuyor = false, minoBekliyor = false;
  let topBoyunda = false, tokaTut: { id: number; bas: number } | null = null, bagli = false, erken = false;
  let ezikKalan = 0, havadaKalan = 0, boingKalan = 0, sasirKalan = 0, kikirKalan = 0, merakKalan = 0, ohKalan = 0, sevinKalan = 0, dansKalan = 0, uzanKalan = 0, yakalaKalan = 0, firlatKalan = 0, utanKalan = 0;
  let sesAni = 0, vurusNo = -1, pozSimdi: BasPozu = 'uzgun';
  const soylendi = new Set<string>();
  const birKez = (ad: SozAdi) => { if (soylendi.has(ad)) return; soylendi.add(ad); soyle(ad); };
  const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, sure(ms)));

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const govde = el('div', 'vk-katman cn-govde'); koy(govde, { sol: 0, ust: 0, g: 2048, y: 1152 });
  const basY = yigin(Object.values(CINGIRAK.bas), 'vk-fon vk-tam vk-soluk');
  const tasmaY = yigin([CINGIRAK.tasma, CINGIRAK.tasmaBagli], 'vk-fon vk-tam cn-tasma');
  const cepY = yigin([...CINGIRAK.cep, CINGIRAK.cepTers], 'vk-katman cn-cep'); koy(cepY.kutu, CEP);
  const topCep = el('button', 'vk-katman cn-top-cep'); topCep.type = 'button'; topCep.setAttribute('aria-label', 'Cepteki top'); ortala(topCep, TOP_CEPTE, TOP_DUGMESI, TOP_DUGMESI); topCep.hidden = true;
  const topCepR = resim(CINGIRAK.topCep, 'cn-dolu'); topCep.append(topCepR);
  govde.append(basY.kutu, tasmaY.kutu, cepY.kutu, topCep);
  const minoDugme = el('button', 'vk-katman cn-mino'); minoDugme.type = 'button'; minoDugme.setAttribute('aria-label', 'Mino'); koy(minoDugme, MINO_DUGMESI);
  const tutamak = el('button', 'vk-katman cn-tutamak'); tutamak.type = 'button'; tutamak.setAttribute('aria-label', 'Fermuarın tutamağı'); tutamak.hidden = true;
  tutamak.append(resim(CINGIRAK.tutamak, 'cn-dolu'));
  const sikistiR = resim(CINGIRAK.sikisti, 'vk-katman cn-sikisti'); sikistiR.hidden = true;
  const topR = el('button', 'vk-katman cn-top'); topR.type = 'button'; topR.setAttribute('aria-label', 'Çıngıraklı top'); topR.hidden = true;
  const topY = yigin([CINGIRAK.top, CINGIRAK.topParla, CINGIRAK.topEzik, ...CINGIRAK.yuvarlan, ...CINGIRAK.ucus], 'cn-dolu'); topR.append(topY.kutu);
  const golge = resim(CINGIRAK.hedef, 'vk-katman cn-golge'); golge.hidden = true;
  const dalga = resim(CINGIRAK.sesDalga[0], 'vk-katman cn-dalga'); dalga.hidden = true;
  const toka = el('button', 'vk-katman cn-toka'); toka.type = 'button'; toka.setAttribute('aria-label', 'Tasmanın tokası'); ortala(toka, TOKA, TOKA_DUGMESI, TOKA_DUGMESI);
  const tokaY = yigin([CINGIRAK.toka, CINGIRAK.tokaKapali], 'cn-dolu'); toka.append(tokaY.kutu);
  const halka = el('div', 'cn-halka'); toka.append(halka);
  const topBoyun = yigin([CINGIRAK.top, ...CINGIRAK.cin], 'vk-katman cn-top-boyun'); ortala(topBoyun.kutu, { x: BOYUN.x, y: BOYUN.y + 20 }, 130, 130);
  toka.hidden = true; topBoyun.kutu.hidden = true;
  y.append(govde, minoDugme, dalga, golge, tutamak, sikistiR, topR, topBoyun.kutu, toka);
  // şerit: stetoskop, eldiven
  const dokSteto = I.dokDugmesi(0, CINGIRAK.steto, 'Stetoskop');
  const dokEldiven = I.dokDugmesi(1, CINGIRAK.eldiven, 'Eldiven');
  const stetoY = yigin([CINGIRAK.steto, CINGIRAK.stetoDinle], 'vk-alet-yigin');
  const eldivenY = yigin([CINGIRAK.eldiven, CINGIRAK.eldivenTuttu, CINGIRAK.eldivenKacti], 'vk-alet-yigin');
  I.aletEkle('steto', ALETLER.steto, [stetoY.kutu], CINGIRAK.steto);
  I.aletEkle('eldiven', ALETLER.eldiven, [eldivenY.kutu], CINGIRAK.eldiven);
  I.aletEkle('top', ALETLER.top, [resim(CINGIRAK.top)], CINGIRAK.top);

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => {
    I.asamaGec(a);
    tutamak.hidden = a !== 'fermuar';
    topCep.hidden = !(a === 'cikar');
    topR.hidden = !topCikti || topBoyunda || topUcuyor || !['ritim', 'firlat', 'yakala', 'toka'].includes(a);
    dokSteto.hidden = !(a === 'giris' || a === 'canta' || a === 'zipla' || a === 'dinle');
    dokEldiven.hidden = !(a === 'firlat' || a === 'yakala' || a === 'giris' || a === 'canta' || a === 'zipla' || a === 'dinle');
    if (a === 'ritim') ritimBas = performance.now();
  };
  const ilerle = () => gec(sonrakiAsama(asama()));
  const topuKoy = (p: Nokta) => { ortala(topR, p, TOP_DUGMESI, TOP_DUGMESI); };
  topuKoy(TOP_YERI);
  /** top bir yerden bir yere uçar (yay); uçarken top düğmesi gizli, bir kopya uçar */
  function topUcur(a: Nokta, b: Nokta, ms: number, yukseklik: number, kareler: readonly string[], gercekSure = false): Promise<void> {
    const r = resim(kareler[0], 'vk-katman cn-ucan-top'); r.style.width = r.style.height = TOP_BOYU + 'px'; I.etkiKati.append(r);
    // yakalanacak düşüş test kipinde de gerçek sürede (çocuğun eldiveni götürme zamanı)
    const t0 = performance.now(), s = gercekSure ? ms : sure(ms);
    return new Promise(bitti => {
      const adim = (an: number) => {
        if (!I.calisiyor()) { r.remove(); bitti(); return; }
        const t = Math.min(1, (an - t0) / s), p = yayNoktasi(a, b, t, yukseklik);
        r.style.transform = `translate3d(${(p.x - TOP_BOYU / 2).toFixed(1)}px, ${(p.y - TOP_BOYU / 2).toFixed(1)}px, 0) rotate(${(t * 540).toFixed(0)}deg)`;
        const ad = kareler[Math.floor((an - t0) / KARE_MS.ucus) % kareler.length]; const u = I.adres(ad) ?? ''; if (r.getAttribute('src') !== u) r.src = u;
        if (t >= 1) { r.remove(); bitti(); return; }
        requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
  }
  /** her tıngırda cebin yanında ses çizgileri */
  const tingir = (kazanc = 1, hiz = 1, p: Nokta = { x: CEP.sol + CEP.g + 40, y: CEP.ust + 80 }) => { ses('c-tingir', kazanc, hiz); void oynat(CINGIRAK.tingir, p, 400, 300, KARE_MS.tingir); };

  // ——————————————————————————— 1 · zıplat: başından aşağı bastır, bırak
  minoDugme.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan()) return;
    if (asama() !== 'zipla') { hop(govde, 10, 200); kikirKalan = 400; ses('e-hihi', 0.4, 1.2); return; }
    bas = { id: e.pointerId, y: I.noktaya(e).y };
    try { minoDugme.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('c-yay', 0.4, 1.3);
  });
  addEventListener('pointermove', e => {
    if (!bas || e.pointerId !== bas.id) return;
    const d = I.noktaya(e).y - bas.y, o = basilma(d);
    govde.style.transform = `scaleY(${(1 - 0.22 * o).toFixed(3)}) scaleX(${(1 + 0.08 * o).toFixed(3)})`;
    ezikKalan = o > 0.15 ? 200 : 0;
  }, { signal: I.iptal });
  const birak = (e: PointerEvent) => {
    if (!bas || e.pointerId !== bas.id) return;
    const d = I.noktaya(e).y - bas.y; bas = null;
    govde.style.transform = '';
    const z = ziplayis(d);
    if (z === 'yok') { govde.animate([{ transform: 'scaleY(.97)' }, { transform: 'scaleY(1.02)' }, { transform: 'scaleY(1)' }], { duration: sure(240) }); ziplat(minoDugme); return; }
    const yuk = z === 'boing' ? 420 : 150, ms = z === 'boing' ? 900 : 520;
    govde.animate([{ transform: 'translateY(0) scaleY(.8)' }, { transform: `translateY(${-yuk}px) scaleY(1.06)`, offset: 0.45 }, { transform: 'translateY(0) scaleY(.92)', offset: 0.9 }, { transform: 'translateY(0) scaleY(1)' }],
      { duration: sure(ms), easing: 'cubic-bezier(.2,.7,.4,1)' });
    if (z === 'boing') { boingKalan = ms; ses('c-boing'); birKez('mn-boing'); void oynat(CINGIRAK.ezikCizgi, { x: 880, y: 700 }, 700, 300, KARE_MS.yay); kinoTepki('sasir', 800, 26); }
    else { havadaKalan = ms * 0.8; ses('c-yay', 0.8, 1.1); kinoTepki('sevin', 500, 14); }
    setTimeout(() => { tingir(1, 0.95 + zipla * 0.06); void oynat(CINGIRAK.toz, { x: 880, y: 1000 }, 500, 200, KARE_MS.toz); }, sure(ms * 0.9));
    zipla++;
    if (zipla >= Z.zipla) setTimeout(() => { if (I.calisiyor() && asama() === 'zipla') { sasirKalan = 700; ilerle(); ziplat(dokSteto); dinleBas = performance.now(); } }, sure(ms + 200));
  };
  addEventListener('pointerup', birak, { signal: I.iptal });
  addEventListener('pointercancel', birak, { signal: I.iptal });

  // ——————————————————————————— 3 · fermuar: tutamağı soldan sağa çek
  const tutamakKoy = () => ortala(tutamak, { x: FERMUAR.bas.x + (FERMUAR.son.x - FERMUAR.bas.x) * fermuar, y: FERMUAR.bas.y }, TUTAMAK_DUGMESI, TUTAMAK_DUGMESI);
  tutamakKoy();
  tutamak.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'fermuar') return;
    fermuarTut = { id: e.pointerId, t: performance.now(), x: I.noktaya(e).x }; fermuarHizi = 0;
    try { tutamak.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('c-zip', 0.4, 1.2);
  });
  addEventListener('pointermove', e => {
    if (!fermuarTut || e.pointerId !== fermuarTut.id) return;
    const p = I.noktaya(e), an = performance.now(), dt = Math.max(1, an - fermuarTut.t);
    fermuarHizi = ortalamaHiz(fermuarHizi, Math.abs(p.x - fermuarTut.x) / dt, dt);
    fermuarTut.t = an; fermuarTut.x = p.x;
    if (sikisik !== null) {
      // sıkıştı: biraz geri alınınca kurtulur
      if (p.x <= sikisik - GERI_AL) { sikisik = null; sikistiR.hidden = true; ses('c-zip', 0.7, 0.8); kinoTepki('sevin', 400, 12); fermuarHizi = 0; }
      return;
    }
    if (fermuarHizi > Z.fermuarHiz && fermuar > 0.05 && fermuar < 0.95) {
      sikisik = p.x;
      ortala(sikistiR, { x: tutamak.offsetLeft + TUTAMAK_DUGMESI / 2, y: FERMUAR.bas.y - 20 }, 300, 200); sikistiR.hidden = false; pop(sikistiR, 200);
      ses('c-sikis'); titret(tutamak); sasirKalan = 800; birKez('mn-sikisti'); kinoTepki('sasir', 600, 18);
      return;
    }
    fermuar = fermuarIlerleme(p, fermuar);
    tutamakKoy();
    const dis = acikDis(fermuar);
    if (dis > sonDis) { sonDis = dis; ses('c-zip', 0.6, 0.85 + dis * 0.04); }
    cepY.goster(CINGIRAK.cep[cepKademesi(fermuar)]);
    if (fermuar >= 1) {
      fermuarTut = null;
      void oynat([CINGIRAK.disParilti], FERMUAR.son, 200, 200, 300);
      ohKalan = 900; tingir(0.9); soyle('mn-cep'); kinoTepki('sevin', 700, 20);
      void oynat(CINGIRAK.kirinti, TOP_CEPTE, 300, 300, KARE_MS.kirinti, { kay: -120 });
      ilerle(); ziplat(topCep);
    }
  }, { signal: I.iptal });
  const fermuarBirak = (e: PointerEvent) => { if (fermuarTut && e.pointerId === fermuarTut.id) fermuarTut = null; };
  addEventListener('pointerup', fermuarBirak, { signal: I.iptal });
  addEventListener('pointercancel', fermuarBirak, { signal: I.iptal });

  // ——————————————————————————— 4 · topu cepten yukarı çek
  topCep.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'cikar') return;
    cek = { id: e.pointerId, t: performance.now(), y: I.noktaya(e).y }; cekHizi = 0;
    try { topCep.setPointerCapture(e.pointerId); } catch { /* */ }
    tingir(0.5, 1.2);
  });
  addEventListener('pointermove', e => {
    if (!cek || e.pointerId !== cek.id) return;
    const p = I.noktaya(e), an = performance.now(), dt = Math.max(1, an - cek.t);
    cekHizi = ortalamaHiz(cekHizi, Math.abs(p.y - cek.y) / dt, dt); cek.t = an; cek.y = p.y;
    const boy = cekmeBoyu(p);
    topCepR.style.transform = `translateY(${-Math.min(boy, Z.cek) * 0.8}px) scaleY(${(1 + Math.min(boy, Z.cek) / 900).toFixed(3)})`;
    if (!cepTers && cekHizi > Z.cekHiz) {
      cepTers = true; cepY.goster(CINGIRAK.cepTers);
      ses('c-kirinti'); void oynat(CINGIRAK.kirinti, { x: TOP_CEPTE.x, y: CEP.ust + CEP.y }, 300, 300, KARE_MS.kirinti, { kay: -160 });
      utanKalan = 900; birKez('mn-ters'); kinoTepki('sevin', 600, 18);
    }
    if (boy >= Z.cek) {
      cek = null; topCikti = true;
      topCep.hidden = true; topCepR.style.transform = '';
      ses('c-pop'); parilti(TOP_CEPTE, 200);
      void topUcur(TOP_CEPTE, TOP_YERI, 420, 200, CINGIRAK.ucus).then(() => {
        topuKoy(TOP_YERI); topY.goster(CINGIRAK.topParla); setTimeout(() => topY.goster(CINGIRAK.top), sure(500));
        tingir(1, 1.1, TOP_YERI); ohKalan = 900; soyle('mn-top'); kinoTepki('sevin', 800, 24);
        if (cepTers) setTimeout(() => cepY.goster(CINGIRAK.cep[4]), sure(800));
        ilerle(); ziplat(topR);
      });
    }
  }, { signal: I.iptal });
  const cekBirak = (e: PointerEvent) => { if (cek && e.pointerId === cek.id) { cek = null; topCepR.style.transform = ''; ziplat(topCep); } };
  addEventListener('pointerup', cekBirak, { signal: I.iptal });
  addEventListener('pointercancel', cekBirak, { signal: I.iptal });

  // ——————————————————————————— 5 · ritim, 6 · fırlat: topa dokun / kaydır
  topR.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || topUcuyor) return;
    const a = asama();
    if (a === 'ritim' && ritimBitti) { tingir(0.6, 1.2, TOP_YERI); dansKalan = 400; return; }
    if (a === 'ritim') {
      const t = performance.now() - ritimBas;
      if (vurusta(t, Z.pencere)) {
        isabet++;
        ses('c-tingir', 1, 0.9 + isabet * 0.08); topY.goster(CINGIRAK.topEzik); setTimeout(() => topY.goster(CINGIRAK.top), sure(120));
        void oynat(CINGIRAK.nota, { x: TOP_YERI.x + (Math.random() - 0.5) * 120, y: TOP_YERI.y - 120 }, 200, 200, KARE_MS.nota, { kay: 160 });
        dansKalan = 800; kinoTepki('sevin', 400, 12);
        if (isabet >= Z.ritim && !ritimBitti) { ritimBitti = true; soyle('mn-dans'); ses('e-cin', 0.6); setTimeout(() => { if (I.calisiyor()) { ilerle(); ziplat(topR); } }, sure(700)); }
      } else { ses('c-tik', 0.8); merakKalan = 500; titret(topR); }
      return;
    }
    if (a === 'firlat') {
      firlat = { id: e.pointerId, p: I.noktaya(e), t: performance.now() };
      try { topR.setPointerCapture(e.pointerId); } catch { /* */ }
      return;
    }
    if (a === 'toka' && !topBoyunda) { I.tut(topR, 'top', e); return; }
    hop(topR, 12, 200); tingir(0.5, 1.2, TOP_YERI);
  });
  const atisBitti = (e: PointerEvent) => {
    if (!firlat || e.pointerId !== firlat.id) return;
    const f = firlat; firlat = null;
    const p = I.noktaya(e), sonuc = atis(f.p, p, performance.now() - f.t, Z.firlat);
    if (sonuc === 'yanlis') { titret(topR); ses('c-tik', 0.6); return; }
    void atisYap(sonuc === 'tam');
  };
  addEventListener('pointerup', atisBitti, { signal: I.iptal });
  addEventListener('pointercancel', e => { if (firlat && e.pointerId === firlat.id) firlat = null; }, { signal: I.iptal });
  async function atisYap(tam: boolean) {
    topUcuyor = true; topR.hidden = true;
    ses('c-vuus');
    if (!tam) {
      // zayıf atış: yuvarlanıp önünde durur; Mino uzanır, top geri yuvarlanır
      const orta = { x: (TOP_YERI.x + PATILER.x) / 2 + 80, y: 880 };
      await topUcur(TOP_YERI, orta, 520, 60, CINGIRAK.yuvarlan);
      ses('c-yuvarlan'); uzanKalan = 900; birKez('mn-kisa'); kinoTepki('sasir', 600, 14);
      await bekle(700);
      await topUcur(orta, TOP_YERI, 520, 30, CINGIRAK.yuvarlan);
      topUcuyor = false; topuKoy(TOP_YERI); topR.hidden = false; ziplat(topR);
      return;
    }
    await topUcur(TOP_YERI, PATILER, 520, 300, CINGIRAK.ucus);
    ses('c-yakala'); tingir(0.9, 1, PATILER); yakalaKalan = 900; if (atisNo === 0) soyle('mn-yakala'); kinoTepki('sevin', 600, 20);
    gec('yakala');
    minoBekliyor = true;
    ziplat(dokEldiven);
    // Mino, eldiven elde olana kadar bekler; sonra geri atar
    while (I.calisiyor() && minoBekliyor && I.tutulan()?.ad !== 'eldiven') await bekle(120);
    if (!I.calisiyor()) return;
    minoBekliyor = false;
    await bekle(350);
    const yer = dusmeYeri(atisNo);
    firlatKalan = 600; ses('c-vuus', 0.9, 1.1);
    ortala(golge, yer, 300, 140); golge.hidden = false;
    golge.animate([{ transform: 'scale(.3)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 1 }], { duration: Z.dusme, fill: 'forwards' });
    await topUcur(PATILER, yer, Z.dusme, 320, CINGIRAK.ucus, true);
    golge.hidden = true; golge.getAnimations().forEach(a => a.cancel());
    const h = I.tutulan();
    const tuttu = !!h && h.ad === 'eldiven' && yakaladiMi(I.ucNoktasi(h), yer, Z.yakalaR);
    if (tuttu) {
      atisNo++;
      eldivenY.goster(CINGIRAK.eldivenTuttu); ses('c-yakala'); tingir(1, 1.1, yer); parilti(yer, 220); kinoTepki('sevin', 700, 22); sevinKalan = 900;
      await bekle(600);
      eldivenY.goster(CINGIRAK.eldiven);
      if (I.tutulan()) I.birak(I.tutulan()!);
    } else {
      if (h?.ad === 'eldiven') { eldivenY.goster(CINGIRAK.eldivenKacti); setTimeout(() => eldivenY.goster(CINGIRAK.eldiven), sure(500)); }
      ses('c-sek'); kikirKalan = 900;
      await topUcur(yer, TOP_YERI, 600, 120, CINGIRAK.yuvarlan);
    }
    topUcuyor = false; topuKoy(TOP_YERI);
    gec(atisNo >= Z.atis ? 'toka' : 'firlat');
    topR.hidden = false; ziplat(topR);
  }

  // ——————————————————————————— 8 · toka: topu boyna götür (kalkınca), tokaya basılı tut
  toka.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'toka' || !topBoyunda || bagli) return;
    tokaTut = { id: e.pointerId, bas: performance.now() };
    try { toka.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('c-toka', 0.4, 1.4); merakKalan = 400;
  });
  const tokaBirak = (e: PointerEvent) => {
    if (!tokaTut || e.pointerId !== tokaTut.id) return;
    tokaTut = null;
    if (bagli) return;
    // erken bırakıldı: toka açılır, yay gibi sıçrar; Mino kıkırdar
    erken = true; halka.style.setProperty('--dolu', '0');
    ses('c-yay', 0.7); titret(toka); kikirKalan = 600; kinoTepki('sasir', 400, 12);
  };
  addEventListener('pointerup', tokaBirak, { signal: I.iptal });
  addEventListener('pointercancel', tokaBirak, { signal: I.iptal });
  async function bagla() {
    bagli = true; tokaTut = null;
    tokaY.goster(CINGIRAK.tokaKapali); ses('c-toka', 1); pop(toka, 200);
    await bekle(260);
    toka.hidden = true; topBoyun.kutu.hidden = true; halka.style.setProperty('--dolu', '0');
    tasmaY.goster(CINGIRAK.tasmaBagli); pop(tasmaY.kutu, 260);
    void oynat([CINGIRAK.tasmaParla], BOYUN, 300, 300, 400);
    void oynat([...CINGIRAK.cin, ...CINGIRAK.cin], { x: BOYUN.x, y: BOYUN.y + 20 }, 200, 200, KARE_MS.cin);
    ses('c-cin'); tingir(1, 1.05, BOYUN); sevinKalan = 1400; soyle('mn-tasma'); kinoTepki('sevin', 900, 26);
    for (let i = 0; i < 3; i++) setTimeout(() => void oynat(CINGIRAK.kalp, { x: BOYUN.x + (Math.random() - 0.5) * 300, y: BOYUN.y - 200 }, 160, 160, KARE_MS.kalp, { kay: 160 }), sure(i * 160));
    await bekle(1100);
    if (!I.calisiyor()) return;
    gec('kutlama'); void I.kutla();
  }

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(dokSteto, 'steto', () => asama() === 'dinle', () => { if (!dinleBas) dinleBas = performance.now(); });
  I.aletDugmesi(dokEldiven, 'eldiven', () => asama() === 'yakala' || asama() === 'firlat');

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    return a === 'zipla' ? [minoDugme] : a === 'dinle' ? [dokSteto] : a === 'fermuar' ? [tutamak] : a === 'cikar' ? [topCep] : a === 'ritim' || a === 'firlat' ? (topUcuyor ? [] : [topR])
      : a === 'yakala' ? (I.tutulan() ? [] : [dokEldiven]) : a === 'toka' ? (!topBoyunda ? [topR] : bagli ? [] : [toka]) : [];
  };

  return {
    yaklasinca: () => { gec('zipla'); ziplat(minoDugme); },
    kutlamaYeri: { x: 880, y: 420 },
    siradaki,
    kinoSasirsin: () => boingKalan > 0,
    bosDokunus: (p: Nokta) => { if (cepteMi(p)) { tingir(0.4, 1.3); kikirKalan = 400; } },
    kalkinca: (t: Tutulan) => {
      if (t.ad === 'steto') stetoY.goster(CINGIRAK.steto);
      if (t.ad === 'top' && asama() === 'toka') {
        const uc = I.ucNoktasi(t);
        if (uzak(uc, BOYUN) > TASMA_YARICAPI) { kikirKalan = 500; return false; }
        void I.yerineKoy(t, { x: BOYUN.x, y: BOYUN.y + 50 }, 0.7, 180).then(() => {
          topBoyunda = true; topR.hidden = true; topBoyun.kutu.hidden = false; pop(topBoyun.kutu, 220);
          tingir(0.9, 1.05, BOYUN); kinoTepki('sevin', 500, 14);
          toka.hidden = false; pop(toka, 220); ziplat(toka);
          I.asamaGec('toka');
        });
        return true;
      }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null) => {
      ezikKalan = Math.max(0, ezikKalan - dt); havadaKalan = Math.max(0, havadaKalan - dt); boingKalan = Math.max(0, boingKalan - dt); sasirKalan = Math.max(0, sasirKalan - dt);
      kikirKalan = Math.max(0, kikirKalan - dt); merakKalan = Math.max(0, merakKalan - dt); ohKalan = Math.max(0, ohKalan - dt); sevinKalan = Math.max(0, sevinKalan - dt);
      dansKalan = Math.max(0, dansKalan - dt); uzanKalan = Math.max(0, uzanKalan - dt); yakalaKalan = Math.max(0, yakalaKalan - dt); firlatKalan = Math.max(0, firlatKalan - dt); utanKalan = Math.max(0, utanKalan - dt);
      const a = asama();
      const dinliyor = a === 'dinle' && h?.ad === 'steto' && !!uc && uzak(uc, sesHedef) < 420;
      const poz = basPozu({ asama: a, ezikKalan, havadaKalan, boingKalan, sasirKalan, kikirKalan, merakKalan, ohKalan, sevinKalan, dansKalan, uzanKalan, yakalaKalan, firlatKalan, utanKalan, dinliyor, kirp: beklemeKaresi(an) === 'kirp', an });
      if (poz !== pozSimdi) {
        const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || (poz.startsWith('dans') && pozSimdi.startsWith('dans')) || poz === 'ezik' || poz === 'havada' || poz === 'boing';
        pozSimdi = poz; basY.goster(CINGIRAK.bas[poz]);
        if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
      }
      // toka: basılı tutuldukça halka dolar; dolunca "çıt"
      if (tokaTut && !bagli) {
        const o = tokaDolumu(an - tokaTut.bas, Z.toka);
        halka.style.setProperty('--dolu', o.toFixed(3));
        if (o >= 1) void bagla();
      }
      // ritim: Mino her vuruşta başını sallar, topun çevresinde ışık halkası
      if (a === 'ritim') {
        const no = Math.floor((an - ritimBas + VURUS / 2) / VURUS);
        if (no !== vurusNo) { vurusNo = no; hop(basY.kutu, 14, 220); void oynat(CINGIRAK.ritim, TOP_YERI, 300, 300, KARE_MS.ritim); ses('c-tik', 0.25, 1.5); }
      }
      // ——— 2 · kaçan sesi stetoskopla takip et
      if (a === 'dinle' && !bulundu) {
        sesHedef = sesYeri(an - dinleBas);
        dalga.style.transform = `translate3d(${(sesHedef.x - 150).toFixed(0)}px, ${(sesHedef.y - 150).toFixed(0)}px, 0)`;
        if (h?.ad === 'steto' && uc) {
          const yk = yakinlik(uc, sesHedef);
          dalga.hidden = yk < 0.55;
          if (!dalga.hidden) dalga.src = I.adres(CINGIRAK.sesDalga[Math.floor(an / KARE_MS.dalga) % 2]) ?? '';
          stetoY.goster(yk > 0.6 ? CINGIRAK.stetoDinle : CINGIRAK.steto);
          if (an - sesAni > 1300 - 900 * yk) { sesAni = an; ses('c-tingir', 0.2 + 0.7 * yk, 0.9 + yk * 0.2); }
          const once = dinle;
          dinle = takipAdimi(dinle, uzak(uc, sesHedef), Z.dinleR, dt);
          if (once < Z.dinleMs * 0.5 && dinle >= Z.dinleMs * 0.5) { kikirKalan = 600; birKez('mn-dinle'); }
          if (dinle >= Z.dinleMs) {
            bulundu = true; dalga.hidden = true;
            tingir(1, 1, sesHedef); parilti(sesHedef, 220); ohKalan = 800; kinoTepki('sevin', 700, 22);
            I.birak(h); stetoY.goster(CINGIRAK.steto);
            ilerle(); fermuar = 0; tutamakKoy(); ziplat(tutamak);
          }
        } else dalga.hidden = true;
      }
    },
    test: {
      nokta: (ad: string) => {
        const p: Record<string, Nokta> = {
          mino: { x: MINO_DUGMESI.sol + MINO_DUGMESI.g / 2, y: MINO_DUGMESI.ust + 120 }, ses: sesHedef, tutamak: { x: tutamak.offsetLeft + TUTAMAK_DUGMESI / 2, y: FERMUAR.bas.y },
          fermuarSon: FERMUAR.son, topCep: TOP_CEPTE, top: TOP_YERI, patiler: PATILER, boyun: BOYUN, toka: TOKA,
          dusme: dusmeYeri(atisNo),
        };
        return p[ad] ? I.ekrana(p[ad]) : null;
      },
      poz: () => pozSimdi,
      vurus: () => VURUS - ((performance.now() - ritimBas) % VURUS),
      sayim: () => ({ zipla, hedefZipla: Z.zipla, dinle, hedefDinle: Z.dinleMs, fermuar, sikisik: sikisik !== null, cepTers, topCikti, isabet, hedefRitim: Z.ritim, atisNo, hedefAtis: Z.atis, topUcuyor, minoBekliyor, topBoyunda, bagli, erken, boing: soylendi.has('mn-boing'), kisa: soylendi.has('mn-kisa'), sikisti: soylendi.has('mn-sikisti') }),
    },
  };
}
