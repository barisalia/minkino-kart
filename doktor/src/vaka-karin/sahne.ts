// Minik Doktor · "Lokum'un Guruldayan Karnı" (sekiz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler, kapanış)
// vaka-kit'te; burada yakın planın katmanları, el hareketleri ve Lokum'un tepkileri.
// Çizimler Astra'dan (Paket Doktor-Y7, assets/doktor/karin/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './karin.css';
import { beklemeKaresi } from '../vaka/veri';
import { ortalamaHiz } from '../vaka-kit/ortak';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ALETLER, BAS, BUHAR_DUGMESI, DILIMLER, DILIM_BOYU, EFEKTLER, FINCAN, GURULTU_YERLERI, KAPANIS, KARE_MS, KARIN, KARIN_DOSYALAR, KARIN_DUGMESI, KARIN_ELIPS,
  MASA, SOZLER, TORBA_DUGMESI, ZORLUK, agizdaMi, bastaMi, bulmaAdimi, burundaMi, daireAdimi, daireBaslangici, fincanKademesi, gurultuAraligi, gurultuKademesi, karindaMi,
  pencere, penceredeMi, sonrakiAsama, surtAdimi, surtBaslangici, torbaYeri, ufleme, uzak, yakinlik, yavasMi, yudumAdimi, basPozu,
  type Asama, type BasPozu, type SozAdi,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('karin', KARIN_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'karin', klasor: 'karin', dosyalar: KARIN_DOSYALAR,
    hasta: { ad: 'Lokum\'un karnı', kutu: MASA.lokum, bekleme: [KARIN.uzgun[0], KARIN.uzgun[1]], kirp: KARIN.uzgunKirp, sevinc: [KARIN.sevinc[0], KARIN.sevinc[1]], son: [KARIN.son[0], KARIN.son[1], KARIN.son[1], KARIN.son[1]],
      dokunma: MASA.karin, dugme: KARIN_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [KARIN.steto, KARIN.cerceve, KARIN.kasik, KARIN.torba], seritAletleri: [KARIN.steto, KARIN.cerceve, KARIN.torba],
    yakinFon: KARIN.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER],
    // Lokum'un klonu yok: girişte karnı kendisi konuşur ("gurrr"), kapanışta "Hav!"tan sonra minik bir "gur" kaçar
    sozler: { giris: 'g-gur', canta: 'lo-canta', son: 'lo-son', sonSonra: 'g-gur-kucuk' },
    kapanis: KAPANIS,
  }, I => kurKarin(I));
}

function kurKarin(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, kinoTepki, oynat, parilti } = I;
  const soyle = (ad: SozAdi) => I.soyle(ad);
  // ——————————————————————————— durum
  const gurYeri = GURULTU_YERLERI[Math.floor(Math.random() * GURULTU_YERLERI.length)];
  let dinle = 0, dilimBirikim = DILIMLER.map(() => 0), dilimBulundu = DILIMLER.map(() => false), kafaBirikim = 0, kafaAni = -1e9;
  let surt = surtBaslangici(), isit = 0, ov = daireBaslangici(), ovToplam = 0, ovIzAci = 0, karistir = daireBaslangici(), karistirToplam = 0, kasikAci = 0;
  let ovHizi = 0, karistirHizi = 0;
  let ufle = 0, ufleBas: { id: number; p: Nokta; sayildi: boolean } | null = null, yudum = 0, yudumBirikim = 0, pat = 0, torbaKondu = false;
  let gurKalan = 0, kikirKalan = 0, gidikKalan = 0, utanKalan = 0, rahatKalan = 0, usuduKalan = 0, koklarKalan = 0, uflerKalan = 0, yudumKalan = 0, mutluKalan = 0, havKalan = 0;
  let sonrakiGur = performance.now() + 1800, sesAni = 0, buharAni = 0, girdapAni = 0, girdapKaresi = 0, usuduAni = -1e9, koklarAni = -1e9, gidikSoylendi = false, pozSimdi: BasPozu = 'uzgun';
  const soylendi = new Set<string>();
  const birKez = (ad: SozAdi) => { if (soylendi.has(ad)) return; soylendi.add(ad); soyle(ad); };

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const basY = yigin(Object.values(KARIN.bas), 'vk-fon vk-tam vk-soluk');
  const isik = resim(KARIN.karinIsik, 'vk-fon gr-isik');
  const gurultuY = yigin(KARIN.gurultu, 'vk-fon vk-tam gr-gurultu'); gurultuY.kutu.classList.add('gr-yok');
  const yerY = yigin(KARIN.gurultuYeri, 'vk-katman gr-yer'); ortala(yerY.kutu, gurYeri, 240, 240); yerY.kutu.classList.add('gr-yok');
  // röntgen: çerçevenin penceresinden görünen çizgi film röntgeni ve üç dilim
  const rontgen = el('div', 'vk-katman gr-rontgen'); koy(rontgen, { sol: 0, ust: 0, g: 2048, y: 1152 }); rontgen.hidden = true;
  rontgen.append(resim(KARIN.rontgen, 'vk-fon'));
  const dilimler = DILIMLER.map(p => { const d = yigin(KARIN.dilim, 'vk-katman gr-dilim'); ortala(d.kutu, p, DILIM_BOYU, DILIM_BOYU); rontgen.append(d.kutu); return d; });
  // çay: fincan (sahnede duran; "iç" adımında ele alınır), girdap, papatyalar, buhar
  const fincanYer = el('button', 'vk-katman gr-fincan'); fincanYer.type = 'button'; fincanYer.setAttribute('aria-label', 'Papatya çayı'); koy(fincanYer, FINCAN.kutu);
  const fincanY = yigin(KARIN.fincan, 'vk-tam'); fincanYer.append(fincanY.kutu);
  const girdap = resim(KARIN.girdap[0], 'vk-katman gr-girdap'); ortala(girdap, FINCAN.yuz, 300, 160); girdap.hidden = true;
  const papatyalar = [0, 1].map(i => { const r = resim(KARIN.papatya[i], 'vk-katman gr-papatya'); ortala(r, FINCAN.yuz, 100, 100); return r; });
  const buhar = el('button', 'vk-katman gr-buhar-dugmesi'); buhar.type = 'button'; buhar.setAttribute('aria-label', 'Çayın buharı'); koy(buhar, BUHAR_DUGMESI); buhar.hidden = true;
  const torbaYer = el('button', 'vk-katman gr-torba'); torbaYer.type = 'button'; torbaYer.setAttribute('aria-label', 'Sıcak su torbası'); torbaYer.hidden = true;
  const torbaY = yigin([KARIN.torbaYerinde, ...KARIN.torbaBas], 'vk-tam'); torbaYer.append(torbaY.kutu);
  y.append(basY.kutu, isik, gurultuY.kutu, yerY.kutu, rontgen, fincanYer, girdap, ...papatyalar, buhar, torbaYer);
  // şerit: stetoskop → kaşık (yuva 0), röntgen çerçevesi → torba (yuva 1), Kino'nun patileri (yuva 2)
  const dokSteto = I.dokDugmesi(0, KARIN.steto, 'Stetoskop');
  const dokKasik = I.dokDugmesi(0, KARIN.kasik, 'Kaşık'); dokKasik.hidden = true;
  const dokCerceve = I.dokDugmesi(1, KARIN.cerceve, 'Röntgen çerçevesi');
  const dokTorba = I.dokDugmesi(1, KARIN.torba, 'Sıcak su torbası'); dokTorba.hidden = true;
  const dokEller = I.dokDugmesi(2, KARIN.eller, 'Kino\'nun patileri');
  // eldeki aletler
  const stetoY = yigin([KARIN.steto, KARIN.stetoDinle], 'vk-alet-yigin');
  const ellerY = yigin([KARIN.eller, ...KARIN.ellerSur, KARIN.ellerSicak], 'vk-alet-yigin gr-eller');
  const kasikY = yigin([KARIN.kasik, KARIN.kasikKaristir], 'vk-alet-yigin');
  const fincanElY = yigin([...KARIN.fincan, KARIN.fincanEgik], 'vk-alet-yigin');
  I.aletEkle('steto', ALETLER.steto, [stetoY.kutu], KARIN.steto);
  I.aletEkle('cerceve', ALETLER.cerceve, [resim(KARIN.cerceve)], KARIN.cerceve);
  I.aletEkle('eller', ALETLER.eller, [ellerY.kutu], KARIN.eller);
  I.aletEkle('kasik', ALETLER.kasik, [kasikY.kutu], KARIN.kasik);
  I.aletEkle('fincan', ALETLER.fincan, [fincanElY.kutu], KARIN.fincan[0]);
  I.aletEkle('torba', ALETLER.torba, [resim(KARIN.torba)], KARIN.torba);

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => {
    I.asamaGec(a);
    dokKasik.hidden = !(a === 'karistir'); dokSteto.hidden = !(a === 'giris' || a === 'canta' || a === 'dinle');
    dokTorba.hidden = !(a === 'ic' || a === 'torba') || torbaKondu; dokCerceve.hidden = !(a === 'giris' || a === 'canta' || a === 'dinle' || a === 'rontgen');
    dokEller.hidden = ['karistir', 'ufle', 'ic', 'torba'].includes(a);
    buhar.hidden = a !== 'ufle';
  };
  const ilerle = () => gec(sonrakiAsama(asama()));

  /** karnın gurultusu: ses, çizgiler, gövde titrer, ekran kenarı sarsılır */
  function gurulda(guc: number) {
    const k = gurultuKademesi(ovToplam / Z.ov);
    if (k === 0 && yudum >= Z.yudum) return;
    const buyuk = guc > 0.5 && k >= 2;
    ses(buyuk ? 'g-gur' : 'g-gur-kucuk', Math.min(1, 0.35 + guc * 0.65), 0.95 + Math.random() * 0.1);
    gurultuY.kutu.classList.remove('gr-yok');
    gurultuY.goster(KARIN.gurultu[Math.max(0, 3 - Math.max(1, k))]);
    gurultuY.kutu.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0.001 }], { duration: sure(700), easing: 'ease-out' });
    titret(basY.kutu);
    if (buyuk) I.sahne.animate([{ translate: '0 0' }, { translate: '-5px 2px' }, { translate: '4px -2px' }, { translate: '-3px 1px' }, { translate: '0 0' }], { duration: sure(280) });
    gurKalan = 600;
  }

  // ——————————————————————————— 6 · üfle: buharın içinden yukarı çek
  buhar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'ufle') return;
    ufleBas = { id: e.pointerId, p: I.noktaya(e), sayildi: false };
    try { buhar.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('e-tik', 0.4, 1.2);
  });
  addEventListener('pointermove', e => {
    if (!ufleBas || e.pointerId !== ufleBas.id || ufleBas.sayildi || ufle >= Z.ufle) return;
    const p = I.noktaya(e);
    if (!ufleme(ufleBas.p, p)) return;
    ufleBas.sayildi = true;
    ufle++;
    ses('g-uf', 0.9, 0.95 + Math.random() * 0.15);
    void oynat(KARIN.dagil, { x: FINCAN.yuz.x + 20, y: FINCAN.yuz.y - 200 }, 400, 400, KARE_MS.dagil, { kay: 220, kayX: 120 });
    uflerKalan = 800;
    birKez('lo-ufle');
    kinoTepki('sevin', 500, 14);
    if (ufle >= Z.ufle) { ses('e-cin', 0.5); parilti({ x: FINCAN.yuz.x, y: FINCAN.yuz.y - 120 }, 220); setTimeout(() => { if (I.calisiyor()) { ilerle(); ziplat(fincanYer); } }, sure(400)); }
  }, { signal: I.iptal });
  const ufleBitir = (e: PointerEvent) => { if (ufleBas && e.pointerId === ufleBas.id) { if (!ufleBas.sayildi) ziplat(buhar); ufleBas = null; } };
  addEventListener('pointerup', ufleBitir, { signal: I.iptal });
  addEventListener('pointercancel', ufleBitir, { signal: I.iptal });

  // ——————————————————————————— 8 · torbaya pıt pıt vur
  torbaYer.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'torba' || !torbaKondu || pat >= Z.pat) return;
    pat++;
    ses('g-pat', 0.9, 0.9 + pat * 0.08);
    torbaY.goster(KARIN.torbaBas[0]);
    setTimeout(() => torbaY.goster(KARIN.torbaBas[1]), sure(KARE_MS.torba));
    setTimeout(() => torbaY.goster(KARIN.torbaYerinde), sure(KARE_MS.torba * 2));
    const p = { x: torbaYer.offsetLeft + TORBA_DUGMESI / 2, y: torbaYer.offsetTop };
    void oynat(KARIN.kalp, { x: p.x + (Math.random() - 0.5) * 120, y: p.y }, 160, 160, KARE_MS.kalp, { kay: 180 });
    mutluKalan = 900;
    kinoTepki('sevin', 500, 16);
    if (pat >= Z.pat) {
      soyle('lo-torba'); ses('e-cin', 0.6); parilti(p, 240);
      setTimeout(() => { havKalan = 700; ses('e-hihi', 0.5); }, sure(900));
      setTimeout(() => { if (I.calisiyor()) { gec('kutlama'); void I.kutla(); } }, sure(1700));
    }
  });

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(dokSteto, 'steto', () => asama() === 'dinle');
  I.aletDugmesi(dokCerceve, 'cerceve', () => asama() === 'rontgen', () => { rontgen.hidden = false; ses('g-rontgen', 0.6); });
  I.aletDugmesi(dokEller, 'eller', () => asama() === 'isit' || asama() === 'ov', () => { surt = { ...surt, uc: null, tepe: null, yon: 0 }; ov = { ...ov, aci: null }; });
  I.aletDugmesi(dokKasik, 'kasik', () => asama() === 'karistir', () => { karistir = { ...karistir, aci: null }; });
  I.aletDugmesi(fincanYer, 'fincan', () => asama() === 'ic', () => { fincanElY.goster(KARIN.fincan[fincanKademesi(yudum, Z.yudum)]); });
  I.aletDugmesi(dokTorba, 'torba', () => asama() === 'torba' && !torbaKondu);

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    return a === 'dinle' ? [dokSteto] : a === 'rontgen' ? [dokCerceve] : a === 'isit' || a === 'ov' ? (I.tutulan() ? [] : [dokEller]) : a === 'karistir' ? [dokKasik]
      : a === 'ufle' ? [buhar] : a === 'ic' ? [fincanYer] : a === 'torba' ? (torbaKondu ? [torbaYer] : [dokTorba]) : [];
  };

  return {
    yaklasinca: () => { gec('dinle'); ziplat(dokSteto); sonrakiGur = performance.now() + 900; },
    kutlamaYeri: { x: KARIN_ELIPS.x, y: KARIN_ELIPS.y - 120 },
    siradaki,
    kinoSasirsin: () => gurKalan > 300,
    bosDokunus: (p: Nokta) => {
      if (karindaMi(p)) { hop(basY.kutu, 8, 200); kikirKalan = 500; ses('e-hihi', 0.4, 1.2); if (asama() !== 'kutlama') gurulda(0.3); }
      else if (bastaMi(p)) { hop(basY.kutu, 10, 220); utanKalan = 500; ses('e-tik', 0.4, 1.4); }
    },
    kalkinca: (t: Tutulan) => {
      if (t.ad === 'cerceve') rontgen.hidden = true;
      if (t.ad === 'kasik') girdap.hidden = true;
      if (t.ad === 'steto') stetoY.goster(KARIN.steto);
      if (t.ad === 'torba' && asama() === 'torba') {
        const uc = I.ucNoktasi(t);
        if (!karindaMi(uc)) { kikirKalan = 600; ses('e-hihi', 0.6); return false; }
        const yer = torbaYeri(uc);
        void I.yerineKoy(t, yer, 0.9, 160).then(() => {
          t.kutu.classList.add('vk-bekler');
          ortala(torbaYer, yer, TORBA_DUGMESI, TORBA_DUGMESI); torbaYer.hidden = false; pop(torbaYer, 220);
          torbaKondu = true; dokTorba.hidden = true; I.asamaGec('torba');
          ses('g-pat', 0.6, 0.8); rahatKalan = 900; kinoTepki('sevin', 500, 14); ziplat(torbaYer);
        });
        return true;
      }
      if (t.ad === 'fincan' && asama() === 'ic') { fincanElY.goster(KARIN.fincan[fincanKademesi(yudum, Z.yudum)]); }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) => {
      gurKalan = Math.max(0, gurKalan - dt); kikirKalan = Math.max(0, kikirKalan - dt); gidikKalan = Math.max(0, gidikKalan - dt); utanKalan = Math.max(0, utanKalan - dt);
      rahatKalan = Math.max(0, rahatKalan - dt); usuduKalan = Math.max(0, usuduKalan - dt); koklarKalan = Math.max(0, koklarKalan - dt); uflerKalan = Math.max(0, uflerKalan - dt);
      yudumKalan = Math.max(0, yudumKalan - dt); mutluKalan = Math.max(0, mutluKalan - dt); havKalan = Math.max(0, havKalan - dt);
      const a = asama();
      const poz = basPozu({ asama: a, gurKalan, kikirKalan, gidikKalan, utanKalan, rahatKalan, usuduKalan, koklarKalan, uflerKalan, yudumKalan, mutluKalan, havKalan, kirp: beklemeKaresi(an) === 'kirp', an });
      if (poz !== pozSimdi) {
        const sessiz = poz === 'kirp' || pozSimdi === 'kirp' || poz.startsWith('gidik') && pozSimdi.startsWith('gidik') || poz.startsWith('yudum') && pozSimdi.startsWith('yudum') || poz.startsWith('mutlu') && pozSimdi.startsWith('mutlu');
        pozSimdi = poz; basY.goster(KARIN.bas[poz]);
        if (!sessiz) basY.kutu.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: sure(200), easing: 'ease-out' });
      }
      // kendiliğinden gurultu: karın ovulana kadar ara ara; stetoskop elde, karnın üstündeyken yakınlığa göre sıklaşır
      const dinliyor = a === 'dinle' && h?.ad === 'steto' && !!uc && karindaMi(uc);
      if (a !== 'kutlama' && a !== 'son' && an >= sonrakiGur && ADIMLAR_GURULTULU.includes(a)) {
        const yk = dinliyor ? yakinlik(uc!, gurYeri) : 0.4;
        gurulda(yk);
        sonrakiGur = an + (dinliyor ? gurultuAraligi(yk) : 2600 + Math.random() * 1200);
      }
      // çayın buharı: karıştırıldıktan sonra yükselir, üflendikçe azalır
      if ((a === 'ufle' || a === 'ic') && an - buharAni > 380 + ufle * 260) {
        buharAni = an;
        void oynat(KARIN.buhar, { x: FINCAN.yuz.x + (Math.random() - 0.5) * 80, y: FINCAN.yuz.y - 40 }, 300 - ufle * 40, 400 - ufle * 50, KARE_MS.buhar, { taban: true, kay: 140, kayX: (Math.random() - 0.5) * 40 });
      }
      if (!h || !uc) return;
      // ——— 1 · dinle
      if (h.ad === 'steto' && a === 'dinle') {
        stetoY.goster(karindaMi(uc) ? KARIN.stetoDinle : KARIN.steto);
        if (burundaMi(uc) && an - koklarAni > 1600) { koklarAni = an; koklarKalan = 900; ses('g-snif', 0.8); birKez('lo-koklar'); kinoTepki('sevin', 600, 18); }
        if (karindaMi(uc) && yol > 6 && an - sesAni > 420) { sesAni = an; ses('g-steto', 0.35, 0.9 + Math.random() * 0.2); }
        dinle = bulmaAdimi(dinle, uzak(uc, gurYeri), Z.dinleR, dt);
        if (dinle >= Z.dinleMs) {
          gurulda(1);
          yerY.kutu.classList.remove('gr-yok'); pop(yerY.kutu, 300);
          kikirKalan = 1000; soyle('lo-buldun'); parilti(gurYeri, 240); kinoTepki('sevin', 800, 24);
          I.birak(h); stetoY.goster(KARIN.steto); ilerle(); ziplat(dokCerceve);
        }
        return;
      }
      // ——— 2 · röntgen: pencere çerçeveyle gezer; dilim pencerede tutulunca bulunur
      if (h.ad === 'cerceve' && a === 'rontgen') {
        const k = pencere(uc);
        rontgen.style.clipPath = `inset(${k.ust.toFixed(0)}px ${(2048 - k.sol - k.g).toFixed(0)}px ${(1152 - k.ust - k.y).toFixed(0)}px ${k.sol.toFixed(0)}px round 22px)`;
        if (yol > 8 && an - sesAni > 500) { sesAni = an; ses('g-rontgen', 0.3, 0.95 + Math.random() * 0.1); }
        DILIMLER.forEach((p, i) => {
          if (dilimBulundu[i]) return;
          dilimBirikim[i] = penceredeMi(p, uc) && uzak(p, uc) <= Z.dilimR ? dilimBirikim[i] + dt : Math.max(0, dilimBirikim[i] - dt);
          if (dilimBirikim[i] >= Z.dilimMs) {
            dilimBulundu[i] = true;
            ses('g-bidik', 0.9, 0.9 + i * 0.12);
            const d = dilimler[i];
            d.goster(KARIN.dilim[1]); setTimeout(() => d.goster(KARIN.dilim[0]), sure(KARE_MS.dilim * 3));
            pop(d.kutu, 300); d.kutu.classList.add('gr-bulundu');
            void oynat([KARIN.dilimParilti], p, 300, 300, 360, { olcek: 1, hedef: rontgen });
            utanKalan = 700; kinoTepki('sevin', 500, 14);
          }
        });
        // başına tutulursa: röntgende aklındaki mandalina görünür, Lokum utanır
        kafaBirikim = bastaMi(uc) ? kafaBirikim + dt : 0;
        if (kafaBirikim > 300 && an - kafaAni > 4000) { kafaAni = an; utanKalan = 1200; ses('e-hihi', 0.8); soyle('lo-kafa'); kinoTepki('sevin', 900, 22); }
        if (dilimBulundu.every(Boolean)) {
          soyle('lo-dilim'); ses('e-cin', 0.6); kinoTepki('sevin', 700, 20);
          I.birak(h); rontgen.hidden = true; ilerle(); ziplat(dokEller);
        }
        return;
      }
      // ——— 3 · ısıt: patileri sürt; ısınmadan karna dokunursa üşür
      if (h.ad === 'eller' && a === 'isit') {
        if (karindaMi(uc)) {
          if (an - usuduAni > 1400) { usuduAni = an; usuduKalan = 900; ses('g-brr', 0.9); birKez('lo-usudu'); titret(basY.kutu); void oynat(KARIN.titreme, { x: KARIN_ELIPS.x, y: KARIN_ELIPS.y - 160 }, 800, 600, KARE_MS.titreme * 2); kinoTepki('sasir', 700, 18); }
          return;
        }
        const once = surt.sayi;
        surt = surtAdimi(surt, uc.x);
        if (surt.sayi > once) {
          isit++;
          ellerY.goster(KARIN.ellerSur[isit % 2]);
          ses('g-sur', 0.8, 0.9 + Math.min(0.5, isit * 0.06));
          void oynat(KARIN.sicakParilti, uc, 300, 300, KARE_MS.parilti, { kay: 60 });
          h.kutu.style.setProperty('--sicak', Math.min(1, isit / Z.isit).toFixed(2));
          if (isit >= Z.isit) { ellerY.goster(KARIN.ellerSicak); ses('g-sicak', 0.8); parilti(uc, 220); kinoTepki('sevin', 600, 18); gec('ov'); }
        }
        return;
      }
      // ——— 4 · ov: ılık patilerle karnına yavaş daireler
      if (h.ad === 'eller' && a === 'ov') {
        ellerY.goster(KARIN.ellerSicak);
        const r = daireAdimi(ov, uc, KARIN_ELIPS, karindaMi(uc), 50);
        ov = r.d;
        ovHizi = ortalamaHiz(ovHizi, Math.abs(r.fark) / Math.max(1, dt), dt);
        if (r.fark === 0) return;
        if (!yavasMi(ovHizi, 1, Z.ovHiz)) {
          if (gidikKalan < 300) { ses('e-hihi', 0.8, 1 + Math.random() * 0.2); hop(basY.kutu, 14, 240); void oynat(KARIN.gidikCizgi, { x: KARIN_ELIPS.x, y: KARIN_ELIPS.y - 60 }, 800, 600, KARE_MS.gidik); }
          gidikKalan = 900; if (!gidikSoylendi) { gidikSoylendi = true; soyle('lo-gidik'); }
          return;
        }
        const once = gurultuKademesi(ovToplam / Z.ov);
        ovToplam = Math.min(Z.ov, ovToplam + Math.abs(r.fark));
        ovIzAci += Math.abs(r.fark);
        rahatKalan = 500;
        isik.style.opacity = (0.2 + 0.8 * (ovToplam / Z.ov)).toFixed(3);
        if (ovIzAci > 0.5) { ovIzAci = 0; void oynat(KARIN.ovIz, uc, 300, 300, KARE_MS.iz); }
        if (an - sesAni > 380) { sesAni = an; ses('g-ov', 0.6, 0.9 + Math.random() * 0.15); }
        const simdi = gurultuKademesi(ovToplam / Z.ov);
        if (simdi !== once) { gurulda(0.3); kinoTepki('sevin', 400, 12); }
        if (ovToplam >= Z.ov) {
          soyle('lo-rahat'); ses('e-cin', 0.6); parilti(KARIN_ELIPS, 260); kinoTepki('sevin', 700, 22);
          I.birak(h); ilerle(); ziplat(dokKasik);
        }
        return;
      }
      // ——— 5 · karıştır: kaşıkla çayın içinde daireler; hızlıysa çay sıçrar
      if (h.ad === 'kasik' && a === 'karistir') {
        const icinde = uzak(uc, FINCAN.yuz) <= FINCAN.yaricap;
        kasikY.goster(icinde ? KARIN.kasikKaristir : KARIN.kasik);
        const r = daireAdimi(karistir, uc, FINCAN.yuz, icinde, 25);
        karistir = r.d;
        karistirHizi = ortalamaHiz(karistirHizi, Math.abs(r.fark) / Math.max(1, dt), dt);
        if (r.fark === 0) return;
        if (!yavasMi(karistirHizi, 1, Z.karistirHiz)) {
          if (an - sesAni > 400) { sesAni = an; ses('g-sicrama', 0.8); void oynat(KARIN.sicrama, { x: FINCAN.yuz.x, y: FINCAN.yuz.y - 40 }, 300, 300, KARE_MS.sicrama); kikirKalan = 700; ses('e-hihi', 0.5); kinoTepki('sasir', 500, 14); }
          return;
        }
        karistirToplam = Math.min(Z.karistir, karistirToplam + Math.abs(r.fark));
        kasikAci += Math.abs(r.fark);
        girdap.hidden = false;
        if (an - girdapAni > KARE_MS.girdap) { girdapAni = an; girdapKaresi = (girdapKaresi + 1) % 3; girdap.src = I.adres(KARIN.girdap[girdapKaresi]) ?? ''; }
        papatyalar.forEach((p, i) => { const t = karistirToplam * 1.3 + i * Math.PI; p.style.transform = `translate(${(Math.cos(t) * 60).toFixed(1)}px, ${(Math.sin(t) * 22).toFixed(1)}px) rotate(${(t * 57).toFixed(0)}deg)`; });
        if (kasikAci > 1.2) { kasikAci = 0; ses('g-kasik', 0.7, 0.9 + Math.random() * 0.25); }
        if (karistirToplam >= Z.karistir) {
          girdap.hidden = true; soyle('lo-cay'); ses('e-cin', 0.5); parilti(FINCAN.yuz, 220); kinoTepki('sevin', 600, 18);
          I.birak(h); ilerle(); ziplat(buhar);
        }
        return;
      }
      // ——— 7 · iç: fincanın ağzı Lokum'un ağzında; burnuna tutulursa koklar
      if (h.ad === 'fincan' && a === 'ic') {
        const agizda = agizdaMi(uc);
        if (!agizda && burundaMi(uc) && an - koklarAni > 1400) { koklarAni = an; koklarKalan = 800; ses('g-snif', 0.8); }
        fincanElY.goster(agizda ? KARIN.fincanEgik : KARIN.fincan[fincanKademesi(yudum, Z.yudum)]);
        yudumBirikim = yudumAdimi(yudumBirikim, agizda, dt);
        if (agizda) yudumKalan = 300;
        if (yudumBirikim >= Z.yudumMs) {
          yudumBirikim = 0; yudum++;
          ses('g-yudum', 0.9, 0.95 + yudum * 0.05); kinoTepki('sevin', 400, 12); hop(basY.kutu, 6, 200);
          fincanY.goster(KARIN.fincan[fincanKademesi(yudum, Z.yudum)]);
          if (yudum >= Z.yudum) {
            soyle('lo-yudum'); ses('e-cin', 0.6); rahatKalan = 1200; parilti(BAS.agiz, 200);
            fincanY.goster(KARIN.fincan[3]);
            void I.yerineKoy(h, { x: FINCAN.kutu.sol + FINCAN.kutu.g / 2, y: FINCAN.kutu.ust + FINCAN.kutu.y * 0.18 }, 1.5, 200);
            ilerle(); ziplat(dokTorba);
          }
        }
      }
    },
    test: {
      nokta: (ad: string) => {
        const p: Record<string, Nokta> = {
          gurultu: gurYeri, karin: KARIN_ELIPS, burun: BAS.burun, agiz: BAS.agiz, bas: BAS.bas, fincan: FINCAN.yuz, buhar: { x: FINCAN.yuz.x, y: FINCAN.yuz.y - 120 },
          ...Object.fromEntries(DILIMLER.map((d, i) => ['dilim' + i, d])),
          torba: torbaKondu ? { x: torbaYer.offsetLeft + TORBA_DUGMESI / 2, y: torbaYer.offsetTop + TORBA_DUGMESI / 2 } : KARIN_ELIPS,
          fincanYer: { x: FINCAN.kutu.sol + FINCAN.kutu.g / 2, y: FINCAN.kutu.ust + FINCAN.kutu.y / 2 },
        };
        return p[ad] ? I.ekrana(p[ad]) : null;
      },
      poz: () => pozSimdi,
      sayim: () => ({ dinle, hedefDinle: Z.dinleMs, dilim: dilimBulundu.filter(Boolean).length, isit, hedefIsit: Z.isit, ov: ovToplam, hedefOv: Z.ov, karistir: karistirToplam, hedefKaristir: Z.karistir, ufle, hedefUfle: Z.ufle, yudum, hedefYudum: Z.yudum, pat, hedefPat: Z.pat, torbaKondu, usudu: usuduAni > 0, gidik: gidikSoylendi, koklar: koklarAni > 0, kafa: kafaAni > 0 }),
    },
  };
}

/** karın ovulana kadar kendiliğinden guruldar; çay içilene kadar arada minik gurultu */
const ADIMLAR_GURULTULU: readonly Asama[] = ['giris', 'canta', 'dinle', 'rontgen', 'isit', 'ov', 'karistir', 'ufle', 'ic'];
