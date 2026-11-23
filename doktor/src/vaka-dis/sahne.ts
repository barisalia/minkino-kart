// Minik Doktor · "Mino'nun Kurabiyeli Dişleri" (dokuz adım; veri.ts başındaki senaryo). İskelet (masa, kamera, aletler,
// kapanış) vaka-kit'te; burada yakın planın katmanları, el hareketleri ve Mino'nun tepkileri.
// Çizimler Astra'dan (Paket Doktor-Y2, assets/doktor/dis/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './disler.css';
import { KopukKatmani } from '../vaka/his';
import { SAHNE } from '../vaka/veri';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  AGIZ, AGIZ_DUGMESI, AGIZ_MENZILI, ALETLER, ARALIKLAR, AYNA_YARICAPI, DIL_YOLU, DIS_SAYISI, DISLER, DISLER_DOSYALAR, EFEKTLER, HAVLU, KAPANIS, KARE_MS, KASE, KILLAR, KIRINTILAR, MASA, SIRA_DISI, SOZLER, TATLAR, ZORLUK,
  aralikBul, bardakKaresi, calkalaAdimi, calkalaBaslangici, disBul, disYeri, fircaAdimi, gidikAdimi, gidikPozu, gidiktaMi, ipAdimi, ipBaslangici, killardaMi, notaHizi, seritKademesi, temizSayisi, yuzdeMi,
  type Asama, type IpVurusu,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('dis', DISLER_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'disler', klasor: 'dis', dosyalar: DISLER_DOSYALAR,
    hasta: { ad: 'Mino\'nun ağzı', kutu: MASA.mino, bekleme: [DISLER.uzgun[0], DISLER.uzgun[1]], kirp: DISLER.uzgunKirp, sevinc: [DISLER.sevinc[0], DISLER.sevinc[1]],
      son: [DISLER.son[0], DISLER.son[0], DISLER.son[1], DISLER.son[1], DISLER.son[2], DISLER.son[2], DISLER.son[2], DISLER.son[2]],
      dokunma: MASA.agiz, dugme: AGIZ_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [DISLER.ayna, DISLER.macun[0], DISLER.firca, DISLER.bardak[0]], seritAletleri: [DISLER.ayna, DISLER.ip, DISLER.elAynasi],
    yakinFon: DISLER.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER],
    sozler: { giris: 'mn-mmm', canta: 'mn-canta', son: 'mn-son' },
    kapanis: KAPANIS,
  }, I => kurDisler(I));
}

function kurDisler(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, soyle, kinoTepki, oynat, parilti } = I;
  const B = DISLER.bas;
  // ——————————————————————————— durum
  let gidik = 0, gidikId = -1, gidikSon: Nokta | null = null, gidikSesi = 0;
  const bulunan = KIRINTILAR.slice(0, Z.kirinti).map(() => false);
  const sayilan = new Set<number>();
  let tat = -1, macunYolu = 0, macunSesi = 0, burunKalan = 0;
  const fircaYolu = Array.from({ length: DIS_SAYISI }, () => 0);
  let dilYolu = 0, dilAsamasi = false, kopukYolu = 0, fircaSesi = 0, baloncukAni = 0;
  let suMs = 0, suKaresi = 0, calkala = calkalaBaslangici(), puf = false;
  const ipBiten = ARALIKLAR.slice(0, Z.aralik).map(() => false);
  let ipAralik = -1, ipV: IpVurusu | null = null;
  let gulusMs = 0, bitti = false, kikirKalan = 0, sasirKalan = 0, basSimdi = '';

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const basY = yigin(Object.values(B), 'vk-fon vk-tam vk-soluk');
  const basGoster = (ad: string) => { if (ad !== basSimdi) { basSimdi = ad; basY.goster(ad); } };
  const disTemiz = resim(DISLER.disTemiz, 'vk-fon ds-dis'), disParlak = resim(DISLER.disParlak, 'vk-fon ds-dis ds-yok');
  // bulaşık: tuval; fırçanın temizlediği diş buradan silinir
  const kirli = el('canvas', 'vk-katman ds-kirli'); kirli.width = SAHNE.g / 2; kirli.height = SAHNE.y / 2;
  const kg = kirli.getContext('2d')!;
  { const r = I.cozulmus.get(DISLER.disKirli); if (r && r.naturalWidth) kg.drawImage(r, 0, 0, kirli.width, kirli.height); }
  const disKati = el('div', 'vk-katman ds-agiz ds-yok'); disKati.append(disTemiz, kirli, disParlak);
  const kirintilar = KIRINTILAR.slice(0, Z.kirinti).map(k => { const r = resim(DISLER.kirinti[k.cesit], 'vk-katman ds-kirinti'); ortala(r, k, 84, 84); return r; });
  const kirintiKati = el('div', 'vk-katman ds-agiz ds-yok'); kirintiKati.append(...kirintilar);
  const kopuk = new KopukKatmani(I.cozulmus.get(DISLER.kopuk[2])!);
  const burunMacun = resim(DISLER.burunMacun, 'vk-katman ds-yok'); ortala(burunMacun, AGIZ.burun, 150, 150);
  const halkaY = yigin(DISLER.isikHalka, 'vk-katman vk-tam ds-halka ds-yok'); halkaY.kutu.style.width = halkaY.kutu.style.height = '360px';
  const suY = yigin(DISLER.bardakSu, 'vk-katman vk-tam ds-yok'); koy(suY.kutu, { sol: AGIZ.merkez.x - 60, ust: AGIZ.merkez.y - 330, g: 120, y: 360 });
  const kaseY = yigin(DISLER.kase, 'vk-katman vk-tam'); koy(kaseY.kutu, KASE.kutu);
  // havluda duran fırça: macunsuz, sonra seçilen tadın macunuyla; üstünde macun şeridi
  const fircaYer = el('button', 'vk-katman ds-firca-yeri'); fircaYer.type = 'button'; fircaYer.setAttribute('aria-label', 'Diş fırçası'); ortala(fircaYer, HAVLU.firca, HAVLU.fircaBoyu, HAVLU.fircaBoyu);
  const fircaYerY = yigin([DISLER.firca, ...DISLER.fircaMacunlu], 'vk-tam ds-dolu'); fircaYer.append(fircaYerY.kutu);
  const seritY = yigin(DISLER.serit.flat(), 'vk-katman vk-tam ds-yok'); koy(seritY.kutu, { sol: KILLAR.sol - 8, ust: KILLAR.y - 50, g: 170, y: 54 });
  // dokunma alanları: gıdık yeri, dişler, iki yanak
  const alan = (sinif: string, etiket: string, k: { sol: number; ust: number; g: number; y: number }) => { const b = el('button', 'vk-katman ds-alan ' + sinif); b.type = 'button'; b.setAttribute('aria-label', etiket); koy(b, k); b.hidden = true; return b; };
  const gidikAlani = alan('ds-gidik', 'Mino\'nun çenesi', { sol: AGIZ.gidik.x - AGIZ.gidik.rx, ust: AGIZ.gidik.y - AGIZ.gidik.ry, g: AGIZ.gidik.rx * 2, y: AGIZ.gidik.ry * 2 });
  const disAlani = alan('ds-say', 'Mino\'nun dişleri', { sol: AGIZ.ust.sol - 20, ust: AGIZ.ust.ust - 20, g: AGIZ.ust.g + 40, y: AGIZ.alt.ust + AGIZ.alt.y - AGIZ.ust.ust + 40 });
  const yanaklar = AGIZ.yanak.map((p, i) => { const b = alan('ds-yanak', i ? 'Sağ yanak' : 'Sol yanak', { sol: p.x - AGIZ.yanakDugmesi / 2, ust: p.y - AGIZ.yanakDugmesi / 2, g: AGIZ.yanakDugmesi, y: AGIZ.yanakDugmesi }); return b; });
  y.append(basY.kutu, disKati, kirintiKati, kopuk.tuval, burunMacun, suY.kutu, kaseY.kutu, fircaYer, seritY.kutu, halkaY.kutu, gidikAlani, disAlani, ...yanaklar);
  // şerit: önce ayna; sonra üç macun; sonra bardak, ip çubuğu, el aynası
  const dokAyna = I.dokDugmesi(0, DISLER.ayna, 'Ağız aynası');
  const dokMacun = TATLAR.map((t, i) => { const b = I.dokDugmesi(i, DISLER.macun[i], t + ' macunu'); b.hidden = true; return b; });
  const dokBardak = I.dokDugmesi(0, DISLER.bardak[0], 'Su bardağı'), dokIp = I.dokDugmesi(1, DISLER.ip, 'İp çubuğu'), dokElAynasi = I.dokDugmesi(2, DISLER.elAynasi, 'El aynası');
  for (const b of [dokBardak, dokIp, dokElAynasi]) b.hidden = true;
  // eldeki aletler
  const aynaY = yigin([DISLER.ayna, DISLER.aynaIsik], 'vk-alet-yigin');
  const fircaElY = yigin([DISLER.firca, ...DISLER.fircaMacunlu], 'vk-alet-yigin');
  const bardakY = yigin(DISLER.bardak, 'vk-alet-yigin');
  const ipY = yigin([DISLER.ip, DISLER.ipGergin], 'vk-alet-yigin');
  const elAynasiY = yigin([DISLER.elAynasi, DISLER.elAynasiParlak], 'vk-alet-yigin');
  const yansima = resim(DISLER.yansima, 'vk-ic'); { const a = ALETLER.elAynasi, c = 300 * (a.g / 600) * 0.92; Object.assign(yansima.style, { left: a.uc[0] * a.g - c / 2 + 'px', top: a.uc[1] * a.y - c / 2 + 'px', width: c + 'px', height: c + 'px' }); }
  I.aletEkle('ayna', ALETLER.ayna, [aynaY.kutu], DISLER.ayna);
  I.aletEkle('firca', ALETLER.firca, [fircaElY.kutu], DISLER.firca);
  I.aletEkle('bardak', ALETLER.bardak, [bardakY.kutu], DISLER.bardak[0]);
  I.aletEkle('ip', ALETLER.ip, [ipY.kutu], DISLER.ip);
  I.aletEkle('elAynasi', ALETLER.elAynasi, [elAynasiY.kutu, yansima], DISLER.elAynasi);
  const tupY = TATLAR.map((t, i) => { const yy = yigin([DISLER.macun[i], DISLER.macunSikik[i]], 'vk-alet-yigin'); I.aletEkle('macun-' + t, ALETLER[`macun-${t}`], [yy.kutu], DISLER.macun[i]); return yy; });

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => I.asamaGec(a);
  const goster = (e: HTMLElement, acik: boolean) => e.classList.toggle('ds-yok', !acik);

  // ——————————————————————————— 1 · gıdıkla: parmak çenenin altında gezdikçe kıkırdar, sonunda ağzını açar
  gidikAlani.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'gidik') return;
    gidikId = e.pointerId; gidikSon = I.noktaya(e);
    try { gidikAlani.setPointerCapture(e.pointerId); } catch { /* pencere olayları yeter */ }
    gidik = gidikAdimi(gidik, 40, 0, Z.gidik);                // dokunmak da gıdıklar
    ses('e-hihi', 0.5, 1.2); hop(basY.kutu, 8, 180);
  });
  addEventListener('pointermove', e => {
    if (e.pointerId !== gidikId || !gidikSon || asama() !== 'gidik') return;
    const p = I.noktaya(e), yol = Math.hypot(p.x - gidikSon.x, p.y - gidikSon.y);
    gidikSon = p;
    if (!gidiktaMi(p)) return;
    gidik = gidikAdimi(gidik, yol, 0, Z.gidik);
    const an = performance.now();
    if (an - gidikSesi > 260) { gidikSesi = an; ses(gidik / Z.gidik > 0.5 ? 'z-kikir' : 'e-hihi', 0.6, 1.1 + Math.random() * 0.3); titret(basY.kutu); kinoTepki('sevin', 300, 8); }
    if (gidik >= Z.gidik) agziAc();
  }, { signal: I.iptal });
  const gidikBirak = (e: PointerEvent) => { if (e.pointerId === gidikId) { gidikId = -1; gidikSon = null; } };
  addEventListener('pointerup', gidikBirak, { signal: I.iptal });
  addEventListener('pointercancel', gidikBirak, { signal: I.iptal });
  function agziAc() {
    gidikId = -1; gidikSon = null; gidikAlani.hidden = true;
    basGoster(B.acik); goster(disKati, true); goster(kirintiKati, true);
    pop(basY.kutu, 240); ses('d-fener', 0.8); soyle('mn-aaa');
    parilti(AGIZ.merkez, 300); kinoTepki('sevin', 800, 24);
    gec('ayna'); ziplat(dokAyna);
  }

  // ——————————————————————————— 3 · dişleri say: her dokunuşta bir diş parlar, bir nota çalar
  disAlani.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'say') return;
    const d = disBul(I.noktaya(e));
    if (d < 0) return;
    const p = disYeri(d);
    if (sayilan.has(d)) { ses('e-tingir', 0.4, 0.8); return; }
    sayilan.add(d);
    ses('e-tingir', 0.8, notaHizi(sayilan.size));
    void oynat(DISLER.disIsik, p, 150, 180, KARE_MS.isik);
    void oynat([DISLER.nota[sayilan.size % DISLER.nota.length]], { x: p.x, y: p.y - 90 }, 110, 110, KARE_MS.nota * 3, { kay: 150, kayX: (Math.random() - 0.5) * 120, don: (Math.random() - 0.5) * 40 });
    hop(basY.kutu, 6, 160); kinoTepki('sevin', 300, 8);
    if (sayilan.size === 3) soyle('mn-tin');
    if (sayilan.size >= Z.say) {
      disAlani.hidden = true;
      ses('e-cin', 0.6, 1.2); kinoTepki('sevin', 700, 24);
      setTimeout(() => { if (!I.calisiyor()) return; dokAyna.hidden = true; dokMacun.forEach((b, i) => { b.hidden = false; setTimeout(() => pop(b), sure(i * 90)); }); gec('macun'); }, sure(350));
    }
  });

  // ——————————————————————————— 7 · çalkala: şişik yanaklara sırayla dokun; sonunda kâseye "pfff"
  yanaklar.forEach((b, i) => b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'calkala' || puf) return;
    const s = calkalaAdimi(calkala, i);
    if (!s.sayildi) { ses('e-tik', 0.5, 0.8); sasirKalan = 500; titret(basY.kutu); kinoTepki('sasir', 400, 8); return; }      // aynı yanak: su geçmez, Mino'nun gözleri büyür
    calkala = { sayi: s.sayi, son: s.son };
    basGoster(i ? B.sisikSag : B.sisikSol);
    ses('d-blup', 0.9, 0.9 + (calkala.sayi % 2) * 0.2); hop(basY.kutu, 8, 160); kinoTepki('sevin', 300, 8);
    if (calkala.sayi >= Z.calkala) void puskurt();
  }));
  async function puskurt() {
    puf = true;
    for (const b of yanaklar) b.hidden = true;
    await new Promise(r => setTimeout(r, sure(260)));
    if (!I.calisiyor()) return;
    basGoster(B.puf); ses('d-likir', 1); soyle('mn-puf');
    void oynat(DISLER.pufSu, { x: (AGIZ.merkez.x + KASE.agiz.x) / 2 + 60, y: (AGIZ.merkez.y + KASE.agiz.y) / 2 }, 500, 400, KARE_MS.puf);
    kopuk.temizle();
    setTimeout(() => { kaseY.goster(DISLER.kase[1]); pop(kaseY.kutu, 180); }, sure(200));
    setTimeout(() => kaseY.goster(DISLER.kase[2]), sure(380));
    await new Promise(r => setTimeout(r, sure(520)));
    if (!I.calisiyor()) return;
    basGoster(B.acik); goster(disKati, true);
    kinoTepki('sevin', 700, 22);
    gec('ip'); ziplat(dokIp);
  }

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(dokAyna, 'ayna', () => asama() === 'ayna');
  dokMacun.forEach((b, i) => I.aletDugmesi(b, 'macun-' + TATLAR[i], () => asama() === 'macun', () => { if (tat !== i) { tat = i; macunYolu = 0; goster(seritY.kutu, false); } }));
  I.aletDugmesi(fircaYer, 'firca', () => asama() === 'firca', () => { fircaYerY.kutu.classList.add('ds-yok'); goster(seritY.kutu, false); });
  I.aletDugmesi(dokBardak, 'bardak', () => asama() === 'su');
  I.aletDugmesi(dokIp, 'ip', () => asama() === 'ip');
  I.aletDugmesi(dokElAynasi, 'elAynasi', () => asama() === 'gulus');

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    return a === 'gidik' ? [gidikAlani] : a === 'ayna' ? [dokAyna] : a === 'say' ? [disAlani] : a === 'macun' ? dokMacun : a === 'firca' ? [fircaYer] : a === 'su' ? [dokBardak] : a === 'calkala' ? yanaklar : a === 'ip' ? [dokIp] : a === 'gulus' ? [dokElAynasi] : [];
  };

  /** bir diş temizlendi: bulaşığı tuvalden silinir, parlar */
  function disiTemizle(d: number) {
    const s = d < SIRA_DISI ? AGIZ.ust : AGIZ.alt, g = s.g / SIRA_DISI, x = s.sol + g * (d % SIRA_DISI);
    kg.clearRect((x - 2) / 2, (s.ust - 14) / 2, (g + 4) / 2, (s.y + 28) / 2);
    void oynat([DISLER.disParilti[0], DISLER.disParilti[1]], disYeri(d), 120, 120, KARE_MS.parilti);
    ses('d-isilti', 0.45, 1 + temizSayisi(fircaYolu, Z.dis) * 0.05);
  }
  function fircaBitti(h: Tutulan) {
    I.birak(h);
    kg.clearRect(0, 0, kirli.width, kirli.height);
    basGoster(B.acik);
    ses('e-cin', 0.6, 1.2); soyle('mn-kopuk'); kinoTepki('sevin', 800, 24);
    dokMacun.forEach(b => { b.hidden = true; });
    for (const b of [dokBardak, dokIp, dokElAynasi]) b.hidden = false;
    gec('su'); ziplat(dokBardak);
  }
  async function gulus(h: Tutulan) {
    bitti = true;
    elAynasiY.goster(DISLER.elAynasiParlak);
    goster(disKati, false);
    basGoster(B.gulen);
    ses('d-isilti', 1); soyle('mn-parlak'); kinoTepki('sevin', 900, 28);
    [0, 1, 2].forEach(i => setTimeout(() => void oynat(DISLER.disParilti, { x: AGIZ.merkez.x + (i - 1) * 150, y: AGIZ.merkez.y - 20 + (i % 2) * 40 }, 200, 200, KARE_MS.parilti), sure(i * 130)));
    [0, 1, 2].forEach(i => setTimeout(() => void oynat(DISLER.gulusKalp, { x: AGIZ.yuz.x + (i - 1) * 260, y: AGIZ.yuz.y - 260 }, 140, 140, KARE_MS.kalp, { kay: 150 }), sure(200 + i * 160)));
    await new Promise(r => setTimeout(r, sure(700)));
    if (!I.calisiyor()) return;
    I.birak(h);
    basGoster(B.poz); pop(basY.kutu, 220);
    await new Promise(r => setTimeout(r, sure(450)));
    if (!I.calisiyor()) return;
    gec('kutlama');
    void I.kutla();
  }

  // ——————————————————————————— her karede
  function kare(dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) {
    const a = asama();
    kikirKalan = Math.max(0, kikirKalan - dt); sasirKalan = Math.max(0, sasirKalan - dt); burunKalan = Math.max(0, burunKalan - dt);
    if (burunKalan <= 0 && !burunMacun.classList.contains('ds-yok')) goster(burunMacun, false);
    // 1 · gıdık: parmak durunca söner; yüz orana göre
    if (a === 'gidik') { if (gidikId < 0) gidik = gidikAdimi(gidik, 0, dt, Z.gidik); basGoster(B[gidikPozu(gidik / Z.gidik, an)]); }
    // 2 · ağız aynası: ışık halkası ucu izler; altındaki kırıntı parlayıp belirir
    const aynada = !!h && h.ad === 'ayna' && a === 'ayna' && !!uc;
    goster(halkaY.kutu, aynada);
    if (aynada && uc && h) {
      aynaY.goster(DISLER.aynaIsik);
      halkaY.kutu.style.transform = `translate3d(${uc.x - 180}px, ${uc.y - 180}px, 0)`; halkaY.goster(DISLER.isikHalka[Math.floor(an / KARE_MS.halka) % 2]);
      KIRINTILAR.slice(0, Z.kirinti).forEach((k, i) => {
        if (bulunan[i] || Math.hypot(uc.x - k.x, uc.y - k.y) > AYNA_YARICAPI) return;
        bulunan[i] = true;
        kirintilar[i].classList.add('ds-bulundu'); pop(kirintilar[i], 220);
        void oynat(DISLER.kirintiParla, k, 170, 170, KARE_MS.parla);
        ses('d-isilti', 0.7, 1 + i * 0.08); kinoTepki('sevin', 400, 12);
        if (bulunan.filter(Boolean).length === 1) soyle('mn-kirinti');
        if (bulunan.every(Boolean)) setTimeout(() => { if (!I.calisiyor()) return; const t = I.tutulan(); if (t && t.ad === 'ayna') I.birak(t); disAlani.hidden = false; gec('say'); soyle('kn-say'); }, sure(350));
      });
    } else if (aynaY.simdi() !== DISLER.ayna) aynaY.goster(DISLER.ayna);
    // 4 · macun: tüp kılların üstünde gezdikçe şerit uzar; yüze sıkılırsa burna konar
    if (h && uc && a === 'macun' && h.ad.startsWith('macun-') && tat >= 0) {
      const ustunde = killardaMi(uc);
      tupY[tat].goster(ustunde && yol > 0.5 ? DISLER.macunSikik[tat] : DISLER.macun[tat]);
      if (ustunde && yol > 0.5) {
        macunYolu += Math.min(40, yol);
        const k = seritKademesi(macunYolu, Z.macun);
        if (k > 0) { goster(seritY.kutu, true); seritY.goster(DISLER.serit[tat][k - 1]); }
        if (an - macunSesi > 200) { macunSesi = an; ses('d-fist', 0.7, 1 + k * 0.1); }
        if (k >= 3) {
          I.birak(h);
          fircaYerY.goster(DISLER.fircaMacunlu[tat]); fircaElY.goster(DISLER.fircaMacunlu[tat]); goster(seritY.kutu, false);
          pop(fircaYer, 200); ses('e-cin', 0.5, 1.3); soyle('mn-macun'); kinoTepki('sevin', 600, 20);
          gec('firca');
        }
      } else if (yuzdeMi(uc) && yol > 6 && burunKalan <= 0) {
        // yanlış hamle: macun burna konar, Mino şaşırıp kıkırdar
        burunKalan = 1600; sasirKalan = 700; goster(burunMacun, true); pop(burunMacun, 180);
        ses('d-fist', 0.8, 1.4); soyle('mn-burun'); kinoTepki('sasir', 600, 14); ziplat(fircaYer);
      }
    }
    // 5 · fırçala: fırçanın geçtiği dişte yol birikir; köpük birikir, baloncuk yükselir
    if (h && uc && a === 'firca' && h.ad === 'firca') {
      const d = disBul(uc, 30);
      if (!dilAsamasi && d >= 0 && yol > 0.5) {
        if (fircaAdimi(fircaYolu, d, yol, Z.dis)) disiTemizle(d);
        kopukYolu += yol;
        if (kopukYolu > 46) { kopukYolu = 0; kopuk.ekle({ x: uc.x + (Math.random() - 0.5) * 60, y: uc.y + (Math.random() - 0.5) * 50 }, 90 + Math.random() * 60, Math.random() * 360); }
        if (an - fircaSesi > 220) { fircaSesi = an; ses('d-fircala', 0.7, 0.95 + Math.random() * 0.15); kikirKalan = 500; }
        if (an - baloncukAni > 420) { baloncukAni = an; const q = { x: uc.x + (Math.random() - 0.5) * 160, y: uc.y - 40 }; void oynat([...DISLER.baloncuk, ...DISLER.baloncukPat], q, 110, 110, KARE_MS.baloncuk, { kay: 170, kayX: (Math.random() - 0.5) * 100 }); }
        if (temizSayisi(fircaYolu, Z.dis) >= Z.temiz) { if (Z.dil) { dilAsamasi = true; soyle('mn-aaa'); kinoTepki('sevin', 500, 14); } else fircaBitti(h); }
      } else if (dilAsamasi && Math.hypot(uc.x - AGIZ.dil.x, uc.y - (AGIZ.dil.y + 45)) <= AGIZ.dil.yaricap + 40 && yol > 0.5) {
        dilYolu += Math.min(50, yol);
        if (an - fircaSesi > 220) { fircaSesi = an; ses('d-fircala', 0.6, 1.2); kikirKalan = 500; }
        if (dilYolu >= DIL_YOLU) { dilAsamasi = false; fircaBitti(h); }
      }
    }
    // 6 · su: bardak ağzın yanında tutuldukça su akar, bardak boşalır, yanaklar şişer
    const suAkiyor = !!h && h.ad === 'bardak' && a === 'su' && !!uc && Math.hypot(uc.x - AGIZ.merkez.x, uc.y - (AGIZ.merkez.y - 260)) <= AGIZ_MENZILI;
    goster(suY.kutu, suAkiyor);
    if (suAkiyor && h) {
      suMs += dt;
      suY.goster(DISLER.bardakSu[Math.floor(an / KARE_MS.su) % DISLER.bardakSu.length]);
      const k = bardakKaresi(suMs / Z.su);
      if (k !== suKaresi) { suKaresi = k; bardakY.goster(DISLER.bardak[k]); ses('l-su', 0.6, 1 + k * 0.15); if (k === 1) soyle('mn-su'); }
      if (suMs >= Z.su) {
        I.birak(h); goster(suY.kutu, false); dokBardak.hidden = true;
        goster(disKati, false); basGoster(B.sisik); pop(basY.kutu, 200); ses('p-sip', 0.8);
        calkala = calkalaBaslangici(); for (const b of yanaklar) b.hidden = false;
        gec('calkala'); yanaklar.forEach(ziplat);
      }
    }
    // 8 · ip: çubuk bir diş aralığında aşağı yukarı oynatılır; aralıktan minik kırıntı fırlar
    if (h && uc && a === 'ip' && h.ad === 'ip') {
      const g = aralikBul(uc, Z.aralik);
      ipY.goster(g >= 0 && !ipBiten[g] ? DISLER.ipGergin : DISLER.ip);
      if (g < 0 || ipBiten[g]) { ipAralik = -1; ipV = null; }
      else {
        if (g !== ipAralik || !ipV) { ipAralik = g; ipV = ipBaslangici(uc.y); }
        const once = ipV.sayi; ipV = ipAdimi(ipV, uc.y);
        if (ipV.sayi > once) { ses('e-his', 0.6, 1.2 + ipV.sayi * 0.1); kikirKalan = 350; hop(basY.kutu, 5, 140); }
        if (ipV.sayi >= Z.vurus) {
          ipBiten[g] = true; ipV = null;
          const p = { x: ARALIKLAR[g].x, y: AGIZ.merkez.y };
          void oynat(DISLER.ipPit, p, 130, 130, KARE_MS.pit);
          void oynat([DISLER.kirinti[3]], p, 70, 70, 420, { kay: 220, kayX: (g % 2 ? 1 : -1) * 180, don: 240 });
          ses('e-pit', 0.9, 1 + g * 0.1); kinoTepki('sevin', 400, 12);
          if (ipBiten.filter(Boolean).length === 1) soyle('mn-ip');
          if (ipBiten.every(Boolean)) {
            I.birak(h); dokIp.hidden = true;
            goster(disParlak, true); ses('e-cin', 0.6, 1.3); soyle('kn-aferin'); kinoTepki('sevin', 800, 24);
            gec('gulus'); ziplat(dokElAynasi);
          }
        }
      }
    }
    // 9 · gülüş: el aynası yüze tutulur
    if (h && uc && a === 'gulus' && h.ad === 'elAynasi' && !bitti) {
      const tutuyor = yuzdeMi(uc);
      yansima.classList.toggle('vk-gorunur', tutuyor);
      if (tutuyor) { gulusMs += dt; basGoster(an % 2600 < 140 ? B.acikKirp : B.acikKikir); if (gulusMs >= Z.gulus) void gulus(h); }
    }
    // yüz: açık ağızlı adımlarda kıkırdama, şaşkınlık ve göz kırpma
    if (a === 'ayna' || a === 'say' || a === 'macun' || a === 'firca' || a === 'ip' || (a === 'gulus' && !bitti && !(h && h.ad === 'elAynasi' && uc && yuzdeMi(uc)))) {
      basGoster(sasirKalan > 0 ? B.acikSasir : dilAsamasi ? B.dil : kikirKalan > 0 ? B.acikKikir : an % 3400 < 140 ? B.acikKirp : B.acik);
    } else if (a === 'calkala' && sasirKalan > 0 && !puf) basGoster(B.sisik);
  }

  const durum = () => ({
    gidik: Math.round(gidik), bulunan: bulunan.filter(Boolean).length, sayilan: sayilan.size, tat, serit: seritKademesi(macunYolu, Z.macun), temiz: temizSayisi(fircaYolu, Z.dis), dil: dilAsamasi,
    su: Math.round(suMs), calkala: calkala.sayi, ip: ipBiten.filter(Boolean).length, gulus: Math.round(gulusMs), bas: basSimdi, kase: kaseY.simdi(), burun: !burunMacun.classList.contains('ds-yok'),
    hedef: Z,
  });
  return {
    yaklasinca: () => { gidikAlani.hidden = false; gec('gidik'); ziplat(gidikAlani); },
    kare,
    kutlamaYeri: { x: AGIZ.yuz.x, y: AGIZ.yuz.y - 40 },
    siradaki,
    kinoSasirsin: () => sasirKalan > 0,
    bosDokunus: (p: Nokta) => { if (yuzdeMi(p)) { hop(basY.kutu, 8, 200); ses('e-hihi', 0.4, 1.2); } },
    kalkinca: (t: Tutulan) => {
      if (t.ad.startsWith('macun-') && tat >= 0) tupY[tat].goster(DISLER.macun[tat]);
      if (t.ad === 'firca') { fircaYerY.kutu.classList.remove('ds-yok'); }
      if (t.ad === 'ip') { ipY.goster(DISLER.ip); ipV = null; ipAralik = -1; }
      if (t.ad === 'elAynasi') yansima.classList.remove('vk-gorunur');
      return false;
    },
    test: {
      durum,
      gidikYeri: () => I.ekrana({ x: AGIZ.gidik.x, y: AGIZ.gidik.y }), kirinti: (i: number) => I.ekrana(KIRINTILAR[i]), dis: (i: number) => I.ekrana(disYeri(i)),
      killar: () => [I.ekrana({ x: KILLAR.sol, y: KILLAR.y }), I.ekrana({ x: KILLAR.sag, y: KILLAR.y })], firca: () => I.ekrana(HAVLU.firca), burun: () => I.ekrana(AGIZ.burun),
      agiz: () => I.ekrana({ x: AGIZ.merkez.x, y: AGIZ.merkez.y - 260 }), dil: () => I.ekrana({ x: AGIZ.dil.x, y: AGIZ.dil.y + 45 }), yanak: (i: number) => I.ekrana(AGIZ.yanak[i]),
      aralik: (i: number) => I.ekrana({ x: ARALIKLAR[i].x, y: AGIZ.merkez.y }), yuz: () => I.ekrana({ x: AGIZ.yuz.x, y: AGIZ.yuz.y - 120 }),
    },
  };
}
