// 6. sahne · diz yakın planı: tanım ve aletlerin dokunma mantığı (büyüteç, cımbız, ıslak pamuk, yara bandı).
// Görünen her şey çizimdir; kod yalnız yer değiştirir, maskeyle siler, büyütecin camında aynı çizimleri büyütür.
// Yaprak cımbızla çekilirken esnetilmez: çekilen yöne doğru kayar ve döner, sonra çıkıp süzülerek düşer.
import { KAMERA as K1_KAMERA, tuvalKutusu } from '../once-kuzu/yerlesim';
import { K1 } from '../once-kuzu/diziler';
import { BANT_DESENLERI, oyun, yasaGore, type BantDeseni, type Yas } from '../motor/oyun';
import { SAHNE, YAKIN_KUTU, YAKIN_OLCEK, kutuyaKoy, sahneyiBaslat, type Baglam, type Secenek, type SahneTanimi } from '../motor/yurutucu';
import { suz, tutmaBaslat, uzaklik, type Nokta, type Tutma } from '../tutma';
import {
  BANT_CIZIMI, BANT_SOZ_ADIMI, DIZ_ADIMLAR, DIZ_ALET, DIZ_AYAR, DIZ_DIZI, DIZ_DOSYALAR, DIZ_EFEKTLER, DIZ_KAYIT_MS, DIZ_NOKTA, DIZ_ODUNC, DIZ_REPLIKLER,
  K3_DIZ, type DizOlayi,
} from './veri';

type AletAdi = keyof typeof DIZ_ALET;
const BANT_ETIKETI: Record<BantDeseni, string> = { yildiz: 'Yıldızlı bant', kalp: 'Kalpli bant', gokkusagi: 'Gökkuşağı bant', pati: 'Patili bant' };

/** Çizimin saydam olmayan bölgesi (tuvalin oranı) ve verilen noktaya en uzak opak nokta (yaprağın sapı). */
function opakOlc(r: HTMLImageElement, ox: number, oy: number) {
  const G = 256, Y = Math.max(1, Math.round(256 * r.naturalHeight / Math.max(1, r.naturalWidth)));
  const c = document.createElement('canvas'); c.width = G; c.height = Y;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(r, 0, 0, G, Y);
  const v = x.getImageData(0, 0, G, Y).data;
  let s = G, u = Y, sa = -1, al = -1, en = -1, ux = 0.5, uy = 0.5;
  for (let j = 0; j < Y; j++) for (let i = 0; i < G; i++) if (v[(j * G + i) * 4 + 3] > 50) {
    if (i < s) s = i; if (i > sa) sa = i; if (j < u) u = j; if (j > al) al = j;
    const d = (i / G - ox) ** 2 + ((j / Y - oy) * Y / G) ** 2;
    if (d > en) { en = d; ux = i / G; uy = j / Y; }
  }
  if (sa < 0) return null;
  return { x: (s + sa + 1) / 2 / G, y: (u + al + 1) / 2 / Y, uzak: { x: ux, y: uy } };
}

export function dizSahnesi(yas: Yas): SahneTanimi<DizOlayi> {
  const adimlar = yasaGore(DIZ_ADIMLAR, yas);
  const camurVar = adimlar.some(a => a.ad === 's6-sil'), yaprakVar = adimlar.some(a => a.ad === 's6-buyutec');
  return {
    ad: 'diz',
    dosyalar: [...DIZ_DOSYALAR, ...DIZ_ODUNC],
    adimlar,
    diziler: DIZ_DIZI,
    agizlar: { 'diz-yuz': { katman: 'yuz', kareler: K3_DIZ.yuzAgiz }, 'kino-steto': { katman: 'kino', kareler: K1.kinoAgiz } },
    fon: K1.fon,
    katmanlar: [
      { ad: 'masa', kutu: tuvalKutusu('masa'), olcek: 0.4 },
      { ad: 'kuzu', kutu: { sol: 560, ust: 440, g: 200, y: 200 }, olcek: 0.4 },
      { ad: 'kino', kutu: tuvalKutusu('kino'), olcek: 0.4 },
      { ad: 'zipzip', kutu: tuvalKutusu('zipzip'), olcek: 0.4 },
      { ad: 'yuz', kutu: YAKIN_KUTU, olcek: YAKIN_OLCEK, yakin: true },
      { ad: 'bacak', kutu: YAKIN_KUTU, olcek: YAKIN_OLCEK, yakin: true },
      { ad: 'cizik', kutu: YAKIN_KUTU, olcek: YAKIN_OLCEK, yakin: true },
      { ad: 'pati', kutu: YAKIN_KUTU, olcek: YAKIN_OLCEK, yakin: true },
    ],
    kamera: { orta: K1_KAMERA.orta, yakin: { olcek: 2.6, x: 860, y: 600, yakin: true } },
    replikler: DIZ_REPLIKLER.map(r => r.ad),
    efektler: DIZ_EFEKTLER,
    kayitMs: DIZ_KAYIT_MS,
    kur: b => kur(b, yas, camurVar, yaprakVar),
  };
}

function kur(b: Baglam<DizOlayi>, yas: Yas, camurVar: boolean, yaprakVar: boolean) {
  const img = (ad: string, sinif = 'ok-katman') => { const r = document.createElement('img'); r.src = b.adres(ad); r.alt = ''; r.draggable = false; r.className = sinif; return r; };
  const dugme = (sinif: string, etiket: string) => { const d = document.createElement('button'); d.type = 'button'; d.className = sinif; d.setAttribute('aria-label', etiket); return d; };
  /** yakın tuval pikseli → sahne birimi */
  const sb = (x: number, y: number) => ({ x: YAKIN_KUTU.sol + x * YAKIN_OLCEK, y: YAKIN_KUTU.ust + y * YAKIN_OLCEK });
  /** yakın tuval pikseli → ekran pikseli */
  const ekran = (x: number, y: number): Nokta => { const r = b.yakin.getBoundingClientRect(), k = r.width / SAHNE.g, p = sb(x, y); return { x: r.left + p.x * k, y: r.top + p.y * k }; };
  /** yakın tuval pikselinin ekrandaki boyu */
  const px = () => (b.yakin.getBoundingClientRect().width / SAHNE.g) * YAKIN_OLCEK;
  b.katman('pati').style.zIndex = '7';

  // ——— çamur (silme maskesi), yaprak, böcek
  const camur = document.createElement('canvas');
  camur.className = 'ok-katman'; camur.width = 1024; camur.height = 768; camur.style.zIndex = '4';
  kutuyaKoy(camur, YAKIN_KUTU);
  const camurResmi = new Image(); camurResmi.src = b.adres(K3_DIZ.camur);
  let camurIlk = 0;
  const cc = camur.getContext('2d', { willReadFrequently: true })!;
  const camurSay = () => { const v = cc.getImageData(0, 0, camur.width, camur.height).data; let n = 0; for (let j = 0; j < camur.height; j += 4) for (let i = 0; i < camur.width; i += 4) if (v[(j * camur.width + i) * 4 + 3] > 40) n++; return n; };
  let camurKutu: { x: number; y: number; g: number; y2: number } = { x: DIZ_NOKTA.diz.x, y: DIZ_NOKTA.diz.y, g: 460, y2: 300 };
  void camurResmi.decode().catch(() => undefined).then(() => {
    cc.drawImage(camurResmi, 0, 0, camur.width, camur.height);
    camurIlk = camurSay();
    const o = opakOlc(camurResmi, 0.5, 0.7);
    if (o) camurKutu = { ...camurKutu, x: o.x * 2048, y: o.y * 1536 };
  });
  if (camurVar) b.yakin.append(camur);
  const yaprak = img(K3_DIZ.yaprak);
  kutuyaKoy(yaprak, YAKIN_KUTU); yaprak.style.zIndex = '5'; yaprak.hidden = true;
  let yaprakYeri = { x: 1380, y: 1000 }, sap = { x: 1470, y: 950 };
  void yaprak.decode().catch(() => undefined).then(() => {
    const o = opakOlc(yaprak, DIZ_NOKTA.diz.x / 2048, DIZ_NOKTA.diz.y / 1536);
    if (!o) return;
    yaprakYeri = { x: o.x * 2048, y: o.y * 1536 }; sap = { x: o.uzak.x * 2048, y: o.uzak.y * 1536 };
    yaprak.style.transformOrigin = o.x * 100 + '% ' + o.y * 100 + '%';
  });
  if (yaprakVar) b.yakin.append(yaprak);
  const bocek = img('ugur-yuru', 'ok-katman');
  bocek.style.zIndex = '8'; bocek.hidden = true;
  const BOCEK_BOY = 130 * YAKIN_OLCEK;
  Object.assign(bocek.style, { width: BOCEK_BOY + 'px', height: BOCEK_BOY + 'px' });
  b.yakin.append(bocek);
  let bocekBas = -1;

  // ——— alet (tek düğme: sıradaki alet orada bekler)
  const aletDugme = dugme('ok-hedef ok-esya', '');
  const aletResmi = img(K3_DIZ.buyutec, '');
  aletDugme.append(aletResmi);
  aletDugme.style.zIndex = '9'; aletDugme.style.pointerEvents = 'auto'; aletDugme.hidden = true;
  b.yakin.append(aletDugme);
  let alet: AletAdi | null = null;
  let tutma: Tutma | null = null;
  let mercekIc: HTMLElement | null = null, mercekR = 0;
  function aletGoster(ad: AletAdi | null) {
    alet = ad;
    aletDugme.hidden = ad === null;
    if (!ad) return;
    const a = DIZ_ALET[ad], boy = a.boy * YAKIN_OLCEK * 0.62, p = sb(DIZ_NOKTA.alet.x, DIZ_NOKTA.alet.y);
    aletResmi.src = b.adres(a.cizim);
    aletDugme.setAttribute('aria-label', a.etiket);
    kutuyaKoy(aletDugme, { sol: p.x - boy / 2, ust: p.y - boy / 2, g: boy, y: boy });
  }
  function aletiBirak() { const t = tutma; tutma = null; mercekIc = null; if (t) void t.bitir('geri'); }
  function aletiTut(e?: PointerEvent): Tutma | null {
    if (!alet || tutma) return null;
    if (e) { if (e.button !== 0) return null; e.preventDefault(); }
    const a = DIZ_ALET[alet];
    const t = tutmaBaslat(aletDugme, { resimAdresi: b.adres(a.cizim), oran: 1, boyPx: a.boy * px(), tut: a.tut, uc: a.uc }, {
      tasi: uc => { if (alet === 'pamuk') sil(uc); },
      birak: () => { if (tutma === t) { tutma = null; mercekIc = null; } sonSilme = null; return false; },
    }, e);
    tutma = t;
    if (alet === 'buyutec') {
      // camın içi: aynı çizimlerin büyütülmüşü (yaprak yalnız burada görünür)
      const m = document.createElement('div'); m.className = 'dk-mercek';
      const ic = document.createElement('div'); ic.className = 'dk-mercek-ic';
      ic.append(img(K3_DIZ.bacak, ''), img(K3_DIZ.cizik, ''), img(K3_DIZ.camur, ''), img(K3_DIZ.yaprak, ''));
      m.append(ic);
      mercekR = a.cam * t.g;
      Object.assign(m.style, { left: a.uc[0] * t.g - mercekR + 'px', top: a.uc[1] * t.y - mercekR + 'px', width: 2 * mercekR + 'px', height: 2 * mercekR + 'px' });
      t.el.firstElementChild!.append(m);
      mercekIc = ic;
    }
    return t;
  }
  aletDugme.addEventListener('pointerdown', e => { aletiTut(e); });
  aletDugme.addEventListener('click', e => { if (e.detail === 0) void kendiliginden(); });

  // ——— ıslak pamuk: parmağın geçtiği yerden siler
  let sonSilme: Nokta | null = null, sonSes = 0, sonSayim = 0, camurKalan = 1;
  function sil(uc: Nokta) {
    const ad = b.akis.adim?.ad;
    if (ad !== 's6-pamuk' && ad !== 's6-serin' && ad !== 's6-sil') return;
    const R = camur.getBoundingClientRect(), k = camur.width / R.width;
    const p = { x: (uc.x - R.left) * k, y: (uc.y - R.top) * k };
    const camurda = uzaklik(uc, ekran(camurKutu.x, camurKutu.y)) < Math.max(camurKutu.g, camurKutu.y2) * 0.7 * px();
    if (ad === 's6-pamuk') { if (camurda) b.olay('pamuk-degdi'); else return; }
    const yaricap = (yas === '4' ? 150 : DIZ_AYAR.silmeYaricapi) * px() * k;
    cc.globalCompositeOperation = 'destination-out';
    const bas = sonSilme ?? p, L = uzaklik(bas, p), n = Math.max(1, Math.ceil(L / (yaricap / 3)));
    for (let i = 1; i <= n; i++) {
      const x = bas.x + (p.x - bas.x) * i / n, y = bas.y + (p.y - bas.y) * i / n;
      const g = cc.createRadialGradient(x, y, yaricap * 0.55, x, y, yaricap);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = g; cc.beginPath(); cc.arc(x, y, yaricap, 0, Math.PI * 2); cc.fill();
    }
    sonSilme = p;
    const an = b.saat();
    if (L > 2 && an - sonSes > 210) { sonSes = an; b.efekt('e6-surt', 0.7, 0.9 + Math.random() * 0.2); }
    if (an - sonSayim > 110) { sonSayim = an; camurKalan = camurSay() / Math.max(1, camurIlk); b.kok.dataset.camur = String(Math.round(camurKalan * 100)); }
  }

  // ——— yara bandı: seçenekler, dize koyma, sürterek düzleştirme
  const secim = document.createElement('div');
  secim.className = 'ok-katman'; secim.style.zIndex = '9'; secim.hidden = true;
  b.yakin.append(secim);
  let bantEl: HTMLButtonElement | null = null, bantYolu = 0, bantSon: Nokta | null = null, bantAsama = 0;
  const bantEni = () => DIZ_NOKTA.bantEni * YAKIN_OLCEK;
  for (const [i, desen] of BANT_DESENLERI.entries()) {
    const d = dugme('ok-hedef ok-esya', BANT_ETIKETI[desen]);
    d.dataset.bant = desen; d.style.borderRadius = '0'; d.style.pointerEvents = 'auto';
    d.append(img(BANT_CIZIMI[desen], ''));
    const p = sb(DIZ_NOKTA.bantSecim.x, DIZ_NOKTA.bantSecim.y + (i - 1.5) * DIZ_NOKTA.bantSecim.aralik), g = bantEni() * 0.62;
    kutuyaKoy(d, { sol: p.x - g / 2, ust: p.y - g * 0.2, g, y: g * 0.4 });
    secim.append(d);
    const koy = () => {
      oyun.bant = desen;
      secim.hidden = true;
      const be = dugme('dz-bant', 'Bandı düzelt');
      const m = sb(DIZ_NOKTA.diz.x, DIZ_NOKTA.diz.y), w = bantEni();
      Object.assign(be.style, { left: m.x - w / 2 + 'px', top: m.y - w * 0.2 + 'px', width: w + 'px', height: w * 0.4 + 'px', zIndex: '6' });
      be.style.setProperty('--kabar', '1');
      be.append(img(BANT_CIZIMI[desen], ''));
      b.yakin.append(be);
      bantEl = be; bantYolu = 0; bantAsama = 0;
      b.efekt('e6-pit', 0.6, 0.8);
      b.olay('bant-kondu');
      let id: number | null = null;
      const duzlesti = () => { be.style.setProperty('--kabar', '0'); be.disabled = true; b.olay('bant-duzlesti', BANT_SOZ_ADIMI[desen]); };
      const surt = (q: Nokta) => {
        if (b.akis.adim?.ad !== 's6-bant-sur') return;
        if (bantSon) bantYolu += uzaklik(bantSon, q) / px();
        bantSon = q;
        const kalan = Math.max(0, 1 - bantYolu / DIZ_AYAR.surtmeYolu[yas]);
        be.style.setProperty('--kabar', kalan.toFixed(3));
        if (b.saat() - sonSes > 190) { sonSes = b.saat(); b.efekt('e6-surt', 0.55, 1.1); }
        const asama = Math.floor((1 - kalan) * 3);
        if (asama > bantAsama && kalan > 0) { bantAsama = asama; b.efekt('e6-pit', 0.5, 1.2 + asama * 0.1); }
        if (kalan <= 0) duzlesti();
      };
      be.addEventListener('pointerdown', e => { if (id !== null) return; id = e.pointerId; be.setPointerCapture(id); bantSon = { x: e.clientX, y: e.clientY }; e.preventDefault(); });
      be.addEventListener('pointermove', e => { if (e.pointerId === id) surt({ x: e.clientX, y: e.clientY }); });
      const kalk = (e: PointerEvent) => { if (e.pointerId === id) { id = null; bantSon = null; } };
      be.addEventListener('pointerup', kalk); be.addEventListener('pointercancel', kalk);
      be.addEventListener('click', e => { if (e.detail === 0 && b.akis.adim?.ad === 's6-bant-sur') duzlesti(); });
    };
    const al = (e?: PointerEvent) => {
      if (b.akis.adim?.ad !== 's6-bant-sec' || tutma) return;
      if (e) { if (e.button !== 0) return; e.preventDefault(); }
      const t = tutmaBaslat(d, { resimAdresi: b.adres(BANT_CIZIMI[desen]), oran: 2.5, boyPx: DIZ_NOKTA.bantEni * px(), tut: [0.5, 0.5], uc: [0.5, 0.5] }, {
        birak: uc => {
          tutma = null;
          if (uzaklik(uc, ekran(DIZ_NOKTA.diz.x, DIZ_NOKTA.diz.y)) > 330 * px()) return false;
          void t.bitir('yerinde'); koy(); return true;
        },
      }, e);
      tutma = t;
      if (!e) { tutma = null; void t.bitir('yerinde'); koy(); }
    };
    d.addEventListener('pointerdown', e => al(e));
    d.addEventListener('click', e => { if (e.detail === 0) al(); });
  }

  // ——— klavye: alet işini kendiliğinden yapar
  async function kendiliginden() {
    const t = aletiTut();
    if (!t) return;
    if (alet === 'buyutec') await suz(t, ekran(yaprakYeri.x, yaprakYeri.y), 800);
    else if (alet === 'cimbiz') { await suz(t, ekran(sap.x, sap.y), 700); const s = ekran(sap.x, sap.y); await suz(t, { x: s.x + 420 * px(), y: s.y - 160 * px() }, 900); }
    else if (alet === 'pamuk') {
      const g = camurKutu.g * 0.6, y2 = camurKutu.y2 * 0.6;
      for (let i = 0; i <= 8 && tutma === t; i++) {
        const y = camurKutu.y - y2 + 2 * y2 * i / 8;
        await suz(t, ekran(camurKutu.x + (i % 2 ? g : -g), y), 300, sil);
        if (b.akis.adim?.ad === 's6-gidik') break;
      }
    }
  }

  // ——— her kare: büyüteç, cımbız, böcek, çamurun bitişi, ipucu
  let yakinBas = 0, tutNoktasi: Nokta | null = null, sonIpucu = 0;
  function kare() {
    const ad = b.akis.adim?.ad;
    const uc = tutma && !tutma.birakti ? tutma.uc() : null;
    if (mercekIc && uc) {
      const R = b.yakin.getBoundingClientRect(), k = R.width / SAHNE.g, M = DIZ_AYAR.buyutme;
      const sol = R.left + YAKIN_KUTU.sol * k, ust = R.top + YAKIN_KUTU.ust * k, g = YAKIN_KUTU.g * k, y = YAKIN_KUTU.y * k;
      Object.assign(mercekIc.style, { width: g * M + 'px', height: y * M + 'px', left: mercekR - (uc.x - sol) * M + 'px', top: mercekR - (uc.y - ust) * M + 'px' });
      if (ad === 's6-buyutec') {
        if (uzaklik(uc, ekran(yaprakYeri.x, yaprakYeri.y)) < mercekR * 0.6) {
          if (!yakinBas) yakinBas = performance.now();
          else if (performance.now() - yakinBas > DIZ_AYAR.bulmaMs) b.olay('yaprak-bulundu');
        } else yakinBas = 0;
      }
    }
    if (alet === 'cimbiz' && (ad === 's6-cimbiz' || ad === 's6-cek')) {
      if (!uc) { if (tutNoktasi) { tutNoktasi = null; yaprak.style.transform = ''; } }
      else if (!tutNoktasi) {
        if (uzaklik(uc, ekran(sap.x, sap.y)) < Math.max(44, 160 * px())) { tutNoktasi = { ...uc }; b.efekt('e6-pit', 0.35, 1.4); if (ad === 's6-cimbiz') b.olay('yaprak-tutuldu'); }
      } else {
        const v = { x: uc.x - tutNoktasi.x, y: uc.y - tutNoktasi.y }, L = Math.hypot(v.x, v.y), esik = DIZ_AYAR.cekmeEsigi * px();
        const k = b.yakin.getBoundingClientRect().width / SAHNE.g;
        // yaprak direnir: çekilen yolun üçte biri kadar kayar, çekilen yöne doğru hafifçe döner (esnetme yok)
        yaprak.style.transform = 'translate(' + v.x * 0.3 / k + 'px,' + v.y * 0.3 / k + 'px) rotate(' + Math.max(-14, Math.min(14, v.x / Math.max(1, esik) * 10)) + 'deg)';
        if (L > esik && ad === 's6-cek') { tutNoktasi = null; b.olay('yaprak-cikti'); }
      }
    }
    if (ad === 's6-sil' && camurVar && camurKalan <= DIZ_AYAR.silmeOrani) b.olay('camur-silindi');
    if (bocekBas >= 0) {
      const t = (b.saat() - bocekBas) / 1700;
      if (t >= 1) { bocek.hidden = true; bocekBas = -1; }
      else {
        const e = t * t * (3 - 2 * t), a0 = sb(yaprakYeri.x, yaprakYeri.y), a1 = sb(DIZ_NOKTA.pencere.x, DIZ_NOKTA.pencere.y);
        const x = a0.x + (a1.x - a0.x) * e, y = a0.y + (a1.y - a0.y) * e - Math.sin(Math.PI * t) * 60;
        const kanat = t < 0.12 ? 'ugur-yuru' : Math.floor(b.saat() / 90) % 2 ? 'ugur-ucus-1' : 'ugur-ucus-0';
        if (bocek.dataset.poz !== kanat) { bocek.dataset.poz = kanat; bocek.src = b.adres(kanat); }
        Object.assign(bocek.style, { left: x - BOCEK_BOY / 2 + 'px', top: y - BOCEK_BOY / 2 + 'px' });
      }
    }
    // çocuk beklerse Zıpzıp bir kez bize bakar (çizilmiş poz; ok ve yazı yok)
    if (b.akis.adim?.bitis.tur === 'cocuk' && !tutma && b.bostaMs() > 6000 && b.saat() - sonIpucu > 6000) { sonIpucu = b.saat(); b.gecici('yuz', K3_DIZ.yuzAgiz[5], 700); }
  }

  return {
    adim(a: { ad: string }) {
      const ad = a.ad;
      if (ad === 's6-buyutec') aletGoster('buyutec');
      else if (ad === 's6-yaprak') { yaprak.hidden = false; aletiBirak(); aletGoster(null); }
      else if (ad === 's6-bocek') { bocekBas = b.saat(); bocek.hidden = false; }
      else if (ad === 's6-cimbiz') aletGoster('cimbiz');
      else if (ad === 's6-oh') {
        aletiBirak(); aletGoster(null);
        yaprak.style.transform = '';
        void yaprak.animate([{ transform: 'translate(40px,-20px) rotate(8deg)', opacity: 1 }, { transform: 'translate(90px,120px) rotate(30deg)', opacity: 1, offset: 0.35 },
          { transform: 'translate(40px,300px) rotate(-22deg)', opacity: 1, offset: 0.7 }, { transform: 'translate(80px,520px) rotate(18deg)', opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' })
          .finished.then(() => { yaprak.hidden = true; }).catch(() => undefined);
      } else if (ad === 's6-pamuk') aletGoster('pamuk');
      else if (ad === 's6-gidik') { aletiBirak(); aletGoster(null); camur.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' }); }
      else if (ad === 's6-bant-sec') secim.hidden = false;
      else if (ad === 's6-gurur' && bantEl) bantEl.classList.add('dz-yapisti');
    },
    kare,
  };
}

export const baslat = (kok: HTMLElement, yas: Yas, secenek?: Secenek) => sahneyiBaslat(kok, dizSahnesi(yas), secenek);
