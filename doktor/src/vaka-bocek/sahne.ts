// Minik Doktor · "Bulut'un Uğur Böceği" (sekiz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler, kapanış)
// vaka-kit'te; burada yakın planın katmanları, el hareketleri, böceğin yolları ve Bulut'un tepkileri.
// Böceğe hiçbir alet dokunmaz; kulağın içine hiçbir şey girmez. Çizimler Astra'dan (Paket Doktor-Y9, assets/doktor/bocek/);
// biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok. Büyüteç Y1'den aynen.
import './bocek.css';
import { VAKA, beklemeKaresi } from '../vaka/veri';
import { ortalamaHiz } from '../vaka-kit/ortak';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ACIK_YER, ALETLER, BANTLAR, BANT_TAMAM, BAS, BOCEK, BOCEK_BOYU, BOCEK_DOSYALAR, BOCEK_DUGMESI, DURGUN_HIZ, DURGUN_MS, EFEKTLER, KAPANIS, KARE_MS, KINO_BURUN, KINO_HAPSU,
  KULAK, KULAK_DUGMESI, KULAK_UCU, KULAK_UCU_DUGMESI, MASA, MERCEK, PAYLASILAN, PENCERE, PERVAZ, SELAM_YERLERI, SOZLER, TUTAMLAR, TUTAM_BOYU, TUTAM_DUGMESI, ZORLUK,
  aralandiMi, bantAdimi, bantBaslangici, bantBul, bantOrani, basPozu, bulmaAdimi, gozdeMi, hiz, kacisYeri, kalpNoktasi, kulakPozu, kulaktaMi, penceredeMi, sallaAdimi,
  sallaBaslangici, sertMi, sonrakiAsama, ucusNoktasi, urkerMi, uzak,
  type Asama, type BasPozu, type SozAdi,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('bocek', BOCEK_DOSYALAR, PAYLASILAN);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'bocek', klasor: 'bocek', dosyalar: BOCEK_DOSYALAR, paylasilan: PAYLASILAN,
    hasta: { ad: 'Bulut\'un kulağı', kutu: MASA.bulut, bekleme: [BOCEK.uzgun[0], BOCEK.uzgun[1]], kirp: BOCEK.uzgunKirp, sevinc: [BOCEK.sevinc[0], BOCEK.sevinc[1]], son: [BOCEK.son[0], BOCEK.son[1], BOCEK.son[0], BOCEK.son[1]],
      dokunma: MASA.kulak, dugme: KULAK_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [VAKA.buyutec, BOCEK.yaprak, BOCEK.firca], seritAletleri: [VAKA.buyutec, BOCEK.yaprak, BOCEK.firca],
    yakinFon: BOCEK.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER, KINO_HAPSU],
    // Bulut'un klonu yok: girişte kıkırdaması duyulur, kapanışta böceğin vızıltısı
    sozler: { giris: 'e-hihi', canta: 'bu-canta', son: 'bu-son', sonSonra: 'u-vizz' },
    kapanis: KAPANIS,
  }, I => kurBocek(I));
}

type Bocek = { kutu: HTMLDivElement; r: HTMLImageElement; yer: Nokta; aci: number };

function kurBocek(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, kinoTepki, oynat, parilti } = I;
  const soyle = (ad: SozAdi | typeof KINO_HAPSU) => I.soyle(ad);
  // ——————————————————————————— durum
  let bocekTutam = Math.floor(Math.random() * TUTAMLAR.length), gizli = true, mesgul = false, kacis = 0, bul = 0, gozBirikim = 0, gozAni = -1e9;
  let yaklas = 0, saklanKalan = 0, yapraktaSakli = false, durgun = 0, bantlar = BANTLAR.map(() => bantBaslangici()), bantBitti = BANTLAR.map(() => false), tersAni = -1e9;
  let salla = sallaBaslangici(), sallaBas: { id: number; y: number } | null = null, sertKalan = 0, ucus: { id: number; y: number } | null = null;
  let selamDokunulan = [false, false, false], elHizi = 0;
  let sallaKalan = 0, korKalan = 0, irkilKalan = 0, sasirKalan = 0, kikirKalan = 0, gidikKalan = 0, ohhKalan = 0;
  let kipirtiAni = performance.now() + 900, dalAni = 0, dalKaresi = 0, sesAni = 0, izAni = 0, yaprakKareAni = 0, yaprakKaresi = 0, pozSimdi: BasPozu = 'uzgun';
  const soylendi = new Set<string>();
  const birKez = (ad: SozAdi) => { if (soylendi.has(ad)) return; soylendi.add(ad); soyle(ad); };

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const dalY = yigin(BOCEK.dal, 'vk-katman bc-dal'); koy(dalY.kutu, PENCERE);
  const basY = yigin(Object.values(BOCEK.bas), 'vk-fon vk-tam vk-soluk');
  const kulakY = yigin(Object.values(BOCEK.kulak), 'vk-fon vk-tam bc-kulak');
  const tam = () => { const d = el('div', 'vk-katman bc-yuva'); koy(d, { sol: 0, ust: 0, g: 2048, y: 1152 }); return d; };
  const bocekArka = tam(), bocekOn = tam();
  const tutamlar = TUTAMLAR.map((p, i) => {
    const b = el('button', 'vk-katman bc-tutam'); b.type = 'button'; b.setAttribute('aria-label', 'Tüy tutamı ' + (i + 1));
    ortala(b, p, TUTAM_DUGMESI, TUTAM_DUGMESI);
    const yg = yigin([BOCEK.tutam, BOCEK.tutamAralik, BOCEK.tutamDik], 'bc-tutam-resmi');
    Object.assign(yg.kutu.style, { left: `${(TUTAM_DUGMESI - TUTAM_BOYU) / 2}px`, top: `${(TUTAM_DUGMESI - TUTAM_BOYU) / 2}px`, width: TUTAM_BOYU + 'px', height: TUTAM_BOYU + 'px' });
    b.append(yg.kutu);
    return { b, y: yg, aralikSonu: 0 };
  });
  const tutamKati = tam(); tutamKati.classList.add('bc-tutam-kati'); tutamKati.append(...tutamlar.map(t => t.b));
  const bocek: Bocek = { kutu: el('div', 'vk-katman bc-bocek'), r: resim(BOCEK.otur[0]), yer: TUTAMLAR[bocekTutam], aci: 0 };
  bocek.kutu.style.width = bocek.kutu.style.height = BOCEK_BOYU + 'px'; bocek.kutu.append(bocek.r);
  const kulakUcu = el('button', 'vk-katman bc-kulak-ucu'); kulakUcu.type = 'button'; kulakUcu.setAttribute('aria-label', 'Kulağın ucu'); ortala(kulakUcu, KULAK_UCU, KULAK_UCU_DUGMESI, KULAK_UCU_DUGMESI); kulakUcu.hidden = true;
  const pervazYaprak = resim(BOCEK.yaprakPervazda, 'vk-katman bc-pervaz'); ortala(pervazYaprak, { x: PERVAZ.x, y: PERVAZ.y + 30 }, 400, 300); pervazYaprak.hidden = true;
  const bocekDugme = el('button', 'vk-katman bc-bocek-dugmesi'); bocekDugme.type = 'button'; bocekDugme.setAttribute('aria-label', 'Uğur böceği'); ortala(bocekDugme, PERVAZ, BOCEK_DUGMESI, BOCEK_DUGMESI); bocekDugme.hidden = true;
  const selamlar = SELAM_YERLERI.map((p, i) => {
    const b = el('button', 'vk-katman bc-selam'); b.type = 'button'; b.setAttribute('aria-label', 'Uğur böceği ' + (i + 1)); ortala(b, p, BOCEK_DUGMESI, BOCEK_DUGMESI); b.hidden = true;
    const adlar = i === 1 ? [...BOCEK.selam, ...BOCEK.kanat, ...BOCEK.uc] : i === 0 ? [...BOCEK.arkadasA, BOCEK.arkadasAUc] : [...BOCEK.arkadasB, BOCEK.arkadasBUc];
    const yg = yigin(adlar, 'bc-selam-resmi'); b.append(yg.kutu);
    return { b, y: yg, i };
  });
  // büyütecin camı: sahnenin bir kopyası, camın ortasında büyütülmüş
  const mercek = el('div', 'vk-katman bc-mercek'); mercek.style.width = mercek.style.height = MERCEK.cap + 'px'; mercek.hidden = true;
  const mIc = el('div', 'bc-mercek-ic');
  const mFon = resim(BOCEK.fon, 'vk-fon'), mBas = resim(BOCEK.bas.uzgun, 'vk-fon'), mKulak = resim(BOCEK.kulak.dagik, 'vk-fon');
  const mBocek = resim(BOCEK.otur[0], 'vk-katman'); mBocek.style.width = mBocek.style.height = BOCEK_BOYU + 'px';
  const mTutam = TUTAMLAR.map(p => { const r = resim(BOCEK.tutam, 'vk-katman'); ortala(r, p, TUTAM_BOYU, TUTAM_BOYU); return r; });
  mIc.append(mFon, mBas, mKulak, mBocek, ...mTutam); mercek.append(mIc);
  y.append(dalY.kutu, basY.kutu, kulakY.kutu, pervazYaprak, bocekArka, tutamKati, bocekOn, bocekDugme, ...selamlar.map(s => s.b), kulakUcu);
  I.etkiKati.append(mercek);
  // şerit: büyüteç (Y1), yaprak, fırça
  const dokBuyutec = I.dokDugmesi(0, VAKA.buyutec, 'Büyüteç');
  const dokYaprak = I.dokDugmesi(1, BOCEK.yaprak, 'Yeşil yaprak');
  const dokFirca = I.dokDugmesi(2, BOCEK.firca, 'Yumuşak fırça');
  // eldeki aletler
  const yaprakY = yigin([BOCEK.yaprak, ...BOCEK.yaprakBocekli, BOCEK.yaprakSaklanmis, ...BOCEK.yaprakSalla], 'vk-alet-yigin');
  I.aletEkle('buyutec', ALETLER.buyutec, [resim(VAKA.buyutec)], VAKA.buyutec);
  I.aletEkle('yaprak', ALETLER.yaprak, [yaprakY.kutu], BOCEK.yaprak);
  I.aletEkle('firca', ALETLER.firca, [resim(BOCEK.firca)], BOCEK.firca);

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => { I.asamaGec(a); kulakUcu.hidden = a !== 'salla'; };
  const ilerle = () => gec(sonrakiAsama(asama()));

  // ——————————————————————————— böcek
  const bocekKoy = (p: Nokta, aci = bocek.aci) => {
    bocek.yer = p; bocek.aci = aci;
    bocek.kutu.style.transform = `translate3d(${(p.x - BOCEK_BOYU / 2).toFixed(1)}px, ${(p.y - BOCEK_BOYU / 2).toFixed(1)}px, 0) rotate(${aci.toFixed(0)}deg)`;
  };
  const bocekKare = (ad: string) => { const a = I.adres(ad) ?? ''; if (bocek.r.getAttribute('src') !== a) bocek.r.src = a; };
  /** tutamın arkasında (gizli) ya da önünde (görünür) */
  const bocekGizle = (g: boolean) => { gizli = g; (g ? bocekArka : bocekOn).append(bocek.kutu); };
  bocekGizle(true); bocekKoy(TUTAMLAR[bocekTutam]); bocekKare(BOCEK.otur[0]);
  /** böcek bir yerden bir yere yürür (kareler, yönüne döner); söner ya da vaka kapanırsa yarıda kalır */
  function bocekYuru(hedef: Nokta, ms: number, kareler: readonly string[] = BOCEK.yuru, kareMs: number = KARE_MS.yuru, sesli = true): Promise<void> {
    const bas = bocek.yer, t0 = performance.now(), sureMs = sure(ms);
    const aci = (Math.atan2(hedef.y - bas.y, hedef.x - bas.x) * 180) / Math.PI;
    let tik = 0;
    return new Promise(bitti => {
      const adim = (an: number) => {
        if (!I.calisiyor()) { bitti(); return; }
        const t = Math.min(1, (an - t0) / sureMs), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        bocekKoy({ x: bas.x + (hedef.x - bas.x) * e, y: bas.y + (hedef.y - bas.y) * e }, aci);
        bocekKare(kareler[Math.floor((an - t0) / kareMs) % kareler.length]);
        if (sesli && an - tik > 180) { tik = an; ses('u-tikir', 0.5, 0.9 + Math.random() * 0.3); }
        if (t >= 1) { bitti(); return; }
        requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
  }
  /** bir yol boyunca uçuş (kanat kareleri) */
  function uc(yol: (t: number) => Nokta, ms: number, r: HTMLElement, kareler: readonly string[], goster: (ad: string) => void, yari = BOCEK_BOYU / 2): Promise<void> {
    const t0 = performance.now(), sureMs = sure(ms);
    let once = yol(0), vz = 0;
    return new Promise(bitti => {
      const adim = (an: number) => {
        if (!I.calisiyor()) { bitti(); return; }
        const t = Math.min(1, (an - t0) / sureMs), p = yol(t);
        const aci = (Math.atan2(p.y - once.y, p.x - once.x) * 180) / Math.PI; once = p;
        r.style.transform = `translate3d(${(p.x - yari).toFixed(1)}px, ${(p.y - yari).toFixed(1)}px, 0) rotate(${(aci * 0.25).toFixed(0)}deg)`;
        goster(kareler[Math.floor((an - t0) / KARE_MS.uc) % kareler.length]);
        if (an - vz > 260) { vz = an; ses('u-vizz', 0.35, 1 + Math.random() * 0.2); }
        if (t >= 1) { bitti(); return; }
        requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
  }
  const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, sure(ms)));
  const kareler = async (adlar: readonly string[], ms: number) => { for (const a of adlar) { bocekKare(a); await bekle(ms); } };

  // ——————————————————————————— 2 · tüyleri arala
  tutamlar.forEach((t, i) => t.b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan()) return;
    const a = asama();
    if (a !== 'arala') { if (a === 'bul' || a === 'yaprak' || a === 'tasi') { titret(t.b); gidikKalan = 500; ses('e-hihi', 0.4, 1.2); } return; }
    if (mesgul) return;
    const bas = I.noktaya(e).x, id = e.pointerId;
    try { t.b.setPointerCapture(id); } catch { /* */ }
    ses('u-hisir', 0.4, 1.2);
    const hareket = (m: PointerEvent) => {
      if (m.pointerId !== id || !aralandiMi(bas, I.noktaya(m).x)) return;
      kaldir();
      void arala(i);
    };
    const kaldir = () => { removeEventListener('pointermove', hareket); removeEventListener('pointerup', kaldir); removeEventListener('pointercancel', kaldir); };
    addEventListener('pointermove', hareket, { signal: I.iptal });
    addEventListener('pointerup', kaldir, { signal: I.iptal });
    addEventListener('pointercancel', kaldir, { signal: I.iptal });
  }));
  async function arala(i: number) {
    const t = tutamlar[i];
    t.y.goster(BOCEK.tutamAralik); pop(t.y.kutu, 200);
    ses('u-hisir', 0.9, 0.9 + Math.random() * 0.2);
    t.aralikSonu = performance.now() + 1100;
    setTimeout(() => { if (performance.now() >= t.aralikSonu - 5 && asama() !== 'firca') t.y.goster(BOCEK.tutam); }, sure(1100));
    if (i !== bocekTutam || !gizli) {
      void oynat(BOCEK.tuyUcusan, TUTAMLAR[i], 300, 300, KARE_MS.bak * 2, { kay: 120, kayX: (Math.random() - 0.5) * 120 });
      gidikKalan = 600; ses('e-hihi', 0.45, 1.1);
      return;
    }
    // böcek göründü: bakar, sonra ya kaçar ya da açığa çıkıp oturur
    mesgul = true;
    bocekGizle(false); bocekKoy(TUTAMLAR[i], 0);
    sasirKalan = 600; ses('u-cik', 0.9); kinoTepki('sasir', 600, 16);
    await kareler(BOCEK.bak, KARE_MS.bak);
    if (!I.calisiyor()) return;
    if (kacis < Z.kacis) {
      kacis++;
      kikirKalan = 900; if (kacis === 1) soyle('bu-kacti'); else ses('e-hihi', 0.7);
      const j = kacisYeri(bocekTutam, kacis);
      await bocekYuru(TUTAMLAR[j], 650);
      bocekTutam = j; bocekGizle(true); bocekKare(BOCEK.otur[0]);
      titret(tutamlar[j].b); kipirtiAni = performance.now() + 700;
      mesgul = false;
      return;
    }
    // yoruldu: açıkta oturur, yüzünü temizler
    await bocekYuru(ACIK_YER, 700);
    bocekTutam = -1;
    ses('u-cik', 0.6, 1.2); kinoTepki('sevin', 500, 14);
    mesgul = false;
    ilerle(); ziplat(dokYaprak);
  }

  // ——————————————————————————— 5 · uçur: pervazdaki böceği yukarı doğru çek
  bocekDugme.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'ucur' || mesgul) return;
    ucus = { id: e.pointerId, y: I.noktaya(e).y };
    try { bocekDugme.setPointerCapture(e.pointerId); } catch { /* */ }
    void kareler([BOCEK.kanat[0], BOCEK.otur[0]], KARE_MS.kanat); ses('u-vizz', 0.4, 1.3);
  });
  addEventListener('pointermove', e => {
    if (!ucus || e.pointerId !== ucus.id) return;
    if (ucus.y - I.noktaya(e).y < 100) return;
    ucus = null;
    void ucur();
  }, { signal: I.iptal });
  const ucusBitir = (e: PointerEvent) => { if (ucus && e.pointerId === ucus.id) { ucus = null; ziplat(bocekDugme); } };
  addEventListener('pointerup', ucusBitir, { signal: I.iptal });
  addEventListener('pointercancel', ucusBitir, { signal: I.iptal });
  async function ucur() {
    mesgul = true;
    bocekDugme.hidden = true;
    bocekGizle(false); bocekKoy(PERVAZ, 0);
    ses('u-vizz', 0.9);
    await kareler(BOCEK.kanat, KARE_MS.kanat);
    // odada bir tur, Kino'nun burnuna
    await uc(t => ucusNoktasi(t, PERVAZ, KINO_BURUN), 1500, bocek.kutu, BOCEK.uc, bocekKare);
    bocek.yer = KINO_BURUN;
    bocekKare(BOCEK.burun); bocekKoy(KINO_BURUN, 0);
    kinoTepki('sasir', 1500, 22); kikirKalan = 1200; ses('e-hihi', 0.7);
    await bekle(650);
    soyle(KINO_HAPSU);
    await bekle(260);
    kinoTepki('sasir', 600, 40);
    // hapşırıkla havalanır, pencereden gider; Bulut el sallar
    sallaKalan = 2200; soyle('bu-gule');
    const son = { x: 1960, y: 60 };
    await uc(t => ({ x: KINO_BURUN.x + (son.x - KINO_BURUN.x) * t, y: KINO_BURUN.y + (son.y - KINO_BURUN.y) * t - Math.sin(t * Math.PI) * 260 }), 1300, bocek.kutu, BOCEK.uc, bocekKare);
    bocek.kutu.hidden = true;
    pervazYaprak.hidden = true;
    parilti({ x: 1880, y: 140 }, 220); ses('u-cin', 0.7);
    mesgul = false;
    ilerle(); ziplat(dokFirca);
  }

  // ——————————————————————————— 7 · kulağın ucunu salla
  kulakUcu.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'salla') return;
    sallaBas = { id: e.pointerId, y: I.noktaya(e).y };
    salla = { ...salla, uc: null, tepe: null, yon: 0 };
    try { kulakUcu.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('u-flap', 0.4, 1.2);
  });
  addEventListener('pointermove', e => {
    if (!sallaBas || e.pointerId !== sallaBas.id || asama() !== 'salla') return;
    const v = I.noktaya(e).y, once = salla.sayi;
    salla = sallaAdimi(salla, v);
    if (sertKalan <= 0) kulakY.goster(BOCEK.kulak[kulakPozu(v - sallaBas.y)]);
    if (sertMi(sallaBas.y, v) && sertKalan <= 0) {
      sertKalan = 900; korKalan = 900; kulakY.goster(BOCEK.kulak.gozde); ses('u-flap', 1, 0.8); birKez('bu-kor'); kinoTepki('sevin', 700, 20);
      return;
    }
    if (salla.sayi > once) {
      ses('u-flap', 0.9, 0.9 + salla.sayi * 0.08); hop(kulakY.kutu, 8, 200);
      if (salla.sayi === 1) soyle('bu-flap');
      kikirKalan = 500;
      if (salla.sayi >= Z.salla) {
        sallaBas = null; kulakY.goster(BOCEK.kulak.tarali); pop(kulakY.kutu, 260); parilti(KULAK_UCU, 220); ses('e-cin', 0.6); kinoTepki('sevin', 700, 22);
        gec('selam'); void selam();
      }
    }
  }, { signal: I.iptal });
  const sallaBitir = (e: PointerEvent) => { if (sallaBas && e.pointerId === sallaBas.id) { sallaBas = null; if (sertKalan <= 0) kulakY.goster(BOCEK.kulak.tarali); } };
  addEventListener('pointerup', sallaBitir, { signal: I.iptal });
  addEventListener('pointercancel', sallaBitir, { signal: I.iptal });

  // ——————————————————————————— 8 · teşekkür: üç uğur böceği pervaza konar; her birine dokun, kalp çizip uçarlar
  async function selam() {
    mesgul = true;
    soyle('bu-selam');
    for (const s of selamlar) {
      const p = SELAM_YERLERI[s.i], bas = { x: 1980 + s.i * 30, y: -80 };
      s.b.hidden = false; s.b.style.pointerEvents = 'none'; s.b.style.left = '0px'; s.b.style.top = '0px';
      const ucK = s.i === 1 ? BOCEK.uc : [s.i === 0 ? BOCEK.arkadasAUc : BOCEK.arkadasBUc];
      await uc(t => ({ x: bas.x + (p.x - bas.x) * t, y: bas.y + (p.y - bas.y) * t + Math.sin(t * Math.PI * 2) * 30 }), 650, s.b, ucK, s.y.goster, BOCEK_DUGMESI / 2);
      s.b.style.transform = ''; ortala(s.b, p, BOCEK_DUGMESI, BOCEK_DUGMESI);
      s.y.goster(s.i === 1 ? BOCEK.selam[0] : s.i === 0 ? BOCEK.arkadasA[0] : BOCEK.arkadasB[0]);
      s.b.style.pointerEvents = '';
      ses('u-pervaz', 0.5, 1.1 + s.i * 0.1);
      pop(s.b, 220);
    }
    mesgul = false;
    selamlar.forEach(s => ziplat(s.b));
  }
  selamlar.forEach(s => s.b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || asama() !== 'selam' || mesgul || selamDokunulan[s.i]) return;
    selamDokunulan[s.i] = true;
    const kanat = s.i === 1 ? BOCEK.kanat : s.i === 0 ? [BOCEK.arkadasA[1]] : [BOCEK.arkadasB[1]];
    void (async () => { for (const k of kanat) { s.y.goster(k); await bekle(KARE_MS.kanat); } })();
    ses('u-cin', 0.9, 1 + selamDokunulan.filter(Boolean).length * 0.12);
    void oynat(BOCEK.kalp, { x: SELAM_YERLERI[s.i].x, y: SELAM_YERLERI[s.i].y - 90 }, 160, 160, KARE_MS.kalp, { kay: 150 });
    kikirKalan = 700; kinoTepki('sevin', 500, 14);
    if (selamDokunulan.every(Boolean)) void selamUcus();
  }));
  async function selamUcus() {
    mesgul = true;
    await bekle(400);
    sallaKalan = 2400; ses('u-vizz', 0.9);
    const merkez = { x: 1750, y: 300 };
    await Promise.all(selamlar.map(s => {
      s.b.style.left = '0px'; s.b.style.top = '0px'; s.b.style.pointerEvents = 'none';
      const ucK = s.i === 1 ? BOCEK.uc : [s.i === 0 ? BOCEK.arkadasAUc : BOCEK.arkadasBUc];
      const ilk = SELAM_YERLERI[s.i], kay = s.i / 3;
      return uc(t => {
        if (t < 0.15) { const u = t / 0.15, h = kalpNoktasi(kay, merkez, 150); return { x: ilk.x + (h.x - ilk.x) * u, y: ilk.y + (h.y - ilk.y) * u }; }
        if (t < 0.8) return kalpNoktasi(kay + (t - 0.15) / 0.65, merkez, 150);
        const u = (t - 0.8) / 0.2, h = kalpNoktasi(kay + 1, merkez, 150); return { x: h.x + (2100 - h.x) * u, y: h.y + (-120 - h.y) * u };
      }, 2200, s.b, ucK, s.y.goster, BOCEK_DUGMESI / 2);
    }));
    selamlar.forEach(s => { s.b.hidden = true; });
    if (!I.calisiyor()) return;
    gec('kutlama'); void I.kutla();
  }

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(dokBuyutec, 'buyutec', () => asama() === 'bul', () => { mercek.hidden = false; });
  I.aletDugmesi(dokYaprak, 'yaprak', () => asama() === 'yaprak' && !mesgul, () => { yaprakY.goster(BOCEK.yaprak); yaklas = 0; });
  I.aletDugmesi(dokFirca, 'firca', () => asama() === 'firca');

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    return a === 'bul' ? [dokBuyutec] : a === 'arala' ? (mesgul ? [] : [tutamlar[Math.max(0, bocekTutam)].b]) : a === 'yaprak' ? [dokYaprak] : a === 'tasi' ? []
      : a === 'ucur' ? [bocekDugme] : a === 'firca' ? [dokFirca] : a === 'salla' ? [kulakUcu] : a === 'selam' ? selamlar.filter(s => !selamDokunulan[s.i]).map(s => s.b) : [];
  };

  /** büyütecin camı: sahnenin kopyasını camın ortasına göre büyütür */
  function mercekCiz(uc: Nokta) {
    const k = MERCEK.buyutme, r = MERCEK.cap / 2;
    mercek.style.transform = `translate3d(${(uc.x - r).toFixed(1)}px, ${(uc.y - r).toFixed(1)}px, 0)`;
    mIc.style.transform = `translate(${(r - uc.x * k).toFixed(1)}px, ${(r - uc.y * k).toFixed(1)}px) scale(${k})`;
    const es = (a: HTMLImageElement, ad: string) => { const s = I.adres(ad) ?? ''; if (a.getAttribute('src') !== s) a.src = s; };
    es(mBas, BOCEK.bas[pozSimdi]); es(mKulak, kulakY.simdi());
    tutamlar.forEach((t, i) => es(mTutam[i], t.y.simdi()));
    mBocek.src = bocek.r.src; mBocek.style.transform = bocek.kutu.style.transform; mBocek.hidden = bocek.kutu.hidden;
    // gizliyken böcek tutamların altında kalır
    if (gizli && mBocek.nextSibling !== mTutam[0]) mIc.insertBefore(mBocek, mTutam[0]); else if (!gizli && mIc.lastChild !== mBocek) mIc.append(mBocek);
  }

  return {
    yaklasinca: () => { gec('bul'); ziplat(dokBuyutec); kipirtiAni = performance.now() + 600; },
    kutlamaYeri: { x: KULAK.x, y: KULAK.y - 60 },
    siradaki,
    kinoSasirsin: () => irkilKalan > 0,
    bosDokunus: (p: Nokta) => {
      if (kulaktaMi(p)) { hop(kulakY.kutu, 6, 200); gidikKalan = 500; ses('e-hihi', 0.4, 1.2); }
      else if (uzak(p, BAS.yuz) < 260) { hop(basY.kutu, 8, 200); kikirKalan = 400; ses('e-tik', 0.4, 1.4); }
    },
    kalkinca: (t: Tutulan) => {
      if (t.ad === 'buyutec') mercek.hidden = true;
      if (t.ad === 'yaprak' && asama() === 'tasi') {
        // taşırken bırakılırsa böcek yapraktan inip kulağa geri yürür
        const p = I.ucNoktasi(t);
        yaprakY.goster(BOCEK.yaprak); yapraktaSakli = false;
        bocek.kutu.hidden = false; bocekGizle(false); bocekKoy(p, 0);
        mesgul = true;
        void bocekYuru(ACIK_YER, 700).then(() => { mesgul = false; bocekKare(BOCEK.otur[0]); });
        kikirKalan = 600; ses('u-cik', 0.6);
        I.asamaGec('yaprak');
        return false;
      }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) => {
      sallaKalan = Math.max(0, sallaKalan - dt); korKalan = Math.max(0, korKalan - dt); irkilKalan = Math.max(0, irkilKalan - dt); sasirKalan = Math.max(0, sasirKalan - dt);
      kikirKalan = Math.max(0, kikirKalan - dt); gidikKalan = Math.max(0, gidikKalan - dt); ohhKalan = Math.max(0, ohhKalan - dt); saklanKalan = Math.max(0, saklanKalan - dt);
      if (sertKalan > 0) { sertKalan -= dt; if (sertKalan <= 0 && !sallaBas) kulakY.goster(BOCEK.kulak.tarali); }
      const a = asama();
      elHizi = h && uc ? ortalamaHiz(elHizi, hiz(yol, dt), dt) : 0;
      const v = elHizi;
      const yakinda = !!h && !!uc && ((a === 'bul' && h.ad === 'buyutec' && kulaktaMi(uc)) || (a === 'yaprak' && h.ad === 'yaprak' && uzak(uc, bocek.yer) < 400));
      const poz = basPozu({ asama: a, sallaKalan, korKalan, irkilKalan, sasirKalan, kikirKalan, gidikKalan, ohhKalan, tasiyor: a === 'tasi' && h?.ad === 'yaprak', yakinda, kirp: beklemeKaresi(an) === 'kirp', an });
      if (poz !== pozSimdi) {
        const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('kasin') || pozSimdi.startsWith('kasin') || (poz.startsWith('salla') && pozSimdi.startsWith('salla'));
        pozSimdi = poz; basY.goster(BOCEK.bas[poz]);
        if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
      }
      // pencerenin dışındaki dal sallanır
      if (an - dalAni > KARE_MS.dal) { dalAni = an; dalKaresi = 1 - dalKaresi; dalY.goster(BOCEK.dal[dalKaresi]); }
      // böceğin saklandığı tutam ara ara kıpırdar ("tıkır tıkır")
      if ((a === 'bul' || a === 'arala' || a === 'giris' || a === 'canta') && gizli && bocekTutam >= 0 && !mesgul && an >= kipirtiAni) {
        kipirtiAni = an + 1300 + Math.random() * 600;
        const t = tutamlar[bocekTutam];
        t.y.kutu.animate([{ rotate: '0deg' }, { rotate: '-6deg' }, { rotate: '5deg' }, { rotate: '0deg' }], { duration: sure(320) });
        void oynat(BOCEK.kipirti, TUTAMLAR[bocekTutam], 300, 300, KARE_MS.kipirti);
        ses('u-tikir', 0.35, 1 + Math.random() * 0.2);
        if (a !== 'giris' && Math.random() < 0.35) { gidikKalan = 500; ses('e-hihi', 0.25, 1.2); }
      }
      // açıkta oturan böcek yüzünü temizler (iki kare)
      if ((a === 'yaprak') && !gizli && !mesgul && saklanKalan <= 0) bocekKare(BOCEK.otur[Math.floor(an / KARE_MS.otur) % 2]);
      if (!h || !uc) return;
      // ——— 1 · büyüteçle bul
      if (h.ad === 'buyutec' && a === 'bul') {
        mercekCiz(uc);
        gozBirikim = gozdeMi(uc) ? gozBirikim + dt : 0;
        if (gozBirikim > 250 && an - gozAni > 3000) { gozAni = an; irkilKalan = 800; ses('e-hihi', 0.7); birKez('bu-goz'); kinoTepki('sevin', 700, 18); }
        bul = bulmaAdimi(bul, uzak(uc, TUTAMLAR[bocekTutam]), Z.bulR, dt);
        if (bul >= Z.bulMs) {
          bul = -1e9;
          mesgul = true;
          void (async () => {
            const tp = TUTAMLAR[bocekTutam];
            bocekGizle(false); bocekKoy({ x: tp.x + 40, y: tp.y - 80 }, -20);
            sasirKalan = 900; ses('u-cik', 1); soyle('bu-buldun'); kinoTepki('sasir', 700, 20); parilti(tp, 200);
            await kareler(BOCEK.bak, KARE_MS.bak);
            await bocekYuru(tp, 260, BOCEK.yuru, KARE_MS.yuru, false);
            bocekGizle(true); bocekKoy(tp, 0); bocekKare(BOCEK.otur[0]);
            mesgul = false;
            if (I.tutulan()?.ad === 'buyutec') I.birak(I.tutulan()!);
            mercek.hidden = true;
            ilerle(); ziplat(tutamlar[bocekTutam].b);
          })();
        }
        return;
      }
      // ——— 3 · yaprağı yavaşça yaklaştır
      if (h.ad === 'yaprak' && a === 'yaprak' && !mesgul) {
        const d = uzak(uc, bocek.yer);
        if (saklanKalan > 0) { yaklas = 0; return; }
        if (urkerMi(d, v, Z.yavas)) {
          saklanKalan = 1100; yaklas = 0;
          void kareler(BOCEK.saklan, KARE_MS.saklan);
          ses('u-saklan', 0.9); irkilKalan = 700; birKez('bu-sakla'); kinoTepki('sasir', 500, 14);
          setTimeout(() => { if (asama() === 'yaprak' && !mesgul) bocekKare(BOCEK.otur[0]); }, sure(1100));
          return;
        }
        yaklas = d <= Z.yaklasR ? yaklas + dt : Math.max(0, yaklas - dt);
        if (yaklas >= Z.yaklasMs) {
          mesgul = true;
          const hedef = uc;
          void bocekYuru(hedef, 420).then(() => {
            bocek.kutu.hidden = true;
            yaprakY.goster(BOCEK.yaprakBocekli[0]);
            ses('u-yaprak', 0.9); soyle('bu-yaprak'); kinoTepki('sevin', 600, 18); parilti(hedef, 180);
            mesgul = false; yapraktaSakli = false; durgun = 0;
            gec('tasi');
          });
        }
        return;
      }
      // ——— 4 · sarsmadan taşı
      if (h.ad === 'yaprak' && a === 'tasi') {
        if (!yapraktaSakli && v > Z.sarsinti) {
          yapraktaSakli = true; durgun = 0;
          yaprakY.goster(BOCEK.yaprakSaklanmis);
          ses('u-saklan', 0.9); irkilKalan = 600; kinoTepki('sasir', 500, 14);
          h.kutu.animate([{ rotate: '0deg' }, { rotate: '-8deg' }, { rotate: '6deg' }, { rotate: '0deg' }], { duration: sure(300), composite: 'add' });
          return;
        }
        if (yapraktaSakli) {
          durgun = v < DURGUN_HIZ ? durgun + dt : 0;
          if (an - yaprakKareAni > 160 && v > DURGUN_HIZ) { yaprakKareAni = an; yaprakKaresi = 1 - yaprakKaresi; yaprakY.goster(BOCEK.yaprakSalla[yaprakKaresi]); }
          if (durgun >= DURGUN_MS) { yapraktaSakli = false; yaprakY.goster(BOCEK.yaprakBocekli[0]); ses('u-cik', 0.6, 1.2); }
          return;
        }
        if (yol > 2 && an - yaprakKareAni > 220) { yaprakKareAni = an; yaprakKaresi = 1 - yaprakKaresi; yaprakY.goster(BOCEK.yaprakBocekli[yaprakKaresi]); }
        if (penceredeMi(uc)) {
          void I.yerineKoy(h, PERVAZ, 0.8, 200).then(() => {
            pervazYaprak.hidden = false; pop(pervazYaprak, 220);
            bocek.kutu.hidden = false; bocekGizle(false); bocekKoy(PERVAZ, 0); bocekKare(BOCEK.otur[0]);
            bocekDugme.hidden = false;
            ses('u-pervaz', 0.8); kinoTepki('sevin', 600, 18); ohhKalan = 700;
            dokYaprak.hidden = true;
            gec('ucur'); ziplat(bocekDugme);
          });
        }
        return;
      }
      // ——— 6 · fırçala: kökten uca
      if (h.ad === 'firca' && a === 'firca') {
        const i = bantBul(uc);
        if (i < 0 || i >= Z.bant || !h.ucOnce) return;
        const r = bantAdimi(bantlar[i], i, h.ucOnce, uc);
        if (r.ters) {
          if (an - tersAni > 900) {
            tersAni = an;
            tutamlar.forEach(t => { t.y.goster(BOCEK.tutamDik); pop(t.y.kutu, 200); });
            setTimeout(() => { if (asama() === 'firca') tutamlar.forEach(t => t.y.goster(BOCEK.tutam)); }, sure(900));
            gidikKalan = 800; ses('e-hihi', 0.7); birKez('bu-ters'); kinoTepki('sevin', 500, 14);
          }
          return;
        }
        bantlar[i] = r.d;
        if (yol > 3 && an - izAni > KARE_MS.iz) { izAni = an; void oynat(BOCEK.fircaIz, uc, 400, 200, KARE_MS.iz); }
        if (yol > 3 && an - sesAni > 300) { sesAni = an; ses('u-firca', 0.7, 0.9 + Math.random() * 0.2); }
        if (!bantBitti[i] && bantOrani(bantlar[i], i) >= BANT_TAMAM) {
          bantBitti[i] = true;
          void oynat(BOCEK.tuyParilti, { x: (BANTLAR[i].sol + BANTLAR[i].sag) / 2, y: BANTLAR[i].y }, 300, 300, KARE_MS.parilti);
          ses('e-cin', 0.4, 1 + i * 0.1); ohhKalan = 600;
        }
        if (bantBitti.slice(0, Z.bant).every(Boolean)) {
          kulakY.goster(BOCEK.kulak.tarali); pop(kulakY.kutu, 240);
          tutamKati.classList.add('bc-bitti');
          for (let k = 0; k < 3; k++) setTimeout(() => void oynat(BOCEK.tuyParilti, { x: KULAK.x + (k - 1) * 220, y: KULAK.y - 60 + k * 40 }, 300, 300, KARE_MS.parilti), sure(k * 140));
          soyle('bu-firca'); ohhKalan = 1200; kinoTepki('sevin', 700, 20);
          I.birak(h); ilerle(); ziplat(kulakUcu);
        }
      }
    },
    test: {
      nokta: (ad: string) => {
        const p: Record<string, Nokta> = {
          bocek: bocek.yer, gizlenen: TUTAMLAR[Math.max(0, bocekTutam)], acik: ACIK_YER, pervaz: PERVAZ, kulakUcu: KULAK_UCU, goz: BAS.goz, kino: KINO_BURUN,
          ...Object.fromEntries(TUTAMLAR.map((t, i) => ['tutam' + i, t])),
          ...Object.fromEntries(BANTLAR.flatMap((b, i) => [['bant' + i + 'sol', { x: b.sol + 10, y: b.y }], ['bant' + i + 'sag', { x: b.sag - 10, y: b.y }]])),
          ...Object.fromEntries(SELAM_YERLERI.map((s, i) => ['selam' + i, s])),
        };
        return p[ad] ? I.ekrana(p[ad]) : null;
      },
      poz: () => pozSimdi,
      kulak: () => kulakY.simdi(),
      sayim: () => ({ bocekTutam, gizli, mesgul, kacis, hedefKacis: Z.kacis, yapraktaSakli, bantlar: bantlar.map((b, i) => bantOrani(b, i)), hedefBant: Z.bant, salla: salla.sayi, hedefSalla: Z.salla, selam: selamDokunulan.filter(Boolean).length, saklandi: soylendi.has('bu-sakla'), goz: gozAni > 0, ters: tersAni > 0, kor: soylendi.has('bu-kor') }),
    },
  };
}
