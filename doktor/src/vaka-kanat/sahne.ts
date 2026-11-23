// Minik Doktor · "Polly'nin Karışık Kanadı" (sekiz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler, kapanış)
// vaka-kit'te; burada yakın planın katmanları, el hareketleri ve Polly'nin tepkileri. Polly kısa İngilizce sözlerle konuşur;
// konuşurken gagası iki karede açılıp kapanır. Kapanışta havada süzülen tüy Kino'nun burnuna konar, Kino hapşırır.
// Çizimler Astra'dan (Paket Doktor-Y6, assets/doktor/kanat/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './kanat.css';
import { konus } from '../ses';
import { beklemeKaresi } from '../vaka/veri';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ACIK_TAMAM, ALETLER, ASKI, BANTLAR, BANT_TAMAM, BAS, EFEKTLER, KANAT, KANAT_DOSYALAR, KANAT_DUGMESI, KANAT_YOLU, KAPANIS, KARE_MS, KINO_SOZU, MASA, PITRAKLAR, PITRAK_BOYU, PITRAK_DUGMESI, PITRAK_ESIGI,
  SAPKA_DUGMESI, SOZLER, TEPSI, TUY, TUY_DUGMESI, UC_DUGMESI, ZORLUK,
  acAdimi, acilma, askiYerindeMi, bantBaslangici, bantBul, bantOrani, basPozu, bastaMi, cirpAdimi, cirpBaslangici, dugumdeMi, gagadaMi, gerilmeKaresi, kanatKaresi, krakerAdimi, sonrakiAsama, taraAdimi, tepedeMi, tepsideMi,
  tuyAcisi, tuyOturduMu,
  type Asama, type BasPozu, type SozAdi,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('kanat', KANAT_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'kanat', klasor: 'kanat', dosyalar: KANAT_DOSYALAR,
    hasta: { ad: 'Polly\'nin kanadı', kutu: MASA.polly, bekleme: [KANAT.uzgun[0], KANAT.uzgun[1]], kirp: KANAT.uzgunKirp, sevinc: [KANAT.sevinc[0], KANAT.sevinc[1]], son: KANAT.son,
      dokunma: MASA.kanat, dugme: KANAT_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [KANAT.tarak, KANAT.aski, KANAT.kraker[0], KANAT.pitrak[0]], seritAletleri: [KANAT.tarak, KANAT.aski, KANAT.kraker[0]],
    yakinFon: KANAT.fon,
    sesler: [...Object.keys(SOZLER), KINO_SOZU, ...EFEKTLER],
    sozler: { giris: 'po-ouch', canta: 'po-canta', son: KINO_SOZU, sonSonra: 'po-bless' },
    kapanis: KAPANIS,
  }, I => kurKanat(I));
}

function kurKanat(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, kinoTepki, oynat, parilti } = I;
  // ——————————————————————————— durum
  let acik = 0, sonHiz = 0, pitrak = 0, tuyAci: number = TUY.baslangicAci, cirp = cirpBaslangici(), ucBagli = [false, false], kraker = { isirik: 0, icerde: false };
  const bantlar = BANTLAR.slice(0, Z.bant).map(() => bantBaslangici());
  const bantBitti = bantlar.map(() => false);
  let ouchKalan = 0, heyKalan = 0, kikirKalan = 0, kirtKalan = 0, yayKalan = 0, sasirKalan = 0, gururKalan = 0, konusan = 0, bakiyor = false;
  let tersSayisi = 0, sesAni = 0, taraAni = 0, taraKaresi = 0, ouchAni = 0, kabarAni = 0, notaAni = 0, gidikSoylendi = false, yaySoylendi = false;
  let oturum: { id: number; tur: 'ac' | 'pitrak' | 'tuy' | 'cirp'; i?: number; once?: Nokta; an?: number } | null = null, pozSimdi: BasPozu = 'endise';
  const soyle = (ad: SozAdi) => { konusan++; void konus(ad).finally(() => { konusan = Math.max(0, konusan - 1); }); };

  // ——————————————————————————— yakın plan katmanları
  const y = I.yakin;
  const basY = yigin(Object.values(KANAT.bas), 'vk-fon vk-tam vk-soluk');
  const kanatY = yigin([...KANAT.kanat, ...KANAT.kanatCirp], 'vk-fon vk-tam kn-kanat');
  // karışık tüyler: açık kanadın üstünde bir tuval; tarak kökten uca geçtikçe silinir
  const karisik = el('canvas', 'vk-fon kn-karisik'); karisik.width = 1024; karisik.height = 576; karisik.hidden = true;
  const kg = karisik.getContext('2d')!;
  kg.drawImage(I.cozulmus.get(KANAT.kanatKarisik)!, 0, 0, 1024, 576);
  kg.globalCompositeOperation = 'destination-out';
  const karisikSil = (p: Nokta, r: number, guc: number) => {
    const g = kg.createRadialGradient(p.x / 2, p.y / 2, r * 0.1, p.x / 2, p.y / 2, r / 2);
    g.addColorStop(0, `rgba(0,0,0,${Math.min(1, guc).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    kg.fillStyle = g; kg.beginPath(); kg.arc(p.x / 2, p.y / 2, r / 2, 0, Math.PI * 2); kg.fill();
  };
  karisikSil({ x: 4, y: 4 }, 6, 0.5);
  const parlak = resim(KANAT.kanatParlak, 'vk-fon kn-parlak');
  const askiY = yigin(KANAT.askiYerinde, 'vk-fon vk-tam kn-yok-katman'); askiY.kutu.classList.add('kn-yok');
  const dugum = resim(KANAT.askiDugum, 'vk-fon kn-yok');
  const sapkaBasta = resim(KANAT.sapkaBasta, 'vk-fon kn-yok');
  // eğik tüy: kökünün çevresinde döner
  const tuy = resim(KANAT.tuyEgik, 'vk-katman kn-tuy');
  koy(tuy, { sol: TUY.kok.x, ust: TUY.kok.y - 60, g: TUY.boy, y: 120 });
  const tuyDugmesi = el('button', 'vk-katman kn-tuy-dugmesi'); tuyDugmesi.type = 'button'; tuyDugmesi.setAttribute('aria-label', 'Eğik tüy');
  const tuyOrtasi = (aci: number): Nokta => ({ x: TUY.kok.x + Math.cos((aci * Math.PI) / 180) * TUY.boy * 0.6, y: TUY.kok.y + Math.sin((aci * Math.PI) / 180) * TUY.boy * 0.6 });
  const tuyCiz = () => { tuy.style.rotate = `${tuyAci}deg`; ortala(tuyDugmesi, tuyOrtasi(tuyAci), TUY_DUGMESI, TUY_DUGMESI); };
  tuyCiz();
  if (!Z.tuy) { tuyAci = TUY.hedefAci; tuyCiz(); tuyDugmesi.hidden = true; }
  // kanadın ucu (açarken ve çırparken tutulan yer)
  const ucDugmesi = el('button', 'vk-katman kn-uc'); ucDugmesi.type = 'button'; ucDugmesi.setAttribute('aria-label', 'Kanadın ucu');
  const ucYeri = () => ({ x: KANAT_YOLU.kapali.x + (KANAT_YOLU.acik.x - KANAT_YOLU.kapali.x) * acik, y: KANAT_YOLU.kapali.y + (KANAT_YOLU.acik.y - KANAT_YOLU.kapali.y) * acik });
  const ucKoy = () => ortala(ucDugmesi, ucYeri(), UC_DUGMESI, UC_DUGMESI);
  ucKoy();
  // pıtraklar
  const pitraklar = PITRAKLAR.slice(0, Z.pitrak).map((p, i) => {
    const b = el('button', 'vk-katman kn-pitrak'); b.type = 'button'; b.setAttribute('aria-label', 'Pıtrak ' + (i + 1));
    ortala(b, p, PITRAK_DUGMESI, PITRAK_DUGMESI); b.hidden = true;
    const r = resim(KANAT.pitrak[i % 3]); b.append(r);
    return b;
  });
  const tepsiKati = el('div', 'vk-katman kn-tepsi-kati');
  // şapka tepside bekler
  const sapkaYer = el('button', 'vk-katman kn-sapka'); sapkaYer.type = 'button'; sapkaYer.setAttribute('aria-label', 'Polly\'nin şapkası');
  ortala(sapkaYer, TEPSI.sapka, SAPKA_DUGMESI, SAPKA_DUGMESI); sapkaYer.append(resim(KANAT.sapka));
  // askının iki ucu
  const ucBtn = (p: Nokta, ad: string, etiket: string) => { const b = el('button', 'vk-katman kn-aski-ucu'); b.type = 'button'; b.setAttribute('aria-label', etiket); ortala(b, p, UC_DUGMESI, UC_DUGMESI); b.append(resim(ad)); b.hidden = true; return b; };
  const ucSol = ucBtn(ASKI.sol, KANAT.askiUcuSol, 'Askının sol ucu'), ucSag = ucBtn(ASKI.sag, KANAT.askiUcuSag, 'Askının sağ ucu');
  y.append(kanatY.kutu, karisik, parlak, askiY.kutu, tuy, basY.kutu, dugum, sapkaBasta, tepsiKati, ...pitraklar, tuyDugmesi, ucDugmesi, ucSol, ucSag, sapkaYer);
  const dokTarak = I.dokDugmesi(0, KANAT.tarak, 'Tarak');
  const dokAski = I.dokDugmesi(1, KANAT.aski, 'Kanat askısı');
  const dokKraker = I.dokDugmesi(2, KANAT.kraker[0], 'Kraker');
  // eldeki aletler
  const pitrakEl = resim(KANAT.pitrak[0]);
  const tarakY = yigin([KANAT.tarak, ...KANAT.tarakTara, KANAT.tarakTuylu], 'vk-alet-yigin');
  const krakerY = yigin([...KANAT.kraker, KANAT.krakerKirik], 'vk-alet-yigin');
  I.aletEkle('pitrak', ALETLER.pitrak, [pitrakEl], KANAT.pitrak[0]);
  I.aletEkle('tarak', ALETLER.tarak, [tarakY.kutu], KANAT.tarak);
  I.aletEkle('aski', ALETLER.aski, [resim(KANAT.aski)], KANAT.aski);
  I.aletEkle('kraker', ALETLER.kraker, [krakerY.kutu], KANAT.kraker[0]);
  I.aletEkle('sapka', ALETLER.sapka, [resim(KANAT.sapkaHavada)], KANAT.sapka);
  I.aletEkle('ucSol', ALETLER.ucSol, [resim(KANAT.askiUcuSol)], KANAT.askiUcuSol);
  I.aletEkle('ucSag', ALETLER.ucSag, [resim(KANAT.askiUcuSag)], KANAT.askiUcuSag);

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => I.asamaGec(a);
  const ilerle = () => gec(sonrakiAsama(I.yas, asama()));
  const kanatGoster = () => { kanatY.goster(KANAT.kanat[kanatKaresi(acik)]); karisik.hidden = acik < ACIK_TAMAM; };

  // ——————————————————————————— oturumlar: kanadın ucu (aç, çırp), pıtrak çekme, tüy çevirme
  const oturumAc = (b: HTMLElement, tur: 'ac' | 'pitrak' | 'tuy' | 'cirp', e: PointerEvent, i?: number) => {
    oturum = { id: e.pointerId, tur, i, once: I.noktaya(e), an: performance.now() };
    try { b.setPointerCapture(e.pointerId); } catch { /* */ }
  };
  ucDugmesi.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || oturum) return;
    if (asama() === 'ac') { oturumAc(ucDugmesi, 'ac', e); ses('k-kanat', 0.5, 1.1); return; }
    if (asama() === 'cirp') { oturumAc(ucDugmesi, 'cirp', e); cirp = { ...cirp, uc: null, tepe: null, yon: 0 }; return; }
    I.yanlis(ucDugmesi);
  });
  pitraklar.forEach((b, i) => b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || oturum) return;
    if (asama() !== 'pitrak') { I.yanlis(b); return; }
    oturumAc(b, 'pitrak', e, i);
    ses('e-tik', 0.6, 1.3);
  }));
  tuyDugmesi.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || oturum) return;
    if (asama() !== 'tuy') { I.yanlis(tuyDugmesi); return; }
    oturumAc(tuyDugmesi, 'tuy', e);
    ses('e-tik', 0.6, 1.2);
  });
  addEventListener('pointermove', e => {
    if (!oturum || e.pointerId !== oturum.id) return;
    const p = I.noktaya(e), an = performance.now();
    const dt = Math.max(1, an - (oturum.an ?? an)), once = oturum.once ?? p;
    const hiz = Math.hypot(p.x - once.x, p.y - once.y) / dt;
    oturum.once = p; oturum.an = an;
    if (oturum.tur === 'ac') {
      sonHiz = sonHiz * 0.6 + hiz * 0.4;
      const r = acAdimi(acik, acilma(p), sonHiz, Z.hiz);
      if (r.ouch && an - ouchAni > 900) { ouchAni = an; ouchKalan = 700; soyle('po-ouch2'); kinoTepki('sasir', 600, 16); ses('k-kanat', 0.8, 0.8); }
      const k0 = kanatKaresi(acik);
      acik = r.oran; kanatGoster(); ucKoy();
      if (kanatKaresi(acik) !== k0) ses('k-kanat', 0.6, 0.9 + acik * 0.3);
      if (acik >= ACIK_TAMAM) {
        acik = 1; kanatGoster(); oturum = null;
        parilti(KANAT_YOLU.acik, 240); ses('e-cin', 0.5); kinoTepki('sevin', 600, 18);
        ilerle();
        pitraklar.forEach((b, i) => setTimeout(() => { b.hidden = false; pop(b, 220); }, sure(120 + i * 110)));
      }
      return;
    }
    if (oturum.tur === 'pitrak') {
      const i = oturum.i!, b = pitraklar[i], u = Math.hypot(p.x - PITRAKLAR[i].x, p.y - PITRAKLAR[i].y);
      const r = b.querySelector('img')!;
      const ad = u > 20 ? KANAT.pitrakGergin[gerilmeKaresi(u)] : KANAT.pitrak[i % 3];
      const a = I.adres(ad) ?? ''; if (r.getAttribute('src') !== a) { r.src = a; if (u > 20) ses('k-tara', 0.4, 1.4); }
      b.style.transform = `translate(${((p.x - PITRAKLAR[i].x) * 0.25).toFixed(1)}px, ${((p.y - PITRAKLAR[i].y) * 0.25).toFixed(1)}px)`;
      if (u >= PITRAK_ESIGI) {
        oturum = null;
        b.hidden = true; b.style.transform = '';
        ses('k-pit'); void oynat(KANAT.pit, PITRAKLAR[i], 200, 200, KARE_MS.pit);
        hop(basY.kutu, 8, 200); sasirKalan = 300;
        pitrakEl.src = I.adres(KANAT.pitrak[i % 3]) ?? '';
        I.tut(b, 'pitrak', e);
        if (pitrak === 0) soyle('po-pop');
      }
      return;
    }
    if (oturum.tur === 'tuy') {
      const aci = Math.max(Math.min(TUY.hedefAci, TUY.baslangicAci) - 12, Math.min(Math.max(TUY.hedefAci, TUY.baslangicAci) + 12, tuyAcisi(p)));
      if (Math.abs(aci - tuyAci) > 4 && an - sesAni > 160) { sesAni = an; ses('e-tik', 0.4, 1.5); }
      tuyAci = aci; tuyCiz(); bakiyor = true;
      if (tuyOturduMu(aci)) {
        oturum = null; tuyAci = TUY.hedefAci; tuyCiz(); bakiyor = false;
        tuyDugmesi.hidden = true;
        ses('k-tik'); void oynat(KANAT.tuyTik, tuyOrtasi(TUY.hedefAci), 300, 300, KARE_MS.tik);
        gururKalan = 800; soyle('po-tik'); kinoTepki('sevin', 700, 22);
        ilerle(); ziplat(ucDugmesi);
      }
      return;
    }
    if (oturum.tur === 'cirp') {
      const ust = p.y < KANAT_YOLU.acik.y - 40, alt = p.y > KANAT_YOLU.acik.y + 40;
      kanatY.goster(KANAT.kanatCirp[ust ? 0 : alt ? 2 : 1]);
      const once2 = cirp.sayi;
      cirp = cirpAdimi(cirp, p);
      if (cirp.sayi > once2) {
        ses('k-cirp', 0.9, 0.9 + Math.random() * 0.2);
        void oynat(KANAT.kanatRuzgar, { x: KANAT_YOLU.acik.x - 160, y: KANAT_YOLU.acik.y + 40 }, 500, 300, KARE_MS.ruzgar, { kayX: -80 });
        void oynat([KANAT.tuyUcan[cirp.sayi % 4]], { x: KANAT_YOLU.orta.x + (Math.random() - 0.5) * 400, y: KANAT_YOLU.orta.y }, 200, 200, KARE_MS.ucan * 3, { kay: 260, kayX: (Math.random() - 0.5) * 200, don: (Math.random() - 0.5) * 300 });
        yayKalan = 600; hop(basY.kutu, 10, 200);
        if (!yaySoylendi) { yaySoylendi = true; soyle('po-yay'); }
      }
      if (cirp.sayi >= Z.cirp) {
        oturum = null; kanatY.goster(KANAT.kanat[5]);
        ses('e-cin', 0.6); kinoTepki('sevin', 700, 24); parilti(KANAT_YOLU.acik, 260);
        ilerle(); ziplat(dokAski);
      }
    }
  }, { signal: I.iptal });
  const oturumBitir = (e: PointerEvent) => {
    if (!oturum || e.pointerId !== oturum.id) return;
    if (oturum.tur === 'pitrak') { const b = pitraklar[oturum.i!]; b.style.transform = ''; b.querySelector('img')!.src = I.adres(KANAT.pitrak[oturum.i! % 3]) ?? ''; ziplat(b); }
    if (oturum.tur === 'tuy') bakiyor = false;
    if (oturum.tur === 'cirp') kanatY.goster(KANAT.kanat[5]);
    oturum = null;
  };
  addEventListener('pointerup', oturumBitir, { signal: I.iptal });
  addEventListener('pointercancel', oturumBitir, { signal: I.iptal });

  // ——————————————————————————— aletler
  I.aletDugmesi(dokTarak, 'tarak', () => asama() === 'tara');
  I.aletDugmesi(dokAski, 'aski', () => asama() === 'aski');
  I.aletDugmesi(dokKraker, 'kraker', () => asama() === 'kraker', () => { kraker = { ...kraker, icerde: false }; });
  I.aletDugmesi(sapkaYer, 'sapka', () => asama() === 'sapka');
  I.aletDugmesi(ucSol, 'ucSol', () => asama() === 'dugum' && !ucBagli[0]);
  I.aletDugmesi(ucSag, 'ucSag', () => asama() === 'dugum' && !ucBagli[1]);

  /** pıtrak tepsiye konur (yeri sırayla) */
  function tepsiyeKoy(nereden: Nokta) {
    const yer = TEPSI.yerler[pitrak % TEPSI.yerler.length];
    const r = resim(KANAT.pitrakTepside, 'vk-katman kn-tepside'); ortala(r, yer, PITRAK_BOYU, PITRAK_BOYU); tepsiKati.append(r);
    r.animate([{ transform: `translate(${nereden.x - yer.x}px, ${nereden.y - yer.y}px) scale(1)` }, { transform: `translate(${(nereden.x - yer.x) * 0.4}px, ${(nereden.y - yer.y) * 0.4 - 80}px) scale(1.1)`, offset: 0.5 }, { transform: 'translate(0, 0) scale(1)' }], { duration: sure(380), easing: 'cubic-bezier(.3,0,.4,1)' });
    setTimeout(() => ses('e-pat', 0.6, 1.3), sure(360));
    pitrak++;
    if (pitrak >= Z.pitrak) setTimeout(() => { if (!I.calisiyor()) return; ses('e-cin', 0.6); kinoTepki('sevin', 600, 18); ilerle(); ziplat(dokTarak); }, sure(420));
  }

  return {
    yaklasinca: () => { gec('ac'); ziplat(ucDugmesi); },
    kutlamaYeri: { x: KANAT_YOLU.orta.x, y: KANAT_YOLU.orta.y - 80 },
    kinoSasirsin: () => ouchKalan > 0 || heyKalan > 0,
    siradaki: (): HTMLElement[] => {
      const a = asama();
      return a === 'ac' || a === 'cirp' ? [ucDugmesi] : a === 'pitrak' ? pitraklar.filter(b => !b.hidden) : a === 'tara' ? [dokTarak] : a === 'tuy' ? [tuyDugmesi] : a === 'aski' ? [dokAski]
        : a === 'dugum' ? [ucSol, ucSag].filter((_, i) => !ucBagli[i]) : a === 'kraker' ? [dokKraker] : a === 'sapka' ? [sapkaYer] : [];
    },
    bosDokunus: (p: Nokta) => { if (Math.hypot(p.x - BAS.bas.x, p.y - BAS.bas.y) < 260) { hop(basY.kutu, 10, 200); ses('e-hihi', 0.4, 1.3); } },
    kalkinca: (t: Tutulan) => {
      const uc = I.ucNoktasi(t);
      if (t.ad === 'pitrak') {
        if (tepsideMi(uc)) { void I.yerineKoy(t, uc, 1, 60).then(() => tepsiyeKoy(uc)); return true; }
        if (bastaMi(uc)) {
          // komik: pıtrak Polly'nin başına yapışır, şaşı bakar; sonra kendiliğinden tepsiye düşer
          heyKalan = 1100; soyle('po-hey'); ses('k-pit', 0.7, 1.4); kinoTepki('sasir', 900, 22);
          const r = resim(KANAT.pitrakTepside, 'vk-katman kn-tepside'); ortala(r, { x: BAS.tepe.x + 40, y: BAS.tepe.y + 40 }, PITRAK_BOYU, PITRAK_BOYU); tepsiKati.append(r);
          void I.yerineKoy(t, uc, 1, 60);
          setTimeout(() => { r.remove(); if (I.calisiyor()) tepsiyeKoy({ x: BAS.tepe.x + 40, y: BAS.tepe.y + 40 }); }, sure(1100));
          return true;
        }
        void I.yerineKoy(t, uc, 1, 60).then(() => tepsiyeKoy(uc));
        return true;
      }
      if (t.ad === 'ucSol' || t.ad === 'ucSag') {
        const i = t.ad === 'ucSol' ? 0 : 1;
        if (asama() === 'dugum' && dugumdeMi(uc)) {
          ucBagli[i] = true;
          void I.yerineKoy(t, BAS.boyun, 0.8, 140);
          (i ? ucSag : ucSol).hidden = true;
          ses('k-aski', 0.8, 1 + i * 0.15); parilti(BAS.boyun, 180); kinoTepki('sevin', 400, 12);
          if (ucBagli[0] && ucBagli[1]) {
            dugum.classList.remove('kn-yok'); pop(dugum, 240);
            ses('k-dugum'); parilti(BAS.boyun, 260); gururKalan = 800;
            ilerle(); ziplat(dokKraker);
          }
          return true;
        }
      }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) => {
      ouchKalan = Math.max(0, ouchKalan - dt); heyKalan = Math.max(0, heyKalan - dt); kikirKalan = Math.max(0, kikirKalan - dt); kirtKalan = Math.max(0, kirtKalan - dt);
      yayKalan = Math.max(0, yayKalan - dt); sasirKalan = Math.max(0, sasirKalan - dt); gururKalan = Math.max(0, gururKalan - dt);
      const a = asama();
      ucDugmesi.hidden = !(a === 'ac' || a === 'cirp');
      tuyDugmesi.hidden = a !== 'tuy';
      const poz = basPozu({ asama: a, ouchKalan, heyKalan, kikirKalan, kirtKalan, yayKalan, sasirKalan, gururKalan, konusuyor: konusan > 0, bakiyor: bakiyor || (!!h && (h.ad === 'tarak' || h.ad === 'kraker')), kirp: beklemeKaresi(an) === 'kirp', an });
      if (poz !== pozSimdi) {
        const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('gaga') || pozSimdi.startsWith('gaga') || poz.startsWith('kirt') || pozSimdi.startsWith('kirt');
        pozSimdi = poz; basY.goster(KANAT.bas[poz]);
        if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
      }
      if ((a === 'kutlama' || a === 'son') && an - notaAni > 500 && !I.hub.classList.contains('vk-altta')) notaAni = an;
      if (!h || !uc) return;
      if (h.ad === 'tarak' && a === 'tara') {
        const i = bantBul(uc, Z.bant);
        if (yol > 3 && an - taraAni > 140) { taraAni = an; taraKaresi = 1 - taraKaresi; tarakY.goster(KANAT.tarakTara[taraKaresi]); }
        if (i < 0 || !h.ucOnce) return;
        const r = taraAdimi(bantlar[i], i, h.ucOnce, uc);
        if (r.ters) {
          // ters tarama: tüy kabarır, Polly gıdıklanır
          if (an - kabarAni > 600) {
            kabarAni = an; tersSayisi++; ses('k-kabar', 0.8); kikirKalan = 700;
            void oynat(KANAT.tuyKabarik, uc, 300, 300, KARE_MS.kabarik);
            if (!gidikSoylendi) { gidikSoylendi = true; soyle('po-gidik'); } else ses('e-hihi', 0.6, 1.2);
            tarakY.goster(KANAT.tarakTuylu);
          }
          return;
        }
        bantlar[i] = r.d;
        if (yol > 2) {
          karisikSil(uc, 170, (Math.min(60, yol) / 60) * 0.9);
          if (an - sesAni > 200) { sesAni = an; ses('k-tara', 0.7, 0.9 + Math.random() * 0.2); }
        }
        if (!bantBitti[i] && bantOrani(bantlar[i], i) >= BANT_TAMAM) {
          bantBitti[i] = true;
          const b = BANTLAR[i];
          void oynat(KANAT.parilti, { x: (b.sol + b.sag) / 2, y: b.y }, 600, 200, KARE_MS.parilti, { kayX: 200 });
          ses('e-cin', 0.5, 1.1 + i * 0.07); kinoTepki('sevin', 500, 14);
          kg.fillStyle = '#000'; kg.fillRect(b.sol / 2 - 20, (b.y - 60) / 2, (b.sag - b.sol) / 2 + 40, 60);
        }
        if (bantBitti.every(Boolean)) {
          kg.clearRect(0, 0, 1024, 576); karisik.hidden = true;
          parlak.classList.add('kn-gorunur');
          soyle('po-parlak'); gururKalan = 900;
          I.birak(h); ilerle();
          if (Z.tuy) ziplat(tuyDugmesi); else ziplat(ucDugmesi);
        }
        return;
      }
      if (h.ad === 'aski' && a === 'aski' && askiYerindeMi(uc)) {
        void I.yerineKoy(h, KANAT_YOLU.orta, 0.6, 160).then(() => {
          askiY.kutu.classList.remove('kn-yok'); askiY.goster(KANAT.askiYerinde[0]); pop(askiY.kutu, 220);
          setTimeout(() => askiY.goster(KANAT.askiYerinde[1]), sure(KARE_MS.aski));
          ses('k-aski'); kinoTepki('sevin', 500, 14);
          dokAski.hidden = true;
          ucSol.hidden = false; ucSag.hidden = false; pop(ucSol, 220); pop(ucSag, 220);
        });
        ilerle();
        return;
      }
      if (h.ad === 'kraker' && a === 'kraker') {
        const r = krakerAdimi(kraker, gagadaMi(uc));
        kraker = { isirik: r.isirik, icerde: r.icerde };
        if (r.isirdi) {
          ses('k-krak', 1, 0.9 + r.isirik * 0.08); kirtKalan = 450;
          void oynat(KANAT.kirinti, { x: BAS.gaga.x + 30, y: BAS.gaga.y + 40 }, 300, 300, KARE_MS.kirinti, { kay: -60 });
          krakerY.goster(r.isirik >= 3 ? KANAT.krakerKirik : KANAT.kraker[r.isirik]);
          kinoTepki('sevin', 400, 12);
          if (r.isirik >= Z.isirik) {
            soyle('po-krak');
            void I.yerineKoy(h, BAS.gaga, 0.2, 160);
            dokKraker.hidden = true;
            ilerle(); ziplat(sapkaYer);
          }
        }
        return;
      }
      if (h.ad === 'sapka' && a === 'sapka' && tepedeMi(uc)) {
        void I.yerineKoy(h, BAS.tepe, 0.8, 160).then(() => {
          sapkaBasta.classList.remove('kn-yok'); pop(sapkaBasta, 260);
          ses('k-sapka'); void oynat([KANAT.sapkaYildiz], BAS.tepe, 300, 300, KARE_MS.yildiz * 3, { kay: 40 });
          gururKalan = 1200; soyle('po-sapka'); kinoTepki('sevin', 900, 26);
          for (let k = 0; k < 3; k++) setTimeout(() => void oynat(KANAT.nota, { x: BAS.bas.x + 160 + k * 60, y: BAS.bas.y - 120 }, 160, 160, KARE_MS.nota, { kay: 160, kayX: 60 }), sure(k * 200));
          sapkaYer.hidden = true;
          setTimeout(() => { if (I.calisiyor()) { gec('kutlama'); void I.kutla(); } }, sure(1100));
        });
        gec('kutlama');
      }
    },
    test: {
      nokta: (ad: string, i = 0) => {
        const p: Record<string, Nokta> = { uc: ucYeri(), acik: KANAT_YOLU.acik, kapali: KANAT_YOLU.kapali, pitrak: PITRAKLAR[i] ?? KANAT_YOLU.orta, tepsi: TEPSI.yerler[0], bas: BAS.bas, tepe: BAS.tepe, gaga: BAS.gaga, boyun: BAS.boyun, orta: KANAT_YOLU.orta,
          bantSol: { x: (BANTLAR[i] ?? BANTLAR[0]).sol + 20, y: (BANTLAR[i] ?? BANTLAR[0]).y }, bantSag: { x: (BANTLAR[i] ?? BANTLAR[0]).sag - 10, y: (BANTLAR[i] ?? BANTLAR[0]).y }, tuy: tuyOrtasi(tuyAci), tuyHedef: tuyOrtasi(TUY.hedefAci), sapka: TEPSI.sapka, ucSol: ASKI.sol, ucSag: ASKI.sag };
        return p[ad] ? I.ekrana(p[ad]) : null;
      },
      poz: () => pozSimdi,
      sayim: () => ({ acik, pitrak, hedefPitrak: Z.pitrak, bant: bantBitti.filter(Boolean).length, hedefBant: Z.bant, tuyAci, tuyVar: Z.tuy, cirp: cirp.sayi, hedefCirp: Z.cirp, bagli: ucBagli.filter(Boolean).length, isirik: kraker.isirik, hedefIsirik: Z.isirik, sapka: !sapkaBasta.classList.contains('kn-yok'), ters: tersSayisi }),
    },
  };
}
