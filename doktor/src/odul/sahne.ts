// 7. sahne · ödül köşesi: tanım ve dokunmalar (yıldız seçip yapıştırmak, Kuzu'ya yıldız, karneye damga).
import { KAMERA as K1_KAMERA, tuvalKutusu } from '../once-kuzu/yerlesim';
import { K1 } from '../once-kuzu/diziler';
import { bindirmeKur } from '../motor/bindirme';
import { YILDIZ_RENKLERI, bindirme, oyun, yasaGore, type Yas, type YildizRengi } from '../motor/oyun';
import { kutuyaKoy, sahneyiBaslat, type Baglam, type Secenek, type SahneTanimi } from '../motor/yurutucu';
import { suz, tutmaBaslat, uzaklik, type Nokta, type Tutma } from '../tutma';
import { K3_ODUL, ODUL_ADIMLAR, ODUL_DIZI, ODUL_DOSYALAR, ODUL_EFEKTLER, ODUL_KAYIT_MS, ODUL_ODUNC, ODUL_REPLIKLER, ODUL_YERLESIM, type OdulOlayi } from './veri';

const OLCEK = 0.4;
const YILDIZ_ETIKETI: Record<YildizRengi, string> = { sari: 'Sarı yıldız', nane: 'Yeşil yıldız', mavi: 'Mavi yıldız' };

export function odulSahnesi(yas: Yas): SahneTanimi<OdulOlayi> {
  return {
    ad: 'odul',
    dosyalar: [...ODUL_DOSYALAR, ...ODUL_ODUNC],
    adimlar: yasaGore(ODUL_ADIMLAR, yas),
    diziler: ODUL_DIZI,
    agizlar: { 'zipzip-ayakta': { katman: 'zipzip', kareler: K3_ODUL.ayaktaAgiz }, 'kino-steto': { katman: 'kino', kareler: K1.kinoAgiz } },
    fon: K1.fon,
    katmanlar: [
      { ad: 'pano', kutu: { ...ODUL_YERLESIM.pano }, olcek: OLCEK },
      { ad: 'masa', kutu: tuvalKutusu('masa'), olcek: OLCEK },
      { ad: 'kuzu', kutu: { ...ODUL_YERLESIM.kuzu }, olcek: OLCEK },
      { ad: 'kino', kutu: tuvalKutusu('kino'), olcek: OLCEK },
      { ad: 'zipzip', kutu: tuvalKutusu('zipzip'), olcek: OLCEK },
    ],
    kamera: { orta: K1_KAMERA.orta, karne: { ...K1_KAMERA.orta, yakin: true } },
    replikler: ODUL_REPLIKLER.map(r => r.ad),
    efektler: ODUL_EFEKTLER,
    kayitMs: ODUL_KAYIT_MS,
    kur: b => kur(b),
  };
}

function kur(b: Baglam<OdulOlayi>) {
  const img = (ad: string, sinif = '') => { const r = document.createElement('img'); r.src = b.adres(ad); r.alt = ''; r.draggable = false; r.className = sinif; return r; };
  const dugme = (sinif: string, etiket: string) => { const d = document.createElement('button'); d.type = 'button'; d.className = sinif; d.setAttribute('aria-label', etiket); return d; };
  const zk = tuvalKutusu('zipzip'), Y = ODUL_YERLESIM;
  const zipzipEl = b.katman('zipzip'), kuzuEl = b.katman('kuzu');
  const bindir = bindirmeKur(b as unknown as Baglam<string>, 'zipzip', zk, OLCEK);
  let tutma: Tutma | null = null;

  // Kuzu'nun yıldızı: Kuzu'nun göğsüne konan küçük çizim
  const kuzuYildizi = img(K3_ODUL.yildizlar[0], 'ok-bindirme');
  kuzuYildizi.hidden = true; kuzuYildizi.style.width = Y.kuzuYildizBoyu + 'px';
  kuzuYildizi.style.left = Y.kuzu.sol + Y.kuzuGogus[0] * Y.kuzu.g + 'px';
  kuzuYildizi.style.top = Y.kuzu.ust + Y.kuzuGogus[1] * Y.kuzu.y + 'px';
  kuzuEl.after(kuzuYildizi);

  // ——— yıldız seçenekleri (üst katmanda, alt ortada)
  const kalan = new Set<YildizRengi>(YILDIZ_RENKLERI);
  const yildizDugmeleri = {} as Record<YildizRengi, HTMLButtonElement>;
  const merkez = (el: Element, ox = 0.5, oy = 0.5): Nokta => { const r = el.getBoundingClientRect(); return { x: r.left + ox * r.width, y: r.top + oy * r.height }; };
  const gogus = (): Nokta => { const n = bindirme(b.durum('zipzip').poz).yildiz; return merkez(zipzipEl, n[0] / 1300, n[1] / 1500); };
  const kuzuGogsu = (): Nokta => merkez(kuzuEl, Y.kuzuGogus[0], Y.kuzuGogus[1]);
  const kameraOlcegi = () => zipzipEl.getBoundingClientRect().width / zk.g; // ekran pikseli / sahne birimi (kamera dahil)
  YILDIZ_RENKLERI.forEach((renk, i) => {
    const d = dugme('ok-hedef ok-esya', YILDIZ_ETIKETI[renk]);
    d.dataset.yildiz = renk; d.hidden = true;
    d.append(img('yildiz-' + renk));
    const s = Y.yildizSecim;
    kutuyaKoy(d, { sol: s.x + (i - 1) * s.aralik - s.boy / 2, ust: s.y - s.boy / 2, g: s.boy, y: s.boy });
    b.ust.append(d);
    yildizDugmeleri[renk] = d;
    const yapistir = () => {
      const ad = b.akis.adim?.ad;
      kalan.delete(renk); d.hidden = true;
      if (ad === 's7-yildiz') { oyun.yildiz = renk; b.olay('yildiz-yapisti'); }
      else { oyun.kuzuYildizi = renk; kuzuYildizi.src = b.adres('yildiz-' + renk); kuzuYildizi.hidden = false; b.olay('kuzu-yildiz'); }
    };
    const al = (e?: PointerEvent) => {
      const ad = b.akis.adim?.ad;
      if ((ad !== 's7-yildiz' && ad !== 's7-kuzu-yildiz') || tutma) return;
      if (e) { if (e.button !== 0) return; e.preventDefault(); }
      const hedef = ad === 's7-yildiz' ? gogus : kuzuGogsu;
      const t = tutmaBaslat(d, { resimAdresi: b.adres('yildiz-' + renk), oran: 1, boyPx: Math.max(64, 150 * OLCEK * kameraOlcegi()), tut: [0.5, 0.5], uc: [0.5, 0.5] }, {
        birak: uc => { tutma = null; if (uzaklik(uc, hedef()) > 150 * OLCEK * kameraOlcegi() * 1.6) return false; void t.bitir('yerinde'); yapistir(); return true; },
      }, e);
      tutma = t;
      if (!e) void suz(t, hedef(), 600).then(() => { tutma = null; void t.bitir('yerinde'); yapistir(); });
    };
    d.addEventListener('pointerdown', e => al(e));
    d.addEventListener('click', e => { if (e.detail === 0) al(); });
  });

  // ——— karne ve damga (yakın katmanda; oda arkada bulanır)
  const karne = img(K3_ODUL.karne, 'ok-katman');
  kutuyaKoy(karne, Y.karne); karne.hidden = true;
  const iz = img(K3_ODUL.damgaIzi, 'ok-bindirme');
  iz.hidden = true; iz.style.width = Y.izCapi * Y.karne.g + 'px';
  iz.style.left = Y.karne.sol + Y.damgaYeri[0] * Y.karne.g + 'px'; iz.style.top = Y.karne.ust + Y.damgaYeri[1] * Y.karne.y + 'px';
  const damga = dugme('ok-hedef ok-esya', 'Damga');
  damga.style.borderRadius = '0'; damga.style.pointerEvents = 'auto'; damga.hidden = true;
  damga.append(img(K3_ODUL.damga));
  kutuyaKoy(damga, { sol: Y.damga.x - Y.damga.boy * 0.4, ust: Y.damga.y - Y.damga.boy / 2, g: Y.damga.boy * 0.8, y: Y.damga.boy });
  b.yakin.append(karne, iz, damga);
  const damgaYeri = (): Nokta => merkez(karne, Y.damgaYeri[0], Y.damgaYeri[1]);
  const bas = () => { damga.hidden = true; iz.hidden = false; b.olay('damga-basildi'); };
  const damgaAl = (e?: PointerEvent) => {
    if (b.akis.adim?.ad !== 's7-karne' || tutma) return;
    if (e) { if (e.button !== 0) return; e.preventDefault(); }
    const k = karne.getBoundingClientRect().width / Y.karne.g;
    const t = tutmaBaslat(damga, { resimAdresi: b.adres(K3_ODUL.damga), oran: 0.8, boyPx: Y.damga.boy * k, tut: Y.damga.tut, uc: Y.damga.uc }, {
      birak: uc => { tutma = null; if (uzaklik(uc, damgaYeri()) > Y.izCapi * Y.karne.g * k) return false; void t.bitir('yerinde'); bas(); return true; },
    }, e);
    tutma = t;
    if (!e) void suz(t, damgaYeri(), 700).then(() => { tutma = null; void t.bitir('yerinde'); bas(); });
  };
  damga.addEventListener('pointerdown', e => damgaAl(e));
  damga.addEventListener('click', e => { if (e.detail === 0) damgaAl(); });

  let sonIpucu = 0;
  return {
    adim(a: { ad: string }) {
      const ad = a.ad;
      // iniş taburenin önünde biter; sonraki pozlar tuvalin ortasında çizildiği için katman o kadar sola alınır
      zipzipEl.style.left = zk.sol + (ad === 's7-in' ? 0 : Y.inisKaymasi) + 'px';
      const secim = ad === 's7-yildiz' || ad === 's7-kuzu-yildiz';
      for (const renk of YILDIZ_RENKLERI) yildizDugmeleri[renk].hidden = !secim || !kalan.has(renk);
      karne.hidden = ad !== 's7-karne' && ad !== 's7-iz';
      iz.hidden = ad !== 's7-iz';
      damga.hidden = ad !== 's7-karne';
    },
    kare() {
      bindir();
      const a = b.akis.adim;
      // çocuk beklerse Zıpzıp göğsüne bakar (çizilmiş poz; ok ve yazı yok)
      if (a && a.bitis.tur === 'cocuk' && !tutma && b.bostaMs() > 6000 && b.saat() - sonIpucu > 6000) { sonIpucu = b.saat(); if (a.ad === 's7-yildiz') b.gecici('zipzip', K3_ODUL.gurur[0], 700); }
    },
  };
}

export const baslat = (kok: HTMLElement, yas: Yas, secenek?: Secenek) => sahneyiBaslat(kok, odulSahnesi(yas), secenek);
