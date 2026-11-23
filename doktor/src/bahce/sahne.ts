// 1. sahne (bahçede düşüş) ve 8. sahne (bahçede kapanış): tanımlar ve sahneye özel hareketler (seken top, uğur böceği).
// Top ve böcek çizimdir; kod yalnız yerlerini değiştirir ve pozlarını sırayla gösterir.
import { bindirmeKur } from '../motor/bindirme';
import { bindirme } from '../motor/oyun';
import { YAKIN_KUTU, YAKIN_OLCEK, kutuyaKoy, sahneyiBaslat, type Baglam, type Kutu, type Secenek, type SahneTanimi } from '../motor/yurutucu';
import {
  BAHCE, BAHCE_KAMERA, BAHCE_OLCEK, BOCEK_KONMA_MS, DUSUS_ADIMLAR, DUSUS_DIZI, DUSUS_DOSYALAR, DUSUS_EFEKTLER, DUSUS_KAYIT_MS, DUSUS_REPLIKLER,
  K3_DUSUS, K3_KAPANIS, KAPANIS_ADIMLAR, KAPANIS_DIZI, KAPANIS_DOSYALAR, KAPANIS_EFEKTLER, KAPANIS_KAYIT_MS, KAPANIS_ODUNC, KAPANIS_REPLIKLER, TOP_SURESI,
  type DususOlayi, type KapanisOlayi,
} from './veri';

const o = BAHCE_OLCEK;
/** Zıpzıp'ın katmanı (tuval 1300 × 1500, yer y = 1440), gövde ekseni verilen x'te. */
const zipzipKutusu = (x: number): Kutu => ({ sol: x - 650 * o, ust: BAHCE.yer - 1440 * o, g: 1300 * o, y: 1500 * o });
/** Çalı (tuval 1400 × 800, yer y = 760). */
const CALI_KUTUSU: Kutu = { sol: BAHCE.caliX - 700 * o, ust: BAHCE.yer - 760 * o, g: 1400 * o, y: 800 * o };
const TOP_KUTUSU: Kutu = { sol: BAHCE.oyuk.x - BAHCE.topBoyu / 2, ust: BAHCE.oyuk.y - BAHCE.topBoyu / 2, g: BAHCE.topBoyu, y: BAHCE.topBoyu };
const yeniResim = (b: Baglam<never>, ad: string, sinif: string) => { const r = document.createElement('img'); r.src = b.adres(ad); r.alt = ''; r.draggable = false; r.className = sinif; return r; };

// ——— 1. sahne · düşüş
export const DUSUS_SAHNESI: SahneTanimi<DususOlayi> = {
  ad: 'bahce',
  dosyalar: DUSUS_DOSYALAR,
  adimlar: DUSUS_ADIMLAR,
  diziler: DUSUS_DIZI,
  agizlar: { 'zipzip-dize': { katman: 'yuz', kareler: K3_DUSUS.dizeAgiz } },
  fon: K3_DUSUS.fon,
  katmanlar: [
    { ad: 'cali', kutu: CALI_KUTUSU, olcek: o },
    { ad: 'zipzip', kutu: zipzipKutusu(BAHCE.sagX), olcek: o },
    { ad: 'yuz', kutu: YAKIN_KUTU, olcek: YAKIN_OLCEK, yakin: true },
  ],
  kamera: BAHCE_KAMERA,
  replikler: DUSUS_REPLIKLER.map(r => r.ad),
  efektler: DUSUS_EFEKTLER,
  kayitMs: DUSUS_KAYIT_MS,
  kur(b) {
    const zipzip = b.katman('zipzip');
    // top: sağdan sekerek gelir, çalının oyuğuna sıkışır ve orada kalır
    const top = yeniResim(b, K3_DUSUS.top[2], 'ok-katman');
    kutuyaKoy(top, TOP_KUTUSU);
    b.katman('cali').after(top);
    const bocek = yeniResim(b, K3_DUSUS.ugurUcus[0], 'ok-katman');
    const boy = 150 * YAKIN_OLCEK;
    Object.assign(bocek.style, { width: boy + 'px', height: boy + 'px' });
    bocek.hidden = true;
    b.yakin.append(bocek);
    let topPozu = '', bocekBas = -1, sonSekme = -1;
    return {
      adim(a) {
        // koşu çalının sağında biter; düşüş çalının solunda
        zipzip.style.left = zipzipKutusu(a.ad === 's1-top' || a.ad === 's1-kosu' ? BAHCE.sagX : BAHCE.solX).sol + 'px';
        if (a.ad === 's1-umut') { bocekBas = b.saat(); bocek.hidden = false; }
      },
      kare() {
        const t = Math.min(1, b.saat() / TOP_SURESI);
        const SEKME = 3, faz = (t * SEKME) % 1, yukseklik = t >= 1 ? 0 : Math.abs(Math.sin(Math.PI * faz)) * 170 * (1 - t * 0.6);
        const x = 1500 + (BAHCE.oyuk.x - 1500) * t;
        const yerde = BAHCE.yer - BAHCE.topBoyu / 2, y = t >= 1 ? BAHCE.oyuk.y : yerde - yukseklik + (BAHCE.oyuk.y - yerde) * Math.max(0, (t - 0.85) / 0.15);
        const poz = t >= 1 ? K3_DUSUS.top[0] : yukseklik < 14 ? K3_DUSUS.top[1] : K3_DUSUS.top[2];
        if (poz !== topPozu) { topPozu = poz; top.src = b.adres(poz); }
        top.style.transform = 'translate(' + (x - BAHCE.oyuk.x) + 'px,' + (y - BAHCE.oyuk.y) + 'px)';
        const sekme = Math.floor(t * SEKME);
        if (t < 1 && t > 0.02 && sekme !== sonSekme) { sonSekme = sekme; if (sekme > 0) b.efekt('e2-pat', 0.5, 1.3); }
        if (bocekBas >= 0) {
          // uğur böceği sağ üstten dize doğru uçar; konduğunu görmeyiz
          const u = (b.saat() - bocekBas) / 1500;
          if (u >= 1) { bocek.hidden = true; bocekBas = -1; return; }
          const e = u * u * (3 - 2 * u), bx = YAKIN_KUTU.sol + (1900 - 900 * e) * YAKIN_OLCEK, by = (150 + 1250 * e) * YAKIN_OLCEK - Math.sin(Math.PI * u) * 50;
          const kanat = K3_DUSUS.ugurUcus[Math.floor(b.saat() / 90) % 2];
          if (bocek.dataset.poz !== kanat) { bocek.dataset.poz = kanat; bocek.src = b.adres(kanat); }
          Object.assign(bocek.style, { left: bx - boy / 2 + 'px', top: by - boy / 2 + 'px' });
        }
      },
    };
  },
};

// ——— 8. sahne · kapanış
export const KAPANIS_SAHNESI: SahneTanimi<KapanisOlayi> = {
  ad: 'kapanis',
  dosyalar: [...KAPANIS_DOSYALAR, ...KAPANIS_ODUNC],
  adimlar: KAPANIS_ADIMLAR,
  diziler: KAPANIS_DIZI,
  agizlar: { 'zipzip-goster': { katman: 'zipzip', kareler: K3_KAPANIS.gosterAgiz }, 'kino-salla': { katman: 'kino', kareler: K3_KAPANIS.sallaAgiz } },
  fon: K3_DUSUS.fon,
  katmanlar: [
    { ad: 'kino', kutu: { sol: BAHCE.kapi.x - 650 * BAHCE.kapi.olcek, ust: BAHCE.kapi.yer - 1540 * BAHCE.kapi.olcek, g: 1300 * BAHCE.kapi.olcek, y: 1600 * BAHCE.kapi.olcek }, olcek: BAHCE.kapi.olcek },
    { ad: 'cali', kutu: CALI_KUTUSU, olcek: o },
    { ad: 'top', kutu: TOP_KUTUSU, olcek: o },
    { ad: 'zipzip', kutu: zipzipKutusu(BAHCE.solX), olcek: o },
  ],
  kamera: BAHCE_KAMERA,
  replikler: KAPANIS_REPLIKLER.map(r => r.ad),
  efektler: KAPANIS_EFEKTLER,
  kayitMs: KAPANIS_KAYIT_MS,
  kur(b) {
    const zipzip = b.katman('zipzip');
    const bindir = bindirmeKur(b as unknown as Baglam<string>, 'zipzip', zipzipKutusu(BAHCE.solX), o);
    const bocek = yeniResim(b, K3_DUSUS.ugurUcus[0], 'ok-bindirme');
    const boy = 56;
    bocek.style.width = boy + 'px'; bocek.hidden = true;
    zipzip.after(bocek);
    let bocekBas = -1, kondu = false;
    return {
      adim(a) {
        // yürüyüş çalının solunda biter; atlayıştan sonra her şey çalının sağında
        zipzip.style.left = zipzipKutusu(a.ad === 's8-yuru' || a.ad === 's8-dur' ? BAHCE.solX : BAHCE.sagX).sol + 'px';
        if (a.ad === 's8-bocek') { bocekBas = b.saat(); bocek.hidden = false; }
      },
      kare() {
        bindir();
        if (bocekBas < 0) return;
        // uğur böceği gelip bandın üstüne konar ve orada kalır
        const { poz, kayma } = b.durum('zipzip');
        const n = bindirme(poz).bant;
        const hx = (parseFloat(zipzip.style.left) || 0) + kayma + n[0] * o, hy = BAHCE.yer - 1440 * o + n[1] * o;
        const u = Math.min(1, (b.saat() - bocekBas) / BOCEK_KONMA_MS);
        const e = u * u * (3 - 2 * u), x = hx + (1 - e) * 520, y = hy - (1 - e) * 360 - Math.sin(Math.PI * u) * 40;
        const ad = u >= 1 ? K3_DUSUS.ugurDur : K3_DUSUS.ugurUcus[Math.floor(b.saat() / 90) % 2];
        if (bocek.dataset.poz !== ad) { bocek.dataset.poz = ad; bocek.src = b.adres(ad); }
        if (u >= 1 && !kondu) { kondu = true; b.efekt('e2-pat', 0.25, 1.8); }
        Object.assign(bocek.style, { left: x + 'px', top: y + 'px' });
      },
    };
  },
};

export const baslatDusus = (kok: HTMLElement, secenek?: Secenek) => sahneyiBaslat(kok, DUSUS_SAHNESI, secenek);
export const baslatKapanis = (kok: HTMLElement, secenek?: Secenek) => sahneyiBaslat(kok, KAPANIS_SAHNESI, secenek);
