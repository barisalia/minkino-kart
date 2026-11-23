// Minik Doktor · "Pamuk'un Hapşırığı" (sekiz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler, kapanış)
// vaka-kit'te; burada yakın planın katmanları, el hareketleri ve Pamuk'un tepkileri.
// Çizimler Astra'dan (Paket Doktor-Y5, assets/doktor/hapsu/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './hapsu.css';
import { SuKatmani } from '../vaka/his';
import { ELDE_OLCEK, beklemeKaresi } from '../vaka/veri';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ALETLER, BAS, BUHAR_DUGMESI, BURUN_DUGMESI, CEK_ESIGI, EFEKTLER, HAPSU, HAPSU_DOSYALAR, KAPANIS, KARE_MS, KASE, KUTU_DUGMESI, MASA, MENDIL_KUTUSU, NEFES_UZUN, RAF, SOZLER, ZORLUK,
  atkiAdimi, atkiBaslangici, atkiOrani, ATKI_TAMAM, basPozu, burundaMi, cekmeKaresi, cekmeUzunlugu, dokAdimi, egimAdimi, hapsuEvresi, kaseKademesi, kaseUstundeMi,
  nefesBitti, ortuAdimi, ORTU_TAMAM, papatyaKademesi, sallaAdimi, sallaBaslangici, silAdimi, sonrakiAsama, yakaladiMi,
  type Asama, type BasPozu, type HapsuEvresi,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('hapsu', HAPSU_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'hapsu', klasor: 'hapsu', dosyalar: HAPSU_DOSYALAR,
    hasta: { ad: 'Pamuk\'un burnu', kutu: MASA.pamuk, bekleme: [HAPSU.uzgun[0], HAPSU.uzgun[1]], kirp: HAPSU.uzgunKirp, sevinc: [HAPSU.sevinc[0], HAPSU.sevinc[1]], son: [HAPSU.son[0], HAPSU.son[1], HAPSU.son[1], HAPSU.son[1]],
      dokunma: MASA.burun, dugme: BURUN_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [HAPSU.mendil, HAPSU.demlik, HAPSU.atki, HAPSU.battaniye], seritAletleri: [HAPSU.mendil, HAPSU.demlik, HAPSU.atki],
    yakinFon: HAPSU.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER],
    sozler: { giris: 'pa-hap', canta: 'pa-canta', son: 'pa-son' },
    kapanis: KAPANIS,
  }, I => kurHapsu(I));
}

function kurHapsu(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, soyle, kinoTepki, oynat, parilti } = I;
  // ——————————————————————————— durum
  let yakalanan = 0, sil = 0, dokulen = 0, egim = 0, papatya = sallaBaslangici(), nefesSayisi = 0, atki = atkiBaslangici(), ortu = 0;
  let evre: HapsuEvresi | null = null, evreBas = 0, burundaSon = -1e9, mendilBurunda = false;
  let sikikKalan = 0, rahatKalan = 0, kikirKalan = 0, sisikKalan = 0, esneKalan = 0, mirr = false, nefes: 'al' | 'ver' | null = null, verKalan = 0;
  let sesAni = 0, buharAni = 0, burunBuharAni = 0, kivrimAni = 0, kivrimKaresi = 0, kacti = false, cek: { id: number } | null = null, nefesTut: { id: number; bas: number; bitti: boolean } | null = null;
  let papatyaSoylendi = false, nefesSoylendi = false, pozSimdi: BasPozu = 'uzgun';

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const kutu = el('button', 'vk-katman hs-kutu'); kutu.type = 'button'; kutu.setAttribute('aria-label', 'Mendil kutusu');
  ortala(kutu, { x: MENDIL_KUTUSU.kutu.sol + MENDIL_KUTUSU.kutu.g / 2, y: MENDIL_KUTUSU.kutu.ust + MENDIL_KUTUSU.kutu.y / 2 }, KUTU_DUGMESI, KUTU_DUGMESI);
  kutu.append(resim(HAPSU.mendilKutusu));
  const cekResmi = resim(HAPSU.mendilCek[0], 'vk-katman hs-cek'); koy(cekResmi, { sol: MENDIL_KUTUSU.agiz.x - 120, ust: MENDIL_KUTUSU.agiz.y - 390, g: 240, y: 400 }); cekResmi.hidden = true;
  const kase = el('div', 'vk-katman hs-kase'); koy(kase, KASE.kutu);
  const kaseY = yigin(HAPSU.kase, 'vk-tam'); const yuzenY = yigin(HAPSU.papatyaYuzen, 'vk-tam hs-yuzen'); yuzenY.kutu.classList.add('hs-yok');
  kase.append(kaseY.kutu, yuzenY.kutu);
  const basY = yigin(Object.values(HAPSU.bas), 'vk-fon vk-tam vk-soluk');
  const burunPembe = resim(HAPSU.burunPembe, 'vk-fon hs-katman');
  const gozyasi = resim(HAPSU.gozyasi, 'vk-fon hs-katman');
  const atkiY = yigin(HAPSU.atkiSarili, 'vk-fon vk-tam hs-atki'); atkiY.kutu.classList.add('hs-yok');
  const ortulu = resim(HAPSU.battaniyeOrtulu, 'vk-fon hs-ortulu');
  const kivrim = resim(HAPSU.battaniyeKivrim[0], 'vk-katman hs-kivrim'); kivrim.hidden = true;
  const su = new SuKatmani(I.cozulmus.get(HAPSU.sicrama[2]));
  // raf: demlik ve papatya kavanozu
  const rafDugmesi = (p: Nokta, ad: string, etiket: string) => { const b = el('button', 'vk-katman hs-raf'); b.type = 'button'; b.setAttribute('aria-label', etiket); ortala(b, p, RAF.dugme, RAF.dugme); b.append(resim(ad)); return b; };
  const demlikYer = rafDugmesi(RAF.demlik, HAPSU.demlik, 'Demlik');
  const kavanozYer = rafDugmesi(RAF.kavanoz, HAPSU.kavanoz, 'Papatya kavanozu');
  const buhar = el('button', 'vk-katman hs-buhar-dugmesi'); buhar.type = 'button'; buhar.setAttribute('aria-label', 'Buhar'); koy(buhar, BUHAR_DUGMESI); buhar.hidden = true;
  y.append(kase, basY.kutu, burunPembe, gozyasi, atkiY.kutu, ortulu, kivrim, su.tuval, kutu, cekResmi, demlikYer, kavanozYer, buhar);
  // şerit: atkı ve battaniye
  const dokAtki = I.dokDugmesi(0, HAPSU.atki, 'Atkı');
  const dokBattaniye = I.dokDugmesi(1, HAPSU.battaniye, 'Battaniye');
  // eldeki aletler
  const mendilY = yigin([HAPSU.mendil, HAPSU.mendilBuruk, HAPSU.mendilSisik], 'vk-alet-yigin');
  const demlikY = yigin([HAPSU.demlik, HAPSU.demlikEgik], 'vk-alet-yigin hs-demlik');
  const kavanozY = yigin([HAPSU.kavanoz, HAPSU.kavanozSalla], 'vk-alet-yigin');
  const atkiElY = yigin([HAPSU.atki, HAPSU.atkiUcan], 'vk-alet-yigin');
  I.aletEkle('mendil', ALETLER.mendil, [mendilY.kutu], HAPSU.mendil);
  I.aletEkle('demlik', ALETLER.demlik, [demlikY.kutu], HAPSU.demlik);
  I.aletEkle('kavanoz', ALETLER.kavanoz, [kavanozY.kutu], HAPSU.kavanoz);
  I.aletEkle('atki', ALETLER.atki, [atkiElY.kutu], HAPSU.atki);
  I.aletEkle('battaniye', ALETLER.battaniye, [resim(HAPSU.battaniye)], HAPSU.battaniye);
  { const a = ALETLER.demlik; demlikY.kutu.style.transformOrigin = `${a.tut[0] * 100}% ${a.tut[1] * 100}%`; }

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => I.asamaGec(a);
  const ilerle = () => gec(sonrakiAsama(asama()));

  // ——————————————————————————— 1 · mendil: kutudan çekip kopar
  kutu.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || cek) return;
    if (asama() !== 'mendil' && asama() !== 'sil') { I.yanlis(kutu); return; }
    cek = { id: e.pointerId };
    try { kutu.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
    cekResmi.hidden = false; cekResmi.src = I.adres(HAPSU.mendilCek[0]) ?? '';
    ses('h-cek', 0.7, 1.1); pop(cekResmi, 140);
  });
  addEventListener('pointermove', e => {
    if (!cek || e.pointerId !== cek.id) return;
    const p = I.noktaya(e), u = cekmeUzunlugu(p);
    const k = cekmeKaresi(u);
    const a = I.adres(HAPSU.mendilCek[k]) ?? ''; if (cekResmi.getAttribute('src') !== a) { cekResmi.src = a; ses('h-cek', 0.5, 1 + k * 0.15); }
    cekResmi.style.transform = `translateY(${-Math.min(u, CEK_ESIGI) * 0.35}px) scaleY(${1 + Math.min(u, CEK_ESIGI) / 600})`;
    if (u >= CEK_ESIGI) {
      // cırt: mendil kopar, ele geçer
      cek = null;
      cekResmi.hidden = true; cekResmi.style.transform = '';
      ses('h-cirt'); parilti(MENDIL_KUTUSU.agiz, 170);
      mendilY.goster(HAPSU.mendil);
      I.tut(kutu, 'mendil', e);
      if (asama() === 'mendil') { gec('hapsu'); evreBas = performance.now(); evre = null; if (yakalanan === 0) soyle('pa-cirt'); }
      kinoTepki('sevin', 400, 12);
    }
  }, { signal: I.iptal });
  const cekBitir = (e: PointerEvent) => { if (!cek || e.pointerId !== cek.id) return; cek = null; cekResmi.hidden = true; cekResmi.style.transform = ''; ses('e-tik', 0.4, 0.9); ziplat(kutu); };
  addEventListener('pointerup', cekBitir, { signal: I.iptal });
  addEventListener('pointercancel', cekBitir, { signal: I.iptal });

  // ——————————————————————————— 6 · nefes: buhara bastır ve tut
  buhar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'nefes' || nefesTut) return;
    nefesTut = { id: e.pointerId, bas: performance.now(), bitti: false };
    try { buhar.setPointerCapture(e.pointerId); } catch { /* */ }
    nefes = 'al';
    ses('h-nefes', 0.9);
    kinoTepki('izler', 300, 6);
  });
  const nefesBirak = (e: PointerEvent) => {
    if (!nefesTut || e.pointerId !== nefesTut.id) return;
    const t = nefesTut; nefesTut = null;
    if (t.bitti) return;
    const s = nefesBitti(performance.now() - t.bas, Z.nefesMs);
    nefesVer(s === 'tamam');
  };
  addEventListener('pointerup', nefesBirak, { signal: I.iptal });
  addEventListener('pointercancel', nefesBirak, { signal: I.iptal });
  function nefesVer(sayildi: boolean) {
    nefes = 'ver'; verKalan = 600;
    ses('h-ver', sayildi ? 0.9 : 0.5);
    void oynat([HAPSU.buharPuf], { x: BAS.agiz.x - 40, y: BAS.agiz.y + 40 }, 300, 300, KARE_MS.puf, { kayX: -120, kay: 40 });
    if (!sayildi) return;
    nefesSayisi++;
    burunPembe.style.opacity = Math.max(0.001, 0.55 * (1 - nefesSayisi / Z.nefes)).toFixed(3);
    gozyasi.style.opacity = Math.max(0.001, 1 - nefesSayisi / Z.nefes).toFixed(3);
    parilti(BAS.burun, 170);
    kinoTepki('sevin', 500, 14);
    if (!nefesSoylendi) { nefesSoylendi = true; soyle('pa-nefes'); }
    if (nefesSayisi >= Z.nefes) {
      ses('e-cin', 0.6); parilti(BAS.burun, 240);
      buhar.hidden = true;
      setTimeout(() => { if (I.calisiyor()) { ilerle(); ziplat(dokAtki); } }, sure(500));
    }
  }

  // ——————————————————————————— kapanış öncesi: battaniye örtülünce esner, mırlar
  async function uyku() {
    esneKalan = 900;
    soyle('pa-esne');
    ses('h-mirr', 0.6, 0.95);
    await new Promise(r => setTimeout(r, sure(900)));
    mirr = true;
    ses('h-mirr', 0.9);
    for (let i = 0; i < 3; i++) setTimeout(() => void oynat(HAPSU.kalp, { x: BAS.yuz.x + (Math.random() - 0.5) * 300, y: BAS.yuz.y - 300 }, 160, 160, KARE_MS.kalp, { kay: 140 }), sure(i * 180));
    kinoTepki('sevin', 900, 24);
    await new Promise(r => setTimeout(r, sure(700)));
    if (!I.calisiyor()) return;
    gec('kutlama');
    void I.kutla();
  }

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(demlikYer, 'demlik', () => asama() === 'dok', () => { egim = 0; });
  I.aletDugmesi(kavanozYer, 'kavanoz', () => asama() === 'papatya', () => { papatya = { ...papatya, uc: null, tepe: null, yon: 0 }; });
  I.aletDugmesi(dokAtki, 'atki', () => asama() === 'atki');
  I.aletDugmesi(dokBattaniye, 'battaniye', () => asama() === 'ort');

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    return a === 'mendil' || a === 'sil' ? [kutu] : a === 'dok' ? [demlikYer] : a === 'papatya' ? [kavanozYer] : a === 'nefes' ? [buhar] : a === 'atki' ? [dokAtki] : a === 'ort' ? [dokBattaniye] : [];
  };

  /** Hapşırık kaçtı: rüzgâr, uçuşan pamuklar ve mendiller; Pamuk kıkırdar, Kino şaşırır */
  function hapsuKacti() {
    ses('h-hapsu', 1);
    void oynat(HAPSU.hapsuRuzgar, { x: BAS.burun.x, y: BAS.burun.y + 120 }, 600, 400, KARE_MS.ruzgar);
    for (let i = 0; i < 5; i++) {
      const ad = i % 3 === 2 ? [HAPSU.ucanMendil] : HAPSU.ucanPamuk;
      void oynat(ad, { x: BAS.burun.x + (Math.random() - 0.5) * 200, y: BAS.burun.y + 160 }, i % 3 === 2 ? 300 : 200, i % 3 === 2 ? 300 : 200, KARE_MS.ucan * 2, { kayX: (i - 2) * 260, kay: 200 + Math.random() * 200, don: (Math.random() - 0.5) * 300 });
    }
    titret(basY.kutu);
    kikirKalan = 900;
    kinoTepki('sasir', 900, 26);
    if (!kacti) { kacti = true; soyle('pa-kacti'); } else ses('e-hihi', 0.8);
  }
  /** Hapşırık yakalandı: mendil şişer, "pof", uçup gider */
  function hapsuYakalandi(h: Tutulan) {
    ses('h-hapsu', 0.7); ses('h-pof', 1);
    mendilY.goster(HAPSU.mendilSisik);
    h.kutu.animate([{ scale: '1' }, { scale: '1.25' }, { scale: '1.1' }], { duration: sure(240), easing: 'ease-out', composite: 'add' });
    yakalanan++;
    rahatKalan = 800;
    kinoTepki('sevin', 700, 24);
    parilti(BAS.burun, 220);
    soyle('pa-yakala');
    const p = I.ucNoktasi(h);
    void I.yerineKoy(h, p, 1, 80).then(() => { void oynat(HAPSU.mendilUcan, p, 400, 400, KARE_MS.ucan, { kayX: 520, kay: 320, don: 160 }); });
    evre = null;
    gec(yakalanan >= Z.hapsu ? 'sil' : 'mendil');
    ziplat(kutu);
  }

  return {
    yaklasinca: () => { gec('mendil'); ziplat(kutu); },
    kutlamaYeri: { x: BAS.yuz.x, y: BAS.yuz.y - 40 },
    siradaki,
    kinoSasirsin: () => evre === 'hap1',
    bosDokunus: (p: Nokta) => { if (Math.hypot(p.x - BAS.burun.x, p.y - BAS.burun.y) < 380) { hop(basY.kutu, 8, 200); ses('e-hihi', 0.4, 1.2); } },
    kalkinca: (t: Tutulan) => {
      // hapşırık beklenirken mendil bırakılırsa mendil buruşup düşer, yenisi çekilir
      if (t.ad === 'mendil' && asama() === 'hapsu') { evre = null; gec('mendil'); void I.yerineKoy(t, I.ucNoktasi(t), 0.8, 120); ziplat(kutu); return true; }
      if (t.ad === 'demlik') { demlikY.kutu.style.rotate = ''; su.kes(); egim = 0; }
      if (t.ad === 'mendil' && asama() === 'sil') { void I.yerineKoy(t, I.ucNoktasi(t), 0.8, 120); ziplat(kutu); return true; }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) => {
      sikikKalan = Math.max(0, sikikKalan - dt); rahatKalan = Math.max(0, rahatKalan - dt); kikirKalan = Math.max(0, kikirKalan - dt);
      sisikKalan = Math.max(0, sisikKalan - dt); esneKalan = Math.max(0, esneKalan - dt); verKalan = Math.max(0, verKalan - dt);
      if (nefes === 'ver' && verKalan === 0) nefes = null;
      const a = asama();
      const poz = basPozu({ asama: a, evre, sikikKalan, rahatKalan, kikirKalan, sisikKalan, nefes, esneKalan, mirr, kirp: beklemeKaresi(an) === 'kirp', an });
      if (poz !== pozSimdi) {
        const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('kasin') || pozSimdi.startsWith('kasin');
        pozSimdi = poz; basY.goster(HAPSU.bas[poz]);
        if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
      }
      // hapşırık döngüsü (yalnız mendil elde, hapşırık aşamasında)
      if (a === 'hapsu' && h && h.ad === 'mendil') {
        const e = hapsuEvresi(an - evreBas);
        mendilBurunda = !!uc && burundaMi(uc);
        if (mendilBurunda) burundaSon = an;
        if (e !== evre) {
          evre = e;
          if (e === 'hap0') ses('e-tik', 0.3, 1.6);
          if (e === 'hapsu') { if (yakaladiMi(mendilBurunda, an - burundaSon, Z.pencere)) hapsuYakalandi(h); else hapsuKacti(); }
        }
      } else if (a !== 'hapsu') evre = null;
      // kâsenin buharı: su doldukça yükselir
      if (kaseKademesi(dokulen, Z.dok) > 0 && a !== 'kutlama' && a !== 'son' && an - buharAni > (a === 'nefes' ? 420 : 700)) {
        buharAni = an;
        void oynat(HAPSU.buhar, { x: KASE.yuz.x + (Math.random() - 0.5) * 160, y: KASE.yuz.y }, 400, 500, KARE_MS.buhar, { taban: true, kay: 120, kayX: (Math.random() - 0.5) * 60 });
      }
      // nefes alırken buhar buruna akar; çok uzun tutulursa yanaklar şişer
      if (nefesTut && !nefesTut.bitti) {
        const gecen = an - nefesTut.bas;
        if (an - burunBuharAni > 360) { burunBuharAni = an; void oynat(HAPSU.buharBurun, { x: (BAS.burun.x + KASE.yuz.x) / 2, y: (BAS.burun.y + KASE.yuz.y) / 2 }, 400, 400, KARE_MS.burun, { kay: 60 }); }
        if (gecen >= NEFES_UZUN) {
          nefesTut.bitti = true; nefes = null;
          sisikKalan = 900; ses('h-pof', 0.9); soyle('pa-sisik'); kinoTepki('sasir', 700, 18);
          setTimeout(() => nefesVer(false), sure(700));
        }
      }
      if (!h || !uc) return;
      if (h.ad === 'mendil' && a === 'sil') {
        const burunda = burundaMi(uc);
        if (burunda) { sikikKalan = 400; if (yol > 2) mendilY.goster(HAPSU.mendilBuruk); if (yol > 2 && an - sesAni > 260) { sesAni = an; ses('h-cek', 0.5, 0.8); } }
        sil = silAdimi(sil, burunda, yol, dt, Z.sil);
        burunPembe.style.opacity = (1 - 0.45 * (sil / Z.sil)).toFixed(3);
        if (sil >= Z.sil) {
          soyle('pa-sil'); parilti(BAS.burun, 200); kinoTepki('sevin', 600, 18);
          void I.yerineKoy(h, uc, 0.6, 140).then(() => void oynat(HAPSU.mendilUcan, uc, 400, 400, KARE_MS.ucan, { kayX: -420, kay: 200, don: -120 }));
          ilerle(); ziplat(demlikYer);
        }
        return;
      }
      if (h.ad === 'demlik' && a === 'dok') {
        // eğik demliğin ağzı: tutulan yerin çevresinde döner
        const t = ALETLER.demlik, aci = (-egim * Math.PI) / 180;
        const vx = (t.uc[0] - t.tut[0]) * t.g * ELDE_OLCEK, vy = (t.uc[1] - t.tut[1]) * t.y * ELDE_OLCEK;
        const tutYeri = { x: h.parmak.x, y: h.parmak.y - (t.kaldir ?? 40) };
        const agiz = { x: tutYeri.x + vx * Math.cos(aci) - vy * Math.sin(aci), y: tutYeri.y + vx * Math.sin(aci) + vy * Math.cos(aci) };
        const dy = h.ucOnce ? uc.y - h.ucOnce.y : 0;
        egim = egimAdimi(egim, kaseUstundeMi(agiz), dy, dt);
        demlikY.kutu.style.rotate = `${-egim}deg`;
        demlikY.goster(egim >= Z.egim ? HAPSU.demlikEgik : HAPSU.demlik);
        const once = kaseKademesi(dokulen, Z.dok);
        dokulen = dokAdimi(dokulen, egim, Z.egim, dt, Z.dok);
        if (egim >= Z.egim) {
          su.ak(agiz, KASE.yuz.y);
          if (an - sesAni > 300) { sesAni = an; ses('h-dok', 0.7, 0.9 + Math.random() * 0.2); void oynat(HAPSU.sicrama, { x: agiz.x, y: KASE.yuz.y }, 240, 240, KARE_MS.sicrama, { taban: true }); }
        } else su.kes();
        const simdi = kaseKademesi(dokulen, Z.dok);
        if (simdi !== once) { kaseY.goster(HAPSU.kase[simdi]); pop(kaseY.kutu, 200); kinoTepki('sevin', 400, 12); }
        if (dokulen >= Z.dok) { su.kes(); egim = 0; demlikY.kutu.style.rotate = ''; ses('e-cin', 0.5); I.birak(h); ilerle(); ziplat(kavanozYer); }
        return;
      }
      if (h.ad === 'kavanoz' && a === 'papatya') {
        const ustunde = kaseUstundeMi(uc);
        const once = papatya.sayi;
        papatya = sallaAdimi(papatya, uc.y, ustunde, dt);
        kavanozY.goster(ustunde && yol > 4 ? HAPSU.kavanozSalla : HAPSU.kavanoz);
        if (papatya.sayi > once) {
          ses('h-papatya', 0.9, 0.9 + Math.random() * 0.25);
          // bir tutam papatya kavanozun ağzından suya düşer, yüzer
          for (let i = 0; i < 2; i++) {
            const r = resim(HAPSU.papatya[Math.floor(Math.random() * 3)], 'vk-katman hs-papatya'); ortala(r, uc, 120, 120); I.etkiKati.append(r);
            const hx = KASE.yuz.x + (Math.random() - 0.5) * 300 - uc.x, hy = KASE.yuz.y - uc.y;
            void r.animate([{ transform: 'translate(0, 0) rotate(0deg)' }, { transform: `translate(${hx}px, ${hy}px) rotate(${(Math.random() - 0.5) * 540}deg)` }], { duration: sure(520 + i * 120), easing: 'cubic-bezier(.5,0,1,.6)' }).finished.then(() => r.remove(), () => r.remove());
          }
          setTimeout(() => {
            const k = papatyaKademesi(papatya.sayi, Z.papatya);
            if (k > 0) { yuzenY.kutu.classList.remove('hs-yok'); yuzenY.goster(HAPSU.papatyaYuzen[k - 1]); }
            void oynat(HAPSU.koku, { x: KASE.yuz.x, y: KASE.yuz.y - 80 }, 300, 300, KARE_MS.koku, { kay: 200 });
          }, sure(560));
          if (!papatyaSoylendi && papatya.sayi >= 2) { papatyaSoylendi = true; soyle('pa-papatya'); }
          hop(basY.kutu, 6, 200);
        }
        if (papatya.sayi >= Z.papatya) {
          yuzenY.kutu.classList.remove('hs-yok'); yuzenY.goster(HAPSU.papatyaYuzen[2]);
          ses('e-cin', 0.5); kinoTepki('sevin', 600, 18);
          I.birak(h); ilerle();
          buhar.hidden = false; ziplat(buhar);
        }
        return;
      }
      if (h.ad === 'atki' && a === 'atki') {
        atki = atkiAdimi(atki, uc);
        const o = atkiOrani(atki);
        atkiElY.goster(o > 0 ? HAPSU.atkiUcan : HAPSU.atki);
        if (o > 0.3) { atkiY.kutu.classList.remove('hs-yok'); atkiY.goster(HAPSU.atkiSarili[o > 0.6 ? 1 : 0]); }
        if (yol > 3 && o > 0 && an - sesAni > 280) { sesAni = an; ses('h-atki', 0.7, 0.9 + o * 0.3); }
        if (o >= ATKI_TAMAM) {
          atkiY.goster(HAPSU.atkiSarili[2]); pop(atkiY.kutu, 240);
          void I.yerineKoy(h, { x: (BAS.boyun.sol + BAS.boyun.sag) / 2, y: BAS.boyun.ust + 40 }, 0.5, 160);
          dokAtki.hidden = true;
          soyle('pa-atki'); ses('e-cin', 0.5); kinoTepki('sevin', 700, 22);
          void oynat(HAPSU.kalp, { x: BAS.yuz.x + 220, y: BAS.boyun.ust - 120 }, 160, 160, KARE_MS.kalp, { kay: 160 });
          ilerle(); ziplat(dokBattaniye);
        }
        return;
      }
      if (h.ad === 'battaniye' && a === 'ort') {
        ortu = ortuAdimi(ortu, uc);
        const g = BAS.gogus, ust = g.alt - ortu * (g.alt - g.ust);
        ortulu.style.clipPath = `inset(${((ust / 1152) * 100).toFixed(2)}% 0 0 0)`;
        if (ortu > 0) {
          kivrim.hidden = false; koy(kivrim, { sol: g.sol - 40, ust: ust - 100, g: g.sag - g.sol + 80, y: 200 });
          if (an - kivrimAni > KARE_MS.kivrim) { kivrimAni = an; kivrimKaresi = 1 - kivrimKaresi; kivrim.src = I.adres(HAPSU.battaniyeKivrim[kivrimKaresi]) ?? ''; }
        }
        if (yol > 3 && ortu > 0 && an - sesAni > 300) { sesAni = an; ses('h-atki', 0.6, 0.8); }
        if (ortu >= ORTU_TAMAM) {
          ortulu.style.clipPath = 'inset(0 0 0 0)'; kivrim.hidden = true;
          void I.yerineKoy(h, { x: (g.sol + g.sag) / 2, y: g.ust }, 0.5, 160);
          dokBattaniye.hidden = true;
          void uyku();
        }
      }
    },
    test: {
      nokta: (ad: string) => {
        const e = I.ekrana;
        const p: Record<string, Nokta> = { kutu: MENDIL_KUTUSU.agiz, burun: BAS.burun, demlik: RAF.demlik, kavanoz: RAF.kavanoz, kase: KASE.yuz, buhar: { x: KASE.yuz.x, y: KASE.yuz.y - 60 }, boyunSol: { x: BAS.boyun.sol, y: (BAS.boyun.ust + BAS.boyun.alt) / 2 }, boyunSag: { x: BAS.boyun.sag, y: (BAS.boyun.ust + BAS.boyun.alt) / 2 }, gogusAlt: { x: (BAS.gogus.sol + BAS.gogus.sag) / 2, y: BAS.gogus.alt }, gogusUst: { x: (BAS.gogus.sol + BAS.gogus.sag) / 2, y: BAS.gogus.ust - 40 } };
        return p[ad] ? e(p[ad]) : null;
      },
      poz: () => pozSimdi,
      evre: () => evre,
      sayim: () => ({ yakalanan, hedefHapsu: Z.hapsu, sil, hedefSil: Z.sil, dokulen, hedefDok: Z.dok, egim, papatya: papatya.sayi, hedefPapatya: Z.papatya, nefes: nefesSayisi, hedefNefes: Z.nefes, atki: atkiOrani(atki), ortu, mirr, kacti }),
    },
  };

}
